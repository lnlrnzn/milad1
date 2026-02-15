import { MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const typeLabels: Record<string, string> = {
  apartment: "Wohnung",
  house: "Haus",
  commercial: "Gewerbe",
  multi_family: "Mehrfamilienhaus",
}

const statusLabels: Record<string, string> = {
  active: "Aktiv",
  sold: "Verkauft",
  in_acquisition: "In Erwerb",
}

export function PropertyHeader({
  property,
}: {
  property: {
    name: string
    street: string
    city: string
    zip_code: string
    state: string
    type: string
    status: string
  }
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">{property.name}</h1>
          <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {property.street}, {property.zip_code} {property.city},{" "}
            {property.state}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">
            {typeLabels[property.type] ?? property.type}
          </Badge>
          <Badge variant="outline">
            {statusLabels[property.status] ?? property.status}
          </Badge>
        </div>
      </div>
    </div>
  )
}
