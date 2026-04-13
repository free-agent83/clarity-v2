# Seed system with base shadcn components

**Issue:** [#103](https://github.com/free-agent83/clarity-v2/issues/103)
**Date:** 2026-04-13
**Status:** Approved

---

## Goal

Add all 50 remaining shadcn/ui components to the Clarity V2 component library (51 total including the existing Button). Each component gets a single Default story in Storybook and a scaffolded COMPONENT.md with all required sections present but marked `[WIP]`. No tests, a11y, token remapping, or visual customisation — just seed, paint, and scaffold docs.

## Scope decisions

- **Full shadcn/ui catalogue minus 7 exclusions:** Native Select, Date Picker, Calendar, Context Menu, Menubar, Toast (using Sonner instead), Resizable.
- **Icon Button removed from taxonomy:** will be an icon-only variant of Button.
- **Chip deferred:** not part of this issue.
- **Button already exists:** only fix needed is sidebar title `"Atoms/Button"` → `"Actions/Button"`.

## Approach

**CLI scaffold + adapt, in category batches (Option B).**

For each batch:

1. Run `npx shadcn add <components>` to scaffold into `components/ui/`.
2. Rename files to kebab-case.
3. Move into the correct `components/{atoms|molecules|organisms}/<name>/` folder.
4. Write a single Default CSF3 story with `tags: ["autodocs"]` and category-based sidebar `title`.
5. Wire up barrel exports in `src/index.ts`.
6. Delete the scaffolded `ui/` remnants.

### Per-component deliverables

| File | Purpose |
|---|---|
| `<name>.tsx` | Component implementation (from shadcn CLI, adapted) |
| `<name>.stories.tsx` | Single Default story |
| `COMPONENT.md` | Scaffolded docs — frontmatter + all sections with `[WIP]` content |

### What a Default story looks like

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Component } from "./component";

const meta: Meta<typeof Component> = {
  title: "Category/Component Name",
  component: Component,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Default: Story = {
  args: { /* minimal props to render */ },
};
```

`argTypes` with `control: "select"` added only when the component has variant/enum props out of the box from shadcn.

### What a scaffolded COMPONENT.md looks like

```md
---
name: ComponentName
slug: component-name
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# ComponentName

[WIP]

## Props

[WIP]

## Usage guidelines

[WIP]

## Best practices

[WIP]

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values
```

The optional **Writing** section is omitted from the scaffold. It will be added per-component only when relevant during the individual component issues.

### What is NOT in scope

- Tests, a11y checks, play functions
- Token remapping or visual customisation
- Multiple stories per component (variants, sizes, states, compound variants)
- Populating COMPONENT.md content (that happens in individual component issues)

## Batch order

### 1. Forms (14 components)

| Component | Classification | Folder |
|---|---|---|
| Input | atom | `atoms/input/` |
| Textarea | atom | `atoms/textarea/` |
| Select | molecule | `molecules/select/` |
| Checkbox | atom | `atoms/checkbox/` |
| Radio Group | atom | `atoms/radio-group/` |
| Switch | atom | `atoms/switch/` |
| Slider | atom | `atoms/slider/` |
| Label | atom | `atoms/label/` |
| Toggle Group | molecule | `molecules/toggle-group/` |
| Toggle | atom | `atoms/toggle/` |
| Input OTP | molecule | `molecules/input-otp/` |
| Input Group | molecule | `molecules/input-group/` |
| Field | molecule | `molecules/field/` |
| Combobox | molecule | `molecules/combobox/` |

### 2. Actions (3 components)

| Component | Classification | Folder |
|---|---|---|
| Button Group | molecule | `molecules/button-group/` |
| Dropdown Menu | molecule | `molecules/dropdown-menu/` |
| Command | molecule | `molecules/command/` |

### 3. Overlays (7 components)

| Component | Classification | Folder |
|---|---|---|
| Dialog | molecule | `molecules/dialog/` |
| Alert Dialog | molecule | `molecules/alert-dialog/` |
| Sheet | molecule | `molecules/sheet/` |
| Drawer | molecule | `molecules/drawer/` |
| Popover | molecule | `molecules/popover/` |
| Tooltip | molecule | `molecules/tooltip/` |
| Hover Card | molecule | `molecules/hover-card/` |

### 4. Feedback (6 components)

| Component | Classification | Folder |
|---|---|---|
| Alert | atom | `atoms/alert/` |
| Sonner | molecule | `molecules/sonner/` |
| Progress | atom | `atoms/progress/` |
| Skeleton | atom | `atoms/skeleton/` |
| Spinner | atom | `atoms/spinner/` |
| Empty | atom | `atoms/empty/` |

### 5. Display (10 components)

| Component | Classification | Folder |
|---|---|---|
| Card | molecule | `molecules/card/` |
| Badge | atom | `atoms/badge/` |
| Avatar | atom | `atoms/avatar/` |
| Separator | atom | `atoms/separator/` |
| Carousel | molecule | `molecules/carousel/` |
| Aspect Ratio | atom | `atoms/aspect-ratio/` |
| Scroll Area | atom | `atoms/scroll-area/` |
| Collapsible | molecule | `molecules/collapsible/` |
| Typography | atom | `atoms/typography/` |
| Kbd | atom | `atoms/kbd/` |

### 6. Data (3 components)

| Component | Classification | Folder |
|---|---|---|
| Table | molecule | `molecules/table/` |
| Data Table | organism | `organisms/data-table/` |
| Chart | organism | `organisms/chart/` |

### 7. Navigation (6 components)

| Component | Classification | Folder |
|---|---|---|
| Tabs | molecule | `molecules/tabs/` |
| Accordion | molecule | `molecules/accordion/` |
| Breadcrumbs | molecule | `molecules/breadcrumb/` |
| Navigation Menu | molecule | `molecules/navigation-menu/` |
| Pagination | molecule | `molecules/pagination/` |
| Sidebar | organism | `organisms/sidebar/` |

### 8. Layout (2 components)

| Component | Classification | Folder |
|---|---|---|
| Direction | atom | `atoms/direction/` |
| Item | atom | `atoms/item/` |

## Existing fixes

- **Button story title:** `"Atoms/Button"` → `"Actions/Button"`

## Doc updates

- **CONTRIBUTING.md:** Resolve shadcn CLI open question (CLI scaffold + adapt), remove Icon Button from taxonomy, add full 50-component category mapping.
- **CHANGELOG.md:** New file in `packages/components/` documenting this seed work.
