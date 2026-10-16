"use client";

import { Button, Card } from "@/components/ui";
import { AXES, STAGE_LABEL, SUPPLIERS } from "@/mocks/smile";
import { downloadCsv, toCsv } from "../_ui/csv";

/* Factores de huella de DOC-FRUVER (C-12) aplicados a un consumo simulado por proveedor. */
const REPORTS = [
  {
    title: "Huella de carbono de la cadena",
    desc: "kg CO₂e por tonelada producida, por proveedor (Scope 3 de Smile).",
    file: "huella-carbono.csv",
    build: () =>
      toCsv(
        ["NIT", "Proveedor", "Municipio", "Toneladas", "kg CO2e", "kg CO2e por t"],
        SUPPLIERS.map((s) => {
          const t = Math.round(s.finance.salesCop / 2_500_000);
          const kg = Math.round(t * (180 - s.axes.carbono));
          return [s.nit, s.farm, s.municipality, t, kg, t ? Math.round(kg / t) : 0];
        }),
      ),
  },
  {
    title: "Matriz de derechos humanos y trabajo infantil",
    desc: "Autodeclaración, eje de trabajo infantil y de derechos humanos/SST.",
    file: "matriz-ddhh.csv",
    build: () =>
      toCsv(
        ["NIT", "Proveedor", "Libre de trabajo infantil", "Eje trabajo infantil", "Eje DDHH y SST"],
        SUPPLIERS.map((s) => [s.nit, s.farm, s.childLaborFree ? "Sí" : "No", s.axes.infantil, s.axes.ddhh]),
      ),
  },
  {
    title: "Retorno social y ambiental",
    desc: "Score, etapa, merma y margen agregado (marco Porter & Kramer).",
    file: "retorno-social-ambiental.csv",
    build: () =>
      toCsv(
        ["NIT", "Proveedor", "Segmento", "Etapa", "Score", "Merma %", "Margen %", ...AXES.map((a) => a.name)],
        SUPPLIERS.map((s) => [s.nit, s.farm, s.segment, STAGE_LABEL[s.stage], s.score, s.wastePct, s.finance.marginPct, ...AXES.map((a) => s.axes[a.code])]),
      ),
  },
] as const;

export function ReportButtons() {
  return (
    <div className="grid grid-cols-3 gap-6">
      {REPORTS.map((r) => (
        <Card key={r.file} className="flex flex-col justify-between gap-4">
          <div>
            <h2 className="font-display text-[1.25rem]">{r.title}</h2>
            <p className="mt-1 text-app-small text-ink-soft">{r.desc}</p>
          </div>
          <Button onClick={() => downloadCsv(r.file, r.build())}>Descargar CSV</Button>
        </Card>
      ))}
    </div>
  );
}
