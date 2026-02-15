import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  type UIMessage,
} from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { assistantTools } from "@/lib/ai/tools"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250929"),
    system: `Du bist der KI-Assistent des SDIA Kundenportals (Süddeutsche Immobilienagentur).
Du hilfst Immobilien-Investoren bei Fragen zu ihrem Portfolio, Dokumenten, Finanzkennzahlen, Ansprechpartnern und neuen Investment-Angeboten.

Regeln:
- Antworte immer auf Deutsch, professionell und freundlich.
- Verwende "Sie" als Anrede.
- Formatiere Zahlen im deutschen Format (1.000,00 €).
- Nutze Markdown für Struktur (Überschriften, Listen, Fettdruck für wichtige Zahlen).
- Benutze die verfügbaren Tools, um aktuelle Daten des Nutzers abzurufen, bevor du antwortest.
- Erfinde keine Daten – wenn du etwas nicht weißt, sage es ehrlich.
- Bei Finanzfragen: Weise darauf hin, dass deine Berechnungen keine Steuer- oder Anlageberatung ersetzen.
- Halte Antworten prägnant und übersichtlich.`,
    messages: await convertToModelMessages(messages),
    tools: assistantTools,
    stopWhen: stepCountIs(5),
  })

  return result.toUIMessageStreamResponse()
}
