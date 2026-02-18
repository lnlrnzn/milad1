"use client"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

type ValuationPoint = {
  month: string
  value: number
}

type ClientStatusData = {
  status: string
  count: number
}

const portfolioChartConfig = {
  value: {
    label: "Portfolio-Wert",
    color: "oklch(0.55 0.08 75)",
  },
} satisfies ChartConfig

const clientChartConfig = {
  count: {
    label: "Kunden",
    color: "oklch(0.55 0.08 75)",
  },
} satisfies ChartConfig

const statusColors: Record<string, string> = {
  Aktiv: "oklch(0.55 0.08 75)",
  Interessent: "oklch(0.38 0.08 160)",
  Inaktiv: "oklch(0.7 0.01 0)",
}

function formatEur(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} Mio €`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k €`
  return `${value} €`
}

export function PortfolioValueChart({ data }: { data: ValuationPoint[] }) {
  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg">
          Portfolio-Wertentwicklung
        </CardTitle>
        <p className="text-xs text-muted-foreground">Letzte 12 Monate</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={portfolioChartConfig} className="h-[240px] w-full">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.55 0.08 75)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="oklch(0.55 0.08 75)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={formatEur}
              width={70}
              fontSize={11}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatEur(Number(value))}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="oklch(0.55 0.08 75)"
              strokeWidth={2}
              fill="url(#portfolioGradient)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function ClientStatusChart({ data }: { data: ClientStatusData[] }) {
  const dataWithColor = data.map((d) => ({
    ...d,
    fill: statusColors[d.status] ?? "oklch(0.7 0.01 0)",
  }))

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg">
          Kunden nach Status
        </CardTitle>
        <p className="text-xs text-muted-foreground">Verteilung der Kundenbasis</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={clientChartConfig} className="h-[240px] w-full">
          <BarChart data={dataWithColor} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="status"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={30}
              fontSize={11}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="count"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ChartContainer>
        <div className="mt-3 flex items-center justify-center gap-4">
          {data.map((d) => (
            <div key={d.status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: statusColors[d.status] }}
              />
              {d.status} ({d.count})
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
