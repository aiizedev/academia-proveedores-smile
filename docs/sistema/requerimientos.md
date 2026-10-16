# Especificación de Requerimientos de Software (SRS)

**Sistema:** Academia de Proveedores Grupo Smile — Plataforma CRM & Mini ERP Sostenible
**Norma:** estructura ISO/IEC/IEEE 29148:2018 (sucesora de IEEE 830)
**Versión:** 1.0 · 15 de octubre de 2026
**Fuente de verdad:** [`docs/specs/`](../specs/README.md). Todo requerimiento cita su origen; los que nacen de un supuesto citan `S-xx` de [`conflictos-y-supuestos.md`](conflictos-y-supuestos.md).

---

## 1. Introducción

### 1.1 Propósito
Definir de forma verificable qué debe hacer el sistema y con qué calidad, para que los planes de [`frontend`](../planes/PLAN_FRONTEND.md), [`backend`](../planes/PLAN_BACKEND.md) e [`infraestructura`](../planes/PLAN_INFRA.md) se ejecuten contra requerimientos trazables.

### 1.2 Alcance
Plataforma para los 450 proveedores de Grupo Smile [SPEC-BASE §1.2] compuesta por:
1. **PWA del proveedor** (local-first, offline): registro, consentimiento, autoevaluación cuatrimestral, diagnóstico, plan de mejora, Mini ERP, trazabilidad y rotulación ICA, micro-learning, reconocimientos.
2. **Back-office CRM** para Smile: expediente digital, recepciones, funnel de 6 etapas, scoring 50/30/20, reconocimientos, dashboards y reportes.
3. **API** FastAPI como monolito modular hexagonal, con PostgreSQL/TimescaleDB y almacenamiento de objetos.

Fuera de alcance v1: integraciones con unidades de negocio ajenas a Smile [SPEC-BASE §1.3]; liquidación o pago del incentivo (el sistema solo calcula elegibilidad); motor de IA (C-15); app nativa.

### 1.3 Definiciones

| Término | Definición |
|---|---|
| Proveedor | Persona natural o jurídica que suministra a Grupo Smile. Rol `PROVEEDOR` ("cliente" en SPEC-SOT). |
| Reviewer | Usuario interno de Smile (Compras, Calidad, Sostenibilidad, auditor) con gestiones básicas. Rol `REVIEWER`. |
| Admin | Usuario interno con gestiones de configuración y decisiones de alto impacto. Rol `ADMIN`. |
| Ciclo | Período cuatrimestral de evaluación: C1 ene–abr, C2 may–ago, C3 sep–dic (C-02). |
| Eje | Dimensión del Pilar 1. Para Fruver: BPA, Residuos, Carbono, Trabajo infantil, DDHH/SST [DOC-FRUVER §2]. |
| Pilar | Componente del score total: P1 ESG (50 %), P2 Desempeño operativo (30 %), P3 Fidelización (20 %) [SPEC-SOT §1.2]. |
| Etapa | Fase del funnel E1–E6 [SPEC-SOT §1.1]. |
| Brecha | Eje con nivel Inicial, En desarrollo o marcado Urgente. |
| Período de carencia | Días mínimos entre la última aplicación de agroquímico y la cosecha [DOC-FRUVER Eje 1]. |
| Rótulo | Código de lote liberado con carencia verificada [SPEC-SOT §2.2]. |
| Sync P1/P2/P3 | Prioridades de la cola de sincronización [SPEC-SOT §5.2]. |
| Flor / Carita Feliz | Reconocimiento de alta reputación / refuerzo positivo [SPEC-SOT §1.4]. |

### 1.4 Convenciones
- **ID:** `RF-<MÓDULO>-NNN` (funcional), `RNF-<ATRIBUTO>-NNN` (no funcional). Los IDs no se reutilizan; un requerimiento eliminado queda como `RETIRADO`.
- **Redacción:** "El sistema deberá…" = obligatorio. Cada requerimiento es atómico y verificable.
- **Prioridad (MoSCoW):** **M** Must · **S** Should · **C** Could · **W** Won't (v1).
- **Release:** ver §5. **Verificación:** **T** test automatizado · **D** demostración · **I** inspección · **A** análisis/medición.
- **Módulos** (= módulos del backend, ver [`arquitectura.md`](arquitectura.md) §3):

| Código | Módulo | Paquete backend |
|---|---|---|
| IAM | Identidad, acceso y roles | `iam` |
| PRV | Privacidad y consentimiento | `privacy` |
| SUP | Proveedores y expediente digital | `suppliers` |
| CAT | Catálogos y parámetros | `catalog` |
| ASM | Autoevaluación ESG (cuestionario dinámico) | `assessment` |
| IMP | Plan de mejora y guías | `improvement` |
| ERP | Mini ERP | `erp` |
| TRZ | Trazabilidad, carencia y rotulación ICA | `traceability` |
| REC | Recepciones y desempeño operativo | `receptions` |
| SCO | Scoring y funnel | `scoring` |
| GAM | Reconocimientos e incentivos | `recognition` |
| LRN | Micro-learning | `learning` |
| CAL | Calculadoras de impacto | `impact` |
| RPT | Dashboards y reportes | `reporting` |
| NOT | Notificaciones y canal directo | `notifications` |
| SYN | Sincronización offline | `sync` |

---

## 2. Descripción general

### 2.1 Perspectiva
Monorepo con `frontend/` (Next.js PWA + back-office), `backend/` (FastAPI, monolito modular hexagonal) e `infra/` (Docker Compose, multistage). Arquitectura en [`arquitectura.md`](arquitectura.md).

### 2.2 Clases de usuario

| Rol | Perfil | Dispositivo | Volumen |
|---|---|---|---|
| PROVEEDOR rural (Path Rural Simplificado) | Pequeño productor, baja conectividad y alfabetización digital [SPEC-BASE §1.2] | Android gama baja, 360–412 px, 2G/3G | 394 |
| PROVEEDOR estratégico (Path Corporativo Avanzado) | Procesador o distribuidor con capacidad técnica [SPEC-BASE §6.3] | Móvil o escritorio | 56 |
| REVIEWER | Compras, Calidad, Sostenibilidad, auditores de campo | Escritorio; móvil en visitas | ~10 |
| ADMIN | Dirección de sostenibilidad / TI Smile | Escritorio | 1–3 |

### 2.3 Matriz de permisos

| Capacidad | PROVEEDOR | REVIEWER | ADMIN |
|---|---|---|---|
| Registrarse libremente | ✅ | — | — |
| Ver y editar su ficha, diagnóstico, plan, Mini ERP | ✅ propios | — | — |
| Ver expedientes, scores y etapas | — | ✅ todos | ✅ todos |
| Ver transacciones individuales de ventas/costos | ✅ propias | ❌ solo agregados | ❌ solo agregados |
| Registrar recepciones, visitas, incidentes | — | ✅ | ✅ |
| Verificar documentos | — | ✅ | ✅ |
| Otorgar / retirar Flores | — | ✅ | ✅ |
| Enviar mensajes directos | responder | ✅ | ✅ |
| Validar / reabrir metas del plan | — | ✅ | ✅ |
| Exportar reportes consolidados | — | ✅ | ✅ |
| Marcar segmento Pareto | — | — | ✅ |
| Asignar o retirar Etapa 6, override de etapa | — | — | ✅ |
| Banco de preguntas, guías, contenidos, catálogos, parámetros | — | — | ✅ |
| Crear usuarios internos y cambiar roles | — | — | ✅ |
| Gestionar solicitudes de supresión de datos | — | — | ✅ |

### 2.4 Restricciones
- Stack fijado por [SPEC-BASE encabezado]: Next.js + Tailwind + WatermelonDB; Python ≥ 3.11 + FastAPI + Pydantic; PostgreSQL/TimescaleDB; almacenamiento de objetos (C-07).
- Backend en **arquitectura hexagonal** y **monolito modular** (decisión del equipo, ADR-0001/0002).
- Todo el sistema debe levantarse con Docker Compose usando **builds multistage** (ADR-0003).
- Identidad visual según [`GUIA_VISUAL.md`](../diseno/GUIA_VISUAL.md) v1.1; tono de voz según [SPEC-SOT D2 §3].
- Marco legal colombiano: Ley 1581/2012, Decreto 1377/2013, Res. ICA 30021/2017, Decreto 1072/2015, Ley 1098/2006 [SPEC-BASE §8.2].

### 2.5 Dependencias externas
CDN no permitido en producción para librerías críticas (offline). Mapa base DIVIPOLA (DANE) cargado como catálogo. WhatsApp mediante enlace `wa.me`, sin API.

---

## 3. Requerimientos funcionales

### 3.1 IAM — Identidad, acceso y roles

| ID | Requerimiento | Pri | Fuente | Verificación | Rel |
|---|---|---|---|---|---|
| RF-IAM-001 | El sistema deberá permitir el **registro libre** de un proveedor con nombre, celular colombiano (10 dígitos, inicia en 3) y/o correo (al menos uno) y contraseña de ≥ 8 caracteres, asignando automáticamente el rol `PROVEEDOR`. | M | SPEC-SOT §1 | T: el registro crea usuario con rol PROVEEDOR; enviar `role` en el payload se ignora. | R1 |
| RF-IAM-002 | El sistema deberá autenticar con celular o correo + contraseña y emitir un access token de 15 min y un refresh token rotativo de 30 días. | M | S-13 | T | R1 |
| RF-IAM-003 | La PWA deberá permitir el uso offline de todos los módulos del proveedor con la última sesión válida hasta el vencimiento del refresh token, y al reconectar renovar la sesión sin perder datos locales. | M | SPEC-BASE §2.1, §8.1 | T (e2e con red desactivada 72 h simuladas) | R1 |
| RF-IAM-004 | El sistema deberá autorizar cada operación por rol y por propiedad del recurso según la matriz §2.3. | M | SPEC-SOT §1 | T: suite de autorización por endpoint | R1 |
| RF-IAM-005 | El sistema deberá permitir solo a `ADMIN` crear cuentas `REVIEWER`/`ADMIN`, cambiar roles y desactivar cuentas. | M | SPEC-SOT §1 | T | R3 |
| RF-IAM-006 | El sistema deberá bloquear el inicio de sesión de una cuenta durante 15 min tras 5 intentos fallidos consecutivos. | M | — (buena práctica, ver RNF-SEC-005) | T | R1 |
| RF-IAM-007 | El sistema deberá permitir restablecer la contraseña por correo con enlace de un uso válido 30 min; para cuentas solo con celular, un `REVIEWER` podrá generar un código temporal de un uso válido 24 h. | S | — | T | R3 |
| RF-IAM-008 | El sistema deberá permitir a un `REVIEWER` registrar un proveedor en su nombre (registro asistido en campo), quedando registrado quién lo asistió; el proveedor debe aceptar el consentimiento él mismo en su primer ingreso. | S | DOC-FRUVER §6 (mes 2) | T | R3 |
| RF-IAM-009 | El sistema deberá cerrar sesión y borrar las claves de cifrado locales a petición del usuario, advirtiendo si hay registros pendientes de sincronizar. | M | SPEC-DASH §1.2 | T | R1 |

### 3.2 PRV — Privacidad y consentimiento

| ID | Requerimiento | Pri | Fuente | Verificación | Rel |
|---|---|---|---|---|---|
| RF-PRV-001 | La PWA deberá mostrar, antes de habilitar cualquier captura de datos, la autorización de tratamiento de datos personales con: responsable, finalidades, derechos (conocer, actualizar, rectificar, suprimir, revocar), canal `sostenibilidad@smilebogota.com`, y deberá bloquear la captura hasta la aceptación explícita. | M | SPEC-BASE §8.2, SPEC-DASH §1.2, DOC-AUTOEVAL | T (e2e) | R1 |
| RF-PRV-002 | El sistema deberá solicitar un consentimiento **separado** para datos sensibles (liderazgo y empleo diverso, etnia, víctimas, discapacidad), opcional, y toda pregunta sensible deberá ofrecer "Prefiero no responder", que no afectará el score, la etapa ni el plan. | M | DOC-AUTOEVAL, SPEC-SOT D2 §4.3 | T | R1 |
| RF-PRV-003 | El sistema deberá registrar cada consentimiento de forma inmutable con: usuario, versión y hash SHA-256 del texto, tipo (general/sensible), decisión, fecha-hora del dispositivo y del servidor, y método (casilla o firma). | M | Ley 1581, Dec. 1377 | T, I | R1 |
| RF-PRV-004 | El sistema deberá exigir la **declaración formal de veracidad** (casilla + firma táctil o nombre completo) al enviar cada autoevaluación. | M | DOC-AUTOEVAL, SPEC-BASE §2.3 | T | R1 |
| RF-PRV-005 | El sistema deberá permitir revocar el consentimiento desde el perfil; al revocar, deberá detener la sincronización de datos nuevos, notificar a `ADMIN` y registrar una solicitud de supresión con vencimiento a 15 días hábiles. | M | Ley 1581 art. 15 | T | R3 |
| RF-PRV-006 | El sistema deberá permitir al proveedor descargar sus datos (JSON y PDF) y solicitar supresión; `ADMIN` gestionará la solicitud con estados RECIBIDA/EN_TRÁMITE/RESUELTA. | S | Ley 1581 art. 8 | T | R5 |
| RF-PRV-007 | El sistema **no deberá** exponer a `REVIEWER` ni `ADMIN` transacciones individuales de ventas, costos o inventario; solo indicadores agregados (margen %, % merma, frecuencia de registro, totales por ciclo). | M | SPEC-DASH §1.2, SPEC-SOT D2 §4.3 | T: ningún endpoint interno devuelve filas de `erp_*` | R2 |
| RF-PRV-008 | La PWA deberá cifrar en IndexedDB los campos sensibles (caracterización diversa, valores financieros, firmas) con AES-GCM 256 y clave WebCrypto no exportable por dispositivo. | S | SPEC-DASH §1.2, C-14 | T, I | R2 |

### 3.3 SUP — Proveedores y expediente digital

| ID | Requerimiento | Pri | Fuente | Verificación | Rel |
|---|---|---|---|---|---|
| RF-SUP-001 | El sistema deberá capturar la ficha de identificación: tipo de persona (natural/jurídica), NIT/cédula con **dígito de verificación validado** (módulo 11 DIAN), razón social o nombre, representante legal (jurídica), departamento y municipio (DIVIPOLA), vereda (opcional), coordenadas (opcional), canal de contacto preferido (WhatsApp, llamada, correo) y categoría principal + secundarias. | M | SPEC-SOT §1.1 E1, §1.3 | T | R1 |
| RF-SUP-002 | El sistema deberá capturar la caracterización: tamaño (Micro/unipersonal, Pequeña, Mediana, Grande), origen (nacional con productos nacionales / nacional con importados / filial extranjera), liderazgo de mujeres, liderazgo diverso, empleo diverso y existencia de reporte de sostenibilidad. | M | SPEC-SOT §1.3, DOC-AUTOEVAL §I | T | R1 |
| RF-SUP-003 | El sistema deberá permitir al proveedor editar su ficha offline; los cambios se sincronizarán en P2. | M | SPEC-BASE §2.3 | T | R1 |
| RF-SUP-004 | El sistema deberá permitir a `ADMIN` clasificar a cada proveedor como `ESTRATEGICO` (Path Corporativo Avanzado) o `LOCAL` (Path Rural Simplificado). | M | SPEC-BASE §1.2, §6.3 | T | R3 |
| RF-SUP-005 | El sistema deberá mantener una bóveda documental: carga de PDF/JPG/PNG ≤ 10 MB con tipo (RUT, Cámara de Comercio, ICA, Icontec, ISO 14001, B Corp, GlobalG.A.P., contrato, ficha técnica, acta, otro), fecha de emisión y de vencimiento opcional. | M | SPEC-SOT §1.3 | T | R3 |
| RF-SUP-006 | El sistema deberá calcular el estado de cada documento (VIGENTE, POR_VENCER ≤ 30 días, VENCIDO) y permitir a `REVIEWER` marcarlo VERIFICADO o RECHAZADO con motivo. | S | SPEC-SOT §1.3 | T | R3 |
| RF-SUP-007 | El sistema deberá permitir a `REVIEWER` registrar visitas de campo: fecha, tipo (auditoría, capacitación, seguimiento), aliado (SENA, Asohofrucol, CampoLimpio, RAVC, otro), hallazgos, compromisos (acción, responsable, fecha límite, evidencia de cierre) y acta firmada adjunta. | M | SPEC-SOT §1.3, DOC-MATRIZ §16 | T | R3 |
| RF-SUP-008 | El sistema deberá permitir a `REVIEWER` registrar incidentes de calidad (fecha, entrega o lote, tipo, severidad baja/media/alta, descripción). | M | SPEC-SOT §1.3 | T | R3 |
| RF-SUP-009 | El sistema deberá presentar el **expediente unificado** ("Linktree") en una sola vista con: ficha, caracterización, score y etapa, plan vigente, documentos, visitas, incidentes, reconocimientos, mensajes. | M | SPEC-SOT §1.3, SPEC-BASE §3.3 | D | R3 |

### 3.4 CAT — Catálogos y parámetros

| ID | Requerimiento | Pri | Fuente | Verificación | Rel |
|---|---|---|---|---|---|
| RF-CAT-001 | El sistema deberá mantener las categorías Fruver, Lácteos, Carnes, Pescados y Mariscos, Insumos y Servicios, con estado ACTIVA/PRÓXIMAMENTE; en el piloto solo Fruver estará ACTIVA. | M | SPEC-BASE §5.1, C-08 | T | R1 |
| RF-CAT-002 | El sistema deberá mantener los ejes de evaluación por categoría (Fruver: BPA, Residuos, Carbono, Trabajo infantil, DDHH/SST). | M | DOC-FRUVER §2 | T | R1 |
| RF-CAT-003 | El sistema deberá mantener productos por categoría con unidad base (kg, litro, unidad), conversiones (bulto, arroba) y rango de precio creíble por kg. | M | SPEC-DASH §1.3, S-11, S-12 | T | R2 |
| RF-CAT-004 | El sistema deberá mantener **parámetros versionados con fecha de vigencia** (pesos de pilares, umbrales de nivel, factores de emisión, fórmulas P2/P3, umbrales de reconocimientos, parámetros de monetización) editables solo por `ADMIN` y con auditoría. | M | S-01…S-16 | T | R3 |
| RF-CAT-005 | El sistema deberá mantener el catálogo de agroquímicos (nombre, registro ICA, ingrediente activo) y la tabla de períodos de carencia por agroquímico × cultivo. | M | SPEC-SOT §2.2, Q-03 | T | R2 |

### 3.5 ASM — Autoevaluación ESG

| ID | Requerimiento | Pri | Fuente | Verificación | Rel |
|---|---|---|---|---|---|
| RF-ASM-001 | El sistema deberá componer el formulario de cada ciclo con el núcleo del formulario vigente de Smile [DOC-AUTOEVAL] más las preguntas extra (ODS, GRI, ISO 14001, B Corp) que correspondan al tamaño y la categoría del proveedor (regla S-19), garantizando ≥ 1 pregunta por eje. *Modificado por C-16: los topes 8/15/25 de SPEC-SOT §3.1 se reemplazan por niveles de tamaño.* | M | SPEC-SOT §3.1, SPEC-BASE §5.1 | T: matriz de 3 tamaños × 2 personas | R1 |
| RF-ASM-002 | El sistema deberá mantener un banco de preguntas **versionado** con: texto, ayuda, eje, categorías, tamaños y tipos de persona aplicables, tipo de respuesta (Sí/A veces/No[/No aplica], opción única, múltiple, numérica), peso 1–5, prioridad, regla crítica opcional, bandera sensible y mapeo a marcos (B Corp, ISO 14001/GRI, TCFD/SASB, norma colombiana). | M | SPEC-SOT §3.2 | I, T | R1 |
| RF-ASM-003 | La PWA deberá descargar el formulario compuesto y permitir responderlo **offline**, una pregunta por pantalla, con ayuda contextual, pausa y reanudación desde la última pregunta. | M | SPEC-BASE §2.1 | T (e2e offline) | R1 |
| RF-ASM-004 | El sistema deberá gestionar ciclos cuatrimestrales (C1 ene–abr, C2 may–ago, C3 sep–dic); una autoevaluación enviada es inmutable; se permite una por ciclo. | M | SPEC-SOT §1.1 E2, C-02 | T | R1 |
| RF-ASM-005 | El sistema deberá calcular el puntaje por eje con `Σ(peso × valor) / Σ(pesos aplicables) × 100`. | M | S-01, S-02 | T con casos de la maqueta (BPA 80, Residuos 20, Carbono 50, Infantil 100, DDHH 70) | R1 |
| RF-ASM-006 | El sistema deberá asignar nivel por eje: Inicial < 40, En desarrollo 40–74, Avanzado ≥ 75. | M | S-03 | T | R1 |
| RF-ASM-007 | Cuando una pregunta crítica reciba una respuesta de riesgo, el sistema deberá marcar el eje como URGENTE, impedir que sea Avanzado, mostrar el mensaje crítico al proveedor y registrar una alerta para `REVIEWER` (persistida desde R1; visible en el back-office desde R3 con RF-NOT-004). Críticas mínimas: trabajo de menores de 15 años o menores en labores prohibidas; agroquímicos sin registro ICA; no registro de carencia. | M | SPEC-SOT D2 §4.1, DOC-FRUVER Eje 1/4 | T | R1 |
| RF-ASM-008 | El sistema deberá calcular el Pilar 1 como promedio de los ejes con pesos parametrizables. | M | SPEC-SOT §1.2, S-04 | T | R1 |
| RF-ASM-009 | El sistema deberá calcular el porcentaje "cerca de certificación" para BPA ICA (y en R4 B Corp, GlobalG.A.P., ISO 14001) como puntos obtenidos / puntos posibles de las preguntas mapeadas a esa certificación, y mostrarlo como "Está a X % de …". | M | SPEC-BASE §5.3, SPEC-DASH | T | R1 |
| RF-ASM-010 | El sistema deberá enviar las respuestas y la declaración firmada en la cola P2 con payload < 50 KB. | M | SPEC-SOT §5.2 | T, A | R1 |
| RF-ASM-011 | El sistema deberá permitir a `ADMIN` crear, editar y **publicar** versiones del banco; un ciclo en curso conserva la versión con la que se compuso. | M | SPEC-SOT §3 | T | R3 |
| RF-ASM-012 | El sistema deberá recordar al proveedor completar la autoevaluación 14 y 3 días antes del cierre del ciclo. | S | SPEC-SOT §1.2 P3 | T | R4 |
| RF-ASM-013 | El sistema deberá mostrar al proveedor, al terminar el formulario, el diagnóstico (puntaje general P1, nivel general, puntaje y nivel por eje, alertas críticas, % cerca de certificación) y **su siguiente paso**: la primera meta del plan con su acción concreta (S-20), en lenguaje sin jerga técnica. | M | SPEC-SOT D2 §3.1 #3 | D | R1 |

### 3.6 IMP — Plan de mejora y guías

| ID | Requerimiento | Pri | Fuente | Verificación | Rel |
|---|---|---|---|---|---|
| RF-IMP-001 | Al enviar la autoevaluación, el sistema deberá generar la **Ruta de Crecimiento Cuatrimestral** con exactamente 3 metas sobre las 3 brechas más críticas (orden S-09); si hay menos de 3 brechas, completar con metas de "mantener" del eje de menor puntaje. | M | SPEC-SOT §1.1 E3, SPEC-BASE §5.3, S-09 | T | R1 |
| RF-IMP-002 | Cada meta deberá contener: hallazgo, acción (el `next_step` de la pregunta incumplida, regla S-20), responsable (el proveedor por defecto), fecha límite (cierre del ciclo), evidencia de cierre esperada y la guía asociada. | M | DOC-MATRIZ §16 | I, T | R1 |
| RF-IMP-003 | Cada guía deberá contener: título, introducción, pasos, checklist, consejo, fuente normativa, minutos estimados y recursos de micro-learning, y estará disponible offline. | M | DOC-FRUVER §2 | D | R1 |
| RF-IMP-004 | El sistema deberá marcar una meta como completada cuando su checklist esté al 100 %, y permitir adjuntar evidencia fotográfica opcional (comprimida ≤ 1 MB en el dispositivo, subida en P3). | M | SPEC-SOT §1.1 E4 | T | R1 (foto R4, con P3) |
| RF-IMP-005 | El sistema deberá permitir a `REVIEWER` validar o reabrir una meta con comentario visible para el proveedor. | S | DOC-MATRIZ §16 | T | R3 |
| RF-IMP-006 | El sistema deberá permitir a `ADMIN` gestionar guías (Markdown) por eje y categoría. | M | — | T | R3 |
| RF-IMP-007 | El sistema deberá generar la **ficha resumen** imprimible A4 monocromática de alto contraste (datos, puntaje, ejes, 3 metas con acción y método de control) y su versión texto (< 1 KB) para compartir por WhatsApp con un enlace `wa.me`, ambas sin conexión. | M | DOC-FRUVER §3, SPEC-SOT §4.1 | D | R1 |

### 3.7 ERP — Mini ERP

| ID | Requerimiento | Pri | Fuente | Verificación | Rel |
|---|---|---|---|---|---|
| RF-ERP-001 | El sistema deberá registrar una **venta** con fecha (hoy por defecto), cliente (Grupo Smile u otro con nombre), producto, cantidad, unidad (kg, bulto, arroba, litro, unidad) y valor total COP (entero). | M | SPEC-SOT §2.1 | T | R2 |
| RF-ERP-002 | El sistema deberá registrar un **costo** con fecha, categoría (Insumos y semillas · Fertilizantes y agroquímicos · Mano de obra y jornales · Fletes, combustible y mantenimiento), valor COP, descripción opcional y marca opcional "inversión en BPA". | M | SPEC-SOT §2.1, §2.3 | T | R2 |
| RF-ERP-003 | El sistema deberá registrar **entradas de inventario** (cosecha o compra) con producto, cantidad, unidad y fecha. | M | SPEC-BASE §4.1 | T | R2 |
| RF-ERP-004 | El sistema deberá calcular localmente el inventario disponible por producto en unidad base: entradas − ventas − mermas, actualizado al guardar cada registro. | M | SPEC-SOT §2.1 | T | R2 |
| RF-ERP-005 | El sistema deberá calcular localmente ganancia neta (ventas − costos) y margen % para la semana, el mes y el ciclo actuales. | M | SPEC-SOT §2.1 | T | R2 |
| RF-ERP-006 | El sistema deberá registrar **mermas** con producto, cantidad, unidad y una de 4 causas (C-06), sin fotografía obligatoria. | M | SPEC-SOT §2.2 | T | R2 |
| RF-ERP-007 | El sistema deberá **advertir sin bloquear** cuando una cantidad o valor esté fuera del rango creíble (S-11), pidiendo confirmación. | M | SPEC-DASH §1.3 | T | R2 |
| RF-ERP-008 | El backend deberá normalizar toda cantidad a la unidad base del producto (S-12) conservando la unidad y cantidad originales. | M | SPEC-DASH §1.3 | T | R2 |
| RF-ERP-009 | El sistema deberá permitir editar o anular un registro propio durante 7 días; la anulación es lógica y exige motivo. | S | S-10 | T | R2 |
| RF-ERP-010 | El sistema deberá mostrar métricas comerciales: margen bruto, precio medio de venta por kg por producto y % merma = mermas / entradas del período. | M | SPEC-BASE §4.2 | T | R2 |
| RF-ERP-011 | La pantalla de inicio del proveedor deberá mostrar tarjetas de Ventas (COP), Costos (COP), Margen neto (%) e Inventario disponible. | M | SPEC-DASH (proveedor) | D | R2 |
| RF-ERP-012 | Cada registro del Mini ERP deberá guardarse localmente primero y encolarse en **P1** con lotes comprimidos < 10 KB. | M | SPEC-SOT §5.2 | T, A | R2 |

### 3.8 TRZ — Trazabilidad, carencia y rotulación ICA

| ID | Requerimiento | Pri | Fuente | Verificación | Rel |
|---|---|---|---|---|---|
| RF-TRZ-001 | El sistema deberá registrar aplicaciones de agroquímicos: fecha, agroquímico del catálogo, cultivo/parcela y dosis. | M | SPEC-SOT §2.2 | T | R2 |
| RF-TRZ-002 | El sistema deberá crear lotes de cosecha (cultivo, cantidad, unidad, fecha prevista) y calcular la **fecha mínima de despacho** = máx(fecha_aplicación + período_carencia) de las aplicaciones del cultivo. | M | SPEC-BASE §4.2 | T | R2 |
| RF-TRZ-003 | El sistema **no deberá** permitir liberar un lote si la fecha actual es menor que su fecha mínima de despacho, y deberá mostrar los días restantes. | M | SPEC-BASE §8.2, DOC-FRUVER Eje 1 | T | R2 |
| RF-TRZ-004 | Al liberar un lote, el sistema deberá generar un rótulo con código único (S-16), sello "Carencia verificada", producto, cantidad, fecha y QR, imprimible en etiqueta 50 × 30 mm y en A4, y visible en pantalla — también sin conexión. | M | SPEC-SOT §2.2 | T, D | R2 |
| RF-TRZ-005 | Si un cultivo no tiene aplicaciones registradas, el sistema deberá exigir la declaración "sin aplicaciones en los últimos N días" (N = máxima carencia del cultivo) para liberar el lote. | S | DOC-FRUVER Eje 1 | T | R2 |
| RF-TRZ-006 | La pantalla de inicio deberá alertar los lotes bloqueados con días restantes para liberar el corte. | M | SPEC-DASH (proveedor) | D | R2 |
| RF-TRZ-007 | El backend deberá rechazar en sync un lote liberado cuya fecha de liberación viole la carencia según sus propias aplicaciones registradas. | M | Res. ICA 30021 | T | R2 |

### 3.9 REC — Recepciones y desempeño operativo

| ID | Requerimiento | Pri | Fuente | Verificación | Rel |
|---|---|---|---|---|---|
| RF-REC-001 | El sistema deberá permitir a `REVIEWER` registrar recepciones: proveedor, fecha y hora pactada/real, código de rótulo (escaneo QR o texto, opcional), producto, kg pactados, kg recibidos, kg rechazados y causa. | M | SPEC-SOT §1.2 P2 | T | R3 |
| RF-REC-002 | El sistema deberá importar recepciones desde CSV con plantilla publicada, validando fila por fila y reportando errores sin importar filas inválidas. | S | Q-06 | T | R3 |
| RF-REC-003 | El sistema deberá calcular el Pilar 2 con la fórmula S-05 sobre las recepciones del ciclo. | M | SPEC-SOT §1.2, S-05 | T | R3 |
| RF-REC-004 | El proveedor deberá poder ver sus recepciones, tasa de rechazo y causas. | M | SPEC-SOT D2 §3.1 #3 | D | R3 |
| RF-REC-005 | El sistema deberá validar el código de rótulo recibido contra los lotes liberados del proveedor y marcar la entrega "carencia verificada" o "sin rótulo válido". | M | SPEC-DASH (Smile) | T | R3 |

### 3.10 SCO — Scoring y funnel

| ID | Requerimiento | Pri | Fuente | Verificación | Rel |
|---|---|---|---|---|---|
| RF-SCO-001 | El sistema deberá calcular `Score = P1·0,50 + P2·0,30 + P3·0,20` (pesos parametrizables que sumen 1), aplicando S-07 si falta un pilar; **oficial** al cierre del ciclo y **provisional** diario. | M | SPEC-SOT §1.2, SPEC-BASE §3.2 | T | R3 |
| RF-SCO-002 | El sistema deberá calcular el Pilar 3 con la fórmula S-06. | M | SPEC-SOT §1.2, S-06 | T | R3 |
| RF-SCO-003 | El sistema deberá asignar la etapa del funnel E1–E5 automáticamente según S-08 y C-10, y E6 solo por decisión de `ADMIN`. | M | SPEC-SOT §1.1 | T: tabla de transiciones | R3 |
| RF-SCO-004 | El sistema deberá conservar el historial de score por pilar y de etapas por proveedor y ciclo. | M | SPEC-BASE §3.2 | T | R3 |
| RF-SCO-005 | El sistema deberá permitir a `ADMIN` forzar una etapa con motivo obligatorio, auditado. | S | — | T | R3 |
| RF-SCO-006 | La PWA deberá mostrar al proveedor su score, su etapa y una explicación de cada pilar en lenguaje llano, con la acción que más lo sube. | M | SPEC-SOT D2 §3 | D | R3 |

### 3.11 GAM — Reconocimientos e incentivos

| ID | Requerimiento | Pri | Fuente | Verificación | Rel |
|---|---|---|---|---|---|
| RF-GAM-001 | El sistema deberá otorgar **Flores** automáticamente por merma < 5 % durante 3 meses consecutivos o por 12 semanas consecutivas con registro ERP, y permitir a `REVIEWER` otorgarlas o retirarlas manualmente con motivo. | M | SPEC-SOT §1.4, SPEC-BASE §3.4, C-05, S-14 | T | R4 |
| RF-GAM-002 | El sistema deberá emitir **Caritas Felices** por: 4 semanas consecutivas con registro ERP, merma < 5 % durante un mes, plan del ciclo al 100 %, documento cargado antes de vencer, checklist de compostaje completo. | M | SPEC-SOT §1.4, SPEC-BASE §3.4 | T | R4 |
| RF-GAM-003 | El sistema deberá otorgar la insignia **Maestro BPA / Pesca Responsable** al completar el 100 % de clips y autoevaluaciones del módulo de su categoría. | M | SPEC-SOT §4.2 | T | R4 |
| RF-GAM-004 | El sistema deberá calcular la elegibilidad al incentivo +4 % (regla Q-01), mostrarla al proveedor y exponer a Compras la lista exportable de elegibles; no liquida pagos. | M | SPEC-SOT §4.2 | T | R4 |
| RF-GAM-005 | La PWA deberá mostrar la hoja de ruta de beneficios (prioridad de compra, +4 %, becas La Academia/EUDE) con estado bloqueado/desbloqueado y la condición faltante. | M | SPEC-BASE §6.2 | D | R4 |
| RF-GAM-006 | La pantalla de inicio deberá mostrar el contador de Flores e insignias activas. | M | SPEC-DASH (proveedor) | D | R4 |

### 3.12 LRN — Micro-learning

| ID | Requerimiento | Pri | Fuente | Verificación | Rel |
|---|---|---|---|---|---|
| RF-LRN-001 | El sistema deberá rechazar en la carga clips que no sean MP4 H.264, duren > 120 s o pesen > 4 MB, y fichas que no sean PDF/PNG. | M | SPEC-SOT §4.1 | T | R4 |
| RF-LRN-002 | El sistema deberá asignar clips automáticamente según las metas del plan y el path del proveedor. | M | SPEC-BASE §6.3 | T | R4 |
| RF-LRN-003 | La PWA deberá descargar en segundo plano (P3) los clips asignados solo con conexión, respetando la opción "solo Wi‑Fi". | M | SPEC-SOT §5.2 | T | R4 |
| RF-LRN-004 | La PWA deberá reproducir clips y abrir fichas sin conexión, y marcar un clip como completado al reproducir ≥ 90 %. | M | SPEC-BASE §8.1, S-15 | T | R4 |
| RF-LRN-005 | El sistema deberá permitir a `ADMIN` cargar y publicar contenidos por eje, categoría y path. | M | — | T | R4 |

### 3.13 CAL — Calculadoras de impacto

| ID | Requerimiento | Pri | Fuente | Verificación | Rel |
|---|---|---|---|---|---|
| RF-CAL-001 | El sistema deberá calcular la huella de la finca: `kgCO₂e = gal_diésel·10,21 + gal_gasolina·8,89 + kg_N_sintético·2,45 + kWh_red·0,164` con factores versionados, offline. | M | DOC-FRUVER Eje 3, C-12 | T | R1 |
| RF-CAL-002 | El sistema deberá expresar la huella por tonelada cosechada usando las entradas de inventario del ciclo. | S | SPEC-SOT §1.5 | T | R5 |
| RF-CAL-003 | El sistema deberá calcular el **ROI** con la fórmula de SPEC-SOT §2.3, mostrando cada término, su origen (costos marcados BPA, reducción de merma × precio medio, +4 % si elegible) y la fecha de los parámetros. | S | SPEC-SOT §2.3, SPEC-DASH | T | R5 |
| RF-CAL-004 | El sistema deberá calcular el **SROI** con la fórmula de SPEC-BASE §4.3 y los parámetros de monetización de Q-02. | S | SPEC-BASE §4.3 | T | R5 |
| RF-CAL-005 | Toda cifra monetaria deberá mostrarse en COP entero con formato es-CO (`$ 1.234.567`); toda fórmula mostrará su versión. | M | SPEC-SOT D2 §3.1 #5 | T | R1 |

### 3.14 RPT — Dashboards y reportes

| ID | Requerimiento | Pri | Fuente | Verificación | Rel |
|---|---|---|---|---|---|
| RF-RPT-001 | El back-office deberá mostrar el **visor de riesgo**: matriz de proveedores (score vs volumen/gasto), Pareto 80/20 con los estratégicos resaltados, y filtros por categoría, segmento, etapa y municipio. | M | SPEC-DASH (Smile) | D | R3 |
| RF-RPT-002 | El back-office deberá mostrar el funnel con conteo por etapa y conversión entre etapas por ciclo. | M | SPEC-SOT §1.1 | D | R3 |
| RF-RPT-003 | El back-office deberá mostrar la tasa de merma recibida por período frente a la meta 8 % y la línea base 22 %, y el % de lotes con carencia verificada. | M | SPEC-DASH, C-11 | D | R3 |
| RF-RPT-004 | El back-office deberá mostrar la **consola ESG**: % de proveedores evaluados sin alerta de trabajo infantil, % trazabilidad, cumplimiento por marco (B Corp, ISO 14001, GRI, TCFD/SASB, ODS) a partir del mapeo de preguntas. | M | SPEC-DASH (Smile) | D | R4 |
| RF-RPT-005 | El sistema deberá exportar en 1 clic, en PDF y XLSX: (a) huella de carbono consolidada (kg CO₂e/t), (b) matriz de DDHH y trabajo infantil, (c) informe de retorno social y ambiental / balance de valor compartido; asíncrono, ≤ 30 s para 450 proveedores. | M | SPEC-SOT §1.5, SPEC-BASE §3.5, Q-05 | T, A | R5 |
| RF-RPT-006 | Todo dashboard y reporte interno deberá respetar RF-PRV-007. | M | SPEC-DASH §1.2 | T | R3 |

### 3.15 NOT — Notificaciones y canal directo

| ID | Requerimiento | Pri | Fuente | Verificación | Rel |
|---|---|---|---|---|---|
| RF-NOT-001 | El sistema deberá permitir a `REVIEWER` enviar mensajes al proveedor (≤ 500 caracteres, tipo soporte/recordatorio/asistencia técnica); el proveedor los verá en su bandeja al sincronizar y podrá responder. | M | SPEC-SOT §1.3 | T | R3 |
| RF-NOT-002 | La PWA deberá ofrecer un botón de soporte que abra WhatsApp o llamada al directorio de Compras y Sostenibilidad (configurable). | M | SPEC-BASE §3.3 | D | R1 |
| RF-NOT-003 | El sistema podrá enviar Web Push para caritas y alertas donde el navegador lo soporte, con consentimiento. | C | — | D | R4 |
| RF-NOT-004 | El sistema deberá notificar a `REVIEWER` en el back-office las alertas críticas (RF-ASM-007), documentos por vencer y solicitudes de privacidad. | M | — | T | R3 |

### 3.16 SYN — Sincronización offline

| ID | Requerimiento | Pri | Fuente | Verificación | Rel |
|---|---|---|---|---|---|
| RF-SYN-001 | La PWA deberá leer y escribir toda la información del proveedor en WatermelonDB; ninguna navegación ni guardado del proveedor esperará respuesta de red. | M | SPEC-SOT §5.1 | T (e2e offline) | R1 |
| RF-SYN-002 | El sistema deberá implementar el protocolo pull/push de WatermelonDB (`GET /api/v1/sync/pull?last_pulled_at=`, `POST /api/v1/sync/push`), con IDs UUID generados en el cliente e **idempotencia** por `mutation_id`: reenviar un lote no duplica registros. | M | SPEC-DASH §1.1 | T | R1 |
| RF-SYN-003 | El sistema deberá procesar la cola en orden estricto P1 (ERP, TRZ) → P2 (autoevaluación, firmas, ficha, plan) → P3 (subida de evidencias y descarga de medios); un nivel no inicia mientras el superior tenga pendientes. | M | SPEC-SOT §5.2, SPEC-BASE §2.3 | T | R1 (P2), R2 (P1), R4 (P3) |
| RF-SYN-004 | La PWA deberá disparar la sincronización al recuperar conexión, al abrir la app, cada 15 min con conexión, por Background Sync donde exista, y con un botón "Sincronizar ahora" (iOS). | M | SPEC-SOT §5.2 | T | R1 |
| RF-SYN-005 | El sistema deberá resolver conflictos así: registros ERP/TRZ son *append-only* (sin conflicto); ficha del proveedor: última escritura gana por campo; entidades administradas por Smile (catálogos, banco, plan validado): gana el servidor. | M | SPEC-DASH §1.1 | T | R1 |
| RF-SYN-006 | La PWA deberá mostrar el estado: "Guardado", "Sin conexión · guardado", "Sincronizando", "N pendientes", "Reintentando", con reintentos de backoff exponencial de 1 s a 15 min. | M | SPEC-BASE §7.2 | D, T | R1 |
| RF-SYN-007 | El sistema deberá comprimir payloads (gzip) y fraccionar lotes: P1 < 10 KB, P2 < 50 KB. | M | SPEC-SOT §5.2 | A | R2 |
| RF-SYN-008 | El backend deberá validar cada registro con su DTO; un registro inválido se rechaza individualmente con código y mensaje, sin bloquear el resto, y la PWA lo marca para corrección. | M | SPEC-DASH §1.1 | T | R1 |

---

## 4. Requerimientos no funcionales (ISO/IEC 25010)

| ID | Atributo | Requerimiento | Pri | Fuente | Verificación |
|---|---|---|---|---|---|
| RNF-PERF-001 | Eficiencia | El JS + CSS inicial de la PWA del proveedor deberá pesar < 2,0 MB comprimido. Presupuesto objetivo: < 350 KB JS en la ruta de inicio. | M | SPEC-BASE §8.1 | A: `next build` + análisis de bundle en CI |
| RNF-PERF-002 | Eficiencia | FCP < 1,8 s en Lighthouse móvil con throttling 3G y desde caché del Service Worker. | M | SPEC-BASE §8.1 | A: Lighthouse CI |
| RNF-PERF-003 | Eficiencia | Guardar un registro local y mostrar confirmación en < 300 ms en un dispositivo de 2 GB de RAM. | M | SPEC-BASE §2.1 | A |
| RNF-PERF-004 | Eficiencia | API p95 < 300 ms en endpoints transaccionales con 450 proveedores y 2 años de datos; `sync/push` de 100 registros < 2 s. | M | — | A: prueba de carga |
| RNF-PERF-005 | Eficiencia | Reportes consolidados < 30 s. | M | SPEC-SOT §1.5 | A |
| RNF-OFF-001 | Fiabilidad | Mini ERP, trazabilidad, autoevaluación, plan/guías, ficha y clips descargados funcionan al 100 % sin conexión. | M | SPEC-BASE §8.1 | T (e2e offline) |
| RNF-OFF-002 | Fiabilidad | La PWA solicita `navigator.storage.persist()` y los datos sobreviven al cierre del navegador y al reinicio. | M | SPEC-SOT §5.1 | T |
| RNF-OFF-003 | Fiabilidad | Ningún registro confirmado al usuario se pierde ante corte de red o cierre durante la sincronización. | M | SPEC-DASH §1.1 | T (pruebas de caos) |
| RNF-USA-001 | Usabilidad | Objetivos táctiles ≥ 48 × 48 px. | M | SPEC-BASE §7.2 | I, T (axe + regla custom) |
| RNF-USA-002 | Usabilidad | Toda opción de navegación lleva ícono y texto. | M | SPEC-BASE §7.2 | I |
| RNF-USA-003 | Usabilidad | ≥ 80 % de 5 productores de prueba registran una venta en < 60 s sin ayuda. | M | SPEC-SOT §2.1 | A: prueba de campo |
| RNF-USA-004 | Usabilidad | Todo texto visible cumple el tono de voz de SPEC-SOT D2 §3 (checklist de revisión de copys). | M | SPEC-SOT D2 §3 | I |
| RNF-USA-005 | Usabilidad | Texto de lectura ≥ 16 px, contraste AA y fondo crema para lectura al sol. | M | SPEC-BASE §7.1 | I |
| RNF-USA-006 | Usabilidad | Feedback animado al guardar offline según GUIA_VISUAL §9. | M | SPEC-BASE §7.2 | D |
| RNF-ACC-001 | Accesibilidad | WCAG 2.1 AA en PWA y back-office; 0 violaciones *serious/critical* de axe. | M | SPEC-SOT D2 §2.2 | T |
| RNF-ACC-002 | Accesibilidad | Se respeta `prefers-reduced-motion`. | M | GUIA_VISUAL §10 | T |
| RNF-COMP-001 | Compatibilidad | Chrome Android ≥ 100 (Android 9+), Safari iOS ≥ 16, Samsung Internet ≥ 20; 360–430 px; back-office ≥ 1280 px. | M | SPEC-BASE §1.2 | T (matriz e2e) |
| RNF-SEC-001 | Seguridad | TLS 1.3 en tránsito en producción; HSTS. | M | SPEC-DASH §1.2 | I |
| RNF-SEC-002 | Seguridad | Contraseñas con Argon2id. | M | — | I |
| RNF-SEC-003 | Seguridad | JWT firmados; refresh rotativo con detección de reutilización y revocación. | M | — | T |
| RNF-SEC-004 | Seguridad | Un proveedor solo accede a sus recursos: prueba automatizada de IDOR por cada endpoint. | M | SPEC-SOT D2 §4.3 | T |
| RNF-SEC-005 | Seguridad | OWASP ASVS nivel 1; cabeceras de seguridad; rate limit de login 10/min/IP. | M | — | T, I |
| RNF-SEC-006 | Seguridad | Archivos validados por *magic bytes* y tamaño; descargas con URL firmada que expira en 15 min. | M | — | T |
| RNF-SEC-007 | Seguridad | Auditoría de acciones de REVIEWER/ADMIN (ver expediente, exportar, otorgar/retirar, override, cambios de parámetros): quién, qué, cuándo, IP; retención 2 años. | M | SPEC-SOT §1.4 | T |
| RNF-SEC-008 | Seguridad | Columnas sensibles cifradas en reposo en la base de datos. | S | SPEC-DASH §1.2 | I |
| RNF-LEG-001 | Legal | Cumplimiento de Ley 1581/2012, Dec. 1377/2013, Res. ICA 30021/2017, Dec. 1072/2015, Ley 1098/2006, Convenios OIT 138/182. | M | SPEC-BASE §8.2 | I |
| RNF-MNT-001 | Mantenibilidad | Hexagonal: `domain` y `application` no importan FastAPI, SQLAlchemy ni SDKs; verificado por import-linter en CI. | M | ADR-0001 | T |
| RNF-MNT-002 | Mantenibilidad | Monolito modular: un módulo solo usa otro mediante su API pública (`<modulo>.public`) o eventos de dominio; verificado por import-linter. | M | ADR-0002 | T |
| RNF-MNT-003 | Mantenibilidad | Cobertura: backend dominio+aplicación ≥ 85 %, total ≥ 75 %; frontend lógica (cálculos, sync, stores) ≥ 80 %. | M | — | A (CI) |
| RNF-MNT-004 | Mantenibilidad | OpenAPI generado por FastAPI y cliente TypeScript generado de él; el CI falla si el contrato cambia sin regenerar. | M | SPEC-BASE §2.2 | T |
| RNF-MNT-005 | Mantenibilidad | Contenidos (preguntas, guías, textos, parámetros) separados del código. | M | — | I |
| RNF-POR-001 | Portabilidad | `docker compose up` en una máquina limpia levanta todo; imágenes multistage, no-root; runtime backend < 250 MB y frontend < 200 MB. | M | ADR-0003 | A |
| RNF-POR-002 | Portabilidad | Configuración 12-factor por variables de entorno; adaptador de storage intercambiable (S3/GCS) sin cambiar código de dominio. | M | C-07 | T |
| RNF-REL-001 | Fiabilidad | Disponibilidad del back-office 99,5 % mensual en producción. | S | — | A |
| RNF-REL-002 | Fiabilidad | Backup diario de PostgreSQL con retención 30 días y restauración probada mensualmente. | M | — | D |
| RNF-OBS-001 | Observabilidad | Logs JSON con `request_id`; sin datos personales en logs. | M | SPEC-SOT D2 §4.3 | T, I |
| RNF-OBS-002 | Observabilidad | Endpoints `/health/live` y `/health/ready`; métricas Prometheus. | M | — | T |
| RNF-I18N-001 | Localización | Español de Colombia; fechas `dd/mm/aaaa`; COP `$ 1.234.567`; decimales con coma; zona `America/Bogota`. | M | SPEC-SOT D2 §3.1 #5 | T |
| RNF-DATA-001 | Datos | Montos COP como enteros (`BIGINT`); cantidades `NUMERIC(12,3)`; instantes en UTC; fecha de negocio local. | M | SPEC-SOT D2 §3.1 #5 | I |

---

## 5. Releases

| Release | Nombre | Objetivo verificable | Sprints (2 sem.) |
|---|---|---|---|
| **R0** | Fundaciones | Monorepo, docs, `docker compose up` funcionando, CI verde, esqueletos hexagonal y PWA. | S0 |
| **R1** | Piloto Fruver: diagnóstico | Un productor se registra, acepta consentimiento, completa ficha, responde la autoevaluación **offline**, ve diagnóstico y plan de 3 metas, imprime/comparte la ficha; los datos llegan al servidor por P2. | S1–S3 |
| **R2** | Mini ERP y trazabilidad | Ventas, costos, inventario, mermas, carencia y rótulos offline con sync P1; dashboard del proveedor. | S4–S6 |
| **R3** | CRM back-office | Expediente, recepciones (P2), score 50/30/20, funnel, mensajes, dashboards de riesgo y calidad, gestión de usuarios y banco. | S7–S9 |
| **R4** | Micro-learning y reconocimientos | Clips P3 offline, Flores, Caritas, Maestro BPA, +4 %, consola ESG. | S10–S11 |
| **R5** | Impacto, reportes y categorías | ROI, SROI, huella/t, reportes PDF/XLSX, ARCO, categorías no-Fruver. | S12–S14 |
| **R6** | Endurecimiento y despliegue | Presupuestos de rendimiento, pruebas 3G y de campo, seguridad, producción. | S15–S16 (y continuo) |

Correspondencia con [SPEC-BASE §9]: Mes 1 → S0–S1 (base PWA, WatermelonDB, UI); Mes 2 → S2–S3 (backend FastAPI y motor de cuestionarios); Mes 3 → S4–S6 (Mini ERP mínimo, pruebas de campo y piloto). R3+ es post-piloto.

---

## 6. Catálogo de casos de uso

Detalle en [`casos-de-uso.md`](casos-de-uso.md). Historias de usuario en [`historias-de-usuario.md`](historias-de-usuario.md) (formato `HU-<MÓDULO>-NN`).

| ID | Caso de uso | Actor principal | Requerimientos | Rel |
|---|---|---|---|---|
| CU-01 | Registrarse como proveedor | Proveedor | RF-IAM-001, RF-IAM-004 | R1 |
| CU-02 | Iniciar sesión (con y sin conexión) | Proveedor, Reviewer, Admin | RF-IAM-002, 003, 006 | R1 |
| CU-03 | Otorgar consentimiento de datos | Proveedor | RF-PRV-001…003 | R1 |
| CU-04 | Completar y actualizar la ficha | Proveedor | RF-SUP-001…003 | R1 |
| CU-05 | Responder la autoevaluación cuatrimestral | Proveedor | RF-ASM-001…010, 012, RF-PRV-004 | R1 |
| CU-06 | Consultar el diagnóstico | Proveedor | RF-ASM-009, 013 | R1 |
| CU-07 | Seguir el plan de mejora | Proveedor | RF-IMP-001…004, RF-CAL-001 | R1 |
| CU-08 | Imprimir o compartir la ficha resumen | Proveedor | RF-IMP-007 | R1 |
| CU-09 | Registrar una venta | Proveedor | RF-ERP-001, 004, 005, 007, 011, 012 | R2 |
| CU-10 | Registrar un costo | Proveedor | RF-ERP-002, 005, 012 | R2 |
| CU-11 | Registrar entrada de inventario o merma | Proveedor | RF-ERP-003, 004, 006 | R2 |
| CU-12 | Registrar aplicación de agroquímico | Proveedor | RF-TRZ-001, RF-CAT-005 | R2 |
| CU-13 | Liberar lote y generar rótulo | Proveedor | RF-TRZ-002…007 | R2 |
| CU-14 | Sincronizar datos | Sistema (PWA) | RF-SYN-001…008 | R1 |
| CU-15 | Registrar recepción de entrega | Reviewer | RF-REC-001, 002, 004, 005 | R3 |
| CU-16 | Consultar y gestionar el expediente | Reviewer | RF-SUP-005…009 | R3 |
| CU-17 | Registrar visita de campo | Reviewer | RF-SUP-007 | R3 |
| CU-18 | Enviar mensaje directo | Reviewer | RF-NOT-001 | R3 |
| CU-19 | Cerrar ciclo y recalcular score y etapas | Sistema (scheduler) | RF-SCO-001…004, RF-REC-003 | R3 |
| CU-20 | Monitorear el funnel y los dashboards | Reviewer, Admin | RF-RPT-001…004 | R3 |
| CU-21 | Asignar Etapa 6 o forzar etapa | Admin | RF-SCO-003, 005 | R3 |
| CU-22 | Administrar el banco de preguntas | Admin | RF-ASM-002, 011 | R3 |
| CU-23 | Administrar catálogos y parámetros | Admin | RF-CAT-001…005 | R3 |
| CU-24 | Gestionar usuarios internos | Admin | RF-IAM-005 | R3 |
| CU-25 | Consumir micro-learning offline | Proveedor | RF-LRN-002…004 | R4 |
| CU-26 | Otorgar o retirar reconocimientos | Reviewer, Sistema | RF-GAM-001…003 | R4 |
| CU-27 | Consultar beneficios e incentivo | Proveedor | RF-GAM-004…006 | R4 |
| CU-28 | Calcular ROI y SROI | Proveedor | RF-CAL-002…004 | R5 |
| CU-29 | Exportar reporte consolidado | Reviewer, Admin | RF-RPT-005, 006 | R5 |
| CU-30 | Revocar consentimiento y ejercer derechos | Proveedor, Admin | RF-PRV-005, 006 | R3/R5 |
| CU-31 | Administrar guías y contenidos de aprendizaje | Admin | RF-IMP-006, RF-LRN-001, RF-LRN-005 | R3/R4 |

## 7. Trazabilidad spec → requerimientos

| Spec | Requerimientos |
|---|---|
| SPEC-SOT §1 (roles) | RF-IAM-001, 004, 005 |
| SPEC-SOT §1.1 | RF-SCO-003, RF-SUP-001, RF-ASM-004, RF-IMP-001 |
| SPEC-SOT §1.2 | RF-ASM-008, RF-REC-003, RF-SCO-001, 002 |
| SPEC-SOT §1.3 | RF-SUP-001…009, RF-NOT-001 |
| SPEC-SOT §1.4 | RF-GAM-001, 002 |
| SPEC-SOT §1.5 | RF-RPT-005, RF-CAL-002 |
| SPEC-SOT §2.1 | RF-ERP-001…005, 012 |
| SPEC-SOT §2.2 | RF-ERP-006, RF-TRZ-001…004 |
| SPEC-SOT §2.3 | RF-CAL-003, 004 |
| SPEC-SOT §3.1–3.2 | RF-ASM-001, 002 |
| SPEC-SOT §4.1–4.2 | RF-LRN-001…005, RF-GAM-003, 004 |
| SPEC-SOT §5 | RF-SYN-001…008 |
| SPEC-SOT D2 §2 | GUIA_VISUAL v1.1, RNF-USA-005, RNF-ACC-001 |
| SPEC-SOT D2 §3 | RNF-USA-004 |
| SPEC-SOT D2 §4.1 | RF-ASM-007 |
| SPEC-SOT D2 §4.3 | RF-PRV-002, 007, RNF-SEC-004 |
| SPEC-BASE §1.2, §6.3 | RF-SUP-004, RF-LRN-002 |
| SPEC-BASE §5.3 | RF-ASM-009, RF-IMP-001 |
| SPEC-BASE §7.2 | RNF-USA-001, 002, 006 |
| SPEC-BASE §8.1 | RNF-PERF-001, 002, RNF-OFF-001 |
| SPEC-BASE §8.2 | RF-PRV-001, RF-TRZ-003, RNF-LEG-001 |
| SPEC-DASH §1.1 | RF-SYN-002, 005, 008 |
| SPEC-DASH §1.2 | RF-PRV-001, 007, 008, RNF-SEC-001 |
| SPEC-DASH §1.3 | RF-ERP-007, 008 |
| SPEC-DASH (Smile) | RF-RPT-001…005 |
| SPEC-DASH (proveedor) | RF-ERP-011, RF-TRZ-006, RF-GAM-006, RF-ASM-009 |
| DOC-FRUVER | RF-CAT-002, RF-TRZ-003, 005, RF-CAL-001, RF-IMP-007 |
| DOC-MATRIZ §16 | RF-IMP-002, RF-SUP-007 |
| DOC-AUTOEVAL | RF-SUP-002, RF-PRV-001…004 |
