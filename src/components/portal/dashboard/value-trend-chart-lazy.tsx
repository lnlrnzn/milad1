"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"

export const ValueTrendChartLazy = dynamic(
  () =>
    import("@/components/portal/dashboard/value-trend-chart").then((m) => ({
      default: m.ValueTrendChart,
    })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[330px] w-full rounded-xl" />,
  }
)
