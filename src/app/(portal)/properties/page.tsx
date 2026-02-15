import type { Metadata } from "next"
import Link from "next/link"
import { MapPin, Building2 } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/components/shared/currency-display"
import { EmptyState } from "@/components/shared/empty-state"

export const metadata: Metadata = {
  title: "Immobilien",
}

const typeLabels: Record<string, string> = {
  apartment: "Wohnung",
  house: "Haus",
  commercial: "Gewerbe",
  multi_family: "Mehrfamilienhaus",
}

const statusLabels: Record<string, string> = {
  active: "Aktiv",
  sold: "Verkauft",
  in_acquisition: "In Erwerb",
}

export default async function PropertiesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: userProperties } = await supabase
    .from("user_properties")
    .select(
      `
      property_id,
      ownership_percentage,
      properties (
        id, name, street, city, zip_code, type, status,
        purchase_price, size_sqm, rooms, year_built, image_url,
        property_valuations (market_value, valuation_date),
        property_financials (rental_income, month)
      )
    `
    )
    .eq("user_id", user.id)

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
      size_sqm: number | null
      rooms: number | null
      year_built: number | null
      image_url: string | null
      property_valuations: { market_value: number; valuation_date: string }[]
      property_financials: { rental_income: number; month: string }[]
    }

    const latestValuation = p.property_valuations
      ?.sort(
        (a, b) =>
          new Date(b.valuation_date).getTime() -
          new Date(a.valuation_date).getTime()
      )?.[0]

    const latestFinancial = p.property_financials
      ?.sort(
        (a, b) => new Date(b.month).getTime() - new Date(a.month).getTime()
      )?.[0]

    return {
      ...p,
      current_value: latestValuation?.market_value ?? p.purchase_price,
      monthly_rent: latestFinancial?.rental_income ?? 0,
      ownership_percentage: up.ownership_percentage,
    }
  })

  if (properties.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold">Immobilien</h1>
        <EmptyState
          icon={Building2}
          title="Keine Immobilien"
          description="Ihr Portfolio enthält noch keine Immobilien. Kontaktieren Sie Ihren SDIA-Berater."
          actionLabel="Kontakte anzeigen"
          actionHref="/contacts"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Immobilien</h1>
        <p className="text-sm text-muted-foreground">
          {properties.length} Objekt{properties.length !== 1 ? "e" : ""} in
          Ihrem Portfolio
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Link key={property.id} href={`/properties/${property.id}`}>
            <Card className="shadow-card transition-shadow hover:shadow-elevated h-full">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-heading font-semibold truncate">
                      {property.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {property.street}, {property.zip_code} {property.city}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {typeLabels[property.type] ?? property.type}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Marktwert</p>
                    <p className="font-heading font-semibold">
                      {formatCurrency(property.current_value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Monatl. Miete</p>
                    <p className="font-heading font-semibold">
                      {formatCurrency(property.monthly_rent)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  {property.size_sqm && <span>{property.size_sqm} m²</span>}
                  {property.rooms && <span>{property.rooms} Zimmer</span>}
                  {property.year_built && <span>Bj. {property.year_built}</span>}
                  <Badge
                    variant="outline"
                    className="ml-auto text-[10px] px-1.5"
                  >
                    {statusLabels[property.status] ?? property.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
