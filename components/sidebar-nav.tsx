"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GraduationCap, Users, UserCog } from "lucide-react"

import { cn } from "@/lib/utils"

const items = [
  { href: "/alumnos", label: "Alumnos", icon: Users },
  { href: "/clases", label: "Clases", icon: GraduationCap },
  { href: "/profesores", label: "Profesores", icon: UserCog },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 md:flex-col">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:flex-none",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
