import { DemoNote, PageHeader } from "../_ui/kit";
import { ReportButtons } from "./ReportButtons";

export const metadata = { title: "Reportes" };

export default function ReportesPage() {
  return (
    <>
      <PageHeader eyebrow="Reportes" title={<>Reportes en <em>1 clic</em></>} />
      <ReportButtons />
      <p className="mt-4 text-app-small text-ink-soft">En la demo los archivos se generan en el navegador; en producción se piden a la API como PDF o Excel.</p>
      <DemoNote />
    </>
  );
}
