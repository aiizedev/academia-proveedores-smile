import { DemoNote, PageHeader } from "../_ui/kit";
import { ImpactoDashboard } from "./ImpactoDashboard";

export const metadata = { title: "Impacto" };

export default function ImpactoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Impacto · valor compartido"
        title="Lo que la red le devuelve al campo"
        emphasis={["campo"]}
        lead="Huella de carbono de la cadena, ahorro generado a los proveedores y retorno social y ambiental (simulado, marco Porter & Kramer)."
      />
      <ImpactoDashboard />
      <DemoNote />
    </>
  );
}
