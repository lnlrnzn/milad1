import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai"
import { anthropic } from "@ai-sdk/anthropic"
import { pipeJsonRender } from "@json-render/core"
import { createClient } from "@/lib/supabase/server"
import { assistantTools } from "@/lib/ai/tools"
import { assistantCatalog } from "@/lib/ai/catalog"

export const maxDuration = 60

const catalogPrompt = assistantCatalog.prompt({ mode: "chat" })

const systemPrompt = `Du bist der KI-Assistent des SDIA Kundenportals (Süddeutsche Immobilienagentur).
Du hilfst Immobilien-Investoren bei Fragen zu ihrem Portfolio, Dokumenten, Finanzkennzahlen, Ansprechpartnern und neuen Investment-Angeboten.

Regeln:
- Antworte immer auf Deutsch, professionell und freundlich.
- Verwende "Sie" als Anrede.
- Formatiere Zahlen im deutschen Format (1.000,00 €).
- Benutze die verfügbaren Tools, um aktuelle Daten des Nutzers abzurufen, bevor du antwortest.
- Erfinde keine Daten – wenn du etwas nicht weißt, sage es ehrlich.
- Bei Finanzfragen: Weise darauf hin, dass deine Berechnungen keine Steuer- oder Anlageberatung ersetzen.
- Halte Antworten prägnant und übersichtlich.
- Mit \`read_document\` kannst du PDFs und Dokumente lesen und analysieren.
- Mit \`save_document\` kannst du Dateien dauerhaft in der Dokumentenverwaltung speichern.
- Mit \`generate_pdf\` kannst du PDF-Berichte, Zusammenfassungen und Briefe erstellen.

WICHTIG – UI-Komponenten:
- Wenn du Tool-Ergebnisse erhältst, verwende die unten beschriebenen UI-Komponenten zur strukturierten Darstellung.
- Wiederhole NICHT die Daten aus den UI-Komponenten nochmal als Fließtext. Die Komponenten zeigen die Daten bereits an.
- Nutze Markdown nur für Erklärungen und Kontext, nicht für die reine Wiedergabe von Tool-Daten.

KRITISCH – Streaming-Reihenfolge:
- Schreibe IMMER zuerst einen kurzen einleitenden Satz (1-2 Sätze), BEVOR du UI-Komponenten erzeugst.
- Beispiel: "Hier ist Ihre Portfolio-Übersicht:" → dann die MetricGrid/PropertyCard Komponenten.
- Beginne NIEMALS deine Antwort direkt mit einem spec-Block. Der Nutzer muss sofort Text sehen.
- Nach den Komponenten darfst du optional einen kurzen zusammenfassenden Satz oder Hinweis ergänzen.

${catalogPrompt}`

export async function POST(req: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Nicht authentifiziert", { status: 401 })
  }

  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: anthropic("claude-sonnet-4-5-20250929"),
    system: systemPrompt,
    messages: await convertToModelMessages(messages, { tools: assistantTools }),
    tools: assistantTools,
    stopWhen: stepCountIs(8),
  })

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      writer.merge(
        pipeJsonRender(result.toUIMessageStream())
      )
    },
  })

  return createUIMessageStreamResponse({ stream })
}
