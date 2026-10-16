import { Card } from "@/components/ui";
import { QUESTION_BANK } from "@/mocks/smile";
import { DemoNote, Kpi, PageHeader, SectionTitle } from "../_ui/kit";

export const metadata = { title: "Administración" };

type Question = { id: string; axis: string; weight: number; text: string; categories?: string[]; min_size?: string; frameworks?: string[] };

export default function AdminPage() {
  const sections = QUESTION_BANK.sections as ReadonlyArray<{ code: string; title: string; questions: Question[] }>;
  const total = sections.reduce((n, s) => n + s.questions.length, 0);

  return (
    <>
      <PageHeader eyebrow="Administración" title={<>Banco de <em>preguntas</em></>} />
      <div className="grid grid-cols-3 gap-4">
        <Kpi strong label="Versión publicada" value={<span className="text-[1.5rem]">{QUESTION_BANK.version}</span>} hint="Solo lectura en la demo" />
        <Kpi label="Preguntas" value={total} hint={`${sections.length} secciones`} />
        <Kpi label="Ejes" value={QUESTION_BANK.axes.length} hint={QUESTION_BANK.axes_order.join(" · ")} />
      </div>
      <div className="mt-6 flex flex-col gap-6">
        {sections.map((sec) => (
          <Card key={sec.code}>
            <SectionTitle>{sec.title}</SectionTitle>
            <table className="w-full text-left text-app-small">
              <thead className="text-ink-soft">
                <tr>
                  <th className="w-20 py-2">Id</th>
                  <th>Pregunta</th>
                  <th className="w-24">Eje</th>
                  <th className="w-16 text-right">Peso</th>
                </tr>
              </thead>
              <tbody>
                {sec.questions.map((q) => (
                  <tr key={q.id} className="border-t border-line align-top">
                    <td className="py-2 font-bold">{q.id}</td>
                    <td className="pr-4">{q.text}</td>
                    <td>{q.axis}</td>
                    <td className="text-right tabular-nums">{q.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ))}
      </div>
      <DemoNote />
    </>
  );
}
