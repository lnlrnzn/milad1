"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, ChevronRight, Users } from "lucide-react"
import { formatCurrency } from "@/components/shared/currency-display"

type Client = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  created_at: string
  client_status: string | null
  annual_salary: number | null
  advisor_name: string | null
  property_count: number
}

const statusLabels: Record<string, string> = {
  prospect: "Interessent",
  active: "Aktiv",
  inactive: "Inaktiv",
}

const statusColors: Record<string, string> = {
  prospect: "bg-[oklch(0.38_0.08_160/0.1)] text-[oklch(0.32_0.08_160)]",
  active: "bg-[oklch(0.55_0.08_75/0.12)] text-[oklch(0.42_0.08_75)]",
  inactive: "bg-muted text-muted-foreground",
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(dateStr))
}

export function ClientTable({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        !search ||
        `${c.first_name} ${c.last_name} ${c.email}`
          .toLowerCase()
          .includes(search.toLowerCase())
      const matchesStatus =
        statusFilter === "all" || c.client_status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [clients, search, statusFilter])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Kunden suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="prospect">Interessent</SelectItem>
            <SelectItem value="active">Aktiv</SelectItem>
            <SelectItem value="inactive">Inaktiv</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Immobilien</TableHead>
              <TableHead className="text-right">Gehalt</TableHead>
              <TableHead>Berater</TableHead>
              <TableHead>Registriert</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      {search || statusFilter !== "all"
                        ? "Keine Kunden für diese Filter gefunden."
                        : "Noch keine Kunden vorhanden."}
                    </p>
                    {!search && statusFilter === "all" && (
                      <Link href="/admin/clients">
                        <Button variant="outline" size="sm" className="mt-1">
                          Ersten Kunden anlegen
                        </Button>
                      </Link>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((client) => (
                <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {[client.first_name, client.last_name].filter(Boolean).join(" ") || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.email}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[client.client_status ?? "prospect"]}
                    >
                      {statusLabels[client.client_status ?? "prospect"]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {client.property_count}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {client.annual_salary
                      ? formatCurrency(client.annual_salary)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {client.advisor_name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(client.created_at)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/clients/${client.id}`}>
                      <Button variant="ghost" size="icon-sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
