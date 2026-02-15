"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { User, Lock, Save } from "lucide-react"

export function SettingsForm({
  profile,
}: {
  profile: {
    first_name: string
    last_name: string
    email: string
    phone: string
  }
}) {
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const router = useRouter()

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = createClient()
      const formData = new FormData(e.currentTarget)

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: formData.get("first_name") as string,
          last_name: formData.get("last_name") as string,
          phone: formData.get("phone") as string,
        })
        .eq("email", profile.email)

      if (error) throw error

      toast.success("Profil erfolgreich aktualisiert")
      router.refresh()
    } catch {
      toast.error("Fehler beim Speichern des Profils")
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setChangingPassword(true)

    try {
      const supabase = createClient()
      const formData = new FormData(e.currentTarget)
      const newPassword = formData.get("new_password") as string
      const confirmPassword = formData.get("confirm_password") as string

      if (newPassword !== confirmPassword) {
        toast.error("Passwörter stimmen nicht überein")
        return
      }

      if (newPassword.length < 8) {
        toast.error("Passwort muss mindestens 8 Zeichen lang sein")
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      toast.success("Passwort erfolgreich geändert")
      e.currentTarget.reset()
    } catch {
      toast.error("Fehler beim Ändern des Passworts")
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="grid gap-6 max-w-2xl">
      {/* Profile section */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="font-heading text-lg">
              Persönliche Daten
            </CardTitle>
          </div>
          <CardDescription>
            Aktualisieren Sie Ihre persönlichen Informationen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="first_name">Vorname</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  defaultValue={profile.first_name}
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nachname</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  defaultValue={profile.last_name}
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                E-Mail-Adresse kann nicht geändert werden
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={profile.phone}
                placeholder="+49 123 4567890"
                autoComplete="tel"
              />
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Speichern..." : "Speichern"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password section */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle className="font-heading text-lg">
              Passwort ändern
            </CardTitle>
          </div>
          <CardDescription>
            Ändern Sie Ihr Anmeldepasswort
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">Neues Passwort</Label>
              <Input
                id="new_password"
                name="new_password"
                type="password"
                autoComplete="new-password"
                placeholder="Mindestens 8 Zeichen"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Passwort bestätigen</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                placeholder="Passwort wiederholen"
              />
            </div>
            <Separator />
            <div className="flex justify-end">
              <Button type="submit" disabled={changingPassword}>
                <Lock className="mr-2 h-4 w-4" />
                {changingPassword ? "Ändern..." : "Passwort ändern"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
