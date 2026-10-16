import { PageStub } from "@/components/shell/PageStub";

export const metadata = { title: "Meta" };

export default async function MetaPage({ params }: { params: Promise<{ metaId: string }> }) {
  const { metaId } = await params;
  return <PageStub eyebrow={`Meta ${metaId}`} title={<>Guía de <em>mejora</em></>} refs="CU-07 · RF-IMP-002…004" />;
}
