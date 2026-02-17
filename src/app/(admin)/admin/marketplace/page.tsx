import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Store } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { AdminOfferCard } from "@/components/admin/marketplace/admin-offer-card"
import { OfferForm } from "@/components/admin/marketplace/offer-form"

export const metadata: Metadata = {
  title: "Marktplatz - Admin",
}

export default async function AdminMarketplacePage() {
  const supabase = await createClient()

  const { data: offers } = await supabase
    .from("offers")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Marktplatz</h1>
          <p className="text-sm text-muted-foreground">
            Investment-Angebote verwalten
          </p>
        </div>
        <OfferForm />
      </div>

      {!offers || offers.length === 0 ? (
        <EmptyState
          icon={Store}
          title="Keine Angebote"
          description="Erstellen Sie Ihr erstes Investment-Angebot."
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer) => (
            <AdminOfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  )
}
