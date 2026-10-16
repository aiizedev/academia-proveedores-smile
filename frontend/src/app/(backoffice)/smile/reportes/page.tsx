import { DemoNote, PageHeader } from "../_ui/kit";
import { ReportButtons } from "./ReportButtons";

export const metadata = { title: "Reportes" };

export default function ReportesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Reportes · RF-RPT-005"
        title="Reportes en un clic"
        emphasis={["clic"]}
        lead="Respetan los filtros de arriba. En la demo el CSV se genera en el navegador; en producción la API entrega PDF y XLSX en menos de 30 s para 450 proveedores."
      />
      <ReportButtons />
      <DemoNote />
    </>
  );
}
