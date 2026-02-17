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
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input"
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
} from "lucide-react"
import { cn } from "@/lib/utils"

const suggestions = [
  {
    icon: Users,
    label: "Kundenübersicht",
    prompt: "Zeig mir eine Übersicht aller Kunden mit Status und Portfolio-Größe.",
  },
  {
    icon: TrendingUp,
    label: "Portfolio-Analyse",
    prompt: "Wie sieht die unternehmensweite Finanzübersicht aus?",
  },
  {
    icon: Store,
    label: "Offene Angebote",
    prompt: "Welche aktiven Angebote gibt es im Marktplatz?",
  },
  {
    icon: Mail,
    label: "E-Mail verfassen",
    prompt: "Verfasse einen E-Mail-Entwurf an einen Kunden zum Thema Portfolioentwicklung.",
  },
]

const streamdownPlugins = { code }
const transport = new DefaultChatTransport({ api: "/api/admin-chat" })

function formatTime(date: Date) {
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}

export function AdminAssistantChat() {
  const [input, setInput] = useState("")
  const timestampsRef = useRef<Map<string, Date>>(new Map())
  const [, forceUpdate] = useState(0)

  const { messages, sendMessage, setMessages, status, stop } = useChat({ transport })
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
                  Admin Assistent
                </h2>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Ich kann Ihnen bei der Verwaltung von Kunden, Immobilien,
                  Finanzen und Kommunikation helfen.
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
                          if (part.type === "text") {
                            const isLastAssistant =
                              isAssistant && messageIndex === messages.length - 1
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

                          if (isToolUIPart(part)) {
                            const toolName = part.type.replace(/^tool-/, "")
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

// Tool display for admin tools
function AdminToolDisplay({
  toolName,
  state,
  output,
}: {
  toolName: string
  state: string
  output?: unknown
}) {
  const toolLabels: Record<string, { label: string; icon: typeof Bot }> = {
    client_lookup: { label: "Kundensuche", icon: Users },
    property_lookup_all: { label: "Immobiliensuche", icon: Building2 },
    financial_overview: { label: "Finanzübersicht", icon: TrendingUp },
    document_search_all: { label: "Dokumentensuche", icon: FileText },
    offer_management: { label: "Angebote", icon: Store },
    client_portfolio: { label: "Kundenportfolio", icon: Users },
    compose_email_draft: { label: "E-Mail-Entwurf", icon: Mail },
    activity_log: { label: "Aktivitäten", icon: Activity },
  }

  const tool = toolLabels[toolName] ?? { label: toolName, icon: Bot }
  const Icon = tool.icon

  if (state === "input-streaming" || state === "input-available") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed p-3">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">{tool.label}...</span>
      </div>
    )
  }

  if (state === "output-error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        Fehler beim Abrufen der Daten.
      </div>
    )
  }

  if (state !== "output-available" || !output) return null

  return (
    <div className="rounded-lg border bg-card p-3 text-card-foreground">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {tool.label}
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
