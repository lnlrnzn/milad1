import { Building2, Wallet } from "lucide-react"
import { formatCurrency } from "@/components/shared/currency-display"
import { MetricCard } from "@/components/shared/metric-card"

export function ClientKpis({
  propertyCount,
  totalValue,
  totalRent,
  totalNet,
}: {
  propertyCount: number
  totalValue: number
  totalRent: number
  totalNet: number
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Immobilien"
        value={String(propertyCount)}
        icon={Building2}
      />
      <MetricCard
        title="Portfolio-Wert"
        value={formatCurrency(totalValue)}
        icon={Wallet}
      />
      <MetricCard
        title="Mtl. Mieteinnahmen"
        value={formatCurrency(totalRent, true)}
        icon={Wallet}
      />
      <MetricCard
        title="Mtl. Netto-Cashflow"
        value={formatCurrency(totalNet, true)}
        icon={Wallet}
      />
    </div>
  )
}
