# Seed System with Base shadcn Components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add all 50 remaining shadcn/ui components to the Clarity V2 component library with a Default story and scaffolded COMPONENT.md each.

**Architecture:** shadcn CLI scaffolds components into a temporary `src/components/ui/` directory. Each component is then moved into the correct `atoms/`/`molecules/`/`organisms/` folder with kebab-case naming, a Default CSF3 story, a scaffolded COMPONENT.md, and a barrel export in `src/index.ts`. Work proceeds in 8 category batches.

**Tech Stack:** React 19, Tailwind v4, shadcn/ui CLI, Storybook 8 (CSF3), CVA, Radix UI, TypeScript

**Spec:** `docs/superpowers/specs/2026-04-13-seed-shadcn-components-design.md`

---

## Conventions used throughout this plan

All paths are relative to `packages/components/` unless stated otherwise.

### Story template

Every component gets a story following this pattern. Adapt imports, title, and args per component.

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ComponentName } from "./component-name";

const meta: Meta<typeof ComponentName> = {
  title: "Category/Component Name",
  component: ComponentName,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {
  args: {},
};
```

For components that are multi-part (e.g. Dialog has DialogTrigger, DialogContent, etc.), the story renders a composed example using all sub-components, and only the root component is passed to `meta.component`.

### COMPONENT.md template

Every component gets a COMPONENT.md following this pattern. Adapt name, slug, and heading.

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

### Barrel export pattern

Each component added to `src/index.ts` follows the existing Button pattern:

```tsx
export { ComponentName } from "./components/atoms/component-name/component-name";
export type { ComponentNameProps } from "./components/atoms/component-name/component-name";
```

For multi-part components, export all sub-components:

```tsx
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "./components/molecules/dialog/dialog";
```

### Import path fix for shadcn CLI output

shadcn CLI generates imports using `@/lib/utils`. This path alias is already configured in `tsconfig.json` (`"@/*": ["./src/*"]`), so these imports work as-is. Do not change them.

However, shadcn CLI may also generate imports like `import { cn } from "@/lib/utils"` inside component files. Since `src/lib/utils.ts` already exists with the `cn` function, these imports resolve correctly. No action needed.

---

## Task 0: Setup — Initialize shadcn CLI and update docs

**Files:**
- Create: `packages/components/components.json`
- Modify: `packages/components/CONTRIBUTING.md`
- Create: `packages/components/CHANGELOG.md`
- Modify: `packages/components/src/components/atoms/button/button.stories.tsx`
- Create: `packages/components/src/components/atoms/button/COMPONENT.md`

### shadcn init

- [ ] **Step 0.1: Initialize shadcn CLI configuration**

Run from `packages/components/`:

```bash
npx shadcn@latest init
```

When prompted, select:
- Style: **New York**
- Base color: **Neutral** (we use our own tokens, this is just for defaults)
- CSS variables: **Yes**
- `tailwind.config` path: skip / leave default (Tailwind v4 uses CSS-based config)
- Components alias: `@/components`
- Utils alias: `@/lib/utils`

This creates `components.json`. The CLI needs this file to know where to scaffold components.

If the interactive prompts don't match exactly (CLI versions vary), the goal is to get a `components.json` that points `aliases.components` at `@/components` and `aliases.utils` at `@/lib/utils`. Edit the file manually if needed to match:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

Key: `"rsc": false` — this is not a Next.js project, no React Server Components.

- [ ] **Step 0.2: Verify the CLI works by scaffolding a test component**

```bash
cd packages/components && npx shadcn@latest add badge -y
```

Check that `src/components/ui/badge.tsx` was created. Read the file to confirm it imports from `@/lib/utils`. Then delete it:

```bash
rm -rf src/components/ui/badge.tsx
```

If `src/components/ui/` is now empty, remove it:

```bash
rmdir src/components/ui 2>/dev/null || true
```

### Fix existing Button

- [ ] **Step 0.3: Fix Button story sidebar title**

In `src/components/atoms/button/button.stories.tsx`, change:

```tsx
// Old
title: "Atoms/Button",

// New
title: "Actions/Button",
```

- [ ] **Step 0.4: Add Button COMPONENT.md scaffold**

Create `src/components/atoms/button/COMPONENT.md`:

```md
---
name: Button
slug: button
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Button

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

### Update CONTRIBUTING.md

- [ ] **Step 0.5: Update CONTRIBUTING.md**

Three changes to `packages/components/CONTRIBUTING.md`:

**Change 1 — Resolve the shadcn CLI open question.** Replace the entire `## shadcn CLI (open question)` section at the bottom with:

```md
## shadcn CLI

Components are scaffolded using the shadcn CLI and then adapted to project conventions:

1. Run `npx shadcn@latest add <component>` — scaffolds into `src/components/ui/`
2. Rename files to kebab-case if needed
3. Move into the correct `atoms/`/`molecules/`/`organisms/` folder
4. Adapt imports, exports, and conventions per this document
5. Delete the `ui/` remnant

The `components.json` in this package root configures the CLI. Do not modify it without checking with the design lead.
```

**Change 2 — Remove Icon Button from the sidebar taxonomy.** In the `### Sidebar taxonomy` section, change the Actions line from:

```
Actions/        Button, Icon Button, Dropdown Menu
```

to:

```
Actions/        Button, Button Group, Dropdown Menu, Command
```

**Change 3 — Update the full sidebar taxonomy to match the approved component list.** Replace the entire taxonomy block with:

```
Foundations/    Colors, spacing, typography, radius
Forms/          Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider, Label, Toggle Group, Toggle, Input OTP, Input Group, Field, Combobox
Actions/        Button, Button Group, Dropdown Menu, Command
Overlays/       Dialog, Alert Dialog, Sheet, Drawer, Popover, Tooltip, Hover Card
Feedback/       Alert, Sonner, Progress, Skeleton, Spinner, Empty
Display/        Card, Badge, Avatar, Separator, Carousel, Aspect Ratio, Scroll Area, Collapsible, Typography, Kbd
Data/           Table, Data Table, Chart
Navigation/     Tabs, Accordion, Breadcrumbs, Navigation Menu, Pagination, Sidebar
Layout/         Direction, Item
Templates/      [Phase C — PLP, PDP, Dashboard, Auth, Checkout, Settings]
Docs/           [Phase C — Getting started, Prompt patterns, Migration from MUI]
```

### Create CHANGELOG.md

- [ ] **Step 0.6: Create packages/components/CHANGELOG.md**

```md
# Changelog

All notable changes to the Clarity V2 component library.

Format follows [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Added
- Seeded all base shadcn/ui components (51 total) with Default stories and scaffolded COMPONENT.md files (#103)
- Resolved shadcn CLI approach in CONTRIBUTING.md — CLI scaffold + adapt
- Updated sidebar taxonomy with full component-to-category mapping
- Added Layout category (Direction, Item)

### Changed
- Button story sidebar title from `Atoms/Button` to `Actions/Button`
- Removed Icon Button from taxonomy (will be an icon-only Button variant)

### Removed
- 7 shadcn components excluded from scope: Native Select, Date Picker, Calendar, Context Menu, Menubar, Toast, Resizable
```

- [ ] **Step 0.7: Verify Storybook still runs with the Button change**

```bash
cd packages/components && npx storybook dev -p 6006 --no-open &
sleep 10 && curl -s -o /dev/null -w "%{http_code}" http://localhost:6006
kill %1
```

Expected: HTTP 200. If Storybook doesn't start, check the console output for errors.

- [ ] **Step 0.8: Commit**

```bash
git add packages/components/components.json \
       packages/components/CONTRIBUTING.md \
       packages/components/CHANGELOG.md \
       packages/components/src/components/atoms/button/button.stories.tsx \
       packages/components/src/components/atoms/button/COMPONENT.md
git commit -m "chore: initialize shadcn CLI, fix Button title, update docs (#103)"
```

---

## Task 1: Forms batch (14 components)

**Files:**
- Create: 14 component `.tsx` files, 14 `.stories.tsx` files, 14 `COMPONENT.md` files
- Modify: `src/index.ts`

### Components in this batch

| Component | shadcn name | Folder | Storybook title | Classification |
|---|---|---|---|---|
| Input | `input` | `atoms/input/` | `Forms/Input` | atom |
| Textarea | `textarea` | `atoms/textarea/` | `Forms/Textarea` | atom |
| Select | `select` | `molecules/select/` | `Forms/Select` | molecule |
| Checkbox | `checkbox` | `atoms/checkbox/` | `Forms/Checkbox` | atom |
| Radio Group | `radio-group` | `atoms/radio-group/` | `Forms/Radio Group` | atom |
| Switch | `switch` | `atoms/switch/` | `Forms/Switch` | atom |
| Slider | `slider` | `atoms/slider/` | `Forms/Slider` | atom |
| Label | `label` | `atoms/label/` | `Forms/Label` | atom |
| Toggle Group | `toggle-group` | `molecules/toggle-group/` | `Forms/Toggle Group` | molecule |
| Toggle | `toggle` | `atoms/toggle/` | `Forms/Toggle` | atom |
| Input OTP | `input-otp` | `molecules/input-otp/` | `Forms/Input OTP` | molecule |
| Input Group | `input-group` | `molecules/input-group/` | `Forms/Input Group` | molecule |
| Field | `field` | `molecules/field/` | `Forms/Field` | molecule |
| Combobox | `combobox` | `molecules/combobox/` | `Forms/Combobox` | molecule |

- [ ] **Step 1.1: Scaffold all Forms components via CLI**

```bash
cd packages/components && npx shadcn@latest add input textarea select checkbox radio-group switch slider label toggle-group toggle input-otp -y
```

Note: `input-group`, `field`, and `combobox` may not be available as CLI components (they are patterns/compositions in shadcn, not standalone CLI components). Check what the CLI actually scaffolds. If any fail, note them — they will need to be created manually as thin wrappers or placeholder components.

- [ ] **Step 1.2: Check what was scaffolded**

```bash
ls src/components/ui/
```

List the files. For each file that was created, proceed with restructuring. For components that weren't scaffolded by the CLI (likely `input-group`, `field`, `combobox`), create minimal placeholder components manually in Step 1.4.

- [ ] **Step 1.3: Restructure CLI-scaffolded components**

For each scaffolded component, move it to the correct folder. Example for Input:

```bash
mkdir -p src/components/atoms/input
mv src/components/ui/input.tsx src/components/atoms/input/input.tsx
```

Full move commands (adjust based on what was actually scaffolded in Step 1.2):

```bash
# Atoms
mkdir -p src/components/atoms/input
mv src/components/ui/input.tsx src/components/atoms/input/input.tsx

mkdir -p src/components/atoms/textarea
mv src/components/ui/textarea.tsx src/components/atoms/textarea/textarea.tsx

mkdir -p src/components/atoms/checkbox
mv src/components/ui/checkbox.tsx src/components/atoms/checkbox/checkbox.tsx

mkdir -p src/components/atoms/radio-group
mv src/components/ui/radio-group.tsx src/components/atoms/radio-group/radio-group.tsx

mkdir -p src/components/atoms/switch
mv src/components/ui/switch.tsx src/components/atoms/switch/switch.tsx

mkdir -p src/components/atoms/slider
mv src/components/ui/slider.tsx src/components/atoms/slider/slider.tsx

mkdir -p src/components/atoms/label
mv src/components/ui/label.tsx src/components/atoms/label/label.tsx

mkdir -p src/components/atoms/toggle
mv src/components/ui/toggle.tsx src/components/atoms/toggle/toggle.tsx

# Molecules
mkdir -p src/components/molecules/select
mv src/components/ui/select.tsx src/components/molecules/select/select.tsx

mkdir -p src/components/molecules/toggle-group
mv src/components/ui/toggle-group.tsx src/components/molecules/toggle-group/toggle-group.tsx

mkdir -p src/components/molecules/input-otp
mv src/components/ui/input-otp.tsx src/components/molecules/input-otp/input-otp.tsx
```

Fix internal imports if any component references another (e.g. Toggle Group importing Toggle). The shadcn CLI uses `@/components/ui/toggle` — update to the new path like `@/components/atoms/toggle/toggle`.

- [ ] **Step 1.4: Create manually-built components (if not scaffolded by CLI)**

For components the CLI doesn't provide (likely `input-group`, `field`, `combobox`), create minimal placeholder implementations. These are thin compositions that will be built out properly in their own issues.

**Input Group** (`src/components/molecules/input-group/input-group.tsx`):

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center", className)} {...props} />
  )
);
InputGroup.displayName = "InputGroup";

export { InputGroup };
```

**Field** (`src/components/molecules/field/field.tsx`):

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {}

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  )
);
Field.displayName = "Field";

export { Field };
```

**Combobox** (`src/components/molecules/combobox/combobox.tsx`):

Combobox in shadcn is a pattern combining Popover + Command. If the CLI doesn't scaffold it, create a placeholder:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface ComboboxProps extends React.HTMLAttributes<HTMLDivElement> {}

const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("relative", className)} {...props}>
      {props.children ?? <span className="text-muted-foreground text-sm">[Combobox — composed from Popover + Command]</span>}
    </div>
  )
);
Combobox.displayName = "Combobox";

export { Combobox };
```

- [ ] **Step 1.5: Write Default stories for all Forms components**

Create a `.stories.tsx` file in each component folder. Examples for representative components:

**Simple atom** — `src/components/atoms/input/input.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "Forms/Input",
  component: Input,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};
```

**Multi-part molecule** — `src/components/molecules/select/select.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select";

const meta: Meta<typeof Select> = {
  title: "Forms/Select",
  component: Select,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option-1">Option 1</SelectItem>
        <SelectItem value="option-2">Option 2</SelectItem>
        <SelectItem value="option-3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  ),
};
```

Apply the same pattern for all 14 components. For each:
- Simple atoms (Input, Textarea, Checkbox, Switch, Slider, Label, Toggle): `args` with minimal props
- Multi-part molecules (Select, Radio Group, Toggle Group, Input OTP): `render` function composing sub-components
- Manual components (Input Group, Field, Combobox): `args` with `children` showing a simple composition

For each story, read the scaffolded `.tsx` file first to identify what the component exports and what props it takes, then write the story accordingly.

- [ ] **Step 1.6: Write COMPONENT.md for all Forms components**

Create a `COMPONENT.md` in each component folder using the template from the Conventions section. For each component, set the correct `name` (PascalCase), `slug` (kebab-case), and `# heading`.

Example for Input — `src/components/atoms/input/COMPONENT.md`:

```md
---
name: Input
slug: input
version: 0.1.0
status: unstable
lastUpdated: 2026-04-13
---

# Input

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

Repeat for all 14 components with the appropriate name/slug values.

- [ ] **Step 1.7: Add barrel exports to src/index.ts**

Add exports for all Forms components. Read each `.tsx` file to identify the exact export names, then add them to `src/index.ts`. Pattern:

```tsx
// Forms — atoms
export { Input } from "./components/atoms/input/input";
export type { InputProps } from "./components/atoms/input/input";

export { Textarea } from "./components/atoms/textarea/textarea";
export type { TextareaProps } from "./components/atoms/textarea/textarea";

export { Checkbox } from "./components/atoms/checkbox/checkbox";
// ... continue for all exported names from each component
```

For multi-part components like Select, export all sub-components:

```tsx
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton } from "./components/molecules/select/select";
```

Read each scaffolded file to get the exact list of exports — shadcn components vary in what they export.

- [ ] **Step 1.8: Clean up ui/ directory**

```bash
rm -rf src/components/ui
```

- [ ] **Step 1.9: Verify Storybook renders all Forms stories**

```bash
cd packages/components && npx storybook dev -p 6006 --no-open &
sleep 10 && curl -s -o /dev/null -w "%{http_code}" http://localhost:6006
kill %1
```

Also verify TypeScript compiles:

```bash
cd packages/components && npx tsc --noEmit
```

Fix any errors before committing.

- [ ] **Step 1.10: Commit**

```bash
git add packages/components/src/
git commit -m "feat(components): seed Forms batch — 14 components with Default stories (#103)"
```

---

## Task 2: Actions batch (3 components)

**Files:**
- Create: 3 component `.tsx` files, 3 `.stories.tsx` files, 3 `COMPONENT.md` files
- Modify: `src/index.ts`

### Components in this batch

| Component | shadcn name | Folder | Storybook title |
|---|---|---|---|
| Button Group | `button-group` | `molecules/button-group/` | `Actions/Button Group` |
| Dropdown Menu | `dropdown-menu` | `molecules/dropdown-menu/` | `Actions/Dropdown Menu` |
| Command | `command` | `molecules/command/` | `Actions/Command` |

- [ ] **Step 2.1: Scaffold via CLI**

```bash
cd packages/components && npx shadcn@latest add dropdown-menu command -y
```

Note: `button-group` is likely not a CLI component. Check and create manually if needed.

- [ ] **Step 2.2: Check what was scaffolded and restructure**

```bash
ls src/components/ui/
```

Move scaffolded components:

```bash
mkdir -p src/components/molecules/dropdown-menu
mv src/components/ui/dropdown-menu.tsx src/components/molecules/dropdown-menu/dropdown-menu.tsx

mkdir -p src/components/molecules/command
mv src/components/ui/command.tsx src/components/molecules/command/command.tsx
```

- [ ] **Step 2.3: Create Button Group manually (if not scaffolded)**

`src/components/molecules/button-group/button-group.tsx`:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center [&>button]:rounded-none [&>button:first-child]:rounded-l-lg [&>button:last-child]:rounded-r-lg", className)}
      role="group"
      {...props}
    />
  )
);
ButtonGroup.displayName = "ButtonGroup";

export { ButtonGroup };
```

- [ ] **Step 2.4: Write Default stories**

**Dropdown Menu** — `src/components/molecules/dropdown-menu/dropdown-menu.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./dropdown-menu";

const meta: Meta<typeof DropdownMenu> = {
  title: "Actions/Dropdown Menu",
  component: DropdownMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Item 1</DropdownMenuItem>
        <DropdownMenuItem>Item 2</DropdownMenuItem>
        <DropdownMenuItem>Item 3</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
```

**Command** — `src/components/molecules/command/command.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "./command";

const meta: Meta<typeof Command> = {
  title: "Actions/Command",
  component: Command,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Command>;

export const Default: Story = {
  render: () => (
    <Command>
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Item 1</CommandItem>
          <CommandItem>Item 2</CommandItem>
          <CommandItem>Item 3</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
```

**Button Group** — `src/components/molecules/button-group/button-group.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ButtonGroup } from "./button-group";
import { Button } from "../../atoms/button/button";

const meta: Meta<typeof ButtonGroup> = {
  title: "Actions/Button Group",
  component: ButtonGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outlined">Left</Button>
      <Button variant="outlined">Center</Button>
      <Button variant="outlined">Right</Button>
    </ButtonGroup>
  ),
};
```

- [ ] **Step 2.5: Write COMPONENT.md for all 3 components**

Use the COMPONENT.md template. Names/slugs: `ButtonGroup`/`button-group`, `DropdownMenu`/`dropdown-menu`, `Command`/`command`.

- [ ] **Step 2.6: Add barrel exports to src/index.ts**

Read each `.tsx` to get exact export names, then add to `src/index.ts`.

- [ ] **Step 2.7: Clean up ui/ directory**

```bash
rm -rf src/components/ui
```

- [ ] **Step 2.8: Verify Storybook and TypeScript**

```bash
cd packages/components && npx tsc --noEmit
cd packages/components && npx storybook dev -p 6006 --no-open &
sleep 10 && curl -s -o /dev/null -w "%{http_code}" http://localhost:6006
kill %1
```

- [ ] **Step 2.9: Commit**

```bash
git add packages/components/src/
git commit -m "feat(components): seed Actions batch — 3 components with Default stories (#103)"
```

---

## Task 3: Overlays batch (7 components)

**Files:**
- Create: 7 component `.tsx` files, 7 `.stories.tsx` files, 7 `COMPONENT.md` files
- Modify: `src/index.ts`

### Components in this batch

| Component | shadcn name | Folder | Storybook title |
|---|---|---|---|
| Dialog | `dialog` | `molecules/dialog/` | `Overlays/Dialog` |
| Alert Dialog | `alert-dialog` | `molecules/alert-dialog/` | `Overlays/Alert Dialog` |
| Sheet | `sheet` | `molecules/sheet/` | `Overlays/Sheet` |
| Drawer | `drawer` | `molecules/drawer/` | `Overlays/Drawer` |
| Popover | `popover` | `molecules/popover/` | `Overlays/Popover` |
| Tooltip | `tooltip` | `molecules/tooltip/` | `Overlays/Tooltip` |
| Hover Card | `hover-card` | `molecules/hover-card/` | `Overlays/Hover Card` |

- [ ] **Step 3.1: Scaffold via CLI**

```bash
cd packages/components && npx shadcn@latest add dialog alert-dialog sheet drawer popover tooltip hover-card -y
```

- [ ] **Step 3.2: Restructure**

```bash
mkdir -p src/components/molecules/{dialog,alert-dialog,sheet,drawer,popover,tooltip,hover-card}

mv src/components/ui/dialog.tsx src/components/molecules/dialog/dialog.tsx
mv src/components/ui/alert-dialog.tsx src/components/molecules/alert-dialog/alert-dialog.tsx
mv src/components/ui/sheet.tsx src/components/molecules/sheet/sheet.tsx
mv src/components/ui/drawer.tsx src/components/molecules/drawer/drawer.tsx
mv src/components/ui/popover.tsx src/components/molecules/popover/popover.tsx
mv src/components/ui/tooltip.tsx src/components/molecules/tooltip/tooltip.tsx
mv src/components/ui/hover-card.tsx src/components/molecules/hover-card/hover-card.tsx
```

Fix any cross-component imports (e.g. Drawer may import Dialog internally).

- [ ] **Step 3.3: Write Default stories**

All Overlay components are multi-part. Each story uses a `render` function. Example for Dialog:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog";

const meta: Meta<typeof Dialog> = {
  title: "Overlays/Dialog",
  component: Dialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger>Open dialog</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dialog title</DialogTitle>
          <DialogDescription>Dialog description goes here.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};
```

Follow the same pattern for all 7 components. Read each scaffolded `.tsx` to identify sub-components, then compose a minimal example in the `render` function.

- [ ] **Step 3.4: Write COMPONENT.md for all 7 components**

Use the COMPONENT.md template with correct name/slug for each.

- [ ] **Step 3.5: Add barrel exports to src/index.ts**

- [ ] **Step 3.6: Clean up, verify, commit**

```bash
rm -rf src/components/ui
cd packages/components && npx tsc --noEmit
git add packages/components/src/
git commit -m "feat(components): seed Overlays batch — 7 components with Default stories (#103)"
```

---

## Task 4: Feedback batch (6 components)

**Files:**
- Create: 6 component `.tsx` files, 6 `.stories.tsx` files, 6 `COMPONENT.md` files
- Modify: `src/index.ts`

### Components in this batch

| Component | shadcn name | Folder | Storybook title |
|---|---|---|---|
| Alert | `alert` | `atoms/alert/` | `Feedback/Alert` |
| Sonner | `sonner` | `molecules/sonner/` | `Feedback/Sonner` |
| Progress | `progress` | `atoms/progress/` | `Feedback/Progress` |
| Skeleton | `skeleton` | `atoms/skeleton/` | `Feedback/Skeleton` |
| Spinner | `spinner` | `atoms/spinner/` | `Feedback/Spinner` |
| Empty | `empty` | `atoms/empty/` | `Feedback/Empty` |

- [ ] **Step 4.1: Scaffold via CLI**

```bash
cd packages/components && npx shadcn@latest add alert sonner progress skeleton spinner -y
```

Note: `empty` is likely not a CLI component. Check and create manually if needed.

- [ ] **Step 4.2: Restructure scaffolded components**

```bash
mkdir -p src/components/atoms/{alert,progress,skeleton,spinner}
mkdir -p src/components/molecules/sonner

mv src/components/ui/alert.tsx src/components/atoms/alert/alert.tsx
mv src/components/ui/sonner.tsx src/components/molecules/sonner/sonner.tsx
mv src/components/ui/progress.tsx src/components/atoms/progress/progress.tsx
mv src/components/ui/skeleton.tsx src/components/atoms/skeleton/skeleton.tsx
mv src/components/ui/spinner.tsx src/components/atoms/spinner/spinner.tsx
```

Adjust based on what was actually scaffolded.

- [ ] **Step 4.3: Create Empty manually (if not scaffolded)**

`src/components/atoms/empty/empty.tsx`:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
      {...props}
    >
      {children ?? (
        <p className="text-sm text-muted-foreground">No content</p>
      )}
    </div>
  )
);
Empty.displayName = "Empty";

export { Empty };
```

- [ ] **Step 4.4: Write Default stories**

Example for Alert — `src/components/atoms/alert/alert.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Alert, AlertTitle, AlertDescription } from "./alert";

const meta: Meta<typeof Alert> = {
  title: "Feedback/Alert",
  component: Alert,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>Alert title</AlertTitle>
      <AlertDescription>This is an alert description.</AlertDescription>
    </Alert>
  ),
};
```

Example for Sonner — `src/components/molecules/sonner/sonner.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Toaster } from "./sonner";
import { toast } from "sonner";

const meta: Meta<typeof Toaster> = {
  title: "Feedback/Sonner",
  component: Toaster,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

export const Default: Story = {
  render: () => (
    <div>
      <Toaster />
      <button onClick={() => toast("Hello from Sonner!")}>Show toast</button>
    </div>
  ),
};
```

Follow the same pattern for Progress, Skeleton, Spinner, and Empty. Read each `.tsx` first to identify props/exports.

- [ ] **Step 4.5: Write COMPONENT.md for all 6 components**

- [ ] **Step 4.6: Add barrel exports, clean up, verify, commit**

```bash
rm -rf src/components/ui
cd packages/components && npx tsc --noEmit
git add packages/components/src/
git commit -m "feat(components): seed Feedback batch — 6 components with Default stories (#103)"
```

---

## Task 5: Display batch (10 components)

**Files:**
- Create: 10 component `.tsx` files, 10 `.stories.tsx` files, 10 `COMPONENT.md` files
- Modify: `src/index.ts`

### Components in this batch

| Component | shadcn name | Folder | Storybook title |
|---|---|---|---|
| Card | `card` | `molecules/card/` | `Display/Card` |
| Badge | `badge` | `atoms/badge/` | `Display/Badge` |
| Avatar | `avatar` | `atoms/avatar/` | `Display/Avatar` |
| Separator | `separator` | `atoms/separator/` | `Display/Separator` |
| Carousel | `carousel` | `molecules/carousel/` | `Display/Carousel` |
| Aspect Ratio | `aspect-ratio` | `atoms/aspect-ratio/` | `Display/Aspect Ratio` |
| Scroll Area | `scroll-area` | `atoms/scroll-area/` | `Display/Scroll Area` |
| Collapsible | `collapsible` | `molecules/collapsible/` | `Display/Collapsible` |
| Typography | `typography` | `atoms/typography/` | `Display/Typography` |
| Kbd | `kbd` | `atoms/kbd/` | `Display/Kbd` |

- [ ] **Step 5.1: Scaffold via CLI**

```bash
cd packages/components && npx shadcn@latest add card badge avatar separator carousel aspect-ratio scroll-area collapsible -y
```

Note: `typography` and `kbd` may not be CLI components. Check and create manually if needed.

- [ ] **Step 5.2: Restructure scaffolded components**

```bash
mkdir -p src/components/atoms/{badge,avatar,separator,aspect-ratio,scroll-area,typography,kbd}
mkdir -p src/components/molecules/{card,carousel,collapsible}

mv src/components/ui/card.tsx src/components/molecules/card/card.tsx
mv src/components/ui/badge.tsx src/components/atoms/badge/badge.tsx
mv src/components/ui/avatar.tsx src/components/atoms/avatar/avatar.tsx
mv src/components/ui/separator.tsx src/components/atoms/separator/separator.tsx
mv src/components/ui/carousel.tsx src/components/molecules/carousel/carousel.tsx
mv src/components/ui/aspect-ratio.tsx src/components/atoms/aspect-ratio/aspect-ratio.tsx
mv src/components/ui/scroll-area.tsx src/components/atoms/scroll-area/scroll-area.tsx
mv src/components/ui/collapsible.tsx src/components/molecules/collapsible/collapsible.tsx
```

- [ ] **Step 5.3: Create Typography and Kbd manually (if not scaffolded)**

**Typography** (`src/components/atoms/typography/typography.tsx`):

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: "h1" | "h2" | "h3" | "h4" | "p" | "lead" | "large" | "small" | "muted";
}

const variantMap: Record<string, { tag: string; className: string }> = {
  h1: { tag: "h1", className: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl" },
  h2: { tag: "h2", className: "scroll-m-20 text-3xl font-semibold tracking-tight" },
  h3: { tag: "h3", className: "scroll-m-20 text-2xl font-semibold tracking-tight" },
  h4: { tag: "h4", className: "scroll-m-20 text-xl font-semibold tracking-tight" },
  p: { tag: "p", className: "leading-7" },
  lead: { tag: "p", className: "text-xl text-muted-foreground" },
  large: { tag: "p", className: "text-lg font-semibold" },
  small: { tag: "p", className: "text-sm font-medium leading-none" },
  muted: { tag: "p", className: "text-sm text-muted-foreground" },
};

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = "p", children, ...props }, ref) => {
    const { tag, className: variantClassName } = variantMap[variant];
    return React.createElement(
      tag,
      { ref, className: cn(variantClassName, className), ...props },
      children
    );
  }
);
Typography.displayName = "Typography";

export { Typography };
```

**Kbd** (`src/components/atoms/kbd/kbd.tsx`):

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {}

const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, ...props }, ref) => (
    <kbd
      ref={ref}
      className={cn(
        "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  )
);
Kbd.displayName = "Kbd";

export { Kbd };
```

- [ ] **Step 5.4: Write Default stories for all 10 components**

Read each `.tsx` to identify exports and props. Examples:

**Badge** — simple atom with variants:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "Display/Badge",
  component: Badge,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: { children: "Badge" },
};
```

**Card** — multi-part:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card";

const meta: Meta<typeof Card> = {
  title: "Display/Card",
  component: Card,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card title</CardTitle>
        <CardDescription>Card description goes here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content</p>
      </CardContent>
    </Card>
  ),
};
```

Follow the same pattern for the remaining 8 components.

- [ ] **Step 5.5: Write COMPONENT.md for all 10 components**

- [ ] **Step 5.6: Add barrel exports, clean up, verify, commit**

```bash
rm -rf src/components/ui
cd packages/components && npx tsc --noEmit
git add packages/components/src/
git commit -m "feat(components): seed Display batch — 10 components with Default stories (#103)"
```

---

## Task 6: Data batch (3 components)

**Files:**
- Create: 3 component `.tsx` files, 3 `.stories.tsx` files, 3 `COMPONENT.md` files
- Modify: `src/index.ts`

### Components in this batch

| Component | shadcn name | Folder | Storybook title |
|---|---|---|---|
| Table | `table` | `molecules/table/` | `Data/Table` |
| Data Table | `data-table` | `organisms/data-table/` | `Data/Data Table` |
| Chart | `chart` | `organisms/chart/` | `Data/Chart` |

- [ ] **Step 6.1: Scaffold via CLI**

```bash
cd packages/components && npx shadcn@latest add table chart -y
```

Note: `data-table` is a pattern in shadcn (using `@tanstack/react-table` + `table`), not a CLI component. Create a placeholder.

- [ ] **Step 6.2: Restructure**

```bash
mkdir -p src/components/molecules/table
mkdir -p src/components/organisms/{data-table,chart}

mv src/components/ui/table.tsx src/components/molecules/table/table.tsx
mv src/components/ui/chart.tsx src/components/organisms/chart/chart.tsx
```

- [ ] **Step 6.3: Create Data Table placeholder**

`src/components/organisms/data-table/data-table.tsx`:

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {}

const DataTable = React.forwardRef<HTMLDivElement, DataTableProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      {children ?? (
        <p className="text-sm text-muted-foreground p-4">
          [DataTable — built on @tanstack/react-table + Table]
        </p>
      )}
    </div>
  )
);
DataTable.displayName = "DataTable";

export { DataTable };
```

- [ ] **Step 6.4: Write Default stories**

**Table** — multi-part:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./table";

const meta: Meta<typeof Table> = {
  title: "Data/Table",
  component: Table,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Item 1</TableCell>
          <TableCell>Active</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Item 2</TableCell>
          <TableCell>Inactive</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
```

Follow the same pattern for Data Table (placeholder render) and Chart (read the scaffolded file to determine the chart API).

- [ ] **Step 6.5: Write COMPONENT.md for all 3 components**

- [ ] **Step 6.6: Add barrel exports, clean up, verify, commit**

```bash
rm -rf src/components/ui
cd packages/components && npx tsc --noEmit
git add packages/components/src/
git commit -m "feat(components): seed Data batch — 3 components with Default stories (#103)"
```

---

## Task 7: Navigation batch (6 components)

**Files:**
- Create: 6 component `.tsx` files, 6 `.stories.tsx` files, 6 `COMPONENT.md` files
- Modify: `src/index.ts`

### Components in this batch

| Component | shadcn name | Folder | Storybook title |
|---|---|---|---|
| Tabs | `tabs` | `molecules/tabs/` | `Navigation/Tabs` |
| Accordion | `accordion` | `molecules/accordion/` | `Navigation/Accordion` |
| Breadcrumbs | `breadcrumb` | `molecules/breadcrumb/` | `Navigation/Breadcrumb` |
| Navigation Menu | `navigation-menu` | `molecules/navigation-menu/` | `Navigation/Navigation Menu` |
| Pagination | `pagination` | `molecules/pagination/` | `Navigation/Pagination` |
| Sidebar | `sidebar` | `organisms/sidebar/` | `Navigation/Sidebar` |

- [ ] **Step 7.1: Scaffold via CLI**

```bash
cd packages/components && npx shadcn@latest add tabs accordion breadcrumb navigation-menu pagination sidebar -y
```

- [ ] **Step 7.2: Restructure**

```bash
mkdir -p src/components/molecules/{tabs,accordion,breadcrumb,navigation-menu,pagination}
mkdir -p src/components/organisms/sidebar

mv src/components/ui/tabs.tsx src/components/molecules/tabs/tabs.tsx
mv src/components/ui/accordion.tsx src/components/molecules/accordion/accordion.tsx
mv src/components/ui/breadcrumb.tsx src/components/molecules/breadcrumb/breadcrumb.tsx
mv src/components/ui/navigation-menu.tsx src/components/molecules/navigation-menu/navigation-menu.tsx
mv src/components/ui/pagination.tsx src/components/molecules/pagination/pagination.tsx
mv src/components/ui/sidebar.tsx src/components/organisms/sidebar/sidebar.tsx
```

Fix cross-component imports. Sidebar in particular may import from other components (Tooltip, Sheet, etc.) — update those import paths to point at their new locations.

- [ ] **Step 7.3: Write Default stories**

Example for Tabs:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

const meta: Meta<typeof Tabs> = {
  title: "Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab-1">
      <TabsList>
        <TabsTrigger value="tab-1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab-2">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1">Content for tab 1</TabsContent>
      <TabsContent value="tab-2">Content for tab 2</TabsContent>
    </Tabs>
  ),
};
```

Follow the same pattern for all 6 components. Read each `.tsx` first.

- [ ] **Step 7.4: Write COMPONENT.md for all 6 components**

- [ ] **Step 7.5: Add barrel exports, clean up, verify, commit**

```bash
rm -rf src/components/ui
cd packages/components && npx tsc --noEmit
git add packages/components/src/
git commit -m "feat(components): seed Navigation batch — 6 components with Default stories (#103)"
```

---

## Task 8: Layout batch (2 components)

**Files:**
- Create: 2 component `.tsx` files, 2 `.stories.tsx` files, 2 `COMPONENT.md` files
- Modify: `src/index.ts`

### Components in this batch

| Component | shadcn name | Folder | Storybook title |
|---|---|---|---|
| Direction | `direction` | `atoms/direction/` | `Layout/Direction` |
| Item | `item` | `atoms/item/` | `Layout/Item` |

- [ ] **Step 8.1: Scaffold via CLI**

```bash
cd packages/components && npx shadcn@latest add direction item -y
```

Both of these may not be standard CLI components. Check what gets scaffolded and create manually if needed.

- [ ] **Step 8.2: Restructure or create manually**

If scaffolded, move as usual. If not, create:

**Direction** (`src/components/atoms/direction/direction.tsx`):

```tsx
import * as React from "react";

export interface DirectionProviderProps {
  dir?: "ltr" | "rtl";
  children: React.ReactNode;
}

function DirectionProvider({ dir = "ltr", children }: DirectionProviderProps) {
  return <div dir={dir}>{children}</div>;
}

DirectionProvider.displayName = "DirectionProvider";

export { DirectionProvider };
```

**Item** (`src/components/atoms/item/item.tsx`):

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const Item = React.forwardRef<HTMLDivElement, ItemProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center gap-2 p-2", className)}
      {...props}
    />
  )
);
Item.displayName = "Item";

export { Item };
```

- [ ] **Step 8.3: Write Default stories**

```tsx
// direction.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { DirectionProvider } from "./direction";

const meta: Meta<typeof DirectionProvider> = {
  title: "Layout/Direction",
  component: DirectionProvider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DirectionProvider>;

export const Default: Story = {
  args: {
    dir: "ltr",
    children: "This text respects the direction context.",
  },
};
```

```tsx
// item.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Item } from "./item";

const meta: Meta<typeof Item> = {
  title: "Layout/Item",
  component: Item,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Item>;

export const Default: Story = {
  args: {
    children: "List item content",
  },
};
```

- [ ] **Step 8.4: Write COMPONENT.md for both components**

- [ ] **Step 8.5: Add barrel exports, clean up, verify, commit**

```bash
rm -rf src/components/ui
cd packages/components && npx tsc --noEmit
git add packages/components/src/
git commit -m "feat(components): seed Layout batch — 2 components with Default stories (#103)"
```

---

## Task 9: Final verification and CHANGELOG update

**Files:**
- Modify: `packages/components/CHANGELOG.md`

- [ ] **Step 9.1: Full Storybook verification**

```bash
cd packages/components && npx storybook dev -p 6006 --no-open &
sleep 15 && curl -s -o /dev/null -w "%{http_code}" http://localhost:6006
kill %1
```

Manually open Storybook and verify:
- All 51 components appear in the sidebar under their correct categories
- Every Default story renders without errors
- Button appears under `Actions/Button` (not `Atoms/Button`)

- [ ] **Step 9.2: Full TypeScript check**

```bash
cd packages/components && npx tsc --noEmit
```

Must pass with zero errors.

- [ ] **Step 9.3: Verify barrel exports**

Check that `src/index.ts` exports all 51 components. Quick count:

```bash
grep -c "^export" packages/components/src/index.ts
```

Should be significantly more than 3 (the current count for Button + cn). The exact number depends on how many sub-components each multi-part component exports.

- [ ] **Step 9.4: Update CHANGELOG.md with final component count**

Review the CHANGELOG entry created in Task 0 and update the count if any components were added/removed during implementation. Ensure the list of excluded components is accurate.

- [ ] **Step 9.5: Final commit**

```bash
git add packages/components/CHANGELOG.md
git commit -m "chore(components): finalize CHANGELOG for shadcn seed (#103)"
```

- [ ] **Step 9.6: Verify clean git status**

```bash
git status
```

Should show a clean working tree on the `issue-103` branch.
