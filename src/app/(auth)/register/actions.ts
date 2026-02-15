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

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      error: `Supabase nicht konfiguriert. URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? "OK" : "FEHLT"}, Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "OK" : "FEHLT"}`,
    }
  }

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

  redirect("/login?registered=true")
}
