# Cobralia — Plan de implementación (MVP)

> Plan técnico para construir el MVP descrito en `cobralia-documento-producto.md`. Objetivo: que en pocas semanas puedas reemplazar tu Excel y dejar de perseguir morosos a mano, usándolo vos en tu estudio.

---

## 1. Stack

| Capa | Elección | Por qué |
| --- | --- | --- |
| Framework | **Next.js (App Router) + TypeScript** | Full-stack en un solo repo: server actions + route handlers. No necesitás un Express aparte. |
| Base de datos | **PostgreSQL** | Relacional, encaja con el dominio (relaciones, dinero, integridad). |
| ORM | **Prisma** | Tipado, migraciones, excelente DX con Next + TS. |
| Auth | **Auth.js (NextAuth)** o **Clerk** | Auth.js si querés control total; Clerk si querés velocidad y multi-tenant out-of-the-box. |
| UI | **Tailwind + shadcn/ui** | Componentes accesibles y 100% themables (ver `cobralia-plan-componentes-ui.md`). |
| Validación | **Zod + react-hook-form** | Un solo schema de validación cliente/servidor. |
| Cobros online (Fase 2) | **Mercado Pago Suscripciones** | Mensualidades automáticas, link compartible. |
| Recibos | **@react-pdf/renderer** o Puppeteer | PDF del recibo de pago. |
| Recordatorios (MVP) | **Links `wa.me`** | Gratis, los mandás vos. WhatsApp Business Platform queda para Fase 2. |
| Hosting | **Vercel** + Postgres administrado (**Neon / Supabase / Railway**) | Deploy directo + cron jobs. |

---

## 2. Arquitectura

- **Monolito Next.js full-stack.** Las mutaciones van por *server actions*; los webhooks (Mercado Pago) por *route handlers* (`app/api/...`).
- **Multi-tenant desde el día 1.** Una sola base, `studioId` en cada tabla, y **todas** las queries pasan por un helper que filtra por el estudio de la sesión. Nunca una query sin `studioId`.
- **Lógica de dinero centralizada.** Una sola capa (`/lib/billing`) calcula cuotas, estados y liquidaciones. No esparcir cálculos de plata por los componentes.

### Estructura de carpetas

```text
app/
  (auth)/login/
  (app)/
    dashboard/
    alumnos/[id]/
    clases/[id]/
    cuotas/
    salones/
    profes/[id]/
    liquidaciones/        # Fase 2
    configuracion/
  api/
    webhooks/mercadopago/ # Fase 2
    cron/generar-cuotas/  # corre el día 1 de cada mes
lib/
  db.ts                   # cliente Prisma
  auth.ts
  tenant.ts               # getCurrentStudio(), scoping
  billing/                # cuotas, estados, liquidaciones
  whatsapp.ts             # armado de links wa.me
  pdf/recibo.tsx
components/               # ver plan de componentes
prisma/
  schema.prisma
  seed.ts
```

---

## 3. Modelo de datos (boceto Prisma)

```prisma
// prisma/schema.prisma — boceto
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

model Studio {
  id          String      @id @default(cuid())
  nombre      String
  createdAt   DateTime    @default(now())
  usuarios    Usuario[]
  salones     Salon[]
  actividades Actividad[]
  profesores  Profesor[]
  alumnos     Alumno[]
  clases      Clase[]
}

model Usuario {
  id       String @id @default(cuid())
  email    String @unique
  nombre   String
  rol      Rol    @default(OWNER)
  studioId String
  studio   Studio @relation(fields: [studioId], references: [id])
}
enum Rol { OWNER ADMIN }

model Salon {
  id       String    @id @default(cuid())
  nombre   String    // cualquier espacio: sala, salón, box, pared de escalada...
  studioId String
  studio   Studio    @relation(fields: [studioId], references: [id])
  horarios Horario[] // las franjas que ocupan este espacio
  @@index([studioId])
}

model Actividad {
  id       String  @id @default(cuid())
  nombre   String  // Escalada, Telas, Danza, Yoga, Spinning...
  color    String? // opcional, para la agenda
  studioId String
  studio   Studio  @relation(fields: [studioId], references: [id])
  clases   Clase[]
  @@index([studioId])
}

model Profesor {
  id            String        @id @default(cuid())
  nombre        String
  tipo          TipoProfesor
  comisionPct   Decimal?      @db.Decimal(5, 2)   // solo PORCENTAJE
  tarifaHora    Decimal?      @db.Decimal(12, 2)  // solo ALQUILER
  studioId      String
  studio        Studio        @relation(fields: [studioId], references: [id])
  clases        Clase[]
  liquidaciones Liquidacion[]
  usosSalon     UsoSalon[]
  @@index([studioId])
}
enum TipoProfesor { TITULAR PORCENTAJE ALQUILER }

model Alumno {
  id            String        @id @default(cuid())
  nombre        String
  telefono      String?       // para los recordatorios wa.me
  email         String?
  studioId      String
  studio        Studio        @relation(fields: [studioId], references: [id])
  inscripciones Inscripcion[]
  @@index([studioId])
}

model Clase {
  id             String        @id @default(cuid())
  nombre         String
  arancelMensual Decimal       @db.Decimal(12, 2)
  studioId       String
  studio         Studio        @relation(fields: [studioId], references: [id])
  actividadId    String
  actividad      Actividad     @relation(fields: [actividadId], references: [id])
  profesorId     String
  profesor       Profesor      @relation(fields: [profesorId], references: [id])
  horarios       Horario[]     // cuándo y en qué salón se dicta (1+ franjas)
  inscripciones  Inscripcion[]
  @@index([studioId])
}

model Horario {
  id         String @id @default(cuid())
  claseId    String
  clase      Clase  @relation(fields: [claseId], references: [id])
  salonId    String
  salon      Salon  @relation(fields: [salonId], references: [id])
  diaSemana  Int    // 0 = domingo ... 6 = sábado
  horaInicio String // "18:00"
  horaFin    String // "19:00"
  // Mismo salón, sin solapamientos: validar a nivel app antes de guardar.
  @@index([salonId, diaSemana])
}

model Inscripcion {
  id       String  @id @default(cuid())
  alumnoId String
  alumno   Alumno  @relation(fields: [alumnoId], references: [id])
  claseId  String
  clase    Clase   @relation(fields: [claseId], references: [id])
  activa   Boolean @default(true)
  cuotas   Cuota[]
  @@unique([alumnoId, claseId])
}

model Cuota {
  id            String      @id @default(cuid())
  inscripcionId String
  inscripcion   Inscripcion @relation(fields: [inscripcionId], references: [id])
  periodo       DateTime    // primer día del mes
  monto         Decimal     @db.Decimal(12, 2)
  vencimiento   DateTime
  estado        EstadoCuota @default(PENDIENTE)
  pagos         Pago[]
  @@unique([inscripcionId, periodo])
}
enum EstadoCuota { PENDIENTE PAGADA VENCIDA PARCIAL }

model Pago {
  id      String     @id @default(cuid())
  cuotaId String
  cuota   Cuota      @relation(fields: [cuotaId], references: [id])
  monto   Decimal    @db.Decimal(12, 2)
  metodo  MetodoPago
  fecha   DateTime   @default(now())
  recibo  Recibo?
}
enum MetodoPago { EFECTIVO TRANSFERENCIA MERCADOPAGO }

model Recibo {
  id        String   @id @default(cuid())
  pagoId    String   @unique
  pago      Pago     @relation(fields: [pagoId], references: [id])
  numero    Int
  pdfUrl    String?
  createdAt DateTime @default(now())
}

// --- Fase 2 ---
model Liquidacion {
  id         String         @id @default(cuid())
  profesorId String
  profesor   Profesor       @relation(fields: [profesorId], references: [id])
  periodo    DateTime
  concepto   ConceptoLiquid
  monto      Decimal        @db.Decimal(12, 2)
  estado     EstadoLiquid   @default(PENDIENTE)
}
enum ConceptoLiquid { COMISION ALQUILER }
enum EstadoLiquid { PENDIENTE LIQUIDADA }

model UsoSalon {
  id         String   @id @default(cuid())
  profesorId String
  profesor   Profesor @relation(fields: [profesorId], references: [id])
  salonId    String
  fecha      DateTime
  horas      Decimal  @db.Decimal(5, 2)
}
```

> **Plata:** usá siempre `Decimal`, nunca `Float`. En JS, manejá montos con una librería decimal o en centavos (enteros) para evitar errores de redondeo.

---

## 4. Multi-tenancy (regla de oro)

1. La sesión guarda `studioId`.
2. `getCurrentStudio()` lo lee del lado del servidor.
3. Cada lectura/escritura incluye `where: { studioId }` (o se hace vía un helper `withStudio(prisma)` que lo inyecta).
4. Más adelante, reforzar con **Row Level Security** en Postgres como red de seguridad.

Nunca confíes en un `studioId` que venga del cliente: tomalo siempre de la sesión.

---

## 5. Generación de cuotas (el corazón del MVP)

- **Cron de Vercel** (`/api/cron/generar-cuotas`) que corre el **día 1 de cada mes**.
- Por cada `Inscripcion` activa, crea la `Cuota` del período con el `arancelMensual` de la clase, **si no existe** (idempotente, gracias al `@@unique([inscripcionId, periodo])`).
- Un segundo paso marca como `VENCIDA` las cuotas `PENDIENTE`/`PARCIAL` cuyo `vencimiento` ya pasó.
- El estado `PARCIAL` se deriva: si `sum(pagos) > 0` y `< monto` → `PARCIAL`; si `>= monto` → `PAGADA`.
- "Por vencer" es un estado **de UI** (no de DB): cuota `PENDIENTE` con vencimiento en los próximos N días.

---

## 6. Autenticación y onboarding

- Registro del dueño → crea el `Studio` y el `Usuario` con rol `OWNER` en la misma transacción.
- Auth.js con email + password o magic link (o Clerk si querés saltarte esto).
- Roles: `OWNER` (todo) y, en Fase 2, `ADMIN` (secretaria, permisos acotados).

---

## 7. Roadmap de construcción (milestones)

**M0 — Setup**
- [ ] Proyecto Next.js + TS + Tailwind + shadcn/ui
- [ ] Prisma + Postgres + primera migración + `seed.ts`
- [ ] Tokens de color y tipografía (ver planes de colores y componentes)

**M1 — Auth + tenant**
- [ ] Login/registro, creación de Studio, `getCurrentStudio()`, scoping

**M2 — ABMs base**
- [ ] Salones · Actividades · Alumnos · Inscripciones (crear/editar/listar)
- [ ] Clases con su actividad y **horarios estructurados** (día + hora + salón)
- [ ] Validación de **conflictos de sala** (no solapar dos horarios en el mismo salón) + vista de agenda por salón

**M3 — Cuotas y pagos** ← entrega el valor central
- [ ] Cron de generación de cuotas
- [ ] Registrar pago (efectivo/transferencia) + estados
- [ ] Listado de cuotas con filtros (período, estado, alumno)

**M4 — Recibos**
- [ ] Generar recibo PDF + numeración

**M5 — Dashboard**
- [ ] Totales: cobrado / pendiente / vencido del mes + desglose por fuente

**M6 — Recordatorios**
- [ ] Botón "Enviar recordatorio" → link `wa.me` con texto prellenado

**Fase 2 (post-MVP):** profes invitados + liquidaciones · uso de salón por hora · Mercado Pago · WhatsApp Business Platform · roles · portal del alumno.

---

## 8. Variables de entorno

```bash
DATABASE_URL=postgresql://...
AUTH_SECRET=...
NEXT_PUBLIC_APP_URL=https://app.cobralia.com
# Fase 2
MERCADOPAGO_ACCESS_TOKEN=...
MERCADOPAGO_WEBHOOK_SECRET=...
```

---

## 9. Testing

- **Unit (Vitest):** toda la lógica de `/lib/billing` (cálculo de cuotas, estados, parcial, comisión, alquiler). Es donde un bug = plata mal contada.
- **E2E (Playwright):** flujos críticos — registrar pago, generar recibo, ver dashboard.
- **Seed:** un estudio de ejemplo con clases, alumnos y cuotas en varios estados para desarrollar y demostrar.

---

## 10. Definición de "listo" del MVP

- Lo usás **vos**, en tu estudio, durante un mes completo sin volver al Excel.
- Cargás alumnos y clases, se generan las cuotas solas, registrás pagos, mandás recordatorios por WhatsApp y emitís recibos.
- El dashboard te dice en un vistazo cuánto cobraste, cuánto falta y quién está vencido.

---

## 11. Próximos pasos sugeridos

1. Cerrar el `schema.prisma` y correr la primera migración.
2. Levantar el esqueleto Next.js con auth + tenant (M0–M1).
3. ABMs (M2) y la lógica de cuotas (M3) — ahí ya empezás a usarlo de verdad.
