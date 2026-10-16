import Link from "next/link";
import { Card } from "@/components/ui";
import { STAGES, SUPPLIERS, WASTE_BASELINE, WASTE_TARGET, average, stageCounts } from "@/mocks/smile";
import { Bar, DemoNote, Kpi, PageHeader, SectionTitle, SegmentBadge, StageBadge } from "./_ui/kit";

export const metadata = { title: "Resumen" };

export default function ResumenPage() {
  const counts = stageCounts();
  const waste = average(SUPPLIERS.map((s) => s.wastePct));
  const strategic = SUPPLIERS.filter((s) => s.segment === "ESTRATEGICO");
  const childFree = Math.round((SUPPLIERS.filter((s) => s.childLaborFree).length / SUPPLIERS.length) * 100);
  const atRisk = [...SUPPLIERS].sort((a, b) => b.wastePct - a.wastePct || a.score - b.score).slice(0, 6);

  return (
    <>
      <PageHeader eyebrow="Resumen" title={<>Visor de <em>riesgo</em></>} />

      <div className="grid grid-cols-4 gap-4">
        <Kpi strong label="Proveedores" value={SUPPLIERS.length} hint={`${strategic.length} estratégicos (Pareto 80/20)`} />
        <Kpi label="Score promedio" value={average(SUPPLIERS.map((s) => s.score))} hint="Pilares 50 / 30 / 20" />
        <Kpi label="Merma recibida" value={`${waste} %`} hint={`Meta ${WASTE_TARGET} % · base ${WASTE_BASELINE} %`} />
        <Kpi label="Cadena sin trabajo infantil" value={`${childFree} %`} hint="Autodeclaración verificada" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <Card className="flex flex-col gap-3">
          <SectionTitle>Funnel de 6 etapas</SectionTitle>
          {STAGES.map((st) => (
            <Bar key={st.code} label={`${st.code} · ${st.name}`} value={counts[st.code]} max={SUPPLIERS.length} />
          ))}
          <Link href="/smile/funnel" className="text-app-small font-bold text-olive-700 underline">
            Ver el funnel completo
          </Link>
        </Card>

        <Card className="flex flex-col gap-3">
          <SectionTitle>Merma recibida vs meta</SectionTitle>
          <Bar label="Base histórica" value={WASTE_BASELINE} max={25} display={`${WASTE_BASELINE} %`} tone="warn" />
          <Bar label="Hoy (promedio)" value={waste} max={25} display={`${waste} %`} tone="rose" marks={[{ at: WASTE_TARGET, label: "Meta 8 %" }]} />
          <Bar label="Meta" value={WASTE_TARGET} max={25} display={`${WASTE_TARGET} %`} />
          <p className="text-app-small text-ink-soft">
            La línea vertical marca la meta del {WASTE_TARGET} %. Se ha reducido {Math.round((WASTE_BASELINE - waste) * 10) / 10} puntos frente a la base.
          </p>
        </Card>
      </div>

      <Card className="mt-6">
        <SectionTitle>Proveedores que requieren atención</SectionTitle>
        <table className="w-full text-left text-app-small">
          <thead className="text-ink-soft">
            <tr>
              <th className="py-2">Proveedor</th>
              <th>Municipio</th>
              <th>Segmento</th>
              <th>Etapa</th>
              <th className="text-right">Score</th>
              <th className="text-right">Merma</th>
            </tr>
          </thead>
          <tbody>
            {atRisk.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <td className="py-2">
                  <Link href={`/smile/proveedores/${s.id}`} className="font-bold text-olive-800 underline">
                    {s.farm}
                  </Link>
                  <span className="block text-ink-soft">{s.rep}</span>
                </td>
                <td>{s.municipality}</td>
                <td><SegmentBadge segment={s.segment} /></td>
                <td><StageBadge stage={s.stage} /></td>
                <td className="text-right tabular-nums">{s.score}</td>
                <td className="text-right font-bold tabular-nums">{s.wastePct} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <DemoNote />
    </>
  );
}
