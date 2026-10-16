import { addColumns, createTable, schemaMigrations } from "@nozbe/watermelondb/Schema/migrations";
import { consentsTable, declarationsTable, goalChecksTable, supplierProfileTable } from "./schema";

/* Migraciones del esquema local (PLAN_FRONTEND §3.2 paso 3). Cada cambio de
   schema.ts sube SCHEMA_VERSION y agrega aquí el paso `toVersion` que lo lleva
   a cabo, para no borrar los datos que el proveedor tiene sin sincronizar. */
export const migrations = schemaMigrations({
  migrations: [
    // v2 · HU-PRV-01: consentimientos locales.
    { toVersion: 2, steps: [createTable({ name: consentsTable.name, columns: Object.values(consentsTable.columns) })] },
    // v3 · HU-SUP-01: ficha del proveedor.
    { toVersion: 3, steps: [createTable({ name: supplierProfileTable.name, columns: Object.values(supplierProfileTable.columns) })] },
    // v4 · HU-ASM-03: contexto del formulario, detalle de respuesta y declaración.
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: "assessments",
          columns: [
            { name: "category", type: "string", isOptional: true },
            { name: "size", type: "string", isOptional: true },
          ],
        }),
        addColumns({ table: "assessment_answers", columns: [{ name: "detail", type: "string", isOptional: true }] }),
        createTable({ name: declarationsTable.name, columns: Object.values(declarationsTable.columns) }),
      ],
    },
    // v5 · HU-IMP-03: checklist de las metas.
    { toVersion: 5, steps: [createTable({ name: goalChecksTable.name, columns: Object.values(goalChecksTable.columns) })] },
  ],
});
