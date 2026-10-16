# Plan de frontend — PWA local-first y back-office

**Versión 1.0 · 15 de octubre de 2026** · Horizonte: S0–S16 (19/10/2026 – 11/06/2027)

## 0. Fuentes de verdad

| Qué | Dónde | Cómo se usa |
|---|---|---|
| Producto | [`docs/specs/`](../specs/README.md) | Manda sobre todo |
| **Sistema visual y de movimiento** | [`GUIA_VISUAL.md`](../diseno/GUIA_VISUAL.md) v1.1 + [`tokens.css`](../diseno/tokens.css) + [`motion.js`](../diseno/motion.js) | **Única** fuente de color, tipografía, espaciado, radios, sombras, curvas y duraciones. Ningún hex, radio o duración literal en componentes |
| Interacción y tono | [`guia-usabilidad.md`](../sistema/guia-usabilidad.md) (U-01…U-14, checklist de copys) · [SPEC-SOT D2 §3] | Revisión obligatoria de cada pantalla |
| Requerimientos | [`requerimientos.md`](../sistema/requerimientos.md), [`casos-de-uso.md`](../sistema/casos-de-uso.md), [`historias-de-usuario.md`](../sistema/historias-de-usuario.md) | Cada PR cita una HU |
| Arquitectura | [`arquitectura.md`](../sistema/arquitectura.md) §4–§6 · [ADR-0005](../adr/ADR-0005-local-first-watermelondb.md), [ADR-0006](../adr/ADR-0006-cifrado-local-y-sesion-offline.md), [ADR-0008](../adr/ADR-0008-seaweedfs-en-desarrollo.md) | Rutas, carpetas, sync, cifrado |
| Referencia de interacción | [`docs/referencia/maqueta-v0/`](../referencia/maqueta-v0/SNAPSHOT.md) | Patrones de animación y flujo. **No** es referencia de color (paleta v1.0) |

---

## 1. Objetivo

Una sola aplicación Next.js con tres caras:
1. **`/app` — PWA del proveedor:** instalable, 100 % offline (RNF-OFF-001), lectura/escritura solo en WatermelonDB (RF-SYN-001), bundle inicial < 2,0 MB y FCP < 1,8 s en 3G (RNF-PERF-001/002), objetivos táctiles ≥ 48 px (RNF-USA-001).
2. **`/smile` — back-office:** escritorio ≥ 1280 px, online, WCAG 2.1 AA.
3. **`/` — landing:** la maqueta portada a Next con la paleta oficial.

## 2. Estado de partida (S0)

Ver [`frontend/README.md`](../../frontend/README.md): Next.js 15 + React 19 + TS estricto + Tailwind 4, tokens sincronizados desde `docs/diseno`, rutas de `arquitectura.md` §4.1 como páginas base, *shell* de `/app` con barra de estado y tabbar, *shell* de `/smile`, primitivos UI iniciales, motor de puntaje TS validado contra el fixture compartido, esqueleto de WatermelonDB y de la cola de sync, Service Worker, Dockerfile multistage (`deps → builder → dev | runner`). Todo lo funcional está en las fases de §4.

## 3. Reglas de construcción

### 3.1 Capas y carpetas (`arquitectura.md` §4.2)

| Carpeta | Puede importar | No puede importar |
|---|---|---|
| `src/domain/` (reglas puras) | nada de React ni de datos | `data/`, `components/`, `app/` |
| `src/data/db` (WatermelonDB) | `domain/` | `components/`, `app/` |
| `src/data/sync` | `data/db`, `data/api`, `lib/` | `components/` |
| `src/features/<modulo>/` | `domain/`, `data/`, `components/`, `design/` | otras `features/` (comunicar por `data/` o URL) |
| `src/components/ui/` | `design/` | `features/`, `data/` |
| `src/app/` | todo lo anterior | — |

Se hace cumplir con `eslint-plugin-boundaries` (o `import/no-restricted-paths`) en CI.

### 3.2 Receta para implementar una historia de `/app`
1. Leer HU + CU + RF + S-xx; identificar la **pantalla** según U-01 (una decisión por pantalla).
2. **Dominio TS** si hay regla (cálculo, validación): función pura en `src/domain/<m>/` + test con el fixture de `contracts/fixtures/` cuando la regla también existe en el backend (ADR-0005).
3. **Modelo WatermelonDB**: tabla y columnas según [`esquema-datos.md`](../sistema/esquema-datos.md); migración de esquema local (`schemaMigrations`) con `version + 1`; campos sensibles cifrados (ADR-0006).
4. **Registro en la cola** de sync con su prioridad (P1/P2/P3, `arquitectura.md` §5).
5. **Hooks** de datos en `features/<m>/hooks.ts` usando observables (`useObservable`/`withObservables`): la UI nunca hace `fetch` a la API.
6. **UI** con primitivos de `components/ui/` y tokens; patrones de movimiento del catálogo GUIA_VISUAL §9.4 (valores exactos de `design/motion.ts`); estados: vacío, cargando-local, guardado, sin conexión, error de sync.
7. **Copy** revisado con el checklist de `guia-usabilidad.md` §5 (usted, ≤ 20 palabras, unidades, es-CO).
8. **Pruebas:** unitarias (Vitest) de dominio y hooks; componente (Testing Library) con roles accesibles; e2e Playwright **con red desactivada** (`context.setOffline(true)`) para todo flujo de `/app`; axe sin violaciones *serious/critical*.
9. **Presupuesto:** la CI falla si la ruta supera su presupuesto (§6).

### 3.3 Receta para `/smile`
Datos con TanStack Query sobre el cliente generado de OpenAPI (`openapi-fetch`), tablas con filtros en la URL (`useSearchParams`), formularios con react-hook-form + zod (esquemas derivados de los tipos OpenAPI), toda acción destructiva con diálogo que exige motivo (RNF-SEC-007), datos financieros del proveedor **solo** desde `erp-summary` (RF-PRV-007).

### 3.4 Componentes del sistema de diseño (GUIA_VISUAL §8)

| Componente | Sección guía | Fase | HU |
|---|---|---|---|
| `Button` (primary, rose, ghost, light), `IconButton` (48 px), ripple | §8.1 | F0–F1 | HU-DS-03 |
| `Field`, `NumberField` COP/cantidad con `inputmode` | §8.2 | F1 | HU-DS-03, HU-ERP-01 |
| `Tile` de categoría (piloto, bloqueado) | §8.3 | F1 | HU-CAT-01 |
| `LeafBar` (progreso con hoja), `QuestionChip`, `Answer` (relleno circular desde el toque) | §8.4 | F1 | HU-ASM-03 |
| `ScoreRing`, `LevelBadge`, `LevelScale`, `CriticalAlert`, `AxisRow` | §8.5 | F1 | HU-ASM-05 |
| `GoalCard`, `Chip` de prioridad, `GuideHero`, `Steps`, `Checklist` (palomita dibujada), `Tip` | §8.6 | F1 | HU-IMP-01…03 |
| `RewardRoute` (hoja de ruta de beneficios) | §8.7 | F4 | HU-GAM-05 |
| `Ficha` imprimible A4 | §8.8 | F1 | HU-IMP-04 |
| `TabBar` con píldora deslizante, `StatusBar` con `SaveIndicator` | §8.9–8.10 | F0–F1 | HU-SYN-03 |
| `Toast`, `Confetti` (hojas) | §8.11 | F1 | HU-DS-04 |
| `LotLabel` (rótulo 50 × 30 mm y A4 con QR) | — (nuevo, registrar en la guía) | F2 | HU-TRZ-04 |
| `FunnelChart`, `RiskMatrix`, `ParetoChart`, `KpiTile` | — (nuevo, registrar en la guía con el skill de dataviz) | F3 | HU-RPT-01…03 |

Todo componente nuevo se agrega primero a la GUIA_VISUAL (§1 regla 2) y luego al código.

---

## 4. Fases

### F0 · Fundaciones — S0 (19/10 – 30/10/2026) · R0

**Historias:** HU-PLAT-03 (esqueleto PWA), HU-PLAT-05 (cliente OpenAPI), HU-DS-01 (tokens), HU-DS-02 (fuentes), HU-DS-04 (movimiento base y reducido).

**Pasos**
1. Verificar el esqueleto contra `arquitectura.md` §4; activar `eslint-plugin-boundaries` con las reglas de §3.1.
2. `npm run design:check` en CI: `src/design/tokens.css` idéntico a `docs/diseno/tokens.css` (HU-DS-01).
3. Capa Tailwind `@theme`: colores `olive-*`, `rose-*`, `cream*`, `ink*`, semánticos (`surface-*`, `on-strong`, `lvl-*`, `prio-*`); radios `--radius-*`; sombras; z-index; fuentes `font-display` (Fraunces) y `font-body` (Manrope). Regla ESLint/stylelint que prohíbe hex y `rgb()` literales fuera de `src/design/`.
4. Fuentes autoalojadas (`@fontsource-variable/fraunces` con ejes `SOFT`, `WONK`, `opsz`; Manrope 400–800), `font-display: swap`, *preload* solo de los pesos de la primera pantalla (HU-DS-02).
5. `src/design/motion.ts` (port de `motion.js`) + hook `useReducedMotion()` que, si está activo, convierte todo preset en un cambio instantáneo; registro de GSAP solo en el cliente (`gsap.registerPlugin(SplitText, DrawSVGPlugin)`), nunca ScrollTrigger/Lenis en `/app` (GUIA_VISUAL §10.6) (HU-DS-04).
6. Generación del cliente: `npm run api:gen` → `src/data/api/schema.d.ts` desde `../contracts/openapi.json` con `openapi-typescript`; CI falla si hay diff (HU-PLAT-05).
7. Página `/dev/ui` (solo fuera de producción) que muestra todos los primitivos en estados normal/hover/active/disabled/foco para revisión visual.

**Criterios de salida:** `npm run lint && npm run typecheck && npm test && npm run build` verdes; `design:check` verde; `/dev/ui` sin violaciones de axe; imagen `runner` < 200 MB.

### F1 · PWA del piloto Fruver: acceso, consentimiento, ficha, autoevaluación y plan — S1–S3 (02/11 – 11/12/2026) · R1

**Historias:** S1 HU-DS-03, HU-IAM-01, HU-IAM-02, HU-PRV-01, HU-SYN-01, HU-CAL-02, HU-NOT-01 · S2 HU-SYN-03, HU-SYN-04, HU-IAM-04, HU-PRV-02, HU-SUP-01, HU-SUP-02, HU-CAL-01 · S3 HU-ASM-03, HU-ASM-04, HU-ASM-05, HU-IMP-01, HU-IMP-02, HU-IMP-03, HU-IMP-04.

**Pasos**

*S1*
1. **Primitivos** completos de §3.4 para F1 con historias de Vitest + `/dev/ui` (HU-DS-03).
2. **Registro** `/registro` (celular colombiano 10 dígitos, correo opcional, contraseña ≥ 8) y **ingreso** `/ingresar` (HU-IAM-01/02): online; al éxito, crea la clave AES-GCM del dispositivo (ADR-0006), guarda refresh cifrado en IndexedDB y abre la base local.
3. **Consentimiento** `/app/consentimiento` (HU-PRV-01, RF-PRV-001/003): texto versionado descargado en el *bundle* del catálogo, aceptación explícita (casilla + botón), registro local en `consents` (P2) con hash y fecha del dispositivo; **guardia de ruta**: sin consentimiento vigente, todo `/app/*` redirige aquí.
4. **WatermelonDB** (HU-SYN-01): adaptador LokiJS `useIncrementalIndexedDB: true`, `onSetUpError` con pantalla de recuperación; `navigator.storage.persist()` al primer ingreso (RNF-OFF-002); tablas de R1 (`consents`, `declarations`, `supplier_profile`, `assessments`, `assessment_answers`, `plans`, `goals`, `goal_checks`, `catalog_*`, `form_questions`, `guides`).
5. `lib/format.ts` (HU-CAL-02): COP `$ 1.234.567`, `dd/mm/aaaa`, decimales con coma, zona `America/Bogota`.
6. **Soporte** (HU-NOT-01): botón en `/app/perfil` y en la cabecera del plan que abre `wa.me` o `tel:` desde el directorio del catálogo.

*S2*
7. **Motor de sync** (HU-SYN-03/04, RF-SYN-002…006): `synchronize()` de WatermelonDB con `pullChanges`/`pushChanges` contra `/api/v1/sync/*`; `mutation_id` UUID por lote; disparadores: `online`, `visibilitychange` al abrir, intervalo de 15 min con red, Background Sync (`sync` tag `smile-sync`) donde exista y botón "Sincronizar ahora"; backoff 1 s → 15 min con *jitter*; estado global (`Guardado` / `Sin conexión · guardado` / `Sincronizando` / `N pendientes` / `Reintentando`) en `StatusBar` (GUIA_VISUAL §8.10); los registros rechazados (`rejected[]`) quedan marcados con `_sync_error` y aparecen en una bandeja "Para revisar".
8. **Sesión offline** (HU-IAM-04, RF-IAM-003/009): renovación silenciosa al reconectar; si el refresh vence offline, la app sigue en solo lectura y pide ingresar al volver la señal; cerrar sesión advierte de pendientes y borra la clave.
9. **Ficha** `/app/ficha` (HU-SUP-01/02, HU-PRV-02): asistente de 6 pantallas (persona y documento con DV validado en TS, nombre/razón social, ubicación con selects DIVIPOLA en cascada desde el catálogo local, contacto preferido, categoría, caracterización); preguntas sensibles con "Prefiero no responder" y consentimiento sensible separado.
10. **Calculadora de huella** (HU-CAL-01) dentro de la guía de carbono: entradas diésel/gasolina (gal), N sintético (kg), kWh; resultado animado (contador 0,8 s `expo.out`) con la fórmula visible y la versión de factores; fixture `carbon-footprint.json`.

*S3*
11. **Autoevaluación** `/app/autoevaluacion` (HU-ASM-03, CU-05): pantalla de categoría (tiles), una pregunta por pantalla con `LeafBar`, `QuestionChip` del eje, texto Fraunces `--fs-app-question`, ayuda "¿Qué significa?", respuestas `Answer` (Sí / A veces / No / No aplica / Prefiero no responder si es sensible); avance automático a 560 ms; animaciones exactas de GUIA_VISUAL §9.4 ("Pregunta entra/sale", "Responder", "Progreso"); autoguardado por respuesta; reanudar en la última pregunta; declaración final con firma táctil (canvas → PNG comprimido, cifrado) o nombre completo (RF-PRV-004); pantalla "Analizando" (2,6 s).
12. **Motor de puntaje TS** (HU-ASM-04): `domain/assessment/scoring.ts` ya validado; agregar el cálculo de cercanía a BPA ICA (RF-ASM-009) con fixture nuevo compartido.
13. **Diagnóstico** `/app/diagnostico` (HU-ASM-05, CU-06): `ScoreRing` (2,2 s), `LevelBadge`, `AxisRow` por eje (barras 1,6 s, *stagger* 0,08), `CriticalAlert` con el mensaje de `guia-usabilidad.md` §4.1, "Está a X % de la certificación BPA"; confeti 60 si es Avanzado; el resultado local se reemplaza por el oficial al sincronizar (marca "Oficial" cuando llega).
14. **Plan** `/app/plan` y `/app/plan/[metaId]` (HU-IMP-01…03, CU-07): 3 `GoalCard` en orden de prioridad (la primera invertida en oliva), guía con `GuideHero`, `Steps`, `Checklist` (palomita 0,4 s + rebote elástico), `Tip`, fuente; meta completa al 100 % → confeti 50 + toast.
15. **Ficha resumen** `/app/ficha/resumen` (HU-IMP-04, RF-IMP-007): versión A4 monocromática de alto contraste para impresión (`@media print`, 14 mm) y texto < 1 KB para `wa.me`.

**Ejecución:** 1 → (2, 3, 4 en paralelo) → 5, 6; S2: 7 primero (bloquea), 8 ∥ 9 ∥ 10; S3: 11 → 12 → 13 → 14 → 15.
**Criterios de salida (R1):** Playwright offline: registro (online) → modo avión → consentimiento → ficha → autoevaluación completa → diagnóstico → plan → ficha impresa → volver online → `Todo enviado` y el plan marcado "Oficial". FCP < 1,8 s (Lighthouse 3G) en `/app`; JS inicial de `/app` < 350 KB; axe 0 violaciones graves; prueba con 5 productores (guía de usabilidad §6).

### F2 · Mini ERP y trazabilidad — S4–S6 (14/12/2026 – 22/01/2027) · R2

> S4–S5 en vacaciones: 60 % de capacidad.

**Historias:** S4 HU-SYN-05, HU-ERP-01…04 · S5 HU-ERP-05, HU-ERP-06, HU-ERP-08, HU-ERP-09, HU-CAT-03, HU-TRZ-01, HU-TRZ-02 · S6 HU-TRZ-03, HU-TRZ-04, HU-TRZ-05, HU-PRV-04, HU-IMP-05.

**Pasos**
1. **Cola priorizada** (HU-SYN-05, RF-SYN-003/007): `pushChanges` fracciona por prioridad P1 → P2 → P3, comprime con `CompressionStream('gzip')` (fallback `fflate` solo si no existe), respeta 10 KB / 50 KB por lote, envía `X-Pending-P1`.
2. **Venta** `/app/erp/ventas/nueva` (HU-ERP-01, CU-09): 4 pasos máx. con valores por defecto (U-04): producto (tiles de los 6 más usados + buscar), cantidad + unidad (`NumberField` con `inputmode="decimal"`), valor COP (`inputmode="numeric"`, formato en vivo), cliente (Smile por defecto). Guardar < 300 ms con animación de guardado (GUIA_VISUAL §9.4 "Guardado") y toast "Venta guardada.". Meta medible: < 60 s (RNF-USA-003).
3. **Costo** (HU-ERP-02), **entrada** y **merma** (HU-ERP-03/04) con el mismo patrón; 4 categorías de costo y 4 causas de merma como tiles con ícono + texto.
4. **Inventario y margen** (HU-ERP-03/05, RF-ERP-004/005/010) calculados con observables locales: `domain/erp/inventory.ts`, `domain/erp/metrics.ts` con pruebas de propiedad (fast-check).
5. **Rangos creíbles** (HU-ERP-06, S-11): advertencia en hoja inferior "¿Confirma 2.500 kg?" con opción corregir; nunca bloquea.
6. **Editar/anular** (HU-ERP-08, S-10): lista del día con deslizar → anular (motivo de 4 opciones + texto), solo ≤ 7 días.
7. **Inicio** `/app` (HU-ERP-09, RF-ERP-011): 4 `KpiTile` (Ventas, Costos, Margen %, Inventario) del mes con contador animado, lotes bloqueados (RF-TRZ-006), acceso rápido "Registrar venta".
8. **Agroquímicos y carencia** (HU-CAT-03, HU-TRZ-01/02): registrar aplicación (agroquímico del catálogo con buscador por nombre o ingrediente activo); crear lote → fecha mínima de despacho calculada por `domain/traceability/withholding.ts` (fixture `lot-label.json`).
9. **Bloqueo y rótulo** (HU-TRZ-03…05): lote bloqueado con días restantes ("Faltan 4 días… Fecha segura: 18/03/2026"); al liberar, `LotLabel` con código S-16 y QR (`qrcode` generado localmente), vista de impresión 50 × 30 mm y A4, compartir por WhatsApp.
10. **Cifrado de campos** (HU-PRV-04, ADR-0006): wrapper `encryptedField()` para valores financieros, firma y caracterización sensible; migración local que cifra los datos existentes.
11. **Evidencia fotográfica** (HU-IMP-05): captura con `<input capture>`, compresión en el dispositivo a ≤ 1 MB (canvas → JPEG 0,7, lado mayor 1280 px), registro en `evidences` (P3); la subida real se activa con P3 en F4.

**Criterios de salida (R2):** Playwright offline: registrar 20 ventas/costos/mermas, aplicar agroquímico, intentar liberar antes de tiempo (bloqueado), adelantar el reloj, liberar, imprimir rótulo; reconectar → P1 se envía antes que P2 (verificado con intercepción de red); prueba de caos: cerrar la pestaña en medio del push → ningún registro perdido ni duplicado (RNF-OFF-003). 80 % de 5 productores registran una venta en < 60 s.

### F3 · Back-office CRM — S7–S9 (25/01 – 05/03/2027) · R3

**Historias:** S7 HU-IAM-05, HU-PRV-05, HU-SUP-03, HU-SUP-04 · S8 HU-SUP-06, HU-SUP-07, HU-SUP-08, HU-CAT-04, HU-ASM-06, HU-IMP-07, HU-REC-01 · S9 HU-REC-04, HU-SCO-04, HU-SCO-05, HU-NOT-02, HU-NOT-03, HU-RPT-01…03.

**Pasos**
1. **Shell `/smile`**: barra lateral con ícono + texto (RNF-USA-002), cabecera con usuario y rol, migas; sesión con refresh en cookie `HttpOnly` (arquitectura §6); guardia por rol.
2. **Usuarios internos** `/smile/admin/usuarios` (HU-IAM-05).
3. **Proveedores** `/smile/proveedores`: tabla virtualizada (450 filas) con filtros en la URL (categoría, segmento, etapa, municipio, texto) y columnas score/etapa/último registro.
4. **Expediente "Linktree"** `/smile/proveedores/[id]` (HU-SUP-08, CU-16): cabecera con nombre, segmento, etapa y score; secciones ancla: Ficha · Diagnóstico y plan · Score por pilar (historial) · Documentos (subida con URL prefirmada, estados VIGENTE/POR_VENCER/VENCIDO) · Visitas (formulario con compromisos) · Incidentes · Reconocimientos · Mensajes · Resumen financiero **agregado** con nota de privacidad (RF-PRV-007).
5. **Segmento** (HU-SUP-03) y **Etapa 6 / override** (HU-SCO-04) con diálogo de motivo obligatorio.
6. **Recepciones** `/smile/recepciones` (HU-REC-01): formulario rápido con escaneo de QR del rótulo (`BarcodeDetector` donde exista, entrada manual si no) y verificación en vivo; lista diaria.
7. **Admin** `/smile/admin/{parametros,banco,guias}` (HU-CAT-04, HU-ASM-06, HU-IMP-07): editores borrador → publicar, con vista previa en el estilo de la PWA (reutiliza los componentes de `/app`).
8. **Mensajes y alertas** (HU-NOT-02/03): bandeja de alertas críticas (trabajo infantil primero), mensajes por proveedor; en `/app/mensajes` bandeja del proveedor (offline, por pull) con respuesta encolada.
9. **Dashboards** `/smile`, `/smile/funnel` (HU-RPT-01…03): `RiskMatrix` (score × volumen, color por etapa con número y nombre, nunca solo color), `ParetoChart` (56 estratégicos resaltados), `FunnelChart` con conversión, `KpiTile` merma vs meta 8 % y base 22 %, % carencia verificada. Gráficas diseñadas con la guía de dataviz y los tokens.
10. **PWA**: `/app/score` (HU-SCO-05) con explicación por pilar y "lo que más le sube"; `/app/recepciones` (HU-REC-04); `/app/perfil` → revocar autorización (HU-PRV-05).

**Criterios de salida (R3):** e2e de un reviewer: buscar proveedor → registrar visita con compromiso → registrar recepción escaneando el rótulo → ver el cambio del score provisional; axe sin violaciones en todas las rutas `/smile`; las vistas de dashboard cargan < 1,5 s con 450 proveedores.

### F4 · Micro-learning y reconocimientos — S10–S11 (08/03 – 02/04/2027) · R4

**Historias:** S10 HU-LRN-01, HU-LRN-03, HU-IAM-06, HU-IAM-07, HU-SUP-05, HU-REC-02, HU-IMP-06 · S11 HU-LRN-04, HU-GAM-01…05, HU-ASM-07, HU-ASM-08, HU-RPT-04, HU-NOT-04.

**Pasos**
1. **P3 real** (HU-LRN-03, RF-LRN-003): descarga de clips asignados a Cache Storage (`smile-media-v1`) por el Service Worker con URLs prefirmadas, solo con red y respetando "solo Wi‑Fi" (`navigator.connection.type` cuando exista; si no, preguntar); subida de evidencias pendientes.
2. **Aprender** `/app/aprender` (HU-LRN-04): lista por meta, reproductor nativo `<video>` offline, progreso ≥ 90 % (S-15) → `content_progress`; fichas PDF/PNG con visor del navegador.
3. **Beneficios** `/app/beneficios` (HU-GAM-05): `RewardRoute` con estados bloqueado/desbloqueado y condición faltante, +4 % (Q-01), becas; contador de Flores e insignias en el inicio (HU-GAM-06 vía HU-GAM-05).
4. **Caritas y Flores** (HU-GAM-01/02): al llegar por pull, toast de una línea con el dato que lo justifica (`guia-usabilidad.md` §4) y animación de nodo `back.out(2.2)`.
5. **Back-office:** carga de contenidos con validación previa en el navegador (duración y tamaño) (HU-LRN-01), otorgar/retirar Flor (HU-GAM-01), exportar elegibles +4 % (HU-GAM-04), consola ESG (HU-RPT-04), verificación de documentos (HU-SUP-05), importación CSV de recepciones con reporte por fila (HU-REC-02), validar/reabrir metas (HU-IMP-06).
6. **Auth Should:** recuperar contraseña (HU-IAM-06), registro asistido en campo desde el back-office móvil (HU-IAM-07).
7. **Push** opcional (HU-NOT-04) con permiso solicitado solo tras una acción del usuario.

**Criterios de salida (R4):** un clip asignado se reproduce en modo avión; P3 nunca se ejecuta con P1/P2 pendientes (prueba con intercepción).

### F5 · Impacto, ARCO y categorías — S12–S14 (05/04 – 14/05/2027) · R5

**Historias:** HU-CAL-03…05, HU-RPT-05…07 (UI de exportación), HU-PRV-06, HU-CAT-05.

**Pasos**
1. `/app/impacto` (HU-CAL-03…05): huella por tonelada, ROI y SROI con cada término y su origen, fórmula visible y versión de parámetros (RF-CAL-005); explicación en lenguaje llano.
2. `/smile/reportes`: selector de reporte y formato, estado del trabajo (polling cada 2 s), descarga con URL firmada.
3. `/app/perfil/mis-datos` (HU-PRV-06): descargar mis datos y solicitar supresión.
4. Categorías nuevas (HU-CAT-05): tiles activos, íconos de categoría del set (`lacteos`, `carnes`, `pescados`, `mariscos` + nuevo `insumos` dibujado con la grilla de GUIA_VISUAL §7), formularios y guías por categoría sin cambios de código (contenido).

### F6 · Endurecimiento — S15–S16 (17/05 – 11/06/2027) · R6

**Historias:** HU-PLAT-10 (presupuesto en CI), HU-PLAT-12 (caos offline), HU-PLAT-13 (compatibilidad), HU-PLAT-17 (usabilidad en campo), HU-DS-05 (auditoría de accesibilidad y táctil).

**Pasos**
1. Lighthouse CI en `/`, `/app`, `/app/autoevaluacion`, `/app/erp/ventas/nueva` con *throttling* 3G: FCP < 1,8 s, JS inicial < 2,0 MB (RNF-PERF-001/002).
2. Suite de caos: cortar red en cada fase del push/pull, cerrar pestaña, llenar cuota de almacenamiento, reloj del dispositivo adelantado/atrasado.
3. Matriz de compatibilidad (RNF-COMP-001) con Playwright (Chromium Android emulado, WebKit iOS) + prueba manual en un Android de 2 GB y un iPhone con iOS 16.
4. Auditoría táctil automatizada: regla que mide `getBoundingClientRect()` de todo elemento interactivo ≥ 48 × 48 (RNF-USA-001).
5. Prueba de campo con 5 productores y pasantes RAVC (`guia-usabilidad.md` §6).

---

## 5. Mapa de pantallas → historias

| Ruta | Pantalla | HU | Fase |
|---|---|---|---|
| `/` | Landing | HU-PLAT-03 | F0 (port completo en F6 si hay tiempo) |
| `/registro`, `/ingresar` | Acceso | HU-IAM-01, 02 | F1 |
| `/app/consentimiento` | Autorización de datos | HU-PRV-01, 02 | F1 |
| `/app/ficha` | Ficha del proveedor | HU-SUP-01, 02 | F1 |
| `/app/autoevaluacion` | Autoevaluación | HU-ASM-03 | F1 |
| `/app/diagnostico` | Diagnóstico | HU-ASM-05 | F1 |
| `/app/plan`, `/app/plan/[metaId]` | Plan y guía | HU-IMP-01…03, HU-CAL-01 | F1 |
| `/app/ficha/resumen` | Ficha imprimible | HU-IMP-04 | F1 |
| `/app` | Inicio con KPIs y alertas | HU-ERP-09, HU-TRZ-05 | F2 |
| `/app/erp/*` | Ventas, costos, entradas, mermas | HU-ERP-01…08 | F2 |
| `/app/lotes` | Aplicaciones, lotes, rótulos | HU-TRZ-01…05 | F2 |
| `/app/score`, `/app/recepciones`, `/app/mensajes` | Score, recepciones, mensajes | HU-SCO-05, HU-REC-04, HU-NOT-02 | F3 |
| `/app/aprender`, `/app/beneficios` | Micro-learning, beneficios | HU-LRN-04, HU-GAM-05 | F4 |
| `/app/impacto`, `/app/perfil/mis-datos` | Impacto, ARCO | HU-CAL-03…05, HU-PRV-06 | F5 |
| `/smile` y subrutas | Back-office | HU-SUP-*, HU-REC-*, HU-SCO-04, HU-RPT-*, admin | F3–F5 |

La tabbar de `/app` (4 destinos con ícono + texto) evoluciona por release: R1 *Diagnóstico · Plan · Ficha · Perfil*; desde R2 *Inicio · Registrar · Plan · Más* (el resto en "Más").

## 6. Presupuestos de rendimiento (CI)

| Ruta | JS inicial (gzip) | FCP 3G | Notas |
|---|---|---|---|
| `/app` (inicio) | ≤ 350 KB | < 1,8 s | WatermelonDB cargado tras el primer pintado |
| `/app/autoevaluacion` | ≤ 400 KB | < 1,8 s | GSAP core + SplitText |
| `/app/erp/ventas/nueva` | ≤ 300 KB | < 1,8 s | sin GSAP extra |
| `/smile/*` | ≤ 600 KB | — | escritorio |
| Total precache del SW | ≤ 2,0 MB | — | RNF-PERF-001 |

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| WatermelonDB + Next (decoradores, SSR) | Modelos sin decoradores o Babel solo para `data/db`; carga dinámica `ssr:false`; documentado en S0 |
| Safari iOS desaloja IndexedDB (7 días sin uso si no está instalada) | Pedir instalación a pantalla de inicio en el primer uso; `storage.persist()`; aviso si `persisted === false` |
| Bundle crece con GSAP y gráficas | Presupuestos en CI; imports por ruta; gráficas solo en `/smile` |
| Firma táctil en gama baja | Canvas a 1x, PNG comprimido, alternativa "escribir nombre completo" |
| Divergencia de reglas TS ↔ Python | Fixtures de `contracts/` en CI |
| Copys que no cumplen el tono | Checklist en la plantilla de PR + revisión de Industrial/Smile |

## 8. Cómo verificar

```bash
cd frontend
npm ci
npm run design:check && npm run lint && npm run typecheck && npm test
npm run build            # revisa "First Load JS" por ruta
npm run test:e2e         # Playwright (incluye escenarios offline)
make up                  # desde la raíz: stack completo → http://localhost:3000/app
```
