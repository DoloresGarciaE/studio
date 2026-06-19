import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Mail, Phone } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { requireStudio } from "@/lib/studio"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { StatusBadge } from "@/components/status-badge"
import { MoneyDisplay } from "@/components/money-display"
import { PagoDialog } from "@/components/pago-dialog"
import { RecordatorioButton } from "@/components/recordatorio-button"
import { InscribirDialog } from "@/components/inscribir-dialog"
import { InscripcionActions } from "@/components/inscripcion-actions"
import { buttonVariants } from "@/components/ui/button"
import { estadoUI, saldo, sumPagos, unwrapOne } from "@/lib/billing/estado"
import { formatFecha, formatPeriodo } from "@/lib/billing/periodo"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Receipt } from "lucide-react"

export default async function AlumnoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { studio_id } = await requireStudio()
  const supabase = await createClient()

  const { data: alumno } = await supabase
    .from("alumnos")
    .select("*")
    .eq("id", id)
    .eq("studio_id", studio_id)
    .maybeSingle()

  if (!alumno) notFound()

  const [{ data: inscripciones }, { data: clases }] = await Promise.all([
    supabase
      .from("inscripciones")
      .select("id, activa, clase_id, clases(id, nombre)")
      .eq("studio_id", studio_id)
      .eq("alumno_id", id),
    supabase
      .from("clases")
      .select("id, nombre")
      .eq("studio_id", studio_id)
      .order("nombre"),
  ])

  const inscList = (inscripciones ?? []) as any[]
  const inscIds = inscList.map((i) => i.id)
  const claseIdsActivas = new Set(
    inscList.filter((i) => i.activa).map((i) => i.clase_id),
  )
  const clasesDisponibles = (clases ?? []).filter(
    (c: any) => !claseIdsActivas.has(c.id),
  )

  let cuotasRows: any[] = []
  if (inscIds.length > 0) {
    const { data: cuotas } = await supabase
      .from("cuotas")
      .select(
        "id, periodo, monto, vencimiento, estado, inscripciones(clases(nombre)), pagos(id, monto, recibos(id))",
      )
      .eq("studio_id", studio_id)
      .in("inscripcion_id", inscIds)
      .order("periodo", { ascending: false })

    cuotasRows = (cuotas ?? []).map((c: any) => {
      const pagado = sumPagos(c.pagos)
      const recibo = (c.pagos ?? [])
        .map((p: any) => unwrapOne(p.recibos))
        .filter(Boolean)[0]
      return {
        id: c.id as string,
        periodo: c.periodo as string,
        ui: estadoUI(c.estado, c.vencimiento),
        monto: Number(c.monto),
        saldo: saldo(Number(c.monto), pagado),
        clase: (c.inscripciones?.clases?.nombre as string) ?? "—",
        reciboId: recibo?.id as string | undefined,
      }
    })
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <Link
          href="/alumnos"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Alumnos
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="size-12">
          <AvatarFallback className="bg-primary/10 text-primary">
            {initials(alumno.nombre)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            {alumno.nombre}
          </h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {alumno.telefono ? (
              <span className="inline-flex items-center gap-1.5">
                <Phone className="size-3.5" />
                {alumno.telefono}
              </span>
            ) : null}
            {alumno.email ? (
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5" />
                {alumno.email}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Inscripciones</h2>
          <InscribirDialog alumnoId={id} clases={clasesDisponibles} />
        </div>
        {inscList.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground">
            Todavía no está inscripto en ninguna clase.
          </Card>
        ) : (
          <Card className="divide-y divide-border p-0">
            {inscList.map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{i.clases?.nombre ?? "—"}</span>
                  {!i.activa && <Badge variant="secondary">Baja</Badge>}
                </div>
                <InscripcionActions inscripcionId={i.id} activa={i.activa} />
              </div>
            ))}
          </Card>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-lg font-semibold">Cuotas</h2>
        {cuotasRows.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground">
            No hay cuotas generadas para este alumno todavía.
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Período</TableHead>
                  <TableHead>Clase</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cuotasRows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">
                      {formatPeriodo(r.periodo)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{r.clase}</TableCell>
                    <TableCell>
                      <StatusBadge estado={r.ui} />
                    </TableCell>
                    <TableCell className="text-right">
                      <MoneyDisplay monto={r.saldo} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {r.ui !== "PAGADA" && (
                          <>
                            <PagoDialog
                              cuotaId={r.id}
                              saldo={r.saldo}
                              contexto={`${alumno.nombre} · ${r.clase}`}
                              size="sm"
                              variant="outline"
                            />
                            <RecordatorioButton
                              telefono={alumno.telefono}
                              alumno={alumno.nombre}
                              clase={r.clase}
                              periodo={r.periodo}
                              saldo={r.saldo}
                              vencida={r.ui === "VENCIDA"}
                            />
                          </>
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
      </section>
    </div>
  )
}
