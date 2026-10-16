import type { ReactNode } from "react";

/* Marcador de pantalla del esqueleto S0. Cada stub enlaza los requerimientos y
   casos de uso que la implementan (docs/sistema/requerimientos.md). */
export function PageStub({
  eyebrow,
  title,
  refs,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  refs: string;
  children?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <p className="a-eyebrow">{eyebrow}</p>
      <h1 className="a-title">{title}</h1>
      {children}
      <p className="text-app-caption text-ink-soft">Pendiente de implementar · {refs}</p>
    </section>
  );
}
