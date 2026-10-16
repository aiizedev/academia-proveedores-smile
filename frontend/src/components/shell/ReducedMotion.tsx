"use client";

import { useEffect } from "react";
import { NO_ANIM_CLASS } from "@/design/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/* Mantiene html.no-anim sincronizado si el usuario cambia la preferencia con
   la app abierta; el primer pintado lo resuelve el script del layout raíz. */
export function ReducedMotion() {
  const reduced = useReducedMotion();
  useEffect(() => {
    document.documentElement.classList.toggle(NO_ANIM_CLASS, reduced);
  }, [reduced]);
  return null;
}
