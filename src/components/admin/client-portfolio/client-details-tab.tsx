import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency } from "@/components/shared/currency-display"

export interface ClientProfileData {
  annual_salary: number | null
  equity_capital: number | null
  credit_score: string | null
  tax_class: number | null
  risk_appetite: string | null
  investment_budget: number | null
  preferred_region: string | null
  preferred_property_type: string | null
  planned_property_count: number | null
  contract_type: string | null
  commission_rate: number | null
  payment_status: string | null
  notes: string | null
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value ?? "—"}</dd>
    </div>
  )
}

export function ClientDetailsTab({
  clientProfile,
}: {
  clientProfile: ClientProfileData | null
}) {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-lg">
          Erweiterte Kundendaten
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clientProfile ? (
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem
              label="Jahresgehalt"
              value={
                clientProfile.annual_salary
                  ? formatCurrency(clientProfile.annual_salary)
                  : null
              }
            />
            <DetailItem
              label="Eigenkapital"
              value={
                clientProfile.equity_capital
                  ? formatCurrency(clientProfile.equity_capital)
                  : null
              }
            />
            <DetailItem
              label="Schufa-Rating"
              value={clientProfile.credit_score}
            />
            <DetailItem
              label="Steuerklasse"
              value={
                clientProfile.tax_class
                  ? `Klasse ${clientProfile.tax_class}`
                  : null
              }
            />
            <DetailItem
              label="Risikoneigung"
              value={clientProfile.risk_appetite}
            />
            <DetailItem
              label="Investment-Budget"
              value={
                clientProfile.investment_budget
                  ? formatCurrency(clientProfile.investment_budget)
                  : null
              }
            />
            <DetailItem
              label="Wunschregion"
              value={clientProfile.preferred_region}
            />
            <DetailItem
              label="Wunsch-Objektart"
              value={clientProfile.preferred_property_type}
            />
            <DetailItem
              label="Geplante Anzahl"
              value={
                clientProfile.planned_property_count
                  ? String(clientProfile.planned_property_count)
                  : null
              }
            />
            <DetailItem
              label="Vertragsart"
              value={clientProfile.contract_type}
            />
            <DetailItem
              label="Provision"
              value={
                clientProfile.commission_rate
                  ? `${clientProfile.commission_rate}%`
                  : null
              }
            />
            <DetailItem
              label="Zahlungsstatus"
              value={clientProfile.payment_status}
            />
            {clientProfile.notes && (
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-sm text-muted-foreground">
                  Interne Notizen
                </dt>
                <dd className="mt-1 text-sm whitespace-pre-wrap">
                  {clientProfile.notes}
                </dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">
            Noch keine erweiterten Daten vorhanden. Verwenden Sie
            &quot;Profil bearbeiten&quot; um Daten hinzuzufügen.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
