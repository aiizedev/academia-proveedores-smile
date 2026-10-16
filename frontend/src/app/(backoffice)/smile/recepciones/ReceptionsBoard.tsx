"use client";

import { useState, type FormEvent } from "react";
import { Button, Card, Field, SelectField } from "@/components/ui";
import { RECEPTIONS, SUPPLIERS, WASTE_TARGET, type Reception } from "@/mocks/smile";
import { SectionTitle } from "../_ui/kit";

const farm = (id: string) => SUPPLIERS.find((s) => s.id === id)?.farm ?? id;

export function ReceptionsBoard() {
  const [rows, setRows] = useState<Reception[]>(() => [...RECEPTIONS]);
  const [supplierId, setSupplierId] = useState("");
  const [product, setProduct] = useState("");
  const [kg, setKg] = useState("");
  const [rejected, setRejected] = useState("");
  const [label, setLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const total = Number(kg);
    const bad = Number(rejected || 0);
    if (!supplierId || !product.trim() || !(total > 0)) return setError("Complete proveedor, producto y kilos recibidos.");
    if (bad < 0 || bad > total) return setError("Los kilos rechazados deben estar entre 0 y los kilos recibidos.");
    const id = `REC-${String(rows.length + 1).padStart(3, "0")}`;
    setRows([
      { id, date: new Date().toISOString().slice(0, 10), supplierId, product: product.trim(), kg: total, rejectedKg: bad, onTime: true, labelOk: label.trim().length > 0 },
      ...rows,
    ]);
    setError(null);
    setSaved(`Recepción ${id} registrada (solo en esta sesión de demo).`);
    setProduct("");
    setKg("");
    setRejected("");
    setLabel("");
  }

  return (
    <div className="grid grid-cols-[22rem_1fr] gap-6">
      <Card>
        <SectionTitle>Registrar recepción</SectionTitle>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <SelectField
            label="Proveedor"
            placeholder="Elija un proveedor"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            options={SUPPLIERS.map((s) => ({ value: s.id, label: s.farm }))}
          />
          <Field label="Producto" value={product} onChange={(e) => setProduct(e.target.value)} placeholder="Tomate chonto" />
          <Field label="Kilos recibidos" inputMode="decimal" value={kg} onChange={(e) => setKg(e.target.value)} />
          <Field label="Kilos rechazados" inputMode="decimal" value={rejected} onChange={(e) => setRejected(e.target.value)} hint={`Meta de merma: menos del ${WASTE_TARGET} %`} />
          <Field label="Código de rótulo" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="SML-FRV-…" hint="Valida la carencia del lote" />
          {error ? <p className="text-app-small font-bold text-rose-700">{error}</p> : null}
          {saved ? <p role="status" className="text-app-small font-bold text-olive-700">{saved}</p> : null}
          <Button type="submit">Guardar recepción</Button>
        </form>
      </Card>

      <Card>
        <SectionTitle>Últimas recepciones</SectionTitle>
        <table className="w-full text-left text-app-small">
          <thead className="text-ink-soft">
            <tr>
              <th className="py-2">Código</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Producto</th>
              <th className="text-right">Kg</th>
              <th className="text-right">Rechazo</th>
              <th>Rótulo</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 25).map((r) => {
              const pct = r.kg > 0 ? Math.round((r.rejectedKg / r.kg) * 1000) / 10 : 0;
              return (
                <tr key={r.id} className="border-t border-line">
                  <td className="py-2 font-bold">{r.id}</td>
                  <td className="tabular-nums">{r.date}</td>
                  <td>{farm(r.supplierId)}</td>
                  <td>{r.product}</td>
                  <td className="text-right tabular-nums">{r.kg}</td>
                  <td className={pct > WASTE_TARGET ? "text-right font-bold text-rose-700 tabular-nums" : "text-right tabular-nums"}>{pct} %</td>
                  <td>{r.labelOk ? "Válido" : "Sin rótulo"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
