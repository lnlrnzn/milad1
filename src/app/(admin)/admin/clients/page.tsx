import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { ClientTable } from "@/components/admin/clients/client-table"

export const metadata: Metadata = {
  title: "Kunden - Admin",
}

export default async function AdminClientsPage() {
  const supabase = await createClient()

  // Get all investor profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, created_at")
    .eq("role", "investor")
    .order("created_at", { ascending: false })

  if (!profiles) return null

  const userIds = profiles.map((p) => p.id)

  // Get client profiles for extended data
  const { data: clientProfiles } = await supabase
    .from("client_profiles")
    .select("user_id, client_status, annual_salary, advisor_id")
    .in("user_id", userIds)

  // Get property counts per user
  const { data: userProperties } = await supabase
    .from("user_properties")
    .select("user_id")
    .in("user_id", userIds)

  // Get advisor names
  const advisorIds = [
    ...new Set(
      (clientProfiles ?? [])
        .filter((cp) => cp.advisor_id)
        .map((cp) => cp.advisor_id!)
    ),
  ]
  const { data: advisors } = advisorIds.length
    ? await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", advisorIds)
    : { data: [] }

  const advisorMap = new Map(
    (advisors ?? []).map((a) => [
      a.id,
      [a.first_name, a.last_name].filter(Boolean).join(" "),
    ])
  )

  const cpMap = new Map(
    (clientProfiles ?? []).map((cp) => [cp.user_id, cp])
  )

  // Count properties per user
  const propCounts = new Map<string, number>()
  for (const up of userProperties ?? []) {
    propCounts.set(up.user_id, (propCounts.get(up.user_id) ?? 0) + 1)
  }

  const clients = profiles.map((p) => {
    const cp = cpMap.get(p.id)
    return {
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email,
      created_at: p.created_at,
      client_status: cp?.client_status ?? null,
      annual_salary: cp?.annual_salary ?? null,
      advisor_name: cp?.advisor_id ? advisorMap.get(cp.advisor_id) ?? null : null,
      property_count: propCounts.get(p.id) ?? 0,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Kunden</h1>
        <p className="text-sm text-muted-foreground">
          Alle Investoren und deren Portfolios verwalten
        </p>
      </div>
      <ClientTable clients={clients} />
    </div>
  )
}
