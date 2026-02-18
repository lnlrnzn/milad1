"use client"

import { useState, useCallback } from "react"
import { Copy, Check, File as FileIcon } from "lucide-react"

// ---------------------------------------------------------------------------
// formatTime
// ---------------------------------------------------------------------------

export function formatTime(date: Date) {
  return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
}

// ---------------------------------------------------------------------------
// CopyButton
// ---------------------------------------------------------------------------

export function CopyButton({ text }: { text: string }) {
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
// FilePreview – renders file attachments in chat messages
// ---------------------------------------------------------------------------

export function FilePreview({
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
