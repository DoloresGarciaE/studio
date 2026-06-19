"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Loader2, Plus } from "lucide-react"

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
import { createSalon, updateSalon } from "./actions"
import type { Salon } from "@/lib/types"

export function SalonDialog({ salon }: { salon?: Salon }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const editing = Boolean(salon)

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = editing
        ? await updateSalon(salon!.id, formData)
        : await createSalon(formData)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(editing ? "Salón actualizado" : "Salón creado")
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
            <Plus className="size-4" /> Nuevo salón
          </>
        )}
      </Button>
      <DialogContent>
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar salón" : "Nuevo salón"}</DialogTitle>
            <DialogDescription>
              Cualquier espacio: sala, salón, box, pared de escalada…
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                required
                defaultValue={salon?.nombre}
                placeholder="Ej. Salón 1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
