# Demo del POC — cómo verla y qué es real

**Estado al 16/10/2026** (incluye el rediseño visual con Framer Motion, PR #23). Prueba de concepto navegable de la Academia de Proveedores Smile. Alcance y reglas: [`planes/MODO_POC.md`](planes/MODO_POC.md).

## 1. Levantar

Requisitos: Docker con Compose v2, `docker-buildx` y `make`.

```bash
git switch develop && git pull
make env          # crea infra/.env (solo la primera vez)
make reset-demo   # construye y levanta todo con los datos de demo desde cero
make smoke        # verifica que todo responde
```

| Qué | URL |
|---|---|
| **Índice de la demo** (enlaces a todas las pantallas) | http://localhost:3000/ |
| PWA del proveedor | http://localhost:3000/app |
| Back-office Smile | http://localhost:3000/smile |
| API (Swagger) | http://localhost:8000/docs |

`make up` vuelve a levantar sin borrar datos · `make down` apaga · `make logs s=frontend` ve logs.

**Modo demo abierto:** con `NEXT_PUBLIC_DEMO_OPEN=true` (valor por defecto) el frontend no pide ingreso ni consentimiento y usa un proveedor demo fijo (María Fernanda Rojas, Finca La Esperanza, Fusagasugá). Los guardias de sesión y consentimiento existen y se reactivan con `NEXT_PUBLIC_DEMO_OPEN=false`.

## 2. Recorrido sugerido (10 minutos)

Ábralo en escritorio: la PWA se muestra dentro de un marco de teléfono con el recorrido al lado.

1. `/` → índice editorial con enlaces a todo.
2. **Proveedor**: `/app` (inicio) → `/app/tablero` (ventas, costos, margen, inventario, cercanía a BPA, beneficio económico) → `/app/autoevaluacion?nueva=1` (**formulario abierto en modo práctica**: pruebe "No" en "¿Usa agroquímicos?" y vea cómo se omiten preguntas; al enviar, pantalla "Analizando") → `/app/diagnostico` (puntaje, nivel, alertas y **su siguiente paso**) → `/app/plan` (3 metas con guía y checklist) → `/app/lotes` (carencia y rótulo) → `/app/beneficios`.
3. Active el **modo avión** (DevTools → Network → Offline): la PWA sigue funcionando.
4. **Smile**: `/smile` (resumen ejecutivo: use los filtros de arriba; clic en un punto de la matriz abre el expediente; clic en una etapa del funnel filtra la lista) → `/smile/riesgo` → `/smile/calidad` → `/smile/impacto` → `/smile/esg` → `/smile/proveedores` y un expediente → `/smile/reportes` (descarga CSV con los filtros aplicados). Toda gráfica tiene tooltip y botón "Ver tabla".

## 3. Qué es real y qué está simulado

| Área | Estado | Detalle |
|---|---|---|
| Infraestructura (Docker, CI, seed) | **Real** | 8 servicios; `seed` carga usuarios y proveedores en PostgreSQL |
| API: login, roles, catálogo, ficha del proveedor | **Real** | Probado de punta a punta con los usuarios demo |
| PWA: base local, consentimiento, ficha, autoevaluación, diagnóstico | **Real, offline** | Datos en IndexedDB (WatermelonDB); reglas validadas contra `contracts/fixtures/` |
| PWA: plan de mejora, guías, checklist, ficha resumen | **Real, offline** | Mismo motor de reglas |
| PWA: inicio, **tablero**, Mini ERP, lotes y rótulos, score, aprender, beneficios, mensajes, recepciones | **Simulado** | Datos fijos en `frontend/src/mocks/app.ts` |
| Back-office `/smile` completo (resumen, riesgo, calidad, impacto, funnel, ESG, proveedores, expediente, recepciones, reportes, banco) | **Simulado** | Datos en `frontend/src/mocks/smile.ts`, coherentes con el seed |
| Sincronización PWA ↔ servidor | **No conectada** | Los datos de la PWA se quedan en el dispositivo. El endpoint está en el PR #19 (congelado) |

## 4. Usuarios de la API

Contraseña de todos: **`Smile2026!`** (solo demo). Útiles para probar la API en `/docs` (`POST /api/v1/auth/login`) o con el modo demo apagado.

| Usuario | Rol |
|---|---|
| `admin@smile.test` | ADMIN |
| `reviewer@smile.test` | REVIEWER |
| `proveedor@smile.test` · `3001234567` | PROVEEDOR (Finca La Esperanza) |
| `nuevo@smile.test` | PROVEEDOR sin ficha |
| `proveedor01…30@smile.test` | PROVEEDOR (Cundinamarca y Boyacá) |

## 5. Pendiente para pasar de demo a sistema

| Prioridad | Qué | Dónde |
|---|---|---|
| 1 | Sincronización real (backend listo en PR #19; falta regenerar el cliente TS y el motor del frontend HU-SYN-03/04) | PR #19, PLAN_FRONTEND F1 |
| 2 | Consentimiento y autoevaluación en el servidor (HU-PRV-01 BE, HU-ASM-01/02) | PLAN_BACKEND B1 |
| 3 | Reemplazar los mocks de `/app` por Mini ERP y trazabilidad reales (R2) | PLAN_FRONTEND F2, PLAN_BACKEND B2 |
| 4 | Reemplazar los mocks de `/smile` por la API del CRM (R3) | PLAN_FRONTEND F3, PLAN_BACKEND B3 |
| — | Validar con Smile/Ing. Industrial las preguntas extra, los textos de "siguiente paso" y el texto de autorización de datos | `contracts/fixtures/question-bank.json`, `consent-text.json` |
| — | Cifrado local de la sesión (ADR-0006), pospuesto en el POC | MODO_POC §1 |
| — | Preguntas abiertas Q-01…Q-09 | `sistema/conflictos-y-supuestos.md` |
