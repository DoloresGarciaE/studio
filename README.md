# Cobralia

> App de cobranzas para estudios, gimnasios y espacios de clases. Cobrás la cuota
> mensual de tus alumnos, controlás morosos, mandás recordatorios y recibos, y
> liquidás lo que te deben los profes que dan clase en tu espacio — desde el celu
> o la compu.

Este repo arranca con la **parte inicial generada en [v0](https://v0.app)** más
la documentación de producto, diseño e implementación del MVP.

## Estado actual

⚠️ **Scaffold inicial, todavía no compila.** Es el primer volcado de v0: sirve
como base, pero le faltan piezas para correr (ver "Pendientes").

Lo que ya está generado:

- Proyecto **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4**.
- **shadcn/ui** (estilo `base-nova`, primitivas `@base-ui/react`) — por ahora
  solo el componente `Button`.
- Tres ABMs de dominio bajo `app/(app)/`, cada uno con su página, sus
  *server actions* y su diálogo de alta/edición:
  - **Alumnos** (`alumnos/`)
  - **Clases** (`clases/`)
  - **Profesores** (`profesores/`)
- Acceso a datos vía **Supabase**, con *scoping* multi-tenant por `studio_id`
  en cada query.

## Pendientes para que compile y corra

El scaffold importa módulos y dependencias que v0 todavía no exportó:

- **Componentes UI faltantes:** `input`, `label`, `dialog`, `select`, `table`,
  `card`, `badge`, `avatar` (shadcn), más `page-header`, `empty-state` y
  `delete-button`.
- **Helpers de `lib/` faltantes:** `lib/supabase/server` (cliente Supabase),
  `lib/studio` (`requireStudio()`), `lib/types` y `lib/format`
  (`initials`, `formatCurrency`).
- **Dependencias sin instalar:** `sonner` (toasts) y el cliente de Supabase
  (`@supabase/supabase-js`, `@supabase/ssr`).
- **Schema de base de datos** (tablas `alumnos`, `clases`, `profesores`,
  `salones`, etc.) y variables de entorno de Supabase.

> Nota: el código usa **Supabase**, mientras que el plan de implementación
> (`docs/cobralia-plan-implementacion.md`) propone **Prisma + Postgres**. Hay que
> decidir con cuál seguir antes de completar el MVP.

## Documentación

La visión completa del producto y el plan técnico están en [`docs/`](./docs):

| Documento | Qué cubre |
| --- | --- |
| [`cobralia-documento-producto.md`](./docs/cobralia-documento-producto.md) | Producto: validación, personas, dominio, alcance del MVP, roadmap. |
| [`cobralia-plan-implementacion.md`](./docs/cobralia-plan-implementacion.md) | Stack, arquitectura, modelo de datos (Prisma), multi-tenancy, milestones. |
| [`cobralia-plan-componentes-ui.md`](./docs/cobralia-plan-componentes-ui.md) | Sistema de componentes UI, tipografía, pantallas. |
| [`cobralia-plan-colores.md`](./docs/cobralia-plan-colores.md) | Sistema de color (ciruela/ámbar), tokens, accesibilidad. |

## Desarrollo

```bash
pnpm install
pnpm dev
```

La app queda en `http://localhost:3000` (una vez resueltos los pendientes de
arriba).
