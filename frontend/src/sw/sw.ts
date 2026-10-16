/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

/* Service worker de la PWA (ADR-0005, RNF-OFF-001). Serwist es la
   continuación mantenida de next-pwa sobre Workbox [SPEC-BASE §2].
   - Precache del shell generado en el build (`self.__SW_MANIFEST`).
   - Caché de navegación y estáticos con la estrategia por defecto de Next.
   - Fallback a /app/offline cuando una página no está en caché y no hay red.
   La cola P1/P2/P3 NO vive aquí: la orquesta src/data/sync (WatermelonDB);
   Background Sync se agrega en S1 del plan frontend. */

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: "/app/offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
