"use client"

import { lazy, Suspense, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Eye, FileText } from "lucide-react"

const PdfViewer = lazy(() =>
  import("@/components/pdf/pdf-viewer").then((m) => ({
    default: m.PdfViewer,
  }))
)

interface PdfViewerCardProps {
  /** Signed URL or data: URL */
  url: string
  filename: string
  /** Base64 content for download if no signed URL */
  contentBase64?: string
}

export function PdfViewerCard({
  url,
  filename,
  contentBase64,
}: PdfViewerCardProps) {
  const [open, setOpen] = useState(false)

  // For download: prefer signed URL, fall back to data URL from base64
  const downloadUrl =
    url ||
    (contentBase64
      ? `data:application/pdf;base64,${contentBase64}`
      : "#")

  // For viewer: prefer signed URL, fall back to data URL from base64
  const viewUrl =
    url ||
    (contentBase64
      ? `data:application/pdf;base64,${contentBase64}`
      : null)

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
        <FileText className="h-4 w-4 shrink-0 text-primary" />
        <span className="flex-1 truncate text-sm font-medium">{filename}</span>

        <div className="flex items-center gap-1">
          {viewUrl && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon-sm" title="Vorschau">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    {filename}
                  </DialogTitle>
                </DialogHeader>
                <Suspense
                  fallback={
                    <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                      Lade PDF-Viewer...
                    </div>
                  }
                >
                  <PdfViewer url={viewUrl} maxWidth={680} />
                </Suspense>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="ghost" size="icon-sm" asChild title="Herunterladen">
            <a href={downloadUrl} download={filename}>
              <Download className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
