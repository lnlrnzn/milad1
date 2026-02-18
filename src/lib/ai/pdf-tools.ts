import { tool } from "ai"
import { z } from "zod/v4"
import { createClient } from "@/lib/supabase/server"
import { extractPdfText } from "@/lib/pdf/extract"
import { fetchPdfFromStorage, savePdfToStorage } from "@/lib/pdf/storage"
import { generatePdfBuffer } from "@/lib/pdf/generate"

export type PdfToolScope = "user" | "admin"

async function verifyAuth(scope: PdfToolScope) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null as never, error: "Nicht authentifiziert" as const }

  if (scope === "admin") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    if (profile?.role !== "admin") {
      return { supabase, user: null as never, error: "Keine Berechtigung" as const }
    }
  }

  return { supabase, user, error: null }
}

export function createPdfTools(scope: PdfToolScope) {
  const needsApproval = scope === "admin"

  // ── read_document ──────────────────────────────────────────────────

  const read_document = tool({
    description:
      "Lädt ein Dokument aus dem Speicher und extrahiert den Textinhalt. " +
      "Verwende dieses Tool, wenn der Nutzer Fragen zu einem bestimmten Dokument stellt " +
      "oder du den Inhalt einer PDF analysieren sollst.",
    inputSchema: z.object({
      documentId: z
        .string()
        .describe("UUID des Dokuments aus der documents-Tabelle"),
    }),
    execute: async ({ documentId }) => {
      const { supabase, user, error: authError } = await verifyAuth(scope)
      if (authError) return { error: authError }

      try {
        // Build query — user scope filters by user_id, admin sees all
        let query = supabase
          .from("documents")
          .select("id, name, file_path, mime_type, user_id")
          .eq("id", documentId)

        if (scope === "user") {
          query = query.eq("user_id", user.id)
        }

        const { data: doc, error: docError } = await query.single()

        if (docError || !doc) {
          return { error: "Dokument nicht gefunden oder kein Zugriff." }
        }

        const arrayBuffer = await fetchPdfFromStorage(doc.file_path)
        const { text, pageCount, truncated } = await extractPdfText(arrayBuffer)

        return {
          documentId: doc.id,
          name: doc.name,
          mimeType: doc.mime_type,
          textContent: text,
          pageCount,
          truncated,
          characterCount: text.length,
        }
      } catch (err) {
        return {
          error: `Dokument konnte nicht gelesen werden: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
        }
      }
    },
  })

  // ── save_document ──────────────────────────────────────────────────

  const saveBaseSchema = z.object({
    filename: z
      .string()
      .describe("Dateiname inkl. Erweiterung (z.B. 'Bericht_2024.pdf')"),
    fileDataUrl: z
      .string()
      .describe("Data-URL der Datei (z.B. data:application/pdf;base64,...)"),
    propertyId: z.string().optional().describe("Optionale Immobilien-Zuordnung"),
    categoryId: z.string().optional().describe("Optionale Kategorie-ID"),
  })

  const saveInputSchema =
    scope === "admin"
      ? saveBaseSchema.extend({
          userId: z
            .string()
            .describe("User-ID des Kunden, dem das Dokument zugeordnet wird"),
        })
      : saveBaseSchema

  const save_document = tool({
    description:
      "Speichert eine Datei dauerhaft in Supabase Storage und legt einen Eintrag in der Dokumentenverwaltung an. " +
      "Verwende dieses Tool, um hochgeladene oder generierte Dateien im System zu speichern.",
    ...(needsApproval ? { needsApproval: true as const } : {}),
    inputSchema: saveInputSchema,
    execute: async (input) => {
      const { user, error: authError } = await verifyAuth(scope)
      if (authError) return { success: false, error: authError }

      try {
        const { filename, fileDataUrl, propertyId, categoryId } = input
        const targetUserId =
          "userId" in input && input.userId
            ? (input.userId as string)
            : user.id

        // Decode data URL → Buffer
        const base64Data = fileDataUrl.split(",")[1]
        if (!base64Data) {
          return { success: false, error: "Ungültige Data-URL" }
        }

        const mimeMatch = fileDataUrl.match(/^data:([^;]+);/)
        const mimeType = mimeMatch?.[1] ?? "application/octet-stream"
        const buffer = Buffer.from(base64Data, "base64")

        const result = await savePdfToStorage({
          buffer,
          filename,
          userId: targetUserId,
          propertyId,
          categoryId,
          mimeType,
        })

        return {
          success: true,
          documentId: result.documentId,
          signedUrl: result.signedUrl,
          name: filename,
          message: `Dokument "${filename}" wurde erfolgreich gespeichert.`,
        }
      } catch (err) {
        return {
          success: false,
          error: `Speichern fehlgeschlagen: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
        }
      }
    },
  })

  // ── generate_pdf ───────────────────────────────────────────────────

  const generateBaseSchema = z.object({
    title: z.string().describe("Titel des PDF-Dokuments"),
    sections: z
      .array(
        z.object({
          heading: z.string().optional().describe("Abschnittstitel"),
          body: z.string().describe("Textinhalt des Abschnitts"),
        })
      )
      .describe("Abschnitte des Dokuments"),
    propertyId: z.string().optional(),
    saveToDocuments: z
      .boolean()
      .optional()
      .default(true)
      .describe("Ob das PDF in der Dokumentenverwaltung gespeichert werden soll"),
  })

  const generateInputSchema =
    scope === "admin"
      ? generateBaseSchema.extend({
          userId: z
            .string()
            .optional()
            .describe(
              "User-ID für die Speicherung. Ohne wird der Admin als Eigentümer gesetzt."
            ),
        })
      : generateBaseSchema

  const generate_pdf = tool({
    description:
      "Erstellt ein PDF-Dokument auf Basis einer freien Beschreibung. " +
      "Das PDF wird server-seitig generiert, optional gespeichert und ein Download-Link zurückgegeben. " +
      "Ideal für Berichte, Zusammenfassungen, Finanzübersichten oder Kundenbriefe.",
    ...(needsApproval ? { needsApproval: true as const } : {}),
    inputSchema: generateInputSchema,
    execute: async (input) => {
      const { user, error: authError } = await verifyAuth(scope)
      if (authError) return { success: false, error: authError }

      try {
        const { title, sections, saveToDocuments, propertyId } = input
        const targetUserId =
          "userId" in input && input.userId
            ? (input.userId as string)
            : user.id

        const pdfBuffer = await generatePdfBuffer({
          template: "generic-document",
          props: {
            title,
            sections,
            metadata: {
              date: new Date().toLocaleDateString("de-DE"),
              author: "SDIA Portal",
            },
          },
        })

        const fileName = `${title.replace(/[^a-z0-9 ]/gi, "_").replace(/\s+/g, "_").slice(0, 50)}.pdf`

        if (!saveToDocuments) {
          // Return base64 for immediate in-chat download (no signed URL available)
          const contentBase64 = pdfBuffer.toString("base64")
          return {
            success: true,
            name: fileName,
            contentBase64,
            mimeType: "application/pdf",
            saved: false,
            message: `PDF "${fileName}" wurde erstellt. Verwende save_document um es dauerhaft zu speichern.`,
          }
        }

        // Save to storage + documents table — use signedUrl for display (avoid large base64 in stream)
        const result = await savePdfToStorage({
          buffer: pdfBuffer,
          filename: fileName,
          userId: targetUserId,
          propertyId,
        })

        return {
          success: true,
          name: fileName,
          mimeType: "application/pdf",
          documentId: result.documentId,
          signedUrl: result.signedUrl,
          saved: true,
          message: `PDF "${fileName}" wurde erstellt und in der Dokumentenverwaltung gespeichert.`,
        }
      } catch (err) {
        return {
          success: false,
          error: `PDF-Erstellung fehlgeschlagen: ${err instanceof Error ? err.message : "Unbekannter Fehler"}`,
        }
      }
    },
  })

  return { read_document, save_document, generate_pdf }
}
