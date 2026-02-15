"use client"

import { useState } from "react"
import { FileText, Download } from "lucide-react"
import { toast } from "sonner"
import { downloadDocument } from "@/lib/supabase/storage"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "-"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentList({
  documents,
  categories,
  properties,
}: {
  documents: {
    id: string
    name: string
    file_path: string
    file_size: number | null
    mime_type: string | null
    created_at: string
    category_id: string | null
    category_name: string | null
    property_id: string | null
    property_name: string | null
  }[]
  categories: { id: string; name: string }[]
  properties: { id: string; name: string }[]
}) {
  const [categoryFilter, setCategoryFilter] = useState("")
  const [propertyFilter, setPropertyFilter] = useState("")

  const filtered = documents.filter((doc) => {
    if (categoryFilter && doc.category_id !== categoryFilter) return false
    if (propertyFilter && doc.property_id !== propertyFilter) return false
    return true
  })

  async function handleDownload(filePath: string, fileName: string) {
    try {
      await downloadDocument(filePath, fileName)
    } catch {
      toast.error("Download fehlgeschlagen")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <option value="">Alle Kategorien</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <option value="">Alle Immobilien</option>
          {properties.map((prop) => (
            <option key={prop.id} value={prop.id}>
              {prop.name}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Dokument</TableHead>
              <TableHead className="hidden sm:table-cell">Kategorie</TableHead>
              <TableHead className="hidden md:table-cell">Immobilie</TableHead>
              <TableHead className="hidden sm:table-cell">Datum</TableHead>
              <TableHead className="hidden md:table-cell text-right">
                Größe
              </TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">Keine Dokumente gefunden</p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate font-medium">{doc.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {doc.category_name ?? "-"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {doc.property_name ?? "-"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell tabular-nums text-muted-foreground">
                    {new Intl.DateTimeFormat("de-DE").format(
                      new Date(doc.created_at)
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right tabular-nums text-muted-foreground">
                    {formatFileSize(doc.file_size)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(doc.file_path, doc.name)}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Herunterladen</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
