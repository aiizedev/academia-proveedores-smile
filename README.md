# Academia Proveedores Smile

Reto **Red de Valor Compartido × Grupo Smile** (UNAL, Facultad de Ingeniería, 2026). Rol: Ingeniería de Sistemas.

Plataforma **CRM & Mini ERP sostenible** para los 450 proveedores de Grupo Smile: una PWA *offline-first* donde el proveedor se autoevalúa cada cuatrimestre, recibe un plan de mejora de 3 metas, lleva sus ventas, costos, mermas y lotes con carencia verificada, aprende con clips cortos y gana reconocimientos; y un back-office donde Smile ve el funnel de 6 etapas, el score 50/30/20 y genera reportes. Piloto: Fruver.

## Monorepo

| Carpeta | Contenido |
|---|---|
| [`frontend/`](frontend/README.md) | Next.js 15 + Tailwind 4 + WatermelonDB: landing `/`, PWA del proveedor `/app`, back-office `/smile` |
| [`backend/`](backend/README.md) | Python 3.12 + FastAPI: **monolito modular** de 16 módulos con **arquitectura hexagonal** |
| [`infra/`](infra/) | Docker Compose (PostgreSQL/TimescaleDB, S3 SeaweedFS, migraciones, API, worker, frontend) |
| [`contracts/`](contracts/README.md) | Contratos compartidos: OpenAPI y fixtures de reglas que deben pasar en Python y en TypeScript |
| [`docs/`](docs/README.md) | **Specs (fuente de verdad)**, requerimientos, casos de uso, historias, arquitectura, ADR, guía visual y planes |
| [`maqueta/`](maqueta/README.md) | Prototipo navegable original (paleta v1.0; referencia de interacción) |

## Empezar

Requisitos: Docker con Compose v2 y `make`.

```bash
make env      # crea infra/.env desde infra/.env.example
make up       # construye (multistage) y levanta todo
make smoke    # verifica que todo responde
```

| Servicio | URL |
|---|---|
| Frontend | http://localhost:3000 (PWA en `/app`, back-office en `/smile`) |
| API + Swagger | http://localhost:8000/docs |
| S3 (SeaweedFS) | http://localhost:9000 |

Desarrollo con recarga en caliente: `make up-dev`. Todos los comandos: `make help`.

## Documentación clave

- Fuente de verdad: [`docs/specs/README.md`](docs/specs/README.md)
- Requerimientos (ISO 29148): [`docs/sistema/requerimientos.md`](docs/sistema/requerimientos.md)
- Arquitectura: [`docs/sistema/arquitectura.md`](docs/sistema/arquitectura.md) y [`docs/adr/`](docs/adr/)
- Guía visual: [`docs/diseno/GUIA_VISUAL.md`](docs/diseno/GUIA_VISUAL.md)
- Planes: [maestro](docs/planes/PLAN_MAESTRO.md) · [frontend](docs/planes/PLAN_FRONTEND.md) · [backend](docs/planes/PLAN_BACKEND.md) · [infraestructura](docs/planes/PLAN_INFRA.md)

Cómo contribuir: [`CONTRIBUTING.md`](CONTRIBUTING.md).
