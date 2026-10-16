import { describe, expect, it } from "vitest";
import { SUMMARY_MAX_BYTES, summaryText, whatsappLink } from "./summary";

const base = {
  farmName: "Finca La Esperanza",
  place: "Fusagasugá, Cundinamarca",
  cycleId: "2026-C3",
  score: 66.66,
  levelLabel: "En desarrollo",
  goals: [
    { axisName: "Residuos y economía circular", action: "Separe los residuos en orgánicos, reciclables y peligrosos." },
    { axisName: "Huella de carbono y energía", action: "Calcule su huella con la calculadora de la guía." },
    { axisName: "Buenas prácticas e inocuidad", action: "Pregunte al SENA por la certificación orgánica." },
  ],
};

describe("ficha para WhatsApp (HU-IMP-04)", () => {
  it("resume finca, puntaje y las 3 metas", () => {
    const text = summaryText(base);
    expect(text).toContain("Finca La Esperanza");
    expect(text).toContain("67 de 100");
    expect(text.match(/^\d\. /gm)).toHaveLength(3);
  });

  it("siempre pesa menos de 1 KB aunque las acciones sean largas", () => {
    const long = { ...base, goals: base.goals.map((g) => ({ ...g, action: "Acción muy detallada con tildes y eñes ".repeat(20) })) };
    expect(new TextEncoder().encode(summaryText(long)).length).toBeLessThan(SUMMARY_MAX_BYTES);
  });

  it("abre wa.me con el texto codificado", () => {
    expect(whatsappLink("Hola ñandú")).toBe("https://wa.me/?text=Hola%20%C3%B1and%C3%BA");
  });
});
