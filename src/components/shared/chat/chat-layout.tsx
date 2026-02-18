import { SessionList } from "./session-list"
import type { ChatSession } from "@/lib/chat/types"

export function ChatLayout({
  sessions,
  activeSessionId,
  isAdmin,
  children,
}: {
  sessions: ChatSession[]
  activeSessionId: string | null
  isAdmin: boolean
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr] lg:h-[calc(100vh-13rem)]">
      <div className="hidden lg:block lg:h-full">
        <SessionList
          sessions={sessions}
          activeSessionId={activeSessionId}
          isAdmin={isAdmin}
        />
      </div>
      {children}
    </div>
  )
}
