import { TrendingDown, TrendingUp, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export function TrendIndicator({
  value,
  className,
}: {
  value: number
  className?: string
}) {
  if (value === 0) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-sm text-muted-foreground",
          className
        )}
      >
        <Minus className="h-3.5 w-3.5" />
        0%
      </span>
    )
  }

  const isPositive = value > 0

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium",
        isPositive ? "text-success" : "text-danger",
        className
      )}
    >
      {isPositive ? (
        <TrendingUp className="h-3.5 w-3.5" />
      ) : (
        <TrendingDown className="h-3.5 w-3.5" />
      )}
      {isPositive ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  )
}
