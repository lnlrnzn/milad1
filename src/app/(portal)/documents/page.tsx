import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { DocumentList } from "@/components/portal/documents/document-list"
import { DocumentUpload } from "@/components/portal/documents/document-upload"

export const metadata: Metadata = {
  title: "Dokumente",
}

export default async function DocumentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const [
    { data: documents },
    { data: categories },
    { data: userProperties },
  ] = await Promise.all([
    supabase
      .from("documents")
      .select(
        "id, name, file_path, file_size, mime_type, created_at, category_id, property_id, document_categories(name), properties(name)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("document_categories")
      .select("id, name")
      .order("sort_order", { ascending: true }),
    supabase
      .from("user_properties")
      .select("properties(id, name)")
      .eq("user_id", user.id),
  ])

  const formattedDocs = (documents ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    file_path: d.file_path,
    file_size: d.file_size,
    mime_type: d.mime_type,
    created_at: d.created_at,
    category_id: d.category_id,
    category_name:
      (d.document_categories as unknown as { name: string } | null)?.name ??
      null,
    property_id: d.property_id,
    property_name:
      (d.properties as unknown as { name: string } | null)?.name ?? null,
  }))

  const propertyOptions = (userProperties ?? [])
    .map((up) => up.properties as unknown as { id: string; name: string })
    .filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Dokumente</h1>
          <p className="text-sm text-muted-foreground">
            {formattedDocs.length} Dokument
            {formattedDocs.length !== 1 ? "e" : ""}
          </p>
        </div>
        <DocumentUpload
          userId={user.id}
          categories={categories ?? []}
          properties={propertyOptions}
        />
      </div>

      <DocumentList
        documents={formattedDocs}
        categories={categories ?? []}
        properties={propertyOptions}
      />
    </div>
  )
}
