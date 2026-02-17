"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Wallet } from "lucide-react"
import { updateFinancials } from "@/app/(admin)/admin/properties/actions"

async function handleSubmit(_prev: unknown, formData: FormData) {
  return await updateFinancials(formData)
}

export function FinancialsForm({ propertyId }: { propertyId: string }) {
  const [state, action, pending] = useActionState(handleSubmit, null)

  // Default to current month
  const currentMonth = new Date().toISOString().slice(0, 7) + "-01"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Wallet className="h-3.5 w-3.5" />
          Finanzen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Monatliche Finanzdaten
          </DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="property_id" value={propertyId} />
          <div className="space-y-2">
            <Label htmlFor="month">Monat</Label>
            <Input
              id="month"
              name="month"
              type="date"
              required
              defaultValue={currentMonth}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rental_income">Mieteinnahmen (EUR)</Label>
              <Input
                id="rental_income"
                name="rental_income"
                type="number"
                step="0.01"
                required
                defaultValue="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mortgage_payment">Kreditrate (EUR)</Label>
              <Input
                id="mortgage_payment"
                name="mortgage_payment"
                type="number"
                step="0.01"
                required
                defaultValue="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="additional_costs">Nebenkosten (EUR)</Label>
              <Input
                id="additional_costs"
                name="additional_costs"
                type="number"
                step="0.01"
                required
                defaultValue="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="management_fee">Verwaltung (EUR)</Label>
              <Input
                id="management_fee"
                name="management_fee"
                type="number"
                step="0.01"
                required
                defaultValue="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest_amount">Zinsen (EUR)</Label>
              <Input
                id="interest_amount"
                name="interest_amount"
                type="number"
                step="0.01"
                required
                defaultValue="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="principal_amount">Tilgung (EUR)</Label>
              <Input
                id="principal_amount"
                name="principal_amount"
                type="number"
                step="0.01"
                required
                defaultValue="0"
              />
            </div>
          </div>

          {state && "error" in state && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Speichern..." : "Speichern"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
