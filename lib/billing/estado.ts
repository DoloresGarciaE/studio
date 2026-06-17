import type { EstadoCuota, Pago } from "@/lib/types"

// Normaliza un embed de Supabase que puede venir como objeto o array de 1.
export function unwrapOne<T>(x: T | T[] | null | undefined): T | null {
  if (Array.isArray(x)) return x[0] ?? null
  return x ?? null
}

// Suma de pagos de una cuota (los montos pueden venir como number o string).
export function sumPagos(
  pagos?: Pick<Pago, "monto">[] | null,
): number {
  return (pagos ?? []).reduce((acc, p) => acc + Number(p.monto), 0)
}

export function saldo(monto: number, pagado: number): number {
  return Math.max(0, Number(monto) - pagado)
}

// Estado real de una cuota a partir de lo pagado y el vencimiento.
// Prioridad: PAGADA > VENCIDA > PARCIAL > PENDIENTE.
export function deriveEstado(
  monto: number,
  pagado: number,
  vencimiento: string,
  hoy: Date = new Date(),
): EstadoCuota {
  if (pagado >= Number(monto)) return "PAGADA"
  const venc = new Date(`${vencimiento}T23:59:59`)
  if (hoy > venc) return "VENCIDA"
  if (pagado > 0) return "PARCIAL"
  return "PENDIENTE"
}

// "Por vencer" es un estado de UI (no de DB): pendiente con vencimiento próximo.
export function esPorVencer(
  estado: EstadoCuota,
  vencimiento: string,
  dias = 7,
  hoy: Date = new Date(),
): boolean {
  if (estado !== "PENDIENTE") return false
  const venc = new Date(`${vencimiento}T00:00:00`)
  const limite = new Date(hoy)
  limite.setDate(limite.getDate() + dias)
  return venc <= limite
}

// Estado "efectivo" para mostrar en la UI (mete POR_VENCER encima de PENDIENTE).
export type EstadoUI = EstadoCuota | "POR_VENCER"

export function estadoUI(
  estado: EstadoCuota,
  vencimiento: string,
  hoy: Date = new Date(),
): EstadoUI {
  return esPorVencer(estado, vencimiento, 7, hoy) ? "POR_VENCER" : estado
}
