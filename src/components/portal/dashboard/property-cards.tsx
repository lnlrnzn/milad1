import Link from "next/link"
import { MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/components/shared/currency-display"

const typeLabels: Record<string, string> = {
  apartment: "Wohnung",
  house: "Haus",
  commercial: "Gewerbe",
  multi_family: "Mehrfamilienhaus",
}

export function PropertyCards({
  properties,
}: {
  properties: {
    id: string
    name: string
    street: string
    city: string
    type: string
    purchase_price: number
    current_value: number
    monthly_rent: number
  }[]
}) {
  return (
    <div className="space-y-3">
      <h2 className="font-heading text-lg font-semibold">Ihre Immobilien</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <Link key={property.id} href={`/properties/${property.id}`}>
            <Card className="shadow-card transition-shadow hover:shadow-elevated">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading font-semibold">
                      {property.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {property.street}, {property.city}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {typeLabels[property.type] ?? property.type}
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Marktwert</p>
                    <p className="font-heading font-semibold">
                      {formatCurrency(property.current_value)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Monatl. Miete
                    </p>
                    <p className="font-heading font-semibold">
                      {formatCurrency(property.monthly_rent)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
