# Cobralia — Plan de componentes UI

> Sistema de componentes para la app, mapeado a las pantallas y al dominio reales de Cobralia. Usa los tokens de `cobralia-plan-colores.md`.

---

## 1. Base: shadcn/ui + Tailwind

Recomendación: **shadcn/ui** (Radix + Tailwind) como base.

- No es una dependencia: copiás los componentes a tu repo y los tuneás → control total para aplicar el tema ciruela/ámbar.
- Accesibilidad de Radix gratis (foco, teclado, ARIA).
- Encaja con Next.js + Tailwind sin fricción.

Sobre esa base se construyen los **componentes de dominio** (los que hacen a Cobralia, Cobralia).

---

## 2. Tipografía

La tipografía carga la personalidad. Pareo deliberado (no el Inter de siempre):

| Rol | Tipografía | Uso |
| --- | --- | --- |
| **Display** | **Fraunces** (variable, opsz) | Encabezados, wordmark, números grandes del dashboard. Serif cálida y moderna, con carácter "artístico" sin caer en cliché. |
| **Cuerpo / UI** | **Hanken Grotesk** | Todo el texto de interfaz. Sans humanista, muy legible, con más carácter que Inter. |
| **Datos / mono** | **IBM Plex Mono** | **Montos**, números de recibo, IDs, columnas de plata. |

> **Plata = números tabulares.** Donde aparezca dinero, usá `font-variant-numeric: tabular-nums` (o IBM Plex Mono) para que las columnas alineen.

```ts
// app/fonts.ts (next/font)
import { Fraunces, Hanken_Grotesk, IBM_Plex_Mono } from 'next/font/google'
export const display = Fraunces({ subsets:['latin'], variable:'--font-display' })
export const sans    = Hanken_Grotesk({ subsets:['latin'], variable:'--font-sans' })
export const mono    = IBM_Plex_Mono({ subsets:['latin'], weight:['400','500'], variable:'--font-mono' })
```

**Escala de tipos**

| Estilo | Tamaño / interlineado | Familia · peso |
| --- | --- | --- |
| Display | 40 / 44 | Fraunces · 600 |
| H1 | 30 / 36 | Fraunces · 600 |
| H2 | 24 / 30 | Hanken · 600 |
| H3 | 20 / 26 | Hanken · 600 |
| Cuerpo | 16 / 24 | Hanken · 400 |
| Small | 14 / 20 | Hanken · 400 |
| Caption | 12 / 16 | Hanken · 500 |
| Monto | hereda tamaño | IBM Plex Mono · 500, tabular |

*Alternativa todo-sans (más "tech"):* **Bricolage Grotesque** (display) + **Hanken Grotesk** (cuerpo).

---

## 3. Inventario de componentes

### Primitivos (de shadcn, tematizados)
Button · Input · Textarea · Select · Checkbox · Switch · Label · Tooltip · DropdownMenu · Tabs · Dialog · Sheet (panel lateral) · Popover · Calendar / DatePicker · Toast (sonner) · Badge · Avatar · Skeleton · Separator.

### Layout
| Componente | Qué hace |
| --- | --- |
| `AppShell` | Marco general: **sidebar** en compu / **bottom nav** en celu. |
| `TopBar` | Selector de período (mes), búsqueda, menú de usuario. |
| `PageHeader` | Título + acción primaria de la pantalla. |
| `MobileNav` | Navegación inferior con 4–5 destinos clave. |

### Datos
| Componente | Qué hace |
| --- | --- |
| `DataTable` | Tabla con orden/filtro. **En celu colapsa a tarjetas.** |
| `MetricCard` | Tarjeta de total (con label, número grande y delta). |
| `MoneyDisplay` | Formatea moneda AR, números tabulares, signo/color opcional. |
| `StatusBadge` | Estado de cuota (ver §4). |
| `MetodoPagoBadge` | Efectivo / Transferencia / Mercado Pago + ícono. |
| `EmptyState` | Pantalla vacía como invitación a actuar. |
| `PaymentTimeline` | Historial de pagos de una cuota/alumno. |

### Formularios
`Form` (react-hook-form + zod) · `FieldRow` · `MoneyInput` (máscara de moneda) · `PeriodSelector` (mes/año) · `PhoneInput`.

### Componentes de dominio
`AlumnoForm` · `AlumnoCard` · `ActividadForm` · `ClaseForm` · `ClaseCard` · `HorarioPicker` · `AgendaSala` · `SalonForm` · `ProfeForm` · `PagoForm` · `CuotaRow` / `CuotaList` · `ReciboPreview` · `RecordatorioButton` · `LiquidacionCard` · `UsoSalonForm` · `DashboardSummary`.

---

## 4. Specs de los componentes clave

### `StatusBadge`
- **Props:** `estado: 'PENDIENTE' | 'POR_VENCER' | 'PAGADA' | 'VENCIDA' | 'PARCIAL'`
- **Render:** ícono + etiqueta + colores del mapa de estados (plan de colores §5).
- **Regla:** siempre ícono **y** texto (no solo color).

### `MoneyDisplay`
- **Props:** `monto: number`, `intent?: 'default' | 'positive' | 'negative'`, `size?`
- Formato `es-AR` con `Intl.NumberFormat`, números tabulares. Centraliza el formateo de plata (un solo lugar).

### `PagoForm`
- **Campos:** monto (default = saldo de la cuota), método (`EFECTIVO | TRANSFERENCIA | MERCADOPAGO`), fecha.
- **Estados:** permite **pago parcial** (deja la cuota en `PARCIAL`).
- **Al guardar:** recalcula estado de la cuota y ofrece **generar recibo**.

### `CuotaRow` / `CuotaList`
- Muestra: alumno, clase, período, monto, `StatusBadge`, y acciones (**Registrar pago**, **Enviar recordatorio**, **Ver recibo**).
- Filtros: período, estado, alumno/clase.

### `RecordatorioButton`
- Arma un link `https://wa.me/<telefono>?text=<mensaje>` con texto prellenado y contextual ("hola {alumno}, te recuerdo la cuota de {mes}…").
- Variantes de mensaje: **recordatorio** (pendiente) y **aviso de atraso** (vencida). Tono amable.
- Deshabilitado si el alumno no tiene teléfono cargado (con tooltip que lo explica).

### `MetricCard` (dashboard)
- Tres del MVP: **Cobrado** (mes), **Pendiente**, **Vencido**. Más un desglose por fuente (alumnos propios / comisiones / alquiler) en Fase 2.

### `ProfeForm` (Fase 2)
- Campo `tipo`: `TITULAR | PORCENTAJE | ALQUILER`.
- **Campos condicionales:** si `PORCENTAJE` → `comisionPct`; si `ALQUILER` → `tarifaHora`. (Buen ejemplo de form dinámico con zod.)

### `LiquidacionCard` (Fase 2)
- Muestra concepto (`COMISION` / `ALQUILER`), período, monto calculado y estado (`PENDIENTE` / `LIQUIDADA`) con acción para marcar saldada.

### `ClaseForm`
- **Campos:** nombre, **actividad** (Escalada, Telas, Danza…), profe, arancel mensual y uno o más **horarios** (vía `HorarioPicker`).
- Una clase pertenece a una actividad; eso ordena la agenda y el reporte por actividad.

### `HorarioPicker`
- Define cada franja: **día de la semana + hora inicio/fin + salón**. Permite varias franjas por clase (p. ej. lun y mié).
- **Avisa en vivo si hay conflicto de sala** (ese salón ya está ocupado en ese rango). Es lo que permite que escalada y telas convivan en el mismo espacio sin pisarse.

### `AgendaSala`
- Vista de grilla semanal **por salón**: muestra qué actividad/clase ocupa cada franja. De un vistazo ves cómo está usado cada espacio y dónde hay huecos.

---

## 5. Matriz pantallas × componentes

| Pantalla | Componentes principales |
| --- | --- |
| **Dashboard** | `MetricCard` ×3, `CuotaList` (vencidas/por vencer), `DashboardSummary` |
| **Alumnos** | `DataTable` → `AlumnoCard` (celu), `PageHeader` + alta |
| **Alumno (detalle)** | datos + `CuotaList` del alumno + `PaymentTimeline` + `RecordatorioButton` |
| **Clases** | `DataTable`/`ClaseCard`, `ClaseForm` + `HorarioPicker` |
| **Actividades** | `DataTable`, `ActividadForm` |
| **Salones / Agenda** | `DataTable`, `SalonForm`, `AgendaSala` (grilla por sala) |
| **Cuotas** | `CuotaList` + filtros + `PeriodSelector` |
| **(modal) Registrar pago** | `Dialog` + `PagoForm` |
| **Recibo** | `ReciboPreview` (+ descarga PDF) |
| **Profes** (Fase 2) | `DataTable`, `ProfeForm` |
| **Liquidaciones** (Fase 2) | `LiquidacionCard`, `UsoSalonForm` |
| **Configuración** | datos del estudio, usuarios |

---

## 6. Responsive (celu + compu)

- **Mobile-first.** En celu: `bottom nav`, **tablas → tarjetas apiladas**, acciones en `Sheet` o barra inferior fija.
- En compu: sidebar persistente + tablas completas con orden/filtro.
- Áreas táctiles ≥ 44px. Acción primaria siempre alcanzable con el pulgar en celu.

---

## 7. Estados (loading / vacío / error)

Tratá la ausencia y el error como dirección, no decoración:

- **Loading:** `Skeleton` con la forma del contenido (no spinners genéricos).
- **Vacío:** una invitación a actuar — "Todavía no cargaste alumnos. Sumá el primero para empezar a cobrar." + botón.
- **Error:** explicá qué pasó y cómo seguir, en la voz de la interfaz, sin disculpas ni vaguedad — "No pudimos guardar el pago. Revisá el monto e intentá de nuevo."

---

## 8. Accesibilidad

- Foco visible en ciruela en todo lo interactivo.
- Estados con **color + ícono + texto**.
- Todos los inputs con `Label` asociado; diálogos con foco atrapado (Radix).
- Respetar `prefers-reduced-motion`.

---

## 9. Microcopy / vocabulario (consistente)

Un verbo se mantiene en todo el flujo: el botón y su confirmación usan la misma palabra.

| Acción (botón) | Toast al completar |
| --- | --- |
| Registrar pago | "Pago registrado" |
| Generar recibo | "Recibo generado" |
| Enviar recordatorio | "Recordatorio listo para enviar" |
| Guardar cambios | "Cambios guardados" |
| Dar de baja | "Inscripción dada de baja" |

Nombrá las cosas por lo que la persona controla, no por cómo está hecho el sistema: "alumnos", "cuotas", "recordatorios" — nunca "registros" ni "webhooks".

---

## 10. Próximos pasos

1. Inicializar shadcn/ui y volcar los tokens de color/tipografía.
2. Construir los primitivos + `AppShell` (sidebar/bottom-nav).
3. Armar `StatusBadge`, `MoneyDisplay`, `CuotaList` y `PagoForm` — con eso ya tenés el corazón visual del MVP.
