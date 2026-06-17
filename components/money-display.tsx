import { formatCurrency } from "@/lib/format"
import { cn } from "@/lib/utils"

type Intent = "default" | "positive" | "negative" | "muted"

const intentClass: Record<Intent, string> = {
  default: "",
  positive: "text-[#047857]",
  negative: "text-[#B91C1C]",
  muted: "text-muted-foreground",
}

// Centraliza el render de plata: mono + números tabulares para que alineen.
export function MoneyDisplay({
  monto,
  intent = "default",
  className,
}: {
  monto: number | null | undefined
  intent?: Intent
  className?: string
}) {
  return (
    <span className={cn("font-mono tabular-nums", intentClass[intent], className)}>
      {formatCurrency(Number(monto ?? 0))}
    </span>
  )
}
