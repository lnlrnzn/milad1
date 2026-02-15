import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PropertyHeader } from "@/components/portal/properties/property-header"
import { PropertyMetrics } from "@/components/portal/properties/property-metrics"
import { PropertyFinancials } from "@/components/portal/properties/property-financials"
import { PropertyTenants } from "@/components/portal/properties/property-tenants"
import { PropertyDocuments } from "@/components/portal/properties/property-documents"

export const metadata: Metadata = {
  title: "Immobilien-Detail",
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Verify ownership
  const { data: ownership } = await supabase
    .from("user_properties")
    .select("property_id")
    .eq("user_id", user.id)
    .eq("property_id", id)
    .single()

  if (!ownership) {
    notFound()
  }

  // Fetch all data in parallel
  const [
    { data: property },
    { data: financials },
    { data: valuations },
    { data: tenants },
    { data: documents },
  ] = await Promise.all([
    supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single(),
    supabase
      .from("property_financials")
      .select("*")
      .eq("property_id", id)
      .order("month", { ascending: false }),
    supabase
      .from("property_valuations")
      .select("*")
      .eq("property_id", id)
      .order("valuation_date", { ascending: false }),
    supabase
      .from("tenants")
      .select("*, leases(*)")
      .eq("property_id", id),
    supabase
      .from("documents")
      .select("id, name, file_size, created_at, document_categories(name)")
      .eq("property_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ])

  if (!property) {
    notFound()
  }

  const latestValuation = valuations?.[0]
  const currentValue = latestValuation?.market_value ?? property.purchase_price
  const latestFinancial = financials?.[0]
  const monthlyRent = latestFinancial?.rental_income ?? 0
  const netCashflow = latestFinancial?.net_income ?? 0

  const formattedTenants = (tenants ?? []).map((t) => ({
    id: t.id,
    first_name: t.first_name,
    last_name: t.last_name,
    email: t.email,
    phone: t.phone,
    leases: (t.leases as unknown as {
      status: string
      monthly_rent: number
      start_date: string
      end_date: string | null
      deposit: number | null
    }[]) ?? [],
  }))

  const formattedDocs = (documents ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    category_name: (
      d.document_categories as unknown as { name: string } | null
    )?.name ?? null,
    file_size: d.file_size,
    created_at: d.created_at,
  }))

  return (
    <div className="space-y-6">
      <PropertyHeader property={property} />
      <PropertyMetrics
        purchasePrice={property.purchase_price}
        currentValue={currentValue}
        monthlyRent={monthlyRent}
        netCashflow={netCashflow}
      />

      <Tabs defaultValue="financials">
        <TabsList>
          <TabsTrigger value="financials">Finanzen</TabsTrigger>
          <TabsTrigger value="tenants">Mieter</TabsTrigger>
          <TabsTrigger value="documents">Dokumente</TabsTrigger>
        </TabsList>
        <TabsContent value="financials" className="mt-4">
          <PropertyFinancials financials={financials ?? []} />
        </TabsContent>
        <TabsContent value="tenants" className="mt-4">
          <PropertyTenants tenants={formattedTenants} />
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <PropertyDocuments documents={formattedDocs} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
