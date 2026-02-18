import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getSessions,
  getSession,
  getSessionMessages,
} from "@/lib/chat/queries"
import { ChatLayout } from "@/components/shared/chat/chat-layout"
import { AdminAssistantChat } from "@/components/admin/assistant/admin-assistant-chat"

export const metadata: Metadata = {
  title: "KI-Assistent - Admin",
}

export default async function AdminAssistantSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params

  const [sessions, session, dbMessages] = await Promise.all([
    getSessions(true),
    getSession(sessionId),
    getSessionMessages(sessionId),
  ])

  if (!session) notFound()

  const initialMessages = dbMessages.map((m) => ({
    id: m.message_id,
    role: m.role,
    parts: ((m.parts ?? []) as unknown[]),
  }))

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
        activeSessionId={sessionId}
        isAdmin={true}
      >
        <AdminAssistantChat
          sessionId={sessionId}
          initialMessages={initialMessages}
        />
      </ChatLayout>
    </div>
  )
}
