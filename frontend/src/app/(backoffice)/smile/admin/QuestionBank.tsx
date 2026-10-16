"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { GLIDE, T } from "@/design/motion-react";
import { cn } from "@/lib/cn";
import { QUESTION_BANK } from "@/mocks/smile";
import { EmptyState } from "../_ui/kit";

type Q = { id: string; axis: string; weight: number; text: string; type?: string; categories?: string[]; min_size?: string; frameworks?: string[]; next_step?: string; required?: boolean };
type Section = { code: string; title: string; questions: Q[] };

const SECTIONS = QUESTION_BANK.sections as ReadonlyArray<Section>;
const SECTORS = [
  { code: "", label: "Todos los sectores" },
  { code: "fruver", label: "Fruver" },
  { code: "lacteos", label: "Lácteos" },
  { code: "carnes", label: "Cárnicos" },
  { code: "pescados_mariscos", label: "Pescados y mariscos" },
  { code: "insumos_servicios", label: "Insumos y servicios" },
];
const AXIS: Record<string, { name: string; icon: IconName }> = Object.fromEntries(
  (QUESTION_BANK.axes as ReadonlyArray<{ code: string; name: string }>).map((a) => [a.code, { name: a.name, icon: a.code as IconName }]),
);
const SIZE: Record<string, string> = { micro: "Micro", pequena: "Pequeña", mediana: "Mediana", grande: "Grande" };
const family = (f: string) => (f.startsWith("ISO") ? "iso" : f.startsWith("B Corp") ? "bcorp" : f.startsWith("GRI") ? "gri" : f.startsWith("ODS") ? "ods" : /^(TCFD|SASB|GHG)/.test(f) ? "tcfd" : "co");
const FAMILY_TONE: Record<string, string> = {
  iso: "bg-olive-50 text-olive-700",
  bcorp: "bg-rose-100 text-rose-700",
  gri: "bg-cream-200 text-ink-soft",
  ods: "bg-olive-800 text-cream",
  tcfd: "bg-olive-25 text-olive-700",
  co: "border border-line text-ink-soft",
};

export function QuestionBank() {
  const [section, setSection] = useState<string>(SECTIONS[0]?.code ?? "");
  const [sector, setSector] = useState("");
  const [q, setQ] = useState("");
  const inSector = (x: Q) => !sector || (x.categories ?? ["all"]).some((c) => c === "all" || c === sector);
  const counts = useMemo(() => Object.fromEntries(SECTIONS.map((s) => [s.code, s.questions.filter(inSector).length])), [sector]); // eslint-disable-line react-hooks/exhaustive-deps
  const current = SECTIONS.find((s) => s.code === section);
  const text = q.trim().toLowerCase();
  const questions = (current?.questions ?? []).filter((x) => inSector(x) && (!text || `${x.id} ${x.text} ${(x.frameworks ?? []).join(" ")}`.toLowerCase().includes(text)));
  const total = SECTIONS.reduce((a, s) => a + s.questions.length, 0);

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[19rem_minmax(0,1fr)]">
      <aside className="sticky top-6 grid min-w-0 grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[var(--radius-card)] bg-olive-800 p-4 text-cream">
            <p className="text-app-caption text-olive-300">Preguntas</p>
            <p className="mt-1 font-body text-[1.8rem] font-semibold leading-none">{total}</p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-4">
            <p className="text-app-caption text-ink-soft">Secciones</p>
            <p className="mt-1 font-body text-[1.8rem] font-semibold leading-none">{SECTIONS.length}</p>
          </div>
        </div>
        <nav aria-label="Secciones del banco" className="rounded-[var(--radius-card)] border border-line bg-white p-2">
          <LayoutGroup id="bank-sections">
            <ul className="grid grid-cols-1 gap-0.5">
              {SECTIONS.map((s) => {
                const on = s.code === section;
                return (
                  <li key={s.code}>
                    <button type="button" onClick={() => setSection(s.code)} aria-current={on ? "true" : undefined} className={cn("relative flex w-full items-center justify-between gap-2 rounded-[var(--radius-control)] px-3 py-2.5 text-left text-app-small font-semibold transition-colors", on ? "text-olive-900" : "text-ink-soft hover:bg-cream hover:text-ink")}>
                      {on ? <motion.span layoutId="bank-on" transition={GLIDE} className="absolute inset-0 rounded-[var(--radius-control)] bg-rose-100" /> : null}
                      <span className="relative truncate">{s.title}</span>
                      <span className={cn("relative rounded-[var(--radius-pill)] px-2 text-app-caption font-bold", counts[s.code] ? "bg-white" : "text-ink-faint")} style={{ fontVariantNumeric: "tabular-nums" }}>
                        {counts[s.code]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </LayoutGroup>
        </nav>
      </aside>

      <section className="grid gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {SECTORS.map((s) => (
            <button key={s.code} type="button" aria-pressed={sector === s.code} onClick={() => setSector(s.code)} className={cn("h-9 rounded-[var(--radius-pill)] border px-3.5 text-app-caption font-bold transition-colors", sector === s.code ? "border-olive-800 bg-olive-800 text-cream" : "border-line bg-white text-ink-soft hover:text-ink")}>
              {s.label}
            </button>
          ))}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar texto o marco" aria-label="Buscar pregunta" className="ml-auto h-10 min-w-64 rounded-[var(--radius-pill)] border-[1.5px] border-line bg-white px-4 text-app-small outline-none focus:border-olive-600 focus:shadow-[var(--ring-field-focus)]" />
        </div>

        <header className="flex items-baseline justify-between">
          <h2 className="font-display text-[1.6rem] leading-tight tracking-[-0.02em]">{current?.title}</h2>
          <p className="text-app-small text-ink-soft">{questions.length} pregunta{questions.length === 1 ? "" : "s"}</p>
        </header>

        <AnimatePresence mode="wait" initial={false}>
          <motion.ul key={`${section}-${sector}`} className="grid gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: T.exit }} transition={T.enter}>
            {questions.map((x, i) => {
              const axis = AXIS[x.axis];
              return (
                <motion.li key={x.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...T.ui, delay: Math.min(i, 10) * 0.035 }} className="lift rounded-[var(--radius-card)] border border-line bg-white p-5">
                  <div className="flex items-start gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-rose-100 text-olive-800" title={axis?.name}>
                      <Icon name={axis?.icon ?? "bpa"} size={22} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-app-caption">
                        <span className="font-extrabold tracking-[var(--tracking-chip)] text-olive-600 uppercase">{x.id}</span>
                        <span className="text-ink-soft">· {axis?.name ?? x.axis}</span>
                        <span className="text-ink-soft">· peso {x.weight}</span>
                        {x.min_size ? <span className="text-ink-soft">· desde {SIZE[x.min_size] ?? x.min_size}</span> : null}
                        {x.required ? <span className="rounded-[var(--radius-pill)] bg-cream-200 px-2 py-0.5 font-bold text-ink-soft">Obligatoria</span> : null}
                      </div>
                      <p className="mt-1.5 text-app-body leading-snug">{x.text}</p>
                      {x.next_step ? <p className="mt-2 text-app-small text-ink-soft"><span className="font-bold text-rose-700">Siguiente paso:</span> {x.next_step}</p> : null}
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {(x.frameworks ?? []).map((f) => (
                          <li key={f} className={cn("rounded-[var(--radius-pill)] px-2.5 py-0.5 text-app-chip font-extrabold tracking-[var(--tracking-chip)]", FAMILY_TONE[family(f)])}>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.li>
              );
            })}
            {questions.length === 0 ? (
              <li>
                <EmptyState title="Esta sección no aplica" body="No hay preguntas de esta sección para el sector o la búsqueda elegida. Pruebe con «Todos los sectores»." />
              </li>
            ) : null}
          </motion.ul>
        </AnimatePresence>
      </section>
    </div>
  );
}
