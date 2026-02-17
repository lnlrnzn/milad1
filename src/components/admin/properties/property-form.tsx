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
import { Plus, Pencil } from "lucide-react"
import { createProperty, updateProperty } from "@/app/(admin)/admin/properties/actions"

type PropertyData = {
  id: string
  name: string
  street: string
  zip_code: string
  city: string
  state: string
  country: string
  type: string
  status: string
  purchase_price: number
  purchase_date: string | null
  rooms: number | null
  size_sqm: number | null
  year_built: number | null
  description: string | null
}

async function handleCreate(_prev: unknown, formData: FormData) {
  return await createProperty(formData)
}

async function handleUpdate(_prev: unknown, formData: FormData) {
  const id = formData.get("_id") as string
  formData.delete("_id")
  return await updateProperty(id, formData)
}

export function PropertyForm({
  property,
}: {
  property?: PropertyData
}) {
  const isEdit = !!property
  const [state, action, pending] = useActionState(
    isEdit ? handleUpdate : handleCreate,
    null
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm" className="gap-2">
            <Pencil className="h-3.5 w-3.5" />
            Bearbeiten
          </Button>
        ) : (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Neue Immobilie
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEdit ? "Immobilie bearbeiten" : "Neue Immobilie anlegen"}
          </DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-6">
          {isEdit && <input type="hidden" name="_id" value={property.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={property?.name ?? ""}
                placeholder="z.B. Wohnung Heidelberg"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="street">Straße</Label>
              <Input
                id="street"
                name="street"
                required
                defaultValue={property?.street ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip_code">PLZ</Label>
              <Input
                id="zip_code"
                name="zip_code"
                required
                defaultValue={property?.zip_code ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Stadt</Label>
              <Input
                id="city"
                name="city"
                required
                defaultValue={property?.city ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Bundesland</Label>
              <Input
                id="state"
                name="state"
                required
                defaultValue={property?.state ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Land</Label>
              <Input
                id="country"
                name="country"
                defaultValue={property?.country ?? "Deutschland"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Typ</Label>
              <Select
                name="type"
                defaultValue={property?.type ?? "apartment"}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">Wohnung</SelectItem>
                  <SelectItem value="house">Haus</SelectItem>
                  <SelectItem value="multi_family">Mehrfamilienhaus</SelectItem>
                  <SelectItem value="commercial">Gewerbe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                name="status"
                defaultValue={property?.status ?? "active"}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="in_acquisition">In Erwerb</SelectItem>
                  <SelectItem value="sold">Verkauft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Kaufpreis (EUR)</Label>
              <Input
                id="purchase_price"
                name="purchase_price"
                type="number"
                required
                defaultValue={property?.purchase_price ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Kaufdatum</Label>
              <Input
                id="purchase_date"
                name="purchase_date"
                type="date"
                defaultValue={property?.purchase_date ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rooms">Zimmer</Label>
              <Input
                id="rooms"
                name="rooms"
                type="number"
                step="0.5"
                defaultValue={property?.rooms ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size_sqm">Fläche (m²)</Label>
              <Input
                id="size_sqm"
                name="size_sqm"
                type="number"
                step="0.01"
                defaultValue={property?.size_sqm ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year_built">Baujahr</Label>
              <Input
                id="year_built"
                name="year_built"
                type="number"
                defaultValue={property?.year_built ?? ""}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={property?.description ?? ""}
              />
            </div>
          </div>

          {state && "error" in state && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Speichern..." : isEdit ? "Speichern" : "Erstellen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
