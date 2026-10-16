import { DemoNote, PageHeader } from "../_ui/kit";
import { SupplierTable } from "./SupplierTable";

export const metadata = { title: "Proveedores" };

export default function ProveedoresPage() {
  return (
    <>
      <PageHeader eyebrow="Proveedores" title="Cada finca, con su historia" emphasis={["historia"]} lead="Busque, filtre por etapa y abra el expediente de cualquier proveedor de la red." />
      <SupplierTable />
      <DemoNote />
    </>
  );
}
