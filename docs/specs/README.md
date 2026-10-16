# Specs — fuente de verdad

Esta carpeta contiene los documentos que **mandan** sobre todo lo demás del repositorio. Cada requerimiento, historia, caso de uso, plan o decisión de diseño cita su origen con la notación `[CÓDIGO §sección]`.

> ⚠️ `.gitignore` excluye `*.pdf`: los PDF de esta carpeta **no se versionan**. Cada integrante debe tener la copia local. Este índice resume las secciones para que las referencias se puedan seguir sin el PDF. Si se decide versionarlos, agregar `!docs/specs/*.pdf` al `.gitignore`.

## 1. Documentos y precedencia

| Prioridad | Código | Archivo | Qué es |
|---|---|---|---|
| 1 | **SPEC-SOT** | `SPEC-SOT_source-of-truth.pdf` | *Manifiesto de funcionalidades y diccionario técnico-operativo* (Doc. 1) + *Guía maestra de principios, lenguaje y calidad* (Doc. 2). Declarado "Fuente Única de Especificación Funcional". |
| 2 | **SPEC-BASE** | `SPEC-BASE_spec-funcional.pdf` | Especificación funcional v1.0 (oct. 2026): stack, arquitectura, módulos, UI, RNF, hoja de ruta. |
| 3 | **SPEC-DASH** | `SPEC-DASH_dashboards-datos.pdf` | Gobierno de datos y especificación de los dos dashboards. |
| 4 | **DOC-FRUVER** | `DOC-FRUVER_piloto-fruver.docx` | Desarrollo técnico del piloto Fruver (Ing. Industrial): 5 ejes, SOP, fórmulas, KPIs. |
| 5 | **DOC-MATRIZ** | `DOC-MATRIZ_matriz-evaluacion.docx` | Matriz de requisitos de sostenibilidad por tipo de proveedor (16 bloques). |
| 6 | **DOC-AUTOEVAL** | `DOC-AUTOEVAL_formulario-actual.docx` | Formulario de autoevaluación que Smile usa hoy (Google Forms, ISO 20400). |
| 7 | GUIA-VISUAL | [`../diseno/GUIA_VISUAL.md`](../diseno/GUIA_VISUAL.md) | Traducción visual y de movimiento de los specs. |
| 8 | MAQUETA | `maqueta/`, [`../referencia/maqueta-v0/`](../referencia/maqueta-v0/) | Prototipo. Referencia de interacción, **no** de reglas de negocio ni color. |

**Regla de conflicto:** gana el de menor número. Los conflictos detectados y su resolución están en [`../sistema/conflictos-y-supuestos.md`](../sistema/conflictos-y-supuestos.md). Un conflicto nuevo se registra ahí antes de implementar.

## 2. Mapa de secciones

### SPEC-SOT — Documento 1: funcionalidades

| § | Tema | Puntos clave |
|---|---|---|
| 1 (intro) | Roles | Tres roles: **cliente** (proveedor, menor poder, registro libre), **Smile reviewer** (gestiones básicas), **Smile admin** (gestiones pesadas). 450 proveedores. |
| 1.1 | Funnel de 6 etapas | 1 Ingreso y registro (RUT, razón social, representante legal, ubicación, canal de contacto, categoría) · 2 Diagnóstico cuatrimestral completado (línea base) · 3 Plan de mejora asignado (3 metas prioritarias) · 4 En adopción y formación (registra en Mini ERP y consume micro-learning) · 5 Candidato a certificación (score ≥ 80 % **o** cumple BPA Res. ICA 30021 / B Corp) · 6 Proveedor sostenible preferente (prioridad de compra, contratos largos, incentivo en precio). |
| 1.2 | Scoring | `Score = Pilar1·0,50 + Pilar2·0,30 + Pilar3·0,20` (0–100). P1 ESG por formulario cuatrimestral (BPA, residuos/triple lavado, agua, huella, trabajo infantil, trabajo digno, SST). P2 desempeño en recepción Smile (rechazo/merma meta < 8 %, volumen pactado, puntualidad, respeto de carencia). P3 fidelización en la PWA (≥ 1 registro ERP semanal, clips completos, constancia inter-cuatrimestral). |
| 1.3 | Expediente digital ("Linktree") | Ficha legal y caracterización (RUT, tamaño Micro/Pequeña/Mediana/Grande, origen nacional/importado, diversidad: mujeres, vulnerable, étnica, víctimas). Bóveda documental (ICA, Icontec, ISO 14001, B Corp, GlobalG.A.P., contratos, fichas técnicas). Histórico de visitas, actas, capacitaciones de aliados, incidentes de calidad. Canal directo comprador → proveedor. |
| 1.4 | Flores y Caritas Felices | Flores: insignias de reputación por superar metas de Mini ERP o merma < 5 % **tres meses consecutivos**. Caritas: refuerzo positivo por constancia de registro, compostaje, entrega pronta de documentos. Ajuste manual por compradores autorizados. |
| 1.5 | Reportes 1 clic | PDF y Excel, marco Porter & Kramer y CCB: huella de carbono de la cadena (kg CO₂e/t producida), matriz DDHH y trabajo infantil, informe de retorno social y ambiental. |
| 2.1 | Ingesta de transacciones | < 60 s por registro. Ventas: fecha, cliente (Smile u otro), producto, cantidad (kg, bultos, litros, unidades), valor COP. Costos en 4 categorías: Insumos y semillas · Fertilizantes y agroquímicos · Mano de obra y jornales · Fletes, combustible y mantenimiento. Margen en tiempo real e inventario. |
| 2.2 | Defectuosos y rotulación ICA | Registro numérico de merma con 4 causas: (a) plagas o enfermedades, (b) daño mecánico postcosecha, (c) descomposición natural, (d) defecto de empaque. Lote listo para despacho → valida último agroquímico contra tabla de períodos de carencia → si cumple, genera código de rotulación con sello de inocuidad, imprimible o en pantalla. |
| 2.3 | ROI y SROI | `ROI% = ((AhorroAgroquímicos + ValorMermasEvitadas + BonificaciónSmile) − InversiónBPA) / InversiónBPA × 100`; bonificación = +4 %. `SROI = (ImpactoSocial + ImpactoAmbiental) / InversiónCapacitación`; ambiental = kgCO₂e mitigados × precio bono + kg compost × precio comercial. |
| 3.1 | Cuestionario dinámico | Backend FastAPI compone el formulario según **tamaño** (Micro ≤ 8 preguntas, Pequeña/Mediana ≤ 15, Grande ≤ 25), **formalidad** (persona natural/jurídica) y **categoría** (Fruver; Lácteos y Carnes; Pescados y Mariscos; Insumos y Servicios). |
| 3.2 | Mapeo de marcos | Cada pregunta mapea B Corp, ISO 14001/GRI, TCFD/SASB y normativa colombiana (tabla con triple lavado, menores, carencia, compostaje). |
| 4.1 | Micro-learning | Clips < 2 min, H.264/MP4, < 4 MB. Fichas PDF/PNG monocromáticas de alto contraste. Offline-first. |
| 4.2 | Gamificación | Insignia "Maestro BPA / Pesca Responsable" (100 % de clips y autoevaluaciones del módulo). Incentivo +4 % automático sobre precio de liquidación. Becas (La Academia de Smile, EUDE). |
| 5, 5.1, 5.2 | PWA y sync | Next.js + WatermelonDB (IndexedDB). Sin peticiones bloqueantes. Cola P1 ERP (< 10 KB JSON comprimido) → P2 formulario y firmas (< 50 KB) → P3 descarga de medios (< 4 MB). Backend FastAPI / Firebase Storage. |

### SPEC-SOT — Documento 2: marca, lenguaje y ética

| § | Tema | Puntos clave |
|---|---|---|
| D2 1.1–1.2 | Propósito | Valor compartido (Porter & Kramer): la sostenibilidad debe ser rentable para el productor. |
| D2 2.1–2.3 | Identidad visual | "Quiet Luxury & Cozy Elegance". Paleta oficial: Verde Oliva `#3D4A3E`, Palo de Rosa `#E8C5B8`, Crema `#F9F6F0`, Gris Carbón `#2B2B2B` (texto, ≥ 4,5:1). Serif editorial para títulos, sans humanista para datos. |
| D2 3.1–3.2 | Tono de voz | 5 pilares: prudencia y respeto, empatía sin condescendencia, rigor técnico con transparencia, sencillez austera, perfeccionismo y cero error. Tabla de frases correctas/incorrectas. |
| D2 4.1 | Trabajo infantil | < 15 años prohibido. 15–17: solo labores livianas con autorización, sin interferir con el estudio, sin agroquímicos, cargas > 15 kg ni herramientas cortopunzantes. Línea de denuncia activa. |
| D2 4.2 | JEDI | Igual pago por igual jornal; priorizar productores étnicos, víctimas, jóvenes, personas con discapacidad. |
| D2 4.3 | Habeas Data | Ley 1581 de 2012. Los datos del Mini ERP y del formulario **pertenecen al proveedor**; uso solo para acompañamiento, indicadores agregados y bonificaciones; confidencialidad frente a terceros. |

### SPEC-BASE

| § | Tema | Puntos clave |
|---|---|---|
| encabezado | Stack | Next.js + PWA + Tailwind + WatermelonDB; Python 3.11+ FastAPI; Firebase/Cloud Storage + PostgreSQL/TimescaleDB. |
| 1.2 | Pareto 80/20 | 56 proveedores estratégicos (80 % del gasto) y 394 pequeños productores (20 %) con baja conectividad y alfabetización digital. |
| 1.3 | Alcance | Solo operaciones de Grupo Smile. |
| 2.1–2.3 | Arquitectura | Local-first, UI reactiva sin esperar servidor, Workbox, OpenAPI. Sync P1 ERP (ventas, costos, inventario, defectuosos) → P2 formulario, perfil, firmas → P3 clips y catálogos. |
| 3.1–3.5 | CRM | Igual a SOT §1.1–1.5. Score **recalculado cada cuatrimestre**. Caritas automáticas: merma < 5 % **durante un mes** o Path cuatrimestral al 100 %. Reporte de huella Scope 3; balance financiero de valor compartido. |
| 4.1–4.3 | Mini ERP | Igual a SOT §2. Rotulación: calcula **fecha límite de despacho** según carencia. Métricas: margen bruto, precio medio por kg, % merma. SROI social = hijos en retención escolar × costo subsidio educativo + jornales formalizados con SST × SBM. |
| 5.1–5.3 | Cuestionarios | Árbol tamaño/formalidad → categoría (Fruver, Lácteos, Carnes, Pescados/Mariscos, Insumos/Servicios). "Cerca de certificación": % frente a certificaciones (ej. "78 % de BPA ICA"). Ruta cuatrimestral con las **3 brechas más críticas**. |
| 6.1–6.3 | Learning y gamificación | Clips < 2 min / < 4 MB, fichas PDF/PNG. Beneficios: prioridad de compra (contratos semestrales), +4 % con distintivo activo, becas EUDE. Path Corporativo Avanzado (56 top: Scope 1-2-3, TCFD/SASB) y Path Rural Simplificado (394). |
| 7.1–7.3 | UI/UX | Paleta oficial. Objetivos táctiles ≥ 48×48 px. Navegación con ícono + texto. Feedback animado al guardar offline. |
| 8.1 | Rendimiento | Bundle inicial < 2,0 MB (Brotli/Gzip). FCP < 1,8 s en 3G o desde caché. 100 % offline en Mini ERP y lectura de guías. |
| 8.2 | Legal | Habeas Data (Ley 1581/2012, Decreto 1377/2013) al iniciar la PWA. Res. ICA 30021/2017: validar carencia en código. Decreto 1072/2015 y OIT: auto-declaración SST y cero trabajo infantil. |
| 9 | Hoja de ruta | Mes 1 base PWA, WatermelonDB, UI · Mes 2 backend FastAPI y motor de cuestionarios · Mes 3 pruebas de campo y piloto. |

### SPEC-DASH

| § | Tema | Puntos clave |
|---|---|---|
| 1.1 | Ciclo de datos | Captura local en WatermelonDB. DTOs tipados (Pydantic). Resolución de conflictos e **idempotencia** en cada envío priorizado. |
| 1.2 | Gobierno y privacidad | Consentimiento antes del primer registro. Soberanía: Smile accede de forma **consolidada**. Cifrado local con clave simétrica en el dispositivo; transporte TLS 1.3. |
| 1.3 | Calidad de datos | Validación de rangos creíbles en el punto de entrada. Normalización de unidades (kg, bultos, arrobas, litros) a SI en el backend. |
| Dashboard Smile | B2B / CRM | Visor de riesgo (matriz de 450, Pareto 80/20, alertas climáticas/suministro). Consola ESG (ISO 14001, B Corp, ODS, TCFD, SASB, GRI; % cadena libre de trabajo infantil; trazabilidad). Calidad: merma recibida (meta 22 % → 8 %), lotes con carencia verificada. Reportes 1 clic. |
| Dashboard proveedor | PWA | Tarjetas: ventas, costos, margen neto %, inventario. Semáforo radial "cerca de certificación". Beneficio económico propio. Alertas: días para liberar corte (carencia), insignias, contador de Flores. |

### DOC-FRUVER

| § | Puntos clave |
|---|---|
| 1 | Merma postcosecha histórica 18–25 %. Base Res. ICA 30021/2017. |
| 2 · Eje 1 BPA | Bloqueo de despacho si `hoy < fecha_aplicación + período_carencia`. Calibración: aforo 60 s por boquilla; variación > 10 % → reemplazo. Franja protectora ≥ 10 m; análisis E. coli semestral. |
| 2 · Eje 2 Residuos | Compost termófilo: pila 1,5 × 1,2 m, C/N ≈ 30:1 (3 secos : 1 verdes/estiércol), 55–65 °C por 21 días, volteo semanal. Triple lavado en 4 etapas + perforación + CampoLimpio. |
| 2 · Eje 3 Carbono | `kgCO₂e = gal_diésel·10,21 + gal_gasolina·8,89 + kg_N_sintético·2,45 + kWh_red·0,164`. Sustituir hasta 25 % del N sintético por compost. |
| 2 · Eje 4 Infantil | < 15 prohibido; 15–17 con autorización del Inspector; lista negativa; copia de cédula de jornaleros; matrícula escolar de menores; ruta ICBF línea 141. |
| 2 · Eje 5 DDHH/SST | EPP (traje 2 piezas, nitrilo, botas, respirador), ≥ 2 L de agua por jornada, igual pago. |
| 3 | Ficha resumen imprimible monocromática por eje (acción + método de control). |
| 4 | KPIs: % merma (< 8 %), % lotes con carencia verificada (100 %), kg CO₂e/t (−15 % año 1), % menores con matrícula (100 %). |
| 5–6 | Aliados (SENA, Asohofrucol, CampoLimpio, RAVC). Despliegue de 6 meses. |

### DOC-MATRIZ

Requisitos generales (legalidad, gobernanza, DDHH, trabajo justo, ambiental, clima, circularidad, inclusión, mejora continua) y 14 tipologías de proveedor (agricultores, ganaderos, pescadores, procesadores, empaques, transporte, aseo, gestores de residuos, agua/energía, mantenimiento, tecnología, servicios profesionales, otros, pequeños productores) + evaluación transversal (evidencias, indicadores, riesgos, **plan de mejora con hallazgo/acción/responsable/fecha/evidencia de cierre**, seguimiento). Es la base del banco de preguntas para categorías distintas de Fruver.

### DOC-AUTOEVAL

Formulario actual (ISO 20400, < 5 min). Sección I datos generales (empresa, RUT con DV, contacto, origen, tamaño, liderazgo de mujeres, liderazgo y empleo diverso, reporte de sostenibilidad). Gestión ambiental (8 preguntas, incluye modo de transporte multiselección). Sección de alimentos (trazabilidad/no deforestación, pesca responsable, libre de agroquímicos, orgánico, bienestar animal; con "No aplica"). Gestión social (6). Declaración formal y autorización de datos sensibles con opción "prefiero no responder" que **no afecta** la evaluación comercial. Contacto: sostenibilidad@smilebogota.com.
