# Guía visual — Academia Proveedores Smile

**Versión 1.1 · 15 de octubre de 2026** · Movimiento y componentes derivados de la maqueta (commit `0d70c11`); color según los specs oficiales.

Esta guía es la **fuente de verdad** del sistema visual y de movimiento. Todo lo que se construya encima (la PWA real, nuevas categorías, nuevas pantallas) se diseña y se revisa contra este documento.

| Archivo | Qué es |
|---|---|
| `GUIA_VISUAL.md` | Este documento: reglas, intención y catálogo |
| [`tokens.css`](tokens.css) | Variables CSS canónicas (`:root`, sin reset). El sistema lo importa |
| [`motion.js`](motion.js) | Curvas, duraciones y presets de GSAP como módulo ES |
| [`../referencia/maqueta-v0/`](../referencia/maqueta-v0/) | Copia congelada de la maqueta, para ver cada patrón funcionando |

---

## 1. Regla de precedencia

1. **Specs > guía > tokens > código > maqueta.** Los specs de `docs/specs/` (índice en [`docs/specs/README.md`](../specs/README.md)) son la fuente de verdad del producto; esta guía los traduce a decisiones visuales. Si la maqueta y esta guía no coinciden, gana la guía; si la guía contradice un spec, gana el spec y se corrige la guía.
2. **Nada literal.** Ningún componente usa un hex, `rgba`, radio, sombra, duración, curva o `z-index` escrito a mano si existe un token. Si hace falta un valor nuevo, se agrega primero aquí y en `tokens.css`, en el mismo cambio.
3. **Cambios versionados.** Todo cambio de token o patrón actualiza la tabla de la §13.
4. La maqueta de referencia (`docs/referencia/maqueta-v0/`) **no se edita**. Es la foto del punto de partida.

En `tokens.css`, `[nuevo]` marca valores que en la maqueta estaban repetidos en el CSS y se elevaron a token; `[propuesto]` marca correcciones que la maqueta todavía no aplica.

---

## 2. Principios

| Principio | Qué significa en pantalla |
|---|---|
| **Cálido y elegante** | Oliva + palo de rosa sobre crema. Serif variable con cursiva en la palabra clave. Grano orgánico. Nunca blanco puro ni negro puro. |
| **Para el campo** | Un usuario rural con celular de gama baja y poca señal. Botones de 59 px o más, una pregunta por pantalla, poco texto, íconos con etiqueta, todo funciona sin conexión. |
| **El movimiento explica** | Cada animación muestra causa y efecto: el progreso crece, la respuesta se llena desde el dedo, la pantalla se desliza en la dirección del flujo. Nada se mueve solo para decorar en la app. |
| **Expresivo en la landing, sobrio en la app** | La landing usa cursor, scroll horizontal, parallax y marquee. La app solo usa entradas, feedback táctil y celebraciones, sin Lenis ni ScrollTrigger. |
| **Degradar bien** | Sin librerías o con `prefers-reduced-motion`, todo está visible y usable. |

---

## 3. Color

> **Fuente:** paleta oficial del Manual de Marca Smile Bogotá citada en [SPEC-BASE §7.1] y [SPEC-SOT Doc. 2 §2.2]. Los cuatro colores `--brand-*` no se modifican; la escala se deriva de ellos. La v1.0 usaba los colores aproximados de la maqueta; la maqueta (`maqueta/` y `docs/referencia/maqueta-v0/`) **conserva** la paleta v1.0 y no es referencia de color.

### 3.1 Oficiales

| Token | Hex | Nombre en el spec | Regla del spec |
|---|---|---|---|
| `--brand-olive` | `#3D4A3E` | Verde Oliva (dominante) | Cabeceras, botones de acción principal, tarjetas de estado positivo, marcos de navegación |
| `--brand-rose` | `#E8C5B8` | Palo de Rosa (acento) | **Con moderación**: acción secundaria, notificaciones, insignias, gamificación |
| `--brand-cream` | `#F9F6F0` | Crema Neutro | Fondo principal. Sustituye al blanco puro para evitar deslumbramiento al sol |
| `--brand-charcoal` | `#2B2B2B` | Gris Carbón | **Exclusivo** para texto y cuerpo de lectura (≥ 4,5:1) |

### 3.2 Escala derivada

| Token | Hex | Rol |
|---|---|---|
| `--olive-900` | `#283028` | Superficie más oscura: toast, tabbar, fondo de "Cómo funciona" |
| `--olive-800` | `#3D4A3E` | **Primario** = `--brand-olive`. `theme-color` |
| `--olive-700` | `#4E594E` | Degradado del marco de dispositivo |
| `--olive-600` | `#5F695E` | Eyebrows, íconos de ayuda, foco de campos, barra de guía |
| `--olive-400` | `#9BA097` | Degradado de progreso, barra "en desarrollo". **No es color de texto** |
| `--olive-300` | `#B9BCB3` | Texto secundario sobre oscuro, borde de checkbox |
| `--olive-100` | `#DDDCD5` | Pistas de progreso, fondo de ícono "Sí", líneas de pasos |
| `--olive-50` | `#E8E7E0` | Chip prioridad media, nivel en desarrollo |
| `--olive-25` | `#F0EDE7` | Fondo de check marcado |
| `--rose-700` | `#7C5E56` | Texto rosa: chips, insignias, nivel Inicial, cursivas pequeñas |
| `--rose-600` | `#AB8B81` | Íconos rosa y cursivas de display ≥ 2 rem |
| `--rose-500` | `#E8C5B8` | **Acento** = `--brand-rose`. Punto de "smile.", tab activo, CTA secundario sobre oscuro |
| `--rose-300` | `#EFD9CE` | Texto rosa sobre oscuro, borde de alerta |
| `--rose-100` | `#F3E3DB` | Blush: contenedores de ícono, tips, alertas |
| `--cream` | `#F9F6F0` | Fondo general = `--brand-cream` |
| `--cream-200` | `#F1ECE3` | Fondo neutro secundario: chips, ícono "No", nodos bloqueados |
| `--white` | `#FFFDF9` | Superficie de tarjeta e input. Nunca `#FFFFFF` |

### 3.3 Semánticos

| Token | Valor | Uso |
|---|---|---|
| `--ink` | `--brand-charcoal` | Texto principal |
| `--ink-soft` | `rgba(43,43,43,.72)` | Texto secundario, ayudas, fuentes |
| `--ink-faint` | `rgba(43,43,43,.42)` | Decorativo o inactivo; nunca texto que haya que leer |
| `--line` | `rgba(43,43,43,.14)` | Bordes y divisores sobre claro |
| `--line-light` | `rgba(249,246,240,.18)` | Divisores sobre oscuro |
| `--line-olive` | `rgba(61,74,62,.2)` | Divisores sobre `--rose-100` |
| `--surface-page / card / muted / strong / ink` | crema / blanco cálido / crema-200 / oliva-800 / oliva-900 | Superficies |
| `--on-strong`, `--on-strong-soft` | crema, oliva-300 | Texto sobre superficie oscura |
| `--on-strong-tint-bg / -line` | crema al 12 % / 20 % | Chips y botones translúcidos sobre oscuro |
| `--accent`, `--on-accent` | rosa-500, oliva-900 | Acento y su texto |
| `--focus` | oliva-800 | Anillo de foco (v1.1: el rosa no contrasta sobre crema) |

**Combinaciones permitidas:** texto `--ink` sobre crema, blanco, rosa-100 o rosa-500; texto crema, oliva-300 o rosa-300/500 sobre oliva-800/900. **Prohibido:** texto rosa-500 o rosa-600 sobre fondos claros, texto oliva-400 y cualquier texto en `--ink-faint`.

**Moderación del rosa:** el rosa ocupa como máximo una superficie destacada por pantalla (un CTA, una insignia o el tab activo); el resto de acentos son de línea o de punto.

### 3.4 Estados de dominio

**Nivel de madurez por eje** (ver `docs/sistema/requerimientos.md`, RF-ASM):

| Nivel | Fondo | Texto | Barra |
|---|---|---|---|
| Inicial | `--rose-100` | `--rose-700` | `--rose-500` |
| En desarrollo | `--olive-50` | `--olive-600` | `--olive-400` |
| Avanzado | `--olive-800` | `--cream` | `--olive-800` |

**Prioridad de guía/meta:** Urgente `--rose-700`/blanco · Alta `--rose-100`/`--rose-700` · Media `--olive-50`/`--olive-600` · Mantener `--cream-200`/`--ink-soft` · Completa `--olive-800`/crema. Tokens `--prio-*` y `--lvl-*`.

**Respuestas:** Sí → ícono sobre `--olive-100` en `--olive-800`; A veces → `--rose-100` en `--rose-700`; No → `--cream-200` en `--ink`. Seleccionada → relleno `--olive-800`, texto crema.

**Etapas del funnel (CRM):** 1–2 neutras (`--cream-200`), 3–4 `--olive-50`, 5 `--rose-100`, 6 `--olive-800`. Siempre con número y nombre de etapa; el color nunca es la única señal.

### 3.5 Contraste (WCAG 2.1, medido sobre v1.1)

| Par | Ratio | AA texto normal (4,5) |
|---|---|---|
| ink / cream | 13,13 | ✅ |
| ink / rose-100 | 11,34 | ✅ |
| ink / rose-500 | 8,84 | ✅ |
| ink-soft / cream | 5,48 | ✅ |
| cream / olive-800 | 8,66 | ✅ |
| cream / olive-900 | 12,61 | ✅ |
| olive-300 / olive-800 | 4,85 | ✅ |
| rose-300 / olive-800 | 6,89 | ✅ |
| rose-500 / olive-800 | 5,83 | ✅ |
| olive-900 / rose-500 | 8,49 | ✅ |
| olive-600 / cream | 5,31 | ✅ |
| olive-600 / olive-50 | 4,62 | ✅ |
| rose-700 / cream | 5,42 | ✅ |
| rose-700 / rose-100 | 4,68 | ✅ |
| white / rose-700 (chip urgente) | 5,75 | ✅ |
| olive-800 / olive-100 | 6,80 | ✅ |
| olive-400 / olive-800 | 3,50 | ⚠️ no usar como texto |
| rose-600 / cream | 2,89 | ❌ solo display ≥ 2 rem e íconos |
| rose-500 / cream | 1,49 | ❌ nunca texto ni foco |

Todo par nuevo se mide antes de usarse y se agrega a esta tabla.

## 4. Tipografía

| Familia | Token | Carga | Rol |
|---|---|---|---|
| **Fraunces** (serif variable) | `--font-display` | `ital, opsz 9–144, wght 300–600, SOFT 0–100, WONK 0–1` | Titulares, números grandes, marca, nombres de tarjeta |
| **Manrope** | `--font-body` | `wght 400–800` | Texto, botones, formularios, eyebrows, chips |

> La landing carga Manrope hasta 700 y la app hasta 800. El sistema carga **400–800** en ambos.

**Firma tipográfica:**
- Titulares con tracking negativo (`-0.02em` a `-0.055em` según tamaño) y peso ligero (330–420).
- La palabra clave va en `<em>`: cursiva, color `--rose-600` (o `--rose-300` sobre oscuro), `font-variation-settings: var(--fv-accent)`.
- Números en `font-variant-numeric: tabular-nums` siempre que cambien (contadores, puntajes, progreso, reloj).
- Eyebrows: Manrope, mayúsculas, `letter-spacing: 0.14em`, `--olive-600`, peso 600 en la landing y 800 en la app.

### 4.1 Escala fluida (landing)

| Token | Valor | Peso | LH | Tracking | Uso |
|---|---|---|---|---|---|
| `--fs-display` | `clamp(3.6rem, 13.5vw, 14rem)` | 330 | 0.86 | -0.055em | Hero (con tope `17svh`) |
| `--fs-h1` | `clamp(2.6rem, 6.4vw, 6.2rem)` | 330 | 0.98 | -0.04em | CTA final |
| `--fs-h2` | `clamp(2.1rem, 4.6vw, 4.4rem)` | 350 | 1 | -0.035em | Títulos de sección |
| `--fs-h3` | `clamp(1.5rem, 2.4vw, 2.2rem)` | 400 | 1.05 | -0.025em | Hitos, ticker |
| `--fs-h4` | `clamp(1.15rem, 1.5vw, 1.4rem)` | — | — | — | Reserva |
| `--fs-lead` | `clamp(1.15rem, 1.6vw, 1.45rem)` | 400 | 1.4 | 0 | Entradillas |
| `--fs-body` | `1rem` | 400 | 1.55 | 0 | Texto |
| `--fs-small` | `0.875rem` | 600 | — | — | Botones, listas |
| `--fs-micro` | `0.75rem` | 600–700 | — | 0.14em | Eyebrows, etiquetas |

Tamaños de efecto: footer "smile." `clamp(6rem, 31vw, 34rem)`; marquee `clamp(2.8rem, 7.5vw, 7.2rem)`; categorías `clamp(2.6rem, 8vw, 7.4rem)`; manifiesto `clamp(2rem, 4.9vw, 4.9rem)`.

### 4.2 Escala fija (app móvil)

| Token | Valor | Familia / peso | Uso |
|---|---|---|---|
| `--fs-app-score` | 4.2rem | Fraunces 330, LH 0.9, -0.05em | Número del anillo |
| `--fs-app-stat` | 2.2rem | Fraunces 350, -0.04em | Resultado de calculadora, título de guía |
| `--fs-app-title` | 2.15rem | Fraunces 380, LH 1.02, -0.035em, `--fv-app` | `.a-title` |
| `--fs-app-question` | 1.85rem | Fraunces 380, LH 1.08, -0.03em | Texto de la pregunta |
| `--fs-app-h3` | 1.35rem | Fraunces 420, LH 1.1, -0.02em | Subtítulos, nombres de tile |
| `--fs-app-answer` | 1.2rem | Manrope 800 | Botón de respuesta |
| `--fs-app-button` | 1.05rem | Manrope 800 | `.btn`, inputs |
| `--fs-app-body` | 1rem | Manrope 400–500, LH 1.5 | Texto |
| `--fs-app-small` | 0.88rem | Manrope 400–700 | Ayuda, alertas, tips |
| `--fs-app-caption` | 0.78rem | Manrope 500–700 | Descripciones, notas |
| `--fs-app-eyebrow` | 0.7rem | Manrope 800, 0.14em, mayúsculas | `.a-eyebrow` |
| `--fs-app-chip` | 0.66rem | Manrope 800, 0.06em, mayúsculas | Chips, tabs |

**Mínimo absoluto en la app: 0.66 rem (≈10,5 px) solo para chips y tabs en mayúsculas.** Texto que se lee de corrido nunca baja de `--fs-app-caption`.

### 4.3 Ejes variables de Fraunces

| Token | Valor | Dónde |
|---|---|---|
| `--fv-display` | `"SOFT" 50, "opsz" 144` | Hero |
| `--fv-heading` | `"SOFT" 60, "opsz" 144` | h2, manifiesto, footer |
| `--fv-app` | `"SOFT" 80, "opsz" 72` | Títulos y preguntas de la app |
| `--fv-accent` | `"SOFT" 100, "WONK" 1` | Cursivas y marca "smile." |

---

## 5. Espaciado, layout y forma

### 5.1 Espaciado

| Token | Valor | Uso |
|---|---|---|
| `--gutter` | `clamp(1.1rem, 3.2vw, 3rem)` | Margen lateral de la landing y gap de grillas |
| `--section-y` | `clamp(5rem, 12vw, 11rem)` | Padding vertical de sección |
| `--screen-x` | 1.4rem | Padding lateral de pantalla en la app |
| `--space-1 … --space-7` | 0.3 · 0.6 · 0.9 · 1.1 · 1.4 · 1.8 · 2.4 rem | Gaps internos. Utilidades de la maqueta: `.gap-s` 0.6, `.gap-m` 1.1, `.gap-l` 1.8 |
| `--tabbar-clearance` | 6.4rem | Padding inferior de pantallas con tabbar |

Grilla de landing: 12 columnas (`.section-head`: título en 1–7, entradilla en 9–12). Ejes: 3 → 2 (≤ 1024) → 1 columna (≤ 620).

### 5.2 Breakpoints

| Nombre | Ancho | Qué cambia |
|---|---|---|
| `phone` | ≤ 520 px | La app ocupa la pantalla completa, sin marco de teléfono; se oculta reloj de la barra de estado |
| `sm` | ≤ 620 px | Ejes en 1 columna, categorías compactas, footer en 2 columnas |
| `md` | ≤ 860 px | "Cómo funciona" pasa a vertical, Beneficios en 1 columna, `.section-head` apilado |
| `lg` | ≤ 1024 px | Ejes en 2 columnas |

La maqueta además usa 560 (nav), 760 (hero/menú) y 900 (panel lateral de la demo). **Para código nuevo usar solo los cuatro de la tabla**; 560 → `sm`, 760 → `md`, 900 → `md`.

Media queries de capacidad: `(hover: none), (pointer: coarse)` desactiva cursor y vista previa; `(max-height: 820px)` compacta el panel de la demo.

### 5.3 Radios

| Token | Valor | Uso |
|---|---|---|
| `--radius-check` | 9px | Casilla de checklist |
| `--radius-s` | 10px | Reserva |
| `--radius-control` | 16px | Inputs, caja de ayuda (14px en input de calculadora → usar este) |
| `--radius-m` | 18px | Checks, salida de calculadora, CTA del menú |
| `--radius-button` | 20px | `.btn`, alertas, filas de eje, recompensas |
| `--radius-card` | 24px | Tiles, respuestas, tarjetas de guía, calculadora |
| `--radius-dock` | 26px | Tabbar, ficha |
| `--radius-l` | 28px | Tarjetas de eje y vista previa (landing) |
| `--radius-sheet` | 36px | Cabeceras con borde inferior curvo (`0 0 36px 36px`); la bienvenida usa 40px |
| `--radius-xl` | 44px | Secciones redondeadas (manifiesto, beneficios) |
| `--radius-device` | 58px | Marco del teléfono (pantalla interior 47px) |
| `--radius-pill` | 999px | Chips, insignias, botones píldora, toast |
| `--leaf-shape` | `0 100% 0 100%` | Forma de hoja: confeti, marquee, adorno de ficha |

**Regla:** elementos táctiles grandes → 20–24px; contenedores → 24–28px; nunca esquinas rectas salvo pantalla completa en móvil.

### 5.4 Elevación y capas

La estética es plana: la profundidad se logra con color de superficie y bordes `--line`, no con sombras. Las sombras se reservan para objetos que flotan:

| Token | Uso |
|---|---|
| `--shadow-float` | Vista previa que sigue al cursor |
| `--shadow-dock` | Tabbar |
| `--shadow-mock` | Mini pantallas de la landing |
| `--shadow-device` | Marco del teléfono |
| `--halo-rose` | Nodo desbloqueado, paso actual (`0 0 0 5–6px` rosa translúcido) |
| `--ring-field-focus` | Foco de input |

`z-index`: contenido 2 · barra de estado 5 · tabbar 10 · toast 20 · confeti 30 · vista previa 40 · menú 55 · nav 60 · cursor 90 · preloader 100 (tokens `--z-*`).

### 5.5 Marco de dispositivo (demo)

390 × 844 px (alto limitado a `100svh` menos padding), padding 11px, radio 58/47px, fondo `--grad-device`, sombra `--shadow-device`. Escenario con `--grad-stage` y grano al 18 %. En ≤ 520 px desaparece el marco.

---

## 6. Marca y textura

- **Logotipo tipográfico "smile."**: Fraunces 500, `letter-spacing: -0.03em`, `--fv-accent`; el punto siempre en `--rose-500` (`.brand .dot`). En la nav va acompañado de "Academia Proveedores" en micro, mayúsculas, separado por un filete.
- **Flor de 4 pétalos**: símbolo de carga y de marca. SVG `viewBox="-100 -100 200 200"`, pétalo `M0 -8 C 22 -30, 24 -64, 0 -88 C -24 -64, -22 -30, 0 -8 Z` rotado 0/90/180/270, semilla `r=6`. Relleno `--rose-500`, trazo `--rose-300` (sobre oscuro) u `--olive-800` (sobre claro).
- **Hoja**: forma `--leaf-shape`; aparece en confeti, marquee, barra de progreso y adornos.
- **Grano**: `--grain` (SVG `feTurbulence`, 220 px) aplicado con `.grain::after` en `mix-blend-mode: multiply`. Opacidad 0,22 por defecto, 0,18 en fondos grandes, 0,20–0,25 en ilustraciones y cabeceras oscuras. Siempre `pointer-events: none`.
- **Ilustración**: paisajes planos con capas (sol, cerros lejanos, medios, planta), colores de la paleta, sin contornos negros. El sol gira 40 s en loop.
- **`theme-color`**: `#3D4A3E` (`--brand-olive`).
- **Selección de texto**: fondo `--rose-500`, texto `--olive-900`.

---

## 7. Iconografía

Set propio de línea en `maqueta/js/icons.js` (sin dependencias).

| Propiedad | Valor |
|---|---|
| Grilla | 24 × 24 |
| Trazo | `stroke-width: 1.6`, `currentColor`, `round` caps y joins, sin relleno |
| Tamaño base | `.ico` = 1.5em; en la app se fija por contexto (0.8–2.3 rem) |
| Uso | `window.icon("nombre")` o `<span data-icon="nombre"></span>` |
| Accesibilidad | `aria-hidden="true"` siempre; el texto lo da la etiqueta vecina |

**Catálogo (38):**
- Ejes: `bpa` `residuos` `carbono` `infantil` `ddhh`
- Categorías: `fruver` `lacteos` `carnes` `pescados` `mariscos`
- Respuestas: `si` `aveces` `no`
- Navegación y acciones: `arrow` `back` `check` `lock` `download` `print` `plus` `home` `route` `doc` `book` `chart`
- Estado: `wifiOff` `cloudOk` `signal` `clock` `alert` `sparkle` `star`
- Beneficios: `truck` `seal` `globe` `cart` `chat` `phone`

Íconos ilustrativos grandes (cabecera de guía, vista previa) bajan el trazo a 1–1,1 para no verse pesados. Un ícono nuevo se dibuja en la misma grilla y trazo y se agrega a esta lista.

Contenedor de ícono típico: círculo `--rose-100` con ícono `--olive-800`; versión destacada: círculo `--rose-500` con ícono `--olive-900`.

---

## 8. Componentes

Cada componente lista anatomía, tokens y estados. Clases entre paréntesis = referencia en la maqueta.

### 8.1 Botones

| Variante | Anatomía y tokens | Estados |
|---|---|---|
| **Primario app** (`.btn`) | Ancho completo, alto mín. 3.7rem (59px), padding 0 1.4rem, `--radius-button`, `--olive-800`/crema, Manrope 800 1.05rem, ícono 1.3rem a la derecha | hover: ícono `translateX(4px)` · active: `scale: var(--press-scale)` · disabled: opacidad 0.45 · tap: ripple |
| Rosa (`.btn--rose`) | `--rose-500`/`--olive-900` | Igual |
| Ghost (`.btn--ghost`) | Transparente, borde 1.5px `--line` | Igual |
| Claro (`.btn--light`) | Crema/`--olive-900`, sobre oscuro | Igual |
| **Ícono** (`.icon-btn`) | Círculo 2.9rem, `--white`, borde `--line`, ícono 1.25rem. Sobre oscuro: `--on-strong-tint-bg` | active: `scale: .92` |
| **Píldora** (`.btn-pill`, landing) | Píldora `--olive-800`, texto 1rem 600, círculo interior 2.8rem `--rose-500` con flecha | hover: fondo `--olive-900`, círculo `rotate(-45deg) scale(1.06)` · magnético con puntero fino |
| **Letras animadas** (`.btn-chars`) | Píldora 2.9rem, `--fs-small` 600 | hover: cada letra sube 1.3em con `--stagger-chars` y fondo pasa a `--rose-500` |

**Ripple** (`.btn`, `.tile`, `.g-card`): círculo de `currentColor` al 18 %, tamaño = lado mayor × 2.2, nace en el punto de contacto y se expande a `scale(1)` mientras se desvanece en 0.8s.

### 8.2 Campos

- **Input** (`.field`): etiqueta 0.86rem 700 arriba; input 3.5rem de alto, `--radius-control`, borde 1.5px `--line`, fondo `--white`, texto 1.05rem. Foco: borde `--olive-600` + `--ring-field-focus`.
- **Numérico** (calculadora): 3rem, alineado a la derecha, fondo crema.
- Campos opcionales se marcan en la etiqueta; nunca bloquean avanzar.
- **Lista** (`SelectField`): misma anatomía que el Input con `<select>` nativo (teclado y lector de pantalla del sistema) y chevron `--ink-soft` a la derecha. Para DIVIPOLA en cascada: el municipio se habilita al elegir el departamento.
- **Opción única** (`Choice`): misma fila que la casilla de autorización con `<input type="radio">`; marcada igual. Para 2 a 4 opciones cortas (tipo de persona, canal de contacto) en vez de una lista.
- **Casilla de autorización** (`Checkbox`, consentimiento y declaración): fila alto mín. 3.7rem, `--radius-m`, borde 1.5px `--line`, fondo `--white`, texto 1rem 700. Casilla igual a la del Checklist (§8.6), sin tachado. Marcada: casilla `--olive-800` con palomita crema, fila `--olive-25` y borde `--olive-600`. Usa `<input type="checkbox">` nativo con su `<label>`; el foco se ve en la fila.

### 8.3 Tiles de categoría (`.tile`)

Grilla 2 columnas, gap 0.75rem. Tile: alto mín. 9.4rem, `--radius-card`, `--white`, borde 1.5px. Ícono en círculo 3.4rem `--rose-100`. Nombre Fraunces 1.35rem.
- **Piloto** (`.is-pilot`): ocupa 2 columnas, `--olive-800`, ícono 4.2rem en `--rose-500`, nombre 2rem, insignia "Piloto" rosa, botón circular "ir" crema.
- **Bloqueado** (`.is-locked`): opacidad 0.6, insignia con candado. Al tocar: sacudida horizontal elástica + toast "llegará pronto".

### 8.4 Autoevaluación

- **Barra de progreso con hoja** (`.leafbar`): pista 12px `--olive-100`, relleno `--grad-progress`, hoja SVG 26px que viaja con el borde del relleno.
- **Contador** "x de N": 0.85rem 700, tabular.
- **Chip de eje** (`.q-chip`): píldora `--rose-100`, ícono en círculo blanco.
- **Pregunta**: `--fs-app-question`.
- **Ayuda** (`.q-help`): `--radius-control`, fondo blanco, **borde 1px discontinuo** `--olive-300`, ícono `--olive-600`.
- **Respuesta** (`.answer`): alto mín. 4.6rem (74px), `--radius-card`, borde 1.5px, texto 1.2rem 800, ícono en círculo 3.1rem coloreado según §3.4. Seleccionada: el relleno `--olive-800` crece como círculo desde el punto tocado (`clip-path`), aparece un check a la derecha. Avanza sola a los 560 ms (150 ms sin animación).

### 8.5 Diagnóstico

- **Anillo** (`.ring`): 13.2rem, radio 84 en `viewBox` 200, trazo 14, pista `--olive-100`, trazo con degradado `--rose-500 → --olive-600`, extremos redondeados, marcas de escala en crema. Número central `--fs-app-score`, "de 100" debajo.
- **Insignia de nivel** (`.level-badge`): píldora con punto de `currentColor`, mayúsculas 0.8rem 800, colores `--lvl-*`.
- **Escala de niveles**: 3 segmentos con borde superior 4px; el activo en `--olive-800`.
- **Alerta crítica** (`.alert`): `--radius-button`, `--rose-100`, borde `--rose-300`, ícono `alert` en `--rose-600`, título en negrita.
- **Fila de eje** (`.axis-row`): ícono 2.8rem · nombre + barra 7px · porcentaje en Fraunces 1.45rem + nivel.

### 8.6 Guías

- **Tarjeta** (`.g-card`): `--radius-card`, chips de prioridad y minutos arriba, título Fraunces 1.3rem, ícono 3.2rem a la derecha, barra de progreso 6px. La primera (`.is-top`) va invertida en `--olive-800` con acentos rosa.
- **Chip** (`.chip`): píldora 0.66rem 800 mayúsculas, colores `--prio-*`.
- **Cabecera de guía** (`.g-hero`): `--olive-800`, radio inferior `--radius-sheet`, grano al 25 %, ícono gigante 9rem en `--olive-600` con trazo 1 asomando por la derecha.
- **Pasos** (`.step`): número en círculo 2.4rem `--rose-100`, Fraunces cursiva; línea vertical 1.5px `--olive-100` que une los pasos.
- **Checklist** (`.check`, `role="checkbox"`): fila `--radius-m`, borde 1.5px; casilla 1.8rem `--radius-check` borde `--olive-300`. Marcado: casilla `--olive-800`, la palomita se dibuja (`stroke-dashoffset` 24→0 en 0.4s), fila `--olive-25`, texto tachado en `--ink-soft`.
- **Calculadora**: tarjeta con filas etiqueta / input de 6.4rem y resultado en bloque `--olive-800` con número Fraunces 2.2rem.
- **Tip** (`.tip`): `--rose-100`, ícono `--rose-600`. **Fuente** (`.source`): 0.74rem `--ink-soft`.

### 8.7 Hoja de ruta

Resumen superior en `--olive-800` con número grande. Línea vertical 2px `--olive-100` con relleno `--olive-800` hasta el último desbloqueado. Nodo 2.8rem: bloqueado `--cream-200`; desbloqueado `--rose-500` con `--halo-rose` y borde de tarjeta `--rose-300`.

### 8.8 Ficha imprimible

Tarjeta `--radius-dock`. Cabecera `--olive-800` con marca, nombre de la finca en Fraunces 1.6rem y hoja decorativa `--olive-600` al 60 % en la esquina. Cuerpo: puntaje 3rem, tabla por eje con punto de color de nivel, acciones numeradas en círculos `--rose-100`. Pie crema. **Impresión:** A4, margen 14 mm, ancho máx. 170 mm, 11 pt, `print-color-adjust: exact`.

### 8.9 Tabbar

Flotante: `left/right 0.8rem`, abajo `0.8rem + safe-area`. Fondo `--olive-900` al 94 % con `--blur-dock`, `--radius-dock`, `--shadow-dock`. 4 tabs (Diagnóstico, Guías, Ruta, Ficha): ícono 1.35rem + etiqueta 0.66rem 700 en `--olive-300`. Activo: texto `--olive-900` sobre **píldora `--rose-500` que se desliza** (`--radius-button`). Aparece subiendo desde abajo (0.7s) al terminar la autoevaluación.

### 8.10 Barra de estado e indicador de guardado

Alto 52px (46px + safe-area en móvil). Indicador "Guardado": píldora `--olive-100`/`--olive-800`, 0.7rem 700, con ícono `cloudOk`; late con un pop elástico en cada guardado. Sin conexión: `--rose-100`/`--rose-600` + `wifiOff`, texto "Sin conexión · guardado".

### 8.11 Toast y confeti

- **Toast**: píldora `--olive-900`, texto crema 0.85rem 700, ícono `--rose-500`, centrado a 6.6rem del borde inferior (encima de la tabbar). Entra subiendo, se queda 2.3s, sale.
- **Confeti**: hojas 12px (`--leaf-shape`) en los 5 colores `--confetti-*`. 40 por defecto, 50 al completar una guía, 60 al llegar a nivel Avanzado. Nunca con movimiento reducido.

### 8.12 Landing

| Componente | Notas |
|---|---|
| **Nav** | Fija, `--z-nav`, texto según `--nav-fg`. Se oculta al bajar (> 240px) y vuelve al subir. Cambia a crema sobre secciones oscuras (`.is-dark`). |
| **Menú** | Pantalla completa `--olive-800`, links Fraunces `clamp(2.2rem, 6vw, 5.2rem)` numerados en `--rose-300`; hover desplaza 1rem, cursiva y rosa. Cierra con Escape. |
| **Tarjeta de eje** | `--radius-l`, blanca; en hover una capa `--olive-800` sube con borde superior curvo que se aplana, el ícono gira -12° y pasa a rosa. Variante CTA en `--rose-500` con capa `--olive-900`. |
| **Fila de categoría** | Nombre gigante; inactivas en `--ink-faint`. Hover: fondo `--rose-100` crece desde abajo, el nombre se desplaza y pasa a cursiva. |
| **Mini pantallas** (`.mock`) | 290 × 400, radio 34px, borde interior 6px `--olive-800`, `--shadow-mock`. |
| **Hito** | Nodo 44px; activo en `--olive-800` con `scale(1.12)`. |
| **Cifra** | Fraunces 300 `clamp(3.4rem, 7vw, 6.4rem)`, unidad al 40 % en `--rose-600`. |
| **Marquee** | Fraunces 330; la segunda pista en contorno `--olive-600` con cursivas rosa rellenas; separador hoja. |
| **Link de footer** | Subrayado que crece desde la izquierda y se retira hacia la derecha. |

---

## 9. Movimiento

El movimiento es la segunda mitad de la identidad. La referencia de ritmo es [leome-and-partners.com](https://leome-and-partners.com/): entradas largas que frenan suave, salidas cortas, máscaras, nada que rebote salvo el feedback táctil.

**Stack:** GSAP 3.13 (core, ScrollTrigger, SplitText, DrawSVGPlugin) + Lenis 1.2.3 solo en la landing. Constantes en [`motion.js`](motion.js).

### 9.1 Las cinco leyes

1. **Entra lento, sale rápido.** Entradas con `expo.out` y 0.6–1.6s; salidas con `power2.in` y 0.28–0.45s. Una salida nunca dura más que la entrada que la sigue.
2. **Revelar desde una máscara, no aparecer.** El texto sube desde detrás de una línea (`overflow: clip` + `yPercent: 110`). Las superficies se abren con `clip-path`.
3. **Escalonar siempre** grupos de 2 o más elementos (0.025–0.14s).
4. **Elástico solo como respuesta al dedo.** `elastic.out(1, 0.4)` y `back.out` se reservan para check, hoja de progreso, indicador de guardado, ícono de respuesta, nodos e insignias.
5. **Lo ligado al scroll es lineal** (`ease: "none"` + `scrub`).

### 9.2 Curvas

| Intención | GSAP | CSS (`tokens.css`) |
|---|---|---|
| Entrar (por defecto) | `expo.out` | `--ease-expo-out` |
| Mover / cortina | `expo.inOut` | `--ease-expo-in-out` |
| Transición de UI (hover, estados) | — | `--ease-out` |
| Loop de línea | — | `--ease-in-out` |
| Salir | `power2.in` (`power3.in` en preloader) | `--ease-in` |
| Seguir al puntero | `power3` | — |
| Aparecer con impulso | `back.out(2–3)` | `--ease-back` |
| Feedback táctil | `elastic.out(1, 0.4)` (`1, 0.45` guardado; `1.2, 0.3` sacudida) | — |
| Scroll | `none` | — |
| Contador | `power3.out` (landing) / `expo.out` (app) | — |
| Loop orgánico | `sine.inOut` | — |
| Caída | `power1.in` | — |
| Punto de "smile." | `bounce.out` (único uso) | — |

`gsap.defaults({ ease: "expo.out", duration: 1.1 })` en todo el sistema.

### 9.3 Duraciones

| Token | s | Uso |
|---|---|---|
| `xs` | 0.18 | Punto del cursor |
| press | 0.25 | `scale` al presionar (CSS) |
| `exit` / s | 0.28–0.32 | Salida de pantalla y de pregunta |
| `s` | 0.45 | Salida de burbuja / vista previa |
| `m` | 0.6 | Feedback, toast, check, hover de transform |
| `enter` | 0.75 | Entrada de pantalla en la app |
| `l` | 0.8–0.9 | Listas, progreso, ripple |
| `base` | 1.1 | Default |
| `xl` | 1.2 | Revelado por scroll |
| `headline` | 1.3–1.5 | Titulares, palabras del hero |
| `2xl` | 1.6 | Barras por eje, línea de ruta, imagen del hero |
| `count` | 2–2.2 | Anillo y contadores |
| `loop` | 38 | Marquee (sol: 40) |

CSS: color y borde 0.3–0.4s; transform de hover 0.5–0.75s con `--ease-out`.

### 9.4 Catálogo — app

| Patrón | Valores exactos |
|---|---|
| **Cambio de pantalla** | Sale: `xPercent: -12·dir, opacity 0, 0.32s power2.in`. Entra (con 0.2s de retraso): `xPercent: 14·dir → 0, opacity 0 → 1, 0.75s expo.out`. Elementos `[data-a]`: `y 30, opacity 0, 0.9s, stagger 0.05`. `dir = 1` hacia adelante, `-1` hacia atrás. |
| **Entrada del teléfono** | `y 60, rotation 2, opacity 0, 1.4s expo.out`; panel lateral `y 40`, stagger 0.08. |
| **Bienvenida** | Sol `y 60, scale .7, 1.6s`; cerros `y 50/40, 1.4s`; tallo DrawSVG `1s power2.inOut`; hojas `scale 0 → 1, back.out(2.2), stagger .15`; luego vaivén `rotation 4, 2.4s sine.inOut yoyo` infinito. Rayos de sol: CSS `spin 40s linear`. |
| **Pregunta entra** | Chip `x 40, 0.7s`; palabras `yPercent 110, 0.8s, stagger 0.025` (SplitText); ayuda `y 16, 0.7s @0.25`; respuestas `y 40, 0.8s, stagger 0.07 @0.2`. |
| **Pregunta sale** | Hijos `x -50·dir, opacity 0, 0.28s, stagger 0.03, power2.in`. |
| **Responder** | Relleno `clip-path: circle(0% → 150% at punto)`, 0.65s power3.out; check `scale 0, rotation -40 → 0`, 0.6s back.out(3); ícono `scale .8 → 1` elástico. |
| **Progreso** | Relleno y hoja `0.9s expo.out`; hoja `rotation -25 → 0`, 1s `elastic.out(1, 0.4)`. |
| **Analizando** | Pétalos `scale 0` desde la base, 0.7s back.out(2) stagger 0.08; la flor gira 360° en 2.6s power2.inOut; 5 líneas (una por eje) entran 0.35s y salen 0.3s cada 0.45s; pétalos salen `y -30`. Total ≈ 2.6s. |
| **Diagnóstico** | Anillo `stroke-dashoffset` de C a C·(1 − puntaje/100), 2.2s expo.out (+0.2s); número cuenta en paralelo; barras `scaleX 0`, 1.6s stagger 0.08 (+0.6s); insignia `scale .3`, 0.9s back.out(2.4) (+1.1s); confeti 60 si es Avanzado (+1.2s). |
| **Guía abre** | Ícono gigante `rotation -30, scale .6`, 1.4s; título por palabras 0.9s stagger 0.04. |
| **Check** | Casilla `scale .7 → 1` elástica 0.6s + palomita dibujada 0.4s (CSS). Guía completa → confeti 50 + toast; incentivo nuevo → segundo toast a los 2.9s. |
| **Calculadora** | Resultado cuenta 0.8s expo.out. |
| **Ruta** | Relleno de línea `height 0`, 1.6s expo.inOut; nodos desbloqueados `scale 0, rotation -90`, 0.9s back.out(2.2) stagger 0.18. |
| **Tabbar** | Entra `translateY(160%) → 0`, 0.7s `--ease-out`; píldora se desliza 0.6s. |
| **Toast** | `y 30, scale .9 → 1`, 0.6s; espera 2.3s; sale `y 20`, 0.4s power2.in. |
| **Guardado** | `scale .86 → 1`, 0.6s `elastic.out(1, 0.45)`. |
| **Bloqueado** | `x -6 → 0`, 0.6s `elastic.out(1.2, 0.3)`. |
| **Confeti** | Por pieza: x aleatorio 4–96 %, escala 0.6–1.4, cae a alto+40 con deriva ±70px, giro +240–720°, 1.8–3.2s power1.in, retraso 0–0.5s. |

### 9.5 Catálogo — landing

| Patrón | Valores exactos |
|---|---|
| **Preloader** (≈ 4s; 2.6× más rápido si ya se vio en la sesión) | 0: contador 0→100 en 2.1s power2.inOut · 0.1: pétalos se dibujan (DrawSVG 0→100 %, 1.3s, stagger 0.14) · 1.05: relleno a 0.95 · 1.25: "smile." sube · 1.4: semilla `back.out(3)` · 2.15: flor gira 45° expo.inOut · 2.35: pétalos suben 60px y se van (expo.in) · 2.85: cortina `clip-path inset(0 0 100% 0 round 0 0 80px 80px)`, 1.15s expo.inOut · 3.45: palabras del hero `yPercent 112 → 0`, 1.5s stagger 0.11 · 3.5: ventana de imagen se abre de ancho 0, 1.6s expo.inOut · 3.6: imagen `scale 1.5 → 1`, 2s · 3.9: `[data-reveal]` y nav entran. |
| **Ticker del hero** | Cada 1.3s sube una categoría, 0.85s expo.inOut, loop infinito. |
| **Hero al hacer scroll** | Filas 1 y 3 se separan `xPercent ∓7`; imagen `yPercent 14`; sol `y 40`; pie se desvanece. `scrub: true`. |
| **Titular por línea** (`[data-split]`) | SplitText `mask: "lines"`, `yPercent 110, rotate 2.5`, 1.3s stagger 0.1, inicio `top 86%`, una vez. |
| **Revelado genérico** (`[data-reveal]`) | `y 30, opacity 0`, 1.2s stagger 0.08, `top 90%`, por lotes. |
| **Manifiesto** | Palabras de opacidad 0.16 → 1 con `scrub 0.6` (`top 78%` → `bottom 42%`); fondo parallax `yPercent 18, rotate 6`; hojas DrawSVG con scrub; brote se dibuja 1.6s. |
| **Tarjetas de eje** | Entrada `y 80, rotate 1.5`, 1.4s stagger 0.09. Inclinación 3D ±3.5° (rango 7) siguiendo el puntero, perspectiva 900, 0.7s power3. |
| **Cursor burbuja** | Punto 8px sigue en 0.18s; burbuja 96px "Ver guía" sigue en 0.6s y crece al entrar en `[data-cursor]`. |
| **Botón magnético** | `.btn-pill` se desplaza 22 % (x) y 32 % (y) de la distancia al centro, `elastic.out(1, 0.4)` 0.8s. |
| **Menú** | Cortina `clip-path` 0.95s expo.inOut; links `yPercent 115, rotate 3`, stagger 0.055 (+0.45s); aside `y 30`. Cerrar = reversa a 1.6×. |
| **Cómo funciona** (> 860px) | Sección fijada, pista horizontal `x: -(scrollWidth − innerWidth)`, `scrub 0.8`, barra de progreso `scaleX`. Mini pantallas `rotate 9 → -3, y 90, scale .9` ligadas al scroll; anillo 1.8s; barras y guías escalonadas. En móvil: vertical con `y 60` stagger 0.12. |
| **Vista previa de categoría** | Tarjeta 15 × 18rem sigue al cursor (+40px, 0.65s), rota según velocidad (±14°, factor 0.6), cambia de tono por categoría (`data-tone`: olive / cream / rose / olive-light / blush); ícono entra `scale .6, rotate -20` back.out(2). |
| **Hoja de ruta** | Trazo DrawSVG ligado al scroll (`scrub 0.6`); hitos se activan a `top 62%`; contadores 0→N en 2s power3.out. |
| **Marquee** | Dos pistas en sentidos opuestos, 38s lineal; la velocidad del scroll multiplica el `timeScale` (hasta ×7) e invierte el sentido al subir; decae ×0.92 por frame. |
| **Fondo CTA** | `body` pasa de `--cream` a `--olive-800` con scrub (`top 85%` → `top 25%`). |
| **Footer** | Letras de "smile" suben 1.4s stagger 0.06; el punto cae `y -1.2em` con `bounce.out` 1.2s (+0.5s). |
| **Letras de botón** | CSS: cada `.ch` sube 1.3em en 0.55s con retraso `i × 16ms`; la copia llega por `text-shadow`. |
| **Línea de scroll** | CSS `scrollLine` 2.2s `--ease-in-out` infinito. |
| **Scroll suave** | Lenis `lerp 0.095`; anclas en 1.6s con `1 − (1 − x)⁴`. |

### 9.6 Interacción en CSS

| Patrón | Valor |
|---|---|
| Presionar | `scale: .97` (botón), `.98` (tarjeta, respuesta), `.92` (ícono), 0.25s `--ease-out` |
| Color, borde, fondo | 0.3–0.4s |
| Capa de hover (tarjeta de eje, categoría) | `transform` 0.6–0.75s `--ease-out` |
| Subrayado de link | `scaleX` 0.5s, origen cambia de derecha a izquierda |

---

## 10. Reglas técnicas

1. **GSAP es dueño de `transform`.** En CSS, `:hover` y `:active` usan las propiedades individuales `translate`, `scale` y `rotate`; nunca `transition: transform` sobre un elemento que anima GSAP, porque congela sus tweens.
2. **Limpiar después de animar.** Entradas usan `clearProps: "transform,opacity"` para devolver el control al CSS.
3. **`html.no-anim`** se activa si falta GSAP/ScrollTrigger, si hay `prefers-reduced-motion` o si `init()` falla. En ese modo: sin preloader, todo visible, menú funcional sin animación, `transition-duration: 0.01ms`.
4. **Sin cursor ni vista previa** en `(hover: none), (pointer: coarse)`. Tilt y magnetismo solo con `(hover: hover) and (pointer: fine)`.
5. **Texto dividido accesible.** Todo elemento partido en letras o palabras conserva `aria-label` con el texto completo y los fragmentos van `aria-hidden`. En la app el SplitText se revierte al terminar (`split.revert()`).
6. **App liviana.** La app no carga Lenis ni ScrollTrigger. Animaciones en bucle infinito solo en la bienvenida.
7. **Esperar las fuentes** (`document.fonts.ready`) antes de dividir texto y refrescar ScrollTrigger tras `load`.
8. **Áreas seguras.** Todo lo fijado a bordes suma `env(safe-area-inset-*)`. Alturas de pantalla con `100svh` / `100dvh`.
9. **Ninguna pantalla encoge sus hijos** (`.screen > * { flex-shrink: 0 }`); el scroll es interno a la pantalla, sin barra visible.

---

## 11. Accesibilidad

- **Foco visible** global: `outline: 2px solid var(--focus); outline-offset: 3px; border-radius: 6px` (`--focus` = oliva-800; sobre superficies oscuras usar `--rose-500`). Nunca eliminarlo; los inputs lo reemplazan por borde + `--ring-field-focus`.
- **Objetivos táctiles ≥ 48 px.** Cumplen: `.btn` 59px, `.answer` 74px, inputs 56px, tiles. **No cumple: `.icon-btn` 2.9rem = 46px** → en el sistema subir a 3rem (48px).
- **Contraste**: ver §3.5.
- Checklist con `role="checkbox"` y `aria-checked`; iconos `aria-hidden`; nombres de tab visibles (no solo ícono).
- Idioma `es`; textos cortos y directos; nada depende solo del color (los niveles llevan texto).

## 12. Rendimiento

- Objetivo del sistema: paquete **< 2 MB**, interactivo en **< 2 s** en 3G, funcionando offline (PWA).
- Fuentes: subconjunto latino, solo los ejes usados, servidas localmente con `font-display: swap`.
- GSAP local y minificado; cargar ScrollTrigger y Lenis solo en la landing.
- Ilustraciones en SVG en línea; el grano es un SVG de < 1 KB, no una imagen.
- Animar solo `transform`, `opacity` y `clip-path`. Excepciones existentes: `width` de la imagen del hero y de la barra de progreso, `height` de la ruta, `background-color` del body.

---

## 13. Historial

| Versión | Fecha | Cambio |
|---|---|---|
| 1.0 | 2026-10-15 | Primera versión, extraída de la maqueta (commit `0d70c11`). Se elevan a token los valores repetidos (`[nuevo]`) y se proponen `--rose-700` e `.icon-btn` de 48px. |
| 1.1 | 2026-10-15 | Paleta reemplazada por la oficial de [SPEC-BASE §7.1]: `--brand-olive #3D4A3E`, `--brand-rose #E8C5B8`, `--brand-cream #F9F6F0`, `--brand-charcoal #2B2B2B`. Escala derivada y contraste recalculado (§3). `--rose-700` pasa de propuesto a obligatorio en texto rosa. `--focus` pasa a oliva-800. Estados del funnel CRM (§3.4). |

## 14. Pendientes de marca

- Validar con Grupo Smile la escala derivada (solo los 4 hex oficiales vienen del manual).
- Confirmar tipografías corporativas o licenciar Fraunces/Manrope para uso local.
- Confirmar si existe un color de error/alerta oficial; hoy las alertas usan la familia rosa.
