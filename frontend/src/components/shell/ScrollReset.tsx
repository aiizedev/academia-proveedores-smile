"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/* Dentro del marco de teléfono el scroll es interno (#app-scroll): al cambiar
   de pantalla se vuelve arriba, como hace el navegador con la ventana. */
export function ScrollReset({ targetId }: { targetId: string }) {
  const pathname = usePathname();
  useEffect(() => {
    document.getElementById(targetId)?.scrollTo({ top: 0 });
  }, [pathname, targetId]);
  return null;
}
