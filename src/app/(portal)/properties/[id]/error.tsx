"use client"

export default function PropertyDetailError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <p className="text-muted-foreground">Etwas ist schiefgelaufen.</p>
      <button onClick={reset} className="text-primary underline">
        Erneut versuchen
      </button>
    </div>
  )
}
