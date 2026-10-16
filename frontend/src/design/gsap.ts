import { applyDefaults, NO_ANIM_CLASS } from "./motion";

/* GSAP solo en el cliente y bajo demanda (GUIA_VISUAL §10.6, PLAN_FRONTEND §6):
   core + SplitText + DrawSVG. Nunca ScrollTrigger ni Lenis en /app. */
type Gsap = typeof import("gsap").gsap;

let loading: Promise<Gsap> | null = null;

export function loadGsap(): Promise<Gsap> {
  if (typeof window === "undefined") return Promise.reject(new Error("GSAP solo corre en el navegador"));
  loading ??= Promise.all([import("gsap"), import("gsap/SplitText"), import("gsap/DrawSVGPlugin")])
    .then(([{ gsap }, { SplitText }, { DrawSVGPlugin }]) => {
      gsap.registerPlugin(SplitText, DrawSVGPlugin);
      applyDefaults(gsap);
      return gsap;
    })
    .catch((error: unknown) => {
      // Sin GSAP la interfaz queda visible y estática (§10.3).
      document.documentElement.classList.add(NO_ANIM_CLASS);
      loading = null;
      throw error;
    });
  return loading;
}
