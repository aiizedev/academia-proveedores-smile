"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useConsentStatus } from "./hooks";

export const CONSENT_PATH = "/app/consentimiento";

/* RF-PRV-001: sin autorización general vigente, ninguna pantalla de captura se
   muestra; todo /app/* lleva a /app/consentimiento (también sin conexión). */
export function ConsentGuard({ children }: { children: ReactNode }) {
  const status = useConsentStatus();
  const pathname = usePathname();
  const router = useRouter();
  const onConsentPage = pathname === CONSENT_PATH;

  useEffect(() => {
    if (status === "missing" && !onConsentPage) router.replace(CONSENT_PATH);
  }, [status, onConsentPage, router]);

  if (onConsentPage || status === "granted") return children;
  return <p className="sr-only" role="status">Cargando sus datos</p>;
}
