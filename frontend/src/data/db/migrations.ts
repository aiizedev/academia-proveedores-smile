import { schemaMigrations } from "@nozbe/watermelondb/Schema/migrations";

/* Migraciones del esquema local (PLAN_FRONTEND §3.2 paso 3). Cada cambio de
   schema.ts sube SCHEMA_VERSION y agrega aquí el paso `toVersion` que lo lleva
   a cabo, para no borrar los datos que el proveedor tiene sin sincronizar. */
export const migrations = schemaMigrations({ migrations: [] });
