import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StatusBar } from "@/components/shell/StatusBar";
import { TabBar } from "@/components/shell/TabBar";

/* PWA del proveedor (arquitectura.md §4.1): local-first, móvil.
   Los datos de negocio se leen de WatermelonDB en componentes cliente. */
export const metadata: Metadata = { title: { default: "Mi finca", template: "%s · Academia Smile" } };

export default function ProveedorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-cream">
      <StatusBar />
      <main className="flex-1 px-[var(--screen-x)] pt-[0.6rem] pb-[var(--tabbar-clearance)]">{children}</main>
      <TabBar />
    </div>
  );
}
