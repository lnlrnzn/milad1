import { createClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Activity,
  Users,
  Building2,
  Store,
  Mail,
  FileText,
  TrendingUp,
  Wallet,
  MessageSquare,
  Bell,
  StickyNote,
} from "lucide-react"
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
  "notification.sent": "Benachrichtigung gesendet",
  "note.created": "Notiz erstellt",
}

const entityConfig: Record<string, { label: string; icon: typeof Activity; borderColor: string }> = {
  profile: { label: "Kunde", icon: Users, borderColor: "border-l-[oklch(0.55_0.08_75)]" },
  property: { label: "Immobilie", icon: Building2, borderColor: "border-l-[oklch(0.38_0.08_160)]" },
  offer: { label: "Angebot", icon: Store, borderColor: "border-l-[oklch(0.65_0.15_45)]" },
  conversation: { label: "Nachricht", icon: MessageSquare, borderColor: "border-l-blue-500" },
  document: { label: "Dokument", icon: FileText, borderColor: "border-l-violet-500" },
  valuation: { label: "Bewertung", icon: TrendingUp, borderColor: "border-l-emerald-500" },
  financials: { label: "Finanzen", icon: Wallet, borderColor: "border-l-amber-500" },
  notification: { label: "Benachrichtigung", icon: Bell, borderColor: "border-l-sky-500" },
  note: { label: "Notiz", icon: StickyNote, borderColor: "border-l-pink-400" },
}

function relativeTime(dateStr: string) {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return "Gerade eben"
  if (minutes < 60) return `vor ${minutes} Min.`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `vor ${hours} Std.`
  const days = Math.floor(hours / 24)
  if (days < 7) return `vor ${days} Tag${days > 1 ? "en" : ""}`
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
          <div className="space-y-2">
            {activities.map((a) => {
              const admin = a.profiles as unknown as {
                first_name: string | null
                last_name: string | null
              } | null
              const adminName = [admin?.first_name, admin?.last_name]
                .filter(Boolean)
                .join(" ") || "Admin"

              const entity = entityConfig[a.entity_type] ?? {
                label: a.entity_type,
                icon: Activity,
                borderColor: "border-l-muted-foreground",
              }
              const Icon = entity.icon

              return (
                <div
                  key={a.id}
                  className={`flex items-start gap-3 rounded-lg border border-l-[3px] p-3 text-sm transition-colors hover:bg-muted/50 ${entity.borderColor}`}
                >
                  <div className="mt-0.5 rounded-md bg-muted p-1.5">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-tight">
                      {actionLabels[a.action] ?? a.action}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {adminName}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                    {relativeTime(a.created_at)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
