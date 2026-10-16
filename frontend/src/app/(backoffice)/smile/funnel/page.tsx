import { Card } from "@/components/ui";
import { STAGES, SUPPLIERS, average, stageCounts } from "@/mocks/smile";
import { Bar, DemoNote, Kpi, PageHeader, SectionTitle } from "../_ui/kit";

export const metadata = { title: "Funnel" };

export default function FunnelPage() {
  const counts = stageCounts();
  const reached = STAGES.map((st, i) => STAGES.slice(i).reduce((n, x) => n + counts[x.code], 0));
  const strategic = SUPPLIERS.filter((s) => s.segment === "ESTRATEGICO");

  return (
    <>
      <PageHeader eyebrow="Funnel" title={<>Funnel de <em>6 etapas</em></>} />
      <div className="grid grid-cols-3 gap-4">
        <Kpi strong label="Candidatos y preferentes" value={counts.E5 + counts.E6} hint="Etapas E5 y E6" />
        <Kpi label="En adopción (E4)" value={counts.E4} hint="Registran en el Mini ERP" />
        <Kpi label="Score estratégicos" value={average(strategic.map((s) => s.score))} hint={`${strategic.length} proveedores`} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <Card className="flex flex-col gap-3">
          <SectionTitle>Proveedores en cada etapa</SectionTitle>
          {STAGES.map((st) => (
            <div key={st.code}>
              <Bar label={`${st.code} · ${st.name}`} value={counts[st.code]} max={SUPPLIERS.length} />
              <p className="ml-[11.75rem] text-app-caption text-ink-soft">{st.hint}</p>
            </div>
          ))}
        </Card>
        <Card className="flex flex-col gap-3">
          <SectionTitle>Han alcanzado al menos la etapa</SectionTitle>
          {STAGES.map((st, i) => (
            <Bar
              key={st.code}
              label={`${st.code} o más`}
              value={reached[i] ?? 0}
              max={SUPPLIERS.length}
              tone="rose"
              display={`${Math.round(((reached[i] ?? 0) / SUPPLIERS.length) * 100)} %`}
            />
          ))}
          <p className="text-app-small text-ink-soft">
            La etapa se recalcula cada cuatrimestre con la autoevaluación, las recepciones y el uso de la app (S-08).
          </p>
        </Card>
      </div>
      <DemoNote />
    </>
  );
}
