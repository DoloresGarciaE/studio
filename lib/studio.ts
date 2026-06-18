import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import type { Studio } from "@/lib/types"

// Regla de oro multi-tenant: el studioId se toma SIEMPRE de la sesión,
// nunca del cliente. Cada query de dominio filtra por este studio.
export async function requireStudio() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  async function fetchMember() {
    const { data } = await supabase
      .from("studio_members")
      .select("studio_id, studios(id, nombre)")
      .eq("user_id", user!.id)
      .limit(1)
      .maybeSingle()
    return data
  }

  let member = await fetchMember()

  if (!member) {
    // Onboarding self-healing: crea el estudio si no existe (p. ej. alta con
    // Google que no pasó por el trigger). Idempotente y SECURITY DEFINER.
    await supabase.rpc("ensure_studio")
    member = await fetchMember()
  }

  if (!member) {
    // Hay sesión pero no se pudo resolver el estudio: NO redirigir a /login
    // (haría loop con el middleware). Mostrar una página clara.
    redirect("/sin-estudio")
  }

  const studio = (member.studios ?? null) as unknown as Studio

  return {
    user,
    studio,
    studio_id: member.studio_id as string,
  }
}
