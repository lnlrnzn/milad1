"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Mail } from "lucide-react"
import { sendEmail } from "@/app/(admin)/admin/messages/actions"
import { toast } from "sonner"

export function EmailSendDialog() {
  const [open, setOpen] = useState(false)
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [pending, startTransition] = useTransition()

  function handleSubmit() {
    if (!to.trim() || !subject.trim() || !body.trim()) return
    startTransition(async () => {
      const result = await sendEmail(to.trim(), subject.trim(), body.trim())
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("E-Mail wurde gesendet")
        setOpen(false)
        setTo("")
        setSubject("")
        setBody("")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Mail className="h-4 w-4" />
          E-Mail senden
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            E-Mail senden
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-to">An</Label>
            <Input
              id="email-to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="email@example.de"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-subject">Betreff</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Betreff"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email-body">Nachricht</Label>
            <Textarea
              id="email-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Ihre E-Mail..."
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!to.trim() || !subject.trim() || !body.trim() || pending}
            >
              {pending ? "Senden..." : "Senden"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
