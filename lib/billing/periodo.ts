// Helpers de período. Un "período" es el primer día del mes en formato YYYY-MM-DD.

export function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`
}

export function periodoDe(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
}

export function periodoActual(d = new Date()): string {
  return periodoDe(d)
}

// Vencimiento por defecto: día 10 del mes del período.
export function vencimientoDe(periodo: string, dia = 10): string {
  const [y, m] = periodo.split("-")
  return `${y}-${m}-${String(dia).padStart(2, "0")}`
}

export function addMeses(periodo: string, n: number): string {
  const [y, m] = periodo.split("-").map(Number)
  return periodoDe(new Date(y, m - 1 + n, 1))
}

export function formatPeriodo(periodo: string): string {
  const [y, m] = periodo.split("-").map(Number)
  const label = new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(new Date(y, m - 1, 1))
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatFecha(fecha: string | Date): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)
}
