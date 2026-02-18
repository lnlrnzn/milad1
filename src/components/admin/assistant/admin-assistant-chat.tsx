"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { AttachmentButton, AttachmentPreview } from "@/components/ai/attachment-ui"
import { CopyButton, FilePreview, formatTime } from "@/components/ai/chat-shared"
import { useMessageTimestamps } from "@/hooks/use-message-timestamps"
import { PdfViewerCard } from "@/components/pdf/pdf-viewer-card"
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
  Plus,
  Bell,
  MessageSquare,
  UserCog,
  StickyNote,
  CheckCircle2,
  XCircle,
  Sparkles,
  BarChart3,
  BookOpen,
  Save,
  FilePlus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { persistChatMessages, createChatSession } from "@/lib/chat/actions"

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
    case "save_document":
      return `Dokument "${input.filename ?? "unbekannt"}" speichern?`
    case "generate_pdf":
      return `PDF "${input.title ?? "unbekannt"}" generieren${input.saveToDocuments !== false ? " und speichern" : ""}?`
    case "create_client":
      return `Neuen Kunden "${input.firstName ?? ""} ${input.lastName ?? ""}" (${input.email ?? ""}) anlegen?`
    default:
      return `${toolName} ausführen?`
  }
}

export function AdminAssistantChat({
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
    () => new DefaultChatTransport({ api: "/api/admin-chat" }),
    []
  )

  const { messages, sendMessage, status, stop, addToolApprovalResponse } =
    useChat({
      transport,
      messages: initialMessages as import("ai").UIMessage[],
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
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
        const newId = await createChatSession(true)
        sessionIdRef.current = newId
        window.history.replaceState(null, "", `/admin/assistant/${newId}`)
      }
      const opts: { text: string; files?: FileUIPart[] } = { text: text.trim() }
      if (files && files.length > 0) opts.files = files
      sendMessage(opts)
      setInput("")
    },
    [sendMessage]
  )

  const handleNewChat = useCallback(() => {
    router.push("/admin/assistant")
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

                          // ── File attachments ──
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
                                          id: part.approval.id,
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
                                          id: part.approval.id,
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

// Action tools that change state (vs. read-only tools)
const ACTION_TOOLS = new Set([
  "send_email",
  "send_notification",
  "send_message",
  "update_client_status",
  "create_task_note",
  "create_client",
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
  create_client: { label: "Kunde anlegen", icon: UserCog },
  read_document: { label: "Dokument lesen", icon: BookOpen },
  save_document: { label: "Dokument speichern", icon: Save },
  generate_pdf: { label: "PDF generieren", icon: FilePlus },
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

  // read_document gets a special compact display
  if (toolName === "read_document") {
    if (result.error) {
      return (
        <div className="rounded-lg border bg-card p-3 text-card-foreground">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
          </div>
          <p className="text-sm text-red-500">{result.error as string}</p>
        </div>
      )
    }
    return (
      <div className="rounded-lg border bg-card p-3 text-card-foreground">
        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {meta.label}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{result.name as string}</span>
          <span>·</span>
          <span>{result.pageCount as number} Seiten</span>
        </div>
      </div>
    )
  }

  // generate_pdf / save_document — show success/error + PdfViewerCard
  if (toolName === "generate_pdf" || toolName === "save_document") {
    const isSuccess = result.success === true
    if (!isSuccess) {
      return (
        <div className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <XCircle className="h-4 w-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-medium">
              <Icon className="h-3.5 w-3.5" />
              {meta.label}
            </div>
            {typeof result.error === "string" && (
              <p className="mt-0.5 text-xs opacity-80">{result.error}</p>
            )}
          </div>
        </div>
      )
    }
    return (
      <div className="rounded-lg border bg-card p-3 text-card-foreground">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {meta.label}
        </div>
        {typeof result.message === "string" && (
          <p className="mb-2 text-xs text-green-600">{result.message}</p>
        )}
        <PdfViewerCard
          url={(result.signedUrl as string) ?? ""}
          filename={(result.name as string) ?? "dokument.pdf"}
          contentBase64={result.contentBase64 as string | undefined}
        />
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

