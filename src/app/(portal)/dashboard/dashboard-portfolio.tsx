import { createClient } from "@/lib/supabase/server"
import { PortfolioOverview } from "@/components/portal/dashboard/portfolio-overview"
import { PropertyCards } from "@/components/portal/dashboard/property-cards"
import { ValueTrendChartLazy } from "@/components/portal/dashboard/value-trend-chart-lazy"

export async function DashboardPortfolio() {
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
      properties (
        id, name, street, city, type, purchase_price,
        property_valuations (market_value, valuation_date),
        property_financials (rental_income, month)
      )
    `
    )
    .eq("user_id", user.id)

  // Process property data
  const properties = (userProperties ?? []).map((up) => {
    const p = up.properties as unknown as {
      id: string
      name: string
      street: string
      city: string
      type: string
      purchase_price: number
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
      id: p.id,
      name: p.name,
      street: p.street,
      city: p.city,
      type: p.type,
      purchase_price: p.purchase_price,
      current_value: latestValuation?.market_value ?? p.purchase_price,
      monthly_rent: latestFinancial?.rental_income ?? 0,
      valuations: p.property_valuations ?? [],
    }
  })

  // Aggregate metrics
  const totalValue = properties.reduce((sum, p) => sum + p.current_value, 0)
  const totalPurchasePrice = properties.reduce(
    (sum, p) => sum + p.purchase_price,
    0
  )
  const totalValueTrend =
    totalPurchasePrice > 0
      ? ((totalValue - totalPurchasePrice) / totalPurchasePrice) * 100
      : 0
  const monthlyRentalIncome = properties.reduce(
    (sum, p) => sum + p.monthly_rent,
    0
  )
  const averageYield =
    totalPurchasePrice > 0
      ? ((monthlyRentalIncome * 12) / totalPurchasePrice) * 100
      : 0

  // Build value trend data from all valuations
  const allValuations = properties.flatMap((p) =>
    p.valuations.map((v) => ({
      date: v.valuation_date,
      property_id: p.id,
      value: v.market_value,
    }))
  )

  const uniqueDates = [
    ...new Set(allValuations.map((v) => v.date)),
  ].sort()

  const valuationsByDate = new Map<string, number>()
  for (const date of uniqueDates) {
    let total = 0
    for (const property of properties) {
      const latestBefore = property.valuations
        .filter((v) => v.valuation_date <= date)
        .sort(
          (a, b) =>
            new Date(b.valuation_date).getTime() -
            new Date(a.valuation_date).getTime()
        )[0]
      total += latestBefore?.market_value ?? property.purchase_price
    }
    valuationsByDate.set(date, total)
  }

  const chartData = Array.from(valuationsByDate.entries()).map(
    ([date, value]) => ({ date, value })
  )

  return (
    <>
      <PortfolioOverview
        totalValue={totalValue}
        totalValueTrend={totalValueTrend}
        propertyCount={properties.length}
        monthlyRentalIncome={monthlyRentalIncome}
        averageYield={averageYield}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ValueTrendChartLazy data={chartData} />
        </div>
      </div>

      <PropertyCards properties={properties} />
    </>
  )
}
