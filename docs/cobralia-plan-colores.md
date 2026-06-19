# Cobralia — Plan de colores

> Sistema de color para la app. No es una paleta genérica de SaaS: está pensada para una herramienta de **cobranzas** cuyos usuarios viven en el mundo de la **danza y las artes**.

---

## 1. Dirección (por qué este color)

El producto tiene una tensión linda para resolver con color: por un lado es **dinero** (necesita transmitir confianza, claridad, orden); por otro, sus dueños llevan un espacio de clases —estudio, gimnasio, sala multiuso— y cobrarle a un alumno suele ser un momento **incómodo**. La meta es "**confianza cálida**": que organizar la plata se sienta calmo y digno, no frío ni agresivo. (Sirve igual para una sala de danza que para un gimnasio de escalada: la calma y la claridad son universales.)

Decisiones deliberadas (y lo que evité a propósito):

- **Primario ciruela/berry**, no el azul corporativo de siempre. La ciruela es cálida, sofisticada y emparenta con lo artístico/teatral, y deja el verde, el ámbar y el rojo **libres para los estados**.
- **Ámbar como color de atención** (y único acento cálido). Doble función coherente: realce de marca *y* el estado "por vencer". El ámbar siempre significa "atención cálida".
- **Neutros cálidos** (con un leve tinte ciruela), no grises azulados fríos.
- Evité los tres clichés típicos de diseño autogenerado: fondo crema + serif de alto contraste + terracota; negro casi total con un verde ácido; y el layout tipo diario con líneas finas. Acá: fondo casi blanco limpio + ciruela + ámbar.

---

## 2. Paleta núcleo (tokens semánticos)

| Token | Rol | Hex |
| --- | --- | --- |
| **Primario (ciruela)** | Acciones principales, nav activa, marca | `#7A2E55` |
| **Primario fuerte** | Hover/pressed, títulos de marca | `#5C2240` |
| **Acento (ámbar)** | Realces puntuales, "por vencer" | `#E0A53E` |
| **Tinta (texto fuerte)** | Texto principal, encabezados | `#241E23` |
| **Papel (fondo)** | Fondo de la app | `#FAF8F9` |
| **Superficie** | Tarjetas, modales | `#FFFFFF` |

> Regla: el ámbar se usa **con cuentagotas**. La ciruela manda; el ámbar es el único "lujo".

---

## 3. Escalas completas

### Ciruela (primario)

| Paso | Hex | Uso típico |
| --- | --- | --- |
| 50 | `#FBF1F6` | fondos de selección muy suaves |
| 100 | `#F6E1EC` | fondo de badge/chip de marca |
| 200 | `#EBC2D7` | bordes suaves |
| 300 | `#DB9BBB` | acentos claros |
| 400 | `#C56E98` | links/acentos en modo oscuro |
| 500 | `#A8487B` | hover sobre superficies claras |
| **700** | **`#7A2E55`** | **primario** |
| 800 | `#5C2240` | hover/pressed, texto de marca |
| 900 | `#3F1830` | sidebar oscuro, máximo contraste |

### Ámbar (acento / atención)

| Paso | Hex | Uso típico |
| --- | --- | --- |
| 50 | `#FDF7EA` | fondo de badge "por vencer" |
| 100 | `#FAE9C6` | realces suaves |
| 200 | `#F4D58E` | bordes de aviso |
| 500 | `#E0A53E` | íconos/rellenos de acento |
| 700 | `#92590C` | **texto ámbar sobre fondo claro** (accesible) |
| 900 | `#4A2D07` | texto ámbar de máximo contraste |

### Neutros cálidos

| Paso | Hex | Uso típico |
| --- | --- | --- |
| 50 | `#FAF8F9` | fondo de la app |
| 100 | `#F3EFF1` | filas alternas, fondos sutiles |
| 200 | `#E6E0E3` | **bordes y divisores** |
| 300 | `#D2C9CE` | bordes de inputs |
| 400 | `#A99EA5` | placeholders, íconos desactivados |
| 500 | `#7C7178` | **texto secundario/muted** |
| 700 | `#4A4248` | **texto de cuerpo** |
| 900 | `#241E23` | **texto fuerte / encabezados** |

---

## 4. Colores semánticos / de estado

Cada uno con tres usos: relleno/ícono (`base`), texto sobre fondo claro (`text`) y fondo de badge (`bg`).

| Significado | base | text (sobre claro) | bg (badge) |
| --- | --- | --- | --- |
| **Éxito / Pagada** (verde) | `#0E9F6E` | `#047857` | `#E6F6EF` |
| **Atención / Por vencer** (ámbar) | `#E0A53E` | `#92590C` | `#FDF7EA` |
| **Error / Vencida / destructivo** (rojo) | `#DC2626` | `#B91C1C` | `#FCE9E9` |
| **Info / Parcial** (índigo) | `#4F46E5` | `#3730A3` | `#ECECFB` |

---

## 5. Estados de cuota (mapa específico de Cobralia)

El elemento que más se ve en la app es el **badge de estado de cuota**. Mapeo exacto (relleno suave + texto oscuro + ícono → accesible y legible de un vistazo):

| Estado | Etiqueta | Texto | Fondo | Ícono sugerido |
| --- | --- | --- | --- | --- |
| `PENDIENTE` | "Pendiente" | `#475569` | `#F1F4F8` | reloj |
| *Por vencer* (UI) | "Por vencer" | `#92590C` | `#FDF7EA` | reloj/alerta |
| `PAGADA` | "Pagada" | `#047857` | `#E6F6EF` | check |
| `VENCIDA` | "Vencida" | `#B91C1C` | `#FCE9E9` | alerta |
| `PARCIAL` | "Parcial" | `#3730A3` | `#ECECFB` | medio círculo |

> **Pendiente** es neutro a propósito: una cuota recién generada no debería "gritar". El rojo se reserva para lo realmente vencido.

---

## 6. Modo oscuro

Superficies oscuras con tinte ciruela (no negro plano).

| Token | Hex |
| --- | --- |
| Fondo | `#171116` |
| Superficie | `#211A20` |
| Superficie 2 (elevada) | `#2C242B` |
| Borde | `#3A323A` |
| Texto fuerte | `#F3EEF1` |
| Texto muted | `#B5AAB1` |
| Primario (acentos/links) | `#C56E98` |

Semánticos en oscuro (versiones más claras para contraste): verde `#34D399`, ámbar `#F0C04C`, rojo `#F87171`, índigo `#A5B4FC`.

---

## 7. Accesibilidad

- **Contraste:** texto de cuerpo y los `text` semánticos cumplen AA (≥ 4.5:1) sobre sus fondos. El ámbar `#E0A53E` **no** se usa como texto sobre blanco (poco contraste): para texto, usá `#92590C`.
- **Nunca dependas solo del color** para el estado: cada badge lleva **ícono + etiqueta de texto**. Clave para daltonismo (rojo/verde) y para escanear rápido.
- **Foco visible:** anillo de foco en ciruela (`#7A2E55`) con `outline-offset`, en todos los elementos interactivos.
- **Respetá `prefers-reduced-motion`** y `prefers-color-scheme`.

---

## 8. Implementación

### CSS custom properties

```css
:root {
  --color-bg: #FAF8F9;
  --color-surface: #FFFFFF;
  --color-border: #E6E0E3;
  --color-text: #241E23;
  --color-text-muted: #7C7178;

  --color-primary: #7A2E55;
  --color-primary-strong: #5C2240;
  --color-accent: #E0A53E;

  --color-success: #0E9F6E;
  --color-success-text: #047857;
  --color-warning: #E0A53E;
  --color-warning-text: #92590C;
  --color-danger: #DC2626;
  --color-danger-text: #B91C1C;
  --color-info: #4F46E5;
  --color-info-text: #3730A3;

  --ring: #7A2E55;
}

.dark {
  --color-bg: #171116;
  --color-surface: #211A20;
  --color-border: #3A323A;
  --color-text: #F3EEF1;
  --color-text-muted: #B5AAB1;
  --color-primary: #C56E98;
}
```

### Tailwind (`theme.extend.colors`)

```js
// tailwind.config.ts (extracto)
colors: {
  plum:  { 50:'#FBF1F6',100:'#F6E1EC',200:'#EBC2D7',300:'#DB9BBB',
           400:'#C56E98',500:'#A8487B',700:'#7A2E55',800:'#5C2240',900:'#3F1830' },
  amber: { 50:'#FDF7EA',100:'#FAE9C6',200:'#F4D58E',500:'#E0A53E',
           700:'#92590C',900:'#4A2D07' },
  ink:   { 50:'#FAF8F9',100:'#F3EFF1',200:'#E6E0E3',300:'#D2C9CE',
           400:'#A99EA5',500:'#7C7178',700:'#4A4248',900:'#241E23' },
}
```

> Si usás **shadcn/ui**, mapeá estos valores a sus variables (`--primary`, `--background`, `--foreground`, `--border`, `--ring`, etc.) y los componentes heredan el tema solos.

---

## 9. Uso (do / don't)

- ✅ Ciruela para lo accionable (botón primario, total destacado, nav activa).
- ✅ Ámbar para llamar la atención **sin alarmar** (por vencer, un realce puntual).
- ✅ Estados solo con los colores semánticos; siempre con ícono + texto.
- ❌ No uses el ámbar como color de texto sobre blanco.
- ❌ No metas verde/rojo/ámbar como decoración: en esta app ya **significan** algo.
- ❌ No satures: el fondo casi blanco y el espacio en blanco son parte del "calmo".
