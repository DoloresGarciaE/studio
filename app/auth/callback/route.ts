import { NextResponse, type NextRequest } from "next/server"

import { createClient } from "@/lib/supabase/server"

// Callback de auth: cierra el flujo de Google (OAuth/PKCE) y el de
// confirmación de email (token_hash). Deja la sesión en cookies y redirige.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const tokenHash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const next = searchParams.get("next") ?? "/dashboard"

  const supabase = await createClient()

  let ok = false
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    ok = !error
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as never,
      token_hash: tokenHash,
    })
    ok = !error
  }

  if (!ok) {
    return NextResponse.redirect(`${origin}/login?error=auth`)
  }

  // En producción detrás de Vercel, respetar el host público.
  const forwardedHost = request.headers.get("x-forwarded-host")
  const isLocal = process.env.NODE_ENV === "development"
  const base = isLocal || !forwardedHost ? origin : `https://${forwardedHost}`
  return NextResponse.redirect(`${base}${next}`)
}
