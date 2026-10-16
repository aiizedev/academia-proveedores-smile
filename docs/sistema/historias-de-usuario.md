# Historias de usuario — Backlog del producto

**Sistema:** Academia de Proveedores Grupo Smile — Plataforma CRM & Mini ERP Sostenible
**Versión:** 1.0 · 15 de octubre de 2026
**Fuentes:** [`requerimientos.md`](requerimientos.md) (RF/RNF, releases §5, casos de uso §6), [`arquitectura.md`](arquitectura.md), [`conflictos-y-supuestos.md`](conflictos-y-supuestos.md), [`GUIA_VISUAL.md`](../diseno/GUIA_VISUAL.md) v1.1, specs en [`docs/specs/`](../specs/README.md).

---

## 1. Formato

Cada historia sigue esta plantilla:

```
### HU-<MOD>-NN · Título
**Como** <rol> **quiero** <capacidad> **para** <beneficio>
- Release · Sprint · Puntos · Capa (FE | BE | FE+BE | INFRA)
- Trazabilidad: RF/RNF · CU · spec
- Criterios de aceptación (Gherkin en español)
- Notas técnicas
```

- **ID:** `HU-<MOD>-NN`. `MOD` es el código de módulo de requerimientos §1.4, `PLAT` (plataforma) o `DS` (design system). Los IDs no se reutilizan.
- **Roles:** `PROVEEDOR`, `REVIEWER`, `ADMIN` o *equipo de desarrollo* (historias técnicas habilitadoras).
- **Capa:** FE = `frontend/`, BE = `backend/`, INFRA = `infra/`, CI y despliegue.
- **Rutas:** `/app/*` PWA del proveedor (local-first, offline); `/smile/*` back-office (online). Ver arquitectura §4.1.
- **Sync:** P1 = ERP y trazabilidad; P2 = autoevaluación, firmas, ficha, plan; P3 = evidencias y medios (arquitectura §5).

### 1.1 Estimación
Escala Fibonacci de puntos de historia: **1, 2, 3, 5, 8**. Una historia de **13** o más se parte antes de entrar a un sprint. Capacidad objetivo: **25–35 puntos por sprint de 2 semanas**.

### 1.2 Definición de Ready (DoR)
Una historia entra a sprint solo si:
1. Tiene rol, capacidad y beneficio claros y está trazada a ≥ 1 RF/RNF y, si aplica, a un CU.
2. Sus criterios de aceptación tienen valores concretos y son automatizables.
3. Sus dependencias (historias, preguntas `Q-xx`, parámetros `S-xx`) están resueltas o tienen valor por defecto documentado.
4. Si tiene UI, el componente o patrón existe en la GUIA_VISUAL o se especifica en la historia.
5. Está estimada en ≤ 8 puntos.

### 1.3 Definición de Done (DoD)
Una historia está terminada solo si:
1. Todos los escenarios Gherkin están implementados como **tests automatizados** que pasan en CI (unitarios, integración, API o e2e según la capa).
2. Se cumple la cobertura de **RNF-MNT-003** (backend dominio+aplicación ≥ 85 %, total ≥ 75 %; frontend lógica ≥ 80 %) y los contratos import-linter (RNF-MNT-001/002) pasan.
3. **axe** no reporta violaciones *serious* ni *critical* en las pantallas tocadas (RNF-ACC-001); objetivos táctiles ≥ 48 px (RNF-USA-001).
4. Todo texto visible fue revisado contra el tono de voz de **SPEC-SOT D2 §3** (RNF-USA-004): sin condescendencia, sin jerga, cifras exactas.
5. Si la historia toca rutas `/app/*`, funciona **sin conexión** (e2e con red desactivada) y sus datos sincronizan en la prioridad correcta.
6. El contrato OpenAPI y el cliente TS están regenerados si cambió la API (RNF-MNT-004); las reglas compartidas pasan `contracts/fixtures`.
7. Documentación actualizada (requerimientos, arquitectura, conflictos o guía visual, según aplique) y PR revisado por otra persona.

---

## 2. Épicas

| Épica | Alcance | Historias |
|---|---|---|
| EP-PLAT | Repositorio, Docker, CI, contratos, observabilidad, seguridad, rendimiento, despliegue | HU-PLAT-01…17 |
| EP-DS | Design system en el frontend según GUIA_VISUAL v1.1 | HU-DS-01…05 |
| EP-IAM | Identidad, acceso y roles | HU-IAM-01…07 |
| EP-PRV | Privacidad y consentimiento | HU-PRV-01…06 |
| EP-SUP | Proveedores y expediente digital | HU-SUP-01…08 |
| EP-CAT | Catálogos y parámetros | HU-CAT-01…05 |
| EP-ASM | Autoevaluación ESG | HU-ASM-01…08 |
| EP-IMP | Plan de mejora y guías | HU-IMP-01…07 |
| EP-ERP | Mini ERP | HU-ERP-01…10 |
| EP-TRZ | Trazabilidad, carencia y rotulación ICA | HU-TRZ-01…06 |
| EP-REC | Recepciones y desempeño operativo | HU-REC-01…04 |
| EP-SCO | Scoring y funnel | HU-SCO-01…05 |
| EP-GAM | Reconocimientos e incentivos | HU-GAM-01…05 |
| EP-LRN | Micro-learning | HU-LRN-01…04 |
| EP-CAL | Calculadoras de impacto | HU-CAL-01…05 |
| EP-RPT | Dashboards y reportes | HU-RPT-01…07 |
| EP-NOT | Notificaciones y canal directo | HU-NOT-01…04 |
| EP-SYN | Sincronización offline | HU-SYN-01…05 |

---

## 3. R0 · Fundaciones (S0)

### HU-PLAT-01 · Levantar todo el sistema con un comando
**Como** equipo de desarrollo **quiero** levantar frontend, backend, worker, base de datos y almacenamiento con `make up` **para** que cualquier integrante trabaje sin instalar dependencias locales.
- R0 · S0 · 5 pts · INFRA
- Trazabilidad: RNF-POR-001, RNF-POR-002 · ADR-0003, ADR-0004 · arquitectura §7
```gherkin
Escenario: arranque en máquina limpia
  Dado un clon limpio del repositorio con Docker 24+ y el archivo infra/.env copiado de infra/.env.example
  Cuando ejecuto "make up"
  Entonces los servicios db, storage, backend, worker y frontend quedan en estado "healthy" o "running" en menos de 5 minutos
  Y los servicios migrate y storage-init terminan con código 0
  Y http://localhost:3000 responde 200 y http://localhost:8000/health/ready responde 200

Escenario: imágenes de producción livianas y sin root
  Cuando construyo los targets "runtime" del backend y "runner" del frontend
  Entonces la imagen del backend pesa menos de 250 MB y la del frontend menos de 200 MB
  Y "docker run --rm <imagen> id -u" no devuelve 0

Escenario: modo desarrollo con recarga
  Dado que ejecuto "make dev"
  Cuando modifico un archivo de backend/src o frontend/src
  Entonces el servicio correspondiente se recarga sin reconstruir la imagen
```
- Notas: `infra/docker-compose.yml` + `docker-compose.dev.yml`; servicios y variables de arquitectura §7.1–7.2.

### HU-PLAT-02 · Esqueleto del backend hexagonal y modular
**Como** equipo de desarrollo **quiero** el paquete `smile` con el kernel compartido y los 16 módulos con su estructura `domain/application/infrastructure/api` y fachada `public.py` **para** que cada historia de negocio se implemente respetando los límites desde el primer día.
- R0 · S0 · 5 pts · BE
- Trazabilidad: RNF-MNT-001, RNF-MNT-002 · ADR-0001, ADR-0002 · arquitectura §3
```gherkin
Escenario: límites de capas verificados
  Dado el contrato import-linter del proyecto
  Cuando un archivo de smile/modules/erp/domain importa "sqlalchemy" o "fastapi"
  Entonces "make lint" falla indicando el contrato "layers" violado

Escenario: independencia entre módulos
  Cuando un archivo de smile/modules/scoring importa smile.modules.erp.domain
  Entonces "make lint" falla con el contrato "independence"
  Y importar smile.modules.erp.public está permitido

Escenario: módulos registrados
  Cuando arranca create_app()
  Entonces cada uno de los 16 módulos de requerimientos §1.4 registra su router bajo /api/v1/<modulo>
```

### HU-PLAT-03 · Esqueleto del frontend PWA
**Como** equipo de desarrollo **quiero** la app Next.js con los grupos de rutas `(marketing)`, `(auth)`, `(proveedor)` y `(backoffice)`, manifest y service worker **para** construir sobre una base instalable y offline.
- R0 · S0 · 5 pts · FE
- Trazabilidad: RF-SYN-001, RNF-OFF-001, RNF-COMP-001 · arquitectura §4 · SPEC-BASE §2.1
```gherkin
Escenario: PWA instalable
  Cuando abro /app en Chrome Android
  Entonces Lighthouse marca la app como instalable
  Y manifest.webmanifest declara theme_color "#3D4A3E" y background_color "#F9F6F0"

Escenario: shell disponible sin conexión
  Dado que visité /app una vez con conexión
  Cuando desactivo la red y recargo /app
  Entonces el shell de la PWA se muestra desde el caché del service worker

Escenario: separación de rutas
  Entonces las rutas /smile/* no se precachean y no importan WatermelonDB
```

### HU-PLAT-04 · Integración continua
**Como** equipo de desarrollo **quiero** un pipeline que ejecute lint, tipos, tests, cobertura y build de imágenes en cada PR **para** detectar errores antes de integrar a `develop`.
- R0 · S0 · 5 pts · INFRA
- Trazabilidad: RNF-MNT-001, RNF-MNT-002, RNF-MNT-003 · ADR-0003
```gherkin
Escenario: PR con cambios solo en frontend
  Dado un PR que modifica frontend/src
  Cuando corre el pipeline
  Entonces se ejecutan los jobs de frontend y no los de backend

Escenario: cobertura insuficiente
  Dado que la cobertura de backend dominio+aplicación baja de 85 %
  Entonces el job "backend-test" falla y el PR no se puede fusionar

Escenario: fixtures compartidos
  Cuando cambia contracts/fixtures/assessment-scoring.json
  Entonces se ejecutan los tests de reglas de backend y de frontend
```

### HU-PLAT-05 · Contrato OpenAPI y cliente TypeScript generado
**Como** equipo de desarrollo **quiero** exportar el OpenAPI de FastAPI a `contracts/openapi.json` y generar el cliente TS **para** que frontend y backend no diverjan.
- R0 · S0 · 3 pts · FE+BE
- Trazabilidad: RNF-MNT-004 · SPEC-BASE §2.2
```gherkin
Escenario: contrato desactualizado
  Dado que un endpoint cambia su schema de respuesta
  Y no se ejecutó "make contracts"
  Cuando corre el CI
  Entonces el job "contracts" falla mostrando el diff de contracts/openapi.json

Escenario: cliente tipado
  Cuando el frontend llama a un endpoint con un campo inexistente
  Entonces "npm run typecheck" falla
```

### HU-PLAT-06 · Observabilidad básica
**Como** equipo de desarrollo **quiero** logs JSON con `request_id`, healthchecks y métricas **para** diagnosticar fallas sin exponer datos personales.
- R0 · S0 · 3 pts · BE
- Trazabilidad: RNF-OBS-001, RNF-OBS-002 · arquitectura §7.3 · SPEC-SOT D2 §4.3
```gherkin
Escenario: readiness
  Dado que la base de datos está caída
  Cuando consulto GET /health/ready
  Entonces responde 503 con {"db": "down"}
  Y GET /health/live responde 200

Escenario: logs sin datos personales
  Cuando un proveedor inicia sesión con celular 3001234567
  Entonces el log de la petición contiene request_id, ruta, estado y duración
  Y no contiene el celular, el correo ni la contraseña

Escenario: métricas
  Cuando consulto GET /metrics
  Entonces obtengo métricas Prometheus de latencia por ruta
```

### HU-DS-01 · Tokens de diseño sincronizados
**Como** equipo de desarrollo **quiero** que `frontend/src/design/tokens.css` sea copia exacta de `docs/diseno/tokens.css` y que Tailwind exponga los tokens con `@theme` **para** que la guía visual sea la fuente única de color, tipografía, radios y movimiento.
- R0 · S0 · 3 pts · FE
- Trazabilidad: RNF-USA-005, RNF-MNT-005 · GUIA_VISUAL §1, §3 · arquitectura §4.3
```gherkin
Escenario: copia divergente
  Dado que alguien edita frontend/src/design/tokens.css a mano
  Cuando corre "npm run design:check"
  Entonces falla indicando que difiere de docs/diseno/tokens.css

Escenario: sin colores literales
  Cuando el lint de estilos encuentra un hex como "#3d4a3e" en un componente
  Entonces falla y sugiere el token "--brand-olive" / clase "bg-olive-800"
```

### HU-DS-02 · Tipografía autoalojada
**Como** PROVEEDOR **quiero** que los textos se vean con la tipografía de la marca aun sin internet **para** leer con claridad en el campo.
- R0 · S0 · 2 pts · FE
- Trazabilidad: RNF-OFF-001, RNF-USA-005 · GUIA_VISUAL §4 · SPEC-SOT D2 §2.3
```gherkin
Escenario: fuentes offline
  Dado que la PWA está instalada
  Cuando abro /app sin conexión
  Entonces los títulos usan Fraunces y el cuerpo Manrope (400–800) desde archivos locales
  Y no hay peticiones a fonts.googleapis.com
```

### HU-DS-04 · Movimiento base y movimiento reducido
**Como** PROVEEDOR **quiero** confirmaciones animadas suaves al guardar **para** saber que mi registro quedó guardado, y **quiero** poder evitarlas si mi teléfono pide reducir el movimiento.
- R0 · S0 · 3 pts · FE
- Trazabilidad: RNF-USA-006, RNF-ACC-002 · GUIA_VISUAL §9, §10 · SPEC-BASE §7.2
```gherkin
Escenario: presets compartidos
  Cuando un componente anima una entrada
  Entonces usa los presets de src/design/motion.ts portados de docs/diseno/motion.js (ease "expo.out", 1.1 s por defecto)

Escenario: movimiento reducido
  Dado que el sistema operativo tiene "reducir movimiento" activo
  Cuando guardo un registro
  Entonces el toast aparece sin animación de desplazamiento y sin confeti
  Y html tiene la clase "no-anim"
```

---

## 4. R1 · Piloto Fruver: diagnóstico (S1–S3)

### HU-DS-03 · Primitivos de interfaz
**Como** equipo de desarrollo **quiero** los componentes Button (primario, rosa, ghost, claro), IconButton, Field, Chip, LevelBadge, Toast y StatusPill de la GUIA_VISUAL §8 **para** construir pantallas consistentes y accesibles.
- R1 · S1 · 5 pts · FE
- Trazabilidad: RNF-USA-001, RNF-USA-002, RNF-ACC-001 · GUIA_VISUAL §8.1, §8.2, §8.10, §8.11, §11
```gherkin
Escenario: objetivo táctil
  Cuando renderizo IconButton
  Entonces su área táctil mide al menos 48 × 48 px (GUIA_VISUAL §11 corrige 46 px → 48 px)

Escenario: foco visible
  Cuando navego con teclado a un Button sobre fondo crema
  Entonces veo un contorno de 2 px en --focus (oliva-800) con offset de 3 px

Escenario: deshabilitado
  Cuando el Button está deshabilitado
  Entonces tiene opacidad 0.45, aria-disabled="true" y no responde a toques
```

### HU-IAM-01 · Registrarme libremente como proveedor
**Como** PROVEEDOR **quiero** crear mi cuenta con mi celular o correo **para** empezar mi diagnóstico sin depender de Smile.
- R1 · S1 · 5 pts · FE+BE
- Trazabilidad: RF-IAM-001, RF-IAM-004 · CU-01 · SPEC-SOT §1
```gherkin
Escenario: registro con celular
  Dado que estoy en /registro con conexión
  Cuando ingreso nombre "Rosa Pérez", celular "3001234567" y contraseña "campo2026"
  Entonces se crea un usuario con rol PROVEEDOR
  Y soy redirigido a /app/consentimiento

Escenario: intento de escalar rol
  Cuando envío POST /api/v1/iam/register con {"role": "ADMIN", ...}
  Entonces el usuario se crea con rol PROVEEDOR y el campo role se ignora

Escenario: datos inválidos
  Cuando ingreso celular "2001234567" y ningún correo
  Entonces veo "Escriba un celular de 10 dígitos que empiece por 3 o un correo"
  Y no se crea la cuenta

Escenario: identificador repetido
  Dado que "3001234567" ya está registrado
  Cuando intento registrarme con ese celular
  Entonces veo "Este celular ya tiene una cuenta. Ingrese o recupere su contraseña"
```
- Notas: módulo `iam`; contraseña Argon2id (RNF-SEC-002); evento `UserRegistered`.

### HU-IAM-02 · Iniciar sesión
**Como** PROVEEDOR, REVIEWER o ADMIN **quiero** ingresar con mi celular o correo y contraseña **para** acceder a mis funciones.
- R1 · S1 · 5 pts · FE+BE
- Trazabilidad: RF-IAM-002, RF-IAM-006, RNF-SEC-002, RNF-SEC-003, RNF-SEC-005 · CU-02
```gherkin
Escenario: ingreso correcto
  Cuando ingreso "3001234567" y "campo2026"
  Entonces recibo un access token de 15 min y un refresh token de 30 días
  Y un PROVEEDOR va a /app y un REVIEWER va a /smile

Escenario: bloqueo por intentos
  Dado 5 intentos fallidos consecutivos para la cuenta
  Cuando intento ingresar por sexta vez con la contraseña correcta
  Entonces veo "Por seguridad, su cuenta está en pausa 15 minutos"
  Y la API responde 423

Escenario: refresh reutilizado
  Dado que un refresh token ya fue rotado
  Cuando alguien intenta usarlo de nuevo
  Entonces la API responde 401 y revoca toda la familia de tokens de esa sesión

Escenario: límite por IP
  Cuando una IP hace 11 intentos de login en un minuto
  Entonces el undécimo recibe 429
```

### HU-IAM-03 · Autorización por rol y propiedad del recurso
**Como** equipo de desarrollo **quiero** una dependencia `require(permission)` y verificaciones de propiedad en la capa de aplicación **para** que cada rol acceda solo a lo que le permite la matriz §2.3.
- R1 · S1 · 3 pts · BE
- Trazabilidad: RF-IAM-004, RNF-SEC-004 · CU-02 · requerimientos §2.3
```gherkin
Escenario: IDOR
  Dado los proveedores A y B
  Cuando A pide GET /api/v1/suppliers/{id_de_B}/profile
  Entonces la API responde 404 (no revela existencia)

Escenario: rol insuficiente
  Cuando un PROVEEDOR llama a POST /api/v1/receptions
  Entonces la API responde 403

Escenario: suite automática
  Entonces existe un test de API por cada endpoint que verifica acceso de los 3 roles y de un proveedor ajeno
```

### HU-PRV-01 · Autorizar el tratamiento de mis datos
**Como** PROVEEDOR **quiero** leer y aceptar la autorización de datos antes de registrar información **para** saber qué hace Smile con mis datos y cuáles son mis derechos.
- R1 · S1 · 5 pts · FE+BE
- Trazabilidad: RF-PRV-001, RF-PRV-003, RNF-LEG-001 · CU-03 · SPEC-BASE §8.2, SPEC-DASH §1.2, DOC-AUTOEVAL
```gherkin
Escenario: captura bloqueada sin consentimiento
  Dado que inicié sesión por primera vez
  Cuando intento abrir /app/ficha
  Entonces soy redirigido a /app/consentimiento

Escenario: contenido obligatorio
  Entonces la pantalla muestra responsable (Grupo Smile Bogotá S.A.S.), finalidades, derechos (conocer, actualizar, rectificar, suprimir, revocar) y "sostenibilidad@smilebogota.com"
  Y el botón "Acepto" solo se habilita al marcar la casilla de autorización

Escenario: evidencia inmutable sin conexión
  Dado que no tengo conexión
  Cuando acepto
  Entonces se guarda localmente un consentimiento con versión del texto, hash SHA-256, decisión, hora del dispositivo y método "casilla"
  Y al sincronizar en P2 el servidor agrega su hora y el registro no se puede modificar (UPDATE devuelve 409)
```

### HU-SYN-01 · Base de datos local del proveedor
**Como** PROVEEDOR **quiero** que todo lo que registro se guarde en mi teléfono al instante **para** trabajar sin señal.
- R1 · S1 · 5 pts · FE
- Trazabilidad: RF-SYN-001, RNF-OFF-002, RNF-PERF-003 · CU-14 · SPEC-SOT §5.1, ADR-0005
```gherkin
Escenario: escritura local
  Dado que estoy sin conexión
  Cuando guardo mi ficha
  Entonces el cambio queda en WatermelonDB y la UI lo refleja en menos de 300 ms

Escenario: persistencia
  Cuando cierro el navegador y lo vuelvo a abrir sin conexión
  Entonces mis datos siguen ahí
  Y la app solicitó navigator.storage.persist() en el primer ingreso

Escenario: sin red en navegación
  Cuando navego por /app con la red desactivada
  Entonces no se emite ninguna petición bloqueante a /api/v1 (salvo sync en segundo plano)
```
- Notas: adaptador LokiJS + IndexedDB incremental; `src/data/db/schema.ts` con versión de esquema.

### HU-CAT-01 · Categorías y ejes del piloto
**Como** PROVEEDOR **quiero** ver las categorías de producto y saber que Fruver está activo **para** elegir la mía.
- R1 · S1 · 2 pts · BE
- Trazabilidad: RF-CAT-001, RF-CAT-002 · CU-04 · SPEC-BASE §5.1, C-08, DOC-FRUVER §2
```gherkin
Escenario: catálogo inicial
  Cuando consulto el catálogo sincronizado
  Entonces existen Fruver (ACTIVA), Lácteos, Carnes, Pescados y Mariscos, Insumos y Servicios (PRÓXIMAMENTE)
  Y Fruver tiene los ejes bpa, residuos, carbono, infantil y ddhh en ese orden

Escenario: categoría no activa
  Cuando elijo "Lácteos" como categoría principal
  Entonces veo "Lácteos llegará pronto. Mientras tanto puede registrar su ficha"
  Y no se compone autoevaluación
```

### HU-NOT-01 · Botón de soporte
**Como** PROVEEDOR **quiero** un botón para escribir o llamar a Compras y Sostenibilidad **para** resolver dudas sin buscar el número.
- R1 · S1 · 1 pt · FE
- Trazabilidad: RF-NOT-002 · CU-04 · SPEC-BASE §3.3
```gherkin
Escenario: abrir WhatsApp
  Cuando toco "Soporte" y luego "WhatsApp"
  Entonces se abre https://wa.me/<número configurado> con el texto "Hola, soy <nombre> (<finca>)"

Escenario: sin conexión
  Dado que no tengo conexión
  Entonces la opción "Llamar" sigue disponible (tel:)
```

### HU-CAL-02 · Formato colombiano de cifras y fechas
**Como** PROVEEDOR **quiero** ver pesos, cantidades y fechas en el formato que uso **para** no confundirme con los valores.
- R1 · S1 · 2 pts · FE+BE
- Trazabilidad: RF-CAL-005, RNF-I18N-001, RNF-DATA-001 · CU-09 · SPEC-SOT D2 §3.1 #5
```gherkin
Escenario: moneda
  Cuando el valor es 1234567 COP
  Entonces se muestra "$ 1.234.567" sin decimales

Escenario: fecha y decimales
  Entonces 2026-10-15 se muestra "15/10/2026" y 12.5 kg se muestra "12,5 kg"

Escenario: almacenamiento
  Entonces los montos se guardan como enteros (BIGINT) y las cantidades como NUMERIC(12,3)
```

### HU-SYN-02 · Protocolo pull/push idempotente
**Como** equipo de desarrollo **quiero** los endpoints `GET /api/v1/sync/pull` y `POST /api/v1/sync/push` con idempotencia por `mutation_id` y validación por registro **para** que la información llegue completa y sin duplicados aunque la señal se corte.
- R1 · S2 · 8 pts · BE
- Trazabilidad: RF-SYN-002, RF-SYN-008, RNF-OFF-003 · CU-14 · SPEC-DASH §1.1, arquitectura §5
```gherkin
Escenario: reenvío no duplica
  Dado un push con mutation_id "m-1" y 3 registros aceptados
  Cuando la PWA reenvía el mismo push por corte de señal
  Entonces la API responde el mismo resultado guardado
  Y la base de datos sigue teniendo 3 registros

Escenario: rechazo individual
  Dado un push con 10 registros donde uno tiene cantidad negativa
  Entonces la respuesta es 200 con 9 ids en "accepted" y 1 en "rejected" con code "VALIDATION_ERROR"

Escenario: pull incremental
  Dado last_pulled_at = T
  Cuando pido pull
  Entonces solo recibo cambios posteriores a T y un nuevo timestamp

Escenario: aislamiento
  Entonces el pull de un proveedor nunca incluye registros de otro proveedor
```
- Notas: módulo `sync`; tabla `sync.processed_mutations`; enruta por tabla a `<modulo>.public`.

### HU-SYN-03 · Disparadores de sincronización y estado visible
**Como** PROVEEDOR **quiero** ver si mis datos están guardados y enviados **para** confiar en que no se pierden.
- R1 · S2 · 5 pts · FE
- Trazabilidad: RF-SYN-004, RF-SYN-006, RNF-USA-006 · CU-14 · SPEC-SOT §5.2
```gherkin
Escenario: recuperar conexión
  Dado 4 registros pendientes y sin conexión
  Entonces la barra de estado dice "Sin conexión · guardado"
  Cuando vuelve la conexión
  Entonces la sincronización arranca sola, muestra "Sincronizando" y termina en "Guardado"

Escenario: iOS sin Background Sync
  Dado Safari iOS 16
  Entonces existe el botón "Sincronizar ahora" en /app/perfil

Escenario: reintentos
  Dado que la API responde 503
  Entonces la app reintenta a 1 s, 2 s, 4 s… hasta un máximo de 15 min y muestra "Reintentando"

Escenario: periódico
  Dado conexión estable
  Entonces se ejecuta una sincronización cada 15 minutos con la app abierta
```

### HU-SYN-04 · Resolución de conflictos
**Como** equipo de desarrollo **quiero** reglas de conflicto por tipo de entidad **para** que el proveedor y Smile nunca se sobrescriban datos de forma inesperada.
- R1 · S2 · 3 pts · FE+BE
- Trazabilidad: RF-SYN-005 · CU-14 · SPEC-DASH §1.1
```gherkin
Escenario: ficha, última escritura por campo
  Dado que el proveedor cambia "vereda" offline y un REVIEWER cambia "canal de contacto" en el servidor
  Cuando sincroniza
  Entonces ambos cambios se conservan

Escenario: entidades de Smile
  Dado que el plan fue validado por un REVIEWER
  Cuando la PWA envía un cambio al mismo plan
  Entonces gana el servidor y la PWA recibe la versión validada

Escenario: ERP append-only
  Entonces una venta nunca se actualiza por sync; las correcciones son anulaciones nuevas (S-10)
```

### HU-IAM-04 · Seguir usando la app sin señal y cerrar sesión con seguridad
**Como** PROVEEDOR **quiero** seguir usando la app aunque pase días sin señal **para** no perder mis registros en el campo.
- R1 · S2 · 3 pts · FE
- Trazabilidad: RF-IAM-003, RF-IAM-009 · CU-02 · S-13, ADR-0006
```gherkin
Escenario: 20 días sin red
  Dado que inicié sesión hace 20 días y no he tenido conexión
  Cuando abro /app
  Entonces puedo registrar y consultar normalmente

Escenario: refresh vencido
  Dado que pasaron 31 días sin conexión
  Cuando vuelve la red
  Entonces se me pide ingresar de nuevo y mis registros pendientes se sincronizan después del ingreso

Escenario: cerrar sesión con pendientes
  Dado 3 registros sin sincronizar
  Cuando toco "Cerrar sesión"
  Entonces veo "Tiene 3 registros sin enviar. Si cierra sesión ahora se perderán"
  Y al confirmar se borran la clave de cifrado local y los datos
```

### HU-PRV-02 · Datos sensibles opcionales
**Como** PROVEEDOR **quiero** decidir si comparto datos sensibles y poder responder "Prefiero no responder" **para** proteger mi privacidad sin ser penalizado.
- R1 · S2 · 3 pts · FE+BE
- Trazabilidad: RF-PRV-002 · CU-03 · DOC-AUTOEVAL, SPEC-SOT D2 §4.3
```gherkin
Escenario: consentimiento separado
  Entonces el consentimiento sensible aparece en un paso aparte, desmarcado por defecto

Escenario: sin penalización
  Dado dos proveedores con respuestas idénticas excepto que uno respondió "Prefiero no responder" en liderazgo diverso
  Entonces ambos tienen el mismo puntaje, nivel, etapa y plan

Escenario: sin consentimiento sensible
  Dado que no acepté el consentimiento sensible
  Entonces las preguntas de caracterización diversa no se muestran
```

### HU-SUP-01 · Ficha de identificación
**Como** PROVEEDOR **quiero** registrar mis datos legales y de ubicación **para** quedar inscrito como proveedor de Smile (Etapa 1).
- R1 · S2 · 5 pts · FE+BE
- Trazabilidad: RF-SUP-001, RF-SUP-003 · CU-04 · SPEC-SOT §1.1 E1, §1.3
```gherkin
Escenario: NIT con dígito de verificación
  Cuando ingreso NIT "900123456" y DV "8"
  Entonces veo "El dígito de verificación no coincide" si el cálculo módulo 11 da otro valor
  Y el formulario no se guarda hasta corregirlo

Escenario: municipio
  Cuando elijo departamento "Cundinamarca"
  Entonces solo veo municipios DIVIPOLA de Cundinamarca, disponibles sin conexión

Escenario: persona jurídica
  Cuando elijo "Persona jurídica"
  Entonces "Representante legal" es obligatorio

Escenario: guardado offline
  Dado que no tengo conexión
  Cuando guardo la ficha completa
  Entonces queda en P2 y al sincronizar el servidor emite SupplierProfileCompleted
```

### HU-SUP-02 · Caracterización de la empresa
**Como** PROVEEDOR **quiero** indicar tamaño, origen y liderazgo de mi empresa **para** recibir un formulario acorde a mi realidad.
- R1 · S2 · 2 pts · FE+BE
- Trazabilidad: RF-SUP-002 · CU-04 · SPEC-SOT §1.3, DOC-AUTOEVAL §I
```gherkin
Escenario: opciones exactas
  Entonces tamaño ofrece "Micro / unipersonal", "Pequeña", "Mediana", "Grande"
  Y origen ofrece "Nacional con productos nacionales", "Nacional con productos importados", "Filial de empresa extranjera"

Escenario: tamaño obligatorio
  Cuando intento continuar sin tamaño
  Entonces veo "Elija el tamaño de su empresa según su certificado de existencia"
```

### HU-CAL-01 · Calculadora de huella de la finca
**Como** PROVEEDOR **quiero** calcular mi huella de carbono con mis consumos **para** saber cuánto emito y cómo reducirlo.
- R1 · S2 · 2 pts · FE+BE
- Trazabilidad: RF-CAL-001 · CU-07 · DOC-FRUVER Eje 3, C-12
```gherkin
Escenario: fórmula DOC-FRUVER
  Cuando ingreso 4 gal de diésel, 0 de gasolina, 50 kg de N sintético y 120 kWh
  Entonces veo 4·10,21 + 50·2,45 + 120·0,164 = 182,9 kg CO₂e
  Y la versión de factores "v1 (DOC-FRUVER)"

Escenario: offline
  Entonces el cálculo funciona sin conexión con los factores sincronizados
```
- Notas: regla pura en `impact` (Py) y `src/domain/impact.ts`.

### HU-ASM-01 · Banco de preguntas versionado
**Como** ADMIN **quiero** un banco de preguntas con eje, pesos, aplicabilidad, reglas críticas y mapeo a marcos **para** componer formularios dinámicos y medir cercanía a certificaciones.
- R1 · S2 · 5 pts · BE
- Trazabilidad: RF-ASM-002, RNF-MNT-005 · CU-22 · SPEC-SOT §3.2, C-04
```gherkin
Escenario: semilla Fruver
  Cuando se ejecutan las migraciones y semillas
  Entonces existe la versión 1 publicada del banco Fruver con al menos 25 preguntas y al menos 3 por eje

Escenario: estructura de pregunta
  Entonces cada pregunta tiene texto, ayuda, eje, categorías, tamaños, tipos de persona, tipo de respuesta, peso 1–5, prioridad, critical_when opcional, bandera sensible y mapeo {bcorp, iso_gri, tcfd_sasb, norma_co}

Escenario: inmutabilidad de versión publicada
  Cuando intento editar una pregunta de una versión publicada
  Entonces la API responde 409 "Cree una nueva versión"
```
- Notas: contenido en archivos de semilla versionados (no en código).

### HU-ASM-02 · Formulario compuesto según mi empresa
**Como** PROVEEDOR **quiero** un formulario corto y adecuado a mi tamaño y categoría **para** responderlo rápido.
- R1 · S3 · 5 pts · BE
- Trazabilidad: RF-ASM-001, RF-ASM-004 · CU-05 · SPEC-SOT §3.1, SPEC-BASE §5.1, C-02
```gherkin
Escenario: límites por tamaño
  Dado un proveedor Fruver persona natural tamaño Micro
  Cuando se compone el formulario del ciclo C3-2026
  Entonces tiene como máximo 8 preguntas y al menos 1 por cada uno de los 5 ejes
  Y para Pequeña/Mediana el máximo es 15 y para Grande 25

Escenario: formalidad
  Dado un proveedor persona natural
  Entonces no recibe preguntas marcadas solo para persona jurídica (p. ej. estados financieros)

Escenario: una por ciclo
  Dado que envié la autoevaluación de C3-2026
  Cuando intento iniciar otra en el mismo ciclo
  Entonces veo "Ya envió su autoevaluación de septiembre a diciembre. La próxima abre el 1 de enero"

Escenario: ciclos
  Entonces C1 = ene–abr, C2 = may–ago, C3 = sep–dic
```

### HU-ASM-03 · Responder la autoevaluación sin conexión
**Como** PROVEEDOR **quiero** responder una pregunta por pantalla, pausar y retomar, y firmar al final **para** completarla a mi ritmo en el campo.
- R1 · S3 · 5 pts · FE
- Trazabilidad: RF-ASM-003, RF-ASM-010, RF-PRV-004 · CU-05 · SPEC-BASE §2.1, DOC-AUTOEVAL
```gherkin
Escenario: pausa y reanudación
  Dado que respondí 4 de 8 preguntas
  Cuando cierro la app y la abro sin conexión
  Entonces continúo en la pregunta 5 con la barra de progreso al 50 %

Escenario: componente de respuesta
  Entonces cada respuesta es un botón de al menos 74 px de alto (GUIA_VISUAL §8.4) y avanza sola a los 560 ms

Escenario: declaración obligatoria
  Cuando llego al final
  Entonces debo marcar "Declaro que la información es veraz…" y firmar con el dedo o escribir mi nombre completo
  Y sin eso el botón "Enviar" está deshabilitado

Escenario: envío por P2
  Cuando envío sin conexión
  Entonces la autoevaluación queda bloqueada para edición y se encola en P2 con payload gzip menor a 50 KB
```

### HU-ASM-04 · Motor de puntaje compartido
**Como** equipo de desarrollo **quiero** el cálculo de puntaje por eje, niveles, críticas y Pilar 1 en Python y en TypeScript validados con el mismo fixture **para** que el diagnóstico offline coincida con el oficial.
- R1 · S3 · 5 pts · FE+BE
- Trazabilidad: RF-ASM-005, RF-ASM-006, RF-ASM-007, RF-ASM-008 · CU-05 · S-01, S-02, S-03, S-04, ADR-0005
```gherkin
Escenario: fixture compartido
  Cuando corren los tests de assessment en backend y src/domain en frontend
  Entonces ambos reproducen los 3 casos de contracts/fixtures/assessment-scoring.json (p. ej. bpa 85,71 avanzado; pillar1 53,14)

Escenario: pregunta crítica
  Dado la respuesta "aveces" en una pregunta con critical_when ["no","aveces"] y puntaje de eje 75
  Entonces el eje queda urgent = true y nivel "desarrollo"
  Y se muestra el mensaje crítico definido en la pregunta

Escenario: exclusiones
  Entonces "na" y "pnr" no cuentan en numerador ni denominador, y un eje sin preguntas aplicables tiene score null
```

### HU-ASM-05 · Ver mi diagnóstico
**Como** PROVEEDOR **quiero** ver mi puntaje, mi nivel por eje y qué tan cerca estoy de la certificación BPA **para** entender dónde mejorar.
- R1 · S3 · 5 pts · FE+BE
- Trazabilidad: RF-ASM-009, RF-ASM-013, RF-ASM-007 · CU-06 · SPEC-BASE §5.3, SPEC-DASH (proveedor)
```gherkin
Escenario: pantalla de diagnóstico
  Dado mi autoevaluación enviada
  Entonces veo el anillo con mi Pilar 1 (0–100), nivel general, barras por eje con su nivel y las alertas críticas
  Y el texto "Está a 78 % de la certificación BPA del ICA" calculado como puntos obtenidos / posibles de preguntas mapeadas a BPA

Escenario: alerta crítica
  Dado un eje urgente por trabajo infantil
  Entonces veo una alerta en rosa con "Identificamos un riesgo que requiere atención inmediata…" y el enlace a la guía del eje
  Y se registra una alerta para REVIEWER (visible en back-office desde R3, HU-NOT-03)

Escenario: lenguaje
  Entonces ningún texto menciona "GRI", "TCFD" o "SASB" en la PWA rural (SPEC-SOT D2 §3.1 #3)
```
- Notas: componentes Ring y LevelBadge (GUIA_VISUAL §8.5); animación del anillo 2.2 s (§9.4).

### HU-IMP-01 · Recibir mi ruta de crecimiento de 3 metas
**Como** PROVEEDOR **quiero** que al terminar la autoevaluación se me asignen 3 metas prioritarias **para** saber exactamente por dónde empezar.
- R1 · S3 · 5 pts · FE+BE
- Trazabilidad: RF-IMP-001, RF-IMP-002 · CU-07 · SPEC-SOT §1.1 E3, SPEC-BASE §5.3, S-09, DOC-MATRIZ §16
```gherkin
Escenario: orden de brechas
  Dado el caso 1 del fixture
  Entonces el plan es [infantil (Urgente), residuos (Alta), carbono (Media)]

Escenario: completar con mantener
  Dado el caso 2 del fixture
  Entonces el plan es [bpa (Urgente), carbono (Mantener), residuos (Mantener)]

Escenario: estructura de la meta
  Entonces cada meta tiene hallazgo, acción, responsable (yo por defecto), fecha límite = último día del ciclo y evidencia esperada

Escenario: generación offline y oficial
  Dado que envié sin conexión
  Entonces veo el plan generado localmente
  Y al sincronizar el servidor genera el plan oficial (PlanGenerated) y la PWA lo reemplaza si difiere
```

### HU-IMP-02 · Guías disponibles sin conexión
**Como** PROVEEDOR **quiero** abrir la guía de cada meta con pasos, checklist y consejo **para** aplicarla en mi finca sin internet.
- R1 · S3 · 3 pts · FE
- Trazabilidad: RF-IMP-003 · CU-07 · DOC-FRUVER §2
```gherkin
Escenario: contenido de la guía
  Cuando abro la meta de Residuos
  Entonces veo título, introducción, pasos numerados (p. ej. triple lavado en 4 etapas), checklist, consejo, fuente "Decreto 1076 de 2015 / CampoLimpio" y minutos estimados

Escenario: offline
  Dado que no tengo conexión
  Entonces la guía abre completa, incluida la calculadora de huella en la guía de Carbono (HU-CAL-01)
```

### HU-IMP-03 · Marcar el checklist de mis metas
**Como** PROVEEDOR **quiero** marcar los pasos que voy cumpliendo **para** ver mi avance y completar la meta.
- R1 · S3 · 3 pts · FE+BE
- Trazabilidad: RF-IMP-004 · CU-07 · SPEC-SOT §1.1 E4
```gherkin
Escenario: meta completa
  Dado una meta con 4 ítems y 3 marcados
  Cuando marco el cuarto
  Entonces la meta queda "Completa", se dispara confeti (si no hay movimiento reducido) y un toast "Meta completa"
  Y el cambio se encola en P2 (tabla goal_checks)

Escenario: desmarcar
  Cuando desmarco un ítem de una meta completa
  Entonces vuelve a "En progreso"
```

### HU-IMP-04 · Imprimir o compartir mi ficha resumen
**Como** PROVEEDOR **quiero** imprimir mi ficha o enviarla por WhatsApp **para** mostrarla a mi asociación o al técnico.
- R1 · S3 · 3 pts · FE
- Trazabilidad: RF-IMP-007 · CU-08 · DOC-FRUVER §3, SPEC-SOT §4.1
```gherkin
Escenario: impresión A4 monocromática
  Cuando toco "Descargar o imprimir"
  Entonces se abre la vista de impresión A4 con margen 14 mm, en blanco y negro de alto contraste, con mis datos, puntaje, ejes y las 3 metas con acción y método de control

Escenario: WhatsApp
  Cuando toco "Enviar por WhatsApp"
  Entonces se abre wa.me con un texto de menos de 1 KB que resume finca, puntaje y metas

Escenario: sin conexión
  Entonces ambas opciones funcionan offline (el envío de WhatsApp lo completa la app de WhatsApp cuando haya red)
```

---

## 5. R2 · Mini ERP y trazabilidad (S4–S6)

### HU-SYN-05 · Cola priorizada P1/P2/P3 y compresión
**Como** PROVEEDOR **quiero** que mis ventas y costos se envíen primero cuando haya poca señal **para** que lo más importante llegue a Smile.
- R2 · S4 · 5 pts · FE+BE
- Trazabilidad: RF-SYN-003, RF-SYN-007, RNF-OFF-003 · CU-14 · SPEC-SOT §5.2, SPEC-BASE §2.3
```gherkin
Escenario: orden estricto
  Dado 5 ventas (P1), 1 autoevaluación (P2) y 1 foto de evidencia (P3) pendientes
  Cuando vuelve la conexión
  Entonces se envían primero las ventas; la autoevaluación empieza solo cuando P1 está vacío; la foto al final

Escenario: tamaño de lote
  Dado 300 registros P1 pendientes
  Entonces se envían en lotes gzip menores de 10 KB cada uno

Escenario: caos
  Cuando la conexión se corta a mitad de un lote
  Entonces ningún registro confirmado se pierde ni se duplica tras reintentar
```

### HU-CAT-02 · Productos y unidades
**Como** PROVEEDOR **quiero** elegir mis productos de una lista con sus unidades habituales **para** registrar rápido y sin errores.
- R2 · S4 · 3 pts · BE
- Trazabilidad: RF-CAT-003 · CU-09 · SPEC-DASH §1.3, S-11, S-12
```gherkin
Escenario: conversiones
  Dado el producto "Tomate chonto" con unidad base kg
  Entonces 1 arroba = 12,5 kg y 1 bulto = 50 kg salvo que el producto defina otro valor

Escenario: rango creíble
  Entonces cada producto tiene precio mínimo y máximo por kg para la advertencia de HU-ERP-06
```

### HU-ERP-10 · Módulo ERP en el servidor
**Como** equipo de desarrollo **quiero** el módulo `erp` con sus comandos alimentados desde sync P1 **para** que los registros del proveedor queden oficiales en el servidor.
- R2 · S4 · 5 pts · BE
- Trazabilidad: RF-ERP-012, RNF-DATA-001 · CU-14 · SPEC-SOT §5.2, arquitectura §3.3
```gherkin
Escenario: registro recibido
  Cuando sync entrega una fila erp_sales válida
  Entonces se persiste en el esquema erp con monto BIGINT y cantidad NUMERIC(12,3)
  Y se emite ErpEntryRecorded en el outbox

Escenario: propiedad
  Cuando un push incluye una venta con supplier_id de otro proveedor
  Entonces se rechaza con code "FORBIDDEN"
```

### HU-ERP-01 · Registrar una venta en menos de un minuto
**Como** PROVEEDOR **quiero** registrar una venta con pocos toques **para** conocer mi ganancia real sin perder tiempo.
- R2 · S4 · 5 pts · FE
- Trazabilidad: RF-ERP-001, RF-ERP-012, RNF-PERF-003, RNF-USA-003 · CU-09 · SPEC-SOT §2.1
```gherkin
Escenario: venta a Smile
  Dado que estoy en /app/erp/ventas/nueva sin conexión
  Cuando elijo cliente "Grupo Smile", producto "Tomate chonto", cantidad 3, unidad "bulto" y valor 450000
  Entonces la venta se guarda con fecha de hoy y veo "Venta guardada" en menos de 300 ms
  Y se encola en P1

Escenario: valores por defecto
  Entonces fecha = hoy, cliente = último usado y unidad = la habitual del producto
  Y el registro completo requiere como máximo 4 toques más la digitación de cantidad y valor

Escenario: otro cliente
  Cuando elijo "Otro comprador"
  Entonces debo escribir su nombre
```

### HU-ERP-02 · Registrar un costo
**Como** PROVEEDOR **quiero** registrar mis gastos en 4 categorías simples **para** saber cuánto me cuesta producir.
- R2 · S4 · 3 pts · FE
- Trazabilidad: RF-ERP-002, RF-ERP-012 · CU-10 · SPEC-SOT §2.1, §2.3
```gherkin
Escenario: categorías
  Entonces solo veo: "Insumos y semillas", "Fertilizantes y agroquímicos", "Mano de obra y jornales", "Fletes, combustible y mantenimiento"

Escenario: inversión BPA
  Cuando registro 200000 en "Insumos y semillas" y marco "Es inversión en buenas prácticas"
  Entonces el costo queda marcado para el ROI (HU-CAL-04)
```

### HU-ERP-03 · Entradas e inventario disponible
**Como** PROVEEDOR **quiero** registrar mis cosechas o compras y ver cuánto me queda **para** no vender lo que no tengo.
- R2 · S4 · 5 pts · FE
- Trazabilidad: RF-ERP-003, RF-ERP-004 · CU-11 · SPEC-SOT §2.1, SPEC-BASE §4.1
```gherkin
Escenario: cálculo de inventario
  Dado una entrada de 200 kg de tomate, una venta de 2 bultos (100 kg) y una merma de 12,5 kg
  Entonces el inventario disponible de tomate es 87,5 kg, actualizado al guardar

Escenario: unidades mixtas
  Entonces el inventario siempre se muestra en la unidad base del producto
```

### HU-ERP-04 · Registrar mermas
**Como** PROVEEDOR **quiero** registrar el producto dañado eligiendo la causa **para** entender por qué pierdo producto.
- R2 · S4 · 3 pts · FE
- Trazabilidad: RF-ERP-006 · CU-11 · SPEC-SOT §2.2, C-06
```gherkin
Escenario: causas
  Entonces las causas son "Plagas o enfermedades", "Daño mecánico postcosecha", "Descomposición natural", "Defecto de empaque"

Escenario: sin foto
  Cuando registro 10 kg con causa "Descomposición natural" sin foto
  Entonces se guarda y se emite WasteRecorded al sincronizar
```

### HU-ERP-05 · Ganancia, margen y métricas comerciales
**Como** PROVEEDOR **quiero** ver mi ganancia neta, margen, precio medio por kg y % de merma **para** tomar decisiones de venta.
- R2 · S5 · 5 pts · FE
- Trazabilidad: RF-ERP-005, RF-ERP-010 · CU-09 · SPEC-SOT §2.1, SPEC-BASE §4.2
```gherkin
Escenario: margen del mes
  Dado ventas por 2.000.000 y costos por 1.400.000 en octubre
  Entonces ganancia neta = $ 600.000 y margen = 30 %

Escenario: precio medio y merma
  Dado 100 kg vendidos por 300.000 y 200 kg de entradas con 10 kg de merma
  Entonces precio medio = $ 3.000/kg y % merma = 5 %

Escenario: periodos
  Entonces puedo alternar entre semana, mes y ciclo actuales
```

### HU-ERP-06 · Advertencia de valores poco creíbles
**Como** PROVEEDOR **quiero** que la app me avise si escribí un valor raro **para** corregir errores de digitación.
- R2 · S5 · 3 pts · FE
- Trazabilidad: RF-ERP-007 · CU-09 · SPEC-DASH §1.3, S-11
```gherkin
Escenario: precio fuera de rango
  Dado que el tomate tiene rango 500–8.000 $/kg
  Cuando registro 10 kg por 4.500.000
  Entonces veo "Revise el valor: equivale a $ 450.000 por kg. ¿Es correcto?" con "Corregir" y "Sí, guardar"
  Y si confirmo, se guarda

Escenario: percentil propio
  Dado que tengo 25 ventas
  Cuando una cantidad supera mi percentil 99
  Entonces veo la advertencia de confirmación
```

### HU-ERP-07 · Normalización de unidades en el servidor
**Como** REVIEWER **quiero** que todas las cantidades se comparen en unidades del sistema internacional **para** que los indicadores agregados sean correctos.
- R2 · S5 · 3 pts · BE
- Trazabilidad: RF-ERP-008, RF-CAT-003 · CU-14 · SPEC-DASH §1.3
```gherkin
Escenario: conversión
  Cuando llega una venta de 2 arrobas de papa
  Entonces se guarda quantity_base = 25,000 kg y se conservan quantity_original = 2 y unit_original = "arroba"
```

### HU-ERP-08 · Corregir o anular un registro
**Como** PROVEEDOR **quiero** corregir o anular un registro de la última semana **para** mantener mis cuentas exactas.
- R2 · S5 · 3 pts · FE+BE
- Trazabilidad: RF-ERP-009 · CU-09 · S-10
```gherkin
Escenario: dentro de 7 días
  Dado una venta de hace 3 días
  Cuando la anulo con motivo "Valor mal digitado"
  Entonces queda anulada (no se borra) y se excluye de totales e inventario

Escenario: fuera de plazo
  Dado una venta de hace 8 días
  Entonces no veo las opciones "Editar" ni "Anular"
  Y la API rechaza una anulación con code "EDIT_WINDOW_CLOSED"
```

### HU-ERP-09 · Pantalla de inicio con mi salud financiera
**Como** PROVEEDOR **quiero** ver de un vistazo ventas, costos, margen e inventario **para** saber cómo va mi negocio.
- R2 · S5 · 3 pts · FE
- Trazabilidad: RF-ERP-011 · CU-09 · SPEC-DASH (proveedor)
```gherkin
Escenario: tarjetas
  Cuando abro /app
  Entonces veo 4 tarjetas: Ventas ($), Costos ($), Margen neto (%), Inventario disponible (kg) del mes actual
  Y cada una abre su detalle

Escenario: sin registros
  Dado que no tengo registros
  Entonces veo "Registre su primera venta para conocer su ganancia real" con el botón "Registrar venta"
```

### HU-CAT-03 · Agroquímicos y períodos de carencia
**Como** ADMIN **quiero** mantener el catálogo de agroquímicos y la tabla de carencias por cultivo **para** que la validación ICA sea correcta.
- R2 · S5 · 3 pts · FE+BE
- Trazabilidad: RF-CAT-005 · CU-23 · SPEC-SOT §2.2, Q-03
```gherkin
Escenario: carga
  Cuando registro "Mancozeb 80 WP", registro ICA "1234", ingrediente "mancozeb" y carencia 7 días para tomate
  Entonces queda disponible en el próximo pull de los proveedores Fruver

Escenario: autorización
  Cuando un REVIEWER intenta editar la tabla
  Entonces la API responde 403
```

### HU-TRZ-01 · Registrar una aplicación de agroquímico
**Como** PROVEEDOR **quiero** anotar cada fumigación **para** saber cuándo puedo cosechar sin riesgo.
- R2 · S5 · 3 pts · FE
- Trazabilidad: RF-TRZ-001 · CU-12 · SPEC-SOT §2.2
```gherkin
Escenario: registro
  Cuando registro "Mancozeb 80 WP" en "Tomate – lote norte" el 10/10/2026 con dosis 2,5 g/L
  Entonces se guarda offline y se encola en P1

Escenario: producto sin registro ICA
  Cuando escribo un producto que no está en el catálogo
  Entonces veo "Use productos con registro ICA vigente" y la aplicación se guarda marcada "sin registro"
```

### HU-TRZ-02 · Crear lote y conocer la fecha mínima de despacho
**Como** PROVEEDOR **quiero** que al crear un lote se calcule cuándo puedo despacharlo **para** respetar los períodos de carencia.
- R2 · S5 · 5 pts · FE+BE
- Trazabilidad: RF-TRZ-002 · CU-13 · SPEC-BASE §4.2
```gherkin
Escenario: máxima carencia
  Dado aplicaciones en tomate: mancozeb (7 días) el 10/10 y otra (14 días) el 05/10
  Cuando creo un lote de tomate
  Entonces la fecha mínima de despacho es 19/10/2026 (máx(17/10, 19/10))

Escenario: regla compartida
  Entonces el cálculo en TS y en Python pasa los mismos casos de prueba (ADR-0005)
```

### HU-TRZ-03 · Bloqueo de lotes en carencia
**Como** PROVEEDOR **quiero** que la app me impida liberar un lote antes de tiempo **para** proteger a los comensales y mi relación con Smile.
- R2 · S6 · 3 pts · FE
- Trazabilidad: RF-TRZ-003, RF-TRZ-005 · CU-13 · SPEC-BASE §8.2, DOC-FRUVER Eje 1
```gherkin
Escenario: bloqueado
  Dado fecha mínima 19/10/2026 y hoy 15/10/2026
  Entonces el botón "Liberar lote" está deshabilitado y veo "Faltan 4 días para cosechar sin riesgo"

Escenario: sin aplicaciones
  Dado un cultivo sin aplicaciones registradas con carencia máxima de 21 días
  Cuando libero el lote
  Entonces debo confirmar "No he aplicado agroquímicos en este cultivo en los últimos 21 días"
```

### HU-TRZ-04 · Rótulo con código y QR
**Como** PROVEEDOR **quiero** generar el rótulo del lote con sello de carencia verificada **para** entregarlo a Smile con trazabilidad.
- R2 · S6 · 5 pts · FE
- Trazabilidad: RF-TRZ-004 · CU-13 · SPEC-SOT §2.2, S-16
```gherkin
Escenario: código
  Cuando libero un lote de Fruver el 20/10/2026
  Entonces se genera un código con formato SML-FRV-{PROV6}-20261020-{SEQ}-{DV} con DV módulo 11 válido

Escenario: offline e impresión
  Dado que no tengo conexión
  Entonces veo el rótulo en pantalla con QR y "Carencia verificada"
  Y puedo imprimirlo en etiqueta 50 × 30 mm o en A4

Escenario: unicidad
  Dado dos dispositivos del mismo proveedor que liberan lotes el mismo día
  Entonces los códigos no colisionan gracias al sufijo de dispositivo
```

### HU-TRZ-05 · Alerta de lotes por liberar
**Como** PROVEEDOR **quiero** ver en el inicio cuántos días faltan para liberar mis lotes **para** planear la cosecha.
- R2 · S6 · 2 pts · FE
- Trazabilidad: RF-TRZ-006 · CU-13 · SPEC-DASH (proveedor)
```gherkin
Escenario: alerta
  Dado un lote bloqueado con 4 días restantes
  Entonces el inicio muestra "Tomate – lote norte: libre en 4 días"
  Y al día de liberar muestra "Listo para despacho"
```

### HU-TRZ-06 · Validación de carencia en el servidor
**Como** REVIEWER **quiero** que el servidor rechace lotes liberados que violen la carencia **para** confiar en los rótulos recibidos.
- R2 · S6 · 3 pts · BE
- Trazabilidad: RF-TRZ-007 · CU-14 · Res. ICA 30021
```gherkin
Escenario: violación
  Dado un lote liberado el 15/10 con una aplicación de 7 días de carencia el 10/10
  Cuando llega por sync
  Entonces se rechaza con code "PRE_HARVEST_INTERVAL_VIOLATION" y la PWA marca el lote para corrección

Escenario: válido
  Entonces un lote correcto se acepta y emite LotReleased
```

### HU-PRV-03 · Soberanía de mis datos financieros
**Como** PROVEEDOR **quiero** que Smile vea solo indicadores agregados de mi Mini ERP **para** proteger mi información estratégica.
- R2 · S6 · 3 pts · BE
- Trazabilidad: RF-PRV-007, RF-RPT-006 · CU-16 · SPEC-DASH §1.2, SPEC-SOT D2 §4.3
```gherkin
Escenario: sin filas individuales
  Cuando un REVIEWER o ADMIN consulta cualquier endpoint de /api/v1
  Entonces ninguna respuesta incluye filas de erp_sales, erp_costs, erp_stock_entries ni erp_waste
  Y un test recorre todos los endpoints internos verificándolo

Escenario: agregados permitidos
  Entonces sí puede ver margen %, % merma, frecuencia de registro y totales por ciclo
```

### HU-PRV-04 · Cifrado local de campos sensibles
**Como** PROVEEDOR **quiero** que mis datos financieros y sensibles estén cifrados en el teléfono **para** que nadie los lea si pierdo el equipo.
- R2 · S6 · 5 pts · FE
- Trazabilidad: RF-PRV-008 · CU-03 · SPEC-DASH §1.2, ADR-0006, C-14
```gherkin
Escenario: cifrado en IndexedDB
  Cuando registro una venta de 450000
  Entonces en IndexedDB el campo de valor aparece cifrado con AES-GCM 256, no en texto plano

Escenario: clave no exportable
  Entonces la CryptoKey tiene extractable = false

Escenario: totales
  Entonces los totales se calculan descifrando en memoria y coinciden con los valores originales
```

### HU-IMP-05 · Evidencia fotográfica de una meta
**Como** PROVEEDOR **quiero** adjuntar una foto como evidencia de mi meta **para** demostrar el cambio en mi finca.
- R2 · S6 · 3 pts · FE+BE
- Trazabilidad: RF-IMP-004, RF-SYN-003 · CU-07 · DOC-MATRIZ §16
```gherkin
Escenario: compresión
  Cuando tomo una foto de 4 MB
  Entonces se comprime en el dispositivo a 1 MB o menos antes de guardarla

Escenario: subida P3
  Entonces se sube con URL prefirmada solo cuando P1 y P2 están vacíos
```

---

## 6. R3 · CRM back-office (S7–S9)

### HU-PLAT-08 · Worker de eventos y tareas programadas
**Como** equipo de desarrollo **quiero** el proceso worker que despacha el outbox y ejecuta tareas programadas **para** que los módulos reaccionen entre sí de forma confiable.
- R3 · S7 · 5 pts · BE
- Trazabilidad: RNF-MNT-002, RF-SCO-001 · CU-19 · ADR-0007
```gherkin
Escenario: entrega al menos una vez
  Dado un evento AssessmentSubmitted en el outbox
  Cuando el worker lo procesa y se reinicia antes de confirmar
  Entonces el handler se ejecuta de nuevo y por ser idempotente no duplica el plan

Escenario: dead letter
  Dado un handler que falla 10 veces
  Entonces el evento pasa a dead letter y se registra en logs

Escenario: cron
  Entonces existen tareas: score provisional diario 02:00, cierre de ciclo el primer día de ene/may/sep 00:30, vencimiento de documentos diario
```
- Nota: en R1 la generación oficial del plan se ejecuta en el mismo caso de uso; desde S7 pasa a handler de evento.

### HU-PLAT-07 · Auditoría de acciones internas
**Como** ADMIN **quiero** un registro de quién hizo qué en el back-office **para** responder ante auditorías y reclamos.
- R3 · S7 · 3 pts · BE
- Trazabilidad: RNF-SEC-007 · CU-16 · SPEC-SOT §1.4
```gherkin
Escenario: acción auditada
  Cuando un REVIEWER abre un expediente, exporta, otorga una Flor o un ADMIN cambia un parámetro
  Entonces shared.audit_log guarda usuario, acción, recurso, fecha UTC e IP

Escenario: retención
  Entonces los registros se conservan 2 años y no se pueden editar desde la API
```

### HU-IAM-05 · Gestionar usuarios internos
**Como** ADMIN **quiero** crear cuentas de REVIEWER y ADMIN, cambiar roles y desactivar cuentas **para** controlar quién accede al back-office.
- R3 · S7 · 3 pts · FE+BE
- Trazabilidad: RF-IAM-005 · CU-24 · SPEC-SOT §1
```gherkin
Escenario: crear reviewer
  Cuando creo "compras@smile.co" con rol REVIEWER en /smile/admin/usuarios
  Entonces recibe un correo para definir contraseña y aparece en la lista como activo

Escenario: no admin
  Cuando un REVIEWER intenta POST /api/v1/iam/users
  Entonces la API responde 403

Escenario: desactivación
  Cuando desactivo una cuenta
  Entonces sus refresh tokens se revocan y no puede ingresar
```

### HU-PRV-05 · Revocar mi autorización
**Como** PROVEEDOR **quiero** revocar mi autorización de datos **para** ejercer mi derecho según la Ley 1581.
- R3 · S7 · 3 pts · FE+BE
- Trazabilidad: RF-PRV-005 · CU-30 · Ley 1581 art. 15
```gherkin
Escenario: revocar
  Cuando toco "Revocar autorización" en /app/perfil y confirmo
  Entonces la PWA deja de sincronizar datos nuevos
  Y se crea una solicitud de supresión con vencimiento a 15 días hábiles visible para ADMIN

Escenario: notificación interna
  Entonces el ADMIN ve la solicitud en /smile/admin/privacidad con estado RECIBIDA
```

### HU-SUP-03 · Segmento Pareto del proveedor
**Como** ADMIN **quiero** marcar a cada proveedor como Estratégico o Local **para** asignarle el path adecuado.
- R3 · S7 · 2 pts · FE+BE
- Trazabilidad: RF-SUP-004 · CU-16 · SPEC-BASE §1.2, §6.3
```gherkin
Escenario: marcar estratégico
  Cuando marco un proveedor como ESTRATEGICO
  Entonces su path es "Corporativo Avanzado" y su próximo formulario se compone con ese path

Escenario: reviewer
  Entonces un REVIEWER ve el segmento pero no puede cambiarlo
```

### HU-SUP-04 · Bóveda documental
**Como** PROVEEDOR o REVIEWER **quiero** subir certificaciones, contratos y fichas técnicas al expediente **para** tener todo en un solo lugar.
- R3 · S7 · 5 pts · FE+BE
- Trazabilidad: RF-SUP-005, RNF-SEC-006 · CU-16 · SPEC-SOT §1.3, ADR-0004
```gherkin
Escenario: subida válida
  Cuando subo un PDF de 3 MB tipo "ICA" con vencimiento 31/12/2027
  Entonces se sube con URL prefirmada al almacenamiento S3 y queda en el expediente

Escenario: archivo inválido
  Cuando subo un .exe renombrado a .pdf
  Entonces la validación por magic bytes lo rechaza con "El archivo no es un PDF, JPG o PNG válido"

Escenario: tamaño
  Cuando subo un archivo de 12 MB
  Entonces veo "El archivo supera 10 MB"

Escenario: descarga
  Entonces la descarga usa una URL firmada que expira en 15 minutos
```

### HU-SUP-06 · Bitácora de visitas de campo
**Como** REVIEWER **quiero** registrar visitas con hallazgos y compromisos **para** hacer seguimiento a cada finca.
- R3 · S8 · 5 pts · FE+BE
- Trazabilidad: RF-SUP-007 · CU-17 · SPEC-SOT §1.3, DOC-MATRIZ §16
```gherkin
Escenario: visita con compromisos
  Cuando registro una visita de "auditoría" con aliado "SENA", 2 hallazgos y 1 compromiso (acción, responsable, fecha límite 30/11/2026, evidencia "foto de compostera")
  Entonces la visita aparece en el expediente en orden cronológico

Escenario: acta
  Cuando adjunto el acta firmada en PDF
  Entonces queda vinculada a la visita
```

### HU-SUP-07 · Incidentes de calidad
**Como** REVIEWER **quiero** registrar incidentes de calidad **para** documentar problemas en entregas.
- R3 · S8 · 2 pts · FE+BE
- Trazabilidad: RF-SUP-008 · CU-16 · SPEC-SOT §1.3
```gherkin
Escenario: incidente
  Cuando registro un incidente de severidad "alta" asociado a la recepción del 12/10/2026
  Entonces aparece en el expediente y en el resumen del proveedor
```

### HU-SUP-08 · Expediente unificado ("Linktree")
**Como** REVIEWER **quiero** ver todo lo de un proveedor en una sola pantalla **para** decidir rápido sin buscar en varios sistemas.
- R3 · S8 · 5 pts · FE+BE
- Trazabilidad: RF-SUP-009, RF-PRV-007 · CU-16 · SPEC-SOT §1.3, SPEC-BASE §3.3
```gherkin
Escenario: secciones
  Cuando abro /smile/proveedores/{id}
  Entonces veo ficha, caracterización (si hay consentimiento sensible), score y etapa, plan vigente, documentos, visitas, incidentes, reconocimientos y mensajes

Escenario: soberanía
  Entonces la sección Mini ERP solo muestra agregados (margen %, % merma, semanas con registro)
```

### HU-CAT-04 · Parámetros versionados
**Como** ADMIN **quiero** ajustar pesos, umbrales, factores y fórmulas con fecha de vigencia **para** cambiar reglas de negocio sin desplegar.
- R3 · S8 · 5 pts · FE+BE
- Trazabilidad: RF-CAT-004 · CU-23 · S-01…S-16
```gherkin
Escenario: pesos de pilares
  Cuando publico pesos 0,5 / 0,3 / 0,2 con vigencia 01/01/2027
  Entonces el cierre de C1-2027 los usa y C3-2026 conserva los anteriores

Escenario: validación
  Cuando los pesos no suman 1
  Entonces veo "Los pesos de los pilares deben sumar 1" y no se publica

Escenario: auditoría
  Entonces cada publicación queda en audit_log con valores anterior y nuevo
```

### HU-ASM-06 · Administrar el banco de preguntas
**Como** ADMIN **quiero** crear y publicar versiones del banco **para** mejorar las preguntas sin afectar ciclos en curso.
- R3 · S8 · 5 pts · FE+BE
- Trazabilidad: RF-ASM-011, RF-ASM-002 · CU-22 · SPEC-SOT §3
```gherkin
Escenario: nueva versión
  Dado la versión 1 publicada
  Cuando creo la versión 2 cambiando el texto de q4 y la publico
  Entonces los formularios compuestos desde ahora usan la v2
  Y los ciclos ya iniciados con v1 siguen con v1

Escenario: validación de cobertura
  Cuando una versión deja un eje sin preguntas para tamaño Micro
  Entonces no se puede publicar
```

### HU-IMP-07 · Administrar guías
**Como** ADMIN **quiero** editar guías en Markdown por eje y categoría **para** mantener el contenido técnico actualizado.
- R3 · S8 · 3 pts · FE+BE
- Trazabilidad: RF-IMP-006 · CU-31 · RNF-MNT-005
```gherkin
Escenario: publicar guía
  Cuando publico una nueva versión de la guía de Residuos
  Entonces llega a las PWA en el siguiente pull y las metas existentes enlazan la nueva versión
```

### HU-REC-01 · Registrar una recepción de entrega
**Como** REVIEWER **quiero** registrar lo recibido, rechazado y la puntualidad de cada entrega **para** medir el desempeño operativo.
- R3 · S8 · 5 pts · FE+BE
- Trazabilidad: RF-REC-001, RF-REC-005 · CU-15 · SPEC-SOT §1.2 P2
```gherkin
Escenario: recepción con rótulo
  Cuando escaneo el QR SML-FRV-… y registro 500 kg pactados, 480 recibidos, 24 rechazados por "daño mecánico", hora pactada 06:00 y real 06:40
  Entonces se guarda y la entrega queda "carencia verificada"

Escenario: rótulo inválido
  Cuando ingreso un código que no corresponde a un lote liberado de ese proveedor
  Entonces la entrega queda "sin rótulo válido"

Escenario: proveedor
  Cuando un PROVEEDOR llama POST /api/v1/receptions
  Entonces la API responde 403
```

### HU-REC-03 · Calcular el Pilar 2
**Como** REVIEWER **quiero** que el desempeño operativo se calcule automáticamente **para** puntuar a todos con la misma regla.
- R3 · S9 · 3 pts · BE
- Trazabilidad: RF-REC-003 · CU-19 · S-05
```gherkin
Escenario: fórmula S-05
  Dado en el ciclo: rechazo 8 %, volumen 96 %, puntualidad 75 %, carencia 100 %
  Entonces Calidad ≈ 72,73, Volumen 96, Puntualidad 75, Carencia 100
  Y P2 = 0,40·72,73 + 0,25·96 + 0,20·75 + 0,15·100 = 83,09

Escenario: sin recepciones
  Entonces P2 = null y se marca "sin datos" (S-07)
```

### HU-REC-04 · Ver mis recepciones
**Como** PROVEEDOR **quiero** ver mis entregas, rechazos y causas **para** saber qué mejorar.
- R3 · S9 · 2 pts · FE
- Trazabilidad: RF-REC-004 · CU-15 · SPEC-SOT D2 §3.1 #3
```gherkin
Escenario: lista
  Entonces en /app veo mis recepciones con fecha, kg recibidos, kg rechazados, causa y tasa de rechazo del ciclo
  Y están disponibles offline tras el pull
```

### HU-SCO-01 · Score total y Pilar 3
**Como** REVIEWER **quiero** el score 0–100 de cada proveedor con sus tres pilares **para** comparar y priorizar acompañamiento.
- R3 · S9 · 5 pts · BE
- Trazabilidad: RF-SCO-001, RF-SCO-002 · CU-19 · SPEC-SOT §1.2, S-06, S-07
```gherkin
Escenario: score completo
  Dado P1 = 70, P2 = 80, P3 = 60
  Entonces score = 70·0,5 + 80·0,3 + 60·0,2 = 71

Escenario: pilar faltante
  Dado P1 = 70, P2 = null, P3 = 60
  Entonces score = (70·0,5 + 60·0,2) / 0,7 = 67,14 y se marca "parcial"

Escenario: P3
  Dado 10 de 12 semanas con registro, 3 de 4 clips completados, diagnóstico previo enviado y P1 no bajó
  Entonces P3 = 0,40·83,33 + 0,35·75 + 0,25·100 = 84,58

Escenario: oficial y provisional
  Entonces el cierre de ciclo guarda el score oficial y la tarea diaria actualiza el provisional
```

### HU-SCO-02 · Funnel automático de 6 etapas
**Como** REVIEWER **quiero** que cada proveedor esté en su etapa según reglas **para** ver la maduración de la red en tiempo real.
- R3 · S9 · 5 pts · BE
- Trazabilidad: RF-SCO-003 · CU-19 · SPEC-SOT §1.1, S-08, C-10
```gherkin
Escenario: progresión
  Dado un proveedor con ficha completa → E1; con diagnóstico del ciclo → E2; con plan → E3
  Y con un registro ERP hace 5 días y 1 guía completada → E4

Escenario: candidato
  Dado score_total 81 → E5
  Y también E5 si tiene certificación BPA ICA verificada aunque su score sea 65

Escenario: retroceso
  Dado un proveedor en E4 sin registros ERP durante 30 días
  Entonces vuelve a E3 y se emite StageChanged

Escenario: E6 solo manual
  Entonces ninguna regla automática asigna E6
```

### HU-SCO-03 · Historial de score y etapas
**Como** REVIEWER **quiero** ver la evolución por ciclo **para** medir el avance inter-cuatrimestral.
- R3 · S9 · 3 pts · BE
- Trazabilidad: RF-SCO-004 · CU-19 · SPEC-BASE §3.2
```gherkin
Escenario: series
  Entonces cada recálculo guarda un snapshot (proveedor, ciclo, P1, P2, P3, total, etapa, tipo oficial/provisional) en una hypertable de TimescaleDB
  Y el expediente muestra la gráfica por ciclo
```

### HU-SCO-04 · Etapa 6 y ajuste manual
**Como** ADMIN **quiero** asignar la Etapa 6 o forzar una etapa con motivo **para** reflejar decisiones comerciales.
- R3 · S9 · 2 pts · FE+BE
- Trazabilidad: RF-SCO-003, RF-SCO-005 · CU-21 · Q-07
```gherkin
Escenario: asignar E6
  Dado un proveedor en E5
  Cuando asigno E6 con motivo "Cupo preferente 2027"
  Entonces queda en E6 y se audita

Escenario: requisito
  Dado un proveedor en E3
  Entonces la opción E6 no está disponible

Escenario: motivo obligatorio
  Cuando fuerzo una etapa sin motivo
  Entonces veo "Escriba el motivo del ajuste"
```

### HU-SCO-05 · Ver mi score y mi etapa
**Como** PROVEEDOR **quiero** entender mi puntaje y qué hacer para subirlo **para** avanzar hacia ser proveedor preferente.
- R3 · S9 · 3 pts · FE
- Trazabilidad: RF-SCO-006 · CU-19 · SPEC-SOT D2 §3
```gherkin
Escenario: explicación
  Entonces veo mi score, mi etapa (número y nombre) y para cada pilar una frase como "Desempeño en entregas: 83 de 100. Lo que más lo sube: entregar a la hora pactada"

Escenario: parcial
  Dado score parcial
  Entonces veo "Aún no hay entregas registradas este ciclo; su puntaje se calcula con los demás pilares"
```

### HU-NOT-02 · Mensajes directos entre Smile y el proveedor
**Como** REVIEWER **quiero** enviar mensajes de soporte o asistencia técnica a un proveedor **para** acompañarlo sin depender del teléfono.
- R3 · S9 · 5 pts · FE+BE
- Trazabilidad: RF-NOT-001 · CU-18 · SPEC-SOT §1.3
```gherkin
Escenario: enviar
  Cuando envío "Recuerde subir el certificado ICA antes del 30/11" tipo "recordatorio"
  Entonces el proveedor lo ve en /app/mensajes tras el siguiente pull

Escenario: límite
  Cuando escribo 501 caracteres
  Entonces veo "Máximo 500 caracteres"

Escenario: respuesta offline
  Cuando el proveedor responde sin conexión
  Entonces la respuesta se encola en P2 y llega al back-office al sincronizar
```

### HU-NOT-03 · Alertas internas
**Como** REVIEWER **quiero** recibir alertas de riesgos críticos, documentos por vencer y solicitudes de privacidad **para** actuar a tiempo.
- R3 · S9 · 3 pts · FE+BE
- Trazabilidad: RF-NOT-004, RF-ASM-007 · CU-20 · SPEC-SOT D2 §4.1
```gherkin
Escenario: riesgo crítico
  Cuando llega un CriticalRiskDetected por trabajo infantil
  Entonces aparece en /smile con prioridad alta y enlace al expediente

Escenario: documento por vencer
  Dado un documento que vence en 30 días
  Entonces la tarea diaria crea una alerta "ICA de Finca La Esperanza vence el 14/11/2026"
```

### HU-RPT-01 · Visor de riesgo y Pareto
**Como** REVIEWER **quiero** una matriz de proveedores por score y volumen con el Pareto 80/20 **para** enfocar el acompañamiento.
- R3 · S9 · 5 pts · FE+BE
- Trazabilidad: RF-RPT-001, RF-RPT-006 · CU-20 · SPEC-DASH (Smile)
```gherkin
Escenario: matriz
  Entonces veo un punto por proveedor (x = score, y = volumen recibido), coloreado por etapa (GUIA_VISUAL §3.4) y los 56 estratégicos resaltados

Escenario: filtros
  Cuando filtro por categoría "Fruver", etapa "E3" y municipio "Fusagasugá"
  Entonces la matriz y los conteos se actualizan

Escenario: soberanía
  Entonces los datos vienen de proyecciones de reporting sin filas ERP individuales
```

### HU-RPT-02 · Funnel de maduración
**Como** REVIEWER **quiero** ver cuántos proveedores hay en cada etapa y la conversión **para** medir el avance de la Academia.
- R3 · S9 · 3 pts · FE+BE
- Trazabilidad: RF-RPT-002 · CU-20 · SPEC-SOT §1.1
```gherkin
Escenario: conversión
  Dado 450 en E1, 300 en E2, 280 en E3
  Entonces la conversión E1→E2 es 66,7 % y E2→E3 93,3 %, filtrable por ciclo
```

### HU-RPT-03 · Calidad: merma y carencia
**Como** REVIEWER **quiero** ver la tasa de merma recibida frente a la meta y el % de lotes con carencia verificada **para** medir el impacto en calidad.
- R3 · S9 · 3 pts · FE+BE
- Trazabilidad: RF-RPT-003, RF-RPT-006 · CU-20 · SPEC-DASH, C-11
```gherkin
Escenario: meta
  Entonces la gráfica muestra la tasa mensual con línea de meta 8 % y línea base 22 %

Escenario: carencia
  Entonces muestra el % de entregas con rótulo válido del período
```

---

## 7. R4 · Micro-learning y reconocimientos (S10–S11)

> Las historias HU-IAM-06, HU-IAM-07, HU-SUP-05, HU-REC-02 e HU-IMP-06 son *Should* de R3 desplazadas a R4 por capacidad (ver §11).

### HU-IAM-06 · Recuperar mi contraseña
**Como** PROVEEDOR **quiero** recuperar mi contraseña por correo o con ayuda de un técnico de Smile **para** no perder el acceso.
- R4 (Should de R3) · S10 · 3 pts · FE+BE
- Trazabilidad: RF-IAM-007 · CU-02
```gherkin
Escenario: por correo
  Cuando solicito recuperación con mi correo
  Entonces recibo un enlace de un uso válido 30 minutos

Escenario: solo celular
  Dado una cuenta sin correo
  Cuando un REVIEWER genera un código temporal
  Entonces el código sirve una sola vez durante 24 horas

Escenario: enumeración
  Cuando pido recuperación para un correo inexistente
  Entonces veo el mismo mensaje que para uno existente
```

### HU-IAM-07 · Registro asistido en campo
**Como** REVIEWER **quiero** registrar a un productor en su nombre durante una visita **para** incluir a quien no maneja bien el celular.
- R4 (Should de R3) · S10 · 3 pts · FE+BE
- Trazabilidad: RF-IAM-008 · CU-01 · DOC-FRUVER §6
```gherkin
Escenario: registro asistido
  Cuando registro a "José Gómez" con su celular
  Entonces la cuenta guarda assisted_by = mi usuario

Escenario: consentimiento propio
  Cuando José ingresa por primera vez
  Entonces él mismo debe aceptar el consentimiento antes de cualquier captura
```

### HU-SUP-05 · Estado y verificación de documentos
**Como** REVIEWER **quiero** ver qué documentos están vigentes, por vencer o vencidos y verificarlos **para** mantener el expediente confiable.
- R4 (Should de R3) · S10 · 3 pts · FE+BE
- Trazabilidad: RF-SUP-006 · CU-16 · SPEC-SOT §1.3
```gherkin
Escenario: estados
  Dado hoy 15/10/2026
  Entonces un documento que vence el 01/11/2026 está POR_VENCER y uno del 01/10/2026 está VENCIDO

Escenario: verificar
  Cuando marco un certificado BPA como VERIFICADO
  Entonces se emite CertificationVerified (usado por E5, C-10)

Escenario: rechazar
  Cuando lo marco RECHAZADO sin motivo
  Entonces veo "Escriba el motivo"
```

### HU-REC-02 · Importar recepciones desde CSV
**Como** REVIEWER **quiero** cargar recepciones en lote desde un CSV **para** no digitar cada entrega.
- R4 (Should de R3) · S10 · 3 pts · FE+BE
- Trazabilidad: RF-REC-002 · CU-15 · Q-06
```gherkin
Escenario: importación parcial
  Dado un CSV con 100 filas y 3 con NIT inexistente
  Entonces se importan 97 y descargo un reporte con las 3 filas, su número de línea y el error

Escenario: plantilla
  Entonces puedo descargar la plantilla con encabezados exactos desde /smile/recepciones
```

### HU-IMP-06 · Validar o reabrir metas
**Como** REVIEWER **quiero** validar o reabrir la meta de un proveedor con un comentario **para** acompañar su avance real.
- R4 (Should de R3) · S10 · 2 pts · FE+BE
- Trazabilidad: RF-IMP-005 · CU-16 · DOC-MATRIZ §16
```gherkin
Escenario: reabrir
  Cuando reabro una meta con "La foto no muestra la franja protectora"
  Entonces el proveedor ve el comentario y la meta vuelve a "En progreso" tras el pull (gana el servidor, RF-SYN-005)
```

### HU-LRN-01 · Cargar contenidos de micro-learning
**Como** ADMIN **quiero** subir clips y fichas por eje, categoría y path con validación **para** garantizar que sean livianos.
- R4 · S10 · 3 pts · FE+BE
- Trazabilidad: RF-LRN-001, RF-LRN-005 · CU-31 · SPEC-SOT §4.1
```gherkin
Escenario: clip válido
  Cuando subo un MP4 H.264 de 95 s y 3,2 MB
  Entonces se publica

Escenario: clip inválido
  Cuando subo un clip de 150 s o de 6 MB o en H.265
  Entonces se rechaza indicando el motivo exacto
```

### HU-LRN-02 · Asignación automática de contenidos
**Como** PROVEEDOR **quiero** recibir los clips relacionados con mis metas **para** aprender justo lo que necesito.
- R4 · S10 · 3 pts · BE
- Trazabilidad: RF-LRN-002 · CU-25 · SPEC-BASE §6.3
```gherkin
Escenario: por meta
  Dado un plan con meta de Residuos
  Entonces se asignan los clips del eje Residuos para Fruver y path Rural Simplificado
```

### HU-LRN-03 · Descarga de clips en segundo plano
**Como** PROVEEDOR **quiero** que los clips se descarguen cuando haya señal **para** verlos luego en la finca.
- R4 · S10 · 5 pts · FE
- Trazabilidad: RF-LRN-003, RF-SYN-003 · CU-25 · SPEC-SOT §5.2
```gherkin
Escenario: solo Wi-Fi
  Dado "Descargar solo con Wi-Fi" activo y conexión móvil
  Entonces no se descargan clips

Escenario: prioridad
  Entonces las descargas P3 empiezan solo cuando no hay pendientes P1 ni P2
```

### HU-LRN-04 · Ver clips sin conexión
**Como** PROVEEDOR **quiero** ver los clips descargados sin internet **para** aprender en cualquier momento.
- R4 · S11 · 3 pts · FE
- Trazabilidad: RF-LRN-004 · CU-25 · SPEC-BASE §8.1, S-15
```gherkin
Escenario: completado
  Dado un clip de 100 s descargado
  Cuando lo reproduzco sin conexión hasta el segundo 90
  Entonces queda "Completado" y se encola en P2 (ContentCompleted al sincronizar)
```

### HU-GAM-01 · Flores
**Como** PROVEEDOR **quiero** recibir Flores por mi buen desempeño **para** que Smile reconozca mi esfuerzo.
- R4 · S11 · 5 pts · FE+BE
- Trazabilidad: RF-GAM-001 · CU-26 · SPEC-SOT §1.4, C-05, S-14
```gherkin
Escenario: merma 3 meses
  Dado merma recibida < 5 % en agosto, septiembre y octubre
  Entonces recibo una Flor automática con motivo "Merma menor al 5 % durante 3 meses"

Escenario: constancia
  Dado 12 semanas consecutivas con registro ERP
  Entonces recibo una Flor

Escenario: manual
  Cuando un REVIEWER retira una Flor sin motivo
  Entonces veo "Escriba el motivo" y la acción queda auditada al completarse
```

### HU-GAM-02 · Caritas Felices
**Como** PROVEEDOR **quiero** recibir reconocimientos visuales cuando soy constante **para** sentir que mi trabajo cuenta.
- R4 · S11 · 5 pts · FE+BE
- Trazabilidad: RF-GAM-002 · CU-26 · SPEC-SOT §1.4, SPEC-BASE §3.4, S-14
```gherkin
Escenario: disparadores
  Entonces recibo una Carita por: 4 semanas seguidas con registro, merma < 5 % en un mes, plan del ciclo al 100 %, documento cargado antes de vencer, checklist de compostaje completo

Escenario: tono
  Entonces el mensaje es breve y sin exageraciones (p. ej. "4 semanas registrando sin falta")
```

### HU-GAM-03 · Insignia Maestro BPA / Pesca Responsable
**Como** PROVEEDOR **quiero** obtener la insignia Maestro al completar mi módulo **para** acceder a beneficios.
- R4 · S11 · 3 pts · BE
- Trazabilidad: RF-GAM-003 · CU-26 · SPEC-SOT §4.2
```gherkin
Escenario: otorgamiento
  Dado que completé 100 % de clips y autoevaluaciones del módulo Fruver
  Entonces recibo "Maestro BPA"
```

### HU-GAM-04 · Elegibilidad al incentivo +4 %
**Como** REVIEWER de Compras **quiero** la lista de proveedores elegibles al +4 % **para** aplicarlo en las órdenes de compra.
- R4 · S11 · 3 pts · FE+BE
- Trazabilidad: RF-GAM-004 · CU-27 · SPEC-SOT §4.2, Q-01
```gherkin
Escenario: regla por defecto (Q-01)
  Dado un proveedor en etapa ≥ 5 con Maestro BPA activa
  Entonces es elegible y lo ve en /app/beneficios

Escenario: exportable
  Cuando exporto la lista
  Entonces obtengo un XLSX con NIT, nombre, etapa y fecha de elegibilidad
  Y el sistema no liquida pagos
```

### HU-GAM-05 · Hoja de ruta de beneficios y contador de Flores
**Como** PROVEEDOR **quiero** ver qué beneficios tengo y qué me falta **para** saber hacia dónde avanzar.
- R4 · S11 · 3 pts · FE
- Trazabilidad: RF-GAM-005, RF-GAM-006 · CU-27 · SPEC-BASE §6.2, SPEC-DASH (proveedor)
```gherkin
Escenario: beneficios
  Entonces veo prioridad de compra, +4 % y becas La Academia/EUDE con estado bloqueado/desbloqueado y la condición faltante

Escenario: inicio
  Entonces el inicio muestra mi contador de Flores e insignias activas
```

### HU-ASM-07 · Recordatorios de autoevaluación
**Como** PROVEEDOR **quiero** recordatorios antes del cierre del ciclo **para** no perder mi diagnóstico.
- R4 · S11 · 2 pts · BE
- Trazabilidad: RF-ASM-012 · CU-05
```gherkin
Escenario: 14 y 3 días
  Dado que no he enviado la autoevaluación de C3-2026
  Entonces recibo un mensaje en bandeja el 17/12 y el 28/12/2026
```

### HU-ASM-08 · Cercanía a otras certificaciones
**Como** PROVEEDOR estratégico **quiero** ver qué tan cerca estoy de B Corp, GlobalG.A.P. e ISO 14001 **para** planear certificaciones.
- R4 · S11 · 2 pts · FE+BE
- Trazabilidad: RF-ASM-009 · CU-06 · SPEC-DASH (proveedor)
```gherkin
Escenario: B Corp
  Entonces veo "82 % para el estándar B Corp" calculado con las preguntas mapeadas a B Corp
```

### HU-RPT-04 · Consola ESG
**Como** ADMIN **quiero** el tablero ESG consolidado **para** reportar a la dirección.
- R4 · S11 · 5 pts · FE+BE
- Trazabilidad: RF-RPT-004 · CU-20 · SPEC-DASH (Smile)
```gherkin
Escenario: indicadores
  Entonces veo % de proveedores evaluados sin alerta de trabajo infantil, % trazabilidad y cumplimiento por marco (B Corp, ISO 14001, GRI, TCFD/SASB, ODS)
```

### HU-NOT-04 · Notificaciones push
**Como** PROVEEDOR **quiero** recibir avisos push opcionales **para** enterarme de reconocimientos y alertas.
- R4 · S11 · 3 pts · FE+BE
- Trazabilidad: RF-NOT-003 · CU-26
```gherkin
Escenario: consentimiento
  Entonces solo se pide permiso de notificaciones después de un primer reconocimiento y con un botón explícito
```

---

## 8. R5 · Impacto, reportes y categorías (S12–S14)

### HU-CAL-03 · Huella por tonelada cosechada
**Como** PROVEEDOR **quiero** ver mi huella por tonelada **para** compararme con otros ciclos.
- R5 · S12 · 3 pts · FE+BE
- Trazabilidad: RF-CAL-002 · CU-28 · SPEC-SOT §1.5
```gherkin
Escenario: por tonelada
  Dado 182,9 kg CO₂e y 2.000 kg de entradas en el ciclo
  Entonces veo 91,45 kg CO₂e/t
```

### HU-CAL-04 · Calculadora de ROI
**Como** PROVEEDOR **quiero** ver cuánto he ganado o ahorrado gracias a las buenas prácticas **para** confirmar que vale la pena.
- R5 · S12 · 5 pts · FE+BE
- Trazabilidad: RF-CAL-003 · CU-28 · SPEC-SOT §2.3, SPEC-DASH (proveedor)
```gherkin
Escenario: fórmula
  Dado ahorro 300.000, mermas evitadas 500.000, bonificación 200.000 e inversión BPA 400.000
  Entonces ROI = ((300.000 + 500.000 + 200.000) − 400.000) / 400.000 × 100 = 150 %
  Y veo cada término con su origen y la fecha de los parámetros

Escenario: sin inversión
  Dado inversión BPA = 0
  Entonces veo "Registre sus inversiones en buenas prácticas para calcular el retorno" en lugar de un valor
```

### HU-CAL-05 · Calculadora de SROI
**Como** ADMIN **quiero** el SROI con parámetros de monetización **para** reportar el retorno social y ambiental.
- R5 · S12 · 5 pts · BE
- Trazabilidad: RF-CAL-004 · CU-28 · SPEC-BASE §4.3, Q-02
```gherkin
Escenario: fórmula
  Dado social 6.000.000, ambiental 2.000.000 e inversión 4.000.000
  Entonces SROI = 2,0

Escenario: parámetros faltantes
  Dado que Q-02 no tiene valores publicados
  Entonces el cálculo muestra "Parámetros pendientes" y no un número
```

### HU-RPT-05 · Motor de exportación y reporte de huella
**Como** REVIEWER **quiero** exportar en 1 clic el reporte de huella de carbono consolidado en PDF y XLSX **para** presentarlo a la CCB.
- R5 · S12 · 8 pts · BE+FE
- Trazabilidad: RF-RPT-005, RF-RPT-006, RNF-PERF-005 · CU-29 · SPEC-SOT §1.5, Q-05
```gherkin
Escenario: asíncrono
  Cuando solicito el reporte de huella para 450 proveedores
  Entonces recibo un id de trabajo y el archivo está listo en menos de 30 s para descarga con URL firmada

Escenario: contenido
  Entonces incluye kg CO₂e/t por categoría y total, metodología y versión de factores
```

### HU-RPT-06 · Matriz de DDHH y trabajo infantil
**Como** ADMIN **quiero** exportar la matriz de debida diligencia **para** demostrar cero tolerancia al trabajo infantil.
- R5 · S13 · 3 pts · BE
- Trazabilidad: RF-RPT-005 · CU-29 · SPEC-SOT §1.5, SPEC-SOT D2 §4.1
```gherkin
Escenario: matriz
  Entonces por proveedor muestra estado del eje infantil, alertas críticas y acciones de seguimiento, en PDF y XLSX
```

### HU-RPT-07 · Informe de retorno social y ambiental
**Como** ADMIN **quiero** el balance de valor compartido **para** presentaciones de sostenibilidad corporativa.
- R5 · S13 · 5 pts · BE
- Trazabilidad: RF-RPT-005, RF-RPT-006 · CU-29 · SPEC-BASE §3.5
```gherkin
Escenario: agregados
  Entonces incluye ahorros agregados de la red, mermas evitadas, SROI y beneficios otorgados, sin datos financieros individuales
```

### HU-PRV-06 · Descargar mis datos y pedir su supresión
**Como** PROVEEDOR **quiero** descargar mis datos y pedir que se borren **para** ejercer mis derechos.
- R5 · S13 · 5 pts · FE+BE
- Trazabilidad: RF-PRV-006 · CU-30 · Ley 1581 art. 8
```gherkin
Escenario: descarga
  Cuando solicito mis datos
  Entonces recibo un JSON y un PDF con ficha, autoevaluaciones, Mini ERP y consentimientos

Escenario: trámite
  Entonces el ADMIN gestiona la solicitud con estados RECIBIDA → EN_TRÁMITE → RESUELTA
```

### HU-CAT-05 · Activar categorías distintas de Fruver
**Como** ADMIN **quiero** cargar bancos y guías de Lácteos, Carnes, Pescados y Mariscos e Insumos y Servicios **para** ampliar la Academia a toda la red.
- R5 · S14 · 8 pts · FE+BE
- Trazabilidad: RF-CAT-001, RF-CAT-002, RF-ASM-001 · CU-22 · SPEC-SOT §3.1, DOC-MATRIZ §3–§9, Q-04
```gherkin
Escenario: activación
  Dado un banco publicado para Lácteos con ≥ 25 preguntas y ejes definidos
  Cuando cambio Lácteos a ACTIVA
  Entonces los proveedores de Lácteos pueden componer su autoevaluación

Escenario: sin banco
  Cuando intento activar una categoría sin banco publicado
  Entonces veo "Publique el banco de preguntas antes de activar la categoría"
```

### HU-PLAT-09 · Cifrado de columnas sensibles en la base de datos
**Como** ADMIN **quiero** que los datos sensibles estén cifrados en reposo **para** reducir el impacto de una filtración.
- R5 · S14 · 3 pts · BE
- Trazabilidad: RNF-SEC-008 · CU-16 · SPEC-DASH §1.2
```gherkin
Escenario: cifrado
  Entonces las columnas de caracterización diversa y firmas se guardan cifradas y no son legibles con un SELECT directo
```

---

## 9. R6 · Endurecimiento y despliegue (S15–S16)

### HU-PLAT-10 · Presupuesto de rendimiento en CI
**Como** equipo de desarrollo **quiero** que el CI falle si la PWA pesa demasiado o carga lento **para** cumplir el spec en redes 3G.
- R6 · S15 · 5 pts · INFRA
- Trazabilidad: RNF-PERF-001, RNF-PERF-002 · SPEC-BASE §8.1
```gherkin
Escenario: bundle
  Cuando el JS+CSS inicial de /app supera 2,0 MB comprimido o 350 KB de JS en la ruta de inicio
  Entonces el job "perf-budget" falla

Escenario: FCP
  Entonces Lighthouse CI móvil con 3G mide FCP < 1,8 s en /app
```

### HU-PLAT-11 · Prueba de carga de la API
**Como** equipo de desarrollo **quiero** medir la API con datos de 450 proveedores y 2 años **para** asegurar tiempos de respuesta.
- R6 · S15 · 3 pts · BE
- Trazabilidad: RNF-PERF-004, RNF-PERF-003
```gherkin
Escenario: p95
  Entonces los endpoints transaccionales tienen p95 < 300 ms y sync/push de 100 registros < 2 s
```

### HU-PLAT-12 · Pruebas de caos offline
**Como** equipo de desarrollo **quiero** simular cortes de red, cierres y reinicios durante la sincronización **para** garantizar cero pérdida de datos.
- R6 · S15 · 5 pts · FE
- Trazabilidad: RNF-OFF-001, RNF-OFF-003 · CU-14
```gherkin
Escenario: corte en push
  Dado 50 registros pendientes
  Cuando la red cae a mitad del push 20 veces aleatorias
  Entonces al final el servidor tiene exactamente 50 registros

Escenario: flujos offline
  Entonces existe un e2e offline para Mini ERP, trazabilidad, autoevaluación, plan, ficha y clips
```

### HU-PLAT-13 · Matriz de compatibilidad
**Como** equipo de desarrollo **quiero** e2e en los navegadores objetivo **para** que funcione en los teléfonos reales de los productores.
- R6 · S15 · 3 pts · FE
- Trazabilidad: RNF-COMP-001
```gherkin
Escenario: matriz
  Entonces los e2e corren en Chrome Android (emulado 360 px), WebKit (Safari iOS 16) y escritorio 1280 px
```

### HU-PLAT-14 · Endurecimiento de seguridad
**Como** ADMIN **quiero** el sistema revisado contra OWASP ASVS nivel 1 con TLS 1.3 **para** proteger los datos de los proveedores.
- R6 · S16 · 5 pts · INFRA+BE
- Trazabilidad: RNF-SEC-001, RNF-SEC-005, RNF-LEG-001
```gherkin
Escenario: cabeceras
  Entonces producción responde con HSTS, CSP, X-Content-Type-Options y Referrer-Policy

Escenario: checklist
  Entonces existe docs/sistema/seguridad-asvs.md con cada control L1 marcado y su evidencia
```

### HU-PLAT-15 · Backups y restauración
**Como** ADMIN **quiero** backups diarios probados **para** recuperar el sistema ante un incidente.
- R6 · S16 · 3 pts · INFRA
- Trazabilidad: RNF-REL-001, RNF-REL-002
```gherkin
Escenario: restauración mensual
  Entonces un job restaura el último backup en un entorno aislado y verifica conteos de tablas clave
```

### HU-PLAT-16 · Despliegue a producción
**Como** ADMIN **quiero** desplegar a la nube con el adaptador de GCS/Firebase **para** operar el piloto real.
- R6 · S16 · 5 pts · INFRA
- Trazabilidad: RNF-POR-002, RNF-REL-001 · ADR-0004, Q-09
```gherkin
Escenario: adaptador
  Dado STORAGE_PROVIDER = gcs
  Entonces la suite de contrato de FileStorage pasa igual que con el adaptador S3

Escenario: despliegue
  Entonces el despliegue usa las mismas imágenes runtime/runner del CI
```

### HU-PLAT-17 · Prueba de usabilidad en campo
**Como** PROVEEDOR rural **quiero** que la app se pruebe con productores como yo **para** que realmente sea fácil.
- R6 · S16 · 5 pts · FE
- Trazabilidad: RNF-USA-003, RNF-USA-004 · CU-09 · SPEC-BASE §9 (mes 3)
```gherkin
Escenario: venta en 60 s
  Dado 5 productores Fruver sin capacitación previa
  Entonces al menos 4 registran una venta en menos de 60 s

Escenario: copys
  Entonces todos los textos pasan el checklist de tono de SPEC-SOT D2 §3 y los hallazgos quedan como historias nuevas
```

### HU-DS-05 · Auditoría de accesibilidad y uso táctil
**Como** PROVEEDOR **quiero** que todas las pantallas sean legibles al sol y fáciles de tocar **para** usar la app sin frustración.
- R6 · S16 · 3 pts · FE
- Trazabilidad: RNF-ACC-001, RNF-USA-001, RNF-USA-002, RNF-USA-005
```gherkin
Escenario: auditoría completa
  Entonces axe no reporta violaciones serious/critical en ninguna ruta /app ni /smile
  Y ningún elemento interactivo mide menos de 48 × 48 px
  Y toda opción de navegación tiene ícono y texto
```

---

## 10. Resumen por release y sprint

| Release | Sprint | Historias | Puntos |
|---|---|---|---|
| R0 | S0 | PLAT-01, PLAT-02, PLAT-03, PLAT-04, PLAT-05, PLAT-06, DS-01, DS-02, DS-04 | 34 |
| R1 | S1 | DS-03, IAM-01, IAM-02, IAM-03, PRV-01, SYN-01, CAT-01, NOT-01, CAL-02 | 33 |
| R1 | S2 | SYN-02, SYN-03, SYN-04, IAM-04, PRV-02, SUP-01, SUP-02, CAL-01, ASM-01 | 36 |
| R1 | S3 | ASM-02, ASM-03, ASM-04, ASM-05, IMP-01, IMP-02, IMP-03, IMP-04 | 34 |
| R2 | S4 | SYN-05, CAT-02, ERP-10, ERP-01, ERP-02, ERP-03, ERP-04 | 29 |
| R2 | S5 | ERP-05, ERP-06, ERP-07, ERP-08, ERP-09, CAT-03, TRZ-01, TRZ-02 | 28 |
| R2 | S6 | TRZ-03, TRZ-04, TRZ-05, TRZ-06, PRV-03, PRV-04, IMP-05 | 24 |
| R3 | S7 | PLAT-08, PLAT-07, IAM-05, PRV-05, SUP-03, SUP-04 | 21 |
| R3 | S8 | SUP-06, SUP-07, SUP-08, CAT-04, ASM-06, IMP-07, REC-01 | 30 |
| R3 | S9 | REC-03, REC-04, SCO-01, SCO-02, SCO-03, SCO-04, SCO-05, NOT-02, NOT-03, RPT-01, RPT-02, RPT-03 | 42 |
| R4 | S10 | IAM-06, IAM-07, SUP-05, REC-02, IMP-06, LRN-01, LRN-02, LRN-03 | 25 |
| R4 | S11 | LRN-04, GAM-01, GAM-02, GAM-03, GAM-04, GAM-05, ASM-07, ASM-08, RPT-04, NOT-04 | 34 |
| R5 | S12 | CAL-03, CAL-04, CAL-05, RPT-05 | 21 |
| R5 | S13 | RPT-06, RPT-07, PRV-06 | 13 |
| R5 | S14 | CAT-05, PLAT-09 | 11 |
| R6 | S15 | PLAT-10, PLAT-11, PLAT-12, PLAT-13 | 16 |
| R6 | S16 | PLAT-14, PLAT-15, PLAT-16, PLAT-17, DS-05 | 21 |

| Release | Puntos | Sprints | Promedio |
|---|---|---|---|
| R0 | 34 | 1 | 34 |
| R1 | 103 | 3 | 34,3 |
| R2 | 81 | 3 | 27 |
| R3 | 93 | 3 | 31 |
| R4 | 59 | 2 | 29,5 |
| R5 | 45 | 3 | 15 |
| R6 | 37 | 2 | 18,5 |
| **Total** | **452** | **17** | **26,6** |

**Notas de capacidad:**
- S2 (36) y S9 (42) superan el objetivo. Para S9 se recomienda mover HU-RPT-02 y HU-RPT-03 (6 pts) a S10 si la velocidad real de S7–S8 es < 35; el orden dentro de S9 es REC-03 → SCO-01 → SCO-02 → resto.
- S7 (21) queda bajo a propósito: el worker de outbox (HU-PLAT-08) es habilitador de todo R3.
- R5 y R6 tienen capacidad libre (~40 pts) reservada para: respuestas a Q-01…Q-09, correcciones de las pruebas de campo, deuda técnica y ajustes del piloto.

---

## 11. Matriz de cobertura RF → HU

| RF | Historias |
|---|---|
| RF-IAM-001 | HU-IAM-01 |
| RF-IAM-002 | HU-IAM-02 |
| RF-IAM-003 | HU-IAM-04 |
| RF-IAM-004 | HU-IAM-01, HU-IAM-03 |
| RF-IAM-005 | HU-IAM-05 |
| RF-IAM-006 | HU-IAM-02 |
| RF-IAM-007 | HU-IAM-06 |
| RF-IAM-008 | HU-IAM-07 |
| RF-IAM-009 | HU-IAM-04 |
| RF-PRV-001 | HU-PRV-01 |
| RF-PRV-002 | HU-PRV-02 |
| RF-PRV-003 | HU-PRV-01 |
| RF-PRV-004 | HU-ASM-03 |
| RF-PRV-005 | HU-PRV-05 |
| RF-PRV-006 | HU-PRV-06 |
| RF-PRV-007 | HU-PRV-03, HU-SUP-08 |
| RF-PRV-008 | HU-PRV-04 |
| RF-SUP-001 | HU-SUP-01 |
| RF-SUP-002 | HU-SUP-02 |
| RF-SUP-003 | HU-SUP-01 |
| RF-SUP-004 | HU-SUP-03 |
| RF-SUP-005 | HU-SUP-04 |
| RF-SUP-006 | HU-SUP-05 |
| RF-SUP-007 | HU-SUP-06 |
| RF-SUP-008 | HU-SUP-07 |
| RF-SUP-009 | HU-SUP-08 |
| RF-CAT-001 | HU-CAT-01, HU-CAT-05 |
| RF-CAT-002 | HU-CAT-01, HU-CAT-05 |
| RF-CAT-003 | HU-CAT-02, HU-ERP-07 |
| RF-CAT-004 | HU-CAT-04 |
| RF-CAT-005 | HU-CAT-03 |
| RF-ASM-001 | HU-ASM-02, HU-CAT-05 |
| RF-ASM-002 | HU-ASM-01, HU-ASM-06 |
| RF-ASM-003 | HU-ASM-03 |
| RF-ASM-004 | HU-ASM-02 |
| RF-ASM-005 | HU-ASM-04 |
| RF-ASM-006 | HU-ASM-04 |
| RF-ASM-007 | HU-ASM-04, HU-ASM-05, HU-NOT-03 |
| RF-ASM-008 | HU-ASM-04 |
| RF-ASM-009 | HU-ASM-05, HU-ASM-08 |
| RF-ASM-010 | HU-ASM-03 |
| RF-ASM-011 | HU-ASM-06 |
| RF-ASM-012 | HU-ASM-07 |
| RF-ASM-013 | HU-ASM-05 |
| RF-IMP-001 | HU-IMP-01 |
| RF-IMP-002 | HU-IMP-01 |
| RF-IMP-003 | HU-IMP-02 |
| RF-IMP-004 | HU-IMP-03, HU-IMP-05 |
| RF-IMP-005 | HU-IMP-06 |
| RF-IMP-006 | HU-IMP-07 |
| RF-IMP-007 | HU-IMP-04 |
| RF-ERP-001 | HU-ERP-01 |
| RF-ERP-002 | HU-ERP-02 |
| RF-ERP-003 | HU-ERP-03 |
| RF-ERP-004 | HU-ERP-03 |
| RF-ERP-005 | HU-ERP-05 |
| RF-ERP-006 | HU-ERP-04 |
| RF-ERP-007 | HU-ERP-06 |
| RF-ERP-008 | HU-ERP-07 |
| RF-ERP-009 | HU-ERP-08 |
| RF-ERP-010 | HU-ERP-05 |
| RF-ERP-011 | HU-ERP-09 |
| RF-ERP-012 | HU-ERP-01, HU-ERP-02, HU-ERP-10 |
| RF-TRZ-001 | HU-TRZ-01 |
| RF-TRZ-002 | HU-TRZ-02 |
| RF-TRZ-003 | HU-TRZ-03 |
| RF-TRZ-004 | HU-TRZ-04 |
| RF-TRZ-005 | HU-TRZ-03 |
| RF-TRZ-006 | HU-TRZ-05 |
| RF-TRZ-007 | HU-TRZ-06 |
| RF-REC-001 | HU-REC-01 |
| RF-REC-002 | HU-REC-02 |
| RF-REC-003 | HU-REC-03 |
| RF-REC-004 | HU-REC-04 |
| RF-REC-005 | HU-REC-01 |
| RF-SCO-001 | HU-SCO-01, HU-PLAT-08 |
| RF-SCO-002 | HU-SCO-01 |
| RF-SCO-003 | HU-SCO-02, HU-SCO-04 |
| RF-SCO-004 | HU-SCO-03 |
| RF-SCO-005 | HU-SCO-04 |
| RF-SCO-006 | HU-SCO-05 |
| RF-GAM-001 | HU-GAM-01 |
| RF-GAM-002 | HU-GAM-02 |
| RF-GAM-003 | HU-GAM-03 |
| RF-GAM-004 | HU-GAM-04 |
| RF-GAM-005 | HU-GAM-05 |
| RF-GAM-006 | HU-GAM-05 |
| RF-LRN-001 | HU-LRN-01 |
| RF-LRN-002 | HU-LRN-02 |
| RF-LRN-003 | HU-LRN-03 |
| RF-LRN-004 | HU-LRN-04 |
| RF-LRN-005 | HU-LRN-01 |
| RF-CAL-001 | HU-CAL-01 |
| RF-CAL-002 | HU-CAL-03 |
| RF-CAL-003 | HU-CAL-04 |
| RF-CAL-004 | HU-CAL-05 |
| RF-CAL-005 | HU-CAL-02 |
| RF-RPT-001 | HU-RPT-01 |
| RF-RPT-002 | HU-RPT-02 |
| RF-RPT-003 | HU-RPT-03 |
| RF-RPT-004 | HU-RPT-04 |
| RF-RPT-005 | HU-RPT-05, HU-RPT-06, HU-RPT-07 |
| RF-RPT-006 | HU-PRV-03, HU-RPT-01, HU-RPT-03, HU-RPT-05, HU-RPT-07 |
| RF-NOT-001 | HU-NOT-02 |
| RF-NOT-002 | HU-NOT-01 |
| RF-NOT-003 | HU-NOT-04 |
| RF-NOT-004 | HU-NOT-03 |
| RF-SYN-001 | HU-SYN-01, HU-PLAT-03 |
| RF-SYN-002 | HU-SYN-02 |
| RF-SYN-003 | HU-SYN-05, HU-IMP-05, HU-LRN-03 |
| RF-SYN-004 | HU-SYN-03 |
| RF-SYN-005 | HU-SYN-04 |
| RF-SYN-006 | HU-SYN-03 |
| RF-SYN-007 | HU-SYN-05 |
| RF-SYN-008 | HU-SYN-02 |

**RF sin historia: 0.** RNF con trabajo explícito cubiertos por HU-PLAT-*, HU-DS-* y criterios de las historias de negocio; el resto se garantiza con la Definición de Done (§1.3).
