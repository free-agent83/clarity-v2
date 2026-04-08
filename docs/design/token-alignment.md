# Token Alignment — Clarity V2 vs Platform Design System

**Audience:** Chris (design lead) + design team
**Purpose:** Surface the differences between the current platform design system and Clarity V2, so we can decide which values to carry forward as we rebuild Storybook.
**Last updated:** 2026-04-08

---

## Why this document exists

There are two design systems in play:

1. **Platform** (`platform/libs/shared/style-dictionary`) — the current production system, MUI-based, in use across customer/supplier/admin/jewellery apps. 60+ components, 48 component-specific token files. Authoritative today, but built on tech we're moving away from (MUI, emotion, `sx` props).

2. **Clarity V2** — the new system. shadcn/ui + Tailwind v4 + bespoke token pipeline. Early stage (1 component). Where we're going.

Most primitives are **close but not identical**. Some palettes match exactly. Others diverge slightly. A few exist in one system but not the other. We need to reconcile before rebuilding components — otherwise we're locking in arbitrary decisions.

**This document only surfaces the differences. It does not decide anything.** Chris is the decision-maker. Each section ends with a "decision needed" callout.

---

## TL;DR — what the differences look like

| Area | Status | Action |
|---|---|---|
| **Neutral / Stone** | ✅ Near-identical hex values | Align any tiny drift, keep platform values |
| **Red, Green, Amber** | ✅ Identical or near-identical | Keep platform values |
| **Violet / Purple** | ⚠️ Different names, different values | Decide: rename to violet? which values? |
| **Blue** | ❌ Platform only — missing from Clarity V2 | Add to Clarity V2 |
| **Orange** | ❌ Platform only — rarely used | Probably drop unless needed |
| **Grey / Blue Grey** | ❌ Platform only — MUI legacy | Drop |
| **Chart colors** | ❌ Platform only | Add to Clarity V2 |
| **Spacing** | ⚠️ Different granularity | Decide which scale wins |
| **Border radius** | ⚠️ Different scales | Decide alignment |
| **Typography sizes** | ⚠️ Completely different naming + values | Decide which scale wins |
| **Dark mode** | ❌ Platform has none | Clarity V2 defines from scratch |
| **Component tokens** | ❌ Platform has 48 files, Clarity V2 has 0 | Decide strategy |

---

## 1. Primitive palettes

### 1.1 Neutral / Stone — ✅ Matches

Platform calls it `neutral`, Clarity V2 calls it `stone`. **Hex values are identical or very close.**

| Tier | Platform (neutral) | Clarity V2 (stone) | Match? |
|---|---|---|---|
| 50 | `#FAFAF9` | `#fafaf9` | ✅ Identical |
| 100 | `#F5F5F4` | `#f5f5f4` | ✅ Identical |
| 200 | `#E7E5E4` | `#e7e5e4` | ✅ Identical |
| 300 | `#D6D3D1` | `#d6d3d1` | ✅ Identical |
| 400 | `#A8A29E` | `#a8a29e` | ✅ Identical |
| 500 | `#78716C` | `#78716c` | ✅ Identical |
| 600 | `#57534E` | `#57534e` | ✅ Identical |
| 700 | `#44403C` | `#44403c` | ✅ Identical |
| 800 | `#292524` | `#292524` | ✅ Identical |
| 900 | `#1C1917` | `#1c1917` | ✅ Identical |
| 950 | `#0C0A09` | `#0c0a09` | ✅ Identical |
| white | `#ffffff` | `#ffffff` | ✅ Identical |
| black | `#000000` | `#0c0a09` | ⚠️ Different — Clarity V2 aliases black to stone-950 |

**Decision needed:**
- Rename `stone` → `neutral` to match platform, or keep `stone` (which matches Tailwind's naming)?
- `black` primitive: true black (`#000000`) or soft black (`#0c0a09`)?

---

### 1.2 Violet / Purple — ⚠️ Different name, different values

This is the **brand color**. Platform calls it `violet`, Clarity V2 calls it `purple`. Values drift meaningfully.

| Tier | Platform (violet) | Clarity V2 (purple) | Match? |
|---|---|---|---|
| 50 | `#F4F2FF` | `#f4f2ff` | ✅ Identical |
| 100 | `#E9E8FF` | `#e9e8ff` | ✅ Identical |
| 200 | `#D7D4FF` | `#d4d0ff` | ⚠️ Different |
| 300 | `#BAB2FF` | `#9886ff` | ❌ Very different |
| 400 | `#9886FF` | `#7c5ce7` | ❌ Very different |
| 500 | `#7655FD` | `#6930e8` | ❌ Very different |
| 600 | `#6330F5` | `#5620e1` | ❌ Different |
| 700 | `#5620E1` | `#481abd` | ❌ Different |
| 800 | `#481ABD` | `#3b1599` | ❌ Different |
| 900 | `#3D189A` | `#2e1075` | ❌ Different |
| 950 | `#230C69` | — (not defined) | ❌ Missing in Clarity V2 |

**Observation:** Clarity V2's `purple-300` (`#9886ff`) equals Platform's `violet-400`. It looks like Clarity V2's scale is shifted one tier darker than Platform's — possibly a re-tuning, possibly an error.

**Decision needed:**
- **Name:** rename `purple` → `violet` for consistency with platform? (Recommended — brand color should have one name org-wide.)
- **Values:** which scale is authoritative? Platform has been in production for years; Clarity V2 may have been re-tuned for a reason.
- **950 tier:** add the missing darkest tier to Clarity V2?

---

### 1.3 Red — ✅ Matches

| Tier | Platform | Clarity V2 | Match? |
|---|---|---|---|
| 50 | `#FEF2F2` | `#fef2f2` | ✅ |
| 100 | `#FEE2E2` | `#fee2e2` | ✅ |
| 200 | `#FECACA` | `#fecaca` | ✅ |
| 300 | `#FCA5A5` | `#fca5a5` | ✅ |
| 400 | `#F87171` | `#f87171` | ✅ |
| 500 | `#EF4444` | `#ef4444` | ✅ |
| 600 | `#DC2626` | `#dc2626` | ✅ |
| 700 | `#B91C1C` | `#b91c1c` | ✅ |
| 800 | `#991B1B` | — (missing) | ❌ |
| 900 | `#7F1D1D` | — (missing) | ❌ |
| 950 | `#450A0A` | — (missing) | ❌ |

**Decision needed:** Add tiers 800-950 to Clarity V2 for completeness, or keep the truncated palette?

---

### 1.4 Green — ⚠️ Mostly matches, some drift

| Tier | Platform | Clarity V2 | Match? |
|---|---|---|---|
| 50 | `#F3FAF6` | `#f3faf6` | ✅ |
| 100 | `#D6F2E3` | `#d6f2e3` | ✅ |
| 200 | `#B4E4CB` | `#b0e5ca` | ⚠️ Tiny diff |
| 300 | `#93D5B3` | `#7dd4aa` | ⚠️ Diff |
| 400 | `#74C49C` | `#59b186` | ⚠️ Diff |
| 500 | `#59B186` | `#479570` | ❌ Clarity V2 is darker |
| 600 | `#479570` | `#3a7a5c` | ❌ Clarity V2 is darker |
| 700 | `#3D745C` | `#2d5f47` | ❌ Clarity V2 is darker |

**Observation:** Same pattern as violet — Clarity V2's scale is shifted darker by roughly one tier. Clarity V2 500 ≈ Platform 600.

**Decision needed:** Which scale is authoritative? The 500 tier is typically the "default" success color — it matters which value the brand actually uses.

---

### 1.5 Amber — ⚠️ Mostly matches

| Tier | Platform | Clarity V2 | Match? |
|---|---|---|---|
| 50 | `#FFFBEB` | `#fffbeb` | ✅ |
| 100 | `#FEF3C7` | `#fef3c7` | ✅ |
| 500 | `#F59E0B` | `#f59e0b` | ✅ |
| 600 | `#D97706` | `#d97706` | ✅ |
| 700 | `#B45309` | `#b45309` | ✅ |
| 200, 300, 400 | Defined on platform | Missing in Clarity V2 | ❌ |

**Decision needed:** Add 200, 300, 400 tiers to Clarity V2?

---

### 1.6 Blue — ❌ Platform only

Platform has a full blue palette (50-950). Clarity V2 has no blue at all. Platform uses blue for `info` semantic state and occasional links.

Platform values:
```
50: #EEF4FF, 100: #D9E6FF, 200: #BCD4FF, 300: #8EBAFF,
400: #5893FF, 500: #326CFF, 600: #1E4CF5, 700: #1436E1,
800: #172CB6, 900: #192B8F, 950: #141C57
```

**Decision needed:** Do we need blue in Clarity V2? If yes — use platform values or re-tune?

---

### 1.7 Orange — ❌ Platform only, likely legacy

Platform has orange (50-900 plus MUI A-tier: A100, A200, A400, A700). Clarity V2 doesn't. Platform uses orange for the `warning` semantic state (instead of amber) — `color.background.warning` references `orange.800`.

**Observation:** Platform has both amber AND orange, with overlapping purposes. This looks like MUI-era legacy — modern design systems use one warning color family.

**Decision needed:** Drop orange entirely (consolidate warnings on amber)? Or keep for legacy compatibility during migration?

---

### 1.8 Grey and Blue Grey — ❌ MUI legacy, drop

Platform has `grey` (50-900) and `blue_grey` (50-900). These are direct MUI Material palette holdovers. Clarity V2 has neither. The platform uses them sparingly — mostly in `border.base` (refs `grey.300`) and `background.inverse` (refs `blue_grey.900`).

**Decision:** Drop both in Clarity V2. Remap platform refs to `stone/neutral` tiers when migrating components.

---

## 2. Semantic tokens

### 2.1 Completely different conventions

**Platform** (MUI-flavoured):
- `primary.100/200/300/400/500` + `primary.default` + `primary.hover`
- `success`, `warning`, `danger`, `info` (single values)
- Plus 48 component-specific token files (Button, Checkbox, etc.)

**Clarity V2** (shadcn-flavoured):
- `primary.default/hover/active/subtle`
- `feedback.error/success/warning` with `-hover` and `-subtle` variants
- `background/foreground/border/disabled` with tiered variants
- Plus a separate "shadcn" output: `background`, `foreground`, `card`, `popover`, `primary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `chart-1..5`, `sidebar-*`

**Decision needed:**
- Which semantic model do we adopt? Clarity V2's shadcn-flat model is simpler but less granular than Platform's tiered approach.
- Recommendation: keep Clarity V2's model (it's aligned with shadcn and Tailwind v4), but add per-component token files later when we need theming control.

---

### 2.2 Platform's semantic mappings (for reference)

```
primary.default  → neutral.950   (near-black)
primary.hover    → violet.700
primary.100      → violet.50
primary.200      → violet.100
primary.300      → violet.400
primary.400      → violet.700
primary.500      → violet.800

success → green.600
warning → amber.700
danger  → red.700
info    → blue.700
```

Clarity V2 has similar intent but different tier picks — e.g., Clarity V2's `primary.hover` → `purple.600` (not `purple.700` like platform). Once we align the primitive palettes, these need re-validation.

---

## 3. Spacing scale

Both scales are based on 4px increments. **Platform has finer granularity** with sub-tier values.

| Token | Platform | Clarity V2 |
|---|---|---|
| 0 | 0px | 0px |
| 01 | 2px | — |
| 1 | 4px | 4px |
| 02 | 6px | — |
| 2 | 8px | 8px |
| 03 | 10px | — |
| 3 | 12px | 12px |
| 4 | 16px | 16px |
| 5 | 20px | 20px |
| 6 | 24px | 24px |
| 7 | 28px | — |
| 8 | 32px | 32px |
| 9 | 36px | — |
| 10 | 40px | 40px |
| 11 | 44px | — |
| 12 | 48px | 48px |
| 14 | 56px | — |
| 16 | 64px | 64px |
| 18 | 72px | — |
| 20 | 80px | 80px |
| 22 | 96px | — |
| 24 | 96px (Clarity V2) | 96px |

**Observation:** Platform has 22 tiers with sub-4px values (2, 6, 10). Clarity V2 has 13 tiers, Tailwind-aligned. Platform's `01`, `02`, `03` naming is unusual and inconsistent.

**Decision needed:**
- Adopt platform's finer granularity or keep Clarity V2's simpler scale?
- Recommendation: Keep Clarity V2's Tailwind-aligned scale. If specific sub-4px values are genuinely needed, add them as exceptions (e.g., `1.5` for 6px).

---

## 4. Border radius

| Name | Platform | Clarity V2 |
|---|---|---|
| none / 0 | `0` | `0px` |
| sm | `2px` | `4px` |
| base / 1 | `4px` | — |
| md | `6px` | `6px` |
| lg / 2 | `8px` | `8px` |
| xl / 3 | `12px` | `12px` |
| 2xl / 4 | `16px` | `16px` |
| 3xl / 6 | `24px` | — |
| 5 | `20px` | — |
| p_s | `10px` (odd value) | — |
| full | `9999px` | `9999px` |

**Decision needed:**
- Platform's `sm` is 2px, Clarity V2's is 4px. Which wins?
- Platform has `p_s: 10px` — a one-off value probably used in a specific component. Drop or keep?
- Clarity V2 is missing `3xl` (24px). Add?

---

## 5. Typography

**Completely different naming and values.**

### Font size

| Platform | Clarity V2 |
|---|---|
| `xt: 10px` | — |
| `tiny: 12px` | `xs: 12px` |
| `small: 14px` | `sm: 14px` |
| `medium: 16px` | `base: 16px` |
| — | `lg: 18px` |
| `large: 20px` | `xl: 20px` |
| `xl: 24px` | `2xl: 24px` |
| — | `3xl: 30px` |
| `2x: 32px` | — |
| — | `4xl: 36px` |
| `3x: 48px` | `5xl: 48px` |

**Observation:** Clarity V2's naming (`xs/sm/base/lg/xl/2xl/...`) is Tailwind-standard and industry-recognisable. Platform's (`xt/tiny/small/medium/large/xl/2x/3x`) is custom.

**Decision needed:**
- Adopt Clarity V2's Tailwind-standard naming.
- Do we need Platform's extreme sizes (`10px` and `32px`)? If yes, add to Clarity V2 (e.g., `2xs: 10px`, `3.5xl: 32px`).
- Platform's `lineHeight.3x: 103px` is suspiciously tall — probably a bug. Verify.

### Font weight

Platform has 9 weights (thin → heavy). Clarity V2 has 4 (normal, medium, semibold, bold).

**Decision needed:** Do we actually use thin/light/extra_bold/heavy anywhere? If not, drop them. Keep 4 weights unless there's a concrete use case.

### Line height

Platform pairs each size with a pixel line height (26px for 16px = ~1.625). Clarity V2 uses ratios (tight: 1.25, normal: 1.5, relaxed: 1.625).

**Decision needed:** Pixel-based or ratio-based? Ratios are more flexible and match Tailwind conventions. Platform's pixel pairs don't map 1:1 to Clarity V2's ratios.

---

## 6. What Clarity V2 has that Platform doesn't

### 6.1 OKLCH color format

Clarity V2 uses OKLCH internally (perceptually uniform color space). Platform uses hex. This is a **quality improvement** — OKLCH gives predictable contrast and supports wide-gamut P3 colors. No decision needed, just a note.

### 6.2 Dark mode

Clarity V2 defines dark mode values (shadcn-compatible `:root` + `.dark` scopes). Platform has no dark mode at all.

**Decision needed:** Dark mode is a new capability. Are the dark values we've defined correct? They're currently derived from light by inverting stone tiers — may need hand-tuning by the designer.

### 6.3 shadcn-compatible output

Clarity V2 outputs tokens in a flat shadcn format (`--background`, `--primary`). Platform doesn't. This is required for the shadcn/ui component rebuild.

---

## 7. What Platform has that Clarity V2 doesn't

### 7.1 Component-specific token files (48 files)

Platform has dedicated tokens for every component variant:
- Button contained/outlined/text × primary/secondary/success/warning/error/info
- TextField, Checkbox, Radio, Select, Switch, Slider
- Banner, Alert, Badge, Chip, Dialog, Avatar
- Table, List, Link, Tabs, Breadcrumbs
- Status, Divider, Tooltip, Paper, Card

**Why this matters:** When you want to change a Button's hover state without affecting anything else, you edit one token. It's granular control.

**Why it can also be overkill:** Most design systems start without this and add component tokens only when needed. shadcn/ui doesn't use component-level tokens — components consume semantic tokens directly via Tailwind classes.

**Decision needed:**
- Option A: Skip component tokens for now. Components consume semantic tokens (`bg-primary`, `text-foreground`). Simpler.
- Option B: Add component tokens as we build each component. More flexible long-term.
- Option C: Hybrid — semantic tokens for 80% of styling, component tokens only for states/variants that need fine control.
- Recommendation: **Option A now, Option C later.** Start simple, add component tokens when a real need arises.

### 7.2 Chart colors

Platform has dedicated chart tokens. Clarity V2's shadcn output has `chart-1..5` but they're currently placeholder purples derived from our palette. If you have actual chart color decisions made in Figma or the platform, we should use those.

### 7.3 More granular semantic colors

Platform has `background.base/alt/disabled/inverse/success/error/warning/info/link/low-priority/overlay`, plus component-specific backgrounds. Clarity V2 has fewer semantic buckets.

**Decision needed:** Which of these semantic concepts are worth carrying forward?

---

## 8. Open decisions summary

For each of these, I need Chris's call before we can align the tokens properly:

| # | Question | Why it matters |
|---|---|---|
| 1 | Rename `stone` → `neutral`? | Consistency with platform |
| 2 | Rename `purple` → `violet`? | Brand color naming |
| 3 | Which violet/purple values win? | Brand color appearance |
| 4 | Which green values win? (success color) | Status colors |
| 5 | Add blue palette? If yes, use platform values? | Info/link colors |
| 6 | Drop orange, grey, blue_grey? | Simplification |
| 7 | Add missing tiers (red 800-950, amber 200-400)? | Palette completeness |
| 8 | True black or soft black for `black` primitive? | Rare but used in shadows |
| 9 | Spacing scale: Clarity V2's simpler or Platform's finer? | Default spacing utilities |
| 10 | Border radius: reconcile the two scales | Component corners |
| 11 | Typography naming: Tailwind-standard or Platform-custom? | Developer experience |
| 12 | Do we need thin/light/heavy font weights? | Simplification |
| 13 | Component tokens: start simple (Option A) or start granular (Option B)? | Architecture decision |
| 14 | Dark mode values: accept current derivation or hand-tune? | New capability |
| 15 | Chart colors: from Figma or use current placeholders? | Data visualisation |

---

## 9. Recommended next steps

1. **Chris reviews this document** and makes decisions on the 15 open questions (or flags what needs designer input/Figma verification)
2. **I produce an updated `primitive.tokens.json`** reflecting the decisions — single source of truth going forward
3. **Rebuild Storybook components** using the reconciled tokens (Phase 3 of the broader plan)
4. **Refactor Minivoda** to consume the new tokens (Phase 2 of the broader plan)
5. **Component tokens** added later as needed, not upfront

---

## Appendix — Sources

- Platform tokens: `/Users/nivodatest/Documents/PROJECTS/nivoda/repos/platform/libs/shared/style-dictionary/src/lib/tokens/`
- Clarity V2 tokens: `/Users/nivodatest/Documents/PROJECTS/nivoda/repos/clarity-v2/packages/tokens/src/`
- Clarity V2 architecture: `architecture.md` (this repo) — see ADR-001 through ADR-004

## Appendix — What this document does NOT cover

- **Figma sources of truth** — Chris has identified 3 Figma files (DS Foundation, SPEC Buyer Web, SPEC Buyer App). These should also be cross-referenced. I can read Figma via MCP when you're ready for that pass.
- **Platform component API patterns** — 60+ components with documented prop signatures. Inventory exists in the audit notes but not here.
- **Migration impact on existing apps** — if we change values, existing platform apps keep using their version via the platform repo. Clarity V2 is additive.
