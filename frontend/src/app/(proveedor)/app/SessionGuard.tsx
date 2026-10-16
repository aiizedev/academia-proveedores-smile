"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { loadSession } from "@/lib/auth/session";

/* /app es del PROVEEDOR (HU-IAM-02/03). Con una sesión guardada abre aun sin
   señal; sin sesión lleva a /ingresar y vuelve aquí al entrar. */
export function SessionGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (session?.user.role === "PROVEEDOR") setAllowed(true);
    else router.replace(`/ingresar?next=${encodeURIComponent(pathname)}`);
  }, [pathname, router]);

  return allowed ? children : null;
}
