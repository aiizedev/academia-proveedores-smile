/* ==========================================================
   Academia Proveedores Smile — Tokens de movimiento v1.0
   Fuente de verdad: docs/diseno/GUIA_VISUAL.md §9
   Valores extraídos de maqueta/js/landing.js y maqueta/js/app.js.
   Uso:
     import { EASE, DUR, STAGGER, PRESET, applyDefaults } from "./motion.js";
     applyDefaults(gsap);
     gsap.from(el, PRESET.reveal);
   ========================================================== */

/** Curvas GSAP con nombre de intención. */
export const EASE = {
  enter: "expo.out",            // por defecto: todo lo que entra
  move: "expo.inOut",           // cortinas, cambios de estado grandes, ticker
  exit: "power2.in",            // todo lo que sale (siempre más corto)
  exitSoft: "power3.in",
  follow: "power3",             // quickTo: cursor, tilt, vista previa
  pop: "back.out(2)",           // íconos, nodos, insignias
  popStrong: "back.out(3)",     // check, semilla del preloader
  spring: "elastic.out(1, 0.4)",// feedback táctil: check, hoja de progreso, magnético
  bounce: "bounce.out",         // solo el punto de "smile." en el footer
  scrub: "none",                // todo lo ligado a scroll
  count: "power3.out",          // contadores de estadísticas
  sway: "sine.inOut",           // loops orgánicos (hojas)
  fall: "power1.in",            // confeti
};

/** Duraciones en segundos (GSAP). Espejo de --dur-* en tokens.css. */
export const DUR = {
  xs: 0.18,     // seguidor de cursor
  exit: 0.32,   // salida de pantalla
  s: 0.45,      // salida de burbuja / vista previa
  m: 0.6,       // micro-feedback, toast, check
  enter: 0.75,  // entrada de pantalla (app)
  l: 0.9,       // listas, progreso, cambio de pregunta
  base: 1.1,    // gsap.defaults
  xl: 1.2,      // revelado por scroll
  headline: 1.3,// titulares por línea
  "2xl": 1.6,   // barras, ruta, ancho de imagen hero
  count: 2.2,   // anillo y contadores de la app
  loop: 38,     // marquee
};

/** Escalonado en segundos. */
export const STAGGER = {
  words: 0.025, // palabras de la pregunta
  tight: 0.05,  // items [data-a] al entrar pantalla
  menu: 0.055,  // links del menú
  base: 0.08,   // revelados, barras por eje
  lines: 0.1,   // líneas de titular
  hero: 0.11,   // palabras del hero
  loose: 0.12,  // paneles en móvil, guías
  petals: 0.14, // pétalos del preloader
};

/** Puntos de inicio de ScrollTrigger usados en la maqueta. */
export const TRIGGER = {
  headline: "top 86%",
  reveal: "top 90%",
  card: "top 88%",
  row: "top 92%",
  milestone: "top 62%",
};

/** Presets listos para gsap.from / gsap.to. */
export const PRESET = {
  // Revelado genérico [data-reveal]
  reveal: { y: 30, opacity: 0, duration: DUR.xl, stagger: STAGGER.base, ease: EASE.enter },
  // Línea o palabra que sube desde una máscara (SplitText mask: "lines")
  maskUp: { yPercent: 110, rotate: 2.5, duration: DUR.headline, stagger: STAGGER.lines, ease: EASE.enter },
  // Palabras de pregunta / título de guía (app)
  wordsUp: { yPercent: 110, duration: 0.8, stagger: STAGGER.words, ease: EASE.enter },
  // Tarjetas que entran con leve giro
  cardIn: { y: 80, opacity: 0, rotate: 1.5, duration: 1.4, stagger: 0.09, ease: EASE.enter },
  // Pantalla de la app (dir = 1 avanza, -1 retrocede)
  screenIn: (dir = 1) => ({ xPercent: 14 * dir, opacity: 0, duration: DUR.enter, ease: EASE.enter }),
  screenOut: (dir = 1) => ({ xPercent: -12 * dir, opacity: 0, duration: DUR.exit, ease: EASE.exit }),
  screenItems: { y: 30, opacity: 0, duration: DUR.l, stagger: STAGGER.tight, ease: EASE.enter },
  // Respuestas de la autoevaluación
  answersIn: { y: 40, opacity: 0, duration: 0.8, stagger: 0.07, ease: EASE.enter },
  // Feedback elástico al tocar (check, ícono, hoja)
  springPress: { scale: 0.7, duration: DUR.m, ease: EASE.spring },
  // Ícono / nodo que aparece
  pop: { scale: 0, rotation: -90, duration: DUR.l, stagger: 0.18, ease: "back.out(2.2)" },
  // Toast
  toastIn: { y: 30, opacity: 0, scale: 0.9, duration: DUR.m, ease: EASE.enter },
  toastOut: { y: 20, opacity: 0, duration: 0.4, ease: EASE.exit },
  toastHold: 2.3,
  // Ripple al tocar (tamaño = max(w,h) * 2.2)
  ripple: { scale: 1, opacity: 0, duration: 0.8, ease: "power2.out" },
  rippleSizeFactor: 2.2,
};

/** Seguidores con gsap.quickTo. */
export const FOLLOW = {
  cursorDot: { duration: DUR.xs, ease: EASE.follow },
  cursorBubble: { duration: 0.6, ease: EASE.follow },
  preview: { duration: 0.65, ease: EASE.follow },
  previewRotation: { duration: 0.8, ease: EASE.follow, clamp: 14, factor: 0.6 },
  tilt: { duration: 0.7, ease: EASE.follow, maxDeg: 7, perspective: 900 },
  magnetic: { duration: 0.8, ease: EASE.spring, factorX: 0.22, factorY: 0.32 },
};

/** Scroll suave (solo landing). */
export const LENIS = { lerp: 0.095, wheelMultiplier: 1, smoothWheel: true };
export const SCROLL_TO = { duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) };

/** Visitas repetidas en la sesión aceleran el preloader. */
export const REPEAT_VISIT_TIMESCALE = 2.6;

/** Registra los defaults globales. Llamar una vez tras cargar GSAP. */
export function applyDefaults(gsap) {
  gsap.defaults({ ease: EASE.enter, duration: DUR.base });
}

/** true si se debe desactivar la animación (html.no-anim). */
export function shouldReduceMotion() {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
