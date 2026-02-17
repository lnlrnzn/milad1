"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/supabase/admin"
import { clientProfileSchema } from "@/lib/validations/admin"

export async function updateClientProfile(formData: FormData) {
  const { supabase, profile: adminProfile } = await requireAdmin()

  const userId = formData.get("user_id") as string
  if (!userId) return { error: "Benutzer-ID fehlt" }

  const raw: Record<string, unknown> = {}
  for (const key of clientProfileSchema.keyof().options) {
    const val = formData.get(key)
    if (val !== null && val !== "") {
      raw[key] = val
    } else {
      raw[key] = null
    }
  }
  raw.client_status = formData.get("client_status") ?? "prospect"

  const result = clientProfileSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  // Upsert client profile
  const { error } = await supabase
    .from("client_profiles")
    .upsert(
      { user_id: userId, ...result.data },
      { onConflict: "user_id" }
    )

  if (error) return { error: error.message }

  // Log activity
  await supabase.from("admin_activity_log").insert({
    admin_id: adminProfile.id,
    action: "client.updated",
    entity_type: "profile",
    entity_id: userId,
  })

  revalidatePath("/admin/clients")
  revalidatePath(`/admin/clients/${userId}`)
  return { success: true }
}

export async function updateClientStatus(userId: string, status: string) {
  const { supabase, profile: adminProfile } = await requireAdmin()

  const { error } = await supabase
    .from("client_profiles")
    .upsert(
      { user_id: userId, client_status: status },
      { onConflict: "user_id" }
    )

  if (error) return { error: error.message }

  await supabase.from("admin_activity_log").insert({
    admin_id: adminProfile.id,
    action: "client.status_changed",
    entity_type: "profile",
    entity_id: userId,
    details: { status },
  })

  revalidatePath("/admin/clients")
  revalidatePath(`/admin/clients/${userId}`)
  return { success: true }
}

export async function uploadDocumentForClient(formData: FormData) {
  const { supabase, profile: adminProfile } = await requireAdmin()

  const userId = formData.get("user_id") as string
  const propertyId = (formData.get("property_id") as string) || null
  const categoryId = (formData.get("category_id") as string) || null
  const file = formData.get("file") as File

  if (!userId || !file) return { error: "Benutzer-ID und Datei sind erforderlich" }

  const filePath = `${userId}/${propertyId ?? "general"}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, file)

  if (uploadError) return { error: uploadError.message }

  const { error: dbError } = await supabase.from("documents").insert({
    user_id: userId,
    property_id: propertyId,
    category_id: categoryId,
    name: file.name,
    file_path: filePath,
    file_size: file.size,
    mime_type: file.type,
  })

  if (dbError) return { error: dbError.message }

  await supabase.from("admin_activity_log").insert({
    admin_id: adminProfile.id,
    action: "document.uploaded",
    entity_type: "document",
    entity_id: userId,
    details: { fileName: file.name, propertyId },
  })

  revalidatePath(`/admin/clients/${userId}`)
  return { success: true }
}
