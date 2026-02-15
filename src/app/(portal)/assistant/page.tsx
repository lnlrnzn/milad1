import type { Metadata } from "next"
import { AssistantChat } from "@/components/portal/assistant/assistant-chat"

export const metadata: Metadata = {
  title: "KI-Assistent",
}

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">KI-Assistent</h1>
        <p className="text-sm text-muted-foreground">
          Fragen Sie unseren Assistenten zu Ihren Immobilien, Dokumenten und
          Finanzen
        </p>
      </div>
      <AssistantChat />
    </div>
  )
}
