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
import { TrendingUp } from "lucide-react"
import { addValuation } from "@/app/(admin)/admin/properties/actions"

async function handleSubmit(_prev: unknown, formData: FormData) {
  return await addValuation(formData)
}

export function ValuationForm({ propertyId }: { propertyId: string }) {
  const [state, action, pending] = useActionState(handleSubmit, null)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <TrendingUp className="h-3.5 w-3.5" />
          Bewertung
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Bewertung hinzufügen
          </DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="property_id" value={propertyId} />
          <div className="space-y-2">
            <Label htmlFor="market_value">Marktwert (EUR)</Label>
            <Input
              id="market_value"
              name="market_value"
              type="number"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valuation_date">Datum</Label>
            <Input
              id="valuation_date"
              name="valuation_date"
              type="date"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="source">Quelle</Label>
            <Input
              id="source"
              name="source"
              placeholder="z.B. Gutachter, Immoscout"
            />
          </div>

          {state && "error" in state && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Hinzufügen..." : "Hinzufügen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
