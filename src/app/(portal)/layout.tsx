import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Sidebar } from "@/components/layout/sidebar"
import { TopBar } from "@/components/layout/top-bar"

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const [{ data: profile }, { count: unreadCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, last_name, email, role")
      .eq("id", user.id)
      .single(),
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("read", false),
  ])

  const isAdmin = profile?.role === "admin"

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isAdmin={isAdmin} />
      <div className="lg:pl-64">
        <TopBar
          profile={
            profile ?? {
              first_name: null,
              last_name: null,
              email: user.email ?? "",
            }
          }
          unreadCount={unreadCount ?? 0}
          isAdmin={isAdmin}
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
