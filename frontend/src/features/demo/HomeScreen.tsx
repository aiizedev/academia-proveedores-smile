import { CriticalAlert } from "@/components/ui";
import { formatCOP, formatNumber } from "@/lib/format";
import { DEMO_FARM, KPIS, LOTS, RECOGNITIONS } from "@/mocks/app";
import { DemoNote, PrimaryLink, ScreenTitle, Stat, TextLink, day } from "./parts";

/* /app · HU-ERP-09, HU-TRZ-05: KPIs del mes, lote bloqueado y Flores. */
export function HomeScreen() {
  const margin = Math.round(((KPIS.salesCop - KPIS.costsCop) / KPIS.salesCop) * 1000) / 10;
  const blocked = LOTS.find((l) => l.status === "bloqueado");
  return (
    <section className="flex flex-col gap-5">
      <ScreenTitle eyebrow={DEMO_FARM.name} intro={`${DEMO_FARM.owner} · ${KPIS.monthLabel}`}>
        Su finca <em>hoy</em>
      </ScreenTitle>
      <div className="grid grid-cols-2 gap-3">
        <Stat strong label="Ventas del mes" value={formatCOP(KPIS.salesCop)} />
        <Stat label="Costos del mes" value={formatCOP(KPIS.costsCop)} />
        <Stat label="Margen" value={`${formatNumber(margin, 1)} %`} />
        <Stat label="Inventario" value={`${formatNumber(KPIS.inventoryKg)} kg`} hint={`Merma ${formatNumber(KPIS.wastePct, 1)} %`} />
      </div>
      {blocked ? (
        <CriticalAlert title={`Lote ${blocked.code} bloqueado`} action={<TextLink href="/app/lotes">Ver lotes</TextLink>}>
          {blocked.product}: no coseche antes del {day(blocked.safeOn)} por el período de carencia.
        </CriticalAlert>
      ) : null}
      <div className="flex items-center justify-between rounded-card border border-line bg-white p-4">
        <span className="font-bold">Sus reconocimientos</span>
        <span className="text-app-body">
          <strong className="font-display text-app-h3">{RECOGNITIONS.flowers}</strong> Flores · <strong className="font-display text-app-h3">{RECOGNITIONS.faces}</strong> Carita
        </span>
      </div>
      <PrimaryLink href="/app/erp/ventas">Registrar venta</PrimaryLink>
      <DemoNote />
    </section>
  );
}
