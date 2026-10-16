/* GUIA_VISUAL §8.4 — chip del eje de la pregunta. */
export function QuestionChip({ children }: { children: string }) {
  return (
    <span className="inline-flex w-fit items-center rounded-pill bg-rose-100 px-3 py-1 text-app-chip font-extrabold uppercase tracking-[var(--tracking-chip)] text-rose-700">
      {children}
    </span>
  );
}
