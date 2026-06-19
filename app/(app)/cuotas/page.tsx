import Link from "next/link"
import { Receipt, Wallet } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { requireStudio } from "@/lib/studio"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { PeriodSelector } from "@/components/period-selector"
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
import { estadoUI, saldo, sumPagos, unwrapOne } from "@/lib/billing/estado"
import { periodoActual, formatFecha } from "@/lib/billing/periodo"
import { cn } from "@/lib/utils"
import { GenerarCuotasButton } from "./generar-cuotas-button"

const filtros = [
  { key: "", label: "Todas" },
  { key: "POR_VENCER", label: "Por vencer" },
  { key: "PENDIENTE", label: "Pendientes" },
  { key: "VENCIDA", label: "Vencidas" },
  { key: "PARCIAL", label: "Parciales" },
  { key: "PAGADA", label: "Pagadas" },
]

export default async function CuotasPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; estado?: string }>
}) {
  const sp = await searchParams
  const periodo = sp.periodo ?? periodoActual()
  const filtro = sp.estado ?? ""

  const { studio_id } = await requireStudio()
  const supabase = await createClient()

  const { data } = await supabase
    .from("cuotas")
    .select(
      "id, periodo, monto, vencimiento, estado, inscripciones(id, alumnos(id, nombre, telefono), clases(nombre)), pagos(id, monto, recibos(id, numero))",
    )
    .eq("studio_id", studio_id)
    .eq("periodo", periodo)

  const rows = (data ?? [])
    .map((c: any) => {
      const pagado = sumPagos(c.pagos)
      const alumno = c.inscripciones?.alumnos
      const clase = c.inscripciones?.clases
      const recibo = (c.pagos ?? [])
        .map((p: any) => unwrapOne(p.recibos))
        .filter(Boolean)
        .sort((a: any, b: any) => b.numero - a.numero)[0]
      return {
        id: c.id as string,
        ui: estadoUI(c.estado, c.vencimiento),
        monto: Number(c.monto),
        saldo: saldo(Number(c.monto), pagado),
        vencimiento: c.vencimiento as string,
        alumnoId: alumno?.id as string | undefined,
        alumno: (alumno?.nombre as string) ?? "—",
        telefono: (alumno?.telefono as string) ?? null,
        clase: (clase?.nombre as string) ?? "—",
        reciboId: recibo?.id as string | undefined,
      }
    })
    .sort((a, b) => a.alumno.localeCompare(b.alumno))

  const visibles = filtro ? rows.filter((r) => r.ui === filtro) : rows
  const totalSaldo = visibles.reduce((acc, r) => acc + r.saldo, 0)

  return (
    <>
      <PageHeader
        title="Cuotas"
        description="Las cuotas del período, su estado y los pagos."
        action={<GenerarCuotasButton periodo={periodo} />}
      />

      <div className="flex flex-col gap-4 p-4 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PeriodSelector periodo={periodo} />
          <p className="text-sm text-muted-foreground">
            {visibles.length} cuota{visibles.length === 1 ? "" : "s"} · saldo{" "}
            <MoneyDisplay monto={totalSaldo} className="text-foreground" />
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {filtros.map((f) => {
            const href = `/cuotas?periodo=${periodo}${f.key ? `&estado=${f.key}` : ""}`
            const active = filtro === f.key
            return (
              <Link
                key={f.key || "todas"}
                href={href}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {f.label}
              </Link>
            )
          })}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={`No hay cuotas para este período`}
            description="Inscribí alumnos en clases y generá las cuotas del mes para empezar a cobrar."
          >
            <GenerarCuotasButton periodo={periodo} />
          </EmptyState>
        ) : (
          <Card className="overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Clase</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibles.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {r.alumnoId ? (
                        <Link href={`/alumnos/${r.alumnoId}`} className="hover:underline">
                          {r.alumno}
                        </Link>
                      ) : (
                        r.alumno
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{r.clase}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatFecha(r.vencimiento)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge estado={r.ui} />
                    </TableCell>
                    <TableCell className="text-right">
                      <MoneyDisplay monto={r.monto} intent="muted" />
                    </TableCell>
                    <TableCell className="text-right">
                      <MoneyDisplay monto={r.saldo} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {r.ui !== "PAGADA" && (
                          <PagoDialog
                            cuotaId={r.id}
                            saldo={r.saldo}
                            contexto={`${r.alumno} · ${r.clase}`}
                            size="sm"
                            variant="outline"
                          />
                        )}
                        {r.ui !== "PAGADA" && (
                          <RecordatorioButton
                            telefono={r.telefono}
                            alumno={r.alumno}
                            clase={r.clase}
                            periodo={periodo}
                            saldo={r.saldo}
                            vencida={r.ui === "VENCIDA"}
                          />
                        )}
                        {r.reciboId && (
                          <Link
                            href={`/recibos/${r.reciboId}`}
                            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                          >
                            <Receipt className="size-4" /> Recibo
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </>
  )
}
