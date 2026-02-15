import { TrendingUp, Wallet, CreditCard, BarChart3 } from "lucide-react"
import { MetricCard } from "@/components/shared/metric-card"
import { formatCurrency } from "@/components/shared/currency-display"

export function PropertyMetrics({
  purchasePrice,
  currentValue,
  monthlyRent,
  netCashflow,
}: {
  purchasePrice: number
  currentValue: number
  monthlyRent: number
  netCashflow: number
}) {
  const appreciation =
    purchasePrice > 0
      ? ((currentValue - purchasePrice) / purchasePrice) * 100
      : 0
  const grossYield =
    purchasePrice > 0 ? ((monthlyRent * 12) / purchasePrice) * 100 : 0

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Kaufpreis"
        value={formatCurrency(purchasePrice)}
        icon={CreditCard}
      />
      <MetricCard
        title="Marktwert"
        value={formatCurrency(currentValue)}
        trend={appreciation}
        icon={TrendingUp}
      />
      <MetricCard
        title="Monatl. Miete"
        value={formatCurrency(monthlyRent)}
        icon={Wallet}
      />
      <MetricCard
        title="Brutto-Rendite"
        value={`${grossYield.toFixed(1)}%`}
        icon={BarChart3}
      />
    </div>
  )
}
