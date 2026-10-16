# Frontend — Academia de Proveedores Smile

Next.js 15 (App Router) · React 19 · TypeScript estricto · Tailwind CSS 4 · WatermelonDB · Serwist (Workbox).
Arquitectura: [`docs/sistema/arquitectura.md` §4–§5](../docs/sistema/arquitectura.md) · Diseño: [`docs/diseno/GUIA_VISUAL.md`](../docs/diseno/GUIA_VISUAL.md) v1.1 · Plan: [`docs/planes/PLAN_FRONTEND.md`](../docs/planes/PLAN_FRONTEND.md).

Estado: **esqueleto S0**. Las pantallas son marcadores (`PageStub`) que citan los RF/CU que las implementan.

## Rutas

| Grupo | Rutas | Modo |
|---|---|---|
| `(marketing)` | `/` | Estático |
| `(auth)` | `/ingresar`, `/registro`, `/recuperar` | Online |
| `(proveedor)` | `/app`, `/app/consentimiento`, `/app/ficha`, `/app/autoevaluacion`, `/app/diagnostico`, `/app/plan`, `/app/plan/[metaId]`, `/app/erp/{ventas,costos,inventario,mermas}`, `/app/lotes`, `/app/aprender`, `/app/beneficios`, `/app/mensajes`, `/app/perfil`, `/app/offline` | Local-first, offline |
| `(backoffice)` | `/smile`, `/smile/proveedores[/id]`, `/smile/recepciones`, `/smile/funnel`, `/smile/esg`, `/smile/reportes`, `/smile/admin/*` | Online |
| API | `/api/health` | Healthcheck del contenedor |

Tabbar del proveedor (4 tabs, ícono + texto): Diagnóstico `/app/diagnostico` · Guías `/app/plan` · Ruta `/app/beneficios` · Ficha `/app/ficha`.
⚠️ En la maqueta "Ficha" era la ficha resumen imprimible (RF-IMP-007); en arquitectura §4.1 `/app/ficha` es la ficha del proveedor (CU-04). El plan frontend debe decidir si la ficha resumen vive dentro de `/app/ficha` o en `/app/diagnostico`.

## Estructura

```
src/
├── app/                 rutas (grupos de arriba), globals.css (@theme de Tailwind)
├── design/              tokens.css (GENERADO), fonts.ts, motion.ts
├── components/          icons.tsx, ui/ (Button, IconButton, Chip, LevelBadge, Card), shell/
├── domain/assessment/   motor de puntaje espejo del backend + test con el fixture compartido
├── data/db/             WatermelonDB: schema, modelos sin decoradores, base (solo cliente)
├── data/sync/           cola P1/P2/P3, backoff, cliente pull/push
├── data/api/            (S1) cliente generado desde OpenAPI
├── hooks/               useOnlineStatus
├── lib/                 format es-CO, env, cn
└── sw/sw.ts             service worker (Serwist)
tests/e2e/               Playwright (smoke)
scripts/design-sync.mjs  copia docs/diseno/tokens.css → src/design/tokens.css
```

## Comandos

```bash
npm ci                 # usa .npmrc (legacy-peer-deps, versiones exactas)
npm run dev            # http://localhost:3000 (SW desactivado en dev)
npm run build && npm start
npm run lint           # ESLint 9 (config de Next), 0 warnings
npm run typecheck      # tsc --noEmit
npm test               # Vitest: fixture de scoring, formato es-CO, cola de sync
npm run test:e2e       # Playwright (requiere `npx playwright install chromium`)
npm run design:sync    # tras cambiar docs/diseno/tokens.css
npm run design:check   # CI: falla si la copia de tokens difiere
```

Docker (contexto `frontend/`): targets `deps`, `builder`, `dev`, `runner`.

```bash
docker build --target runner -t smile-frontend .   # producción (standalone)
docker build --target dev -t smile-frontend:dev .  # next dev, montar el código en compose.dev
```

## Decisiones

- **Tokens.** La fuente es `docs/diseno/tokens.css`. `src/design/tokens.css` es una copia generada y versionada: el build de Docker no puede leer fuera de `frontend/`. `globals.css` la importa **sin capa** y expone los tokens a Tailwind con `@theme inline` (`bg-olive-800`, `rounded-card`, `text-app-title`…). Prohibidos los hex literales en componentes; única excepción: `themeColor` del viewport (Next no acepta `var()`).
- **Fuentes.** Fraunces (con ejes opsz/SOFT/WONK) y Manrope autoalojadas con `next/font/local` desde `@fontsource-variable/*` (subconjunto latino). Cero peticiones a Google en runtime.
- **WatermelonDB.** Adaptador LokiJS + IndexedDB incremental, `useWebWorker: false`. Modelos **sin decoradores** (getters sobre `_getRaw`), porque SWC de Next no aplica los decoradores *legacy* que espera WatermelonDB y no queremos Babel. `src/data/db/index.ts` solo se importa de forma dinámica en cliente: nunca entra al bundle del servidor.
- **Sync.** Protocolo pull/push nativo de WatermelonDB contra `/api/v1/sync/*`, payload gzip con `CompressionStream`. `queue.ts` (puro, testeado) define prioridades, lotes de 10 KB/50 KB y backoff 1 s → 15 min. Pendiente S1: orquestar `syncNow` por prioridad, `mutation_id` persistente por lote, cifrado de campos (ADR-0006).
- **Service worker.** Serwist 9 (`@serwist/next`, webpack plugin) genera `public/sw.js` en el build: precache del shell, caché de navegación por defecto de Next y fallback `/app/offline`. Desactivado en `next dev`. Background Sync: S1.
- **Motor de reglas espejo.** `src/domain/assessment/scoring.ts` replica RF-ASM-005…008 y RF-IMP-001; `scoring.test.ts` lee `../contracts/fixtures/assessment-scoring.json` (ADR-0005). Los `*.test.ts` se excluyen del contexto Docker.
- **npm.** `.npmrc` con `legacy-peer-deps=true`: npm 10.9 falla (`Cannot read properties of null (reading 'edgesOut')`) resolviendo el *peer set* opcional de Vitest/Vite. Se fija `vite@7.3.6` explícitamente.
- **Imágenes.** `images.unoptimized: true` y `sharp`/`typescript` excluidos del *tracing*: la PWA sirve imágenes ya optimizadas y la imagen final baja ~25 MB.

## Presupuesto de rendimiento (RNF-PERF-001/002)

| Métrica | Presupuesto | S0 (`next build`) |
|---|---|---|
| JS + CSS inicial de `/app` (comprimido) | < 2,0 MB (spec) · objetivo < 350 KB JS | First Load JS `/app`: 104 kB |
| FCP en 3G (Lighthouse) | < 1,8 s | por medir en S1 (Lighthouse CI) |

GSAP + SplitText se cargan solo en `/app` cuando se implementen las animaciones (GUIA_VISUAL §10.6); ScrollTrigger y Lenis solo en la landing, con carga diferida.

## Imagen Docker

`runner` = `alpine:3.24.2` + binario de Node 22.23.3 copiado de la imagen oficial + salida *standalone*, usuario `nextjs` (uid 1001), `HEALTHCHECK` a `/api/health`. Tamaño S0: **~243 MB** (el binario de Node ocupa 129 MB; la app 38 MB). El objetivo de < 200 MB de RNF-POR-001 no se alcanza con Node 22 oficial; opciones a evaluar en el plan de infraestructura: Node sin ICU completo, o ajustar el presupuesto.

El Dockerfile no usa sintaxis exclusiva de BuildKit (`--mount=type=cache`): esta máquina no tiene `buildx` y construye con el *legacy builder*.
