import { MessageCircle } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format"
import { formatPeriodo } from "@/lib/billing/periodo"
import { cn } from "@/lib/utils"

function soloDigitos(t: string): string {
  return t.replace(/\D/g, "")
}

// Arma un link wa.me con texto prellenado y contextual. Tono amable.
export function RecordatorioButton({
  telefono,
  alumno,
  clase,
  periodo,
  saldo,
  vencida = false,
  size = "sm",
}: {
  telefono: string | null
  alumno: string
  clase: string
  periodo: string
  saldo: number
  vencida?: boolean
  size?: "xs" | "sm"
}) {
  const tel = telefono ? soloDigitos(telefono) : ""
  const mes = formatPeriodo(periodo)
  const monto = formatCurrency(saldo)

  if (!tel) {
    return (
      <span
        title="El alumno no tiene teléfono cargado"
        className={cn(
          buttonVariants({ variant: "ghost", size }),
          "pointer-events-none opacity-50",
        )}
      >
        <MessageCircle className="size-4" />
        Recordar
      </span>
    )
  }

  const texto = vencida
    ? `Hola ${alumno}, ¿cómo estás? Te escribo para recordarte que quedó pendiente la cuota de ${clase} de ${mes} (${monto}). Cualquier cosa avisame. ¡Gracias!`
    : `Hola ${alumno}, ¿cómo estás? Te paso para recordarte la cuota de ${clase} de ${mes} (${monto}). ¡Gracias!`

  const href = `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: "ghost", size }))}
    >
      <MessageCircle className="size-4" />
      Recordar
    </a>
  )
}
