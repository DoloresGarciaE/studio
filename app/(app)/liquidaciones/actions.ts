"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireStudio } from "@/lib/studio"
import { generarLiquidaciones } from "@/lib/billing/liquidaciones"
import { periodoActual } from "@/lib/billing/periodo"

export type ActionResult = { error?: string; success?: boolean; creadas?: number }

export async function generarLiquidacionesDelMes(
  periodo?: string,
): Promise<ActionResult> {
  const { studio_id } = await requireStudio()
  const supabase = await createClient()
  try {
    const creadas = await generarLiquidaciones(
      supabase,
      studio_id,
      periodo ?? periodoActual(),
    )
    revalidatePath("/liquidaciones")
    return { success: true, creadas }
  } catch {
    return { error: "No pudimos generar las liquidaciones." }
  }
}

export async function marcarLiquidada(id: string): Promise<ActionResult> {
  const { studio_id } = await requireStudio()
  const supabase = await createClient()
  const { error } = await supabase
    .from("liquidaciones")
    .update({ estado: "LIQUIDADA" })
    .eq("id", id)
    .eq("studio_id", studio_id)
  if (error) return { error: "No pudimos actualizar la liquidación." }
  revalidatePath("/liquidaciones")
  return { success: true }
}

export async function marcarPendienteLiquidacion(
  id: string,
): Promise<ActionResult> {
  const { studio_id } = await requireStudio()
  const supabase = await createClient()
  const { error } = await supabase
    .from("liquidaciones")
    .update({ estado: "PENDIENTE" })
    .eq("id", id)
    .eq("studio_id", studio_id)
  if (error) return { error: "No pudimos actualizar la liquidación." }
  revalidatePath("/liquidaciones")
  return { success: true }
}

export async function registrarUsoSalon(
  formData: FormData,
): Promise<ActionResult> {
  const { studio_id } = await requireStudio()
  const supabase = await createClient()

  const profesor_id = String(formData.get("profesor_id") ?? "").trim()
  const salonRaw = String(formData.get("salon_id") ?? "").trim()
  const fecha = String(formData.get("fecha") ?? "").trim()
  const horas = Number(String(formData.get("horas") ?? "0").replace(",", "."))

  if (!profesor_id || profesor_id === "none") return { error: "Elegí un profesor." }
  if (!fecha) return { error: "Ingresá la fecha." }
  if (!horas || horas <= 0) return { error: "Ingresá las horas usadas." }

  const { error } = await supabase.from("uso_salon").insert({
    studio_id,
    profesor_id,
    salon_id: salonRaw && salonRaw !== "none" ? salonRaw : null,
    fecha,
    horas,
  })

  if (error) return { error: "No pudimos registrar el uso de salón." }
  revalidatePath("/liquidaciones")
  return { success: true }
}

export async function eliminarUsoSalon(id: string): Promise<ActionResult> {
  const { studio_id } = await requireStudio()
  const supabase = await createClient()
  const { error } = await supabase
    .from("uso_salon")
    .delete()
    .eq("id", id)
    .eq("studio_id", studio_id)
  if (error) return { error: "No pudimos eliminar el registro." }
  revalidatePath("/liquidaciones")
  return { success: true }
}
