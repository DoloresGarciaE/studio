import { type NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"

// Next 16: convención "proxy" (reemplaza a "middleware").
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Corre en todas las rutas excepto:
     * - _next/static, _next/image
     * - archivos estáticos (íconos, imágenes)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
