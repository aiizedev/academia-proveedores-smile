# Visión y alcance

**Versión 1.0 · 15 de octubre de 2026** · Fuentes: [SPEC-SOT], [SPEC-BASE §1], [DOC-FRUVER §1, §4].

## 1. Problema
Grupo Smile compra a 450 proveedores; 394 son pequeños productores con poca conectividad, poco tiempo y baja alfabetización digital [SPEC-BASE §1.2]. Hoy la evaluación de sostenibilidad es un formulario de Google de una sola vez [DOC-AUTOEVAL] que no acompaña la mejora, no mide desempeño real y no devuelve valor al productor. La merma postcosecha Fruver ronda el 18–25 % [DOC-FRUVER §1].

## 2. Visión
> Una plataforma donde mejorar las prácticas **le hace ganar más al productor** y le asegura a Smile un insumo limpio, trazable y sin mermas. [SPEC-SOT D2 §1.2]

El proveedor recibe un diagnóstico honesto, un plan de tres pasos, una herramienta para saber cuánto gana y beneficios comerciales reales. Smile recibe un CRM que muestra en qué etapa está cada proveedor, por qué y qué hacer.

## 3. Objetivos medibles

| ID | Objetivo | Indicador | Meta | Fuente |
|---|---|---|---|---|
| OBJ-1 | Reducir la merma recibida Fruver | % merma en recepción | < 8 % (base 22 %) | SPEC-SOT §1.2, SPEC-DASH |
| OBJ-2 | Inocuidad verificable | % lotes recibidos con carencia verificada | 100 % | DOC-FRUVER §4 |
| OBJ-3 | Cadena libre de trabajo infantil | % proveedores evaluados sin alerta crítica de infantil | 100 % | SPEC-SOT D2 §4.1 |
| OBJ-4 | Huella | kg CO₂e por tonelada cosechada | −15 % el año 1 | DOC-FRUVER §4 |
| OBJ-5 | Adopción | % proveedores en E4 o superior | ≥ 60 % de los pilotos al mes 6 | SPEC-SOT §1.1 |
| OBJ-6 | Uso del Mini ERP | % proveedores activos con ≥ 1 registro semanal | ≥ 70 % | SPEC-SOT §1.2 P3 |
| OBJ-7 | Facilidad | Registro de venta en < 60 s | ≥ 80 % de los usuarios de prueba | SPEC-SOT §2.1 |

## 4. Interesados

| Interesado | Interés |
|---|---|
| Proveedor rural (394) | Ganar más, ahorrar, acceder a compras prioritarias, +4 % y becas, sin perder tiempo |
| Proveedor estratégico (56) | Reportes avanzados (Scope 1-2-3, TCFD/SASB), reconocimiento |
| Compras, Calidad y Sostenibilidad Smile | Ver riesgo y madurez de la cadena, decidir cupos, reportar a la CCB y a la junta |
| Aliados (SENA, Asohofrucol, CampoLimpio, RAVC) | Llegar a los productores priorizados |
| Universidad (equipo) | Entregar el reto Red de Valor Compartido con calidad profesional |

## 5. Alcance
**Dentro:** PWA del proveedor offline, back-office CRM, API, reportes, piloto Fruver y luego las demás categorías. Ver [`requerimientos.md`](requerimientos.md) §1.2 y §5.
**Fuera (v1):** pagos, integración con el ERP de Smile (solo CSV), IA, apps nativas, unidades de negocio distintas a Smile.

## 6. Principios de producto
1. **Offline primero:** si no funciona sin señal, no está terminado.
2. **Un paso, un dato:** cada pantalla pide una sola cosa.
3. **Respeto:** el productor es un socio experto en su tierra [SPEC-SOT D2 §3.1].
4. **Cero error:** cifras, unidades y fechas exactas, con la fórmula a la vista.
5. **Los datos son del productor:** Smile ve agregados [SPEC-SOT D2 §4.3].

## 7. Riesgos principales

| Riesgo | Mitigación |
|---|---|
| Baja adopción por desconfianza | Registro asistido por pasantes RAVC (RF-IAM-008), tono de voz, beneficios visibles desde el día 1 |
| Pérdida de datos offline | Local-first, pruebas de caos (RNF-OFF-003), indicador de sync visible |
| Reglas de negocio sin validar (S-xx, Q-xx) | Todo parametrizado y versionado; lista de preguntas abiertas con dueño |
| Dispositivos de gama baja | Presupuesto de bundle < 2 MB, pruebas en Android de 2 GB |
| Dependencia de un spec que cambia | Precedencia documentada y registro de conflictos |
