import { DemoIndex } from "./DemoIndex";

/* Índice de la demo (POC): punto de entrada para recorrer todas las rutas de
   arquitectura.md §4.1, con la estética de la landing (maqueta/index.html). */
export const metadata = { title: { absolute: "Academia de Proveedores Smile · demo" } };

export default function DemoIndexPage() {
  return <DemoIndex />;
}
