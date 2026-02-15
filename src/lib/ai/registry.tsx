"use client"

import { createRenderer } from "@json-render/react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Info, CheckCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { assistantCatalog } from "./catalog"

export const AssistantRenderer = createRenderer(assistantCatalog, {
  MetricGrid: ({ element }) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {element.props.items.map((item, i) => (
        <Card key={i} className="p-3">
          <p className="text-xs text-muted-foreground">{item.label}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-lg font-semibold">{item.value}</span>
            {item.trend === "up" && (
              <TrendingUp className="h-4 w-4 text-green-600" />
            )}
            {item.trend === "down" && (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            {item.trend === "neutral" && (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </Card>
      ))}
    </div>
  ),

  PropertySummary: ({ element }) => {
    const p = element.props
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="font-heading text-sm font-semibold truncate">
              {p.name}
            </h4>
            <p className="mt-0.5 text-xs text-muted-foreground">{p.address}</p>
          </div>
          {p.status ? (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {p.status}
            </Badge>
          ) : null}
        </div>
        {(p.value || p.rent) ? (
          <div className="mt-3 flex gap-4 text-sm">
            {p.value ? (
              <div>
                <span className="text-muted-foreground">Wert: </span>
                <span className="font-medium">{p.value}</span>
              </div>
            ) : null}
            {p.rent ? (
              <div>
                <span className="text-muted-foreground">Miete: </span>
                <span className="font-medium">{p.rent}</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>
    )
  },

  InfoAlert: ({ element }) => {
    const p = element.props
    const icons = {
      info: Info,
      success: CheckCircle,
      warning: AlertTriangle,
    }
    const styles = {
      info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
      success: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
      warning: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
    }
    const Icon = icons[p.type]
    return (
      <div className={cn("flex items-start gap-2 rounded-lg border p-3", styles[p.type])}>
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="text-sm">{p.message}</p>
      </div>
    )
  },
})
