import type { ReactNode } from "react";
import { PageTransition } from "@/components/motion";

/* Se vuelve a montar en cada navegación: anima la entrada de cada página (GUIA_VISUAL §9). */
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
