import { tool } from "ai"
import { z } from "zod/v4"
import { createClient } from "@/lib/supabase/server"

export const adminTools = {
  client_lookup: tool({
    description:
      "Alle Kunden suchen und listen. Liefert Profildaten, erweiterte Kundendaten und Portfolio-Informationen.",
    inputSchema: z.object({
      query: z
        .string()
        .optional()
        .describe("Suchbegriff (Name, E-Mail, Stadt)"),
      status: z
        .enum(["prospect", "active", "inactive"])
        .optional()
        .describe("Nach Kundenstatus filtern"),
    }),
    execute: async ({ query, status }) => {
      const supabase = await createClient()

      let profileQuery = supabase
        .from("profiles")
        .select("id, first_name, last_name, email, phone, created_at")
        .eq("role", "investor")

      if (query) {
        profileQuery = profileQuery.or(
          `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`
        )
      }

      const { data: profiles } = await profileQuery

      if (!profiles?.length) return { clients: [], message: "Keine Kunden gefunden" }

      const userIds = profiles.map((p) => p.id)

      const { data: clientProfiles } = await supabase
        .from("client_profiles")
        .select("*")
        .in("user_id", userIds)

      const cpMap = new Map(
        (clientProfiles ?? []).map((cp) => [cp.user_id, cp])
      )

      const { data: userProps } = await supabase
        .from("user_properties")
        .select("user_id")
        .in("user_id", userIds)

      const propCounts = new Map<string, number>()
      for (const up of userProps ?? []) {
        propCounts.set(up.user_id, (propCounts.get(up.user_id) ?? 0) + 1)
      }

      let clients = profiles.map((p) => {
        const cp = cpMap.get(p.id)
        return {
          id: p.id,
          name: [p.first_name, p.last_name].filter(Boolean).join(" ") || p.email,
          email: p.email,
          phone: p.phone,
          status: cp?.client_status ?? "prospect",
          annualSalary: cp?.annual_salary,
          creditScore: cp?.credit_score,
          investmentBudget: cp?.investment_budget,
          riskAppetite: cp?.risk_appetite,
          propertyCount: propCounts.get(p.id) ?? 0,
          registeredAt: p.created_at,
        }
      })

      if (status) {
        clients = clients.filter((c) => c.status === status)
      }

      return { clients, totalCount: clients.length }
    },
  }),

  property_lookup_all: tool({
    description:
      "Alle Immobilien im System durchsuchen (ohne User-Scoping). Liefert Stammdaten, Bewertungen und Eigentümer.",
    inputSchema: z.object({
      query: z.string().optional().describe("Suchbegriff (Name, Stadt, Straße)"),
      status: z.enum(["active", "sold", "in_acquisition"]).optional(),
    }),
    execute: async ({ query, status }) => {
      const supabase = await createClient()

      let propQuery = supabase
        .from("properties")
        .select(
          "*, property_valuations(market_value, valuation_date), user_properties(user_id, profiles:user_id(first_name, last_name))"
        )

      if (query) {
        propQuery = propQuery.or(
          `name.ilike.%${query}%,city.ilike.%${query}%,street.ilike.%${query}%`
        )
      }
      if (status) {
        propQuery = propQuery.eq("status", status)
      }

      const { data: properties } = await propQuery.order("created_at", { ascending: false })

      return {
        properties: (properties ?? []).map((p) => {
          const vals = (p.property_valuations as unknown as { market_value: number; valuation_date: string }[])
            ?.sort((a, b) => b.valuation_date.localeCompare(a.valuation_date))
          const owners = (p.user_properties as unknown as { user_id: string; profiles: { first_name: string | null; last_name: string | null } }[])
            ?.map((up) => [up.profiles?.first_name, up.profiles?.last_name].filter(Boolean).join(" "))
            .filter(Boolean)

          return {
            id: p.id,
            name: p.name,
            address: `${p.street}, ${p.zip_code} ${p.city}`,
            type: p.type,
            status: p.status,
            purchasePrice: p.purchase_price,
            currentValue: vals?.[0]?.market_value ?? p.purchase_price,
            rooms: p.rooms,
            sizeSqm: p.size_sqm,
            yearBuilt: p.year_built,
            owners: owners ?? [],
          }
        }),
        totalCount: properties?.length ?? 0,
      }
    },
  }),

  financial_overview: tool({
    description:
      "Unternehmensweite Finanzkennzahlen: Gesamt-Portfoliowert, Mieteinnahmen, Kreditraten, Rendite über alle Immobilien.",
    inputSchema: z.object({}),
    execute: async () => {
      const supabase = await createClient()

      const [{ data: properties }, { data: valuations }, { data: financials }] =
        await Promise.all([
          supabase.from("properties").select("id, purchase_price").eq("status", "active"),
          supabase
            .from("property_valuations")
            .select("property_id, market_value, valuation_date")
            .order("valuation_date", { ascending: false }),
          supabase
            .from("property_financials")
            .select("*")
            .order("month", { ascending: false }),
        ])

      const latestValuations = new Map<string, number>()
      for (const v of valuations ?? []) {
        if (!latestValuations.has(v.property_id)) {
          latestValuations.set(v.property_id, v.market_value)
        }
      }

      type Financial = NonNullable<typeof financials>[number]
      const latestFinancials = new Map<string, Financial>()
      for (const f of financials ?? []) {
        if (!latestFinancials.has(f.property_id)) {
          latestFinancials.set(f.property_id, f)
        }
      }

      const totalPurchasePrice = (properties ?? []).reduce((s, p) => s + p.purchase_price, 0)
      const totalCurrentValue = (properties ?? []).reduce(
        (s, p) => s + (latestValuations.get(p.id) ?? p.purchase_price),
        0
      )

      let totalRent = 0, totalMortgage = 0, totalNet = 0
      for (const f of latestFinancials.values()) {
        totalRent += f.rental_income
        totalMortgage += f.mortgage_payment
        totalNet += f.net_income ?? 0
      }

      return {
        overview: {
          propertyCount: properties?.length ?? 0,
          totalPurchasePrice,
          totalCurrentValue,
          appreciationPercent: totalPurchasePrice > 0
            ? Math.round(((totalCurrentValue - totalPurchasePrice) / totalPurchasePrice) * 10000) / 100
            : 0,
          monthlyRentalIncome: totalRent,
          monthlyMortgagePayments: totalMortgage,
          monthlyNetIncome: totalNet,
          grossYieldPercent: totalCurrentValue > 0
            ? Math.round(((totalRent * 12) / totalCurrentValue) * 10000) / 100
            : 0,
        },
      }
    },
  }),

  document_search_all: tool({
    description: "Dokumente über alle Kunden hinweg durchsuchen.",
    inputSchema: z.object({
      query: z.string().optional().describe("Suchbegriff"),
      userId: z.string().optional().describe("Auf bestimmten Kunden filtern"),
    }),
    execute: async ({ query, userId }) => {
      const supabase = await createClient()

      let docQuery = supabase
        .from("documents")
        .select("id, name, file_size, created_at, user_id, document_categories(name), profiles:user_id(first_name, last_name)")
        .order("created_at", { ascending: false })
        .limit(20)

      if (query) {
        docQuery = docQuery.ilike("name", `%${query}%`)
      }
      if (userId) {
        docQuery = docQuery.eq("user_id", userId)
      }

      const { data: documents } = await docQuery

      return {
        documents: (documents ?? []).map((d) => ({
          id: d.id,
          name: d.name,
          category: (d.document_categories as { name: string } | null)?.name ?? "Unkategorisiert",
          owner: [
            (d.profiles as unknown as { first_name: string | null; last_name: string | null })?.first_name,
            (d.profiles as unknown as { first_name: string | null; last_name: string | null })?.last_name,
          ].filter(Boolean).join(" ") || "Unbekannt",
          fileSize: d.file_size,
          createdAt: d.created_at,
        })),
        totalCount: documents?.length ?? 0,
      }
    },
  }),

  offer_management: tool({
    description: "Alle Angebote einsehen, nach Status filtern.",
    inputSchema: z.object({
      status: z.enum(["active", "reserved", "sold", "withdrawn"]).optional(),
    }),
    execute: async ({ status }) => {
      const supabase = await createClient()

      let query = supabase
        .from("offers")
        .select("*")
        .order("created_at", { ascending: false })

      if (status) {
        query = query.eq("status", status)
      }

      const { data: offers } = await query

      return {
        offers: (offers ?? []).map((o) => ({
          id: o.id,
          title: o.title,
          address: `${o.street}, ${o.zip_code} ${o.city}`,
          type: o.type,
          status: o.status,
          price: o.price,
          expectedRent: o.expected_rent,
          expectedYield: o.expected_yield,
          sizeSqm: o.size_sqm,
          rooms: o.rooms,
        })),
        totalCount: offers?.length ?? 0,
      }
    },
  }),

  client_portfolio: tool({
    description: "Detailliertes Portfolio eines bestimmten Kunden abrufen.",
    inputSchema: z.object({
      userId: z.string().describe("User-ID des Kunden"),
    }),
    execute: async ({ userId }) => {
      const supabase = await createClient()

      const [{ data: profile }, { data: userProps }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase
          .from("user_properties")
          .select(
            "property_id, properties(id, name, street, city, purchase_price, type, property_valuations(market_value, valuation_date), property_financials(rental_income, mortgage_payment, net_income, month))"
          )
          .eq("user_id", userId),
      ])

      if (!profile) return { error: "Kunde nicht gefunden" }

      const properties = (userProps ?? []).map((up) => {
        const p = up.properties as unknown as {
          id: string; name: string; street: string; city: string; purchase_price: number; type: string
          property_valuations: { market_value: number; valuation_date: string }[]
          property_financials: { rental_income: number; mortgage_payment: number; net_income: number | null; month: string }[]
        }
        const latestVal = p.property_valuations?.sort((a, b) => b.valuation_date.localeCompare(a.valuation_date))?.[0]
        const latestFin = p.property_financials?.sort((a, b) => b.month.localeCompare(a.month))?.[0]
        return {
          name: p.name,
          address: `${p.street}, ${p.city}`,
          type: p.type,
          purchasePrice: p.purchase_price,
          currentValue: latestVal?.market_value ?? p.purchase_price,
          monthlyRent: latestFin?.rental_income ?? 0,
          netIncome: latestFin?.net_income ?? 0,
        }
      })

      return {
        client: {
          name: [profile.first_name, profile.last_name].filter(Boolean).join(" "),
          email: profile.email,
        },
        properties,
        summary: {
          totalValue: properties.reduce((s, p) => s + p.currentValue, 0),
          totalRent: properties.reduce((s, p) => s + p.monthlyRent, 0),
          totalNet: properties.reduce((s, p) => s + p.netIncome, 0),
          propertyCount: properties.length,
        },
      }
    },
  }),

  compose_email_draft: tool({
    description:
      "E-Mail-Entwurf generieren. Gibt Betreff und Text zurück, die der Admin dann prüfen und senden kann.",
    inputSchema: z.object({
      recipientName: z.string().describe("Name des Empfängers"),
      topic: z.string().describe("Thema der E-Mail"),
      tone: z
        .enum(["formal", "friendly"])
        .optional()
        .describe("Tonalität"),
    }),
    execute: async ({ recipientName, topic, tone }) => {
      return {
        draft: {
          subject: `SDIA: ${topic}`,
          body: `Sehr ${tone === "friendly" ? "liebe/r" : "geehrte/r"} ${recipientName},\n\n[Hier den Inhalt zu "${topic}" verfassen]\n\nMit freundlichen Grüßen\nIhr SDIA Team`,
          note: "Bitte passen Sie den Entwurf an und senden Sie ihn über den E-Mail-Dialog.",
        },
      }
    },
  }),

  activity_log: tool({
    description: "Letzte Admin-Aktivitäten abfragen.",
    inputSchema: z.object({
      limit: z.number().optional().default(10).describe("Anzahl der Einträge"),
    }),
    execute: async ({ limit }) => {
      const supabase = await createClient()

      const { data: activities } = await supabase
        .from("admin_activity_log")
        .select("*, profiles!admin_activity_log_admin_id_fkey(first_name, last_name)")
        .order("created_at", { ascending: false })
        .limit(limit)

      return {
        activities: (activities ?? []).map((a) => {
          const admin = a.profiles as unknown as { first_name: string | null; last_name: string | null } | null
          return {
            action: a.action,
            entityType: a.entity_type,
            entityId: a.entity_id,
            admin: [admin?.first_name, admin?.last_name].filter(Boolean).join(" ") || "Admin",
            timestamp: a.created_at,
            details: a.details,
          }
        }),
      }
    },
  }),

  // ── Action Tools ──────────────────────────────────────────────────

  send_email: tool({
    description:
      "Sendet eine echte E-Mail an einen Kunden. Erfordert Name, E-Mail-Adresse, Betreff und Inhalt. Nutze dieses Tool erst NACHDEM du dem Admin eine Vorschau gezeigt und er zugestimmt hat.",
    needsApproval: true,
    inputSchema: z.object({
      recipientEmail: z.string().describe("E-Mail-Adresse des Empfängers"),
      recipientName: z.string().describe("Name des Empfängers"),
      subject: z.string().describe("Betreff der E-Mail"),
      body: z.string().describe("Vollständiger E-Mail-Text (mit Anrede und Grußformel)"),
    }),
    execute: async ({ recipientEmail, recipientName, subject, body }) => {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: "Nicht authentifiziert" }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ to: recipientEmail, subject, body }),
          }
        )

        if (!res.ok) {
          const text = await res.text()
          return { success: false, error: `E-Mail-Versand fehlgeschlagen: ${text}` }
        }

        // Log activity
        await supabase.from("admin_activity_log").insert({
          admin_id: user.id,
          action: "email.sent",
          entity_type: "profile",
          details: { recipientEmail, recipientName, subject },
        })

        return {
          success: true,
          message: `E-Mail "${subject}" wurde erfolgreich an ${recipientName} (${recipientEmail}) gesendet.`,
        }
      } catch (err) {
        return { success: false, error: `Fehler beim Senden: ${err instanceof Error ? err.message : "Unbekannter Fehler"}` }
      }
    },
  }),

  send_notification: tool({
    description:
      "Erstellt eine In-App-Benachrichtigung für einen oder mehrere Kunden. Der Kunde sieht die Benachrichtigung im Portal.",
    needsApproval: true,
    inputSchema: z.object({
      userIds: z.array(z.string()).describe("User-IDs der Empfänger"),
      title: z.string().describe("Titel der Benachrichtigung"),
      message: z.string().describe("Nachrichtentext"),
      type: z
        .enum(["info", "warning", "success", "document", "offer", "message"])
        .optional()
        .default("info")
        .describe("Art der Benachrichtigung"),
      link: z.string().optional().describe("Optionaler Link im Portal (z.B. /marketplace)"),
    }),
    execute: async ({ userIds, title, message, type, link }) => {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: "Nicht authentifiziert" }

      const rows = userIds.map((uid) => ({
        user_id: uid,
        type: type ?? "info",
        title,
        message,
        link: link ?? null,
      }))

      const { error, count } = await supabase
        .from("notifications")
        .insert(rows, { count: "exact" })

      if (error) return { success: false, error: error.message }

      await supabase.from("admin_activity_log").insert({
        admin_id: user.id,
        action: "notification.sent",
        entity_type: "notification",
        details: { title, recipientCount: userIds.length, type },
      })

      return {
        success: true,
        message: `Benachrichtigung "${title}" wurde an ${count ?? userIds.length} Kunden gesendet.`,
      }
    },
  }),

  send_message: tool({
    description:
      "Erstellt eine neue Nachricht/Konversation im Portal für einen Kunden. Erscheint im Nachrichten-Bereich des Kunden.",
    needsApproval: true,
    inputSchema: z.object({
      userId: z.string().describe("User-ID des Kunden"),
      subject: z.string().describe("Betreff der Konversation"),
      content: z.string().describe("Nachrichteninhalt"),
    }),
    execute: async ({ userId, subject, content }) => {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: "Nicht authentifiziert" }

      // Get admin name
      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single()
      const adminName = [adminProfile?.first_name, adminProfile?.last_name]
        .filter(Boolean)
        .join(" ") || "SDIA Team"

      // Create conversation
      const { data: conv, error: convError } = await supabase
        .from("conversations")
        .insert({ user_id: userId, subject })
        .select("id")
        .single()

      if (convError || !conv) {
        return { success: false, error: convError?.message ?? "Konversation konnte nicht erstellt werden" }
      }

      // Create message
      const { error: msgError } = await supabase.from("messages").insert({
        conversation_id: conv.id,
        sender_type: "advisor",
        sender_name: adminName,
        content,
      })

      if (msgError) return { success: false, error: msgError.message }

      // Create notification for user
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "message",
        title: "Neue Nachricht von SDIA",
        message: subject,
        link: "/messages",
      })

      await supabase.from("admin_activity_log").insert({
        admin_id: user.id,
        action: "message.sent",
        entity_type: "conversation",
        entity_id: conv.id,
        details: { subject, userId },
      })

      return {
        success: true,
        message: `Nachricht "${subject}" wurde an den Kunden gesendet.`,
        conversationId: conv.id,
      }
    },
  }),

  update_client_status: tool({
    description:
      "Ändert den Status eines Kunden (prospect → active → inactive). Nutze dieses Tool nach Rücksprache mit dem Admin.",
    needsApproval: true,
    inputSchema: z.object({
      userId: z.string().describe("User-ID des Kunden"),
      newStatus: z.enum(["prospect", "active", "inactive"]).describe("Neuer Status"),
      reason: z.string().optional().describe("Begründung für die Statusänderung"),
    }),
    execute: async ({ userId, newStatus, reason }) => {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: "Nicht authentifiziert" }

      // Get current status
      const { data: current } = await supabase
        .from("client_profiles")
        .select("client_status")
        .eq("user_id", userId)
        .single()

      const oldStatus = current?.client_status ?? "prospect"

      const { error } = await supabase
        .from("client_profiles")
        .update({ client_status: newStatus })
        .eq("user_id", userId)

      if (error) return { success: false, error: error.message }

      await supabase.from("admin_activity_log").insert({
        admin_id: user.id,
        action: "client.status_changed",
        entity_type: "profile",
        entity_id: userId,
        details: { oldStatus, newStatus, reason },
      })

      const statusLabels: Record<string, string> = {
        prospect: "Interessent",
        active: "Aktiv",
        inactive: "Inaktiv",
      }

      return {
        success: true,
        message: `Kundenstatus wurde von "${statusLabels[oldStatus]}" auf "${statusLabels[newStatus]}" geändert.`,
      }
    },
  }),

  create_task_note: tool({
    description:
      "Erstellt eine Admin-Notiz oder Aufgabe zu einem Kunden/einer Immobilie im Aktivitätsprotokoll.",
    needsApproval: true,
    inputSchema: z.object({
      entityType: z.enum(["profile", "property", "offer"]).describe("Typ des betroffenen Objekts"),
      entityId: z.string().optional().describe("ID des betroffenen Objekts"),
      note: z.string().describe("Inhalt der Notiz/Aufgabe"),
    }),
    execute: async ({ entityType, entityId, note }) => {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: "Nicht authentifiziert" }

      const { error } = await supabase.from("admin_activity_log").insert({
        admin_id: user.id,
        action: "note.created",
        entity_type: entityType,
        entity_id: entityId ?? null,
        details: { note },
      })

      if (error) return { success: false, error: error.message }

      return {
        success: true,
        message: `Notiz wurde erstellt: "${note.substring(0, 80)}${note.length > 80 ? "..." : ""}"`,
      }
    },
  }),
}
