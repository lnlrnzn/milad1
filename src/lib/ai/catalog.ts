import { z } from "zod/v4"
import { schema } from "@json-render/react"

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
        "Grid aus Metrik-Karten mit Label, Wert, optionalem Format und Trend-Indikator. Ideal für Finanzkennzahlen.",
      example: {
        items: [
          { label: "Gesamtwert", value: "450.000 €", format: "currency" },
          { label: "Rendite", value: "4,2%", format: "percent", trend: "up" },
        ],
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
        "Zusammenfassungskarte einer Immobilie mit Name, Adresse, Wert und Mieteinnahmen.",
      example: {
        name: "Wohnung Mannheim",
        address: "Musterstr. 1, 68159 Mannheim",
        value: "250.000 €",
        rent: "850 €/Monat",
      },
    },
    InfoAlert: {
      props: z.object({
        type: z.enum(["info", "success", "warning"]),
        message: z.string(),
      }),
      slots: [],
      description:
        "Hinweisbox mit einem Typ (info, success, warning) und einer Nachricht.",
      example: {
        type: "info",
        message: "Alle Dokumente sind aktuell.",
      },
    },
  },
  actions: {},
})
