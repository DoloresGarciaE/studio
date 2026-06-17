"use client"

import { Printer } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ReciboPrintButton() {
  return (
    <Button onClick={() => window.print()} size="sm">
      <Printer className="size-4" /> Descargar / Imprimir
    </Button>
  )
}
