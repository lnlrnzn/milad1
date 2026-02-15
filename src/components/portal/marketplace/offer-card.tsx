import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Maximize, DoorOpen, CalendarDays, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/components/shared/currency-display"

const typeLabels: Record<string, string> = {
  apartment: "Wohnung",
  house: "Haus",
  multi_family: "Mehrfamilienhaus",
  commercial: "Gewerbe",
}

export function OfferCard({
  offer,
}: {
  offer: {
    id: string
    title: string
    description: string | null
    street: string
    city: string
    zip_code: string
    type: string
    price: number
    size_sqm: number | null
    rooms: number | null
    year_built: number | null
    expected_rent: number | null
    expected_yield: number | null
    image_url: string | null
  }
}) {
  return (
    <Card className="shadow-card flex flex-col overflow-hidden transition-shadow hover:shadow-elevated">
      <div className="relative h-40 bg-muted">
        {offer.image_url ? (
          <img
            src={offer.image_url}
            alt={offer.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-gold-50 to-brand-gold-100">
            <MapPin className="h-10 w-10 text-brand-gold-400" />
          </div>
        )}
        <Badge className="absolute top-3 left-3">
          {typeLabels[offer.type] ?? offer.type}
        </Badge>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-lg leading-tight">
          {offer.title}
        </CardTitle>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {offer.street}, {offer.zip_code} {offer.city}
        </p>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <p className="font-heading text-2xl font-bold tabular-nums">
          {formatCurrency(offer.price)}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {offer.size_sqm != null && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Maximize className="h-3.5 w-3.5" />
              <span className="tabular-nums">{offer.size_sqm} m²</span>
            </div>
          )}
          {offer.rooms != null && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DoorOpen className="h-3.5 w-3.5" />
              <span className="tabular-nums">{offer.rooms} Zimmer</span>
            </div>
          )}
          {offer.year_built != null && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <span className="tabular-nums">Bj. {offer.year_built}</span>
            </div>
          )}
          {offer.expected_yield != null && (
            <div className="flex items-center gap-1.5 text-success font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="tabular-nums">{offer.expected_yield.toFixed(2)} % Rendite</span>
            </div>
          )}
        </div>
        {offer.expected_rent != null && (
          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Erwartete Miete</span>
            <span className="font-semibold tabular-nums">
              {formatCurrency(offer.expected_rent)} /Monat
            </span>
          </div>
        )}
        {offer.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {offer.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button className="w-full">Exposé anfordern</Button>
      </CardFooter>
    </Card>
  )
}
