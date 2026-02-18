import { createClient } from "@/lib/supabase/server"
import { PortfolioValueChart, ClientStatusChart } from "./admin-charts"

const statusLabels: Record<string, string> = {
  prospect: "Interessent",
  active: "Aktiv",
  inactive: "Inaktiv",
}

function formatMonth(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString("de-DE", { month: "short", year: "2-digit" })
}

export async function AdminChartsData() {
  const supabase = await createClient()

  // Fetch valuations for last 12 months (aggregate by month)
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const [{ data: valuations }, { data: clientProfiles }] = await Promise.all([
    supabase
      .from("property_valuations")
      .select("property_id, market_value, valuation_date")
      .gte("valuation_date", twelveMonthsAgo.toISOString().slice(0, 10))
      .order("valuation_date", { ascending: true }),
    supabase
      .from("client_profiles")
      .select("client_status"),
  ])

  // Build monthly portfolio value data
  // Group valuations by month, for each month sum latest value per property up to that month
  const allValuations = valuations ?? []

  // Get all unique months
  const monthSet = new Set<string>()
  for (const v of allValuations) {
    monthSet.add(v.valuation_date.slice(0, 7)) // YYYY-MM
  }

  // Also add current month if not present
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  monthSet.add(currentMonth)

  const sortedMonths = Array.from(monthSet).sort()

  // For each month, calculate total portfolio value (latest valuation per property up to that month)
  const propertyValues = new Map<string, number>()
  let valIdx = 0

  const portfolioData = sortedMonths.map((month) => {
    // Process all valuations up to this month
    while (valIdx < allValuations.length && allValuations[valIdx].valuation_date.slice(0, 7) <= month) {
      propertyValues.set(allValuations[valIdx].property_id, allValuations[valIdx].market_value)
      valIdx++
    }

    let total = 0
    for (const val of propertyValues.values()) {
      total += val
    }

    return {
      month: formatMonth(`${month}-01`),
      value: total,
    }
  })

  // Build client status data
  const statusCounts: Record<string, number> = { active: 0, prospect: 0, inactive: 0 }
  for (const cp of clientProfiles ?? []) {
    const s = cp.client_status ?? "prospect"
    statusCounts[s] = (statusCounts[s] ?? 0) + 1
  }

  const clientStatusData = Object.entries(statusCounts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      status: statusLabels[status] ?? status,
      count,
    }))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <PortfolioValueChart data={portfolioData} />
      <ClientStatusChart data={clientStatusData} />
    </div>
  )
}
