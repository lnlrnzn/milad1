import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ClientProfileForm } from "./client-profile-form"

const statusLabels: Record<string, string> = {
  prospect: "Interessent",
  active: "Aktiv",
  inactive: "Inaktiv",
}

const statusColors: Record<string, string> = {
  prospect: "bg-blue-100 text-blue-700",
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
}

type Props = {
  profile: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
    phone: string | null
    created_at: string
  }
  clientProfile: {
    user_id: string
    annual_salary: number | null
    equity_capital: number | null
    credit_score: string | null
    tax_class: number | null
    advisor_id: string | null
    first_consultation_date: string | null
    client_status: string
    notes: string | null
    risk_appetite: string | null
    investment_budget: number | null
    preferred_region: string | null
    preferred_property_type: string | null
    planned_property_count: number | null
    contract_type: string | null
    commission_rate: number | null
    payment_status: string | null
    contract_date: string | null
  } | null
}

export function ClientDetailHeader({ profile, clientProfile }: Props) {
  const initials = [profile.first_name?.[0], profile.last_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "U"

  const name = [profile.first_name, profile.last_name]
    .filter(Boolean)
    .join(" ") || profile.email

  const status = clientProfile?.client_status ?? "prospect"

  return (
    <Card className="shadow-card">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-xl font-bold">{name}</h2>
              <Badge
                variant="secondary"
                className={statusColors[status]}
              >
                {statusLabels[status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            {profile.phone && (
              <p className="text-sm text-muted-foreground">{profile.phone}</p>
            )}
          </div>
        </div>
        <ClientProfileForm userId={profile.id} profile={clientProfile} />
      </CardContent>
    </Card>
  )
}
