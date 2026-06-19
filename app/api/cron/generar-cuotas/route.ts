import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"

import { generarCuotas, refrescarVencidas } from "@/lib/billing/cuotas"
import { periodoActual } from "@/lib/billing/periodo"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Cron de Vercel (día 1 de cada mes): genera las cuotas del período para
// todos los estudios y marca las vencidas. Requiere la service role key
// para saltear RLS (es una tarea de sistema, sin sesión de usuario).
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get("authorization")
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) {
    return NextResponse.json(
      { error: "Falta SUPABASE_SERVICE_ROLE_KEY" },
      { status: 500 },
    )
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { persistSession: false } },
  )

  const periodo = periodoActual()
  const { data: studios } = await admin.from("studios").select("id")

  let creadas = 0
  for (const s of studios ?? []) {
    creadas += await generarCuotas(admin, s.id as string, periodo)
    await refrescarVencidas(admin, s.id as string)
  }

  return NextResponse.json({ ok: true, periodo, creadas })
}
