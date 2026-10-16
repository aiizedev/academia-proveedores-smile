import { DemoNote, PageHeader } from "../_ui/kit";
import { RiesgoDashboard } from "./RiesgoDashboard";

export const metadata = { title: "Visor de riesgo" };

export default function RiesgoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Visor de riesgo · RF-RPT-001"
        title="A quién acompañar primero"
        emphasis={["primero"]}
        lead="Cada punto es un proveedor: a la derecha, más sostenible; arriba, más volumen para Smile. Seleccione uno para ver su ficha al lado."
      />
      <RiesgoDashboard />
      <DemoNote />
    </>
  );
}
