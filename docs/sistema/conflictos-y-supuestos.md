# Conflictos, supuestos y preguntas abiertas

Registro vivo. Antes de implementar algo que dependa de una entrada de esta tabla, verificar su estado. Precedencia de fuentes: ver [`../specs/README.md`](../specs/README.md) §1.

**Estados:** `RESUELTO` (decisión tomada aplicando la precedencia) · `SUPUESTO` (el spec no lo define; se fija un valor parametrizable hasta que negocio lo confirme) · `ABIERTA` (bloquea o condiciona una funcionalidad; requiere respuesta de Grupo Smile o de Ingeniería Industrial).

## 1. Conflictos entre fuentes

| ID | Tema | Fuentes en conflicto | Resolución | Estado |
|---|---|---|---|---|
| C-01 | Paleta de color | SPEC-BASE §7.1 / SPEC-SOT D2 §2.2 (`#3D4A3E`, `#E8C5B8`, `#F9F6F0`, `#2B2B2B`) vs maqueta y GUIA_VISUAL v1.0 | Gana el spec. GUIA_VISUAL v1.1 adopta la paleta oficial. La maqueta conserva la v1.0 y no es referencia de color. | RESUELTO |
| C-02 | Periodicidad del diagnóstico | "Cuatrimestral" (SOT §1.1, §1.2, BASE §3.2, §5.3) vs "Formulario Anual" (BASE §2.1, §2.3) | Cuatrimestral: 3 ciclos al año (ene–abr, may–ago, sep–dic). "Anual" se interpreta como el consolidado de los 3 ciclos. | RESUELTO |
| C-03 | Modelo de puntaje | Maqueta: 5 ejes, Sí/A veces/No, niveles < 40 / 40–74 / ≥ 75 vs SOT §1.2: score total por 3 pilares 50/30/20 | Ambos coexisten: los 5 ejes de DOC-FRUVER son las dimensiones del **Pilar 1 (ESG)**. Los niveles por eje son de presentación y priorización del plan. El score total y el funnel siguen el spec. | RESUELTO |
| C-04 | Número de preguntas | Maqueta: 10 preguntas Fruver vs SOT §3.1: ≤ 8 Micro, ≤ 15 Pequeña/Mediana, ≤ 25 Grande | Gana el spec. El banco Fruver debe tener ≥ 25 preguntas priorizadas para componer los tres tamaños. | RESUELTO |
| C-05 | Disparador de reconocimientos por merma | SOT §1.4: **Flor** con merma < 5 % por **3 meses consecutivos** vs BASE §3.4: **Carita Feliz** con merma < 5 % por **1 mes** | No se contradicen: aplican ambos. 1 mes → Carita; 3 meses consecutivos → Flor. | RESUELTO |
| C-06 | Causas de merma | SOT §2.2: plagas/enfermedades, daño mecánico **postcosecha**, descomposición natural, defecto de empaque vs BASE §4.2: daño mecánico **en transporte**, **error** de empaque | Gana SOT. Etiquetas: "Plagas o enfermedades", "Daño mecánico postcosecha", "Descomposición natural", "Defecto de empaque". | RESUELTO |
| C-07 | Almacenamiento de archivos | SOT §5 / BASE: Firebase / Cloud Storage vs requisito de contenedores locales | Puerto `FileStorage` en el backend; adaptador MinIO (S3) en Docker y adaptador GCS/Firebase en producción. Ver ADR-0004. | RESUELTO |
| C-08 | Lista de categorías | SOT §3.1: 4 módulos (Fruver; Lácteos y Carnes; Pescados y Mariscos; Insumos y Servicios) vs BASE §5.1: 5 (Fruver, Lácteos, Carnes, Pescados/Mariscos, Insumos/Servicios) vs maqueta (Pescados y Mariscos separados) | 5 categorías de BASE para el catálogo; los módulos de preguntas siguen SOT (Lácteos y Carnes comparten bloque de bienestar animal). | RESUELTO |
| C-09 | Número de roles | SOT §1: "deben haber 2 roles … cliente, Smile reviewer y Smile ADMIN" | Son **3 roles**: `PROVEEDOR` (cliente), `REVIEWER`, `ADMIN`. "Compradores" y "auditores" de SOT §1.4 / BASE §3.4 son `REVIEWER`. | RESUELTO |
| C-10 | Candidato a certificación | SOT §1.1 E5: score ≥ 80 % **o** cumplimiento BPA / B Corp vs BASE §3.1: ≥ 80 % "en su categoría" | Gana SOT: `score_total ≥ 80` **o** certificación BPA ICA / B Corp vigente y verificada en el expediente. | RESUELTO |
| C-11 | Meta de merma | SOT/BASE < 8 %; SPEC-DASH "de 22 % a 8 %"; DOC-FRUVER "de 22 % a 7 %" | Meta < 8 % (spec). Línea base 22 % para tableros. | RESUELTO |
| C-12 | Factores de huella de carbono | Maqueta (IPCC 2019, urea 4,7 kg CO₂e/kg) vs DOC-FRUVER (`kg_N_sintético × 2,45`, diésel 10,21/gal, gasolina 8,89/gal, red 0,164/kWh) | DOC-FRUVER (fuente de dominio de Ing. Industrial) como versión 1 de factores; tabla de factores versionada y editable por ADMIN. | RESUELTO |
| C-13 | Tiempo de carga | Maqueta README "< 2 s" vs BASE §8.1 FCP < 1,8 s | FCP < 1,8 s. | RESUELTO |
| C-14 | Cifrado local vs WatermelonDB | DASH §1.2 exige cifrado simétrico en el dispositivo; WatermelonDB/LokiJS no cifra | Cifrado a nivel de aplicación (AES-GCM 256, WebCrypto, clave no exportable) solo para campos sensibles. Ver ADR-0006. | RESUELTO |
| C-16 | Banco de preguntas y topes por tamaño | SPEC-SOT §3.1 (≤ 8 / 15 / 25 preguntas según tamaño; banco propio por categoría) vs instrucción del equipo (16/10/2026): usar las preguntas del formulario vigente de Smile [DOC-AUTOEVAL] más extras con criterios ODS, GRI, ISO 14001 y B Corp | Banco = núcleo DOC-AUTOEVAL (siempre) + 17 extras por niveles de tamaño (`min_size`) y categoría. Sin topes numéricos: la complejidad crece con el tamaño mediante los niveles. Respuestas Sí/No/No aplica (sin "A veces"). Contrato: `contracts/fixtures/question-bank.json` | RESUELTO |
| C-15 | "Motor de IA" | BASE §2.2 y DASH mencionan IA sin definir comportamiento | Fuera de alcance v1. La "inteligencia" del sistema son reglas deterministas y parametrizables. | RESUELTO |

## 2. Supuestos parametrizables

Valores que el spec no define. Se implementan **como parámetros** (`catalog.parameters`, versionados) para que negocio los cambie sin desplegar.

| ID | Supuesto | Valor inicial | Usado en |
|---|---|---|---|
| S-01 | Valor de respuestas | Sí = 1 · A veces = 0,5 · No = 0 · No aplica y "Prefiero no responder" excluidas del denominador | RF-ASM-005 |
| S-02 | Puntaje por eje | `Σ(peso × valor) / Σ(pesos aplicables) × 100` | RF-ASM-005 |
| S-03 | Niveles por eje | Inicial < 40 · En desarrollo 40–74 · Avanzado ≥ 75 | RF-ASM-006 |
| S-04 | Pilar 1 | Promedio de ejes con peso igual | RF-ASM-008 |
| S-05 | Fórmula del Pilar 2 | `P2 = 0,40·Calidad + 0,25·Volumen + 0,20·Puntualidad + 0,15·Carencia` sobre recepciones del ciclo. Calidad = 100 si tasa de rechazo ≤ 5 %, 0 si ≥ 16 %, lineal entre ambos (8 % ≈ 73). Volumen = min(100, kg aceptados / kg pactados × 100). Puntualidad = % entregas dentro de ± 60 min de la hora pactada. Carencia = % entregas con rótulo válido. | RF-REC-003 |
| S-06 | Fórmula del Pilar 3 | `P3 = 0,40·Frecuencia + 0,35·Aprendizaje + 0,25·Constancia`. Frecuencia = semanas del ciclo con ≥ 1 registro ERP / semanas transcurridas × 100. Aprendizaje = clips asignados completados / asignados × 100 (100 si no hay asignados). Constancia = 50 por diagnóstico del ciclo anterior enviado + 50 si P1 no bajó respecto al ciclo anterior. | RF-SCO-002 |
| S-07 | Pilar sin datos | Si un pilar no tiene datos (p. ej. sin recepciones), el score se calcula con los pilares disponibles **renormalizando pesos** y se marca "parcial". | RF-SCO-001 |
| S-08 | Regla de etapas del funnel | E1 ficha obligatoria completa · E2 diagnóstico del ciclo vigente enviado · E3 plan generado · E4 ≥ 1 registro ERP en los últimos 14 días **y** ≥ 1 clip o guía completada en el ciclo · E5 C-10 · E6 asignación manual de ADMIN sobre proveedores en E5. Las etapas 3–5 pueden bajar si deja de cumplirse la condición durante 30 días; E6 solo la retira un ADMIN. Durante un ciclo en curso se conserva la etapa basada en el último diagnóstico; si un ciclo **cierra** sin autoevaluación enviada, la etapa baja a E1 hasta el siguiente envío. | RF-SCO-003 |
| S-09 | Prioridad del plan de mejora | Orden de brechas: URGENTE > Inicial > En desarrollo; desempate por menor puntaje del eje y luego mayor peso de preguntas fallidas | RF-IMP-001 |
| S-10 | Edición de registros ERP | Editable/anulable por el proveedor durante 7 días; anulación lógica con motivo | RF-ERP-009 |
| S-11 | Rango creíble | Advertencia (no bloqueo) si cantidad o valor > percentil 99 del propio proveedor (con ≥ 20 registros) o fuera de `[min, max]` de precio por kg del producto | RF-ERP-007 |
| S-12 | Conversión de unidades | 1 arroba = 12,5 kg; 1 bulto = 50 kg por defecto, redefinible por producto | RF-ERP-008 |
| S-13 | Sesión offline | Refresh token de 30 días; la PWA permite uso offline con la última sesión hasta su vencimiento | RF-IAM-003 |
| S-14 | Reconocimiento por constancia ERP | Carita: 4 semanas consecutivas con registro. Flor: 12 semanas consecutivas | RF-GAM-001/002 |
| S-15 | Clip completado | ≥ 90 % de la duración reproducida | RF-LRN-003 |
| S-16 | Formato de rótulo | `SML-{CAT}-{PROV}-{AAAAMMDD}-{SEQ}-{DV}`; CAT 3 letras, PROV 6 caracteres base32 del id, SEQ 3 dígitos por dispositivo y día con sufijo de dispositivo, DV módulo 11 | RF-TRZ-005 |
| S-18 | Puntaje de la pregunta de transporte (amb-08, multiselección) | 1 si todas las opciones marcadas son de baja emisión (eléctrico/híbrido, no motorizado); 0,5 si hay mezcla; 0 si ninguna | RF-ASM-005 |
| S-19 | Caminos del formulario | Una pregunta o sección es visible si su `categories` incluye la del proveedor (o `all`), su `min_size` ≤ tamaño y se cumplen sus condiciones `show_if` (respuestas previas). Preguntas de ramificación: `amb-09` (vende alimentos → sección alimentos; se prellena según la categoría), `gate-agro` (usa agroquímicos → carencia, registro ICA, triple lavado, EPP) y `gate-menores` (hay menores → matrícula y labores prohibidas). Módulos por sector: Fruver (campo), Lácteos y Carnes, Pescados, Insumos. Las ocultas no puntúan | RF-ASM-001, `contracts/fixtures/form-paths.json` |
| S-20 | Siguiente paso del proveedor | Cada meta del plan (S-09) toma el `next_step` de la pregunta visible peor respondida de su eje: críticas incumplidas primero, luego mayor peso, luego orden del banco; si no hay incumplidas, el `maintain_step` del eje | RF-IMP-001, RF-IMP-002, RF-ASM-013 |
| S-21 | Polaridad de respuesta | Por defecto Sí = 1 y No = 0; en preguntas `polarity: negative` (p. ej. ext-18, menor en labor prohibida) Sí = 0 y No = 1 | RF-ASM-005 |
| S-17 | Envío tardío por sincronización | Una autoevaluación completada en el dispositivo antes del cierre y recibida hasta 15 días después se asigna al ciclo de su `completed_at` local; pasado ese plazo se rechaza y se pide responder la del ciclo vigente | RF-ASM-004, CU-05 |

## 3. Preguntas abiertas para Grupo Smile / Ing. Industrial

| ID | Pregunta | Bloquea | Responsable sugerido |
|---|---|---|---|
| Q-01 | ¿Qué condición exacta activa el incentivo del +4 %? SOT §4.2 lo liga a la insignia "Maestro"; BASE §6.2 a "distintivo de sostenibilidad activo"; DOC-FRUVER a completar las acciones de la ficha. Propuesta: etapa ≥ 5 **y** insignia Maestro activa. | RF-GAM-004 (R4) | Compras Smile |
| Q-02 | Valores de monetización del SROI: precio del bono de carbono (COP/t), precio comercial del compost (COP/kg), costo del subsidio educativo por niño, SBM vigente. | RF-CAL-003 (R5) | Sostenibilidad Smile |
| Q-03 | Tabla oficial de períodos de carencia (producto agroquímico × cultivo). Mientras tanto se carga desde fichas técnicas ICA de los productos más usados en el piloto. | RF-TRZ-002 (R2) | Ing. Industrial / Agronomía |
| Q-04 | Banco de preguntas para Lácteos, Carnes, Pescados y Mariscos, Insumos y Servicios (base: DOC-MATRIZ §3–§9). | Categorías no-Fruver (R5) | Ing. Industrial |
| Q-05 | Formato exacto exigido por la Cámara de Comercio de Bogotá para los reportes. | RF-RPT-005 (R5) | Smile / CCB |
| Q-06 | Fuente de los datos de recepción (Pilar 2): ¿captura manual, CSV del ERP de Smile o integración? Se diseña CSV + captura manual. | RF-REC-001/002 (R3) | Compras Smile |
| Q-07 | ¿Quién decide el paso a Etapa 6 y con qué cupos? | RF-SCO-003 (R3) | Compras Smile |
| Q-08 | ¿Hay color oficial de error/alerta y tipografías licenciadas? | GUIA_VISUAL §14 | Marca Smile |
| Q-09 | Hosting de producción (GCP/Firebase según spec) y presupuesto. | PLAN_INFRA fase de despliegue | Smile TI |
