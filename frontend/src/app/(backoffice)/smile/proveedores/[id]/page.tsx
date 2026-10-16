import { notFound } from "next/navigation";
import { SUPPLIERS, supplierById } from "@/mocks/smile";
import { DemoNote } from "../../_ui/kit";
import { Expediente } from "./Expediente";

export const metadata = { title: "Expediente" };

export function generateStaticParams() {
  return SUPPLIERS.map((s) => ({ id: s.id }));
}

export default async function ExpedientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!supplierById(id)) notFound();
  return (
    <>
      <Expediente id={id} />
      <DemoNote />
    </>
  );
}
