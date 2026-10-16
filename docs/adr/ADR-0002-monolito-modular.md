# ADR-0002 · Monolito modular

- **Estado:** Aceptada · 2026-10-15
- **Contexto:** 450 proveedores y ~10 usuarios internos no justifican microservicios; el dominio sí tiene 16 contextos claros (requerimientos §1.4). El equipo es pequeño y académico; se quiere poder extraer módulos en el futuro.
- **Decisión:** Un solo proceso FastAPI (más un worker con el mismo código). Cada módulo: paquete `smile.modules.<m>`, esquema PostgreSQL propio, migraciones con prefijo, y una fachada `public.py` como única superficie importable. Efectos entre módulos por eventos de dominio persistidos en un outbox transaccional (ADR-0007). Prohibido el JOIN entre esquemas; las vistas cruzadas viven en proyecciones de `reporting`.
- **Consecuencias:** (+) Un despliegue, transacciones locales simples, límites claros que permiten extraer un servicio más adelante. (+) RF-PRV-007 se cumple por construcción. (−) Consistencia eventual entre módulos (milisegundos a segundos) y duplicación de algunos datos en proyecciones. Verificación: contratos import-linter `independence` y `layers` (RNF-MNT-002).
