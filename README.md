# Cobralia

> App de cobranzas para estudios, gimnasios y espacios de clases. Cobrás la cuota
> mensual de tus alumnos, controlás morosos, mandás recordatorios y recibos, y
> liquidás lo que te deben los profes que dan clase en tu espacio — desde el celu
> o la compu.

## Estado actual

✅ **Scaffold funcional: compila y corre.** Punto de partida sobre la base inicial
generada en [v0](https://v0.app), completada y conectada a Supabase.

Ya funciona:

- **Auth** con Supabase (registro / login). Cada usuario obtiene su propio estudio.
- **Multi-tenant** por `studio_id` en cada query, reforzado con RLS en Postgres.
- ABMs de **Alumnos**, **Clases** y **Profesores** (crear / editar / eliminar).
- Layout con sidebar, paleta ciruela/ámbar y toasts.

Todavía no (roadmap del MVP):

- Inscripciones, generación de **cuotas**, **pagos** y estados.
- **Recibos** PDF, **dashboard** de totales, **recordatorios** `wa.me`.
- Horarios estructurados (Actividad + Horario + conflictos de sala). Hoy una clase
  guarda `dia_horario` como texto y un único salón/profe.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind v4** + **shadcn/ui** (estilo `base-nova`, primitivas `@base-ui/react`)
- **Supabase** (Postgres + Auth) vía `@supabase/ssr`
- **sonner** para toasts

## Puesta en marcha

```bash
pnpm install
```

1. Creá un proyecto en [Supabase](https://supabase.com).
2. Copiá `.env.example` a `.env.local` y completá con la URL y la anon key
   (Supabase → Project Settings → API):

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

3. En el **SQL Editor** de Supabase, ejecutá [`supabase/schema.sql`](./supabase/schema.sql).
   Crea las tablas, las policies de RLS y el trigger que arma un estudio al registrarse.
4. _(Para probar en dev)_ En Supabase → **Authentication → Sign In / Providers → Email**,
   desactivá "Confirm email" para entrar sin confirmar el mail (o confirmalo).
5. Levantá la app:

   ```bash
   pnpm dev
   ```

   Abrí `http://localhost:3000`, entrá a `/login` y creá tu estudio.

## Cómo funciona el multi-tenant

- Al registrarse, un trigger (`handle_new_user`) crea un `Studio` y deja al usuario
  como `OWNER` en `studio_members`.
- `lib/studio.ts → requireStudio()` toma el estudio **de la sesión** (nunca del cliente).
- Cada lectura/escritura filtra por `studio_id`; las **policies de RLS** lo refuerzan
  a nivel base de datos.
- `proxy.ts` protege las rutas: sin sesión, redirige a `/login`.

## Estructura

```text
app/
  (app)/                 # rutas privadas (layout con sidebar)
    alumnos/ clases/ profesores/
  login/                 # registro / ingreso
components/
  ui/                    # primitivos shadcn (base-nova)
  page-header, empty-state, delete-button, sidebar-nav
lib/
  supabase/{server,client,middleware}.ts
  studio.ts  types.ts  format.ts
supabase/schema.sql      # tablas + RLS + onboarding
proxy.ts                 # protección de rutas
docs/                    # producto, implementación, UI, colores
```

## Documentación

La visión de producto y el plan técnico están en [`docs/`](./docs):

| Documento | Qué cubre |
| --- | --- |
| [`cobralia-documento-producto.md`](./docs/cobralia-documento-producto.md) | Producto: validación, personas, dominio, alcance del MVP, roadmap. |
| [`cobralia-plan-implementacion.md`](./docs/cobralia-plan-implementacion.md) | Stack, arquitectura, modelo de datos, multi-tenancy, milestones. |
| [`cobralia-plan-componentes-ui.md`](./docs/cobralia-plan-componentes-ui.md) | Sistema de componentes UI, tipografía, pantallas. |
| [`cobralia-plan-colores.md`](./docs/cobralia-plan-colores.md) | Sistema de color (ciruela/ámbar), tokens, accesibilidad. |

> Nota: el plan de implementación describe **Prisma + Postgres**; esta versión usa
> **Supabase** (Postgres + Auth gestionados) con el mismo modelo de datos y la misma
> regla de multi-tenancy.
