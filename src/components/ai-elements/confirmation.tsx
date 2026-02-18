"use client"

import { type ReactNode } from "react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ShieldQuestion, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Types ────────────────────────────────────────────────────────────

type ApprovalState = "approval-requested" | "approval-responded"

interface ConfirmationProps {
  state: ApprovalState
  approved?: boolean
  children: ReactNode
  className?: string
}

// ── Root ─────────────────────────────────────────────────────────────

export function Confirmation({
  state,
  approved,
  children,
  className,
}: ConfirmationProps) {
  if (state === "approval-responded") {
    return approved ? (
      <Alert className={cn("border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950", className)}>
        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        {children}
      </Alert>
    ) : (
      <Alert variant="destructive" className={className}>
        <XCircle className="h-4 w-4" />
        {children}
      </Alert>
    )
  }

  // approval-requested
  return (
    <Alert className={cn("border-primary/30 bg-primary/5", className)}>
      <ShieldQuestion className="h-4 w-4 text-primary" />
      {children}
    </Alert>
  )
}

// ── Sub-components ───────────────────────────────────────────────────

export function ConfirmationTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <AlertTitle className={className}>{children}</AlertTitle>
}

export function ConfirmationRequest({ children, className }: { children: ReactNode; className?: string }) {
  return <AlertDescription className={className}>{children}</AlertDescription>
}

export function ConfirmationAccepted({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <AlertDescription className={cn("text-emerald-700 dark:text-emerald-300", className)}>
      {children}
    </AlertDescription>
  )
}

export function ConfirmationRejected({ children, className }: { children: ReactNode; className?: string }) {
  return <AlertDescription className={className}>{children}</AlertDescription>
}

// ── Actions ──────────────────────────────────────────────────────────

interface ConfirmationActionsProps {
  children: ReactNode
  className?: string
}

export function ConfirmationActions({ children, className }: ConfirmationActionsProps) {
  return (
    <div className={cn("col-start-2 flex items-center gap-2 pt-2", className)}>
      {children}
    </div>
  )
}

interface ConfirmationActionProps {
  variant?: "approve" | "reject"
  onClick: () => void
  children: ReactNode
  className?: string
}

export function ConfirmationAction({
  variant = "approve",
  onClick,
  children,
  className,
}: ConfirmationActionProps) {
  return (
    <Button
      size="sm"
      variant={variant === "approve" ? "default" : "outline"}
      onClick={onClick}
      className={cn(
        variant === "reject" && "text-muted-foreground",
        className
      )}
    >
      {children}
    </Button>
  )
}
