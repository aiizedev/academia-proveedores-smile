"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { PageLoading } from "@/components/motion";
import { loadSession, saveSession } from "@/lib/auth/session";
import { DEMO_OPEN } from "@/lib/env";
import { DEMO_SESSION } from "@/mocks/app";

/* /app es del PROVEEDOR (HU-IAM-02/03). Con una sesión guardada abre aun sin
   señal; sin sesión lleva a /ingresar y vuelve aquí al entrar. */
export function SessionGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // Demo (POC): sin sesión entra el proveedor demo fijo.
    if (DEMO_OPEN && !loadSession()) saveSession(DEMO_SESSION);
    const session = loadSession();
    if (session?.user.role === "PROVEEDOR") setAllowed(true);
    else router.replace(`/ingresar?next=${encodeURIComponent(pathname)}`);
  }, [pathname, router]);

  return allowed ? children : <PageLoading message="Abriendo su finca…" />;
}
