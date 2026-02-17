"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserPlus } from "lucide-react"
import { assignClient } from "@/app/(admin)/admin/properties/actions"

export function AssignClientDialog({
  propertyId,
  investors,
}: {
  propertyId: string
  investors: { id: string; name: string }[]
}) {
  const [selectedUser, setSelectedUser] = useState("")
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  function handleAssign() {
    if (!selectedUser) return
    setError(null)
    startTransition(async () => {
      const result = await assignClient(propertyId, selectedUser)
      if (result.error) {
        setError(result.error)
      } else {
        setOpen(false)
        setSelectedUser("")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="h-3.5 w-3.5" />
          Kunde zuweisen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Kunden zuweisen
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Kunde auswählen" />
            </SelectTrigger>
            <SelectContent>
              {investors.map((inv) => (
                <SelectItem key={inv.id} value={inv.id}>
                  {inv.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedUser || pending}
            >
              {pending ? "Zuweisen..." : "Zuweisen"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
