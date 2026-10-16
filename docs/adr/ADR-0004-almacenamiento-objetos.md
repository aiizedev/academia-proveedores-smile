# ADR-0004 · Almacenamiento de objetos detrás de un puerto

- **Estado:** Aceptada · 2026-10-15
- **Contexto:** Los specs indican Firebase / Cloud Storage [SPEC-SOT §5, SPEC-BASE §2]. El entorno de desarrollo debe funcionar en contenedores sin cuentas externas (C-07).
- **Decisión:** Puerto `FileStorage` en `shared.application` (`presign_put`, `presign_get`, `head`, `delete`). Adaptador `S3FileStorage` (boto3) para el servidor S3 de dev/test (SeaweedFS, ADR-0008) y para cualquier S3; adaptador `GcsFileStorage` para Google Cloud Storage (el backend de Firebase Storage) en producción. Selección por `STORAGE_PROVIDER`. Los clientes suben y descargan directo con URLs firmadas.
- **Consecuencias:** (+) Cero dependencia de Firebase en local; el dominio ignora el proveedor. (−) Dos adaptadores que mantener; se cubren con la misma suite de contrato.
