"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Icon, type IconName } from "@/components/icons";
import { CountUp, Reveal } from "@/components/motion";
import { EASING, T } from "@/design/motion-react";
import { cn } from "@/lib/cn";

/* Índice de la demo con la estética de la landing de la maqueta: hero con
   titular Fraunces por máscara, paisaje en una ventana redonda, grano, flor y
   hojas; debajo, tarjetas con capa que sube al pasar el puntero (.axis-card)
   enlazando a TODAS las rutas, agrupadas por superficie. */

type Sub = { href: string; label: string };
type Area = { title: string; em: string; icon: IconName; href: string; note: string; links: Sub[] };

const PWA: ReadonlyArray<Area> = [
  {
    title: "Su finca",
    em: "hoy",
    icon: "home",
    href: "/app",
    note: "Saludo, alertas del día, Flores y accesos rápidos.",
    links: [
      { href: "/app/tablero", label: "Mi tablero" },
      { href: "/app/mensajes", label: "Mensajes" },
      { href: "/app/perfil", label: "Perfil" },
    ],
  },
  {
    title: "Ficha y",
    em: "autorización",
    icon: "doc",
    href: "/app/ficha",
    note: "Quién es, dónde está y qué cultiva. Datos protegidos.",
    links: [
      { href: "/app/ficha/resumen", label: "Ficha resumen (imprimir o WhatsApp)" },
      { href: "/app/consentimiento", label: "Autorización de datos" },
    ],
  },
  {
    title: "Autoevaluación y",
    em: "diagnóstico",
    icon: "check",
    href: "/app/autoevaluacion?nueva=1",
    note: "Una pregunta por pantalla, Sí o No. Puntaje y nivel por eje.",
    links: [
      { href: "/app/autoevaluacion", label: "Autoevaluación del ciclo" },
      { href: "/app/diagnostico", label: "Diagnóstico" },
    ],
  },
  {
    title: "Plan de",
    em: "mejora",
    icon: "book",
    href: "/app/plan",
    note: "Tres metas con guías paso a paso que abren sin señal.",
    links: [
      { href: "/app/plan/residuos", label: "Guía de una meta" },
      { href: "/app/aprender", label: "Aprender en minutos" },
    ],
  },
  {
    title: "Mini",
    em: "ERP",
    icon: "coins",
    href: "/app/erp",
    note: "Ventas, costos, mermas e inventario en menos de un minuto.",
    links: [
      { href: "/app/erp/ventas", label: "Ventas" },
      { href: "/app/erp/costos", label: "Costos" },
      { href: "/app/erp/mermas", label: "Mermas" },
      { href: "/app/erp/inventario", label: "Inventario" },
    ],
  },
  {
    title: "Lotes y",
    em: "beneficios",
    icon: "bpa",
    href: "/app/lotes",
    note: "Carencia, rótulo con QR, entregas, score y ruta de beneficios.",
    links: [
      { href: "/app/recepciones", label: "Mis recepciones" },
      { href: "/app/score", label: "Mi score" },
      { href: "/app/beneficios", label: "Ruta de beneficios" },
    ],
  },
];

const SMILE: ReadonlyArray<{ href: string; label: string; icon: IconName; note: string }> = [
  { href: "/smile", label: "Resumen", icon: "grid", note: "La red de un vistazo" },
  { href: "/smile/riesgo", label: "Riesgo", icon: "alert", note: "Matriz de proveedores" },
  { href: "/smile/calidad", label: "Calidad", icon: "seal", note: "Rechazos y causas" },
  { href: "/smile/impacto", label: "Impacto", icon: "globe", note: "Lo que cambia en campo" },
  { href: "/smile/funnel", label: "Funnel", icon: "route", note: "Etapas E1 a E6" },
  { href: "/smile/proveedores", label: "Proveedores", icon: "user", note: "Directorio y expedientes" },
  { href: "/smile/recepciones", label: "Recepciones", icon: "truck", note: "Entregas del día" },
  { href: "/smile/esg", label: "Consola ESG", icon: "bpa", note: "Indicadores por eje" },
  { href: "/smile/reportes", label: "Reportes", icon: "download", note: "CSV y PDF" },
  { href: "/smile/admin", label: "Administración", icon: "lock", note: "Usuarios y catálogos" },
];

const ACCESS: ReadonlyArray<Sub> = [
  { href: "/ingresar", label: "Ingresar" },
  { href: "/registro", label: "Registrar mi finca" },
  { href: "/recuperar", label: "Recuperar contraseña" },
];

const CATEGORIES = ["Fruver", "Lácteos", "Carnes", "Pescados", "Huevos"];
const PETAL = "M0 -8 C 22 -30, 24 -64, 0 -88 C -24 -64, -22 -30, 0 -8 Z";

/* ---------- piezas ---------- */

function Row({ children, delay, className }: { children: React.ReactNode; delay: number; className?: string }) {
  return (
    <span aria-hidden className={cn("flex items-center gap-[0.12em] overflow-clip pt-[0.04em] pb-[0.17em] -mb-[0.07em]", className)}>
      <motion.span className="inline-flex items-center gap-[0.12em] whitespace-nowrap" initial={{ y: "112%" }} animate={{ y: "0%" }} transition={{ duration: 1.5, ease: EASING.enter, delay }}>
        {children}
      </motion.span>
    </span>
  );
}

function Scene() {
  return (
    <motion.span
      className="relative inline-block h-[0.74em] shrink-0 translate-y-[0.04em] overflow-hidden rounded-pill [clip-path:inset(0_round_999px)]"
      initial={{ width: 0 }}
      animate={{ width: "1.85em" }}
      transition={{ duration: 1.6, ease: EASING.move, delay: 0.35 }}
    >
      <motion.svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" className="absolute -inset-x-[6%] -inset-y-[12%] h-[124%] w-[112%]" initial={{ scale: 1.5 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: EASING.enter, delay: 0.45 }}>
        <defs>
          <linearGradient id="idx-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--rose-100)" }} />
            <stop offset="1" style={{ stopColor: "var(--cream)" }} />
          </linearGradient>
        </defs>
        <rect width="600" height="400" fill="url(#idx-sky)" />
        <motion.circle cx="430" cy="150" r="62" style={{ fill: "var(--rose-500)" }} initial={{ y: 60, scale: 0.7 }} animate={{ y: 0, scale: 1 }} transition={{ duration: 1.6, ease: EASING.enter, delay: 0.7 }} />
        <motion.path d="M0 250 C 90 200, 170 215, 260 235 S 430 190, 600 225 V400 H0Z" style={{ fill: "var(--olive-300)" }} initial={{ y: 50 }} animate={{ y: 0 }} transition={{ duration: 1.4, ease: EASING.enter, delay: 0.6 }} />
        <motion.path d="M0 290 C 120 250, 240 270, 330 285 S 500 255, 600 270 V400 H0Z" style={{ fill: "var(--olive-400)" }} initial={{ y: 40 }} animate={{ y: 0 }} transition={{ duration: 1.4, ease: EASING.enter, delay: 0.7 }} />
        <path d="M0 320 C 150 295, 300 300, 600 312 V400 H0Z" style={{ fill: "var(--olive-700)" }} />
        <g fill="none" strokeWidth="2.4" strokeLinecap="round" opacity=".7" style={{ stroke: "var(--olive-400)" }}>
          <path d="M40 400 C 120 360, 200 335, 300 318" />
          <path d="M150 400 C 210 365, 260 340, 320 320" />
          <path d="M270 400 C 300 370, 320 345, 340 322" />
          <path d="M400 400 C 390 372, 375 345, 360 322" />
          <path d="M530 400 C 480 368, 430 342, 380 320" />
        </g>
        <g transform="translate(150 238)" style={{ fill: "var(--olive-900)" }}>
          <rect x="-3" y="0" width="6" height="40" />
          <circle cx="0" cy="-8" r="26" />
          <circle cx="-14" cy="4" r="16" />
          <circle cx="14" cy="2" r="17" />
          <g style={{ fill: "var(--rose-500)" }}>
            <circle cx="-6" cy="-14" r="3.2" />
            <circle cx="10" cy="-4" r="3.2" />
            <circle cx="-12" cy="6" r="3.2" />
          </g>
        </g>
      </motion.svg>
    </motion.span>
  );
}

function Ticker() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % CATEGORIES.length), 1800);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="relative inline-block h-[1.15em] w-[7ch] overflow-hidden align-bottom font-display text-[length:var(--fs-h3)] leading-[1.15] tracking-[-0.02em]" aria-live="off">
      {CATEGORIES.map((c, n) => (
        <motion.span key={c} className="absolute inset-x-0 top-0" initial={false} animate={{ y: n === i ? "0%" : n === (i + CATEGORIES.length - 1) % CATEGORIES.length ? "-110%" : "110%", opacity: n === i ? 1 : 0 }} transition={{ duration: 0.85, ease: EASING.move }}>
          {c}
        </motion.span>
      ))}
    </span>
  );
}

function Flower({ className }: { className?: string }) {
  return (
    <motion.svg aria-hidden viewBox="-100 -100 200 200" className={className} initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 2.2, ease: EASING.enter, delay: 0.9 }}>
      <motion.g animate={{ rotate: 360 }} transition={{ duration: 60, ease: "linear", repeat: Infinity }}>
        {[0, 90, 180, 270].map((r, i) => (
          <g key={r} transform={`rotate(${r})`}>
            <motion.path d={PETAL} style={{ fill: "var(--rose-500)", stroke: "var(--olive-800)", strokeWidth: 1.2, transformOrigin: "0px -8px" }} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.9, ease: EASING.pop, delay: 1 + i * 0.12 }} />
          </g>
        ))}
        <circle r="7" style={{ fill: "var(--olive-800)" }} />
      </motion.g>
    </motion.svg>
  );
}

function Leaves({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 400 400" className={className} fill="none" strokeWidth="1.2" style={{ stroke: "var(--olive-600)" }}>
      <motion.path d="M200 380 C 200 280, 210 180, 260 70" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2.4, ease: EASING.move, delay: 0.8 }} />
      {[
        "M203 300 C 160 290, 130 260, 125 225 C 165 228, 195 255, 203 300Z",
        "M208 240 C 250 230, 280 200, 285 165 C 245 170, 215 195, 208 240Z",
        "M218 170 C 185 160, 165 135, 162 108 C 195 112, 214 136, 218 170Z",
      ].map((d, i) => (
        <motion.path key={d} d={d} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.6, ease: EASING.enter, delay: 1.4 + i * 0.25 }} />
      ))}
    </svg>
  );
}

function AreaCard({ area, index }: { area: Area; index: number }) {
  return (
    <motion.li
      className="rise-card group flex min-h-[19rem] flex-col rounded-l border border-line bg-white p-[clamp(1.4rem,2.2vw,2rem)]"
      initial={{ opacity: 0, y: 80, rotate: 1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 1.4, ease: EASING.enter, delay: (index % 3) * 0.09 }}
    >
      <span className="rise-card__layer" aria-hidden />
      <div className="flex items-start justify-between">
        <span className="rounded-pill border border-current px-[0.7rem] py-[0.25rem] font-display tabular-nums opacity-80">{String(index + 1).padStart(2, "0")}</span>
        <span className="rise-card__icon grid size-[3.6rem] place-items-center rounded-full bg-rose-100 text-olive-800">
          <Icon name={area.icon} size="1.7rem" />
        </span>
      </div>
      <Link href={area.href} className="mt-auto pt-8 font-display text-[clamp(1.6rem,2.3vw,2.2rem)] leading-[1.02] font-normal tracking-[-0.03em] after:absolute after:inset-0 after:z-[1] after:content-[''] focus-visible:outline-none">
        {area.title} <em className="text-rose-700 transition-colors duration-[var(--dur-m)] group-hover:text-rose-300 [font-variation-settings:var(--fv-accent)]">{area.em}</em>
      </Link>
      <p className="rise-card__muted mt-2 text-[length:var(--fs-small)] text-ink-soft">{area.note}</p>
      <ul className="relative z-[3] mt-5 grid text-[length:var(--fs-small)]">
        {area.links.map((l) => (
          <li key={l.href} className="border-t border-line transition-colors duration-[var(--dur-m)] group-hover:border-line-light">
            <Link href={l.href} className="flex items-center gap-[0.6rem] py-[0.5rem] font-semibold hover:underline hover:underline-offset-4">
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-rose-500" />
              {l.label}
              <span className="ml-auto opacity-60">
                <Icon name="arrow" size="0.95rem" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </motion.li>
  );
}

function SmileCard({ item, index }: { item: (typeof SMILE)[number]; index: number }) {
  return (
    <motion.li initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -6% 0px" }} transition={{ duration: 1.2, ease: EASING.enter, delay: (index % 5) * 0.07 }}>
      <Link href={item.href} className="rise-card flex min-h-[11rem] flex-col rounded-card border border-line bg-white p-5">
        <span className="rise-card__layer" aria-hidden />
        <span className="rise-card__icon grid size-11 place-items-center rounded-full bg-rose-100 text-olive-800">
          <Icon name={item.icon} size="1.35rem" />
        </span>
        <span className="mt-auto pt-6 font-display text-[clamp(1.1rem,4.6vw,1.45rem)] leading-none tracking-[-0.025em] [overflow-wrap:anywhere]">{item.label}</span>
        <span className="rise-card__muted mt-1 flex items-center justify-between gap-2 text-app-caption text-ink-soft">
          {item.note}
          <span className="rise-card__go grid size-8 shrink-0 place-items-center rounded-full bg-cream text-olive-900">
            <Icon name="arrow" size="0.95rem" />
          </span>
        </span>
      </Link>
    </motion.li>
  );
}

function SectionHead({ eyebrow, before, em, intro }: { eyebrow: string; before: string; em: string; intro: string }) {
  return (
    <Reveal className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <p className="a-eyebrow mb-3">{eyebrow}</p>
        <h2 className="font-display text-[length:var(--fs-h2)] leading-[var(--lh-heading)] font-[330] tracking-[var(--tracking-heading)] [font-variation-settings:var(--fv-heading)]">
          {before} <em className="text-rose-600 [font-variation-settings:var(--fv-accent)]">{em}</em>
        </h2>
      </div>
      <p className="max-w-[40ch] text-ink-soft md:text-right">{intro}</p>
    </Reveal>
  );
}

/* ---------- página ---------- */

export function DemoIndex() {
  return (
    <div className="stage-bg min-h-svh overflow-x-clip">
      <motion.nav
        className="sticky top-0 z-[var(--z-nav)] flex items-center justify-between gap-4 bg-[color-mix(in_srgb,var(--cream)_82%,transparent)] px-[var(--gutter)] py-4 [backdrop-filter:var(--blur-dock)] [-webkit-backdrop-filter:var(--blur-dock)]"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...T.enter, delay: 1.2 }}
      >
        <Link href="/" className="flex items-center gap-3">
          <span className="brand text-[1.7rem] leading-none">
            smile<span className="dot">.</span>
          </span>
          <span className="hidden border-l border-line pl-3 text-[length:var(--fs-micro)] font-bold uppercase tracking-[var(--tracking-caps)] text-ink-soft sm:inline">Academia Proveedores</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/smile" className="hidden rounded-pill border border-line px-4 py-2.5 text-[length:var(--fs-small)] font-bold transition-colors duration-[var(--dur-s)] hover:bg-white sm:inline-flex">
            Back-office
          </Link>
          <Link href="/app" className="group inline-flex items-center gap-2 rounded-pill bg-olive-800 py-2.5 pr-2.5 pl-4 text-[length:var(--fs-small)] font-bold text-cream transition-colors duration-[var(--dur-s)] hover:bg-olive-900">
            Abrir la app
            <span className="grid size-7 place-items-center rounded-full bg-rose-500 text-olive-900 transition-[rotate] duration-[var(--dur-m)] group-hover:-rotate-45">
              <Icon name="arrow" size="0.9rem" />
            </span>
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <header className="relative flex min-h-[calc(100svh-4.6rem)] flex-col justify-between gap-6 overflow-hidden px-[var(--gutter)] pt-8 pb-8">
        <Flower className="pointer-events-none absolute top-[8%] right-[4%] hidden size-[clamp(7rem,12vw,11rem)] md:block" />
        <Leaves className="pointer-events-none absolute top-[38%] -left-24 hidden size-[20rem] -scale-x-100 opacity-40 lg:block" />
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <motion.p className="a-eyebrow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...T.enter, delay: 1 }}>
            Grupo Smile · Red de Valor Compartido
          </motion.p>
          <motion.p className="max-w-[36ch] text-[clamp(1.05rem,1.35vw,1.3rem)] leading-[1.4] text-ink-soft md:mr-[clamp(8rem,14vw,13rem)] md:text-right" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...T.enter, delay: 1.1 }}>
            Diagnóstico y formación en sostenibilidad para quienes cultivan, crían y pescan lo que llega a nuestra mesa. Esta es la demo navegable.
          </motion.p>
        </div>

        <h1
          aria-label="Cultivar mejor es simple."
          className="relative flex flex-col font-display text-[clamp(3.4rem,19vw,8rem)] leading-[var(--lh-display)] font-[330] tracking-[var(--tracking-display)] [font-variation-settings:var(--fv-display)] md:text-[min(var(--fs-display),17svh)]"
        >
          <Row delay={0.1}>Cultivar</Row>
          <Row delay={0.22} className="md:justify-center">
            <Scene />
            <em className="font-light text-olive-600 [font-variation-settings:var(--fv-accent),'opsz'_144]">mejor</em>
          </Row>
          <Row delay={0.34} className="justify-end pr-[0.08em]">
            <span>
              es simple<span className="text-rose-500">.</span>
            </span>
          </Row>
        </h1>

        <motion.div className="relative grid items-end gap-6 md:grid-cols-[1fr_auto_1fr]" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...T.reveal, delay: 1.3 }}>
          <div className="flex flex-col gap-1">
            <span className="text-[length:var(--fs-small)] text-ink-soft">Guías prácticas para</span>
            <Ticker />
          </div>
          <Link href="/app/autoevaluacion?nueva=1" className="group inline-flex items-center gap-3 justify-self-start rounded-pill bg-olive-800 py-3 pr-3 pl-6 text-[1.05rem] font-bold text-cream shadow-float transition-[background-color,translate] duration-[var(--dur-m)] hover:-translate-y-0.5 hover:bg-olive-900 md:justify-self-center">
            Empezar diagnóstico
            <span className="grid size-10 place-items-center rounded-full bg-rose-500 text-olive-900 transition-[rotate] duration-[var(--dur-m)] group-hover:-rotate-45">
              <Icon name="arrow" size="1.1rem" />
            </span>
          </Link>
          <div aria-hidden className="hidden items-center gap-3 justify-self-end text-[length:var(--fs-micro)] uppercase tracking-[var(--tracking-caps)] text-ink-soft md:flex">
            Deslice
            <span className="relative h-14 w-px overflow-hidden bg-line">
              <i className="absolute inset-0 animate-[scroll-line_var(--dur-count)_var(--ease-in-out)_infinite] bg-olive-800" />
            </span>
          </div>
        </motion.div>
      </header>

      {/* Banda de cifras */}
      <section className="grain relative mx-[var(--gutter)] overflow-hidden rounded-xl bg-olive-800 px-[clamp(1.4rem,4vw,3.4rem)] py-[clamp(2rem,5vw,3.6rem)] text-cream">
        <ul className="relative z-[2] grid gap-8 sm:grid-cols-3">
          {[
            { n: 5, s: " ejes", t: "BPA, residuos, carbono, cero trabajo infantil y derechos humanos." },
            { n: 5, s: " min", t: "Lo que toma la autoevaluación, una pregunta por pantalla." },
            { n: 100, s: " %", t: "De la app funciona sin señal y guarda en el teléfono." },
          ].map((it, i) => (
            <Reveal key={it.t} delay={i * 0.08} className="flex flex-col gap-2 border-t border-[var(--on-strong-tint-line)] pt-4">
              <span className="font-display text-[clamp(2.6rem,5vw,4.2rem)] leading-none font-[330] tracking-[-0.045em]">
                <CountUp value={it.n} suffix={it.s} />
              </span>
              <span className="max-w-[30ch] text-[length:var(--fs-small)] text-olive-300">{it.t}</span>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* PWA */}
      <section className="flex flex-col gap-10 px-[var(--gutter)] pt-[clamp(4rem,9vw,8rem)]">
        <SectionHead eyebrow="01 · Celular del proveedor" before="PWA del" em="proveedor" intro="Funciona sin señal. Entra como María Fernanda Rojas, Finca La Esperanza (Fusagasugá)." />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PWA.map((area, i) => (
            <AreaCard key={area.href} area={area} index={i} />
          ))}
        </ul>
      </section>

      {/* Back-office */}
      <section className="flex flex-col gap-10 px-[var(--gutter)] pt-[clamp(4rem,9vw,8rem)]">
        <SectionHead eyebrow="02 · Escritorio de Smile" before="Back-office" em="Smile" intro="En línea, para Compras, Calidad, Sostenibilidad y Administración." />
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {SMILE.map((item, i) => (
            <SmileCard key={item.href} item={item} index={i} />
          ))}
        </ul>
      </section>

      {/* Acceso y cierre */}
      <section className="px-[var(--gutter)] pt-[clamp(4rem,9vw,8rem)] pb-10">
        <Reveal className="grain relative flex flex-col gap-6 overflow-hidden rounded-xl bg-rose-500 p-[clamp(1.6rem,4vw,3.4rem)] text-olive-900 md:flex-row md:items-end md:justify-between">
          <div className="relative z-[2]">
            <p className="a-eyebrow mb-3 text-olive-800">03 · Acceso</p>
            <p className="max-w-[16ch] font-display text-[clamp(2rem,3.6vw,3.2rem)] leading-none tracking-[-0.03em]">
              Con la demo abierta no hace falta <em className="[font-variation-settings:var(--fv-accent)]">ingresar</em>.
            </p>
          </div>
          <ul className="relative z-[2] flex flex-wrap gap-2">
            {ACCESS.map((a) => (
              <li key={a.href}>
                <Link href={a.href} className="inline-flex min-h-12 items-center gap-2 rounded-pill bg-cream px-5 font-bold text-olive-900 transition-[background-color,translate] duration-[var(--dur-s)] hover:-translate-y-0.5 hover:bg-white">
                  {a.label} <Icon name="arrow" size="1rem" />
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
        <footer className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-line pt-8 md:flex-row md:items-end">
          <p aria-label="smile." className="brand overflow-hidden text-[clamp(4.5rem,16vw,12rem)] leading-[0.9]">
            {"smile".split("").map((ch, i) => (
              <motion.span key={i} aria-hidden className="inline-block" initial={{ y: "100%" }} whileInView={{ y: "0%" }} viewport={{ once: true }} transition={{ duration: 1.4, ease: EASING.enter, delay: i * 0.06 }}>
                {ch}
              </motion.span>
            ))}
            <motion.span aria-hidden className="dot inline-block" initial={{ y: "-1.2em" }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 300, damping: 9, delay: 0.5 }}>
              .
            </motion.span>
          </p>
          <p className="max-w-[40ch] text-[length:var(--fs-small)] text-ink-soft">Prueba de concepto navegable. Los datos son de demostración y se guardan solo en este navegador.</p>
        </footer>
      </section>
    </div>
  );
}
