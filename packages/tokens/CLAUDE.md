# packages/tokens — agent orientation

Source of truth for every atomic visual decision across Nivoda's products. Within Clarity V2 this is the "law" layer — see the root [CLAUDE.md](../../CLAUDE.md) for the wider picture.

**Read [CONTRIBUTING.md](./CONTRIBUTING.md) first.** It's the rulebook: who edits what, why `src/` is human-only, and the three enforcement layers. This file only covers how the package works internally.

## Layout

```
src/                         DTCG token sources — HUMAN-ONLY
  color/
    primitive.tokens.json      raw OKLCH values
    semantic.tokens.json       role tokens that $ref primitives
  {spacing,radius,shadow,typography}.tokens.json
build.mjs                    bespoke build (ADR-001 — do not reintroduce Style Dictionary)
lib/color.mjs                OKLCH ↔ hex
lib/resolve.mjs              DTCG {ref} resolution
tests/build.test.mjs         vitest (20 tests)
dist/                        generated — gitignored, never edit
```

Outputs: `dist/web/tokens.css`, `dist/js/tokens.{js,d.ts}`, `dist/react-native/tokens.{js,d.ts}`, `dist/json/tokens.json`.

## Token layering

Two levels, resolved at build time:

1. **Primitives** — raw OKLCH values (e.g. `color.violet.500`).
2. **Semantic** — role tokens (e.g. `action.primary`) that reference primitives via DTCG `{color.violet.500}` strings.

`build.mjs` merges the source files twice: once **unresolved** (refs preserved) and once **resolved** (refs expanded to concrete values). Web CSS uses both — semantic tokens emit `var(--color-violet-500)` chains by comparing the two passes, so downstream CSS can retarget primitives without recompiling. Other platforms use the resolved pass only.

## Build flow

`src/*.tokens.json` → `mergeDeep` → `resolveRefs` → `flattenTokens` → per-platform formatter → `dist/`.

Color handling is the main footgun: DTCG color values are structured objects (`{ colorSpace: "oklch", components: [L,C,H], hex: "#..." }`), not strings. `formatCSSValue` emits `oklch(...)`; `formatRNValue` uses the `hex` fallback since React Native can't parse OKLCH. If you touch a formatter, preserve both paths.

## Running things

```sh
node build.mjs      # rebuild all outputs
npx vitest run      # run tests
```

Nx equivalents: `npx nx build tokens`, `npx nx test tokens`.
