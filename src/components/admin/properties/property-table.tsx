"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, ChevronRight } from "lucide-react"
import { formatCurrency } from "@/components/shared/currency-display"

type Property = {
  id: string
  name: string
  address: string
  type: string
  status: string
  purchase_price: number
  current_value: number
  owner_names: string[]
}

const typeLabels: Record<string, string> = {
  apartment: "Wohnung",
  house: "Haus",
  multi_family: "MFH",
  commercial: "Gewerbe",
}

const statusLabels: Record<string, string> = {
  active: "Aktiv",
  sold: "Verkauft",
  in_acquisition: "In Erwerb",
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  sold: "bg-gray-100 text-gray-600",
  in_acquisition: "bg-blue-100 text-blue-700",
}

export function PropertyTable({ properties }: { properties: Property[] }) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search) return properties
    const q = search.toLowerCase()
    return properties.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        p.owner_names.some((n) => n.toLowerCase().includes(q))
    )
  }, [properties, search])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Immobilien suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Kaufpreis</TableHead>
              <TableHead className="text-right">Marktwert</TableHead>
              <TableHead>Eigentümer</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  Keine Immobilien gefunden.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.address}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {typeLabels[p.type] ?? p.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[p.status]}
                    >
                      {statusLabels[p.status] ?? p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(p.purchase_price)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(p.current_value)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.owner_names.length > 0
                      ? p.owner_names.join(", ")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/properties/${p.id}`}>
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
