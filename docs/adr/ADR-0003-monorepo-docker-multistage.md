# ADR-0003 · Monorepo con Docker Compose y builds multistage

- **Estado:** Aceptada · 2026-10-15
- **Contexto:** El sistema tiene frontend (Next.js) y backend (FastAPI) que comparten contratos (OpenAPI, fixtures de reglas, tokens de diseño). Se requiere que todo corra contenerizado y que las imágenes sean pequeñas (RNF-POR-001).
- **Decisión:** Repositorio único con `frontend/`, `backend/`, `infra/`, `contracts/` y `docs/`. Cada aplicación tiene su `Dockerfile` multistage con etapas `dev` (hot reload) y de producción (`runtime` / `runner`), usuario no root y sin herramientas de build en la imagen final. `infra/docker-compose.yml` orquesta los servicios; `infra/docker-compose.dev.yml` añade montajes y targets `dev`. Un `Makefile` en la raíz es la interfaz única (`make up`, `make test`, …).
- **Consecuencias:** (+) Un comando levanta todo; cambios de contrato en un solo PR. (−) CI debe filtrar por rutas para no construir todo en cada cambio.
