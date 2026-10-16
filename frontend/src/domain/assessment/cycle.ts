import type { Size } from "./form";

/* Contexto del formulario (RF-ASM-002, CU-05). */

/** Ciclo cuatrimestral en hora de Colombia: ene–abr C1, may–ago C2, sep–dic C3. */
export function cycleFor(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "numeric" }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")!.value;
  const month = Number(parts.find((p) => p.type === "month")!.value);
  return `${year}-C${Math.ceil(month / 4)}`;
}

/** POC: el tamaño se captura en HU-SUP-02; mientras tanto, el formulario base (micro). */
export const DEFAULT_SIZE: Size = "micro";

/** Declaración formal de veracidad (RF-PRV-004, DOC-AUTOEVAL). */
export const DECLARATION = {
  version: "2026-10-v1",
  text: "Declaro que la información de esta autoevaluación es veraz y que Grupo Smile puede verificarla.",
} as const;
