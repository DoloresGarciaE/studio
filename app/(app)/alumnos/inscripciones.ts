"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { requireStudio } from "@/lib/studio"

export type ActionResult = { error?: string; success?: boolean }

export async function inscribirEnClase(
  alumnoId: string,
  formData: FormData,
): Promise<ActionResult> {
  const { studio_id } = await requireStudio()
  const supabase = await createClient()

  const claseId = String(formData.get("clase_id") ?? "").trim()
  if (!claseId || claseId === "none") return { error: "Elegí una clase." }

  const { error } = await supabase.from("inscripciones").upsert(
    { studio_id, alumno_id: alumnoId, clase_id: claseId, activa: true },
    { onConflict: "alumno_id,clase_id" },
  )

  if (error) return { error: "No pudimos inscribir al alumno." }
  revalidatePath("/", "layout")
  return { success: true }
}

export async function darDeBajaInscripcion(
  inscripcionId: string,
): Promise<ActionResult> {
  const { studio_id } = await requireStudio()
  const supabase = await createClient()
  const { error } = await supabase
    .from("inscripciones")
    .update({ activa: false })
    .eq("id", inscripcionId)
    .eq("studio_id", studio_id)

  if (error) return { error: "No pudimos dar de baja la inscripción." }
  revalidatePath("/", "layout")
  return { success: true }
}

export async function reactivarInscripcion(
  inscripcionId: string,
): Promise<ActionResult> {
  const { studio_id } = await requireStudio()
  const supabase = await createClient()
  const { error } = await supabase
    .from("inscripciones")
    .update({ activa: true })
    .eq("id", inscripcionId)
    .eq("studio_id", studio_id)

  if (error) return { error: "No pudimos reactivar la inscripción." }
  revalidatePath("/", "layout")
  return { success: true }
}
