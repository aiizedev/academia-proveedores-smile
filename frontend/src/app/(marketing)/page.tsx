import Link from "next/link";
import { Icon, type IconName } from "@/components/icons";

/* Índice de la demo (POC): punto de entrada para recorrer todas las rutas de
   arquitectura.md §4.1. La landing completa (maqueta/index.html) llega después. */
type Entry = { href: string; label: string; icon: IconName; note?: string };

const GROUPS: ReadonlyArray<{ title: string; intro: string; entries: Entry[] }> = [
  {
    title: "PWA del proveedor",
    intro: "Funciona sin señal. Entra como María Fernanda Rojas, Finca La Esperanza (Fusagasugá).",
    entries: [
      { href: "/app", label: "Inicio", icon: "home", note: "KPIs del mes y alertas" },
      { href: "/app/ficha", label: "Ficha del proveedor", icon: "doc" },
      { href: "/app/ficha/resumen", label: "Ficha resumen", icon: "doc", note: "Imprimir o WhatsApp" },
      { href: "/app/autoevaluacion", label: "Autoevaluación", icon: "check" },
      { href: "/app/diagnostico", label: "Diagnóstico", icon: "chart" },
      { href: "/app/plan", label: "Plan de 3 metas", icon: "route" },
      { href: "/app/plan/residuos", label: "Guía de una meta", icon: "book" },
      { href: "/app/erp", label: "Mini ERP", icon: "chart" },
      { href: "/app/erp/ventas", label: "Ventas", icon: "chart" },
      { href: "/app/erp/costos", label: "Costos", icon: "chart" },
      { href: "/app/erp/mermas", label: "Mermas", icon: "residuos" },
      { href: "/app/erp/inventario", label: "Inventario", icon: "doc" },
      { href: "/app/lotes", label: "Lotes y rótulos", icon: "bpa", note: "Carencia y QR" },
      { href: "/app/score", label: "Mi score", icon: "chart" },
      { href: "/app/recepciones", label: "Mis recepciones", icon: "check" },
      { href: "/app/mensajes", label: "Mensajes", icon: "chat" },
      { href: "/app/aprender", label: "Aprender", icon: "book" },
      { href: "/app/beneficios", label: "Beneficios", icon: "route" },
      { href: "/app/perfil", label: "Perfil", icon: "lock" },
      { href: "/app/consentimiento", label: "Autorización de datos", icon: "lock" },
    ],
  },
  {
    title: "Back-office Smile",
    intro: "Escritorio, en línea. Para Compras, Calidad y Administración.",
    entries: [
      { href: "/smile", label: "Resumen", icon: "chart" },
      { href: "/smile/proveedores", label: "Proveedores", icon: "doc" },
      { href: "/smile/proveedores/demo", label: "Expediente de un proveedor", icon: "doc" },
      { href: "/smile/recepciones", label: "Recepciones", icon: "check" },
      { href: "/smile/funnel", label: "Funnel", icon: "route" },
      { href: "/smile/esg", label: "Consola ESG", icon: "bpa" },
      { href: "/smile/reportes", label: "Reportes", icon: "doc" },
      { href: "/smile/admin", label: "Administración", icon: "lock" },
    ],
  },
  {
    title: "Acceso",
    intro: "Con la demo abierta no hace falta ingresar.",
    entries: [
      { href: "/ingresar", label: "Ingresar", icon: "lock" },
      { href: "/registro", label: "Registrar mi finca", icon: "doc" },
      { href: "/recuperar", label: "Recuperar contraseña", icon: "phone" },
    ],
  },
];

export default function DemoIndexPage() {
  return (
    <main className="mx-auto flex min-h-svh max-w-5xl flex-col gap-10 px-[var(--gutter)] py-10">
      <header className="flex flex-col gap-3">
        <p className="brand text-app-title leading-none">
          smile<span className="dot">.</span>
        </p>
        <h1 className="font-display text-[length:var(--fs-h2)] leading-[var(--lh-heading)]">
          Academia de Proveedores · <em className="text-olive-600">demo</em>
        </h1>
        <p className="max-w-[60ch] text-ink-soft">Prueba de concepto navegable. Los datos son de demostración y se guardan solo en este navegador.</p>
      </header>
      {GROUPS.map((group) => (
        <section key={group.title} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-app-title">{group.title}</h2>
            <p className="text-ink-soft">{group.intro}</p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.entries.map((entry) => (
              <li key={entry.href}>
                <Link
                  href={entry.href}
                  className="flex min-h-[3.7rem] items-center gap-3 rounded-button border-[1.5px] border-line bg-white px-4 py-3 transition-[border-color] duration-[var(--dur-s)] hover:border-olive-600"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-100 text-olive-800">
                    <Icon name={entry.icon} size="1.3rem" />
                  </span>
                  <span className="flex flex-col">
                    <span className="font-bold">{entry.label}</span>
                    <span className="text-app-caption text-ink-soft">{entry.note ?? entry.href}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
