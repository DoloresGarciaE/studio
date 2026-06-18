import { Coins } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { requireStudio } from "@/lib/studio"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { PeriodSelector } from "@/components/period-selector"
import { MoneyDisplay } from "@/components/money-display"
import { DeleteButton } from "@/components/delete-button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { addMeses, formatFecha, formatPeriodo, periodoActual } from "@/lib/billing/periodo"
import { cn } from "@/lib/utils"
import { GenerarLiquidacionesButton } from "./generar-liquidaciones-button"
import { LiquidacionActions } from "./liquidacion-actions"
import { UsoSalonDialog } from "./uso-salon-dialog"
import { eliminarUsoSalon } from "./actions"

const conceptoLabel: Record<string, string> = {
  COMISION: "Comisión",
  ALQUILER: "Alquiler",
}

export default async function LiquidacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>
}) {
  const sp = await searchParams
  const periodo = sp.periodo ?? periodoActual()

  const { studio_id } = await requireStudio()
  const supabase = await createClient()

  const [{ data: liqs }, { data: usos }, { data: profesAlq }, { data: salones }] =
    await Promise.all([
      supabase
        .from("liquidaciones")
        .select("id, concepto, monto, estado, profesores(nombre, tipo)")
        .eq("studio_id", studio_id)
        .eq("periodo", periodo),
      supabase
        .from("uso_salon")
        .select("id, fecha, horas, profesores(nombre), salones(nombre)")
        .eq("studio_id", studio_id)
        .gte("fecha", periodo)
        .lt("fecha", addMeses(periodo, 1))
        .order("fecha", { ascending: false }),
      supabase
        .from("profesores")
        .select("id, nombre")
        .eq("studio_id", studio_id)
        .eq("tipo", "ALQUILER")
        .order("nombre"),
      supabase
        .from("salones")
        .select("id, nombre")
        .eq("studio_id", studio_id)
        .order("nombre"),
    ])

  const liquidaciones = (liqs ?? []) as any[]
  const usoList = (usos ?? []) as any[]

  const pendiente = liquidaciones
    .filter((l) => l.estado === "PENDIENTE")
    .reduce((acc, l) => acc + Number(l.monto), 0)
  const liquidado = liquidaciones
    .filter((l) => l.estado === "LIQUIDADA")
    .reduce((acc, l) => acc + Number(l.monto), 0)

  return (
    <>
      <PageHeader
        title="Liquidaciones"
        description="Lo que los profes te deben: comisiones y alquiler de salón."
        action={<GenerarLiquidacionesButton periodo={periodo} />}
      />

      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PeriodSelector periodo={periodo} />
          <p className="text-sm text-muted-foreground">
            Pendiente <MoneyDisplay monto={pendiente} className="text-foreground" /> ·
            saldado <MoneyDisplay monto={liquidado} className="text-foreground" />
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="font-heading text-lg font-semibold">Liquidaciones del período</h2>
          {liquidaciones.length === 0 ? (
            <EmptyState
              icon={Coins}
              title="Sin liquidaciones este período"
              description="Generá las liquidaciones a partir de lo cobrado (profes a porcentaje) y las horas de salón (profes que alquilan)."
            >
              <GenerarLiquidacionesButton periodo={periodo} />
            </EmptyState>
          ) : (
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profesor</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liquidaciones.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">
                        {l.profesores?.nombre ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {conceptoLabel[l.concepto] ?? l.concepto}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                            l.estado === "LIQUIDADA"
                              ? "bg-[#E6F6EF] text-[#047857]"
                              : "bg-[#FDF7EA] text-[#92590C]",
                          )}
                        >
                          {l.estado === "LIQUIDADA" ? "Liquidada" : "Pendiente"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <MoneyDisplay monto={Number(l.monto)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <LiquidacionActions id={l.id} estado={l.estado} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Uso de salón del mes</h2>
            <UsoSalonDialog profesores={profesAlq ?? []} salones={salones ?? []} />
          </div>
          {usoList.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground">
              {(profesAlq ?? []).length === 0
                ? "No tenés profes que alquilen. Marcá un profe como “Alquiler” para registrar horas."
                : "Todavía no registraste horas de salón este mes."}
            </Card>
          ) : (
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Profesor</TableHead>
                    <TableHead>Salón</TableHead>
                    <TableHead className="text-right">Horas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usoList.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{formatFecha(u.fecha)}</TableCell>
                      <TableCell className="font-medium">
                        {u.profesores?.nombre ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.salones?.nombre ?? "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {Number(u.horas)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DeleteButton
                          action={async () => {
                            "use server"
                            return eliminarUsoSalon(u.id)
                          }}
                          title="¿Eliminar registro?"
                          successMessage="Registro eliminado"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </section>
      </div>
    </>
  )
}
