import Link from "next/link";

/* Landing mínima. La versión completa porta maqueta/index.html (plan frontend). */
export default function HomePage() {
  return (
    <main className="grain min-h-svh flex flex-col justify-between gap-12 px-[var(--gutter)] py-12">
      <header className="flex items-center justify-between">
        <p className="brand text-[1.9rem] leading-none">
          smile<span className="dot">.</span>
        </p>
        <Link href="/ingresar" className="rounded-pill border border-current px-5 py-3 text-[var(--fs-small)] font-semibold">
          Ingresar
        </Link>
      </header>
      <h1
        className="font-display font-[330] leading-[var(--lh-display)] tracking-[var(--tracking-display)]"
        style={{ fontSize: "var(--fs-h1)", fontVariationSettings: "var(--fv-display)" }}
      >
        Cultivar <em className="text-olive-600" style={{ fontVariationSettings: "var(--fv-accent)" }}>mejor</em> es simple
        <span className="text-rose-500">.</span>
      </h1>
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/registro" className="inline-flex min-h-12 items-center rounded-pill bg-olive-800 px-6 font-semibold text-cream">
          Registrar mi finca
        </Link>
        <p className="max-w-[36ch] text-ink-soft">
          Diagnóstico, plan de mejora y registro de ventas para los proveedores de Grupo Smile. Funciona sin señal.
        </p>
      </div>
    </main>
  );
}
