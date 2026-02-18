"use client"

import { useState, useCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { cn } from "@/lib/utils"

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs"

interface PdfViewerProps {
  url: string
  className?: string
  maxWidth?: number
}

export function PdfViewer({
  url,
  className,
  maxWidth = 560,
}: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(1)

  const onLoadSuccess = useCallback(
    ({ numPages: total }: { numPages: number }) => {
      setNumPages(total)
      setPage(1)
    },
    []
  )

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <Document
        file={url}
        onLoadSuccess={onLoadSuccess}
        loading={
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
            PDF wird geladen...
          </div>
        }
        error={
          <div className="rounded border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            PDF konnte nicht geladen werden.
          </div>
        }
      >
        <Page
          pageNumber={page}
          width={maxWidth * scale}
          renderAnnotationLayer
          renderTextLayer
        />
      </Document>

      {numPages > 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          {/* Zoom controls */}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground w-10 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setScale((s) => Math.min(2, s + 0.25))}
            disabled={scale >= 2}
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>

          {/* Separator */}
          <div className="mx-1 h-4 w-px bg-border" />

          {/* Page controls */}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs text-muted-foreground">
            {page} / {numPages}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            disabled={page >= numPages}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}
