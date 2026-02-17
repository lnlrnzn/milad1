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
import { createOffer, updateOffer } from "@/app/(admin)/admin/marketplace/actions"

type OfferData = {
  id: string
  title: string
  street: string
  zip_code: string
  city: string
  type: string
  status: string
  price: number
  size_sqm: number | null
  rooms: number | null
  year_built: number | null
  expected_rent: number | null
  expected_yield: number | null
  description: string | null
}

async function handleCreate(_prev: unknown, formData: FormData) {
  return await createOffer(formData)
}

async function handleUpdate(_prev: unknown, formData: FormData) {
  const id = formData.get("_id") as string
  formData.delete("_id")
  return await updateOffer(id, formData)
}

export function OfferForm({ offer }: { offer?: OfferData }) {
  const isEdit = !!offer
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
            Neues Angebot
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {isEdit ? "Angebot bearbeiten" : "Neues Angebot erstellen"}
          </DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-6">
          {isEdit && <input type="hidden" name="_id" value={offer.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                name="title"
                required
                defaultValue={offer?.title ?? ""}
                placeholder="z.B. 2-Zi. Wohnung Mannheim Zentrum"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="street">Straße</Label>
              <Input
                id="street"
                name="street"
                required
                defaultValue={offer?.street ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip_code">PLZ</Label>
              <Input
                id="zip_code"
                name="zip_code"
                required
                defaultValue={offer?.zip_code ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Stadt</Label>
              <Input
                id="city"
                name="city"
                required
                defaultValue={offer?.city ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Typ</Label>
              <Select name="type" defaultValue={offer?.type ?? "apartment"}>
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
              <Select name="status" defaultValue={offer?.status ?? "active"}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="reserved">Reserviert</SelectItem>
                  <SelectItem value="sold">Verkauft</SelectItem>
                  <SelectItem value="withdrawn">Zurückgezogen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preis (EUR)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                required
                defaultValue={offer?.price ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size_sqm">Fläche (m²)</Label>
              <Input
                id="size_sqm"
                name="size_sqm"
                type="number"
                step="0.01"
                defaultValue={offer?.size_sqm ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rooms">Zimmer</Label>
              <Input
                id="rooms"
                name="rooms"
                type="number"
                step="0.5"
                defaultValue={offer?.rooms ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year_built">Baujahr</Label>
              <Input
                id="year_built"
                name="year_built"
                type="number"
                defaultValue={offer?.year_built ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_rent">Erwartete Miete (EUR/Mo.)</Label>
              <Input
                id="expected_rent"
                name="expected_rent"
                type="number"
                step="0.01"
                defaultValue={offer?.expected_rent ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_yield">Erwartete Rendite (%)</Label>
              <Input
                id="expected_yield"
                name="expected_yield"
                type="number"
                step="0.01"
                defaultValue={offer?.expected_yield ?? ""}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={offer?.description ?? ""}
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
