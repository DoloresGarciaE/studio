"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [pending, startTransition] = useTransition()

  function onSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")
    const studioNombre = String(formData.get("studio_nombre") ?? "").trim()

    startTransition(async () => {
      const supabase = createClient()

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { studio_nombre: studioNombre || "Mi estudio" } },
        })
        if (error) {
          toast.error(error.message)
          return
        }
        toast.success("Cuenta creada")
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          toast.error("Email o contraseña incorrectos")
          return
        }
      }

      router.push("/alumnos")
      router.refresh()
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 space-y-1 text-center">
          <h1 className="font-heading text-2xl font-semibold text-primary">
            Cobralia
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === "signin" ? "Ingresá a tu estudio" : "Creá tu estudio"}
          </p>
        </div>

        <form action={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="studio_nombre">Nombre del estudio</Label>
              <Input
                id="studio_nombre"
                name="studio_nombre"
                placeholder="Ej. Estudio Danza Norte"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="vos@email.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending && <Loader2 className="size-4 animate-spin" />}
            {mode === "signin" ? "Ingresar" : "Crear cuenta"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "signin"
            ? "¿No tenés cuenta? Creá tu estudio"
            : "¿Ya tenés cuenta? Ingresá"}
        </button>
      </Card>
    </main>
  )
}
