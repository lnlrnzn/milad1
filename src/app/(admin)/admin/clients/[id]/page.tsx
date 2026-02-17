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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ArrowLeft, Building2, FileText, Wallet } from "lucide-react"
import { formatCurrency } from "@/components/shared/currency-display"
import { MetricCard } from "@/components/shared/metric-card"
import { ClientDetailHeader } from "@/components/admin/clients/client-detail-header"

export const metadata: Metadata = {
  title: "Kundendetail - Admin",
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

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAdmin()
  const supabase = await createClient()

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (!profile) notFound()

  // Get extended client profile
  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("user_id", id)
    .single()

  // Get user's properties
  const { data: userProperties } = await supabase
    .from("user_properties")
    .select(
      `
      property_id, ownership_percentage, acquired_at,
      properties (
        id, name, street, city, zip_code, type, status, purchase_price,
        property_valuations (market_value, valuation_date),
        property_financials (rental_income, mortgage_payment, net_income, month)
      )
    `
    )
    .eq("user_id", id)

  // Get user's documents
  const { data: documents } = await supabase
    .from("documents")
    .select("id, name, file_size, mime_type, created_at, document_categories(name)")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(20)

  // Process properties
  const properties = (userProperties ?? []).map((up) => {
    const p = up.properties as unknown as {
      id: string
      name: string
      street: string
      city: string
      zip_code: string
      type: string
      status: string
      purchase_price: number
      property_valuations: { market_value: number; valuation_date: string }[]
      property_financials: {
        rental_income: number
        mortgage_payment: number
        net_income: number | null
        month: string
      }[]
    }
    const latestVal = p.property_valuations
      ?.sort((a, b) => b.valuation_date.localeCompare(a.valuation_date))?.[0]
    const latestFin = p.property_financials
      ?.sort((a, b) => b.month.localeCompare(a.month))?.[0]
    return {
      id: p.id,
      name: p.name,
      address: `${p.street}, ${p.zip_code} ${p.city}`,
      type: p.type,
      status: p.status,
      purchase_price: p.purchase_price,
      current_value: latestVal?.market_value ?? p.purchase_price,
      monthly_rent: latestFin?.rental_income ?? 0,
      net_income: latestFin?.net_income ?? 0,
    }
  })

  const totalValue = properties.reduce((s, p) => s + p.current_value, 0)
  const totalRent = properties.reduce((s, p) => s + p.monthly_rent, 0)
  const totalNet = properties.reduce((s, p) => s + p.net_income, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/clients">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold">Kundendetail</h1>
        </div>
      </div>

      <ClientDetailHeader profile={profile} clientProfile={clientProfile} />

      {/* Portfolio KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Immobilien"
          value={String(properties.length)}
          icon={Building2}
        />
        <MetricCard
          title="Portfolio-Wert"
          value={formatCurrency(totalValue)}
          icon={Wallet}
        />
        <MetricCard
          title="Mtl. Mieteinnahmen"
          value={formatCurrency(totalRent, true)}
          icon={Wallet}
        />
        <MetricCard
          title="Mtl. Netto-Cashflow"
          value={formatCurrency(totalNet, true)}
          icon={Wallet}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="properties">
        <TabsList>
          <TabsTrigger value="properties">Immobilien</TabsTrigger>
          <TabsTrigger value="documents">Dokumente</TabsTrigger>
          <TabsTrigger value="details">Erweiterte Daten</TabsTrigger>
        </TabsList>

        {/* Properties Tab */}
        <TabsContent value="properties">
          <Card className="shadow-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead className="text-right">Kaufpreis</TableHead>
                    <TableHead className="text-right">Marktwert</TableHead>
                    <TableHead className="text-right">Miete/Mo.</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Keine Immobilien zugewiesen.
                      </TableCell>
                    </TableRow>
                  ) : (
                    properties.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.address}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {typeLabels[p.type] ?? p.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(p.purchase_price)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(p.current_value)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(p.monthly_rent, true)}
                        </TableCell>
                        <TableCell>
                          <Link href={`/admin/properties/${p.id}`}>
                            <Button variant="ghost" size="sm">
                              Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card className="shadow-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead className="text-right">Größe</TableHead>
                    <TableHead>Hochgeladen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!documents || documents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        Keine Dokumente vorhanden.
                      </TableCell>
                    </TableRow>
                  ) : (
                    documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {doc.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {(doc.document_categories as { name: string } | null)?.name ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">
                          {doc.file_size
                            ? `${(doc.file_size / 1024).toFixed(0)} KB`
                            : "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(doc.created_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Extended Details Tab */}
        <TabsContent value="details">
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
        </TabsContent>
      </Tabs>
    </div>
  )
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
