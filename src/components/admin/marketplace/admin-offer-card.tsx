"use client"

import { useTransition } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Maximize, DoorOpen, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/components/shared/currency-display"
import { OfferForm } from "./offer-form"
import { updateOfferStatus } from "@/app/(admin)/admin/marketplace/actions"

const typeLabels: Record<string, string> = {
  apartment: "Wohnung",
  house: "Haus",
  multi_family: "MFH",
  commercial: "Gewerbe",
}

const statusLabels: Record<string, string> = {
  active: "Aktiv",
  reserved: "Reserviert",
  sold: "Verkauft",
  withdrawn: "Zurückgezogen",
}

const statusColors: Record<string, string> = {
  active: "bg-[oklch(0.55_0.08_75/0.12)] text-[oklch(0.42_0.08_75)]",
  reserved: "bg-[oklch(0.75_0.1_75/0.15)] text-[oklch(0.45_0.1_75)]",
  sold: "bg-muted text-muted-foreground",
  withdrawn: "bg-destructive/10 text-destructive",
}

type Offer = {
  id: string
  title: string
  description: string | null
  street: string
  city: string
  zip_code: string
  type: string
  status: string
  price: number
  size_sqm: number | null
  rooms: number | null
  year_built: number | null
  expected_rent: number | null
  expected_yield: number | null
  image_url: string | null
}

export function AdminOfferCard({ offer }: { offer: Offer }) {
  const [pending, startTransition] = useTransition()

  function toggleStatus() {
    const newStatus = offer.status === "active" ? "withdrawn" : "active"
    startTransition(async () => { await updateOfferStatus(offer.id, newStatus) })
  }

  return (
    <Card className="shadow-card flex flex-col overflow-hidden">
      <div className="relative h-32 bg-muted">
        {offer.image_url ? (
          <img
            src={offer.image_url}
            alt={offer.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          <Badge variant="secondary">
            {typeLabels[offer.type] ?? offer.type}
          </Badge>
          <Badge
            variant="secondary"
            className={statusColors[offer.status]}
          >
            {statusLabels[offer.status] ?? offer.status}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base leading-tight">
          {offer.title}
        </CardTitle>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {offer.street}, {offer.zip_code} {offer.city}
        </p>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        <p className="font-heading text-xl font-bold tabular-nums">
          {formatCurrency(offer.price)}
        </p>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {offer.size_sqm != null && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Maximize className="h-3 w-3" />
              {offer.size_sqm} m²
            </div>
          )}
          {offer.rooms != null && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <DoorOpen className="h-3 w-3" />
              {offer.rooms} Zimmer
            </div>
          )}
          {offer.expected_yield != null && (
            <div className="flex items-center gap-1 text-success font-medium">
              <TrendingUp className="h-3 w-3" />
              {offer.expected_yield.toFixed(2)}% Rendite
            </div>
          )}
        </div>
      </CardContent>
      <div className="flex gap-2 border-t p-3">
        <OfferForm offer={offer} />
        <Button
          variant="outline"
          size="sm"
          onClick={toggleStatus}
          disabled={pending}
          className="flex-1"
        >
          {offer.status === "active" ? "Deaktivieren" : "Aktivieren"}
        </Button>
      </div>
    </Card>
  )
}
