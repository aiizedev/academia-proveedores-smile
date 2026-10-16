import type { NextConfig } from "next";
import { randomUUID } from "node:crypto";
import withSerwistInit from "@serwist/next";

// Service worker (Serwist, sucesor de next-pwa basado en Workbox): ADR-0005.
// En desarrollo se desactiva para no cachear código mientras se edita.
const buildRevision = process.env.GIT_SHA ?? randomUUID();

const withSerwist = withSerwistInit({
  swSrc: "src/sw/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  // El documento del shell entra al precache: la primera visita ocurre antes
  // de que el SW controle la página, así que no quedaría en la caché de runtime
  // (HU-PLAT-03 "shell disponible sin conexión"). Revisión nueva en cada build.
  additionalPrecacheEntries: ["/app", "/app/consentimiento", "/app/offline", "/ingresar"].map((url) => ({ url, revision: buildRevision })),
  reloadOnOnline: false,
  disable: process.env.NODE_ENV === "development",
});

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(self)" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  // PWA offline: las imágenes se sirven ya optimizadas desde /public; sin sharp
  // en runtime la imagen final baja ~20 MB (RNF-POR-001).
  images: { unoptimized: true },
  outputFileTracingExcludes: {
    "*": ["node_modules/typescript/**", "node_modules/sharp/**", "node_modules/@img/**"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
