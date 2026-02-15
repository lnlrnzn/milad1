import { tool } from "ai"
import { z } from "zod/v4"
import { createClient } from "@/lib/supabase/server"

export const assistantTools = {
  property_lookup: tool({
    description:
      "Immobiliendaten des Nutzers abrufen. Liefert Informationen zu allen Immobilien oder einer bestimmten Immobilie, inklusive Bewertungen und Finanzdaten.",
    inputSchema: z.object({
      query: z
        .string()
        .optional()
        .describe(
          "Optionaler Suchbegriff (Stadtname, Straße, Name der Immobilie)"
        ),
    }),
    execute: async ({ query }) => {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { error: "Nicht authentifiziert" }

      // Get user's property IDs
      const { data: userProps } = await supabase
        .from("user_properties")
        .select("property_id, ownership_percentage, acquired_at")
        .eq("user_id", user.id)

      if (!userProps?.length) return { properties: [], message: "Keine Immobilien gefunden" }

      const propertyIds = userProps.map((up) => up.property_id)

      // Get properties with optional filter
      let propertyQuery = supabase
        .from("properties")
        .select("*")
        .in("id", propertyIds)

      if (query) {
        propertyQuery = propertyQuery.or(
          `name.ilike.%${query}%,city.ilike.%${query}%,street.ilike.%${query}%`
        )
      }

      const { data: properties } = await propertyQuery

      if (!properties?.length) return { properties: [], message: "Keine passenden Immobilien gefunden" }

      // Get latest valuations for each property
      const { data: valuations } = await supabase
        .from("property_valuations")
        .select("*")
        .in("property_id", propertyIds)
        .order("valuation_date", { ascending: false })

      // Get latest financials for each property
      const { data: financials } = await supabase
        .from("property_financials")
        .select("*")
        .in("property_id", propertyIds)
        .order("month", { ascending: false })

      return {
        properties: properties.map((p) => {
          const ownership = userProps.find((up) => up.property_id === p.id)
          const latestValuation = valuations?.find(
            (v) => v.property_id === p.id
          )
          const latestFinancial = financials?.find(
            (f) => f.property_id === p.id
          )
          return {
            id: p.id,
            name: p.name,
            type: p.type,
            address: `${p.street}, ${p.zip_code} ${p.city}`,
            purchasePrice: p.purchase_price,
            purchaseDate: p.purchase_date,
            rooms: p.rooms,
            sizeSqm: p.size_sqm,
            yearBuilt: p.year_built,
            status: p.status,
            ownershipPercentage: ownership?.ownership_percentage,
            currentValue: latestValuation?.market_value ?? null,
            valuationDate: latestValuation?.valuation_date ?? null,
            monthlyRent: latestFinancial?.rental_income ?? null,
            mortgagePayment: latestFinancial?.mortgage_payment ?? null,
            additionalCosts: latestFinancial?.additional_costs ?? null,
            netIncome: latestFinancial?.net_income ?? null,
          }
        }),
      }
    },
  }),

  financial_summary: tool({
    description:
      "Finanzielle Zusammenfassung des gesamten Portfolios berechnen: Gesamtwert, Mieteinnahmen, Kreditraten, Netto-Cashflow, Rendite.",
    inputSchema: z.object({}),
    execute: async () => {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { error: "Nicht authentifiziert" }

      const { data: userProps } = await supabase
        .from("user_properties")
        .select("property_id, ownership_percentage")
        .eq("user_id", user.id)

      if (!userProps?.length)
        return { summary: null, message: "Keine Immobilien im Portfolio" }

      const propertyIds = userProps.map((up) => up.property_id)

      // Get properties for purchase prices
      const { data: properties } = await supabase
        .from("properties")
        .select("id, name, purchase_price")
        .in("id", propertyIds)

      // Get latest valuations
      const { data: valuations } = await supabase
        .from("property_valuations")
        .select("property_id, market_value, valuation_date")
        .in("property_id", propertyIds)
        .order("valuation_date", { ascending: false })

      // Get latest financials per property (most recent month)
      const { data: financials } = await supabase
        .from("property_financials")
        .select("*")
        .in("property_id", propertyIds)
        .order("month", { ascending: false })

      // Deduplicate to get only latest per property
      type Financial = NonNullable<typeof financials>[number]
      const latestFinancials = new Map<string, Financial>()
      for (const f of financials ?? []) {
        if (!latestFinancials.has(f.property_id)) {
          latestFinancials.set(f.property_id, f)
        }
      }

      const latestValuations = new Map<string, number>()
      for (const v of valuations ?? []) {
        if (!latestValuations.has(v.property_id)) {
          latestValuations.set(v.property_id, v.market_value)
        }
      }

      const totalPurchasePrice =
        properties?.reduce((sum, p) => sum + p.purchase_price, 0) ?? 0
      const totalCurrentValue = propertyIds.reduce(
        (sum, id) =>
          sum +
          (latestValuations.get(id) ??
            properties?.find((p) => p.id === id)?.purchase_price ??
            0),
        0
      )

      let totalRent = 0
      let totalMortgage = 0
      let totalAdditionalCosts = 0
      let totalNetIncome = 0

      for (const f of latestFinancials.values()) {
        totalRent += f.rental_income
        totalMortgage += f.mortgage_payment
        totalAdditionalCosts += f.additional_costs
        totalNetIncome += f.net_income ?? 0
      }

      const appreciation = totalPurchasePrice > 0
        ? ((totalCurrentValue - totalPurchasePrice) / totalPurchasePrice) * 100
        : 0

      const grossYield = totalCurrentValue > 0
        ? ((totalRent * 12) / totalCurrentValue) * 100
        : 0

      return {
        summary: {
          propertyCount: propertyIds.length,
          totalPurchasePrice,
          totalCurrentValue,
          appreciationPercent: Math.round(appreciation * 100) / 100,
          monthlyRentalIncome: totalRent,
          monthlyMortgage: totalMortgage,
          monthlyAdditionalCosts: totalAdditionalCosts,
          monthlyNetIncome: totalNetIncome,
          annualGrossYieldPercent: Math.round(grossYield * 100) / 100,
        },
      }
    },
  }),

  document_search: tool({
    description:
      "Dokumente des Nutzers durchsuchen. Findet Dokumente nach Name oder Kategorie (z.B. Kaufvertrag, Mietvertrag, Nebenkostenabrechnung, Energieausweis).",
    inputSchema: z.object({
      query: z
        .string()
        .optional()
        .describe("Suchbegriff für Dokumentennamen"),
      category: z
        .string()
        .optional()
        .describe(
          "Dokumentenkategorie (z.B. Kaufvertrag, Mietvertrag, Nebenkostenabrechnung)"
        ),
    }),
    execute: async ({ query, category }) => {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { error: "Nicht authentifiziert" }

      let docQuery = supabase
        .from("documents")
        .select(
          "id, name, file_path, file_size, mime_type, created_at, category_id, property_id, document_categories(name, icon)"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (query) {
        docQuery = docQuery.ilike("name", `%${query}%`)
      }

      const { data: documents } = await docQuery

      let filtered = documents ?? []

      // Filter by category name if provided
      if (category && filtered.length > 0) {
        filtered = filtered.filter((d) => {
          const catName = (d.document_categories as { name: string } | null)?.name
          return catName?.toLowerCase().includes(category.toLowerCase())
        })
      }

      // Get property names for context
      const propertyIds = [
        ...new Set(filtered.filter((d) => d.property_id).map((d) => d.property_id!)),
      ]
      const { data: properties } = propertyIds.length
        ? await supabase
            .from("properties")
            .select("id, name")
            .in("id", propertyIds)
        : { data: [] }

      const propertyMap = new Map(properties?.map((p) => [p.id, p.name]) ?? [])

      return {
        documents: filtered.map((d) => ({
          id: d.id,
          name: d.name,
          category: (d.document_categories as { name: string; icon: string | null } | null)?.name ?? "Unkategorisiert",
          categoryIcon: (d.document_categories as { name: string; icon: string | null } | null)?.icon,
          property: d.property_id ? propertyMap.get(d.property_id) ?? null : null,
          fileSize: d.file_size,
          mimeType: d.mime_type,
          createdAt: d.created_at,
        })),
        totalCount: filtered.length,
      }
    },
  }),

  contact_info: tool({
    description:
      "Ansprechpartner des Nutzers nachschlagen: SDIA-Berater, Hausverwaltung, Steuerberater.",
    inputSchema: z.object({
      type: z
        .enum(["sdia_advisor", "property_manager", "tax_advisor", "other"])
        .optional()
        .describe("Art des Ansprechpartners"),
    }),
    execute: async ({ type }) => {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { error: "Nicht authentifiziert" }

      let contactQuery = supabase
        .from("contacts")
        .select("*, properties(id, name)")
        .eq("user_id", user.id)

      if (type) {
        contactQuery = contactQuery.eq("type", type)
      }

      const { data: contacts } = await contactQuery

      const typeLabels: Record<string, string> = {
        sdia_advisor: "SDIA-Berater",
        property_manager: "Hausverwaltung",
        tax_advisor: "Steuerberater",
        other: "Sonstige",
      }

      return {
        contacts: (contacts ?? []).map((c) => ({
          name: `${c.first_name} ${c.last_name}`,
          type: typeLabels[c.type] ?? c.type,
          company: c.company,
          email: c.email,
          phone: c.phone,
          property: (c.properties as { id: string; name: string } | null)?.name ?? null,
          notes: c.notes,
        })),
      }
    },
  }),

  offer_details: tool({
    description:
      "Aktuelle Investment-Angebote von SDIA anzeigen. Zeigt alle verfügbaren Immobilien-Angebote.",
    inputSchema: z.object({}),
    execute: async () => {
      const supabase = await createClient()

      const { data: offers } = await supabase
        .from("offers")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })

      return {
        offers: (offers ?? []).map((o) => ({
          id: o.id,
          title: o.title,
          type: o.type,
          address: `${o.street}, ${o.zip_code} ${o.city}`,
          price: o.price,
          sizeSqm: o.size_sqm,
          rooms: o.rooms,
          yearBuilt: o.year_built,
          expectedRent: o.expected_rent,
          expectedYield: o.expected_yield,
          description: o.description,
        })),
        totalCount: offers?.length ?? 0,
      }
    },
  }),
}
