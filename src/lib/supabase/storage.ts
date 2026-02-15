import { createClient } from "@/lib/supabase/client"

export async function downloadDocument(filePath: string, fileName: string) {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from("documents")
    .download(filePath)

  if (error || !data) {
    throw new Error("Download fehlgeschlagen")
  }

  const url = URL.createObjectURL(data)
  const a = document.createElement("a")
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
