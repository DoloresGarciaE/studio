"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireStudio } from "@/lib/studio"

export type ActionResult = { error?: string; success?: boolean }

function parseSalon(formData: FormData) {
  return { nombre: String(formData.get("nombre") ?? "").trim() }
}

export async function createSalon(formData: FormData): Promise<ActionResult> {
  const values = parseSalon(formData)
  if (!values.nombre) return { error: "El nombre es obligatorio." }

  const { studio_id } = await requireStudio()
  const supabase = await createClient()
  const { error } = await supabase
    .from("salones")
    .insert({ ...values, studio_id })

  if (error) return { error: "No pudimos guardar el salón." }
  revalidatePath("/salones")
  return { success: true }
}

export async function updateSalon(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const values = parseSalon(formData)
  if (!values.nombre) return { error: "El nombre es obligatorio." }

  const { studio_id } = await requireStudio()
  const supabase = await createClient()
  const { error } = await supabase
    .from("salones")
    .update(values)
    .eq("id", id)
    .eq("studio_id", studio_id)

  if (error) return { error: "No pudimos actualizar el salón." }
  revalidatePath("/salones")
  return { success: true }
}

export async function deleteSalon(id: string): Promise<ActionResult> {
  const { studio_id } = await requireStudio()
  const supabase = await createClient()
  const { error } = await supabase
    .from("salones")
    .delete()
    .eq("id", id)
    .eq("studio_id", studio_id)

  if (error) return { error: "No pudimos eliminar el salón." }
  revalidatePath("/salones")
  return { success: true }
}
