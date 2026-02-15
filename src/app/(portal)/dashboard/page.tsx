import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardPortfolio } from "./dashboard-portfolio"
import { DashboardRecents } from "./dashboard-recents"

export const metadata: Metadata = {
  title: "Dashboard",
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[330px] rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

function RecentsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Skeleton className="h-64 rounded-xl lg:col-span-2" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-balance">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Ihr Portfolio auf einen Blick
        </p>
      </div>

      <Suspense fallback={<PortfolioSkeleton />}>
        <DashboardPortfolio />
      </Suspense>

      <Suspense fallback={<RecentsSkeleton />}>
        <DashboardRecents />
      </Suspense>
    </div>
  )
}
