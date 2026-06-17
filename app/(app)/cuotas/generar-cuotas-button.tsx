"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { CalendarPlus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { generarCuotasDelMes } from "./actions"

export function GenerarCuotasButton({ periodo }: { periodo: string }) {
  const [pending, startTransition] = useTransition()

  function onClick() {
    startTransition(async () => {
      const res = await generarCuotasDelMes(periodo)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(
        res.creadas
          ? `${res.creadas} cuota${res.creadas === 1 ? "" : "s"} generada${res.creadas === 1 ? "" : "s"}`
          : "No había cuotas nuevas para generar",
      )
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={pending}>
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <CalendarPlus className="size-4" />
      )}
      Generar cuotas del mes
    </Button>
  )
}
