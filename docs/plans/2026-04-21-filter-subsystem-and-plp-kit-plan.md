# Filter Subsystem Extraction + PLP Kit Decomposition — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the PLP filter system into reusable atoms/molecules/organisms under a new `Filtering/` Storybook section, and decompose `PlpTemplate` into a kit of individually-exported PLP building blocks so consumers assemble the page themselves.

**Architecture:** Two coupled moves. (1) Filter components migrate from `templates/plp/filters/…` and `templates/plp/toolbar/…` into `molecules/…` and `organisms/…`, with the old `PlpFilterButton` atom rewritten to absorb `PlpQuickFilter`'s draft lifecycle. Chip-select and range presets merge from two components each into one. (2) `PlpTemplate` is deleted; `PlpHeading`, `PlpGridContainer`, and `PlpListContainer` are extracted as individual kit pieces. Consumers assemble the PLP page in their own code. The existing PLP Storybook stories become assembly references with the hard invariant that their visual and behavioural output is unchanged.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Radix UI + shadcn primitives, Storybook, Nx monorepo, Vitest.

**Spec:** [docs/plans/specs/2026-04-21-filter-subsystem-and-plp-kit-design.md](specs/2026-04-21-filter-subsystem-and-plp-kit-design.md)

---

## Ground rules

- The package's convention: stories + `COMPONENT.md` are the primary verification. No unit test files (the package does not have a per-component unit test pattern beyond the now-deleted registry test).
- Each task produces a single focused commit. Commit after typecheck passes.
- `tsc --noEmit` must pass before each commit. Run from `packages/components`.
- The spec is the source of truth for API shapes. When in doubt, re-read the spec section.
- Storybook titles follow the spec: `Filtering/…` for all filter components, `Templates/PLP/…` for PLP kit pieces.
- Hard invariant: after Task 13, the existing PLP stories must look and behave identically to their pre-refactor state. Visual regression is a refactor bug.

---

## Task 1: Empty atom parity audit

**Files:**
- Read: `packages/components/src/components/atoms/empty/empty.tsx`
- Read: `packages/components/src/components/templates/plp/states/plp-empty.tsx`
- Read: `packages/components/src/components/templates/plp/states/plp-error.tsx`

**Purpose:** Before deleting `PlpEmpty` and `PlpError`, verify the `Empty` atom (plus its sub-components `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`) can reproduce the current visual output through composition at the consumption site.

- [ ] **Step 1: Read Empty atom and compare to PlpEmpty/PlpError**

Open `packages/components/src/components/atoms/empty/empty.tsx` and both `states/plp-*.tsx` files. Compare:

- Outer container layout (flex, centered, padding)
- Title typography
- Description typography
- CTA button placement
- Spacing between sections

- [ ] **Step 2: Mentally compose Empty + sub-components to match PlpEmpty**

The `PlpEmpty` visual (filtered variant) is:
```
<h3>No items match your filters</h3>
<p muted>Try adjusting your filters to find what you're looking for.</p>
[if suggestions] <p>Try removing: <emphasis>{labels.join(", ")}</emphasis></p>
[if onClearFilters] <Button outline>Clear all filters</Button>
```

Using the Empty atom, this composes as:
```tsx
<Empty>
  <EmptyHeader>
    <EmptyTitle>No items match your filters</EmptyTitle>
    <EmptyDescription>Try adjusting your filters...</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button variant="outline" onClick={onClearFilters}>Clear all filters</Button>
  </EmptyContent>
</Empty>
```

Confirm from reading the Empty atom that this composition produces equivalent visual output (centered layout, title heading, muted description, CTA). `PlpError` has the same shape with a retry button instead.

- [ ] **Step 3: Decide — proceed or fallback**

**If Empty reproduces the visuals adequately:** proceed with the plan as written. `PlpEmpty`/`PlpError` will be deleted in Task 14; the assembly story will compose `Empty` directly.

**If Empty has gaps (e.g. missing description styling, wrong heading level, awkward spacing):** either extend the Empty atom to cover the gap (document the change in a sub-task here) OR keep a thin `PlpEmpty`/`PlpError` in `templates/plp/` as pre-composed convenience wrappers. Note the decision below.

- [ ] **Step 4: Record decision inline in this task**

Append one of the following lines to this task before moving on:

```
Decision: Empty atom is sufficient. Proceed with deletion in Task 14.
```
or
```
Decision: Keep thin PlpEmpty + PlpError in templates/plp/states/ as pre-composed wrappers over Empty. Task 14 retains these files.
```
or
```
Decision: Extend Empty atom to cover {gap}. Added as sub-task before Task 13.
```

- [ ] **Step 5: No commit — audit only**

This is a decision-recording task. No files change. Proceed to Task 2.

---

## Task 2: AllFiltersButton molecule

**Files:**
- Create: `packages/components/src/components/molecules/all-filters-button/all-filters-button.tsx`
- Create: `packages/components/src/components/molecules/all-filters-button/all-filters-button.stories.tsx`
- Create: `packages/components/src/components/molecules/all-filters-button/all-filters-button.COMPONENT.md`

Old file at `templates/plp/toolbar/plp-all-filters-button.tsx` stays for now — it will be deleted in Task 14.

- [ ] **Step 1: Create the component**

Create `packages/components/src/components/molecules/all-filters-button/all-filters-button.tsx`:

```tsx
"use client";

import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import { Button } from "../../atoms/button/button";
import { Typography } from "../../atoms/typography/typography";

export interface AllFiltersButtonProps {
  activeFilterCount: number;
  onClick: () => void;
}

/**
 * "All filters" button — opens the filter drawer and shows an active
 * count badge when filters are engaged.
 *
 * Used inside the FilterToolbar's main chrome and its sticky chrome so
 * the button stays in sync across surfaces.
 */
export function AllFiltersButton({
  activeFilterCount,
  onClick,
}: AllFiltersButtonProps) {
  return (
    <Button variant="outline" onClick={onClick} className="shrink-0">
      <IconAdjustmentsHorizontal className="mr-1.5 h-4 w-4" />
      All filters
      {activeFilterCount > 0 && (
        <Typography asChild variant="caption">
          <span className="bg-accent text-accent-foreground px-1.5 rounded-full">
            {activeFilterCount}
          </span>
        </Typography>
      )}
    </Button>
  );
}
```

- [ ] **Step 2: Create the story**

Create `packages/components/src/components/molecules/all-filters-button/all-filters-button.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { AllFiltersButton } from "./all-filters-button";

const meta: Meta<typeof AllFiltersButton> = {
  title: "Filtering/AllFiltersButton",
  component: AllFiltersButton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AllFiltersButton>;

export const Inactive: Story = {
  args: { activeFilterCount: 0, onClick: fn() },
};

export const Active: Story = {
  args: { activeFilterCount: 3, onClick: fn() },
};
```

- [ ] **Step 3: Create COMPONENT.md**

Create `packages/components/src/components/molecules/all-filters-button/all-filters-button.COMPONENT.md`:

```markdown
---
name: AllFiltersButton
slug: all-filters-button
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# AllFiltersButton

Outline button with an adjustments icon and optional active-count badge. Opens a filter drawer when clicked. Designed to sit in both the main and sticky variants of `FilterToolbar`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activeFilterCount` | `number` | — | Number shown in the badge. Badge hidden when `0`. |
| `onClick` | `() => void` | — | Handler for the button click. Typically opens a `FilterDrawer`. |

## Quality checklist

- [x] Accessibility: keyboard-operable button
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [x] Tokens only: no hardcoded visual values
```

- [ ] **Step 4: Typecheck**

Run:
```bash
cd packages/components && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/components/molecules/all-filters-button/
git commit -m "$(cat <<'EOF'
feat(components): add AllFiltersButton molecule

Extracted from templates/plp/toolbar/plp-all-filters-button.tsx; API
unchanged. The old file stays until consumers stop referencing it in
Task 14. Storybook title: Filtering/AllFiltersButton.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: FilterSection molecule

**Files:**
- Create: `packages/components/src/components/molecules/filter-section/filter-section.tsx`
- Create: `packages/components/src/components/molecules/filter-section/filter-section.stories.tsx`
- Create: `packages/components/src/components/molecules/filter-section/filter-section.COMPONENT.md`

- [ ] **Step 1: Create the component**

Create `packages/components/src/components/molecules/filter-section/filter-section.tsx`:

```tsx
"use client";

import { type ReactNode } from "react";
import { Separator } from "../../atoms/separator/separator";
import { Typography } from "../../atoms/typography/typography";

export interface FilterSectionProps {
  label: string;
  children: ReactNode;
  /**
   * When false, suppresses the leading separator. Set `false` on the
   * first section of a drawer to avoid a redundant top rule.
   * Defaults to `true`.
   */
  separator?: boolean;
}

/**
 * Thin wrapper for a single filter entry inside a FilterDrawer. Renders
 * an optional leading separator, a heading, and the filter control.
 *
 * Exists so consumers don't re-implement the per-section heading +
 * separator scaffold for every drawer they render.
 */
export function FilterSection({
  label,
  children,
  separator = true,
}: FilterSectionProps) {
  return (
    <div data-slot="filter-section">
      {separator && <Separator className="my-4" />}
      <div className="space-y-3">
        <Typography as="h3" variant="body-2" emphasis>
          {label}
        </Typography>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create the story**

Create `packages/components/src/components/molecules/filter-section/filter-section.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { FilterSection } from "./filter-section";
import { Typography } from "../../atoms/typography/typography";

const meta: Meta<typeof FilterSection> = {
  title: "Filtering/FilterSection",
  component: FilterSection,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FilterSection>;

export const Default: Story = {
  render: () => (
    <div className="w-80">
      <FilterSection label="Color" separator={false}>
        <Typography variant="body-2" className="text-muted-foreground">
          Filter control goes here
        </Typography>
      </FilterSection>
    </div>
  ),
};

export const MultipleSections: Story = {
  render: () => (
    <div className="w-80">
      <FilterSection label="Color" separator={false}>
        <Typography variant="body-2" className="text-muted-foreground">Control 1</Typography>
      </FilterSection>
      <FilterSection label="Clarity">
        <Typography variant="body-2" className="text-muted-foreground">Control 2</Typography>
      </FilterSection>
      <FilterSection label="Price">
        <Typography variant="body-2" className="text-muted-foreground">Control 3</Typography>
      </FilterSection>
    </div>
  ),
};
```

- [ ] **Step 3: Create COMPONENT.md**

Create `packages/components/src/components/molecules/filter-section/filter-section.COMPONENT.md`:

```markdown
---
name: FilterSection
slug: filter-section
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# FilterSection

Thin wrapper for a single filter entry inside a `FilterDrawer`. Renders an optional leading separator, a heading, and the filter control.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Section heading shown above the control |
| `children` | `ReactNode` | — | The filter control |
| `separator` | `boolean` | `true` | Leading separator. Set `false` on the first section of a drawer. |

## Quality checklist

- [x] Accessibility: semantic heading per section
- [x] Tokens only: no hardcoded visual values
```

- [ ] **Step 4: Typecheck**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/components/molecules/filter-section/
git commit -m "$(cat <<'EOF'
feat(components): add FilterSection molecule

Extracted from templates/plp/filters/plp-filter-section.tsx; API
unchanged beyond the rename. Old file stays until Task 14.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: FilterDrawer molecule

**Files:**
- Create: `packages/components/src/components/molecules/filter-drawer/filter-drawer.tsx`
- Create: `packages/components/src/components/molecules/filter-drawer/filter-drawer.stories.tsx`
- Create: `packages/components/src/components/molecules/filter-drawer/filter-drawer.COMPONENT.md`

Adds `applyLabel?: string` per the spec; otherwise unchanged.

- [ ] **Step 1: Create the component**

Create `packages/components/src/components/molecules/filter-drawer/filter-drawer.tsx`:

```tsx
"use client";

import { type ReactNode } from "react";
import { Button } from "../../atoms/button/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "../sheet/sheet";

export interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Fired when the user clicks the primary action. The consumer commits
   * its draft filter state here and typically closes the drawer.
   */
  onApply: () => void;
  /**
   * Fired when the user clicks the header "Clear" action. Only rendered
   * when `hasActiveDraft` is true and `onClearDraft` is provided.
   */
  onClearDraft?: () => void;
  /** Whether the current draft has any active filters. */
  hasActiveDraft?: boolean;
  /**
   * Preview count for the primary action — "Show X results". When
   * omitted, the button renders `applyLabel` (default "Apply").
   */
  resultsCount?: number;
  /** When true, the primary action shows a loading state. */
  isCountLoading?: boolean;
  /** Primary action label when `resultsCount` is undefined. Default "Apply". */
  applyLabel?: string;
  /** Filter sections, composed by the consumer. */
  children: ReactNode;
}

/**
 * All Filters drawer — a left-side Sheet housing the complete filter list.
 *
 * Presentational container: renders the Sheet shell, an optional header
 * Clear action, a scrollable body that flows consumer-provided filter
 * sections, and a sticky footer with a results-count-aware primary
 * action. Filter state (applied, drafted) is entirely the consumer's
 * concern.
 */
export function FilterDrawer({
  open,
  onOpenChange,
  onApply,
  onClearDraft,
  hasActiveDraft = false,
  resultsCount,
  isCountLoading = false,
  applyLabel = "Apply",
  children,
}: FilterDrawerProps) {
  const formattedCount =
    resultsCount !== undefined
      ? new Intl.NumberFormat("en-US").format(resultsCount)
      : null;

  const showClear = hasActiveDraft && !!onClearDraft;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-full max-w-sm flex-col"
        aria-label="All filters"
      >
        <SheetHeader className="flex-row items-center justify-between pr-10">
          <SheetTitle>Filters</SheetTitle>
          {showClear && (
            <Button variant="link" size="sm" onClick={onClearDraft}>
              Clear
            </Button>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        <SheetFooter className="border-t px-6 py-4">
          <Button
            block
            onClick={onApply}
            loading={isCountLoading}
            disabled={isCountLoading}
          >
            {formattedCount ? `Show ${formattedCount} results` : applyLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Create the story**

Create `packages/components/src/components/molecules/filter-drawer/filter-drawer.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState } from "react";
import { Button } from "../../atoms/button/button";
import { FilterDrawer } from "./filter-drawer";
import { FilterSection } from "../filter-section/filter-section";

const meta: Meta<typeof FilterDrawer> = {
  title: "Filtering/FilterDrawer",
  component: FilterDrawer,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FilterDrawer>;

function Controlled({
  initialOpen = false,
  resultsCount,
  isCountLoading,
  hasActiveDraft,
  applyLabel,
}: {
  initialOpen?: boolean;
  resultsCount?: number;
  isCountLoading?: boolean;
  hasActiveDraft?: boolean;
  applyLabel?: string;
}) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open drawer</Button>
      <FilterDrawer
        open={open}
        onOpenChange={setOpen}
        onApply={() => { fn()(); setOpen(false); }}
        onClearDraft={fn()}
        hasActiveDraft={hasActiveDraft}
        resultsCount={resultsCount}
        isCountLoading={isCountLoading}
        applyLabel={applyLabel}
      >
        <FilterSection label="Section A" separator={false}>
          <div className="text-sm text-muted-foreground">Filter control A</div>
        </FilterSection>
        <FilterSection label="Section B">
          <div className="text-sm text-muted-foreground">Filter control B</div>
        </FilterSection>
      </FilterDrawer>
    </>
  );
}

export const Default: Story = { render: () => <Controlled /> };
export const Open: Story = { render: () => <Controlled initialOpen /> };
export const WithResultCount: Story = {
  render: () => <Controlled initialOpen resultsCount={1234} hasActiveDraft />,
};
export const CountLoading: Story = {
  render: () => <Controlled initialOpen resultsCount={1234} isCountLoading />,
};
export const NoCountCustomLabel: Story = {
  render: () => <Controlled initialOpen applyLabel="Save" />,
};
```

- [ ] **Step 3: Create COMPONENT.md**

Create `packages/components/src/components/molecules/filter-drawer/filter-drawer.COMPONENT.md`:

```markdown
---
name: FilterDrawer
slug: filter-drawer
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# FilterDrawer

Left-side Sheet container for a filter list. Renders the shell, an optional header Clear action, a scrollable body that flows consumer-composed filter sections, and a sticky footer with a results-count-aware primary action.

The drawer holds no draft state itself — consumers own applied and draft filter state, compose preset controls inside `FilterSection` wrappers, and commit via `onApply`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | — | Open-state setter |
| `onApply` | `() => void` | — | Fires on primary-action click. Consumer commits draft and typically closes the drawer. |
| `onClearDraft` | `() => void` | — | Fires on header Clear click. Only rendered when `hasActiveDraft` and `onClearDraft` are both set. |
| `hasActiveDraft` | `boolean` | `false` | Gates the header Clear action. |
| `resultsCount` | `number` | — | When set, primary action reads `"Show X results"`. |
| `isCountLoading` | `boolean` | `false` | Primary action shows a spinner and disables while a preview-count fetch is in flight. |
| `applyLabel` | `string` | `"Apply"` | Primary action text when `resultsCount` is undefined. |
| `children` | `ReactNode` | — | Filter sections (usually `FilterSection` wrappers). |

## Quality checklist

- [x] Accessibility: delegates to the Sheet molecule's focus trap and aria-label
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [x] Tokens only: no hardcoded visual values
```

- [ ] **Step 4: Typecheck**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/components/molecules/filter-drawer/
git commit -m "$(cat <<'EOF'
feat(components): add FilterDrawer molecule

Extracted from templates/plp/filters/plp-filter-drawer.tsx; adds an
applyLabel prop (default "Apply") for non-list use cases. Old file
remains until Task 14.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: ChipSelectFilter molecule (merged)

**Files:**
- Create: `packages/components/src/components/molecules/chip-select-filter/chip-select-filter.tsx`
- Create: `packages/components/src/components/molecules/chip-select-filter/chip-select-filter.stories.tsx`
- Create: `packages/components/src/components/molecules/chip-select-filter/chip-select-filter.COMPONENT.md`

Merges `SingleSelectChipsFilter` and `MultiSelectChipsFilter` behind a `mode` discriminated union.

- [ ] **Step 1: Create the component**

Create `packages/components/src/components/molecules/chip-select-filter/chip-select-filter.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Toggle } from "../../atoms/toggle/toggle";

export interface ChipSelectOption {
  value: string;
  label: string;
  /** Small visual before the label (colour swatch, icon). */
  adornment?: ReactNode;
  /**
   * Replaces the default toggle content entirely. Receives selection
   * state so the consumer can style accordingly. The preset still owns
   * the outer button shell (click, aria, selection border).
   */
  renderOption?: (props: { selected: boolean }) => ReactNode;
}

type SingleProps = {
  mode: "single";
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  options: ChipSelectOption[];
};

type MultipleProps = {
  mode: "multiple";
  value: string[] | undefined;
  onChange: (value: string[] | undefined) => void;
  options: ChipSelectOption[];
};

export type ChipSelectFilterProps = SingleProps | MultipleProps;

/**
 * Chip group with either single-select or multi-select semantics.
 *
 * - `mode: "single"` — clicking an option replaces the selection;
 *   clicking an already-pressed option clears the filter.
 * - `mode: "multiple"` — clicking toggles the option's presence in
 *   the selected array; emptying the selection collapses the value
 *   to `undefined`.
 *
 * Each chip is an independent `Toggle` so `renderOption` can drive
 * richer layouts (card-shaped selectors etc.). Requires at least two
 * options; use a `Toggle` atom directly for single-option boolean
 * filters.
 */
export function ChipSelectFilter(props: ChipSelectFilterProps) {
  const { options } = props;

  function isSelected(optionValue: string): boolean {
    if (props.mode === "single") return props.value === optionValue;
    return (props.value ?? []).includes(optionValue);
  }

  function handleToggle(optionValue: string, pressed: boolean) {
    if (props.mode === "single") {
      props.onChange(pressed ? optionValue : undefined);
      return;
    }
    const current = props.value ?? [];
    const next = pressed
      ? [...current, optionValue]
      : current.filter((v) => v !== optionValue);
    props.onChange(next.length > 0 ? next : undefined);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = isSelected(option.value);
        return (
          <Toggle
            key={option.value}
            variant="outline"
            pressed={selected}
            onPressedChange={(pressed) => handleToggle(option.value, pressed)}
            aria-label={option.label}
            className={cn(
              option.renderOption ? "h-auto min-w-0 p-2" : undefined
            )}
          >
            {option.renderOption ? (
              option.renderOption({ selected })
            ) : (
              <>
                {option.adornment}
                {option.label}
              </>
            )}
          </Toggle>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create the story**

Create `packages/components/src/components/molecules/chip-select-filter/chip-select-filter.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  ChipSelectFilter,
  type ChipSelectOption,
} from "./chip-select-filter";

const meta: Meta<typeof ChipSelectFilter> = {
  title: "Filtering/ChipSelectFilter",
  component: ChipSelectFilter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ChipSelectFilter>;

const COLORS: ChipSelectOption[] = [
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
  { value: "teal", label: "Teal" },
  { value: "pink", label: "Pink" },
  { value: "yellow", label: "Yellow" },
];

const TREATMENTS: ChipSelectOption[] = [
  { value: "none", label: "None" },
  { value: "heated", label: "Heated" },
  { value: "oiled", label: "Oiled" },
];

const SHAPES: ChipSelectOption[] = [
  { value: "round", label: "Round" },
  { value: "oval", label: "Oval" },
  { value: "cushion", label: "Cushion" },
  { value: "princess", label: "Princess" },
];

export const SingleSelect: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>(undefined);
    return (
      <ChipSelectFilter
        mode="single"
        value={value}
        onChange={setValue}
        options={TREATMENTS}
      />
    );
  },
};

export const SingleSelectEngaged: Story = {
  render: () => {
    const [value, setValue] = useState<string | undefined>("heated");
    return (
      <ChipSelectFilter
        mode="single"
        value={value}
        onChange={setValue}
        options={TREATMENTS}
      />
    );
  },
};

export const MultipleSelect: Story = {
  render: () => {
    const [value, setValue] = useState<string[] | undefined>(undefined);
    return (
      <ChipSelectFilter
        mode="multiple"
        value={value}
        onChange={setValue}
        options={COLORS}
      />
    );
  },
};

export const MultipleSelectEngaged: Story = {
  render: () => {
    const [value, setValue] = useState<string[] | undefined>(["blue", "green"]);
    return (
      <ChipSelectFilter
        mode="multiple"
        value={value}
        onChange={setValue}
        options={COLORS}
      />
    );
  },
};

export const RichRenderOption: Story = {
  render: () => {
    const options: ChipSelectOption[] = SHAPES.map((o) => ({
      ...o,
      renderOption: ({ selected }) => (
        <div className="flex flex-col items-center gap-1 px-2 py-1">
          <span aria-hidden className={selected ? "opacity-100" : "opacity-60"}>
            ◆
          </span>
          <span className="text-xs">{o.label}</span>
        </div>
      ),
    }));
    const [value, setValue] = useState<string[] | undefined>(undefined);
    return (
      <ChipSelectFilter
        mode="multiple"
        value={value}
        onChange={setValue}
        options={options}
      />
    );
  },
};
```

- [ ] **Step 3: Create COMPONENT.md**

Create `packages/components/src/components/molecules/chip-select-filter/chip-select-filter.COMPONENT.md`:

```markdown
---
name: ChipSelectFilter
slug: chip-select-filter
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# ChipSelectFilter

Chip group with either single-select or multi-select semantics, chosen via the `mode` prop.

- `mode: "single"` — mutually exclusive. Clicking an option replaces the selection; clicking an already-pressed option clears the filter.
- `mode: "multiple"` — toggles the option's presence in a selected array. Empty selection collapses to `undefined`.

Requires at least two options. Use a `Toggle` atom directly for single-option boolean filters.

## Props

Discriminated union on `mode`:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `"single" \| "multiple"` | — | Selection semantics. |
| `value` | `string \| undefined` (single) / `string[] \| undefined` (multiple) | — | Current selection. |
| `onChange` | `(v: string \| undefined) => void` (single) / `(v: string[] \| undefined) => void` (multiple) | — | Called on selection change. |
| `options` | `ChipSelectOption[]` | — | Options (value, label, optional adornment, optional `renderOption`). |

### ChipSelectOption

| Field | Type | Description |
|-------|------|-------------|
| `value` | `string` | Option value |
| `label` | `string` | Display label |
| `adornment` | `ReactNode \| undefined` | Small visual before the label |
| `renderOption` | `(props: { selected: boolean }) => ReactNode` | Overrides the default toggle content entirely |

## Quality checklist

- [x] Accessibility: keyboard-operable toggles, aria-label
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [x] Tokens only: no hardcoded visual values
```

- [ ] **Step 4: Typecheck**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/components/molecules/chip-select-filter/
git commit -m "$(cat <<'EOF'
feat(components): add ChipSelectFilter molecule (merged single + multi)

Merges the old SingleSelectChipsFilter and MultiSelectChipsFilter behind
a discriminated-union mode prop. Old preset files remain until Task 14.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: RangeFilter molecule (merged)

**Files:**
- Create: `packages/components/src/components/molecules/range-filter/range-filter.tsx`
- Create: `packages/components/src/components/molecules/range-filter/range-filter.stories.tsx`
- Create: `packages/components/src/components/molecules/range-filter/range-filter.COMPONENT.md`

Merges `RangeSliderFilter` and `MultiAxisRangeFilter`. Value always keyed by axis id. Single-axis use omits per-axis `label` so the heading is skipped.

- [ ] **Step 1: Create the component**

Create `packages/components/src/components/molecules/range-filter/range-filter.tsx`:

```tsx
"use client";

import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../../atoms/input-group/input-group";
import { Slider } from "../../atoms/slider/slider";
import { Typography } from "../../atoms/typography/typography";

export interface RangeHistogram {
  /** Equal-width bucket counts across `[min, max]`. */
  buckets: number[];
  min: number;
  max: number;
}

export interface RangeAxis {
  /** Machine-readable key for this axis. Becomes a key in the filter value. */
  id: string;
  /** Human-readable heading. Omit for single-axis use to skip the heading. */
  label?: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  histogram?: RangeHistogram;
}

export type RangeValue =
  | Record<string, { min: number; max: number }>
  | undefined;

export interface RangeFilterProps {
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  axes: RangeAxis[];
}

/**
 * Range filter with one or more axes. Each axis is an independent
 * `[min, max]` slider + numeric input pair, with an optional
 * distribution histogram behind the slider track.
 *
 * Value is always `Record<string, { min; max }>` keyed by axis id, or
 * `undefined` when no axis is engaged. Axes at their full range are
 * omitted from the value object.
 *
 * For single-axis use, pass a one-element `axes` array with no `label`
 * so the component skips the heading and reads cleanly.
 */
export function RangeFilter({ value, onChange, axes }: RangeFilterProps) {
  const axisValues = value ?? {};

  function commitAxis(axisId: string, nextMin: number, nextMax: number) {
    const axis = axes.find((a) => a.id === axisId);
    if (!axis) return;

    const clampedMin = Math.max(axis.min, Math.min(nextMin, axis.max));
    const clampedMax = Math.max(axis.min, Math.min(nextMax, axis.max));
    const orderedMin = Math.min(clampedMin, clampedMax);
    const orderedMax = Math.max(clampedMin, clampedMax);

    const isFullRange = orderedMin === axis.min && orderedMax === axis.max;
    const next = { ...axisValues };

    if (isFullRange) {
      delete next[axisId];
    } else {
      next[axisId] = { min: orderedMin, max: orderedMax };
    }

    onChange(Object.keys(next).length > 0 ? next : undefined);
  }

  return (
    <div className={axes.length > 1 ? "flex flex-col gap-6" : "flex flex-col gap-4"}>
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

function AxisRow({
  axis,
  currentMin,
  currentMax,
  onCommit,
}: {
  axis: RangeAxis;
  currentMin: number;
  currentMax: number;
  onCommit: (min: number, max: number) => void;
}) {
  const idBase = useId();
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

  const isCurrencyUnit = axis.unit
    ? ["$", "€", "£", "¥"].some((c) => axis.unit!.startsWith(c)) ||
      ["USD", "EUR", "GBP", "JPY"].includes(axis.unit)
    : false;

  return (
    <div className="flex flex-col gap-2">
      {axis.label && (
        <Typography as="h4" variant="body-2" emphasis>{axis.label}</Typography>
      )}

      {axis.histogram && (
        <Histogram
          buckets={axis.histogram.buckets}
          histogramMin={axis.histogram.min}
          histogramMax={axis.histogram.max}
          sliderMin={axis.min}
          sliderMax={axis.max}
          selectedMin={currentMin}
          selectedMax={currentMax}
        />
      )}

      <Slider
        value={[currentMin, currentMax]}
        min={axis.min}
        max={axis.max}
        step={step}
        onValueChange={(values) => onCommit(values[0], values[1])}
        className="my-2"
      />

      <div className="flex items-center gap-2">
        <div className="flex flex-1 flex-col gap-1">
          {axis.label === undefined && (
            <Typography asChild variant="caption" className="text-muted-foreground">
              <label htmlFor={`${idBase}-min`}>Min</label>
            </Typography>
          )}
          <InputGroup>
            {isCurrencyUnit && axis.unit && (
              <InputGroupAddon align="inline-start">
                <InputGroupText>{axis.unit}</InputGroupText>
              </InputGroupAddon>
            )}
            <InputGroupInput
              id={`${idBase}-min`}
              type="number"
              inputMode="decimal"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              onBlur={commitInputs}
              onKeyDown={handleKeyDown}
              aria-label={axis.label ? `${axis.label} min` : "Min"}
            />
            {!isCurrencyUnit && axis.unit && (
              <InputGroupAddon align="inline-end">
                <InputGroupText>{axis.unit}</InputGroupText>
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>
        {axis.label && (
          <Typography as="span" variant="body-2" className="text-muted-foreground">
            –
          </Typography>
        )}
        <div className="flex flex-1 flex-col gap-1">
          {axis.label === undefined && (
            <Typography asChild variant="caption" className="text-muted-foreground">
              <label htmlFor={`${idBase}-max`}>Max</label>
            </Typography>
          )}
          <InputGroup>
            {isCurrencyUnit && axis.unit && (
              <InputGroupAddon align="inline-start">
                <InputGroupText>{axis.unit}</InputGroupText>
              </InputGroupAddon>
            )}
            <InputGroupInput
              id={`${idBase}-max`}
              type="number"
              inputMode="decimal"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              onBlur={commitInputs}
              onKeyDown={handleKeyDown}
              aria-label={axis.label ? `${axis.label} max` : "Max"}
            />
            {!isCurrencyUnit && axis.unit && (
              <InputGroupAddon align="inline-end">
                <InputGroupText>{axis.unit}</InputGroupText>
              </InputGroupAddon>
            )}
          </InputGroup>
        </div>
      </div>
    </div>
  );
}

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
    <div aria-hidden="true" className="relative flex h-12 items-end gap-px">
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

**Note on visual invariant:** The single-axis branch (no label, Min/Max input labels shown, histogram support) and the multi-axis branch (per-axis heading, dash separator between inputs, no "Min/Max" input labels) reproduce the current `RangeSliderFilter` and `MultiAxisRangeFilter` visuals respectively. Verify in Storybook when ported.

- [ ] **Step 2: Create the story**

Create `packages/components/src/components/molecules/range-filter/range-filter.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  RangeFilter,
  type RangeAxis,
  type RangeHistogram,
  type RangeValue,
} from "./range-filter";
import { buildMockHistogram } from "../../templates/plp/mocks/common";

const meta: Meta<typeof RangeFilter> = {
  title: "Filtering/RangeFilter",
  component: RangeFilter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RangeFilter>;

const PRICE_HISTOGRAM: RangeHistogram = buildMockHistogram(0, 10000, 40, 2500);

const PRICE_AXIS: RangeAxis = {
  id: "price",
  min: 0,
  max: 10000,
  step: 10,
  unit: "$",
  histogram: PRICE_HISTOGRAM,
};

const CARAT_AXIS: RangeAxis = {
  id: "carat",
  min: 0,
  max: 10,
  step: 0.1,
  unit: "ct",
};

const SIZE_AXES: RangeAxis[] = [
  { id: "length", label: "Length", min: 0, max: 20, step: 0.1, unit: "mm" },
  { id: "width", label: "Width", min: 0, max: 20, step: 0.1, unit: "mm" },
  { id: "depth", label: "Depth", min: 0, max: 10, step: 0.1, unit: "mm" },
];

function Controlled({
  axes,
  initial,
}: {
  axes: RangeAxis[];
  initial?: RangeValue;
}) {
  const [value, setValue] = useState<RangeValue>(initial);
  return (
    <div className="w-80">
      <RangeFilter value={value} onChange={setValue} axes={axes} />
    </div>
  );
}

export const SingleAxis: Story = {
  render: () => <Controlled axes={[PRICE_AXIS]} />,
};

export const SingleAxisEngaged: Story = {
  render: () => (
    <Controlled axes={[PRICE_AXIS]} initial={{ price: { min: 1000, max: 5000 } }} />
  ),
};

export const SingleAxisSuffixUnit: Story = {
  render: () => <Controlled axes={[CARAT_AXIS]} />,
};

export const MultiAxis: Story = {
  render: () => <Controlled axes={SIZE_AXES} />,
};

export const MultiAxisPartiallyEngaged: Story = {
  render: () => (
    <Controlled
      axes={SIZE_AXES}
      initial={{ length: { min: 5, max: 10 }, width: { min: 3, max: 7 } }}
    />
  ),
};
```

- [ ] **Step 3: Create COMPONENT.md**

Create `packages/components/src/components/molecules/range-filter/range-filter.COMPONENT.md`:

```markdown
---
name: RangeFilter
slug: range-filter
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# RangeFilter

One or more numeric range axes, each with a two-thumb slider, commit-on-blur numeric inputs, and an optional distribution histogram behind the slider.

Value is always `Record<string, { min; max }>` keyed by axis id, or `undefined`. Axes at their full range are omitted from the value; emptying all axes collapses the value to `undefined`.

Single-axis use: pass one axis with no `label`. The heading is skipped and `Min` / `Max` input labels appear for clarity.

Multi-axis use: pass multiple axes each with a `label`. Per-axis heading replaces the Min/Max input labels; a dash separates the two inputs.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `Record<string, {min;max}> \| undefined` | — | Engaged axes keyed by id |
| `onChange` | `(value) => void` | — | Called when any axis commits |
| `axes` | `RangeAxis[]` | — | Axis definitions |

### RangeAxis

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Axis key (becomes a key in the filter value) |
| `label` | `string \| undefined` | Per-axis heading. Omit for single-axis to skip. |
| `min` / `max` | `number` | Axis bounds |
| `step` | `number` | Slider step (default 1) |
| `unit` | `string \| undefined` | Currency symbols prefix; others suffix |
| `histogram` | `RangeHistogram \| undefined` | Distribution bars behind the slider |

## Quality checklist

- [x] Accessibility: labelled inputs, keyboard-operable slider
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [x] Tokens only: no hardcoded visual values
```

- [ ] **Step 4: Typecheck**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/components/molecules/range-filter/
git commit -m "$(cat <<'EOF'
feat(components): add RangeFilter molecule (merged single + multi axis)

Merges the old RangeSliderFilter and MultiAxisRangeFilter behind an
axes array. Value is always Record-keyed by axis id. Single-axis use
omits the axis label to skip the heading and show Min/Max input labels;
multi-axis use preserves the per-axis heading + dash layout.

Old preset files remain until Task 14.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: AsyncComboboxFilter molecule

**Files:**
- Create: `packages/components/src/components/molecules/async-combobox-filter/async-combobox-filter.tsx`
- Create: `packages/components/src/components/molecules/async-combobox-filter/async-combobox-filter.stories.tsx`
- Create: `packages/components/src/components/molecules/async-combobox-filter/async-combobox-filter.COMPONENT.md`

Relocate only; API unchanged.

- [ ] **Step 1: Create the component**

Copy the contents of `packages/components/src/components/templates/plp/filters/presets/async-combobox.tsx` into the new location, updating import paths. The file is ~190 lines; the only changes are import paths (`../../../../molecules/…` → `../…`). Preserve all logic: `useCallback` for `runSearch`, lazy load on first open, debounced query effect, `handleValueChange` with pool lookup, `mergeWithSelected`, chip rendering, loading/empty states.

- [ ] **Step 2: Create the story**

Create `packages/components/src/components/molecules/async-combobox-filter/async-combobox-filter.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  AsyncComboboxFilter,
  type AsyncComboboxOption,
  type AsyncComboboxValue,
} from "./async-combobox-filter";
import {
  MOCK_SUPPLIERS,
  mockSupplierSearch,
} from "../../templates/plp/mocks/common";

const meta: Meta<typeof AsyncComboboxFilter> = {
  title: "Filtering/AsyncComboboxFilter",
  component: AsyncComboboxFilter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AsyncComboboxFilter>;

function Controlled({ initial }: { initial?: AsyncComboboxValue }) {
  const [value, setValue] = useState<AsyncComboboxValue>(initial);
  return (
    <div className="w-80">
      <AsyncComboboxFilter
        value={value}
        onChange={setValue}
        searchFn={mockSupplierSearch}
        searchPlaceholder="Search suppliers..."
      />
    </div>
  );
}

export const Default: Story = { render: () => <Controlled /> };

export const WithSelection: Story = {
  render: () => {
    const preselected: AsyncComboboxOption[] = MOCK_SUPPLIERS.filter((s) =>
      ["sup-acme", "sup-globex"].includes(s.value)
    );
    return <Controlled initial={preselected} />;
  },
};
```

- [ ] **Step 3: Create COMPONENT.md**

Copy `packages/components/src/components/templates/plp/filters/presets/async-combobox.COMPONENT.md` to the new location. Update the frontmatter `lastUpdated: 2026-04-21` and `slug: async-combobox-filter`. Content stays the same.

- [ ] **Step 4: Typecheck**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/components/molecules/async-combobox-filter/
git commit -m "$(cat <<'EOF'
feat(components): add AsyncComboboxFilter molecule

Relocated from templates/plp/filters/presets/async-combobox.tsx; API
unchanged. Old file remains until Task 14.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: FilterToolbar organism (merged with sticky)

**Files:**
- Create: `packages/components/src/components/organisms/filter-toolbar/filter-toolbar.tsx`
- Create: `packages/components/src/components/organisms/filter-toolbar/filter-toolbar.stories.tsx`
- Create: `packages/components/src/components/organisms/filter-toolbar/filter-toolbar.COMPONENT.md`

Merges `PlpToolbar` + `PlpStickyFilterBar`. Internal `IntersectionObserver`. Right-side `actions` slot. Optional search and sort.

- [ ] **Step 1: Create the component**

Create `packages/components/src/components/organisms/filter-toolbar/filter-toolbar.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../../atoms/button/button";
import { Input } from "../../atoms/input/input";
import { Typography } from "../../atoms/typography/typography";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../molecules/select/select";
import { AllFiltersButton } from "../../molecules/all-filters-button/all-filters-button";

export interface FilterToolbarSortOption {
  value: string;
  label: string;
}

export interface FilterToolbarProps {
  /** Pre-composed filter buttons for the main row. */
  filters?: ReactNode[];
  /**
   * Pre-composed filter buttons for the sticky chrome. Typically a subset
   * of `filters` — engaged filters only, no empty pinned ones. Consumer
   * decides membership.
   */
  stickyFilters?: ReactNode[];
  activeFilterCount: number;
  hasActiveFilters: boolean;
  onOpenDrawer: () => void;
  onClearAll: () => void;

  // Optional search
  onSearchSubmit?: (query: string) => void;
  searchPlaceholder?: string;

  // Optional sort
  sortOptions?: FilterToolbarSortOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;

  /** Right-side extras (view toggle, custom controls). */
  actions?: ReactNode;

  /**
   * Offset (in px) from the top of the viewport at which the sticky
   * chrome appears. Defaults to 72 (the AppShellHeader height). Used
   * both as the IntersectionObserver's rootMargin and as the fixed
   * `top` value of the sticky chrome.
   */
  stickyTopOffset?: number;
  /** When true, disables sticky behaviour entirely. */
  disableSticky?: boolean;
}

/**
 * Filter toolbar — search, All Filters button, inline filter slot,
 * sort, right-side actions slot, and an internal sticky chrome that
 * appears when the main toolbar scrolls out of view.
 *
 * The toolbar does not reason about filter shape or semantics. It flows
 * consumer-composed `filters` and `stickyFilters` into its chrome and
 * emits events through `onOpenDrawer`, `onClearAll`, and the search /
 * sort callbacks. Sticky visibility is internal state driven by an
 * IntersectionObserver watching the main toolbar element.
 */
export function FilterToolbar({
  filters,
  stickyFilters,
  activeFilterCount,
  hasActiveFilters,
  onOpenDrawer,
  onClearAll,
  onSearchSubmit,
  searchPlaceholder,
  sortOptions,
  sortValue,
  onSortChange,
  actions,
  stickyTopOffset = 72,
  disableSticky = false,
}: FilterToolbarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const mainRef = useRef<HTMLDivElement>(null);
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    if (disableSticky) return;
    const el = mainRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolledPast(!entry.isIntersecting),
      {
        rootMargin: `-${stickyTopOffset}px 0px 0px 0px`,
        threshold: 0,
      }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [disableSticky, stickyTopOffset]);

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  }

  const stickyVisible = !disableSticky && scrolledPast && hasActiveFilters;
  const showSort = !!sortOptions && sortValue !== undefined && !!onSortChange;

  return (
    <>
      <div ref={mainRef} className="space-y-3" data-slot="filter-toolbar">
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

        <div className="flex items-start gap-2">
          <div className="flex flex-1 flex-wrap items-start gap-2">
            <AllFiltersButton
              activeFilterCount={activeFilterCount}
              onClick={onOpenDrawer}
            />

            <div className="hidden flex-wrap items-start gap-2 sm:contents">
              {filters}

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  onClick={onClearAll}
                  className="shrink-0 text-muted-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>

          {showSort && (
            <div className="shrink-0">
              <Select value={sortValue} onValueChange={onSortChange}>
                <SelectTrigger className="w-auto min-w-35">
                  <Typography
                    as="span"
                    variant="body-2"
                    className="mr-1 text-muted-foreground"
                  >
                    Sort by
                  </Typography>
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
          )}

          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>

      <StickyChrome
        visible={stickyVisible}
        stickyTopOffset={stickyTopOffset}
        activeFilterCount={activeFilterCount}
        stickyFilters={stickyFilters}
        onOpenDrawer={onOpenDrawer}
      />
    </>
  );
}

function StickyChrome({
  visible,
  stickyTopOffset,
  activeFilterCount,
  stickyFilters,
  onOpenDrawer,
}: {
  visible: boolean;
  stickyTopOffset: number;
  activeFilterCount: number;
  stickyFilters?: ReactNode[];
  onOpenDrawer: () => void;
}) {
  return (
    <div
      data-slot="filter-toolbar-sticky"
      data-state={visible ? "visible" : "hidden"}
      aria-hidden={!visible}
      style={{ top: stickyTopOffset }}
      className={cn(
        "fixed inset-x-0 z-30 border-b border-border bg-background shadow-sm",
        "transition-[opacity,transform] duration-200 ease-out",
        "data-[state=hidden]:pointer-events-none data-[state=hidden]:-translate-y-2 data-[state=hidden]:opacity-0"
      )}
    >
      <div className="mx-auto w-full max-w-384 px-6 py-3 group-data-[full=true]/app-shell:max-w-none">
        <div className="relative">
          <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="w-4 shrink-0" aria-hidden="true" />
            <AllFiltersButton
              activeFilterCount={activeFilterCount}
              onClick={onOpenDrawer}
            />
            {stickyFilters}
            <div className="w-4 shrink-0" aria-hidden="true" />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-linear-to-r from-background to-transparent"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-linear-to-l from-background to-transparent"
          />
        </div>
      </div>
    </div>
  );
}
```

**Visual invariant to verify:** when ported, the main toolbar layout (search row + filter wrap row + sort top-right + sticky chrome appearing under the AppShellHeader) must match today's `PlpToolbar` + `PlpStickyFilterBar` visual output exactly.

- [ ] **Step 2: Create the story**

Create `packages/components/src/components/organisms/filter-toolbar/filter-toolbar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState } from "react";
import { FilterToolbar } from "./filter-toolbar";
import { FilterButton } from "../../atoms/filter-button/filter-button";
import { ChipSelectFilter } from "../../molecules/chip-select-filter/chip-select-filter";

const meta: Meta<typeof FilterToolbar> = {
  title: "Filtering/FilterToolbar",
  component: FilterToolbar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof FilterToolbar>;

const SORT_OPTIONS = [
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "newest", label: "Newest" },
];

function Controlled({ hasActiveFilters = false }: { hasActiveFilters?: boolean }) {
  const [sort, setSort] = useState("price-asc");
  const [colors, setColors] = useState<string[] | undefined>(
    hasActiveFilters ? ["blue", "green"] : undefined
  );

  const colorButton = (
    <FilterButton<string[]>
      key="color"
      label="Color"
      chipSummary={colors ? colors.join(", ") : undefined}
      isActive={!!colors}
      initialValue={colors}
      onApply={setColors}
      onClear={() => setColors(undefined)}
      onDismiss={() => setColors(undefined)}
    >
      {(draft, setDraft) => (
        <ChipSelectFilter
          mode="multiple"
          value={draft}
          onChange={setDraft}
          options={[
            { value: "blue", label: "Blue" },
            { value: "green", label: "Green" },
            { value: "red", label: "Red" },
          ]}
        />
      )}
    </FilterButton>
  );

  const activeCount = colors ? 1 : 0;

  return (
    <div className="p-4">
      <FilterToolbar
        filters={[colorButton]}
        stickyFilters={colors ? [colorButton] : []}
        activeFilterCount={activeCount}
        hasActiveFilters={activeCount > 0}
        onOpenDrawer={fn()}
        onClearAll={() => setColors(undefined)}
        onSearchSubmit={fn()}
        searchPlaceholder="Search..."
        sortOptions={SORT_OPTIONS}
        sortValue={sort}
        onSortChange={setSort}
      />
    </div>
  );
}

export const Default: Story = { render: () => <Controlled /> };
export const WithActiveFilters: Story = {
  render: () => <Controlled hasActiveFilters />,
};
```

- [ ] **Step 3: Create COMPONENT.md**

Create `packages/components/src/components/organisms/filter-toolbar/filter-toolbar.COMPONENT.md`:

```markdown
---
name: FilterToolbar
slug: filter-toolbar
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# FilterToolbar

Top-of-page chrome for a filterable/sortable/searchable listing view. Renders:

- Optional search input (hidden on mobile)
- "All filters" button with badge
- Filter row that wraps; consumer-composed via `filters` prop
- "Clear all" button when any filter is engaged
- Optional sort dropdown (top-right)
- Right-side actions slot (e.g. view toggle)
- Internal sticky chrome pinned below the AppShellHeader when scrolled past, showing only engaged filters

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filters` | `ReactNode[]` | — | Pre-composed filter buttons for the main row |
| `stickyFilters` | `ReactNode[]` | — | Filter buttons for the sticky chrome (engaged subset) |
| `activeFilterCount` | `number` | — | Drives the "All filters" badge |
| `hasActiveFilters` | `boolean` | — | Gates Clear all + sticky visibility |
| `onOpenDrawer` | `() => void` | — | Opens the filter drawer |
| `onClearAll` | `() => void` | — | Clears all filters |
| `onSearchSubmit` | `(query: string) => void` | — | Enable search; fires on Enter |
| `searchPlaceholder` | `string` | `"Search..."` | Search input placeholder |
| `sortOptions` | `FilterToolbarSortOption[]` | — | Enable sort |
| `sortValue` | `string` | — | Selected sort value (controlled) |
| `onSortChange` | `(value: string) => void` | — | Sort setter |
| `actions` | `ReactNode` | — | Right-side extras (e.g. ToggleGroup) |
| `stickyTopOffset` | `number` | `72` | Pixel offset for the sticky chrome (AppShellHeader height) |
| `disableSticky` | `boolean` | `false` | Disable sticky behaviour entirely |

## Behaviour

IntersectionObserver watches the main toolbar element with `rootMargin: "-${stickyTopOffset}px 0px 0px 0px"`. When the element leaves the adjusted viewport and `hasActiveFilters` is true, the sticky chrome fades in.

## Quality checklist

- [x] Accessibility: keyboard navigable, semantic search input, aria-hidden on hidden sticky
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [x] Responsive: mobile condenses to All Filters + Sort
- [x] Tokens only: no hardcoded visual values
```

- [ ] **Step 4: Typecheck**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/components/organisms/filter-toolbar/
git commit -m "$(cat <<'EOF'
feat(components): add FilterToolbar organism with internal sticky

Merges the old PlpToolbar and PlpStickyFilterBar into a single organism.
Internal IntersectionObserver drives sticky visibility; consumer just
renders <FilterToolbar /> once. Optional search, optional sort, right-
side actions slot for extras like the PLP view toggle.

Old PLP toolbar + sticky files remain until Task 14.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Rewrite FilterButton atom + delete PlpQuickFilter

**Files:**
- Modify: `packages/components/src/components/atoms/filter-button/filter-button.tsx` (rewrite signature to absorb draft lifecycle)
- Modify: `packages/components/src/components/atoms/filter-button/filter-button.stories.tsx` (update Storybook title + demo the new API)
- Modify: `packages/components/src/components/atoms/filter-button/filter-button.COMPONENT.md` (update API docs)
- Delete: `packages/components/src/components/templates/plp/toolbar/plp-quick-filter.tsx`
- Modify: `packages/components/src/components/templates/plp/plp-template.stories.tsx` (rename `PlpQuickFilter` → `FilterButton`, update import)

`PlpQuickFilter` is already just a thin wrapper around `FilterButton` that manages draft state. This task absorbs that draft management into `FilterButton` itself, deletes `PlpQuickFilter`, and updates consumers to call `FilterButton` directly.

- [ ] **Step 1: Read current FilterButton**

Read `packages/components/src/components/atoms/filter-button/filter-button.tsx` in full (~200 lines). Note current props: `label`, `valueSummary`, `popoverWidth`, `onDismiss`, `onApply: () => void` (no arg), `onClear: () => void`, `open`, `onOpenChange`, `children: ReactNode`.

- [ ] **Step 2: Rewrite FilterButton to absorb draft lifecycle**

Replace the component's props interface and body. The new props are:

```tsx
export interface FilterButtonProps<V> {
  label: string;
  chipSummary?: string;
  isActive: boolean;
  initialValue: V | undefined;
  popoverWidth?: number | string;
  onApply: (value: V | undefined) => void;
  onClear: () => void;
  onDismiss?: () => void;
  children: (
    draft: V | undefined,
    setDraft: (v: V | undefined) => void
  ) => React.ReactNode;
  className?: string;
}
```

The body:

1. Adds a `useState<V | undefined>(initialValue)` for the draft.
2. On popover open (via `onOpenChange`), reseed the draft: `setDraft(initialValue)`.
3. `onApply` passes the current draft: `onApply(draft)`.
4. `onClear` resets the draft + forwards: `setDraft(undefined); onClear();`.
5. `valueSummary` (in the internal FilterButton chrome logic — the active-state split button) becomes `isActive ? chipSummary : undefined`.
6. Render `children(draft, setDraft)` instead of `children` directly.
7. Keep all existing chrome logic (active-state split button, popover footer Apply/Clear, dismiss X).

The existing file already has the popover wiring, variants, chrome, etc. — this task is rewiring the props surface and adding `useState`/seed logic. Preserve all styling, animation, and a11y behaviour.

- [ ] **Step 3: Update filter-button.stories.tsx**

Change the Storybook title from `Actions/Filter Button` to `Filtering/FilterButton`. Rewrite stories to demonstrate the new render-prop children + `initialValue` seeding. Example:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FilterButton } from "./filter-button";
import { ChipSelectFilter } from "../../molecules/chip-select-filter/chip-select-filter";

const meta: Meta<typeof FilterButton> = {
  title: "Filtering/FilterButton",
  component: FilterButton,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof FilterButton>;

function Controlled({ initial }: { initial?: string[] }) {
  const [applied, setApplied] = useState<string[] | undefined>(initial);
  return (
    <FilterButton<string[]>
      label="Color"
      chipSummary={applied ? applied.join(", ") : undefined}
      isActive={!!applied}
      initialValue={applied}
      onApply={setApplied}
      onClear={() => setApplied(undefined)}
      onDismiss={() => setApplied(undefined)}
    >
      {(draft, setDraft) => (
        <ChipSelectFilter
          mode="multiple"
          value={draft}
          onChange={setDraft}
          options={[
            { value: "blue", label: "Blue" },
            { value: "green", label: "Green" },
            { value: "red", label: "Red" },
          ]}
        />
      )}
    </FilterButton>
  );
}

export const Inactive: Story = { render: () => <Controlled /> };
export const Active: Story = {
  render: () => <Controlled initial={["blue", "green"]} />,
};
```

- [ ] **Step 4: Update filter-button.COMPONENT.md**

Rewrite to reflect the new API. Minimum content: frontmatter with `lastUpdated: 2026-04-21`, a brief description noting "generic over value type V, manages per-popover draft state", a props table for `FilterButtonProps<V>`, and the quality checklist. Keep the file format consistent with other COMPONENT.md files in the repo.

- [ ] **Step 5: Update plp-template.stories.tsx**

In `packages/components/src/components/templates/plp/plp-template.stories.tsx`:

- Find/replace: `PlpQuickFilter` → `FilterButton`
- Update the import: remove `import { PlpQuickFilter } from "./toolbar/plp-quick-filter";`, add `import { FilterButton } from "../../atoms/filter-button/filter-button";`

This is a mechanical rename; the button-builders' props structure is already identical to the new `FilterButton` API (both take `label`, `chipSummary`, `isActive`, `initialValue`, `onApply`, `onClear`, `onDismiss`, render-prop children). TypeScript will validate.

- [ ] **Step 6: Delete PlpQuickFilter**

```bash
rm packages/components/src/components/templates/plp/toolbar/plp-quick-filter.tsx
```

- [ ] **Step 7: Typecheck**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: clean. If errors surface in `plp-template.stories.tsx`, cross-check that the `FilterButton` generic type parameters (e.g. `<string[]>`, `<{min: number; max: number}>`) carry through correctly.

- [ ] **Step 8: Commit**

```bash
git add packages/components/src/components/atoms/filter-button/ packages/components/src/components/templates/plp/toolbar/plp-quick-filter.tsx packages/components/src/components/templates/plp/plp-template.stories.tsx
git commit -m "$(cat <<'EOF'
refactor(filter-button): absorb QuickFilter's draft lifecycle

FilterButton becomes generic over V with internal draft state (seed on
open, commit on Apply, reset on Clear) and a render-prop children API.
PlpQuickFilter is deleted — it's now a pure pass-through. PLP story
file renamed PlpQuickFilter → FilterButton in place; full assembly
rewrite happens in Task 13.

Storybook title moves to Filtering/FilterButton.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: PlpHeading kit piece

**Files:**
- Create: `packages/components/src/components/templates/plp/plp-heading.tsx`
- Create: `packages/components/src/components/templates/plp/plp-heading.stories.tsx`
- Create: `packages/components/src/components/templates/plp/plp-heading.COMPONENT.md`

- [ ] **Step 1: Create the component**

Create `packages/components/src/components/templates/plp/plp-heading.tsx`:

```tsx
import { Fragment } from "react";
import { Typography } from "../../atoms/typography/typography";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../molecules/breadcrumb/breadcrumb";
import type { BreadcrumbSegment } from "./plp-types";

export interface PlpHeadingProps {
  breadcrumbs: BreadcrumbSegment[];
  title: string;
  resultsCount: number;
}

/**
 * PLP heading — breadcrumbs, category title, and results count.
 *
 * Breadcrumbs support arbitrary nesting; the last segment renders as the
 * current page (not a link). Results count announces via
 * `aria-live="polite"` when it changes.
 */
export function PlpHeading({ breadcrumbs, title, resultsCount }: PlpHeadingProps) {
  const formattedCount = new Intl.NumberFormat("en-US").format(resultsCount);

  return (
    <div data-slot="plp-heading">
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

      <Typography as="h1" variant="h3" className="mt-2">
        {title}
      </Typography>

      <Typography
        variant="body-2"
        className="mt-1 text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        {formattedCount} results
      </Typography>
    </div>
  );
}
```

- [ ] **Step 2: Create the story**

Create `packages/components/src/components/templates/plp/plp-heading.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { PlpHeading } from "./plp-heading";

const meta: Meta<typeof PlpHeading> = {
  title: "Templates/PLP/Heading",
  component: PlpHeading,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PlpHeading>;

export const Default: Story = {
  args: {
    breadcrumbs: [{ label: "Gemstones", href: "#" }, { label: "Sapphire" }],
    title: "Sapphire",
    resultsCount: 1234567,
  },
};

export const NoBreadcrumbs: Story = {
  args: {
    breadcrumbs: [],
    title: "Search results",
    resultsCount: 42,
  },
};

export const DeepBreadcrumbs: Story = {
  args: {
    breadcrumbs: [
      { label: "Jewelry", href: "#" },
      { label: "Rings", href: "#" },
      { label: "Wedding", href: "#" },
      { label: "Three-stone" },
    ],
    title: "Three-stone wedding rings",
    resultsCount: 289,
  },
};
```

- [ ] **Step 3: Create COMPONENT.md**

Create `packages/components/src/components/templates/plp/plp-heading.COMPONENT.md`:

```markdown
---
name: PlpHeading
slug: plp-heading
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# PlpHeading

Heading region for a PLP page — breadcrumbs, category title (H1), and results count. Results count uses `aria-live="polite"` so screen readers announce when filters or pagination change it.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `breadcrumbs` | `BreadcrumbSegment[]` | — | Breadcrumb segments. The last is rendered as the current page. |
| `title` | `string` | — | Category title (H1) |
| `resultsCount` | `number` | — | Total result count |

## Quality checklist

- [x] Accessibility: semantic H1, aria-live on count, breadcrumb semantics
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [x] Tokens only: no hardcoded visual values
```

- [ ] **Step 4: Typecheck**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/components/templates/plp/plp-heading.tsx packages/components/src/components/templates/plp/plp-heading.stories.tsx packages/components/src/components/templates/plp/plp-heading.COMPONENT.md
git commit -m "$(cat <<'EOF'
feat(plp): add PlpHeading kit piece

Extracts the breadcrumbs + title + results count region from the old
PlpTemplate into its own component. Preserves the aria-live polite
announcement on the results count.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: PlpGridContainer kit piece

**Files:**
- Create: `packages/components/src/components/templates/plp/plp-grid-container.tsx`
- Create: `packages/components/src/components/templates/plp/plp-grid-container.stories.tsx`
- Create: `packages/components/src/components/templates/plp/plp-grid-container.COMPONENT.md`

Includes skeleton rendering for `loading` state, tuned to PLP grid card proportions (the skeleton shape is inlined from the old `GridSkeletonCard`).

- [ ] **Step 1: Create the component**

Create `packages/components/src/components/templates/plp/plp-grid-container.tsx`:

```tsx
import type { ReactNode } from "react";
import { Skeleton } from "../../atoms/skeleton/skeleton";

export interface PlpGridContainerProps {
  children?: ReactNode;
  /** When true, replaces children with `skeletonCount` skeleton cards. */
  loading?: boolean;
  /** Number of skeleton cards to render when loading. Defaults to 20. */
  skeletonCount?: number;
}

/**
 * Responsive 2/3/4-column grid wrapper for PLP cards.
 *
 * When `loading` is true, renders a grid of skeleton cards tuned to
 * the default `PlpGridItem` card proportions (aspect-square image
 * placeholder, name + caption lines, badges, delivery / returns /
 * price lines). When false, renders `children`.
 */
export function PlpGridContainer({
  children,
  loading = false,
  skeletonCount = 20,
}: PlpGridContainerProps) {
  if (loading) {
    return (
      <div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6"
        data-slot="plp-grid"
        data-loading
      >
        {Array.from({ length: skeletonCount }, (_, i) => (
          <GridSkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6"
      data-slot="plp-grid"
    >
      {children}
    </div>
  );
}

function GridSkeletonCard() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="aspect-square w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-1">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  );
}
```

**Invariant:** skeleton proportions must match the old `GridSkeletonCard` in `plp-template.tsx` exactly. Code copied verbatim.

- [ ] **Step 2: Create the story**

Create `packages/components/src/components/templates/plp/plp-grid-container.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { PlpGridContainer } from "./plp-grid-container";

const meta: Meta<typeof PlpGridContainer> = {
  title: "Templates/PLP/GridContainer",
  component: PlpGridContainer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof PlpGridContainer>;

export const Loading: Story = {
  render: () => (
    <div className="p-6">
      <PlpGridContainer loading skeletonCount={8} />
    </div>
  ),
};

export const WithChildren: Story = {
  render: () => (
    <div className="p-6">
      <PlpGridContainer>
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground"
          >
            Card {i + 1}
          </div>
        ))}
      </PlpGridContainer>
    </div>
  ),
};
```

- [ ] **Step 3: Create COMPONENT.md**

Create `packages/components/src/components/templates/plp/plp-grid-container.COMPONENT.md`:

```markdown
---
name: PlpGridContainer
slug: plp-grid-container
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# PlpGridContainer

Responsive 2/3/4-column grid wrapper for PLP cards.

When `loading` is true, renders a grid of skeleton cards tuned to the default `PlpGridItem` card proportions (aspect-square image placeholder, name + caption lines, badges, delivery/returns/price lines). When false, renders `children`.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Grid cards (when not loading) |
| `loading` | `boolean` | `false` | Switch to skeleton mode |
| `skeletonCount` | `number` | `20` | Skeleton card count |

## Quality checklist

- [x] Responsive: 2 cols mobile, 3 cols tablet, 4 cols desktop
- [x] Tokens only: no hardcoded visual values
```

- [ ] **Step 4: Typecheck**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/components/templates/plp/plp-grid-container.tsx packages/components/src/components/templates/plp/plp-grid-container.stories.tsx packages/components/src/components/templates/plp/plp-grid-container.COMPONENT.md
git commit -m "$(cat <<'EOF'
feat(plp): add PlpGridContainer kit piece

Extracts the responsive 2/3/4-col grid wrapper and the skeleton-loading
state from the old PlpTemplate. Skeleton proportions preserved verbatim.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: PlpListContainer kit piece

**Files:**
- Create: `packages/components/src/components/templates/plp/plp-list-container.tsx`
- Create: `packages/components/src/components/templates/plp/plp-list-container.stories.tsx`
- Create: `packages/components/src/components/templates/plp/plp-list-container.COMPONENT.md`

- [ ] **Step 1: Create the component**

Create `packages/components/src/components/templates/plp/plp-list-container.tsx`:

```tsx
import type { ReactNode } from "react";
import { Skeleton } from "../../atoms/skeleton/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../organisms/table/table";

export interface PlpListContainerProps {
  header?: ReactNode;
  children?: ReactNode;
  /** When true, replaces children with `skeletonCount` skeleton rows. */
  loading?: boolean;
  /** Skeleton row count when loading. Defaults to 20. */
  skeletonCount?: number;
}

/**
 * List-view shell for a PLP. Scroll container, sticky header
 * positioning, and `<thead>`/`<tbody>` scaffolding. Consumer provides
 * the header row and the body rows as pre-rendered nodes.
 *
 * When `loading` is true, renders `skeletonCount` generic single-cell
 * skeleton rows that span the full width regardless of the consumer's
 * column count — the visual transition into real rows is brief.
 */
export function PlpListContainer({
  header,
  children,
  loading = false,
  skeletonCount = 20,
}: PlpListContainerProps) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border"
      data-slot="plp-list"
      data-loading={loading ? "" : undefined}
    >
      <Table>
        {header && (
          <TableHeader className="sticky top-0 z-10 bg-background">
            {header}
          </TableHeader>
        )}
        <TableBody>
          {loading
            ? Array.from({ length: skeletonCount }, (_, i) => (
                <ListSkeletonRow key={i} />
              ))
            : children}
        </TableBody>
      </Table>
    </div>
  );
}

function ListSkeletonRow() {
  return (
    <TableRow>
      <TableCell colSpan={999} className="py-4">
        <Skeleton className="h-6 w-full" />
      </TableCell>
    </TableRow>
  );
}
```

**Invariant:** skeleton row spans full width (`colSpan={999}`) matching the old `ListSkeletonRow` exactly.

- [ ] **Step 2: Create the story**

Create `packages/components/src/components/templates/plp/plp-list-container.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { PlpListContainer } from "./plp-list-container";
import {
  PlpListHeaderCell,
  PlpListHeaderRow,
  PlpListCell,
  PlpListRow,
  PlpListRowName,
} from "./list/plp-list-row";

const meta: Meta<typeof PlpListContainer> = {
  title: "Templates/PLP/ListContainer",
  component: PlpListContainer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof PlpListContainer>;

const header = (
  <PlpListHeaderRow>
    <PlpListHeaderCell>Name</PlpListHeaderCell>
    <PlpListHeaderCell>Description</PlpListHeaderCell>
  </PlpListHeaderRow>
);

export const Loading: Story = {
  render: () => (
    <div className="p-6">
      <PlpListContainer header={header} loading skeletonCount={6} />
    </div>
  ),
};

export const WithRows: Story = {
  render: () => (
    <div className="p-6">
      <PlpListContainer header={header}>
        {Array.from({ length: 6 }, (_, i) => (
          <PlpListRow key={i}>
            <PlpListCell>
              <PlpListRowName>Item {i + 1}</PlpListRowName>
            </PlpListCell>
            <PlpListCell>Description of item {i + 1}</PlpListCell>
          </PlpListRow>
        ))}
      </PlpListContainer>
    </div>
  ),
};
```

- [ ] **Step 3: Create COMPONENT.md**

Create `packages/components/src/components/templates/plp/plp-list-container.COMPONENT.md`:

```markdown
---
name: PlpListContainer
slug: plp-list-container
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# PlpListContainer

Table shell for PLP list view. Provides the scroll container, sticky header positioning, and `<thead>` / `<tbody>` scaffolding. Consumer provides the header row and body rows as pre-rendered nodes.

When `loading` is true, renders `skeletonCount` generic single-cell skeleton rows that span the full width regardless of column count.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `ReactNode` | — | A single `PlpListHeaderRow` with `PlpListHeaderCell` children |
| `children` | `ReactNode` | — | List rows (when not loading) |
| `loading` | `boolean` | `false` | Switch to skeleton mode |
| `skeletonCount` | `number` | `20` | Skeleton row count |

## Quality checklist

- [x] Accessibility: table semantics, sticky header in the viewport
- [x] Tokens only: no hardcoded visual values
```

- [ ] **Step 4: Typecheck**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/components/templates/plp/plp-list-container.tsx packages/components/src/components/templates/plp/plp-list-container.stories.tsx packages/components/src/components/templates/plp/plp-list-container.COMPONENT.md
git commit -m "$(cat <<'EOF'
feat(plp): add PlpListContainer kit piece

Extracts the list-view table shell + skeleton-loading state from the
old PlpTemplate. Skeleton proportions preserved verbatim.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 13: Rewrite plp-template.stories.tsx as assembly reference

**Files:**
- Modify: `packages/components/src/components/templates/plp/plp-template.stories.tsx` (major rewrite; will be renamed to `plp.stories.tsx` in Task 14)
- Modify: `packages/components/src/components/templates/plp/mocks/gemstone.tsx` (update imports from old preset paths to new molecule paths; type references)
- Modify: `packages/components/src/components/templates/plp/mocks/diamond.tsx` (same)

**The hardest task in the plan.** Rewrites the 11 existing stories (`GemstoneCategory`, `DiamondsCategory`, `WithActiveFilters`, `JewelryCategory`, `WithCustomFilter`, `Loading`, `EmptyFiltered`, `EmptyNoItems`, `Error`, `DiamondListView`, `GemstoneListView`) to assemble from the new kit (FilterToolbar, FilterDrawer, FilterSection, ChipSelectFilter, RangeFilter, AsyncComboboxFilter, FilterButton, PlpHeading, PlpGridContainer, PlpListContainer, Pagination+Select composition) via a local `useFilterController` + per-category button-builders + an `AssemblyShell` helper.

**Invariant:** visual and behavioural output of every story unchanged.

- [ ] **Step 1: Update the mock files' imports and types**

In `packages/components/src/components/templates/plp/mocks/gemstone.tsx`, update imports:

```tsx
// Remove:
// import type { AsyncComboboxOption } from "../filters/presets/async-combobox";
// import type { MultiSelectChipOption } from "../filters/presets/multi-select-chips";
// import type { SingleSelectChipOption } from "../filters/presets/single-select-chips";
// import type { SingleSelectDropdownOption } from "../filters/presets/single-select-dropdown";
// import type { MultiAxisRangeAxis } from "../filters/presets/multi-axis-range";
// import type { RangeSliderHistogram } from "../filters/presets/range-slider";

// Add:
import type { AsyncComboboxOption } from "../../../molecules/async-combobox-filter/async-combobox-filter";
import type { ChipSelectOption } from "../../../molecules/chip-select-filter/chip-select-filter";
import type { RangeAxis, RangeHistogram } from "../../../molecules/range-filter/range-filter";
```

Update the type aliases used by the mock exports:

- `GEMSTONE_COLOR_OPTIONS: MultiSelectChipOption[]` → `GEMSTONE_COLOR_OPTIONS: ChipSelectOption[]`
- `GEMSTONE_CLARITY_OPTIONS: MultiSelectChipOption[]` → `GEMSTONE_CLARITY_OPTIONS: ChipSelectOption[]`
- `GEMSTONE_TREATMENT_OPTIONS: SingleSelectChipOption[]` → `GEMSTONE_TREATMENT_OPTIONS: ChipSelectOption[]`
- Remove the `GEMSTONE_LOCATION_OPTIONS: SingleSelectDropdownOption[]` type annotation (the array shape is compatible as an untyped `{ value, label }[]` — or re-type as `ChipSelectOption[]` since the shape is compatible without adornment/renderOption).

Rewrite `GEMSTONE_PRICE_CONFIG` and `GEMSTONE_CARAT_CONFIG` to match `RangeAxis` / `RangeHistogram`:

```tsx
export const GEMSTONE_PRICE_CONFIG: RangeAxis = {
  id: "price",
  min: 0,
  max: 10000,
  step: 10,
  unit: "$",
  histogram: buildMockHistogram(0, 10000, 40, 2500),
};

export const GEMSTONE_CARAT_CONFIG: RangeAxis = {
  id: "carat",
  min: 0,
  max: 10,
  step: 0.1,
  unit: "ct",
  histogram: buildMockHistogram(0, 10, 40, 2),
};
```

Rewrite `GEMSTONE_SIZE_AXES` to use `RangeAxis[]`:

```tsx
export const GEMSTONE_SIZE_AXES: RangeAxis[] = [
  { id: "length", label: "Length", min: 0, max: 20, step: 0.1, unit: "mm" },
  { id: "width", label: "Width", min: 0, max: 20, step: 0.1, unit: "mm" },
  { id: "depth", label: "Depth", min: 0, max: 10, step: 0.1, unit: "mm" },
];
```

Update the `GemstoneFilterState` interface: `price` and `carat` values become keyed records:

```tsx
export interface GemstoneFilterState {
  "nivoda-curated"?: true;
  color?: string[];
  clarity?: string[];
  treatment?: string;
  location?: string;
  price?: Record<string, { min: number; max: number }>;
  carat?: Record<string, { min: number; max: number }>;
  size?: Record<string, { min: number; max: number }>;
  supplier?: AsyncComboboxOption[];
}
```

(This is because `RangeFilter` now always emits `Record<string, …>`, even for single-axis use. The consumer types the value accordingly.)

Apply parallel changes to `diamond.tsx`: update imports, re-type option arrays as `ChipSelectOption[]`, convert `DIAMOND_PRICE_CONFIG` / `DIAMOND_CARAT_CONFIG` to `RangeAxis`, update `DiamondFilterState` shape for `price`/`carat`/`size`.

Expected tsc: will break until Step 2 completes (stories file uses old types). That's fine — we'll fix in sequence.

- [ ] **Step 2: Rewrite plp-template.stories.tsx — scaffolding**

Open `packages/components/src/components/templates/plp/plp-template.stories.tsx` and replace its contents. The file will be large (~1000 lines). The structure:

1. Imports — new molecule/organism paths, PLP kit pieces (`PlpHeading`, `PlpGridContainer`, `PlpListContainer`), `Empty` + sub-components from `../../atoms/empty/empty`, `Pagination*` from `../../molecules/pagination/pagination`, `Select*`, `ToggleGroup*`, `IconGrid`, `IconList` icons from `@tabler/icons-react`.
2. `useFilterController` hook — unchanged from the current version.
3. `usePreviewCount` hook — unchanged.
4. `useSimulatedCommitStatus` hook — unchanged.
5. Chip formatters (`formatMultiSelectChip`, `formatRangeChip`, `formatMultiAxisChip`, `labelForValue`) — **update** `formatRangeChip` signature: now takes a `Record<string, {min;max}> | undefined` (keyed) + an `axis: RangeAxis` (or similar) since value is keyed by id. Simplified form for single-axis: extract the only entry by id.

Update `formatRangeChip`:

```tsx
function formatRangeChip(
  value: Record<string, { min: number; max: number }> | undefined,
  axisId: string,
  unit?: string
): string {
  const v = value?.[axisId];
  if (!v) return "";
  return `${formatUnitValue(v.min, unit)}\u2013${formatUnitValue(v.max, unit)}`;
}
```

Keep `formatMultiAxisChip` as-is but update the axes param type to `RangeAxis[]`.

6. `useGemstoneFilterButtons(ctrl)` — rewrite each button. Replace `PlpQuickFilter` (already replaced with `FilterButton` in Task 9), `MultiSelectChipsFilter` → `ChipSelectFilter mode="multiple"`, `SingleSelectChipsFilter` → `ChipSelectFilter mode="single"`, `SingleSelectDropdownFilter` → inline `Select`, `BooleanChipFilter` → inline `<Toggle>`, `RangeSliderFilter` → `RangeFilter` with `axes={[GEMSTONE_PRICE_CONFIG]}`, `MultiAxisRangeFilter` → `RangeFilter` with `axes={GEMSTONE_SIZE_AXES}`, `AsyncComboboxFilter` stays.

Example: gemstone `price` button:

```tsx
price: (
  <FilterButton<Record<string, { min: number; max: number }>>
    key="price"
    label="Price"
    chipSummary={formatRangeChip(applied.price, "price", GEMSTONE_PRICE_CONFIG.unit)}
    isActive={!!applied.price}
    initialValue={applied.price}
    onApply={(v) => setAppliedFor("price", v)}
    onClear={() => setAppliedFor("price", undefined)}
    onDismiss={() => setAppliedFor("price", undefined)}
  >
    {(v, set) => (
      <RangeFilter value={v} onChange={set} axes={[GEMSTONE_PRICE_CONFIG]} />
    )}
  </FilterButton>
),
```

Example: gemstone `nivoda-curated` boolean, now using `Toggle`:

```tsx
"nivoda-curated": (
  <FilterButton<true>
    key="nivoda-curated"
    label="Nivoda Curated"
    chipSummary={applied["nivoda-curated"] ? "Only Nivoda Curated items" : undefined}
    isActive={applied["nivoda-curated"] === true}
    initialValue={applied["nivoda-curated"]}
    onApply={(v) => setAppliedFor("nivoda-curated", v)}
    onClear={() => setAppliedFor("nivoda-curated", undefined)}
    onDismiss={() => setAppliedFor("nivoda-curated", undefined)}
  >
    {(draft, setDraft) => (
      <div className="flex items-center gap-3">
        <Switch
          id="nivoda-curated-switch"
          checked={draft === true}
          onCheckedChange={(c) => setDraft(c ? true : undefined)}
        />
        <Label htmlFor="nivoda-curated-switch" className="cursor-pointer">
          Only Nivoda Curated items
        </Label>
      </div>
    )}
  </FilterButton>
),
```

**Visual invariant note:** for boolean filters, the inline `<Switch>` + `<Label>` must match the old `BooleanChipFilter` visual output (Switch + Label inside the popover). Verify.

Example: gemstone `location` dropdown, now inline `Select`:

```tsx
location: (
  <FilterButton<string>
    key="location"
    label="Location"
    chipSummary={
      applied.location
        ? labelForValue(GEMSTONE_LOCATION_OPTIONS, applied.location)
        : undefined
    }
    isActive={!!applied.location}
    initialValue={applied.location}
    onApply={(v) => setAppliedFor("location", v)}
    onClear={() => setAppliedFor("location", undefined)}
    onDismiss={() => setAppliedFor("location", undefined)}
  >
    {(v, setDraft) => (
      <Select value={v ?? ""} onValueChange={(val) => setDraft(val || undefined)}>
        <SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger>
        <SelectContent>
          {GEMSTONE_LOCATION_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  </FilterButton>
),
```

Apply all the parallel rewrites for the remaining buttons (color, clarity, treatment, carat, size, supplier). Use the spec's "Consumer assembly pattern" (Section 3 of the spec) as the reference for each.

7. `GemstoneDrawerBody` — update sections to use the new components:
   - `BooleanChipFilter` → inline `<Switch>` + `<Label>` (same as in the button render prop)
   - `MultiSelectChipsFilter` / `SingleSelectChipsFilter` → `ChipSelectFilter` with `mode`
   - `SingleSelectDropdownFilter` → inline `Select` composition
   - `RangeSliderFilter` → `RangeFilter` with one-element `axes`
   - `MultiAxisRangeFilter` → `RangeFilter` with `GEMSTONE_SIZE_AXES`
   - `AsyncComboboxFilter` → direct use from new import path

8. `useDiamondFilterButtons(ctrl)` + `DiamondDrawerBody` — parallel rewrite for diamond.

9. `routeFilterSlots` helper — unchanged.

10. `buildGemstoneCards`, `buildDiamondCards`, `buildGemstoneRows`, `buildDiamondRows` — unchanged.

11. New `AssemblyShell` helper:

```tsx
function AssemblyShell({
  breadcrumbs,
  title,
  resultsCount,
  banner,
  toolbarFilters,
  stickyFilters,
  activeFilterCount,
  hasActiveFilters,
  onOpenDrawer,
  onClearAll,
  onSearchSubmit,
  searchPlaceholder,
  sortOptions,
  sortValue,
  onSortChange,
  actions,
  children,
  drawer,
  pagination,
}: {
  breadcrumbs: BreadcrumbSegment[];
  title: string;
  resultsCount: number;
  banner?: ReactNode;
  toolbarFilters: ReactNode[];
  stickyFilters: ReactNode[];
  activeFilterCount: number;
  hasActiveFilters: boolean;
  onOpenDrawer: () => void;
  onClearAll: () => void;
  onSearchSubmit?: (q: string) => void;
  searchPlaceholder?: string;
  sortOptions?: FilterToolbarSortOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  actions?: ReactNode;
  children: ReactNode;
  drawer?: ReactNode;
  pagination?: ReactNode;
}) {
  return (
    <main className="space-y-4" data-slot="plp-assembly">
      <PlpHeading
        breadcrumbs={breadcrumbs}
        title={title}
        resultsCount={resultsCount}
      />
      {banner}
      <FilterToolbar
        filters={toolbarFilters}
        stickyFilters={stickyFilters}
        activeFilterCount={activeFilterCount}
        hasActiveFilters={hasActiveFilters}
        onOpenDrawer={onOpenDrawer}
        onClearAll={onClearAll}
        onSearchSubmit={onSearchSubmit}
        searchPlaceholder={searchPlaceholder}
        sortOptions={sortOptions}
        sortValue={sortValue}
        onSortChange={onSortChange}
        actions={actions}
      />
      {children}
      {pagination}
      {drawer}
    </main>
  );
}
```

12. `GemstoneInteractive`, `DiamondInteractive` — rewrite to assemble from the kit inside `AssemblyShell`, route status branching, compute `effectiveView`, render `PlpGridContainer` / `PlpListContainer`, render an inline pagination composition, render `FilterDrawer` as the drawer slot.

Example `GemstoneInteractive` (abbreviated — real implementation mirrors current behaviour):

```tsx
function GemstoneInteractive({
  initialFilterState = {},
  listHeader,
  listRows,
  listViewAvailable = false,
  initialViewMode = "grid",
  baselineStatus = "success",
  banner,
  ...shellProps
}: {
  breadcrumbs: BreadcrumbSegment[];
  title: string;
  resultsCount: number;
  sortOptions: FilterToolbarSortOption[];
  searchPlaceholder?: string;
  onSearchSubmit?: (q: string) => void;
  gridItems?: ReactNode[];
  listHeader?: ReactNode;
  listRows?: ReactNode[];
  listViewAvailable?: boolean;
  initialViewMode?: PlpViewMode;
  baselineStatus?: PlpStatus;
  initialFilterState?: Partial<GemstoneFilterState>;
  banner?: ReactNode;
  totalItems: number;
  emptyMessage?: string;
  onRetry?: () => void;
}) {
  const ctrl = useFilterController<GemstoneFilterState>(initialFilterState);
  const buttons = useGemstoneFilterButtons(ctrl);
  const { toolbarFilters, stickyFilters } = routeFilterSlots(
    buttons,
    GEMSTONE_PINNED_IDS,
    ctrl.activeIds
  );
  const preview = usePreviewCount(ctrl.draft);
  const isTabletUp = useIsTabletUp();

  const [sort, setSort] = useState("price-asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [view, setView] = useState<PlpViewMode>(initialViewMode);

  const status = useSimulatedCommitStatus(ctrl.applied, baselineStatus);
  const effectiveView: PlpViewMode =
    listViewAvailable && isTabletUp && view === "list" ? "list" : "grid";

  return (
    <AssemblyShell
      breadcrumbs={shellProps.breadcrumbs}
      title={shellProps.title}
      resultsCount={shellProps.resultsCount}
      banner={banner}
      toolbarFilters={toolbarFilters}
      stickyFilters={stickyFilters}
      activeFilterCount={ctrl.activeCount}
      hasActiveFilters={ctrl.activeCount > 0}
      onOpenDrawer={ctrl.openDrawer}
      onClearAll={ctrl.clearAll}
      onSearchSubmit={shellProps.onSearchSubmit}
      searchPlaceholder={shellProps.searchPlaceholder}
      sortOptions={shellProps.sortOptions}
      sortValue={sort}
      onSortChange={setSort}
      actions={
        listViewAvailable ? (
          <div className="hidden lg:flex">
            <ToggleGroup type="single" value={view} onValueChange={(v) => v && setView(v as PlpViewMode)}>
              <ToggleGroupItem value="grid" aria-label="Grid view">
                <IconLayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="list" aria-label="List view">
                <IconList className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        ) : undefined
      }
      drawer={
        <FilterDrawer
          open={ctrl.drawerOpen}
          onOpenChange={ctrl.setDrawerOpen}
          onApply={ctrl.applyDraft}
          onClearDraft={ctrl.clearDraft}
          hasActiveDraft={ctrl.hasActiveDraft}
          resultsCount={preview.count}
          isCountLoading={preview.loading}
        >
          <GemstoneDrawerBody ctrl={ctrl} />
        </FilterDrawer>
      }
      pagination={
        status === "success" && shellProps.totalItems > 0 ? (
          <InlinePagination
            page={page}
            pageSize={pageSize}
            totalItems={shellProps.totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        ) : undefined
      }
    >
      {status === "empty-filtered" ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No items match your filters</EmptyTitle>
            <EmptyDescription>
              Try adjusting your filters to find what you're looking for.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={ctrl.clearAll}>
              Clear all filters
            </Button>
          </EmptyContent>
        </Empty>
      ) : status === "empty-no-items" ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No items available</EmptyTitle>
            <EmptyDescription>
              {shellProps.emptyMessage || "There are no items in this category yet."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : status === "error" ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Something went wrong</EmptyTitle>
            <EmptyDescription>Please try again.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {shellProps.onRetry && (
              <Button onClick={shellProps.onRetry}>Retry</Button>
            )}
          </EmptyContent>
        </Empty>
      ) : effectiveView === "list" ? (
        <PlpListContainer header={listHeader} loading={status === "loading"} skeletonCount={pageSize}>
          {listRows}
        </PlpListContainer>
      ) : (
        <PlpGridContainer loading={status === "loading"} skeletonCount={pageSize}>
          {shellProps.gridItems}
        </PlpGridContainer>
      )}
    </AssemblyShell>
  );
}
```

Parallel `DiamondInteractive` follows the same shape using `useDiamondFilterButtons` + `DiamondDrawerBody` + `DIAMOND_PINNED_IDS`.

13. `InlinePagination` helper:

```tsx
function InlinePagination({
  page,
  pageSize,
  totalItems,
  pageSizeOptions = [20, 50, 100],
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const totalPages = Math.ceil(totalItems / pageSize);
  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Typography as="span" variant="body-2">Results per page</Typography>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
          <SelectTrigger className="w-auto"><SelectValue /></SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((s) => (
              <SelectItem key={s} value={String(s)}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => { e.preventDefault(); if (page > 1) onPageChange(page - 1); }}
              aria-disabled={page <= 1}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          <PaginationItem>
            <Typography as="span" variant="body-2" className="px-2 text-muted-foreground">
              Page {page} of {totalPages}
            </Typography>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => { e.preventDefault(); if (page < totalPages) onPageChange(page + 1); }}
              aria-disabled={page >= totalPages}
              className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
```

14. Re-export all stories (`GemstoneCategory`, `DiamondsCategory`, `WithActiveFilters`, `JewelryCategory`, `WithCustomFilter`, `Loading`, `EmptyFiltered`, `EmptyNoItems`, `Error`, `DiamondListView`, `GemstoneListView`) — each calling `<GemstoneInteractive>` or `<DiamondInteractive>` or a similarly-structured `<JewelryInteractive>` / `<CustomRatingInteractive>` with the same args as before. Preserve the args.

15. Update the Meta `title` to stay at `Templates/PLP` (no change — the stories are still under the PLP template folder).

- [ ] **Step 3: Typecheck**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 4: Visual verification in Storybook**

Run Storybook locally:

```bash
cd packages/components && npx storybook dev -p 6006
```

Navigate to each PLP story and compare against the pre-refactor screenshots or a parallel worktree on the previous commit. Specifically verify:

- **GemstoneCategory** — heading, toolbar layout, filter row chips, Clear all placement, Sort placement, view toggle presence, grid layout
- **DiamondsCategory** — same
- **WithActiveFilters** — all pre-filled filters render with correct chip summaries
- **JewelryCategory** — inline filter config works the same
- **WithCustomFilter** — custom render-prop-children works
- **Loading** — skeleton grid / list proportions match
- **EmptyFiltered** — message + "Clear all filters" CTA matches old PlpEmpty visual (via Empty atom)
- **EmptyNoItems** — category-specific message renders
- **Error** — retry button renders
- **DiamondListView** — list table shell, sticky header, row density match
- **GemstoneListView** — same
- **Sticky bar behaviour** — scroll past the main toolbar in each category; sticky chrome should fade in at the top-18 position with engaged filters only
- **Drawer preview count** — open the drawer, edit filters, "Show X results" button updates debouncedly; Apply commits

Note any visual regressions inline. If the Empty atom doesn't reproduce PlpEmpty exactly (per Task 1's decision path), now is when it matters — adjust the Empty composition or fall back.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/components/templates/plp/plp-template.stories.tsx packages/components/src/components/templates/plp/mocks/gemstone.tsx packages/components/src/components/templates/plp/mocks/diamond.tsx
git commit -m "$(cat <<'EOF'
refactor(plp): rewrite stories as assembly reference against new kit

Rewrites all 11 PLP stories to assemble from the filter subsystem + PLP
kit pieces rather than from the unified PlpTemplate. Introduces a local
AssemblyShell helper and an InlinePagination helper to keep individual
story bodies focused on their data and status.

Mocks updated for the merged ChipSelectFilter + RangeFilter APIs:
option types become ChipSelectOption; range configs become RangeAxis;
price/carat value shapes become keyed records.

Visual invariant: all stories reproduce their pre-refactor layout,
skeleton proportions, empty/error visuals, sticky-bar behaviour, drawer
preview-count loop, and interactions.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 14: Delete obsolete files

**Files (deletions):**
- `packages/components/src/components/templates/plp/plp-template.tsx`
- `packages/components/src/components/templates/plp/states/plp-empty.tsx` *(skip if Task 1 decided to keep)*
- `packages/components/src/components/templates/plp/states/plp-error.tsx` *(skip if Task 1 decided to keep)*
- `packages/components/src/components/templates/plp/states/` folder (if both above are removed)
- `packages/components/src/components/templates/plp/toolbar/plp-all-filters-button.tsx`
- `packages/components/src/components/templates/plp/toolbar/plp-sticky-filter-bar.tsx`
- `packages/components/src/components/templates/plp/toolbar/plp-toolbar.tsx`
- `packages/components/src/components/templates/plp/toolbar/plp-view-toggle.tsx`
- `packages/components/src/components/templates/plp/toolbar/` folder (now empty)
- `packages/components/src/components/templates/plp/filters/plp-filter-drawer.tsx`
- `packages/components/src/components/templates/plp/filters/plp-filter-section.tsx` + `.stories.tsx` + `.COMPONENT.md`
- `packages/components/src/components/templates/plp/filters/presets/async-combobox.tsx` + `.stories.tsx` + `.COMPONENT.md`
- `packages/components/src/components/templates/plp/filters/presets/boolean-chip.tsx` + `.stories.tsx` + `.COMPONENT.md`
- `packages/components/src/components/templates/plp/filters/presets/multi-axis-range.tsx` + `.COMPONENT.md` (if exists)
- `packages/components/src/components/templates/plp/filters/presets/multi-select-chips.tsx` + `.stories.tsx` + `.COMPONENT.md`
- `packages/components/src/components/templates/plp/filters/presets/range-slider.tsx` + `.stories.tsx` + `.COMPONENT.md`
- `packages/components/src/components/templates/plp/filters/presets/single-select-chips.tsx` + `.stories.tsx` + `.COMPONENT.md`
- `packages/components/src/components/templates/plp/filters/presets/single-select-dropdown.tsx` + `.stories.tsx` + `.COMPONENT.md`
- `packages/components/src/components/templates/plp/filters/presets/` folder (empty)
- `packages/components/src/components/templates/plp/filters/` folder (empty)

**Rename:**
- `packages/components/src/components/templates/plp/plp-template.stories.tsx` → `packages/components/src/components/templates/plp/plp.stories.tsx`

- [ ] **Step 1: Verify nothing imports the to-be-deleted files**

```bash
cd packages/components
grep -rn "from.*templates/plp/filters" src/ --include="*.tsx" --include="*.ts" || true
grep -rn "from.*templates/plp/toolbar" src/ --include="*.tsx" --include="*.ts" || true
grep -rn "from.*templates/plp/states" src/ --include="*.tsx" --include="*.ts" || true
grep -rn "from.*plp-template\"" src/ --include="*.tsx" --include="*.ts" || true
```

Expected: no matches (other than the files being deleted themselves). If any matches appear, they must be updated before deletion.

- [ ] **Step 2: Delete files**

```bash
cd packages/components
rm src/components/templates/plp/plp-template.tsx
rm -rf src/components/templates/plp/filters
rm -rf src/components/templates/plp/toolbar
rm -rf src/components/templates/plp/states  # only if Task 1 decided to delete
```

*(If Task 1 decided to keep PlpEmpty/PlpError as thin wrappers, skip the `states/` removal.)*

- [ ] **Step 3: Rename story file**

```bash
cd packages/components
git mv src/components/templates/plp/plp-template.stories.tsx src/components/templates/plp/plp.stories.tsx
```

The story file's Meta `title` can stay as `Templates/PLP` — the rename is just to drop the `template.` infix, since there's no template component anymore.

- [ ] **Step 4: Typecheck**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 5: Storybook sanity check**

```bash
cd packages/components && npx storybook dev -p 6006
```

Navigate the sidebar. Expected:
- `Filtering/` section with AllFiltersButton, FilterButton, FilterDrawer, FilterSection, FilterToolbar, ChipSelectFilter, RangeFilter, AsyncComboboxFilter
- `Templates/PLP/` section with Heading, GridContainer, ListContainer, grid item stories, list row stories, and the assembly stories (GemstoneCategory, DiamondsCategory, etc.)
- No broken or missing stories

- [ ] **Step 6: Commit**

```bash
git add -A packages/components/src/components/templates/plp/
git commit -m "$(cat <<'EOF'
refactor(plp): delete obsolete template + old filter components

Removes PlpTemplate, PlpEmpty, PlpError (if Task 1 greenlit), the old
filters/ and toolbar/ folders (PlpFilterDrawer, PlpFilterSection,
PlpAllFiltersButton, PlpToolbar, PlpStickyFilterBar, PlpQuickFilter
was removed earlier, PlpViewToggle, all seven original presets).

Renames plp-template.stories.tsx to plp.stories.tsx — no template
component, so no reason to keep the template infix.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 15: Update index.ts barrel paths

**Files:**
- Modify: `packages/components/src/index.ts`

Most filter components are commented-out "unstable" barrel lines. Update the paths to point at the new locations, and add commented lines for the new PLP kit pieces.

- [ ] **Step 1: Read current index.ts and identify stale lines**

Read `packages/components/src/index.ts`. Identify every line referring to removed or relocated files. Note:

- The FilterButton line at `atoms/filter-button/filter-button` stays but no type changes (generic V doesn't affect export line).
- Old `templates/plp/...` paths no longer exist.

- [ ] **Step 2: Rewrite the commented-out barrel lines**

Replace stale lines. The final state should have commented lines like:

```ts
// ────────────────────── Filtering ──────────────────────
// export { FilterButton } from "./components/atoms/filter-button/filter-button";
// export type { FilterButtonProps } from "./components/atoms/filter-button/filter-button";
// export { AllFiltersButton } from "./components/molecules/all-filters-button/all-filters-button";
// export type { AllFiltersButtonProps } from "./components/molecules/all-filters-button/all-filters-button";
// export { FilterDrawer } from "./components/molecules/filter-drawer/filter-drawer";
// export type { FilterDrawerProps } from "./components/molecules/filter-drawer/filter-drawer";
// export { FilterSection } from "./components/molecules/filter-section/filter-section";
// export type { FilterSectionProps } from "./components/molecules/filter-section/filter-section";
// export { ChipSelectFilter } from "./components/molecules/chip-select-filter/chip-select-filter";
// export type { ChipSelectFilterProps, ChipSelectOption } from "./components/molecules/chip-select-filter/chip-select-filter";
// export { RangeFilter } from "./components/molecules/range-filter/range-filter";
// export type { RangeFilterProps, RangeAxis, RangeHistogram, RangeValue } from "./components/molecules/range-filter/range-filter";
// export { AsyncComboboxFilter } from "./components/molecules/async-combobox-filter/async-combobox-filter";
// export type { AsyncComboboxFilterProps, AsyncComboboxOption, AsyncComboboxValue } from "./components/molecules/async-combobox-filter/async-combobox-filter";
// export { FilterToolbar } from "./components/organisms/filter-toolbar/filter-toolbar";
// export type { FilterToolbarProps, FilterToolbarSortOption } from "./components/organisms/filter-toolbar/filter-toolbar";

// ────────────────────── Templates / PLP ──────────────────────
// export { PlpHeading } from "./components/templates/plp/plp-heading";
// export type { PlpHeadingProps } from "./components/templates/plp/plp-heading";
// export { PlpGridContainer } from "./components/templates/plp/plp-grid-container";
// export type { PlpGridContainerProps } from "./components/templates/plp/plp-grid-container";
// export { PlpListContainer } from "./components/templates/plp/plp-list-container";
// export type { PlpListContainerProps } from "./components/templates/plp/plp-list-container";
```

Remove the old commented lines pointing at `templates/plp/plp-template` and any other stale references.

(These stay commented because the package's convention is "unstable → promote later by uncommenting.")

- [ ] **Step 3: Typecheck**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add packages/components/src/index.ts
git commit -m "$(cat <<'EOF'
chore(components): update index.ts barrel paths for filter subsystem

Point commented-out unstable barrel lines at the new molecule/organism
locations; add commented lines for the new PLP kit pieces (PlpHeading,
PlpGridContainer, PlpListContainer). Remove the stale PlpTemplate
references.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 16: Rewrite templates/plp/COMPONENT.md as kit overview

**Files:**
- Modify: `packages/components/src/components/templates/plp/COMPONENT.md`

The old COMPONENT.md describes `PlpTemplate`, which is gone. Replace with a PLP kit overview and assembly guidance.

- [ ] **Step 1: Rewrite COMPONENT.md**

Create new content:

````markdown
---
name: PLP (Product Listing Page) Kit
slug: plp
version: 0.6.0
status: unstable
lastUpdated: 2026-04-21
---

# PLP Kit

The PLP kit is a set of PLP-specific building blocks plus a demonstration of how to assemble a full PLP page from them. There is no unified `PlpTemplate` component — consumers assemble the page in their own code. The kit pieces cover only what is PLP-specific; everything else (filter subsystem, pagination, empty/error states, view toggle) comes from the general library.

## Kit pieces

| Component | Role |
|-----------|------|
| [`PlpHeading`](./plp-heading.tsx) | Breadcrumbs + title (H1) + results count (aria-live) |
| [`PlpGridContainer`](./plp-grid-container.tsx) | Responsive 2/3/4-col grid + internal loading skeletons |
| [`PlpListContainer`](./plp-list-container.tsx) | Table shell + internal loading skeletons |
| [`PlpGridItem` primitives](./grid/plp-grid-item.tsx) | Card composition primitives (media, name, price, etc.) |
| [`PlpListRow` primitives](./list/plp-list-row.tsx) | Row composition primitives (cells, media, price, etc.) |

## Dependencies from the rest of the library

A full PLP page typically composes these non-PLP-specific pieces too:

- [`FilterToolbar`](../../organisms/filter-toolbar/filter-toolbar.tsx) — search + filters + sort + actions slot + sticky chrome
- [`FilterDrawer`](../../molecules/filter-drawer/filter-drawer.tsx), [`FilterSection`](../../molecules/filter-section/filter-section.tsx), and preset molecules — composed inside the drawer for the full filter list
- [`FilterButton`](../../atoms/filter-button/filter-button.tsx) — quick-filter chips in the toolbar row
- [`Empty`](../../atoms/empty/empty.tsx) + sub-components — empty/error states
- [`Pagination`](../../molecules/pagination/pagination.tsx) + [`Select`](../../molecules/select/select.tsx) — pagination control
- [`ToggleGroup`](../../atoms/toggle-group/toggle-group.tsx) — grid/list view toggle, rendered in the toolbar's `actions` slot
- [`AppShell`](../../organisms/app-shell/app-shell.tsx) — wraps everything

## Assembly reference

The canonical assembly pattern is in [`plp.stories.tsx`](./plp.stories.tsx). That file is the source of truth for:

- How to wire filter state via a consumer-owned `useFilterController` hook
- How to compose filter buttons for both the toolbar row and the drawer body
- How to route pinned vs. engaged filters between the main toolbar and the sticky chrome
- How to wire the debounced preview-count loop into the drawer
- How to branch on status for loading / empty-filtered / empty-no-items / error / content states
- Where to insert banners / promos between kit pieces

Consumers should read this file, copy the pattern, and adapt it. Do not try to encapsulate the assembly behind a wrapper component — the extensibility points (banner positioning, status branching, view toggle rendering) are the point.

## Usage guidelines

**When to use:** Any product listing page. The kit covers grid + list views, filtering, sorting, search, pagination, and standard states.

**When NOT to use:** Pages that aren't product listings (dashboards, settings, auth flows). Pages that need a completely custom layout.

## Best practices

**Do:** Copy the assembly pattern from the story file and adapt to your data shape. Keep filter state in a consumer-owned controller hook.

**Do:** Use the library's filter subsystem (`FilterToolbar`, `FilterDrawer`, `FilterSection`, preset molecules) — don't re-implement a filter UI.

**Do:** Compose banners, promos, and recommendations between kit pieces as plain React children. The library's grid and list containers don't reach above themselves; insertion points are yours to decide.

**Don't:** Re-introduce a unified PLP template. The kit is the deliberate surface.

## Quality checklist

- [x] Accessibility: heading, aria-live on counts, semantic landmarks in assembly reference
- [x] Responsive: 2/3/4 col grid; list falls back to grid below 1024px at the consumer's discretion
- [x] Tokens only: no hardcoded visual values in kit pieces
````

- [ ] **Step 2: Commit**

```bash
git add packages/components/src/components/templates/plp/COMPONENT.md
git commit -m "$(cat <<'EOF'
docs(plp): rewrite templates/plp/COMPONENT.md as kit overview

Replaces the old PlpTemplate-focused doc with a kit overview: lists the
PLP-specific pieces (heading, containers, card/row primitives), points
at the filter subsystem and other library dependencies, and names the
assembly story as the canonical reference.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 17: CHANGELOG entry

**Files:**
- Modify: `packages/components/CHANGELOG.md`

- [ ] **Step 1: Add entry at the top**

Prepend a new entry immediately after the `# Changelog — @nivoda/components` header and first `---`:

```markdown
---

### Filter subsystem extracted; PLP becomes a kit (breaking, unstable 0.6.0)

Two coupled moves. (1) The PLP-scoped filter system is extracted into reusable molecules and an organism under a new `Filtering/` Storybook section: `FilterDrawer`, `FilterSection`, `AllFiltersButton`, `ChipSelectFilter` (merged single + multi chips), `RangeFilter` (merged single-axis + multi-axis), `AsyncComboboxFilter` — plus the `FilterToolbar` organism (internal sticky chrome via IntersectionObserver). `FilterButton` (atom) absorbs the old `PlpQuickFilter`'s per-popover draft lifecycle. (2) `PlpTemplate` is deleted; PLP becomes a kit of individually-exported building blocks — `PlpHeading`, `PlpGridContainer`, `PlpListContainer`, plus the existing grid item and list row primitives. Consumers assemble the PLP page in their own code.

Breaking changes:

- `PlpTemplate` component removed. Assemble pages from the kit — see `templates/plp/plp.stories.tsx` for the canonical pattern.
- `PlpQuickFilter` removed; use `FilterButton` directly with its new render-prop children API and draft-lifecycle props (`initialValue`, `onApply(value)`, `isActive`, `chipSummary`).
- `PlpViewToggle` removed; use `ToggleGroup` + `ToggleGroupItem` inline inside `FilterToolbar`'s `actions` slot.
- `PlpEmpty` / `PlpError` removed; use the `Empty` atom + `EmptyHeader` / `EmptyTitle` / `EmptyDescription` / `EmptyContent` at the consumption site.
- `BooleanChipFilter` removed; use `Toggle` or `Switch` atoms directly.
- `SingleSelectDropdownFilter` removed; use `Select` + `SelectTrigger` + `SelectContent` + `SelectItem` inline.
- `SingleSelectChipsFilter` + `MultiSelectChipsFilter` merged into `ChipSelectFilter` with a `mode: "single" | "multiple"` discriminated union.
- `RangeSliderFilter` + `MultiAxisRangeFilter` merged into `RangeFilter` with an `axes: RangeAxis[]` prop. Value shape is always `Record<string, { min; max }> | undefined` keyed by axis id — single-axis consumers key the value by their chosen axis id (e.g. `{ price: { min, max } }`).
- `PlpFilterDrawer`, `PlpFilterSection`, `PlpAllFiltersButton`, `PlpToolbar`, `PlpStickyFilterBar` renamed to `FilterDrawer`, `FilterSection`, `AllFiltersButton`, `FilterToolbar` and relocated to their new molecule / organism folders.
- `FilterToolbar` bundles the sticky chrome via internal IntersectionObserver; consumers no longer render a separate sticky bar.
- `FilterDrawer` gains `applyLabel?: string` for non-list use.

No code shipped to production yet — all components are unstable. See the design spec at `docs/plans/specs/2026-04-21-filter-subsystem-and-plp-kit-design.md` and the implementation plan at `docs/plans/2026-04-21-filter-subsystem-and-plp-kit-plan.md`.

---
```

- [ ] **Step 2: Commit**

```bash
git add packages/components/CHANGELOG.md
git commit -m "$(cat <<'EOF'
docs(components): changelog entry for filter subsystem + PLP kit refactor

Documents the breaking changes at unstable 0.6.0: filter subsystem
extracted to molecules/organisms under a new Filtering section; PlpTemplate
deleted; PLP becomes a kit of building blocks assembled by the consumer.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 18: Final verification

- [ ] **Step 1: Typecheck**

```bash
cd packages/components && npx tsc --noEmit
```
Expected: clean.

- [ ] **Step 2: Storybook sidebar audit**

```bash
cd packages/components && npx storybook dev -p 6006
```

Navigate the sidebar. Expected structure:

- `Atoms/` — existing atoms (unchanged)
- `Molecules/` — existing molecules + new `FilterDrawer`, `FilterSection`, `AllFiltersButton`, `ChipSelectFilter`, `RangeFilter`, `AsyncComboboxFilter` (these should appear under `Filtering/` in the sidebar due to the story title, not under `Molecules/`)
- `Organisms/` — existing + `FilterToolbar` (similarly under `Filtering/`)
- `Filtering/` — new top-level section containing `FilterButton`, `FilterDrawer`, `FilterSection`, `AllFiltersButton`, `ChipSelectFilter`, `RangeFilter`, `AsyncComboboxFilter`, `FilterToolbar`
- `Templates/PLP/` — `Heading`, `GridContainer`, `ListContainer`, `Grid Item`, `List Row`, plus the 11 assembly stories (`GemstoneCategory`, etc.)

No stale `Filter/Preset` folders. No broken stories.

- [ ] **Step 3: Invariant check — story-by-story visual parity**

Side-by-side compare with the pre-refactor branch (`git stash` the current branch, check out the commit before Task 2 started, run Storybook, screenshot each of the 11 PLP stories, then return to the current branch and compare). For each story:

- [ ] `GemstoneCategory` matches
- [ ] `DiamondsCategory` matches
- [ ] `WithActiveFilters` matches
- [ ] `JewelryCategory` matches
- [ ] `WithCustomFilter` matches
- [ ] `Loading` matches
- [ ] `EmptyFiltered` matches
- [ ] `EmptyNoItems` matches
- [ ] `Error` matches
- [ ] `DiamondListView` matches
- [ ] `GemstoneListView` matches

For each, verify:
- Layout and spacing identical
- Filter row chip placement identical
- Sticky bar appears at the same scroll position with the same content
- Drawer opens with the same sections and behaves the same (preview count, apply, clear)
- Skeleton proportions identical
- Empty/error visuals identical (risk: `Empty` atom parity)

- [ ] **Step 4: Record final verification**

Append a note to this task with:

```
tsc: clean
Storybook sidebar: ✅ Filtering + Templates/PLP structured as expected
Visual parity: 11/11 stories match
```

If any story fails parity, open a follow-up issue — the refactor is not complete until all 11 match.

- [ ] **Step 5: No commit — verification only**

---

## Self-review summary

**Spec coverage:**
- Filter subsystem extraction (FilterButton rewrite, drawer, section, all-filters-button, chip-select, range, async-combobox, toolbar with sticky) — Tasks 2, 3, 4, 5, 6, 7, 8, 9 ✅
- PLP kit decomposition (PlpHeading, PlpGridContainer, PlpListContainer) — Tasks 10, 11, 12 ✅
- Story rewrite as assembly reference — Task 13 ✅
- Deletions (PlpTemplate, old presets, PlpQuickFilter, PlpViewToggle, PlpEmpty, PlpError, states folder, old filters/ and toolbar/ folders) — Tasks 9, 14 ✅
- Barrel update — Task 15 ✅
- COMPONENT.md rewrite — Task 16 ✅
- CHANGELOG — Task 17 ✅
- Empty atom risk audit — Task 1 ✅
- Visual invariant verification — Task 18 ✅

**Placeholders:** none (all code inlined; no TODOs; no "similar to earlier" references without code).

**Type consistency:** `ChipSelectOption`, `RangeAxis`, `RangeValue`, `AsyncComboboxOption`, `FilterToolbarSortOption` names are consistent across tasks. `FilterButton<V>` generic is consistent with story usage in later tasks.

**Out of scope (confirmed):** Generic `PageHeading`/`ResponsiveGrid`/`EmptyState` molecules, `useAsyncComboboxOptions` hook, `side` prop on FilterDrawer, `useScrollPastSentinel` hook, dedicated `PlpPagination`, dedicated `PlpViewToggle`, moving `FilterButton` to molecules, grid item/list row changes, other templates.
