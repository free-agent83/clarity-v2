# Clarity V2 Token Alignment — Design Spec

## Problem

Clarity V2 (design system) and Minivoda (consumer frontend) are disconnected. Minivoda has 33 hand-written CSS custom properties (32 colors + 1 radius) in OKLCH using shadcn's flat naming convention (`--background`, `--primary`). Clarity V2 has a W3C DTCG token pipeline outputting hex with structured naming (`--color-semantic-background-default`). Neither dark mode tokens nor several shadcn-required token categories exist in clarity-v2's source.

## Goal

Make clarity-v2 the single source of truth for all design tokens consumed by Minivoda, without breaking clarity-v2's existing component library or requiring changes to Minivoda's 57 shadcn/ui components.

## Key Decisions

1. **OKLCH in DTCG source.** Primitives stored as DTCG structured color objects with `colorSpace: "oklch"` and a `hex` fallback for non-CSS platforms (email, React Native). This is the W3C DTCG v2025.10 standard format, used in production by Firefox Acorn and supported by Style Dictionary, Terrazzo, and Cobalt.
2. **Bespoke build script, not Style Dictionary.** A ~200-line Node script (`build.mjs`) replaces Style Dictionary v5. See `architecture.md` → [ADR-001](../../../architecture.md#adr-001-bespoke-build-script-over-style-dictionary-april-2026) for full rationale.
3. **Chromatic deferred.** Visual regression testing removed until 10+ components exist with CI/CD. See `architecture.md` → [ADR-002](../../../architecture.md#adr-002-chromatic-deferred-april-2026) for full rationale.
4. **shadcn-compatible flat output** — the build script produces `--background`, `--primary`, etc. as a drop-in replacement for Minivoda's `globals.css` token blocks.
5. **Dark mode: complete token set per theme.** Both `light.tokens.json` and `dark.tokens.json` contain all 32 color tokens. No layering/merge strategy — each file is self-contained.
6. **Primitives referenced by semantics** — shadcn tokens reference the primitive palette via DTCG references (`{color.primitive.white}`), so changing a primitive cascades automatically.
7. **Resolved values in shadcn output.** The shadcn output only contains semantic tokens, not primitives. References must be resolved to actual OKLCH values — otherwise the CSS would contain `var(--color-primitive-white)` pointing to a variable that doesn't exist in that file.

---

## Phase 1: Token Foundation Alignment (clarity-v2 only)

### 1.1 Convert primitive palette to OKLCH (DTCG structured format)

**File:** `packages/tokens/src/color/primitive.tokens.json` (extracted from current `color.tokens.json`)

Convert hex values to DTCG structured color objects. Include `hex` fallback for platforms that need sRGB (email templates, React Native).

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
        "50": { "$value": { "colorSpace": "oklch", "components": [0.985, 0.002, 107], "hex": "#fafaf9" } },
        "100": { "$value": { "colorSpace": "oklch", "components": [0.97, 0.003, 107], "hex": "#f5f5f4" } },
        "...": "full scale 50-950"
      },
      "purple": { "...": "full scale 50-900" },
      "green": { "...": "full scale 50-700" },
      "red": { "...": "full scale 50-700" },
      "amber": { "...": "50, 100, 500-700" }
    }
  }
}
```

Use `culori` or oklch.com to derive OKLCH components from existing hex values. Keep hex as the `hex` fallback field.

**File:** `packages/tokens/src/color/semantic.tokens.json` (extracted from current `color.tokens.json`)

Clarity-v2's own richer semantics. Unchanged content, just moved to new file path:

```json
{
  "color": {
    "semantic": {
      "$type": "color",
      "background": { "default": { "$value": "{color.primitive.white}" }, "...": "subtle, muted, inverse" },
      "foreground": { "...": "default, muted, subtle, inverse" },
      "primary": { "...": "default, hover, active, subtle" },
      "secondary": { "...": "default, hover, active, text" },
      "border": { "...": "default, strong, subtle, focus, disabled" },
      "disabled": { "...": "background, text, border" },
      "feedback": { "...": "error, error-hover, error-subtle, success, success-hover, success-subtle, warning, warning-subtle" }
    }
  }
}
```

The original `src/color.tokens.json` is deleted after this split into 2 files.

### 1.2 Add complete shadcn semantic tokens (light + dark)

Both files must contain **all 32 color tokens** — they are self-contained, not layered.

**File:** `packages/tokens/src/shadcn/light.tokens.json`

```json
{
  "shadcn": {
    "$type": "color",

    "background":             { "$value": "{color.primitive.white}" },
    "foreground":             { "$value": "{color.primitive.stone.950}" },
    "card":                   { "$value": "{color.primitive.white}" },
    "card-foreground":        { "$value": "{color.primitive.stone.950}" },
    "popover":                { "$value": "{color.primitive.white}" },
    "popover-foreground":     { "$value": "{color.primitive.stone.950}" },
    "primary":                { "$value": "{color.primitive.stone.950}" },
    "primary-foreground":     { "$value": "{color.primitive.stone.50}" },
    "secondary":              { "$value": "{color.primitive.stone.100}" },
    "secondary-foreground":   { "$value": "{color.primitive.stone.950}" },
    "muted":                  { "$value": "{color.primitive.stone.100}" },
    "muted-foreground":       { "$value": "{color.primitive.stone.500}" },
    "accent":                 { "$value": "{color.primitive.stone.100}" },
    "accent-foreground":      { "$value": "{color.primitive.stone.950}" },
    "destructive":            { "$value": "{color.primitive.red.600}" },
    "destructive-foreground": { "$value": "{color.primitive.white}" },
    "border":                 { "$value": "{color.primitive.stone.300}" },
    "input":                  { "$value": "{color.primitive.stone.300}" },
    "ring":                   { "$value": "{color.primitive.stone.400}" },

    "chart-1":                { "$value": "{color.primitive.purple.300}" },
    "chart-2":                { "$value": "{color.primitive.purple.500}" },
    "chart-3":                { "$value": "{color.primitive.purple.600}" },
    "chart-4":                { "$value": "{color.primitive.purple.700}" },
    "chart-5":                { "$value": "{color.primitive.purple.800}" },

    "sidebar":                         { "$value": "{color.primitive.stone.50}" },
    "sidebar-foreground":              { "$value": "{color.primitive.stone.950}" },
    "sidebar-primary":                 { "$value": "{color.primitive.stone.950}" },
    "sidebar-primary-foreground":      { "$value": "{color.primitive.stone.50}" },
    "sidebar-accent":                  { "$value": "{color.primitive.stone.100}" },
    "sidebar-accent-foreground":       { "$value": "{color.primitive.stone.950}" },
    "sidebar-border":                  { "$value": "{color.primitive.stone.300}" },
    "sidebar-ring":                    { "$value": "{color.primitive.stone.400}" }
  }
}
```

**File:** `packages/tokens/src/shadcn/dark.tokens.json`

All 32 color tokens with dark theme values. Most reference dark primitives. A few use OKLCH string format for alpha-channel values (e.g., `"oklch(1 0 0 / 0.1)"`). These still carry `$type: "color"` from the group — the build script must handle both DTCG structured objects and raw OKLCH strings:

```json
{
  "shadcn": {
    "$type": "color",

    "background":             { "$value": "{color.primitive.stone.950}" },
    "foreground":             { "$value": "{color.primitive.stone.50}" },
    "card":                   { "$value": "{color.primitive.stone.900}" },
    "card-foreground":        { "$value": "{color.primitive.stone.50}" },
    "popover":                { "$value": "{color.primitive.stone.900}" },
    "popover-foreground":     { "$value": "{color.primitive.stone.50}" },
    "primary":                { "$value": "{color.primitive.stone.50}" },
    "primary-foreground":     { "$value": "{color.primitive.stone.950}" },
    "secondary":              { "$value": "{color.primitive.stone.800}" },
    "secondary-foreground":   { "$value": "{color.primitive.stone.50}" },
    "muted":                  { "$value": "{color.primitive.stone.800}" },
    "muted-foreground":       { "$value": "{color.primitive.stone.400}" },
    "accent":                 { "$value": "{color.primitive.stone.800}" },
    "accent-foreground":      { "$value": "{color.primitive.stone.50}" },
    "destructive":            { "$value": "{color.primitive.red.500}" },
    "destructive-foreground": { "$value": "{color.primitive.white}" },
    "border":                 { "$value": "oklch(1 0 0 / 0.1)", "$description": "White at 10% opacity" },
    "input":                  { "$value": "oklch(1 0 0 / 0.15)", "$description": "White at 15% opacity" },
    "ring":                   { "$value": "{color.primitive.stone.600}" },

    "chart-1":                { "$value": "{color.primitive.purple.300}" },
    "chart-2":                { "$value": "{color.primitive.purple.500}" },
    "chart-3":                { "$value": "{color.primitive.purple.600}" },
    "chart-4":                { "$value": "{color.primitive.purple.700}" },
    "chart-5":                { "$value": "{color.primitive.purple.800}" },

    "sidebar":                         { "$value": "{color.primitive.stone.900}" },
    "sidebar-foreground":              { "$value": "{color.primitive.stone.50}" },
    "sidebar-primary":                 { "$value": "{color.primitive.stone.50}" },
    "sidebar-primary-foreground":      { "$value": "{color.primitive.stone.900}" },
    "sidebar-accent":                  { "$value": "{color.primitive.stone.800}" },
    "sidebar-accent-foreground":       { "$value": "{color.primitive.stone.50}" },
    "sidebar-border":                  { "$value": "oklch(1 0 0 / 0.1)", "$description": "White at 10% opacity" },
    "sidebar-ring":                    { "$value": "{color.primitive.stone.600}" }
  }
}
```

**Note:** The exact dark theme values above are approximations based on Minivoda's current OKLCH values. At Phase 2 integration time, diff against Minivoda's actual `globals.css` and adjust.

**File:** `packages/tokens/src/shadcn/radius.tokens.json`

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

### 1.3 Keep clarity-v2's own semantic tokens

**File:** `packages/tokens/src/color/semantic.tokens.json`

No changes to token values. Just moved from `color.tokens.json` to its own file. These tokens power clarity-v2's component library (Button variants, disabled states, feedback states) and are a superset of shadcn's simpler model.

### 1.4 Bespoke build script

**File:** `packages/tokens/build.mjs` (new)

A single Node.js script that reads DTCG JSON source files and outputs all platform formats. No Style Dictionary dependency.

```javascript
// Pseudocode for build.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { oklchToHex } from "./lib/color.mjs"; // thin wrapper around culori

// ─── 1. Read and merge all DTCG source files ───
const sources = [
  "src/color/primitive.tokens.json",
  "src/color/semantic.tokens.json",
  "src/spacing.tokens.json",
  "src/typography.tokens.json",
  "src/radius.tokens.json",
  "src/shadow.tokens.json",
];
const tokens = mergeDeep(...sources.map(f => JSON.parse(readFileSync(f, "utf-8"))));

// ─── 2. Resolve references ───
// Recursive lookup: "{color.primitive.white}" → resolved $value
// ~30 lines — walk the token tree, replace {ref.path} with resolved values
function resolveRefs(tokens, root) { /* ... */ }

// ─── 3. Extract OKLCH value from DTCG color object ───
// { colorSpace: "oklch", components: [L, C, H], hex: "#fff" }
//   → "oklch(1 0 0)"
// "oklch(1 0 0 / 0.1)" (string) → pass through
function toOklchString(value) { /* ... */ }

// ─── 4. Output: CSS custom properties (web) ───
// Flatten resolved tokens to --kebab-name: oklch(...) pairs
// Write dist/web/tokens.css
function buildWebCSS(tokens) { /* ... */ }

// ─── 5. Output: shadcn (light + dark) ───
const lightTokens = JSON.parse(readFileSync("src/shadcn/light.tokens.json", "utf-8"));
const darkTokens = JSON.parse(readFileSync("src/shadcn/dark.tokens.json", "utf-8"));
const radiusTokens = JSON.parse(readFileSync("src/shadcn/radius.tokens.json", "utf-8"));

// Resolve refs against primitives, format as CSS
// Strip "shadcn." prefix → flat names (--background, --primary)
// Wrap in :root { } and .dark { }
// Write dist/shadcn/tokens.css
function buildShadcnCSS(lightTokens, darkTokens, radiusTokens, primitives) { /* ... */ }

// ─── 6. Output: JS/TS exports ───
// PascalCase names, string values
// Write dist/js/tokens.js + dist/js/tokens.d.ts
function buildJS(tokens) { /* ... */ }

// ─── 7. Output: React Native ───
// camelCase names, hex values (from $value.hex fallback), unitless dimensions
// Write dist/react-native/tokens.js + dist/react-native/tokens.d.ts
function buildReactNative(tokens) { /* ... */ }

// ─── 8. Output: JSON ───
// Nested structure with resolved values
// Write dist/json/tokens.json
function buildJSON(tokens) { /* ... */ }

// ─── Run all builds ───
const resolved = resolveRefs(tokens, tokens);
mkdirSync("dist/web", { recursive: true });
mkdirSync("dist/shadcn", { recursive: true });
mkdirSync("dist/js", { recursive: true });
mkdirSync("dist/react-native", { recursive: true });
mkdirSync("dist/json", { recursive: true });

buildWebCSS(resolved);
buildShadcnCSS(lightTokens, darkTokens, radiusTokens, resolved.color.primitive);
buildJS(resolved);
buildReactNative(resolved);
buildJSON(resolved);

console.log("✓ Token build complete");
```

**Dependencies:** `culori` (devDependency, ~3KB) for hex↔OKLCH conversion in React Native/JSON outputs. Zero other dependencies.

**`lib/color.mjs` interface:**
```javascript
// Thin wrapper around culori
import { oklch, formatHex } from "culori";

// DTCG structured object → "oklch(L C H)" or "oklch(L C H / A)"
export function dtcgToOklchString({ components, alpha }) { /* ... */ }

// "oklch(L C H)" or DTCG object → "#rrggbb"
export function toHex(value) { /* ... */ }
```

### 1.5 Package exports

**File:** `packages/tokens/package.json`

```json
{
  "name": "@nivoda/tokens",
  "version": "0.1.0",
  "private": true,
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
    "build": "node build.mjs"
  },
  "devDependencies": {
    "culori": "^4.0.0"
  }
}
```

**File:** `packages/tokens/project.json`

```json
{
  "targets": {
    "build": {
      "executor": "nx:run-commands",
      "options": {
        "command": "node build.mjs",
        "cwd": "packages/tokens"
      }
    }
  }
}
```

### 1.6 No changes to clarity-v2 component globals.css

The `@theme` block in `packages/components/src/styles/globals.css` references `var(--color-semantic-*)` names. These CSS custom property names are unchanged — only their values change from hex to OKLCH in the `dist/web/tokens.css` output. `var()` resolves regardless of color format.

Verify Button renders correctly after the change.

### 1.7 Remove Chromatic

**File:** `packages/components/package.json`

- Remove `"chromatic": "^16.1.0"` from devDependencies
- Remove `"chromatic": "npx chromatic --project-token=chpt_923a06027fb30d6"` from scripts

---

## Phase 2: Minivoda Consumption (after Phase 1 verified)

### 2.1 Link clarity-v2 tokens

**File:** Minivoda `package.json`

```json
"@nivoda/tokens": "file:../../clarity-v2/packages/tokens"
```

### 2.2 Replace hand-written tokens

**File:** Minivoda `app/globals.css`

- Add: `@import "@nivoda/tokens/shadcn";` at the top
- Delete: `:root { --background: oklch(...); ... }` block (~30 lines)
- Delete: `.dark { --background: oklch(...); ... }` block (~30 lines)
- Keep untouched: `@theme inline { ... }` block
- Keep untouched: `@layer base { ... }` block

### 2.3 Verification

- Light theme renders identically
- Dark mode toggle (`d` key) works, colors match
- All product pages, orders, kitchen sink page verified
- No component file changes needed

---

## Phase 3: Component Extraction (deferred)

After Phase 2 is stable, progressively extract Minivoda's shadcn components into clarity-v2's component library. Storybook becomes the documentation layer at this point. Extraction priority:

1. Leaf components (badge, separator, skeleton, spinner, label, kbd)
2. Simple interactive (button, input, textarea, checkbox, radio, switch)
3. Composed (card, alert, avatar, progress, tooltip)
4. Complex interactive (select, dialog, sheet, dropdown, combobox)
5. Layout/navigation (sidebar, nav menu, breadcrumb, pagination, tabs)

---

## All Files Modified (Phase 1)

### Token source files

| File | Action |
|------|--------|
| `packages/tokens/src/color.tokens.json` | Split into 2 files below, then delete |
| `packages/tokens/src/color/primitive.tokens.json` | New — OKLCH primitive palette with hex fallbacks |
| `packages/tokens/src/color/semantic.tokens.json` | New — clarity-v2 semantics (from color.tokens.json) |
| `packages/tokens/src/shadcn/light.tokens.json` | New — all 33 shadcn light theme tokens |
| `packages/tokens/src/shadcn/dark.tokens.json` | New — all 33 shadcn dark theme tokens |
| `packages/tokens/src/shadcn/radius.tokens.json` | New — base radius for shadcn |

### Build pipeline

| File | Action |
|------|--------|
| `packages/tokens/style-dictionary.config.mjs` | Delete |
| `packages/tokens/build.mjs` | New — bespoke build script |
| `packages/tokens/lib/color.mjs` | New — thin culori wrapper for color conversion |
| `packages/tokens/package.json` | Remove `style-dictionary`, add `culori`, update description and build script |
| `packages/tokens/project.json` | Update Nx build command to `node build.mjs` |
| `package-lock.json` | Regenerated |

### Chromatic removal

| File | Action |
|------|--------|
| `packages/components/package.json` | Remove `chromatic` dependency and script |

### Documentation updates

| File | Change |
|------|--------|
| `README.md` | Update token pipeline description, remove Zeroheight references |
| `architecture.md` | Already updated — TL;DR, diagram, token pipeline, documentation section, MCP section replaced with agent consumption section, ADRs 001-004 added |
| `ds-diagnosis.md` | Update SD section framing, note Chromatic deferral, update Zeroheight references to Fumadocs |
| `code-first-ds.md` | Keep SD industry analysis, add note on Nivoda's bespoke choice, update Zeroheight references |
| `mobile-ds-diagnosis.md` | Update SD references |

### Unchanged files

- `packages/tokens/src/radius.tokens.json`
- `packages/tokens/src/spacing.tokens.json`
- `packages/tokens/src/typography.tokens.json`
- `packages/tokens/src/shadow.tokens.json`
- `packages/components/src/styles/globals.css`

## Verification Plan

1. `node build.mjs` (from `packages/tokens/`) succeeds without errors
2. `dist/shadcn/tokens.css` contains `:root { ... }` with all 32 color tokens in OKLCH and `.dark { ... }` with all 32 color tokens
3. `dist/web/tokens.css` contains all existing tokens, now in OKLCH format
4. `dist/js/tokens.js` and `dist/react-native/tokens.js` build correctly
5. `dist/json/tokens.json` builds correctly
6. `nx build tokens` succeeds via Nx
7. `nx build components` succeeds
8. Storybook Button renders correctly (visual check — colors should be perceptually identical to hex originals)
9. `nx build test-app` succeeds, test app renders correctly
10. All documentation references to Style Dictionary, Chromatic, and Zeroheight updated
11. (Phase 2) Diff `dist/shadcn/tokens.css` values against Minivoda's `globals.css` — should be equivalent colors

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| OKLCH components derived from hex may not perfectly match Minivoda's hand-tuned OKLCH values | At Phase 2, diff clarity-v2 output against Minivoda's globals.css. Adjust OKLCH components in source to match exactly where needed. |
| Dark mode alpha-channel tokens can't use DTCG structured format | Use OKLCH string format with alpha: `"$value": "oklch(1 0 0 / 0.1)"`. The build script handles both formats. |
| Dark theme values are approximations of Minivoda's current OKLCH values | Phase 2 verification step explicitly diffs against Minivoda's actual globals.css. Adjust before integrating. |
| Minivoda adds new tokens between now and Phase 2 | Pull fresh Minivoda before Phase 2. Diff globals.css. Add any new tokens to shadcn source files. |
| Bespoke build script's reference resolution has edge cases | Unit test the resolver with circular refs, missing refs, nested refs. ~100 tokens is small enough to manually verify. |
| Future engineer expects Style Dictionary | Decision rationale documented in this spec and in architecture.md. DTCG source format means migration to SD is trivial if needed. |
| No visual regression testing without Chromatic | Acceptable at 1 component. Manual Storybook verification is sufficient. Re-evaluate at 10+ components. |
| Chromatic project token in git history | Token `chpt_923a06027fb30d6` is committed in history. Rotate token when Chromatic is re-adopted. |
