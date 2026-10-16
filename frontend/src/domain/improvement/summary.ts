/* Ficha resumen para compartir (RF-IMP-007, CU-08): texto plano de menos de
   1 KB con finca, puntaje y metas, y su enlace wa.me. Pura. */
export const SUMMARY_MAX_BYTES = 1024;

export interface SummaryInput {
  farmName: string;
  place: string;
  cycleId: string;
  score: number;
  levelLabel: string;
  goals: ReadonlyArray<{ axisName: string; action: string }>;
}

const bytes = (text: string) => new TextEncoder().encode(text).length;

function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Arma el texto y recorta las acciones hasta que quepa en 1 KB. */
export function summaryText(input: SummaryInput): string {
  for (const max of [200, 140, 100, 70, 40]) {
    const lines = [
      `Ficha de ${input.farmName}`,
      input.place,
      `Autoevaluación ${input.cycleId}: ${Math.round(input.score)} de 100 (${input.levelLabel})`,
      "Mis 3 metas:",
      ...input.goals.map((g, i) => `${i + 1}. ${g.axisName}: ${clip(g.action, max)}`),
      "Academia de Proveedores Smile",
    ].filter(Boolean);
    const text = lines.join("\n");
    if (bytes(text) < SUMMARY_MAX_BYTES) return text;
  }
  return clip(`Ficha de ${input.farmName}: ${Math.round(input.score)} de 100`, 200);
}

export function whatsappLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
