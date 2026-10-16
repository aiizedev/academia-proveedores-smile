Cliente HTTP generado desde `contracts/openapi.json` (openapi-typescript + openapi-fetch, HU-PLAT-05, RNF-MNT-004).

- `schema.d.ts` es **generado** y se versiona (el build de Docker no ve `contracts/`). No editar a mano.
- Cuando el backend cambie el contrato (`make openapi`), ejecutar `npm run api:gen` y versionar el resultado.
- CI ejecuta `npm run api:check` y falla si el archivo no coincide con el contrato.
