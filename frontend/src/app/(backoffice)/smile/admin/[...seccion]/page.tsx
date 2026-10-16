import { PageStub } from "@/components/shell/PageStub";

export const metadata = { title: "Administración" };

export default async function AdminSeccionPage({ params }: { params: Promise<{ seccion: string[] }> }) {
  const { seccion } = await params;
  return <PageStub eyebrow="Administración" title={<>{seccion.join(" / ")}</>} refs="CU-22…24" />;
}
