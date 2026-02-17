import { requireAdmin } from "@/lib/supabase/admin"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { TopBar } from "@/components/layout/top-bar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { profile, supabase } = await requireAdmin()

  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("read", false)

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:pl-64">
        <TopBar
          profile={{
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: profile.email,
          }}
          unreadCount={unreadCount ?? 0}
          isAdmin
        />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}
