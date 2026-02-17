"use client"

import { useState, useTransition } from "react"
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
import { PenSquare } from "lucide-react"
import { createConversation } from "@/app/(admin)/admin/messages/actions"

export function ComposeDialog({
  investors,
}: {
  investors: { id: string; name: string; email: string }[]
}) {
  const [open, setOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit() {
    if (!selectedUser || !subject.trim() || !content.trim()) return
    setError(null)
    startTransition(async () => {
      const result = await createConversation(selectedUser, subject.trim(), content.trim())
      if (result.error) {
        setError(result.error)
      } else {
        setOpen(false)
        setSelectedUser("")
        setSubject("")
        setContent("")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <PenSquare className="h-4 w-4" />
          Neue Nachricht
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            Neue Nachricht
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Empfänger</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Kunde auswählen" />
              </SelectTrigger>
              <SelectContent>
                {investors.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.name} ({inv.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Betreff</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Betreff der Nachricht"
            />
          </div>
          <div className="space-y-2">
            <Label>Nachricht</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Ihre Nachricht..."
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedUser || !subject.trim() || !content.trim() || pending}
            >
              {pending ? "Senden..." : "Senden"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
