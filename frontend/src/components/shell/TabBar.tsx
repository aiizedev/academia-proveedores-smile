"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Icon, type IconName } from "@/components/icons";
import { GLIDE, PRESS } from "@/design/motion-react";
import { cn } from "@/lib/cn";

/* GUIA_VISUAL §8.9 — tabbar flotante oscura; cada tab con ícono + texto
   (RNF-USA-002), objetivos ≥ 48 px (RNF-USA-001). La píldora rosa se desliza
   entre pestañas con layoutId + GLIDE. Se esconde en los flujos de una sola
   tarea (autoevaluación, autorización) para no distraer. */
export const TABS: ReadonlyArray<{ href: string; label: string; icon: IconName; also?: string[] }> = [
  { href: "/app", label: "Inicio", icon: "home" },
  { href: "/app/tablero", label: "Tablero", icon: "grid", also: ["/app/erp", "/app/score"] },
  { href: "/app/diagnostico", label: "Diagnóstico", icon: "chart" },
  { href: "/app/plan", label: "Guías", icon: "book" },
  { href: "/app/beneficios", label: "Ruta", icon: "route" },
];

const HIDDEN_ON = ["/app/autoevaluacion", "/app/consentimiento"];

const matches = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function TabBar() {
  const pathname = usePathname();
  const hidden = HIDDEN_ON.some((p) => matches(pathname, p));
  const activeHref = TABS.find((t) => (t.href === "/app" ? pathname === "/app" : matches(pathname, t.href) || t.also?.some((a) => matches(pathname, a))))?.href;

  return (
    <AnimatePresence initial={false}>
      {hidden ? null : (
        <motion.nav
          key="tabbar"
          aria-label="Secciones"
          data-print="hidden"
          initial={{ y: "160%" }}
          animate={{ y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
          exit={{ y: "160%", transition: { duration: 0.4, ease: [0.55, 0, 1, 0.45] } }}
          className="fixed inset-x-3 bottom-[calc(0.8rem+env(safe-area-inset-bottom,0px))] z-[var(--z-tabbar)] mx-auto max-w-[430px] rounded-dock bg-[color-mix(in_srgb,var(--olive-900)_94%,transparent)] p-[0.4rem] shadow-dock [backdrop-filter:var(--blur-dock)] [-webkit-backdrop-filter:var(--blur-dock)]"
        >
          <ul className="grid grid-cols-5">
            {TABS.map((tab) => {
              const active = tab.href === activeHref;
              return (
                <li key={tab.href} className="relative">
                  {active ? (
                    <motion.span layoutId="tab-pill" aria-hidden className="absolute inset-0 rounded-button bg-rose-500" transition={GLIDE} />
                  ) : null}
                  <motion.div whileTap={{ scale: PRESS.icon }}>
                    <Link
                      href={tab.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative z-[2] grid min-h-12 justify-items-center gap-[0.2rem] rounded-button pt-[0.55rem] pb-2",
                        "text-app-chip font-bold transition-colors duration-[var(--dur-s)]",
                        "[-webkit-tap-highlight-color:transparent] focus-visible:outline-rose-500",
                        active ? "text-olive-900" : "text-olive-300 hover:text-cream",
                      )}
                    >
                      <motion.span animate={active ? { y: -1, scale: 1.06 } : { y: 0, scale: 1 }} transition={GLIDE} className="inline-flex">
                        <Icon name={tab.icon} size="1.35rem" />
                      </motion.span>
                      {tab.label}
                    </Link>
                  </motion.div>
                </li>
              );
            })}
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
