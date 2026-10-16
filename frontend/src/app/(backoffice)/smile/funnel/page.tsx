import { DemoNote, PageHeader } from "../_ui/kit";
import { FunnelDashboard } from "./FunnelDashboard";

export const metadata = { title: "Funnel" };

export default function FunnelPage() {
  return (
    <>
      <PageHeader
        eyebrow="Funnel · RF-RPT-002"
        title="Seis etapas, un mismo camino"
        emphasis={["camino"]}
        lead="Del registro a proveedor sostenible preferente. La etapa se recalcula cada cuatrimestre con la autoevaluación, las recepciones y el uso de la app (S-08)."
      />
      <FunnelDashboard />
      <DemoNote />
    </>
  );
}
