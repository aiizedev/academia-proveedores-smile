# Academia Proveedores Smile — Maqueta front

Prototipo front del reto **Red de Valor Compartido × Grupo Smile** (Universidad Nacional de Colombia, Facultad de Ingeniería, septiembre 2026). Corresponde al rol de **Ingeniería de Sistemas**.

La maqueta tiene dos partes:

| Archivo | Qué es | Para qué sirve |
|---|---|---|
| `index.html` | Landing de presentación | Explicar la propuesta: los 5 ejes, cómo funciona, las categorías, los beneficios y los aliados. Referencia visual y de movimiento: [leome-and-partners.com](https://leome-and-partners.com/). |
| `app.html` | Demo navegable del producto | Simular el flujo completo del proveedor: **Autoevaluación → Diagnóstico → Guías**, con el piloto **Fruver**. |

> Es una maqueta: no tiene backend y los datos viven en el navegador. Las ponderaciones y las preguntas son provisionales hasta que Ingeniería Industrial entregue la matriz de diagnóstico.

---

## 1. Cómo ejecutarla

No requiere instalación ni build. Hace falta internet la primera vez, porque las librerías y las fuentes se cargan por CDN.

```bash
cd maqueta
python3 -m http.server 8765
```

Abrir:
- Landing: http://localhost:8765/index.html
- Demo: http://localhost:8765/app.html

También funciona abriendo `index.html` directamente, aunque se recomienda el servidor local.

**Durante una presentación:** en la demo, el botón **"Llenar con respuestas de ejemplo"** del panel izquierdo salta directo al diagnóstico con respuestas realistas. **"Reiniciar demo"** borra todo.

---

## 2. Estructura

```
maqueta/
├── index.html        Landing (markup de todas las secciones)
├── app.html          Demo: panel lateral + marco de teléfono + contenedores de pantallas
├── css/
│   ├── tokens.css    Sistema de diseño compartido: colores, tipografía, espacios, grano
│   ├── landing.css   Estilos de la landing
│   └── app.css       Estilos de la demo + estilos de impresión de la ficha
└── js/
    ├── icons.js      Set de íconos SVG de línea (compartido)
    ├── landing.js    Animaciones de la landing (GSAP + Lenis)
    ├── data.js       Contenido del piloto: preguntas, reglas, guías, incentivos
    └── app.js        Lógica de la demo: estado, motor de diagnóstico, pantallas
```

Peso del código propio: unos **186 KB** sin minificar. Librerías externas (CDN jsDelivr):

| Librería | Versión | Uso |
|---|---|---|
| GSAP + ScrollTrigger | 3.13.0 | Animaciones y animaciones ligadas al scroll |
| SplitText | 3.13.0 | Revelar titulares por líneas y palabras |
| DrawSVGPlugin | 3.13.0 | Trazos SVG que se dibujan (preloader, hojas, hoja de ruta) |
| Lenis | 1.2.3 | Scroll suave, solo en la landing |
| Google Fonts | — | Fraunces (titulares) y Manrope (texto) |

La demo **no** usa Lenis ni ScrollTrigger, para mantenerla liviana.

---

## 3. Sistema de diseño (`css/tokens.css`)

Basado en la línea gráfica de Grupo Smile: verde oliva, palo de rosa y una estética cálida y elegante.

**Paleta**

| Token | Hex | Uso |
|---|---|---|
| `--olive-900` | `#1e2416` | Tinta: texto principal y fondos muy oscuros |
| `--olive-800` | `#2f3a1f` | Oliva oscuro: botones primarios y secciones oscuras |
| `--olive-600` | `#5b6b3a` | Oliva: acentos y eyebrows |
| `--olive-300` | `#a3ae7a` | Oliva claro |
| `--rose-500` | `#d4a5a0` | Palo de rosa: acento principal, CTAs y el punto de "smile." |
| `--rose-100` | `#f3dcd4` | Blush: fondos suaves |
| `--cream` | `#faf4ec` | Fondo general |

> Los códigos de color son una aproximación. Hay que reemplazarlos por los del manual de marca oficial cuando Grupo Smile lo comparta; basta con cambiarlos en `tokens.css`.

**Tipografía**
- `--font-display`: **Fraunces**, una serif variable. Se usa en titulares, con tracking negativo y cursiva en las palabras clave.
- `--font-body`: **Manrope**, una sans legible para textos, botones y formularios.

**Otros**
- Radios `--radius-s` … `--radius-xl`.
- Curvas `--ease-out` y `--ease-in-out`.
- Textura de grano (`--grain`, SVG en línea): se aplica con la clase `.grain`.
- Íconos con `window.icon("nombre")` o con `<span data-icon="nombre"></span>`, que se rellena al cargar.

---

## 4. Landing (`index.html` + `js/landing.js`)

| # | Sección | Contenido | Animación |
|---|---|---|---|
| — | Preloader | Flor de 4 pétalos + "smile." + contador | Pétalos dibujados con DrawSVG → relleno → giro y apertura → la cortina sube (`clip-path`). En visitas repetidas de la misma sesión va 2,6× más rápido. |
| — | Nav + menú | Logo, "Probar demo" y botón Menú | Letras que cambian al pasar el mouse (`[data-chars]`). El nav se oculta al bajar y aparece al subir, y cambia de color sobre las secciones oscuras. El menú abre a pantalla completa con los links escalonados. |
| 1 | Hero | "Cultivar / mejor / es simple." + ilustración de paisaje | Palabras que suben desde una máscara; la ventana de imagen se abre empujando el texto; lista rotativa de categorías; al hacer scroll las filas se separan en parallax. |
| 2 | Manifiesto | Idea de valor compartido (Porter & Kramer) | Las palabras se iluminan con el scroll y las hojas de fondo se dibujan con parallax. |
| 3 | Los 5 ejes | BPA, residuos, huella de carbono, trabajo infantil, DDHH + tarjeta CTA | Entrada escalonada, inclinación 3D siguiendo el puntero, relleno curvo al pasar el mouse y cursor-burbuja "Ver guía". |
| 4 | Cómo funciona | 3 pasos con mini-pantallas | Scroll horizontal fijado con barra de progreso; las mini-pantallas rotan al entrar. En móvil (≤ 860 px) es vertical. |
| 5 | Categorías | Fruver (piloto) + 4 "Próximamente" | Lista grande con una tarjeta flotante que sigue al cursor, rota según la velocidad y cambia de color por categoría. |
| 6 | Hoja de ruta | 4 hitos de beneficios + 4 cifras | La línea se dibuja con el scroll, los nodos se activan y los contadores animan. |
| 7 | Aliados | SENA, MinAgricultura, Asohofrucol, ICA, AUNAP… | Dos franjas en direcciones opuestas que se aceleran e invierten según la velocidad del scroll. |
| 8 | CTA + Footer | "Tu finca, tu plan, a tu ritmo." y "smile." gigante | El fondo pasa de crema a oliva, las letras suben y el punto cae con rebote. |

**Accesibilidad y respaldo**
- Con `prefers-reduced-motion`, o si las librerías no cargan, se agrega la clase `html.no-anim`: no hay preloader, todo es visible y el menú funciona sin animación.
- Los titulares divididos conservan un `aria-label` con el texto completo.
- En pantallas táctiles no aparecen el cursor personalizado ni la tarjeta flotante.

**Regla técnica importante:** GSAP es dueño de la propiedad `transform`. Para efectos de `:hover` o `:active` en CSS se usan las propiedades independientes `translate` y `scale`, nunca `transition: transform`, porque eso congela las animaciones de GSAP.

---

## 5. Demo (`app.html` + `js/app.js`)

### 5.1 Pantallas

| Pantalla | `data-screen` | Qué hace |
|---|---|---|
| Bienvenida | `welcome` | Nombre y finca (opcionales). Ilustración con una planta que crece. |
| Categoría | `category` | Fruver activo; las demás muestran "llegará pronto". |
| Autoevaluación | `quiz` | 10 preguntas, una por pantalla, con botones grandes (Sí / A veces / No), ayuda contextual y barra de progreso con una hoja. |
| Analizando | `loading` | Transición de unos 2,6 s que recorre los 5 ejes. |
| Diagnóstico | `diagnosis` | Anillo con puntaje de 0 a 100, nivel general, barra por eje y alertas críticas. |
| Guías | `plan` | Guías ordenadas por prioridad con su progreso. |
| Detalle de guía | `guide` | Pasos, checklist, consejo, fuente y calculadora de huella (solo en carbono). |
| Hoja de ruta | `route` | Incentivos bloqueados o desbloqueados. |
| Ficha | `ficha` | Resumen imprimible o descargable como PDF (A4), o enviado como texto por WhatsApp. |

La barra inferior (Diagnóstico / Guías / Ruta / Ficha) aparece cuando termina la autoevaluación.

### 5.2 Estado y persistencia (offline-first)

Todo el estado se guarda en `localStorage` con la clave `smile-demo-v1`:

```js
{
  screen: "diagnosis",            // pantalla donde quedó (se restaura al recargar)
  name: "Rosa", farm: "Finca La Esperanza",
  category: "fruver",
  answers: { q1: "si", q2: "aveces", ... },
  qIndex: 9, done: true, finishedAt: 1790000000000,
  checks: { "g-residuos": [true, true, false, false] },   // checklist por guía
  calc: { diesel: "40", gas: "", urea: "50", kwh: "120" }, // calculadora de huella
  guide: "g-carbono"              // guía abierta
}
```

- Cada cambio se guarda al instante. El indicador "Guardado" de la barra de estado lo confirma.
- Escucha los eventos `online` y `offline` del navegador y muestra "Sin conexión · guardado".

### 5.3 Motor de diagnóstico (reglas)

Está en `diagnose()`, dentro de `js/app.js`:

1. **Puntaje por eje** = Σ(peso × valor de la respuesta) / Σ(pesos) × 100. Los valores son: Sí = 1, A veces = 0,5, No = 0.
2. **Nivel por eje:** Inicial (< 40), En desarrollo (40–74), Avanzado (≥ 75).
3. **Prioridad:** Inicial → *alta*, En desarrollo → *media*, Avanzado → *mantener*.
4. **Reglas críticas:** una pregunta con `critical` y una respuesta de riesgo convierte la prioridad del eje en **Urgente** y le impide ser Avanzado.
   - Ejemplo 1: trabajo infantil con respuesta "No" o "A veces" (la pregunta distingue el trabajo adolescente legal de 15 a 17 años con permiso del inspector, Ley 1098 de 2006, art. 35).
   - Ejemplo 2: agroquímicos sin registro ICA.
5. **Puntaje general** = Σ de todos los puntos ponderados / Σ de todos los pesos.

`buildPlan()` ordena las guías así: primero las incompletas, luego por prioridad (Urgente → alta → media → mantener), después por menor puntaje del eje. Las guías "bonus" van al final; por ejemplo, *Camino a la producción orgánica* sube a prioridad media cuando BPA ya está en Avanzado.

`incentivesStatus()` desbloquea los beneficios:

| Incentivo | Condición |
|---|---|
| Diagnóstico personalizado | Terminar la autoevaluación |
| Prioridad en compras | 2 guías completas |
| Sello Proveedor Sostenible | Al menos una guía completa por cada eje |
| Nuevos mercados | Nivel Avanzado en los 5 ejes |

Una guía está completa cuando todos los ítems de su checklist están marcados.

### 5.4 Contenido (`js/data.js`)

Todo el contenido está separado de la lógica. Así Industrial puede ajustarlo sin tocar `app.js`, y más adelante puede venir de un JSON descargado y cacheado.

| Clave | Contiene |
|---|---|
| `categories` | Las 5 categorías y cuál está activa |
| `axes` | Los 5 ejes (id, nombre, nombre corto, ícono) |
| `answers` | Opciones de respuesta y su valor |
| `questions` | `{ id, axis, weight, text, help, critical? }` |
| `levels` | Rangos de madurez y su prioridad |
| `priorities` | Etiquetas y orden de prioridad |
| `guides` | `{ id, axis, minutes, title, intro, steps[], checklist[], tip, source, bonus?, calculator? }` |
| `incentives` | Beneficios de la hoja de ruta |

**Recetas rápidas**
- **Cambiar una ponderación:** editar `weight` en `questions`.
- **Cambiar los rangos de nivel:** editar `min` en `levels`.
- **Agregar una pregunta:** añadir un objeto a `questions` con un `axis` existente. El contador "x de N" se ajusta solo.
- **Marcar una respuesta como crítica:** agregar `critical: { when: "no" | ["no","aveces"], message: "..." }`.
- **Agregar una guía:** añadir un objeto a `guides` con el `axis` correspondiente. Aparece sola en el plan.
- **Activar otra categoría:** cambiar `active: true` en `categories`. Nota: por ahora las preguntas y guías son solo de Fruver; habría que separarlas por categoría.

### 5.5 Ficha imprimible y WhatsApp

"Descargar o imprimir" copia la ficha en `#print-root` y llama a `window.print()`. El CSS de `@media print` oculta todo lo demás y ajusta la ficha a A4. En el celular se elige "Guardar como PDF".

"Enviar por WhatsApp" arma la misma ficha en texto plano (`fichaText()`, menos de 1 KB) y abre `https://wa.me/?text=…` para compartirla con la asociación o el técnico. No usa la API de WhatsApp Business: es un enlace, sin backend.

---

## 6. Qué se verificó

Pruebas automatizadas con Playwright y Chromium: capturas y revisión de consola.

- La landing en 1440 × 900 y 390 × 844: sin errores de consola y sin scroll horizontal en móvil.
- El flujo completo de la demo en escritorio y móvil: respuestas, diagnóstico, guías, checklist, calculadora, ruta, ficha y modo sin conexión.
- Los puntajes, calculados a mano con las respuestas de ejemplo: BPA 80 %, residuos 20 %, carbono 50 %, infantil 100 %, DDHH 70 %, general 65.
- La calculadora: 40 L de ACPM y 120 kWh dan ≈ 124 kg CO₂e; con 50 kg de urea, ≈ 359 kg CO₂e. El factor de urea (≈ 4,7 kg CO₂e/kg) suma N₂O directo e indirecto y el CO₂ de la hidrólisis con los valores por defecto del IPCC 2019 para clima húmedo (EF1 0,016; FracGASF urea 0,15; EF4 0,014; FracLEACH 0,24; EF5 0,011; 0,20 t C/t urea) y GWP AR5 del N₂O = 265. No incluye la fabricación del abono.
- La persistencia: al recargar vuelve a la misma pantalla con el mismo estado.
- La impresión de la ficha a PDF A4.
- El modo con movimiento reducido.

---

## 7. Limitaciones y siguientes pasos

| Pendiente | Detalle |
|---|---|
| PWA real | Agregar `manifest.json` y un Service Worker que cachee HTML, CSS, JS, fuentes y librerías. Hoy la primera carga necesita internet. |
| Peso < 2 MB | Servir GSAP y las fuentes localmente, en subconjunto y minificadas, y medir el paquete total. |
| Sincronización | Backend y cola de envío para mandar los resultados a Grupo Smile cuando vuelva la señal (Background Sync con respaldo manual, porque iOS no lo soporta). |
| Datos reales | Reemplazar `data.js` con la matriz de Ingeniería Industrial y el formulario actual de Smile. |
| Marca | Colores y tipografías oficiales del manual de Grupo Smile. |
| Más categorías | Separar preguntas y guías por categoría (Lácteos, Carnes, Pescados, Mariscos). |
| Privacidad | Consentimiento y tratamiento de datos (Ley 1581 de 2012), sobre todo en los ejes de trabajo infantil y DDHH. |
| Pruebas | Red 2G/3G emulada y dispositivos de gama baja reales. |
