"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { registerSchema } from "@/lib/validations/auth"

export type RegisterState = {
  error?: string
  success?: string
  fieldErrors?: Record<string, string[]>
}

export async function register(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const raw = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  }

  const result = registerSchema.safeParse(raw)
  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return {
      error: `Supabase nicht konfiguriert. URL: ${url ? "OK" : "FEHLT"}, Key: ${key ? "OK" : "FEHLT"}`,
    }
  }
  // Debug: show first/last chars to verify values are correct
  const urlPreview = `${url.slice(0, 20)}...${url.slice(-10)} (len:${url.length})`
  const keyPreview = `${key.slice(0, 10)}...${key.slice(-5)} (len:${key.length})`
  console.log("Supabase config:", urlPreview, keyPreview)

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: {
          first_name: result.data.firstName,
          last_name: result.data.lastName,
        },
      },
    })

    if (error) {
      console.error("Registration error:", error.message, error.status)
      return { error: `Registrierung fehlgeschlagen: ${error.message}` }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("Registration exception:", msg)
    return { error: `Fehler: ${msg} | URL: ${urlPreview}` }
  }

  redirect("/login?registered=true")
}
