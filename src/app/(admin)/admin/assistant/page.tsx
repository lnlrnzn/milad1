import type { Metadata } from "next"
import { AdminAssistantChat } from "@/components/admin/assistant/admin-assistant-chat"

export const metadata: Metadata = {
  title: "KI-Assistent - Admin",
}

export default function AdminAssistantPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">KI-Assistent</h1>
        <p className="text-sm text-muted-foreground">
          Fragen Sie den Assistenten zu Kunden, Immobilien, Finanzen und
          Verwaltung
        </p>
      </div>
      <AdminAssistantChat />
    </div>
  )
}
