# PLP Template Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 1 PLP template — a page-level component that renders a product listing grid with filtering, sorting, pagination, and responsive behaviour, inside the AppShell.

**Architecture:** Filter-registry approach where categories define filters as config objects (preset name or custom render prop), and the template resolves them identically across three surfaces (quick filter popover, drawer, active chip edit). Grid items receive structured data objects via a `renderGridItem` mapper; the template controls render order and variant logic. The template is stateless — consumer owns filter state, sort, pagination, and data fetching.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind v4, CVA, Radix UI (via existing Clarity V2 atoms/molecules), Storybook 8.6 (CSF3)

**Design spec:** `docs/plans/specs/2026-04-16-plp-template-phase1-design.md`
**Architectural spec:** `docs/plans/specs/2026-04-16-plp-template-component-spec.md`

---

## File map

All files live under `packages/components/src/components/templates/plp/`. The base path is abbreviated as `plp/` below.

| File | Responsibility |
|------|---------------|
| `plp/plp-types.ts` | All shared TypeScript types for the PLP template system |
| `plp/context/plp-user-context.tsx` | Storybook/test-only mock user context provider |
| `plp/filters/plp-filter-registry.ts` | Filter preset resolver — maps preset name to component |
| `plp/filters/presets/boolean-chip.tsx` | Boolean on/off filter control |
| `plp/filters/presets/single-select-chips.tsx` | Mutually exclusive chip selection |
| `plp/filters/presets/multi-select-chips.tsx` | Multi-select chip group with optional adornments |
| `plp/filters/presets/single-select-dropdown.tsx` | Dropdown filter using existing Select molecule |
| `plp/filters/plp-filter-drawer.tsx` | All Filters left-side Sheet |
| `plp/filters/plp-active-filters.tsx` | Active filter chips strip with sticky behaviour |
| `plp/grid/plp-grid-item.tsx` | Individual product card |
| `plp/grid/plp-grid.tsx` | Responsive grid layout container |
| `plp/grid/plp-grid-skeleton.tsx` | Skeleton loading grid |
| `plp/states/plp-empty.tsx` | Empty state (filtered + no items) |
| `plp/states/plp-error.tsx` | Error state with retry |
| `plp/heading/plp-heading.tsx` | Breadcrumbs + title + results count |
| `plp/toolbar/plp-quick-filter.tsx` | Quick filter button + popover |
| `plp/toolbar/plp-toolbar.tsx` | Full toolbar (search, filters button, quick filters, sort) |
| `plp/plp-template.tsx` | Top-level orchestrator |
| `plp/grid/plp-grid-item.stories.tsx` | Isolated grid item variant playground |
| `plp/plp-template.stories.tsx` | Full template stories inside AppShell |
| `plp/COMPONENT.md` | Component documentation |

**Barrel export modification:** `packages/components/src/index.ts`

---

## Conventions reference

Before writing any code, read `packages/components/CONTRIBUTING.md` for the full conventions. Key points:

- **Imports:** `cn()` from `@/lib/utils`. Existing components from their tier path (e.g., `../../atoms/button/button`).
- **Props:** Use `interface`, extend native HTML element, intersect with `VariantProps` when using CVA.
- **Exports:** Named only. Export component, variants (if CVA), and props type.
- **Comments:** JSDoc on every named export and every CVA definition. No other comments.
- **Tokens:** Only through Tailwind theme classes or `var(--token)` in arbitrary values. No raw literals.
- **Stories:** CSF3, `tags: ["autodocs"]`, `argTypes` with `control: "select"` for enums. Compose from system components only.

---

## Task 1: Types and filter registry

**Files:**
- Create: `plp/plp-types.ts`
- Create: `plp/filters/plp-filter-registry.ts`
- Test: `plp/filters/plp-filter-registry.test.ts`

This task defines every shared type for the PLP system and the filter preset resolver. All subsequent tasks import from here.

- [ ] **Step 1: Create `plp-types.ts` with all shared types**

```ts
// plp/plp-types.ts
import type { ReactNode } from "react";

// ── Filter system ──────────────────────────────────────────

/** A single option within a chip-based or dropdown filter. */
export interface FilterOption {
  value: string;
  label: string;
  /** Small visual before the label (color swatch, flag icon). */
  adornment?: ReactNode;
  /**
   * Overrides the default toggle button content entirely.
   * Receives selection state so the consumer can style accordingly.
   * The preset still owns the outer button shell (click, aria, selection border).
   * Use for rich option layouts (e.g., icon on top + label below, card-shaped).
   */
  renderOption?: (props: { selected: boolean }) => ReactNode;
}

/** Props every filter control receives — preset or custom. */
export interface FilterControlProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
  options?: FilterOption[];
}

/** Union of all possible filter value shapes. */
export type FilterValue =
  | string
  | string[]
  | { min: number; max: number }
  | boolean
  | undefined;

/** Map of filter ID to its current value. */
export type FilterState = Record<string, FilterValue>;

/** Names of built-in filter presets. */
export type FilterPresetName =
  | "boolean-chip"
  | "single-select-chips"
  | "multi-select-chips"
  | "single-select-dropdown";

/** A filter definition that references a built-in preset. */
export interface PresetFilterDefinition {
  id: string;
  label: string;
  preset: FilterPresetName;
  isQuickFilter?: boolean;
  popoverWidth?: number | string;
  options?: FilterOption[];
  /** Display label for boolean-chip preset (e.g. "Only Nivoda Curated items"). */
  chipLabel?: string;
}

/** A filter definition that supplies its own render function. */
export interface CustomFilterDefinition {
  id: string;
  label: string;
  preset: "custom";
  isQuickFilter?: boolean;
  popoverWidth?: number | string;
  /** Custom render function — receives value + onChange, returns the control UI. */
  renderControl: (props: FilterControlProps) => ReactNode;
  /** Formats the current value for display in active filter chips. */
  formatChipValue?: (value: FilterValue) => string;
}

/** A filter definition — either a preset reference or a custom render prop. */
export type FilterDefinition = PresetFilterDefinition | CustomFilterDefinition;

// ── Grid item model ────────────────────────────────────────

/** Pricing data for a grid item. Template handles all variant rendering. */
export interface PricingData {
  amount: number;
  currency: string;
  perCarat?: { amount: number; currency: string };
  discount?: { percentage: number; originalAmount: number };
  legacyDeliveredPrice?: { amount: number; currency: string };
  includeTariffs?: boolean;
}

/** A category-specific thumbnail action. */
export interface CategoryThumbnailAction {
  id: string;
  icon: ReactNode;
  /** Tooltip text and accessible name. */
  label: string;
  onAction: (itemId: string) => void;
}

/** The structured data object returned by the `renderGridItem` mapper. */
export interface GridItemData {
  id: string;
  name: string;
  thumbnailSrc: string;
  thumbnailAlt: string;
  /** Category-owned slot — can contain text, links, mixed content. */
  lead?: ReactNode;
  /** Category-supplied badge nodes. Template renders with consistent spacing. */
  badges?: ReactNode[];
  /** Optional category-owned slot between badges and delivery. */
  categorySlotTop?: ReactNode;
  /** Optional category-owned slot below pricing. */
  categorySlotBottom?: ReactNode;
  delivery: {
    estimatedDate: string;
    shipsFrom: string;
    isExpress?: boolean;
  };
  returns: {
    isReturnable: boolean;
  };
  pricing: PricingData;
  onAddToCart: () => void;
  /** When true, selection checkbox appears in the thumbnail toolbar. */
  enableSelection?: boolean;
  /** Category-specific actions appended after platform actions. */
  categoryActions?: CategoryThumbnailAction[];
  /** Platform action callbacks. */
  onFavorite?: (itemId: string) => void;
  onShare?: (itemId: string) => void;
  onViewMedia?: (itemId: string) => void;
}

// ── Sort ───────────────────────────────────────────────────

/** A single sort option for the sort dropdown. */
export interface SortOption {
  value: string;
  label: string;
}

// ── Breadcrumbs ────────────────────────────────────────────

/** A breadcrumb segment. */
export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

// ── User context (for Storybook/testing) ───────────────────

/** User context shape consumed by the template for variant rendering. */
export interface PlpUserContextValue {
  currency: string;
  location: string;
  pricingModel: "standard" | "legacy";
  featureFlags?: Record<string, boolean>;
}

// ── Template status ────────────────────────────────────────

/** The current state of the PLP content area. */
export type PlpStatus =
  | "loading"
  | "success"
  | "empty-filtered"
  | "empty-no-items"
  | "error";
```

- [ ] **Step 2: Write failing test for filter registry**

```ts
// plp/filters/plp-filter-registry.test.ts
import { describe, it, expect } from "vitest";
import {
  resolveFilterControl,
  formatFilterChipValue,
} from "./plp-filter-registry";
import type {
  PresetFilterDefinition,
  CustomFilterDefinition,
} from "../plp-types";

describe("resolveFilterControl", () => {
  it("returns the correct component for each preset name", () => {
    const presets = [
      "boolean-chip",
      "single-select-chips",
      "multi-select-chips",
      "single-select-dropdown",
    ] as const;

    for (const preset of presets) {
      const def: PresetFilterDefinition = {
        id: "test",
        label: "Test",
        preset,
      };
      const result = resolveFilterControl(def);
      expect(result).toBeDefined();
      expect(typeof result).toBe("function");
    }
  });

  it("returns the custom renderControl for custom filters", () => {
    const renderControl = () => null;
    const def: CustomFilterDefinition = {
      id: "test",
      label: "Test",
      preset: "custom",
      renderControl,
    };
    const result = resolveFilterControl(def);
    expect(result).toBe(renderControl);
  });
});

describe("formatFilterChipValue", () => {
  it("formats boolean filter as the filter label", () => {
    const def: PresetFilterDefinition = {
      id: "curated",
      label: "Nivoda Curated",
      preset: "boolean-chip",
      chipLabel: "Only Nivoda Curated items",
    };
    expect(formatFilterChipValue(def, true)).toBe("Only Nivoda Curated items");
  });

  it("formats single-select as the selected option label", () => {
    const def: PresetFilterDefinition = {
      id: "shipping",
      label: "Shipping",
      preset: "single-select-chips",
      options: [
        { value: "1-3", label: "1-3 days" },
        { value: "5", label: "5 days or less" },
      ],
    };
    expect(formatFilterChipValue(def, "1-3")).toBe("1-3 days");
  });

  it("formats multi-select as comma-joined labels", () => {
    const def: PresetFilterDefinition = {
      id: "color",
      label: "Color",
      preset: "multi-select-chips",
      options: [
        { value: "blue", label: "Blue" },
        { value: "green", label: "Green" },
        { value: "red", label: "Red" },
      ],
    };
    expect(formatFilterChipValue(def, ["blue", "red"])).toBe("Blue, Red");
  });

  it("formats single-select-dropdown as the selected option label", () => {
    const def: PresetFilterDefinition = {
      id: "location",
      label: "Location",
      preset: "single-select-dropdown",
      options: [
        { value: "us", label: "United States" },
        { value: "eu", label: "Europe" },
      ],
    };
    expect(formatFilterChipValue(def, "us")).toBe("United States");
  });

  it("uses custom formatChipValue for custom filters", () => {
    const def: CustomFilterDefinition = {
      id: "custom",
      label: "Custom",
      preset: "custom",
      renderControl: () => null,
      formatChipValue: (value) => `Custom: ${value}`,
    };
    expect(formatFilterChipValue(def, "hello")).toBe("Custom: hello");
  });

  it("returns empty string for undefined value", () => {
    const def: PresetFilterDefinition = {
      id: "color",
      label: "Color",
      preset: "multi-select-chips",
      options: [],
    };
    expect(formatFilterChipValue(def, undefined)).toBe("");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run from `packages/components/`:
```bash
npx vitest run src/components/templates/plp/filters/plp-filter-registry.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 4: Implement filter registry**

```ts
// plp/filters/plp-filter-registry.ts
import type { ComponentType } from "react";
import type {
  FilterDefinition,
  FilterControlProps,
  FilterValue,
  PresetFilterDefinition,
  CustomFilterDefinition,
} from "../plp-types";
import { BooleanChipFilter } from "./presets/boolean-chip";
import { SingleSelectChipsFilter } from "./presets/single-select-chips";
import { MultiSelectChipsFilter } from "./presets/multi-select-chips";
import { SingleSelectDropdownFilter } from "./presets/single-select-dropdown";

type FilterRenderer = ComponentType<FilterControlProps> | ((props: FilterControlProps) => React.ReactNode);

const PRESET_MAP: Record<string, FilterRenderer> = {
  "boolean-chip": BooleanChipFilter,
  "single-select-chips": SingleSelectChipsFilter,
  "multi-select-chips": MultiSelectChipsFilter,
  "single-select-dropdown": SingleSelectDropdownFilter,
};

/**
 * Resolves a filter definition to the component that renders its control.
 *
 * For preset filters, looks up the preset name in the built-in registry.
 * For custom filters, returns the consumer-supplied `renderControl` function.
 */
export function resolveFilterControl(
  definition: FilterDefinition
): FilterRenderer {
  if (definition.preset === "custom") {
    return (definition as CustomFilterDefinition).renderControl;
  }
  const component = PRESET_MAP[definition.preset];
  if (!component) {
    throw new Error(`Unknown filter preset: ${definition.preset}`);
  }
  return component;
}

/**
 * Formats a filter's current value into a human-readable string for display
 * in active filter chips.
 *
 * Preset filters have built-in formatters. Custom filters use the
 * consumer-supplied `formatChipValue` function.
 */
export function formatFilterChipValue(
  definition: FilterDefinition,
  value: FilterValue
): string {
  if (value === undefined || value === null) return "";

  if (definition.preset === "custom") {
    const custom = definition as CustomFilterDefinition;
    return custom.formatChipValue ? custom.formatChipValue(value) : String(value);
  }

  const preset = definition as PresetFilterDefinition;

  switch (preset.preset) {
    case "boolean-chip":
      return preset.chipLabel || preset.label;

    case "single-select-chips":
    case "single-select-dropdown": {
      const option = preset.options?.find((o) => o.value === value);
      return option?.label ?? String(value);
    }

    case "multi-select-chips": {
      if (!Array.isArray(value)) return String(value);
      return value
        .map((v) => {
          const option = preset.options?.find((o) => o.value === v);
          return option?.label ?? v;
        })
        .join(", ");
    }

    default:
      return String(value);
  }
}
```

Note: This file imports the four preset components which don't exist yet. The test will still fail until we create stub preset files. Create minimal stubs so the registry test passes — the presets are fully implemented in Task 2.

Create four stub files:

```tsx
// plp/filters/presets/boolean-chip.tsx
import type { FilterControlProps } from "../../plp-types";

/** Boolean on/off filter — renders as a single toggleable chip. */
export function BooleanChipFilter({ value, onChange }: FilterControlProps) {
  return <div>BooleanChipFilter stub</div>;
}
```

```tsx
// plp/filters/presets/single-select-chips.tsx
import type { FilterControlProps } from "../../plp-types";

/** Single-select chip group — mutually exclusive options. */
export function SingleSelectChipsFilter({ value, onChange, options }: FilterControlProps) {
  return <div>SingleSelectChipsFilter stub</div>;
}
```

```tsx
// plp/filters/presets/multi-select-chips.tsx
import type { FilterControlProps } from "../../plp-types";

/** Multi-select chip group with optional adornments. */
export function MultiSelectChipsFilter({ value, onChange, options }: FilterControlProps) {
  return <div>MultiSelectChipsFilter stub</div>;
}
```

```tsx
// plp/filters/presets/single-select-dropdown.tsx
import type { FilterControlProps } from "../../plp-types";

/** Dropdown filter using the design system Select molecule. */
export function SingleSelectDropdownFilter({ value, onChange, options }: FilterControlProps) {
  return <div>SingleSelectDropdownFilter stub</div>;
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npx vitest run src/components/templates/plp/filters/plp-filter-registry.test.ts
```
Expected: all 6 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/components/src/components/templates/plp/plp-types.ts \
       packages/components/src/components/templates/plp/filters/plp-filter-registry.ts \
       packages/components/src/components/templates/plp/filters/plp-filter-registry.test.ts \
       packages/components/src/components/templates/plp/filters/presets/
git commit -m "feat(plp): add PLP type definitions and filter registry with tests"
```

---

## Task 2: User context provider

**Files:**
- Create: `plp/context/plp-user-context.tsx`

Storybook/testing-only mock provider for user configuration (currency, location, pricing model, feature flags).

- [ ] **Step 1: Create user context provider**

```tsx
// plp/context/plp-user-context.tsx
"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { PlpUserContextValue } from "../plp-types";

const DEFAULT_CONTEXT: PlpUserContextValue = {
  currency: "USD",
  location: "US",
  pricingModel: "standard",
  featureFlags: {},
};

const PlpUserContext = createContext<PlpUserContextValue>(DEFAULT_CONTEXT);

/**
 * Provides user context (currency, location, pricing model, feature flags)
 * for PLP template variant rendering.
 *
 * **Storybook/testing only.** In production, the consuming app supplies
 * user context through its own provider at the app root.
 */
export function PlpUserProvider({
  children,
  value,
}: {
  children: ReactNode;
  value?: Partial<PlpUserContextValue>;
}) {
  const merged = { ...DEFAULT_CONTEXT, ...value };
  return (
    <PlpUserContext.Provider value={merged}>{children}</PlpUserContext.Provider>
  );
}

/**
 * Reads the current PLP user context.
 *
 * Returns default values (USD, US, standard pricing) when no provider
 * is present — this is intentional so components render sensibly in
 * isolation during development.
 */
export function usePlpUserContext(): PlpUserContextValue {
  return useContext(PlpUserContext);
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/components/src/components/templates/plp/context/
git commit -m "feat(plp): add Storybook-only user context provider"
```

---

## Task 3: Filter presets

**Files:**
- Modify: `plp/filters/presets/boolean-chip.tsx`
- Modify: `plp/filters/presets/single-select-chips.tsx`
- Modify: `plp/filters/presets/multi-select-chips.tsx`
- Modify: `plp/filters/presets/single-select-dropdown.tsx`

Replace the stubs from Task 1 with real implementations. Each preset uses existing design system primitives.

- [ ] **Step 1: Implement boolean-chip preset**

```tsx
// plp/filters/presets/boolean-chip.tsx
"use client";

import { cn } from "@/lib/utils";
import type { FilterControlProps } from "../../plp-types";

/**
 * Boolean on/off filter control.
 *
 * Renders as a single toggleable chip. When active, the chip shows a
 * filled visual state. The `options` prop is ignored — this preset
 * operates on a boolean value only.
 */
export function BooleanChipFilter({ value, onChange }: FilterControlProps) {
  const isActive = value === true;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-muted"
      )}
      onClick={() => onChange(isActive ? undefined : true)}
    >
      {isActive && (
        <svg
          className="mr-1.5 h-3.5 w-3.5"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {value === true ? "Active" : "Inactive"}
    </button>
  );
}
```

Wait — the boolean chip's visible label comes from the filter definition's `chipLabel`, not from the preset itself. The preset only knows about value + onChange. The label is rendered by the container (drawer section heading, quick filter button). The chip itself just shows an on/off toggle. Let me revise:

```tsx
// plp/filters/presets/boolean-chip.tsx
"use client";

import { cn } from "@/lib/utils";
import type { FilterControlProps } from "../../plp-types";

/**
 * Boolean on/off filter control.
 *
 * Renders as a single toggleable chip. When active, shows a filled visual
 * state with a checkmark. The label text is supplied via the `chipLabel`
 * field on the filter definition — it reaches this component through the
 * `options` prop as a single-element array with the label as its `label`.
 *
 * If no options are provided, renders a generic "Enabled" / disabled state.
 */
export function BooleanChipFilter({ value, onChange, options }: FilterControlProps) {
  const isActive = value === true;
  const label = options?.[0]?.label ?? "Enabled";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-muted"
      )}
      onClick={() => onChange(isActive ? undefined : true)}
    >
      {isActive && (
        <svg
          className="mr-1.5 h-3.5 w-3.5"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {label}
    </button>
  );
}
```

- [ ] **Step 2: Implement single-select-chips preset**

```tsx
// plp/filters/presets/single-select-chips.tsx
"use client";

import { cn } from "@/lib/utils";
import type { FilterControlProps } from "../../plp-types";

/**
 * Single-select chip group — mutually exclusive options.
 *
 * Renders each option as an outline toggle button. Only one can be active
 * at a time. Clicking an active option deselects it (clears the filter).
 *
 * Options can customize their content via `renderOption` (e.g., icon on top
 * + label below for card-shaped toggles) or use the default layout
 * (optional adornment + label in a horizontal row).
 */
export function SingleSelectChipsFilter({
  value,
  onChange,
  options,
}: FilterControlProps) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup">
      {options?.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.label}
            className={cn(
              "inline-flex items-center justify-center border text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              option.renderOption
                ? "rounded-lg p-2"
                : "rounded-full px-3 py-1.5 gap-1.5",
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:bg-muted"
            )}
            onClick={() => onChange(isSelected ? undefined : option.value)}
          >
            {option.renderOption
              ? option.renderOption({ selected: isSelected })
              : (
                <>
                  {option.adornment}
                  {option.label}
                </>
              )}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Implement multi-select-chips preset**

```tsx
// plp/filters/presets/multi-select-chips.tsx
"use client";

import { cn } from "@/lib/utils";
import type { FilterControlProps } from "../../plp-types";

/**
 * Multi-select chip group with optional adornments.
 *
 * Any number of options can be active simultaneously. Renders as outline
 * toggle buttons by default.
 *
 * Options can customize their content via `renderOption` (e.g., icon on top
 * + label below for card-shaped toggles like cut shape selectors) or use
 * the default layout (optional adornment + label in a horizontal row).
 */
export function MultiSelectChipsFilter({
  value,
  onChange,
  options,
}: FilterControlProps) {
  const selected = Array.isArray(value) ? value : [];

  function toggle(optionValue: string) {
    const next = selected.includes(optionValue)
      ? selected.filter((v) => v !== optionValue)
      : [...selected, optionValue];
    onChange(next.length > 0 ? next : undefined);
  }

  return (
    <div className="flex flex-wrap gap-2" role="group">
      {options?.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            aria-label={option.label}
            className={cn(
              "inline-flex items-center justify-center border text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              option.renderOption
                ? "rounded-lg p-2"
                : "rounded-full px-3 py-1.5 gap-1.5",
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-foreground hover:bg-muted"
            )}
            onClick={() => toggle(option.value)}
          >
            {option.renderOption
              ? option.renderOption({ selected: isSelected })
              : (
                <>
                  {option.adornment}
                  {option.label}
                </>
              )}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Implement single-select-dropdown preset**

```tsx
// plp/filters/presets/single-select-dropdown.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../molecules/select/select";
import type { FilterControlProps } from "../../plp-types";

/**
 * Dropdown filter using the design system Select molecule.
 *
 * Used when the option list is too long for chips or when free-text
 * search within the dropdown helps discovery.
 */
export function SingleSelectDropdownFilter({
  value,
  onChange,
  options,
}: FilterControlProps) {
  const stringValue = typeof value === "string" ? value : "";

  return (
    <Select
      value={stringValue}
      onValueChange={(v) => onChange(v || undefined)}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>
      <SelectContent>
        {options?.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <span className="flex items-center gap-2">
              {option.adornment}
              {option.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

- [ ] **Step 5: Run the filter registry tests again to verify presets still pass**

```bash
npx vitest run src/components/templates/plp/filters/plp-filter-registry.test.ts
```
Expected: all 6 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/components/src/components/templates/plp/filters/presets/
git commit -m "feat(plp): implement four filter preset controls"
```

---

## Task 4: Grid item component

**Files:**
- Create: `plp/grid/plp-grid-item.tsx`

The heart of the PLP — the individual product card. Renders all 10 fixed sections in order, handles hover behaviour (action toolbar + add-to-cart reveal), and reads user context for pricing variants.

- [ ] **Step 1: Implement grid item**

```tsx
// plp/grid/plp-grid-item.tsx
"use client";

import { cn } from "@/lib/utils";
import { Badge } from "../../../atoms/badge/badge";
import { Button } from "../../../atoms/button/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../atoms/tooltip/tooltip";
import { usePlpUserContext } from "../context/plp-user-context";
import type { GridItemData } from "../plp-types";

/**
 * Platform thumbnail actions — always present, template-owned.
 * Renders favorite, share, and viewMedia buttons.
 */
function PlatformActions({
  itemId,
  onFavorite,
  onShare,
  onViewMedia,
}: {
  itemId: string;
  onFavorite?: (id: string) => void;
  onShare?: (id: string) => void;
  onViewMedia?: (id: string) => void;
}) {
  const actions = [
    { id: "favorite", label: "Add to shortlist", icon: HeartIcon, handler: onFavorite },
    { id: "share", label: "Share", icon: ShareIcon, handler: onShare },
    { id: "viewMedia", label: "View media", icon: MediaIcon, handler: onViewMedia },
  ];

  return (
    <>
      {actions.map((action) => (
        <TooltipProvider key={action.id} delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="rounded-md p-1 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                aria-label={action.label}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  action.handler?.(itemId);
                }}
              >
                <action.icon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{action.label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </>
  );
}

/** Placeholder icon components — replace with Tabler icons during implementation. */
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
}

function MediaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  );
}

function CheckboxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </svg>
  );
}

/**
 * Formats a number as a currency string.
 * Uses the user's locale for formatting conventions.
 */
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Individual PLP grid item card.
 *
 * Renders all 10 fixed sections in spec order. Handles hover behaviour
 * (thumbnail action toolbar + add-to-cart reveal) and pricing variant
 * rendering based on item data and user context.
 *
 * This component is internal to the PLP template — not exported from
 * the package barrel.
 */
export function PlpGridItem({ data }: { data: GridItemData }) {
  const userContext = usePlpUserContext();

  return (
    <article
      className="group relative flex flex-col"
      data-slot="plp-grid-item"
    >
      {/* 1. Thumbnail */}
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
        <img
          src={data.thumbnailSrc}
          alt={data.thumbnailAlt}
          className="h-full w-full object-contain"
          loading="lazy"
        />

        {/* Hover action toolbar — visible on hover/focus-within */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 flex items-center justify-between p-2",
            "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
            // Always visible on touch devices
            "touch-action-none [@media(hover:none)]:opacity-100"
          )}
        >
          {/* Left: selection checkbox */}
          <div>
            {data.enableSelection && (
              <button
                type="button"
                className="rounded-md p-1 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Select item"
              >
                <CheckboxIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right: platform actions + category actions */}
          <div className="flex items-center gap-0.5">
            <PlatformActions
              itemId={data.id}
              onFavorite={data.onFavorite}
              onShare={data.onShare}
              onViewMedia={data.onViewMedia}
            />
            {data.categoryActions?.map((action) => (
              <TooltipProvider key={action.id} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="rounded-md p-1 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                      aria-label={action.label}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        action.onAction(data.id);
                      }}
                    >
                      {action.icon}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{action.label}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Name */}
      <h3 className="mt-2 text-sm font-semibold text-foreground line-clamp-2">
        {data.name}
      </h3>

      {/* 3. Lead (optional slot) */}
      {data.lead && (
        <div className="mt-0.5 text-xs text-muted-foreground">{data.lead}</div>
      )}

      {/* 4. Badges (optional) */}
      {data.badges && data.badges.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">{data.badges}</div>
      )}

      {/* 5. Category slot top (optional) */}
      {data.categorySlotTop && <div className="mt-1.5">{data.categorySlotTop}</div>}

      {/* 6. Delivery */}
      <div className="mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          {data.delivery.isExpress && (
            <Badge variant="success" size="sm">
              Express
            </Badge>
          )}
          <span>
            Get it <span className="font-medium text-foreground">{data.delivery.estimatedDate}</span>
          </span>
        </div>
        <div>
          Ships from{" "}
          <span className="font-medium text-foreground">{data.delivery.shipsFrom}</span>
        </div>
      </div>

      {/* 7. Returns */}
      <div className="mt-1 text-xs text-muted-foreground">
        {data.returns.isReturnable ? (
          <span className="text-success">
            Returnable — Fair use policy applies
          </span>
        ) : (
          <span className="text-destructive">Non-returnable</span>
        )}
      </div>

      {/* 8. Pricing */}
      <PlpGridItemPricing pricing={data.pricing} userContext={userContext} />

      {/* 9. Category slot bottom (optional) */}
      {data.categorySlotBottom && (
        <div className="mt-1.5">{data.categorySlotBottom}</div>
      )}

      {/* 10. Primary action — hover-revealed on desktop, always visible on touch */}
      <div
        className={cn(
          "mt-3 invisible opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100",
          "[@media(hover:none)]:visible [@media(hover:none)]:opacity-100"
        )}
      >
        <Button
          className="w-full"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            data.onAddToCart();
          }}
        >
          Add to cart
        </Button>
      </div>
    </article>
  );
}

/**
 * Renders pricing variants based on item data and user context.
 *
 * Handles: tariff labels, discount (struck-through + percentage),
 * legacy two-line pricing, per-carat secondary line, multi-currency display.
 */
function PlpGridItemPricing({
  pricing,
  userContext,
}: {
  pricing: GridItemData["pricing"];
  userContext: { currency: string; location: string; pricingModel: string };
}) {
  const showTariffs = pricing.includeTariffs && userContext.location === "US";
  const showLegacy =
    pricing.legacyDeliveredPrice && userContext.pricingModel === "legacy";
  const showMultiCurrency = userContext.currency !== pricing.currency;

  return (
    <div className="mt-2 space-y-0.5">
      {/* Tariff label */}
      {showTariffs && (
        <div className="text-xs text-muted-foreground">
          Stone price{" "}
          <span className="underline decoration-dotted">including US tariffs</span>
        </div>
      )}

      {/* Discount line */}
      {pricing.discount && (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-success">
            {pricing.discount.percentage}% below
          </span>
          <span className="text-muted-foreground line-through">
            {formatCurrency(pricing.discount.originalAmount, pricing.currency)}
          </span>
        </div>
      )}

      {/* Main price */}
      <div className="text-base font-bold text-foreground">
        {formatCurrency(pricing.amount, pricing.currency)}
      </div>

      {/* Per-carat secondary line */}
      {pricing.perCarat && (
        <div className="text-xs text-muted-foreground">
          {formatCurrency(pricing.perCarat.amount, pricing.perCarat.currency)}/ct
        </div>
      )}

      {/* Legacy delivered price */}
      {showLegacy && pricing.legacyDeliveredPrice && (
        <div className="text-xs text-muted-foreground">
          Delivered:{" "}
          {formatCurrency(
            pricing.legacyDeliveredPrice.amount,
            pricing.legacyDeliveredPrice.currency
          )}
        </div>
      )}

      {/* Multi-currency display */}
      {showMultiCurrency && (
        <div className="text-xs text-muted-foreground">
          ~{formatCurrency(pricing.amount, userContext.currency)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/components/src/components/templates/plp/grid/plp-grid-item.tsx
git commit -m "feat(plp): implement grid item card with pricing variants and hover actions"
```

---

## Task 5: Grid container and skeleton

**Files:**
- Create: `plp/grid/plp-grid.tsx`
- Create: `plp/grid/plp-grid-skeleton.tsx`

- [ ] **Step 1: Implement responsive grid container**

```tsx
// plp/grid/plp-grid.tsx
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * Responsive grid layout for PLP items.
 *
 * Renders 2 columns on mobile, 3 on tablet, 4 on desktop.
 * Column counts are system-controlled — not category-configurable.
 */
export function PlpGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6",
        className
      )}
      role="list"
      data-slot="plp-grid"
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Implement skeleton loading grid**

```tsx
// plp/grid/plp-grid-skeleton.tsx
import { Skeleton } from "../../../atoms/skeleton/skeleton";
import { PlpGrid } from "./plp-grid";

/**
 * Skeleton loading state for the PLP grid.
 *
 * Renders a page-sized set of skeleton cards mirroring the grid item
 * structure: thumbnail placeholder, name lines, badge placeholders,
 * delivery line, price line.
 *
 * @param count Number of skeleton items to render. Defaults to 20.
 */
export function PlpGridSkeleton({ count = 20 }: { count?: number }) {
  return (
    <PlpGrid>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col" role="listitem">
          {/* Thumbnail */}
          <Skeleton className="aspect-square w-full rounded-lg" />
          {/* Name */}
          <Skeleton className="mt-2 h-4 w-3/4" />
          {/* Lead */}
          <Skeleton className="mt-1 h-3 w-1/2" />
          {/* Badges */}
          <div className="mt-1.5 flex gap-1">
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          {/* Delivery */}
          <Skeleton className="mt-2 h-3 w-2/3" />
          <Skeleton className="mt-1 h-3 w-1/2" />
          {/* Returns */}
          <Skeleton className="mt-1 h-3 w-1/3" />
          {/* Price */}
          <Skeleton className="mt-2 h-5 w-1/3" />
          <Skeleton className="mt-1 h-3 w-1/4" />
        </div>
      ))}
    </PlpGrid>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/components/src/components/templates/plp/grid/plp-grid.tsx \
       packages/components/src/components/templates/plp/grid/plp-grid-skeleton.tsx
git commit -m "feat(plp): add responsive grid layout and skeleton loading state"
```

---

## Task 6: Empty and error states

**Files:**
- Create: `plp/states/plp-empty.tsx`
- Create: `plp/states/plp-error.tsx`

- [ ] **Step 1: Implement empty state**

```tsx
// plp/states/plp-empty.tsx
import { Button } from "../../../atoms/button/button";

/**
 * Empty state for the PLP content area.
 *
 * Two variants:
 * - `"empty-filtered"` — no items match current filters. Shows "Clear all
 *   filters" action and optional "Try removing" hint.
 * - `"empty-no-items"` — category has no items at all. Shows category-specific
 *   message, no clear-filters action.
 */
export function PlpEmpty({
  variant,
  onClearFilters,
  filterSuggestions,
  message,
}: {
  variant: "empty-filtered" | "empty-no-items";
  onClearFilters?: () => void;
  filterSuggestions?: string[];
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" data-slot="plp-empty">
      <div className="text-4xl" aria-hidden="true">
        {variant === "empty-filtered" ? "🔍" : "📦"}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        {variant === "empty-filtered"
          ? "No items match your filters"
          : "No items available"}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {variant === "empty-filtered"
          ? "Try adjusting your filters to find what you're looking for."
          : message || "There are no items in this category yet."}
      </p>

      {variant === "empty-filtered" && filterSuggestions && filterSuggestions.length > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          Try removing:{" "}
          <span className="font-medium text-foreground">
            {filterSuggestions.join(", ")}
          </span>
        </p>
      )}

      {variant === "empty-filtered" && onClearFilters && (
        <Button variant="outline" className="mt-4" onClick={onClearFilters}>
          Clear all filters
        </Button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Implement error state**

```tsx
// plp/states/plp-error.tsx
import { Button } from "../../../atoms/button/button";

/**
 * Error state for the PLP content area.
 *
 * Renders friendly copy with a retry action and a support link.
 */
export function PlpError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" data-slot="plp-error">
      <div className="text-4xl" aria-hidden="true">
        ⚠️
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">
        Something went wrong
      </h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        We couldn't load the products. Please try again or contact support if
        the problem persists.
      </p>
      <div className="mt-4 flex items-center gap-3">
        {onRetry && (
          <Button onClick={onRetry}>Try again</Button>
        )}
        <Button variant="outline" asChild>
          <a href="/support">Contact support</a>
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/components/src/components/templates/plp/states/
git commit -m "feat(plp): add empty and error state components"
```

---

## Task 7: Heading component

**Files:**
- Create: `plp/heading/plp-heading.tsx`

- [ ] **Step 1: Implement heading**

```tsx
// plp/heading/plp-heading.tsx
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../molecules/breadcrumb/breadcrumb";
import type { BreadcrumbSegment } from "../plp-types";
import { Fragment } from "react";

/**
 * PLP heading area — breadcrumbs, category title, and results count.
 *
 * Breadcrumbs support arbitrary nesting. The last segment is rendered
 * as the current page (not a link). Results count announces via
 * `aria-live="polite"` when it changes.
 */
export function PlpHeading({
  breadcrumbs,
  title,
  resultsCount,
}: {
  breadcrumbs: BreadcrumbSegment[];
  title: string;
  resultsCount: number;
}) {
  const formattedCount = new Intl.NumberFormat("en-US").format(resultsCount);

  return (
    <div data-slot="plp-heading">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((segment, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <Fragment key={segment.label}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={segment.href || "#"}>
                        {segment.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Title */}
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
        {title}
      </h1>

      {/* Results count */}
      <p
        className="mt-1 text-sm text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        {formattedCount} results
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/components/src/components/templates/plp/heading/
git commit -m "feat(plp): add heading with breadcrumbs, title, and results count"
```

---

## Task 8: Quick filter and toolbar

**Files:**
- Create: `plp/toolbar/plp-quick-filter.tsx`
- Create: `plp/toolbar/plp-toolbar.tsx`

- [ ] **Step 1: Implement quick filter button + popover**

```tsx
// plp/toolbar/plp-quick-filter.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../../../atoms/button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../atoms/popover/popover";
import { resolveFilterControl } from "../filters/plp-filter-registry";
import type { FilterDefinition, FilterState, FilterValue } from "../plp-types";

/**
 * Quick filter — a toolbar button that opens a popover containing
 * the registry-resolved filter control.
 *
 * The popover includes Apply and Clear buttons. The button shows an
 * active visual state when the filter has a value.
 */
export function PlpQuickFilter({
  definition,
  filterState,
  onFilterChange,
}: {
  definition: FilterDefinition;
  filterState: FilterState;
  onFilterChange: (filterId: string, value: FilterValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState<FilterValue>(
    filterState[definition.id]
  );

  const isActive = filterState[definition.id] !== undefined;
  const FilterControl = resolveFilterControl(definition);

  function handleOpen(nextOpen: boolean) {
    if (nextOpen) {
      setLocalValue(filterState[definition.id]);
    }
    setOpen(nextOpen);
  }

  function handleApply() {
    onFilterChange(definition.id, localValue);
    setOpen(false);
  }

  function handleClear() {
    onFilterChange(definition.id, undefined);
    setLocalValue(undefined);
    setOpen(false);
  }

  // Build options for the control — boolean-chip gets chipLabel as a single option
  const controlOptions =
    definition.preset === "boolean-chip" && definition.preset !== "custom"
      ? [{ value: "true", label: (definition as any).chipLabel || definition.label }]
      : "options" in definition
        ? definition.options
        : undefined;

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={isActive ? "default" : "outline"}
          size="sm"
          className={cn("shrink-0", isActive && "bg-primary text-primary-foreground")}
        >
          {definition.label}
          {isActive && (
            <span className="ml-1 text-xs opacity-70">
              &#x2022;
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-4"
        style={
          definition.popoverWidth
            ? { width: typeof definition.popoverWidth === "number"
                ? `${definition.popoverWidth}px`
                : definition.popoverWidth }
            : undefined
        }
        aria-label={`Filter: ${definition.label}`}
      >
        <div className="space-y-4">
          <FilterControl
            value={localValue}
            onChange={setLocalValue}
            options={controlOptions}
          />
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear
            </Button>
            <Button size="sm" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 2: Implement toolbar**

```tsx
// plp/toolbar/plp-toolbar.tsx
"use client";

import { cn } from "@/lib/utils";
import { Badge } from "../../../atoms/badge/badge";
import { Button } from "../../../atoms/button/button";
import { Input } from "../../../atoms/input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../molecules/select/select";
import { PlpQuickFilter } from "./plp-quick-filter";
import type {
  FilterDefinition,
  FilterState,
  FilterValue,
  SortOption,
} from "../plp-types";
import { useState } from "react";

/**
 * PLP toolbar — search, All Filters button, quick filters, and sort.
 *
 * On mobile (< 640px): shows only All Filters + Sort.
 * On desktop: full toolbar with search, quick filters, and sort.
 */
export function PlpToolbar({
  filters,
  filterState,
  onFilterChange,
  onOpenDrawer,
  sortOptions,
  sortValue,
  onSortChange,
  searchPlaceholder,
  onSearchSubmit,
}: {
  filters: FilterDefinition[];
  filterState: FilterState;
  onFilterChange: (filterId: string, value: FilterValue) => void;
  onOpenDrawer: () => void;
  sortOptions: SortOption[];
  sortValue: string;
  onSortChange: (value: string) => void;
  searchPlaceholder?: string;
  onSearchSubmit?: (query: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const quickFilters = filters.filter((f) => f.isQuickFilter);
  const activeFilterCount = Object.keys(filterState).filter(
    (id) => filterState[id] !== undefined
  ).length;

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  }

  return (
    <div className="space-y-3" data-slot="plp-toolbar">
      {/* Search — hidden on mobile */}
      {onSearchSubmit && (
        <div className="hidden sm:block">
          <Input
            placeholder={searchPlaceholder || "Search..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full"
          />
        </div>
      )}

      {/* Filter bar + sort */}
      <div className="flex items-center gap-2">
        {/* All Filters button */}
        <Button variant="outline" size="sm" onClick={onOpenDrawer} className="shrink-0">
          <svg className="mr-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="4" x2="4" y1="21" y2="14" /><line x1="4" x2="4" y1="10" y2="3" />
            <line x1="12" x2="12" y1="21" y2="12" /><line x1="12" x2="12" y1="8" y2="3" />
            <line x1="20" x2="20" y1="21" y2="16" /><line x1="20" x2="20" y1="12" y2="3" />
            <line x1="1" x2="7" y1="14" y2="14" /><line x1="9" x2="15" y1="8" y2="8" />
            <line x1="17" x2="23" y1="16" y2="16" />
          </svg>
          All filters
          {activeFilterCount > 0 && (
            <Badge variant="default" size="sm" className="ml-1.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Quick filters — hidden on mobile */}
        <div className="hidden items-center gap-2 sm:flex">
          {quickFilters.map((def) => (
            <PlpQuickFilter
              key={def.id}
              definition={def}
              filterState={filterState}
              onFilterChange={onFilterChange}
            />
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Sort */}
        <div className="shrink-0">
          <Select value={sortValue} onValueChange={onSortChange}>
            <SelectTrigger size="sm" className="w-auto min-w-[140px]">
              <span className="mr-1 text-muted-foreground">Sort by</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/components/src/components/templates/plp/toolbar/
git commit -m "feat(plp): add toolbar with quick filters, search, and sort"
```

---

## Task 9: Filter drawer

**Files:**
- Create: `plp/filters/plp-filter-drawer.tsx`

- [ ] **Step 1: Implement All Filters drawer**

```tsx
// plp/filters/plp-filter-drawer.tsx
"use client";

import { Button } from "../../../atoms/button/button";
import { Separator } from "../../../atoms/separator/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "../../../molecules/sheet/sheet";
import { resolveFilterControl } from "./plp-filter-registry";
import type {
  FilterDefinition,
  FilterState,
  FilterValue,
} from "../plp-types";

/**
 * All Filters drawer — a left-side Sheet containing the complete filter list.
 *
 * Filters render in definition order, each in its own section with the
 * filter label as heading. The footer is sticky with a result-count-aware
 * primary action and a "Clear filters" secondary action.
 */
export function PlpFilterDrawer({
  open,
  onOpenChange,
  filters,
  filterState,
  onFilterChange,
  filteredResultsCount,
  onClearAll,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterDefinition[];
  filterState: FilterState;
  onFilterChange: (filterId: string, value: FilterValue) => void;
  filteredResultsCount?: number;
  onClearAll: () => void;
}) {
  const formattedCount =
    filteredResultsCount !== undefined
      ? new Intl.NumberFormat("en-US").format(filteredResultsCount)
      : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-full max-w-sm flex-col"
        aria-label="All filters"
      >
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>

        {/* Scrollable filter list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filters.map((definition, index) => {
            const FilterControl = resolveFilterControl(definition);

            // Build options — boolean-chip gets chipLabel as option
            const controlOptions =
              definition.preset === "boolean-chip" && definition.preset !== "custom"
                ? [{ value: "true", label: (definition as any).chipLabel || definition.label }]
                : "options" in definition
                  ? definition.options
                  : undefined;

            return (
              <div key={definition.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    {definition.label}
                  </h3>
                  <FilterControl
                    value={filterState[definition.id]}
                    onChange={(value) => onFilterChange(definition.id, value)}
                    options={controlOptions}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky footer */}
        <SheetFooter className="flex-row gap-2 border-t px-6 py-4">
          <Button variant="outline" className="flex-1" onClick={onClearAll}>
            Clear filters
          </Button>
          <Button className="flex-1" onClick={() => onOpenChange(false)}>
            {formattedCount
              ? `Show ${formattedCount} results`
              : "Show results"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/components/src/components/templates/plp/filters/plp-filter-drawer.tsx
git commit -m "feat(plp): add All Filters drawer with result-count-aware footer"
```

---

## Task 10: Active filters strip

**Files:**
- Create: `plp/filters/plp-active-filters.tsx`

- [ ] **Step 1: Implement active filters strip with sticky behaviour**

```tsx
// plp/filters/plp-active-filters.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../../../atoms/button/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../atoms/popover/popover";
import { resolveFilterControl, formatFilterChipValue } from "./plp-filter-registry";
import type { FilterDefinition, FilterState, FilterValue } from "../plp-types";

/**
 * Active filter chips strip.
 *
 * Appears below the toolbar when any filter has a value. Each chip shows
 * the filter label and formatted value. Chips are interactive:
 * - Click opens a popover with the same registry-resolved control for editing.
 * - Dismiss button clears the filter.
 *
 * Becomes sticky at the top of the viewport when the toolbar scrolls
 * out of view.
 */
export function PlpActiveFilters({
  filters,
  filterState,
  onFilterChange,
  onClearAll,
}: {
  filters: FilterDefinition[];
  filterState: FilterState;
  onFilterChange: (filterId: string, value: FilterValue) => void;
  onClearAll: () => void;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  // Intersection observer for sticky behaviour
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;

    const sentinel = document.createElement("div");
    sentinel.style.height = "1px";
    sentinel.style.marginTop = "-1px";
    el.parentElement?.insertBefore(sentinel, el);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);

  const activeFilters = filters.filter(
    (f) => filterState[f.id] !== undefined
  );

  if (activeFilters.length === 0) return null;

  return (
    <div
      ref={stripRef}
      className={cn(
        "flex items-center gap-2 overflow-x-auto py-2",
        isSticky &&
          "sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}
      data-slot="plp-active-filters"
    >
      {activeFilters.map((definition) => {
        const chipText = formatFilterChipValue(
          definition,
          filterState[definition.id]
        );

        return (
          <ActiveFilterChip
            key={definition.id}
            definition={definition}
            filterState={filterState}
            chipText={chipText}
            onFilterChange={onFilterChange}
          />
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 text-muted-foreground"
        onClick={onClearAll}
      >
        Clear all
      </Button>
    </div>
  );
}

/**
 * Individual active filter chip with edit popover and dismiss button.
 */
function ActiveFilterChip({
  definition,
  filterState,
  chipText,
  onFilterChange,
}: {
  definition: FilterDefinition;
  filterState: FilterState;
  chipText: string;
  onFilterChange: (filterId: string, value: FilterValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState<FilterValue>(
    filterState[definition.id]
  );

  const FilterControl = resolveFilterControl(definition);

  function handleOpen(nextOpen: boolean) {
    if (nextOpen) {
      setLocalValue(filterState[definition.id]);
    }
    setOpen(nextOpen);
  }

  function handleApply() {
    onFilterChange(definition.id, localValue);
    setOpen(false);
  }

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation();
    onFilterChange(definition.id, undefined);
  }

  const controlOptions =
    definition.preset === "boolean-chip" && definition.preset !== "custom"
      ? [{ value: "true", label: (definition as any).chipLabel || definition.label }]
      : "options" in definition
        ? definition.options
        : undefined;

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground cursor-pointer hover:bg-accent transition-colors"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Delete" || e.key === "Backspace") {
              onFilterChange(definition.id, undefined);
            }
          }}
        >
          <span>
            {definition.label}: {chipText}
          </span>
          <button
            type="button"
            className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
            aria-label={`Remove filter: ${definition.label}`}
            onClick={handleDismiss}
          >
            <svg className="h-3 w-3" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M11 3L3 11M3 3l8 8" />
            </svg>
          </button>
        </span>
      </PopoverTrigger>
      <PopoverContent className="p-4" aria-label={`Edit filter: ${definition.label}`}>
        <div className="space-y-4">
          <FilterControl
            value={localValue}
            onChange={setLocalValue}
            options={controlOptions}
          />
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onFilterChange(definition.id, undefined);
                setOpen(false);
              }}
            >
              Clear
            </Button>
            <Button size="sm" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/components/src/components/templates/plp/filters/plp-active-filters.tsx
git commit -m "feat(plp): add active filter chips strip with sticky behaviour and inline editing"
```

---

## Task 11: PlpTemplate orchestrator

**Files:**
- Create: `plp/plp-template.tsx`
- Modify: `packages/components/src/index.ts`

The top-level component that wires everything together.

- [ ] **Step 1: Implement PlpTemplate**

```tsx
// plp/plp-template.tsx
"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { PlpHeading } from "./heading/plp-heading";
import { PlpToolbar } from "./toolbar/plp-toolbar";
import { PlpFilterDrawer } from "./filters/plp-filter-drawer";
import { PlpActiveFilters } from "./filters/plp-active-filters";
import { PlpGrid } from "./grid/plp-grid";
import { PlpGridItem } from "./grid/plp-grid-item";
import { PlpGridSkeleton } from "./grid/plp-grid-skeleton";
import { PlpEmpty } from "./states/plp-empty";
import { PlpError } from "./states/plp-error";
import type {
  BreadcrumbSegment,
  FilterDefinition,
  FilterState,
  FilterValue,
  GridItemData,
  PlpStatus,
  SortOption,
} from "./plp-types";

/**
 * Props for the PLP template.
 */
export interface PlpTemplateProps<TItem> {
  // Heading
  breadcrumbs: BreadcrumbSegment[];
  title: string;
  resultsCount: number;

  // Filters
  filters: FilterDefinition[];
  filterState: FilterState;
  onFilterChange: (filterId: string, value: FilterValue) => void;
  filteredResultsCount?: number;

  // Sort
  sortOptions: SortOption[];
  sortValue: string;
  onSortChange: (value: string) => void;

  // Search
  searchPlaceholder?: string;
  onSearchSubmit?: (query: string) => void;

  // Grid items
  items: TItem[];
  renderGridItem: (item: TItem) => GridItemData;

  // Pagination
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  // States
  status: PlpStatus;
  onRetry?: () => void;
  emptyFilterSuggestions?: string[];
  emptyMessage?: string;
}

/**
 * Product Listing Page template.
 *
 * A page-level component that orchestrates a complete product listing
 * experience: heading, toolbar with filtering and sorting, responsive
 * product grid, pagination, and loading/empty/error states.
 *
 * The template is stateless with respect to data fetching, routing, and
 * persistence. It receives state and emits change events. Consumers own
 * the data lifecycle.
 *
 * Must be rendered inside an AppShell.
 *
 * @see docs/plans/specs/2026-04-16-plp-template-phase1-design.md
 */
export function PlpTemplate<TItem>({
  breadcrumbs,
  title,
  resultsCount,
  filters,
  filterState,
  onFilterChange,
  filteredResultsCount,
  sortOptions,
  sortValue,
  onSortChange,
  searchPlaceholder,
  onSearchSubmit,
  items,
  renderGridItem,
  page,
  pageSize,
  totalItems,
  pageSizeOptions = [20, 50, 100],
  onPageChange,
  onPageSizeChange,
  status,
  onRetry,
  emptyFilterSuggestions,
  emptyMessage,
}: PlpTemplateProps<TItem>) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleClearAllFilters() {
    for (const filter of filters) {
      if (filterState[filter.id] !== undefined) {
        onFilterChange(filter.id, undefined);
      }
    }
  }

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <main className="space-y-4" data-slot="plp-template">
      {/* Heading */}
      <PlpHeading
        breadcrumbs={breadcrumbs}
        title={title}
        resultsCount={resultsCount}
      />

      {/* Toolbar */}
      <PlpToolbar
        filters={filters}
        filterState={filterState}
        onFilterChange={onFilterChange}
        onOpenDrawer={() => setDrawerOpen(true)}
        sortOptions={sortOptions}
        sortValue={sortValue}
        onSortChange={onSortChange}
        searchPlaceholder={searchPlaceholder}
        onSearchSubmit={onSearchSubmit}
      />

      {/* Active filters strip */}
      <PlpActiveFilters
        filters={filters}
        filterState={filterState}
        onFilterChange={onFilterChange}
        onClearAll={handleClearAllFilters}
      />

      {/* Content area */}
      {status === "loading" && <PlpGridSkeleton count={pageSize} />}

      {status === "success" && (
        <PlpGrid>
          {items.map((item) => {
            const data = renderGridItem(item);
            return (
              <div key={data.id} role="listitem">
                <PlpGridItem data={data} />
              </div>
            );
          })}
        </PlpGrid>
      )}

      {(status === "empty-filtered" || status === "empty-no-items") && (
        <PlpEmpty
          variant={status}
          onClearFilters={
            status === "empty-filtered" ? handleClearAllFilters : undefined
          }
          filterSuggestions={emptyFilterSuggestions}
          message={emptyMessage}
        />
      )}

      {status === "error" && <PlpError onRetry={onRetry} />}

      {/* Pagination — only shown when there are items */}
      {status === "success" && totalItems > 0 && (
        <PlpPagination
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          pageSizeOptions={pageSizeOptions}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}

      {/* Filter drawer */}
      <PlpFilterDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        filters={filters}
        filterState={filterState}
        onFilterChange={onFilterChange}
        filteredResultsCount={filteredResultsCount}
        onClearAll={handleClearAllFilters}
      />
    </main>
  );
}

/**
 * PLP pagination footer — results per page selector + previous/next navigation.
 */
function PlpPagination({
  page,
  pageSize,
  totalPages,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  totalPages: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  return (
    <nav
      className="flex items-center justify-center gap-4 py-4"
      aria-label="Pagination"
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Results per page</span>
        <select
          className="rounded-md border border-border bg-background px-2 py-1 text-sm"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-md border border-border px-3 py-1 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="rounded-md border border-border px-3 py-1 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50 disabled:pointer-events-none"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </nav>
  );
}

export type { PlpTemplateProps };
```

- [ ] **Step 2: Add barrel export**

In `packages/components/src/index.ts`, under the Templates section:

```ts
// ────────────────────── Templates (0) ──────────────────────

// export { PlpTemplate } from "./components/templates/plp/plp-template";
// export type { PlpTemplateProps } from "./components/templates/plp/plp-template";
```

The export stays commented out until the component reaches `stable` status per CONTRIBUTING.md conventions.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/components/src/components/templates/plp/plp-template.tsx \
       packages/components/src/index.ts
git commit -m "feat(plp): add PlpTemplate orchestrator with pagination"
```

---

## Task 12: Grid item stories (variant playground)

**Files:**
- Create: `plp/grid/plp-grid-item.stories.tsx`

- [ ] **Step 1: Create grid item story file with argTypes playground**

```tsx
// plp/grid/plp-grid-item.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { userEvent, within } from "@storybook/test";
import { PlpGridItem } from "./plp-grid-item";
import { PlpUserProvider } from "../context/plp-user-context";
import { Badge } from "../../../atoms/badge/badge";
import type { GridItemData, PlpUserContextValue } from "../plp-types";

// ── Mock data builder ─────────────────────────────────────

function buildGridItemData(overrides: Partial<GridItemData> = {}): GridItemData {
  return {
    id: "item-1",
    name: "Emerald Green Radiant 1ct",
    thumbnailSrc: "https://placehold.co/400x400/f5f5f4/a3a3a3?text=Gem",
    thumbnailAlt: "1ct Emerald Green Radiant",
    lead: <span className="text-xs text-muted-foreground">GR · Stock ID</span>,
    badges: [
      <Badge key="origin" variant="outline" size="sm">Brazil</Badge>,
      <Badge key="curated" variant="secondary" size="sm">Nivoda Curated</Badge>,
    ],
    delivery: {
      estimatedDate: "Nov 18 – 23",
      shipsFrom: "United States",
      isExpress: false,
    },
    returns: { isReturnable: true },
    pricing: {
      amount: 9999.0,
      currency: "USD",
    },
    onAddToCart: fn(),
    onFavorite: fn(),
    onShare: fn(),
    onViewMedia: fn(),
    ...overrides,
  };
}

// ── Story meta ────────────────────────────────────────────

const meta: Meta<typeof PlpGridItem> = {
  title: "Templates/PLP Grid Item",
  component: PlpGridItem,
  tags: ["autodocs"],
  decorators: [
    (Story, context) => {
      const userContext: Partial<PlpUserContextValue> = {
        currency: context.args._currency ?? "USD",
        location: context.args._location ?? "US",
        pricingModel: context.args._pricingModel ?? "standard",
      };
      return (
        <PlpUserProvider value={userContext}>
          <div className="w-[280px]">
            <Story />
          </div>
        </PlpUserProvider>
      );
    },
  ],
  argTypes: {
    _currency: {
      control: "select",
      options: ["USD", "EUR", "GBP"],
      name: "User currency",
      table: { category: "User context" },
    },
    _location: {
      control: "select",
      options: ["US", "UK", "EU"],
      name: "User location",
      table: { category: "User context" },
    },
    _pricingModel: {
      control: "select",
      options: ["standard", "legacy"],
      name: "Pricing model",
      table: { category: "User context" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof PlpGridItem>;

// ── Stories ───────────────────────────────────────────────

export const Default: Story = {
  args: {
    data: buildGridItemData(),
  },
};

export const Express: Story = {
  args: {
    data: buildGridItemData({
      delivery: { estimatedDate: "Nov 15 – 17", shipsFrom: "New York", isExpress: true },
    }),
  },
};

export const NonReturnable: Story = {
  args: {
    data: buildGridItemData({
      returns: { isReturnable: false },
    }),
  },
};

export const WithDiscount: Story = {
  args: {
    data: buildGridItemData({
      pricing: {
        amount: 7499.0,
        currency: "USD",
        discount: { percentage: 25, originalAmount: 9999.0 },
      },
    }),
  },
};

export const WithPerCarat: Story = {
  args: {
    data: buildGridItemData({
      pricing: {
        amount: 9999.0,
        currency: "USD",
        perCarat: { amount: 1910.7, currency: "USD" },
      },
    }),
  },
};

export const WithTariffs: Story = {
  args: {
    data: buildGridItemData({
      pricing: {
        amount: 9999.0,
        currency: "USD",
        includeTariffs: true,
      },
    }),
    _location: "US",
  },
};

export const LegacyPricing: Story = {
  args: {
    data: buildGridItemData({
      pricing: {
        amount: 9999.0,
        currency: "USD",
        legacyDeliveredPrice: { amount: 10499.0, currency: "USD" },
      },
    }),
    _pricingModel: "legacy",
  },
};

export const WithCategoryActions: Story = {
  args: {
    data: buildGridItemData({
      categoryActions: [
        {
          id: "findPair",
          icon: <span className="text-xs">🔗</span>,
          label: "Find matching pair",
          onAction: fn(),
        },
      ],
    }),
  },
};

export const WithSelection: Story = {
  args: {
    data: buildGridItemData({ enableSelection: true }),
  },
};

export const WithCategorySlots: Story = {
  args: {
    data: buildGridItemData({
      categorySlotTop: (
        <div className="text-xs text-muted-foreground">
          Watermelon · Light color · Heating · Not Included · 5.95 × 5.89 × 2.76mm
        </div>
      ),
      categorySlotBottom: (
        <div className="flex gap-1">
          {["⬜", "🟡", "🔵"].map((s, i) => (
            <span key={i} className="h-4 w-4 rounded-full border text-[10px] flex items-center justify-center">{s}</span>
          ))}
        </div>
      ),
    }),
  },
};

export const AllVariantsActive: Story = {
  args: {
    data: buildGridItemData({
      delivery: { estimatedDate: "Nov 15 – 17", shipsFrom: "New York", isExpress: true },
      pricing: {
        amount: 7499.0,
        currency: "USD",
        perCarat: { amount: 1910.7, currency: "USD" },
        discount: { percentage: 25, originalAmount: 9999.0 },
        legacyDeliveredPrice: { amount: 10499.0, currency: "USD" },
        includeTariffs: true,
      },
      enableSelection: true,
      categoryActions: [
        { id: "findPair", icon: <span className="text-xs">🔗</span>, label: "Find matching pair", onAction: fn() },
      ],
      categorySlotTop: (
        <div className="text-xs text-muted-foreground">5.95 × 5.89 × 2.76mm</div>
      ),
    }),
    _pricingModel: "legacy",
    _location: "US",
  },
};

export const HoverState: Story = {
  args: {
    data: buildGridItemData({ enableSelection: true }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const article = canvas.getByRole("article");
    await userEvent.hover(article);
  },
};
```

- [ ] **Step 2: Verify Storybook renders**

```bash
cd packages/components && npx storybook dev -p 6006
```
Navigate to `Templates/PLP Grid Item` in the sidebar. Verify all stories render.

- [ ] **Step 3: Commit**

```bash
git add packages/components/src/components/templates/plp/grid/plp-grid-item.stories.tsx
git commit -m "feat(plp): add grid item stories with full variant playground"
```

---

## Task 13: Full template stories

**Files:**
- Create: `plp/plp-template.stories.tsx`

- [ ] **Step 1: Create template stories inside AppShell**

```tsx
// plp/plp-template.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState } from "react";
import { PlpTemplate } from "./plp-template";
import { PlpUserProvider } from "./context/plp-user-context";
import {
  AppShell,
  AppShellHeader,
  AppShellActions,
  AppShellMain,
} from "../../organisms/app-shell/app-shell";
import { Badge } from "../../atoms/badge/badge";
import type { FilterDefinition, FilterState, GridItemData, SortOption } from "./plp-types";

// ── Shared mock data ──────────────────────────────────────

const GEMSTONE_FILTERS: FilterDefinition[] = [
  {
    id: "nivoda-curated",
    label: "Nivoda Curated",
    preset: "boolean-chip",
    chipLabel: "Only Nivoda Curated items",
    isQuickFilter: true,
  },
  {
    id: "color",
    label: "Color",
    preset: "multi-select-chips",
    isQuickFilter: true,
    popoverWidth: 320,
    options: [
      { value: "blue", label: "Blue" },
      { value: "green", label: "Green" },
      { value: "red", label: "Red" },
      { value: "teal", label: "Teal" },
      { value: "pink", label: "Pink" },
      { value: "yellow", label: "Yellow" },
    ],
  },
  {
    id: "clarity",
    label: "Clarity",
    preset: "multi-select-chips",
    options: [
      { value: "eye-clean", label: "Eye clean" },
      { value: "slightly-included", label: "Slightly included" },
      { value: "moderately-included", label: "Moderately included" },
      { value: "visibly-included", label: "Visibly included" },
    ],
  },
  {
    id: "treatment",
    label: "Treatment",
    preset: "single-select-chips",
    options: [
      { value: "none", label: "None" },
      { value: "heated", label: "Heated" },
      { value: "oiled", label: "Oiled" },
    ],
  },
  {
    id: "location",
    label: "Location",
    preset: "single-select-dropdown",
    options: [
      { value: "us", label: "United States" },
      { value: "eu", label: "Europe" },
      { value: "asia", label: "Asia" },
    ],
  },
];

const SORT_OPTIONS: SortOption[] = [
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured" },
];

function generateGemstoneItems(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `gem-${i}`,
    name: `Emerald Green Radiant ${(1 + i * 0.1).toFixed(1)}ct`,
    image: `https://placehold.co/400x400/f5f5f4/a3a3a3?text=Gem+${i + 1}`,
    stockId: `GR-${10000 + i}`,
    origin: "Brazil",
    certLab: "IGI",
    certNumber: `287329${300 + i}`,
    price: 1910 + i * 100,
    pricePerCarat: 1910.7,
    isExpress: i % 4 === 0,
    isReturnable: i % 3 !== 0,
    discount: i % 5 === 0 ? 25 : undefined,
    originalPrice: i % 5 === 0 ? 2548 : undefined,
    includeTariffs: true,
  }));
}

function gemstoneRenderGridItem(item: ReturnType<typeof generateGemstoneItems>[number]): GridItemData {
  return {
    id: item.id,
    name: item.name,
    thumbnailSrc: item.image,
    thumbnailAlt: item.name,
    lead: <span>{item.stockId}</span>,
    badges: [
      <Badge key="origin" variant="outline" size="sm">{item.origin}</Badge>,
      <Badge key="curated" variant="secondary" size="sm">Nivoda Curated</Badge>,
    ],
    categorySlotTop: (
      <div className="text-xs text-muted-foreground">
        Watermelon · Light color · 5.95 × 5.89 × 2.76mm
      </div>
    ),
    delivery: {
      estimatedDate: "Nov 18 – 23",
      shipsFrom: "United States",
      isExpress: item.isExpress,
    },
    returns: { isReturnable: item.isReturnable },
    pricing: {
      amount: item.price,
      currency: "USD",
      perCarat: { amount: item.pricePerCarat, currency: "USD" },
      discount: item.discount
        ? { percentage: item.discount, originalAmount: item.originalPrice! }
        : undefined,
      includeTariffs: item.includeTariffs,
    },
    onAddToCart: fn(),
    onFavorite: fn(),
    onShare: fn(),
    onViewMedia: fn(),
  };
}

// ── Stateful wrapper for interactive stories ──────────────

function PlpTemplateInteractive({
  initialFilterState = {},
  ...props
}: Omit<React.ComponentProps<typeof PlpTemplate>, "filterState" | "onFilterChange" | "sortValue" | "onSortChange" | "page" | "onPageChange" | "pageSize" | "onPageSizeChange"> & {
  initialFilterState?: FilterState;
  sortValue: string;
  page: number;
  pageSize: number;
}) {
  const [filterState, setFilterState] = useState<FilterState>(initialFilterState);
  const [sortValue, setSortValue] = useState(props.sortValue);
  const [page, setPage] = useState(props.page);
  const [pageSize, setPageSize] = useState(props.pageSize);

  return (
    <PlpTemplate
      {...props}
      filterState={filterState}
      onFilterChange={(id, value) =>
        setFilterState((prev) => {
          const next = { ...prev };
          if (value === undefined) {
            delete next[id];
          } else {
            next[id] = value;
          }
          return next;
        })
      }
      sortValue={sortValue}
      onSortChange={setSortValue}
      page={page}
      onPageChange={setPage}
      pageSize={pageSize}
      onPageSizeChange={setPageSize}
    />
  );
}

// ── Story meta ────────────────────────────────────────────

const meta: Meta = {
  title: "Templates/PLP",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <PlpUserProvider>
        <AppShell>
          <AppShellHeader onSearch={fn()} />
          <AppShellMain>
            <Story />
          </AppShellMain>
        </AppShell>
      </PlpUserProvider>
    ),
  ],
};

export default meta;

// ── Stories ───────────────────────────────────────────────

export const GemstoneCategory: StoryObj = {
  render: () => (
    <PlpTemplateInteractive
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={1234567}
      filters={GEMSTONE_FILTERS}
      filteredResultsCount={10234}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      searchPlaceholder="Search by certificate number or stock ID..."
      onSearchSubmit={fn()}
      items={generateGemstoneItems(20)}
      renderGridItem={gemstoneRenderGridItem}
      page={1}
      pageSize={20}
      totalItems={1234567}
      status="success"
      onRetry={fn()}
    />
  ),
};

export const JewelryCategory: StoryObj = {
  render: () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      id: `ring-${i}`,
      name: "Three-Stone Anniversary Band",
      image: `https://placehold.co/400x400/f5f5f4/a3a3a3?text=Ring+${i + 1}`,
      sku: `SKU 100019ERDPL`,
      price: 9999.0,
    }));

    const jewelryFilters: FilterDefinition[] = [
      { id: "stone-shape", label: "Stone shape", preset: "multi-select-chips", isQuickFilter: true, options: [
        { value: "round", label: "Round" }, { value: "oval", label: "Oval" }, { value: "cushion", label: "Cushion" },
      ]},
      { id: "metal", label: "Metal", preset: "multi-select-chips", isQuickFilter: true, options: [
        { value: "gold", label: "Gold" }, { value: "platinum", label: "Platinum" }, { value: "silver", label: "Silver" },
      ]},
      { id: "style", label: "Style", preset: "multi-select-chips", options: [
        { value: "solitaire", label: "Solitaire" }, { value: "halo", label: "Halo" }, { value: "three-stone", label: "Three stone" },
      ]},
    ];

    return (
      <PlpTemplateInteractive
        breadcrumbs={[{ label: "Jewelry", href: "#" }, { label: "Wedding rings" }]}
        title="Wedding rings"
        resultsCount={1234567}
        filters={jewelryFilters}
        filteredResultsCount={1234567}
        sortOptions={[{ value: "featured", label: "Featured" }, ...SORT_OPTIONS.slice(0, 2)]}
        sortValue="featured"
        items={items}
        renderGridItem={(item) => ({
          id: item.id,
          name: item.name,
          thumbnailSrc: item.image,
          thumbnailAlt: item.name,
          lead: <span>Wedding ring · {item.sku}</span>,
          delivery: { estimatedDate: "Nov 18 – 23", shipsFrom: "United States" },
          returns: { isReturnable: true },
          pricing: { amount: item.price, currency: "USD" },
          onAddToCart: fn(),
          onFavorite: fn(),
          onShare: fn(),
          onViewMedia: fn(),
          categorySlotBottom: (
            <div className="flex gap-1 mt-1">
              {["⚪", "🟡", "🔵", "⬛"].map((s, i) => (
                <span key={i} className="h-3 w-3 rounded-full border text-[8px] flex items-center justify-center">{s}</span>
              ))}
            </div>
          ),
        })}
        page={1}
        pageSize={20}
        totalItems={1234567}
        status="success"
        onRetry={fn()}
      />
    );
  },
};

export const WithActiveFilters: StoryObj = {
  render: () => (
    <PlpTemplateInteractive
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={342}
      filters={GEMSTONE_FILTERS}
      initialFilterState={{ color: ["blue", "green"], treatment: "heated" }}
      filteredResultsCount={342}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      items={generateGemstoneItems(20)}
      renderGridItem={gemstoneRenderGridItem}
      page={1}
      pageSize={20}
      totalItems={342}
      status="success"
      onRetry={fn()}
    />
  ),
};

export const WithCustomFilter: StoryObj = {
  render: () => {
    const filtersWithCustom: FilterDefinition[] = [
      ...GEMSTONE_FILTERS.slice(0, 2),
      {
        id: "custom-rating",
        label: "Quality Rating",
        preset: "custom",
        isQuickFilter: true,
        renderControl: ({ value, onChange }) => (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-xl ${Number(value) >= star ? "text-warning" : "text-muted"}`}
                onClick={() => onChange(String(star))}
              >
                ★
              </button>
            ))}
          </div>
        ),
        formatChipValue: (value) => `${value}+ stars`,
      },
    ];

    return (
      <PlpTemplateInteractive
        breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
        title="Sapphire"
        resultsCount={1234567}
        filters={filtersWithCustom}
        filteredResultsCount={10234}
        sortOptions={SORT_OPTIONS}
        sortValue="price-asc"
        items={generateGemstoneItems(20)}
        renderGridItem={gemstoneRenderGridItem}
        page={1}
        pageSize={20}
        totalItems={1234567}
        status="success"
        onRetry={fn()}
      />
    );
  },
};

export const Loading: StoryObj = {
  render: () => (
    <PlpTemplate
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={0}
      filters={GEMSTONE_FILTERS}
      filterState={{}}
      onFilterChange={fn()}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      onSortChange={fn()}
      items={[]}
      renderGridItem={() => ({} as GridItemData)}
      page={1}
      pageSize={20}
      totalItems={0}
      onPageChange={fn()}
      onPageSizeChange={fn()}
      status="loading"
    />
  ),
};

export const EmptyFiltered: StoryObj = {
  render: () => (
    <PlpTemplateInteractive
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={0}
      filters={GEMSTONE_FILTERS}
      initialFilterState={{ color: ["pink"], clarity: ["eye-clean"] }}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      items={[]}
      renderGridItem={() => ({} as GridItemData)}
      page={1}
      pageSize={20}
      totalItems={0}
      status="empty-filtered"
      emptyFilterSuggestions={["Color", "Clarity"]}
    />
  ),
};

export const EmptyNoItems: StoryObj = {
  render: () => (
    <PlpTemplate
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Alexandrite" }]}
      title="Alexandrite"
      resultsCount={0}
      filters={[]}
      filterState={{}}
      onFilterChange={fn()}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      onSortChange={fn()}
      items={[]}
      renderGridItem={() => ({} as GridItemData)}
      page={1}
      pageSize={20}
      totalItems={0}
      onPageChange={fn()}
      onPageSizeChange={fn()}
      status="empty-no-items"
      emptyMessage="No alexandrite available at the moment."
    />
  ),
};

export const Error: StoryObj = {
  render: () => (
    <PlpTemplate
      breadcrumbs={[{ label: "Gemstones", href: "#" }, { label: "Sapphire" }]}
      title="Sapphire"
      resultsCount={0}
      filters={GEMSTONE_FILTERS}
      filterState={{}}
      onFilterChange={fn()}
      sortOptions={SORT_OPTIONS}
      sortValue="price-asc"
      onSortChange={fn()}
      items={[]}
      renderGridItem={() => ({} as GridItemData)}
      page={1}
      pageSize={20}
      totalItems={0}
      onPageChange={fn()}
      onPageSizeChange={fn()}
      status="error"
      onRetry={fn()}
    />
  ),
};
```

- [ ] **Step 2: Verify all stories render in Storybook**

```bash
cd packages/components && npx storybook dev -p 6006
```
Navigate to `Templates/PLP`. Verify all 9 stories render without errors.

- [ ] **Step 3: Commit**

```bash
git add packages/components/src/components/templates/plp/plp-template.stories.tsx
git commit -m "feat(plp): add full template stories inside AppShell"
```

---

## Task 14: COMPONENT.md

**Files:**
- Create: `plp/COMPONENT.md`

- [ ] **Step 1: Write component documentation**

```markdown
---
name: PlpTemplate
slug: plp-template
version: 0.1.0
status: unstable
lastUpdated: 2026-04-16
---

# PlpTemplate

Product Listing Page template — a page-level component that orchestrates a complete product listing experience with heading, toolbar, filtering, responsive product grid, pagination, and loading/empty/error states.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `breadcrumbs` | `BreadcrumbSegment[]` | — | Breadcrumb navigation segments |
| `title` | `string` | — | Category title |
| `resultsCount` | `number` | — | Total results to display in heading |
| `filters` | `FilterDefinition[]` | — | Filter definitions (preset or custom) |
| `filterState` | `FilterState` | — | Current filter values keyed by filter ID |
| `onFilterChange` | `(id: string, value: FilterValue) => void` | — | Called when any filter value changes |
| `filteredResultsCount` | `number` | — | Count shown in the "Show X results" drawer button |
| `sortOptions` | `SortOption[]` | — | Available sort options |
| `sortValue` | `string` | — | Currently selected sort value |
| `onSortChange` | `(value: string) => void` | — | Called when sort changes |
| `searchPlaceholder` | `string` | `"Search..."` | Placeholder for the search input |
| `onSearchSubmit` | `(query: string) => void` | — | Called on search submit (Enter key) |
| `items` | `TItem[]` | — | Raw items from the consumer |
| `renderGridItem` | `(item: TItem) => GridItemData` | — | Maps raw items to the grid item data shape |
| `page` | `number` | — | Current page number |
| `pageSize` | `number` | — | Items per page |
| `totalItems` | `number` | — | Total items for pagination |
| `pageSizeOptions` | `number[]` | `[20, 50, 100]` | Page size selector options |
| `onPageChange` | `(page: number) => void` | — | Called when page changes |
| `onPageSizeChange` | `(size: number) => void` | — | Called when page size changes |
| `status` | `PlpStatus` | — | Content area state: loading, success, empty-filtered, empty-no-items, error |
| `onRetry` | `() => void` | — | Retry handler for error state |
| `emptyFilterSuggestions` | `string[]` | — | Filter names to suggest removing in empty-filtered state |
| `emptyMessage` | `string` | — | Custom message for empty-no-items state |

## Usage guidelines

**When to use:** Any product listing page that shows a grid of items with filtering, sorting, and pagination. Must be rendered inside an AppShell.

**When NOT to use:** Pages that aren't product listings (dashboards, settings, auth flows). Pages that need a completely custom layout not matching the PLP structure.

## Best practices

**Do:** Supply all filter definitions as a configuration array. The template resolves them identically across all three surfaces (quick filter, drawer, active chip).

**Do:** Use the `renderGridItem` mapper to transform raw API data into the structured `GridItemData` shape. The template controls render order.

**Don't:** Try to inject custom rendering for template-driven sections (delivery, returns, pricing). Supply the data; the template handles the rendering.

**Don't:** Use custom filters when a preset fits. Custom filters drift visually over time.

## Quality checklist

- [x] Accessibility: keyboard navigable, focus trapping in drawer/popovers, aria-live for results count, semantic landmarks
- [x] Responsive: 2/3/4 column grid, mobile toolbar condensed to All Filters + Sort
- [x] Tokens only: no hardcoded visual values
```

- [ ] **Step 2: Commit**

```bash
git add packages/components/src/components/templates/plp/COMPONENT.md
git commit -m "docs(plp): add COMPONENT.md documentation"
```

---

## Task 15: Final verification

- [ ] **Step 1: TypeScript check**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 2: Run all tests**

```bash
cd packages/components && npx vitest run
```
Expected: filter registry tests pass, no regressions.

- [ ] **Step 3: Storybook build check**

```bash
cd packages/components && npx storybook build --quiet
```
Expected: builds successfully with no errors.

- [ ] **Step 4: Final commit if any fixes were needed**

Only if previous steps required corrections:
```bash
git add -A
git commit -m "fix(plp): address verification issues"
```
