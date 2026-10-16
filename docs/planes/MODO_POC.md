# Modo POC — directivas de ejecución

**Vigente desde 15/10/2026. Prevalece sobre los planes en alcance, profundidad y proceso.** Los specs siguen siendo la fuente de verdad de las **reglas de negocio**; este documento recorta **cuánto** se construye.

El objetivo es una **prueba de concepto demostrable**: que alguien abra el sistema, ingrese con usuarios ya creados y recorra los flujos principales con datos realistas. No es un producto para producción.

## 1. Alcance

| Se construye (POC) | Se pospone (no hacer salvo pedido explícito) |
|---|---|
| R1 completo en versión simple: registro/ingreso, consentimiento, ficha, autoevaluación offline, diagnóstico, plan de 3 metas, ficha imprimible | Despliegue a GCP, staging, TLS, CDN (PLAN_INFRA I2, I6) |
| R2 núcleo: venta, costo, merma, inventario, margen, lote con carencia y rótulo | k6, Lighthouse CI estricto, pruebas de caos completas, matriz de compatibilidad (R6) |
| Sync pull/push idempotente con P1 antes que P2 | Trivy, SBOM, Renovate, backups/DR (PLAN_INFRA I1, I4) |
| R3 mínimo: lista de proveedores, expediente, recepción simple, score 50/30/20, funnel, 1 dashboard | ARCO, SROI, reportes CCB, Web Push, cifrado en reposo (R5) |
| R4 mínimo: 1 clip offline, Flores/Caritas automáticas | Categorías distintas de Fruver, OpenTelemetry, ASVS |
| **Datos de demostración (§3)** | Objetivos de tamaño de imagen (se miden, no bloquean) |

Las historias pospuestas no se borran del backlog: se marcan `POC: pospuesta` si alguien las toca.

## 2. Ahorro de tokens (obligatorio para todas las sesiones)

1. **No leer documentos completos.** `historias-de-usuario.md` tiene ~2.000 líneas y `requerimientos.md` ~400. Buscar solo lo necesario: `grep -n "### HU-ERP-01" -A 25 docs/sistema/historias-de-usuario.md`, `grep -n "RF-ERP-001" docs/sistema/requerimientos.md`.
2. **Leer el plan solo en la fase activa** (`grep -n "### B1" -A 80 docs/planes/PLAN_BACKEND.md`).
3. **Sin subagentes ni forks** salvo trabajo realmente independiente y grande.
4. **Pruebas dirigidas:** correr solo los tests del módulo tocado; la suite completa y `docker compose build` solo antes de hacer push.
5. **No reescribir documentos**: editar solo las líneas que cambian. No generar reportes largos ni resúmenes en archivos.
6. **Tests justos para un POC:** reglas de dominio + fixtures de `contracts/` + 1 prueba de API por endpoint (incluida la de propiedad del recurso) + 1 e2e offline del flujo feliz por release. Sin metas de cobertura.
7. **Un commit por historia** (o por grupo de historias pequeñas del mismo módulo), Conventional Commits, mensaje corto con `Refs: HU-…`.
8. **Push a `develop` al cerrar cada historia** para que el coordinador revise.

## 3. Datos de demostración (prioridad 1 del backend e infraestructura)

### 3.1 Mecanismo
- Paquete `backend/src/smile/seed/` con `python -m smile.seed`: **idempotente** (IDs UUID fijos derivados de `uuid5(NAMESPACE, clave)` y *upsert*), determinista (`random.Random(42)`).
- Cada módulo aporta su función `seed_demo(session)` en su `infrastructure/seed.py`; el runner las llama en orden de dependencias. Un módulo nuevo agrega sus datos en el mismo commit en que se implementa.
- Servicio `seed` en `infra/docker-compose.yml`: misma imagen que el backend, `command: ["python", "-m", "smile.seed"]`, `depends_on: migrate (completed)`, `restart: "no"`; `backend` depende de `seed` completado. Controlado por `SEED_DEMO=true` (por defecto en `.env.example`).
- Los datos viven en el volumen `db-data` (persisten entre `make down`/`make up`). `make reset-demo` = `docker compose down -v` + `make up` para volver al estado inicial.
- Archivos de demo (rótulos, un clip, una ficha PDF) se suben a S3 desde `backend/src/smile/seed/assets/` (< 5 MB en total).

### 3.2 Usuarios precreados
Contraseña de todos: **`Smile2026!`** (solo demo, documentada en el README).

| Usuario | Rol | Estado de demo |
|---|---|---|
| `admin@smile.test` | ADMIN | Acceso total al back-office |
| `reviewer@smile.test` | REVIEWER | Compras/Calidad |
| `proveedor@smile.test` · celular `3001234567` | PROVEEDOR | **Recorrido completo**: Finca La Esperanza (Fusagasugá, Cundinamarca), Fruver, Micro; consentimiento aceptado; autoevaluación de C2-2026 y C3-2026; plan con 1 meta completa; 8 semanas de ventas/costos/mermas; 1 lote bloqueado por carencia y 1 liberado con rótulo; 2 Caritas y 1 Flor |
| `nuevo@smile.test` | PROVEEDOR | Recién registrado, sin consentimiento: para demostrar el onboarding desde cero |
| `proveedor01…30@smile.test` | PROVEEDOR | Generados: municipios de Cundinamarca y Boyacá, 5 marcados ESTRATÉGICO, distribuidos en las etapas E1–E6, mermas de recepción entre 3 % y 20 %, scores variados para que el funnel, el Pareto y la matriz de riesgo se vean con datos |

### 3.3 Catálogo de demo
Categorías (solo Fruver activa), 5 ejes Fruver, ≥ 25 preguntas Fruver (base `maqueta/js/data.js` + DOC-FRUVER + DOC-AUTOEVAL), guías de los 5 ejes, 10 productos Fruver con unidades, 5 agroquímicos con períodos de carencia de ficha técnica (marcados `source=demo`), parámetros S-01…S-17 versión 1.

## 4. Protocolo de revisión del coordinador
El coordinador (sesión `guia-visual-diseno-docs`) revisa cada push a `develop` y responde por mensaje a la sesión autora con: ✅ aprobado / ⚠️ ajustar (lista corta). Revisa: alcance POC, reglas de arquitectura (hexagonal, `public.py`, tokens de diseño, local-first), contratos, que exista el *seed* de lo nuevo, y señales de gasto innecesario de tokens (diffs enormes, documentos reescritos, código generado sin uso).
