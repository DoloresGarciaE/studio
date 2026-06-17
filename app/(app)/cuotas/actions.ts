"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireStudio } from "@/lib/studio"
import {
  generarCuotas,
  recalcularEstado,
  refrescarVencidas,
} from "@/lib/billing/cuotas"
import { periodoActual } from "@/lib/billing/periodo"
import type { MetodoPago } from "@/lib/types"

export type ActionResult = { error?: string; success?: boolean; creadas?: number }

export async function generarCuotasDelMes(
  periodo?: string,
): Promise<ActionResult> {
  const { studio_id } = await requireStudio()
  const supabase = await createClient()
  const p = periodo ?? periodoActual()
  try {
    const creadas = await generarCuotas(supabase, studio_id, p)
    await refrescarVencidas(supabase, studio_id)
    revalidatePath("/", "layout")
    return { success: true, creadas }
  } catch {
    return { error: "No pudimos generar las cuotas." }
  }
}

export async function registrarPago(
  cuotaId: string,
  formData: FormData,
): Promise<ActionResult> {
  const { studio_id } = await requireStudio()
  const supabase = await createClient()

  const monto = Number(String(formData.get("monto") ?? "0").replace(",", "."))
  const metodo = String(formData.get("metodo") ?? "EFECTIVO") as MetodoPago
  const fechaRaw = String(formData.get("fecha") ?? "").trim()

  if (!monto || monto <= 0) return { error: "Ingresá un monto válido." }

  const { data: cuota } = await supabase
    .from("cuotas")
    .select("id")
    .eq("id", cuotaId)
    .eq("studio_id", studio_id)
    .maybeSingle()
  if (!cuota) return { error: "No encontramos la cuota." }

  const { data: pago, error } = await supabase
    .from("pagos")
    .insert({
      studio_id,
      cuota_id: cuotaId,
      monto,
      metodo,
      fecha: fechaRaw
        ? new Date(`${fechaRaw}T12:00:00`).toISOString()
        : new Date().toISOString(),
    })
    .select("id")
    .single()
  if (error || !pago) return { error: "No pudimos registrar el pago." }

  // Recibo numerado por estudio (uno por pago).
  const { data: last } = await supabase
    .from("recibos")
    .select("numero")
    .eq("studio_id", studio_id)
    .order("numero", { ascending: false })
    .limit(1)
    .maybeSingle()
  const numero = (last?.numero ?? 0) + 1
  await supabase
    .from("recibos")
    .insert({ studio_id, pago_id: pago.id, numero })

  await recalcularEstado(supabase, cuotaId)

  revalidatePath("/", "layout")
  return { success: true }
}

export async function eliminarPago(pagoId: string): Promise<ActionResult> {
  const { studio_id } = await requireStudio()
  const supabase = await createClient()

  const { data: pago } = await supabase
    .from("pagos")
    .select("cuota_id")
    .eq("id", pagoId)
    .eq("studio_id", studio_id)
    .maybeSingle()
  if (!pago) return { error: "No encontramos el pago." }

  const { error } = await supabase
    .from("pagos")
    .delete()
    .eq("id", pagoId)
    .eq("studio_id", studio_id)
  if (error) return { error: "No pudimos eliminar el pago." }

  await recalcularEstado(supabase, pago.cuota_id as string)

  revalidatePath("/", "layout")
  return { success: true }
}
