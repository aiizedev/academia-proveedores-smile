import guides from "@/data/catalog/guides.json";
import { GuideScreen } from "@/features/assessment/GuideScreen";

export const metadata = { title: "Guía" };

// Una página estática por eje: se precachean para abrir sin conexión (HU-IMP-02).
export const dynamicParams = false;
export function generateStaticParams() {
  return guides.guides.map((g) => ({ metaId: g.axis }));
}

export default async function MetaPage({ params }: { params: Promise<{ metaId: string }> }) {
  const { metaId } = await params;
  return <GuideScreen axis={metaId} />;
}
