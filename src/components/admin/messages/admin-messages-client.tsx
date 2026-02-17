"use client"

import { useState, useTransition } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { MessageCircle, CheckCheck, Clock, Send } from "lucide-react"
import { sendMessage } from "@/app/(admin)/admin/messages/actions"

type Message = {
  id: string
  sender_type: string
  sender_name: string | null
  content: string
  read: boolean
  created_at: string
}

type Conversation = {
  id: string
  subject: string
  status: string
  updated_at: string
  user_name: string
  user_email: string
  last_message: {
    content: string
    sender_type: string
    created_at: string
  } | null
  unread_count: number
  messages: Message[]
}

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "2-digit",
})

const fullDateFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

export function AdminMessagesClient({
  conversations,
}: {
  conversations: Conversation[]
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    conversations[0]?.id ?? null
  )
  const [messageText, setMessageText] = useState("")
  const [pending, startTransition] = useTransition()

  const selected = conversations.find((c) => c.id === selectedId)

  function handleSend() {
    if (!selected || !messageText.trim()) return
    const text = messageText.trim()
    setMessageText("")
    startTransition(async () => {
      await sendMessage(selected.id, text)
    })
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr] lg:h-[calc(100vh-13rem)]">
      {/* Conversation list */}
      <Card className="shadow-card overflow-y-auto">
        <div className="divide-y">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={cn(
                "flex w-full flex-col gap-1 p-4 text-left transition-colors hover:bg-muted/50",
                selectedId === conv.id && "bg-muted"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="block font-medium text-sm truncate">
                    {conv.user_name}
                  </span>
                  <span className="block text-xs text-muted-foreground truncate">
                    {conv.subject}
                  </span>
                </div>
                {conv.unread_count > 0 && (
                  <Badge className="shrink-0 text-[10px] px-1.5 py-0">
                    {conv.unread_count}
                  </Badge>
                )}
              </div>
              {conv.last_message && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {conv.last_message.sender_type === "advisor" ? "Sie: " : ""}
                  {conv.last_message.content}
                </p>
              )}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {dateFormatter.format(new Date(conv.updated_at))}
                </span>
                {conv.status === "closed" && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    Geschlossen
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Message thread */}
      <Card className="shadow-card flex flex-col overflow-hidden">
        {selected ? (
          <>
            <div className="border-b px-4 py-3">
              <h2 className="font-heading font-semibold text-sm">
                {selected.subject}
              </h2>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {selected.user_name} ({selected.user_email})
                <span className="mx-1">·</span>
                {selected.status === "open" ? (
                  <>
                    <Clock className="h-3 w-3" /> Offen
                  </>
                ) : (
                  <>
                    <CheckCheck className="h-3 w-3" /> Geschlossen
                  </>
                )}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selected.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>
            <div className="border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Nachricht schreiben..."
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <Button
                  onClick={handleSend}
                  disabled={!messageText.trim() || pending}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="mx-auto h-10 w-10 mb-2" />
              <p className="text-sm">Wählen Sie eine Konversation</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isAdvisor = message.sender_type === "advisor"

  return (
    <div
      className={cn("flex gap-2.5", isAdvisor ? "flex-row-reverse" : "flex-row")}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            "text-xs font-semibold",
            isAdvisor
              ? "bg-primary/10 text-primary"
              : "bg-secondary/10 text-secondary"
          )}
        >
          {isAdvisor ? "SA" : "KD"}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-[75%] space-y-1",
          isAdvisor ? "items-end" : "items-start"
        )}
      >
        {message.sender_name && (
          <p className={cn(
            "text-[10px] text-muted-foreground px-1",
            isAdvisor ? "text-right" : "text-left"
          )}>
            {message.sender_name}
          </p>
        )}
        <div
          className={cn(
            "rounded-xl px-3.5 py-2.5 text-sm",
            isAdvisor
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted rounded-bl-sm"
          )}
        >
          {message.content}
        </div>
        <p
          className={cn(
            "text-[10px] text-muted-foreground tabular-nums px-1",
            isAdvisor ? "text-right" : "text-left"
          )}
        >
          {fullDateFormatter.format(new Date(message.created_at))}
        </p>
      </div>
    </div>
  )
}
