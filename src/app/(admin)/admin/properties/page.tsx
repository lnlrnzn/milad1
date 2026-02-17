import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { PropertyTable } from "@/components/admin/properties/property-table"
import { PropertyForm } from "@/components/admin/properties/property-form"

export const metadata: Metadata = {
  title: "Immobilien - Admin",
}

export default async function AdminPropertiesPage() {
  const supabase = await createClient()

  const { data: properties } = await supabase
    .from("properties")
    .select(
      `
      id, name, street, zip_code, city, type, status, purchase_price,
      property_valuations (market_value, valuation_date),
      user_properties (
        user_id,
        profiles:user_id (first_name, last_name)
      )
    `
    )
    .order("created_at", { ascending: false })

  const formatted = (properties ?? []).map((p) => {
    const vals = (
      p.property_valuations as unknown as {
        market_value: number
        valuation_date: string
      }[]
    )?.sort((a, b) => b.valuation_date.localeCompare(a.valuation_date))
    const currentValue = vals?.[0]?.market_value ?? p.purchase_price

    const owners = (
      p.user_properties as unknown as {
        user_id: string
        profiles: { first_name: string | null; last_name: string | null }
      }[]
    )?.map((up) =>
      [up.profiles?.first_name, up.profiles?.last_name]
        .filter(Boolean)
        .join(" ")
    ) ?? []

    return {
      id: p.id,
      name: p.name,
      address: `${p.street}, ${p.zip_code} ${p.city}`,
      type: p.type,
      status: p.status,
      purchase_price: p.purchase_price,
      current_value: currentValue,
      owner_names: owners.filter(Boolean) as string[],
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Immobilien</h1>
          <p className="text-sm text-muted-foreground">
            Alle Immobilien verwalten
          </p>
        </div>
        <PropertyForm />
      </div>
      <PropertyTable properties={formatted} />
    </div>
  )
}
