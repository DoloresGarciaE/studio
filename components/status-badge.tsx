import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CircleDashed,
} from "lucide-react"

import type { EstadoUI } from "@/lib/billing/estado"
import { cn } from "@/lib/utils"

// Mapa de estados de cuota (plan de colores §5). Siempre ícono + texto, no solo color.
const map: Record<
  EstadoUI,
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  PENDIENTE: { label: "Pendiente", icon: Clock, className: "bg-[#F1F4F8] text-[#475569]" },
  POR_VENCER: { label: "Por vencer", icon: Clock, className: "bg-[#FDF7EA] text-[#92590C]" },
  PAGADA: { label: "Pagada", icon: CheckCircle2, className: "bg-[#E6F6EF] text-[#047857]" },
  VENCIDA: { label: "Vencida", icon: AlertTriangle, className: "bg-[#FCE9E9] text-[#B91C1C]" },
  PARCIAL: { label: "Parcial", icon: CircleDashed, className: "bg-[#ECECFB] text-[#3730A3]" },
}

export function StatusBadge({
  estado,
  className,
}: {
  estado: EstadoUI
  className?: string
}) {
  const s = map[estado]
  const Icon = s.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
        s.className,
        className,
      )}
    >
      <Icon className="size-3" />
      {s.label}
    </span>
  )
}
