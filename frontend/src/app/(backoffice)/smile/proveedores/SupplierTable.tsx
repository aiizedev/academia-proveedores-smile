"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, SelectField } from "@/components/ui";
import { MUNICIPALITIES, STAGES, SUPPLIERS, type Segment, type Stage } from "@/mocks/smile";
import { SegmentBadge, StageBadge } from "../_ui/kit";

export function SupplierTable() {
  const [stage, setStage] = useState<Stage | "">("");
  const [segment, setSegment] = useState<Segment | "">("");
  const [municipality, setMunicipality] = useState("");
  const [text, setText] = useState("");

  const rows = useMemo(() => {
    const q = text.trim().toLowerCase();
    return SUPPLIERS.filter(
      (s) =>
        (!stage || s.stage === stage) &&
        (!segment || s.segment === segment) &&
        (!municipality || s.municipality === municipality) &&
        (!q || `${s.farm} ${s.rep} ${s.nit}`.toLowerCase().includes(q)),
    );
  }, [stage, segment, municipality, text]);

  return (
    <>
      <div className="mb-4 grid grid-cols-4 gap-4">
        <SelectField
          label="Etapa"
          placeholder="Todas"
          value={stage}
          onChange={(e) => setStage(e.target.value as Stage | "")}
          options={[{ value: "", label: "Todas" }, ...STAGES.map((s) => ({ value: s.code, label: `${s.code} · ${s.name}` }))]}
        />
        <SelectField
          label="Segmento"
          placeholder="Todos"
          value={segment}
          onChange={(e) => setSegment(e.target.value as Segment | "")}
          options={[
            { value: "", label: "Todos" },
            { value: "ESTRATEGICO", label: "Estratégico" },
            { value: "LOCAL", label: "Local" },
          ]}
        />
        <SelectField
          label="Municipio"
          placeholder="Todos"
          value={municipality}
          onChange={(e) => setMunicipality(e.target.value)}
          options={[{ value: "", label: "Todos" }, ...MUNICIPALITIES.map((m) => ({ value: m, label: m }))]}
        />
        <div className="flex flex-col gap-2">
          <label htmlFor="buscar" className="text-app-small font-bold">
            Buscar
          </label>
          <input
            id="buscar"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Finca, nombre o NIT"
            className="h-14 rounded-control border-[1.5px] border-line bg-white px-4 text-app-answer outline-none focus:border-olive-600"
          />
        </div>
      </div>

      <Card>
        <p className="mb-2 text-app-small text-ink-soft">
          {rows.length} de {SUPPLIERS.length} proveedores
        </p>
        <table className="w-full text-left text-app-small">
          <thead className="text-ink-soft">
            <tr>
              <th className="py-2">Proveedor</th>
              <th>NIT</th>
              <th>Municipio</th>
              <th>Segmento</th>
              <th>Etapa</th>
              <th className="text-right">Score</th>
              <th className="text-right">Merma</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-line">
                <td className="py-2">
                  <Link href={`/smile/proveedores/${s.id}`} className="font-bold text-olive-800 underline">
                    {s.farm}
                  </Link>
                  <span className="block text-ink-soft">{s.rep}</span>
                </td>
                <td className="tabular-nums">{s.nit}</td>
                <td>
                  {s.municipality}
                  <span className="block text-ink-soft">{s.department}</span>
                </td>
                <td><SegmentBadge segment={s.segment} /></td>
                <td><StageBadge stage={s.stage} /></td>
                <td className="text-right tabular-nums">{s.score}</td>
                <td className="text-right font-bold tabular-nums">{s.wastePct} %</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <p className="py-6 text-center text-ink-soft">Ningún proveedor coincide con los filtros.</p> : null}
      </Card>
    </>
  );
}
