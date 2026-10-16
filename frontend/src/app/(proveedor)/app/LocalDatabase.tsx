"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui";
import { LocalDbContext, type LocalDbState } from "@/data/db/context";
import { getDatabase } from "@/data/db";

/* Abre WatermelonDB después del primer pintado (PLAN_FRONTEND §6) y, si el
   navegador no deja abrirla, muestra cómo recuperarse en vez de una pantalla vacía. */
export function LocalDatabase({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LocalDbState>({ status: "loading" });

  const open = useCallback(() => {
    setState({ status: "loading" });
    getDatabase().then(
      (database) => setState({ status: "ready", database }),
      (error: unknown) => setState({ status: "error", error: error instanceof Error ? error : new Error(String(error)) }),
    );
  }, []);

  useEffect(open, [open]);

  if (state.status === "error") {
    return (
      <section role="alert" className="flex flex-col gap-4 pt-6">
        <p className="a-eyebrow">Sus datos</p>
        <h1 className="a-title">No pudimos abrir sus datos en este teléfono</h1>
        <p className="text-app-body text-ink-soft">
          Cierre otras pestañas de la app y vuelva a intentar. Si usa navegación privada, ábrala en una ventana normal.
        </p>
        <Button onClick={open}>Intentar de nuevo</Button>
      </section>
    );
  }

  return <LocalDbContext.Provider value={state}>{children}</LocalDbContext.Provider>;
}
