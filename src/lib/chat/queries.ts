import "server-only"
import { createClient } from "@/lib/supabase/server"
import type { ChatSession, ChatMessage } from "./types"

export async function getSessions(isAdmin: boolean): Promise<ChatSession[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("ai_chat_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_admin", isAdmin)
    .order("updated_at", { ascending: false })

  return (data ?? []) as ChatSession[]
}

export async function getSession(
  sessionId: string
): Promise<ChatSession | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("ai_chat_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single()

  return (data ?? null) as ChatSession | null
}

export async function getSessionMessages(
  sessionId: string
): Promise<ChatMessage[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("ai_chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true })

  return (data ?? []) as ChatMessage[]
}
