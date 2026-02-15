"use server"

import { createClient } from "@/lib/supabase/server"
import { forgotPasswordSchema } from "@/lib/validations/auth"

export type ForgotPasswordState = {
  error?: string
  success?: string
  fieldErrors?: Record<string, string[]>
}

export async function forgotPassword(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const raw = { email: formData.get("email") }

  const result = forgotPasswordSchema.safeParse(raw)
  if (!result.success) {
    return {
      fieldErrors: result.error.flatten().fieldErrors as Record<
        string,
        string[]
      >,
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(
    result.data.email,
    { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/auth/confirm` }
  )

  if (error) {
    return { error: "Fehler beim Senden der E-Mail. Bitte versuchen Sie es erneut." }
  }

  return {
    success:
      "Falls ein Konto mit dieser E-Mail existiert, erhalten Sie in Kürze eine E-Mail zum Zurücksetzen des Passworts.",
  }
}
