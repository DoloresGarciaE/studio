import Link from "next/link"
import { AlertTriangle, Clock, Wallet } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { requireStudio } from "@/lib/studio"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { PeriodSelector } from "@/components/period-selector"
import { MetricCard } from "@/components/metric-card"
import { StatusBadge } from "@/components/status-badge"
import { MoneyDisplay } from "@/components/money-display"
import { PagoDialog } from "@/components/pago-dialog"
import { RecordatorioButton } from "@/components/recordatorio-button"
import { Card } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { estadoUI, saldo, sumPagos } from "@/lib/billing/estado"
import { formatPeriodo, periodoActual } from "@/lib/billing/periodo"
import { cn } from "@/lib/utils"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>
}) {
  const sp = await searchParams
  const periodo = sp.periodo ?? periodoActual()

  const { studio_id } = await requireStudio()
  const supabase = await createClient()

  const { data } = await supabase
    .from("cuotas")
    .select(
      "id, monto, vencimiento, estado, inscripciones(alumnos(id, nombre, telefono), clases(nombre)), pagos(id, monto)",
    )
    .eq("studio_id", studio_id)
    .eq("periodo", periodo)

  let cobrado = 0
  let pendiente = 0
  let vencido = 0

  const rows = (data ?? []).map((c: any) => {
    const pagado = sumPagos(c.pagos)
    const s = saldo(Number(c.monto), pagado)
    const ui = estadoUI(c.estado, c.vencimiento)
    cobrado += pagado
    if (ui === "VENCIDA") vencido += s
    else if (ui !== "PAGADA") pendiente += s
    const alumno = c.inscripciones?.alumnos
    return {
      id: c.id as string,
      ui,
      saldo: s,
      vencimiento: c.vencimiento as string,
      alumnoId: alumno?.id as string | undefined,
      alumno: (alumno?.nombre as string) ?? "—",
      telefono: (alumno?.telefono as string) ?? null,
      clase: (c.inscripciones?.clases?.nombre as string) ?? "—",
    }
  })

  const atencion = rows
    .filter((r) => r.ui === "VENCIDA" || r.ui === "POR_VENCER")
    .sort((a, b) => {
      if (a.ui !== b.ui) return a.ui === "VENCIDA" ? -1 : 1
      return a.vencimiento.localeCompare(b.vencimiento)
    })

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Cómo viene la cobranza del mes."
        action={<PeriodSelector periodo={periodo} />}
      />

      <div className="flex flex-col gap-6 p-4 md:p-8">
        {rows.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={`Sin cuotas en ${formatPeriodo(periodo)}`}
            description="Generá las cuotas del mes desde la sección Cuotas para ver los totales."
          >
            <Link href="/cuotas" className={cn(buttonVariants({ size: "sm" }))}>
              Ir a Cuotas
            </Link>
          </EmptyState>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard
                label="Cobrado"
                monto={cobrado}
                intent="positive"
                icon={Wallet}
                hint={formatPeriodo(periodo)}
              />
              <MetricCard
                label="Pendiente"
                monto={pendiente}
                icon={Clock}
                hint="Por vencer + pendientes"
              />
              <MetricCard
                label="Vencido"
                monto={vencido}
                intent="negative"
                icon={AlertTriangle}
                hint="Cuotas vencidas sin saldar"
              />
            </div>

            <section className="space-y-3">
              <h2 className="font-heading text-lg font-semibold">
                Necesitan atención
              </h2>
              {atencion.length === 0 ? (
                <Card className="p-6 text-sm text-muted-foreground">
                  Nada vencido ni por vencer este mes. 🎉
                </Card>
              ) : (
                <Card className="overflow-hidden p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Alumno</TableHead>
                        <TableHead>Clase</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {atencion.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">
                            {r.alumnoId ? (
                              <Link
                                href={`/alumnos/${r.alumnoId}`}
                                className="hover:underline"
                              >
                                {r.alumno}
                              </Link>
                            ) : (
                              r.alumno
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {r.clase}
                          </TableCell>
                          <TableCell>
                            <StatusBadge estado={r.ui} />
                          </TableCell>
                          <TableCell className="text-right">
                            <MoneyDisplay monto={r.saldo} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <PagoDialog
                                cuotaId={r.id}
                                saldo={r.saldo}
                                contexto={`${r.alumno} · ${r.clase}`}
                                size="sm"
                                variant="outline"
                              />
                              <RecordatorioButton
                                telefono={r.telefono}
                                alumno={r.alumno}
                                clase={r.clase}
                                periodo={periodo}
                                saldo={r.saldo}
                                vencida={r.ui === "VENCIDA"}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </section>
          </>
        )}
      </div>
    </>
  )
}
