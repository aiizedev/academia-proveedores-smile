"use client";
import { useEffect, useState } from "react";
import { DUR } from "@/design/motion-react";
import { useFilters } from "./filters";

/** Simula la llegada de los datos del tablero (la demo no consulta la API):
    esqueleto un instante al entrar; los cambios de filtro ya no lo muestran,
    las gráficas se transforman en su sitio. */
export function useArrival(ms = DUR.exit * 1000 + 150) {
  const { ready } = useFilters();
  const [arrived, setArrived] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const id = setTimeout(() => setArrived(true), ms);
    return () => clearTimeout(id);
  }, [ready, ms]);
  return arrived;
}
