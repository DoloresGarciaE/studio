"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { requireStudio } from "@/lib/studio"

export type ActionResult = { error?: string; success?: boolean }

function parseAlumno(formData: FormData) {
  return {
    nombre: String(formData.get("nombre") ?? "").trim(),
    telefono: String(formData.get("telefono") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
  }
}

export async function createAlumno(formData: FormData): Promise<ActionResult> {
  const values = parseAlumno(formData)
  if (!values.nombre) return { error: "El nombre es obligatorio." }

  const member = await requireStudio()
  const supabase = await createClient()
  const { error } = await supabase
    .from("alumnos")
    .insert({ ...values, studio_id: member.studio_id })

  if (error) return { error: "No pudimos guardar el alumno." }
  revalidatePath("/alumnos")
  return { success: true }
}

export async function updateAlumno(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const values = parseAlumno(formData)
  if (!values.nombre) return { error: "El nombre es obligatorio." }

  const member = await requireStudio()
  const supabase = await createClient()
  const { error } = await supabase
    .from("alumnos")
    .update(values)
    .eq("id", id)
    .eq("studio_id", member.studio_id)

  if (error) return { error: "No pudimos actualizar el alumno." }
  revalidatePath("/alumnos")
  return { success: true }
}

export async function deleteAlumno(id: string): Promise<ActionResult> {
  const member = await requireStudio()
  const supabase = await createClient()
  const { error } = await supabase
    .from("alumnos")
    .delete()
    .eq("id", id)
    .eq("studio_id", member.studio_id)

  if (error) return { error: "No pudimos eliminar el alumno." }
  revalidatePath("/alumnos")
  return { success: true }
}
