export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-forest-900 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl font-bold text-brand-gold-400">
            SDIA
          </h1>
          <p className="mt-1 text-sm text-brand-forest-200">
            Kundenportal für Immobilien-Investoren
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
