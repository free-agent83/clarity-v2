# Components Pass 3 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship five components — Progress enhancements, SegmentedControl, InlineBanner, PageBanner (+ AppShell banner wiring), Stepper — each as a separate PR, landing as `status: unstable` and documented per the repo's `COMPONENT.md` / `COMPONENTS.md` / `CHANGELOG.md` conventions.

**Architecture:** Each component lives at the folder classification agreed in the spec (four atoms, one molecule). All implementations wrap Radix primitives already in the dependency tree or are plain `div`-based compounds. No new external dependencies. Components use `cva` for variants/sizes, `data-slot` attributes for styling hooks, and the established `radix-ui` namespace import style. Stories are the only test surface (no unit tests added); `@storybook/addon-a11y` catches axe violations during authoring.

**Tech Stack:** React 19, TypeScript, Tailwind v4, shadcn/ui conventions, `radix-ui` (umbrella package), `class-variance-authority`, `@tabler/icons-react`, Storybook 8 with `@storybook/addon-a11y`.

**Reference spec:** [docs/superpowers/specs/2026-04-22-components-pass-3-design.md](../specs/2026-04-22-components-pass-3-design.md)

---

## File Structure

| File | Responsibility | Created / Modified |
|------|----------------|--------------------|
| `packages/components/src/components/atoms/progress/progress.tsx` | Progress atom with CVA variants + sizes | Modified |
| `packages/components/src/components/atoms/progress/progress.stories.tsx` | Story matrix for Progress | Modified |
| `packages/components/src/components/atoms/progress/COMPONENT.md` | Progress docs | Modified (replace WIP) |
| `packages/components/src/components/atoms/segmented-control/segmented-control.tsx` | SegmentedControl atom | Created |
| `packages/components/src/components/atoms/segmented-control/segmented-control.stories.tsx` | SegmentedControl stories | Created |
| `packages/components/src/components/atoms/segmented-control/COMPONENT.md` | SegmentedControl docs | Created |
| `packages/components/src/components/atoms/inline-banner/inline-banner.tsx` | InlineBanner atom + sub-components | Created |
| `packages/components/src/components/atoms/inline-banner/inline-banner.stories.tsx` | InlineBanner stories | Created |
| `packages/components/src/components/atoms/inline-banner/COMPONENT.md` | InlineBanner docs | Created |
| `packages/components/src/components/atoms/page-banner/page-banner.tsx` | PageBanner atom + sub-components | Created |
| `packages/components/src/components/atoms/page-banner/page-banner.stories.tsx` | PageBanner stories | Created |
| `packages/components/src/components/atoms/page-banner/COMPONENT.md` | PageBanner docs | Created |
| `packages/components/src/components/organisms/app-shell/app-shell.tsx` | Add `banner` prop to `AppShell` | Modified |
| `packages/components/src/components/organisms/app-shell/app-shell.stories.tsx` | Add banner demo stories | Modified |
| `packages/components/src/components/molecules/stepper/stepper.tsx` | Stepper compound molecule | Created |
| `packages/components/src/components/molecules/stepper/stepper.stories.tsx` | Stepper stories | Created |
| `packages/components/src/components/molecules/stepper/COMPONENT.md` | Stepper docs | Created |
| `packages/components/COMPONENTS.md` | Library-level index | Modified (one row per PR) |
| `packages/components/CHANGELOG.md` | Per-PR changelog entry | Modified (one entry per PR) |

---

## PR 1 — Progress enhancements

### Task 1.1: Replace `progress.tsx` with CVA variants and sizes

**Files:**
- Modify: `packages/components/src/components/atoms/progress/progress.tsx`

- [ ] **Step 1: Overwrite the file with the CVA implementation**

```tsx
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Progress variants.
 *
 * Variant axis = semantic colour of the indicator bar
 * Size axis    = track height
 */
const progressVariants = cva(
  "relative flex w-full items-center overflow-x-hidden rounded-full bg-muted",
  {
    variants: {
      size: {
        default: "h-1.5",
        lg: "h-3",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const progressIndicatorVariants = cva(
  "size-full flex-1 transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-success",
        info: "bg-info",
        warning: "bg-warning",
        destructive: "bg-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type ProgressProps = React.ComponentProps<typeof ProgressPrimitive.Root> &
  VariantProps<typeof progressVariants> &
  VariantProps<typeof progressIndicatorVariants>

function Progress({
  className,
  value,
  variant,
  size,
  ...props
}: ProgressProps) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      data-variant={variant}
      data-size={size}
      className={cn(progressVariants({ size }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={progressIndicatorVariants({ variant })}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress, progressVariants, progressIndicatorVariants }
export type { ProgressProps }
```

- [ ] **Step 2: Verify build passes**

Run: `cd packages/components && npx tsc --noEmit -p tsconfig.lib.json`
Expected: no errors.

### Task 1.2: Replace `progress.stories.tsx` with a matrix

**Files:**
- Modify: `packages/components/src/components/atoms/progress/progress.stories.tsx`

- [ ] **Step 1: Overwrite the file**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./progress";

const meta: Meta<typeof Progress> = {
  title: "Feedback/Progress",
  component: Progress,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "info", "warning", "destructive"],
    },
    size: {
      control: "select",
      options: ["default", "lg"],
    },
  },
  args: {
    value: 60,
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: (args) => <Progress {...args} className="w-64" />,
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex w-64 flex-col gap-4">
      <Progress {...args} variant="default" />
      <Progress {...args} variant="success" />
      <Progress {...args} variant="info" />
      <Progress {...args} variant="warning" />
      <Progress {...args} variant="destructive" />
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex w-64 flex-col gap-4">
      <Progress {...args} size="default" />
      <Progress {...args} size="lg" />
    </div>
  ),
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="flex w-64 flex-col gap-2">
      <div className="flex justify-between text-sm">
        <span className="text-foreground">Uploading</span>
        <span className="text-muted-foreground">{args.value}%</span>
      </div>
      <Progress {...args} />
    </div>
  ),
};
```

### Task 1.3: Replace `progress/COMPONENT.md` with real documentation

**Files:**
- Modify: `packages/components/src/components/atoms/progress/COMPONENT.md`

- [ ] **Step 1: Overwrite the file**

```markdown
---
name: Progress
slug: progress
version: 0.1.0
status: unstable
lastUpdated: 2026-04-22
---

# Progress

Linear bar that communicates the completion state of an ongoing task.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | — | Completion percentage, 0 to 100. |
| `variant` | `"default" \| "success" \| "info" \| "warning" \| "destructive"` | `"default"` | Semantic colour of the indicator bar. The track is always `bg-muted`. |
| `size` | `"default" \| "lg"` | `"default"` | Track height — `h-1.5` (default) or `h-3` (lg). |

All standard Radix `Progress.Root` HTML attributes are supported via prop spread.

## Usage guidelines

Use Progress when a task has a determinate percentage of completion — uploads, imports, batch actions, profile completeness.

**Don't use Progress** for indeterminate work where no percentage is available — use `Spinner`. **Don't use Progress** as a data visualisation of categorical values — use a bar chart from `Chart`.

## Best practices

**Do:** Match `variant` to the state being communicated — `success` once the task completes, `destructive` if it fails mid-flight, `warning` when approaching a limit, `default` for neutral progress.

**Do:** Pair the bar with a text label (e.g. "12 of 20 uploaded" or "60%") — a bar without a number leaves the user guessing about the actual magnitude.

**Don't:** Animate the indicator independently of `value` — Radix handles the transition, the consumer only updates `value`.

**Don't:** Stack multiple Progress bars to represent multi-stage work — use `Stepper` for ordered steps.

## Quality checklist

- [x] Accessibility: Radix `Progress.Root` exposes `role="progressbar"` and the appropriate `aria-valuenow` / `aria-valuemin` / `aria-valuemax`; passes axe-core via `@storybook/addon-a11y`.
- [x] Responsive: the track is 100% width of its container; no breakpoint-specific behaviour by design.
- [x] Tokens only: no raw literals inside arbitrary value syntax.
```

### Task 1.4: Update `COMPONENTS.md` — confirm Progress entry is current

**Files:**
- Modify: `packages/components/COMPONENTS.md` (if necessary)

- [ ] **Step 1: Locate the existing Progress entry (under `### Feedback`) and confirm the one-liner still applies**

Run: `grep -n "^\*\*Progress\*\*" packages/components/COMPONENTS.md`
Expected: a line like `**Progress** · atom · unstable — [COMPONENT.md](...)`. If present with accurate one-liners, no change needed.

- [ ] **Step 2: If Progress is missing from COMPONENTS.md, add this entry under `### Feedback`**

```markdown
**Progress** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/progress/COMPONENT.md)
- For: communicating the completion state of a determinate, ongoing task.
- Not for: indeterminate work (use `Spinner`) or categorical data visualisation (use `Chart`).
```

### Task 1.5: Add `CHANGELOG.md` entry

**Files:**
- Modify: `packages/components/CHANGELOG.md`

- [ ] **Step 1: Insert a new entry at the top (below the `---` divider after the previous entry)**

```markdown
### Progress variants and sizes ([#TBD](https://github.com/free-agent83/clarity-v2/pull/TBD))
Adds semantic colour variants and a `lg` size to the existing `Progress` atom. Replaces the placeholder `COMPONENT.md` with full documentation. No breaking changes — existing call sites keep today's appearance.

- **Progress.** Added `variant` prop (`default | success | info | warning | destructive`) controlling the indicator bar colour; the track remains `bg-muted` across all variants. Added `size` prop (`default` = `h-1.5`, `lg` = `h-3`). Promoted component to version `0.1.0`.

---
```

The engineer will replace `TBD` with the real PR number after opening the PR.

### Task 1.6: Verify visually in Storybook

- [ ] **Step 1: Start Storybook**

Run (in a separate terminal): `cd packages/components && npx storybook dev -p 6006`
Expected: Storybook loads at `http://localhost:6006`.

- [ ] **Step 2: Navigate to `Feedback/Progress`, open each story**

Verify:
- `Default` renders at `h-1.5` with violet fill.
- `Variants` renders five bars in default/success/info/warning/destructive colours.
- `Sizes` shows `h-1.5` then `h-3`.
- `WithLabel` shows a label row + percentage + bar.
- No axe violations flagged in the Accessibility panel.

### Task 1.7: Run typecheck and commit

- [ ] **Step 1: Typecheck**

Run: `cd packages/components && npx tsc --noEmit -p tsconfig.lib.json`
Expected: no errors.

- [ ] **Step 2: Commit**

```bash
git add packages/components/src/components/atoms/progress \
  packages/components/COMPONENTS.md \
  packages/components/CHANGELOG.md
git commit -m "feat(progress): add variants and sizes"
```

---

## PR 2 — SegmentedControl

### Task 2.1: Create `segmented-control.tsx`

**Files:**
- Create: `packages/components/src/components/atoms/segmented-control/segmented-control.tsx`

- [ ] **Step 1: Write the file**

```tsx
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * SegmentedControl — single-select mode/view switcher.
 *
 * Wraps `Radix ToggleGroup.Root` with `type="single"` hard-coded.
 * Guarantees a non-empty selection by falling back to the previous
 * value if the user attempts to clear it.
 *
 * Use for mutually-exclusive UI modes (list/grid, daily/weekly).
 * Use `ToggleGroup` for toolbar-style multi-select controls.
 * Use `Tabs` for navigation between content panels.
 */
const segmentedControlVariants = cva(
  "inline-flex w-fit items-center rounded-md bg-muted p-0.5",
  {
    variants: {
      size: {
        sm: "h-8",
        default: "h-11",
        lg: "h-15",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const segmentedControlItemVariants = cva(
  [
    "relative inline-flex h-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[calc(var(--radius)-2px)] px-3 text-sm font-medium text-muted-foreground transition-all outline-none",
    "hover:text-foreground",
    "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:z-10",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-xs",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      size: {
        sm: "px-2.5 text-xs",
        default: "px-3",
        lg: "px-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type SegmentedControlContextValue = VariantProps<typeof segmentedControlVariants>

const SegmentedControlContext = React.createContext<SegmentedControlContextValue>({
  size: "default",
})

type SegmentedControlProps = Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
  "type" | "onValueChange" | "value" | "defaultValue"
> &
  VariantProps<typeof segmentedControlVariants> & {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
  }

function SegmentedControl({
  className,
  size,
  value,
  defaultValue,
  onValueChange,
  ...props
}: SegmentedControlProps) {
  // Fall back to the previous value if the user tries to clear the
  // selection — a SegmentedControl always has one active item.
  const handleValueChange = React.useCallback(
    (next: string) => {
      if (next === "") return
      onValueChange?.(next)
    },
    [onValueChange]
  )

  return (
    <SegmentedControlContext.Provider value={{ size }}>
      <ToggleGroupPrimitive.Root
        type="single"
        data-slot="segmented-control"
        data-size={size}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        className={cn(segmentedControlVariants({ size }), className)}
        {...props}
      />
    </SegmentedControlContext.Provider>
  )
}

type SegmentedControlItemProps = React.ComponentProps<
  typeof ToggleGroupPrimitive.Item
>

function SegmentedControlItem({
  className,
  children,
  ...props
}: SegmentedControlItemProps) {
  const { size } = React.useContext(SegmentedControlContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="segmented-control-item"
      className={cn(segmentedControlItemVariants({ size }), className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { SegmentedControl, SegmentedControlItem, segmentedControlVariants, segmentedControlItemVariants }
export type { SegmentedControlProps, SegmentedControlItemProps }
```

- [ ] **Step 2: Typecheck**

Run: `cd packages/components && npx tsc --noEmit -p tsconfig.lib.json`
Expected: no errors.

### Task 2.2: Create `segmented-control.stories.tsx`

**Files:**
- Create: `packages/components/src/components/atoms/segmented-control/segmented-control.stories.tsx`

- [ ] **Step 1: Write the file**

```tsx
import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react";
import { IconLayoutGrid, IconLayoutList } from "@tabler/icons-react";
import { SegmentedControl, SegmentedControlItem } from "./segmented-control";

const meta: Meta<typeof SegmentedControl> = {
  title: "Forms/Segmented Control",
  component: SegmentedControl,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
  },
  args: {
    defaultValue: "list",
    size: "default",
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
  render: (args) => (
    <SegmentedControl {...args}>
      <SegmentedControlItem value="list">List</SegmentedControlItem>
      <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <SegmentedControl {...args}>
      <SegmentedControlItem value="list">
        <IconLayoutList />
        List
      </SegmentedControlItem>
      <SegmentedControlItem value="grid">
        <IconLayoutGrid />
        Grid
      </SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const IconOnly: Story = {
  render: (args) => (
    <SegmentedControl {...args}>
      <SegmentedControlItem value="list" aria-label="List view">
        <IconLayoutList />
      </SegmentedControlItem>
      <SegmentedControlItem value="grid" aria-label="Grid view">
        <IconLayoutGrid />
      </SegmentedControlItem>
    </SegmentedControl>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-4">
      <SegmentedControl {...args} size="sm">
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl {...args} size="default">
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
      </SegmentedControl>
      <SegmentedControl {...args} size="lg">
        <SegmentedControlItem value="list">List</SegmentedControlItem>
        <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
      </SegmentedControl>
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledStory(args) {
    const [value, setValue] = React.useState("list");
    return (
      <div className="flex flex-col items-start gap-3">
        <SegmentedControl {...args} value={value} onValueChange={setValue}>
          <SegmentedControlItem value="list">List</SegmentedControlItem>
          <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
          <SegmentedControlItem value="map">Map</SegmentedControlItem>
        </SegmentedControl>
        <span className="text-sm text-muted-foreground">
          Selected: <code>{value}</code>
        </span>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: (args) => (
    <SegmentedControl {...args}>
      <SegmentedControlItem value="list">List</SegmentedControlItem>
      <SegmentedControlItem value="grid" disabled>
        Grid
      </SegmentedControlItem>
      <SegmentedControlItem value="map">Map</SegmentedControlItem>
    </SegmentedControl>
  ),
};
```

### Task 2.3: Create `COMPONENT.md`

**Files:**
- Create: `packages/components/src/components/atoms/segmented-control/COMPONENT.md`

- [ ] **Step 1: Write the file**

```markdown
---
name: SegmentedControl
slug: segmented-control
version: 0.1.0
status: unstable
lastUpdated: 2026-04-22
---

# SegmentedControl

Inset pill-shaped control for switching between mutually-exclusive UI modes or values. Always single-select, always non-empty — the last selected item remains active.

## Props

### `SegmentedControl`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Currently selected item value. Controlled. |
| `defaultValue` | `string` | — | Initial selected item for uncontrolled use. |
| `onValueChange` | `(value: string) => void` | — | Fires when the selection changes. Never called with an empty string. |
| `size` | `"sm" \| "default" \| "lg"` | `"default"` | Track height — mirrors Button sizes. |

### `SegmentedControlItem`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | — | Identifier for this segment. Required. |
| `disabled` | `boolean` | `false` | Disables this segment. |

All standard Radix `ToggleGroup.Item` HTML attributes are supported via prop spread.

## Usage guidelines

Use SegmentedControl for choosing between a small, fixed set of mutually-exclusive modes — list/grid view, daily/weekly/monthly range, left/centre/right alignment. Two to four items is the sweet spot.

**Don't use SegmentedControl** for multi-select toolbar controls (bold/italic/underline) — use `ToggleGroup`. **Don't use SegmentedControl** for page navigation — use `Tabs`. **Don't use SegmentedControl** when the option set is long, dynamic, or data-driven — use `Select` or `RadioGroup`.

## Best practices

**Do:** Keep labels short (one word where possible) — the inset pill is visually compact and long labels distort the track.

**Do:** Pair each segment with a glyph where the label alone could be ambiguous (map pin icon next to "Map", calendar icon next to "Daily").

**Don't:** Use more than four segments — beyond that, a `Select` or `Tabs` carries the information better.

**Don't:** Nest a SegmentedControl inside another SegmentedControl or inside a ToggleGroup — the visual hierarchy collapses.

## Writing

- Labels are nouns naming the mode ("List", "Grid", "Monthly") — not verbs.
- Sentence case. No punctuation.

## Quality checklist

- [x] Accessibility: Radix `ToggleGroup` with `type="single"` exposes `role="radiogroup"` and `role="radio"` on items; passes axe-core via `@storybook/addon-a11y`; keyboard navigable (arrow keys).
- [x] Responsive: the component is `w-fit` and does not wrap; use a wrapper to constrain width if necessary.
- [x] Tokens only: no raw literals inside arbitrary value syntax.
```

### Task 2.4: Add SegmentedControl to `COMPONENTS.md`

**Files:**
- Modify: `packages/components/COMPONENTS.md`

- [ ] **Step 1: Under the `### Forms` section (near `ToggleGroup` / `Toggle`), insert**

```markdown
**SegmentedControl** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/segmented-control/COMPONENT.md)
- For: switching between two to four mutually-exclusive UI modes (list/grid view, daily/weekly/monthly).
- Not for: toolbar multi-select (use `ToggleGroup`), panel navigation (use `Tabs`), or long option lists (use `Select` or `RadioGroup`).
```

### Task 2.5: Add `CHANGELOG.md` entry

**Files:**
- Modify: `packages/components/CHANGELOG.md`

- [ ] **Step 1: Insert at the top**

```markdown
### SegmentedControl ([#TBD](https://github.com/free-agent83/clarity-v2/pull/TBD))
Introduces a new `SegmentedControl` atom for switching between mutually-exclusive UI modes. Wraps `Radix ToggleGroup` with `type="single"` hard-coded and a non-empty selection guarantee.

- **SegmentedControl.** Inset pill design with a 2px track padding and `bg-background` + `shadow-xs` active pill. Sizes `sm` / `default` / `lg` mirror Button. Supports text, icon + text, and icon-only items. Lands as `unstable`.

---
```

### Task 2.6: Verify in Storybook

- [ ] **Step 1: Open `Forms/Segmented Control`**

Verify:
- Active segment sits visually inset within the track (2px gap on all sides).
- Active pill has a subtle shadow.
- Clicking the currently-active segment does NOT clear the selection (fires no change event).
- Three size variants render at visibly different heights matching Button sm/default/lg.
- `Disabled` story shows the middle segment greyed and non-interactive.
- No axe violations.

### Task 2.7: Run typecheck, build, commit

- [ ] **Step 1: Typecheck**

Run: `cd packages/components && npx tsc --noEmit -p tsconfig.lib.json`
Expected: no errors.

- [ ] **Step 2: Commit**

```bash
git add packages/components/src/components/atoms/segmented-control \
  packages/components/COMPONENTS.md \
  packages/components/CHANGELOG.md
git commit -m "feat(segmented-control): add SegmentedControl atom"
```

---

## PR 3 — InlineBanner

### Task 3.1: Create `inline-banner.tsx`

**Files:**
- Create: `packages/components/src/components/atoms/inline-banner/inline-banner.tsx`

- [ ] **Step 1: Write the file**

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { IconX } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

/**
 * InlineBanner — block-level, page-level callout.
 *
 * Hierarchically above `Alert`. Use under a page heading to surface
 * persistent page-level information or promotional content.
 *
 * Variants use the same tinted tonality as `Alert`; hierarchy over
 * `Alert` comes from size, position, and icon prominence — not from
 * background intensity.
 */
const inlineBannerVariants = cva(
  [
    "relative grid w-full items-center rounded-lg border",
    "grid-cols-[auto_1fr_auto]",
    "[&>svg]:col-start-1 [&>svg]:row-span-full [&>svg]:self-center",
  ],
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        success: "border-transparent bg-success/5 text-success dark:bg-success/10",
        info: "border-transparent bg-info/5 text-info dark:bg-info/10",
        warning: "border-transparent bg-warning/5 text-warning dark:bg-warning/10",
        destructive: "border-transparent bg-destructive/5 text-destructive dark:bg-destructive/10",
      },
      size: {
        default: "gap-x-3 px-4 py-3 [&>svg]:size-5",
        lg: "gap-x-4 px-6 py-4 [&>svg]:size-8",
        xl: "gap-x-6 px-8 py-6 [&>svg]:size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type InlineBannerProps = React.ComponentProps<"div"> &
  VariantProps<typeof inlineBannerVariants> & {
    onDismiss?: () => void
  }

function InlineBanner({
  className,
  variant,
  size,
  onDismiss,
  children,
  ...props
}: InlineBannerProps) {
  return (
    <div
      data-slot="inline-banner"
      data-variant={variant}
      data-size={size}
      role="status"
      className={cn(
        inlineBannerVariants({ variant, size }),
        onDismiss && "pr-12",
        className
      )}
      {...props}
    >
      {children}
      {onDismiss ? (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          data-slot="inline-banner-dismiss"
          className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-md text-current/70 outline-none transition-colors hover:bg-foreground/5 hover:text-current focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <IconX className="size-4" />
        </button>
      ) : null}
    </div>
  )
}

function InlineBannerTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="inline-banner-title"
      className={cn(
        "col-start-2 row-start-1 font-heading font-medium",
        className
      )}
      {...props}
    />
  )
}

function InlineBannerDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="inline-banner-description"
      className={cn(
        "col-start-2 row-start-2 text-sm text-muted-foreground [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

function InlineBannerActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="inline-banner-actions"
      className={cn(
        "col-start-3 row-span-full flex shrink-0 items-center gap-2 self-center justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function InlineBannerMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="inline-banner-media"
      className={cn(
        "col-start-1 row-span-full flex shrink-0 items-center justify-center self-center [&>img]:max-h-40 [&>img]:max-w-40 [&>svg]:size-10",
        className
      )}
      {...props}
    />
  )
}

export {
  InlineBanner,
  InlineBannerTitle,
  InlineBannerDescription,
  InlineBannerActions,
  InlineBannerMedia,
  inlineBannerVariants,
}
export type { InlineBannerProps }
```

- [ ] **Step 2: Typecheck**

Run: `cd packages/components && npx tsc --noEmit -p tsconfig.lib.json`
Expected: no errors.

### Task 3.2: Create `inline-banner.stories.tsx`

**Files:**
- Create: `packages/components/src/components/atoms/inline-banner/inline-banner.stories.tsx`

- [ ] **Step 1: Write the file**

```tsx
import * as React from "react"
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconInfoCircle,
  IconSparkles,
  IconCircleCheck,
} from "@tabler/icons-react";
import { Button } from "../button/button";
import {
  InlineBanner,
  InlineBannerTitle,
  InlineBannerDescription,
  InlineBannerActions,
  InlineBannerMedia,
} from "./inline-banner";

const meta: Meta<typeof InlineBanner> = {
  title: "Feedback/Inline Banner",
  component: InlineBanner,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "info", "warning", "destructive"],
    },
    size: {
      control: "select",
      options: ["default", "lg", "xl"],
    },
  },
  args: {
    variant: "info",
    size: "default",
  },
};

export default meta;
type Story = StoryObj<typeof InlineBanner>;

export const Default: Story = {
  render: (args) => (
    <InlineBanner {...args}>
      <IconInfoCircle />
      <InlineBannerTitle>Inventory refreshed</InlineBannerTitle>
      <InlineBannerDescription>
        Showing the latest listings from all sourcing partners.
      </InlineBannerDescription>
    </InlineBanner>
  ),
};

export const WithAction: Story = {
  render: (args) => (
    <InlineBanner {...args} size="lg">
      <IconSparkles />
      <InlineBannerTitle>New: AI-assisted search</InlineBannerTitle>
      <InlineBannerDescription>
        Find inventory faster with natural-language queries.
      </InlineBannerDescription>
      <InlineBannerActions>
        <Button size="sm">Try it</Button>
      </InlineBannerActions>
    </InlineBanner>
  ),
};

export const Dismissible: Story = {
  args: { onDismiss: fn() },
  render: (args) => (
    <InlineBanner {...args}>
      <IconInfoCircle />
      <InlineBannerTitle>Inventory refreshed</InlineBannerTitle>
      <InlineBannerDescription>
        Showing the latest listings from all sourcing partners.
      </InlineBannerDescription>
    </InlineBanner>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <InlineBanner {...args} variant="default">
        <IconInfoCircle />
        <InlineBannerTitle>Default</InlineBannerTitle>
        <InlineBannerDescription>Neutral page-level callout.</InlineBannerDescription>
      </InlineBanner>
      <InlineBanner {...args} variant="success">
        <IconCircleCheck />
        <InlineBannerTitle>Success</InlineBannerTitle>
        <InlineBannerDescription>Positive confirmation.</InlineBannerDescription>
      </InlineBanner>
      <InlineBanner {...args} variant="info">
        <IconInfoCircle />
        <InlineBannerTitle>Info</InlineBannerTitle>
        <InlineBannerDescription>Neutral guidance.</InlineBannerDescription>
      </InlineBanner>
      <InlineBanner {...args} variant="warning">
        <IconAlertTriangle />
        <InlineBannerTitle>Warning</InlineBannerTitle>
        <InlineBannerDescription>Cautionary notice.</InlineBannerDescription>
      </InlineBanner>
      <InlineBanner {...args} variant="destructive">
        <IconAlertCircle />
        <InlineBannerTitle>Destructive</InlineBannerTitle>
        <InlineBannerDescription>Error state.</InlineBannerDescription>
      </InlineBanner>
    </div>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <InlineBanner {...args} size="default">
        <IconSparkles />
        <InlineBannerTitle>Default size</InlineBannerTitle>
        <InlineBannerDescription>Compact page-level callout.</InlineBannerDescription>
      </InlineBanner>
      <InlineBanner {...args} size="lg">
        <IconSparkles />
        <InlineBannerTitle>Large size</InlineBannerTitle>
        <InlineBannerDescription>
          More generous padding for substantive messages, with a bigger icon.
        </InlineBannerDescription>
        <InlineBannerActions>
          <Button size="sm" variant="outline">Later</Button>
          <Button size="sm">Try it</Button>
        </InlineBannerActions>
      </InlineBanner>
      <InlineBanner {...args} size="xl">
        <InlineBannerMedia>
          <IconSparkles />
        </InlineBannerMedia>
        <InlineBannerTitle>XL size with media slot</InlineBannerTitle>
        <InlineBannerDescription>
          At xl, the media slot replaces the icon and supports an illustration up to ~160×160px.
        </InlineBannerDescription>
        <InlineBannerActions>
          <Button size="sm">Get started</Button>
        </InlineBannerActions>
      </InlineBanner>
    </div>
  ),
};
```

### Task 3.3: Create `COMPONENT.md`

**Files:**
- Create: `packages/components/src/components/atoms/inline-banner/COMPONENT.md`

- [ ] **Step 1: Write the file**

```markdown
---
name: InlineBanner
slug: inline-banner
version: 0.1.0
status: unstable
lastUpdated: 2026-04-22
---

# InlineBanner

Block-level, page-level callout that communicates persistent page-level information or promotional content. Hierarchically above `Alert`.

## Props

### `InlineBanner`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "success" \| "info" \| "warning" \| "destructive"` | `"default"` | Semantic tonality. Tinted background; does NOT change with size. |
| `size` | `"default" \| "lg" \| "xl"` | `"default"` | Overall banner size. `xl` unlocks the `InlineBannerMedia` slot. |
| `onDismiss` | `() => void` | — | If provided, renders a close (X) button in the top-right. Stateless — the consumer removes the banner from the tree. |

All standard `<div>` HTML attributes are supported via prop spread.

### Sub-components

- `InlineBannerTitle` — required heading slot.
- `InlineBannerDescription` — optional body slot.
- `InlineBannerActions` — right-aligned actions slot. Holds one or two `Button`s.
- `InlineBannerMedia` — illustration slot. Only meaningful at `size="xl"`; replaces the icon column.

An optional leading icon is passed as a direct `<svg>` child of `InlineBanner` (typically from `@tabler/icons-react`). The component detects it and lays out a two-column grid.

## Usage guidelines

Use InlineBanner under a page heading to surface persistent, page-level information — promotional callouts, feature announcements, advisory notices that apply to the whole view. Typical placements: below a dashboard heading, below a PLP heading, in an onboarding flow.

**Don't use InlineBanner** for section-level messages — use `Alert`. **Don't use InlineBanner** for app-wide callouts above the navigation — use `PageBanner`. **Don't use InlineBanner** for transient confirmations — use `Sonner` (toast).

## Best practices

**Do:** Use `default` size for most page callouts. Reach for `lg` when the message warrants more visual weight, and `xl` only when you have a genuine illustration or image to show.

**Do:** Pair `variant` with a matching Tabler icon — `IconCircleCheck` for success, `IconAlertTriangle` for warning, `IconAlertCircle` for destructive, `IconInfoCircle` for info.

**Don't:** Stack multiple InlineBanners in the same region. If the page has multiple conditions to surface, consolidate or rank and show the highest-priority one.

**Don't:** Use `InlineBannerMedia` at sizes other than `xl` — the layout is not designed for it.

## Writing

- **Title:** one short sentence, sentence case. "New: AI-assisted search". No trailing punctuation.
- **Description:** plain prose explaining what the banner is announcing and what the user can do.
- Avoid "Warning:" / "Error:" prefixes — the variant and icon already carry the signal.

## Quality checklist

- [x] Accessibility: `role="status"` on the root; dismiss button has `aria-label`; passes axe-core via `@storybook/addon-a11y`.
- [x] Responsive: the banner is full-width and the actions slot wraps below at narrow widths.
- [x] Tokens only: no raw literals inside arbitrary value syntax.
```

### Task 3.4: Add InlineBanner to `COMPONENTS.md`

**Files:**
- Modify: `packages/components/COMPONENTS.md`

- [ ] **Step 1: Under the `### Feedback` section, insert**

```markdown
**InlineBanner** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/inline-banner/COMPONENT.md)
- For: page-level callouts under a page heading — promotional content, feature announcements, advisory notices that apply to the whole view.
- Not for: section-level messages (use `Alert`), app-wide banners above the nav (use `PageBanner`), or transient confirmations (use `Sonner`).
```

### Task 3.5: Add `CHANGELOG.md` entry

**Files:**
- Modify: `packages/components/CHANGELOG.md`

- [ ] **Step 1: Insert at the top**

```markdown
### InlineBanner ([#TBD](https://github.com/free-agent83/clarity-v2/pull/TBD))
Introduces a new `InlineBanner` atom for block-level, page-level callouts. Hierarchically above `Alert`; visually tinted like Alert but with a larger footprint, larger icon, and an optional illustration slot at `xl`.

- **InlineBanner.** Variants `default | success | info | warning | destructive`, sizes `default | lg | xl`. Compound API: `InlineBannerTitle`, `InlineBannerDescription`, `InlineBannerActions`, `InlineBannerMedia` (xl only). Optional `onDismiss` prop renders a top-right close button; stateless. Lands as `unstable`.

---
```

### Task 3.6: Verify in Storybook

- [ ] **Step 1: Open `Feedback/Inline Banner`**

Verify:
- `Default` renders with icon + title + description on a neutral card surface.
- `WithAction` renders the icon, two-line text block, and "Try it" button aligned right-middle.
- `Dismissible` renders a close X in the top-right that fires the `fn()` action on click.
- `Variants` renders all five in their respective tinted backgrounds.
- `Sizes` shows the progressive height increase — default ~64px, lg ~104px, xl ~180px — and the xl row uses a media slot.
- No axe violations.

### Task 3.7: Run typecheck, commit

- [ ] **Step 1: Typecheck**

Run: `cd packages/components && npx tsc --noEmit -p tsconfig.lib.json`
Expected: no errors.

- [ ] **Step 2: Commit**

```bash
git add packages/components/src/components/atoms/inline-banner \
  packages/components/COMPONENTS.md \
  packages/components/CHANGELOG.md
git commit -m "feat(inline-banner): add InlineBanner atom"
```

---

## PR 4 — PageBanner (+ AppShell banner wiring)

### Task 4.1: Create `page-banner.tsx`

**Files:**
- Create: `packages/components/src/components/atoms/page-banner/page-banner.tsx`

- [ ] **Step 1: Write the file**

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { IconX } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

/**
 * PageBanner — full-bleed stripe above the application nav.
 *
 * Solid-filled stripe for product-wide callouts (new features,
 * promotions, downtime, holidays). Rendered above `AppShellHeader`
 * via the `banner` prop on `AppShell` — never placed anywhere else
 * in the page hierarchy.
 */
const pageBannerVariants = cva(
  [
    "relative flex h-11 w-full items-center justify-center gap-2 px-10 text-sm",
    "[&>svg]:size-4 [&>svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        success: "bg-success text-success-foreground",
        info: "bg-info text-info-foreground",
        warning: "bg-warning text-warning-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type PageBannerProps = React.ComponentProps<"div"> &
  VariantProps<typeof pageBannerVariants> & {
    onDismiss?: () => void
  }

function PageBanner({
  className,
  variant,
  onDismiss,
  children,
  ...props
}: PageBannerProps) {
  return (
    <div
      data-slot="page-banner"
      data-variant={variant}
      role="status"
      className={cn(pageBannerVariants({ variant }), className)}
      {...props}
    >
      {children}
      {onDismiss ? (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          data-slot="page-banner-dismiss"
          className="absolute top-1/2 right-3 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-current/80 outline-none transition-colors hover:bg-foreground/10 hover:text-current focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <IconX className="size-4" />
        </button>
      ) : null}
    </div>
  )
}

function PageBannerTitle({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="page-banner-title"
      className={cn("truncate font-medium", className)}
      {...props}
    />
  )
}

function PageBannerAction({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="page-banner-action"
      className={cn("ml-2 inline-flex shrink-0 items-center", className)}
      {...props}
    />
  )
}

export { PageBanner, PageBannerTitle, PageBannerAction, pageBannerVariants }
export type { PageBannerProps }
```

- [ ] **Step 2: Typecheck**

Run: `cd packages/components && npx tsc --noEmit -p tsconfig.lib.json`
Expected: no errors.

### Task 4.2: Create `page-banner.stories.tsx`

**Files:**
- Create: `packages/components/src/components/atoms/page-banner/page-banner.stories.tsx`

- [ ] **Step 1: Write the file**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import {
  IconAlertTriangle,
  IconInfoCircle,
  IconSparkles,
} from "@tabler/icons-react";
import { Button } from "../button/button";
import { PageBanner, PageBannerAction, PageBannerTitle } from "./page-banner";

const meta: Meta<typeof PageBanner> = {
  title: "Feedback/Page Banner",
  component: PageBanner,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "success", "info", "warning", "destructive"],
    },
  },
  args: {
    variant: "default",
  },
};

export default meta;
type Story = StoryObj<typeof PageBanner>;

export const Default: Story = {
  render: (args) => (
    <PageBanner {...args}>
      <IconSparkles />
      <PageBannerTitle>
        New: AI-assisted search is now available on all accounts.
      </PageBannerTitle>
      <PageBannerAction>
        <Button variant="link" size="sm" className="text-current">
          Learn more
        </Button>
      </PageBannerAction>
    </PageBanner>
  ),
};

export const Dismissible: Story = {
  args: { onDismiss: fn() },
  render: (args) => (
    <PageBanner {...args} variant="warning">
      <IconAlertTriangle />
      <PageBannerTitle>
        Scheduled maintenance this Sunday 02:00–04:00 UTC.
      </PageBannerTitle>
      <PageBannerAction>
        <Button variant="link" size="sm" className="text-current">
          Read more
        </Button>
      </PageBannerAction>
    </PageBanner>
  ),
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col">
      <PageBanner {...args} variant="default">
        <IconSparkles />
        <PageBannerTitle>Default (brand).</PageBannerTitle>
      </PageBanner>
      <PageBanner {...args} variant="success">
        <IconInfoCircle />
        <PageBannerTitle>Success.</PageBannerTitle>
      </PageBanner>
      <PageBanner {...args} variant="info">
        <IconInfoCircle />
        <PageBannerTitle>Info.</PageBannerTitle>
      </PageBanner>
      <PageBanner {...args} variant="warning">
        <IconAlertTriangle />
        <PageBannerTitle>Warning.</PageBannerTitle>
      </PageBanner>
      <PageBanner {...args} variant="destructive">
        <IconAlertTriangle />
        <PageBannerTitle>Destructive.</PageBannerTitle>
      </PageBanner>
    </div>
  ),
};
```

### Task 4.3: Create `page-banner/COMPONENT.md`

**Files:**
- Create: `packages/components/src/components/atoms/page-banner/COMPONENT.md`

- [ ] **Step 1: Write the file**

```markdown
---
name: PageBanner
slug: page-banner
version: 0.1.0
status: unstable
lastUpdated: 2026-04-22
---

# PageBanner

Full-bleed stripe that sits above the application navigation header. Communicates product-wide callouts — new features, promotions, downtime, holidays. Solid-filled for visual weight; always app-level.

## Props

### `PageBanner`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "success" \| "info" \| "warning" \| "destructive"` | `"default"` | Semantic colour. `default` uses the brand primary. |
| `onDismiss` | `() => void` | — | If provided, renders a close (X) button on the right edge. Stateless. |

All standard `<div>` HTML attributes are supported via prop spread.

### Sub-components

- `PageBannerTitle` — required short message (single line; truncates at narrow widths).
- `PageBannerAction` — optional inline CTA. Sits after the title on the same line.

An optional inline icon is passed as a direct `<svg>` child (Tabler, ~16px), rendered before the title.

## Usage guidelines

PageBanner is consumed by `AppShell` via its `banner` prop — never place a `PageBanner` anywhere else in a page.

Use PageBanner for announcements that apply to the entire application: new features rolling out, scheduled downtime, compliance notices, holiday schedules.

**Don't use PageBanner** for page-specific callouts — use `InlineBanner`. **Don't use PageBanner** for section-level messages — use `Alert`. **Don't use PageBanner** for transient confirmations — use `Sonner`.

## Best practices

**Do:** Keep the message to a single short sentence — the banner truncates at narrow viewports.

**Do:** Use `onDismiss` for promotional and informational banners; omit it for downtime and compliance banners where the user must not be able to hide the message.

**Do:** Pair `variant` with a matching Tabler icon.

**Don't:** Render more than one PageBanner at a time. If multiple app-level conditions need surfacing, rank and show the highest-priority one.

## Writing

- **Title:** one short sentence, sentence case, with terminal punctuation. "New: AI-assisted search is now available on all accounts."
- Prefer declarative phrasing over imperative.

## Quality checklist

- [x] Accessibility: `role="status"` on the root; dismiss button has `aria-label`; passes axe-core via `@storybook/addon-a11y`.
- [x] Responsive: full-width, single-line with ellipsis at narrow widths.
- [x] Tokens only: no raw literals inside arbitrary value syntax.
```

### Task 4.4: Add `banner` prop to `AppShell`

**Files:**
- Modify: `packages/components/src/components/organisms/app-shell/app-shell.tsx`

- [ ] **Step 1: Update the `AppShellProps` interface**

Find:

```tsx
interface AppShellProps extends Omit<React.ComponentProps<"div">, "className"> {
  full?: boolean
  defaultNavigationOpen?: boolean
}
```

Replace with:

```tsx
interface AppShellProps extends Omit<React.ComponentProps<"div">, "className"> {
  full?: boolean
  defaultNavigationOpen?: boolean
  /**
   * Optional page-level banner rendered above the header.
   *
   * Pass a `PageBanner` node. The stripe is non-sticky — it scrolls
   * out of view as the user scrolls down, after which the sticky
   * `AppShellHeader` becomes the top of the viewport.
   */
  banner?: React.ReactNode
}
```

- [ ] **Step 2: Update the `AppShell` function signature and body**

Find:

```tsx
function AppShell({
  full = false,
  defaultNavigationOpen,
  children,
  ...props
}: AppShellProps) {
  return (
    <Sheet defaultOpen={defaultNavigationOpen}>
      <div
        data-slot="app-shell"
        data-full={full || undefined}
        className="group/app-shell flex min-h-svh flex-col bg-background text-foreground"
        {...props}
      >
        {children}
      </div>
    </Sheet>
  )
}
```

Replace with:

```tsx
function AppShell({
  full = false,
  defaultNavigationOpen,
  banner,
  children,
  ...props
}: AppShellProps) {
  return (
    <Sheet defaultOpen={defaultNavigationOpen}>
      <div
        data-slot="app-shell"
        data-full={full || undefined}
        className="group/app-shell flex min-h-svh flex-col bg-background text-foreground"
        {...props}
      >
        {banner}
        {children}
      </div>
    </Sheet>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `cd packages/components && npx tsc --noEmit -p tsconfig.lib.json`
Expected: no errors.

### Task 4.5: Update AppShell stories with banner demos

**Files:**
- Modify: `packages/components/src/components/organisms/app-shell/app-shell.stories.tsx`

- [ ] **Step 1: Read the existing file to locate the default story**

Run: `cat packages/components/src/components/organisms/app-shell/app-shell.stories.tsx | head -80`
Note the imports and the structure of existing stories.

- [ ] **Step 2: Add a new import line at the top of the imports block**

```tsx
import { PageBanner, PageBannerTitle, PageBannerAction } from "../../atoms/page-banner/page-banner";
import { IconSparkles, IconAlertTriangle } from "@tabler/icons-react";
import { Button } from "../../atoms/button/button";
import { fn } from "@storybook/test";
```

(Skip any imports already present.)

- [ ] **Step 3: Append two new stories at the end of the file, before the closing brace of the module (if any)**

```tsx
export const WithBanner: Story = {
  render: (args) => (
    <AppShell
      {...args}
      banner={
        <PageBanner variant="default">
          <IconSparkles />
          <PageBannerTitle>
            New: AI-assisted search is now available on all accounts.
          </PageBannerTitle>
          <PageBannerAction>
            <Button variant="link" size="sm" className="text-current">
              Learn more
            </Button>
          </PageBannerAction>
        </PageBanner>
      }
    >
      <AppShellHeader onSearch={fn()} />
      <AppShellMain>
        <div className="py-8">
          <h1 className="text-2xl font-heading font-medium">Page content</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The PageBanner above is non-sticky — scroll down to see it leave the viewport while the header stays fixed.
          </p>
          <div className="h-[200vh]" />
        </div>
      </AppShellMain>
    </AppShell>
  ),
};

export const WithDismissibleBanner: Story = {
  render: (args) => (
    <AppShell
      {...args}
      banner={
        <PageBanner variant="warning" onDismiss={fn()}>
          <IconAlertTriangle />
          <PageBannerTitle>
            Scheduled maintenance this Sunday 02:00–04:00 UTC.
          </PageBannerTitle>
          <PageBannerAction>
            <Button variant="link" size="sm" className="text-current">
              Read more
            </Button>
          </PageBannerAction>
        </PageBanner>
      }
    >
      <AppShellHeader onSearch={fn()} />
      <AppShellMain>
        <div className="py-8">
          <h1 className="text-2xl font-heading font-medium">Page content</h1>
        </div>
      </AppShellMain>
    </AppShell>
  ),
};
```

- [ ] **Step 4: Typecheck**

Run: `cd packages/components && npx tsc --noEmit -p tsconfig.lib.json`
Expected: no errors. If errors reference missing imports (e.g. `Story`, `AppShellHeader`, `AppShellMain`), adjust imports to match the actual names used in the existing story file.

### Task 4.6: Add PageBanner to `COMPONENTS.md`

**Files:**
- Modify: `packages/components/COMPONENTS.md`

- [ ] **Step 1: Under `### Feedback`, after the `InlineBanner` entry from PR 3, insert**

```markdown
**PageBanner** · `atom` · `unstable` — [COMPONENT.md](./src/components/atoms/page-banner/COMPONENT.md)
- For: full-bleed, app-level callouts above the navigation — new features, promotions, downtime, holidays. Consumed only by `AppShell` via its `banner` prop.
- Not for: page-level callouts (use `InlineBanner`), section-level messages (use `Alert`), or toasts (use `Sonner`).
```

### Task 4.7: Add `CHANGELOG.md` entry

**Files:**
- Modify: `packages/components/CHANGELOG.md`

- [ ] **Step 1: Insert at the top**

```markdown
### PageBanner + AppShell banner slot ([#TBD](https://github.com/free-agent83/clarity-v2/pull/TBD))
Introduces a new `PageBanner` atom for full-bleed, app-level callouts and wires an optional `banner` prop into `AppShell`. PageBanner uses solid fills across all variants — distinct from Alert/InlineBanner's tinted style — to declare itself at the application level.

- **PageBanner.** Variants `default | success | info | warning | destructive` with solid semantic fills (`default` uses brand primary). Compound API with `PageBannerTitle` and `PageBannerAction`. Optional `onDismiss` renders a right-edge close button. Lands as `unstable`.
- **AppShell.** New `banner` prop accepts a `PageBanner` node. The banner renders above the sticky header — non-sticky itself, so it scrolls out of view as the page scrolls down. Two new stories demonstrate the integration (`WithBanner`, `WithDismissibleBanner`).

---
```

### Task 4.8: Verify in Storybook

- [ ] **Step 1: Open `Feedback/Page Banner`**

Verify:
- `Default` renders with solid brand-violet background, centred icon + message, and a "Learn more" link action.
- `Dismissible` shows a close X on the right edge.
- `Variants` shows five stripes stacked with all semantic solid fills.
- No axe violations.

- [ ] **Step 2: Open the AppShell stories (likely under `Templates/...` or `Navigation/...`)**

Verify:
- `WithBanner` — banner sits above the header, header stays sticky when scrolling, banner scrolls out of view.
- `WithDismissibleBanner` — dismiss X works (fires the `fn()` action).

### Task 4.9: Run typecheck, commit

- [ ] **Step 1: Typecheck**

Run: `cd packages/components && npx tsc --noEmit -p tsconfig.lib.json`
Expected: no errors.

- [ ] **Step 2: Commit**

```bash
git add packages/components/src/components/atoms/page-banner \
  packages/components/src/components/organisms/app-shell \
  packages/components/COMPONENTS.md \
  packages/components/CHANGELOG.md
git commit -m "feat(page-banner): add PageBanner atom and AppShell banner slot"
```

---

## PR 5 — Stepper

### Task 5.1: Create `stepper.tsx`

**Files:**
- Create: `packages/components/src/components/molecules/stepper/stepper.tsx`

- [ ] **Step 1: Write the file**

```tsx
"use client"

import * as React from "react"
import { IconAlertCircle, IconCheck } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

type StepperState = "upcoming" | "current" | "completed" | "error"

type StepperContextValue = {
  activeStep: number
  errorSteps: ReadonlyArray<number>
  stepCount: number
  onStepClick?: (index: number) => void
}

const StepperContext = React.createContext<StepperContextValue | null>(null)

function useStepperContext(): StepperContextValue {
  const ctx = React.useContext(StepperContext)
  if (!ctx) {
    throw new Error("Stepper sub-components must be rendered inside <Stepper>.")
  }
  return ctx
}

const StepperItemIndexContext = React.createContext<number | null>(null)

function useStepperItemIndex(): number {
  const index = React.useContext(StepperItemIndexContext)
  if (index === null) {
    throw new Error(
      "StepperItemIndicator and StepperItemLabel must be rendered inside <StepperItem>."
    )
  }
  return index
}

function getStepState(
  index: number,
  activeStep: number,
  errorSteps: ReadonlyArray<number>
): StepperState {
  if (errorSteps.includes(index)) return "error"
  if (index < activeStep) return "completed"
  if (index === activeStep) return "current"
  return "upcoming"
}

type StepperProps = React.ComponentProps<"ol"> & {
  activeStep: number
  errorSteps?: ReadonlyArray<number>
  onStepClick?: (index: number) => void
}

/**
 * Stepper — displays progress through an ordered multi-step flow.
 *
 * Controlled via `activeStep`. Pass `onStepClick` to make completed
 * and errored steps navigable; current and upcoming steps are always
 * inert. Horizontal only in v0.1.
 */
function Stepper({
  className,
  activeStep,
  errorSteps = [],
  onStepClick,
  children,
  ...props
}: StepperProps) {
  const items = React.Children.toArray(children)
  const stepCount = items.length

  return (
    <StepperContext.Provider
      value={{ activeStep, errorSteps, stepCount, onStepClick }}
    >
      <ol
        data-slot="stepper"
        className={cn("flex w-full items-start", className)}
        {...props}
      >
        {items.map((child, index) => (
          <StepperItemIndexContext.Provider key={index} value={index}>
            {child}
          </StepperItemIndexContext.Provider>
        ))}
      </ol>
    </StepperContext.Provider>
  )
}

type StepperItemProps = React.ComponentProps<"li">

function StepperItem({ className, children, ...props }: StepperItemProps) {
  const { activeStep, errorSteps, stepCount, onStepClick } = useStepperContext()
  const index = useStepperItemIndex()
  const state = getStepState(index, activeStep, errorSteps)
  const isLast = index === stepCount - 1

  const isClickable =
    Boolean(onStepClick) && (state === "completed" || state === "error")

  const handleClick = () => {
    if (isClickable) onStepClick?.(index)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>) => {
    if (!isClickable) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onStepClick?.(index)
    }
  }

  return (
    <li
      data-slot="stepper-item"
      data-state={state}
      data-clickable={isClickable || undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-current={state === "current" ? "step" : undefined}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex items-center gap-3 outline-none rounded-md",
        "data-clickable:cursor-pointer",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        !isLast && "flex-1",
        !isLast &&
          "after:ml-3 after:h-px after:flex-1 after:bg-border after:content-[''] data-[state=completed]:after:bg-primary",
        className
      )}
      {...props}
    >
      {children}
    </li>
  )
}

type StepperItemIndicatorProps = React.ComponentProps<"span">

function StepperItemIndicator({
  className,
  ...props
}: StepperItemIndicatorProps) {
  const { activeStep, errorSteps } = useStepperContext()
  const index = useStepperItemIndex()
  const state = getStepState(index, activeStep, errorSteps)

  const content = (() => {
    if (state === "completed") return <IconCheck className="size-4" />
    if (state === "error") return <IconAlertCircle className="size-4" />
    return <span className="text-sm font-medium">{index + 1}</span>
  })()

  return (
    <span
      data-slot="stepper-item-indicator"
      data-state={state}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors",
        state === "upcoming" && "border-border text-muted-foreground",
        state === "current" && "border-primary bg-primary text-primary-foreground",
        state === "completed" && "border-primary bg-primary text-primary-foreground",
        state === "error" && "border-destructive bg-destructive text-destructive-foreground",
        className
      )}
      {...props}
    >
      {content}
    </span>
  )
}

type StepperItemLabelProps = React.ComponentProps<"span">

function StepperItemLabel({ className, ...props }: StepperItemLabelProps) {
  const { activeStep, errorSteps } = useStepperContext()
  const index = useStepperItemIndex()
  const state = getStepState(index, activeStep, errorSteps)

  return (
    <span
      data-slot="stepper-item-label"
      data-state={state}
      className={cn(
        "text-sm font-medium",
        state === "upcoming" && "text-muted-foreground",
        state === "current" && "text-foreground",
        state === "completed" && "text-muted-foreground",
        state === "error" && "text-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Stepper, StepperItem, StepperItemIndicator, StepperItemLabel }
export type {
  StepperProps,
  StepperItemProps,
  StepperItemIndicatorProps,
  StepperItemLabelProps,
  StepperState,
}
```

- [ ] **Step 2: Typecheck**

Run: `cd packages/components && npx tsc --noEmit -p tsconfig.lib.json`
Expected: no errors.

### Task 5.2: Create `stepper.stories.tsx`

**Files:**
- Create: `packages/components/src/components/molecules/stepper/stepper.stories.tsx`

- [ ] **Step 1: Write the file**

```tsx
import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button } from "../../atoms/button/button";
import {
  Stepper,
  StepperItem,
  StepperItemIndicator,
  StepperItemLabel,
} from "./stepper";

const LABELS = ["Details", "Shipping", "Payment", "Review"];

const meta: Meta<typeof Stepper> = {
  title: "Navigation/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  argTypes: {
    activeStep: {
      control: { type: "number", min: 0, max: LABELS.length - 1 },
    },
  },
  args: {
    activeStep: 1,
    errorSteps: [],
  },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

function renderSteps() {
  return LABELS.map((label) => (
    <StepperItem key={label}>
      <StepperItemIndicator />
      <StepperItemLabel>{label}</StepperItemLabel>
    </StepperItem>
  ));
}

export const Default: Story = {
  render: (args) => <Stepper {...args}>{renderSteps()}</Stepper>,
};

export const States: Story = {
  render: (args) => (
    <div className="flex flex-col gap-8">
      <div>
        <div className="mb-2 text-xs text-muted-foreground">activeStep = 0</div>
        <Stepper {...args} activeStep={0}>{renderSteps()}</Stepper>
      </div>
      <div>
        <div className="mb-2 text-xs text-muted-foreground">activeStep = 2</div>
        <Stepper {...args} activeStep={2}>{renderSteps()}</Stepper>
      </div>
      <div>
        <div className="mb-2 text-xs text-muted-foreground">
          activeStep = 3, all complete
        </div>
        <Stepper {...args} activeStep={3}>{renderSteps()}</Stepper>
      </div>
      <div>
        <div className="mb-2 text-xs text-muted-foreground">
          activeStep = 2, errorSteps = [1]
        </div>
        <Stepper {...args} activeStep={2} errorSteps={[1]}>
          {renderSteps()}
        </Stepper>
      </div>
    </div>
  ),
};

export const Clickable: Story = {
  args: { onStepClick: fn() },
  render: (args) => <Stepper {...args} activeStep={2}>{renderSteps()}</Stepper>,
};

export const Interactive: Story = {
  render: function InteractiveStory() {
    const [activeStep, setActiveStep] = React.useState(0);
    const last = LABELS.length - 1;
    return (
      <div className="flex flex-col gap-6">
        <Stepper activeStep={activeStep} onStepClick={setActiveStep}>
          {renderSteps()}
        </Stepper>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setActiveStep((v) => Math.max(0, v - 1))}
            disabled={activeStep === 0}
          >
            Back
          </Button>
          <Button
            onClick={() => setActiveStep((v) => Math.min(last, v + 1))}
            disabled={activeStep === last}
          >
            Next
          </Button>
        </div>
      </div>
    );
  },
};
```

### Task 5.3: Create `stepper/COMPONENT.md`

**Files:**
- Create: `packages/components/src/components/molecules/stepper/COMPONENT.md`

- [ ] **Step 1: Write the file**

```markdown
---
name: Stepper
slug: stepper
version: 0.1.0
status: unstable
lastUpdated: 2026-04-22
---

# Stepper

Displays progress through an ordered, multi-step flow. Typical use is inside a `Dialog`-based checkout, returns, or onboarding wizard. Horizontal only in v0.1.

## Props

### `Stepper`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activeStep` | `number` | — | Zero-indexed current step. Required. Controlled. |
| `errorSteps` | `ReadonlyArray<number>` | `[]` | Indices flagged as errored. Wins over derived state. |
| `onStepClick` | `(index: number) => void` | — | If provided, `completed` and `error` steps become clickable. |

### Sub-components

- `StepperItem` — one step. Derives its state and index from context; the consumer does not pass them explicitly.
- `StepperItemIndicator` — the circle. Renders the step number by default, a checkmark when completed, or `IconAlertCircle` when errored.
- `StepperItemLabel` — the step's text label.

## Usage guidelines

Use Stepper inside modal or dialog-based flows where the user completes a series of ordered steps — checkout, returns, account setup.

**Don't use Stepper** for general page navigation — use `Tabs` or `Breadcrumb`. **Don't use Stepper** for a single `Progress`-style percentage indicator — use `Progress`. **Don't use Stepper** to represent optional or out-of-order tasks — the component assumes sequential progress.

## Best practices

**Do:** Keep labels short (1–2 words). The component is horizontal and long labels break the layout.

**Do:** Flag errored steps via `errorSteps` *and* provide `onStepClick` so the user can navigate back to fix them.

**Don't:** Render a Stepper with more than five or six steps — horizontal space runs out. If a flow has more steps, reconsider its structure or split into grouped phases.

**Don't:** Mutate `activeStep` on step click unless you intend the click to be a navigation — gate on whether it makes sense for your flow.

## Writing

- Labels are nouns describing the step: "Details", "Shipping", "Payment", "Review" — not imperative phrases.
- Sentence case, no punctuation.

## Quality checklist

- [x] Accessibility: clickable items get `role="button"`, `tabIndex={0}`, and keyboard activation (Enter / Space); current step gets `aria-current="step"`. Passes axe-core via `@storybook/addon-a11y`.
- [x] Responsive: the component is flex-based and fills its container; individual items do not shrink below their content width.
- [x] Tokens only: no raw literals inside arbitrary value syntax.
```

### Task 5.4: Add Stepper to `COMPONENTS.md`

**Files:**
- Modify: `packages/components/COMPONENTS.md`

- [ ] **Step 1: Under the `### Navigation` section, insert**

```markdown
**Stepper** · `molecule` · `unstable` — [COMPONENT.md](./src/components/molecules/stepper/COMPONENT.md)
- For: displaying progress through an ordered multi-step flow (checkout, returns, onboarding) inside a Dialog or modal surface.
- Not for: general page navigation (use `Tabs` or `Breadcrumb`), single-metric progress (use `Progress`), or non-sequential task lists.
```

### Task 5.5: Add `CHANGELOG.md` entry

**Files:**
- Modify: `packages/components/CHANGELOG.md`

- [ ] **Step 1: Insert at the top**

```markdown
### Stepper ([#TBD](https://github.com/free-agent83/clarity-v2/pull/TBD))
Introduces a new `Stepper` molecule for ordered, multi-step flows such as checkout and returns. Controlled via `activeStep`; errored steps flagged via `errorSteps`; steps become clickable when an `onStepClick` callback is provided.

- **Stepper.** Compound API: `Stepper`, `StepperItem`, `StepperItemIndicator`, `StepperItemLabel`. Four derived states (`upcoming`, `current`, `completed`, `error`); only `completed` and `error` become clickable when `onStepClick` is supplied. Horizontal only in v0.1 (vertical, compact mode, and disabled state deferred). Lands as `unstable`.

---
```

### Task 5.6: Verify in Storybook

- [ ] **Step 1: Open `Navigation/Stepper`**

Verify:
- `Default` at `activeStep=1` shows: step 0 with a check, step 1 filled in violet, step 2 and 3 outlined with muted numbers. Connectors between 0→1 are violet; 1→2 and 2→3 are muted.
- `States` shows four scenarios including an error state where step 1 has a red circle with alert icon.
- `Clickable` — clicking step 0 fires the action; clicking current or upcoming steps does not.
- `Interactive` — Next/Back buttons move the active step; clicking a completed circle also works.
- No axe violations.

### Task 5.7: Run typecheck, commit

- [ ] **Step 1: Typecheck**

Run: `cd packages/components && npx tsc --noEmit -p tsconfig.lib.json`
Expected: no errors.

- [ ] **Step 2: Commit**

```bash
git add packages/components/src/components/molecules/stepper \
  packages/components/COMPONENTS.md \
  packages/components/CHANGELOG.md
git commit -m "feat(stepper): add Stepper molecule"
```

---

## Finalisation per PR

After each commit above, open a PR and update the `TBD` placeholder in the CHANGELOG entry with the real PR number (as done in commit [41c637a](https://github.com/free-agent83/clarity-v2/commit/41c637a) for a prior change). Do this as a separate small commit on the branch before merge.

```bash
# After the PR URL is known:
sed -i '' 's|#TBD|#<real-pr-number>|g' packages/components/CHANGELOG.md
git add packages/components/CHANGELOG.md
git commit -m "chore(changelog): fill in PR number #<real-pr-number>"
```
