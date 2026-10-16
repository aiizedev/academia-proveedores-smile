"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/* Navegación del back-office (arquitectura.md §4.1). Ícono + texto en la versión final. */
const LINKS = [
  { href: "/smile", label: "Resumen" },
  { href: "/smile/proveedores", label: "Proveedores" },
  { href: "/smile/recepciones", label: "Recepciones" },
  { href: "/smile/funnel", label: "Funnel" },
  { href: "/smile/esg", label: "Consola ESG" },
  { href: "/smile/reportes", label: "Reportes" },
  { href: "/smile/admin", label: "Administración" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-64 shrink-0 flex-col gap-8 bg-olive-800 px-5 py-6 text-cream">
      <p className="brand text-[1.6rem]">
        smile<span className="dot">.</span>
        <span className="ml-2 align-middle text-[0.66rem] font-semibold uppercase tracking-[var(--tracking-caps)] text-olive-300">
          Back-office
        </span>
      </p>
      <nav aria-label="Back-office">
        <ul className="flex flex-col gap-1">
          {LINKS.map((l) => {
            const active = l.href === "/smile" ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center rounded-button px-4 font-semibold transition-colors",
                    active ? "bg-rose-500 text-olive-900" : "text-olive-100 hover:bg-[var(--on-strong-tint-bg)]",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
