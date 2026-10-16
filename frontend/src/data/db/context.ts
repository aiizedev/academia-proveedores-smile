"use client";

import type { Database } from "@nozbe/watermelondb";
import { createContext, useContext } from "react";

/* Estado de la base local para toda la PWA. La UI lee y escribe solo aquí
   (RF-SYN-001); mientras abre, las pantallas muestran su estado "cargando". */
export type LocalDbState =
  | { status: "loading" }
  | { status: "ready"; database: Database }
  | { status: "error"; error: Error };

export const LocalDbContext = createContext<LocalDbState>({ status: "loading" });

export function useLocalDb(): LocalDbState {
  return useContext(LocalDbContext);
}
