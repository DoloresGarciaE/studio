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

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [pending, startTransition] = useTransition()
  const [googlePending, setGooglePending] = useState(false)

  function signInWithGoogle() {
    setGooglePending(true)
    const supabase = createClient()
    supabase.auth
      .signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      .then(({ error }) => {
        if (error) {
          toast.error(error.message)
          setGooglePending(false)
        }
        // si no hay error, el navegador se redirige solo a Google
      })
  }

  function onSubmit(formData: FormData) {
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")
    const studioNombre = String(formData.get("studio_nombre") ?? "").trim()

    startTransition(async () => {
      const supabase = createClient()

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { studio_nombre: studioNombre || "Mi estudio" },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) {
          toast.error(error.message)
          return
        }
        // Si la confirmación de email está activada, no hay sesión todavía.
        if (!data.session) {
          toast.success("Te enviamos un email para confirmar tu cuenta.")
          return
        }
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

      router.push("/dashboard")
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

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={signInWithGoogle}
          disabled={googlePending || pending}
        >
          {googlePending ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
          Continuar con Google
        </Button>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />o<span className="h-px flex-1 bg-border" />
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
          <Button type="submit" className="w-full" disabled={pending || googlePending}>
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
