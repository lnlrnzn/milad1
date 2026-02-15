"use client"

import { useActionState } from "react"
import Link from "next/link"
import { login, type LoginState } from "@/app/(auth)/login/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: LoginState = {}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState)

  return (
    <Card>
      <form action={formAction}>
        <CardContent className="space-y-4 pt-6">
          {state.error && (
            <div className="rounded-md bg-danger/10 p-3 text-sm text-danger">
              {state.error}
            </div>
          )}
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
              placeholder="Ihr Passwort"
              autoComplete="current-password"
              required
            />
            {state.fieldErrors?.password && (
              <p className="text-sm text-danger">
                {state.fieldErrors.password[0]}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Anmelden..." : "Anmelden"}
          </Button>
          <div className="flex w-full justify-between text-sm">
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-primary"
            >
              Passwort vergessen?
            </Link>
            <Link
              href="/register"
              className="text-muted-foreground hover:text-primary"
            >
              Registrieren
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
