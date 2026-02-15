import Link from "next/link"
import { FileText } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function RecentDocuments({
  documents,
}: {
  documents: {
    id: string
    name: string
    category_name: string | null
    created_at: string
  }[]
}) {
  if (documents.length === 0) return null

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-lg">
          Neueste Dokumente
        </CardTitle>
        <CardDescription>
          <Link href="/documents" className="hover:text-primary">
            Alle anzeigen
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 text-sm"
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{doc.name}</p>
                <p className="text-xs text-muted-foreground">
                  {doc.category_name ?? "Sonstige"} &middot;{" "}
                  {new Intl.DateTimeFormat("de-DE").format(
                    new Date(doc.created_at)
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
