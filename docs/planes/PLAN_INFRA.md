# Plan de infraestructura y plataforma

**Versión 1.0 · 15 de octubre de 2026** · Dueño: rol Ingeniería de Sistemas (plataforma)

Este plan lleva la plataforma de "corre en mi máquina" a "piloto rural en producción" sin romper el contrato que comparten `frontend/`, `backend/` e `infra/`.

## 0. Contexto y fuentes de verdad

| Fuente | Qué impone a la infraestructura |
|---|---|
| [SPEC-BASE encabezado, §2] | Next.js PWA, FastAPI, PostgreSQL/TimescaleDB, Firebase / Cloud Storage |
| [SPEC-BASE §8.1] | Bundle < 2,0 MB comprimido, FCP < 1,8 s en 3G, 100 % offline en Mini ERP y guías |
| [SPEC-BASE §8.2], [SPEC-DASH §1.2] | Habeas Data, TLS 1.3, cifrado, datos del proveedor no expuestos a terceros |
| [SPEC-SOT §5.2] | Cola P1/P2/P3 con payloads < 10 KB / < 50 KB / < 4 MB |
| [`arquitectura.md` §2, §7](../sistema/arquitectura.md) | Contenedores, servicios de compose, variables de entorno, endpoints de salud, etapas de Dockerfile |
| [ADR-0003](../adr/ADR-0003-monorepo-docker-multistage.md) | Monorepo + compose + multistage + `Makefile` como interfaz única |
| [ADR-0004](../adr/ADR-0004-almacenamiento-objetos.md) | Puerto `FileStorage`: S3 (SeaweedFS, ADR-0008) en dev, GCS/Firebase en producción |
| [ADR-0007](../adr/ADR-0007-tareas-asincronas-outbox.md) | Worker con outbox en PostgreSQL, sin broker |
| [`requerimientos.md` §4](../sistema/requerimientos.md) | RNF-POR-001/002, RNF-SEC-001…008, RNF-REL-001/002, RNF-OBS-001/002, RNF-PERF-001…005 |
| [`conflictos-y-supuestos.md`](../sistema/conflictos-y-supuestos.md) | Q-09 (hosting de producción) abierta |

**Regla:** cualquier cambio a puertos, nombres de servicio, variables o targets de Docker actualiza primero `arquitectura.md` §7 y luego este plan, en el mismo PR.

## 1. Estado actual (S0, 15-oct-2026)

| Pieza | Estado | Archivo |
|---|---|---|
| Compose base (db, storage, storage-init, migrate, backend, worker, frontend, mailpit[dev]) | ✅ `config` válido | `infra/docker-compose.yml` |
| Override de desarrollo (targets `dev`, montajes, hot reload, puertos de debug) | ✅ `config` válido | `infra/docker-compose.dev.yml` |
| Variables de entorno de ejemplo | ✅ | `infra/.env.example` |
| Scripts (smoke, backup, restore, wait) | ✅ | `infra/scripts/` |
| `Makefile` raíz | ✅ | `Makefile` |
| CI con filtro de rutas | ✅ escrito, pendiente de primera corrida en GitHub | `.github/workflows/ci.yml` |
| Dockerfiles multistage | ⏳ en construcción por los planes de backend y frontend | `backend/Dockerfile`, `frontend/Dockerfile` |

**Almacenamiento S3 de desarrollo:** MinIO dejó de publicar imágenes oficiales (`minio/minio` y `minio/mc` devuelven acceso denegado). Se reemplazó por **SeaweedFS** con imagen oficial `chrislusf/seaweedfs:3.97` (Apache-2.0): servicio `storage` (`weed server -s3`) y `storage-init` (crea el bucket con `weed shell`). Verificado: PUT/GET con URL prefirmada, rechazo de credenciales inválidas y de acceso anónimo. Ver [ADR-0008](../adr/ADR-0008-seaweedfs-en-desarrollo.md).

## 2. Objetivos medibles

| ID | Objetivo | Métrica | Release |
|---|---|---|---|
| OI-1 | Arranque reproducible | `make env && make up` en máquina limpia deja 7 servicios `healthy`/`exited 0` en < 10 min (primer build) y < 60 s (con caché) | R0 |
| OI-2 | Imágenes pequeñas y seguras | backend runtime < 250 MB, frontend runner < 200 MB, usuario no root, 0 CVE críticas sin excepción | R0 / R1 |
| OI-3 | CI rápido | PR típico < 10 min; solo corre lo que cambió | R0 |
| OI-4 | Entornos | dev, test (CI), staging y producción con la misma imagen promovida por digest | R3 |
| OI-5 | Disponibilidad | back-office 99,5 % mensual (RNF-REL-001) | R6 |
| OI-6 | Datos | RPO 24 h, RTO 4 h, restauración probada cada mes (RNF-REL-002) | R3 |
| OI-7 | Rendimiento | FCP < 1,8 s en 3G (Lighthouse CI), API p95 < 300 ms (k6), bundle < 2,0 MB (CI) | R1 → R6 |
| OI-8 | Operación rural | Tablero de sync: % de push aceptados, rechazos por código, antigüedad de la cola por dispositivo | R2 / R6 |

## 3. Fases

Las fases se alinean con los releases y sprints de [`requerimientos.md` §5](../sistema/requerimientos.md). Las historias de plataforma usan el prefijo `HU-PLAT-NN`; cuando el número no está fijado en [`historias-de-usuario.md`](../sistema/historias-de-usuario.md) se citan por título y RNF.

---

### I0 · Fundaciones — R0 · S0

**Objetivo:** cualquier integrante levanta todo el sistema con un comando y el CI protege `develop`.

**Entregables:** compose base + dev, Dockerfiles multistage (con los planes de backend y frontend), `Makefile`, `.env.example`, CI, `.editorconfig`, `.gitignore`.

**Steps**
1. `make env` → crea `infra/.env` desde `infra/.env.example`. Generar `JWT_SECRET` con `python -c "import secrets; print(secrets.token_urlsafe(48))"`.
2. `make config` → valida `docker compose config` de base y dev.
3. Coordinar con backend: `backend/Dockerfile` con etapas `base → builder → dev | runtime` (arquitectura §7.4). Requisitos que el compose asume:
   - `runtime` arranca `uvicorn smile.main:app --host 0.0.0.0 --port 8000` como `CMD` por defecto e incluye `alembic` y `alembic.ini` + `migrations/` en `/app`.
   - `dev` incluye dependencias de desarrollo, `watchfiles` (lo usa el worker en dev) y `debugpy`.
   - `python` disponible en `PATH` (el healthcheck usa `python -c urllib...`; no se instala curl).
   - `GET /health/live`, `GET /health/ready` (comprueba DB y bucket).
4. Coordinar con frontend: `frontend/Dockerfile` con `deps → builder → dev | runner`; `ARG NEXT_PUBLIC_API_URL` en `builder`; `output: "standalone"`; ruta `GET /api/health`; `runner` con `node server.js`, usuario `nextjs`.
5. `make up` → todo `healthy`; `make smoke` → 5 ✔.
6. `make up-dev` → editar un archivo en `backend/src` y en `frontend/src` recarga en < 3 s.
7. Activar protección de rama en GitHub para `develop` y `main`: CI obligatorio, 1 revisión, sin push directo.
8. Primera corrida de `.github/workflows/ci.yml` en un PR; registrar tiempos.

**Aceptación**
- [ ] `make up` en máquina limpia: `docker compose ps` muestra `db`, `storage`, `backend`, `worker`, `frontend` en `running (healthy)` o `running`; `storage-init` y `migrate` en `exited (0)`.
- [ ] `make smoke` sale con código 0.
- [ ] `docker image inspect smile/backend:local --format '{{.Size}}'` < 250 MB; frontend < 200 MB; `.Config.User` no es root.
- [ ] CI verde en un PR que toca backend y en uno que toca frontend; un PR solo de docs no ejecuta jobs pesados.

**Riesgos:** dependencias nativas de WatermelonDB/LokiJS en Alpine → si falla `npm ci`, usar `node:22-bookworm-slim` en `deps`/`builder` y mantener Alpine en `runner`.

**Historias:** HU-PLAT-01 "Levantar el sistema con un comando" (RNF-POR-001) · HU-PLAT-02 "CI que bloquea cambios rotos" (RNF-MNT-001…004).

---

### I1 · Calidad y seguridad de la cadena de suministro — R1 · S1–S3

**Objetivo:** ninguna imagen o dependencia vulnerable llega a `develop`; los secretos nunca entran al repo.

**Steps**
1. **Escaneo de imágenes:** job `security` en CI con `aquasecurity/trivy-action` (versión fijada) sobre `smile/backend:ci` y `smile/frontend:ci`; falla con `CRITICAL`, reporta `HIGH`. Excepciones en `.trivyignore` con fecha de expiración y justificación.
2. **SBOM:** `anchore/sbom-action` (SPDX JSON) por imagen, publicado como artefacto; en releases, adjunto al tag.
3. **Dependencias:** Renovate (`renovate.json`) agrupando: `python` (uv.lock), `npm`, `docker` (tags de imágenes base y de compose, incluido el de SeaweedFS), `github-actions`. Ventana: lunes, máximo 5 PR abiertos; parches de seguridad sin ventana.
4. **Secretos:** `gitleaks` en pre-commit y en CI; `.env` ignorado; plantilla de `.env` sin secretos reales. Rotación documentada de `JWT_SECRET` y llaves S3.
5. **Base de imágenes:** fijar `python:3.12-slim` y `node:22-alpine` por digest en los Dockerfiles; Renovate los actualiza.
6. **Almacenamiento S3 de dev:** resuelto con SeaweedFS (ADR-0008). Agregar a la suite de contrato de `FileStorage` un job de CI que levante `storage` y pruebe presign PUT/GET.
7. **Headers y TLS (preparación):** definir la configuración del proxy de borde para staging/prod (HSTS, CSP, `Permissions-Policy`) — RNF-SEC-001/005.

**Aceptación:** pipeline falla al introducir una imagen con CVE crítica conocida (prueba controlada); SBOM disponible por build; `gitleaks` detecta un secreto de prueba; ADR-0008 aprobado.

**Riesgos:** falsos positivos de Trivy en Alpine → `--ignore-unfixed`. Ruido de Renovate → agrupación y automerge solo para parches con CI verde.

**Historias:** HU-PLAT-03 "Escaneo de vulnerabilidades y SBOM" (RNF-SEC-005), HU-PLAT-04 "Gestión de secretos" (RNF-SEC-001).

---

### I2 · Entornos — R2–R3 · S4–S9

**Objetivo:** dev, test, staging y producción con la misma imagen promovida por digest.

**Propuesta de producción (alineada al spec, sujeta a Q-09):**

| Componente | Servicio GCP | Notas |
|---|---|---|
| `frontend` | Cloud Run (min 1 instancia para evitar arranque en frío en FCP) | Imagen `runner`; Cloud CDN delante para `/_next/static` y el Service Worker |
| `backend` | Cloud Run (min 1, máx 4) | Imagen `runtime`; conexión a DB por conector privado |
| `worker` | Cloud Run con `--no-cpu-throttling`, 1 instancia fija | Misma imagen, comando `python -m smile.worker`; APScheduler necesita proceso siempre vivo |
| `migrate` | Cloud Run Job | Se ejecuta antes de cada despliegue del backend |
| Base de datos | **Decisión pendiente (Q-09):** Cloud SQL para PostgreSQL **no ofrece la extensión TimescaleDB**. Opciones: (a) Timescale Cloud (gestionado, misma extensión); (b) PostgreSQL + TimescaleDB en GCE/GKE gestionado por el equipo; (c) Cloud SQL y reemplazar *hypertables* por **particionado nativo por rango de fecha** (`PARTITION BY RANGE`) en `scoring.score_snapshots` y `erp.*`. Recomendación: (c) para el piloto (450 proveedores no requieren Timescale; menor operación), manteniendo el SQL compatible para migrar a (a) si crece. | Registrar ADR-0009 |
| Objetos | Google Cloud Storage (backend de Firebase Storage) | `STORAGE_PROVIDER=gcs`; bucket privado; URLs firmadas V4 de 15 min (RNF-SEC-006); CORS solo al dominio del frontend |
| Secretos | Secret Manager | Montados como variables de entorno en Cloud Run |
| Correo | Proveedor SMTP transaccional | `SMTP_HOST`/`SMTP_PORT` + credenciales |
| Dominio y TLS | Cloud Load Balancing + certificado gestionado | TLS 1.3, HSTS (RNF-SEC-001) |

**Variables por entorno**

| Variable | dev (compose) | test (CI) | staging | producción |
|---|---|---|---|---|
| `APP_ENV` | `development` | `test` | `production` | `production` |
| `DATABASE_URL` | `…@db:5432/smile` | `…@localhost:5432/smile_test` | Secret Manager | Secret Manager |
| `JWT_SECRET` | `.env` local | valor fijo de CI | Secret Manager | Secret Manager (rotación trimestral) |
| `STORAGE_PROVIDER` | `s3` (SeaweedFS) | `s3` | `gcs` | `gcs` |
| `S3_ENDPOINT_URL` / `S3_PUBLIC_ENDPOINT_URL` | `http://storage:8333` / `http://localhost:9000` | `http://localhost:9000` | — | — |
| `S3_BUCKET` | `smile-files` | `smile-files` | `smile-files-staging` | `smile-files-prod` |
| `CORS_ORIGINS` | `http://localhost:3000` | — | `https://staging.<dominio>` | `https://<dominio>` |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | `http://localhost:8000` | `https://api.staging.<dominio>` | `https://api.<dominio>` |
| `API_INTERNAL_URL` | `http://backend:8000` | — | URL interna de Cloud Run | URL interna de Cloud Run |
| `SMTP_HOST` | `mailpit` | — | proveedor (sandbox) | proveedor |
| `LOG_LEVEL` | `DEBUG`/`INFO` | `INFO` | `INFO` | `INFO` |
| `TZ` | `America/Bogota` | `America/Bogota` | `America/Bogota` | `America/Bogota` |

**Steps**
1. ADR-0009 (base de datos de producción) y respuesta a Q-09.
2. Infra como código en `infra/terraform/` (proyecto, Artifact Registry, Cloud Run ×3 + Job, DB, GCS, Secret Manager, LB, IAM con cuentas de servicio por servicio y mínimo privilegio).
3. Adaptador `GcsFileStorage` probado con la misma suite de contrato que `S3FileStorage` (coordinado con PLAN_BACKEND).
4. `NEXT_PUBLIC_API_URL` es de build: construir el `runner` por entorno o leer la URL en runtime vía `/api/config` (decisión con PLAN_FRONTEND; preferido runtime para promover una sola imagen).
5. Datos de staging: semilla sintética; **nunca** copiar datos reales de producción (Habeas Data).

**Aceptación:** staging accesible por HTTPS; la imagen desplegada en producción tiene el mismo digest que la validada en staging; `terraform plan` sin cambios tras aplicar.

**Historias:** HU-PLAT-05 "Entorno de staging" (RNF-POR-002), HU-PLAT-06 "Producción en GCP" (RNF-SEC-001, RNF-REL-001).

---

### I3 · Observabilidad — R3 · S7–S9

**Objetivo:** detectar en minutos un fallo de sync o de API, sin registrar datos personales.

**Steps**
1. Logs JSON con `request_id`, `user_role`, `module`, `latency_ms`; filtro de PII (cédula, NIT, teléfono, correo) en el formateador (RNF-OBS-001). Prueba automatizada que falla si un log contiene un patrón de PII.
2. Métricas Prometheus en `/metrics`: `http_requests_total`, latencia por ruta, `sync_push_records_total{table,result}`, `sync_rejections_total{code}`, `outbox_pending`, `outbox_dead_letter_total`, `jobs_duration_seconds{job}`.
3. Trazas OpenTelemetry (FastAPI + SQLAlchemy) exportadas a Cloud Trace en prod; en dev, perfil `observability` en compose con Grafana + Prometheus + Tempo (opcional).
4. Errores de la PWA: endpoint `POST /api/v1/telemetry/client-errors` (sin PII, muestreo 100 % en piloto).
5. Alertas: 5xx > 2 % por 5 min; p95 > 300 ms por 15 min; `outbox_pending` > 500 o dead letter > 0; tasa de rechazos de sync > 5 %; certificado TLS < 14 días.
6. SLO: 99,5 % de disponibilidad mensual del back-office y 99 % de `sync/push` exitosos; presupuesto de error visible en el tablero.

**Aceptación:** tablero con los 6 paneles; alerta disparada en una prueba de caos (apagar DB en staging) en < 5 min; auditoría de logs sin PII.

**Historias:** HU-PLAT-07 "Monitoreo y alertas" (RNF-OBS-001/002, RNF-REL-001).

---

### I4 · Backups y recuperación — R3 · S8–S9 (continuo)

**Objetivo:** RPO 24 h y RTO 4 h, probados.

**Steps**
1. Dev/local: `make backup` / `make restore f=…` (`infra/scripts/backup-db.sh`, `restore-db.sh`, formato custom de `pg_dump`).
2. Producción: backups automáticos diarios del motor elegido en I2 + PITR si está disponible; retención 30 días (RNF-REL-002).
3. Objetos: versionado del bucket + regla de ciclo de vida (borrar versiones antiguas a 30 días).
4. Runbook `docs/runbooks/restauracion.md`: pasos, responsables, verificación (conteos por tabla, `GET /health/ready`, prueba de login).
5. Simulacro mensual en staging restaurando el backup de producción **anonimizado** (script de anonimización de PII).

**Aceptación:** simulacro documentado con tiempo total < 4 h y pérdida < 24 h.

**Historias:** HU-PLAT-08 "Backups y restauración probada" (RNF-REL-002).

---

### I5 · Rendimiento — R1 → R6 (puertas en cada release)

**Objetivo:** cumplir RNF-PERF-001…005 de forma continua.

**Steps**
1. **Bundle:** paso de CI que suma JS+CSS gzip de `.next/static` (< 2,0 MB) — ya en `ci.yml`. En R1 añadir presupuesto por ruta (`/app` < 350 KB JS) con `@next/bundle-analyzer` o `size-limit`.
2. **Lighthouse CI** (`infra/perf/lighthouserc.json`): rutas `/`, `/app`, `/app/autoevaluacion`; perfil móvil con throttling 3G (RTT 300 ms, 700 kbps), CPU ×4; aserciones FCP < 1800 ms, TBT < 300 ms, accesibilidad ≥ 0,95.
3. **k6** (`infra/perf/k6/`): escenarios `sync_push_100` (100 registros < 2 s), `diagnostico`, `dashboard_backoffice` con datos sintéticos de 450 proveedores × 2 años; umbral p95 < 300 ms; corre nocturno contra staging.
4. **Reportes:** prueba de RNF-PERF-005 (export consolidado < 30 s).
5. **Red rural:** perfiles de throttling 2G/3G en Playwright para los e2e offline (coordinado con PLAN_FRONTEND).

**Aceptación:** los tres presupuestos son puertas obligatorias desde R2; un PR que los rompe no se fusiona.

**Historias:** HU-PLAT-09 "Presupuestos de rendimiento en CI" (RNF-PERF-001/002), HU-PLAT-10 "Pruebas de carga" (RNF-PERF-004/005).

---

### I6 · Despliegue continuo — R3 → R6

**Objetivo:** cada merge a `develop` llega a staging; producción por tag, sin downtime.

**Steps**
1. Workflow `cd.yml`: en push a `develop` → build y push a Artifact Registry con tag `sha-<commit>` → Cloud Run Job `migrate` → despliegue de backend, worker y frontend en staging → `infra/scripts/smoke.sh` contra staging.
2. Producción: tag `vX.Y.Z` en `main` → aprobación manual (environment protegido) → promoción del **mismo digest** → migración → despliegue con tráfico gradual (10 % → 100 %) y rollback automático si el smoke falla.
3. **Migraciones expand/contract:** (1) expandir (columnas nuevas nulas, tablas nuevas), (2) desplegar código que escribe en ambas, (3) backfill, (4) contraer en un release posterior. Prohibido `DROP`/`RENAME` en el mismo release que el cambio de código. Revisión obligatoria de migraciones con `alembic upgrade --sql`.
4. **Compatibilidad de sync:** el backend acepta `schema_version` actual y anterior de WatermelonDB durante 2 releases (dispositivos rurales tardan en actualizar). El Service Worker se actualiza con `skipWaiting` solo cuando la cola de sync está vacía.
5. Changelog automático y notas de versión.

**Aceptación:** despliegue a staging < 15 min desde merge; rollback probado; una migración expand/contract real ejecutada sin downtime.

**Historias:** HU-PLAT-11 "Despliegue continuo a staging" · HU-PLAT-12 "Liberación a producción con rollback".

---

### I7 · Piloto de campo — R6 · S15–S16 (y meses 3–6 de DOC-FRUVER §6)

**Objetivo:** operar el piloto Fruver con productores reales en zonas de baja conectividad.

**Steps**
1. **Tablero de sync** (back-office, solo ADMIN): por dispositivo y proveedor — último pull, último push, pendientes por prioridad (P1/P2/P3) informados por el cliente, rechazos por código; alerta si un proveedor activo no sincroniza en 7 días.
2. **Panel de errores de sync:** lista de `rejected` con código, tabla y versión de app; acción "marcar resuelto"; exportable para soporte.
3. **Kit de campo** para pasantes RAVC: checklist de instalación de la PWA (agregar a inicio, `storage.persist`), prueba de modo avión, verificación de sincronización al volver a señal.
4. **Ventanas de despliegue:** no desplegar cambios de esquema de sync durante jornadas de campo; congelamiento 48 h antes de cada visita veredal.
5. **Soporte:** runbook de incidentes de sync (dispositivo con cola atascada, datos corruptos locales, reinstalación sin perder datos: exportar cola local a archivo y reimportar).
6. Métricas del piloto para el informe: % de registros sincronizados en < 24 h, tiempo medio offline por dispositivo, rechazos por cada 1.000 registros.

**Aceptación:** durante 2 semanas de piloto, ≥ 99 % de registros confirmados llegan al servidor en < 72 h; 0 pérdidas de datos (RNF-OFF-003).

**Historias:** HU-PLAT-13 "Tablero de sincronización" (RNF-OFF-003, RNF-OBS-002) · HU-PLAT-14 "Soporte de campo".

## 4. Cronograma resumido

| Sprint | Release | Fases de infra |
|---|---|---|
| S0 | R0 | I0 |
| S1–S3 | R1 | I1, I5 (bundle + Lighthouse) |
| S4–S6 | R2 | I2 (staging), I5 (k6) |
| S7–S9 | R3 | I2 (producción), I3, I4, I6 |
| S10–S14 | R4–R5 | I6 continuo, I5 (reportes), endurecimiento de I1 |
| S15–S16 | R6 | I7, simulacro DR, revisión de SLO |

## 5. Cómo verificar

```bash
# Configuración
make env
make config                                  # compose base y dev válidos

# Levantar y probar
make up                                      # imágenes de producción
make ps
make smoke                                   # 5 comprobaciones de salud
make up-dev && make logs s=backend           # desarrollo con hot reload

# Imágenes
docker image inspect smile/backend:local  --format '{{.Size}} {{.Config.User}}'
docker image inspect smile/frontend:local --format '{{.Size}} {{.Config.User}}'

# Datos
make migrate
make backup && ls infra/backups/
make restore f=infra/backups/<archivo>.dump

# Calidad (local)
make lint
make test

# Directo, sin Makefile
docker compose -f infra/docker-compose.yml --env-file infra/.env.example config --quiet
docker compose -f infra/docker-compose.yml -f infra/docker-compose.dev.yml \
  --env-file infra/.env.example --profile dev config --quiet
```

## 6. Riesgos transversales

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Cambios de comportamiento S3 de SeaweedFS frente a GCS/S3 reales | Diferencias sutiles (firmas, CORS) | Suite de contrato de `FileStorage` contra SeaweedFS en CI y contra GCS en staging (ADR-0008) |
| TimescaleDB no disponible en Cloud SQL | Bloquea producción en GCP con DB gestionada | ADR-0009; SQL compatible con particionado nativo |
| Dispositivos con versiones viejas de la PWA | Rechazos masivos de sync tras un despliegue | Compatibilidad de 2 versiones de esquema; actualización del SW solo con cola vacía |
| Costos de Cloud Run con min-instances | Presupuesto académico | min 1 solo en frontend y backend de producción; staging escala a 0 |
| PII en logs o en staging | Incumplimiento Ley 1581 | Filtro de PII probado; staging solo con datos sintéticos o anonimizados |
