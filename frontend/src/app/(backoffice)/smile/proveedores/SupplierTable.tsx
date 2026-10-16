"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Skeleton } from "@/components/motion";
import { GLIDE, T } from "@/design/motion-react";
import { cn } from "@/lib/cn";
import { STAGES, type Stage } from "@/mocks/smile";
import { fmtPct, rowsAt } from "../_ui/data";
import { FilterBar, useFilters } from "../_ui/filters";
import { useArrival } from "../_ui/hooks";
import { EmptyState, SegmentBadge, StageBadge, stageColor } from "../_ui/kit";

export function SupplierTable() {
  const { filters, reset } = useFilters();
  const arrived = useArrival();
  const router = useRouter();
  const [stages, setStages] = useState<Stage[]>([]);
  const [text, setText] = useState("");
  const all = useMemo(() => rowsAt(filters), [filters]);

  const rows = useMemo(() => {
    const q = text.trim().toLowerCase();
    return all
      .filter((r) => (!stages.length || stages.includes(r.c.stage)) && (!q || `${r.s.farm} ${r.s.rep} ${r.s.nit} ${r.s.municipality}`.toLowerCase().includes(q)))
      .sort((a, b) => a.s.farm.localeCompare(b.s.farm, "es"));
  }, [all, stages, text]);
  const toggle = (s: Stage) => setStages((xs) => (xs.includes(s) ? xs.filter((x) => x !== s) : [...xs, s]));

  return (
    <>
      <FilterBar count={rows.length} />
      <section className="rounded-[var(--radius-card)] border border-line bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
          <label className="relative flex h-11 min-w-72 flex-1 items-center">
            <span className="sr-only">Buscar proveedor</span>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="absolute left-4 text-ink-soft">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4.2-4.2" />
            </svg>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Buscar por finca, nombre, NIT o municipio"
              className="h-11 w-full rounded-[var(--radius-pill)] border-[1.5px] border-line bg-cream pr-4 pl-11 text-app-small outline-none transition-[border-color,box-shadow] focus:border-olive-600 focus:shadow-[var(--ring-field-focus)]"
            />
          </label>
          <LayoutGroup id="stage-chips">
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filtrar por etapa">
              {STAGES.map((s) => {
                const on = stages.includes(s.code);
                return (
                  <button
                    key={s.code}
                    type="button"
                    aria-pressed={on}
                    title={s.name}
                    onClick={() => toggle(s.code)}
                    className={cn("relative inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 text-app-caption font-extrabold transition-colors", on ? "border-olive-800 bg-olive-800 text-cream" : "border-line bg-white text-ink-soft hover:text-ink")}
                  >
                    <span className="size-2.5 rounded-[var(--radius-mark)]" style={{ background: stageColor(s.code) }} aria-hidden="true" />
                    {s.code}
                  </button>
                );
              })}
              {stages.length ? (
                <motion.button layout transition={GLIDE} type="button" onClick={() => setStages([])} className="px-2 text-app-caption font-bold text-rose-700 hover:underline">
                  Quitar
                </motion.button>
              ) : null}
            </div>
          </LayoutGroup>
        </div>

        {!arrived ? (
          <div className="grid gap-3 p-5">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-12" rounded="var(--radius-control)" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="No encontramos a nadie así"
            body={text ? `Ningún proveedor coincide con “${text}”. Revise la ortografía o busque por NIT.` : "Ningún proveedor coincide con los filtros. Pruebe con otra etapa o municipio."}
            action={
              <button type="button" onClick={() => { setText(""); setStages([]); reset(); }} className="mt-2 rounded-[var(--radius-pill)] bg-olive-800 px-5 py-2.5 text-app-small font-bold text-cream">
                Ver todos
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-app-small">
              <thead className="text-app-caption text-ink-soft">
                <tr className="border-b border-line">
                  <th scope="col" className="py-3 pl-5 font-semibold">Proveedor</th>
                  <th scope="col" className="font-semibold">NIT</th>
                  <th scope="col" className="font-semibold">Municipio</th>
                  <th scope="col" className="font-semibold">Segmento</th>
                  <th scope="col" className="font-semibold">Etapa</th>
                  <th scope="col" className="font-semibold">Score</th>
                  <th scope="col" className="text-right font-semibold">Merma</th>
                  <th scope="col" className="w-10"><span className="sr-only">Abrir</span></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={true} mode="popLayout">
                  {rows.map((r, i) => (
                    <motion.tr
                      key={r.s.id}
                      layout="position"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0, transition: { ...T.ui, delay: Math.min(i, 14) * 0.025 } }}
                      exit={{ opacity: 0, transition: T.exit }}
                      onClick={() => router.push(`/smile/proveedores/${r.s.id}`)}
                      className="group cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-cream"
                    >
                      <td className="py-3 pl-5">
                        <span className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-rose-100 font-display text-[0.95rem] text-olive-800 transition-transform group-hover:-rotate-6">
                            {r.s.rep[0]}
                          </span>
                          <span>
                            <Link href={`/smile/proveedores/${r.s.id}`} onClick={(e) => e.stopPropagation()} className="font-bold text-ink decoration-rose-500 decoration-2 underline-offset-4 group-hover:underline">
                              {r.s.farm}
                            </Link>
                            <span className="block text-app-caption text-ink-soft">{r.s.rep}</span>
                          </span>
                        </span>
                      </td>
                      <td className="text-ink-soft" style={{ fontVariantNumeric: "tabular-nums" }}>{r.s.nit}</td>
                      <td>
                        {r.s.municipality}
                        <span className="block text-app-caption text-ink-soft">{r.s.department}</span>
                      </td>
                      <td><SegmentBadge segment={r.s.segment} /></td>
                      <td><StageBadge stage={r.c.stage} /></td>
                      <td>
                        <span className="flex items-center gap-2">
                          <span className="relative h-1.5 w-16 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--chart-track)]">
                            <motion.span className="absolute inset-y-0 left-0 rounded-[var(--radius-pill)] bg-olive-800" initial={{ width: 0 }} animate={{ width: `${r.c.score}%` }} transition={T.reveal} />
                          </span>
                          <strong style={{ fontVariantNumeric: "tabular-nums" }}>{r.c.score}</strong>
                        </span>
                      </td>
                      <td className="text-right font-bold" style={{ fontVariantNumeric: "tabular-nums" }}>{fmtPct(r.c.wastePct)}</td>
                      <td className="pr-4 text-right text-ink-faint transition-transform group-hover:translate-x-0.5" aria-hidden="true">→</td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
