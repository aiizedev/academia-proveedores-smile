import { appSchema, tableSchema } from "@nozbe/watermelondb";

/* Esquema local de la PWA (arquitectura.md §5). Las tablas siguen el contrato
   de sync: mismo nombre que en `/api/v1/sync/pull`. Montos COP como enteros,
   cantidades con la unidad original (la normalización es del backend, RF-ERP-008).
   Al cambiar el esquema: subir `version` y agregar migración en migrations.ts. */
export const SCHEMA_VERSION = 4;

export const consentsTable = tableSchema({
  name: "consents",
  columns: [
    { name: "consent_text_id", type: "string" },
    { name: "kind", type: "string", isIndexed: true }, // general | sensitive
    { name: "decision", type: "string" }, // granted | denied
    { name: "method", type: "string" }, // checkbox
    { name: "text_version", type: "string" },
    { name: "text_sha256", type: "string" },
    { name: "device_at", type: "number" },
    { name: "created_at", type: "number" },
  ],
});

export const supplierProfileTable = tableSchema({
  name: "supplier_profile",
  columns: [
    { name: "person_type", type: "string", isOptional: true }, // natural | juridica
    { name: "tax_id", type: "string" },
    { name: "tax_dv", type: "string" },
    { name: "legal_name", type: "string" },
    { name: "legal_rep", type: "string", isOptional: true },
    { name: "department_code", type: "string" }, // DIVIPOLA 2 dígitos
    { name: "municipality_code", type: "string" }, // DIVIPOLA 5 dígitos
    { name: "vereda", type: "string", isOptional: true },
    { name: "contact_channel", type: "string", isOptional: true }, // whatsapp | llamada | correo
    { name: "main_category", type: "string" },
    { name: "completed_at", type: "number", isOptional: true },
    { name: "created_at", type: "number" },
    { name: "updated_at", type: "number" },
  ],
});

// P2 — Declaración de veracidad al enviar (RF-PRV-004), append-only.
export const declarationsTable = tableSchema({
  name: "declarations",
  columns: [
    { name: "assessment_id", type: "string", isIndexed: true },
    { name: "text_version", type: "string" },
    { name: "signer_name", type: "string" },
    { name: "method", type: "string" }, // nombre (la firma táctil llega después)
    { name: "device_at", type: "number" },
    { name: "created_at", type: "number" },
  ],
});

export const schema = appSchema({
  version: SCHEMA_VERSION,
  tables: [
    // P1 — Mini ERP (RF-ERP-001)
    tableSchema({
      name: "erp_sales",
      columns: [
        { name: "sold_on", type: "string" }, // fecha de negocio AAAA-MM-DD (America/Bogota)
        { name: "customer_kind", type: "string" }, // "smile" | "otro"
        { name: "customer_name", type: "string", isOptional: true },
        { name: "product_id", type: "string", isIndexed: true },
        { name: "quantity", type: "number" },
        { name: "unit", type: "string" }, // kg | bulto | arroba | litro | unidad
        { name: "amount_cop", type: "number" }, // entero
        { name: "voided_reason", type: "string", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    // P2 — Consentimiento append-only (RF-PRV-003): nunca se actualiza ni borra.
    consentsTable,
    // P2 — Ficha del proveedor, una sola fila (RF-SUP-001, CU-04).
    supplierProfileTable,
    declarationsTable,
    // P2 — Autoevaluación (RF-ASM-003, RF-ASM-004)
    tableSchema({
      name: "assessments",
      columns: [
        { name: "cycle_id", type: "string", isIndexed: true }, // p. ej. 2026-C3
        { name: "form_version", type: "string" },
        { name: "category", type: "string", isOptional: true }, // categoría del banco (fruver, lacteos…)
        { name: "size", type: "string", isOptional: true }, // micro | pequena | mediana | grande
        { name: "status", type: "string" }, // draft | submitted
        { name: "current_index", type: "number" },
        { name: "submitted_at", type: "number", isOptional: true },
        { name: "created_at", type: "number" },
        { name: "updated_at", type: "number" },
      ],
    }),
    tableSchema({
      name: "assessment_answers",
      columns: [
        { name: "assessment_id", type: "string", isIndexed: true },
        { name: "question_id", type: "string" },
        { name: "answer", type: "string" }, // si | no | na | pnr, o JSON de códigos (multiselección)
        { name: "detail", type: "string", isOptional: true }, // texto libre opcional, no puntúa
        { name: "answered_at", type: "number" },
      ],
    }),
  ],
});
