"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type FormEvent } from "react";
import { Field, SelectField } from "@/components/ui";
import { Icon } from "@/components/icons";
import { DUR, T } from "@/design/motion-react";
import { PRESET } from "@/design/motion";
import { cn } from "@/lib/cn";
import { RECEPTIONS, SUPPLIERS, WASTE_CAUSES, WASTE_TARGET, type Reception } from "@/mocks/smile";
import { fmtPct } from "../_ui/data";

const farm = (id: string) => SUPPLIERS.find((s) => s.id === id)?.farm ?? id;
const PRODUCTS = ["Tomate chonto", "Mora de Castilla", "Lulo", "Papa criolla", "Cebolla cabezona", "Uchuva", "Aguacate Hass", "Zanahoria"];
const LABEL_RE = /^SML-FRV-\d{4,}$/i;

type Errors = Partial<Record<"supplier" | "product" | "kg" | "rejected" | "cause" | "label", string>>;

export function ReceptionsBoard() {
  const [rows, setRows] = useState<Reception[]>(() => [...RECEPTIONS]);
  const [supplierId, setSupplierId] = useState("");
  const [product, setProduct] = useState("");
  const [kg, setKg] = useState("");
  const [rejected, setRejected] = useState("");
  const [cause, setCause] = useState("");
  const [label, setLabel] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), PRESET.toastHold * 1000 + 600);
    return () => clearTimeout(id);
  }, [toast]);

  const total = Number(kg.replace(",", "."));
  const bad = Number((rejected || "0").replace(",", "."));
  const pct = total > 0 && bad >= 0 ? Math.round((bad / total) * 1000) / 10 : null;

  function validate(): Errors {
    const e: Errors = {};
    if (!supplierId) e.supplier = "Elija el proveedor que entrega.";
    if (!product) e.product = "Elija el producto.";
    if (!(total > 0)) e.kg = "Escriba los kilos recibidos (mayor que 0).";
    else if (total > 20000) e.kg = "¿Seguro? Es más de lo que cabe en un camión (20 t).";
    if (rejected && (!(bad >= 0) || bad > total)) e.rejected = "Debe estar entre 0 y los kilos recibidos.";
    if (bad > 0 && !cause) e.cause = "Indique la causa principal del rechazo.";
    if (label && !LABEL_RE.test(label.trim())) e.label = "El rótulo tiene la forma SML-FRV-0000.";
    return e;
  }

  function submit(ev: FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    setTimeout(() => {
      const id = `REC-${String(rows.length + 1).padStart(3, "0")}`;
      setRows((rs) => [{ id, date: "2026-10-16", supplierId, product, kg: total, rejectedKg: bad, onTime: true, labelOk: label.trim().length > 0 }, ...rs]);
      setFresh(id);
      setSaving(false);
      setToast(`Recepción ${id} guardada · ${farm(supplierId)}`);
      setProduct("");
      setKg("");
      setRejected("");
      setCause("");
      setLabel("");
    }, DUR.m * 1000);
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[24rem_minmax(0,1fr)]">
      <section className="sticky top-6 rounded-[var(--radius-card)] border border-line bg-white p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-rose-100 text-olive-800">
            <Icon name="doc" size={22} />
          </span>
          <div>
            <h2 className="font-display text-[1.35rem] leading-tight">Registrar recepción</h2>
            <p className="text-app-caption text-ink-soft">Bodega Smile · hoy, 16 de octubre</p>
          </div>
        </div>
        <form onSubmit={submit} noValidate className="mt-5 flex flex-col gap-4">
          <SelectField label="Proveedor" placeholder="Elija un proveedor" value={supplierId} error={errors.supplier} onChange={(e) => setSupplierId(e.target.value)} options={SUPPLIERS.map((s) => ({ value: s.id, label: `${s.farm} · ${s.municipality}` }))} />
          <SelectField label="Producto" placeholder="Elija un producto" value={product} error={errors.product} onChange={(e) => setProduct(e.target.value)} options={PRODUCTS.map((p) => ({ value: p, label: p }))} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kilos recibidos" inputMode="decimal" value={kg} error={errors.kg} onChange={(e) => setKg(e.target.value)} placeholder="450" />
            <Field label="Kilos rechazados" inputMode="decimal" value={rejected} error={errors.rejected} onChange={(e) => setRejected(e.target.value)} placeholder="0" />
          </div>
          <AnimatePresence initial={false}>
            {pct !== null ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={T.ui} className="overflow-hidden">
                <div className={cn("rounded-[var(--radius-control)] p-3", pct > WASTE_TARGET ? "bg-rose-100" : "bg-olive-25")}>
                  <div className="flex justify-between text-app-small">
                    <span className="font-semibold">Rechazo del lote</span>
                    <strong style={{ fontVariantNumeric: "tabular-nums" }}>{fmtPct(pct)}</strong>
                  </div>
                  <div className="relative mt-2 h-2 rounded-[var(--radius-pill)] bg-white">
                    <motion.div className={cn("h-full rounded-[var(--radius-pill)]", pct > WASTE_TARGET ? "bg-rose-700" : "bg-olive-800")} animate={{ width: `${Math.min(100, (pct / 25) * 100)}%` }} transition={T.ui} />
                    <span className="absolute -top-1 h-4 w-[2px] bg-ink" style={{ left: `${(WASTE_TARGET / 25) * 100}%` }} title={`Meta ${WASTE_TARGET} %`} />
                  </div>
                  <p className="mt-1.5 text-app-caption text-ink-soft">{pct > WASTE_TARGET ? `Por encima de la meta del ${WASTE_TARGET} %.` : `Dentro de la meta del ${WASTE_TARGET} %. ¡Bien!`}</p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
          <AnimatePresence initial={false}>
            {bad > 0 ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={T.ui} className="overflow-hidden">
                <SelectField label="Causa del rechazo (C-06)" placeholder="Elija la causa" value={cause} error={errors.cause} onChange={(e) => setCause(e.target.value)} options={WASTE_CAUSES.map((c) => ({ value: c.code, label: c.label }))} />
              </motion.div>
            ) : null}
          </AnimatePresence>
          <Field label="Código de rótulo" value={label} error={errors.label} onChange={(e) => setLabel(e.target.value)} placeholder="SML-FRV-0000" hint="Con rótulo válido, el lote cuenta como carencia verificada." />
          <button
            type="submit"
            disabled={saving}
            className="relative mt-1 inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-[var(--radius-button)] bg-olive-800 text-app-button font-extrabold text-cream transition-[scale] active:scale-[var(--press-scale)] disabled:opacity-80"
          >
            {saving ? (
              <>
                <motion.span className="size-4 rounded-full border-2 border-cream border-t-transparent" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: DUR.l, ease: "linear" }} />
                Guardando…
              </>
            ) : (
              <>Guardar recepción <Icon name="arrow" size={18} /></>
            )}
          </button>
        </form>
      </section>

      <section className="rounded-[var(--radius-card)] border border-line bg-white p-6">
        <header className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="font-display text-[1.35rem] leading-tight">Últimas recepciones</h2>
            <p className="text-app-small text-ink-soft">{rows.length} en octubre · rechazo sobre la meta en rosa</p>
          </div>
        </header>
        <ul>
          <AnimatePresence initial={true}>
            {rows.slice(0, 18).map((r, i) => {
              const p = r.kg > 0 ? Math.round((r.rejectedKg / r.kg) * 1000) / 10 : 0;
              const over = p > WASTE_TARGET;
              const isNew = r.id === fresh;
              return (
                <motion.li
                  key={r.id}
                  layout
                  initial={{ opacity: 0, y: isNew ? -16 : 12, backgroundColor: isNew ? "var(--rose-100)" : "var(--white)" }}
                  animate={{ opacity: 1, y: 0, backgroundColor: "var(--white)", transition: { opacity: { ...T.ui, delay: isNew ? 0 : Math.min(i, 12) * 0.03 }, y: T.enter, backgroundColor: { duration: DUR["2xl"], delay: DUR.l } } }}
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 border-b border-line px-2 py-3"
                >
                  <span className={cn("grid size-9 place-items-center rounded-full", r.labelOk ? "bg-olive-25 text-olive-700" : "bg-rose-100 text-rose-700")} title={r.labelOk ? "Rótulo válido" : "Sin rótulo"}>
                    <Icon name={r.labelOk ? "check" : "alert"} size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-app-small font-bold">{r.product} · {farm(r.supplierId)}</span>
                    <span className="block text-app-caption text-ink-soft">{r.id} · {r.date} · {r.onTime ? "a tiempo" : "con retraso"} · {r.labelOk ? "carencia verificada" : "sin rótulo"}</span>
                  </span>
                  <span className="text-right text-app-small" style={{ fontVariantNumeric: "tabular-nums" }}>{r.kg.toLocaleString("es-CO")} kg</span>
                  <span className={cn("min-w-16 rounded-[var(--radius-pill)] px-2.5 py-1 text-center text-app-caption font-bold", over ? "bg-rose-100 text-rose-700" : "bg-olive-25 text-olive-700")} style={{ fontVariantNumeric: "tabular-nums" }}>
                    {fmtPct(p)}
                  </span>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </section>

      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast}
            role="status"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, transition: T.exit }}
            transition={T.enter}
            className="fixed right-8 bottom-8 z-[var(--z-toast)] flex items-center gap-2 rounded-[var(--radius-pill)] bg-olive-900 px-5 py-3.5 text-app-small font-bold text-cream shadow-[var(--shadow-float)]"
          >
            <span className="text-rose-500"><Icon name="check" size={18} /></span>
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
