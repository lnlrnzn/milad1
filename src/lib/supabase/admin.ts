import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

/**
 * Server-side helper that verifies the current user is an admin.
 * Redirects to /dashboard if not authenticated or not an admin.
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, role, avatar_url")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  return { user, profile, supabase }
}
