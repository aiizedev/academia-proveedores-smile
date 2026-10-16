import { DemoNote, PageHeader } from "../_ui/kit";
import { CalidadDashboard } from "./CalidadDashboard";

export const metadata = { title: "Calidad" };

export default function CalidadPage() {
  return (
    <>
      <PageHeader
        eyebrow="Calidad · RF-RPT-003"
        title="Menos merma, lotes más seguros"
        emphasis={["seguros"]}
        lead="La merma recibida en bodega frente a la meta del 8 % y la línea base del 22 %, sus causas y los lotes con período de carencia verificado."
      />
      <CalidadDashboard />
      <DemoNote />
    </>
  );
}
