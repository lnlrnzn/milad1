import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/components/shared/currency-display"

const typeLabels: Record<string, string> = {
  apartment: "Wohnung",
  house: "Haus",
  multi_family: "MFH",
  commercial: "Gewerbe",
}

export interface PropertyRow {
  id: string
  name: string
  address: string
  type: string
  purchase_price: number
  current_value: number
  monthly_rent: number
}

export function ClientPropertiesTable({
  properties,
}: {
  properties: PropertyRow[]
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead className="text-right">Kaufpreis</TableHead>
              <TableHead className="text-right">Marktwert</TableHead>
              <TableHead className="text-right">Miete/Mo.</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Keine Immobilien zugewiesen.
                </TableCell>
              </TableRow>
            ) : (
              properties.map((p) => (
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
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(p.purchase_price)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(p.current_value)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(p.monthly_rent, true)}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/properties/${p.id}`}>
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
