import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Ingresar" };

export default function IngresarPage() {
  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="a-eyebrow">Ingresar</p>
        <h1 className="a-title">
          Bienvenido de <em>nuevo</em>
        </h1>
      </div>
      <Suspense>
        <LoginForm />
      </Suspense>
    </section>
  );
}
