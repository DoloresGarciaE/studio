"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { EstadoLiquid } from "@/lib/types"
import { marcarLiquidada, marcarPendienteLiquidacion } from "./actions"

export function LiquidacionActions({
  id,
  estado,
}: {
  id: string
  estado: EstadoLiquid
}) {
  const [pending, startTransition] = useTransition()

  function saldar() {
    startTransition(async () => {
      const r = await marcarLiquidada(id)
      if (r.error) toast.error(r.error)
      else toast.success("Liquidación saldada")
    })
  }

  function reabrir() {
    startTransition(async () => {
      const r = await marcarPendienteLiquidacion(id)
      if (r.error) toast.error(r.error)
      else toast.success("Marcada pendiente")
    })
  }

  return estado === "PENDIENTE" ? (
    <Button size="sm" variant="outline" onClick={saldar} disabled={pending}>
      Marcar saldada
    </Button>
  ) : (
    <Button size="sm" variant="ghost" onClick={reabrir} disabled={pending}>
      Reabrir
    </Button>
  )
}
