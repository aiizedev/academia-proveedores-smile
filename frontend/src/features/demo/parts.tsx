import Link from "next/link";
import type { ReactNode } from "react";
import { formatDate } from "@/lib/format";

/* Piezas compartidas de las pantallas de demo (POC). */
export const day = (iso: string) => formatDate(`${iso}T12:00:00-05:00`);

export function ScreenTitle({ eyebrow, children, intro }: { eyebrow: string; children: ReactNode; intro?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="a-eyebrow">{eyebrow}</p>
      <h1 className="a-title">{children}</h1>
      {intro ? <p className="text-app-body text-ink-soft">{intro}</p> : null}
    </div>
  );
}

export function DemoNote() {
  return <p className="text-app-caption text-ink-soft">Datos de demostración.</p>;
}

export function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex min-h-12 items-center font-bold text-olive-800 underline underline-offset-4">
      {children}
    </Link>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex min-h-[3.7rem] items-center justify-center rounded-button bg-olive-800 px-[1.4rem] text-app-button font-extrabold text-cream">
      {children}
    </Link>
  );
}

export function Stat({ label, value, hint, strong = false }: { label: string; value: string; hint?: string; strong?: boolean }) {
  return (
    <div className={strong ? "flex flex-col gap-1 rounded-card bg-olive-800 p-4 text-cream" : "flex flex-col gap-1 rounded-card border border-line bg-white p-4"}>
      <span className={strong ? "text-app-caption text-olive-300" : "text-app-caption text-ink-soft"}>{label}</span>
      <span className="font-display text-app-stat leading-none tabular-nums">{value}</span>
      {hint ? <span className={strong ? "text-app-caption text-olive-300" : "text-app-caption text-ink-soft"}>{hint}</span> : null}
    </div>
  );
}
