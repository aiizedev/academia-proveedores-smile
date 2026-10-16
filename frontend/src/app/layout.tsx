import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { fraunces, manrope } from "@/design/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Academia de Proveedores Smile", template: "%s · Academia Smile" },
  description: "Diagnóstico, plan de mejora y Mini ERP para los proveedores de Grupo Smile.",
  manifest: "/manifest.webmanifest",
  applicationName: "Academia Smile",
  appleWebApp: { capable: true, title: "Academia Smile", statusBarStyle: "default" },
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#3D4A3E", // --brand-olive (GUIA_VISUAL §6); metadata no acepta var()
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CO" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
