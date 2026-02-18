"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, isToolUIPart, type FileUIPart, type UIMessage } from "ai"
import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
import { useJsonRenderMessage, type DataPart } from "@json-render/react"
import { AssistantRenderer } from "@/lib/ai/registry"
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation"
import {
  Message,
  MessageContent,
} from "@/components/ai-elements/message"
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input"
import { AttachmentButton, AttachmentPreview } from "@/components/ai/attachment-ui"
import { CopyButton, FilePreview, formatTime } from "@/components/ai/chat-shared"
import { useMessageTimestamps } from "@/hooks/use-message-timestamps"
import { PdfViewerCard } from "@/components/pdf/pdf-viewer-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Bot,
  Building2,
  FileText,
  TrendingUp,
  Users,
  ShoppingBag,
  User,
  Plus,
  FilePlus,
  Save,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { persistChatMessages, createChatSession } from "@/lib/chat/actions"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const suggestions = [
  {
    icon: Building2,
    label: "Portfolio-Übersicht",
    prompt: "Zeig mir eine Übersicht meines Immobilien-Portfolios.",
  },
  {
    icon: TrendingUp,
    label: "Rendite berechnen",
    prompt: "Wie hoch ist die aktuelle Rendite meiner Immobilien?",
  },
  {
    icon: FileText,
    label: "Meine Dokumente",
    prompt: "Welche Dokumente habe ich in meinem Portal?",
  },
  {
    icon: Users,
    label: "Ansprechpartner",
    prompt: "Wer sind meine Ansprechpartner?",
  },
]

const streamdownPlugins = { code }

const toolLabels: Record<string, { label: string; icon: typeof Building2 }> = {
  property_lookup: { label: "Immobilien-Suche", icon: Building2 },
  financial_summary: { label: "Finanzübersicht", icon: TrendingUp },
  document_search: { label: "Dokumenten-Suche", icon: FileText },
  contact_info: { label: "Ansprechpartner", icon: Users },
  offer_details: { label: "Angebote", icon: ShoppingBag },
  read_document: { label: "Dokument lesen", icon: BookOpen },
  save_document: { label: "Dokument speichern", icon: Save },
  generate_pdf: { label: "PDF generieren", icon: FilePlus },
}

// ---------------------------------------------------------------------------
// Main Chat Component
// ---------------------------------------------------------------------------

export function AssistantChat({
  sessionId: initialSessionId,
  initialMessages = [],
}: {
  sessionId?: string
  initialMessages?: Array<{
    id: string
    role: string
    parts: unknown[]
  }>
}) {
  const router = useRouter()
  const [input, setInput] = useState("")
  const sessionIdRef = useRef(initialSessionId)

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    []
  )

  const { messages, sendMessage, status, stop } = useChat({
    transport,
    messages: initialMessages as UIMessage[],
  })
  const isLoading = status === "submitted" || status === "streaming"
  const timestampsRef = useMessageTimestamps(messages)

  // Persist messages after each completed exchange
  const lastPersistedRef = useRef(initialMessages.length)
  useEffect(() => {
    if (
      status === "ready" &&
      messages.length > lastPersistedRef.current &&
      sessionIdRef.current
    ) {
      lastPersistedRef.current = messages.length
      persistChatMessages(
        sessionIdRef.current,
        messages.map((m) => ({
          id: m.id,
          role: m.role,
          parts: m.parts as unknown[],
        }))
      )
    }
  }, [status, messages.length])

  const handleSend = useCallback(
    async (text: string, files?: FileUIPart[]) => {
      if (!text.trim() && (!files || files.length === 0)) return
      // Lazy session creation on first message
      if (!sessionIdRef.current) {
        const newId = await createChatSession(false)
        sessionIdRef.current = newId
        window.history.replaceState(null, "", `/assistant/${newId}`)
      }
      const opts: { text: string; files?: FileUIPart[] } = { text: text.trim() }
      if (files && files.length > 0) opts.files = files
      sendMessage(opts)
      setInput("")
    },
    [sendMessage]
  )

  const handleNewChat = useCallback(() => {
    router.push("/assistant")
  }, [router])

  return (
    <Card className="shadow-card flex flex-col h-[calc(100vh-13rem)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-full bg-primary/10 p-1.5">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-heading text-sm font-semibold leading-none">
              SDIA Assistent
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {isLoading ? "Schreibt..." : "Online"}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleNewChat}
            className="text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Neuer Chat</span>
          </Button>
        )}
      </div>

      {/* Conversation */}
      <Conversation>
        <ConversationContent className="p-4 gap-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-6">
              <div className="rounded-full bg-primary/10 p-4">
                <Bot className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center">
                <h2 className="font-heading text-lg font-semibold">
                  Hallo! Wie kann ich Ihnen helfen?
                </h2>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Stellen Sie mir Fragen zu Ihrem Immobilien-Portfolio,
                  Dokumenten oder Finanzkennzahlen.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 max-w-lg w-full">
                {suggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleSend(s.prompt)}
                    className="flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted/50"
                  >
                    <s.icon className="h-4 w-4 shrink-0 text-primary" />
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, messageIndex) => {
              const isUser = message.role === "user"
              const isAssistant = message.role === "assistant"
              const isLastAssistant =
                isAssistant && messageIndex === messages.length - 1
              const timestamp = timestampsRef.current.get(message.id)

              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    isUser && "flex-row-reverse"
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                    <AvatarFallback
                      className={cn(
                        "text-xs",
                        isUser
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {isUser ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  {/* Message + Timestamp */}
                  <div
                    className={cn(
                      "flex min-w-0 max-w-[85%] flex-col gap-1",
                      isUser && "items-end"
                    )}
                  >
                    <Message from={message.role} className="max-w-full w-auto">
                      <MessageContent>
                        {isAssistant ? (
                          <AssistantMessageContent
                            parts={message.parts}
                            isLast={isLastAssistant}
                            status={status}
                          />
                        ) : (
                          message.parts.map((part, partIndex) => {
                            if (part.type === "text") {
                              return (
                                <Streamdown
                                  key={`text-${partIndex}`}
                                  plugins={streamdownPlugins}
                                >
                                  {part.text}
                                </Streamdown>
                              )
                            }
                            if (part.type === "file") {
                              return (
                                <FilePreview
                                  key={`file-${partIndex}`}
                                  url={part.url}
                                  filename={part.filename}
                                  mediaType={part.mediaType}
                                />
                              )
                            }
                            return null
                          })
                        )}
                      </MessageContent>
                    </Message>

                    {/* Timestamp + Actions */}
                    <div
                      className={cn(
                        "flex items-center gap-2 px-1",
                        isUser && "flex-row-reverse"
                      )}
                    >
                      {timestamp && (
                        <span className="text-[11px] text-muted-foreground">
                          {formatTime(timestamp)}
                        </span>
                      )}
                      {isAssistant && (
                        <CopyButton
                          text={message.parts
                            .filter((p) => p.type === "text")
                            .map((p) => (p as { text: string }).text)
                            .join("\n")}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}

          {status === "submitted" && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Message from="assistant" className="max-w-[85%] w-auto">
                <MessageContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Denke nach...</span>
                  </div>
                </MessageContent>
              </Message>
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input */}
      <div className="border-t [&_[data-slot=input-group]]:border-0 [&_[data-slot=input-group]]:shadow-none [&_[data-slot=input-group]]:rounded-none">
        <PromptInput
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          multiple
          onSubmit={({ text, files }) => handleSend(text, files)}
        >
          <AttachmentPreview />
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Frage eingeben..."
            disabled={isLoading}
          />
          <PromptInputFooter>
            <div className="flex items-center gap-1">
              <AttachmentButton />
              <span className="text-xs text-muted-foreground">
                Enter zum Senden
              </span>
            </div>
            <PromptInputSubmit
              status={status}
              onStop={stop}
              disabled={!input.trim() && !isLoading}
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Assistant Message Content — renders text + json-render UI + tool states
// ---------------------------------------------------------------------------

function AssistantMessageContent({
  parts,
  isLast,
  status,
}: {
  parts: UIMessage["parts"]
  isLast: boolean
  status: string
}) {
  const { spec, text, hasSpec } = useJsonRenderMessage(parts as DataPart[])
  const isStreaming = isLast && status === "streaming"

  return (
    <>
      {/* Tool loading/error indicators + file previews + PDF viewers */}
      {parts.map((part, i) => {
        if (part.type === "file") {
          return (
            <FilePreview
              key={`file-${i}`}
              url={part.url}
              filename={part.filename}
              mediaType={part.mediaType}
            />
          )
        }

        if (isToolUIPart(part)) {
          const toolName = part.type.replace(/^tool-/, "")
          return (
            <ToolIndicator
              key={part.toolCallId}
              toolName={toolName}
              state={part.state}
              output={"output" in part ? part.output : undefined}
            />
          )
        }

        return null
      })}

      {/* Inline loading fallback: shows when streaming started but no visible content yet */}
      {isStreaming && !text && !hasSpec && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Antwort wird erstellt…</span>
        </div>
      )}

      {/* Streamed text content */}
      {text && (
        <Streamdown
          plugins={streamdownPlugins}
          caret="block"
          isAnimating={isStreaming}
        >
          {text}
        </Streamdown>
      )}

      {/* json-render UI components */}
      {hasSpec && (
        <AssistantRenderer spec={spec} loading={isStreaming} />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Tool Indicator — minimal loading/error states + PDF viewer for PDF tools
// ---------------------------------------------------------------------------

function ToolIndicator({
  toolName,
  state,
  output,
}: {
  toolName: string
  state: string
  output?: unknown
}) {
  const tool = toolLabels[toolName] ?? { label: toolName, icon: Bot }
  const Icon = tool.icon

  // Loading state
  if (state === "input-streaming" || state === "input-available") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed p-3">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">
          {tool.label}...
        </span>
      </div>
    )
  }

  // Error state
  if (state === "output-error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
        Fehler beim Abrufen der Daten.
      </div>
    )
  }

  if (state !== "output-available" || !output) return null

  const data = output as Record<string, unknown>

  // PDF tools need special handling (binary data can't go through json-render)
  if (toolName === "save_document") {
    const r = data as {
      success?: boolean
      name?: string
      signedUrl?: string
      message?: string
      error?: string
    }
    if (!r.success) return null // AI will generate a StatusMessage component
    if (!r.signedUrl) return null
    return (
      <div className="rounded-lg border bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {tool.label}
        </div>
        <PdfViewerCard url={r.signedUrl} filename={r.name ?? "dokument"} />
      </div>
    )
  }

  if (toolName === "generate_pdf") {
    const r = data as {
      success?: boolean
      name?: string
      contentBase64?: string
      signedUrl?: string
      error?: string
    }
    if (!r.success) return null // AI will generate a StatusMessage component
    const viewUrl =
      r.signedUrl ||
      (r.contentBase64
        ? `data:application/pdf;base64,${r.contentBase64}`
        : "")
    if (!viewUrl) return null
    return (
      <div className="rounded-lg border bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {tool.label}
        </div>
        <PdfViewerCard
          url={viewUrl}
          filename={r.name ?? "dokument.pdf"}
          contentBase64={r.contentBase64}
        />
      </div>
    )
  }

  // All other tools: output is rendered via json-render, no need to show here
  return null
}
