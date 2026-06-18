import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Refresca la sesión en cada request y protege las rutas privadas.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isAuthFlow = path.startsWith("/auth")
  const isLogin = path.startsWith("/login")

  // Si llega un code/token_hash de auth a cualquier ruta (p. ej. al root "/",
  // cuando el Site URL de Supabase no apunta a /auth/callback), reenviarlo al
  // callback preservando los query params para cerrar la sesión igual.
  const hasAuthCode =
    request.nextUrl.searchParams.has("code") ||
    request.nextUrl.searchParams.has("token_hash")
  if (!user && hasAuthCode && !isAuthFlow) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/callback"
    return NextResponse.redirect(url)
  }

  if (!user && !isLogin && !isAuthFlow) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (user && isLogin) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return response
}
