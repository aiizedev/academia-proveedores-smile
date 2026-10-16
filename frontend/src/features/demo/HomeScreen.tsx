"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkline } from "@/components/charts";
import { Icon } from "@/components/icons";
import { CountUp, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { ButtonLink, CriticalAlert } from "@/components/ui";
import { popVariants, T } from "@/design/motion-react";
import { formatCOP, formatNumber } from "@/lib/format";
import { DASHBOARD, DEMO_FARM, KPIS, LOTS, MESSAGES, RECOGNITIONS } from "@/mocks/app";
import { DemoNote, NavCard, ScreenTitle, SectionTitle, Stat, TextLink, day } from "./parts";

/* /app · HU-ERP-09, HU-TRZ-05: saludo, ventas del mes, lote bloqueado,
   accesos rápidos y Flores. */
const daysUntil = (iso: string) => Math.max(0, Math.ceil((new Date(`${iso}T00:00:00-05:00`).getTime() - Date.now()) / 86_400_000));

export function HomeScreen() {
  const margin = Math.round(((KPIS.salesCop - KPIS.costsCop) / KPIS.salesCop) * 1000) / 10;
  const blocked = LOTS.find((l) => l.status === "bloqueado");
  const unread = MESSAGES.filter((m) => m.unread).length;
  const sales = DASHBOARD.tiles.find((t) => t.id === "ventas")!;

  return (
    <section className="flex flex-col gap-6">
      <ScreenTitle eyebrow={DEMO_FARM.name} title="Buen día, María Fernanda" emphasis={["día"]} intro={`${KPIS.monthLabel} · ${DEMO_FARM.place.split(" · ")[1] ?? ""}`} />

      <Reveal>
        <Link href="/app/tablero" className="grain group relative block overflow-hidden rounded-card bg-olive-800 p-5 text-cream transition-shadow duration-[var(--dur-m)] hover:shadow-lift">
          <svg aria-hidden viewBox="0 0 100 100" className="absolute -right-8 -bottom-10 size-40 text-olive-700">
            <path d="M10 90C10 45 38 14 90 10c0 52-31 80-80 80Z" fill="currentColor" />
          </svg>
          <div className="relative z-[2] flex items-start justify-between gap-3">
            <div>
              <p className="text-app-caption font-semibold text-olive-300">Ventas de {KPIS.monthLabel.toLowerCase()}</p>
              <p className="mt-2 font-display text-[2.4rem] leading-none tracking-[-0.04em]">
                <CountUp value={KPIS.salesCop} format={(n) => formatCOP(Math.round(n))} />
              </p>
            </div>
            <span className="grid size-10 place-items-center rounded-full bg-rose-500 text-olive-900 transition-[rotate] duration-[var(--dur-m)] group-hover:-rotate-45">
              <Icon name="arrow" size="1.1rem" />
            </span>
          </div>
          <div className="relative z-[2] mt-5 flex items-end justify-between gap-3">
            <div className="flex gap-2 whitespace-nowrap">
              <span className="rounded-pill bg-[var(--on-strong-tint-bg)] px-3 py-1 text-app-caption font-bold">Margen {formatNumber(margin, 1)} %</span>
              <span className="rounded-pill bg-rose-500 px-3 py-1 text-app-caption font-bold text-olive-900">▲ {formatNumber(sales.delta, 1)} %</span>
            </div>
            <Sparkline values={sales.trend} width={72} color="var(--rose-500)" />
          </div>
        </Link>
      </Reveal>

      <div className="grid grid-cols-2 gap-3">
        <Stat label="Costos del mes" icon="coins" value={<CountUp value={KPIS.costsCop} format={(n) => formatCOP(Math.round(n))} />} />
        <Stat label="Inventario" icon="box" value={<CountUp value={KPIS.inventoryKg} suffix=" kg" />} hint={`Merma ${formatNumber(KPIS.wastePct, 1)} %`} />
      </div>

      {blocked ? (
        <CriticalAlert icon="clock" title={`Lote ${blocked.code}: faltan ${daysUntil(blocked.safeOn)} días`} action={<TextLink href="/app/lotes">Ver mis lotes</TextLink>}>
          {blocked.product}: no coseche antes del {day(blocked.safeOn)} por el período de carencia.
        </CriticalAlert>
      ) : null}

      <div className="flex flex-col gap-3">
        <SectionTitle>Accesos rápidos</SectionTitle>
        <Stagger inView className="grid grid-cols-2 gap-3" gap={0.06}>
          <StaggerItem className="col-span-2">
            <NavCard strong href="/app/autoevaluacion?nueva=1" icon="check" title="Autoevaluación" detail="5 minutos · una pregunta por pantalla" badge="Ciclo 2026-C3" />
          </StaggerItem>
          <StaggerItem>
            <NavCard href="/app/diagnostico" icon="chart" title="Diagnóstico" detail="Su puntaje por eje" />
          </StaggerItem>
          <StaggerItem>
            <NavCard href="/app/plan" icon="book" title="Mis guías" detail="3 metas en curso" />
          </StaggerItem>
          <StaggerItem>
            <NavCard href="/app/erp" icon="coins" title="Mini ERP" detail="Ventas y costos" />
          </StaggerItem>
          <StaggerItem>
            <NavCard href="/app/lotes" icon="bpa" title="Lotes" detail="Carencia y rótulos" />
          </StaggerItem>
          <StaggerItem>
            <NavCard href="/app/score" icon="star" title="Mi score" detail="71 de 100 · E3" />
          </StaggerItem>
          <StaggerItem>
            <NavCard href="/app/mensajes" icon="chat" title="Mensajes" detail="De Calidad y Compras" badge={unread ? `${unread} nuevo` : undefined} />
          </StaggerItem>
          <StaggerItem>
            <NavCard href="/app/ficha" icon="doc" title="Mi ficha" detail="Datos de la finca" />
          </StaggerItem>
          <StaggerItem>
            <NavCard href="/app/aprender" icon="play" title="Aprender" detail="Videos de 3 a 5 min" />
          </StaggerItem>
        </Stagger>
      </div>

      <Reveal className="flex items-center justify-between gap-4 rounded-card border border-rose-300 bg-rose-100 p-4">
        <div className="flex flex-col">
          <span className="font-display text-[1.25rem] leading-none tracking-[-0.02em]">Sus reconocimientos</span>
          <span className="mt-1 text-app-caption text-ink-soft">
            {RECOGNITIONS.flowers} Flores y {RECOGNITIONS.faces} Carita este ciclo
          </span>
        </div>
        <motion.div className="flex gap-1" initial="hidden" whileInView="show" viewport={{ once: true }} variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }}>
          {Array.from({ length: 3 }, (_, i) => (
            <motion.span key={i} variants={popVariants} className={i < RECOGNITIONS.flowers ? "grid size-10 place-items-center rounded-full bg-rose-500 text-olive-900" : "grid size-10 place-items-center rounded-full border-[1.5px] border-dashed border-rose-600 text-rose-600"}>
              <Icon name="flower" size="1.3rem" />
            </motion.span>
          ))}
        </motion.div>
      </Reveal>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={T.enter}>
        <ButtonLink href="/app/erp/ventas" icon={<Icon name="plus" />}>
          Registrar venta
        </ButtonLink>
      </motion.div>
      <DemoNote />
    </section>
  );
}
