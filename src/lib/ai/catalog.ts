import { z } from "zod/v4"
import { schema } from "@json-render/react/schema"

export const assistantCatalog = schema.createCatalog({
  components: {
    MetricGrid: {
      props: z.object({
        items: z.array(
          z.object({
            label: z.string(),
            value: z.string(),
            format: z
              .enum(["currency", "percent", "number", "text"])
              .optional(),
            trend: z.enum(["up", "down", "neutral"]).optional(),
          })
        ),
      }),
      slots: [],
      description:
        "Grid aus Metrik-Karten mit Label, Wert, optionalem Format und Trend-Indikator. Ideal für Finanzkennzahlen und Portfolio-Übersichten.",
      example: {
        items: [
          { label: "Gesamtwert", value: "450.000 €", format: "currency" },
          { label: "Rendite", value: "4,2%", format: "percent", trend: "up" },
        ],
      },
    },

    PropertyCard: {
      props: z.object({
        name: z.string(),
        address: z.string(),
        type: z.string().optional(),
        status: z.string().optional(),
        purchasePrice: z.string().optional(),
        currentValue: z.string().optional(),
        rent: z.string().optional(),
        cashflow: z.string().optional(),
        cashflowPositive: z.boolean().optional(),
      }),
      slots: [],
      description:
        "Detaillierte Immobilien-Karte mit Kaufpreis, Marktwert, Miete und Netto-Cashflow. Verwende diese Komponente für property_lookup Ergebnisse.",
      example: {
        name: "Wohnung Mannheim",
        address: "Musterstr. 1, 68159 Mannheim",
        type: "Eigentumswohnung",
        purchasePrice: "200.000 €",
        currentValue: "250.000 €",
        rent: "850 €/Mo.",
        cashflow: "+120 €/Mo.",
        cashflowPositive: true,
      },
    },

    PropertySummary: {
      props: z.object({
        name: z.string(),
        address: z.string(),
        value: z.string().optional(),
        rent: z.string().optional(),
        type: z.string().optional(),
        status: z.string().optional(),
      }),
      slots: [],
      description:
        "Kompakte Zusammenfassungskarte einer Immobilie. Verwende PropertyCard für detailliertere Darstellungen.",
      example: {
        name: "Wohnung Mannheim",
        address: "Musterstr. 1, 68159 Mannheim",
        value: "250.000 €",
        rent: "850 €/Monat",
      },
    },

    DocumentList: {
      props: z.object({
        items: z.array(
          z.object({
            name: z.string(),
            category: z.string(),
            property: z.string().optional(),
            date: z.string().optional(),
          })
        ),
        totalCount: z.number().optional(),
      }),
      slots: [],
      description:
        "Liste von Dokumenten mit Kategorie-Badges und optionalem Immobilien-Bezug. Verwende für document_search Ergebnisse.",
      example: {
        items: [
          { name: "Kaufvertrag_Mannheim.pdf", category: "Kaufvertrag", property: "Wohnung Mannheim", date: "15.03.2024" },
          { name: "Mietvertrag_2024.pdf", category: "Mietvertrag" },
        ],
        totalCount: 5,
      },
    },

    ContactCard: {
      props: z.object({
        name: z.string(),
        type: z.string(),
        company: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        property: z.string().optional(),
      }),
      slots: [],
      description:
        "Ansprechpartner-Karte mit Kontaktdaten. Verwende für contact_info Ergebnisse.",
      example: {
        name: "Max Mustermann",
        type: "SDIA-Berater",
        company: "SDIA GmbH",
        email: "max@sdia.de",
        phone: "+49 621 12345",
      },
    },

    OfferCard: {
      props: z.object({
        title: z.string(),
        address: z.string(),
        price: z.string(),
        expectedRent: z.string().optional(),
        expectedYield: z.string().optional(),
        rooms: z.number().optional(),
        sizeSqm: z.number().optional(),
      }),
      slots: [],
      description:
        "Investment-Angebotskarte mit Preis, erwarteter Miete und Rendite. Verwende für offer_details Ergebnisse.",
      example: {
        title: "Neubau-Wohnung Leipzig",
        address: "Hauptstr. 42, 04109 Leipzig",
        price: "180.000 €",
        expectedRent: "750 €/Mo.",
        expectedYield: "5,0%",
        rooms: 3,
        sizeSqm: 75,
      },
    },

    AlertMessage: {
      props: z.object({
        type: z.enum(["info", "success", "warning", "error"]),
        title: z.string().optional(),
        message: z.string(),
      }),
      slots: [],
      description:
        "Statusmeldung und Hinweisbox. Typen: info (blau), success (grün), warning (gelb), error (rot). Optional mit Titel für Aktions-Ergebnisse.",
      example: {
        type: "success",
        title: "PDF erfolgreich erstellt",
        message: "Der Portfolio-Bericht wurde gespeichert.",
      },
    },
  },
  actions: {},
})
