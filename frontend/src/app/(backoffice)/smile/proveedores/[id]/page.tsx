import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, Chip, LevelBadge, type Level } from "@/components/ui";
import { AXES, STAGE_LABEL, SUPPLIERS, formatCop, supplierById } from "@/mocks/smile";
import { Bar, DemoNote, Kpi, PageHeader, SectionTitle, SegmentBadge, StageBadge } from "../../_ui/kit";

export const metadata = { title: "Expediente" };

export function generateStaticParams() {
  return SUPPLIERS.map((s) => ({ id: s.id }));
}

const level = (score: number): Level => (score >= 75 ? "avanzado" : score >= 40 ? "desarrollo" : "inicial");
const axisName = (code: string) => AXES.find((a) => a.code === code)?.name ?? code;

export default async function ExpedientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = supplierById(id);
  if (!s) notFound();

  return (
    <>
      <Link href="/smile/proveedores" className="text-app-small font-bold text-olive-700 underline">
        ← Proveedores
      </Link>
      <PageHeader eyebrow={`Expediente · ${s.nit}`} title={<>{s.farm}</>}>
        <div className="flex items-center gap-2">
          <SegmentBadge segment={s.segment} />
          <StageBadge stage={s.stage} />
        </div>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4">
        <Kpi strong label="Score total" value={s.score} hint={STAGE_LABEL[s.stage]} />
        <Kpi label="P1 · Sostenibilidad (50 %)" value={s.pillars.p1} hint="Autoevaluación cuatrimestral" />
        <Kpi label="P2 · Desempeño (30 %)" value={s.pillars.p2} hint={`Merma ${s.wastePct} %`} />
        <Kpi label="P3 · Fidelización (20 %)" value={s.pillars.p3} hint={`${s.finance.weeksWithRecords} semanas con registros`} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-6">
        <Card className="flex flex-col gap-2">
          <SectionTitle>Ficha</SectionTitle>
          <dl className="grid grid-cols-[8rem_1fr] gap-y-2 text-app-small">
            <dt className="text-ink-soft">Representante</dt><dd>{s.rep}</dd>
            <dt className="text-ink-soft">Persona</dt><dd>{s.personType === "juridica" ? "Jurídica" : "Natural"}</dd>
            <dt className="text-ink-soft">Ubicación</dt><dd>{s.municipality}, {s.department}</dd>
            <dt className="text-ink-soft">Categoría</dt><dd>{s.category} · {s.size}</dd>
            <dt className="text-ink-soft">Contacto</dt><dd>{s.phone} · {s.channel}</dd>
            <dt className="text-ink-soft">Correo</dt><dd>{s.email}</dd>
          </dl>
        </Card>

        <Card className="col-span-2 flex flex-col gap-3">
          <SectionTitle>Diagnóstico por eje</SectionTitle>
          {AXES.map((a) => (
            <div key={a.code} className="flex items-center gap-3">
              <div className="flex-1"><Bar label={a.name} value={s.axes[a.code]} /></div>
              <LevelBadge level={level(s.axes[a.code])} />
            </div>
          ))}
        </Card>

        <Card className="col-span-2 flex flex-col gap-3">
          <SectionTitle>Plan de mejora · 3 metas</SectionTitle>
          {s.plan.map((g) => (
            <div key={g.axis} className="flex items-start gap-3 border-t border-line pt-3 first:border-0 first:pt-0">
              <Chip priority={g.done ? "completa" : g.priority} />
              <div>
                <p className="font-bold">{axisName(g.axis)}</p>
                <p className="text-app-small text-ink-soft">{g.step}</p>
              </div>
            </div>
          ))}
        </Card>

        <Card className="flex flex-col gap-2">
          <SectionTitle>Resumen financiero</SectionTitle>
          <p className="text-app-caption text-ink-soft">Solo agregados del cuatrimestre: Smile no ve transacciones individuales (Habeas Data).</p>
          <dl className="grid grid-cols-[7rem_1fr] gap-y-2 text-app-small">
            <dt className="text-ink-soft">Ventas</dt><dd className="tabular-nums">{formatCop(s.finance.salesCop)}</dd>
            <dt className="text-ink-soft">Costos</dt><dd className="tabular-nums">{formatCop(s.finance.costsCop)}</dd>
            <dt className="text-ink-soft">Margen</dt><dd className="font-bold tabular-nums">{s.finance.marginPct} %</dd>
            <dt className="text-ink-soft">Merma</dt><dd className="tabular-nums">{s.wastePct} %</dd>
          </dl>
        </Card>

        <Card className="flex flex-col gap-2">
          <SectionTitle>Bóveda documental</SectionTitle>
          {s.documents.map((d) => (
            <div key={d.name} className="flex items-center justify-between gap-2 text-app-small">
              <span>{d.name}</span>
              <span className={d.status === "Verificado" ? "font-bold text-olive-700" : d.status === "Vencido" ? "font-bold text-rose-700" : "text-ink-soft"}>
                {d.status}
              </span>
            </div>
          ))}
        </Card>

        <Card className="flex flex-col gap-2">
          <SectionTitle>Visitas y capacitaciones</SectionTitle>
          {s.visits.length === 0 ? <p className="text-app-small text-ink-soft">Sin visitas registradas.</p> : null}
          {s.visits.map((v) => (
            <div key={v.date} className="text-app-small">
              <p className="font-bold">{v.date} · {v.kind} · {v.ally}</p>
              <p className="text-ink-soft">{v.note}</p>
            </div>
          ))}
        </Card>

        <Card className="flex flex-col gap-2">
          <SectionTitle>Reconocimientos</SectionTitle>
          <p className="text-app-small">🌸 {s.recognitions.flowers} Flores · 🙂 {s.recognitions.smiles} Caritas Felices</p>
          {s.recognitions.badges.map((b) => (
            <span key={b} className="w-fit rounded-pill bg-olive-800 px-3 py-1 text-app-caption font-bold text-cream">{b}</span>
          ))}
          {s.bpaIca ? <p className="text-app-small font-bold text-olive-700">Cumple BPA ICA (Res. 30021)</p> : null}
        </Card>

        <Card className="col-span-3 flex flex-col gap-2">
          <SectionTitle>Mensajes</SectionTitle>
          {s.messages.map((m) => (
            <div key={`${m.date}-${m.from}`} className={m.from === "Smile" ? "max-w-[60%] rounded-card bg-olive-50 p-3" : "ml-auto max-w-[60%] rounded-card bg-rose-100 p-3"}>
              <p className="text-app-caption font-bold text-ink-soft">{m.from} · {m.date}</p>
              <p className="text-app-small">{m.text}</p>
            </div>
          ))}
        </Card>
      </div>
      <DemoNote />
    </>
  );
}
