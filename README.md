# Cobralia

> App de cobranzas para estudios, gimnasios y espacios de clases. Cobrás la cuota
> mensual de tus alumnos, controlás morosos, mandás recordatorios y recibos —
> desde el celu o la compu.

## Estado actual

✅ **MVP funcional (Fase 1 completa).** Partió de la base inicial generada en
[v0](https://v0.app) y quedó conectado a Supabase.

Ya funciona:

- **Auth + multi-tenant**: cada usuario tiene su estudio; todo filtra por
  `studio_id` (reforzado con RLS).
- **ABMs**: salones, profesores, alumnos y clases.
- **Inscripciones**: inscribir/dar de baja alumnos en clases (desde el alumno).
- **Cuotas**: generación mensual (botón manual + cron), estados
  **pendiente / por vencer / pagada / vencida / parcial**, filtros por período y estado.
- **Pagos**: registrar pago (efectivo / transferencia / Mercado Pago), pago parcial.
- **Recibos**: numerados por estudio, página imprimible / "Guardar como PDF".
- **Recordatorios**: botón que arma un link `wa.me` con texto prellenado.
- **Dashboard**: cobrado / pendiente / vencido del mes + lista de los que necesitan atención.
- **Liquidaciones** (multi-profe): comisión sobre lo cobrado (profes a %) y alquiler
  por horas de salón, con registro de uso de salón y "marcar saldada".

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind v4** + **shadcn/ui** (estilo `base-nova`, primitivas `@base-ui/react`)
- **Supabase** (Postgres + Auth) vía `@supabase/ssr`
- **sonner** para toasts
- Lógica de plata centralizada en [`lib/billing`](./lib/billing)

## Puesta en marcha

```bash
pnpm install
```

1. Creá un proyecto en [Supabase](https://supabase.com).
2. Copiá `.env.example` a `.env.local` y completá con la URL y la anon key
   (Supabase → Project Settings → API).
3. En el **SQL Editor** de Supabase, ejecutá [`supabase/schema.sql`](./supabase/schema.sql)
   (tablas, RLS y el trigger que arma un estudio al registrarse).
4. _(Para probar en dev)_ En Supabase → **Authentication → Email**, desactivá
   "Confirm email" para entrar sin confirmar el mail.
5. `pnpm dev` → `http://localhost:3000`, entrá a `/login` y creá tu estudio.

> El cron de generación de cuotas (`vercel.json` → `/api/cron/generar-cuotas`)
> es opcional: para el día a día alcanza con el botón **"Generar cuotas del mes"**.
> Si querés automatizarlo en Vercel, cargá `SUPABASE_SERVICE_ROLE_KEY` y `CRON_SECRET`.

## Flujo de uso

1. Cargá **salones** y **profesores** (opcional) y tus **clases** (con su arancel).
2. Cargá **alumnos** y, desde el detalle de cada uno, **inscribilos** en clases.
3. En **Cuotas**, generá las cuotas del mes.
4. Registrá **pagos**, mandá **recordatorios** y emití **recibos** desde Cuotas o el alumno.
5. Mirá el **Dashboard** para ver cuánto cobraste, cuánto falta y quién está vencido.
6. _(Profes invitados)_ En **Liquidaciones**, registrá horas de salón y generá lo que
   cada profe te debe (comisión sobre lo cobrado, o alquiler por horas).

## Cómo funciona

- **Multi-tenant**: `lib/studio.ts → requireStudio()` toma el estudio de la sesión
  (nunca del cliente); las policies de RLS lo refuerzan en la base.
- **Plata centralizada**: `lib/billing` calcula estados de cuota, saldo y generación.
  Estado = `PAGADA` > `VENCIDA` > `PARCIAL` > `PENDIENTE`; "por vencer" es de UI.
- **Rutas protegidas** por `proxy.ts` (sin sesión → `/login`).

## Estructura

```text
app/
  (app)/                 # privado (layout con sidebar)
    dashboard/ cuotas/ liquidaciones/ salones/
    alumnos/[id]/        # detalle: inscripciones + cuotas + pagos
    clases/ profesores/
  recibos/[id]/          # recibo imprimible (fuera del shell)
  login/  api/cron/generar-cuotas/
components/              # ui/ (shadcn) + dominio (status-badge, money-display,
                        #   pago-dialog, recordatorio-button, metric-card, ...)
lib/
  billing/               # estados, saldo, generación de cuotas, períodos
  supabase/  studio.ts  types.ts  format.ts
supabase/schema.sql      # tablas + RLS + onboarding
proxy.ts  vercel.json    # protección de rutas + cron
docs/                    # producto, implementación, UI, colores
```

## Documentación

| Documento | Qué cubre |
| --- | --- |
| [`cobralia-documento-producto.md`](./docs/cobralia-documento-producto.md) | Producto: validación, personas, dominio, alcance, roadmap. |
| [`cobralia-plan-implementacion.md`](./docs/cobralia-plan-implementacion.md) | Stack, arquitectura, modelo de datos, multi-tenancy, milestones. |
| [`cobralia-plan-componentes-ui.md`](./docs/cobralia-plan-componentes-ui.md) | Sistema de componentes UI, tipografía, pantallas. |
| [`cobralia-plan-colores.md`](./docs/cobralia-plan-colores.md) | Sistema de color (ciruela/ámbar), tokens, accesibilidad. |

## Pendiente (Fase 2)

- Horarios estructurados (Actividad + Horario + **conflictos de sala**) y agenda por salón.
  Hoy una clase guarda `dia_horario` como texto y un único salón/profe.
- Cobro online (Mercado Pago) y WhatsApp automático (BSP).
- Tipografías del plan (Fraunces / Hanken / IBM Plex Mono) — hoy Geist.

> Nota: el plan describe **Prisma + Postgres**; esta versión usa **Supabase**
> (Postgres + Auth gestionados) con el mismo modelo y la misma regla de multi-tenancy.
