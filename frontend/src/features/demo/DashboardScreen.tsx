"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BarList, ChartCard, LineChart, ProgressRing, StatTile, lineTable } from "@/components/charts";
import { Icon, type IconName } from "@/components/icons";
import { CountUp, Reveal, Skeleton, Stagger, StaggerItem } from "@/components/motion";
import { popVariants, T } from "@/design/motion-react";
import { formatCOP, formatNumber } from "@/lib/format";
import { DASHBOARD, type DashTile } from "@/mocks/app";
import { DemoNote, ScreenTitle, SectionTitle, TextLink } from "./parts";

/* /app/tablero · SPEC-DASH: tablero del proveedor. Indicadores del mes con
   tendencia, cercanía a la certificación BPA, beneficio económico propio,
   alertas y margen por semana. Datos de demostración (src/mocks/app.ts). */
const TILE_ICON: Record<DashTile["id"], IconName> = { ventas: "trend", costos: "coins", margen: "chart", inventario: "box" };
const shortCop = (n: number) => (n >= 1_000_000 ? `$ ${formatNumber(n / 1_000_000, 2)} M` : formatCOP(Math.round(n)));
const formatTile = (t: DashTile) => (n: number) => (t.unit === "cop" ? shortCop(n) : t.unit === "pct" ? `${formatNumber(n, 1)} %` : `${formatNumber(Math.round(n))} kg`);

/** Los datos "llegan": breve esqueleto para que la entrada se sienta viva. */
function useArrived(ms = 450) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setReady(true), ms);
    return () => clearTimeout(id);
  }, [ms]);
  return ready;
}

function AlertPill({ icon, title, detail, tone = "light", index }: { icon: IconName; title: string; detail: string; tone?: "light" | "rose" | "strong"; index: number }) {
  const styles = {
    light: "border border-line bg-white",
    rose: "border border-rose-300 bg-rose-100",
    strong: "grain bg-olive-800 text-cream",
  }[tone];
  return (
    <motion.li
      className={`relative flex items-center gap-3 overflow-hidden rounded-button p-3 ${styles}`}
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ ...T.enter, delay: index * 0.1 }}
    >
      <motion.span
        variants={popVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className={`relative z-[2] grid size-11 shrink-0 place-items-center rounded-full ${tone === "strong" ? "bg-rose-500 text-olive-900" : tone === "rose" ? "bg-white text-rose-700" : "bg-rose-100 text-olive-800"}`}
      >
        <Icon name={icon} size="1.3rem" />
      </motion.span>
      <div className="relative z-[2] flex flex-col">
        <span className="font-bold leading-tight">{title}</span>
        <span className={`text-app-caption ${tone === "strong" ? "text-olive-300" : "text-ink-soft"}`}>{detail}</span>
      </div>
    </motion.li>
  );
}

export function DashboardScreen() {
  const ready = useArrived();
  const d = DASHBOARD;
  const totalBenefit = d.benefits.reduce((s, b) => s + b.value, 0);

  return (
    <section className="flex flex-col gap-6">
      <ScreenTitle eyebrow={`Mi tablero · ${d.monthLabel}`} title="Lo que gana mejorando" emphasis={["mejorando"]} intro="Sus números del mes y lo que le dejan las buenas prácticas." />

      {ready ? (
        <Stagger className="grid grid-cols-2 gap-3" gap={0.07}>
          {d.tiles.map((t, i) => (
            <StaggerItem key={t.id}>
              <StatTile
                label={t.label}
                value={t.value}
                format={formatTile(t)}
                delta={{ value: t.delta, unit: t.deltaUnit, label: t.deltaLabel }}
                goodWhen={t.goodWhen}
                trend={t.trend}
                tone={i === 0 ? "strong" : "light"}
                size="sm"
                icon={<Icon name={TILE_ICON[t.id]} size="1.05rem" />}
              />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <div className="grid grid-cols-2 gap-3" aria-busy="true">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-[9.6rem]" />
          ))}
        </div>
      )}

      <Reveal className="flex flex-col gap-4 rounded-card border border-line bg-white p-4">
        <div className="flex items-center gap-4">
          <ProgressRing value={d.bpaProximity} size={104} stroke={10} label="Cercanía a la certificación BPA" sublabel="BPA" />
          <p className="font-display text-[1.3rem] leading-[1.1] tracking-[-0.02em]">
            Está a <em className="text-rose-700 [font-variation-settings:var(--fv-accent)]">{d.bpaProximity} %</em> de la certificación BPA del ICA
          </p>
        </div>
        <div className="flex flex-col gap-2 border-t border-dashed border-line pt-3">
          <p className="text-app-caption font-bold text-ink-soft">
            {d.bpaProximity >= 100 ? "Siguientes pasos para obtener el sello" : `Le faltan ${d.bpaMissing.length} requisitos`}
          </p>
          <ul className="flex flex-col gap-1.5 text-app-small">
            {d.bpaMissing.map((m, i) => (
              <motion.li key={m} className="flex items-start gap-2" initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ ...T.enter, delay: 0.3 + i * 0.08 }}>
                <span aria-hidden className="mt-[0.5rem] size-1.5 shrink-0 rounded-full bg-rose-500" />
                {m}
              </motion.li>
            ))}
          </ul>
        </div>
      </Reveal>

      <Reveal>
        <ChartCard
          title="Beneficio económico propio"
          subtitle={`Ahorro en agroquímicos, mermas evitadas y bonificación · ${formatCOP(totalBenefit)} en el ciclo`}
          className="!p-4"
          table={{ columns: [{ key: "c", label: "Concepto" }, { key: "v", label: "Valor", numeric: true }], rows: d.benefits.map((b) => ({ c: b.label, v: formatCOP(b.value) })) }}
        >
          <BarList data={d.benefits.map((b, i) => ({ id: b.id, label: b.label, value: b.value, display: shortCop(b.value).replace("$ ", "$"), hint: b.hint, highlight: i === 2 }))} />
          <p className="mt-3 text-app-caption text-ink-soft">La barra resaltada es la bonificación de Smile; las otras son ahorro en su finca.</p>
        </ChartCard>
      </Reveal>

      <div className="flex flex-col gap-3">
        <SectionTitle>Para tener en cuenta</SectionTitle>
        <ul className="flex flex-col gap-2">
          <AlertPill index={0} tone="rose" icon="clock" title={`Faltan ${d.alerts.cutDays} días para liberar el corte`} detail={`${d.alerts.cutProduct} · lote ${d.alerts.cutLot}`} />
          <AlertPill index={1} tone="strong" icon="star" title={`¡Nueva insignia: ${d.alerts.badgeName}!`} detail="Por separar sus residuos todo el mes." />
          <AlertPill
            index={2}
            icon="flower"
            title={`${d.alerts.flowers} de ${d.alerts.flowersGoal} Flores del año`}
            detail={`Una Flor más y gana la beca de formación SENA.`}
          />
        </ul>
      </div>

      <Reveal>
        <ChartCard title="Margen neto por semana" subtitle="Porcentaje de lo vendido que le queda" className="!p-4" table={lineTable(d.marginWeeks, [{ id: "m", label: "Margen", color: "var(--chart-series)", values: d.marginSeries }], " %")}>
          <LineChart labels={d.marginWeeks} series={[{ id: "m", label: "Margen", color: "var(--chart-series)", values: d.marginSeries }]} unit=" %" height={200} yMax={80} references={[{ value: d.marginGoal, label: `Meta ${d.marginGoal} %` }]} />
        </ChartCard>
      </Reveal>

      <Reveal className="flex items-center justify-between gap-3 rounded-card border border-line bg-white p-4">
        <div>
          <p className="text-app-caption text-ink-soft">Mermas del mes</p>
          <p className="font-display text-[1.6rem] leading-none tracking-[-0.03em]">
            <CountUp value={4.1} decimals={1} suffix=" %" />
          </p>
        </div>
        <TextLink href="/app/erp">Ir al Mini ERP</TextLink>
      </Reveal>
      <DemoNote />
    </section>
  );
}
