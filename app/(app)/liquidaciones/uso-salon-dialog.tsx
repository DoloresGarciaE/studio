"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

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
import { registrarUsoSalon } from "./actions"

function hoy() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`
}

export function UsoSalonDialog({
  profesores,
  salones,
}: {
  profesores: { id: string; nombre: string }[]
  salones: { id: string; nombre: string }[]
}) {
  const [open, setOpen] = useState(false)
  const [profesorId, setProfesorId] = useState("none")
  const [salonId, setSalonId] = useState("none")
  const [pending, startTransition] = useTransition()

  function onSubmit(formData: FormData) {
    formData.set("profesor_id", profesorId)
    formData.set("salon_id", salonId)
    startTransition(async () => {
      const res = await registrarUsoSalon(formData)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success("Uso de salón registrado")
      setProfesorId("none")
      setSalonId("none")
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={profesores.length === 0}
      >
        <Plus className="size-4" /> Registrar horas
      </Button>
      <DialogContent>
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar uso de salón</DialogTitle>
            <DialogDescription>
              Horas que un profe que alquila usó un salón. Alimenta su liquidación.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Profesor</Label>
              <Select
                value={profesorId}
                onValueChange={(v) => setProfesorId(v ?? "none")}
                items={{
                  none: "Elegí un profesor",
                  ...Object.fromEntries(profesores.map((p) => [p.id, p.nombre])),
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elegí un profesor" />
                </SelectTrigger>
                <SelectContent>
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
                  none: "Sin especificar",
                  ...Object.fromEntries(salones.map((s) => [s.id, s.nombre])),
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin especificar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin especificar</SelectItem>
                  {salones.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input id="fecha" name="fecha" type="date" defaultValue={hoy()} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="horas">Horas</Label>
                <Input
                  id="horas"
                  name="horas"
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  placeholder="Ej. 2"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending || profesorId === "none"}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
