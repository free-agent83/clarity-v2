# PLP Template Phase 3a Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three advanced filter presets to the PLP template — range slider (with optional histogram and numeric inputs), multi-axis range, and async combobox (multi-select, lazy-loaded options) — plus chip truncation for multi-select presets in the active filters strip.

**Architecture:** Each preset is a new self-contained component under `plp/filters/presets/`, registered in the existing `PRESET_MAP`. Definition fields hang directly off `PresetFilterDefinition` (flat) — preset-specific applicability is implicit, same as Phase 1 conventions. `FilterValue` gains one new variant (`Record<string, { min: number; max: number }>`) for multi-axis. Existing design system primitives are composed: `Slider` atom for range, `Input` atom for numeric entry, `Combobox` molecule for async multi-select.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind v4, existing Clarity V2 primitives (`Slider` atom, `Input` atom, `Combobox` molecule — built on `@base-ui/react`), Tabler icons, Storybook 8.6 (CSF3).

**Design spec:** `docs/plans/specs/2026-04-16-plp-template-phase3a-design.md`
**Parent architectural spec:** `docs/plans/specs/2026-04-16-plp-template-component-spec.md`

---

## File map

All paths under `packages/components/src/components/templates/plp/` unless noted.

| File | Action | Responsibility |
|------|--------|---------------|
| `plp-types.ts` | Modify | Extend `FilterPresetName`, `PresetFilterDefinition`, `FilterValue` |
| `filters/presets/range-slider.tsx` | Create | Range slider preset (slider + numeric inputs + optional histogram) |
| `filters/presets/multi-axis-range.tsx` | Create | Multi-axis range preset (composes multiple range sliders) |
| `filters/presets/async-combobox.tsx` | Create | Async multi-select combobox preset |
| `filters/plp-filter-registry.ts` | Modify | Register new presets; add chip formatting for new value shapes; add multi-select truncation helper |
| `filters/plp-filter-registry.test.ts` | Modify | Add test coverage for new preset formatting + truncation |
| `plp-template.stories.tsx` | Modify | Extend shared filter arrays to include all presets; mock histogram + searchFn helpers |
| `COMPONENT.md` | Modify | Bump to 0.3.0, document new preset names |
| `packages/components/CHANGELOG.md` | Modify | Add Phase 3a entry |

---

## Conventions reference

Read `packages/components/CONTRIBUTING.md` before writing code. Recap:

- **Imports:** `cn()` from `@/lib/utils`. Existing primitives via tier paths.
- **Props:** `interface` for props, extend native element, JSDoc on every named export.
- **Exports:** Named only.
- **Tokens:** Tailwind theme classes or `var(--token)` only. No raw literals.
- **Stories:** CSF3, `tags: ["autodocs"]`, system components only.
- **Client components:** `"use client"` on any file using hooks or state.

---

## Task 1: Extend types

**Files:**
- Modify: `packages/components/src/components/templates/plp/plp-types.ts`

Add three new preset names, fields for each, and extend `FilterValue` with the multi-axis shape.

- [ ] **Step 1: Update the `FilterPresetName` union**

Find the existing `FilterPresetName` type declaration and replace with:

```ts
/** Names of built-in filter presets. */
export type FilterPresetName =
  | "boolean-chip"
  | "single-select-chips"
  | "multi-select-chips"
  | "single-select-dropdown"
  | "range-slider"
  | "multi-axis-range"
  | "async-combobox";
```

- [ ] **Step 2: Extend `PresetFilterDefinition` with new preset fields**

Locate the existing `PresetFilterDefinition` interface and append the new optional fields at the end of the interface body, immediately before the closing `}`:

```ts
  // -- range-slider preset ---------------------------------------------------

  /** Lower bound of the slider's selectable range. */
  min?: number;
  /** Upper bound of the slider's selectable range. */
  max?: number;
  /** Increment between slider stops. Defaults to 1 if omitted. */
  step?: number;
  /**
   * Unit for display in the slider's numeric inputs and active filter chip.
   * Currency symbols ("$", "€", "£") render as prefix; everything else as suffix.
   */
  unit?: string;
  /**
   * Optional distribution histogram drawn behind the slider track.
   * `buckets` are equal-width bar counts across the `[min, max]` domain.
   */
  histogram?: {
    buckets: number[];
    min: number;
    max: number;
  };

  // -- multi-axis-range preset -----------------------------------------------

  /**
   * Axes for multi-axis-range preset. Each axis is an independent range
   * with its own bounds and unit.
   * - `id` is machine-readable, used as a key in the filter value.
   * - `label` is human-readable, shown in the UI and in chip text.
   */
  axes?: {
    id: string;
    label: string;
    min: number;
    max: number;
    step?: number;
    unit?: string;
  }[];

  // -- async-combobox preset -------------------------------------------------

  /**
   * Called by the preset to load options. Invoked once when the popover
   * opens (with an empty query) and on each debounced query change.
   */
  searchFn?: (query: string) => Promise<FilterOption[]>;
  /** Debounce delay for `searchFn` invocations on input. Defaults to 250ms. */
  searchDebounceMs?: number;
  /** Placeholder text for the combobox input. */
  searchPlaceholder?: string;
```

- [ ] **Step 3: Extend `FilterValue`**

Find the existing `FilterValue` union and replace with:

```ts
/** Union of all possible filter value shapes. */
export type FilterValue =
  | string
  | string[]
  | { min: number; max: number }
  | Record<string, { min: number; max: number }>
  | boolean
  | undefined;
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd packages/components && npx tsc --noEmit
```

Expected: zero errors. Some non-Phase-3a files may show stale errors if the broader `FilterValue` union has newly ambiguous narrowings — investigate and fix if they appear.

- [ ] **Step 5: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/plp-types.ts
git commit -m "feat(plp): extend types for range-slider, multi-axis-range, async-combobox presets"
```

---

## Task 2: Chip truncation helper + updated multi-select formatting

**Files:**
- Modify: `packages/components/src/components/templates/plp/filters/plp-filter-registry.ts`
- Modify: `packages/components/src/components/templates/plp/filters/plp-filter-registry.test.ts`

Introduce a shared helper `formatMultiSelectChip(values, labels)` that produces `"A, B"` for two values and `"A, B +N more"` for three or more. Use it in the `multi-select-chips` case (Phase 1) and prepare for `async-combobox` (Task 6).

- [ ] **Step 1: Add failing tests for the truncation behaviour**

Open `plp-filter-registry.test.ts` and add the following tests inside the existing `describe("formatFilterChipValue")` block:

```ts
  it("formats multi-select with 3+ selections as first-two-plus-more", () => {
    const def: PresetFilterDefinition = {
      id: "color",
      label: "Color",
      preset: "multi-select-chips",
      options: [
        { value: "blue", label: "Blue" },
        { value: "green", label: "Green" },
        { value: "red", label: "Red" },
        { value: "teal", label: "Teal" },
        { value: "pink", label: "Pink" },
      ],
    };
    expect(formatFilterChipValue(def, ["blue", "green", "red"])).toBe(
      "Blue, Green +1 more"
    );
    expect(formatFilterChipValue(def, ["blue", "green", "red", "teal", "pink"])).toBe(
      "Blue, Green +3 more"
    );
  });

  it("still formats multi-select with 1 or 2 selections without truncation", () => {
    const def: PresetFilterDefinition = {
      id: "color",
      label: "Color",
      preset: "multi-select-chips",
      options: [
        { value: "blue", label: "Blue" },
        { value: "green", label: "Green" },
      ],
    };
    expect(formatFilterChipValue(def, ["blue"])).toBe("Blue");
    expect(formatFilterChipValue(def, ["blue", "green"])).toBe("Blue, Green");
  });
```

- [ ] **Step 2: Run the tests and confirm they fail**

```bash
cd packages/components
npx vitest run --project unit src/components/templates/plp/filters/plp-filter-registry.test.ts
```

Expected: the two new tests FAIL with mismatched strings ("Blue, Green, Red" vs "Blue, Green +1 more"). The pre-existing 8 tests still PASS.

- [ ] **Step 3: Implement the helper and update the multi-select case**

Open `plp-filter-registry.ts`. At the top of the file, below imports and above `PRESET_MAP`, add the helper:

```ts
/**
 * Formats an array of labels for display in an active filter chip.
 *
 * - 0 labels → empty string (not expected; caller should gate on value).
 * - 1 label  → the label itself.
 * - 2 labels → `"Label1, Label2"`.
 * - 3+ labels → `"Label1, Label2 +N more"` (N = labels.length - 2).
 */
function formatMultiSelectChip(labels: string[]): string {
  if (labels.length === 0) return "";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]}, ${labels[1]}`;
  const remaining = labels.length - 2;
  return `${labels[0]}, ${labels[1]} +${remaining} more`;
}
```

Then locate the `"multi-select-chips"` case inside `formatFilterChipValue` and replace it with:

```ts
    case "multi-select-chips":
    case "async-combobox": {
      if (!Array.isArray(value)) return String(value);
      const labels = value.map((v) => {
        const option = preset.options?.find((o) => o.value === v);
        return option?.label ?? v;
      });
      return formatMultiSelectChip(labels);
    }
```

Note: `async-combobox` is grouped with `multi-select-chips` in the same case because both use the same `string[]` value shape and formatting rules. The `preset.options` lookup still works for `async-combobox` because the preset component caches selected option labels into the definition's `options` array at selection time (see Task 5).

- [ ] **Step 4: Run the tests and confirm they pass**

```bash
cd packages/components
npx vitest run --project unit src/components/templates/plp/filters/plp-filter-registry.test.ts
```

Expected: all tests PASS (original 8 + 2 new = 10).

- [ ] **Step 5: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/filters/plp-filter-registry.ts \
        packages/components/src/components/templates/plp/filters/plp-filter-registry.test.ts
git commit -m "feat(plp): truncate multi-select chips to first two values plus N more"
```

---

## Task 3: Range slider preset

**Files:**
- Create: `packages/components/src/components/templates/plp/filters/presets/range-slider.tsx`

The range slider preset composes the `Slider` atom (Radix-backed, supports two-thumb range via `value={[min, max]}`) with two `Input` atoms for precise numeric entry and an optional histogram drawn behind the track.

- [ ] **Step 1: Create the preset file**

```tsx
// plp/filters/presets/range-slider.tsx
"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "../../../atoms/input/input";
import { Slider } from "../../../atoms/slider/slider";
import type {
  FilterControlProps,
  PresetFilterDefinition,
} from "../../plp-types";

/**
 * Props for the range-slider preset.
 *
 * Accepts the full `PresetFilterDefinition` so the preset can read its own
 * config (`min`, `max`, `step`, `unit`, `histogram`) without the registry
 * having to dissect the definition into loose props.
 */
export interface RangeSliderFilterProps extends FilterControlProps {
  definition: PresetFilterDefinition;
}

/**
 * Range slider filter preset.
 *
 * Renders a two-thumb slider, an optional distribution histogram behind
 * the track, and commit-on-blur numeric inputs for precise min/max entry.
 * Reads `min`, `max`, `step`, `unit`, and `histogram` from the definition.
 */
export function RangeSliderFilter({
  value,
  onChange,
  definition,
}: RangeSliderFilterProps) {
  const rangeMin = definition.min ?? 0;
  const rangeMax = definition.max ?? 100;
  const step = definition.step ?? 1;

  const currentMin =
    value && typeof value === "object" && "min" in value
      ? (value as { min: number; max: number }).min
      : rangeMin;
  const currentMax =
    value && typeof value === "object" && "max" in value
      ? (value as { min: number; max: number }).max
      : rangeMax;

  // Local input state — commits to `onChange` on blur or Enter
  const [minInput, setMinInput] = useState(String(currentMin));
  const [maxInput, setMaxInput] = useState(String(currentMax));

  useEffect(() => {
    setMinInput(String(currentMin));
    setMaxInput(String(currentMax));
  }, [currentMin, currentMax]);

  function commit(nextMin: number, nextMax: number) {
    const clampedMin = Math.max(rangeMin, Math.min(nextMin, rangeMax));
    const clampedMax = Math.max(rangeMin, Math.min(nextMax, rangeMax));
    const orderedMin = Math.min(clampedMin, clampedMax);
    const orderedMax = Math.max(clampedMin, clampedMax);

    if (orderedMin === rangeMin && orderedMax === rangeMax) {
      onChange(undefined);
    } else {
      onChange({ min: orderedMin, max: orderedMax });
    }
  }

  function handleSliderChange(values: number[]) {
    const [nextMin, nextMax] = values;
    commit(nextMin, nextMax);
  }

  function commitInputs() {
    const nextMin = Number.parseFloat(minInput);
    const nextMax = Number.parseFloat(maxInput);
    if (Number.isFinite(nextMin) && Number.isFinite(nextMax)) {
      commit(nextMin, nextMax);
    } else {
      // Invalid — reset to last valid values
      setMinInput(String(currentMin));
      setMaxInput(String(currentMax));
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitInputs();
      (e.target as HTMLInputElement).blur();
    }
  }

  const isCurrencyUnit = definition.unit
    ? ["$", "€", "£", "¥"].some((c) => definition.unit!.startsWith(c)) ||
      ["USD", "EUR", "GBP", "JPY"].includes(definition.unit)
    : false;

  return (
    <div className="flex flex-col gap-4">
      {definition.histogram && (
        <Histogram
          buckets={definition.histogram.buckets}
          histogramMin={definition.histogram.min}
          histogramMax={definition.histogram.max}
          sliderMin={rangeMin}
          sliderMax={rangeMax}
          selectedMin={currentMin}
          selectedMax={currentMax}
        />
      )}

      <Slider
        value={[currentMin, currentMax]}
        min={rangeMin}
        max={rangeMax}
        step={step}
        onValueChange={handleSliderChange}
      />

      <div className="flex items-center gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-muted-foreground" htmlFor={`${definition.id}-min`}>
            Min
          </label>
          <div className="flex items-center gap-1">
            {isCurrencyUnit && definition.unit && (
              <span className="text-sm text-muted-foreground">{definition.unit}</span>
            )}
            <Input
              id={`${definition.id}-min`}
              type="number"
              inputMode="decimal"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              onBlur={commitInputs}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            {!isCurrencyUnit && definition.unit && (
              <span className="text-sm text-muted-foreground">{definition.unit}</span>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs text-muted-foreground" htmlFor={`${definition.id}-max`}>
            Max
          </label>
          <div className="flex items-center gap-1">
            {isCurrencyUnit && definition.unit && (
              <span className="text-sm text-muted-foreground">{definition.unit}</span>
            )}
            <Input
              id={`${definition.id}-max`}
              type="number"
              inputMode="decimal"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              onBlur={commitInputs}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            {!isCurrencyUnit && definition.unit && (
              <span className="text-sm text-muted-foreground">{definition.unit}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Distribution histogram drawn behind the range slider track.
 *
 * Each bucket renders as a vertical bar with height proportional to its
 * count relative to the max count in the array. Bars span the slider's
 * `[sliderMin, sliderMax]` domain; if the histogram's own `[min, max]`
 * differs from the slider's, bars are offset proportionally within the
 * slider's range.
 */
function Histogram({
  buckets,
  histogramMin,
  histogramMax,
  sliderMin,
  sliderMax,
  selectedMin,
  selectedMax,
}: {
  buckets: number[];
  histogramMin: number;
  histogramMax: number;
  sliderMin: number;
  sliderMax: number;
  selectedMin: number;
  selectedMax: number;
}) {
  const maxBucket = Math.max(...buckets, 1);
  const bucketWidth = (histogramMax - histogramMin) / buckets.length;
  const sliderSpan = sliderMax - sliderMin;

  return (
    <div
      aria-hidden="true"
      className="relative flex h-12 items-end gap-px"
    >
      {buckets.map((count, i) => {
        const bucketStart = histogramMin + i * bucketWidth;
        const bucketEnd = bucketStart + bucketWidth;
        const bucketCenter = (bucketStart + bucketEnd) / 2;
        const inRange =
          bucketCenter >= selectedMin && bucketCenter <= selectedMax;
        const heightPct = (count / maxBucket) * 100;
        const leftPct = ((bucketStart - sliderMin) / sliderSpan) * 100;
        const widthPct = (bucketWidth / sliderSpan) * 100;

        return (
          <div
            key={i}
            className={cn(
              "absolute bottom-0 rounded-sm transition-colors",
              inRange ? "bg-primary/60" : "bg-muted-foreground/20"
            )}
            style={{
              left: `${leftPct}%`,
              width: `calc(${widthPct}% - 1px)`,
              height: `${heightPct}%`,
              minHeight: count > 0 ? 2 : 0,
            }}
          />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/filters/presets/range-slider.tsx
git commit -m "feat(plp): add range-slider filter preset with histogram and numeric inputs"
```

---

## Task 4: Multi-axis range preset

**Files:**
- Create: `packages/components/src/components/templates/plp/filters/presets/multi-axis-range.tsx`

A series of named range controls — one per axis. Each axis has its own id/label/min/max/step/unit. Value shape is a map keyed by axis id.

- [ ] **Step 1: Create the preset**

```tsx
// plp/filters/presets/multi-axis-range.tsx
"use client";

import { useEffect, useState } from "react";
import { Input } from "../../../atoms/input/input";
import { Slider } from "../../../atoms/slider/slider";
import type {
  FilterControlProps,
  FilterValue,
  PresetFilterDefinition,
} from "../../plp-types";

/**
 * Props for the multi-axis-range preset.
 */
export interface MultiAxisRangeFilterProps extends FilterControlProps {
  definition: PresetFilterDefinition;
}

type AxisValues = Record<string, { min: number; max: number }>;

function toAxisValues(value: FilterValue): AxisValues {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !("min" in value && typeof (value as { min: unknown }).min === "number")
  ) {
    return value as AxisValues;
  }
  return {};
}

/**
 * Multi-axis range filter preset.
 *
 * Renders one range control per axis, each with its own min/max slider
 * and numeric inputs. Value is a record keyed by axis id. Axes at their
 * full range are omitted from the value object; clearing all axes yields
 * `undefined`.
 */
export function MultiAxisRangeFilter({
  value,
  onChange,
  definition,
}: MultiAxisRangeFilterProps) {
  const axes = definition.axes ?? [];
  const axisValues = toAxisValues(value);

  function commitAxis(axisId: string, nextMin: number, nextMax: number) {
    const axis = axes.find((a) => a.id === axisId);
    if (!axis) return;

    const clampedMin = Math.max(axis.min, Math.min(nextMin, axis.max));
    const clampedMax = Math.max(axis.min, Math.min(nextMax, axis.max));
    const orderedMin = Math.min(clampedMin, clampedMax);
    const orderedMax = Math.max(clampedMin, clampedMax);

    const isFullRange = orderedMin === axis.min && orderedMax === axis.max;
    const next: AxisValues = { ...axisValues };

    if (isFullRange) {
      delete next[axisId];
    } else {
      next[axisId] = { min: orderedMin, max: orderedMax };
    }

    onChange(Object.keys(next).length > 0 ? next : undefined);
  }

  return (
    <div className="flex flex-col gap-6">
      {axes.map((axis) => (
        <AxisRow
          key={axis.id}
          axis={axis}
          currentMin={axisValues[axis.id]?.min ?? axis.min}
          currentMax={axisValues[axis.id]?.max ?? axis.max}
          onCommit={(nextMin, nextMax) => commitAxis(axis.id, nextMin, nextMax)}
        />
      ))}
    </div>
  );
}

/**
 * A single axis row: label heading, slider, and min/max numeric inputs.
 */
function AxisRow({
  axis,
  currentMin,
  currentMax,
  onCommit,
}: {
  axis: NonNullable<PresetFilterDefinition["axes"]>[number];
  currentMin: number;
  currentMax: number;
  onCommit: (min: number, max: number) => void;
}) {
  const step = axis.step ?? 1;
  const [minInput, setMinInput] = useState(String(currentMin));
  const [maxInput, setMaxInput] = useState(String(currentMax));

  useEffect(() => {
    setMinInput(String(currentMin));
    setMaxInput(String(currentMax));
  }, [currentMin, currentMax]);

  function commitInputs() {
    const nextMin = Number.parseFloat(minInput);
    const nextMax = Number.parseFloat(maxInput);
    if (Number.isFinite(nextMin) && Number.isFinite(nextMax)) {
      onCommit(nextMin, nextMax);
    } else {
      setMinInput(String(currentMin));
      setMaxInput(String(currentMax));
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitInputs();
      (e.target as HTMLInputElement).blur();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-medium text-foreground">{axis.label}</h4>
      <Slider
        value={[currentMin, currentMax]}
        min={axis.min}
        max={axis.max}
        step={step}
        onValueChange={(values) => onCommit(values[0], values[1])}
      />
      <div className="flex items-center gap-2">
        <div className="flex flex-1 items-center gap-1">
          <Input
            type="number"
            inputMode="decimal"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onBlur={commitInputs}
            onKeyDown={handleKeyDown}
            aria-label={`${axis.label} min`}
            className="flex-1"
          />
          {axis.unit && (
            <span className="text-sm text-muted-foreground">{axis.unit}</span>
          )}
        </div>
        <span className="text-muted-foreground">–</span>
        <div className="flex flex-1 items-center gap-1">
          <Input
            type="number"
            inputMode="decimal"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onBlur={commitInputs}
            onKeyDown={handleKeyDown}
            aria-label={`${axis.label} max`}
            className="flex-1"
          />
          {axis.unit && (
            <span className="text-sm text-muted-foreground">{axis.unit}</span>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/filters/presets/multi-axis-range.tsx
git commit -m "feat(plp): add multi-axis-range filter preset"
```

---

## Task 5: Async combobox preset

**Files:**
- Create: `packages/components/src/components/templates/plp/filters/presets/async-combobox.tsx`

Multi-select combobox with lazy initial load and debounced search. Built on the existing `Combobox` molecule (Base UI Combobox primitive). Caches selected `FilterOption` objects (value + label) so chips display correctly even after the query changes.

The preset writes selected options into `definition.options` as a side effect so the registry's `formatFilterChipValue` (which reads `preset.options` to resolve labels) works for async values. This is a pragmatic choice that keeps the chip formatting path consistent across presets — a cleaner alternative would require exposing a runtime label cache to the registry, which is out of scope for 3a.

- [ ] **Step 1: Create the preset**

```tsx
// plp/filters/presets/async-combobox.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "../../../molecules/combobox/combobox";
import type {
  FilterControlProps,
  FilterOption,
  PresetFilterDefinition,
} from "../../plp-types";

/**
 * Props for the async-combobox preset.
 */
export interface AsyncComboboxFilterProps extends FilterControlProps {
  definition: PresetFilterDefinition;
}

/**
 * Async multi-select combobox filter preset.
 *
 * Loads options lazily via `definition.searchFn`:
 * - Once with an empty query when the popover first opens.
 * - On each debounced keystroke in the combobox input.
 *
 * Caches selected `FilterOption` objects (value + label) so chips in the
 * combobox and in the active filters strip display correctly even after
 * the user types a new query and the server-side options list changes.
 *
 * The preset writes the cached selected options back into
 * `definition.options` so the registry's chip formatter can resolve
 * labels from value strings without a separate cache.
 */
export function AsyncComboboxFilter({
  value,
  onChange,
  definition,
}: AsyncComboboxFilterProps) {
  const selectedValues = Array.isArray(value) ? value : [];
  const debounceMs = definition.searchDebounceMs ?? 250;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<FilterOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false);

  const selectedCacheRef = useRef<Map<string, FilterOption>>(new Map());

  const runSearch = useCallback(
    async (q: string) => {
      if (!definition.searchFn) return;
      setLoading(true);
      try {
        const results = await definition.searchFn(q);
        setItems(results);
      } finally {
        setLoading(false);
      }
    },
    [definition]
  );

  // Lazy initial load on first open
  useEffect(() => {
    if (open && !hasOpenedOnce) {
      setHasOpenedOnce(true);
      void runSearch("");
    }
  }, [open, hasOpenedOnce, runSearch]);

  // Debounced search on query change
  useEffect(() => {
    if (!open) return;
    if (query === "" && !hasOpenedOnce) return;
    const handle = setTimeout(() => {
      void runSearch(query);
    }, debounceMs);
    return () => clearTimeout(handle);
  }, [query, open, debounceMs, runSearch, hasOpenedOnce]);

  function handleValueChange(next: unknown) {
    const nextArray = Array.isArray(next) ? (next as string[]) : [];

    // Cache any newly-selected options by looking them up in current items
    for (const v of nextArray) {
      if (!selectedCacheRef.current.has(v)) {
        const option = items.find((opt) => opt.value === v);
        if (option) {
          selectedCacheRef.current.set(v, option);
        }
      }
    }

    // Write cached selected options back into definition.options so the
    // registry's chip formatter can resolve labels.
    const cachedOptions = nextArray
      .map((v) => selectedCacheRef.current.get(v))
      .filter((o): o is FilterOption => !!o);
    definition.options = cachedOptions;

    onChange(nextArray.length > 0 ? nextArray : undefined);
  }

  // Merge cached selected options into items so chips render correctly
  // even when the current query doesn't include them.
  const itemsWithSelected = mergeWithSelected(items, selectedValues, selectedCacheRef.current);

  return (
    <Combobox
      multiple
      open={open}
      onOpenChange={setOpen}
      value={selectedValues}
      onValueChange={handleValueChange}
      items={itemsWithSelected}
      inputValue={query}
      onInputValueChange={(val: unknown) => setQuery(typeof val === "string" ? val : "")}
    >
      <ComboboxChips>
        {selectedValues.map((v) => {
          const option = selectedCacheRef.current.get(v);
          return (
            <ComboboxChip key={v}>
              {option?.label ?? v}
            </ComboboxChip>
          );
        })}
        <ComboboxChipsInput
          placeholder={
            selectedValues.length === 0
              ? (definition.searchPlaceholder ?? "Search...")
              : undefined
          }
        />
      </ComboboxChips>

      <ComboboxContent>
        <ComboboxList>
          {loading && (
            <div
              aria-live="polite"
              className="px-3 py-2 text-sm text-muted-foreground"
            >
              Loading...
            </div>
          )}
          {!loading &&
            itemsWithSelected.map((option) => (
              <ComboboxItem key={option.value} value={option.value}>
                <span className="flex items-center gap-2">
                  {option.adornment}
                  {option.label}
                </span>
              </ComboboxItem>
            ))}
          {!loading && itemsWithSelected.length === 0 && (
            <ComboboxEmpty className="px-3 py-2 text-sm text-muted-foreground">
              No results
            </ComboboxEmpty>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

/**
 * Merges currently-fetched items with any cached selected options that
 * aren't in the current result set. This ensures selected values always
 * render with a label, even after the user types a new query.
 */
function mergeWithSelected(
  items: FilterOption[],
  selectedValues: string[],
  cache: Map<string, FilterOption>
): FilterOption[] {
  const itemValues = new Set(items.map((i) => i.value));
  const missingSelected = selectedValues
    .filter((v) => !itemValues.has(v))
    .map((v) => cache.get(v))
    .filter((o): o is FilterOption => !!o);
  return [...missingSelected, ...items];
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```

Expected: zero errors. If the Base UI Combobox's `onValueChange` / `onInputValueChange` signatures require tighter typing and the compiler complains, inspect `packages/components/src/components/molecules/combobox/combobox.tsx` to see the prop types from `@base-ui/react` and adjust the callbacks accordingly. The `multiple` prop on the Combobox root tells Base UI to treat `value` as an array.

- [ ] **Step 3: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/filters/presets/async-combobox.tsx
git commit -m "feat(plp): add async-combobox filter preset with lazy loading and debounced search"
```

---

## Task 6: Register new presets in the filter registry

**Files:**
- Modify: `packages/components/src/components/templates/plp/filters/plp-filter-registry.ts`
- Modify: `packages/components/src/components/templates/plp/filters/plp-filter-registry.test.ts`

Wire the three new presets into `PRESET_MAP` so they resolve. Add chip formatting cases for `range-slider` and `multi-axis-range`. The `async-combobox` formatting was already added in Task 2 (it shares the multi-select-chips case).

The registry currently passes only `{ value, onChange, options }` to preset components. The three new presets also need access to the definition (for `min`, `max`, `axes`, `searchFn`, etc.). Two options considered:

- Pass the whole `definition` to all presets as a new prop.
- Keep `FilterControlProps` as-is; have the surfaces (drawer, popover, active filter chip popover) wrap the preset component and pass `definition` directly.

We choose the first: extend `FilterControlProps` with an optional `definition` field. Old presets (`boolean-chip`, `single-select-chips`, `multi-select-chips`, `single-select-dropdown`) already receive it but ignore it, so no change to their implementations. The three new presets require it.

- [ ] **Step 1: Extend `FilterControlProps` with an optional `definition`**

In `packages/components/src/components/templates/plp/plp-types.ts`, update the existing interface:

```ts
/** Props every filter control receives -- preset or custom. */
export interface FilterControlProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  options?: FilterOption[];
  /**
   * Full filter definition — optional for backward compatibility with
   * presets that don't need it. Presets that read config fields like
   * `min`, `max`, `axes`, or `searchFn` require this.
   */
  definition?: FilterDefinition;
}
```

- [ ] **Step 2: Update the three new preset components to not require `definition` via a separate prop**

The three preset components currently declare their own props interface with a mandatory `definition` field (e.g. `RangeSliderFilterProps`). Update each to make `definition` required via `FilterControlProps` — that is, rename uses of the standalone `definition` prop in `range-slider.tsx`, `multi-axis-range.tsx`, and `async-combobox.tsx` so they destructure from `FilterControlProps` and cast where necessary. Concrete change for each file:

Open `range-slider.tsx`, replace the props interface and the function signature with:

```tsx
/**
 * Range slider filter preset.
 *
 * Renders a two-thumb slider, an optional distribution histogram behind
 * the track, and commit-on-blur numeric inputs for precise min/max entry.
 * Reads `min`, `max`, `step`, `unit`, and `histogram` from the definition.
 */
export function RangeSliderFilter({
  value,
  onChange,
  definition,
}: FilterControlProps) {
  if (!definition || definition.preset !== "range-slider") {
    return null;
  }
  // ... keep the rest of the function body unchanged
```

Delete the `RangeSliderFilterProps` export. Do the same for `MultiAxisRangeFilter` and `AsyncComboboxFilter` in their respective files — function signature uses `FilterControlProps` directly, guard at the top of the function that `definition` is present and matches the expected preset name, and drop the exported `*Props` interfaces.

- [ ] **Step 3: Register the three presets in the registry**

Open `plp-filter-registry.ts`. Update the top imports to pull in the three new components:

```ts
import { RangeSliderFilter } from "./presets/range-slider";
import { MultiAxisRangeFilter } from "./presets/multi-axis-range";
import { AsyncComboboxFilter } from "./presets/async-combobox";
```

Extend `PRESET_MAP`:

```ts
const PRESET_MAP: Record<string, FilterRenderer> = {
  "boolean-chip": BooleanChipFilter,
  "single-select-chips": SingleSelectChipsFilter,
  "multi-select-chips": MultiSelectChipsFilter,
  "single-select-dropdown": SingleSelectDropdownFilter,
  "range-slider": RangeSliderFilter,
  "multi-axis-range": MultiAxisRangeFilter,
  "async-combobox": AsyncComboboxFilter,
};
```

- [ ] **Step 4: Thread `definition` through `resolveFilterControl` call sites**

The surfaces that render filter controls — drawer, quick filter popover, active chip edit popover — each call `resolveFilterControl(definition)` and pass props to the resulting component. They currently pass `{ value, onChange, options }`. Update each site to also pass `definition`:

Open `plp/filters/plp-filter-drawer.tsx`. Locate the place the resolved component is rendered (inside the filter section loop). Update the JSX so the component receives `definition` in addition to the existing props. Concretely change:

```tsx
<FilterControl
  value={filterState[definition.id]}
  onChange={(value) => onFilterChange(definition.id, value)}
  options={controlOptions}
/>
```

to:

```tsx
<FilterControl
  value={filterState[definition.id]}
  onChange={(value) => onFilterChange(definition.id, value)}
  options={controlOptions}
  definition={definition}
/>
```

Repeat the same addition in `plp/toolbar/plp-quick-filter.tsx` (the popover content) and in `plp/filters/plp-active-filters.tsx` (the chip edit popover content).

- [ ] **Step 5: Add `range-slider` and `multi-axis-range` chip formatting**

In `plp-filter-registry.ts`, inside `formatFilterChipValue`, add these cases in the `switch` on `preset.preset`:

```ts
    case "range-slider": {
      if (!value || typeof value !== "object" || !("min" in value)) {
        return "";
      }
      const { min, max } = value as { min: number; max: number };
      return formatRangeChip(min, max, preset.unit);
    }

    case "multi-axis-range": {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return "";
      }
      const axisValues = value as Record<string, { min: number; max: number }>;
      return formatMultiAxisChip(axisValues, preset.axes ?? []);
    }
```

Above the existing `formatMultiSelectChip` helper, add two more helpers:

```ts
/**
 * Formats a numeric unit either as a prefix (for currency) or suffix.
 */
function formatUnitValue(n: number, unit?: string): string {
  if (!unit) return String(n);
  const isCurrencyPrefix =
    ["$", "€", "£", "¥"].some((c) => unit.startsWith(c)) ||
    ["USD", "EUR", "GBP", "JPY"].includes(unit);
  return isCurrencyPrefix ? `${unit}${n}` : `${n}${unit}`;
}

/**
 * Formats a single range `{ min, max }` for display in an active filter chip.
 */
function formatRangeChip(min: number, max: number, unit?: string): string {
  return `${formatUnitValue(min, unit)}\u2013${formatUnitValue(max, unit)}`;
}

/**
 * Formats a multi-axis range value for display in an active filter chip.
 *
 * Uses the first character of each axis label as an abbreviation.
 * Truncates to first two axes + "+N more" if more than two axes are active.
 */
function formatMultiAxisChip(
  axisValues: Record<string, { min: number; max: number }>,
  axes: NonNullable<PresetFilterDefinition["axes"]>
): string {
  const activeSegments: string[] = [];
  for (const axis of axes) {
    const v = axisValues[axis.id];
    if (!v) continue;
    const abbrev = axis.label.charAt(0).toUpperCase();
    activeSegments.push(
      `${abbrev} ${formatUnitValue(v.min, axis.unit)}\u2013${formatUnitValue(v.max, axis.unit)}`
    );
  }
  if (activeSegments.length === 0) return "";
  if (activeSegments.length <= 2) return activeSegments.join(", ");
  const remaining = activeSegments.length - 2;
  return `${activeSegments[0]}, ${activeSegments[1]} +${remaining} more`;
}
```

- [ ] **Step 6: Add test coverage for range and multi-axis chip formatting**

Append to the existing `describe("formatFilterChipValue")` block in `plp-filter-registry.test.ts`:

```ts
  it("formats range-slider with currency unit as prefix", () => {
    const def: PresetFilterDefinition = {
      id: "price",
      label: "Price",
      preset: "range-slider",
      min: 0,
      max: 10000,
      unit: "$",
    };
    expect(formatFilterChipValue(def, { min: 100, max: 500 })).toBe("$100\u2013$500");
  });

  it("formats range-slider with non-currency unit as suffix", () => {
    const def: PresetFilterDefinition = {
      id: "carat",
      label: "Carat",
      preset: "range-slider",
      min: 0,
      max: 10,
      unit: "ct",
    };
    expect(formatFilterChipValue(def, { min: 1, max: 3.5 })).toBe("1ct\u20133.5ct");
  });

  it("formats multi-axis-range with single active axis", () => {
    const def: PresetFilterDefinition = {
      id: "size",
      label: "Size",
      preset: "multi-axis-range",
      axes: [
        { id: "length", label: "Length", min: 0, max: 20, unit: "mm" },
        { id: "width", label: "Width", min: 0, max: 20, unit: "mm" },
        { id: "depth", label: "Depth", min: 0, max: 10, unit: "mm" },
      ],
    };
    expect(formatFilterChipValue(def, { length: { min: 5, max: 10 } })).toBe(
      "L 5mm\u201310mm"
    );
  });

  it("formats multi-axis-range with three active axes (no truncation)", () => {
    const def: PresetFilterDefinition = {
      id: "size",
      label: "Size",
      preset: "multi-axis-range",
      axes: [
        { id: "length", label: "Length", min: 0, max: 20, unit: "mm" },
        { id: "width", label: "Width", min: 0, max: 20, unit: "mm" },
        { id: "depth", label: "Depth", min: 0, max: 10, unit: "mm" },
      ],
    };
    const value = {
      length: { min: 5, max: 10 },
      width: { min: 5, max: 10 },
      depth: { min: 2, max: 4 },
    };
    expect(formatFilterChipValue(def, value)).toBe(
      "L 5mm\u201310mm, W 5mm\u201310mm +1 more"
    );
  });
```

- [ ] **Step 7: Run the tests and confirm all pass**

```bash
cd packages/components
npx vitest run --project unit src/components/templates/plp/filters/plp-filter-registry.test.ts
```

Expected: all 14 tests PASS (original 8 + 2 from Task 2 + 4 new = 14).

- [ ] **Step 8: Verify TypeScript**

```bash
cd packages/components && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 9: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/plp-types.ts \
        packages/components/src/components/templates/plp/filters/plp-filter-registry.ts \
        packages/components/src/components/templates/plp/filters/plp-filter-registry.test.ts \
        packages/components/src/components/templates/plp/filters/presets/range-slider.tsx \
        packages/components/src/components/templates/plp/filters/presets/multi-axis-range.tsx \
        packages/components/src/components/templates/plp/filters/presets/async-combobox.tsx \
        packages/components/src/components/templates/plp/filters/plp-filter-drawer.tsx \
        packages/components/src/components/templates/plp/toolbar/plp-quick-filter.tsx \
        packages/components/src/components/templates/plp/filters/plp-active-filters.tsx
git commit -m "feat(plp): register range-slider, multi-axis-range, async-combobox in filter registry"
```

---

## Task 7: Update Storybook stories to exercise all presets

**Files:**
- Modify: `packages/components/src/components/templates/plp/plp-template.stories.tsx`

Extend the existing shared filter arrays (`GEMSTONE_FILTERS`, `DIAMOND_FILTERS`) to include every preset. Add shared helpers for mock histogram data and a mock `searchFn`.

- [ ] **Step 1: Add shared mock helpers**

Open `plp-template.stories.tsx`. Find the section where `GEMSTONE_FILTERS` and `SORT_OPTIONS` are defined. Above those arrays, add:

```tsx
// -- Shared mock helpers for advanced filter presets ----------------------

function buildMockHistogram(
  min: number,
  max: number,
  bucketCount: number,
  peakAt: number
): { buckets: number[]; min: number; max: number } {
  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const bucketCenter = min + ((i + 0.5) * (max - min)) / bucketCount;
    const distanceFromPeak = Math.abs(bucketCenter - peakAt);
    const peakWidth = (max - min) / 4;
    const normalized = Math.max(0, 1 - distanceFromPeak / peakWidth);
    return Math.round(normalized * 40 + Math.random() * 10);
  });
  return { buckets, min, max };
}

const MOCK_SUPPLIERS: { value: string; label: string }[] = [
  { value: "sup-acme", label: "Acme Gem Traders" },
  { value: "sup-globex", label: "Globex Mining Co." },
  { value: "sup-initech", label: "Initech Stones" },
  { value: "sup-umbrella", label: "Umbrella Gemstones Ltd." },
  { value: "sup-hooli", label: "Hooli Premium" },
  { value: "sup-pied", label: "Pied Piper Rough" },
  { value: "sup-stark", label: "Stark Industries Jewellery" },
  { value: "sup-wayne", label: "Wayne Enterprises Minerals" },
  { value: "sup-cyberdyne", label: "Cyberdyne Gems" },
  { value: "sup-tyrell", label: "Tyrell Heritage Stones" },
];

async function mockSupplierSearch(query: string) {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));
  const q = query.toLowerCase();
  return MOCK_SUPPLIERS.filter((s) => s.label.toLowerCase().includes(q));
}
```

- [ ] **Step 2: Extend `GEMSTONE_FILTERS` with the three new presets**

Locate the existing `GEMSTONE_FILTERS` array and append three new filter definitions inside the array (keeping the existing ones):

```tsx
  {
    id: "price",
    label: "Price",
    preset: "range-slider",
    isQuickFilter: true,
    min: 0,
    max: 10000,
    step: 10,
    unit: "$",
    histogram: buildMockHistogram(0, 10000, 40, 2500),
  },
  {
    id: "carat",
    label: "Carat",
    preset: "range-slider",
    min: 0,
    max: 10,
    step: 0.1,
    unit: "ct",
    histogram: buildMockHistogram(0, 10, 40, 2),
  },
  {
    id: "size",
    label: "Size (mm)",
    preset: "multi-axis-range",
    axes: [
      { id: "length", label: "Length", min: 0, max: 20, step: 0.1, unit: "mm" },
      { id: "width", label: "Width", min: 0, max: 20, step: 0.1, unit: "mm" },
      { id: "depth", label: "Depth", min: 0, max: 10, step: 0.1, unit: "mm" },
    ],
  },
  {
    id: "supplier",
    label: "Supplier",
    preset: "async-combobox",
    searchFn: mockSupplierSearch,
    searchPlaceholder: "Search suppliers...",
  },
```

- [ ] **Step 3: Extend `DIAMOND_FILTERS` with the three new presets**

Find the existing `DIAMOND_FILTERS` array and append the same four definitions (price, carat, size, supplier) — reuse the shared `mockSupplierSearch` and histogram helper. Omit the `isQuickFilter: true` from carat/size/supplier; keep price as a quick filter.

- [ ] **Step 4: Pre-populate advanced filter values in `WithActiveFilters`**

Find the `WithActiveFilters` story export. Update its `initialFilterState` prop so at least one range value and one async-combobox value are pre-populated alongside the existing chip values:

```tsx
initialFilterState={{
  color: ["blue", "green"],
  treatment: "heated",
  price: { min: 1000, max: 5000 },
  supplier: ["sup-acme", "sup-globex", "sup-initech"],
}}
```

Additionally, ensure the definition's `options` for the supplier filter contain the three pre-populated values before first render — the async preset relies on its own cache which is empty on first render. Inside the story's render function (or at the top of the file), after `GEMSTONE_FILTERS` is defined, run a small seeding step that sets `definition.options` for the supplier filter:

```tsx
// Pre-seed supplier options for stories that start with a value set
const supplierFilter = GEMSTONE_FILTERS.find((f) => f.id === "supplier");
if (supplierFilter && supplierFilter.preset === "async-combobox") {
  supplierFilter.options = MOCK_SUPPLIERS.filter((s) =>
    ["sup-acme", "sup-globex", "sup-initech"].includes(s.value)
  );
}
```

This ensures the active filter chip for "Supplier" shows the three labels correctly on initial render.

- [ ] **Step 5: Verify stories render**

```bash
cd packages/components && npx storybook dev -p 6006
```

Walk through each story at `Templates/PLP/*` and confirm:
- `GemstoneCategory` — toolbar shows price as a quick filter; drawer shows all presets including histogram behind price and carat sliders
- `JewelryCategory` — same coverage (stories inherit extended shared arrays)
- `WithActiveFilters` — active filters strip shows a range chip, a supplier chip with truncation, color chip with truncation
- `DiamondListView` and `GemstoneListView` — drawer contains all advanced presets
- Other stories (`Loading`, `Empty*`, `Error`, `WithCustomFilter`) — still render without error

- [ ] **Step 6: Verify TypeScript**

```bash
cd packages/components && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 7: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/plp-template.stories.tsx
git commit -m "feat(plp): exercise all filter presets in every Storybook story"
```

---

## Task 8: Update COMPONENT.md

**Files:**
- Modify: `packages/components/src/components/templates/plp/COMPONENT.md`

- [ ] **Step 1: Bump frontmatter version to 0.3.0**

Change `version: 0.2.0` to `version: 0.3.0`. Keep `lastUpdated: 2026-04-16`.

- [ ] **Step 2: Document the three new preset names**

Locate the props documentation or description of `FilterDefinition`. Where the preset names are enumerated, add the three new names (`range-slider`, `multi-axis-range`, `async-combobox`) with a short description of each and the relevant definition fields.

Add a small "Phase 3a presets" note to the usage guidelines section explaining:

- `range-slider` — numeric min/max with optional histogram; reads `min`, `max`, `step`, `unit`, `histogram`.
- `multi-axis-range` — multiple named ranges under one filter; reads `axes[]`. No histogram support.
- `async-combobox` — multi-select combobox with lazy-loaded options; reads `searchFn`, `searchDebounceMs`, `searchPlaceholder`.

- [ ] **Step 3: Commit**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git add packages/components/src/components/templates/plp/COMPONENT.md
git commit -m "docs(plp): document Phase 3a filter presets in COMPONENT.md"
```

---

## Task 9: Final verification + CHANGELOG + spec status

- [ ] **Step 1: TypeScript check**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template/packages/components
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 2: Unit tests**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template/packages/components
npx vitest run --project unit
```

Expected: 14 tests PASS.

- [ ] **Step 3: Storybook smoke check**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template/packages/components
npx storybook dev -p 6006
```

Walk through every PLP story and confirm:
- All Phase 1 presets still render as expected in both drawer and quick filter popovers
- Range slider shows histogram behind track when configured
- Multi-axis range shows three axes with labels, sliders, and input pairs
- Async combobox opens the popover, shows suppliers after a short delay, filters on type, keeps selected chips across query changes
- Active filter chips show truncated multi-select (`Value1, Value2 +N more`), range format (`$100–$500`), and multi-axis format (`L 5–10mm, W 5–10mm +1 more`)
- No regressions on Phase 1 / Phase 2 stories

- [ ] **Step 4: Gather commit SHAs**

```bash
cd /Users/jlfgms/Desktop/Code/clarity-v2/.claude/worktrees/feat-plp-template
git log --oneline feat/plp-template --not dev | head -15
```

Identify the Phase 3a commits (subjects prefixed `feat(plp)` or `docs(plp)` that were added after the Phase 2 spec-status commit).

- [ ] **Step 5: Prepend a Phase 3a entry to the package CHANGELOG**

Open `packages/components/CHANGELOG.md`. At the top, directly after the `# Changelog — @nivoda/components` header and before the existing Phase 2 entry, prepend:

```md
### PLP Template — Phase 3a (unstable 0.3.0)

Adds three advanced filter presets and chip truncation for multi-select values.

- `range-slider` preset: two-thumb Slider with commit-on-blur numeric inputs, optional distribution histogram that highlights the selected sub-range, unit shown as prefix for currencies and suffix otherwise (`<SHA-range-slider>`)
- `multi-axis-range` preset: one slider + numeric input pair per named axis, human-readable axis labels in UI and chip text (`<SHA-multi-axis>`)
- `async-combobox` preset: multi-select Combobox with lazy initial load on open, debounced search, selected-option label caching so chips survive query changes (`<SHA-async>`)
- `FilterPresetName`, `PresetFilterDefinition`, and `FilterValue` extended to cover the new presets and the multi-axis value shape (`<SHA-types>`)
- Chip truncation for multi-select (`multi-select-chips` and `async-combobox`): first two values shown, `+N more` for the rest (`<SHA-truncate>`)
- Registry thread `definition` through to all preset surfaces (drawer, quick filter popover, active chip edit popover); range and multi-axis chip formatters added (`<SHA-register>`)
- Storybook: every existing PLP story now exercises all filter presets (`<SHA-stories>`)
- `PlpTemplate` COMPONENT.md bumped to 0.3.0 with the new preset names documented (`<SHA-docs>`)

---
```

Replace each `<SHA-*>` placeholder with the actual short SHA from the `git log` output.

Commit:
```bash
git add packages/components/CHANGELOG.md
git commit -m "docs(plp): add Phase 3a entry to package CHANGELOG"
```

- [ ] **Step 6: Mark the Phase 3a design spec as Implemented**

Edit `docs/plans/specs/2026-04-16-plp-template-phase3a-design.md` frontmatter:

```yaml
status: Implemented
```

Commit:
```bash
git add docs/plans/specs/2026-04-16-plp-template-phase3a-design.md
git commit -m "docs(plp): mark Phase 3a spec as implemented"
```

- [ ] **Step 7: Final report**

Report back:
- TypeScript + test results
- Total commits on branch (`git log --oneline feat/plp-template --not dev | wc -l`)
- Phase 3a commit list with SHAs
- Any deviations from the plan and why
