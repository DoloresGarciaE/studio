"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireStudio } from "@/lib/studio"

export type ActionResult = { error?: string; success?: boolean }

function parseClase(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim()
  const dia_horario = String(formData.get("dia_horario") ?? "").trim() || null
  const arancelRaw = String(formData.get("arancel_mensual") ?? "0").trim()
  const profesor_id = String(formData.get("profesor_id") ?? "").trim() || null
  const salon_id = String(formData.get("salon_id") ?? "").trim() || null
  return {
    nombre,
    dia_horario,
    arancel_mensual: arancelRaw ? Number(arancelRaw) : 0,
    profesor_id: profesor_id === "none" ? null : profesor_id,
    salon_id: salon_id === "none" ? null : salon_id,
  }
}

export async function createClase(formData: FormData): Promise<ActionResult> {
  const values = parseClase(formData)
  if (!values.nombre) return { error: "El nombre es obligatorio." }

  const member = await requireStudio()
  const supabase = await createClient()
  const { error } = await supabase
    .from("clases")
    .insert({ ...values, studio_id: member.studio_id })

  if (error) return { error: "No pudimos guardar la clase." }
  revalidatePath("/clases")
  return { success: true }
}

export async function updateClase(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const values = parseClase(formData)
  if (!values.nombre) return { error: "El nombre es obligatorio." }

  const member = await requireStudio()
  const supabase = await createClient()
  const { error } = await supabase
    .from("clases")
    .update(values)
    .eq("id", id)
    .eq("studio_id", member.studio_id)

  if (error) return { error: "No pudimos actualizar la clase." }
  revalidatePath("/clases")
  return { success: true }
}

export async function deleteClase(id: string): Promise<ActionResult> {
  const member = await requireStudio()
  const supabase = await createClient()
  const { error } = await supabase
    .from("clases")
    .delete()
    .eq("id", id)
    .eq("studio_id", member.studio_id)

  if (error) return { error: "No pudimos eliminar la clase." }
  revalidatePath("/clases")
  return { success: true }
}
