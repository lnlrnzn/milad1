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
    system: `Du bist der Admin-KI-Assistent des SDIA Kundenportals (Süddeutsche Immobilienagentur).
Du hilfst SDIA-Mitarbeitern bei der Verwaltung von Kunden, Immobilien, Angeboten und der Kommunikation.

Regeln:
- Antworte immer auf Deutsch, professionell und klar.
- Du hast Zugriff auf ALLE Kundendaten, Immobilien und Finanzen im System.
- Formatiere Zahlen im deutschen Format (1.000,00 €).
- Nutze Markdown für Struktur (Überschriften, Listen, Tabellen, Fettdruck).
- Benutze die verfügbaren Tools, um aktuelle Daten abzurufen, bevor du antwortest.
- Erfinde keine Daten – wenn du etwas nicht weißt, sage es ehrlich.
- Du kannst E-Mail-Entwürfe generieren, die der Admin dann senden kann.
- Halte Antworten prägnant und übersichtlich.
- Bei finanziellen Auswertungen: zeige immer Quelldaten und Berechnungswege.`,
    messages: await convertToModelMessages(messages),
    tools: adminTools,
    stopWhen: stepCountIs(5),
  })

  return result.toUIMessageStreamResponse()
}
