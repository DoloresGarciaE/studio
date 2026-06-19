"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Loader2, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { registrarPago } from "@/app/(app)/cuotas/actions"
import { formatCurrency } from "@/lib/format"
import type { MetodoPago } from "@/lib/types"

const metodos: { value: MetodoPago; label: string }[] = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "MERCADOPAGO", label: "Mercado Pago" },
]

function hoy() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`
}

export function PagoDialog({
  cuotaId,
  saldo,
  contexto,
  size = "sm",
  variant = "default",
}: {
  cuotaId: string
  saldo: number
  contexto?: string
  size?: "xs" | "sm" | "default"
  variant?: "default" | "outline"
}) {
  const [open, setOpen] = useState(false)
  const [metodo, setMetodo] = useState<MetodoPago>("EFECTIVO")
  const [pending, startTransition] = useTransition()

  function onSubmit(formData: FormData) {
    formData.set("metodo", metodo)
    startTransition(async () => {
      const res = await registrarPago(cuotaId, formData)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success("Pago registrado")
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <Wallet className="size-4" /> Registrar pago
      </Button>
      <DialogContent>
        <form action={onSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar pago</DialogTitle>
            <DialogDescription>
              {contexto ? `${contexto} · ` : ""}Saldo: {formatCurrency(saldo)}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="monto">Monto</Label>
              <Input
                id="monto"
                name="monto"
                type="number"
                min="0"
                step="100"
                required
                defaultValue={saldo || ""}
              />
            </div>
            <div className="grid gap-2">
              <Label>Método</Label>
              <Select
                value={metodo}
                onValueChange={(v) => setMetodo((v ?? "EFECTIVO") as MetodoPago)}
                items={Object.fromEntries(metodos.map((m) => [m.value, m.label]))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {metodos.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input id="fecha" name="fecha" type="date" defaultValue={hoy()} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 className="size-4 animate-spin" />}
              Registrar pago
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
