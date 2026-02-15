"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, isToolUIPart, type FileUIPart } from "ai"
import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
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
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputButton,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Copy,
  Check,
  Paperclip,
  X,
  Trash2,
  Image as ImageIcon,
  File as FileIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/components/shared/currency-display"

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
const transport = new DefaultChatTransport({ api: "/api/chat" })

function formatTime(date: Date) {
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}

// ---------------------------------------------------------------------------
// Main Chat Component
// ---------------------------------------------------------------------------

export function AssistantChat() {
  const [input, setInput] = useState("")
  const timestampsRef = useRef<Map<string, Date>>(new Map())
  const [, forceUpdate] = useState(0)

  const { messages, sendMessage, setMessages, status, stop } = useChat({ transport })
  const isLoading = status === "submitted" || status === "streaming"

  // Track timestamps for each message
  useEffect(() => {
    let updated = false
    for (const msg of messages) {
      if (!timestampsRef.current.has(msg.id)) {
        timestampsRef.current.set(msg.id, new Date())
        updated = true
      }
    }
    if (updated) forceUpdate((n) => n + 1)
  }, [messages])

  const handleSend = useCallback(
    (text: string, files?: FileUIPart[]) => {
      if (!text.trim() && (!files || files.length === 0)) return
      const opts: { text: string; files?: FileUIPart[] } = { text: text.trim() }
      if (files && files.length > 0) opts.files = files
      sendMessage(opts)
      setInput("")
    },
    [sendMessage]
  )

  const handleClear = useCallback(() => {
    setMessages([])
    timestampsRef.current.clear()
  }, [setMessages])

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
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" />
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
                        {message.parts.map((part, partIndex) => {
                          if (part.type === "text") {
                            const isLastAssistant =
                              isAssistant &&
                              messageIndex === messages.length - 1
                            return (
                              <Streamdown
                                key={`text-${partIndex}`}
                                plugins={streamdownPlugins}
                                caret="block"
                                isAnimating={
                                  isLastAssistant && status === "streaming"
                                }
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

                          if (isToolUIPart(part)) {
                            const toolName = part.type.replace(/^tool-/, "")
                            return (
                              <ToolResultDisplay
                                key={part.toolCallId}
                                toolName={toolName}
                                state={part.state}
                                input={
                                  "input" in part ? part.input : undefined
                                }
                                output={
                                  "output" in part ? part.output : undefined
                                }
                              />
                            )
                          }

                          return null
                        })}
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
          accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx"
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
// Attachment Button (inside PromptInput context)
// ---------------------------------------------------------------------------

function AttachmentButton() {
  const { openFileDialog } = usePromptInputAttachments()
  return (
    <PromptInputButton
      onClick={openFileDialog}
      title="Datei anhängen"
    >
      <Paperclip className="h-4 w-4" />
    </PromptInputButton>
  )
}

// ---------------------------------------------------------------------------
// Attachment Preview (inside PromptInput context)
// ---------------------------------------------------------------------------

function AttachmentPreview() {
  const { files, remove } = usePromptInputAttachments()
  if (files.length === 0) return null

  return (
    <PromptInputHeader className="gap-2">
      {files.map((file) => {
        const isImage = file.mediaType?.startsWith("image/")
        return (
          <div
            key={file.id}
            className="group/att relative flex items-center gap-2 rounded-md border bg-muted/50 px-2.5 py-1.5 text-xs"
          >
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={file.url}
                alt={file.filename ?? "Bild"}
                className="h-8 w-8 rounded object-cover"
              />
            ) : (
              <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className="max-w-[120px] truncate">{file.filename ?? "Datei"}</span>
            <button
              type="button"
              onClick={() => remove(file.id)}
              className="ml-1 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )
      })}
    </PromptInputHeader>
  )
}

// ---------------------------------------------------------------------------
// Copy Button
// ---------------------------------------------------------------------------

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [text])

  return (
    <button
      onClick={handleCopy}
      className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 [div:hover>&]:opacity-100"
      title="Kopieren"
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// File Preview in Messages
// ---------------------------------------------------------------------------

function FilePreview({
  url,
  filename,
  mediaType,
}: {
  url: string
  filename?: string
  mediaType: string
}) {
  const isImage = mediaType.startsWith("image/")

  if (isImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={filename ?? "Bild"}
        className="max-h-48 rounded-lg object-contain"
      />
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-xs">
      <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{filename ?? "Datei"}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tool Result Display
// ---------------------------------------------------------------------------

function ToolResultDisplay({
  toolName,
  state,
  input,
  output,
}: {
  toolName: string
  state: string
  input?: unknown
  output?: unknown
}) {
  const toolLabels: Record<string, { label: string; icon: typeof Building2 }> =
    {
      property_lookup: { label: "Immobilien-Suche", icon: Building2 },
      financial_summary: { label: "Finanzübersicht", icon: TrendingUp },
      document_search: { label: "Dokumenten-Suche", icon: FileText },
      contact_info: { label: "Ansprechpartner", icon: Users },
      offer_details: { label: "Angebote", icon: ShoppingBag },
    }

  const tool = toolLabels[toolName] ?? {
    label: toolName,
    icon: Bot,
  }
  const Icon = tool.icon

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

  if (state === "output-error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
        Fehler beim Abrufen der Daten.
      </div>
    )
  }

  if (state !== "output-available" || !output) return null

  const data = output as Record<string, unknown>

  // Render property results
  if (toolName === "property_lookup" && data.properties) {
    const properties = data.properties as Array<Record<string, unknown>>
    if (properties.length === 0) {
      return (
        <ToolCard icon={Icon} label={tool.label}>
          <p className="text-sm text-muted-foreground">
            Keine Immobilien gefunden.
          </p>
        </ToolCard>
      )
    }
    return (
      <ToolCard icon={Icon} label={tool.label}>
        <div className="space-y-2">
          {properties.map((p) => (
            <div
              key={p.id as string}
              className="rounded-md border p-3 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{p.name as string}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.address as string}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {p.type as string}
                </Badge>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                {p.currentValue != null && (
                  <div>
                    <span className="text-muted-foreground">Marktwert: </span>
                    <span className="font-medium">
                      {formatCurrency(p.currentValue as number)}
                    </span>
                  </div>
                )}
                {p.purchasePrice != null && (
                  <div>
                    <span className="text-muted-foreground">Kaufpreis: </span>
                    <span className="font-medium">
                      {formatCurrency(p.purchasePrice as number)}
                    </span>
                  </div>
                )}
                {p.monthlyRent != null && (
                  <div>
                    <span className="text-muted-foreground">Miete: </span>
                    <span className="font-medium">
                      {formatCurrency(p.monthlyRent as number, true)}/Mo.
                    </span>
                  </div>
                )}
                {p.netIncome != null && (
                  <div>
                    <span className="text-muted-foreground">
                      Netto-Cashflow:{" "}
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        (p.netIncome as number) >= 0
                          ? "text-green-600"
                          : "text-red-500"
                      )}
                    >
                      {formatCurrency(p.netIncome as number, true)}/Mo.
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ToolCard>
    )
  }

  // Render financial summary
  if (toolName === "financial_summary" && data.summary) {
    const s = data.summary as Record<string, number>
    return (
      <ToolCard icon={Icon} label={tool.label}>
        <div className="grid gap-2 sm:grid-cols-2">
          <MetricItem
            label="Portfolio-Gesamtwert"
            value={formatCurrency(s.totalCurrentValue)}
          />
          <MetricItem
            label="Wertsteigerung"
            value={`${s.appreciationPercent?.toFixed(1)}%`}
            trend={s.appreciationPercent >= 0 ? "up" : "down"}
          />
          <MetricItem
            label="Mtl. Mieteinnahmen"
            value={formatCurrency(s.monthlyRentalIncome, true)}
          />
          <MetricItem
            label="Mtl. Kreditrate"
            value={formatCurrency(s.monthlyMortgage, true)}
          />
          <MetricItem
            label="Mtl. Netto-Cashflow"
            value={formatCurrency(s.monthlyNetIncome, true)}
            trend={s.monthlyNetIncome >= 0 ? "up" : "down"}
          />
          <MetricItem
            label="Brutto-Rendite"
            value={`${s.annualGrossYieldPercent?.toFixed(1)}%`}
          />
        </div>
      </ToolCard>
    )
  }

  // Render documents
  if (toolName === "document_search" && data.documents) {
    const docs = data.documents as Array<Record<string, unknown>>
    return (
      <ToolCard icon={Icon} label={`${tool.label} (${data.totalCount})`}>
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keine Dokumente gefunden.
          </p>
        ) : (
          <div className="space-y-1">
            {docs.slice(0, 10).map((d) => (
              <div
                key={d.id as string}
                className="flex items-center justify-between rounded px-2 py-1.5 text-xs hover:bg-muted/50"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{d.name as string}</span>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0 ml-2">
                  {d.category as string}
                </Badge>
              </div>
            ))}
            {docs.length > 10 && (
              <p className="text-xs text-muted-foreground px-2">
                ... und {docs.length - 10} weitere
              </p>
            )}
          </div>
        )}
      </ToolCard>
    )
  }

  // Render contacts
  if (toolName === "contact_info" && data.contacts) {
    const contacts = data.contacts as Array<Record<string, unknown>>
    return (
      <ToolCard icon={Icon} label={tool.label}>
        {contacts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keine Ansprechpartner gefunden.
          </p>
        ) : (
          <div className="space-y-2">
            {contacts.map((c, i) => (
              <div key={i} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{c.name as string}</p>
                  <Badge variant="secondary" className="text-xs">
                    {c.type as string}
                  </Badge>
                </div>
                {c.company ? (
                  <p className="text-xs text-muted-foreground">
                    {c.company as string}
                  </p>
                ) : null}
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                  {c.email ? <span>{c.email as string}</span> : null}
                  {c.phone ? <span>{c.phone as string}</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </ToolCard>
    )
  }

  // Render offers
  if (toolName === "offer_details" && data.offers) {
    const offers = data.offers as Array<Record<string, unknown>>
    return (
      <ToolCard icon={Icon} label={`${tool.label} (${data.totalCount})`}>
        {offers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Derzeit keine aktiven Angebote.
          </p>
        ) : (
          <div className="space-y-2">
            {offers.map((o) => (
              <div
                key={o.id as string}
                className="rounded-md border p-3 text-sm"
              >
                <p className="font-semibold">{o.title as string}</p>
                <p className="text-xs text-muted-foreground">
                  {o.address as string}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  <span>
                    <span className="text-muted-foreground">Preis: </span>
                    <span className="font-medium">
                      {formatCurrency(o.price as number)}
                    </span>
                  </span>
                  {o.expectedRent != null && (
                    <span>
                      <span className="text-muted-foreground">
                        Erw. Miete:{" "}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(o.expectedRent as number, true)}/Mo.
                      </span>
                    </span>
                  )}
                  {o.expectedYield != null && (
                    <span>
                      <span className="text-muted-foreground">Rendite: </span>
                      <span className="font-medium">
                        {(o.expectedYield as number).toFixed(1)}%
                      </span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ToolCard>
    )
  }

  // Fallback for any other tool output
  return (
    <ToolCard icon={Icon} label={tool.label}>
      <pre className="overflow-x-auto rounded bg-muted p-2 text-xs">
        {JSON.stringify(output, null, 2)}
      </pre>
    </ToolCard>
  )
}

// ---------------------------------------------------------------------------
// Shared Sub-components
// ---------------------------------------------------------------------------

function ToolCard({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Building2
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-card p-3 text-card-foreground">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      {children}
    </div>
  )
}

function MetricItem({
  label,
  value,
  trend,
}: {
  label: string
  value: string
  trend?: "up" | "down"
}) {
  return (
    <div className="rounded-md bg-muted/50 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-0.5 text-sm font-semibold",
          trend === "up" && "text-green-600",
          trend === "down" && "text-red-500"
        )}
      >
        {value}
      </p>
    </div>
  )
}
