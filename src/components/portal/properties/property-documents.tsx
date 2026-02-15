import { FileText, Download } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function PropertyDocuments({
  documents,
}: {
  documents: {
    id: string
    name: string
    category_name: string | null
    file_size: number | null
    created_at: string
  }[]
}) {
  function formatFileSize(bytes: number | null): string {
    if (!bytes) return ""
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-heading text-lg">Dokumente</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/documents">Alle Dokumente</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Keine Dokumente zu diesem Objekt vorhanden.
          </p>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.category_name ?? "Sonstige"} &middot;{" "}
                      {formatFileSize(doc.file_size)} &middot;{" "}
                      {new Intl.DateTimeFormat("de-DE").format(
                        new Date(doc.created_at)
                      )}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Herunterladen</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
