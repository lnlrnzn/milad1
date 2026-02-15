import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { SettingsForm } from "@/components/portal/settings/settings-form"

export const metadata: Metadata = {
  title: "Einstellungen",
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Einstellungen</h1>
        <p className="text-sm text-muted-foreground">
          Profil und Kontoeinstellungen verwalten
        </p>
      </div>

      <SettingsForm
        profile={{
          first_name: profile?.first_name ?? "",
          last_name: profile?.last_name ?? "",
          email: profile?.email ?? user.email ?? "",
          phone: profile?.phone ?? "",
        }}
      />
    </div>
  )
}
