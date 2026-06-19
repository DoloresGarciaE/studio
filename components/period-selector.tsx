"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { addMeses, formatPeriodo } from "@/lib/billing/periodo"

export function PeriodSelector({ periodo }: { periodo: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  function go(p: string) {
    const sp = new URLSearchParams(params.toString())
    sp.set("periodo", p)
    router.push(`${pathname}?${sp.toString()}`)
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => go(addMeses(periodo, -1))}
        aria-label="Mes anterior"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-[150px] text-center text-sm font-medium">
        {formatPeriodo(periodo)}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => go(addMeses(periodo, 1))}
        aria-label="Mes siguiente"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
