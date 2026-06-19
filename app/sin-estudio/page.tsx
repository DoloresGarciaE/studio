import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function SinEstudioPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="font-heading text-xl font-semibold text-foreground">
        Falta tu estudio
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Tu cuenta no tiene un estudio asociado. Si recién configuraste Supabase,
        corré <code className="rounded bg-muted px-1">supabase/schema.sql</code>{" "}
        completo (incluye la función <code>ensure_studio</code>) y volvé a
        intentar.
      </p>
      <Link href="/dashboard" className={cn(buttonVariants({ size: "sm" }))}>
        Reintentar
      </Link>
    </main>
  )
}
