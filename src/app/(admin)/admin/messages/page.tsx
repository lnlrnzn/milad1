import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { MessageSquare } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { AdminMessagesClient } from "@/components/admin/messages/admin-messages-client"
import { ComposeDialog } from "@/components/admin/messages/compose-dialog"
import { EmailSendDialog } from "@/components/admin/messages/email-send-dialog"

export const metadata: Metadata = {
  title: "Nachrichten - Admin",
}

export default async function AdminMessagesPage() {
  const supabase = await createClient()

  // Get all conversations with user info
  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      `
      id, subject, status, updated_at, user_id,
      messages (id, sender_type, sender_name, content, read, created_at)
    `
    )
    .order("updated_at", { ascending: false })

  // Get user profiles for conversation names
  const userIds = [
    ...new Set((conversations ?? []).map((c) => c.user_id)),
  ]
  const { data: profiles } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", userIds)
    : { data: [] }

  const profileMap = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      {
        name: [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email,
        email: p.email,
      },
    ])
  )

  // Get all investors for compose dialog
  const { data: investors } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .eq("role", "investor")

  const investorOptions = (investors ?? []).map((inv) => ({
    id: inv.id,
    name: [inv.first_name, inv.last_name].filter(Boolean).join(" ") || inv.email,
    email: inv.email,
  }))

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
      (m) => !m.read && m.sender_type === "user"
    ).length

    const user = profileMap.get(c.user_id)

    return {
      id: c.id,
      subject: c.subject,
      status: c.status,
      updated_at: c.updated_at,
      user_name: user?.name ?? "Unbekannt",
      user_email: user?.email ?? "",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Nachrichten</h1>
          <p className="text-sm text-muted-foreground">
            Kommunikation mit allen Kunden
          </p>
        </div>
        <div className="flex gap-2">
          <EmailSendDialog />
          <ComposeDialog investors={investorOptions} />
        </div>
      </div>

      {formattedConversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Keine Nachrichten"
          description="Starten Sie eine neue Konversation mit einem Kunden."
        />
      ) : (
        <AdminMessagesClient conversations={formattedConversations} />
      )}
    </div>
  )
}
