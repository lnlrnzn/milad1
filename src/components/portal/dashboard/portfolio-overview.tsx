import { Building2, TrendingUp, Wallet, Percent } from "lucide-react"
import { MetricCard } from "@/components/shared/metric-card"
import { formatCurrency } from "@/components/shared/currency-display"

export function PortfolioOverview({
  totalValue,
  totalValueTrend,
  propertyCount,
  monthlyRentalIncome,
  averageYield,
}: {
  totalValue: number
  totalValueTrend: number
  propertyCount: number
  monthlyRentalIncome: number
  averageYield: number
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Portfolio-Gesamtwert"
        value={formatCurrency(totalValue)}
        trend={totalValueTrend}
        icon={TrendingUp}
      />
      <MetricCard
        title="Immobilien"
        value={String(propertyCount)}
        icon={Building2}
      />
      <MetricCard
        title="Monatl. Mieteinnahmen"
        value={formatCurrency(monthlyRentalIncome)}
        icon={Wallet}
      />
      <MetricCard
        title="Ø Rendite"
        value={`${averageYield.toFixed(1)}%`}
        icon={Percent}
      />
    </div>
  )
}
