import { PageStub } from "@/components/shell/PageStub";

export const metadata = { title: "Ficha" };

export default function FichaPage() {
  return <PageStub eyebrow="Ficha" title={<>Datos de su <em>finca</em></>} refs="CU-04, CU-08 · RF-SUP-001…003, RF-IMP-007" />;
}
