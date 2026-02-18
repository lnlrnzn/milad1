"use client"

import { usePromptInputAttachments } from "@/components/ai-elements/prompt-input"
import {
  PromptInputHeader,
  PromptInputButton,
} from "@/components/ai-elements/prompt-input"
import { Paperclip, X, File as FileIcon } from "lucide-react"

export function AttachmentButton() {
  const { openFileDialog } = usePromptInputAttachments()
  return (
    <PromptInputButton onClick={openFileDialog} title="Datei anhängen">
      <Paperclip className="h-4 w-4" />
    </PromptInputButton>
  )
}

export function AttachmentPreview() {
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
            <span className="max-w-[120px] truncate">
              {file.filename ?? "Datei"}
            </span>
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
