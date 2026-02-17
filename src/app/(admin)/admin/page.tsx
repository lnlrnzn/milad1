import type { Metadata } from "next"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { AdminKPIs } from "./admin-kpis"
import { AdminActivity } from "./admin-activity"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UserPlus, PlusCircle, Upload, Send } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard",
}

function KPISkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  )
}

function ActivitySkeleton() {
  return <Skeleton className="h-64 rounded-xl" />
}

const quickActions = [
  {
    label: "Kunde anlegen",
    href: "/admin/clients",
    icon: UserPlus,
  },
  {
    label: "Angebot erstellen",
    href: "/admin/marketplace",
    icon: PlusCircle,
  },
  {
    label: "Dokument hochladen",
    href: "/admin/clients",
    icon: Upload,
  },
  {
    label: "Nachricht senden",
    href: "/admin/messages",
    icon: Send,
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Überblick über Kunden, Immobilien und Aktivitäten
        </p>
      </div>

      <Suspense fallback={<KPISkeleton />}>
        <AdminKPIs />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<ActivitySkeleton />}>
          <AdminActivity />
        </Suspense>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">
              Schnellzugriff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <Button
                    variant="outline"
                    className="h-auto w-full justify-start gap-3 px-4 py-3"
                  >
                    <action.icon className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
