import { DemoNote, PageHeader } from "../_ui/kit";
import { ReceptionsBoard } from "./ReceptionsBoard";

export const metadata = { title: "Recepciones" };

export default function RecepcionesPage() {
  return (
    <>
      <PageHeader eyebrow="Recepciones" title={<>Recepción en <em>bodega</em></>} />
      <ReceptionsBoard />
      <DemoNote />
    </>
  );
}
