import { createClient } from "@/lib/supabase/server"
import { MetricCard } from "@/components/shared/metric-card"
import { Users, Building2, Wallet, Store } from "lucide-react"
import { formatCurrency } from "@/components/shared/currency-display"

export async function AdminKPIs() {
  const supabase = await createClient()

  const [
    { count: clientCount },
    { count: propertyCount },
    { data: valuations },
    { count: activeOfferCount },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "investor"),
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("property_valuations")
      .select("property_id, market_value, valuation_date")
      .order("valuation_date", { ascending: false }),
    supabase
      .from("offers")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
  ])

  // Calculate total portfolio value from latest valuations per property
  const latestPerProperty = new Map<string, number>()
  for (const v of valuations ?? []) {
    if (!latestPerProperty.has(v.property_id)) {
      latestPerProperty.set(v.property_id, v.market_value)
    }
  }
  const totalPortfolioValue = Array.from(latestPerProperty.values()).reduce(
    (sum, val) => sum + val,
    0
  )

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Gesamtkunden"
        value={String(clientCount ?? 0)}
        icon={Users}
      />
      <MetricCard
        title="Aktive Immobilien"
        value={String(propertyCount ?? 0)}
        icon={Building2}
      />
      <MetricCard
        title="Portfolio-Gesamtwert"
        value={formatCurrency(totalPortfolioValue)}
        icon={Wallet}
      />
      <MetricCard
        title="Aktive Angebote"
        value={String(activeOfferCount ?? 0)}
        icon={Store}
      />
    </div>
  )
}
