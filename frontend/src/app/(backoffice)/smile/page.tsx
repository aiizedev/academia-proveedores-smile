import { DemoNote, PageHeader } from "./_ui/kit";
import { ResumenDashboard } from "./ResumenDashboard";

export const metadata = { title: "Resumen" };

export default function ResumenPage() {
  return (
    <>
      <PageHeader
        eyebrow="Resumen ejecutivo"
        title="La red de proveedores, de un vistazo"
        emphasis={["vistazo"]}
        lead="Riesgo, maduración y merma recibida de la Academia. Filtre arriba y todo el tablero responde."
      />
      <ResumenDashboard />
      <DemoNote />
    </>
  );
}
