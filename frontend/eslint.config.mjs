import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

/* Capas de PLAN_FRONTEND §3.1 (arquitectura.md §4.2). El primer patrón que
   coincide define el tipo, así que el back-office va antes que `app`. */
const elements = [
  { type: "domain", pattern: "src/domain/**", mode: "full" },
  { type: "db", pattern: "src/data/db/**", mode: "full" },
  { type: "sync", pattern: "src/data/sync/**", mode: "full" },
  { type: "api", pattern: "src/data/api/**", mode: "full" },
  { type: "catalog", pattern: "src/data/catalog/**", mode: "full" },
  { type: "feature", pattern: "src/features/*/**", mode: "full", capture: ["module"] },
  { type: "ui", pattern: ["src/components/ui/**", "src/components/icons.tsx"], mode: "full" },
  { type: "shell", pattern: "src/components/shell/**", mode: "full" },
  { type: "design", pattern: "src/design/**", mode: "full" },
  { type: "hooks", pattern: "src/hooks/**", mode: "full" },
  { type: "lib", pattern: "src/lib/**", mode: "full" },
  { type: "sw", pattern: "src/sw/**", mode: "full" },
  { type: "backoffice", pattern: "src/app/*backoffice*/**", mode: "full" },
  { type: "app", pattern: "src/app/**", mode: "full" },
];

const allow = (from, to) => ({ from, allow: to });

const boundaryRules = [
  allow("domain", ["domain"]),
  allow("db", ["db", "domain", "lib"]),
  allow("sync", ["sync", "db", "api", "lib", "domain"]),
  allow("api", ["api", "lib"]),
  allow("catalog", ["catalog"]),
  allow("feature", [["feature", { module: "${from.module}" }], "domain", "db", "sync", "catalog", "ui", "design", "hooks", "lib"]),
  allow("ui", ["ui", "design", "lib"]),
  allow("shell", ["shell", "ui", "design", "hooks", "lib", "sync"]),
  allow("design", ["design"]),
  allow("hooks", ["hooks", "design", "lib"]),
  allow("lib", ["lib", "domain"]),
  allow("sw", ["sw", "lib"]),
  // /smile es online: no usa WatermelonDB ni la cola de sync (HU-PLAT-03).
  allow("backoffice", ["backoffice", "app", "feature", "domain", "api", "ui", "shell", "design", "hooks", "lib"]),
  allow("app", ["app", "backoffice", "feature", "domain", "db", "sync", "api", "catalog", "ui", "shell", "design", "hooks", "lib"]),
];

/* GUIA_VISUAL §1 y §10: color, radio, sombra, desenfoque y duración solo
   salen de tokens. Aplica a cadenas y plantillas fuera de src/design/. */
const LITERAL_PATTERNS = [
  ["(^|[^&\\w])#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\\b", "Color hex literal: use el token (p. ej. --brand-olive / clase bg-olive-800)."],
  ["\\b(rgba?|hsla?|oklch)\\(", "Color literal: use un token de docs/diseno/tokens.css."],
  ["\\b(duration|delay)-\\[\\d", "Duración literal: use var(--dur-*) o los presets de @/design/motion."],
  ["\\brounded(-[a-z]+)?-\\[\\d", "Radio literal: use rounded-<token> (--radius-*)."],
  ["\\bshadow-\\[\\d", "Sombra literal: use shadow-<token> (--shadow-*)."],
  ["\\bblur-\\[\\d", "Desenfoque literal: use var(--blur-dock)."],
];

const literalSelectors = LITERAL_PATTERNS.flatMap(([re, message]) => [
  { selector: `Literal[value=/${re}/]`, message },
  { selector: `TemplateElement[value.raw=/${re}/]`, message },
]);

const config = [
  { ignores: [".next/**", "node_modules/**", "public/sw.js", "public/swe-worker-*.js", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { boundaries },
    settings: {
      "boundaries/elements": elements,
      "import/resolver": { typescript: { alwaysTryTypes: true } },
    },
    rules: {
      "boundaries/element-types": ["error", { default: "disallow", rules: boundaryRules }],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/design/**", "src/**/*.test.{ts,tsx}"],
    rules: { "no-restricted-syntax": ["error", ...literalSelectors] },
  },
];

export default config;
