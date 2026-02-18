"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import {
  DefaultChatTransport,
  isToolUIPart,
  isReasoningUIPart,
  lastAssistantMessageIsCompleteWithApprovalResponses,
  type FileUIPart,
} from "ai"
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
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input"
import { Shimmer } from "@/components/ai-elements/shimmer"
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning"
import {
  Confirmation,
  ConfirmationTitle,
  ConfirmationRequest,
  ConfirmationAccepted,
  ConfirmationRejected,
  ConfirmationActions,
  ConfirmationAction,
} from "@/components/ai-elements/confirmation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Bot,
  Users,
  Building2,
  TrendingUp,
  FileText,
  Store,
  Mail,
  Activity,
  User,
  Copy,
  Check,
  Trash2,
  Bell,
  MessageSquare,
  UserCog,
  StickyNote,
  CheckCircle2,
  XCircle,
  Sparkles,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"

const suggestions = [
  {
    icon: Mail,
    label: "Portfolio-Update senden",
    prompt: "Schicke allen aktiven Kunden ein Portfolio-Update per E-Mail.",
  },
  {
    icon: Sparkles,
    label: "Willkommens-E-Mail",
    prompt: "Erstelle eine Willkommens-E-Mail für Neukunden.",
  },
  {
    icon: Users,
    label: "Inaktive Kunden",
    prompt: "Zeige Kunden ohne Aktivität in den letzten 30 Tagen.",
  },
  {
    icon: BarChart3,
    label: "Portfolio-Performance",
    prompt: "Fasse die Portfolio-Performance dieses Monats zusammen.",
  },
  {
    icon: Bell,
    label: "Kunden benachrichtigen",
    prompt: "Benachrichtige alle aktiven Kunden über neue Angebote im Marktplatz.",
  },
  {
    icon: TrendingUp,
    label: "Finanzbericht",
    prompt: "Erstelle einen Finanzbericht für alle Kunden.",
  },
]

const streamdownPlugins = { code }
const transport = new DefaultChatTransport({ api: "/api/admin-chat" })

function formatTime(date: Date) {
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}

// ── Tool approval description builders ──────────────────────────────

function getApprovalDescription(toolName: string, input: Record<string, unknown>): string {
  switch (toolName) {
    case "send_email":
      return `E-Mail an ${input.recipientName ?? "Kunde"} senden? Betreff: "${input.subject ?? ""}"`
    case "send_notification": {
      const ids = input.userIds as string[] | undefined
      return `Benachrichtigung an ${ids?.length ?? 0} Kunden senden?`
    }
    case "send_message":
      return `Nachricht an Kunden senden? Betreff: "${input.subject ?? ""}"`
    case "update_client_status":
      return `Kundenstatus auf "${input.newStatus ?? ""}" ändern?`
    case "create_task_note":
      return "Notiz erstellen?"
    default:
      return `${toolName} ausführen?`
  }
}

export function AdminAssistantChat() {
  const [input, setInput] = useState("")
  const timestampsRef = useRef<Map<string, Date>>(new Map())
  const [, forceUpdate] = useState(0)

  const { messages, sendMessage, setMessages, status, stop, addToolApprovalResponse } =
    useChat({
      transport,
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    })
  const isLoading = status === "submitted" || status === "streaming"

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
              SDIA Admin Assistent
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
                  SDIA Digitaler Mitarbeiter
                </h2>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Ich kann Daten abfragen, E-Mails senden, Kunden benachrichtigen
                  und Aktionen im System ausführen.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 max-w-2xl w-full">
                {suggestions.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => handleSend(s.prompt)}
                    className="flex items-center gap-2.5 rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted/50 hover:border-primary/30"
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
              const isLastMsg = messageIndex === messages.length - 1
              const timestamp = timestampsRef.current.get(message.id)

              return (
                <div
                  key={message.id}
                  className={cn("flex gap-3", isUser && "flex-row-reverse")}
                >
                  <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                    <AvatarFallback
                      className={cn(
                        "text-xs",
                        isUser
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={cn(
                      "flex min-w-0 max-w-[85%] flex-col gap-1",
                      isUser && "items-end"
                    )}
                  >
                    <Message from={message.role} className="max-w-full w-auto">
                      <MessageContent>
                        {message.parts.map((part, partIndex) => {
                          // ── Reasoning ──
                          if (isReasoningUIPart(part)) {
                            const isReasoningStreaming =
                              isLastMsg &&
                              status === "streaming" &&
                              message.parts.at(-1)?.type === "reasoning"
                            return (
                              <Reasoning
                                key={`reasoning-${partIndex}`}
                                isStreaming={isReasoningStreaming}
                              >
                                <ReasoningTrigger
                                  getThinkingMessage={(streaming, duration) =>
                                    streaming ? (
                                      <Shimmer duration={1}>Denke nach...</Shimmer>
                                    ) : (
                                      <span>
                                        Gedacht für {duration} Sekunde
                                        {duration !== 1 ? "n" : ""}
                                      </span>
                                    )
                                  }
                                />
                                <ReasoningContent>{part.text}</ReasoningContent>
                              </Reasoning>
                            )
                          }

                          // ── Text ──
                          if (part.type === "text") {
                            const isLastAssistant =
                              isAssistant && isLastMsg
                            return (
                              <Streamdown
                                key={`text-${partIndex}`}
                                plugins={streamdownPlugins}
                                caret="block"
                                isAnimating={isLastAssistant && status === "streaming"}
                              >
                                {part.text}
                              </Streamdown>
                            )
                          }

                          // ── Tools ──
                          if (isToolUIPart(part)) {
                            const toolName = part.type.replace(/^tool-/, "")

                            // Approval-requested → Confirmation dialog
                            if (part.state === "approval-requested") {
                              const toolInput = (part.input ?? {}) as Record<string, unknown>
                              return (
                                <Confirmation
                                  key={part.toolCallId}
                                  state="approval-requested"
                                >
                                  <ConfirmationTitle>Aktion bestätigen</ConfirmationTitle>
                                  <ConfirmationRequest>
                                    {getApprovalDescription(toolName, toolInput)}
                                  </ConfirmationRequest>
                                  <ConfirmationActions>
                                    <ConfirmationAction
                                      variant="approve"
                                      onClick={() =>
                                        addToolApprovalResponse({
                                          id: part.toolCallId,
                                          approved: true,
                                        })
                                      }
                                    >
                                      Genehmigen
                                    </ConfirmationAction>
                                    <ConfirmationAction
                                      variant="reject"
                                      onClick={() =>
                                        addToolApprovalResponse({
                                          id: part.toolCallId,
                                          approved: false,
                                        })
                                      }
                                    >
                                      Abbrechen
                                    </ConfirmationAction>
                                  </ConfirmationActions>
                                </Confirmation>
                              )
                            }

                            // Approval-responded → Show result
                            if (part.state === "approval-responded") {
                              const approved = part.approval?.approved === true
                              return (
                                <Confirmation
                                  key={part.toolCallId}
                                  state="approval-responded"
                                  approved={approved}
                                >
                                  <ConfirmationTitle>
                                    {approved ? "Genehmigt" : "Abgebrochen"}
                                  </ConfirmationTitle>
                                  {approved ? (
                                    <ConfirmationAccepted>
                                      Aktion wird ausgeführt...
                                    </ConfirmationAccepted>
                                  ) : (
                                    <ConfirmationRejected>
                                      Aktion wurde abgebrochen.
                                    </ConfirmationRejected>
                                  )}
                                </Confirmation>
                              )
                            }

                            // All other tool states → existing AdminToolDisplay
                            return (
                              <AdminToolDisplay
                                key={part.toolCallId}
                                toolName={toolName}
                                state={part.state}
                                output={"output" in part ? part.output : undefined}
                              />
                            )
                          }

                          return null
                        })}
                      </MessageContent>
                    </Message>

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
                    <Shimmer>Denke nach...</Shimmer>
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
        <PromptInput onSubmit={({ text }) => handleSend(text)}>
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Frage eingeben..."
            disabled={isLoading}
          />
          <PromptInputFooter>
            <span className="text-xs text-muted-foreground">
              Enter zum Senden
            </span>
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

// Action tools that change state (vs. read-only tools)
const ACTION_TOOLS = new Set([
  "send_email",
  "send_notification",
  "send_message",
  "update_client_status",
  "create_task_note",
])

const toolMeta: Record<string, { label: string; icon: typeof Bot }> = {
  client_lookup: { label: "Kundensuche", icon: Users },
  property_lookup_all: { label: "Immobiliensuche", icon: Building2 },
  financial_overview: { label: "Finanzübersicht", icon: TrendingUp },
  document_search_all: { label: "Dokumentensuche", icon: FileText },
  offer_management: { label: "Angebote", icon: Store },
  client_portfolio: { label: "Kundenportfolio", icon: Users },
  compose_email_draft: { label: "E-Mail-Entwurf", icon: Mail },
  activity_log: { label: "Aktivitäten", icon: Activity },
  send_email: { label: "E-Mail senden", icon: Mail },
  send_notification: { label: "Benachrichtigung", icon: Bell },
  send_message: { label: "Nachricht senden", icon: MessageSquare },
  update_client_status: { label: "Status ändern", icon: UserCog },
  create_task_note: { label: "Notiz erstellen", icon: StickyNote },
}

function AdminToolDisplay({
  toolName,
  state,
  output,
}: {
  toolName: string
  state: string
  output?: unknown
}) {
  const meta = toolMeta[toolName] ?? { label: toolName, icon: Bot }
  const Icon = meta.icon
  const isAction = ACTION_TOOLS.has(toolName)

  if (state === "input-streaming" || state === "input-available") {
    return (
      <div className={cn(
        "flex items-center gap-2 rounded-lg border border-dashed p-3",
        isAction && "border-primary/40 bg-primary/5"
      )}>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">
          {isAction ? `${meta.label} wird ausgeführt...` : `${meta.label}...`}
        </span>
      </div>
    )
  }

  if (state === "output-error") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
        <XCircle className="h-4 w-4 shrink-0" />
        <span>{isAction ? "Aktion fehlgeschlagen" : "Fehler beim Abrufen der Daten"}</span>
      </div>
    )
  }

  if (state !== "output-available" || !output) return null

  const result = output as Record<string, unknown>

  // Action tools get a special success/error display
  if (isAction) {
    const isSuccess = result.success === true
    return (
      <div className={cn(
        "flex items-center gap-2.5 rounded-lg border p-3 text-sm",
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
          : "border-destructive/30 bg-destructive/5 text-destructive"
      )}>
        {isSuccess ? (
          <CheckCircle2 className="h-4 w-4 shrink-0" />
        ) : (
          <XCircle className="h-4 w-4 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 font-medium">
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
          </div>
          {typeof result.message === "string" && (
            <p className="mt-0.5 text-xs opacity-80">{result.message}</p>
          )}
          {typeof result.error === "string" && (
            <p className="mt-0.5 text-xs opacity-80">{result.error}</p>
          )}
        </div>
      </div>
    )
  }

  // Read-only tools get compact display
  return (
    <div className="rounded-lg border bg-card p-3 text-card-foreground">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {meta.label}
      </div>
      <pre className="overflow-x-auto text-xs text-muted-foreground max-h-40">
        {JSON.stringify(output, null, 2)}
      </pre>
    </div>
  )
}

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
