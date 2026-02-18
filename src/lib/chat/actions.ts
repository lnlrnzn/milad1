"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Json } from "@/lib/types/database"

export async function createChatSession(isAdmin: boolean): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("ai_chat_sessions")
    .insert({ user_id: user.id, is_admin: isAdmin })
    .select("id")
    .single()

  if (error || !data) throw new Error("Failed to create session")

  const basePath = isAdmin ? "/admin/assistant" : "/assistant"
  revalidatePath(basePath)

  return data.id
}

export async function deleteChatSession(
  sessionId: string,
  isAdmin: boolean
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("ai_chat_sessions")
    .delete()
    .eq("id", sessionId)

  if (error) throw error

  const basePath = isAdmin ? "/admin/assistant" : "/assistant"
  revalidatePath(basePath)
}

export async function renameChatSession(
  sessionId: string,
  title: string
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("ai_chat_sessions")
    .update({ title: title.slice(0, 100) })
    .eq("id", sessionId)

  if (error) throw error
  revalidatePath("/assistant")
  revalidatePath("/admin/assistant")
}

export async function persistChatMessages(
  sessionId: string,
  messages: Array<{ id: string; role: string; parts: unknown[] }>
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  const rows = messages.map((m) => ({
    session_id: sessionId,
    message_id: m.id,
    role: m.role,
    parts: m.parts as Json,
  }))

  const { error } = await supabase
    .from("ai_chat_messages")
    .upsert(rows, { onConflict: "session_id,message_id" })

  if (error) {
    console.error("[chat-persist] upsert failed:", error)
    return
  }

  // Auto-set title from first user message (only if still default)
  const firstUser = messages.find((m) => m.role === "user")
  if (firstUser) {
    const textPart = firstUser.parts.find(
      (p): p is { type: "text"; text: string } =>
        typeof p === "object" &&
        p !== null &&
        (p as Record<string, unknown>).type === "text"
    )
    if (textPart) {
      await supabase
        .from("ai_chat_sessions")
        .update({ title: textPart.text.slice(0, 100) })
        .eq("id", sessionId)
        .eq("title", "Neuer Chat")
    }
  }
}
