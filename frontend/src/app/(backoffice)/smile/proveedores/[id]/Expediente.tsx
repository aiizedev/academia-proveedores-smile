"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { BarList, ChartCard, LineChart, ProgressRing, lineTable } from "@/components/charts";
import { Icon, type IconName } from "@/components/icons";
import { CountUp, MaskWords, Stagger, StaggerItem } from "@/components/motion";
import { Chip, LevelBadge, type Level } from "@/components/ui";
import { EASING, GLIDE, STAGGER, T } from "@/design/motion-react";
import { cn } from "@/lib/cn";
import { AXES, CYCLE_ORDER, SERIES, STAGES, STAGE_ORDER, formatCop, supplierById } from "@/mocks/smile";
import { fmtPct } from "../../_ui/data";
import { SegmentBadge } from "../../_ui/kit";

const TABS = [
  { id: "resumen", label: "Resumen" },
  { id: "diagnostico", label: "Diagnóstico y plan" },
  { id: "visitas", label: "Línea de tiempo" },
  { id: "documentos", label: "Documentos" },
  { id: "mensajes", label: "Mensajes" },
] as const;
type TabId = (typeof TABS)[number]["id"];

const level = (score: number): Level => (score >= 75 ? "avanzado" : score >= 40 ? "desarrollo" : "inicial");
const axisName = (code: string) => AXES.find((a) => a.code === code)?.name ?? code;
const AXIS_ICON: Record<string, IconName> = { bpa: "bpa", residuos: "residuos", carbono: "carbono", infantil: "infantil", ddhh: "ddhh" };
const CYCLE_LABEL: Record<string, string> = { "C3-2025": "C3 · 25", "C1-2026": "C1 · 26", "C2-2026": "C2 · 26", "C3-2026": "C3 · 26" };

export function Expediente({ id }: { id: string }) {
  const s = supplierById(id);
  const x = SERIES[id];
  const [tab, setTab] = useState<TabId>("resumen");
  if (!s || !x) return null;
  const stageIdx = STAGE_ORDER.indexOf(s.stage);
  const history = CYCLE_ORDER.map((c) => x.cycles[c]?.score ?? null);

  // Línea de tiempo: hitos de la Academia + visitas registradas.
  const joinedDate: Record<string, string> = { "C3-2025": "2025-09-08", "C1-2026": "2026-01-20", "C2-2026": "2026-05-11", "C3-2026": "2026-09-14" };
  const timeline = [
    ...s.visits.map((v) => ({ date: v.date, title: `${v.kind} · ${v.ally}`, note: v.note, icon: "book" as IconName })),
    { date: joinedDate[x.joined] ?? "2026-01-20", title: "Ingreso a la Academia", note: "Ficha obligatoria completa y consentimiento firmado (E1).", icon: "home" as IconName },
    ...CYCLE_ORDER.filter((c) => x.cycles[c] && c !== x.joined).map((c) => ({
      date: joinedDate[c] ?? "",
      title: `Autoevaluación ${CYCLE_LABEL[c]}`,
      note: `Score ${x.cycles[c]?.score} · etapa ${x.cycles[c]?.stage} · merma ${fmtPct(x.cycles[c]?.wastePct ?? 0)}.`,
      icon: "chart" as IconName,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <Link href="/smile/proveedores" className="group mb-4 inline-flex items-center gap-2 text-app-small font-bold text-olive-700">
        <span className="transition-transform group-hover:-translate-x-1" aria-hidden="true">←</span> Proveedores
      </Link>

      {/* Cabecera "Linktree": tarjeta oscura con grano, identidad, puntaje y camino de etapas */}
      <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={T.enter} className="grain relative overflow-hidden rounded-[var(--radius-sheet)] bg-olive-800 text-cream">
        <svg aria-hidden="true" className="pointer-events-none absolute -top-24 -right-16 opacity-25" width="360" height="360" viewBox="-100 -100 200 200">
          {[0, 90, 180, 270].map((r) => (
            <path key={r} transform={`rotate(${r})`} d="M0 -8 C 22 -30, 24 -64, 0 -88 C -24 -64, -22 -30, 0 -8 Z" style={{ fill: "var(--rose-500)" }} />
          ))}
        </svg>
        <div className="relative z-[var(--z-content)] grid gap-8 p-8 xl:grid-cols-[minmax(0,1fr)_auto]">
          <div className="flex items-start gap-5">
            <motion.span initial={{ scale: 0.6, rotate: -12, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ ...T.pop, delay: 0.1 }} className="grid size-20 shrink-0 place-items-center rounded-full bg-rose-500 font-display text-[2.2rem] text-olive-900">
              {s.rep[0]}
            </motion.span>
            <div className="min-w-0">
              <p className="text-[0.66rem] font-extrabold uppercase tracking-[var(--tracking-caps)] text-rose-300">Expediente · NIT {s.nit}</p>
              <MaskWords text={s.farm} className="mt-2 font-display text-[2.6rem] leading-[1.02] tracking-[-0.035em]" />
              <p className="mt-2 text-app-body text-olive-300">
                {s.rep} · {s.municipality}, {s.department}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2 text-app-caption font-bold">
                <li><SegmentBadge segment={s.segment} /></li>
                {[`${s.category} · ${s.size}`, s.personType === "juridica" ? "Persona jurídica" : "Persona natural", `Contacto por ${s.channel}`, s.phone].map((t) => (
                  <li key={t} className="rounded-[var(--radius-pill)] border border-[var(--on-strong-tint-line)] px-2.5 py-1 text-olive-100">{t}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex items-center gap-5 xl:flex-col xl:items-end">
            <div className="rounded-full bg-cream p-2 text-ink">
              <ProgressRing value={s.score} size={132} stroke={12} sublabel="score total" color="var(--chart-highlight)" />
            </div>
            <div className="flex gap-4 text-center">
              <div><p className="font-body text-[1.4rem] font-semibold leading-none">{s.recognitions.flowers}</p><p className="mt-1 text-app-caption text-olive-300">Flores</p></div>
              <div><p className="font-body text-[1.4rem] font-semibold leading-none">{s.recognitions.smiles}</p><p className="mt-1 text-app-caption text-olive-300">Caritas</p></div>
              <div><p className="font-body text-[1.4rem] font-semibold leading-none">{fmtPct(s.wastePct)}</p><p className="mt-1 text-app-caption text-olive-300">Merma</p></div>
            </div>
          </div>
        </div>

        {/* Camino E1–E6 */}
        <div className="relative z-[var(--z-content)] border-t border-[var(--on-strong-tint-line)] px-8 pt-6 pb-7">
          <ol className="relative grid grid-cols-6" aria-label={`Etapa actual ${s.stage}`}>
            <span aria-hidden="true" className="absolute top-[18px] right-[8.33%] left-[8.33%] h-[2px] bg-[var(--on-strong-tint-line)]" />
            <motion.span
              aria-hidden="true"
              className="absolute top-[18px] left-[8.33%] h-[2px] origin-left bg-rose-500"
              style={{ width: `${(stageIdx / 5) * 83.33}%` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ ...T.bar, delay: 0.3 }}
            />
            {STAGES.map((st, i) => {
              const done = i < stageIdx;
              const current = i === stageIdx;
              return (
                <li key={st.code} className="relative flex flex-col items-center text-center" aria-current={current ? "step" : undefined}>
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: current ? 1.12 : 1, opacity: 1 }}
                    transition={{ duration: T.pop.duration * 0.7, ease: EASING.pop, delay: 0.35 + i * STAGGER.base }}
                    className={cn(
                      "relative grid size-9 place-items-center rounded-full border-2 text-app-caption font-extrabold",
                      current ? "border-rose-500 bg-rose-500 text-olive-900 shadow-[var(--halo-rose)]" : done ? "border-rose-300 bg-olive-900 text-rose-300" : "border-[var(--on-strong-tint-line)] bg-olive-800 text-olive-300",
                    )}
                  >
                    {done ? <Icon name="check" size={16} /> : st.code}
                  </motion.span>
                  <span className={cn("mt-2 max-w-[9rem] text-app-caption leading-tight", current ? "font-bold text-cream" : "text-olive-300")}>{st.name}</span>
                </li>
              );
            })}
          </ol>
        </div>
      </motion.section>

      {/* Pestañas con subrayado que se desliza */}
      <LayoutGroup id="exp-tabs">
        <div role="tablist" aria-label="Secciones del expediente" className="mt-6 flex gap-1 border-b border-line">
          {TABS.map((t) => {
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={on}
                aria-controls={`panel-${t.id}`}
                onClick={() => setTab(t.id)}
                className={cn("relative px-4 pt-2 pb-3 text-app-small font-bold transition-colors", on ? "text-ink" : "text-ink-soft hover:text-ink")}
              >
                {t.label}
                {on ? <motion.span layoutId="exp-underline" transition={GLIDE} className="absolute inset-x-2 -bottom-px h-[3px] rounded-[var(--radius-pill)] bg-rose-500" /> : null}
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab} role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6, transition: T.exit }} transition={T.enter} className="mt-6">
          {tab === "resumen" ? (
            <div className="grid gap-6">
              <Stagger className="grid gap-4 xl:grid-cols-3 [&>*]:min-w-0">
                {[
                  { k: "P1", name: "Sostenibilidad", w: 50, v: s.pillars.p1, note: "Autoevaluación del cuatrimestre" },
                  { k: "P2", name: "Desempeño comercial", w: 30, v: s.pillars.p2, note: `Merma ${fmtPct(s.wastePct)} · recepciones a tiempo` },
                  { k: "P3", name: "Fidelización", w: 20, v: s.pillars.p3, note: `${s.finance.weeksWithRecords} semanas con registros en el Mini ERP` },
                ].map((p) => (
                  <StaggerItem key={p.k} className="lift rounded-[var(--radius-card)] border border-line bg-white p-5">
                    <div className="flex items-center justify-between">
                      <span className="rounded-[var(--radius-pill)] border border-line px-2.5 py-0.5 font-display text-[0.95rem]">{p.k}</span>
                      <span className="rounded-[var(--radius-pill)] bg-rose-100 px-2.5 py-1 text-app-caption font-extrabold text-rose-700">peso {p.w} %</span>
                    </div>
                    <p className="mt-4 font-display text-[1.3rem] leading-tight">{p.name}</p>
                    <p className="mt-2 flex items-baseline gap-2">
                      <span className="font-body text-[2.2rem] font-semibold leading-none tracking-[-0.02em]"><CountUp value={p.v} /></span>
                      <span className="text-app-small text-ink-soft">aporta {(Math.round((p.v * p.w) / 10) / 10).toLocaleString("es-CO")} pts</span>
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--chart-track)]">
                      <motion.div className="h-full rounded-[var(--radius-pill)] bg-olive-800" initial={{ width: 0 }} animate={{ width: `${p.v}%` }} transition={{ ...T.bar, delay: 0.2 }} />
                    </div>
                    <p className="mt-3 text-app-caption text-ink-soft">{p.note}</p>
                  </StaggerItem>
                ))}
              </Stagger>
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                <ChartCard
                  title="Score por ciclo"
                  subtitle="Evolución desde que entró a la Academia."
                  table={lineTable(CYCLE_ORDER.map((c) => CYCLE_LABEL[c] ?? c), [{ id: "s", label: "Score", color: "var(--chart-series)", values: history }])}
                >
                  <LineChart
                    labels={CYCLE_ORDER.map((c) => CYCLE_LABEL[c] ?? c)}
                    series={[{ id: "s", label: "Score", color: "var(--chart-series)", values: history }]}
                    yMax={100}
                    height={220}
                    references={[{ value: 80, label: "Umbral E5 · 80" }]}
                    refLabelAt="start"
                  />
                </ChartCard>
                <section className="rounded-[var(--radius-card)] border border-line bg-white p-6">
                  <h3 className="font-display text-[1.25rem] leading-tight tracking-[-0.02em]">Resumen financiero</h3>
                  <p className="mt-1 text-app-caption text-ink-soft">Solo agregados del cuatrimestre (RF-PRV-007): Smile no ve transacciones individuales.</p>
                  <dl className="mt-4 grid grid-cols-2 gap-3">
                    {[
                      ["Ventas", formatCop(s.finance.salesCop)],
                      ["Costos", formatCop(s.finance.costsCop)],
                      ["Margen", `${s.finance.marginPct.toLocaleString("es-CO")} %`],
                      ["Volumen a Smile", `${x.volumeKg.toLocaleString("es-CO")} kg/mes`],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-[var(--radius-control)] bg-cream p-3">
                        <dt className="text-app-caption text-ink-soft">{k}</dt>
                        <dd className="mt-1 font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {s.recognitions.badges.map((b) => (
                      <span key={b} className="rounded-[var(--radius-pill)] bg-olive-800 px-3 py-1 text-app-caption font-bold text-cream">{b}</span>
                    ))}
                    {s.bpaIca ? <span className="rounded-[var(--radius-pill)] bg-rose-100 px-3 py-1 text-app-caption font-bold text-rose-700">BPA ICA · Res. 30021</span> : null}
                    {s.childLaborFree ? <span className="rounded-[var(--radius-pill)] bg-olive-25 px-3 py-1 text-app-caption font-bold text-olive-700">Libre de trabajo infantil</span> : null}
                  </div>
                </section>
              </div>
            </div>
          ) : null}

          {tab === "diagnostico" ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <ChartCard title="Diagnóstico por eje" subtitle="Autoevaluación del cuatrimestre (0–100)." table={{ columns: [{ key: "e", label: "Eje" }, { key: "v", label: "Puntaje", numeric: true }, { key: "n", label: "Nivel" }], rows: AXES.map((a) => ({ e: a.name, v: s.axes[a.code], n: level(s.axes[a.code]) })) }}>
                <BarList max={100} data={AXES.map((a) => ({ id: a.code, label: a.name, value: s.axes[a.code], display: String(s.axes[a.code]), highlight: s.axes[a.code] < 40, hint: level(s.axes[a.code]) }))} />
                <div className="mt-5 flex flex-wrap gap-2">
                  {AXES.map((a) => (
                    <span key={a.code} className="flex items-center gap-2 text-app-caption text-ink-soft">
                      <LevelBadge level={level(s.axes[a.code])} className="px-2.5 py-1 text-[0.62rem]" />
                      {a.code.toUpperCase()}
                    </span>
                  ))}
                </div>
              </ChartCard>
              <section className="rounded-[var(--radius-card)] border border-line bg-white p-6">
                <h3 className="font-display text-[1.25rem] leading-tight tracking-[-0.02em]">Plan de mejora · 3 metas</h3>
                <Stagger className="mt-4 grid gap-3">
                  {s.plan.map((g) => (
                    <StaggerItem key={g.axis} className="flex items-start gap-4 rounded-[var(--radius-control)] bg-cream p-4">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-rose-100 text-olive-800">
                        <Icon name={AXIS_ICON[g.axis] ?? "bpa"} size={22} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold">{axisName(g.axis)}</p>
                          <Chip priority={g.done ? "completa" : g.priority} />
                        </div>
                        <p className="mt-1 text-app-small text-ink-soft">{g.step}</p>
                      </div>
                    </StaggerItem>
                  ))}
                </Stagger>
              </section>
            </div>
          ) : null}

          {tab === "visitas" ? (
            <section className="rounded-[var(--radius-card)] border border-line bg-white p-8">
              <h3 className="font-display text-[1.25rem] leading-tight tracking-[-0.02em]">Visitas, capacitaciones e hitos</h3>
              <ol className="relative mt-6 grid gap-6 pl-14">
                <motion.span aria-hidden="true" className="absolute top-2 bottom-2 left-[21px] w-[2px] origin-top bg-olive-100" initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={T.bar} />
                {timeline.map((e, i) => (
                  <motion.li key={`${e.date}-${e.title}`} className="relative" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ ...T.enter, delay: 0.15 + i * STAGGER.loose }}>
                    <motion.span
                      className={cn("absolute top-0 -left-14 grid size-11 place-items-center rounded-full border-2", i === 0 ? "border-olive-800 bg-olive-800 text-cream" : "border-olive-100 bg-white text-olive-700")}
                      initial={{ scale: 0 }}
                      animate={{ scale: i === 0 ? 1.08 : 1 }}
                      transition={{ duration: T.pop.duration * 0.7, ease: EASING.pop, delay: 0.2 + i * STAGGER.loose }}
                    >
                      <Icon name={e.icon} size={18} />
                    </motion.span>
                    <p className="text-[0.66rem] font-extrabold uppercase tracking-[var(--tracking-caps)] text-rose-700" style={{ fontVariantNumeric: "tabular-nums" }}>{e.date}</p>
                    <p className="mt-1 font-display text-[1.2rem] leading-tight">{e.title}</p>
                    <p className="mt-1 max-w-xl text-app-small text-ink-soft">{e.note}</p>
                  </motion.li>
                ))}
              </ol>
            </section>
          ) : null}

          {tab === "documentos" ? (
            <Stagger className="grid gap-4 xl:grid-cols-3 [&>*]:min-w-0">
              {s.documents.map((d) => {
                const tone = d.status === "Verificado" ? "bg-olive-800 text-cream" : d.status === "Vencido" ? "bg-rose-700 text-white" : "bg-cream-200 text-ink-soft";
                return (
                  <StaggerItem key={d.name} className="lift rounded-[var(--radius-card)] border border-line bg-white p-5">
                    <div className="flex items-start justify-between">
                      <span className="grid size-11 place-items-center rounded-full bg-rose-100 text-olive-800"><Icon name="doc" size={22} /></span>
                      <span className={cn("inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-app-caption font-bold", tone)}>
                        <Icon name={d.status === "Verificado" ? "check" : d.status === "Vencido" ? "alert" : "lock"} size={13} />
                        {d.status}
                      </span>
                    </div>
                    <p className="mt-4 font-display text-[1.2rem] leading-tight">{d.name}</p>
                    <p className="mt-1 text-app-caption text-ink-soft">Vence: {d.expires}</p>
                  </StaggerItem>
                );
              })}
            </Stagger>
          ) : null}

          {tab === "mensajes" ? (
            <section className="grid gap-3 rounded-[var(--radius-card)] border border-line bg-white p-6">
              {s.messages.map((m, i) => (
                <motion.div
                  key={`${m.date}-${m.from}`}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ ...T.enter, delay: i * STAGGER.loose }}
                  className={cn("max-w-[60%] rounded-[var(--radius-card)] p-4", m.from === "Smile" ? "rounded-bl-[var(--radius-check)] bg-olive-50" : "ml-auto rounded-br-[var(--radius-check)] bg-rose-100")}
                >
                  <p className="text-app-caption font-bold text-ink-soft">{m.from} · {m.date}</p>
                  <p className="mt-1 text-app-small">{m.text}</p>
                </motion.div>
              ))}
              <p className="mt-2 text-center text-app-caption text-ink-soft">Los mensajes llegan al proveedor por {s.channel}.</p>
            </section>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
