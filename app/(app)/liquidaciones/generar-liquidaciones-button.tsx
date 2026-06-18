"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { CalendarPlus, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { generarLiquidacionesDelMes } from "./actions"

export function GenerarLiquidacionesButton({ periodo }: { periodo: string }) {
  const [pending, startTransition] = useTransition()

  function onClick() {
    startTransition(async () => {
      const res = await generarLiquidacionesDelMes(periodo)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success(
        res.creadas
          ? `${res.creadas} liquidación${res.creadas === 1 ? "" : "es"} generada${res.creadas === 1 ? "" : "s"}`
          : "Liquidaciones actualizadas",
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
      Generar liquidaciones
    </Button>
  )
}
