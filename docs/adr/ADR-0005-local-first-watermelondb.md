# ADR-0005 · Local-first con WatermelonDB y reglas duplicadas verificadas

- **Estado:** Aceptada · 2026-10-15
- **Contexto:** El proveedor debe operar 100 % offline [SPEC-BASE §8.1] con WatermelonDB [SPEC-SOT §5.1]. El diagnóstico, el plan y la carencia deben calcularse sin red, pero el backend es la fuente oficial [SPEC-BASE §2.2].
- **Decisión:** La PWA lee y escribe solo en WatermelonDB (adaptador LokiJS con IndexedDB incremental) y sincroniza con el protocolo pull/push nativo de WatermelonDB contra `sync`. Las reglas puras (puntaje por eje, niveles, críticas, plan de 3 metas, carencia, huella, formato de rótulo) se implementan en Python y en TypeScript, y ambos se prueban contra `contracts/fixtures/*.json`; el CI falla si divergen. El resultado del servidor reemplaza al local al sincronizar.
- **Consecuencias:** (+) UI instantánea y offline real. (−) Doble implementación; mitigada por fixtures obligatorios y por mantener las reglas pequeñas y puras. WatermelonDB en web requiere configuración de decoradores (Babel o modelos sin decoradores); se resuelve en S0 del plan frontend.
