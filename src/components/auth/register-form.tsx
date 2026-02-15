"use client"

import { useActionState } from "react"
import Link from "next/link"
import { register, type RegisterState } from "@/app/(auth)/register/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: RegisterState = {}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, initialState)

  return (
    <Card>
      <form action={formAction}>
        <CardContent className="space-y-4 pt-6">
          {state.error && (
            <div className="rounded-md bg-danger/10 p-3 text-sm text-danger">
              {state.error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Max"
                autoComplete="given-name"
                required
              />
              {state.fieldErrors?.firstName && (
                <p className="text-sm text-danger">
                  {state.fieldErrors.firstName[0]}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Mustermann"
                autoComplete="family-name"
                required
              />
              {state.fieldErrors?.lastName && (
                <p className="text-sm text-danger">
                  {state.fieldErrors.lastName[0]}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="ihre@email.de"
              autoComplete="email"
              required
            />
            {state.fieldErrors?.email && (
              <p className="text-sm text-danger">
                {state.fieldErrors.email[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mind. 8 Zeichen"
              autoComplete="new-password"
              required
            />
            {state.fieldErrors?.password && (
              <p className="text-sm text-danger">
                {state.fieldErrors.password[0]}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Passwort wiederholen"
              autoComplete="new-password"
              required
            />
            {state.fieldErrors?.confirmPassword && (
              <p className="text-sm text-danger">
                {state.fieldErrors.confirmPassword[0]}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Registrieren..." : "Konto erstellen"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Bereits ein Konto?{" "}
            <Link href="/login" className="hover:text-primary">
              Anmelden
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
