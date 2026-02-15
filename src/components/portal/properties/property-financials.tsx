import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/components/shared/currency-display"
import { cn } from "@/lib/utils"

export function PropertyFinancials({
  financials,
}: {
  financials: {
    month: string
    rental_income: number
    additional_costs: number
    management_fee: number
    mortgage_payment: number
    net_income: number | null
  }[]
}) {
  const sorted = [...financials].sort(
    (a, b) => new Date(b.month).getTime() - new Date(a.month).getTime()
  )

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-heading text-lg">
          Monatliche Finanzen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Monat</TableHead>
              <TableHead className="text-right">Miete</TableHead>
              <TableHead className="text-right">Nebenkosten</TableHead>
              <TableHead className="text-right">Verwaltung</TableHead>
              <TableHead className="text-right">Kreditrate</TableHead>
              <TableHead className="text-right">Netto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((f) => (
              <TableRow key={f.month}>
                <TableCell>
                  {new Intl.DateTimeFormat("de-DE", {
                    month: "short",
                    year: "numeric",
                  }).format(new Date(f.month))}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(f.rental_income, true)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  -{formatCurrency(f.additional_costs, true)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  -{formatCurrency(f.management_fee, true)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  -{formatCurrency(f.mortgage_payment, true)}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right tabular-nums font-semibold",
                    (f.net_income ?? 0) >= 0 ? "text-success" : "text-danger"
                  )}
                >
                  {formatCurrency(f.net_income ?? 0, true)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
