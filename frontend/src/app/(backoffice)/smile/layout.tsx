import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/shell/Sidebar";
import { FiltersProvider } from "./_ui/filters";

/* Back-office Smile (REVIEWER, ADMIN): online, escritorio ≥ 1280 px (RNF-COMP-001).
   Los filtros globales viven aquí para que persistan al pasar de un tablero a otro. */
export const metadata: Metadata = { title: { default: "Back-office", template: "%s · Back-office Smile" } };

export default function BackofficeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="stage-bg flex min-h-dvh">
      <Sidebar />
      <FiltersProvider>
        <main className="min-w-0 flex-1 px-8 pt-7 pb-12 xl:px-10">{children}</main>
      </FiltersProvider>
    </div>
  );
}
