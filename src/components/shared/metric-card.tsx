import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendIndicator } from "@/components/shared/trend-indicator"
import { cn } from "@/lib/utils"

export function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  className,
}: {
  title: string
  value: string
  trend?: number
  icon: LucideIcon
  className?: string
}) {
  return (
    <Card className={cn("shadow-card", className)}>
      <CardContent className="flex items-start justify-between p-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="font-heading text-2xl font-bold tabular-nums">{value}</p>
          {trend !== undefined && <TrendIndicator value={trend} />}
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  )
}
