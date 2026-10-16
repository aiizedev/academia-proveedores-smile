# Plan de backend — monolito modular hexagonal

**Versión 1.0 · 15 de octubre de 2026** · Dueño: equipo de Ingeniería de Sistemas · Horizonte: S0–S16 (19/10/2026 – 11/06/2027)

## 0. Fuentes de verdad

| Qué | Dónde | Regla |
|---|---|---|
| Producto | [`docs/specs/`](../specs/README.md) — SPEC-SOT > SPEC-BASE > SPEC-DASH > DOC-* | Manda sobre todo lo demás |
| Requerimientos | [`requerimientos.md`](../sistema/requerimientos.md) (RF/RNF), [`casos-de-uso.md`](../sistema/casos-de-uso.md) (CU-01…31), [`historias-de-usuario.md`](../sistema/historias-de-usuario.md) (HU) | Cada PR cita al menos una HU |
| Reglas sin definir | [`conflictos-y-supuestos.md`](../sistema/conflictos-y-supuestos.md) (C-xx, S-xx, Q-xx) | Todo S-xx se implementa **como parámetro**, nunca como constante |
| Arquitectura | [`arquitectura.md`](../sistema/arquitectura.md) §3, §5, §6, §7 · [ADR-0001, 0002, 0004, 0005, 0006, 0007, 0008](../adr/) | Contrato de módulos, sync e infraestructura |
| Datos | [`esquema-datos.md`](../sistema/esquema-datos.md) | Una migración por cambio de esquema, prefijada por módulo |
| Contratos compartidos | [`contracts/`](../../contracts/README.md) | Los fixtures de reglas deben pasar en Python y en TS |

---

## 1. Objetivo

Entregar una API FastAPI que sea la **fuente oficial** de reglas y datos para la PWA local-first y el back-office, cumpliendo:
- **Hexagonal** (RNF-MNT-001): `domain` y `application` sin FastAPI, SQLAlchemy ni SDKs.
- **Monolito modular** (RNF-MNT-002): 16 módulos con esquema propio, fachada `public.py`, eventos por outbox.
- **Rendimiento** (RNF-PERF-004): p95 < 300 ms; `sync/push` de 100 registros < 2 s.
- **Seguridad y privacidad** (RNF-SEC-001…008, RF-PRV-007): autorización por recurso, auditoría, agregados para roles internos.

## 2. Estado de partida (S0)

El esqueleto vive en `backend/` (ver [`backend/README.md`](../../backend/README.md)): `create_app`, configuración por entorno, kernel `shared` (entidades, eventos, Money, UoW con outbox, `FileStorage` S3), los 16 módulos con su estructura hexagonal vacía, el módulo `assessment` con el motor de puntaje validado contra `contracts/fixtures/assessment-scoring.json`, Alembic con los esquemas iniciales, contratos de import-linter, Dockerfile multistage (`base → builder → dev | runtime`). Lo que falta es todo lo funcional que lista este plan.

**Verificado al cierre de la preparación (15/10/2026):** `pytest` 16/16 (incluye el fixture de scoring), `lint-imports` 3 contratos OK, `ruff` y `mypy` limpios; `alembic upgrade → downgrade → upgrade` contra TimescaleDB; API como usuario no root; `S3FileStorage.presign_put` probado contra SeaweedFS (ADR-0008).

**Brechas conocidas que B0 debe cerrar:**

| Brecha | Detalle | Acción |
|---|---|---|
| Imagen `runtime` de 315 MB (objetivo RNF-POR-001: < 250 MB) | `python:3.12-slim` = 178 MB + `.venv` = 127 MB (boto3/botocore es la mayor parte) | Evaluar `python:3.12-alpine` (asyncpg y argon2 tienen wheels musllinux), reemplazar boto3 por un cliente S3 liviano para firmar (p. ej. `aiobotocore` mínimo o firma SigV4 propia), o ajustar el objetivo con un ADR si no es alcanzable |
| Sin `RUN --mount=type=cache` | El builder clásico de este host no soporta *cache mounts*; el Dockerfile usa capas `COPY uv.lock` + `uv sync` | Con buildx (CI lo tiene) se puede reintroducir sin romper el builder clásico usando un Dockerfile `# syntax=docker/dockerfile:1` y documentar el requisito |
| Exportador OpenAPI | ✅ 16/10/2026: `backend/scripts/export_openapi.py`, `make openapi` y verificación en CI | Paso 5 de B0 |
| Cableado de dependencias | `api` no puede importar `infrastructure`; cada `module.py` expone `dependency_overrides` que `main.py` aplica | Mantener: es el patrón oficial (documentado en `backend/README.md`) |

## 3. Receta para implementar una historia (aplica a todas las fases)

Cada HU de backend se implementa en este orden. El PR no se aprueba si falta un paso.

1. **Leer** la HU, sus RF, el CU y los S-xx/Q-xx citados. Si una regla no está definida, registrar un S-xx nuevo **antes** de codificar.
2. **Dominio** (`modules/<m>/domain/`): entidades y value objects inmutables donde se pueda; invariantes en el constructor o en métodos del agregado; errores de dominio tipados (`DomainError` con `code`). Sin I/O, sin `datetime.now()` (usar el puerto `Clock`).
3. **Tests unitarios del dominio** (`tests/unit/<m>/`): uno por invariante y por regla; casos límite (umbral 40/75, 5 %, 8 %, 16 %, carencia exacta = hoy).
4. **Puertos** (`application/ports/`): `Protocol` para repositorios y gateways que el caso de uso necesita.
5. **Caso de uso** (`application/commands|queries/`): una clase por caso de uso, `__call__` asíncrono, recibe un DTO de entrada de aplicación (dataclass) y el `CurrentUser`; verifica **propiedad del recurso** (RNF-SEC-004); usa `UnitOfWork`; registra eventos en el agregado. Tests con *fakes* de los puertos.
6. **Adaptadores salientes** (`infrastructure/`): modelos ORM en el esquema del módulo, repositorio SQLAlchemy, mapeo ORM ↔ dominio. Tests de integración contra PostgreSQL real.
7. **Migración** Alembic: `make migration m="<modulo>: <cambio>"`; prefijo de revisión `<modulo>_`; nada de FK entre esquemas (solo UUID).
8. **Adaptador entrante** (`api/`): router con prefijo `/api/v1/<recurso>`, schemas Pydantic v2 con `model_config = ConfigDict(extra="forbid")`, dependencia `require(<permiso>)`, códigos HTTP coherentes (§6.3). Si la entidad la escribe la PWA, registrar además el **handler de sync** de su tabla (§5).
9. **Fachada** (`public.py`): exponer solo lo que otro módulo necesita (DTO de lectura o comando); registrar handlers de eventos en `module.py`.
10. **Tests de API**: contrato, validación, autorización por rol **e IDOR** (otro proveedor recibe 404), idempotencia si aplica.
11. **Contratos**: si la regla también vive en la PWA, añadir casos a `contracts/fixtures/` y verlos pasar en ambos lados.
12. **OpenAPI**: `make openapi` regenera `contracts/openapi.json`; el frontend regenera su cliente en el mismo PR.
13. **DoD**: ruff, mypy, lint-imports, cobertura (dominio+aplicación ≥ 85 %), auditoría si es acción interna (RNF-SEC-007), logs sin datos personales (RNF-OBS-001), docs actualizados.

---

## 4. Fases

Cada fase lista: objetivo · historias · pasos · plan de ejecución (orden y paralelismo) · criterios de salida · riesgos. Los sprints y puntos vienen de [`historias-de-usuario.md`](../sistema/historias-de-usuario.md) §10.

### B0 · Fundaciones — S0 (19/10 – 30/10/2026) · R0

**Objetivo:** el esqueleto corre en Docker, el CI lo valida y el contrato OpenAPI se exporta.
**Historias:** HU-PLAT-02 (esqueleto hexagonal), HU-PLAT-05 (OpenAPI + cliente TS), HU-PLAT-06 (observabilidad básica); apoyo a HU-PLAT-01/04 (infra).

**Pasos**
1. Revisar el esqueleto contra `arquitectura.md` §3.2 y completar lo que falte (README, `make module name=<m>` que genere la plantilla de un módulo desde `backend/scripts/module_template/`). — POC: README al día; `make module` pospuesto (los 16 módulos ya existen).
2. `shared/api/errors.py`: mapa `DomainError.code → HTTP` y cuerpo uniforme `{ "error": { "code", "message", "details", "request_id" } }`. ✅ 16/10/2026 (+ `ConflictError` 409, validación 400 sin eco del valor, autogenerate sin falsos borrados)
3. Middleware `request_id` (cabecera `X-Request-ID`, generada si no viene) y logging JSON con `structlog`; filtro que elimina campos de PII conocidos (`email`, `phone`, `document_number`, `name`) — RNF-OBS-001. ✅ 16/10/2026 (+ log de acceso con ruta-plantilla y duración; celulares y correos en texto libre también se ocultan)
4. `/health/live`, `/health/ready` (DB `SELECT 1` + `FileStorage.head_bucket`), `/metrics` con `prometheus-client` (latencia por ruta, errores, tamaño de lotes de sync). — ✅ live/ready (`{"db","storage": "up"|"down"}`, 503 si falla); POC: `/metrics` con prometheus-client pospuesto (se mantiene el contador simple)
5. Script `scripts/export_openapi.py` → `contracts/openapi.json` (orden estable de claves); objetivo `make openapi`; job de CI que falla si hay diff. ✅ 16/10/2026
6. Fixture de pytest con base de datos real (servicio `db` de compose o testcontainers) y *rollback* por test; fábricas de datos con `factory-boy` o funciones propias.
7. `pyproject` con umbral de cobertura por paquete (`domain`, `application`) y reporte en CI.

**Ejecución:** 1–2 en paralelo con 3–4; 5 depende de 2; 6–7 al final.
**Criterios de salida:** `make up` deja `backend` *healthy*; `curl :8000/health/ready` → 200; `make test` verde; `lint-imports` verde; `contracts/openapi.json` versionado.
**Riesgos:** sobre-ingeniería de la plantilla → limitar a lo que pide la receta §3.

### B1 · Identidad, privacidad, sync P2 y diagnóstico — S1–S3 (02/11 – 11/12/2026) · R1

**Objetivo:** un proveedor registrado envía su autoevaluación desde la PWA (offline → sync P2) y el servidor devuelve diagnóstico y plan oficiales.
**Historias:** S1 HU-IAM-01, HU-IAM-02, HU-IAM-03, HU-PRV-01, HU-CAT-01, HU-CAL-02 · S2 HU-SYN-02, HU-SYN-04, HU-PRV-02, HU-SUP-01, HU-SUP-02, HU-CAL-01, HU-ASM-01, HU-IAM-04 (soporte BE) · S3 HU-ASM-02, HU-ASM-04, HU-ASM-05, HU-IMP-01, HU-IMP-03.

**Pasos**

*S1 — iam, privacy, catalog*
1. `iam.domain`: `User` (id UUID, nombre, `phone` normalizado `+57 3xx…`, `email` opcional, `role ∈ {PROVEEDOR, REVIEWER, ADMIN}`, `status`, `failed_attempts`, `locked_until`); invariante "al menos phone o email". `PasswordHasher` puerto con adaptador Argon2id (RNF-SEC-002).
2. Casos de uso `RegisterSupplier` (ignora cualquier `role` entrante, RF-IAM-001), `Login` (bloqueo 5 intentos / 15 min, RF-IAM-006), `RefreshSession` (rotación + detección de reutilización: si llega un refresh ya rotado, revocar la familia, RNF-SEC-003), `Logout`. — ✅ 16/10/2026 Login, RefreshSession, Logout (HU-IAM-02); RegisterSupplier pendiente (HU-IAM-01)
3. Endpoints `POST /api/v1/auth/register|login|refresh|logout`, `GET /api/v1/me`. Rate limit de login 10/min/IP (RNF-SEC-005). — ✅ login/refresh/logout/me; register pendiente
4. `shared.api.auth`: `CurrentUser` desde JWT; `require(permission)` con la matriz de `requerimientos.md` §2.3 codificada en `iam.domain.permissions`. — ✅ 16/10/2026: `require` vive en `iam.api.authz` y se publica en `iam.public` (shared no puede importar módulos); propiedad con `CurrentUser.ensure_supplier_access` → 404
5. `privacy`: `ConsentText` versionado (texto + hash SHA-256), `Consent` inmutable (RF-PRV-003). `GET /api/v1/privacy/consent-texts/current`. Consentimientos llegan por sync (tabla `consents`, P2). Evento `UserRegistered` → `privacy` no crea nada (el proveedor debe aceptar), `suppliers` crea el `Supplier` vacío.
6. `catalog`: semillas de categorías (5, solo Fruver ACTIVA, RF-CAT-001), ejes Fruver (RF-CAT-002) y parámetros iniciales S-01…S-16 como **versión 1 publicada**. `GET /api/v1/catalog/bundle` (para el pull). ✅ 16/10/2026 (HU-CAT-01; S-01…S-17 + factores C-12 en `catalog_0003`)
7. `shared.domain.money`: `Money` COP entero y `format_cop()` es-CO para reportes (RF-CAL-005, HU-CAL-02).

*S2 — sync, suppliers, banco*
8. `sync`: `GET /api/v1/sync/pull` y `POST /api/v1/sync/push` según `arquitectura.md` §5. Registro de **handlers por tabla**: `sync.register_table("supplier_profile", handler, priority=P2, dto=...)`. Idempotencia por `mutation_id` en `sync.processed_mutations` (RF-SYN-002). Validación por registro con el DTO del módulo dueño; respuesta `{accepted, rejected[{id, table, code, message}]}` (RF-SYN-008). Pull: unión de cambios por módulo con `updated_at > last_pulled_at` vía fachadas `public.changes_since(user, ts)`.
9. Política de conflictos (RF-SYN-005): helper `apply_field_lww(entity, changes, server_updated_at)` para ficha; *append-only* para ERP/TRZ; *server-wins* para catálogos y plan validado.
10. `suppliers`: `Supplier` con ficha (RF-SUP-001) y caracterización (RF-SUP-002); value object `Nit` con validación de DV módulo 11 DIAN; catálogo DIVIPOLA en `catalog` (carga desde CSV del DANE en una migración de datos). Handler de sync `supplier_profile`. Evento `SupplierProfileCompleted` cuando los campos obligatorios están completos (alimenta E1). — ✅ 16/10/2026 ficha RF-SUP-001, `Nit` DV módulo 11, `SupplierProfileCompleted`, `supplier_id` en el JWT y `GET /me/supplier`. Pendiente: caracterización (HU-SUP-02), handler de sync `supplier_profile` (HU-SYN-02) y carga DIVIPOLA del DANE (hoy se valida que el municipio pertenezca al departamento)
11. `privacy`: consentimiento sensible separado y opción "prefiero no responder" (RF-PRV-002); el handler de `supplier_profile` rechaza campos sensibles sin consentimiento sensible vigente (`code: SENSITIVE_CONSENT_REQUIRED`).
12. `impact`: `CarbonFootprint.calculate(inputs, factors_version)` con los factores de DOC-FRUVER como parámetros (RF-CAL-001, C-12); fixture compartido nuevo `contracts/fixtures/carbon-footprint.json`.
13. `assessment`: modelo del **banco versionado** (RF-ASM-002): `QuestionBankVersion` (DRAFT/PUBLISHED), `Question` con eje, categorías, tamaños, tipos de persona, tipo de respuesta, peso 1–5, prioridad, `critical_when`, `sensitive`, mapeos a marcos. Semilla Fruver ≥ 25 preguntas a partir de la maqueta (`maqueta/js/data.js`), DOC-FRUVER y DOC-AUTOEVAL, revisada por Ing. Industrial.

*S3 — composición, envío, plan*
14. `assessment.domain.FormComposer`: dado (tamaño, persona, categoría, versión) → lista ordenada; límites 8/15/25; ≥ 1 por eje; prioridad descendente; determinista (mismo input → mismo formulario). Tests de la matriz 4 tamaños × 2 personas (RF-ASM-001).
15. `Cycle` (C1/C2/C3) con `Clock`; `GET /api/v1/assessment/cycles/current`; `GET /api/v1/assessment/form` devuelve el formulario compuesto y se incluye en el pull.
16. Handler de sync `assessments` + `assessment_answers` + `declarations` (P2): `SubmitAssessment` valida ciclo (S-17 para envíos tardíos), declaración firmada (RF-PRV-004), inmutabilidad (una por ciclo, RF-ASM-004); calcula ejes, P1, críticas y cercanía a BPA ICA (RF-ASM-005…009) con el motor ya validado por el fixture; persiste y emite `AssessmentSubmitted` y `CriticalRiskDetected` (la alerta queda persistida en `notifications.alerts`, visible en R3).
17. `improvement`: `GeneratePlan` (S-09, RF-IMP-001/002) — **en R1 se invoca de forma síncrona** desde `SubmitAssessment` a través de `improvement.public` (el worker llega en S7, HU-PLAT-08); guías semilla Fruver con pasos, checklist y fuente (RF-IMP-003). Fixture de plan ya cubierto por `assessment-scoring.json`.
18. Handler de sync `goal_checks` (P2) y cálculo de meta completa al 100 % (RF-IMP-004, sin foto).
19. `GET /api/v1/improvement/plan/current` e inclusión en el pull.

**Ejecución:** S1: (1→2→3) ∥ (5) ∥ (6–7); 4 tras 1. S2: 8 primero (bloquea a todos los handlers); 10–11 ∥ 12 ∥ 13. S3: 14→15→16→17→19; 18 ∥ 17.
**Criterios de salida (R1):** e2e con la PWA: registro → consentimiento → ficha → autoevaluación offline → reconexión → `assessments` aceptado una sola vez aunque se reenvíe el lote 3 veces → plan oficial descargado. Fixtures de scoring y huella verdes en Python y TS. Suite de IDOR verde para todos los endpoints de R1.
**Riesgos:** banco Fruver incompleto (Q-04 no aplica a Fruver, pero requiere revisión de Industrial) → semilla mínima de 25 preguntas validada en S2; complejidad del pull → empezar con pull completo por tabla y optimizar con índices `updated_at`.

### B2 · Mini ERP, trazabilidad y sync P1 — S4–S6 (14/12/2026 – 22/01/2027) · R2

> S4 y S5 caen en vacaciones de fin de año: planear al 60 % de capacidad.

**Objetivo:** los registros financieros y de lotes del proveedor llegan por P1, normalizados, sin exponer filas a Smile, y el servidor hace cumplir la carencia.
**Historias:** S4 HU-SYN-05, HU-CAT-02, HU-ERP-10 · S5 HU-ERP-07, HU-ERP-08, HU-CAT-03, HU-TRZ-02 · S6 HU-TRZ-06, HU-PRV-03, HU-IMP-05.

**Pasos**
1. **Prioridades en sync** (RF-SYN-003/007): `push` acepta `priority`; el servidor rechaza con `409 PRIORITY_ORDER` un lote P2 si el mismo dispositivo informa P1 pendientes (cabecera `X-Pending-P1`); soporte `Content-Encoding: gzip` en request; límite de 10 KB (P1) y 50 KB (P2) descomprimido → `413` con `code: BATCH_TOO_LARGE`.
2. `catalog`: productos por categoría con unidad base, conversiones (S-12) y rango de precio creíble (S-11); agroquímicos con registro ICA y tabla de carencia agroquímico × cultivo (RF-CAT-005; datos iniciales según Q-03).
3. `erp.domain`: `Sale`, `Cost` (4 categorías, bandera `bpa_investment`), `StockEntry`, `Waste` (4 causas C-06); `Quantity(value, unit)` con `to_base(product)`; todos *append-only* con `voided_at` + `void_reason` (S-10, 7 días).
4. Handlers de sync `erp_sales`, `erp_costs`, `erp_stock_entries`, `erp_waste` (P1): normalizan a unidad base guardando la original (RF-ERP-008); validan rango creíble solo como **advertencia** (`warnings[]` en la respuesta, nunca rechazo, RF-ERP-007).
5. Proyección de agregados (`erp.application.queries.SupplierErpSummary`): ventas, costos, margen %, % merma, frecuencia semanal por ciclo — **es lo único que `erp.public` expone a otros módulos y a roles internos** (RF-PRV-007). Test de arquitectura: ningún router accesible por REVIEWER/ADMIN serializa modelos `erp_*`.
6. Hypertable TimescaleDB para `erp.entries_ts` (vista unificada de eventos ERP por tiempo) si el volumen lo justifica; si no, índice `(supplier_id, occurred_on)`. Decisión registrada en `esquema-datos.md`.
7. `traceability.domain`: `Application`, `Lot` con `min_dispatch_date = max(applied_on + withholding_days)`; `release(today)` lanza `WithholdingPeriodNotMet(days_left)` (RF-TRZ-002/003); declaración "sin aplicaciones" (RF-TRZ-005); `LabelCode` con el formato S-16 y DV módulo 11 — **mismo algoritmo** que la PWA: fixture `contracts/fixtures/lot-label.json`.
8. Handlers de sync `trz_applications`, `trz_lots` (P1); el servidor **re-valida la carencia** con sus propias aplicaciones y rechaza `WITHHOLDING_NOT_MET` (RF-TRZ-007). Unicidad del rótulo garantizada por sufijo de dispositivo; colisión → `409` con sugerencia de reemisión.
9. `GET /api/v1/lots/{code}/verify` (REVIEWER) para recepciones (usa `traceability.public`).
10. Evidencias (RF-IMP-004 foto): `POST /api/v1/improvement/goals/{id}/evidence-upload-url` → URL prefirmada PUT con `Content-Type` fijo y tamaño ≤ 1 MB (ADR-0008); handler posterior valida *magic bytes* (RNF-SEC-006). Prioridad P3 la gestiona la PWA (R4).

**Ejecución:** 1 ∥ 2 → 3 → 4 → 5; 7 → 8 → 9; 10 independiente.
**Criterios de salida (R2):** pruebas de propiedad (Hypothesis) sobre inventario = entradas − ventas − mermas; fixture de rótulo verde en ambos lados; prueba de que un lote liberado antes de tiempo desde un cliente manipulado se rechaza; ningún endpoint interno devuelve filas ERP.
**Riesgos:** tabla de carencia oficial no disponible (Q-03) → cargar fichas técnicas de los 15 agroquímicos más usados en el piloto, marcadas `source=ficha_tecnica`.

### B3 · Worker, auditoría y CRM back-office — S7–S9 (25/01 – 05/03/2027) · R3

**Objetivo:** Smile opera el CRM: expediente, recepciones, score 50/30/20, funnel, mensajes, alertas y dashboards de riesgo y calidad.
**Historias:** S7 HU-PLAT-08, HU-PLAT-07, HU-IAM-05, HU-PRV-05, HU-SUP-03, HU-SUP-04 · S8 HU-SUP-06, HU-SUP-07, HU-SUP-08, HU-CAT-04, HU-ASM-06, HU-IMP-07, HU-REC-01 · S9 HU-REC-03, HU-SCO-01…05, HU-NOT-02, HU-NOT-03, HU-RPT-01…03.

**Pasos**
1. **Worker** (ADR-0007, HU-PLAT-08): despachador del outbox con `FOR UPDATE SKIP LOCKED`, lotes de 50, reintentos exponenciales, *dead letter* tras 10 intentos, métricas; handlers idempotentes por `event_id` (`shared.processed_events`). Mover `GeneratePlan` del flujo síncrono a `on AssessmentSubmitted`. APScheduler: `daily_provisional_score` (02:00), `close_cycle` (último día del ciclo 23:59 Bogotá), `document_expiry_scan` (06:00).
2. **Auditoría** (RNF-SEC-007, HU-PLAT-07): decorador `@audited(action)` en casos de uso internos → `shared.audit_log(actor_id, action, resource, resource_id, ip, at, details)`; retención 2 años con tarea de purga.
3. `iam` admin (RF-IAM-005): `GET/POST /api/v1/admin/users`, `PATCH /api/v1/admin/users/{id}` (rol, estado) con revocación de refresh tokens; invariante "no dejar el sistema sin ADMIN".
4. `privacy` revocación (RF-PRV-005): `POST /api/v1/privacy/revocations`; `sync.push` responde `403 CONSENT_REVOKED` para datos nuevos; solicitud de supresión con vencimiento a 15 días hábiles (calendario de festivos colombianos en `catalog`).
5. `suppliers`: segmento Pareto (RF-SUP-004), bóveda documental con URL prefirmada (RF-SUP-005), visitas con compromisos (RF-SUP-007), incidentes (RF-SUP-008) y **expediente unificado** `GET /api/v1/suppliers/{id}/dossier` que compone por fachadas: `suppliers` + `scoring.public` + `improvement.public` + `recognition.public` + `notifications.public` + `erp.public.summary` (RF-SUP-009). Lista `GET /api/v1/suppliers` con filtros (categoría, segmento, etapa, municipio, texto) y paginación por cursor.
6. `catalog` parámetros versionados (RF-CAT-004): `POST /api/v1/admin/parameters/versions`, `POST …/{v}/publish` con `effective_from`; evento `ParametersPublished`; toda fórmula guarda la versión de parámetros con que se calculó.
7. `assessment` admin del banco (RF-ASM-011) y `improvement` admin de guías (RF-IMP-006, CU-31), ambos con borrador → publicado inmutable.
8. `receptions` (RF-REC-001, 005): `POST /api/v1/receptions`, `GET /api/v1/receptions?supplier_id=`, validación de rótulo vía `traceability.public`; evento `ReceptionRecorded`; `GET /api/v1/me/receptions` (RF-REC-004).
9. `receptions.domain.Pillar2` (S-05) y `scoring.domain.Pillar3` (S-06), `TotalScore` con renormalización (S-07) — fixture `contracts/fixtures/total-score.json`.
10. `scoring.domain.Funnel`: tabla de transiciones E1–E6 (S-08, C-10) como función pura `stage(facts) → Stage` con `facts` obtenidos por fachadas; tests de tabla para todas las transiciones y regresiones. Historial en hypertable `scoring.score_snapshots(supplier_id, cycle, kind {provisional, official}, p1, p2, p3, total, stage, params_version, at)`.
11. `close_cycle` (CU-19): para cada proveedor → P1 del ciclo (o el último, RF-ASM-004), P2, P3, total oficial, etapa; eventos `ScoreRecalculated`, `StageChanged`; ejecución idempotente por `(cycle, supplier)`.
12. `POST /api/v1/suppliers/{id}/stage` (ADMIN: E6 y override con motivo, RF-SCO-005) y `GET /api/v1/me/score` con explicación por pilar en texto llano (RF-SCO-006; textos en `catalog` para edición sin despliegue).
13. `notifications`: mensajes directos (`POST /api/v1/suppliers/{id}/messages`; bandeja del proveedor por pull; respuesta por sync `message_replies`), alertas internas (`GET /api/v1/alerts`, `PATCH /api/v1/alerts/{id}`) alimentadas por `CriticalRiskDetected`, vencimientos y privacidad (RF-NOT-001, 004).
14. `reporting`: proyecciones propias alimentadas por eventos (`reporting.supplier_snapshot`, `reporting.reception_daily`, `reporting.funnel_daily`) y endpoints `GET /api/v1/dashboards/risk|funnel|quality` (RF-RPT-001…003, 006). Ninguna consulta cruza esquemas.

**Ejecución:** 1 y 2 primero (S7) porque todo R3 depende de eventos y auditoría; 3 ∥ 4 ∥ 5; S8: 5 (visitas, expediente) ∥ 6 ∥ 7 ∥ 8; S9: 9 → 10 → 11 → 12; 13 ∥ 14.
**Criterios de salida (R3):** cierre de ciclo simulado sobre 450 proveedores sintéticos en < 60 s; transiciones del funnel 100 % cubiertas; dashboards p95 < 300 ms; auditoría presente en toda acción interna (test que recorre los routers internos).
**Riesgos:** S9 tiene 42 pts (sobrecarga) → mover HU-RPT-03 a S10 si al cierre de S8 la velocidad es < 35; fuente de recepciones (Q-06) → CSV en R4 (HU-REC-02).

### B4 · Micro-learning, reconocimientos y pendientes Should — S10–S11 (08/03 – 02/04/2027) · R4

**Historias:** S10 HU-LRN-01, HU-LRN-02, HU-IAM-06, HU-IAM-07, HU-SUP-05, HU-REC-02, HU-IMP-06 · S11 HU-GAM-01…04, HU-ASM-07, HU-ASM-08, HU-RPT-04, HU-NOT-04.

**Pasos**
1. `learning`: `Content` (clip/ficha) con validación al confirmar la subida: MP4 H.264 (`ffprobe` **no** en la imagen runtime → validación por cabecera `ftyp` + `avc1` y duración leída del átomo `mvhd` con un parser puro), ≤ 120 s, ≤ 4 MB; PDF/PNG por *magic bytes* (RF-LRN-001). Admin CRUD + publicar (RF-LRN-005, CU-31).
2. Asignación automática `on PlanGenerated` según metas y path (RF-LRN-002); progreso por sync `content_progress` (P2) con regla ≥ 90 % (S-15) → `ContentCompleted`.
3. Descargas: `GET /api/v1/me/learning/assignments` con URL prefirmada GET de 15 min por recurso (la PWA las usa en P3).
4. `recognition`: reglas automáticas de Flores y Caritas (S-14, C-05) como funciones puras sobre hechos agregados (merma mensual por recepciones, semanas con registro ERP, plan 100 %, documento a tiempo, compost); otorgamiento/retiro manual con motivo y auditoría (RF-GAM-001/002); insignia Maestro (RF-GAM-003); elegibilidad +4 % con la regla de Q-01 como parámetro y exportación CSV de elegibles (RF-GAM-004).
5. `assessment`: recordatorios 14 y 3 días antes del cierre (RF-ASM-012) vía `notifications`; cercanía a B Corp, GlobalG.A.P. e ISO 14001 (RF-ASM-009 R4).
6. `reporting`: consola ESG (RF-RPT-004) desde el mapeo de preguntas a marcos.
7. `notifications`: Web Push (VAPID) opcional (RF-NOT-003).
8. Pendientes *Should*: restablecimiento de contraseña (RF-IAM-007), registro asistido (RF-IAM-008), verificación de documentos (RF-SUP-006), importación CSV de recepciones con reporte de errores por fila (RF-REC-002), validación de metas (RF-IMP-005).

**Criterios de salida (R4):** fixture `contracts/fixtures/recognitions.json` verde; un clip > 4 MB se rechaza; elegibles +4 % exportables.

### B5 · Impacto, reportes, ARCO y categorías — S12–S14 (05/04 – 14/05/2027) · R5

**Historias:** S12 HU-CAL-03, HU-CAL-04, HU-CAL-05, HU-RPT-05 · S13 HU-RPT-06, HU-RPT-07, HU-PRV-06 · S14 HU-CAT-05, HU-PLAT-09.

**Pasos**
1. `impact`: huella por tonelada (RF-CAL-002), ROI (RF-CAL-003) mostrando cada término y su origen, SROI (RF-CAL-004) con parámetros de monetización de Q-02; endpoints `GET /api/v1/me/impact/{footprint|roi|sroi}`; fixtures en `contracts/fixtures/impact.json`.
2. `reporting` exportaciones (RF-RPT-005): `POST /api/v1/reports {type, format, filters}` → `202 {report_id}`; el worker genera XLSX (openpyxl) y PDF (ReportLab, plantilla con la paleta oficial y Fraunces/Manrope embebidas), los sube al almacenamiento y `GET /api/v1/reports/{id}` devuelve estado + URL firmada. Tipos: huella consolidada kg CO₂e/t, matriz DDHH y trabajo infantil, informe de retorno social y ambiental. Formato CCB según Q-05 (si no llega, estructura Porter & Kramer documentada). Objetivo ≤ 30 s / 450 proveedores (RNF-PERF-005).
3. `privacy` ARCO (RF-PRV-006): exportación de datos del proveedor (JSON + PDF) generada por el worker; flujo de supresión con anonimización (no borrado físico de agregados ya reportados).
4. `catalog` + `assessment`: activar Lácteos, Carnes, Pescados y Mariscos, Insumos y Servicios con sus ejes y bancos (Q-04, DOC-MATRIZ §3–§9) (RF-CAT-001).
5. Cifrado de columnas sensibles en reposo (RNF-SEC-008) con `pgcrypto` o cifrado de aplicación (clave en Secret Manager) — decisión en un ADR-0009.

**Criterios de salida (R5):** los tres reportes se generan en < 30 s con datos sintéticos de 450 proveedores; ARCO completo en staging.

### B6 · Endurecimiento y despliegue — S15–S16 (17/05 – 11/06/2027) · R6

**Historias:** HU-PLAT-11 (carga), HU-PLAT-14 (seguridad), HU-PLAT-15 (backups), HU-PLAT-16 (producción).

**Pasos**
1. k6: escenarios `sync_push_p1` (100 registros), `dashboard_risk`, `login`; objetivo p95 < 300 ms con 450 proveedores y 2 años de datos sintéticos (RNF-PERF-004).
2. OWASP ASVS L1: checklist en `docs/sistema/seguridad-asvs.md`; `bandit`, `pip-audit` en CI; cabeceras; pruebas de JWT manipulados y de reutilización de refresh.
3. Expand/contract en migraciones (sin downtime) y verificación de restauración de backups (coordinado con PLAN_INFRA I4).
4. Adaptador `GcsFileStorage` real + suite de contrato contra GCS en staging (ADR-0004/0008).

---

## 5. Catálogo de la API

Prefijo `/api/v1`. **Rol:** P = PROVEEDOR, R = REVIEWER, A = ADMIN. Las entidades que la PWA escribe se envían **por sync** (no tienen endpoint REST de escritura para el proveedor).

| Módulo | Método y ruta | Rol | Fase | HU |
|---|---|---|---|---|
| iam | `POST /auth/register` · `POST /auth/login` · `POST /auth/refresh` · `POST /auth/logout` · `GET /me` | público / todos | B1 | HU-IAM-01, 02, 04 |
| iam | `GET/POST /admin/users` · `PATCH /admin/users/{id}` | A | B3 | HU-IAM-05 |
| iam | `POST /auth/password/forgot` · `POST /auth/password/reset` · `POST /suppliers/{id}/reset-codes` · `POST /assisted-registrations` | público / R | B4 | HU-IAM-06, 07 |
| privacy | `GET /privacy/consent-texts/current` | P | B1 | HU-PRV-01 |
| privacy | `POST /privacy/revocations` · `GET /admin/privacy-requests` · `PATCH /admin/privacy-requests/{id}` | P / A | B3 | HU-PRV-05 |
| privacy | `POST /privacy/exports` · `POST /privacy/deletion-requests` | P | B5 | HU-PRV-06 |
| suppliers | `GET /suppliers` · `GET /suppliers/{id}/dossier` | R, A | B3 | HU-SUP-08 |
| suppliers | `PATCH /suppliers/{id}/segment` | A | B3 | HU-SUP-03 |
| suppliers | `POST /suppliers/{id}/documents/upload-url` · `POST /suppliers/{id}/documents` · `PATCH /documents/{id}/verification` | P, R | B3/B4 | HU-SUP-04, 05 |
| suppliers | `POST /suppliers/{id}/visits` · `POST /suppliers/{id}/incidents` | R | B3 | HU-SUP-06, 07 |
| catalog | `GET /catalog/bundle` | todos | B1 | HU-CAT-01…03 |
| catalog | `/admin/catalog/{categories,products,agrochemicals,withholding-periods}` · `/admin/parameters/versions` | A | B2/B3 | HU-CAT-02…04 |
| assessment | `GET /assessment/cycles/current` · `GET /assessment/form` · `POST /assessment/score-preview` | P | B1 | HU-ASM-02, 04 |
| assessment | `/admin/question-bank/versions` (CRUD + `publish`) · `GET /suppliers/{id}/assessments` | A / R | B3 | HU-ASM-06 |
| improvement | `GET /improvement/plan/current` · `POST /improvement/goals/{id}/evidence-upload-url` | P | B1/B2 | HU-IMP-01, 05 |
| improvement | `PATCH /improvement/goals/{id}/validation` · `/admin/guides` | R / A | B3/B4 | HU-IMP-06, 07 |
| erp | `GET /suppliers/{id}/erp-summary` (solo agregados) | R, A | B2 | HU-PRV-03 |
| traceability | `GET /lots/{code}/verify` | R | B2 | HU-TRZ-06 |
| receptions | `POST /receptions` · `GET /receptions` · `GET /me/receptions` | R / P | B3 | HU-REC-01, 04 |
| receptions | `POST /receptions/import` (CSV) | R | B4 | HU-REC-02 |
| scoring | `GET /me/score` · `GET /suppliers/{id}/score-history` · `POST /suppliers/{id}/stage` | P / R / A | B3 | HU-SCO-01…05 |
| recognition | `POST /suppliers/{id}/flowers` · `DELETE /flowers/{id}` · `GET /me/recognitions` · `GET /incentives/eligible` | R / P / R | B4 | HU-GAM-01…05 |
| learning | `/admin/contents` (upload-url, create, publish) · `GET /me/learning/assignments` | A / P | B4 | HU-LRN-01…03 |
| impact | `GET /me/impact/footprint` · `GET /me/impact/roi` · `GET /me/impact/sroi` | P | B5 | HU-CAL-03…05 |
| reporting | `GET /dashboards/{risk,funnel,quality}` | R, A | B3 | HU-RPT-01…03 |
| reporting | `GET /dashboards/esg` · `POST /reports` · `GET /reports/{id}` | R, A | B4/B5 | HU-RPT-04…07 |
| notifications | `POST /suppliers/{id}/messages` · `GET /alerts` · `PATCH /alerts/{id}` · `POST /push/subscriptions` | R / P | B3/B4 | HU-NOT-02…04 |
| sync | `GET /sync/pull` · `POST /sync/push` | P | B1 | HU-SYN-02…05 |
| transversal | `/health/live` · `/health/ready` · `/metrics` · `/openapi.json` | — | B0 | HU-PLAT-02, 06 |

### 5.1 Tablas de sync por módulo

| Tabla WatermelonDB | Módulo dueño | Prioridad | Política | Fase |
|---|---|---|---|---|
| `consents`, `declarations` | privacy | P2 | append-only | B1 |
| `supplier_profile` | suppliers | P2 | LWW por campo | B1 |
| `assessments`, `assessment_answers` | assessment | P2 | inmutable tras envío | B1 |
| `goal_checks` | improvement | P2 | LWW | B1 |
| `erp_sales`, `erp_costs`, `erp_stock_entries`, `erp_waste` | erp | P1 | append-only (+ anulación) | B2 |
| `trz_applications`, `trz_lots` | traceability | P1 | append-only; servidor revalida | B2 |
| `content_progress`, `message_replies` | learning, notifications | P2 | append-only | B3/B4 |
| `evidences` | improvement | P3 | subida directa + registro | B2/B4 |

## 6. Estándares

### 6.1 Nombres
Paquetes y módulos en inglés (`traceability`), términos de negocio colombianos sin traducir cuando no existe equivalente exacto (`rotulo` → `LabelCode` con docstring en español). Casos de uso con verbo en infinitivo inglés (`SubmitAssessment`). Eventos en pasado (`LotReleased`).

### 6.2 Dinero, cantidades y tiempo
`Money` COP entero (BIGINT); `Quantity` con `Decimal` y 3 decimales; instantes `timestamptz` en UTC; fecha de negocio `date` en `America/Bogota` (RNF-DATA-001). Prohibido `float` en dominio (ruff regla custom o revisión).

### 6.3 Errores HTTP
`400` validación de forma · `401` sin sesión · `403` sin permiso o consentimiento revocado · `404` recurso inexistente **o ajeno** (no revelar existencia) · `409` conflicto de estado (`WITHHOLDING_NOT_MET`, `PRIORITY_ORDER`, `ALREADY_SUBMITTED`) · `413` lote muy grande · `422` regla de negocio · `423` cuenta en pausa por intentos fallidos (HU-IAM-02) · `429` rate limit.

### 6.4 Pruebas

| Nivel | Herramienta | Qué cubre | Umbral |
|---|---|---|---|
| Unitario dominio/aplicación | pytest, Hypothesis | reglas, invariantes, casos de uso con fakes | ≥ 85 % |
| Contrato de reglas | pytest + `contracts/fixtures/*.json` | igualdad Python ↔ TS | 100 % de casos |
| Integración | pytest + PostgreSQL real | repositorios, migraciones, outbox | rutas críticas |
| API | httpx ASGI | esquemas, roles, IDOR, idempotencia | todos los endpoints |
| Arquitectura | import-linter | capas e independencia de módulos | 0 violaciones |
| Carga | k6 | p95 | RNF-PERF-004 |

## 7. Riesgos

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| Reglas de negocio cambian (S-xx, Q-xx) | Alta | Medio | Parámetros versionados, fórmulas puras con fixtures |
| Divergencia Python ↔ TS | Media | Alto | Fixtures obligatorios en CI (ADR-0005) |
| Sync con datos corruptos o duplicados | Media | Alto | Idempotencia, validación por registro, pruebas de caos con la PWA |
| Sobrecarga de S9 | Alta | Medio | Regla de corte al cierre de S8 (B3) |
| Acoplamiento entre módulos | Media | Alto | import-linter, revisión de `public.py` en cada PR |
| Datos sensibles en logs | Baja | Alto | Filtro de PII en logs + test |

## 8. Cómo verificar

```bash
make up                         # stack completo
make test                       # backend + frontend
cd backend && uv run pytest -q && uv run lint-imports && uv run ruff check && uv run mypy src
make openapi && git diff --exit-code contracts/openapi.json
curl -s localhost:8000/health/ready
```
