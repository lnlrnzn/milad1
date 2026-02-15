import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { Users } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { ContactCard } from "@/components/portal/contacts/contact-card"

export const metadata: Metadata = {
  title: "Kontakte",
}

const typeLabels: Record<string, string> = {
  sdia_advisor: "SDIA-Berater",
  property_manager: "Hausverwaltung",
  tax_advisor: "Steuerberater",
  other: "Sonstige",
}

const typeOrder: Record<string, number> = {
  sdia_advisor: 0,
  tax_advisor: 1,
  property_manager: 2,
  other: 3,
}

export default async function ContactsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: contacts } = await supabase
    .from("contacts")
    .select("*, properties(name)")
    .eq("user_id", user.id)
    .order("type")

  if (!contacts || contacts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Kontakte</h1>
          <p className="text-sm text-muted-foreground">
            Ihre Ansprechpartner rund um Ihre Immobilien
          </p>
        </div>
        <EmptyState
          icon={Users}
          title="Keine Kontakte"
          description="Ihnen sind noch keine Ansprechpartner zugeordnet."
        />
      </div>
    )
  }

  // Group contacts by type
  const sorted = [...contacts].sort(
    (a, b) => (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99)
  )

  const grouped = new Map<string, typeof contacts>()
  for (const contact of sorted) {
    const group = grouped.get(contact.type) ?? []
    group.push(contact)
    grouped.set(contact.type, group)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Kontakte</h1>
        <p className="text-sm text-muted-foreground">
          Ihre Ansprechpartner rund um Ihre Immobilien
        </p>
      </div>

      {Array.from(grouped.entries()).map(([type, group]) => (
        <section key={type} className="space-y-4">
          <h2 className="font-heading text-lg font-semibold">
            {typeLabels[type] ?? type}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {group.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={{
                  ...contact,
                  property_name: (
                    contact.properties as unknown as { name: string } | null
                  )?.name ?? null,
                }}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
