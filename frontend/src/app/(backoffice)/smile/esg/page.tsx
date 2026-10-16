import { DemoNote, PageHeader } from "../_ui/kit";
import { EsgDashboard } from "./EsgDashboard";

export const metadata = { title: "Consola ESG" };

export default function EsgPage() {
  return (
    <>
      <PageHeader
        eyebrow="Consola ESG · RF-RPT-004"
        title="Una cadena que se puede mostrar"
        emphasis={["mostrar"]}
        lead="Cumplimiento por marco a partir del mapeo de cada pregunta del banco v4, cadena libre de trabajo infantil y trazabilidad de los lotes."
      />
      <EsgDashboard />
      <DemoNote />
    </>
  );
}
