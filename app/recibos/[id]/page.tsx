import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { requireStudio } from "@/lib/studio"
import { Card } from "@/components/ui/card"
import { ReciboPrintButton } from "@/components/recibo-print-button"
import { formatCurrency } from "@/lib/format"
import { formatFecha, formatPeriodo } from "@/lib/billing/periodo"
import type { MetodoPago } from "@/lib/types"

const metodoLabel: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  MERCADOPAGO: "Mercado Pago",
}

export default async function ReciboPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { studio } = await requireStudio()
  const supabase = await createClient()

  const { data: recibo } = await supabase
    .from("recibos")
    .select(
      "id, numero, pagos(monto, metodo, fecha, cuotas(periodo, inscripciones(alumnos(nombre), clases(nombre))))",
    )
    .eq("id", id)
    .eq("studio_id", studio.id)
    .maybeSingle()

  if (!recibo) notFound()

  const pago = (recibo as any).pagos
  const cuota = pago?.cuotas
  const alumno = cuota?.inscripciones?.alumnos?.nombre ?? "—"
  const clase = cuota?.inscripciones?.clases?.nombre ?? "—"
  const metodo = (pago?.metodo as MetodoPago) ?? "EFECTIVO"
  const numero = `#${String((recibo as any).numero).padStart(6, "0")}`

  return (
    <main className="min-h-screen bg-muted/40 p-4 md:p-10">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/cuotas"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> Volver
          </Link>
          <ReciboPrintButton />
        </div>

        <Card className="p-8">
          <div className="flex items-start justify-between border-b border-border pb-4">
            <div>
              <p className="font-heading text-xl font-semibold text-primary">
                {studio?.nombre ?? "Cobralia"}
              </p>
              <p className="text-sm text-muted-foreground">Recibo de pago</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-medium">{numero}</p>
              <p className="text-xs text-muted-foreground">
                {pago?.fecha ? formatFecha(pago.fecha) : ""}
              </p>
            </div>
          </div>

          <dl className="space-y-3 py-6 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Alumno</dt>
              <dd className="font-medium">{alumno}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Concepto</dt>
              <dd className="text-right font-medium">
                Cuota {clase}
                {cuota?.periodo ? ` · ${formatPeriodo(cuota.periodo)}` : ""}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Método</dt>
              <dd className="font-medium">{metodoLabel[metodo]}</dd>
            </div>
          </dl>

          <div className="flex items-end justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-mono text-2xl font-semibold tabular-nums">
              {formatCurrency(Number(pago?.monto ?? 0))}
            </span>
          </div>
        </Card>

        <p className="text-center text-xs text-muted-foreground print:hidden">
          Para guardarlo como PDF, elegí "Guardar como PDF" en el diálogo de impresión.
        </p>
      </div>
    </main>
  )
}
