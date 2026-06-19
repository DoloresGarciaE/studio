import type React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { LogOut } from "lucide-react"

import { requireStudio } from "@/lib/studio"
import { createClient } from "@/lib/supabase/server"
import { SidebarNav } from "@/components/sidebar-nav"
import { Button } from "@/components/ui/button"

async function logout() {
  "use server"
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { studio } = await requireStudio()

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 border-b border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground md:w-64 md:border-r md:border-b-0 md:py-6">
        <div className="px-2">
          <Link
            href="/alumnos"
            className="font-heading text-xl font-semibold text-sidebar-foreground"
          >
            Cobralia
          </Link>
          <p className="truncate text-sm text-sidebar-foreground/70">
            {studio?.nombre ?? "Mi estudio"}
          </p>
        </div>

        <SidebarNav />

        <form action={logout} className="mt-auto hidden md:block">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="size-4" /> Cerrar sesión
          </Button>
        </form>
      </aside>

      <main className="min-w-0 flex-1 bg-background">{children}</main>
    </div>
  )
}
