# Flujo de trabajo

## Ramas

| Rama | Uso |
|---|---|
| `main` | Estable. Solo recibe merges desde `develop` al pasar un hito (G0…G6 del [plan maestro](docs/planes/PLAN_MAESTRO.md)) |
| `develop` | Integración. Destino de todos los PR |
| `feature/pwa-offline` | PWA, WatermelonDB, Service Worker, sincronización |
| `feature/motor-diagnostico` | Autoevaluación, scoring, plan de mejora |
| `feature/ui-ux-marca` | Guía visual, sistema de diseño, UX rural |
| `feature/categorias` | Lácteos, Carnes, Pescados y Mariscos, Insumos y Servicios |
| `perf/low-data` | Presupuestos: < 2 MB, FCP < 1,8 s, pruebas 3G |
| `docs/entregables` | Documentos de `docs/` |

Para trabajo puntual: `feature/<modulo>-<HU>` (p. ej. `feature/erp-HU-ERP-01`), `fix/<tema>`, `docs/<tema>`.

## Commits — Conventional Commits

```
<tipo>(<ámbito>): <resumen en minúscula, imperativo, ≤ 72 caracteres>

<cuerpo opcional: qué y por qué>

Refs: HU-ERP-01, RF-ERP-001
```

**Tipos:** `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `build`, `ci`, `chore`, `style`.
**Ámbitos:** un módulo del backend (`iam`, `privacy`, `suppliers`, `catalog`, `assessment`, `improvement`, `erp`, `traceability`, `receptions`, `scoring`, `recognition`, `learning`, `impact`, `reporting`, `notifications`, `sync`), una capa (`frontend`, `backend`, `infra`, `contracts`, `design`) o `docs`.

Ejemplos: `feat(erp): registrar venta offline` · `fix(sync): no duplicar lotes reenviados` · `docs(specs): registrar Q-10` · `ci(infra): cache de buildx`.

## Pull requests

- Una HU (o parte) por PR, < 400 líneas sin contar archivos generados.
- Descripción con HU, CU y RF enlazados; capturas o video si hay UI, **incluido el modo sin conexión**.
- Checklist de la Definición de Done ([historias de usuario](docs/sistema/historias-de-usuario.md)).
- 1 aprobación; 2 si toca `contracts/`, `docs/specs/`, `docs/diseno/` o seguridad.
- CI verde: `make lint` y `make test`.

## Reglas de oro

1. Los specs de [`docs/specs/`](docs/specs/README.md) son la fuente de verdad. Lo que no tenga fuente se registra en [`conflictos-y-supuestos.md`](docs/sistema/conflictos-y-supuestos.md) antes de construirlo.
2. Ningún color, radio, sombra o duración literal en el frontend: todo sale de [`docs/diseno/tokens.css`](docs/diseno/tokens.css).
3. En el backend, `domain` y `application` no importan FastAPI, SQLAlchemy ni SDKs; un módulo solo usa a otro por su `public.py` o por eventos (lo verifica `lint-imports`).
4. Una regla que existe en el backend y en la PWA tiene fixture en `contracts/fixtures/`.
