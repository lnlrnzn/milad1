import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Phone, Building2, StickyNote } from "lucide-react"

export function ContactCard({
  contact,
}: {
  contact: {
    id: string
    first_name: string
    last_name: string
    company: string | null
    email: string | null
    phone: string | null
    notes: string | null
    property_name: string | null
  }
}) {
  const initials =
    (contact.first_name?.[0] ?? "") + (contact.last_name?.[0] ?? "")

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <CardTitle className="font-heading text-base">
            {contact.first_name} {contact.last_name}
          </CardTitle>
          {contact.company && (
            <p className="text-sm text-muted-foreground truncate">
              {contact.company}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5 text-sm">
        {contact.property_name && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <Badge variant="outline" className="text-xs font-normal">
              {contact.property_name}
            </Badge>
          </div>
        )}
        {contact.email && (
          <a
            href={`mailto:${contact.email}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{contact.email}</span>
          </a>
        )}
        {contact.phone && (
          <a
            href={`tel:${contact.phone}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{contact.phone}</span>
          </a>
        )}
        {contact.notes && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">{contact.notes}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
