import type { SupabaseClient } from "@supabase/supabase-js"

import { sumPagos } from "./estado"
import { addMeses } from "./periodo"

// Genera (o recalcula, si están PENDIENTE) las liquidaciones del período:
// - COMISION: comisión % sobre lo cobrado en las clases del profe PORCENTAJE.
// - ALQUILER: horas de uso de salón × tarifa por hora del profe ALQUILER.
// Las liquidaciones ya marcadas LIQUIDADA no se tocan.
export async function generarLiquidaciones(
  supabase: SupabaseClient,
  studioId: string,
  periodo: string,
): Promise<number> {
  const { data: profes } = await supabase
    .from("profesores")
    .select("id, tipo, comision_pct, tarifa_hora")
    .eq("studio_id", studioId)

  // Cobrado por profe en el período (para PORCENTAJE).
  const { data: cuotas } = await supabase
    .from("cuotas")
    .select("inscripciones(clases(profesor_id)), pagos(monto)")
    .eq("studio_id", studioId)
    .eq("periodo", periodo)

  const cobradoPorProfe = new Map<string, number>()
  for (const c of cuotas ?? []) {
    const pid = (c as any).inscripciones?.clases?.profesor_id
    if (!pid) continue
    cobradoPorProfe.set(
      pid,
      (cobradoPorProfe.get(pid) ?? 0) + sumPagos((c as any).pagos),
    )
  }

  // Horas de salón por profe en el período (para ALQUILER).
  const { data: usos } = await supabase
    .from("uso_salon")
    .select("profesor_id, horas")
    .eq("studio_id", studioId)
    .gte("fecha", periodo)
    .lt("fecha", addMeses(periodo, 1))

  const horasPorProfe = new Map<string, number>()
  for (const u of usos ?? []) {
    horasPorProfe.set(
      (u as any).profesor_id,
      (horasPorProfe.get((u as any).profesor_id) ?? 0) + Number((u as any).horas),
    )
  }

  // Liquidaciones existentes del período.
  const { data: existing } = await supabase
    .from("liquidaciones")
    .select("id, profesor_id, concepto, estado")
    .eq("studio_id", studioId)
    .eq("periodo", periodo)

  const byKey = new Map<string, any>(
    (existing ?? []).map((l: any) => [`${l.profesor_id}:${l.concepto}`, l]),
  )

  const desired: {
    profesor_id: string
    concepto: "COMISION" | "ALQUILER"
    monto: number
  }[] = []

  for (const p of (profes ?? []) as any[]) {
    if (p.tipo === "PORCENTAJE" && p.comision_pct != null) {
      const cobrado = cobradoPorProfe.get(p.id) ?? 0
      const monto = Math.round(cobrado * Number(p.comision_pct)) / 100
      if (monto > 0) desired.push({ profesor_id: p.id, concepto: "COMISION", monto })
    }
    if (p.tipo === "ALQUILER" && p.tarifa_hora != null) {
      const horas = horasPorProfe.get(p.id) ?? 0
      const monto = Math.round(horas * Number(p.tarifa_hora) * 100) / 100
      if (monto > 0) desired.push({ profesor_id: p.id, concepto: "ALQUILER", monto })
    }
  }

  let creadas = 0
  for (const d of desired) {
    const ex = byKey.get(`${d.profesor_id}:${d.concepto}`)
    if (!ex) {
      const { error } = await supabase.from("liquidaciones").insert({
        studio_id: studioId,
        profesor_id: d.profesor_id,
        periodo,
        concepto: d.concepto,
        monto: d.monto,
        estado: "PENDIENTE",
      })
      if (!error) creadas++
    } else if (ex.estado === "PENDIENTE") {
      await supabase
        .from("liquidaciones")
        .update({ monto: d.monto })
        .eq("id", ex.id)
    }
  }

  return creadas
}
