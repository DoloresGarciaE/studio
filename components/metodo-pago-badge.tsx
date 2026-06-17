import { ArrowLeftRight, Banknote, Wallet } from "lucide-react"

import type { MetodoPago } from "@/lib/types"
import { cn } from "@/lib/utils"

const map: Record<
  MetodoPago,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  EFECTIVO: { label: "Efectivo", icon: Banknote },
  TRANSFERENCIA: { label: "Transferencia", icon: ArrowLeftRight },
  MERCADOPAGO: { label: "Mercado Pago", icon: Wallet },
}

export function MetodoPagoBadge({
  metodo,
  className,
}: {
  metodo: MetodoPago
  className?: string
}) {
  const m = map[metodo]
  const Icon = m.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-3.5" />
      {m.label}
    </span>
  )
}
