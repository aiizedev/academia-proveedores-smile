# ADR-0001 · Arquitectura hexagonal en el backend

- **Estado:** Aceptada · 2026-10-15
- **Contexto:** El backend concentra reglas que deben ser exactas y estables (scoring 50/30/20, carencia ICA, ROI/SROI) [SPEC-SOT §1.2, §2.2, §2.3; D2 §3.1 #5], mientras la infraestructura cambiará: Firebase vs MinIO (C-07), PostgreSQL/TimescaleDB, formatos de reporte aún no definidos (Q-05). El equipo pidió arquitectura hexagonal.
- **Decisión:** Cada módulo separa `domain` (reglas puras), `application` (casos de uso y puertos como `typing.Protocol`), `infrastructure` (adaptadores salientes) y `api` (adaptador entrante FastAPI). Las dependencias apuntan hacia el dominio. La composición ocurre en `module.py` y `main.py`.
- **Consecuencias:** (+) Reglas testeables sin base de datos; adaptadores intercambiables; el dominio Python se puede contrastar con el espejo TS (ADR-0005). (−) Más archivos y mapeo DTO↔dominio↔ORM. Mitigación: plantilla de módulo y generador (`make module name=...`). Verificación: import-linter (RNF-MNT-001).
