import { Card } from "@/components/ui/card"
import { MoneyDisplay } from "@/components/money-display"

type Intent = "default" | "positive" | "negative" | "muted"

export function MetricCard({
  label,
  monto,
  intent = "default",
  hint,
  icon: Icon,
}: {
  label: string
  monto: number
  intent?: Intent
  hint?: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
      </div>
      <div className="mt-2">
        <MoneyDisplay monto={monto} intent={intent} className="text-2xl font-semibold" />
      </div>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </Card>
  )
}
