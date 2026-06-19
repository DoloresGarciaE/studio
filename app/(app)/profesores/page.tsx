import { createClient } from "@/lib/supabase/server"
import { requireStudio } from "@/lib/studio"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { DeleteButton } from "@/components/delete-button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserCog } from "lucide-react"
import { ProfesorDialog } from "./profesor-dialog"
import { deleteProfesor } from "./actions"
import { formatCurrency } from "@/lib/format"
import type { Profesor } from "@/lib/types"

const tipoLabels: Record<string, string> = {
  TITULAR: "Titular",
  PORCENTAJE: "Porcentaje",
  ALQUILER: "Alquiler",
}

export default async function ProfesoresPage() {
  const member = await requireStudio()
  const supabase = await createClient()
  const { data } = await supabase
    .from("profesores")
    .select("*")
    .eq("studio_id", member.studio_id)
    .order("nombre")

  const profesores = (data ?? []) as Profesor[]

  return (
    <>
      <PageHeader
        title="Profesores"
        description="Equipo docente y su forma de pago."
      >
        <ProfesorDialog />
      </PageHeader>

      <div className="p-4 md:p-8">
        {profesores.length === 0 ? (
          <EmptyState
            icon={UserCog}
            title="Todavía no hay profesores"
            description="Sumá a los profesores de tu estudio."
          >
            <ProfesorDialog />
          </EmptyState>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Vínculo</TableHead>
                  <TableHead>Condición</TableHead>
                  <TableHead className="w-[140px] text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profesores.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{tipoLabels[p.tipo]}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {p.tipo === "PORCENTAJE" && p.comision_pct != null
                        ? `${p.comision_pct}% por clase`
                        : p.tipo === "ALQUILER" && p.tarifa_hora != null
                          ? `${formatCurrency(p.tarifa_hora)} / hora`
                          : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ProfesorDialog profesor={p} />
                        <DeleteButton
                          action={async () => {
                            "use server"
                            return deleteProfesor(p.id)
                          }}
                          title="¿Eliminar profesor?"
                          successMessage="Profesor eliminado"
                        />
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
