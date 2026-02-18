"use client"

import { createRenderer } from "@json-render/react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  CheckCircle,
  AlertTriangle,
  FileText,
  Mail,
  Phone,
  Building2,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { assistantCatalog } from "./catalog"

export const AssistantRenderer = createRenderer(assistantCatalog, {
  MetricGrid: ({ element }) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {element.props.items.map((item) => (
        <Card key={item.label} className="p-3">
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

  PropertyCard: ({ element }) => {
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
          <div className="flex gap-1.5 shrink-0">
            {p.type && (
              <Badge variant="secondary" className="text-xs">
                {p.type}
              </Badge>
            )}
            {p.status && (
              <Badge variant="outline" className="text-xs">
                {p.status}
              </Badge>
            )}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          {p.currentValue && (
            <div>
              <span className="text-muted-foreground">Marktwert: </span>
              <span className="font-medium">{p.currentValue}</span>
            </div>
          )}
          {p.purchasePrice && (
            <div>
              <span className="text-muted-foreground">Kaufpreis: </span>
              <span className="font-medium">{p.purchasePrice}</span>
            </div>
          )}
          {p.rent && (
            <div>
              <span className="text-muted-foreground">Miete: </span>
              <span className="font-medium">{p.rent}</span>
            </div>
          )}
          {p.cashflow && (
            <div>
              <span className="text-muted-foreground">Cashflow: </span>
              <span
                className={cn(
                  "font-medium",
                  p.cashflowPositive === true && "text-green-600",
                  p.cashflowPositive === false && "text-red-500"
                )}
              >
                {p.cashflow}
              </span>
            </div>
          )}
        </div>
      </Card>
    )
  },

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

  DocumentList: ({ element }) => {
    const p = element.props
    return (
      <Card className="p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          Dokumente{p.totalCount != null ? ` (${p.totalCount})` : ""}
        </div>
        {p.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keine Dokumente gefunden.
          </p>
        ) : (
          <div className="space-y-1">
            {p.items.map((d, idx) => (
              <div
                key={`${d.name}-${d.category}-${idx}`}
                className="flex items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-muted/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <span className="truncate block">{d.name}</span>
                    {(d.property || d.date) && (
                      <span className="text-[10px] text-muted-foreground">
                        {[d.property, d.date].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0 ml-2">
                  {d.category}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    )
  },

  ContactCard: ({ element }) => {
    const p = element.props
    return (
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{p.name}</p>
          <Badge variant="secondary" className="text-xs">
            {p.type}
          </Badge>
        </div>
        {p.company && (
          <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {p.company}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {p.email && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {p.email}
            </span>
          )}
          {p.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {p.phone}
            </span>
          )}
        </div>
        {p.property && (
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Zuständig für: {p.property}
          </p>
        )}
      </Card>
    )
  },

  OfferCard: ({ element }) => {
    const p = element.props
    return (
      <Card className="p-4">
        <p className="text-sm font-semibold">{p.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{p.address}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
          <span>
            <span className="text-muted-foreground">Preis: </span>
            <span className="font-medium">{p.price}</span>
          </span>
          {p.expectedRent && (
            <span>
              <span className="text-muted-foreground">Erw. Miete: </span>
              <span className="font-medium">{p.expectedRent}</span>
            </span>
          )}
          {p.expectedYield && (
            <span>
              <span className="text-muted-foreground">Rendite: </span>
              <span className="font-medium text-green-600">
                {p.expectedYield}
              </span>
            </span>
          )}
          {p.rooms != null && (
            <span>
              <span className="text-muted-foreground">Zimmer: </span>
              <span className="font-medium">{p.rooms}</span>
            </span>
          )}
          {p.sizeSqm != null && (
            <span>
              <span className="text-muted-foreground">Fläche: </span>
              <span className="font-medium">{p.sizeSqm} m²</span>
            </span>
          )}
        </div>
      </Card>
    )
  },

  AlertMessage: ({ element }) => {
    const p = element.props
    const config = {
      info: { Icon: Info, style: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200" },
      success: { Icon: CheckCircle, style: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200" },
      warning: { Icon: AlertTriangle, style: "border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200" },
      error: { Icon: XCircle, style: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200" },
    }[p.type]
    return (
      <div className={cn("flex items-start gap-2 rounded-lg border p-3", config.style)}>
        <config.Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          {p.title && <p className="text-sm font-medium">{p.title}</p>}
          <p className={cn("text-sm", p.title && "mt-0.5 text-xs opacity-80")}>{p.message}</p>
        </div>
      </div>
    )
  },
})
