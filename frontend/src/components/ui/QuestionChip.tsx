import { Icon, type IconName } from "@/components/icons";

/* GUIA_VISUAL §8.4 — chip del eje de la pregunta: píldora rosa con el ícono en un círculo blanco. */
export function QuestionChip({ children, icon }: { children: string; icon?: IconName }) {
  return (
    <span className="inline-flex w-fit items-center gap-[0.45rem] rounded-pill bg-rose-100 py-[0.4rem] pr-[0.85rem] pl-[0.45rem] text-[0.78rem] font-extrabold text-ink">
      {icon ? (
        <span className="grid size-6 place-items-center rounded-full bg-white text-olive-800">
          <Icon name={icon} size="0.95rem" />
        </span>
      ) : null}
      {children}
    </span>
  );
}
