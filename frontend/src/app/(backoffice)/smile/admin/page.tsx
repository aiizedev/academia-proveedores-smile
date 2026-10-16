import { QUESTION_BANK } from "@/mocks/smile";
import { DemoNote, PageHeader } from "../_ui/kit";
import { QuestionBank } from "./QuestionBank";

export const metadata = { title: "Banco de preguntas" };

export default function AdminPage() {
  return (
    <>
      <PageHeader
        eyebrow={`Administración · ${QUESTION_BANK.version}`}
        title="El banco de preguntas"
        emphasis={["preguntas"]}
        lead="Versión publicada, solo lectura en la demo. Navegue por sección y sector: cada pregunta muestra su eje, su peso y los marcos a los que reporta."
      />
      <QuestionBank />
      <DemoNote />
    </>
  );
}
