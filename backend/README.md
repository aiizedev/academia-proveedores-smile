# Backend — Academia de Proveedores Smile

API FastAPI organizada como **monolito modular hexagonal** ([ADR-0001](../docs/adr/ADR-0001-arquitectura-hexagonal.md), [ADR-0002](../docs/adr/ADR-0002-monolito-modular.md)). Arquitectura completa: [`docs/sistema/arquitectura.md`](../docs/sistema/arquitectura.md) §3. Modelo de datos: [`docs/sistema/esquema-datos.md`](../docs/sistema/esquema-datos.md).

## Ejecutar en local (sin Docker)

Requisitos: [uv](https://docs.astral.sh/uv/) ≥ 0.11 (descarga Python 3.12 si hace falta) y un PostgreSQL con TimescaleDB (lo más simple: `make up` desde la raíz, que levanta `db` y `storage`).

```bash
cd backend
uv sync                                  # crea .venv con dependencias de dev
export DATABASE_URL=postgresql+asyncpg://smile:smile@localhost:5432/smile
uv run alembic upgrade head              # crea esquemas, outbox, auditoría, sync
uv run uvicorn smile.main:app --reload   # API en http://localhost:8000 · docs en /docs
uv run python -m smile.worker            # worker: outbox + tareas programadas
```

Todas las variables de entorno están en `src/smile/config.py` y documentadas en `arquitectura.md` §7.2.

## Con Docker

```bash
docker build --target runtime -t smile-backend .   # imagen de producción (usuario no root)
docker build --target dev -t smile-backend:dev .   # con dependencias de dev y --reload
```

La imagen `runtime` incluye `alembic.ini` y `migrations/` porque el servicio `migrate` de compose ejecuta `alembic upgrade head` con ella. El `Dockerfile` no usa `RUN --mount`, para funcionar también con el builder clásico en hosts sin buildx.

## Estructura

```
src/smile/
├── main.py           composition root: monta /api/v1, health, CORS, errores, módulos
├── worker.py         despacho del outbox (SKIP LOCKED) + APScheduler
├── config.py         Settings (pydantic-settings)
├── observability.py  logs JSON (structlog)
├── shared/           kernel técnico: domain · application (puertos) · infrastructure · api
└── modules/<m>/
    ├── public.py     ÚNICA superficie importable por otros módulos
    ├── module.py     router + dependency_overrides (cableado) + handlers de eventos
    ├── domain/       reglas puras (sin FastAPI, SQLAlchemy, Pydantic ni boto3)
    ├── application/  ports/ · commands/ · queries/
    ├── infrastructure/  adaptadores salientes (repos SQLAlchemy en el esquema `<m>`)
    └── api/          router FastAPI + schemas Pydantic
```

`assessment` es el módulo de referencia: tiene dominio real (`domain/scoring.py`), un caso de uso (`application/queries/score_assessment.py`), un puerto (`application/ports/rules.py`), un adaptador (`infrastructure/default_rules.py`), el endpoint `POST /api/v1/assessment/score-preview` y el cableado en `module.py`. Úsalo como plantilla.

### Reglas de dependencia (verificadas por `lint-imports`)

| Contrato | Regla |
|---|---|
| Capas por módulo | `module` → `public` → `api` \| `infrastructure` → `application` → `domain`. `api` no importa `infrastructure`: el cableado vive en `module.py` vía `dependency_overrides`. |
| Dominio puro | `domain` y `application` no importan `fastapi`, `starlette`, `sqlalchemy`, `asyncpg`, `boto3`, `pydantic` ni `smile.shared.infrastructure`/`api`. |
| Independencia de módulos | Un módulo solo importa `smile.modules.<otro>.public`. Los efectos asíncronos van por eventos en el outbox (ADR-0007). |

## Crear o completar un módulo

1. Modela el dominio en `domain/` (dataclasses, `AggregateRoot`, eventos `DomainEvent` con `name = "<modulo>.<Evento>"`).
2. Declara puertos en `application/ports/` como `typing.Protocol`.
3. Escribe un caso de uso por archivo en `commands/` o `queries/`; recibe puertos en el constructor y usa `UnitOfWork.track(agregado)` + `commit()` para que los eventos lleguen al outbox.
4. Implementa los adaptadores en `infrastructure/` (modelos ORM en `infrastructure/models.py` con `__table_args__ = {"schema": "<modulo>"}`; alembic los descubre).
5. Expón el router en `api/router.py` con un proveedor abstracto (`def get_x() -> X: raise NotImplementedError`) y regístralo en `module.py` → `dependency_overrides`.
6. Publica en `public.py` lo que otros módulos pueden usar.
7. Migración: `uv run alembic revision --autogenerate -m "<modulo>_<cambio>"`.
8. Tests: `tests/unit/<modulo>/` (con fakes de puertos, sin DB), `tests/integration/<modulo>/`, `tests/api/` (incluida la prueba de IDOR, RNF-SEC-004).

## Datos de demostración (MODO_POC §3)

`python -m smile.seed` carga los datos de demo si `SEED_DEMO=true` (o con `--force`). Es idempotente: IDs fijos (`demo_id`) + *upsert*. Cada módulo aporta `seed_demo(session)` en `infrastructure/seed.py`; el runner los llama en el orden de `MODULE_NAMES`. Con Docker lo ejecuta el servicio `seed` después de `migrate`.

Usuarios precreados, contraseña **`Smile2026!`** (solo demo): `admin@smile.test` (ADMIN), `reviewer@smile.test` (REVIEWER), `proveedor@smile.test` / celular `3001234567` (PROVEEDOR, recorrido completo), `nuevo@smile.test` (PROVEEDOR sin onboarding) y `proveedor01…30@smile.test`.

## Calidad

```bash
uv run pytest                     # unit + api (los de integración requieren DB)
uv run coverage run -m pytest && uv run coverage report
uv run ruff check && uv run ruff format --check
uv run mypy src                   # strict en domain/ y application/
uv run lint-imports               # contratos hexagonal + monolito modular
```

Las reglas de puntaje se validan contra [`contracts/fixtures/assessment-scoring.json`](../contracts/fixtures/assessment-scoring.json), el mismo fixture que usa el frontend ([ADR-0005](../docs/adr/ADR-0005-local-first-watermelondb.md)). Si el fixture no está disponible (por ejemplo, dentro de la imagen Docker), esos tests se omiten; se puede apuntar a otra ruta con `CONTRACTS_DIR`.
