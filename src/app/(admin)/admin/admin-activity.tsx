import { createClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"

const actionLabels: Record<string, string> = {
  "client.updated": "Kundendaten aktualisiert",
  "client.status_changed": "Kundenstatus geändert",
  "property.created": "Immobilie erstellt",
  "property.updated": "Immobilie aktualisiert",
  "property.assigned": "Immobilie zugewiesen",
  "valuation.added": "Bewertung hinzugefügt",
  "financials.updated": "Finanzdaten aktualisiert",
  "offer.created": "Angebot erstellt",
  "offer.updated": "Angebot aktualisiert",
  "offer.status_changed": "Angebotsstatus geändert",
  "message.sent": "Nachricht gesendet",
  "document.uploaded": "Dokument hochgeladen",
  "email.sent": "E-Mail gesendet",
}

const entityLabels: Record<string, string> = {
  profile: "Kunde",
  property: "Immobilie",
  offer: "Angebot",
  conversation: "Nachricht",
  document: "Dokument",
  valuation: "Bewertung",
  financials: "Finanzen",
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr))
}

export async function AdminActivity() {
  const supabase = await createClient()

  const { data: activities } = await supabase
    .from("admin_activity_log")
    .select("*, profiles!admin_activity_log_admin_id_fkey(first_name, last_name)")
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-lg">
          Letzte Aktivitäten
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!activities || activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Keine Aktivitäten"
            description="Noch keine Admin-Aktivitäten vorhanden."
          />
        ) : (
          <div className="space-y-3">
            {activities.map((a) => {
              const admin = a.profiles as unknown as {
                first_name: string | null
                last_name: string | null
              } | null
              const adminName = [admin?.first_name, admin?.last_name]
                .filter(Boolean)
                .join(" ") || "Admin"
              return (
                <div
                  key={a.id}
                  className="flex items-start justify-between gap-4 rounded-lg border p-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {actionLabels[a.action] ?? a.action}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {adminName}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {entityLabels[a.entity_type] ?? a.entity_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(a.created_at)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
