"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.9 — tabbar flotante; cada tab con ícono + texto (RNF-USA-002),
   objetivos ≥ 48 px (RNF-USA-001). La píldora rosa marca la pestaña activa. */
export const TABS: ReadonlyArray<{ href: string; label: string; icon: IconName }> = [
  { href: "/app/diagnostico", label: "Diagnóstico", icon: "chart" },
  { href: "/app/plan", label: "Guías", icon: "book" },
  { href: "/app/beneficios", label: "Ruta", icon: "route" },
  { href: "/app/ficha", label: "Ficha", icon: "doc" },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-3 bottom-[calc(0.8rem+env(safe-area-inset-bottom,0px))] z-[var(--z-tabbar)] mx-auto max-w-[430px] rounded-dock bg-[color-mix(in_srgb,var(--olive-900)_94%,transparent)] p-[0.4rem] shadow-dock [backdrop-filter:var(--blur-dock)] [-webkit-backdrop-filter:var(--blur-dock)]"
    >
      <ul className="grid grid-cols-4">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "grid min-h-12 justify-items-center gap-[0.2rem] rounded-button pt-[0.55rem] pb-2",
                  "text-app-chip font-bold transition-colors duration-[var(--dur-s)]",
                  "[-webkit-tap-highlight-color:transparent]",
                  active ? "bg-rose-500 text-olive-900" : "text-olive-300",
                )}
              >
                <Icon name={tab.icon} size="1.35rem" />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
