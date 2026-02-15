const formatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const formatterDetailed = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function CurrencyDisplay({
  value,
  detailed = false,
  className,
}: {
  value: number
  detailed?: boolean
  className?: string
}) {
  const formatted = detailed
    ? formatterDetailed.format(value)
    : formatter.format(value)
  return <span className={className}>{formatted}</span>
}

export function formatCurrency(value: number, detailed = false): string {
  return detailed
    ? formatterDetailed.format(value)
    : formatter.format(value)
}
