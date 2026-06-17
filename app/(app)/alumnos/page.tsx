import Link from "next/link"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Phone, Mail } from "lucide-react"
import { AlumnoDialog } from "./alumno-dialog"
import { deleteAlumno } from "./actions"
import { initials } from "@/lib/format"
import type { Alumno } from "@/lib/types"

export default async function AlumnosPage() {
  const member = await requireStudio()
  const supabase = await createClient()
  const { data } = await supabase
    .from("alumnos")
    .select("*")
    .eq("studio_id", member.studio_id)
    .order("nombre")

  const alumnos = (data ?? []) as Alumno[]

  return (
    <>
      <PageHeader
        title="Alumnos"
        description="Base de alumnos del estudio."
      >
        <AlumnoDialog />
      </PageHeader>

      <div className="p-4 md:p-8">
        {alumnos.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Todavía no hay alumnos"
            description="Cargá a tus alumnos para inscribirlos en clases."
          >
            <AlumnoDialog />
          </EmptyState>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="w-[140px] text-right">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alumnos.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-xs text-primary">
                            {initials(a.nombre)}
                          </AvatarFallback>
                        </Avatar>
                        <Link
                          href={`/alumnos/${a.id}`}
                          className="font-medium hover:underline"
                        >
                          {a.nombre}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.telefono ? (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" />
                          {a.telefono}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {a.email ? (
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          {a.email}
                        </span>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <AlumnoDialog alumno={a} />
                        <DeleteButton
                          action={async () => {
                            "use server"
                            return deleteAlumno(a.id)
                          }}
                          title="¿Eliminar alumno?"
                          description="Se eliminarán también sus inscripciones y cuotas."
                          successMessage="Alumno eliminado"
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
