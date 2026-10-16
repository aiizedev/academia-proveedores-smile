import { Suspense } from "react";
import { DiagnosisRoute } from "@/features/assessment/DiagnosisScreen";

export const metadata = { title: "Diagnóstico" };

/* ?practica=1 (demo) muestra el diagnóstico del borrador de práctica. */
export default function DiagnosticoPage() {
  return (
    <Suspense>
      <DiagnosisRoute />
    </Suspense>
  );
}
