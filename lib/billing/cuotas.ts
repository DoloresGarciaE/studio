import type { SupabaseClient } from "@supabase/supabase-js"

import { deriveEstado, sumPagos } from "./estado"
import { vencimientoDe, ymd } from "./periodo"

// Genera las cuotas del período para cada inscripción activa del estudio.
// Idempotente: el unique (inscripcion_id, periodo) evita duplicados.
// Devuelve cuántas cuotas nuevas se crearon.
export async function generarCuotas(
  supabase: SupabaseClient,
  studioId: string,
  periodo: string,
): Promise<number> {
  const { data: inscripciones } = await supabase
    .from("inscripciones")
    .select("id, clases(arancel_mensual)")
    .eq("studio_id", studioId)
    .eq("activa", true)

  const rows = (inscripciones ?? []).map((ins: any) => ({
    studio_id: studioId,
    inscripcion_id: ins.id,
    periodo,
    monto: Number(ins.clases?.arancel_mensual ?? 0),
    vencimiento: vencimientoDe(periodo),
    estado: "PENDIENTE",
  }))

  if (rows.length === 0) return 0

  const { data } = await supabase
    .from("cuotas")
    .upsert(rows, {
      onConflict: "inscripcion_id,periodo",
      ignoreDuplicates: true,
    })
    .select("id")

  return data?.length ?? 0
}

// Marca como VENCIDA las cuotas PENDIENTE/PARCIAL cuyo vencimiento ya pasó.
export async function refrescarVencidas(
  supabase: SupabaseClient,
  studioId: string,
  hoy: Date = new Date(),
): Promise<void> {
  await supabase
    .from("cuotas")
    .update({ estado: "VENCIDA" })
    .eq("studio_id", studioId)
    .lt("vencimiento", ymd(hoy))
    .in("estado", ["PENDIENTE", "PARCIAL"])
}

// Recalcula el estado de una cuota tras registrar/borrar un pago.
export async function recalcularEstado(
  supabase: SupabaseClient,
  cuotaId: string,
): Promise<void> {
  const { data: cuota } = await supabase
    .from("cuotas")
    .select("monto, vencimiento, pagos(monto)")
    .eq("id", cuotaId)
    .single()

  if (!cuota) return

  const pagado = sumPagos((cuota as any).pagos)
  const estado = deriveEstado(
    Number((cuota as any).monto),
    pagado,
    (cuota as any).vencimiento,
  )

  await supabase.from("cuotas").update({ estado }).eq("id", cuotaId)
}
