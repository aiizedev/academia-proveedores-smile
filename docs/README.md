# Documentación

Orden de lectura recomendado para alguien nuevo en el proyecto: 1 → 2 → 3 → 4 → 5.

| # | Carpeta / archivo | Qué contiene |
|---|---|---|
| 0 | [`DEMO.md`](DEMO.md) | **Cómo ver la demo del POC** y qué está simulado. |
| 1 | [`specs/`](specs/README.md) | **Fuente de verdad.** Specs PDF y documentos de dominio, con índice por secciones y regla de precedencia. |
| 2 | [`sistema/vision-y-alcance.md`](sistema/vision-y-alcance.md) | Problema, visión, objetivos medibles, interesados, riesgos. |
| 3 | [`sistema/requerimientos.md`](sistema/requerimientos.md) | SRS (ISO/IEC/IEEE 29148): RF/RNF con ID, prioridad, fuente, verificación y release; catálogo de casos de uso; trazabilidad. |
| 3a | [`sistema/casos-de-uso.md`](sistema/casos-de-uso.md) | CU-01…CU-30 completamente detallados. |
| 3b | [`sistema/historias-de-usuario.md`](sistema/historias-de-usuario.md) | Backlog `HU-<MÓDULO>-NN` con criterios Gherkin, puntos y sprint. |
| 3c | [`sistema/conflictos-y-supuestos.md`](sistema/conflictos-y-supuestos.md) | Conflictos entre fuentes (C-xx), supuestos parametrizables (S-xx), preguntas abiertas (Q-xx). |
| 4 | [`sistema/arquitectura.md`](sistema/arquitectura.md) | C4, monolito modular hexagonal, sync, seguridad, **contrato de infraestructura**. |
| 4a | [`sistema/esquema-datos.md`](sistema/esquema-datos.md) | Modelo de datos por módulo y esquema WatermelonDB. |
| 4b | [`sistema/stack-tecnologico.md`](sistema/stack-tecnologico.md) | Tecnologías elegidas y descartadas. |
| 4c | [`adr/`](adr/) | Decisiones de arquitectura ADR-0001…0007. |
| 5 | [`diseno/GUIA_VISUAL.md`](diseno/GUIA_VISUAL.md) | Sistema visual y de movimiento (+ `tokens.css`, `motion.js`). |
| 5a | [`sistema/guia-usabilidad.md`](sistema/guia-usabilidad.md) | Reglas de interacción rural y tono de voz. |
| 6 | [`planes/`](planes/) | [Plan maestro](planes/PLAN_MAESTRO.md), [frontend](planes/PLAN_FRONTEND.md), [backend](planes/PLAN_BACKEND.md), [infraestructura](planes/PLAN_INFRA.md). |
| — | [`referencia/maqueta-v0/`](referencia/maqueta-v0/SNAPSHOT.md) | Copia congelada del prototipo (paleta v1.0). |

**Regla de oro:** todo documento cita su fuente con `[CÓDIGO §sección]`. Si algo no tiene fuente, es un supuesto y va a `conflictos-y-supuestos.md`.
