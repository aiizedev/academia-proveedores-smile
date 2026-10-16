import { Suspense } from "react";
import { AssessmentRoute } from "@/features/assessment/AssessmentFlow";

export const metadata = { title: "Autoevaluación" };

/* ?nueva=1 (demo) abre un borrador de práctica; useSearchParams exige Suspense
   para que la página siga siendo estática y se precachee para uso sin señal. */
export default function AutoevaluacionPage() {
  return (
    <Suspense>
      <AssessmentRoute />
    </Suspense>
  );
}
