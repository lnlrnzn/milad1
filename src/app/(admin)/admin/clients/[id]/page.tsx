import { Suspense } from "react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/supabase/admin"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { ClientDetailHeader } from "@/components/admin/clients/client-detail-header"
import { ClientKpis } from "@/components/admin/client-portfolio/client-kpis"
import { ClientPropertiesTable } from "@/components/admin/client-portfolio/client-properties-table"
import { ClientDocumentsTable } from "@/components/admin/client-portfolio/client-documents-table"
import { ClientDetailsTab } from "@/components/admin/client-portfolio/client-details-tab"

export const metadata: Metadata = {
  title: "Kundendetail - Admin",
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAdmin()
  const supabase = await createClient()

  // Get user profile (fast, single row by PK)
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (!profile) notFound()

  // Get extended client profile (also fast, single row)
  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("user_id", id)
    .single()

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

      {/* Portfolio KPIs + Tabs stream in together */}
      <Suspense fallback={<ClientDataSkeleton />}>
        <ClientPortfolioData userId={id} clientProfile={clientProfile} />
      </Suspense>
    </div>
  )
}

function ClientDataSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  )
}

async function ClientPortfolioData({
  userId,
  clientProfile,
}: {
  userId: string
  clientProfile: {
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
  } | null
}) {
  const supabase = await createClient()

  // Fetch properties and documents in parallel
  const [{ data: userProperties }, { data: documents }] = await Promise.all([
    supabase
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
      .eq("user_id", userId),
    supabase
      .from("documents")
      .select("id, name, file_size, mime_type, created_at, document_categories(name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ])

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
    <>
      <ClientKpis
        propertyCount={properties.length}
        totalValue={totalValue}
        totalRent={totalRent}
        totalNet={totalNet}
      />

      <Tabs defaultValue="properties">
        <TabsList>
          <TabsTrigger value="properties">Immobilien</TabsTrigger>
          <TabsTrigger value="documents">Dokumente</TabsTrigger>
          <TabsTrigger value="details">Erweiterte Daten</TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          <ClientPropertiesTable properties={properties} />
        </TabsContent>

        <TabsContent value="documents">
          <ClientDocumentsTable
            documents={documents as { id: string; name: string; file_size: number | null; created_at: string; document_categories: { name: string } | null }[] | null}
          />
        </TabsContent>

        <TabsContent value="details">
          <ClientDetailsTab clientProfile={clientProfile} />
        </TabsContent>
      </Tabs>
    </>
  )
}
