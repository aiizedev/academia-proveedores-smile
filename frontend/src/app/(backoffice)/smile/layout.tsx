import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/shell/Sidebar";

/* Back-office Smile (REVIEWER, ADMIN): online, escritorio ≥ 1280 px (RNF-COMP-001). */
export const metadata: Metadata = { title: { default: "Back-office", template: "%s · Back-office Smile" } };

export default function BackofficeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-cream">
      <Sidebar />
      <main className="flex-1 px-10 py-8">{children}</main>
    </div>
  );
}
