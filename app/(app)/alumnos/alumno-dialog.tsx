"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Plus } from "lucide-react"
import { createAlumno, updateAlumno } from "./actions"
import type { Alumno } from "@/lib/types"

export function AlumnoDialog({ alumno }: { alumno?: Alumno }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const editing = Boolean(alumno)

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = editing
        ? await updateAlumno(alumno!.id, formData)
        : await createAlumno(formData)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(editing ? "Alumno actualizado" : "Alumno creado")
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
            <Plus className="h-4 w-4" /> Nuevo alumno
          </>
        )}
      </Button>
      <DialogContent>
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Editar alumno" : "Nuevo alumno"}
            </DialogTitle>
            <DialogDescription>
              El teléfono se usa para enviar recordatorios por WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre y apellido</Label>
              <Input
                id="nombre"
                name="nombre"
                required
                defaultValue={alumno?.nombre}
                placeholder="Ej. Martina López"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                defaultValue={alumno?.telefono ?? ""}
                placeholder="Ej. +54 9 11 5555 5555"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={alumno?.email ?? ""}
                placeholder="Ej. martina@email.com"
              />
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
