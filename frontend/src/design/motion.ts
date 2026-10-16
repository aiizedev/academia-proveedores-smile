/* Tokens de movimiento — port tipado de docs/diseno/motion.js (GUIA_VISUAL §9).
   Mantener los valores idénticos a la fuente; cualquier cambio entra primero en la guía. */

export const EASE = {
  enter: "expo.out",
  move: "expo.inOut",
  exit: "power2.in",
  exitSoft: "power3.in",
  follow: "power3",
  pop: "back.out(2)",
  popStrong: "back.out(3)",
  spring: "elastic.out(1, 0.4)",
  bounce: "bounce.out",
  scrub: "none",
  count: "power3.out",
  sway: "sine.inOut",
  fall: "power1.in",
} as const;

export const DUR = {
  xs: 0.18,
  exit: 0.32,
  s: 0.45,
  m: 0.6,
  enter: 0.75,
  l: 0.9,
  base: 1.1,
  xl: 1.2,
  headline: 1.3,
  "2xl": 1.6,
  count: 2.2,
  loop: 38,
} as const;

export const STAGGER = {
  words: 0.025,
  tight: 0.05,
  menu: 0.055,
  base: 0.08,
  lines: 0.1,
  hero: 0.11,
  loose: 0.12,
  petals: 0.14,
} as const;

export const TRIGGER = {
  headline: "top 86%",
  reveal: "top 90%",
  card: "top 88%",
  row: "top 92%",
  milestone: "top 62%",
} as const;

export type TweenVars = Record<string, string | number | boolean>;
export type Direction = 1 | -1;

export const PRESET = {
  reveal: { y: 30, opacity: 0, duration: DUR.xl, stagger: STAGGER.base, ease: EASE.enter },
  maskUp: { yPercent: 110, rotate: 2.5, duration: DUR.headline, stagger: STAGGER.lines, ease: EASE.enter },
  wordsUp: { yPercent: 110, duration: 0.8, stagger: STAGGER.words, ease: EASE.enter },
  cardIn: { y: 80, opacity: 0, rotate: 1.5, duration: 1.4, stagger: 0.09, ease: EASE.enter },
  screenIn: (dir: Direction = 1): TweenVars => ({ xPercent: 14 * dir, opacity: 0, duration: DUR.enter, ease: EASE.enter }),
  screenOut: (dir: Direction = 1): TweenVars => ({ xPercent: -12 * dir, opacity: 0, duration: DUR.exit, ease: EASE.exit }),
  screenItems: { y: 30, opacity: 0, duration: DUR.l, stagger: STAGGER.tight, ease: EASE.enter },
  answersIn: { y: 40, opacity: 0, duration: 0.8, stagger: 0.07, ease: EASE.enter },
  springPress: { scale: 0.7, duration: DUR.m, ease: EASE.spring },
  pop: { scale: 0, rotation: -90, duration: DUR.l, stagger: 0.18, ease: "back.out(2.2)" },
  toastIn: { y: 30, opacity: 0, scale: 0.9, duration: DUR.m, ease: EASE.enter },
  toastOut: { y: 20, opacity: 0, duration: 0.4, ease: EASE.exit },
  toastHold: 2.3,
  ripple: { scale: 1, opacity: 0, duration: 0.8, ease: "power2.out" },
  rippleSizeFactor: 2.2,
} as const;

export const FOLLOW = {
  cursorDot: { duration: DUR.xs, ease: EASE.follow },
  cursorBubble: { duration: 0.6, ease: EASE.follow },
  preview: { duration: 0.65, ease: EASE.follow },
  previewRotation: { duration: 0.8, ease: EASE.follow, clamp: 14, factor: 0.6 },
  tilt: { duration: 0.7, ease: EASE.follow, maxDeg: 7, perspective: 900 },
  magnetic: { duration: 0.8, ease: EASE.spring, factorX: 0.22, factorY: 0.32 },
} as const;

export const REPEAT_VISIT_TIMESCALE = 2.6;

interface GsapLike {
  defaults(vars: { ease: string; duration: number }): unknown;
}

/** Registra los defaults globales de GSAP. Llamar una vez tras cargarlo. */
export function applyDefaults(gsap: GsapLike): void {
  gsap.defaults({ ease: EASE.enter, duration: DUR.base });
}

/** true si el usuario pidió reducir movimiento (equivale a html.no-anim). */
export function shouldReduceMotion(): boolean {
  return typeof window !== "undefined" && (window.matchMedia(REDUCED_MOTION_QUERY).matches || document.documentElement.classList.contains(NO_ANIM_CLASS));
}

/** Clase que GUIA_VISUAL §10.3 pone en <html> cuando no se anima. */
export const NO_ANIM_CLASS = "no-anim";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Convierte un preset en un cambio instantáneo (HU-DS-04): mismo estado final, sin recorrido. */
export function instant<T extends object>(vars: T): T & { duration: 0; stagger: 0; delay: 0 } {
  return { ...vars, duration: 0, stagger: 0, delay: 0 };
}

/** Devuelve el preset tal cual o su versión instantánea si hay movimiento reducido. */
export function motionPreset<T extends object>(vars: T, reduced: boolean): T {
  return reduced ? instant(vars) : vars;
}
