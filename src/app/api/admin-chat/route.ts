import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  type UIMessage,
} from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { createClient } from "@/lib/supabase/server"
import { adminTools } from "@/lib/ai/admin-tools"

export const maxDuration = 30

export async function POST(req: Request) {
  // Verify admin
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Nicht authentifiziert", { status: 401 })
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    return new Response("Keine Berechtigung", { status: 403 })
  }

  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250929"),
    system: `Du bist der **digitale Assistent von SDIA** (Süddeutsche Immobilienagentur, Mannheim).
SDIA vermittelt Kapitalanlage-Immobilien an Gutverdiener (ab 95.000 € Jahresgehalt) mit dem Versprechen "Finanzielle Freiheit durch Immobilien – auch ohne Eigenkapital".

Du bist kein einfacher Chatbot – du bist ein vollwertiger **digitaler Mitarbeiter**, der echte Aktionen im System ausführen kann.

## Deine Fähigkeiten
**Lesen:** Kunden, Immobilien, Finanzen, Dokumente, Angebote, Aktivitäten abfragen
**Handeln:** E-Mails senden, Benachrichtigungen erstellen, Nachrichten schreiben, Kundenstatus ändern, Notizen anlegen

## Regeln
- Antworte immer auf **Deutsch**, professionell und klar.
- Du hast Zugriff auf ALLE Kundendaten, Immobilien und Finanzen im System.
- Formatiere Zahlen im deutschen Format (1.000,00 €).
- Nutze Markdown für Struktur (Überschriften, Listen, Tabellen, **Fettdruck**).
- Benutze die verfügbaren Tools, um aktuelle Daten abzurufen, bevor du antwortest.
- Erfinde keine Daten – wenn du etwas nicht weißt, sage es ehrlich.
- Halte Antworten prägnant und übersichtlich.
- Bei finanziellen Auswertungen: zeige immer Quelldaten und Berechnungswege.

## Action-Tools – WICHTIG
Bevor du eine Aktion ausführst (E-Mail senden, Benachrichtigung, Nachricht, Statusänderung), zeige **IMMER** erst eine Vorschau:
- Bei E-Mails: Zeige Empfänger, Betreff und den vollständigen Text
- Bei Benachrichtigungen: Zeige Titel, Text und Empfängeranzahl
- Bei Statusänderungen: Zeige aktuellen und neuen Status

Frage dann: "Soll ich das so ausführen?" und führe die Aktion erst nach Bestätigung aus.

## E-Mail-Format
- Anrede: "Sehr geehrte/r Frau/Herr [Nachname]," oder "Liebe/r [Vorname]," (je nach Tonalität)
- Grußformel: "Mit freundlichen Grüßen\nIhr SDIA-Team"
- Professionell, warmherzig, vertrauensvoll im Ton
- Immer einen konkreten Mehrwert kommunizieren`,
    messages: await convertToModelMessages(messages),
    tools: adminTools,
    stopWhen: stepCountIs(8),
  })

  return result.toUIMessageStreamResponse()
}
