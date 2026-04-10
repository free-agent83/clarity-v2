import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dtcgToOklchString, toHex } from "./lib/color.mjs";
import { resolveRefs } from "./lib/resolve.mjs";

// ─── Helpers ───

function readJSON(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function mergeDeep(target, ...sources) {
  for (const source of sources) {
    for (const key of Object.keys(source)) {
      if (
        source[key] &&
        typeof source[key] === "object" &&
        !Array.isArray(source[key]) &&
        !("$value" in source[key])
      ) {
        target[key] = target[key] || {};
        mergeDeep(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

/** Recursively collect leaf tokens (nodes with $value) */
function flattenTokens(obj, path = [], inheritedType = null) {
  const results = [];
  const currentType = obj.$type || inheritedType;
  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;
    if (val && typeof val === "object" && "$value" in val) {
      results.push({
        path: [...path, key],
        $value: val.$value,
        $type: val.$type || currentType,
        $description: val.$description,
      });
    } else if (val && typeof val === "object") {
      results.push(...flattenTokens(val, [...path, key], currentType));
    }
  }
  return results;
}

function toKebab(path) {
  return path
    .map((s) => s.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase())
    .join("-");
}
function toPascal(path) {
  return path
    .map((s) => s.replace(/(^|-)(\w)/g, (_, _2, c) => c.toUpperCase()))
    .join("");
}
function toCamel(path) {
  const p = toPascal(path);
  return p[0].toLowerCase() + p.slice(1);
}

/** Format a token value as a CSS value (OKLCH for colors) */
function formatCSSValue(token) {
  if (token.$type === "color") {
    if (typeof token.$value === "object" && token.$value.colorSpace) {
      return dtcgToOklchString(token.$value);
    }
    if (typeof token.$value === "string") return token.$value;
  }
  if (token.$type === "shadow" && typeof token.$value === "object") {
    const s = token.$value;
    return `${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${s.color}`;
  }
  if (token.$type === "fontFamily" && Array.isArray(token.$value)) {
    return token.$value
      .map((f) => (f.includes(" ") ? `'${f}'` : f))
      .join(", ");
  }
  return String(token.$value);
}

/** Format a token value for React Native (hex for colors, unitless for dimensions) */
function formatRNValue(token) {
  if (token.$type === "color") {
    if (typeof token.$value === "object" && token.$value.colorSpace) {
      return toHex(token.$value);
    }
    return String(token.$value);
  }
  if (token.$type === "dimension" && typeof token.$value === "string") {
    const num = parseFloat(token.$value);
    if (!isNaN(num)) return num;
  }
  return token.$value;
}

/** Check if a $value is a DTCG reference string */
function isRef(value) {
  return typeof value === "string" && /^\{.+\}$/.test(value);
}

/** Convert a DTCG reference to a CSS var() reference */
function refToVar(value) {
  const path = value.slice(1, -1).split(".");
  return `var(--${toKebab(path)})`;
}

// ─── Build: Web CSS ───

function buildWebCSS(resolvedTokens, unresolvedTokens) {
  const flatResolved = flattenTokens(resolvedTokens);
  const flatUnresolved = flattenTokens(unresolvedTokens);

  const lines = [":root {"];
  for (let i = 0; i < flatResolved.length; i++) {
    const resolved = flatResolved[i];
    const unresolved = flatUnresolved[i];
    const name = `--${toKebab(resolved.path)}`;
    const desc = resolved.$description ? ` /** ${resolved.$description} */` : "";

    if (unresolved && isRef(unresolved.$value) && resolved.$type === "color") {
      // For semantic color tokens, emit var() reference to primitive
      lines.push(`  ${name}: ${refToVar(unresolved.$value)};${desc}`);
    } else {
      lines.push(`  ${name}: ${formatCSSValue(resolved)};${desc}`);
    }
  }
  lines.push("}");

  mkdirSync("dist/web", { recursive: true });
  writeFileSync(
    "dist/web/tokens.css",
    `/**\n * Do not edit directly, this file was auto-generated.\n */\n\n${lines.join("\n")}\n`
  );
}

// ─── Build: JS/TS ───

function buildJS(resolvedTokens) {
  const flat = flattenTokens(resolvedTokens);
  const jsLines = [
    `/**\n * Do not edit directly, this file was auto-generated.\n */\n`,
  ];
  const dtsLines = [...jsLines];

  for (const token of flat) {
    const name = toPascal(token.path);
    const value = formatCSSValue(token);
    const comment = token.$description ? ` // ${token.$description}` : "";
    jsLines.push(`export const ${name} = ${JSON.stringify(value)};${comment}`);
    dtsLines.push(`export declare const ${name}: string;${comment}`);
  }

  mkdirSync("dist/js", { recursive: true });
  writeFileSync("dist/js/tokens.js", jsLines.join("\n") + "\n");
  writeFileSync("dist/js/tokens.d.ts", dtsLines.join("\n") + "\n");
}

// ─── Build: React Native ───

function buildReactNative(resolvedTokens) {
  const flat = flattenTokens(resolvedTokens);
  const jsLines = [
    `/**\n * Do not edit directly, this file was auto-generated.\n */\n`,
  ];
  const dtsLines = [...jsLines];

  for (const token of flat) {
    const name = toCamel(token.path);
    const value = formatRNValue(token);
    const jsValue = typeof value === "number" ? value : JSON.stringify(value);
    jsLines.push(`export const ${name} = ${jsValue};`);
    dtsLines.push(
      `export declare const ${name}: ${typeof value === "number" ? "number" : "string"};`
    );
  }

  mkdirSync("dist/react-native", { recursive: true });
  writeFileSync("dist/react-native/tokens.js", jsLines.join("\n") + "\n");
  writeFileSync("dist/react-native/tokens.d.ts", dtsLines.join("\n") + "\n");
}

// ─── Build: JSON ───

function buildJSON(resolvedTokens) {
  function clean(obj) {
    if (obj && typeof obj === "object" && "$value" in obj) {
      return typeof obj.$value === "object" && obj.$value.colorSpace
        ? dtcgToOklchString(obj.$value)
        : obj.$value;
    }
    if (obj && typeof obj === "object") {
      const out = {};
      for (const [k, v] of Object.entries(obj)) {
        if (k.startsWith("$")) continue;
        out[k] = clean(v);
      }
      return out;
    }
    return obj;
  }

  mkdirSync("dist/json", { recursive: true });
  writeFileSync(
    "dist/json/tokens.json",
    JSON.stringify(clean(resolvedTokens), null, 2) + "\n"
  );
}

// ─── Main ───

const sources = [
  "src/color/primitive.tokens.json",
  "src/color/semantic.tokens.json",
  "src/spacing.tokens.json",
  "src/typography.tokens.json",
  "src/radius.tokens.json",
  "src/shadow.tokens.json",
];
const unresolved = mergeDeep({}, ...sources.map(readJSON));
const resolved = resolveRefs(mergeDeep({}, ...sources.map(readJSON)));

buildWebCSS(resolved, unresolved);
buildJS(resolved);
buildReactNative(resolved);
buildJSON(resolved);

console.log("Token build complete");
