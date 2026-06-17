"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Plus } from "lucide-react"
import { createClase, updateClase } from "./actions"
import type { Clase, Profesor, Salon } from "@/lib/types"

export function ClaseDialog({
  clase,
  profesores,
  salones,
}: {
  clase?: Clase
  profesores: Pick<Profesor, "id" | "nombre">[]
  salones: Pick<Salon, "id" | "nombre">[]
}) {
  const [open, setOpen] = useState(false)
  const [profesorId, setProfesorId] = useState(clase?.profesor_id ?? "none")
  const [salonId, setSalonId] = useState(clase?.salon_id ?? "none")
  const [pending, startTransition] = useTransition()
  const editing = Boolean(clase)

  function onSubmit(formData: FormData) {
    formData.set("profesor_id", profesorId)
    formData.set("salon_id", salonId)
    startTransition(async () => {
      const res = editing
        ? await updateClase(clase!.id, formData)
        : await createClase(formData)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(editing ? "Clase actualizada" : "Clase creada")
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant={editing ? "ghost" : "default"}
        size={editing ? "sm" : "default"}
        onClick={() => setOpen(true)}
      >
        {editing ? (
          "Editar"
        ) : (
          <>
            <Plus className="h-4 w-4" /> Nueva clase
          </>
        )}
      </Button>
      <DialogContent>
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar clase" : "Nueva clase"}</DialogTitle>
            <DialogDescription>
              El arancel mensual define el monto de las cuotas generadas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre de la clase</Label>
              <Input
                id="nombre"
                name="nombre"
                required
                defaultValue={clase?.nombre}
                placeholder="Ej. Ballet inicial"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dia_horario">Día y horario</Label>
              <Input
                id="dia_horario"
                name="dia_horario"
                defaultValue={clase?.dia_horario ?? ""}
                placeholder="Ej. Lunes y miércoles 18:00"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="arancel_mensual">Arancel mensual</Label>
              <Input
                id="arancel_mensual"
                name="arancel_mensual"
                type="number"
                min="0"
                step="100"
                required
                defaultValue={clase?.arancel_mensual ?? ""}
                placeholder="Ej. 15000"
              />
            </div>
            <div className="grid gap-2">
              <Label>Profesor</Label>
              <Select
                value={profesorId}
                onValueChange={(v) => setProfesorId(v ?? "none")}
                items={{
                  none: "Sin asignar",
                  ...Object.fromEntries(profesores.map((p) => [p.id, p.nombre])),
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {profesores.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Salón</Label>
              <Select
                value={salonId}
                onValueChange={(v) => setSalonId(v ?? "none")}
                items={{
                  none: "Sin asignar",
                  ...Object.fromEntries(salones.map((s) => [s.id, s.nombre])),
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {salones.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
