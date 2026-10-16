"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState, type FormEvent, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { CountUp, Reveal } from "@/components/motion";
import { Button, Field, SelectField, Toast } from "@/components/ui";
import { T } from "@/design/motion-react";
import { formatCOP, formatNumber } from "@/lib/format";
import { COST_CATEGORIES, COSTS, PRODUCTS, SALES, STOCK, WASTE, WASTE_CAUSES, type CostRow, type SaleRow, type StockRow, type WasteRow } from "@/mocks/app";
import { DemoNote, ListRow, ScreenTitle, SectionTitle, day } from "./parts";

/* /app/erp/* (demo): formulario que agrega en memoria (U-04 valores por
   defecto, U-05 teclado numérico), toast al guardar y lista animada. */
const today = () => new Date().toISOString().slice(0, 10);
const digits = (v: string) => Number(v.replace(/\D/g, "")) || 0;
const options = (list: readonly string[]) => list.map((v) => ({ value: v, label: v }));

function useSaved() {
  const [toast, setToast] = useState<{ message: string; n: number } | null>(null);
  const done = useCallback(() => setToast(null), []);
  const show = (message: string) => setToast((t) => ({ message, n: (t?.n ?? 0) + 1 }));
  return { show, node: toast ? <Toast key={toast.n} message={toast.message} onDone={done} /> : null };
}

function FormCard({ title, onSubmit, children, submit }: { title: string; onSubmit: (e: FormEvent) => void; children: ReactNode; submit: string }) {
  return (
    <Reveal>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-card border border-line bg-white p-4">
        <p className="flex items-center gap-2 text-[0.72rem] font-extrabold uppercase tracking-[var(--tracking-caps)] text-olive-600">
          <Icon name="plus" size="0.95rem" /> {title}
        </p>
        {children}
        <Button type="submit" icon={<Icon name="check" />}>
          {submit}
        </Button>
      </form>
    </Reveal>
  );
}

function Total({ label, value, format }: { label: string; value: number; format: (n: number) => string }) {
  return (
    <div className="grain relative flex items-baseline justify-between gap-3 overflow-hidden rounded-card bg-olive-800 px-4 py-4 text-cream">
      <span className="relative z-[2] text-app-small text-olive-300">{label}</span>
      <motion.span key={value} className="relative z-[2] font-display text-[1.9rem] leading-none tracking-[-0.03em]" initial={{ scale: 0.92 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 12 }}>
        <CountUp value={value} format={(n) => format(Math.round(n))} />
      </motion.span>
    </div>
  );
}

function Rows<T extends { id: string }>({ rows, render }: { rows: T[]; render: (r: T) => { title: string; detail: string; value: string; icon: IconName } }) {
  return (
    <motion.ul layout className="flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {rows.map((r, i) => (
          <ListRow key={r.id} index={i} {...render(r)} />
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}

export function SalesLedger() {
  const [rows, setRows] = useState<SaleRow[]>(SALES);
  const [product, setProduct] = useState<string>(PRODUCTS[0]);
  const [quantity, setQuantity] = useState("");
  const [amount, setAmount] = useState("");
  const saved = useSaved();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!digits(quantity) || !digits(amount)) return;
    setRows([{ id: crypto.randomUUID(), date: today(), product, quantity: digits(quantity), unit: "kg", amountCop: digits(amount), customer: "Grupo Smile" }, ...rows]);
    setQuantity("");
    setAmount("");
    saved.show("Venta guardada en su teléfono");
  };
  return (
    <section className="flex flex-col gap-6">
      <ScreenTitle eyebrow="Mini ERP" title="Sus ventas" emphasis={["ventas"]} intro="Anote cada venta en menos de un minuto." />
      <Total label="Vendido este mes" value={rows.reduce((s, r) => s + r.amountCop, 0)} format={formatCOP} />
      <FormCard title="Nueva venta" onSubmit={submit} submit="Guardar venta">
        <SelectField label="Producto" placeholder="Elija el producto" value={product} onChange={(e) => setProduct(e.target.value)} options={options(PRODUCTS)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cantidad (kg)" inputMode="decimal" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <Field label="Valor (COP)" inputMode="numeric" value={amount ? formatCOP(digits(amount)) : ""} onChange={(e) => setAmount(e.target.value)} />
        </div>
      </FormCard>
      <SectionTitle>Últimas ventas</SectionTitle>
      <Rows rows={rows} render={(r) => ({ icon: "trend", title: `${r.product} · ${formatNumber(r.quantity)} ${r.unit}`, detail: `${day(r.date)} · ${r.customer}`, value: formatCOP(r.amountCop) })} />
      <DemoNote />
      {saved.node}
    </section>
  );
}

export function CostsLedger() {
  const [rows, setRows] = useState<CostRow[]>(COSTS);
  const [category, setCategory] = useState<string>(COST_CATEGORIES[0]);
  const [detail, setDetail] = useState("");
  const [amount, setAmount] = useState("");
  const saved = useSaved();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!digits(amount)) return;
    setRows([{ id: crypto.randomUUID(), date: today(), category, detail: detail || category, amountCop: digits(amount) }, ...rows]);
    setDetail("");
    setAmount("");
    saved.show("Costo guardado en su teléfono");
  };
  return (
    <section className="flex flex-col gap-6">
      <ScreenTitle eyebrow="Mini ERP" title="Sus costos" emphasis={["costos"]} intro="Insumos, mano de obra, transporte y empaques." />
      <Total label="Gastado este mes" value={rows.reduce((s, r) => s + r.amountCop, 0)} format={formatCOP} />
      <FormCard title="Nuevo costo" onSubmit={submit} submit="Guardar costo">
        <SelectField label="Categoría" placeholder="Elija la categoría" value={category} onChange={(e) => setCategory(e.target.value)} options={options(COST_CATEGORIES)} />
        <Field label="Detalle (opcional)" value={detail} onChange={(e) => setDetail(e.target.value)} />
        <Field label="Valor (COP)" inputMode="numeric" value={amount ? formatCOP(digits(amount)) : ""} onChange={(e) => setAmount(e.target.value)} />
      </FormCard>
      <SectionTitle>Últimos costos</SectionTitle>
      <Rows rows={rows} render={(r) => ({ icon: "coins", title: r.category, detail: `${day(r.date)} · ${r.detail}`, value: formatCOP(r.amountCop) })} />
      <DemoNote />
      {saved.node}
    </section>
  );
}

export function WasteLedger() {
  const [rows, setRows] = useState<WasteRow[]>(WASTE);
  const [product, setProduct] = useState<string>(PRODUCTS[0]);
  const [cause, setCause] = useState<string>(WASTE_CAUSES[0]);
  const [kg, setKg] = useState("");
  const saved = useSaved();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(kg.replace(",", "."));
    if (!value) return;
    setRows([{ id: crypto.randomUUID(), date: today(), product, kg: value, cause }, ...rows]);
    setKg("");
    saved.show("Merma guardada en su teléfono");
  };
  return (
    <section className="flex flex-col gap-6">
      <ScreenTitle eyebrow="Mini ERP" title="Sus mermas" emphasis={["mermas"]} intro="Lo que se pierde y por qué: así sabemos dónde mejorar." />
      <Total label="Perdido este mes" value={rows.reduce((s, r) => s + r.kg, 0)} format={(n) => `${formatNumber(n)} kg`} />
      <FormCard title="Nueva merma" onSubmit={submit} submit="Guardar merma">
        <SelectField label="Producto" placeholder="Elija el producto" value={product} onChange={(e) => setProduct(e.target.value)} options={options(PRODUCTS)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cantidad (kg)" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} />
          <SelectField label="Causa" placeholder="Causa" value={cause} onChange={(e) => setCause(e.target.value)} options={options(WASTE_CAUSES)} />
        </div>
      </FormCard>
      <SectionTitle>Últimas mermas</SectionTitle>
      <Rows rows={rows} render={(r) => ({ icon: "residuos", title: r.product, detail: `${day(r.date)} · ${r.cause}`, value: `${formatNumber(r.kg, 1)} kg` })} />
      <DemoNote />
      {saved.node}
    </section>
  );
}

export function StockLedger() {
  const [rows, setRows] = useState<StockRow[]>(STOCK);
  const [product, setProduct] = useState<string>(PRODUCTS[0]);
  const [kg, setKg] = useState("");
  const saved = useSaved();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(kg.replace(",", "."));
    if (!value) return;
    const existing = rows.find((r) => r.product === product);
    setRows(
      existing
        ? [{ ...existing, kg: existing.kg + value, updated: today() }, ...rows.filter((r) => r.product !== product)]
        : [{ id: crypto.randomUUID(), product, kg: value, updated: today() }, ...rows],
    );
    setKg("");
    saved.show("Entrada guardada en su teléfono");
  };
  const total = rows.reduce((s, r) => s + r.kg, 0);
  return (
    <section className="flex flex-col gap-6">
      <ScreenTitle eyebrow="Mini ERP" title="Su inventario" emphasis={["inventario"]} intro="Lo que tiene listo para vender, por producto." />
      <Total label="En bodega" value={total} format={(n) => `${formatNumber(n)} kg`} />
      <FormCard title="Nueva entrada" onSubmit={submit} submit="Registrar entrada">
        <SelectField label="Producto" placeholder="Elija el producto" value={product} onChange={(e) => setProduct(e.target.value)} options={options(PRODUCTS)} />
        <Field label="Entrada (kg)" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} />
      </FormCard>
      <SectionTitle>Por producto</SectionTitle>
      <motion.ul layout className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <motion.li layout key={r.id} className="flex flex-col gap-2 rounded-button border border-line bg-white p-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { ...T.enter, delay: i * 0.05 } }}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold">{r.product}</span>
              <span className="font-display text-[1.15rem] tabular-nums">{formatNumber(r.kg)} kg</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-pill bg-olive-100">
              <motion.div className="h-full rounded-pill bg-olive-600" initial={{ width: 0 }} animate={{ width: `${(r.kg / Math.max(...rows.map((x) => x.kg))) * 100}%` }} transition={T.bar} />
            </div>
            <span className="text-app-caption text-ink-soft">Actualizado {day(r.updated)}</span>
          </motion.li>
        ))}
      </motion.ul>
      <DemoNote />
      {saved.node}
    </section>
  );
}
