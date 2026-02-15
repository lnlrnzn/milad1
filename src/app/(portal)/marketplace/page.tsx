import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Store } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { OfferCard } from "@/components/portal/marketplace/offer-card"

export const metadata: Metadata = {
  title: "Marktplatz",
}

export default async function MarketplacePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: offers } = await supabase
    .from("offers")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Marktplatz</h1>
        <p className="text-sm text-muted-foreground">
          Aktuelle Investment-Angebote von SDIA
        </p>
      </div>

      {!offers || offers.length === 0 ? (
        <EmptyState
          icon={Store}
          title="Keine Angebote verfügbar"
          description="Aktuell gibt es keine neuen Investment-Angebote. Schauen Sie bald wieder vorbei!"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  )
}
