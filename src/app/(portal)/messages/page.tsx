import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { MessageSquare } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { MessagesClient } from "@/components/portal/messages/messages-client"

export const metadata: Metadata = {
  title: "Nachrichten",
}

export default async function MessagesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      `
      id, subject, status, updated_at,
      messages (id, sender_type, sender_name, content, read, created_at)
    `
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  const formattedConversations = (conversations ?? []).map((c) => {
    const msgs = (
      c.messages as unknown as {
        id: string
        sender_type: string
        sender_name: string | null
        content: string
        read: boolean
        created_at: string
      }[]
    )?.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ) ?? []

    const lastMessage = msgs[msgs.length - 1]
    const unreadCount = msgs.filter(
      (m) => !m.read && m.sender_type === "advisor"
    ).length

    return {
      id: c.id,
      subject: c.subject,
      status: c.status as "open" | "closed",
      updated_at: c.updated_at,
      last_message: lastMessage
        ? {
            content: lastMessage.content,
            sender_type: lastMessage.sender_type,
            created_at: lastMessage.created_at,
          }
        : null,
      unread_count: unreadCount,
      messages: msgs,
    }
  })

  if (formattedConversations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Nachrichten</h1>
          <p className="text-sm text-muted-foreground">
            Kommunikation mit Ihrem SDIA-Berater
          </p>
        </div>
        <EmptyState
          icon={MessageSquare}
          title="Keine Nachrichten"
          description="Sie haben noch keine Konversationen. Starten Sie eine neue Nachricht an Ihren Berater."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Nachrichten</h1>
        <p className="text-sm text-muted-foreground">
          Kommunikation mit Ihrem SDIA-Berater
        </p>
      </div>
      <MessagesClient conversations={formattedConversations} />
    </div>
  )
}
