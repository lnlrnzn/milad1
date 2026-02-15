import { Mail, Phone, User } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/components/shared/currency-display"

const statusLabels: Record<string, string> = {
  active: "Aktiv",
  expired: "Abgelaufen",
  terminated: "Gekündigt",
}

export function PropertyTenants({
  tenants,
}: {
  tenants: {
    id: string
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
    leases: {
      status: string
      monthly_rent: number
      start_date: string
      end_date: string | null
      deposit: number | null
    }[]
  }[]
}) {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-lg">Mieter</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tenants.map((tenant) => {
            const activeLease = tenant.leases?.find(
              (l) => l.status === "active"
            )
            return (
              <div
                key={tenant.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">
                      {tenant.first_name} {tenant.last_name}
                    </span>
                    {activeLease && (
                      <Badge variant="outline" className="text-xs">
                        {statusLabels[activeLease.status] ??
                          activeLease.status}
                      </Badge>
                    )}
                  </div>
                  {tenant.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {tenant.email}
                    </div>
                  )}
                  {tenant.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {tenant.phone}
                    </div>
                  )}
                </div>
                {activeLease && (
                  <div className="grid grid-cols-2 gap-3 text-sm sm:text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">Miete</p>
                      <p className="font-semibold">
                        {formatCurrency(activeLease.monthly_rent, true)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Seit</p>
                      <p className="font-semibold">
                        {new Intl.DateTimeFormat("de-DE").format(
                          new Date(activeLease.start_date)
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
