// Formateo centralizado de plata. Un solo lugar para la moneda AR.
const currency = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
})

export function formatCurrency(amount: number | null | undefined): string {
  return currency.format(Number(amount ?? 0))
}

export function initials(nombre: string): string {
  const parts = nombre.trim().split(/\s+/).filter(Boolean)
  const result = parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
  return result || "?"
}
