"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/icons";
import { EASING, STAGGER, T } from "@/design/motion-react";
import { cn } from "@/lib/cn";

/* Panel de contexto del escritorio (maqueta: .stage__info). Acompaña al
   teléfono: dice dónde está el proveedor en el recorrido y por qué importa. */
type Step = { href: string; label: string; match?: string[] };

const JOURNEY: ReadonlyArray<Step> = [
  { href: "/app", label: "Su finca hoy" },
  { href: "/app/ficha", label: "Ficha del proveedor", match: ["/app/consentimiento", "/app/perfil"] },
  { href: "/app/autoevaluacion", label: "Autoevaluación" },
  { href: "/app/diagnostico", label: "Diagnóstico" },
  { href: "/app/plan", label: "Plan de 3 metas" },
  { href: "/app/tablero", label: "Mi tablero", match: ["/app/erp", "/app/score", "/app/recepciones"] },
  { href: "/app/lotes", label: "Lotes y rótulos" },
  { href: "/app/beneficios", label: "Ruta de beneficios", match: ["/app/aprender", "/app/mensajes"] },
];

type Copy = { eyebrow: string; before: string; em: string; after?: string; lead: string };
const COPY: Record<string, Copy> = {
  "/app": { eyebrow: "PWA del proveedor", before: "Su finca, en", em: "un vistazo", lead: "Ventas, alertas de carencia y reconocimientos del mes. Funciona sin señal y guarda todo en el teléfono." },
  "/app/ficha": { eyebrow: "Paso 1 · Ficha", before: "Quién es y qué", em: "cultiva", lead: "Datos básicos de la finca en pocos pasos. Con ellos se arma una autoevaluación a la medida." },
  "/app/autoevaluacion": { eyebrow: "Paso 2 · Autoevaluación", before: "Una pregunta a la", em: "vez", lead: "Sí o No, con letra grande. Se guarda sola en cada respuesta y se puede pausar cuando quiera." },
  "/app/diagnostico": { eyebrow: "Paso 3 · Diagnóstico", before: "Su punto de", em: "partida", lead: "Puntaje de 0 a 100, nivel por eje y el siguiente paso más útil. Calculado en el teléfono." },
  "/app/plan": { eyebrow: "Paso 4 · Plan", before: "Tres metas,", em: "una a una", lead: "Guías prácticas con pasos, checklist y consejos. Cada guía abre sin conexión." },
  "/app/tablero": { eyebrow: "Mi tablero", before: "Lo que gana", em: "mejorando", lead: "Ventas, costos, margen e inventario; y el beneficio económico de cada buena práctica." },
  "/app/lotes": { eyebrow: "Trazabilidad", before: "Cosechar a", em: "tiempo", lead: "Cada aplicación fija una fecha segura. El rótulo con QR viaja con el lote hasta Smile." },
  "/app/beneficios": { eyebrow: "Ruta de beneficios", before: "Cada meta", em: "suma", lead: "Prioridad en compras, mejor precio y formación: se desbloquean con su avance." },
};

const stepIndex = (pathname: string) =>
  JOURNEY.findIndex((s) => (s.href === "/app" ? pathname === "/app" : pathname.startsWith(s.href) || s.match?.some((m) => pathname.startsWith(m))));

export function StagePanel() {
  const pathname = usePathname();
  const current = stepIndex(pathname);
  const key = current >= 0 ? JOURNEY[current]!.href : "/app";
  const copy = COPY[key] ?? COPY["/app"]!;

  return (
    <motion.aside
      aria-label="Contexto de la demo"
      data-print="hidden"
      className="relative z-[var(--z-content)] hidden max-w-[34rem] gap-[clamp(1.2rem,3.2vh,2.4rem)] justify-self-end min-[900px]:grid print:hidden"
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: STAGGER.base, delayChildren: 0.15 } } }}
    >
      <motion.div variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: T.reveal } }}>
        <Link href="/" className="group inline-flex items-center gap-2 text-[length:var(--fs-small)] font-semibold text-ink-soft transition-[gap,color] duration-[var(--dur-s)] hover:gap-3 hover:text-ink">
          <Icon name="back" size="1.1rem" /> Academia de Proveedores · demo
        </Link>
      </motion.div>

      <motion.div variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: T.reveal } }} className="min-h-[13.5rem]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={key} initial="hidden" animate="show" exit="exit" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } }, exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: EASING.exit } } }}>
            <motion.p variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: T.enter } }} className="a-eyebrow mb-4">
              {copy.eyebrow}
            </motion.p>
            <h1
              aria-label={`${copy.before} ${copy.em}${copy.after ?? ""}`}
              className="font-display text-[clamp(2.4rem,min(4.2vw,7.4vh),4.4rem)] leading-[0.98] font-[330] tracking-[-0.04em] [font-variation-settings:var(--fv-heading)]"
            >
              {[...copy.before.split(" ").map((w) => ({ w, em: false })), { w: copy.em, em: true }].map(({ w, em }, i) => (
                <span key={`${w}-${i}`} aria-hidden className="mr-[0.22em] inline-block overflow-hidden pb-[0.1em] align-bottom">
                  <motion.span className="inline-block" variants={{ hidden: { y: "110%", rotate: 2.5 }, show: { y: "0%", rotate: 0, transition: T.headline } }}>
                    {em ? <em className="pr-[0.06em] text-rose-600 [font-variation-settings:var(--fv-accent)]">{w}</em> : w}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.p variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { ...T.enter, delay: 0.2 } } }} className="mt-5 max-w-[36ch] text-[1.1rem] leading-[1.5] text-ink-soft [@media(max-height:820px)]:hidden">
              {copy.lead}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.ol variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: T.reveal } }} className="grid border-t border-line">
        {JOURNEY.map((step, i) => {
          const isCurrent = i === current;
          const done = current >= 0 && i < current;
          return (
            <li key={step.href} className="border-b border-line">
              <Link
                href={step.href}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "flex items-center gap-4 py-[clamp(0.4rem,1.1vh,0.7rem)] font-semibold transition-[color,padding] duration-[var(--dur-m)] ease-out hover:text-ink",
                  isCurrent ? "pl-3 text-ink" : done ? "text-olive-600" : "text-ink-faint",
                )}
              >
                <span className="text-[length:var(--fs-micro)] tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                {step.label}
                {isCurrent ? (
                  <motion.span layoutId="stage-dot" transition={{ type: "spring", stiffness: 380, damping: 34 }} className="ml-auto size-2 rounded-full bg-rose-500 shadow-[var(--halo-rose-soft)]" />
                ) : done ? (
                  <span className="ml-auto text-olive-600">
                    <Icon name="check" size="1rem" />
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </motion.ol>

      <motion.div variants={{ hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: T.reveal } }} className="grid grid-cols-[auto_auto] items-center justify-start gap-[0.6rem]">
        <Link href="/" className="inline-flex items-center gap-[0.6rem] rounded-pill bg-olive-800 px-[1.2rem] py-[0.85rem] text-[length:var(--fs-small)] font-bold text-cream transition-[background-color,translate] duration-[var(--dur-s)] hover:-translate-y-0.5 hover:bg-olive-900">
          <Icon name="grid" size="1.1rem" /> Ir al índice
        </Link>
        <Link href="/smile" className="inline-flex items-center gap-[0.6rem] rounded-pill border border-line px-[1.2rem] py-[0.85rem] text-[length:var(--fs-small)] font-bold text-ink transition-[background-color,translate] duration-[var(--dur-s)] hover:-translate-y-0.5 hover:bg-white">
          Back-office <Icon name="arrow" size="1.1rem" />
        </Link>
        <p className="col-span-2 mt-1 text-[length:var(--fs-micro)] text-ink-soft">Datos de demostración, guardados solo en este navegador.</p>
      </motion.div>
    </motion.aside>
  );
}
