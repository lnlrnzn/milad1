"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
import { Brain, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Context ──────────────────────────────────────────────────────────

interface ReasoningContextValue {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  isStreaming: boolean
  duration: number
}

const ReasoningContext = createContext<ReasoningContextValue | null>(null)

export function useReasoning() {
  const ctx = useContext(ReasoningContext)
  if (!ctx) throw new Error("useReasoning must be used within <Reasoning>")
  return ctx
}

// ── Root ─────────────────────────────────────────────────────────────

interface ReasoningProps {
  children: ReactNode
  isStreaming?: boolean
  className?: string
}

const streamdownPlugins = { code }

export function Reasoning({
  children,
  isStreaming = false,
  className,
}: ReasoningProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [duration, setDuration] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  // Auto-open when streaming starts
  useEffect(() => {
    if (isStreaming) {
      setIsOpen(true)
      startTimeRef.current = Date.now()
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setDuration(Math.round((Date.now() - startTimeRef.current) / 1000))
        }
      }, 1000)
    } else {
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = undefined
      }
      // Auto-close 1s after streaming ends
      if (startTimeRef.current) {
        const closeTimer = setTimeout(() => setIsOpen(false), 1000)
        return () => clearTimeout(closeTimer)
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isStreaming])

  return (
    <ReasoningContext.Provider value={{ isOpen, setIsOpen, isStreaming, duration }}>
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className={cn("rounded-lg border border-dashed border-muted-foreground/25", className)}
      >
        {children}
      </Collapsible>
    </ReasoningContext.Provider>
  )
}

// ── Trigger ──────────────────────────────────────────────────────────

interface ReasoningTriggerProps {
  getThinkingMessage?: (
    isStreaming: boolean,
    duration: number
  ) => ReactNode
  className?: string
}

export function ReasoningTrigger({
  getThinkingMessage,
  className,
}: ReasoningTriggerProps) {
  const { isOpen, isStreaming, duration } = useReasoning()

  const defaultMessage = isStreaming
    ? "Denke nach..."
    : `Gedacht für ${duration} Sekunde${duration !== 1 ? "n" : ""}`

  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground",
        "transition-colors hover:text-foreground",
        className
      )}
    >
      <Brain className="h-4 w-4 shrink-0" />
      <span className="flex-1 text-left">
        {getThinkingMessage
          ? getThinkingMessage(isStreaming, duration)
          : defaultMessage}
      </span>
      <ChevronRight
        className={cn(
          "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
          isOpen && "rotate-90"
        )}
      />
    </CollapsibleTrigger>
  )
}

// ── Content ──────────────────────────────────────────────────────────

interface ReasoningContentProps {
  children: string
  className?: string
}

export function ReasoningContent({ children, className }: ReasoningContentProps) {
  const { isStreaming } = useReasoning()

  return (
    <CollapsibleContent>
      <div
        className={cn(
          "border-t border-dashed border-muted-foreground/25 px-3 py-2",
          "max-h-60 overflow-y-auto text-sm text-muted-foreground",
          "prose prose-sm prose-muted max-w-none",
          className
        )}
      >
        <Streamdown
          plugins={streamdownPlugins}
          isAnimating={isStreaming}
        >
          {children}
        </Streamdown>
      </div>
    </CollapsibleContent>
  )
}
