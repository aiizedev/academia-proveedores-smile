import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ScrollReset } from "@/components/shell/ScrollReset";
import { StagePanel } from "@/components/shell/StagePanel";
import { StatusBar } from "@/components/shell/StatusBar";
import { TabBar } from "@/components/shell/TabBar";
import { ConsentGuard } from "@/features/privacy/ConsentGuard";
import { LocalDatabase } from "./LocalDatabase";
import { SessionGuard } from "./SessionGuard";

/* PWA del proveedor (arquitectura.md §4.1): local-first, móvil.
   Los datos de negocio se leen de WatermelonDB en componentes cliente.
   En móvil ocupa toda la pantalla; en escritorio (≥ 900 px) va dentro de un
   marco de teléfono junto al panel de contexto (maqueta: .stage + .phone). */
export const metadata: Metadata = { title: { default: "Mi finca", template: "%s · Academia Smile" } };

export default function ProveedorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-stage stage-bg print:bg-white">
      <StagePanel />
      <div className="app-phone">
        <div className="app-screen">
          <StatusBar />
          <main id="app-scroll" className="app-scroll px-[var(--screen-x)] pt-[0.6rem] pb-[var(--tabbar-clearance)] print:p-0">
            <SessionGuard>
              <LocalDatabase>
                <ConsentGuard>{children}</ConsentGuard>
              </LocalDatabase>
            </SessionGuard>
          </main>
          <TabBar />
        </div>
      </div>
      <ScrollReset targetId="app-scroll" />
    </div>
  );
}
