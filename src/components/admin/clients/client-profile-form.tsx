"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pencil } from "lucide-react"
import { updateClientProfile } from "@/app/(admin)/admin/clients/actions"

type ClientProfile = {
  user_id: string
  annual_salary: number | null
  equity_capital: number | null
  credit_score: string | null
  tax_class: number | null
  advisor_id: string | null
  first_consultation_date: string | null
  client_status: string
  notes: string | null
  risk_appetite: string | null
  investment_budget: number | null
  preferred_region: string | null
  preferred_property_type: string | null
  planned_property_count: number | null
  contract_type: string | null
  commission_rate: number | null
  payment_status: string | null
  contract_date: string | null
}

async function handleSubmit(_prev: unknown, formData: FormData) {
  return await updateClientProfile(formData)
}

export function ClientProfileForm({
  userId,
  profile,
}: {
  userId: string
  profile: ClientProfile | null
}) {
  const [state, action, pending] = useActionState(handleSubmit, null)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-3.5 w-3.5" />
          Profil bearbeiten
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Kundenprofil bearbeiten
          </DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-6">
          <input type="hidden" name="user_id" value={userId} />

          {/* Financial Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Finanzdaten
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="annual_salary">Jahresgehalt (EUR)</Label>
                <Input
                  id="annual_salary"
                  name="annual_salary"
                  type="number"
                  defaultValue={profile?.annual_salary ?? ""}
                  placeholder="95000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="equity_capital">Eigenkapital (EUR)</Label>
                <Input
                  id="equity_capital"
                  name="equity_capital"
                  type="number"
                  defaultValue={profile?.equity_capital ?? ""}
                  placeholder="50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credit_score">Schufa-Rating</Label>
                <Select
                  name="credit_score"
                  defaultValue={profile?.credit_score ?? ""}
                >
                  <SelectTrigger id="credit_score">
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A - Sehr gut</SelectItem>
                    <SelectItem value="B">B - Gut</SelectItem>
                    <SelectItem value="C">C - Ausreichend</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_class">Steuerklasse</Label>
                <Select
                  name="tax_class"
                  defaultValue={profile?.tax_class?.toString() ?? ""}
                >
                  <SelectTrigger id="tax_class">
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((tc) => (
                      <SelectItem key={tc} value={String(tc)}>
                        Klasse {tc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="investment_budget">Investment-Budget (EUR)</Label>
                <Input
                  id="investment_budget"
                  name="investment_budget"
                  type="number"
                  defaultValue={profile?.investment_budget ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="risk_appetite">Risikoneigung</Label>
                <Select
                  name="risk_appetite"
                  defaultValue={profile?.risk_appetite ?? ""}
                >
                  <SelectTrigger id="risk_appetite">
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Konservativ</SelectItem>
                    <SelectItem value="moderate">Moderat</SelectItem>
                    <SelectItem value="aggressive">Aggressiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Status & Preferences */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Status & Präferenzen
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client_status">Kundenstatus</Label>
                <Select
                  name="client_status"
                  defaultValue={profile?.client_status ?? "prospect"}
                >
                  <SelectTrigger id="client_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">Interessent</SelectItem>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="inactive">Inaktiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="first_consultation_date">Erstberatung</Label>
                <Input
                  id="first_consultation_date"
                  name="first_consultation_date"
                  type="date"
                  defaultValue={profile?.first_consultation_date ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferred_region">Wunschregion</Label>
                <Input
                  id="preferred_region"
                  name="preferred_region"
                  defaultValue={profile?.preferred_region ?? ""}
                  placeholder="z.B. Rhein-Neckar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferred_property_type">Wunsch-Objektart</Label>
                <Input
                  id="preferred_property_type"
                  name="preferred_property_type"
                  defaultValue={profile?.preferred_property_type ?? ""}
                  placeholder="z.B. Wohnung, MFH"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planned_property_count">Geplante Anzahl</Label>
                <Input
                  id="planned_property_count"
                  name="planned_property_count"
                  type="number"
                  defaultValue={profile?.planned_property_count ?? ""}
                />
              </div>
            </div>
          </div>

          {/* Contract */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Vertrag
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contract_type">Vertragsart</Label>
                <Input
                  id="contract_type"
                  name="contract_type"
                  defaultValue={profile?.contract_type ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission_rate">Provision (%)</Label>
                <Input
                  id="commission_rate"
                  name="commission_rate"
                  type="number"
                  step="0.01"
                  defaultValue={profile?.commission_rate ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_status">Zahlungsstatus</Label>
                <Select
                  name="payment_status"
                  defaultValue={profile?.payment_status ?? "not_applicable"}
                >
                  <SelectTrigger id="payment_status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_applicable">Nicht zutreffend</SelectItem>
                    <SelectItem value="pending">Ausstehend</SelectItem>
                    <SelectItem value="paid">Bezahlt</SelectItem>
                    <SelectItem value="overdue">Überfällig</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contract_date">Vertragsdatum</Label>
                <Input
                  id="contract_date"
                  name="contract_date"
                  type="date"
                  defaultValue={profile?.contract_date ?? ""}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Interne Notizen</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={profile?.notes ?? ""}
              placeholder="Interne Anmerkungen zum Kunden..."
            />
          </div>

          {state && "error" in state && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Speichern..." : "Speichern"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
