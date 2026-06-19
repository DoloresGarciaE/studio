"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireStudio } from "@/lib/studio"

export type ActionResult = { error?: string; success?: boolean }

function parseProfesor(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim()
  const tipo = String(formData.get("tipo") ?? "TITULAR")
  const comisionRaw = String(formData.get("comision_pct") ?? "").trim()
  const tarifaRaw = String(formData.get("tarifa_hora") ?? "").trim()
  return {
    nombre,
    tipo,
    comision_pct: comisionRaw ? Number(comisionRaw) : null,
    tarifa_hora: tarifaRaw ? Number(tarifaRaw) : null,
  }
}

export async function createProfesor(
  formData: FormData,
): Promise<ActionResult> {
  const values = parseProfesor(formData)
  if (!values.nombre) return { error: "El nombre es obligatorio." }

  const member = await requireStudio()
  const supabase = await createClient()
  const { error } = await supabase
    .from("profesores")
    .insert({ ...values, studio_id: member.studio_id })

  if (error) return { error: "No pudimos guardar el profesor." }
  revalidatePath("/profesores")
  return { success: true }
}

export async function updateProfesor(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const values = parseProfesor(formData)
  if (!values.nombre) return { error: "El nombre es obligatorio." }

  const member = await requireStudio()
  const supabase = await createClient()
  const { error } = await supabase
    .from("profesores")
    .update(values)
    .eq("id", id)
    .eq("studio_id", member.studio_id)

  if (error) return { error: "No pudimos actualizar el profesor." }
  revalidatePath("/profesores")
  return { success: true }
}

export async function deleteProfesor(id: string): Promise<ActionResult> {
  const member = await requireStudio()
  const supabase = await createClient()
  const { error } = await supabase
    .from("profesores")
    .delete()
    .eq("id", id)
    .eq("studio_id", member.studio_id)

  if (error) return { error: "No pudimos eliminar el profesor." }
  revalidatePath("/profesores")
  return { success: true }
}
