"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/supabase/admin"
import { offerSchema } from "@/lib/validations/admin"

export async function createOffer(formData: FormData) {
  const { supabase, profile: admin } = await requireAdmin()

  const raw = Object.fromEntries(formData)
  const result = offerSchema.safeParse(raw)
  if (!result.success) return { error: result.error.issues[0].message }

  const { data: offer, error } = await supabase
    .from("offers")
    .insert(result.data)
    .select("id")
    .single()

  if (error) return { error: error.message }

  await supabase.from("admin_activity_log").insert({
    admin_id: admin.id,
    action: "offer.created",
    entity_type: "offer",
    entity_id: offer.id,
  })

  revalidatePath("/admin/marketplace")
  return { success: true }
}

export async function updateOffer(id: string, formData: FormData) {
  const { supabase, profile: admin } = await requireAdmin()

  const raw = Object.fromEntries(formData)
  const result = offerSchema.safeParse(raw)
  if (!result.success) return { error: result.error.issues[0].message }

  const { error } = await supabase.from("offers").update(result.data).eq("id", id)
  if (error) return { error: error.message }

  await supabase.from("admin_activity_log").insert({
    admin_id: admin.id,
    action: "offer.updated",
    entity_type: "offer",
    entity_id: id,
  })

  revalidatePath("/admin/marketplace")
  return { success: true }
}

export async function updateOfferStatus(id: string, status: "active" | "reserved" | "sold" | "withdrawn") {
  const { supabase, profile: admin } = await requireAdmin()

  const { error } = await supabase
    .from("offers")
    .update({ status })
    .eq("id", id)

  if (error) return { error: error.message }

  await supabase.from("admin_activity_log").insert({
    admin_id: admin.id,
    action: "offer.status_changed",
    entity_type: "offer",
    entity_id: id,
    details: { status },
  })

  revalidatePath("/admin/marketplace")
  return { success: true }
}
