import { PageStub } from "@/components/shell/PageStub";

export const metadata = { title: "Expediente" };

export default async function ExpedientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PageStub eyebrow="Expediente" title={<>{id}</>} refs="CU-16, CU-17, CU-18 · RF-SUP-005…009" />;
}
