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
import { GraduationCap } from "lucide-react"
import { ClaseDialog } from "./clase-dialog"
import { deleteClase } from "./actions"
import { formatCurrency } from "@/lib/format"

export default async function ClasesPage() {
  const { studio } = await requireStudio()
  const supabase = await createClient()

  const [{ data: clases }, { data: profesores }, { data: salones }] = await Promise.all([
    supabase
      .from("clases")
      .select("*, profesores(nombre), salones(nombre)")
      .eq("studio_id", studio.id)
      .order("created_at", { ascending: false }),
    supabase.from("profesores").select("id, nombre").eq("studio_id", studio.id).order("nombre"),
    supabase.from("salones").select("id, nombre").eq("studio_id", studio.id).order("nombre"),
  ])

  const profesorOptions = profesores ?? []
  const salonOptions = salones ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clases"
        description="Define tus clases, su arancel mensual y a quién pertenecen."
        action={<ClaseDialog profesores={profesorOptions} salones={salonOptions} />}
      />

      {!clases || clases.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Todavía no hay clases"
          description="Creá tu primera clase para empezar a inscribir alumnos y generar cuotas."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Día y horario</TableHead>
                <TableHead>Profesor</TableHead>
                <TableHead>Salón</TableHead>
                <TableHead className="text-right">Arancel</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {clases.map((clase) => (
                <TableRow key={clase.id}>
                  <TableCell className="font-medium">{clase.nombre}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {clase.dia_horario || "—"}
                  </TableCell>
                  <TableCell>
                    {clase.profesores?.nombre ? (
                      clase.profesores.nombre
                    ) : (
                      <span className="text-muted-foreground">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {clase.salones?.nombre ? (
                      <Badge variant="secondary">{clase.salones.nombre}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(Number(clase.arancel_mensual))}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <ClaseDialog
                        clase={clase}
                        profesores={profesorOptions}
                        salones={salonOptions}
                      />
                      <DeleteButton
                        action={deleteClase}
                        id={clase.id}
                        label="Eliminar clase"
                        description="Se eliminará la clase y todas sus inscripciones y cuotas asociadas."
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
  )
}
