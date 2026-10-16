"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, SelectField, Toast } from "@/components/ui";
import { formatCOP, formatNumber } from "@/lib/format";
import { COST_CATEGORIES, COSTS, PRODUCTS, SALES, STOCK, WASTE, WASTE_CAUSES, type CostRow, type SaleRow, type StockRow, type WasteRow } from "@/mocks/app";
import { DemoNote, ScreenTitle, day } from "./parts";

/* /app/erp/* (demo): lista del registro y formulario que agrega en memoria
   (U-04 valores por defecto, U-05 teclado numérico). Sin WatermelonDB todavía. */
const today = () => new Date().toISOString().slice(0, 10);
const digits = (v: string) => Number(v.replace(/\D/g, "")) || 0;
const options = (list: readonly string[]) => list.map((v) => ({ value: v, label: v }));

function Row({ title, detail, value }: { title: string; detail: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-line-light py-3 last:border-0">
      <div className="flex flex-col">
        <span className="font-bold">{title}</span>
        <span className="text-app-caption text-ink-soft">{detail}</span>
      </div>
      <span className="font-display text-app-h3 tabular-nums">{value}</span>
    </li>
  );
}

function useSaved() {
  const [toast, setToast] = useState<string | null>(null);
  return { toast, show: setToast, node: toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null };
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
    saved.show("Venta guardada.");
  };
  return (
    <section className="flex flex-col gap-5">
      <ScreenTitle eyebrow="Mini ERP">
        Sus <em>ventas</em>
      </ScreenTitle>
      <form onSubmit={submit} className="flex flex-col gap-3 rounded-card border border-line bg-white p-4">
        <SelectField label="Producto" placeholder="Elija el producto" value={product} onChange={(e) => setProduct(e.target.value)} options={options(PRODUCTS)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cantidad (kg)" inputMode="decimal" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <Field label="Valor (COP)" inputMode="numeric" value={amount ? formatCOP(digits(amount)) : ""} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <Button type="submit">Guardar venta</Button>
      </form>
      <ul>
        {rows.map((r) => (
          <Row key={r.id} title={`${r.product} · ${formatNumber(r.quantity)} ${r.unit}`} detail={`${day(r.date)} · ${r.customer}`} value={formatCOP(r.amountCop)} />
        ))}
      </ul>
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
    saved.show("Costo guardado.");
  };
  return (
    <section className="flex flex-col gap-5">
      <ScreenTitle eyebrow="Mini ERP">
        Sus <em>costos</em>
      </ScreenTitle>
      <form onSubmit={submit} className="flex flex-col gap-3 rounded-card border border-line bg-white p-4">
        <SelectField label="Categoría" placeholder="Elija la categoría" value={category} onChange={(e) => setCategory(e.target.value)} options={options(COST_CATEGORIES)} />
        <Field label="Detalle (opcional)" value={detail} onChange={(e) => setDetail(e.target.value)} />
        <Field label="Valor (COP)" inputMode="numeric" value={amount ? formatCOP(digits(amount)) : ""} onChange={(e) => setAmount(e.target.value)} />
        <Button type="submit">Guardar costo</Button>
      </form>
      <ul>
        {rows.map((r) => (
          <Row key={r.id} title={r.category} detail={`${day(r.date)} · ${r.detail}`} value={formatCOP(r.amountCop)} />
        ))}
      </ul>
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
    saved.show("Merma guardada.");
  };
  return (
    <section className="flex flex-col gap-5">
      <ScreenTitle eyebrow="Mini ERP">
        Sus <em>mermas</em>
      </ScreenTitle>
      <form onSubmit={submit} className="flex flex-col gap-3 rounded-card border border-line bg-white p-4">
        <SelectField label="Producto" placeholder="Elija el producto" value={product} onChange={(e) => setProduct(e.target.value)} options={options(PRODUCTS)} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cantidad (kg)" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} />
          <SelectField label="Causa" placeholder="Causa" value={cause} onChange={(e) => setCause(e.target.value)} options={options(WASTE_CAUSES)} />
        </div>
        <Button type="submit">Guardar merma</Button>
      </form>
      <ul>
        {rows.map((r) => (
          <Row key={r.id} title={r.product} detail={`${day(r.date)} · ${r.cause}`} value={`${formatNumber(r.kg, 1)} kg`} />
        ))}
      </ul>
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
        ? rows.map((r) => (r.product === product ? { ...r, kg: r.kg + value, updated: today() } : r))
        : [{ id: crypto.randomUUID(), product, kg: value, updated: today() }, ...rows],
    );
    setKg("");
    saved.show("Entrada guardada.");
  };
  return (
    <section className="flex flex-col gap-5">
      <ScreenTitle eyebrow="Mini ERP" intro="Lo que tiene listo para vender, por producto.">
        Su <em>inventario</em>
      </ScreenTitle>
      <form onSubmit={submit} className="flex flex-col gap-3 rounded-card border border-line bg-white p-4">
        <SelectField label="Producto" placeholder="Elija el producto" value={product} onChange={(e) => setProduct(e.target.value)} options={options(PRODUCTS)} />
        <Field label="Entrada (kg)" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} />
        <Button type="submit">Registrar entrada</Button>
      </form>
      <ul>
        {rows.map((r) => (
          <Row key={r.id} title={r.product} detail={`Actualizado ${day(r.updated)}`} value={`${formatNumber(r.kg)} kg`} />
        ))}
      </ul>
      <DemoNote />
      {saved.node}
    </section>
  );
}
