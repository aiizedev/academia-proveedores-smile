import { DemoNote, PageHeader } from "../_ui/kit";
import { SupplierTable } from "./SupplierTable";

export const metadata = { title: "Proveedores" };

export default function ProveedoresPage() {
  return (
    <>
      <PageHeader eyebrow="Proveedores" title={<>Matriz de <em>proveedores</em></>} />
      <SupplierTable />
      <DemoNote />
    </>
  );
}
