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

  const { data: member } = await supabase
    .from("studio_members")
    .select("studio_id, studios(id, nombre)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle()

  if (!member) {
    redirect("/login")
  }

  const studio = (member.studios ?? null) as unknown as Studio

  return {
    user,
    studio,
    studio_id: member.studio_id as string,
  }
}
