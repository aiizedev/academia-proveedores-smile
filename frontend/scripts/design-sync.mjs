#!/usr/bin/env node
// Copia los tokens canónicos (docs/diseno/tokens.css) al frontend.
// La fuente de verdad es docs/diseno/; la copia se versiona para que el build
// de Docker (contexto = frontend/) no dependa de rutas externas.
//   node scripts/design-sync.mjs          → copia
//   node scripts/design-sync.mjs --check  → falla si la copia difiere (CI)
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = resolve(root, "../docs/diseno/tokens.css");
const target = resolve(root, "src/design/tokens.css");
const header =
  "/* GENERADO por scripts/design-sync.mjs desde docs/diseno/tokens.css — no editar aquí. */\n";

if (!existsSync(source)) {
  console.error(`No existe la fuente de tokens: ${source}`);
  process.exit(2);
}
const expected = header + readFileSync(source, "utf8");

if (process.argv.includes("--check")) {
  const current = existsSync(target) ? readFileSync(target, "utf8") : "";
  if (current !== expected) {
    console.error("src/design/tokens.css difiere de docs/diseno/tokens.css. Ejecuta: npm run design:sync");
    process.exit(1);
  }
  console.log("Tokens sincronizados.");
} else {
  writeFileSync(target, expected);
  console.log(`Tokens copiados a ${target}`);
}
