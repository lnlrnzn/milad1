import type { Metadata } from "next"
import { getSessions } from "@/lib/chat/queries"
import { ChatLayout } from "@/components/shared/chat/chat-layout"
import { AssistantChat } from "@/components/portal/assistant/assistant-chat"

export const metadata: Metadata = {
  title: "KI-Assistent",
}

export default async function AssistantPage() {
  const sessions = await getSessions(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">KI-Assistent</h1>
        <p className="text-sm text-muted-foreground">
          Fragen Sie unseren Assistenten zu Ihren Immobilien, Dokumenten und
          Finanzen
        </p>
      </div>
      <ChatLayout
        sessions={sessions}
        activeSessionId={null}
        isAdmin={false}
      >
        <AssistantChat />
      </ChatLayout>
    </div>
  )
}
