---
title: PLP Template — Phase 3a Implementation Design
authors:
  - "Jo\u00e3o Gomes"
  - Claude Code
date: 2026-04-16
status: Draft
parent: docs/plans/specs/2026-04-16-plp-template-component-spec.md
predecessor: docs/plans/specs/2026-04-16-plp-template-phase2-design.md
tags:
  - design-system
  - plp
  - phase-3a
  - filter-presets
  - implementation-design
---

# PLP Template — Phase 3a Implementation Design

## Scope

Phase 3a adds three advanced filter presets to the PLP template's filter registry:

1. **Range slider** — min/max numeric range with optional distribution histogram and numeric inputs for precise entry (e.g., Price, Carat)
2. **Multi-axis range** — grouped set of range sliders under one filter label, with human-readable axis labels (e.g., Size: Length × Width × Depth)
3. **Async combobox** — multi-select combobox that loads options lazily via a consumer-supplied search function, for high-cardinality lookups (e.g., Supplier)

It also adds consistent chip truncation for multi-select presets in the active filters strip.

### Phase 3a includes

- Three new filter presets added to `FilterPresetName` and the filter registry
- `range-slider` preset with min/max bounds, step, unit, optional histogram, commit-on-blur numeric inputs
- `multi-axis-range` preset with per-axis id/label/min/max/step/unit; no histogram support on this preset
- `async-combobox` preset built on the existing `Combobox` molecule, multi-select, lazy-loaded options on open, debounced search on typing
- Chip truncation for multi-select presets: first two values shown, `+N more` for the rest
- Active filter chip formatting for range values: `"Label: min–max unit"` (e.g., `"Price: $100–$500"`)
- Active filter chip formatting for multi-axis range values: per-axis summary using axis labels (e.g., `"Size: L 5–10mm, W 5–10mm, D 2–4mm"` — truncated)
- `FilterValue` type extended to include the multi-axis value shape
- Storybook: every existing story's filter config updated to include examples of every preset, so any story demonstrates the full filter capability
- COMPONENT.md bumped to `0.3.0` with the new preset names documented

### Phase 3a excludes

- Histogram on multi-axis range — kept flat for clarity; can be added if needed later
- Filter search within the drawer — deliberately not included
- Auxiliary data for chip-based presets (result-count-aware option labels mentioned in the architectural spec §2.5.3) — deferred

### Relationship to Phase 1 and 2

Phase 3a does not change any existing preset behaviour. It adds three new entries to the `FilterPresetName` union and three new components under `plp/filters/presets/`. The filter registry (`plp-filter-registry.ts`) gains three new entries in its preset map and three new chip-formatting cases in `formatFilterChipValue`. The `FilterValue` union gains one new variant (`Record<string, { min: number; max: number }>`) to support multi-axis range values.

---

## 1. Range slider preset

### Definition fields

On `PresetFilterDefinition`, the following fields are valid when `preset === "range-slider"`:

```ts
interface PresetFilterDefinition {
  // ...existing fields
  min?: number;
  max?: number;
  step?: number;
  unit?: string;                     // "$", "ct", "mm" — shown as prefix/suffix
  histogram?: {
    buckets: number[];               // counts, one per equal-width bar
    min: number;                     // lower bound of distribution domain
    max: number;                     // upper bound of distribution domain
  };
}
```

`min`, `max`, `step`, `unit` configure the slider itself. `histogram` is an optional auxiliary data visualization sitting behind the slider track.

### Value shape

```ts
filterState["price"] = { min: 100, max: 500 };
```

Undefined means no range filter applied. Clearing the filter sets value to `undefined`.

### UI layout

Inside the popover or drawer section:
- The histogram (if present) renders as a row of bars behind the slider track, one bar per bucket count. Bars span the slider's full `min`–`max` range, evenly distributed. Bar heights normalise against the max bucket count in the array.
- Below the slider, two numeric inputs side-by-side: one for min, one for max. The `unit` string renders as a suffix on each input.
- Inputs are **commit-on-blur / Enter**: typing doesn't update the slider until the user blurs or presses Enter. Avoids intermediate slider jumps while typing multi-digit values.
- Invalid input (min > max, non-numeric) resets to the last valid value on blur.

### Histogram rendering

- `buckets[]` counts are normalised to bar heights: `height = (count / maxCount) * availableHeight`.
- `min` and `max` on the histogram define the x-axis extent. When they match the slider's `min`/`max` (the common case), bars align exactly with the slider's track. When they differ (rare), bars are still positioned proportionally within the slider's range.
- A histogram with all zeros or an empty `buckets` array renders as no bars (not an error, just nothing to draw).
- If `histogram` is undefined, no bars render — slider displays with just the track and handles.

### Chip formatting

Format: `"{label}: {min}{unit}–{max}{unit}"` with `unit` treated as prefix if it's currency-like (`$`, `€`, `£`) and suffix otherwise.

Examples:
- `"Price: $100–$500"`
- `"Carat: 1.00–3.50ct"`
- `"Length: 5–10mm"`

Unit detection: if `unit` starts with a currency symbol or `unit` exactly matches a known currency code (`USD`, `EUR`, `GBP`), treat as prefix. Otherwise suffix. Consumers can override by supplying a custom filter instead — presets handle the common cases.

---

## 2. Multi-axis range preset

### Definition fields

On `PresetFilterDefinition`, the following fields are valid when `preset === "multi-axis-range"`:

```ts
interface PresetFilterDefinition {
  // ...existing fields
  axes?: {
    id: string;                      // "length", "width", "depth" — key in value
    label: string;                   // "Length", "Width", "Depth" — shown in UI
    min: number;
    max: number;
    step?: number;
    unit?: string;
  }[];
}
```

Each axis is a self-contained range definition. The `id` is machine-readable (used as a key in the filter value); the `label` is human-readable (shown in the UI and chips).

### Value shape

```ts
filterState["size"] = {
  length: { min: 5, max: 10 },
  width: { min: 5, max: 10 },
  depth: { min: 2, max: 4 },
};
```

Keys match `axes[].id`. Axes with no active range are omitted from the value object. When all axes are cleared, the filter value becomes `undefined`.

### UI layout

Inside the popover or drawer section:
- One row per axis, each row showing: axis `label` as a subheading, then a range slider + two numeric inputs (same pattern as single-axis range slider).
- No histogram support on this preset (deliberate — three histograms in one popover is visually noisy, and the distributions are usually correlated).
- Apply/Clear buttons at the bottom (shared popover pattern — already exists in quick filters).

### Chip formatting

Format: `"{label}: {axis1Label[0]} {min}–{max}{unit}, {axis2Label[0]} {min}–{max}{unit}, ..."` — using the first letter of each axis label as an abbreviation.

Examples:
- `"Size: L 5–10mm, W 5–10mm, D 2–4mm"`
- `"Size: L 5–10mm"` (when only one axis is active)

Truncation: if the combined chip text exceeds ~60 characters, render first two axes and `+N more`:
- `"Size: L 5–10mm, W 5–10mm +1 more"`

---

## 3. Async combobox preset

### Definition fields

On `PresetFilterDefinition`, the following fields are valid when `preset === "async-combobox"`:

```ts
interface PresetFilterDefinition {
  // ...existing fields
  searchFn?: (query: string) => Promise<FilterOption[]>;
  searchDebounceMs?: number;         // defaults to 250ms
  searchPlaceholder?: string;        // placeholder for the combobox input
}
```

The consumer supplies `searchFn`. The preset invokes it on open and on typed queries. All network handling, caching, and throttling inside `searchFn` is the consumer's concern.

### Value shape

```ts
filterState["supplier"] = ["supplier-1", "supplier-2", "supplier-3"];
```

Array of selected option values — same shape as the existing `multi-select-chips` preset. Empty array becomes `undefined` (filter clears).

### UI layout

Built on the existing `Combobox` molecule from the library:
- `Combobox` with `ComboboxChips` (multi-select mode, renders selected values as chips in the trigger area)
- `ComboboxInput` for the search query
- `ComboboxList` renders options from the current `searchFn` result

### Lazy loading behaviour

- When the popover opens (first time or re-open), the preset calls `searchFn("")` once and shows those options.
- As the user types, the preset debounces (default 250ms, configurable via `searchDebounceMs`) and calls `searchFn(query)` with the current input.
- While a request is in flight, the list shows a loading state (skeleton rows or spinner — implementation detail of the preset).
- On an empty result, the list shows a "No results" empty state.

### Selected value label caching

Selected options may not appear in the current search results (user selected "Acme Corp" earlier, then typed "Gem" and no longer sees Acme in the list). The combobox must still display selected values as chips.

Cache `FilterOption` objects as they're selected. On render, for each value in `filterState[id]`, look up the cached label. If a value is not in the cache (e.g., initial load from URL state), render the raw value string as a fallback — consumers who need correct labels on first paint must pre-populate by supplying the initial value's label in a way the preset can read. A future enhancement might add an explicit `resolveLabel(value) => Promise<string>` on the definition; not in Phase 3a scope.

### Chip formatting

Same format as multi-select-chips with truncation: first two selected values, `+N more` for the rest.

---

## 4. Chip truncation for multi-select presets

Apply to both `multi-select-chips` (existing) and `async-combobox` (new).

### Format

- 0 selected: chip is not rendered (no filter value, handled at the strip level already).
- 1 selected: `"{label}: {value1}"`
- 2 selected: `"{label}: {value1}, {value2}"`
- 3+ selected: `"{label}: {value1}, {value2} +{N-2} more"`

### Which values are shown

First two values in the array's insertion order. Consumers that want a specific order can supply values in that order.

### No character-length truncation

We don't truncate based on pixel or character length, only count. A filter with two very long values (e.g., two long supplier names) renders both in full. The visible strip already scrolls horizontally when content overflows — character-truncation would add complexity without matching user intent ("hide the ones I can't see at a glance").

---

## 5. Type additions and changes

### `FilterPresetName` extended

```ts
export type FilterPresetName =
  | "boolean-chip"
  | "single-select-chips"
  | "multi-select-chips"
  | "single-select-dropdown"
  | "range-slider"              // NEW
  | "multi-axis-range"          // NEW
  | "async-combobox";           // NEW
```

### `PresetFilterDefinition` extended

Add the optional fields from §1, §2, §3 to the existing interface. All new fields are optional — existing preset consumers are unaffected.

### `FilterValue` extended

Add the multi-axis range variant:

```ts
export type FilterValue =
  | string
  | string[]
  | { min: number; max: number }
  | Record<string, { min: number; max: number }>   // NEW — multi-axis range
  | boolean
  | undefined;
```

Distinguishing between single-range `{ min, max }` and multi-axis `Record<string, { min, max }>` at runtime: the single-range shape has exactly two keys (`min`, `max`) both with numeric values; the multi-axis shape has string keys with object values. The chip formatter and preset components handle the discrimination.

---

## 6. File structure additions

```
plp/filters/presets/
├── boolean-chip.tsx              (existing)
├── single-select-chips.tsx       (existing)
├── multi-select-chips.tsx        (existing)
├── single-select-dropdown.tsx    (existing)
├── range-slider.tsx              NEW — uses Slider atom + Input atoms
├── multi-axis-range.tsx          NEW — composes multiple range sliders
└── async-combobox.tsx            NEW — uses Combobox molecule
```

Modified:
- `plp/filters/plp-filter-registry.ts` — add three new entries to `PRESET_MAP`; add three new cases to `formatFilterChipValue`; add truncation logic for multi-select preset formatting.
- `plp/plp-types.ts` — extend `FilterPresetName`, `PresetFilterDefinition`, `FilterValue`.
- `plp/plp-template.stories.tsx` — update all existing stories' filter configs to include examples of every preset.
- `plp/COMPONENT.md` — version `0.3.0`, document the three new preset names.

---

## 7. Storybook strategy

Every existing story's filter configuration is updated to include at least one example of each preset type:

- Boolean chip (Nivoda Curated, Returnable)
- Single-select chips (Shipping time or Treatment)
- Multi-select chips (Color, Clarity)
- Single-select dropdown (Location)
- Range slider (Price with histogram, Carat with histogram)
- Multi-axis range (Size: Length × Width × Depth)
- Async combobox (Supplier)
- Custom render-prop (already demonstrated via `WithCustomFilter`)

This applies to: `GemstoneCategory`, `JewelryCategory`, `WithActiveFilters`, `WithCustomFilter`, `Loading`, `EmptyFiltered`, `EmptyNoItems`, `Error`, `Mobile`, `DiamondListView`, `GemstoneListView`.

Shared filter arrays (currently `GEMSTONE_FILTERS`, `DIAMOND_FILTERS`) are extended to include the new presets. Mock histogram data and a mock `searchFn` (returns fake suppliers after a small timeout) are defined as shared helpers.

`WithActiveFilters` is updated to pre-populate at least one range value and one async-combobox value in addition to existing chip values, so the chip truncation + range chip formatting are visible immediately.

---

## 8. Accessibility (Phase 3a additions)

### Range slider
- The existing `Slider` atom from the library already handles keyboard navigation (arrow keys adjust min/max handles) and ARIA roles (`role="slider"`, `aria-valuenow`/`aria-valuemin`/`aria-valuemax`).
- Numeric inputs have proper `<label>` associations via `htmlFor` / `id`, visible labels per axis (or "Min" / "Max" for single-axis).
- Histogram is decorative: `aria-hidden="true"` on the bar chart. The slider's value announcements already convey the user's current position.

### Multi-axis range
- Each axis is a self-contained region with its label as the accessible name (via an `aria-labelledby` wrapper or an `<h*>` element rendered inside the preset).
- Focus order: top axis's min slider → top axis's max slider → top axis's min input → top axis's max input → next axis.

### Async combobox
- Built on the existing `Combobox` molecule, which already implements the combobox ARIA pattern (`role="combobox"`, `aria-expanded`, `aria-controls`, etc.).
- Loading state announces via `aria-live="polite"`.
- Selected chips are keyboard-removable via Backspace (inherited from `ComboboxChips`).

---

## 9. Not responsible for

- Consumer-side caching of async query results (the preset calls `searchFn` each time; consumer implements memoization if desired).
- Persisting the query string in the filter value (only selected option values are persisted).
- URL serialisation of range or multi-axis values (consumer's routing adapter concern, same as all other filter state).
- Computing histogram buckets from raw data (consumer runs their own bucketing against the filtered result set).
