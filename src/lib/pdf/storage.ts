import "server-only"
import { createClient } from "@/lib/supabase/server"

export interface SavePdfParams {
  buffer: Buffer
  filename: string
  userId: string
  propertyId?: string
  categoryId?: string
  mimeType?: string
}

export interface SavePdfResult {
  documentId: string
  filePath: string
  signedUrl: string
}

export async function fetchPdfFromStorage(
  filePath: string
): Promise<ArrayBuffer> {
  const supabase = await createClient()
  const { data, error } = await supabase.storage
    .from("documents")
    .download(filePath)

  if (error || !data) {
    throw new Error(`Datei konnte nicht heruntergeladen werden: ${error?.message}`)
  }

  return data.arrayBuffer()
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100)
}

export async function savePdfToStorage(
  params: SavePdfParams
): Promise<SavePdfResult> {
  const supabase = await createClient()
  const { buffer, filename, userId, propertyId, categoryId, mimeType } = params

  const safeFilename = sanitizeFilename(filename)
  const filePath = `${userId}/${propertyId ?? "general"}/${Date.now()}-${safeFilename}`

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, buffer, {
      contentType: mimeType ?? "application/pdf",
    })

  if (uploadError) {
    throw new Error(`Upload fehlgeschlagen: ${uploadError.message}`)
  }

  const { data: doc, error: dbError } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      name: filename,
      file_path: filePath,
      file_size: buffer.byteLength,
      mime_type: mimeType ?? "application/pdf",
      property_id: propertyId ?? null,
      category_id: categoryId ?? null,
    })
    .select("id")
    .single()

  if (dbError || !doc) {
    // Clean up orphaned file in storage
    await supabase.storage.from("documents").remove([filePath])
    throw new Error(`Datenbankeintrag fehlgeschlagen: ${dbError?.message}`)
  }

  const { data: signed } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, 3600)

  return {
    documentId: doc.id,
    filePath,
    signedUrl: signed?.signedUrl ?? "",
  }
}

export async function createSignedUrl(
  filePath: string,
  expiresInSeconds = 3600
): Promise<string> {
  const supabase = await createClient()
  const { data } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, expiresInSeconds)

  return data?.signedUrl ?? ""
}
