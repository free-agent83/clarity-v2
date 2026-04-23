# Product Filters: Mock Filter UI — Design Spec

**Date:** 2026-03-30
**Issue:** #11
**Milestone:** Phase 0: Full Mock UI Coverage

---

## Overview

Add interactive filter UI to all product listing pages. Phase 0 scope: filters are fully interactive (open, select, apply, clear) but do not filter the product list. Visual fidelity is the goal.

---

## Layout Reorganisation

All layout components move to per-layout subdirectories inside `components/layouts/`. No barrel/index files anywhere — all imports are direct file references.

### Final structure

```
components/layouts/
  layout-base/
    layout-base.tsx
  layout-browse/
    layout-browse.tsx
  layout-product-detail/
    layout-product-detail.tsx     ← index.ts removed
    diamond-certificate-info.tsx
    gemstone-certificate-info.tsx
    melee-parcel-info.tsx
  layout-product-list/
    layout-product-list.tsx
    filter-bar.tsx                ← new
  layout-under-construction/
    layout-under-construction.tsx
  pagination-controls.tsx         ← stays at root (cross-layout utility)
  types.ts                        ← stays at root (shared SpecRow type)
```

### Import path updates (~20 files)

Every import from a layout that is now inside a subdirectory must be updated to the direct path. The existing `layout-product-detail/index.ts` is deleted.

| Old import | New import |
|---|---|
| `@/components/layouts/layout-product-list` | `@/components/layouts/layout-product-list/layout-product-list` |
| `@/components/layouts/layout-product-detail` | `@/components/layouts/layout-product-detail/layout-product-detail` |
| `@/components/layouts/layout-base` | `@/components/layouts/layout-base/layout-base` |
| `@/components/layouts/layout-under-construction` | `@/components/layouts/layout-under-construction/layout-under-construction` |
| `./layout-browse` (relative, from layout-product-list) | `../layout-browse/layout-browse` |
| `../layout-browse` (relative, from layout-product-detail) | `../layout-browse/layout-browse` |

---

## FilterBar Component

### Location

`components/layouts/layout-product-list/filter-bar.tsx`

### Props

```ts
type FilterOption = {
  key: string       // unique identifier, e.g. "shape"
  label: string     // display label, e.g. "Shape"
  options: string[] // mock selectable values
}

type FilterBarProps = {
  filters: FilterOption[]
}
```

### State model

Two state slices in `FilterBar`, both `Record<string, string[]>` keyed by `FilterOption.key`:

- **`committed`** — the applied selections; drives button appearance
- **`pending`** — staged selections for the currently open individual filter popover; scoped to one filter at a time; discarded on cancel/outside click, merged into `committed` on Apply

`AllFiltersSheet` maintains its own internal `sheetPending: Record<string, string[]>` state, initialised from `committed` when the sheet opens. Applying from the sheet replaces `committed` wholesale; cancelling discards `sheetPending`.

### Button appearance (committed state)

| Committed selections | Button label |
|---|---|
| 0 | `"Shape ▾"` (default, outline style) |
| 1 | `"Round ✕"` (dark filled) |
| 2+ | `"Shape (3) ✕"` (dark filled, count in parens) |

Clicking ✕ on an active button clears that filter's committed state immediately (no popover).

### Popover behaviour

- Opens on button click (trigger is the filter button via `PopoverTrigger` wrapping the `Button`)
- Opens with `pending` pre-populated from current `committed` state for that filter
- Contains: title (filter label), checkbox list (one per option), Cancel + Apply buttons
- **Apply**: sets `committed[key] = pending[key]`, closes popover
- **Cancel / outside click**: discards pending, closes popover
- Uses `Popover`, `PopoverContent`, `PopoverTrigger` from `components/ui/popover.tsx`
- Uses `Checkbox` from `components/ui/checkbox.tsx`

### "Clear all" button

Resets all `committed` state to `{}`. Always visible; disabled when no filters are committed (keeps layout stable — avoids filter bar reflow when the button appears/disappears).

### "All filters" Sheet

- Trigger: "All filters" button (leftmost in filter bar)
- Opens a `Sheet` from the left side (`side="left"`)
- Contains all filters in a vertical scrollable list; each filter has a label and checkbox group
- Footer: "Apply" button (commits all pending → `committed`) and "Clear all" link
- Uses `Sheet`, `SheetTrigger`, `SheetContent`, `SheetClose` from `components/ui/sheet.tsx`

### Sub-component structure (all at module level — no inline component definitions)

```
filter-bar.tsx
  FilterBar          ← default export; owns committed + pending state
  FilterButton       ← single filter trigger + popover
  FilterPopover      ← popover content (checkboxes + apply/cancel)
  AllFiltersSheet    ← left-side sheet with all filters
```

All sub-components are defined as named top-level functions in the file. None are defined inside another component (`rerender-no-inline-components`).

---

## Mock Filter Options

Hardcoded constants defined in each page file, passed as the `filters` prop.

### Natural diamonds & Lab-grown diamonds

```ts
const FILTERS = [
  { key: "shape", label: "Shape", options: ["Round", "Oval", "Princess", "Cushion", "Emerald", "Pear", "Radiant", "Marquise", "Heart", "Asscher"] },
  { key: "carat", label: "Carat", options: ["Under 0.5ct", "0.5–1ct", "1–2ct", "2–3ct", "3–5ct", "5ct+"] },
  { key: "color", label: "Color", options: ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"] },
  { key: "clarity", label: "Clarity", options: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"] },
  { key: "cut", label: "Cut", options: ["Excellent", "Very Good", "Good", "Fair", "Poor"] },
  { key: "certification", label: "Certification", options: ["GIA", "IGI", "HRD", "AGS", "None"] },
]
```

### Gemstones

```ts
const FILTERS = [
  { key: "type", label: "Type", options: ["Ruby", "Sapphire", "Emerald", "Tanzanite", "Aquamarine", "Amethyst", "Tourmaline", "Spinel"] },
  { key: "shape", label: "Shape", options: ["Round", "Oval", "Cushion", "Pear", "Emerald", "Marquise", "Heart"] },
  { key: "color", label: "Color", options: ["Red", "Blue", "Green", "Purple", "Pink", "Yellow", "Orange", "Teal"] },
  { key: "carat", label: "Carat", options: ["Under 1ct", "1–2ct", "2–5ct", "5–10ct", "10ct+"] },
  { key: "origin", label: "Origin", options: ["Burma", "Ceylon", "Colombia", "Madagascar", "Mozambique", "Thailand", "Untreated"] },
  { key: "treatment", label: "Treatment", options: ["None", "Heat", "Beryllium", "Fracture filled", "Oiling"] },
]
```

### Natural melee & Lab-grown melee

```ts
const FILTERS = [
  { key: "shape", label: "Shape", options: ["Round", "Princess", "Baguette", "Tapered baguette"] },
  { key: "size", label: "Size", options: ["Under 1mm", "1–1.5mm", "1.5–2mm", "2–2.5mm", "2.5–3mm", "3mm+"] },
  { key: "color_range", label: "Color range", options: ["DEF", "GHI", "JKL", "MNO"] },
  { key: "clarity_range", label: "Clarity range", options: ["VVS", "VS", "SI", "I"] },
  { key: "cut", label: "Cut", options: ["Excellent", "Very Good", "Good"] },
]
```

### Jewelry (engagement rings)

```ts
const FILTERS = [
  { key: "stone_shape", label: "Stone shape", options: ["Round", "Oval", "Princess", "Cushion", "Emerald", "Pear", "Radiant", "Marquise"] },
  { key: "stone_count", label: "Stone count", options: ["Solitaire", "3-stone", "Halo", "Pavé", "Channel"] },
  { key: "metal", label: "Metal", options: ["14k Yellow Gold", "18k Yellow Gold", "14k Rose Gold", "18k Rose Gold", "14k White Gold", "18k White Gold", "950 Platinum"] },
  { key: "style", label: "Style", options: ["Classic", "Vintage", "Modern", "Nature-inspired", "Bezel"] },
]
```

---

## Pages Updated

Each of the following pages has its static `QuickFilters` function replaced with `<FilterBar filters={FILTERS} />`:

- `app/buyer/(shop)/browse/natural-diamonds/page.tsx`
- `app/buyer/(shop)/browse/lab-grown-diamonds/page.tsx`
- `app/buyer/(shop)/browse/gemstones/page.tsx`
- `app/buyer/(shop)/browse/natural-melee/page.tsx`
- `app/buyer/(shop)/browse/lab-grown-melee/page.tsx`
- `app/buyer/(shop)/browse/jewelry/engagement-rings/page.tsx`

`FilterBar` is a client component; importing it into a server page is fine — Next.js handles the boundary automatically.

---

## Out of Scope (Phase 1)

- Actual filtering of the product list
- URL search params for filter state
- Filter counts ("Shape (42)")
- Range sliders for Carat / Size
