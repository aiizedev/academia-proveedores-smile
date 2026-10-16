# Guía de usabilidad y contenido

**Versión 1.0 · 15 de octubre de 2026.** Complementa la [GUIA_VISUAL](../diseno/GUIA_VISUAL.md) (cómo se ve y se mueve) con **cómo se usa y cómo habla** el sistema. Fuentes: [SPEC-BASE §7.2], [SPEC-SOT D2 §3], [SPEC-BASE §1.2].

## 1. Usuario de referencia
Productora o productor Fruver de vereda, 35–60 años, Android de gama baja compartido con la familia, datos móviles intermitentes, lee con dificultad textos largos, conoce su cultivo mejor que nadie. Usa WhatsApp todos los días.

## 2. Reglas de interacción (PWA del proveedor)

| # | Regla | Medida | Req. |
|---|---|---|---|
| U-01 | Una decisión por pantalla | Ninguna pantalla de captura pide más de 1 pregunta o 4 campos | RF-ASM-003, RF-ERP-001 |
| U-02 | Objetivos táctiles grandes | ≥ 48 × 48 px; botones principales ≥ 59 px de alto; separación ≥ 8 px | RNF-USA-001 |
| U-03 | Ícono + palabra | Toda navegación y acción principal lleva ambos | RNF-USA-002 |
| U-04 | Valores por defecto | Fecha = hoy; cliente = Grupo Smile; última unidad y producto usados | RF-ERP-001 |
| U-05 | Teclado correcto | `inputmode="numeric"` en cantidades y COP; sin teclado para opciones | RF-ERP-001 |
| U-06 | Confirmación inmediata | Animación de guardado < 300 ms y estado de sync visible | RNF-PERF-003, RF-SYN-006 |
| U-07 | Nunca perder trabajo | Autoguardado al cambiar de pregunta; reanudar donde quedó | RF-ASM-003 |
| U-08 | Advertir, no bloquear | Rangos dudosos piden confirmación; solo la carencia bloquea | RF-ERP-007, RF-TRZ-003 |
| U-09 | Deshacer | Registro ERP editable 7 días | RF-ERP-009 |
| U-10 | Sin señal no es error | El estado offline se comunica en neutro ("Sin conexión · guardado"), nunca en rojo | RF-SYN-006 |
| U-11 | Ayuda en contexto | Cada pregunta trae un "¿Qué significa?" de ≤ 2 frases | RF-ASM-003 |
| U-12 | Números grandes | Totales y puntajes en display; unidades siempre visibles | GUIA_VISUAL §4.2 |
| U-13 | Compartir por WhatsApp | Ficha y rótulo con enlace `wa.me` | RF-IMP-007 |
| U-14 | Lectura al sol | Fondo crema, contraste AA, texto ≥ 16 px | RNF-USA-005 |

## 3. Back-office
- Escritorio ≥ 1280 px; tablas con filtros persistentes en la URL.
- Toda acción que afecte a un proveedor (retirar Flor, forzar etapa) pide motivo y queda auditada (RNF-SEC-007).
- Los datos financieros del proveedor se muestran siempre agregados (RF-PRV-007), con una nota que lo explica.

## 4. Tono de voz [SPEC-SOT D2 §3]

| Pilar | Hacer | Evitar |
|---|---|---|
| Prudencia y respeto | "Identificamos oportunidades de mejora en su predio." | "Usted no ha cumplido…", "será sancionado" |
| Empatía sin condescendencia | "Sabemos que el clima complica la cosecha; registre cuando pueda." | Diminutivos ("sus terrenitos"), tuteo infantil |
| Rigor con transparencia | "Mezcle tres partes de rastrojo seco con una de estiércol." | Jerga normativa ("matriz de materialidad GRI") |
| Sencillez austera | "Venta guardada." | "¡¡Excelente trabajo, eres increíble!!" |
| Cero error | "$ 1.250.000 · 25 kg · 12/03/2026" | Cifras redondeadas sin decirlo, unidades ausentes |

**Tratamiento:** "usted" en toda la PWA. **Voz activa**, oraciones de ≤ 20 palabras. **Reconocimientos** (Caritas, Flores) en una línea, con el dato que los justifica: "Cuatro semanas seguidas registrando. Su margen de marzo: 23 %."

### 4.1 Mensajes estándar

| Situación | Texto |
|---|---|
| Guardado offline | "Guardado en su teléfono. Se enviará cuando haya señal." |
| Sincronizado | "Todo enviado." |
| Error de sync recuperable | "No pudimos enviar 2 registros. Lo intentaremos de nuevo." |
| Registro rechazado por el servidor | "Revise este registro: la cantidad parece fuera de lo normal." |
| Lote bloqueado por carencia | "Faltan 4 días para cosechar este lote sin riesgo. Fecha segura: 18/03/2026." |
| Alerta crítica de trabajo infantil | "Los menores de 15 años no pueden trabajar en la finca. Le mostramos cómo organizar las labores y a quién acudir: Línea 141 ICBF." |
| Consentimiento | "Sus datos son suyos. Los usamos solo para acompañarlo y calcular sus beneficios." |

### 4.2 Glosario de interfaz
"Autoevaluación" (no "encuesta"), "Plan de mejora" o "Ruta" (no "path"), "Merma" (no "defectuosos" en la UI), "Rótulo" (no "etiqueta ICA"), "Período de carencia" acompañado de "días antes de cosechar".

## 5. Checklist de revisión de copys (RNF-USA-004)
- [ ] ¿Trata al productor como socio experto?
- [ ] ¿Usa "usted" y voz activa?
- [ ] ¿Cada oración tiene ≤ 20 palabras?
- [ ] ¿Hay jerga técnica sin traducir?
- [ ] ¿Cifras con unidad, formato es-CO y fecha dd/mm/aaaa?
- [ ] ¿Sin exclamaciones dobles ni adjetivos de relleno?
- [ ] ¿Un error dice qué pasó y qué hacer?

## 6. Pruebas con usuarios
- **Cuándo:** fin de R1 (autoevaluación), fin de R2 (Mini ERP) y piloto de campo (R6).
- **Quién:** 5 productores Fruver por ronda, con pasantes RAVC.
- **Tareas medidas:** registrarse, responder la autoevaluación, registrar una venta (< 60 s, RNF-USA-003), liberar un lote, encontrar su plan.
- **Métricas:** tasa de éxito, tiempo, errores, SUS adaptado oral.
