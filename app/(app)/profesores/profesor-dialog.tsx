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
import { createProfesor, updateProfesor } from "./actions"
import type { Profesor, TipoProfesor } from "@/lib/types"

const tipos: { value: TipoProfesor; label: string }[] = [
  { value: "TITULAR", label: "Titular (sueldo)" },
  { value: "PORCENTAJE", label: "Por porcentaje" },
  { value: "ALQUILER", label: "Alquila el espacio" },
]

export function ProfesorDialog({ profesor }: { profesor?: Profesor }) {
  const [open, setOpen] = useState(false)
  const [tipo, setTipo] = useState<TipoProfesor>(profesor?.tipo ?? "TITULAR")
  const [pending, startTransition] = useTransition()
  const editing = Boolean(profesor)

  function onSubmit(formData: FormData) {
    formData.set("tipo", tipo)
    startTransition(async () => {
      const res = editing
        ? await updateProfesor(profesor!.id, formData)
        : await createProfesor(formData)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(editing ? "Profesor actualizado" : "Profesor creado")
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
            <Plus className="h-4 w-4" /> Nuevo profesor
          </>
        )}
      </Button>
      <DialogContent>
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar profesor" : "Nuevo profesor"}
            </DialogTitle>
            <DialogDescription>
              Definí cómo se le paga al profesor para futuros reportes.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                required
                defaultValue={profesor?.nombre}
                placeholder="Ej. Carla Méndez"
              />
            </div>
            <div className="grid gap-2">
              <Label>Tipo de vínculo</Label>
              <Select
                value={tipo}
                onValueChange={(v) => setTipo(v as TipoProfesor)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {tipo === "PORCENTAJE" && (
              <div className="grid gap-2">
                <Label htmlFor="comision_pct">Comisión (%)</Label>
                <Input
                  id="comision_pct"
                  name="comision_pct"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  defaultValue={profesor?.comision_pct ?? ""}
                  placeholder="Ej. 60"
                />
              </div>
            )}
            {tipo === "ALQUILER" && (
              <div className="grid gap-2">
                <Label htmlFor="tarifa_hora">Tarifa por hora</Label>
                <Input
                  id="tarifa_hora"
                  name="tarifa_hora"
                  type="number"
                  min="0"
                  step="100"
                  defaultValue={profesor?.tarifa_hora ?? ""}
                  placeholder="Ej. 5000"
                />
              </div>
            )}
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
