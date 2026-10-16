import { Card } from "@/components/ui";
import { AXES, SUPPLIERS, average } from "@/mocks/smile";
import { Bar, DemoNote, Kpi, PageHeader, SectionTitle } from "../_ui/kit";

export const metadata = { title: "Consola ESG" };

const pct = (n: number) => Math.round((n / SUPPLIERS.length) * 100);

export default function EsgPage() {
  const childFree = SUPPLIERS.filter((s) => s.childLaborFree).length;
  const bpa = SUPPLIERS.filter((s) => s.bpaIca).length;
  const frameworks = [
    { name: "ISO 14001 / GRI", value: average(SUPPLIERS.map((s) => (s.axes.residuos + s.axes.carbono) / 2)) },
    { name: "B Corp", value: average(SUPPLIERS.map((s) => s.pillars.p1)) },
    { name: "TCFD / SASB (carbono)", value: average(SUPPLIERS.map((s) => s.axes.carbono)) },
    { name: "ODS 8 · trabajo decente", value: average(SUPPLIERS.map((s) => (s.axes.infantil + s.axes.ddhh) / 2)) },
  ];

  return (
    <>
      <PageHeader eyebrow="Consola ESG" title={<>Cumplimiento <em>ESG</em> de la cadena</>} />
      <div className="grid grid-cols-3 gap-4">
        <Kpi strong label="Libre de trabajo infantil" value={`${pct(childFree)} %`} hint={`${childFree} de ${SUPPLIERS.length} proveedores`} />
        <Kpi label="Con BPA ICA" value={`${pct(bpa)} %`} hint="Res. ICA 30021 de 2017" />
        <Kpi label="Sostenibilidad promedio (P1)" value={average(SUPPLIERS.map((s) => s.pillars.p1))} hint="Autoevaluación del cuatrimestre" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-6">
        <Card className="flex flex-col gap-3">
          <SectionTitle>Promedio por eje</SectionTitle>
          {AXES.map((a) => (
            <Bar key={a.code} label={a.name} value={average(SUPPLIERS.map((s) => s.axes[a.code]))} />
          ))}
        </Card>
        <Card className="flex flex-col gap-3">
          <SectionTitle>Avance frente a marcos</SectionTitle>
          {frameworks.map((f) => (
            <Bar key={f.name} label={f.name} value={f.value} tone="rose" />
          ))}
          <p className="text-app-small text-ink-soft">Cada pregunta del banco mapea a B Corp, ISO 14001/GRI, TCFD/SASB y normativa colombiana.</p>
        </Card>
      </div>
      <DemoNote />
    </>
  );
}
