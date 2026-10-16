# Stack tecnológico

**Versión 1.0 · 15 de octubre de 2026.** El stack base lo fija [SPEC-BASE, encabezado]; las demás piezas se eligieron para cumplir [`requerimientos.md`](requerimientos.md) y [`arquitectura.md`](arquitectura.md). Las versiones exactas viven en `frontend/package-lock.json` y `backend/uv.lock`; esta tabla da la línea mayor.

## 1. Frontend

| Pieza | Elección | Motivo | Requerimiento |
|---|---|---|---|
| Framework | **Next.js 15** (App Router) + React 19 | Fijado por el spec; SSR para landing y back-office, PWA para `/app` | SPEC-BASE §2.1 |
| Lenguaje | TypeScript estricto | Contratos tipados con la API | RNF-MNT-004 |
| Estilos | **Tailwind CSS 4** con `@theme` sobre los tokens de la guía | Fijado por el spec; tokens únicos | SPEC-BASE §2, GUIA_VISUAL |
| Base local | **WatermelonDB** (LokiJS + IndexedDB incremental) | Fijado por el spec; reactivo, protocolo de sync propio | SPEC-SOT §5.1, ADR-0005 |
| Service Worker | **Serwist** (`@serwist/next`, sucesor de next-pwa construido sobre Workbox) | El spec pide Workbox; Serwist es la integración mantenida para App Router | SPEC-BASE §2 |
| Movimiento | GSAP 3 (core, SplitText, DrawSVG); ScrollTrigger y Lenis solo en la landing | GUIA_VISUAL §9–10 | RNF-USA-006 |
| Formularios | react-hook-form + zod | Validación declarativa y rangos creíbles | RF-ERP-007 |
| Back-office datos | TanStack Query | Caché y reintentos para vistas online | — |
| Cliente API | openapi-typescript + openapi-fetch | Tipos generados del OpenAPI | RNF-MNT-004 |
| Gráficas | Recharts o visx (decidir en S7 midiendo peso) | Funnel, matriz de riesgo, Pareto | RF-RPT-001…004 |
| Cripto | WebCrypto (AES-GCM 256) | Sin dependencias | ADR-0006 |
| Fuentes | Fraunces y Manrope autoalojadas (`@fontsource-variable`) | Offline | GUIA_VISUAL §4 |
| Pruebas | Vitest + Testing Library; Playwright (e2e y modo offline); axe-core; Lighthouse CI | — | RNF-MNT-003, RNF-ACC-001, RNF-PERF-002 |

## 2. Backend

| Pieza | Elección | Motivo | Requerimiento |
|---|---|---|---|
| Lenguaje | **Python 3.12** | Spec pide ≥ 3.11 | SPEC-BASE |
| Framework | **FastAPI** + Uvicorn | Fijado por el spec; OpenAPI automático | SPEC-BASE §2.2 |
| DTOs | **Pydantic v2** | Contratos estrictos | SPEC-DASH §1.1 |
| ORM y migraciones | SQLAlchemy 2 (async, asyncpg) + Alembic | Adaptadores de repositorio en la capa de infraestructura | ADR-0001 |
| Base de datos | **PostgreSQL 16 + TimescaleDB** | Fijado por el spec; hypertables para series | SPEC-BASE |
| Objetos | boto3 (S3: SeaweedFS en dev) · google-cloud-storage (GCS/Firebase) | Puerto `FileStorage` | ADR-0004 |
| Asíncrono | Outbox en PostgreSQL + worker + APScheduler | Sin broker | ADR-0007 |
| Auth | PyJWT + argon2-cffi | RNF-SEC-002/003 | — |
| Reportes | openpyxl (XLSX) · ReportLab (PDF) | Imagen liviana, sin dependencias de sistema | RF-RPT-005 |
| Gestor de paquetes | **uv** | Lockfile reproducible, builds rápidos en Docker | ADR-0003 |
| Calidad | ruff, mypy, pytest, pytest-asyncio, httpx, import-linter, coverage | RNF-MNT-001…003 | — |

## 3. Infraestructura

| Pieza | Desarrollo | Producción (propuesta, Q-09) |
|---|---|---|
| Orquestación | Docker Compose (`infra/`) | Cloud Run (frontend, backend, worker) |
| Base de datos | `timescale/timescaledb` | Timescale Cloud o Postgres autogestionado (Cloud SQL no ofrece TimescaleDB) |
| Objetos | SeaweedFS (API S3, ADR-0008) | Google Cloud Storage (backend de Firebase Storage) |
| Correo | Mailpit | Proveedor SMTP transaccional |
| CI | GitHub Actions | GitHub Actions + despliegue |
| Imágenes | Multistage, no root | Artifact Registry, escaneo Trivy |

Detalle en [`../planes/PLAN_INFRA.md`](../planes/PLAN_INFRA.md).

## 4. Descartes

| Opción | Por qué no |
|---|---|
| Microservicios | Sobredimensionado para 450 proveedores; el monolito modular conserva límites (ADR-0002) |
| Redis / RabbitMQ | El outbox en PostgreSQL basta (ADR-0007) |
| Firebase Firestore como base principal | El spec pide PostgreSQL/TimescaleDB para el CRM y reportes |
| next-pwa | Sin mantenimiento para App Router; se usa Serwist |
| RxDB / PouchDB | El spec fija WatermelonDB |
| WeasyPrint | Exige librerías de sistema que inflan la imagen (> 250 MB, RNF-POR-001) |
