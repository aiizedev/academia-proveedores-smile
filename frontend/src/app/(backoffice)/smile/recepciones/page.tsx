import { DemoNote, PageHeader } from "../_ui/kit";
import { ReceptionsBoard } from "./ReceptionsBoard";

export const metadata = { title: "Recepciones" };

export default function RecepcionesPage() {
  return (
    <>
      <PageHeader eyebrow="Recepciones" title="Lo que llega a bodega" emphasis={["bodega"]} lead="Cada recepción alimenta la merma recibida y los lotes con carencia verificada del tablero de calidad." />
      <ReceptionsBoard />
      <DemoNote />
    </>
  );
}
