#!/usr/bin/env node
// Genera los tipos del cliente HTTP desde contracts/openapi.json (HU-PLAT-05).
// Se versiona la salida para que el build de Docker (contexto = frontend/) no
// dependa de rutas externas, igual que los tokens.
//   node scripts/api-gen.mjs          → escribe src/data/api/schema.d.ts
//   node scripts/api-gen.mjs --check  → falla si el archivo versionado difiere (CI)
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = resolve(root, "../contracts/openapi.json");
const target = resolve(root, "src/data/api/schema.d.ts");
const header =
  "/* GENERADO por scripts/api-gen.mjs desde contracts/openapi.json — no editar aquí. */\n";

if (!existsSync(source)) {
  console.error(`No existe el contrato: ${source}. Ejecuta "make openapi" en la raíz.`);
  process.exit(2);
}
const expected = header + astToString(await openapiTS(pathToFileURL(source)));

if (process.argv.includes("--check")) {
  const current = existsSync(target) ? readFileSync(target, "utf8") : "";
  if (current !== expected) {
    console.error("src/data/api/schema.d.ts difiere de contracts/openapi.json. Ejecuta: npm run api:gen");
    process.exit(1);
  }
  console.log("Cliente OpenAPI al día.");
} else {
  writeFileSync(target, expected);
  console.log(`Tipos generados en ${target}`);
}
