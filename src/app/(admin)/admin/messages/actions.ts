"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/supabase/admin"

export async function sendMessage(conversationId: string, content: string) {
  const { supabase, profile: admin } = await requireAdmin()

  const adminName = [admin.first_name, admin.last_name]
    .filter(Boolean)
    .join(" ") || "SDIA Admin"

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    content,
    sender_type: "advisor",
    sender_name: adminName,
  })

  if (error) return { error: error.message }

  // Update conversation timestamp
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId)

  await supabase.from("admin_activity_log").insert({
    admin_id: admin.id,
    action: "message.sent",
    entity_type: "conversation",
    entity_id: conversationId,
  })

  revalidatePath("/admin/messages")
  return { success: true }
}

export async function createConversation(userId: string, subject: string, content: string) {
  const { supabase, profile: admin } = await requireAdmin()

  const adminName = [admin.first_name, admin.last_name]
    .filter(Boolean)
    .join(" ") || "SDIA Admin"

  // Create conversation
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .insert({ user_id: userId, subject, status: "open" })
    .select("id")
    .single()

  if (convError) return { error: convError.message }

  // Add first message
  const { error: msgError } = await supabase.from("messages").insert({
    conversation_id: conversation.id,
    content,
    sender_type: "advisor",
    sender_name: adminName,
  })

  if (msgError) return { error: msgError.message }

  await supabase.from("admin_activity_log").insert({
    admin_id: admin.id,
    action: "message.sent",
    entity_type: "conversation",
    entity_id: conversation.id,
  })

  revalidatePath("/admin/messages")
  return { success: true }
}

export async function sendEmail(to: string, subject: string, body: string) {
  const { profile: admin } = await requireAdmin()

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ to, subject, body }),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    return { error: `E-Mail-Versand fehlgeschlagen: ${text}` }
  }

  return { success: true }
}
