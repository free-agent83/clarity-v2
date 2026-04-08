# Token Alignment — Decisions

**Date:** 2026-04-08
**Decided by:** Chris (design lead)
**Status:** Applied to `packages/tokens/src/`

This document records the 15 token alignment decisions made after reviewing the side-by-side comparison between the existing platform design system (MUI + Style Dictionary v3) and Clarity V2 (shadcn/ui + bespoke pipeline).

Source comparison: [`docs/design/token-alignment.md`](./token-alignment.md)
Visual comparison (Paper): see the Paper file "Yearning tree" with 7 comparison artboards.

---

## Guiding principles behind the decisions

1. **Platform values win for brand and status colors.** Production values have been vetted over years. No visual drift for existing apps.
2. **Clarity V2 naming wins for primitives, scales, and typography.** Tailwind standard is industry-recognisable and aligns with shadcn/ui.
3. **Consolidate, don't accumulate.** Legacy MUI palettes (orange, grey, blue_grey) dropped. Amber handles warnings. Stone handles neutrals.
4. **Completeness matters.** Palettes get full 50-950 scales. Missing tiers added.

---

## The 15 decisions

### 01 — Neutral palette naming: `stone`

**Decision:** Use `stone` (Clarity V2 / Tailwind convention).

**Rationale:** More recognisable for modern React work. Matches shadcn/ui defaults.

**Trade-off:** Differs from platform's `neutral`. Platform code will need to update references when migrating — simple rename, values are identical.

---

### 02 — `black` primitive value: soft black `#0C0A09`

**Decision:** Soft black, aliased to stone-950.

**Rationale:** Softer, warmer, less harsh than true black. Modern design convention. When true black is needed (rare — shadows, extreme contrast), use an arbitrary value, not a token.

---

### 03 — Brand color naming: `violet`

**Decision:** Use `violet` (platform convention).

**Rationale:** Matches production. Technically accurate (the hue IS violet). One brand color name org-wide.

**Impact:** Clarity V2's `purple` renamed to `violet` across all source files, semantic references, and component usage.

---

### 04 — Violet/purple VALUES: Platform

**Decision:** Use platform's violet palette values across all tiers.

**Rationale:** Production values have been vetted. No visual drift for existing apps. Clarity V2's previous scale was shifted one tier darker (possibly a re-tuning, possibly an error) — reverting to platform values is the safer choice.

**Impact on existing Clarity V2 work:**
- All violet tiers updated.
- Semantic `primary.hover` (was `purple.600`) now points to platform's `violet.700` (`#5620E1`).
- Semantic `primary.active` (was `purple.700`) now points to `violet.800` (`#481ABD`).

---

### 05 — Violet tier 950: add

**Decision:** Add `violet.950 = #230C69`.

**Rationale:** Complete the scale. Available for shadows, deep backgrounds, high-emphasis dark contexts.

---

### 06 — Green (success) VALUES: Platform

**Decision:** Use platform's green palette values.

**Rationale:** Same principle as violet. `green.500 = #59B186` is the production success color.

**Impact:** Semantic `feedback.success` now uses the lighter, more vibrant green. `feedback.success-hover` uses `green.400`.

---

### 07 — Missing palette tiers: add all

**Decision:** Add all platform tiers Clarity V2 was missing.

**What was added:**
- Red: 800, 900, 950
- Amber: 200, 300, 400, 800, 900, 950
- Green: 800, 900, 950 (as part of the platform value update in decision 06)
- Violet: 950 (decision 05)

**Rationale:** Completeness. Rarely-used tiers are available when needed without having to add them under pressure later.

---

### 08 — Blue palette: add with platform values

**Decision:** Add a full blue palette (50-950) using platform values.

**Rationale:** Needed for `info` semantic state and link colors. Platform has proven values.

**Palette:**
```
50:  #EEF4FF    500: #326CFF    900: #192B8F
100: #D9E6FF    600: #1E4CF5    950: #141C57
200: #BCD4FF    700: #1436E1
300: #8EBAFF    800: #172CB6
400: #5893FF
```

---

### 09 — Orange, grey, blue_grey: drop all three

**Decision:** Drop all three palettes.

**Rationale:**
- **Orange** — MUI legacy. Overlaps with amber. Warnings consolidate on amber.
- **Grey** — MUI Material legacy. Overlaps with stone. Neutrals consolidate on stone.
- **Blue Grey** — MUI Material legacy. Rarely used. Drop.

**Impact:** Platform components referencing these palettes will need remapping when migrating to Clarity V2. Grey → stone equivalents. Orange → amber (for warnings) or neutrals. Blue_grey → stone.

---

### 10 — Spacing scale: Clarity V2 (simpler)

**Decision:** Use Clarity V2's 13-tier scale (multiples of 4px).

**Values:** `0, 1(4px), 2(8px), 3(12px), 4(16px), 5(20px), 6(24px), 8(32px), 10(40px), 12(48px), 16(64px), 20(80px), 24(96px)`

**Rationale:** Tailwind-aligned. Simpler and more predictable. Platform's sub-4px values (2, 6, 10) were rarely needed and added complexity.

**Impact:** Platform components using sub-4px spacing will need to round to the nearest 4px increment on migration.

---

### 11 — Border radius `sm`: 4px

**Decision:** `sm = 4px` (Clarity V2 / Tailwind default).

**Rationale:** Matches Tailwind. Platform's 2px was almost imperceptibly rounded.

---

### 12 — Border radius `3xl` (24px): skip

**Decision:** Don't add.

**Rationale:** Current scale goes `sm(4) → md(6) → lg(8) → xl(12) → 2xl(16) → full(9999)`. If 24px corners are needed later, we can add `3xl` at that point.

---

### 13 — Typography naming: Tailwind standard

**Decision:** Use `xs/sm/base/lg/xl/2xl/3xl/4xl/5xl` (Clarity V2 current).

**Rationale:** Industry-standard, more developer-recognisable. Pairs naturally with Tailwind v4 utility classes.

**Values:**
```
xs:   12px        xl:  20px        4xl: 36px
sm:   14px        2xl: 24px        5xl: 48px
base: 16px        3xl: 30px
lg:   18px
```

---

### 14 — Font sizes 10px and 32px: skip

**Decision:** Don't add Platform's `xt (10px)` or `2x (32px)`.

**Rationale:**
- 10px is below accessibility guidelines for most UI text.
- 32px is close enough to 30px or 36px — pick the adjacent Tailwind tier.

**Impact:** Platform code using `xt` → remap to `xs (12px)` or use arbitrary value if truly needed. `2x (32px)` → remap to `3xl (30px)` or `4xl (36px)`.

---

### 15 — Font weight count: 4 weights

**Decision:** Keep Clarity V2's 4 weights: `normal (400) / medium (500) / semibold (600) / bold (700)`.

**Rationale:** Covers 99% of UI needs. Simpler. Fewer font files to load. Thin, light, extra-bold, and heavy weights are rarely used in production UIs and add maintenance overhead.

**Impact:** Any platform code using weights outside this range will need remapping (e.g., `light` → `normal`, `extra_bold` → `bold`).

---

## Summary table

| # | Topic | Decision | Source |
|---|---|---|---|
| 01 | Neutral naming | `stone` | Clarity V2 |
| 02 | Black value | `#0C0A09` (soft) | Clarity V2 |
| 03 | Brand naming | `violet` | Platform |
| 04 | Violet values | Platform | Platform |
| 05 | Violet 950 | Added | Platform |
| 06 | Green values | Platform | Platform |
| 07 | Missing tiers | Added all | Platform |
| 08 | Blue palette | Added | Platform |
| 09 | Orange/grey/blue_grey | Dropped | — |
| 10 | Spacing scale | Clarity V2 (13 tiers) | Clarity V2 |
| 11 | Radius `sm` | 4px | Clarity V2 |
| 12 | Radius `3xl` | Skipped | — |
| 13 | Typography naming | `xs-5xl` | Clarity V2 |
| 14 | Font sizes 10/32px | Skipped | — |
| 15 | Font weights | 4 weights | Clarity V2 |

**Distribution:** 8 decisions favor Clarity V2 naming/structure, 5 favor Platform values, 2 drop legacy content.

---

## What changed in the codebase

### Modified files
- `packages/tokens/src/color/primitive.tokens.json` — rewrote with new palette values, renamed purple→violet, added blue, added missing tiers
- `packages/tokens/src/color/semantic.tokens.json` — updated primary/border references from `purple` to `violet`
- `packages/tokens/src/shadcn/light.tokens.json` — updated chart color references from `purple` to `violet`
- `packages/tokens/src/shadcn/dark.tokens.json` — same
- `packages/tokens/dist/**` — regenerated outputs (web CSS, shadcn CSS, JS/TS, React Native, JSON)

### Unchanged files
- `packages/tokens/src/spacing.tokens.json` — decision 10 confirmed current scale
- `packages/tokens/src/typography.tokens.json` — decisions 13, 14, 15 all confirmed current values
- `packages/tokens/src/radius.tokens.json` — decisions 11 and 12 confirmed current scale
- `packages/tokens/build.mjs` — no build script changes needed

### Verification
- `node build.mjs` — succeeds, 5 platform outputs regenerated
- `npx vitest run` — 20/20 tests pass
- `nx build tokens` / `nx build components` — both succeed

---

## Next steps

1. **Phase 2 (Minivoda integration)** — when a fresh Minivoda checkout is available, diff the new `dist/shadcn/tokens.css` against Minivoda's current `globals.css` and migrate.
2. **Storybook rebuild (Phase 3)** — using the new tokens, begin building shadcn/ui components in clarity-v2. The violet brand color will now match what platform users are already used to seeing.
3. **Platform migration guide** — when engineering is ready to migrate platform components to Clarity V2, produce a mapping document showing:
   - `neutral` → `stone` (rename, values identical)
   - `purple` → `violet` (rename — but note the value alignment means no visual change)
   - `grey` / `blue_grey` → `stone` tier equivalents
   - `orange` → `amber` tier equivalents
   - Sub-4px spacing → round to nearest 4px
   - Custom typography names (`xt/tiny/small/medium/large/xl/2x/3x`) → Tailwind names (`xs/sm/base/lg/xl/2xl/3xl/4xl/5xl`)
   - Font weights outside 400-700 → map to nearest standard weight
