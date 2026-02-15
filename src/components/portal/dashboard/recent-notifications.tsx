import Link from "next/link"
import {
  Info,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Store,
  MessageSquare,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

const iconMap: Record<string, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  document: FileText,
  offer: Store,
  message: MessageSquare,
}

const colorMap: Record<string, string> = {
  info: "text-blue-500",
  warning: "text-warning",
  success: "text-success",
  document: "text-primary",
  offer: "text-secondary",
  message: "text-brand-forest-400",
}

export function RecentNotifications({
  notifications,
}: {
  notifications: {
    id: string
    type: string
    title: string
    message: string | null
    read: boolean
    link: string | null
    created_at: string
  }[]
}) {
  if (notifications.length === 0) return null

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-lg">
          Benachrichtigungen
        </CardTitle>
        <CardDescription>
          {notifications.filter((n) => !n.read).length} ungelesen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = iconMap[notification.type] ?? Info
            const color = colorMap[notification.type] ?? "text-muted-foreground"
            const content = (
              <>
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", color)} />
                <div className="min-w-0 flex-1">
                  <p className="truncate">{notification.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {notification.message}
                  </p>
                </div>
              </>
            )
            const className = cn(
              "flex items-start gap-3 text-sm",
              !notification.read && "font-medium"
            )

            return notification.link ? (
              <Link
                key={notification.id}
                href={notification.link}
                className={className}
              >
                {content}
              </Link>
            ) : (
              <div key={notification.id} className={className}>
                {content}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
