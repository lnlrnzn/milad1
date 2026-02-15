import { createClient } from "@/lib/supabase/server"
import { RecentDocuments } from "@/components/portal/dashboard/recent-documents"
import { RecentNotifications } from "@/components/portal/dashboard/recent-notifications"

export async function DashboardRecents() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [{ data: recentDocs }, { data: notifications }] = await Promise.all([
    supabase
      .from("documents")
      .select("id, name, created_at, document_categories(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("notifications")
      .select("id, type, title, message, read, link, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const formattedDocs = (recentDocs ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    category_name: (
      d.document_categories as unknown as { name: string } | null
    )?.name ?? null,
    created_at: d.created_at,
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <RecentDocuments documents={formattedDocs} />
      </div>
      <div>
        <RecentNotifications notifications={notifications ?? []} />
      </div>
    </div>
  )
}
