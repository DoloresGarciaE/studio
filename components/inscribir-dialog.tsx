"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
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
import { inscribirEnClase } from "@/app/(app)/alumnos/inscripciones"

export function InscribirDialog({
  alumnoId,
  clases,
}: {
  alumnoId: string
  clases: { id: string; nombre: string }[]
}) {
  const [open, setOpen] = useState(false)
  const [claseId, setClaseId] = useState("none")
  const [pending, startTransition] = useTransition()

  function onSubmit(formData: FormData) {
    formData.set("clase_id", claseId)
    startTransition(async () => {
      const res = await inscribirEnClase(alumnoId, formData)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success("Alumno inscripto")
      setClaseId("none")
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)} disabled={clases.length === 0}>
        <Plus className="size-4" /> Inscribir en clase
      </Button>
      <DialogContent>
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle>Inscribir en una clase</DialogTitle>
            <DialogDescription>
              Al generar las cuotas del mes, se crea la de esta clase para el alumno.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Clase</Label>
              <Select
                value={claseId}
                onValueChange={(v) => setClaseId(v ?? "none")}
                items={{
                  none: "Elegí una clase",
                  ...Object.fromEntries(clases.map((c) => [c.id, c.nombre])),
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elegí una clase" />
                </SelectTrigger>
                <SelectContent>
                  {clases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending || claseId === "none"}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Inscribir
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
