"use client"

import { useActionState } from "react"
import Link from "next/link"
import {
  forgotPassword,
  type ForgotPasswordState,
} from "@/app/(auth)/forgot-password/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: ForgotPasswordState = {}

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    forgotPassword,
    initialState
  )

  return (
    <Card>
      <form action={formAction}>
        <CardContent className="space-y-4 pt-6">
          {state.error && (
            <div className="rounded-md bg-danger/10 p-3 text-sm text-danger">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="rounded-md bg-success/10 p-3 text-sm text-success">
              {state.success}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link
            zum Zurücksetzen Ihres Passworts.
          </p>
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
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Senden..." : "Link senden"}
          </Button>
          <Link
            href="/login"
            className="text-center text-sm text-muted-foreground hover:text-primary"
          >
            Zurück zur Anmeldung
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
