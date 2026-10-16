# Contratos compartidos

Artefactos que comparten `frontend/` y `backend/`. Un cambio aquí rompe el CI de ambos hasta que los dos lo respeten.

| Ruta | Qué es | Quién lo valida |
|---|---|---|
| `fixtures/assessment-scoring.json` | Casos de prueba de las reglas de puntaje por eje, niveles, críticas, Pilar 1 y orden del plan de 3 metas (RF-ASM-005…008, RF-IMP-001, S-01, S-02, S-03, S-09) | `backend/tests/unit/assessment`, `frontend/src/domain/*.test.ts` |
| `fixtures/question-bank.json` | Banco de preguntas: núcleo del formulario de Smile (DOC-AUTOEVAL) + extras ODS, GRI, ISO 14001 y B Corp, con eje, peso, criticidad, nivel de tamaño y categorías (C-16, S-18, S-19) | backend (migración de datos de referencia y composición), frontend (formulario offline) |
| `fixtures/form-paths.json` | Casos de caminos del formulario (qué preguntas ve cada sector y tamaño según sus respuestas), puntaje por eje, P1 y plan con siguiente paso (S-19, S-20, S-21) | backend (composición y plan), frontend (formulario offline y diagnóstico) |
| `openapi.json` (generado con `make openapi`) | Contrato HTTP exportado por FastAPI, claves ordenadas | CI (job backend): falla y muestra el diff si no coincide con la API. El frontend genera su cliente TS desde este archivo |

Ver [ADR-0005](../docs/adr/ADR-0005-local-first-watermelondb.md).

## Convenciones del fixture de scoring
- Puntajes con 2 decimales, redondeo *half-up*.
- `na` (No aplica) y `pnr` (Prefiero no responder) se excluyen del numerador y del denominador.
- Un eje sin preguntas aplicables tiene `score: null`, no entra al Pilar 1 ni al plan.
- `critical_when`: si la respuesta está en la lista, el eje queda `urgent: true` y su nivel no puede ser `avanzado` (se limita a `desarrollo`).
- Plan: ordenar brechas por `urgente` > `inicial` > `desarrollo`, desempate por menor `score` y luego por orden de `axes_order`; si hay menos de 3, completar con ejes `avanzado` de menor `score` como `mantener`.
