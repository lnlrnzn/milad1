import type { Metadata } from "next"
import { getSessions } from "@/lib/chat/queries"
import { ChatLayout } from "@/components/shared/chat/chat-layout"
import { AdminAssistantChat } from "@/components/admin/assistant/admin-assistant-chat"

export const metadata: Metadata = {
  title: "KI-Assistent - Admin",
}

export default async function AdminAssistantPage() {
  const sessions = await getSessions(true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">KI-Assistent</h1>
        <p className="text-sm text-muted-foreground">
          Fragen Sie den Assistenten zu Kunden, Immobilien, Finanzen und
          Verwaltung
        </p>
      </div>
      <ChatLayout
        sessions={sessions}
        activeSessionId={null}
        isAdmin={true}
      >
        <AdminAssistantChat />
      </ChatLayout>
    </div>
  )
}
