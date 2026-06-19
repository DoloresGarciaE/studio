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

  // Redirige copiando las cookies que Supabase pudo refrescar en este request.
  // Sin esto, una redirección descarta los tokens rotados y la sesión "parpadea"
  // → ERR_TOO_MANY_REDIRECTS entre /login y /dashboard.
  function redirectTo(pathname: string, keepSearch = false) {
    const url = request.nextUrl.clone()
    url.pathname = pathname
    if (!keepSearch) url.search = ""
    const res = NextResponse.redirect(url)
    response.cookies.getAll().forEach((c) => res.cookies.set(c))
    return res
  }

  const hasAuthCode =
    request.nextUrl.searchParams.has("code") ||
    request.nextUrl.searchParams.has("token_hash")

  if (!user && hasAuthCode && !isAuthFlow) {
    return redirectTo("/auth/callback", true)
  }

  if (!user && !isLogin && !isAuthFlow) {
    return redirectTo("/login")
  }

  if (user && isLogin) {
    return redirectTo("/dashboard")
  }

  return response
}
