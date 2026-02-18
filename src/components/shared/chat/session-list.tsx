"use client"

import { useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, MessageSquare, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { deleteChatSession } from "@/lib/chat/actions"
import type { ChatSession } from "@/lib/chat/types"

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
})

export function SessionList({
  sessions,
  activeSessionId,
  isAdmin,
}: {
  sessions: ChatSession[]
  activeSessionId: string | null
  isAdmin: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const basePath = isAdmin ? "/admin/assistant" : "/assistant"

  const handleNewChat = useCallback(() => {
    router.push(basePath)
  }, [basePath, router])

  const handleDelete = useCallback(
    (e: React.MouseEvent, sessionId: string) => {
      e.preventDefault()
      e.stopPropagation()
      startTransition(async () => {
        await deleteChatSession(sessionId, isAdmin)
        if (sessionId === activeSessionId) {
          router.push(basePath)
        } else {
          router.refresh()
        }
      })
    },
    [isAdmin, activeSessionId, basePath, router]
  )

  return (
    <Card className="shadow-card flex flex-col overflow-hidden">
      <div className="border-b p-3">
        <Button
          onClick={handleNewChat}
          disabled={isPending}
          className="w-full"
          size="sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Neuer Chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto divide-y">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <MessageSquare className="mb-2 h-8 w-8" />
            <p className="text-sm">Noch keine Chats</p>
          </div>
        ) : (
          sessions.map((session) => (
            <Link
              key={session.id}
              href={`${basePath}/${session.id}`}
              className={cn(
                "group flex w-full items-start justify-between gap-2 p-3 text-left transition-colors hover:bg-muted/50",
                activeSessionId === session.id && "bg-muted"
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {session.title}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="tabular-nums">
                    {session.last_message_at
                      ? timeFormatter.format(
                          new Date(session.last_message_at)
                        )
                      : timeFormatter.format(new Date(session.created_at))}
                  </span>
                  {session.message_count > 0 && (
                    <span>{session.message_count} Nachr.</span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(e, session.id)}
                className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </Link>
          ))
        )}
      </div>
    </Card>
  )
}
