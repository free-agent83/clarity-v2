# Token Alignment Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Style Dictionary with a bespoke build script, convert tokens to OKLCH, add shadcn-compatible output for Minivoda, and remove Chromatic.

**Architecture:** DTCG JSON source files (OKLCH structured color objects) → bespoke Node.js build script (`build.mjs`) → multi-platform outputs (CSS, shadcn CSS, JS/TS, React Native, JSON). The shadcn output produces flat-named CSS custom properties in `:root` and `.dark` scopes for direct consumption by Minivoda's shadcn/ui components.

**Tech Stack:** Node.js, culori (color conversion), W3C DTCG format, OKLCH color space, Nx monorepo

**Spec:** `docs/superpowers/specs/2026-04-07-token-alignment-design.md`
**ADRs:** `architecture.md` → ADR-001 (bespoke build), ADR-002 (Chromatic removed), ADR-004 (Fumadocs over Zeroheight)

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `packages/tokens/src/color/primitive.tokens.json` | OKLCH primitive palette with hex fallbacks |
| `packages/tokens/src/color/semantic.tokens.json` | Clarity-v2 rich semantic tokens (references primitives) |
| `packages/tokens/src/shadcn/light.tokens.json` | 32 shadcn light theme color tokens (references primitives) |
| `packages/tokens/src/shadcn/dark.tokens.json` | 32 shadcn dark theme color tokens |
| `packages/tokens/src/shadcn/radius.tokens.json` | Base radius token for shadcn |
| `packages/tokens/build.mjs` | Bespoke build script — reads DTCG, resolves refs, outputs all formats |
| `packages/tokens/lib/color.mjs` | Thin culori wrapper for OKLCH↔hex conversion |
| `packages/tokens/tests/build.test.mjs` | Tests for reference resolution and color conversion |

### Modified files
| File | Change |
|------|--------|
| `packages/tokens/package.json` | Remove `style-dictionary`, add `culori` + `vitest`, update scripts/exports |
| `packages/tokens/project.json` | Update Nx build command |
| `packages/components/package.json` | Remove `chromatic` dependency and script |
| `README.md` | Update token pipeline description |
| `ds-diagnosis.md` | Update SD/Chromatic/Zeroheight references |
| `code-first-ds.md` | Add note on bespoke choice, update Zeroheight refs |
| `mobile-ds-diagnosis.md` | Update SD references |

### Deleted files
| File | Reason |
|------|--------|
| `packages/tokens/style-dictionary.config.mjs` | Replaced by `build.mjs` |
| `packages/tokens/src/color.tokens.json` | Split into `color/primitive.tokens.json` + `color/semantic.tokens.json` |

---

## Task 1: Install dependencies and update package config

**Files:**
- Modify: `packages/tokens/package.json`
- Modify: `packages/tokens/project.json`

- [ ] **Step 1: Update `packages/tokens/package.json`**

```json
{
  "name": "@nivoda/tokens",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Nivoda design tokens — W3C DTCG format, bespoke build pipeline",
  "main": "dist/js/tokens.js",
  "types": "dist/js/tokens.d.ts",
  "exports": {
    ".": "./dist/web/tokens.css",
    "./shadcn": "./dist/shadcn/tokens.css",
    "./js": "./dist/js/tokens.js",
    "./react-native": "./dist/react-native/tokens.js",
    "./json": "./dist/json/tokens.json"
  },
  "scripts": {
    "build": "node build.mjs",
    "test": "vitest run"
  },
  "devDependencies": {
    "culori": "^4.0.0",
    "style-dictionary": "^5.4.0",
    "vitest": "^3.1.0"
  }
}
```

Note: `style-dictionary` is kept temporarily so `nx build tokens` still works via the existing config until Task 7.

- [ ] **Step 2: Update `packages/tokens/project.json`**

```json
{
  "name": "tokens",
  "$schema": "../../node_modules/nx/schemas/project-schema.json",
  "sourceRoot": "packages/tokens/src",
  "projectType": "library",
  "tags": ["scope:tokens", "type:foundation"],
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "command": "node build.mjs",
        "cwd": "packages/tokens"
      },
      "inputs": ["default"],
      "outputs": ["{projectRoot}/dist"]
    },
    "test": {
      "executor": "nx:run-commands",
      "options": {
        "command": "npx vitest run",
        "cwd": "packages/tokens"
      }
    }
  }
}
```

- [ ] **Step 3: Install dependencies**

Run: `npm install` (from repo root)
Expected: `culori` and `vitest` installed alongside existing `style-dictionary`

- [ ] **Step 4: Commit**

```bash
git add packages/tokens/package.json packages/tokens/project.json package-lock.json
git commit -m "chore(tokens): update package config for bespoke build pipeline"
```

---

## Task 2: Create color conversion utility

**Files:**
- Create: `packages/tokens/lib/color.mjs`
- Create: `packages/tokens/tests/build.test.mjs`

- [ ] **Step 1: Write failing tests for color conversion**

Create `packages/tokens/tests/build.test.mjs`:

```javascript
import { describe, it, expect } from "vitest";
import { dtcgToOklchString, toHex } from "../lib/color.mjs";

describe("dtcgToOklchString", () => {
  it("converts structured DTCG color object to oklch string", () => {
    const result = dtcgToOklchString({
      colorSpace: "oklch",
      components: [1, 0, 0],
    });
    expect(result).toBe("oklch(1 0 0)");
  });

  it("includes alpha when not 1", () => {
    const result = dtcgToOklchString({
      colorSpace: "oklch",
      components: [1, 0, 0],
      alpha: 0.5,
    });
    expect(result).toBe("oklch(1 0 0 / 0.5)");
  });

  it("omits alpha when 1", () => {
    const result = dtcgToOklchString({
      colorSpace: "oklch",
      components: [0.985, 0.002, 107],
      alpha: 1,
    });
    expect(result).toBe("oklch(0.985 0.002 107)");
  });
});

describe("toHex", () => {
  it("converts DTCG structured object to hex", () => {
    const result = toHex({
      colorSpace: "oklch",
      components: [1, 0, 0],
      hex: "#ffffff",
    });
    expect(result).toBe("#ffffff");
  });

  it("uses hex fallback when available", () => {
    const result = toHex({
      colorSpace: "oklch",
      components: [0.985, 0.002, 107],
      hex: "#fafaf9",
    });
    expect(result).toBe("#fafaf9");
  });

  it("converts oklch to hex when no fallback", () => {
    const result = toHex({
      colorSpace: "oklch",
      components: [1, 0, 0],
    });
    // white in oklch → #ffffff
    expect(result).toBe("#ffffff");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/tokens && npx vitest run`
Expected: FAIL — module `../lib/color.mjs` not found

- [ ] **Step 3: Implement `lib/color.mjs`**

Create `packages/tokens/lib/color.mjs`:

```javascript
import { oklch, formatHex } from "culori";

/**
 * Convert a DTCG structured color object to an oklch() CSS string.
 * @param {{ colorSpace: string, components: number[], alpha?: number }} value
 * @returns {string} e.g. "oklch(0.985 0.002 107)" or "oklch(1 0 0 / 0.5)"
 */
export function dtcgToOklchString(value) {
  const [l, c, h] = value.components;
  const base = `oklch(${l} ${c} ${h})`;
  if (value.alpha !== undefined && value.alpha !== 1) {
    return `oklch(${l} ${c} ${h} / ${value.alpha})`;
  }
  return base;
}

/**
 * Convert a DTCG structured color object to a hex string.
 * Uses the hex fallback if available, otherwise converts via culori.
 * @param {{ colorSpace: string, components: number[], hex?: string }} value
 * @returns {string} e.g. "#ffffff"
 */
export function toHex(value) {
  if (value.hex) return value.hex;
  const [l, c, h] = value.components;
  return formatHex({ mode: "oklch", l, c, h });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/tokens && npx vitest run`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add packages/tokens/lib/color.mjs packages/tokens/tests/build.test.mjs
git commit -m "feat(tokens): add OKLCH color conversion utility with tests"
```

---

## Task 3: Build the reference resolver

**Files:**
- Create: `packages/tokens/lib/resolve.mjs`
- Modify: `packages/tokens/tests/build.test.mjs`

- [ ] **Step 1: Write failing tests for reference resolution**

Append to `packages/tokens/tests/build.test.mjs`:

```javascript
import { resolveRefs } from "../lib/resolve.mjs";

describe("resolveRefs", () => {
  it("resolves a simple reference", () => {
    const tokens = {
      color: {
        primitive: {
          white: { $value: "#ffffff" },
        },
        semantic: {
          background: { $value: "{color.primitive.white}" },
        },
      },
    };
    const resolved = resolveRefs(tokens);
    expect(resolved.color.semantic.background.$value).toBe("#ffffff");
  });

  it("resolves nested references", () => {
    const tokens = {
      a: { $value: "{b}" },
      b: { $value: "{c}" },
      c: { $value: "final" },
    };
    const resolved = resolveRefs(tokens);
    expect(resolved.a.$value).toBe("final");
  });

  it("resolves references in DTCG structured color objects", () => {
    const tokens = {
      color: {
        primitive: {
          white: {
            $value: { colorSpace: "oklch", components: [1, 0, 0], hex: "#ffffff" },
          },
        },
      },
      shadcn: {
        background: { $value: "{color.primitive.white}" },
      },
    };
    const resolved = resolveRefs(tokens);
    expect(resolved.shadcn.background.$value).toEqual({
      colorSpace: "oklch",
      components: [1, 0, 0],
      hex: "#ffffff",
    });
  });

  it("leaves non-reference values untouched", () => {
    const tokens = {
      spacing: { $value: "4px" },
    };
    const resolved = resolveRefs(tokens);
    expect(resolved.spacing.$value).toBe("4px");
  });

  it("leaves OKLCH string values untouched", () => {
    const tokens = {
      border: { $value: "oklch(1 0 0 / 0.1)" },
    };
    const resolved = resolveRefs(tokens);
    expect(resolved.border.$value).toBe("oklch(1 0 0 / 0.1)");
  });

  it("throws on missing reference", () => {
    const tokens = {
      a: { $value: "{does.not.exist}" },
    };
    expect(() => resolveRefs(tokens)).toThrow("does.not.exist");
  });

  it("throws on circular reference", () => {
    const tokens = {
      a: { $value: "{b}" },
      b: { $value: "{a}" },
    };
    expect(() => resolveRefs(tokens)).toThrow();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/tokens && npx vitest run`
Expected: FAIL — module `../lib/resolve.mjs` not found

- [ ] **Step 3: Implement `lib/resolve.mjs`**

Create `packages/tokens/lib/resolve.mjs`:

```javascript
/**
 * Deep-clone a token tree and resolve all DTCG references.
 * References are strings matching {path.to.token} in $value fields.
 * @param {object} tokens - The merged token tree
 * @returns {object} A new tree with all references resolved to concrete values
 */
export function resolveRefs(tokens) {
  const clone = JSON.parse(JSON.stringify(tokens));
  const resolving = new Set(); // cycle detection
  resolveNode(clone, clone, resolving);
  return clone;
}

function resolveNode(node, root, resolving) {
  if (node === null || typeof node !== "object") return;

  if ("$value" in node && typeof node.$value === "string") {
    const match = node.$value.match(/^\{(.+)\}$/);
    if (match) {
      const refPath = match[1];
      if (resolving.has(refPath)) {
        throw new Error(`Circular reference detected: ${refPath}`);
      }
      resolving.add(refPath);
      const resolved = getByPath(root, refPath);
      if (resolved === undefined) {
        throw new Error(`Unresolved reference: ${refPath}`);
      }
      if (resolved && typeof resolved === "object" && "$value" in resolved) {
        resolveNode(resolved, root, resolving);
        node.$value = resolved.$value;
      } else {
        node.$value = resolved;
      }
      resolving.delete(refPath);
    }
    return;
  }

  for (const key of Object.keys(node)) {
    if (key.startsWith("$")) continue;
    resolveNode(node[key], root, resolving);
  }
}

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/tokens && npx vitest run`
Expected: All 12 tests PASS

- [ ] **Step 5: Commit**

```bash
git add packages/tokens/lib/resolve.mjs packages/tokens/tests/build.test.mjs
git commit -m "feat(tokens): add DTCG reference resolver with tests"
```

---

## Task 4: Split color.tokens.json into primitive + semantic

**Files:**
- Create: `packages/tokens/src/color/primitive.tokens.json`
- Create: `packages/tokens/src/color/semantic.tokens.json`
- Delete: `packages/tokens/src/color.tokens.json`

- [ ] **Step 1: Create `src/color/` directory**

Run: `mkdir -p packages/tokens/src/color`

- [ ] **Step 2: Create `src/color/primitive.tokens.json`**

Convert all hex values from the existing `color.tokens.json` primitives to DTCG structured OKLCH objects with hex fallbacks. Use oklch.com or culori to derive the OKLCH components from each hex value.

The file must contain the full `color.primitive.*` tree with every stone (50-950), purple (50-900), green (50-700), red (50-700), and amber (50, 100, 500-700) value converted. Example structure:

```json
{
  "color": {
    "$type": "color",
    "primitive": {
      "white": {
        "$value": { "colorSpace": "oklch", "components": [1, 0, 0], "hex": "#ffffff" },
        "$description": "Pure white"
      },
      "black": {
        "$value": { "colorSpace": "oklch", "components": [0.153, 0.006, 107.1], "hex": "#0c0a09" },
        "$description": "Nivoda black (stone-950)"
      },
      "stone": {
        "$description": "Warm gray neutral scale — Nivoda's neutral palette",
        "50": { "$value": { "colorSpace": "oklch", "components": [0.985, 0.002, 106.4], "hex": "#fafaf9" } }
      }
    }
  }
}
```

**Important:** Run this one-shot conversion script to generate all OKLCH components from the existing hex values. Run from `packages/tokens/`:

```javascript
// scripts/convert-hex-to-oklch.mjs — run once, then delete
import { oklch, parse } from "culori";
import { readFileSync } from "node:fs";

const src = JSON.parse(readFileSync("src/color.tokens.json", "utf-8"));
const primitives = src.color.primitive;

function convert(obj, depth = 0) {
  for (const [key, val] of Object.entries(obj)) {
    if (val.$value && typeof val.$value === "string" && val.$value.startsWith("#")) {
      const c = oklch(parse(val.$value));
      const l = Math.round(c.l * 1000) / 1000;
      const ch = Math.round((c.c || 0) * 10000) / 10000;
      const h = Math.round((c.h || 0) * 10) / 10;
      console.log(`"${key}": { "$value": { "colorSpace": "oklch", "components": [${l}, ${ch}, ${h}], "hex": "${val.$value}" }${val.$description ? `, "$description": "${val.$description}"` : ""} },`);
    } else if (typeof val === "object" && !val.$value) {
      console.log(`"${key}": {${val.$description ? ` "$description": "${val.$description}",` : ""}`);
      convert(val, depth + 1);
      console.log(`},`);
    }
  }
}

convert(primitives);
```

Run: `node scripts/convert-hex-to-oklch.mjs`

Copy the output into `primitive.tokens.json`, wrapping in the `{ "color": { "$type": "color", "primitive": { ... } } }` structure. Delete the script after use.

- [ ] **Step 3: Create `src/color/semantic.tokens.json`**

Move the `color.semantic.*` section from the existing `color.tokens.json`. Add `$type` at the semantic level:

```json
{
  "color": {
    "semantic": {
      "$type": "color",
      "background": {
        "default": { "$value": "{color.primitive.white}" },
        "subtle": { "$value": "{color.primitive.stone.50}" },
        "muted": { "$value": "{color.primitive.stone.100}" },
        "inverse": { "$value": "{color.primitive.stone.950}" }
      },
      "foreground": {
        "default": { "$value": "{color.primitive.stone.950}" },
        "muted": { "$value": "{color.primitive.stone.700}" },
        "subtle": { "$value": "{color.primitive.stone.400}" },
        "inverse": { "$value": "{color.primitive.white}" }
      },
      "primary": {
        "default": { "$value": "{color.primitive.stone.950}", "$description": "Primary actions — near black" },
        "hover": { "$value": "{color.primitive.purple.600}", "$description": "Primary hover — brand purple" },
        "active": { "$value": "{color.primitive.purple.700}", "$description": "Primary active — darker purple" },
        "subtle": { "$value": "{color.primitive.purple.50}" }
      },
      "secondary": {
        "default": { "$value": "{color.primitive.stone.100}" },
        "hover": { "$value": "{color.primitive.stone.100}" },
        "active": { "$value": "{color.primitive.stone.200}" },
        "text": { "$value": "{color.primitive.stone.950}" }
      },
      "border": {
        "default": { "$value": "{color.primitive.stone.300}" },
        "strong": { "$value": "{color.primitive.stone.400}" },
        "subtle": { "$value": "{color.primitive.stone.200}" },
        "focus": { "$value": "{color.primitive.purple.300}" },
        "disabled": { "$value": "{color.primitive.stone.200}" }
      },
      "disabled": {
        "background": { "$value": "{color.primitive.stone.100}" },
        "text": { "$value": "{color.primitive.stone.400}" },
        "border": { "$value": "{color.primitive.stone.200}" }
      },
      "feedback": {
        "error": { "$value": "{color.primitive.red.600}" },
        "error-hover": { "$value": "{color.primitive.red.500}" },
        "error-subtle": { "$value": "{color.primitive.red.50}" },
        "success": { "$value": "{color.primitive.green.500}" },
        "success-hover": { "$value": "{color.primitive.green.400}" },
        "success-subtle": { "$value": "{color.primitive.green.50}" },
        "warning": { "$value": "{color.primitive.amber.600}" },
        "warning-subtle": { "$value": "{color.primitive.amber.50}" }
      }
    }
  }
}
```

- [ ] **Step 4: Delete the original `src/color.tokens.json`**

Run: `rm packages/tokens/src/color.tokens.json`

- [ ] **Step 5: Commit**

```bash
git add packages/tokens/src/color/ packages/tokens/src/color.tokens.json
git commit -m "refactor(tokens): split color.tokens.json into primitive (OKLCH) + semantic"
```

---

## Task 5: Create shadcn token source files

**Files:**
- Create: `packages/tokens/src/shadcn/light.tokens.json`
- Create: `packages/tokens/src/shadcn/dark.tokens.json`
- Create: `packages/tokens/src/shadcn/radius.tokens.json`

- [ ] **Step 1: Create `src/shadcn/` directory**

Run: `mkdir -p packages/tokens/src/shadcn`

- [ ] **Step 2: Create `src/shadcn/light.tokens.json`**

Copy the exact content from the spec (section 1.2, light tokens). All 32 color tokens referencing primitives.

- [ ] **Step 3: Create `src/shadcn/dark.tokens.json`**

Copy the exact content from the spec (section 1.2, dark tokens). All 32 color tokens. Note the 4 alpha-channel tokens use OKLCH string format (`"oklch(1 0 0 / 0.1)"`), not DTCG structured objects.

- [ ] **Step 4: Create `src/shadcn/radius.tokens.json`**

```json
{
  "shadcn": {
    "radius": {
      "$type": "dimension",
      "$value": "0.625rem",
      "$description": "Base border radius (10px). Minivoda derives sm/md/lg/xl/2xl/3xl/4xl via calc()."
    }
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add packages/tokens/src/shadcn/
git commit -m "feat(tokens): add shadcn light/dark theme tokens and radius"
```

---

## Task 6: Write the bespoke build script

**Files:**
- Create: `packages/tokens/build.mjs`

This is the core task. The script must produce output files that match the format of the existing Style Dictionary outputs (so `packages/components/src/styles/globals.css` continues to work), plus the new shadcn output.

- [ ] **Step 1: Write failing integration test**

Append to `packages/tokens/tests/build.test.mjs`:

```javascript
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

describe("build.mjs integration", () => {
  const dist = join(import.meta.dirname, "..", "dist");

  // Run the build once before all integration tests
  it("builds without errors", () => {
    execSync("node build.mjs", {
      cwd: join(import.meta.dirname, ".."),
      stdio: "pipe",
    });
  });

  it("produces dist/web/tokens.css with OKLCH values", () => {
    const css = readFileSync(join(dist, "web/tokens.css"), "utf-8");
    expect(css).toContain(":root {");
    expect(css).toContain("--color-primitive-white:");
    expect(css).toContain("oklch(");
    expect(css).toContain("--color-semantic-background-default:");
    expect(css).toContain("--spacing-4:");
    expect(css).toContain("--font-size-base:");
    expect(css).toContain("--radius-lg:");
    expect(css).toContain("--shadow-md:");
  });

  it("produces dist/shadcn/tokens.css with :root and .dark scopes", () => {
    const css = readFileSync(join(dist, "shadcn/tokens.css"), "utf-8");
    expect(css).toContain(":root {");
    expect(css).toContain(".dark {");
    expect(css).toContain("--background:");
    expect(css).toContain("--primary:");
    expect(css).toContain("--destructive-foreground:");
    expect(css).toContain("--chart-1:");
    expect(css).toContain("--sidebar:");
    expect(css).toContain("--radius:");
    // Should have resolved OKLCH values, not var() references
    expect(css).not.toContain("var(--");
  });

  it("produces dist/js/tokens.js with ES6 exports", () => {
    const js = readFileSync(join(dist, "js/tokens.js"), "utf-8");
    expect(js).toContain("export const");
    expect(js).toContain("ColorPrimitiveWhite");
    expect(js).toMatch(/Spacing[A-Z0-9]/); // e.g. Spacing4 or SpacingBase
  });

  it("produces dist/js/tokens.d.ts", () => {
    expect(existsSync(join(dist, "js/tokens.d.ts"))).toBe(true);
  });

  it("produces dist/react-native/tokens.js with hex values", () => {
    const js = readFileSync(join(dist, "react-native/tokens.js"), "utf-8");
    expect(js).toContain("export const");
    // React Native should have hex, not oklch
    expect(js).toContain("#");
  });

  it("produces dist/json/tokens.json", () => {
    const json = JSON.parse(readFileSync(join(dist, "json/tokens.json"), "utf-8"));
    expect(json.color).toBeDefined();
    expect(json.spacing).toBeDefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/tokens && npx vitest run`
Expected: FAIL — `build.mjs` does not exist

- [ ] **Step 3: Implement `build.mjs`**

Create `packages/tokens/build.mjs` with the complete implementation below:

```javascript
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
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key]) && !("$value" in source[key])) {
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

function toKebab(path) { return path.join("-"); }
function toPascal(path) { return path.map(s => s.replace(/(^|-)(\w)/g, (_, _2, c) => c.toUpperCase())).join(""); }
function toCamel(path) { const p = toPascal(path); return p[0].toLowerCase() + p.slice(1); }

/** Format a token value as a CSS value (OKLCH for colors) */
function formatCSSValue(token) {
  if (token.$type === "color") {
    if (typeof token.$value === "object" && token.$value.colorSpace) {
      return dtcgToOklchString(token.$value);
    }
    if (typeof token.$value === "string") return token.$value; // raw oklch string or reference
  }
  if (token.$type === "shadow" && typeof token.$value === "object") {
    const s = token.$value;
    return `${s.offsetX} ${s.offsetY} ${s.blur} ${s.spread} ${s.color}`;
  }
  if (token.$type === "fontFamily" && Array.isArray(token.$value)) {
    return token.$value.map(f => f.includes(" ") ? `'${f}'` : f).join(", ");
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
    return token.$value.replace("px", "");
  }
  return token.$value;
}

/** Check if a $value is a DTCG reference string like "{color.primitive.white}" */
function isRef(value) {
  return typeof value === "string" && /^\{.+\}$/.test(value);
}

/** Convert a DTCG reference to a CSS var() reference: "{color.primitive.white}" → "var(--color-primitive-white)" */
function refToVar(value) {
  const path = value.slice(1, -1).split(".");
  return `var(--${toKebab(path)})`;
}

// ─── Build: Web CSS ───

function buildWebCSS(resolvedTokens, unresolvedTokens) {
  // For web CSS, we want:
  // - Primitive tokens: resolved OKLCH values
  // - Semantic tokens: var() references to primitives (for DevTools debuggability)
  // - Non-color tokens: resolved values
  const flatResolved = flattenTokens(resolvedTokens);
  const flatUnresolved = flattenTokens(unresolvedTokens);

  const lines = [":root {"];
  for (let i = 0; i < flatResolved.length; i++) {
    const resolved = flatResolved[i];
    const unresolved = flatUnresolved[i];
    const name = `--${toKebab(resolved.path)}`;
    const desc = resolved.$description ? ` /** ${resolved.$description} */` : "";

    // If the original value was a reference and it's a color, use var()
    if (unresolved && isRef(unresolved.$value) && resolved.$type === "color") {
      lines.push(`  ${name}: ${refToVar(unresolved.$value)};${desc}`);
    } else {
      lines.push(`  ${name}: ${formatCSSValue(resolved)};${desc}`);
    }
  }
  lines.push("}");

  mkdirSync("dist/web", { recursive: true });
  writeFileSync("dist/web/tokens.css", `/**\n * Do not edit directly, this file was auto-generated.\n */\n\n${lines.join("\n")}\n`);
}

// ─── Build: shadcn CSS ───

function buildShadcnCSS(primitiveTokens) {
  const light = readJSON("src/shadcn/light.tokens.json");
  const dark = readJSON("src/shadcn/dark.tokens.json");
  const radius = readJSON("src/shadcn/radius.tokens.json");

  function buildScope(themeTokens, scope) {
    // Merge primitives for reference resolution, then resolve
    const merged = mergeDeep({}, { color: primitiveTokens.color }, themeTokens, radius);
    const resolved = resolveRefs(merged);

    // Flatten only shadcn.* tokens
    const flat = flattenTokens(resolved.shadcn, [], null);
    const lines = [`${scope} {`];
    for (const token of flat) {
      const name = `--${toKebab(token.path)}`;
      lines.push(`  ${name}: ${formatCSSValue(token)};`);
    }
    lines.push("}");
    return lines.join("\n");
  }

  const lightCSS = buildScope(light, ":root");
  const darkCSS = buildScope(dark, ".dark");

  mkdirSync("dist/shadcn", { recursive: true });
  writeFileSync("dist/shadcn/tokens.css",
    `/* Generated by Clarity V2 token pipeline — do not edit */\n\n${lightCSS}\n\n${darkCSS}\n`
  );
}

// ─── Build: JS/TS ───

function buildJS(resolvedTokens) {
  const flat = flattenTokens(resolvedTokens);
  const jsLines = [`/**\n * Do not edit directly, this file was auto-generated.\n */\n`];
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
  const jsLines = [`/**\n * Do not edit directly, this file was auto-generated.\n */\n`];
  const dtsLines = [...jsLines];

  for (const token of flat) {
    const name = toCamel(token.path);
    const value = formatRNValue(token);
    const jsValue = typeof value === "number" ? value : JSON.stringify(value);
    jsLines.push(`export const ${name} = ${jsValue};`);
    dtsLines.push(`export declare const ${name}: ${typeof value === "number" ? "number" : "string"};`);
  }

  mkdirSync("dist/react-native", { recursive: true });
  writeFileSync("dist/react-native/tokens.js", jsLines.join("\n") + "\n");
  writeFileSync("dist/react-native/tokens.d.ts", dtsLines.join("\n") + "\n");
}

// ─── Build: JSON ───

function buildJSON(resolvedTokens) {
  // Strip $ prefixed metadata, keep only resolved values
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
  writeFileSync("dist/json/tokens.json", JSON.stringify(clean(resolvedTokens), null, 2) + "\n");
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
buildShadcnCSS(mergeDeep({}, ...sources.map(readJSON))); // needs raw primitives for ref resolution
buildJS(resolved);
buildReactNative(resolved);
buildJSON(resolved);

console.log("✓ Token build complete");
```

**Key design choices in this implementation:**
- Web CSS uses `var()` references for semantic→primitive mappings (matches existing SD output, debuggable in DevTools)
- shadcn CSS resolves all references to concrete OKLCH values (primitives aren't in the output file)
- React Native uses hex from the `$value.hex` fallback field
- `flattenTokens` inherits `$type` from parent groups per DTCG spec
- `mergeDeep` stops at `$value` nodes to avoid merging into token values

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/tokens && npx vitest run`
Expected: All tests PASS (unit + integration)

- [ ] **Step 5: Verify output matches expected format**

Run: `cat packages/tokens/dist/web/tokens.css | head -20`
Expected: `:root {` with `--color-primitive-white: oklch(1 0 0);` etc.

Run: `cat packages/tokens/dist/shadcn/tokens.css | head -10`
Expected: `:root {` with `--background: oklch(...)` etc.

- [ ] **Step 6: Commit**

```bash
git add packages/tokens/build.mjs packages/tokens/tests/build.test.mjs
git commit -m "feat(tokens): implement bespoke build script with all platform outputs"
```

---

## Task 7: Remove Style Dictionary

**Files:**
- Delete: `packages/tokens/style-dictionary.config.mjs`
- Modify: `packages/tokens/package.json`

- [ ] **Step 1: Delete the SD config file**

Run: `rm packages/tokens/style-dictionary.config.mjs`

- [ ] **Step 2: Remove `style-dictionary` from devDependencies**

Edit `packages/tokens/package.json`: remove `"style-dictionary": "^5.4.0"` from devDependencies.

- [ ] **Step 3: Run `npm install` to update lockfile**

Run: `npm install` (from repo root)
Expected: `style-dictionary` and its ~30 transitive deps removed

- [ ] **Step 4: Verify bespoke build still works**

Run: `cd packages/tokens && node build.mjs`
Expected: Success, all output files generated

- [ ] **Step 5: Verify Nx build works**

Run: `npx nx build tokens`
Expected: Success

- [ ] **Step 6: Commit**

```bash
git add packages/tokens/style-dictionary.config.mjs packages/tokens/package.json package-lock.json
git commit -m "chore(tokens): remove Style Dictionary dependency (ADR-001)"
```

---

## Task 8: Remove Chromatic

**Files:**
- Modify: `packages/components/package.json`

- [ ] **Step 1: Edit `packages/components/package.json`**

Remove from `scripts`:
```json
"chromatic": "npx chromatic --project-token=chpt_923a06027fb30d6"
```

Remove from `devDependencies`:
```json
"chromatic": "^16.1.0"
```

- [ ] **Step 2: Run `npm install` to update lockfile**

Run: `npm install` (from repo root)

- [ ] **Step 3: Commit**

```bash
git add packages/components/package.json package-lock.json
git commit -m "chore(components): remove Chromatic dependency (ADR-002)"
```

---

## Task 9: Verify existing components still work

**Files:** None modified — verification only

- [ ] **Step 1: Build the components package**

Run: `npx nx build components`
Expected: Success — the components package imports `dist/web/tokens.css` which now has OKLCH values but the same property names

- [ ] **Step 2: Build the test app**

Run: `npx nx build test-app`
Expected: Success

- [ ] **Step 3: Run Storybook (manual check)**

Run: `cd packages/components && npx storybook dev -p 6006`
Expected: Storybook launches, Button component renders correctly with all variants. Colors should be perceptually identical to before (OKLCH vs hex produces the same rendered color).

- [ ] **Step 4: Stop Storybook and commit verification note**

No code changes to commit. If Storybook renders correctly, the token migration is verified.

---

## Task 10: Update documentation

**Files (all at repo root):**
- Modify: `README.md`
- Modify: `ds-diagnosis.md`
- Modify: `code-first-ds.md`
- Modify: `mobile-ds-diagnosis.md`

- [ ] **Step 1: Update `README.md`**

Find the line mentioning "Style Dictionary v5" (line ~20) and replace with reference to the bespoke build pipeline. Remove any Zeroheight references.

- [ ] **Step 2: Update `ds-diagnosis.md`**

- Section "Style Dictionary is correct but the token pipeline is incomplete" (~line 31): Update framing — SD was correct at diagnosis time, now replaced by bespoke script. Reference ADR-001.
- Zeroheight references (~lines 54, 57, 59, 81, 93): Replace with Fumadocs. Reference ADR-004.
- Chromatic reference (~line 53, 55): Note deferral per ADR-002.

- [ ] **Step 3: Update `code-first-ds.md`**

- SD analysis (~lines 44-50): Keep as industry context. Add a note: "Nivoda uses a bespoke build script instead — see architecture.md ADR-001 for rationale."
- Zeroheight references (~lines 89, 97, 99): Replace with Fumadocs where appropriate.

- [ ] **Step 4: Update `mobile-ds-diagnosis.md`**

- SD references (~lines 7, 18, 31, 48): Update to reflect bespoke pipeline. Keep the recommendation to align token names — that's independent of the build tool.

- [ ] **Step 5: Commit**

```bash
git add README.md ds-diagnosis.md code-first-ds.md mobile-ds-diagnosis.md
git commit -m "docs: update references to reflect bespoke build, Fumadocs, Chromatic removal"
```

---

## Verification Checklist (end of Phase 1)

- [ ] `cd packages/tokens && npx vitest run` — all tests pass
- [ ] `npx nx build tokens` — succeeds
- [ ] `dist/shadcn/tokens.css` — contains `:root { }` with 32 color tokens + radius, `.dark { }` with 32 color tokens + radius, all in OKLCH
- [ ] `dist/web/tokens.css` — all existing tokens present, now in OKLCH
- [ ] `dist/js/tokens.js` + `dist/js/tokens.d.ts` — ES6 exports with PascalCase names
- [ ] `dist/react-native/tokens.js` + `dist/react-native/tokens.d.ts` — hex values, camelCase
- [ ] `dist/json/tokens.json` — nested JSON
- [ ] `npx nx build components` — succeeds
- [ ] `npx nx build test-app` — succeeds
- [ ] Storybook Button renders correctly
- [ ] No `style-dictionary` in `package-lock.json`
- [ ] No `chromatic` in `package-lock.json`
- [ ] `grep -r "Style Dictionary" *.md` — only appears in historical/context sections with ADR references
- [ ] `grep -r "Zeroheight" *.md` — only appears in ADR-004 context
