"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  darDeBajaInscripcion,
  reactivarInscripcion,
} from "@/app/(app)/alumnos/inscripciones"

export function InscripcionActions({
  inscripcionId,
  activa,
}: {
  inscripcionId: string
  activa: boolean
}) {
  const [pending, startTransition] = useTransition()

  function baja() {
    startTransition(async () => {
      const r = await darDeBajaInscripcion(inscripcionId)
      if (r.error) toast.error(r.error)
      else toast.success("Inscripción dada de baja")
    })
  }

  function alta() {
    startTransition(async () => {
      const r = await reactivarInscripcion(inscripcionId)
      if (r.error) toast.error(r.error)
      else toast.success("Inscripción reactivada")
    })
  }

  return activa ? (
    <Button variant="ghost" size="sm" onClick={baja} disabled={pending}>
      Dar de baja
    </Button>
  ) : (
    <Button variant="ghost" size="sm" onClick={alta} disabled={pending}>
      Reactivar
    </Button>
  )
}
