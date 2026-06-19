import { DoorOpen } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { requireStudio } from "@/lib/studio"
import { PageHeader } from "@/components/page-header"
import { EmptyState } from "@/components/empty-state"
import { DeleteButton } from "@/components/delete-button"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SalonDialog } from "./salon-dialog"
import { deleteSalon } from "./actions"
import type { Salon } from "@/lib/types"

export default async function SalonesPage() {
  const { studio_id } = await requireStudio()
  const supabase = await createClient()
  const { data } = await supabase
    .from("salones")
    .select("*")
    .eq("studio_id", studio_id)
    .order("nombre")

  const salones = (data ?? []) as Salon[]

  return (
    <>
      <PageHeader title="Salones" description="Los espacios donde se dictan las clases.">
        <SalonDialog />
      </PageHeader>

      <div className="p-4 md:p-8">
        {salones.length === 0 ? (
          <EmptyState
            icon={DoorOpen}
            title="Todavía no hay salones"
            description="Cargá los espacios de tu estudio para asignarlos a las clases."
          >
            <SalonDialog />
          </EmptyState>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-[140px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salones.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.nombre}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <SalonDialog salon={s} />
                        <DeleteButton
                          action={async () => {
                            "use server"
                            return deleteSalon(s.id)
                          }}
                          title="¿Eliminar salón?"
                          description="Las clases que lo usaban quedarán sin salón asignado."
                          successMessage="Salón eliminado"
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
