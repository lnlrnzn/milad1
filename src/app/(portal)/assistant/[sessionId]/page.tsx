import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getSessions,
  getSession,
  getSessionMessages,
} from "@/lib/chat/queries"
import { ChatLayout } from "@/components/shared/chat/chat-layout"
import { AssistantChat } from "@/components/portal/assistant/assistant-chat"

export const metadata: Metadata = {
  title: "KI-Assistent",
}

export default async function AssistantSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params

  const [sessions, session, dbMessages] = await Promise.all([
    getSessions(false),
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
          Fragen Sie unseren Assistenten zu Ihren Immobilien, Dokumenten und
          Finanzen
        </p>
      </div>
      <ChatLayout
        sessions={sessions}
        activeSessionId={sessionId}
        isAdmin={false}
      >
        <AssistantChat
          sessionId={sessionId}
          initialMessages={initialMessages}
        />
      </ChatLayout>
    </div>
  )
}
