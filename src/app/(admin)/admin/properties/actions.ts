"use server"

import { revalidatePath } from "next/cache"
import { requireAdmin } from "@/lib/supabase/admin"
import {
  propertySchema,
  valuationSchema,
  financialsSchema,
} from "@/lib/validations/admin"

export async function createProperty(formData: FormData) {
  const { supabase, profile: admin } = await requireAdmin()

  const raw = Object.fromEntries(formData)
  const result = propertySchema.safeParse(raw)
  if (!result.success) return { error: result.error.issues[0].message }

  const { data: property, error } = await supabase
    .from("properties")
    .insert(result.data)
    .select("id")
    .single()

  if (error) return { error: error.message }

  await supabase.from("admin_activity_log").insert({
    admin_id: admin.id,
    action: "property.created",
    entity_type: "property",
    entity_id: property.id,
  })

  revalidatePath("/admin/properties")
  return { success: true, id: property.id }
}

export async function updateProperty(id: string, formData: FormData) {
  const { supabase, profile: admin } = await requireAdmin()

  const raw = Object.fromEntries(formData)
  const result = propertySchema.safeParse(raw)
  if (!result.success) return { error: result.error.issues[0].message }

  const { error } = await supabase
    .from("properties")
    .update(result.data)
    .eq("id", id)

  if (error) return { error: error.message }

  await supabase.from("admin_activity_log").insert({
    admin_id: admin.id,
    action: "property.updated",
    entity_type: "property",
    entity_id: id,
  })

  revalidatePath("/admin/properties")
  revalidatePath(`/admin/properties/${id}`)
  return { success: true }
}

export async function addValuation(formData: FormData) {
  const { supabase, profile: admin } = await requireAdmin()

  const raw = Object.fromEntries(formData)
  const result = valuationSchema.safeParse(raw)
  if (!result.success) return { error: result.error.issues[0].message }

  const { error } = await supabase
    .from("property_valuations")
    .insert(result.data)

  if (error) return { error: error.message }

  await supabase.from("admin_activity_log").insert({
    admin_id: admin.id,
    action: "valuation.added",
    entity_type: "valuation",
    entity_id: result.data.property_id,
  })

  revalidatePath(`/admin/properties/${result.data.property_id}`)
  return { success: true }
}

export async function updateFinancials(formData: FormData) {
  const { supabase, profile: admin } = await requireAdmin()

  const raw = Object.fromEntries(formData)
  const result = financialsSchema.safeParse(raw)
  if (!result.success) return { error: result.error.issues[0].message }

  const { error } = await supabase
    .from("property_financials")
    .upsert(result.data, { onConflict: "property_id,month" })

  if (error) {
    // If upsert fails, try insert
    const { error: insertError } = await supabase
      .from("property_financials")
      .insert(result.data)
    if (insertError) return { error: insertError.message }
  }

  await supabase.from("admin_activity_log").insert({
    admin_id: admin.id,
    action: "financials.updated",
    entity_type: "financials",
    entity_id: result.data.property_id,
  })

  revalidatePath(`/admin/properties/${result.data.property_id}`)
  return { success: true }
}

export async function assignClient(propertyId: string, userId: string) {
  const { supabase, profile: admin } = await requireAdmin()

  const { error } = await supabase.from("user_properties").insert({
    property_id: propertyId,
    user_id: userId,
    ownership_percentage: 100,
  })

  if (error) return { error: error.message }

  await supabase.from("admin_activity_log").insert({
    admin_id: admin.id,
    action: "property.assigned",
    entity_type: "property",
    entity_id: propertyId,
    details: { userId },
  })

  revalidatePath(`/admin/properties/${propertyId}`)
  return { success: true }
}

export async function removeClient(propertyId: string, userId: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from("user_properties")
    .delete()
    .eq("property_id", propertyId)
    .eq("user_id", userId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/properties/${propertyId}`)
  return { success: true }
}
