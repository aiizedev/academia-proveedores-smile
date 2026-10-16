"use client";

import { LayoutGroup, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GLIDE, STAGGER, T } from "@/design/motion-react";
import { cn } from "@/lib/cn";

/* Navegación del back-office (arquitectura.md §4.1): ícono + texto, grupos, y un
   indicador activo que se desliza entre opciones (layoutId + GLIDE, GUIA_VISUAL §9.7).
   Íconos de línea en la grilla de §7 (24 × 24, trazo 1.6, round). */
const ICON = {
  resumen: `<path d="M4 11 12 4l8 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5.5h4V20"/>`,
  riesgo: `<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M12 3.5v17M3.5 12h17"/><circle cx="8" cy="8" r="1.3" fill="currentColor"/><circle cx="16.5" cy="15.5" r="1.3" fill="currentColor"/>`,
  calidad: `<path d="M12 3.5 19 6v5.5c0 4.3-3 7.6-7 9-4-1.4-7-4.7-7-9V6Z"/><path d="m9 12 2.2 2.2L15.5 10"/>`,
  impacto: `<path d="M12 21v-8"/><path d="M12 13c0-4 3-7 8-7 0 4-3 7-8 7Z"/><path d="M12 15c0-3-2.5-5.5-7-5.5 0 3 2.5 5.5 7 5.5Z"/><path d="M6 21h12"/>`,
  funnel: `<path d="M3.5 5h17l-6.5 8v6l-4 1.5V13Z"/>`,
  esg: `<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.2-3.5-8.5s1.1-6.1 3.5-8.5Z"/>`,
  proveedores: `<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19.5c.6-3 2.8-5 5.5-5s4.9 2 5.5 5"/><circle cx="17" cy="9.5" r="2.3"/><path d="M15.8 14.7c2.3.2 4 1.9 4.6 4.8"/>`,
  recepciones: `<path d="M3 7.5h11v9H3Z"/><path d="M14 10.5h3.5l3 3v3H14"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>`,
  reportes: `<path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5Z"/><path d="M14 3.5v5h5"/><path d="M12 11v6M9.5 14.5 12 17l2.5-2.5"/>`,
  admin: `<path d="M4 5.5A2 2 0 0 1 6 3.5h13.5V18H6a2 2 0 0 0-2 2Z"/><path d="M4 20a2 2 0 0 0 2 1.5h13.5V18"/><path d="M8.5 8h7M8.5 11.5h5"/>`,
} as const;

const GROUPS: ReadonlyArray<{ title: string; links: ReadonlyArray<{ href: string; label: string; icon: keyof typeof ICON }> }> = [
  {
    title: "Tableros",
    links: [
      { href: "/smile", label: "Resumen", icon: "resumen" },
      { href: "/smile/riesgo", label: "Visor de riesgo", icon: "riesgo" },
      { href: "/smile/calidad", label: "Calidad", icon: "calidad" },
      { href: "/smile/impacto", label: "Impacto", icon: "impacto" },
      { href: "/smile/funnel", label: "Funnel", icon: "funnel" },
      { href: "/smile/esg", label: "Consola ESG", icon: "esg" },
    ],
  },
  {
    title: "Operación",
    links: [
      { href: "/smile/proveedores", label: "Proveedores", icon: "proveedores" },
      { href: "/smile/recepciones", label: "Recepciones", icon: "recepciones" },
      { href: "/smile/reportes", label: "Reportes", icon: "reportes" },
    ],
  },
  { title: "Configuración", links: [{ href: "/smile/admin", label: "Banco de preguntas", icon: "admin" }] },
];

function NavIcon({ name }: { name: keyof typeof ICON }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: ICON[name] }}
    />
  );
}

export function Sidebar() {
  const pathname = usePathname();
  let n = 0;
  return (
    <aside className="grain w-64 shrink-0 self-stretch bg-olive-900 text-cream">
      <div className="sticky top-0 z-[var(--z-content)] flex h-dvh flex-col gap-7 overflow-y-auto px-4 py-6">
        <Link href="/smile" className="block px-3">
          <p className="brand text-[1.9rem] leading-none">
            smile<span className="dot">.</span>
          </p>
          <p className="mt-2 flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[var(--tracking-caps)] text-olive-300">
            <span aria-hidden="true" className="h-px w-5 bg-[var(--on-strong-tint-line)]" />
            Back-office
          </p>
        </Link>

        <nav aria-label="Back-office" className="flex flex-col gap-5">
          <LayoutGroup id="smile-nav">
            {GROUPS.map((g) => (
              <div key={g.title}>
                <p className="mb-1.5 px-3 text-[0.62rem] font-extrabold uppercase tracking-[var(--tracking-caps)] text-olive-400">{g.title}</p>
                <ul className="flex flex-col gap-0.5">
                  {g.links.map((l) => {
                    const active = l.href === "/smile" ? pathname === l.href : pathname.startsWith(l.href);
                    const i = n++;
                    return (
                      <motion.li key={l.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ ...T.enter, delay: 0.05 + i * STAGGER.tight }}>
                        <Link
                          href={l.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "group relative flex h-11 items-center gap-3 rounded-[var(--radius-control)] px-3 text-app-small font-semibold transition-colors",
                            active ? "text-olive-900" : "text-olive-100 hover:bg-[var(--on-strong-tint-bg)] hover:text-cream",
                          )}
                        >
                          {active ? (
                            <motion.span layoutId="nav-active" transition={GLIDE} className="absolute inset-0 rounded-[var(--radius-control)] bg-rose-500" aria-hidden="true" />
                          ) : null}
                          <span className={cn("relative grid size-5 place-items-center transition-transform", !active && "group-hover:-rotate-6")}>
                            <NavIcon name={l.icon} />
                          </span>
                          <span className="relative">{l.label}</span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </LayoutGroup>
        </nav>

        <div className="mt-auto flex items-center gap-3 rounded-[var(--radius-card)] border border-[var(--on-strong-tint-line)] bg-[var(--on-strong-tint-bg)] p-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-500 font-display text-[1.05rem] text-olive-900">LM</span>
          <div className="min-w-0">
            <p className="truncate text-app-small font-bold">Laura Méndez</p>
            <p className="truncate text-app-caption text-olive-300">Revisora · <span className="text-rose-300">usuario demo</span></p>
          </div>
        </div>
      </div>
    </aside>
  );
}
