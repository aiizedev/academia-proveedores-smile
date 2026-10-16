"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { CountUp, GrowBar, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { Button, ButtonLink, Card, Chip, QrMark } from "@/components/ui";
import { popVariants, T } from "@/design/motion-react";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { BENEFITS, CLIPS, DEMO_FARM, KPIS, LOTS, MESSAGES, RECEPTIONS, RECOGNITIONS, SCORE, type Lot } from "@/mocks/app";
import { DemoNote, NavCard, ScreenTitle, SectionTitle, TextLink, day } from "./parts";

/* Pantallas de demo (POC) con datos fijos de src/mocks/app.ts. */

const daysUntil = (iso: string) => Math.max(0, Math.ceil((new Date(`${iso}T00:00:00-05:00`).getTime() - Date.now()) / 86_400_000));

/* ---------- Mini ERP ---------- */
export function ErpHubScreen() {
  const links: Array<[string, IconName, string, string]> = [
    ["/app/erp/ventas", "trend", "Ventas", "Registre lo que vende en menos de un minuto."],
    ["/app/erp/costos", "coins", "Costos", "Insumos, mano de obra, transporte y empaques."],
    ["/app/erp/mermas", "residuos", "Mermas", "Lo que se pierde y por qué."],
    ["/app/erp/inventario", "box", "Inventario", "Lo que tiene listo para vender."],
  ];
  return (
    <section className="flex flex-col gap-6">
      <ScreenTitle eyebrow="Mini ERP" title="Ventas y costos" emphasis={["costos"]} intro={`${KPIS.monthLabel}: lo que entra, lo que sale y lo que queda.`} />
      <Stagger className="grid grid-cols-2 gap-3" gap={0.07}>
        {links.map(([href, icon, title, detail], i) => (
          <StaggerItem key={href} className={i === 0 ? "col-span-2" : undefined}>
            <NavCard href={href} icon={icon} title={title} detail={detail} strong={i === 0} />
          </StaggerItem>
        ))}
        <StaggerItem>
          <NavCard href="/app/tablero" icon="grid" title="Mi tablero" detail="Margen y beneficio" />
        </StaggerItem>
      </Stagger>
      <DemoNote />
    </section>
  );
}

/* ---------- Lotes ---------- */
function Countdown({ lot }: { lot: Lot }) {
  const total = lot.lastApplication.withholdingDays;
  const left = daysUntil(lot.safeOn);
  const pct = Math.min(100, ((total - left) / total) * 100);
  const [seconds, setSeconds] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setSeconds(Math.max(0, Math.floor((new Date(`${lot.safeOn}T00:00:00-05:00`).getTime() - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lot.safeOn]);
  const parts = seconds === null ? null : { d: Math.floor(seconds / 86400), h: Math.floor((seconds % 86400) / 3600), m: Math.floor((seconds % 3600) / 60), s: seconds % 60 };
  return (
    <div role="timer" aria-label={`Faltan ${left} días para cosechar sin riesgo`} className="flex flex-col gap-3 rounded-button bg-rose-100 p-4">
      <p className="text-app-caption font-bold text-rose-700">Cosecha segura en</p>
      <div className="grid grid-cols-4 gap-2 text-center">
        {(["d", "h", "m", "s"] as const).map((k) => (
          <div key={k} className="rounded-m bg-white py-2">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={parts ? parts[k] : "x"} className="block font-display text-[1.6rem] leading-none tabular-nums" initial={{ y: "-60%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "60%", opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                {parts ? String(parts[k]).padStart(2, "0") : "--"}
              </motion.span>
            </AnimatePresence>
            <span className="text-app-chip font-bold uppercase text-ink-soft">{{ d: "días", h: "horas", m: "min", s: "seg" }[k]}</span>
          </div>
        ))}
      </div>
      <div className="h-2 overflow-hidden rounded-pill bg-white">
        <motion.div className="h-full origin-left rounded-pill bg-rose-600" style={{ width: `${pct}%` }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={T.bar} />
      </div>
      <p className="text-app-caption text-ink">
        Carencia de {total} días desde el {day(lot.lastApplication.date)}. Fecha segura: <strong>{day(lot.safeOn)}</strong>.
      </p>
    </div>
  );
}

function LotLabel({ lot }: { lot: Lot }) {
  if (!lot.label) return null;
  return (
    <motion.figure
      className="relative overflow-hidden rounded-m border-[1.5px] border-dashed border-olive-300 bg-white p-4"
      initial={{ rotate: -2, y: 20, opacity: 0 }}
      whileInView={{ rotate: 0, y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    >
      <span aria-hidden className="absolute top-1/2 -left-3 size-6 -translate-y-1/2 rounded-full border-[1.5px] border-dashed border-olive-300 bg-cream" />
      <span aria-hidden className="absolute top-1/2 -right-3 size-6 -translate-y-1/2 rounded-full border-[1.5px] border-dashed border-olive-300 bg-cream" />
      <div className="flex items-center justify-between border-b border-line pb-2">
        <span className="brand text-[1.2rem] leading-none">
          smile<span className="dot">.</span>
        </span>
        <span className="text-app-chip font-extrabold uppercase tracking-[var(--tracking-caps)] text-olive-600">Rótulo de lote</span>
      </div>
      <div className="mt-3 grid grid-cols-[auto_1fr] items-center gap-4">
        <div className="rounded-s border border-line p-1">
          <QrMark text={lot.label.qrText} size={96} />
        </div>
        <dl className="grid gap-1 text-app-caption">
          <div><dt className="text-ink-soft">Producto</dt><dd className="font-display text-[1.15rem] leading-tight">{lot.product}</dd></div>
          <div><dt className="text-ink-soft">Finca</dt><dd className="font-bold">{DEMO_FARM.name}</dd></div>
          <div><dt className="text-ink-soft">Cosecha</dt><dd className="font-bold">{day(lot.harvestedOn)}</dd></div>
        </dl>
      </div>
      <figcaption className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2">
        <span className="min-w-0 truncate font-mono text-[0.68rem]">{lot.label.code}</span>
        <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-pill bg-olive-800 px-2 py-0.5 text-app-chip font-extrabold uppercase text-cream">
          <Icon name="check" size="0.8rem" /> Carencia ok
        </span>
      </figcaption>
    </motion.figure>
  );
}

export function LotsScreen() {
  return (
    <section className="flex flex-col gap-6">
      <ScreenTitle eyebrow="Trazabilidad" title="Sus lotes" emphasis={["lotes"]} intro="Cada aplicación de agroquímico fija una fecha segura para cosechar." />
      {LOTS.map((lot, i) => (
        <Reveal key={lot.code} delay={i * 0.08}>
          <Card className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className={cn("grid size-11 place-items-center rounded-full", lot.status === "bloqueado" ? "bg-rose-100 text-rose-700" : "bg-olive-800 text-cream")}>
                  <Icon name={lot.status === "bloqueado" ? "lock" : "bpa"} size="1.3rem" />
                </span>
                <div>
                  <p className="font-display text-[1.3rem] leading-none tracking-[-0.02em]">{lot.product}</p>
                  <p className="mt-1 text-app-caption text-ink-soft">
                    {lot.code} · {lot.plot}
                  </p>
                </div>
              </div>
              <motion.span
                className={lot.status === "bloqueado" ? "rounded-pill bg-rose-700 px-3 py-1 text-app-chip font-extrabold uppercase text-white" : "rounded-pill bg-olive-100 px-3 py-1 text-app-chip font-extrabold uppercase text-olive-800"}
                initial={lot.status === "bloqueado" ? { x: -6 } : false}
                whileInView={{ x: [-6, 6, -3, 0] }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {lot.status === "bloqueado" ? "Bloqueado" : "Liberado"}
              </motion.span>
            </div>
            <p className="flex gap-2 text-app-small">
              <span className="text-olive-600"><Icon name="calendar" size="1.1rem" /></span>
              Última aplicación: {lot.lastApplication.product}, {day(lot.lastApplication.date)}.
            </p>
            {lot.status === "bloqueado" ? <Countdown lot={lot} /> : <LotLabel lot={lot} />}
            {lot.label ? (
              <Button variant="ghost" icon={<Icon name="print" />} onClick={() => window.print()}>
                Imprimir rótulo
              </Button>
            ) : null}
          </Card>
        </Reveal>
      ))}
      <p className="text-app-caption text-ink-soft">El QR definitivo se genera en el teléfono (R2). El código del lote siempre va en texto.</p>
      <DemoNote />
    </section>
  );
}

/* ---------- Score ---------- */
const STAGES = [
  { code: "E1", name: "Registro" },
  { code: "E2", name: "Diagnóstico" },
  { code: "E3", name: "Plan en curso" },
  { code: "E4", name: "Evidencias" },
  { code: "E5", name: "BPA" },
  { code: "E6", name: "Aliado" },
];

export function ScoreScreen() {
  const current = STAGES.findIndex((s) => s.code === SCORE.stage.code);
  return (
    <section className="flex flex-col gap-6">
      <ScreenTitle eyebrow="Mi score" title="Su puntaje en Smile" emphasis={["Smile"]} intro="50 % sostenibilidad, 30 % desempeño en recepción y 20 % plan y evidencias." />

      <Reveal className="grain relative overflow-hidden rounded-card bg-olive-800 p-5 text-cream">
        <div className="relative z-[2] flex items-end justify-between gap-3">
          <div>
            <p className="text-app-caption text-olive-300">Score total</p>
            <p className="font-display text-[4.2rem] leading-[0.9] font-[330] tracking-[-0.05em]">
              <CountUp value={SCORE.total} />
              <span className="ml-2 font-body text-app-small tracking-normal text-olive-300">de 100</span>
            </p>
          </div>
          <span className="rounded-pill bg-rose-500 px-3 py-1 text-app-chip font-extrabold uppercase text-olive-900">
            {SCORE.stage.code} · {SCORE.stage.name}
          </span>
        </div>
        <div className="relative z-[2] mt-5 flex h-3 gap-1 overflow-hidden rounded-pill">
          {SCORE.pillars.map((p, i) => (
            <GrowBar
              key={p.name}
              className="block h-full overflow-hidden rounded-pill bg-[var(--on-strong-tint-bg)]"
              trackStyle={{ width: `${p.weight}%` }}
              fillClassName={cn("h-full rounded-pill", ["bg-rose-500", "bg-rose-300", "bg-olive-300"][i])}
              to={p.score / 100}
              delay={0.3 + i * 0.15}
            />
          ))}
        </div>
        <p className="relative z-[2] mt-2 text-app-caption text-olive-300">Cada tramo es un pilar; se llena según su puntaje.</p>
      </Reveal>

      <ul className="flex flex-col gap-3">
        {SCORE.pillars.map((p, i) => (
          <motion.li
            key={p.name}
            className="flex flex-col gap-2 rounded-button border border-line bg-white p-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ...T.enter, delay: i * 0.08 }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold">{p.name}</span>
              <span className="rounded-pill bg-cream-200 px-2 py-0.5 text-app-chip font-extrabold text-ink-soft">{p.weight} %</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-[7px] flex-1 overflow-hidden rounded-pill bg-olive-100">
                <GrowBar className="block h-full" trackStyle={{ width: `${p.score}%` }} fillClassName="h-full rounded-pill bg-olive-600" delay={0.2 + i * 0.1} />
              </div>
              <span className="font-display text-[1.4rem] leading-none tabular-nums">
                <CountUp value={p.score} />
              </span>
            </div>
            <span className="text-app-caption text-ink-soft">{p.why}</span>
          </motion.li>
        ))}
      </ul>

      <div className="flex flex-col gap-3">
        <SectionTitle>Su camino, etapa por etapa</SectionTitle>
        <ol className="relative grid grid-cols-6 gap-1">
          <span aria-hidden className="absolute top-[1.15rem] right-[8%] left-[8%] h-[2px] rounded-pill bg-olive-100" />
          <GrowBar className="absolute top-[1.15rem] left-[8%] block h-[2px]" trackStyle={{ width: `${(current / (STAGES.length - 1)) * 84}%` }} fillClassName="h-full rounded-pill bg-olive-800" ease={[0.87, 0, 0.13, 1]} delay={0.2} />
          {STAGES.map((s, i) => (
            <li key={s.code} className="relative flex flex-col items-center gap-1 text-center" aria-current={i === current ? "step" : undefined}>
              <motion.span
                variants={popVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ ...T.pop, delay: 0.4 + i * 0.12 }}
                className={cn(
                  "relative grid size-[2.3rem] place-items-center rounded-full border-2 border-cream text-app-chip font-extrabold",
                  i < current ? "bg-olive-800 text-cream" : i === current ? "bg-rose-500 text-olive-900 shadow-[var(--halo-rose)]" : "bg-cream-200 text-ink-soft",
                )}
              >
                {i < current ? <Icon name="check" size="1rem" /> : s.code}
              </motion.span>
              <span className={cn("text-[0.62rem] leading-tight font-bold", i === current ? "text-ink" : "text-ink-soft")}>{s.name}</span>
            </li>
          ))}
        </ol>
      </div>

      <Reveal className="flex gap-3 rounded-button bg-rose-100 p-4 text-app-body">
        <span className="text-rose-600">
          <Icon name="sparkle" size="1.4rem" />
        </span>
        <p>
          <strong>Lo que más le sube:</strong> {SCORE.boost}
        </p>
      </Reveal>
      <TextLink href="/app/plan">Ver mi plan</TextLink>
      <DemoNote />
    </section>
  );
}

/* ---------- Recepciones ---------- */
export function ReceptionsScreen() {
  const received = RECEPTIONS.reduce((s, r) => s + r.receivedKg, 0);
  const rejected = RECEPTIONS.reduce((s, r) => s + r.rejectedKg, 0);
  return (
    <section className="flex flex-col gap-6">
      <ScreenTitle eyebrow="Recepciones" title="Sus entregas" emphasis={["entregas"]} intro="Lo que Smile recibió de sus entregas." />
      <div className="grid grid-cols-2 gap-3">
        <Reveal className="grain relative overflow-hidden rounded-card bg-olive-800 p-4 text-cream">
          <p className="relative z-[2] text-app-caption text-olive-300">Recibido</p>
          <p className="relative z-[2] font-display text-[1.8rem] leading-none"><CountUp value={received} suffix=" kg" /></p>
        </Reveal>
        <Reveal delay={0.08} className="rounded-card border border-line bg-white p-4">
          <p className="text-app-caption text-ink-soft">Aceptado</p>
          <p className="font-display text-[1.8rem] leading-none"><CountUp value={((received - rejected) / received) * 100} decimals={1} suffix=" %" /></p>
        </Reveal>
      </div>
      <ul className="flex flex-col gap-3">
        {RECEPTIONS.map((r, i) => {
          const pct = (r.rejectedKg / r.receivedKg) * 100;
          return (
            <motion.li key={r.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...T.enter, delay: i * 0.08 }}>
              <Card className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-bold">
                    <span className="grid size-9 place-items-center rounded-full bg-rose-100 text-olive-800"><Icon name="truck" size="1.1rem" /></span>
                    {r.product}
                  </span>
                  <span className="text-app-caption text-ink-soft">{day(r.date)}</span>
                </div>
                <div className="flex h-2 overflow-hidden rounded-pill bg-olive-100">
                  <GrowBar className="block h-full" trackStyle={{ width: `${100 - pct}%` }} fillClassName="h-full bg-olive-600" delay={0.2} />
                  <span className="h-full bg-rose-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-app-small">
                  Recibidos {formatNumber(r.receivedKg)} kg · rechazados {formatNumber(r.rejectedKg)} kg ({formatNumber(pct, 1)} %)
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {r.cause ? <Chip priority="alta">{r.cause}</Chip> : <Chip priority="completa">Sin rechazo</Chip>}
                  <span className={r.labelValid ? "text-app-caption font-bold text-olive-700" : "text-app-caption font-bold text-rose-700"}>
                    {r.labelValid ? "Rótulo válido" : "Rótulo con datos incompletos"}
                  </span>
                </div>
              </Card>
            </motion.li>
          );
        })}
      </ul>
      <DemoNote />
    </section>
  );
}

/* ---------- Mensajes ---------- */
export function MessagesScreen() {
  const [open, setOpen] = useState<string | null>(MESSAGES[0]?.id ?? null);
  return (
    <section className="flex flex-col gap-6">
      <ScreenTitle eyebrow="Mensajes" title="Su bandeja" emphasis={["bandeja"]} intro="Lo que le escriben Calidad, Compras y la Academia." />
      <ul className="flex flex-col gap-3">
        {MESSAGES.map((m, i) => {
          const isOpen = open === m.id;
          return (
            <motion.li key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...T.enter, delay: 0.1 + i * 0.07 }}>
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : m.id)} className="flex w-full flex-col gap-1 rounded-card border border-line bg-white p-4 text-left transition-[border-color,scale] duration-[var(--dur-s)] hover:border-olive-300 active:scale-[var(--press-scale-card)]">
                <div className="flex items-center gap-3">
                  <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-rose-100 text-olive-800">
                    <Icon name={m.from.startsWith("Academia") ? "flower" : "mail"} size="1.2rem" />
                    {m.unread ? <motion.span aria-label="Sin leer" className="absolute -top-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-rose-600" animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.6, repeat: 2 }} /> : null}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className={cn("truncate", m.unread ? "font-extrabold" : "font-bold")}>{m.subject}</span>
                    <span className="truncate text-app-caption text-ink-soft">
                      {m.from} · {day(m.date)}
                    </span>
                  </div>
                  <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={T.ui} className="text-ink-soft">
                    <Icon name="arrow" size="1rem" />
                  </motion.span>
                </div>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.p key="body" className="overflow-hidden text-app-body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1, marginTop: 8 }} exit={{ height: 0, opacity: 0, marginTop: 0 }} transition={T.ui}>
                      {m.body}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </button>
            </motion.li>
          );
        })}
      </ul>
      <DemoNote />
    </section>
  );
}

/* ---------- Aprender ---------- */
export function LearnScreen() {
  return (
    <section className="flex flex-col gap-6">
      <ScreenTitle eyebrow="Aprender" title="Aprenda en minutos" emphasis={["minutos"]} intro="Videos cortos de sus metas; los descargados se ven sin señal." />
      <ul className="flex flex-col gap-3">
        {CLIPS.map((c, i) => (
          <motion.li key={c.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...T.enter, delay: i * 0.08 }}>
            <Card lift className="grid grid-cols-[auto_1fr] items-center gap-4">
              <span className={cn("grain relative grid size-[4.2rem] place-items-center overflow-hidden rounded-m", i === 0 ? "bg-olive-800 text-rose-500" : "bg-rose-100 text-olive-800")}>
                <Icon name="play" size="1.6rem" />
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip priority="alta">{c.goal}</Chip>
                  <span className="text-app-caption text-ink-soft">{c.minutes} min</span>
                </div>
                <span className="font-display text-[1.15rem] leading-[1.1] tracking-[-0.02em]">{c.title}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-olive-100">
                    <GrowBar className="block h-full" trackStyle={{ width: `${c.progress}%` }} fillClassName="h-full rounded-pill bg-olive-600" delay={0.2} />
                  </div>
                  <span className="inline-flex items-center gap-1 text-app-chip font-bold text-ink-soft">
                    <Icon name={c.offline ? "download" : "wifiOff"} size="0.8rem" /> {c.offline ? "Descargado" : "Con Wi-Fi"}
                  </span>
                </div>
              </div>
            </Card>
          </motion.li>
        ))}
      </ul>
      <DemoNote />
    </section>
  );
}

/* ---------- Beneficios: hoja de ruta (§8.7) ---------- */
export function BenefitsScreen() {
  const unlocked = BENEFITS.filter((b) => b.unlocked).length;
  const last = BENEFITS.reduce((acc, b, i) => (b.unlocked ? i : acc), 0);
  const icons: IconName[] = ["chart", "cart", "coins", "seal"];
  return (
    <section className="flex flex-col gap-6">
      <ScreenTitle eyebrow="Beneficios" title="Su ruta de beneficios" emphasis={["beneficios"]} />
      <Reveal className="grain relative flex items-center gap-4 overflow-hidden rounded-card bg-olive-800 p-5 text-cream">
        <b className="relative z-[2] font-display text-[2.6rem] leading-none font-[330] tracking-[-0.04em]">
          <CountUp value={unlocked} />
          <span className="text-olive-300">/{BENEFITS.length}</span>
        </b>
        <p className="relative z-[2] text-app-small text-olive-100">
          Beneficios desbloqueados. Lleva {RECOGNITIONS.flowers} Flores este ciclo: cada meta completa suma.
        </p>
      </Reveal>
      <ol className="relative flex flex-col gap-5 pl-1">
        <span aria-hidden className="absolute top-7 bottom-7 left-[1.6rem] w-[2px] rounded-pill bg-olive-100">
          <GrowBar axis="y" className="absolute inset-x-0 top-0 block" trackStyle={{ height: `${(last / (BENEFITS.length - 1)) * 100}%` }} fillClassName="h-full w-full rounded-pill bg-olive-800" ease={[0.87, 0, 0.13, 1]} delay={0.3} />
        </span>
        {BENEFITS.map((b, i) => (
          <motion.li key={b.id} className="relative grid grid-cols-[auto_1fr] items-center gap-4" initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ ...T.enter, delay: i * 0.1 }}>
            <motion.span
              className={cn("relative z-[2] ml-[0.2rem] grid size-[2.8rem] place-items-center rounded-full border-2 border-cream", b.unlocked ? "bg-rose-500 text-olive-900 shadow-[var(--halo-rose)]" : "bg-cream-200 text-ink-soft")}
              initial={b.unlocked ? { scale: 0, rotate: -90 } : false}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.34, 1.7, 0.64, 1], delay: 0.6 + i * 0.18 }}
            >
              <Icon name={b.unlocked ? icons[i] ?? "check" : "lock"} size="1.3rem" />
            </motion.span>
            <div className={cn("rounded-button border bg-white p-4", b.unlocked ? "border-rose-300" : "border-line")}>
              <p className="font-extrabold">{b.title}</p>
              <p className={cn("mt-1 flex items-center gap-1 text-app-caption", b.unlocked ? "font-bold text-olive-600" : "text-ink-soft")}>
                <Icon name={b.unlocked ? "check" : "lock"} size="0.9rem" />
                {b.unlocked ? "Desbloqueado" : `Le falta: ${b.condition}`}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
      <ButtonLink href="/app/plan" icon={<Icon name="arrow" />}>
        Avanzar en mi plan
      </ButtonLink>
      <DemoNote />
    </section>
  );
}

/* ---------- Perfil ---------- */
export function ProfileScreen() {
  const links: Array<[string, IconName, string]> = [
    ["/app/ficha", "doc", "Ver o editar mi ficha"],
    ["/app/ficha/resumen", "print", "Imprimir o compartir mi ficha resumen"],
    ["/app/consentimiento", "lock", "Mi autorización de datos"],
    ["/app/recepciones", "truck", "Mis recepciones"],
  ];
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <motion.span variants={popVariants} initial="hidden" animate="show" className="grain relative grid size-24 place-items-center overflow-hidden rounded-full bg-olive-800 font-display text-[2.4rem] text-cream">
          <span className="relative z-[2]">MF</span>
        </motion.span>
        <ScreenTitle eyebrow="Perfil" title={DEMO_FARM.owner} />
      </div>
      <Reveal>
        <Card className="flex flex-col gap-2">
          <span className="font-display text-[1.3rem] leading-none">{DEMO_FARM.name}</span>
          <span className="flex items-center gap-2 text-app-small"><Icon name="pin" size="1rem" /> {DEMO_FARM.place}</span>
          <span className="flex items-center gap-2 text-app-small text-ink-soft"><Icon name="phone" size="1rem" /> 300 123 4567 · proveedor@smile.test</span>
        </Card>
      </Reveal>
      <Stagger className="flex flex-col gap-2" gap={0.06}>
        {links.map(([href, icon, label]) => (
          <StaggerItem key={href}>
            <Link href={href} className="flex min-h-[3.7rem] items-center gap-3 rounded-button border border-line bg-white px-4 font-bold transition-[border-color,scale] duration-[var(--dur-s)] hover:border-olive-300 active:scale-[var(--press-scale-card)]">
              <span className="grid size-9 place-items-center rounded-full bg-rose-100 text-olive-800"><Icon name={icon} size="1.1rem" /></span>
              {label}
              <span className="ml-auto text-ink-soft"><Icon name="arrow" size="1rem" /></span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
      <ButtonLink href="https://wa.me/573001234567" external variant="ghost" icon={<Icon name="chat" />}>
        Hablar con Smile
      </ButtonLink>
      <Chip priority="mantener" className="self-center">Demo: la sesión no se cierra</Chip>
    </section>
  );
}
