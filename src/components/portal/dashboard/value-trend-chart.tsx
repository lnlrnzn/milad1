"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

const chartConfig = {
  value: {
    label: "Portfoliowert",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig

export function ValueTrendChart({
  data,
}: {
  data: { date: string; value: number }[]
}) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Intl.DateTimeFormat("de-DE", {
      month: "short",
      year: "2-digit",
    }).format(new Date(d.date)),
  }))

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-lg">Wertentwicklung</CardTitle>
        <CardDescription>Portfolio-Gesamtwert im Zeitverlauf</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart data={formatted} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(v) =>
                `${(v / 1000).toFixed(0)}k`
              }
              tickLine={false}
              axisLine={false}
              width={50}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    new Intl.NumberFormat("de-DE", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    }).format(value as number)
                  }
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-chart-1)"
              fill="var(--color-chart-1)"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
