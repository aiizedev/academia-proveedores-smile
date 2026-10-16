import { MotionRoot } from "@/components/motion";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ReducedMotion } from "@/components/shell/ReducedMotion";
import { fraunces, manrope } from "@/design/fonts";
import { NO_ANIM_CLASS, REDUCED_MOTION_QUERY } from "@/design/motion";
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
  // --brand-olive (GUIA_VISUAL §6): metadata no acepta var(), única excepción.
  // eslint-disable-next-line no-restricted-syntax
  themeColor: "#3D4A3E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Antes del primer pintado: evita que una animación arranque y luego se corte (GUIA_VISUAL §10.3).
const noAnimScript = `if(matchMedia(${JSON.stringify(REDUCED_MOTION_QUERY)}).matches)document.documentElement.classList.add(${JSON.stringify(NO_ANIM_CLASS)})`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-CO" className={`${fraunces.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noAnimScript }} />
      </head>
      <body>
        <ReducedMotion />
        <MotionRoot>{children}</MotionRoot>
      </body>
    </html>
  );
}
