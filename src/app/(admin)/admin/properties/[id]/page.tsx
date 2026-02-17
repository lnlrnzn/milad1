import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/supabase/admin"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Building2, MapPin } from "lucide-react"
import { formatCurrency } from "@/components/shared/currency-display"
import { MetricCard } from "@/components/shared/metric-card"
import { Wallet, TrendingUp, Users } from "lucide-react"
import { PropertyForm } from "@/components/admin/properties/property-form"
import { ValuationForm } from "@/components/admin/properties/valuation-form"
import { FinancialsForm } from "@/components/admin/properties/financials-form"
import { AssignClientDialog } from "@/components/admin/properties/assign-client-dialog"

export const metadata: Metadata = {
  title: "Immobiliendetail - Admin",
}

const typeLabels: Record<string, string> = {
  apartment: "Wohnung",
  house: "Haus",
  multi_family: "MFH",
  commercial: "Gewerbe",
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateStr))
}

export default async function AdminPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAdmin()
  const supabase = await createClient()

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single()

  if (!property) notFound()

  // Get valuations, financials, owners, tenants in parallel
  const [
    { data: valuations },
    { data: financials },
    { data: userProperties },
    { data: tenants },
    { data: investors },
  ] = await Promise.all([
    supabase
      .from("property_valuations")
      .select("*")
      .eq("property_id", id)
      .order("valuation_date", { ascending: false }),
    supabase
      .from("property_financials")
      .select("*")
      .eq("property_id", id)
      .order("month", { ascending: false })
      .limit(12),
    supabase
      .from("user_properties")
      .select("user_id, ownership_percentage, profiles:user_id(first_name, last_name, email)")
      .eq("property_id", id),
    supabase
      .from("tenants")
      .select("*")
      .eq("property_id", id),
    // Get all investors for assignment
    supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .eq("role", "investor"),
  ])

  const latestVal = valuations?.[0]
  const latestFin = financials?.[0]
  const currentValue = latestVal?.market_value ?? property.purchase_price
  const appreciation = property.purchase_price > 0
    ? ((currentValue - property.purchase_price) / property.purchase_price) * 100
    : 0

  // Get existing owner IDs to exclude from assignment
  const ownerIds = new Set((userProperties ?? []).map((up) => up.user_id))
  const availableInvestors = (investors ?? [])
    .filter((inv) => !ownerIds.has(inv.id))
    .map((inv) => ({
      id: inv.id,
      name: [inv.first_name, inv.last_name].filter(Boolean).join(" ") || inv.id,
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/properties">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold">
              {property.name}
            </h1>
            <Badge variant="secondary">
              {typeLabels[property.type] ?? property.type}
            </Badge>
          </div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {property.street}, {property.zip_code} {property.city}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <PropertyForm property={property} />
        <ValuationForm propertyId={id} />
        <FinancialsForm propertyId={id} />
        <AssignClientDialog propertyId={id} investors={availableInvestors} />
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Kaufpreis"
          value={formatCurrency(property.purchase_price)}
          icon={Wallet}
        />
        <MetricCard
          title="Marktwert"
          value={formatCurrency(currentValue)}
          trend={appreciation}
          icon={TrendingUp}
        />
        <MetricCard
          title="Mtl. Miete"
          value={formatCurrency(latestFin?.rental_income ?? 0, true)}
          icon={Wallet}
        />
        <MetricCard
          title="Eigentümer"
          value={String(userProperties?.length ?? 0)}
          icon={Users}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Owners */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Eigentümer</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead className="text-right">Anteil</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!userProperties || userProperties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-16 text-center text-muted-foreground">
                      Noch kein Eigentümer zugewiesen.
                    </TableCell>
                  </TableRow>
                ) : (
                  userProperties.map((up) => {
                    const prof = up.profiles as unknown as {
                      first_name: string | null
                      last_name: string | null
                      email: string
                    }
                    return (
                      <TableRow key={up.user_id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/admin/clients/${up.user_id}`}
                            className="hover:underline"
                          >
                            {[prof?.first_name, prof?.last_name]
                              .filter(Boolean)
                              .join(" ") || "—"}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {prof?.email}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {up.ownership_percentage}%
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Tenants */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Mieter</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Telefon</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!tenants || tenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-16 text-center text-muted-foreground">
                      Keine Mieter vorhanden.
                    </TableCell>
                  </TableRow>
                ) : (
                  tenants.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">
                        {t.first_name} {t.last_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.email ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.phone ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Valuations History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Bewertungsverlauf
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead className="text-right">Marktwert</TableHead>
                <TableHead>Quelle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!valuations || valuations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-16 text-center text-muted-foreground">
                    Keine Bewertungen vorhanden.
                  </TableCell>
                </TableRow>
              ) : (
                valuations.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{formatDate(v.valuation_date)}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatCurrency(v.market_value)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {v.source ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Financials History */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Monatliche Finanzen
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Monat</TableHead>
                <TableHead className="text-right">Miete</TableHead>
                <TableHead className="text-right">Kreditrate</TableHead>
                <TableHead className="text-right">Nebenkosten</TableHead>
                <TableHead className="text-right">Netto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!financials || financials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-16 text-center text-muted-foreground">
                    Keine Finanzdaten vorhanden.
                  </TableCell>
                </TableRow>
              ) : (
                financials.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>{formatDate(f.month)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(f.rental_income, true)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(f.mortgage_payment, true)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(f.additional_costs, true)}
                    </TableCell>
                    <TableCell
                      className={`text-right tabular-nums font-medium ${
                        (f.net_income ?? 0) >= 0
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {formatCurrency(f.net_income ?? 0, true)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
