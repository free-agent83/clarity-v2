# Phase B Conformance Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a mechanical conformance pass against `packages/components/CONTRIBUTING.md` to 14 Phase B components (Badge, Breadcrumb, Dialog, Dropdown Menu, Input, Label, Popover, Select, Separator, Sheet, Skeleton, Toggle Group, Tooltip, plus the Icon Button usage pattern documented inside Button), amend CONTRIBUTING's Rule 1 and Definition of Done, and retrofit Button against the revised rule.

**Architecture:** One commit per component on `feat/phase-b-rough-component-pass`, plus separate commits for CONTRIBUTING edits, Button retrofit, CHANGELOG, and barrel exports. Every component commit applies the same mechanical template (§Template). Spec: [`docs/superpowers/specs/2026-04-14-phase-b-conformance-design.md`](docs/superpowers/specs/2026-04-14-phase-b-conformance-design.md).

**Tech Stack:** React 19, TypeScript, Tailwind v4, shadcn/ui, Radix UI, class-variance-authority (CVA), @storybook/react, @storybook/test, @tabler/icons-react, vitest.

---

## Pre-flight check

- [ ] **Step 0.1: Verify branch and clean tree**

  Run:
  ```bash
  cd /Users/jlfgms/Desktop/Code/clarity-v2
  git status
  git rev-parse --abbrev-ref HEAD
  ```

  Expected: branch is `feat/phase-b-rough-component-pass`, working tree clean (the spec and CONTRIBUTING cleanup commits already landed).

- [ ] **Step 0.2: Verify Tabler Icons dependency**

  Run:
  ```bash
  grep '@tabler/icons-react' packages/components/package.json
  ```

  Expected: one matching line, e.g. `"@tabler/icons-react": "^3.41.1"`. If missing, stop and flag.

- [ ] **Step 0.3: Verify 14 component folders exist**

  Run:
  ```bash
  ls packages/components/src/components/atoms/badge packages/components/src/components/atoms/input packages/components/src/components/atoms/label packages/components/src/components/atoms/popover packages/components/src/components/atoms/separator packages/components/src/components/atoms/skeleton packages/components/src/components/atoms/toggle-group packages/components/src/components/atoms/tooltip packages/components/src/components/molecules/breadcrumb packages/components/src/components/molecules/dialog packages/components/src/components/molecules/dropdown-menu packages/components/src/components/molecules/select packages/components/src/components/molecules/sheet
  ```

  Expected: each folder prints `COMPONENT.md`, `<slug>.stories.tsx`, `<slug>.tsx`. If any folder is missing a file, stop and flag.

---

## File structure

Every component task touches these files inside its own folder plus one section of `src/index.ts`:

- `packages/components/src/components/<folder>/<slug>/<slug>.tsx` — add named `Props` interfaces, JSDoc, Rule 1 flags. Preserve all existing classes, variant taxonomy, and Radix imports.
- `packages/components/src/components/<folder>/<slug>/<slug>.stories.tsx` — meta block with title/autodocs/argTypes, default story anchor, required additional stories, minimal play function where interactive.
- `packages/components/src/components/<folder>/<slug>/COMPONENT.md` — full rewrite from stub: frontmatter, props table, usage guidelines, best practices, writing (if applicable), quality checklist, known deviations (if any).
- `packages/components/src/index.ts` — uncomment barrel lines in one consolidated commit at the end.

Additional files touched by non-component tasks:
- `packages/components/CONTRIBUTING.md` — Rule 1 reword, violation policy, DoD update, sidebar taxonomy.
- `packages/components/src/components/atoms/button/button.tsx` — inline Rule 1 flag comment.
- `packages/components/src/components/atoms/button/COMPONENT.md` — known deviations section, quality checklist update, Icon Button pattern section.
- `packages/components/CHANGELOG.md` — one consolidated dated entry at top.

---

## Template — mechanical conformance steps (reference material)

Every component task in §Tasks 3–15 applies this template. Read it once, then each task lists only the component-specific values plugged into each step. If you're reading a task out of order, scroll back here for the full code.

### T1 — Read the current component file

Before editing, read the actual TSX file to enumerate its current named exports and custom props. The spec's per-component subcomponent lists are best-effort — trust the file.

```bash
cat packages/components/src/components/<folder>/<slug>/<slug>.tsx
```

Note in a scratch pad:
- Every named export at the bottom of the file (component + subcomponents + variants object if CVA)
- Every custom prop beyond `React.ComponentProps<typeof Primitive.X>` (e.g. Dialog's `showCloseButton`)
- Any arbitrary value syntax (`-[Npx]`, `-[#hex]`, etc.) including mixed expressions like `rounded-[min(var(--foo),10px)]`

### T2 — Named Props interfaces

**Rule:** every subcomponent whose props extend beyond the plain Radix pass-through gets a named interface. Pass-through subcomponents (no custom props) keep their inline `React.ComponentProps<typeof Primitive.X>` type.

For the **primary** component export, always create a named `<Component>Props` interface even if it's a simple pass-through — this is the "Props interface" that CONTRIBUTING requires as a type-only export.

Pattern for a component with CVA:

```tsx
export interface ComponentProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof componentVariants> {
  asChild?: boolean;
}
```

Pattern for a component that wraps a Radix primitive with no custom props:

```tsx
export interface ComponentProps
  extends React.ComponentProps<typeof ComponentPrimitive.Root> {}
```

Pattern for a subcomponent with one custom prop (e.g. `DialogContent.showCloseButton`):

```tsx
export interface DialogContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content> {
  showCloseButton?: boolean;
}
```

Then reference the named interface on the function signature instead of the inline object literal:

```tsx
// Before
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) { ... }

// After
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps) { ... }
```

### T3 — JSDoc on the variants object (CVA only)

Only applies when the component uses `cva(...)`. Pattern:

```tsx
/**
 * Component variants.
 *
 * Variant axis = visual style (default, outline, secondary, ...)
 * Size axis    = default, sm, lg
 */
const componentVariants = cva(
  "...base classes...",
  { /* ... */ }
);
```

One line per variant axis, options listed inline. If the component has only one variant axis (e.g. just `variant`), still write the block — it's the documented API.

### T4 — JSDoc on every named export

Every named export gets a JSDoc block immediately above its `function` or `const` declaration. Not just the primary component — every subcomponent that appears in the final `export { ... }` statement.

Shape for the primary component:

```tsx
/**
 * One-line description of what the component does and when to use it.
 *
 * Any non-obvious constraints, the role of `asChild` if applicable, and
 * anything else a consumer needs to know go here.
 *
 * @see {@link componentVariants} for the full variant/size matrix.
 */
function Component(...) { ... }
```

Shape for a subcomponent (shorter is fine):

```tsx
/**
 * Trigger element for the Dialog. Clicking it opens the dialog.
 * Wraps Radix `Dialog.Trigger`.
 */
function DialogTrigger(...) { ... }
```

Shape for an exported type:

```tsx
/**
 * Props for the DialogContent subcomponent.
 */
export type { DialogContentProps };
```

Internal helpers, locals, and non-exported values stay uncommented. If the file contains non-exported helpers (e.g. `DialogPortal` at one point being internal), they do NOT get JSDoc.

### T5 — Three-export pattern

Every component file ends with value exports first, then type-only exports:

```tsx
export { Component, componentVariants };
export type { ComponentProps };
```

For multi-subcomponent files (Dialog, Sheet, etc.) the pattern expands:

```tsx
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
export type { DialogContentProps, DialogFooterProps };
```

Match the alphabetical order shadcn shipped with. Do not reorder, do not drop any exports that already existed.

### T6 — Rule 1 audit

Run this grep against the edited TSX file:

```bash
grep -nE '\[[^]]*#[0-9a-fA-F]{3,}|\[[^]]*[0-9]+px|\[[^]]*[0-9]+rem' packages/components/src/components/<folder>/<slug>/<slug>.tsx
```

Any matches that contain a raw literal (hex value, `Npx`, `Nrem`) inside arbitrary value syntax are **Rule 1 violations**. For each one:

1. Add an inline comment directly above the offending line:
   ```tsx
   // clarity-v2: token-gap — <short description of what the literal is>
   ```
2. Record the violation in the component's `COMPONENT.md` under `## Known deviations`.

Pure `var(--token)` references inside arbitrary value syntax (e.g. `rounded-[var(--radius-md)]`) are **allowed**. Mixed expressions where any literal leaks in (e.g. `rounded-[min(var(--radius-md),10px)]`) are **violations** — the literal is the problem.

No code changes. Flag only.

### T7 — Stories meta block

Full meta block shape:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Component } from "./component";

const meta: Meta<typeof Component> = {
  title: "<Category>/<Component>",
  component: Component,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "outline", "secondary"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
    disabled: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;
```

`<Category>` comes from CONTRIBUTING's sidebar taxonomy (Forms, Actions, Overlays, Feedback, Display, Navigation). Every enum prop gets `control: "select"` with its options listed inline. Every boolean prop gets `control: "boolean"`.

### T8 — Default story anchor

Every component file needs at least one default story — the argTypes playground anchor:

```tsx
export const Default: Story = {
  args: {
    // Minimal args to make the component render.
  },
};
```

Use the component's most basic render. No custom `render:` function unless the component requires children that can't be expressed via args (e.g. compound components like Dialog, Dropdown Menu — see per-component tasks).

### T9 — Additional required stories

Only when the per-component task lists them. Variant/size/boolean permutations are **not** dedicated stories — they're exercised via the argTypes controls panel.

### T10 — Minimal play function (interactive components only)

Use `@storybook/test` utilities. One smoke-level interaction per component:

```tsx
import { userEvent, within, expect } from "@storybook/test";

export const Default: Story = {
  args: { /* ... */ },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    await userEvent.click(trigger);
    // Assert expected state after interaction
  },
};
```

Smoke-level means: one primary interaction, one assertion. Not exhaustive keyboard nav, not focus management, not edge cases. Those are a follow-up pass.

### T11 — COMPONENT.md frontmatter

```yaml
---
name: Component
slug: component
version: 0.1.0
status: stable
lastUpdated: 2026-04-14
---
```

- `name` is PascalCase, matches the primary export.
- `slug` is kebab-case, matches the folder name.
- `version` is `0.1.0` for every component in this pass (bumped from `0.0.0`).
- `status` is `stable` for every component in this pass.
- `lastUpdated` is `2026-04-14`.

### T12 — COMPONENT.md content sections

Section order is fixed:

1. `# <Name>` heading + one-line description
2. `## Props` table
3. `## Usage guidelines` (~3 sentences)
4. `## Best practices` (Do/Don't bullets)
5. `## Writing` (only if applicable per the per-component task)
6. `## Quality checklist`
7. `## Known deviations` (only if Rule 1 audit flagged something)

Props table template:

```md
## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "outline"` | `"default"` | Visual style. |
| `disabled` | `boolean` | `false` | Disables the component. |

All standard HTML attributes for the root `<element>` are supported via prop spread.
```

Quality checklist template (fill in tick/untick honestly based on actual verification):

```md
## Quality checklist

- [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
- [x] Responsive: <note if any breakpoint behaviour, or "no breakpoint-dependent behaviour">
- [x] Tokens only: no raw literals inside arbitrary value syntax
```

If Rule 1 audit flagged anything, the "Tokens only" box stays unticked with an inline note:

```md
- [ ] Tokens only — flagged: <short description>. See Known deviations.
```

### T13 — Barrel exports

At the end of the pass (Task 18), uncomment the component's line(s) in `packages/components/src/index.ts`. Three-export pattern:

```ts
export { Component, componentVariants } from "./components/<folder>/<slug>/<slug>";
export type { ComponentProps } from "./components/<folder>/<slug>/<slug>";
```

For multi-subcomponent components, the value export expands to include every subcomponent (matching whatever was commented out in the current `index.ts`):

```ts
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./components/molecules/dialog/dialog";
export type { DialogContentProps, DialogFooterProps } from "./components/molecules/dialog/dialog";
```

Only include `*Variants` exports when the component uses CVA. Only include type exports for interfaces that were actually created in T2.

### T14 — Per-commit gate

Run these before every component commit:

```bash
cd packages/components && npx tsc --noEmit
```

Expected: clean, zero errors.

```bash
grep -nE '\[[^]]*#[0-9a-fA-F]{3,}|\[[^]]*[0-9]+px|\[[^]]*[0-9]+rem' packages/components/src/components/<folder>/<slug>/<slug>.tsx
```

Expected: either no output, OR every line in the output has an accompanying `// clarity-v2: token-gap` comment on the line immediately above it.

If `tsc --noEmit` reports errors, do not commit. Fix first.

### T15 — Commit

Commit message shape:

```
feat(<slug>): conformance pass (#NN)

- Named <Component>Props interface(s) exported as type(s)
- JSDoc blocks on variants and every named export
- Stories meta with autodocs and argTypes, <list added stories>
- COMPONENT.md fully seeded (first draft)
- [Rule 1 flag: <description>, if any]
- [Minimal play function: <interaction>, if interactive]

Refs #NN
```

Use a HEREDOC via `git commit -m "$(cat <<'EOF' ... EOF)"`. Co-author line at bottom per repo convention:

```
Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

---

## Tasks

### Task 1: CONTRIBUTING.md — Rule 1 reword, violation policy, DoD update, sidebar taxonomy

**Files:**
- Modify: `packages/components/CONTRIBUTING.md`

- [ ] **Step 1.1: Read current Rule 1 section**

  Run:
  ```bash
  sed -n '250,285p' packages/components/CONTRIBUTING.md
  ```

  Note the exact wording of the current "Rule 1 — Components consume tokens only through the CSS theme" section and its corollaries so the Edit tool's `old_string` matches exactly.

- [ ] **Step 1.2: Replace Rule 1 section with new wording**

  Use Edit tool to replace the current Rule 1 section (heading + body + corollaries, up to but not including "Rule 2") with:

  ```md
  #### Rule 1 — Components consume tokens only through the CSS theme

  Components never import from `packages/tokens/` and never reference raw token CSS variables as Tailwind utility shortcuts to raw literals. They see tokens only through the Tailwind theme, as utility classes — or, when an arbitrary value is truly needed, as a `var(--token)` reference inside arbitrary value syntax.

  **Allowed:**

  - Semantic utility classes: `bg-primary`, `text-foreground`, `border-border`, `p-4`, `rounded-md`
  - Arbitrary value syntax when the value is a CSS variable: `rounded-[var(--radius-md)]`, `w-[calc(100%-var(--sidebar-width))]`

  **Forbidden:**

  - Raw literals inside arbitrary value syntax: `p-[14px]`, `text-[#232323]`, `m-[4px]`, `bg-[#fff]`
  - Mixed expressions where any literal leaks in: `rounded-[min(var(--radius-md),10px)]` — the `10px` half is the violation even though `var(--radius-md)` is fine
  - Hardcoded hex values anywhere in the file

  If the design calls for a value not in the token set, flag it — NEVER invent a token.

  **Handling violations**

  When a component has a Rule 1 violation that can't be trivially resolved (e.g. an inherited shadcn default whose replacement would be a design judgement call), the violation is **flagged, not fixed**:

  1. Add an inline comment directly above or beside the offending line in the `.tsx` file: `// clarity-v2: token-gap — <short description of violation>`
  2. Record the violation in that component's `COMPONENT.md` under a `## Known deviations` section, pointing at the file and the rule.

  Flagged violations are revisited per-component in later design-lead-led passes. This policy exists to let conformance work move fast without triggering design judgement calls on shadcn defaults.
  ```

- [ ] **Step 1.3: Locate and update the sidebar taxonomy line**

  Run:
  ```bash
  grep -n 'Breadcrumbs' packages/components/CONTRIBUTING.md
  ```

  Use Edit tool to change `Accordion, Breadcrumbs` to `Accordion, Breadcrumb` (singular). One word change.

- [ ] **Step 1.4: Update the Definition of Done "Tokens only" line**

  Run:
  ```bash
  grep -n 'All visual values come from tokens' packages/components/CONTRIBUTING.md
  ```

  Use Edit tool to replace the current "All visual values come from tokens via Tailwind — no hardcoded values" DoD line with:

  ```md
  - [ ] Tokens only: no raw literals inside Tailwind arbitrary value syntax, no hardcoded colors, spacing, radius, or shadows. `var(--token)` inside arbitrary syntax is allowed.
  ```

- [ ] **Step 1.5: Add the publishing-with-flagged-violations note below the DoD list**

  Locate the end of the Definition of Done bullet list (the last bullet is "TypeScript compiles with no errors (`tsc --noEmit`)"). Use Edit tool to insert below it, separated by a blank line:

  ```md

  **Publishing with flagged violations.** A component may be promoted to `stable` and barrel-exported even if it has flagged Rule 1 violations. The "Tokens only" DoD item remains unticked in that component's `COMPONENT.md` with an inline note pointing at the flag. Publishing is allowed; completion is not. This is an explicit exception for Phase B, not a permanent carve-out — each flag is a ticket for a later per-component review.
  ```

- [ ] **Step 1.6: Verify no broken references**

  Run:
  ```bash
  grep -nE 'Breadcrumbs|All visual values come from tokens' packages/components/CONTRIBUTING.md
  ```

  Expected: no output. Both stale phrases should be gone.

- [ ] **Step 1.7: Commit**

  ```bash
  git add packages/components/CONTRIBUTING.md
  git commit -m "$(cat <<'EOF'
  docs(contributing): reword Rule 1 and update DoD for Phase B

  - Reworded Rule 1 to forbid raw literals inside arbitrary value syntax
    while explicitly allowing var(--token) references inside arbitrary
    syntax. Mixed expressions (literal + var) are violations.
  - Added a "Handling violations" subsection: flag, don't fix.
  - Updated the "Tokens only" DoD item to match the new rule.
  - Added a "Publishing with flagged violations" note: components with
    flagged Rule 1 violations may still be promoted to stable and
    barrel-exported, but their "Tokens only" DoD item stays unticked.
  - Sidebar taxonomy: Breadcrumbs → Breadcrumb (singular).

  Lays the groundwork for the Phase B conformance pass (14 components).

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 2: Button retrofit — flag the 10px literal under the new Rule 1

**Files:**
- Modify: `packages/components/src/components/atoms/button/button.tsx`
- Modify: `packages/components/src/components/atoms/button/COMPONENT.md`

- [ ] **Step 2.1: Find the offending line in button.tsx**

  Run:
  ```bash
  grep -n 'rounded-\[min(var(--radius-md)' packages/components/src/components/atoms/button/button.tsx
  ```

  Note the line number. There should be exactly one match.

- [ ] **Step 2.2: Add the inline flag comment**

  Use Edit tool. Locate the line containing `rounded-[min(var(--radius-md),10px)]` (or similar) and insert a comment on the line immediately above it. The `old_string` should be the existing line; the `new_string` should be the comment + the existing line:

  ```tsx
  // clarity-v2: token-gap — raw 10px literal inside arbitrary value syntax, pending design review
  <existing line unchanged>
  ```

  Preserve the exact indentation of the existing line for both the comment and the original line.

- [ ] **Step 2.3: Verify button.tsx still type-checks**

  ```bash
  cd packages/components && npx tsc --noEmit
  ```

  Expected: clean.

- [ ] **Step 2.4: Read current button COMPONENT.md**

  Run:
  ```bash
  cat packages/components/src/components/atoms/button/COMPONENT.md
  ```

  Note the current Quality checklist structure and whether a `## Known deviations` section already exists.

- [ ] **Step 2.5: Update the Quality checklist "Tokens only" box**

  Use Edit tool to flip the Tokens only line (whichever form it currently takes — `- [x]` or `- [ ]`) to:

  ```md
  - [ ] Tokens only — flagged: raw `10px` literal in `rounded-[min(var(--radius-md),10px)]`. See Known deviations.
  ```

- [ ] **Step 2.6: Add or extend the Known deviations section**

  If `## Known deviations` already exists, use Edit tool to append the new entry. Otherwise, use Edit tool to add it as a new section at the bottom of the file:

  ```md

  ## Known deviations

  **Rule 1 — raw literal in arbitrary value syntax.** [`button.tsx`](./button.tsx) contains `rounded-[min(var(--radius-md),10px)]`. The `10px` is a raw literal and violates the revised Rule 1 in CONTRIBUTING.md. Flagged pending per-component review by the design lead — see the inline comment in the TSX.
  ```

- [ ] **Step 2.7: Bump lastUpdated in the frontmatter**

  Use Edit tool to change the `lastUpdated` line in the frontmatter to `lastUpdated: 2026-04-14`. Do NOT bump `version` — this is a documentation-only correction. `status` stays `stable`.

- [ ] **Step 2.8: Commit**

  ```bash
  git add packages/components/src/components/atoms/button/button.tsx packages/components/src/components/atoms/button/COMPONENT.md
  git commit -m "$(cat <<'EOF'
  docs(button): retrofit Rule 1 flag for 10px literal

  Button is the first application of the new flag-don't-fix violation
  policy. The rounded-[min(var(--radius-md),10px)] line now carries an
  inline token-gap comment, and the COMPONENT.md quality checklist
  "Tokens only" box is unticked with a note pointing at a new Known
  deviations section.

  No code change. Button remains stable.

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 3: Separator (#58)

**Files:**
- Modify: `packages/components/src/components/atoms/separator/separator.tsx`
- Modify: `packages/components/src/components/atoms/separator/separator.stories.tsx`
- Modify: `packages/components/src/components/atoms/separator/COMPONENT.md`

**Key facts:**
- Category: `Display/Separator` (atom)
- Radix-wrapper (`SeparatorPrimitive.Root`), likely no CVA
- Not interactive — no play function, no Writing section
- One root element, no subcomponents

- [ ] **Step 3.1: Read the current file (T1)**

  ```bash
  cat packages/components/src/components/atoms/separator/separator.tsx
  ```

  Note: exported names, whether CVA is used, any props beyond `React.ComponentProps<typeof SeparatorPrimitive.Root>` (typically `orientation` + `decorative`).

- [ ] **Step 3.2: Add named SeparatorProps interface (T2)**

  Use Edit tool to add (above the `function Separator` declaration):

  ```tsx
  export interface SeparatorProps
    extends React.ComponentProps<typeof SeparatorPrimitive.Root> {}
  ```

  Update the function signature to use `SeparatorProps` instead of the inline type.

- [ ] **Step 3.3: Add JSDoc on the Separator export (T4)**

  Add immediately above `function Separator`:

  ```tsx
  /**
   * Visual divider between groups of content.
   *
   * Wraps Radix `Separator.Root`. Defaults to horizontal orientation;
   * pass `orientation="vertical"` for a vertical divider. Pass
   * `decorative={false}` when the separator carries semantic meaning
   * for assistive tech.
   */
  ```

  If CVA is present, also add the variants JSDoc (T3). Separator typically has none — skip if so.

- [ ] **Step 3.4: Update the export block (T5)**

  At the bottom of the file, ensure:

  ```tsx
  export { Separator };
  export type { SeparatorProps };
  ```

- [ ] **Step 3.5: Rule 1 audit (T6)**

  ```bash
  grep -nE '\[[^]]*#[0-9a-fA-F]{3,}|\[[^]]*[0-9]+px|\[[^]]*[0-9]+rem' packages/components/src/components/atoms/separator/separator.tsx
  ```

  If matches contain raw literals, add `// clarity-v2: token-gap — <description>` above each, and note under Known deviations in COMPONENT.md (Step 3.8).

- [ ] **Step 3.6: Rewrite separator.stories.tsx**

  Replace the entire file with:

  ```tsx
  import type { Meta, StoryObj } from "@storybook/react";
  import { Separator } from "./separator";

  const meta: Meta<typeof Separator> = {
    title: "Display/Separator",
    component: Separator,
    tags: ["autodocs"],
    argTypes: {
      orientation: {
        control: "select",
        options: ["horizontal", "vertical"],
      },
      decorative: {
        control: "boolean",
      },
    },
  };

  export default meta;
  type Story = StoryObj<typeof Separator>;

  export const Default: Story = {
    args: { orientation: "horizontal" },
    render: (args) => (
      <div className="w-64">
        <div className="text-sm text-muted-foreground">Above</div>
        <Separator {...args} className="my-2" />
        <div className="text-sm text-muted-foreground">Below</div>
      </div>
    ),
  };

  export const Vertical: Story = {
    args: { orientation: "vertical" },
    render: (args) => (
      <div className="flex h-16 items-center gap-4">
        <div className="text-sm text-muted-foreground">Left</div>
        <Separator {...args} />
        <div className="text-sm text-muted-foreground">Right</div>
      </div>
    ),
  };
  ```

- [ ] **Step 3.7: Rewrite separator/COMPONENT.md**

  Replace the entire file with:

  ```md
  ---
  name: Separator
  slug: separator
  version: 0.1.0
  status: stable
  lastUpdated: 2026-04-14
  ---

  # Separator

  Visual divider between groups of related content.

  ## Props

  | Prop | Type | Default | Description |
  |------|------|---------|-------------|
  | `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Axis of the separator. |
  | `decorative` | `boolean` | `true` | When `false`, the separator is announced to assistive technology as a semantic divider. When `true`, it is hidden from the accessibility tree. |

  All standard HTML attributes for the root `<div>` are supported via prop spread.

  ## Usage guidelines

  Use Separator to visually group related content into sections — inside menus, between list items, or between distinct regions of a page. A Separator is a lightweight alternative to wrapping content in a bordered container.

  **Don't use Separator** as a substitute for whitespace. If the only goal is to add breathing room between elements, use spacing utilities or layout gaps instead.

  ## Best practices

  - **Do:** Use `orientation="vertical"` inside horizontal layouts (toolbars, button groups) where a horizontal line would break the flow.
  - **Do:** Pass `decorative={false}` when the separator carries semantic meaning — for example, between a menu's destructive action and its other items.
  - **Don't:** Add a border to a container *and* a Separator inside it — pick one.
  - **Don't:** Use a Separator as a fake heading. If content needs a label, use a real heading element.

  ## Quality checklist

  - [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
  - [x] Responsive: no breakpoint-dependent behaviour
  - [x] Tokens only: no raw literals inside arbitrary value syntax
  ```

  If Step 3.5 found flagged violations, flip the Tokens only box to unticked with a note and append a `## Known deviations` section matching the template in T12.

- [ ] **Step 3.8: Per-commit gate (T14)**

  ```bash
  cd packages/components && npx tsc --noEmit
  ```

  Expected: clean. If errors, fix and re-run.

- [ ] **Step 3.9: Commit (T15)**

  ```bash
  git add packages/components/src/components/atoms/separator/
  git commit -m "$(cat <<'EOF'
  feat(separator): conformance pass (#58)

  - Named SeparatorProps interface exported as a type
  - JSDoc block on the Separator export describing orientation and
    decorative behaviour
  - Stories meta with autodocs and argTypes; Default (horizontal) and
    Vertical stories
  - COMPONENT.md fully seeded (first draft)
  - No play function — Separator is static display

  Refs #58

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 4: Skeleton (#60)

**Files:**
- Modify: `packages/components/src/components/atoms/skeleton/skeleton.tsx`
- Modify: `packages/components/src/components/atoms/skeleton/skeleton.stories.tsx`
- Modify: `packages/components/src/components/atoms/skeleton/COMPONENT.md`

**Key facts:**
- Category: `Feedback/Skeleton` (atom)
- Not a Radix wrapper — typically a plain `<div>` with animation classes
- Not interactive — no play function, no Writing section
- Likely no CVA

- [ ] **Step 4.1: Read the current file (T1)**

  ```bash
  cat packages/components/src/components/atoms/skeleton/skeleton.tsx
  ```

- [ ] **Step 4.2: Add named SkeletonProps interface (T2)**

  ```tsx
  export interface SkeletonProps extends React.ComponentProps<"div"> {}
  ```

  Update the function signature to use `SkeletonProps`.

- [ ] **Step 4.3: Add JSDoc on the Skeleton export (T4)**

  ```tsx
  /**
   * Animated placeholder block used while content is loading.
   *
   * Render a Skeleton at the approximate shape and size of the content
   * that will replace it. Compose multiple Skeletons to mirror more
   * complex layouts (cards, tables, text blocks).
   */
  ```

- [ ] **Step 4.4: Update the export block (T5)**

  ```tsx
  export { Skeleton };
  export type { SkeletonProps };
  ```

- [ ] **Step 4.5: Rule 1 audit (T6)**

  ```bash
  grep -nE '\[[^]]*#[0-9a-fA-F]{3,}|\[[^]]*[0-9]+px|\[[^]]*[0-9]+rem' packages/components/src/components/atoms/skeleton/skeleton.tsx
  ```

  Flag any matches per T6.

- [ ] **Step 4.6: Rewrite skeleton.stories.tsx**

  ```tsx
  import type { Meta, StoryObj } from "@storybook/react";
  import { Skeleton } from "./skeleton";

  const meta: Meta<typeof Skeleton> = {
    title: "Feedback/Skeleton",
    component: Skeleton,
    tags: ["autodocs"],
  };

  export default meta;
  type Story = StoryObj<typeof Skeleton>;

  export const Default: Story = {
    render: () => <Skeleton className="h-8 w-48 rounded-md" />,
  };

  export const Text: Story = {
    render: () => (
      <div className="flex w-64 flex-col gap-2">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-5/6 rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
      </div>
    ),
  };

  export const Card: Story = {
    render: () => (
      <div className="flex w-80 flex-col gap-4 rounded-lg border border-border p-4">
        <Skeleton className="h-32 w-full rounded-md" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
        </div>
      </div>
    ),
  };
  ```

- [ ] **Step 4.7: Rewrite skeleton/COMPONENT.md**

  ```md
  ---
  name: Skeleton
  slug: skeleton
  version: 0.1.0
  status: stable
  lastUpdated: 2026-04-14
  ---

  # Skeleton

  Animated placeholder shown in place of content that is still loading.

  ## Props

  | Prop | Type | Default | Description |
  |------|------|---------|-------------|
  | `className` | `string` | — | Additional classes. Set width, height, and border radius here to match the real content's shape. |

  All standard HTML attributes for the root `<div>` are supported via prop spread.

  ## Usage guidelines

  Use Skeleton to reserve layout space and signal that content is loading. Each Skeleton should roughly match the shape and size of the element it replaces so the UI doesn't jump when real content arrives.

  **Don't use Skeleton** for long-running background work that isn't on the current screen — use a Progress component or toast instead. **Don't use Skeleton** when the load is so fast that the placeholder flashes and disappears — show no placeholder instead.

  ## Best practices

  - **Do:** Compose multiple Skeletons together to mirror real layouts (e.g. avatar + two lines of text).
  - **Do:** Match the border radius of the real element (`rounded-md` for buttons, `rounded-full` for avatars).
  - **Do:** Use Skeletons in lists and grids — one per item — not a single large block covering the whole region.
  - **Don't:** Animate Skeletons at different speeds on the same screen — they should feel uniform.
  - **Don't:** Leave a Skeleton visible for more than a few seconds. If a load takes longer, switch to a Progress or a clear error state.

  ## Quality checklist

  - [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
  - [x] Responsive: adapts to its container via width and height classes
  - [x] Tokens only: no raw literals inside arbitrary value syntax
  ```

- [ ] **Step 4.8: Per-commit gate (T14)**

  ```bash
  cd packages/components && npx tsc --noEmit
  ```

- [ ] **Step 4.9: Commit (T15)**

  ```bash
  git add packages/components/src/components/atoms/skeleton/
  git commit -m "$(cat <<'EOF'
  feat(skeleton): conformance pass (#60)

  - Named SkeletonProps interface exported as a type
  - JSDoc block on the Skeleton export
  - Stories meta with autodocs; Default (block), Text (stacked lines),
    and Card (composed placeholder) stories
  - COMPONENT.md fully seeded (first draft)
  - No play function — Skeleton is static display

  Refs #60

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 5: Label (#59)

**Files:**
- Modify: `packages/components/src/components/atoms/label/label.tsx`
- Modify: `packages/components/src/components/atoms/label/label.stories.tsx`
- Modify: `packages/components/src/components/atoms/label/COMPONENT.md`

**Key facts:**
- Category: `Forms/Label` (atom)
- Radix-wrapper (`LabelPrimitive.Root`)
- Not interactive itself — associates with a form control, no play function
- Writing section included (labels are user-facing text)

- [ ] **Step 5.1: Read the current file (T1)**

  ```bash
  cat packages/components/src/components/atoms/label/label.tsx
  ```

- [ ] **Step 5.2: Add named LabelProps interface (T2)**

  ```tsx
  export interface LabelProps
    extends React.ComponentProps<typeof LabelPrimitive.Root> {}
  ```

  Update the function signature.

- [ ] **Step 5.3: Add JSDoc on the Label export (T4)**

  ```tsx
  /**
   * Accessible text label for form controls.
   *
   * Wraps Radix `Label.Root`. Use the `htmlFor` prop to associate the
   * label with a form control via its `id`. Clicking the label focuses
   * the associated control.
   */
  ```

- [ ] **Step 5.4: Update the export block (T5)**

  ```tsx
  export { Label };
  export type { LabelProps };
  ```

- [ ] **Step 5.5: Rule 1 audit (T6)**

  ```bash
  grep -nE '\[[^]]*#[0-9a-fA-F]{3,}|\[[^]]*[0-9]+px|\[[^]]*[0-9]+rem' packages/components/src/components/atoms/label/label.tsx
  ```

- [ ] **Step 5.6: Rewrite label.stories.tsx**

  ```tsx
  import type { Meta, StoryObj } from "@storybook/react";
  import { Label } from "./label";

  const meta: Meta<typeof Label> = {
    title: "Forms/Label",
    component: Label,
    tags: ["autodocs"],
  };

  export default meta;
  type Story = StoryObj<typeof Label>;

  export const Default: Story = {
    args: { htmlFor: "email", children: "Email address" },
    render: (args) => (
      <div className="flex flex-col gap-2">
        <Label {...args} />
        <input
          id="email"
          type="email"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
    ),
  };
  ```

- [ ] **Step 5.7: Rewrite label/COMPONENT.md**

  ```md
  ---
  name: Label
  slug: label
  version: 0.1.0
  status: stable
  lastUpdated: 2026-04-14
  ---

  # Label

  Accessible text label for form controls.

  ## Props

  | Prop | Type | Default | Description |
  |------|------|---------|-------------|
  | `htmlFor` | `string` | — | `id` of the associated form control. Required for accessibility — clicking the label focuses the control. |

  All standard HTML attributes for the root `<label>` are supported via prop spread.

  ## Usage guidelines

  Use Label to name every form control. Always set `htmlFor` to the control's `id` — without it, screen readers cannot associate the label with the control, and clicking the label does nothing.

  **Don't use Label** for headings, captions, or decorative text. **Don't use Label** for read-only values — use a description element instead.

  ## Best practices

  - **Do:** Always provide `htmlFor` matching the control's `id`.
  - **Do:** Place the Label immediately above its control, or to the left in dense forms.
  - **Do:** Use sentence case — "Email address", not "Email Address" or "EMAIL ADDRESS".
  - **Don't:** Append a colon ("Email address:") — use layout and typography to separate the label from the control.
  - **Don't:** Hide required-field indicators from the label text — mark them visibly *and* in the accessible name.

  ## Writing

  - Use sentence case: "Email address", "Phone number", "Date of birth".
  - Keep labels short — 1–3 words.
  - No trailing colons, no ALL CAPS.
  - Be specific: "Email address" beats "Email"; "Phone number" beats "Phone".

  ## Quality checklist

  - [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
  - [x] Responsive: no breakpoint-dependent behaviour
  - [x] Tokens only: no raw literals inside arbitrary value syntax
  ```

- [ ] **Step 5.8: Per-commit gate (T14)**

  ```bash
  cd packages/components && npx tsc --noEmit
  ```

- [ ] **Step 5.9: Commit (T15)**

  ```bash
  git add packages/components/src/components/atoms/label/
  git commit -m "$(cat <<'EOF'
  feat(label): conformance pass (#59)

  - Named LabelProps interface exported as a type
  - JSDoc block on the Label export
  - Stories meta with autodocs; Default story showing Label + Input
    association
  - COMPONENT.md fully seeded (first draft), includes Writing guidance
  - No play function — Label is associative, not interactive

  Refs #59

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 6: Badge (#61)

**Files:**
- Modify: `packages/components/src/components/atoms/badge/badge.tsx`
- Modify: `packages/components/src/components/atoms/badge/badge.stories.tsx`
- Modify: `packages/components/src/components/atoms/badge/COMPONENT.md`

**Key facts:**
- Category: `Display/Badge` (atom)
- Uses CVA — `badgeVariants` already defined with `variant` and `size` axes
- Has `asChild` escape hatch via Radix Slot
- Not interactive — no play function
- Writing section included (badge labels are user-facing text)

- [ ] **Step 6.1: Read the current file (T1)**

  ```bash
  cat packages/components/src/components/atoms/badge/badge.tsx
  ```

  Confirm: exports `Badge`, `badgeVariants`. Variant axis has default/secondary/destructive/success/warning/info/outline/ghost/link. Size axis has default/sm. Function currently takes inline intersection type — needs promotion to named interface.

- [ ] **Step 6.2: Add named BadgeProps interface (T2)**

  Add above `function Badge`:

  ```tsx
  export interface BadgeProps
    extends React.ComponentProps<"span">,
      VariantProps<typeof badgeVariants> {
    asChild?: boolean;
  }
  ```

  Update the function signature:

  ```tsx
  function Badge({
    className,
    variant = "default",
    size = "default",
    asChild = false,
    ...props
  }: BadgeProps) {
  ```

- [ ] **Step 6.3: Add JSDoc on badgeVariants (T3)**

  Directly above `const badgeVariants = cva(...)`:

  ```tsx
  /**
   * Badge variants.
   *
   * Variant axis = visual style (default, secondary, destructive, success, warning, info, outline, ghost, link)
   * Size axis    = default, sm
   */
  ```

- [ ] **Step 6.4: Add JSDoc on the Badge export (T4)**

  ```tsx
  /**
   * Small status or metadata indicator, typically used alongside
   * another element (a list item, a heading, a navigation link).
   *
   * Renders a `<span>` by default. Pass `asChild` to render as a
   * different element — e.g. an anchor — while preserving badge
   * styling.
   *
   * @see {@link badgeVariants} for the full variant/size matrix.
   */
  ```

- [ ] **Step 6.5: Update the export block (T5)**

  ```tsx
  export { Badge, badgeVariants };
  export type { BadgeProps };
  ```

- [ ] **Step 6.6: Rule 1 audit (T6)**

  ```bash
  grep -nE '\[[^]]*#[0-9a-fA-F]{3,}|\[[^]]*[0-9]+px|\[[^]]*[0-9]+rem' packages/components/src/components/atoms/badge/badge.tsx
  ```

- [ ] **Step 6.7: Rewrite badge.stories.tsx**

  ```tsx
  import type { Meta, StoryObj } from "@storybook/react";
  import { IconCheck } from "@tabler/icons-react";
  import { Badge } from "./badge";

  const meta: Meta<typeof Badge> = {
    title: "Display/Badge",
    component: Badge,
    tags: ["autodocs"],
    argTypes: {
      variant: {
        control: "select",
        options: [
          "default",
          "secondary",
          "destructive",
          "success",
          "warning",
          "info",
          "outline",
          "ghost",
          "link",
        ],
      },
      size: {
        control: "select",
        options: ["default", "sm"],
      },
    },
  };

  export default meta;
  type Story = StoryObj<typeof Badge>;

  export const Default: Story = {
    args: { children: "Badge", variant: "default" },
  };

  export const WithIcon: Story = {
    args: { variant: "success" },
    render: (args) => (
      <Badge {...args}>
        <IconCheck />
        Verified
      </Badge>
    ),
  };

  export const AsLink: Story = {
    args: { asChild: true, variant: "outline" },
    render: (args) => (
      <Badge {...args}>
        <a href="#">View details</a>
      </Badge>
    ),
  };
  ```

- [ ] **Step 6.8: Rewrite badge/COMPONENT.md**

  ```md
  ---
  name: Badge
  slug: badge
  version: 0.1.0
  status: stable
  lastUpdated: 2026-04-14
  ---

  # Badge

  Small status or metadata indicator attached to another element.

  ## Props

  | Prop | Type | Default | Description |
  |------|------|---------|-------------|
  | `variant` | `"default" \| "secondary" \| "destructive" \| "success" \| "warning" \| "info" \| "outline" \| "ghost" \| "link"` | `"default"` | Visual style of the badge. |
  | `size` | `"default" \| "sm"` | `"default"` | Height of the badge. |
  | `asChild` | `boolean` | `false` | Render as a child element (via Radix Slot) instead of a native `<span>`. |

  All standard HTML attributes for the root `<span>` are supported via prop spread.

  ## Usage guidelines

  Use Badge to show short metadata or status alongside another element — a count next to a list heading, a status next to a row, a category next to a title. Badges should always be *about* something else on the page.

  **Don't use Badge** as a standalone button or link. If the element needs to be clickable navigation, use `asChild` to render an anchor, or use a Button instead.

  ## Best practices

  - **Do:** Use `success` / `warning` / `destructive` / `info` for semantic status ("Active", "Pending", "Failed", "New").
  - **Do:** Use `outline` or `ghost` for neutral metadata ("v2.1", "beta", category labels) that doesn't need emphasis.
  - **Do:** Pass `asChild` with an `<a>` when the badge should navigate.
  - **Don't:** Put more than a few words in a badge. If the content needs a sentence, it belongs in a Card, Alert, or tooltip.
  - **Don't:** Stack multiple badges of the same variant — the variant loses its signal when everything is the same colour.

  ## Writing

  - Keep labels to 1–2 words: "Active", "Beta", "New", "Pending".
  - Sentence case: "In review", not "IN REVIEW" or "in review".
  - No trailing punctuation.
  - Use nouns and adjectives, not verbs: "Draft", not "Save draft".

  ## Quality checklist

  - [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
  - [x] Responsive: no breakpoint-dependent behaviour
  - [x] Tokens only: no raw literals inside arbitrary value syntax
  ```

- [ ] **Step 6.9: Per-commit gate (T14)**

  ```bash
  cd packages/components && npx tsc --noEmit
  ```

- [ ] **Step 6.10: Commit (T15)**

  ```bash
  git add packages/components/src/components/atoms/badge/
  git commit -m "$(cat <<'EOF'
  feat(badge): conformance pass (#61)

  - Named BadgeProps interface exported as a type
  - JSDoc blocks on badgeVariants and the Badge export
  - Stories meta with autodocs and argTypes; Default, WithIcon (Tabler
    icon inside badge), and AsLink (asChild rendering an anchor) stories
  - COMPONENT.md fully seeded (first draft), includes Writing guidance
  - No play function — Badge is static display

  Refs #61

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 7: Button — document Icon Button usage pattern (#82)

**Files:**
- Modify: `packages/components/src/components/atoms/button/COMPONENT.md`

**Key facts:**
- No new component. This is a documentation-only addition to Button's existing COMPONENT.md.
- Icon Button is a usage pattern of `<Button size="icon" aria-label="...">` — no new TSX, no new stories file.
- Closes #82 via this documentation.

- [ ] **Step 7.1: Read current button COMPONENT.md**

  ```bash
  cat packages/components/src/components/atoms/button/COMPONENT.md
  ```

  Identify where the Usage guidelines / Best practices sections end so the new Icon Button pattern section has a clear insertion point.

- [ ] **Step 7.2: Add an Icon Button pattern section**

  Use Edit tool to insert a new `## Icon Button pattern` section **after** the Best practices section (or after Writing, whichever is later), **before** the Quality checklist. Content:

  ```md
  ## Icon Button pattern

  Icon-only buttons are a Button usage pattern, not a separate component. Use the `icon`, `icon-sm`, or `icon-xs` sizes and pass exactly one icon as the child. Always provide `aria-label` — without it, the button has no accessible name.

  ```tsx
  import { IconTrash } from "@tabler/icons-react";

  <Button size="icon" variant="ghost" aria-label="Delete item">
    <IconTrash />
  </Button>
  ```

  **Do:** Set `aria-label` to a short action verb phrase describing what the button does ("Delete item", "Close dialog", "Open menu").

  **Don't:** Render more than one child inside an icon button — the size variants are sized for a single icon.

  **Don't:** Use an icon button for an action whose meaning isn't clear from the icon alone. If a user might hesitate, add a Tooltip or use a labelled Button instead.
  ```

- [ ] **Step 7.3: Bump lastUpdated**

  Change the frontmatter `lastUpdated` to `2026-04-14`. Do NOT bump `version`. `status` stays `stable`.

- [ ] **Step 7.4: Per-commit gate**

  `tsc --noEmit` is unaffected by Markdown. Skip. Run:

  ```bash
  git diff --stat packages/components/src/components/atoms/button/COMPONENT.md
  ```

  Expected: one file changed, only insertions + the `lastUpdated` bump.

- [ ] **Step 7.5: Commit**

  ```bash
  git add packages/components/src/components/atoms/button/COMPONENT.md
  git commit -m "$(cat <<'EOF'
  docs(button): document icon button usage pattern (#82)

  Icon-only buttons are a Button usage pattern, not a separate
  component. Added an Icon Button pattern section to Button's
  COMPONENT.md covering the size="icon" + aria-label requirement and
  do/don't guidance.

  Closes the Icon Button issue — no new component, no new stories file.

  Refs #82

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 8: Input (#62)

**Files:**
- Modify: `packages/components/src/components/atoms/input/input.tsx`
- Modify: `packages/components/src/components/atoms/input/input.stories.tsx`
- Modify: `packages/components/src/components/atoms/input/COMPONENT.md`

**Key facts:**
- Category: `Forms/Input` (atom)
- Wraps native `<input>`, not a Radix primitive
- Interactive — minimal play function required
- Writing section included (placeholders are user-facing text)

- [ ] **Step 8.1: Read the current file (T1)**

  ```bash
  cat packages/components/src/components/atoms/input/input.tsx
  ```

  Note: Input likely takes `type` and various native input attributes. No CVA in the typical shadcn Input.

- [ ] **Step 8.2: Add named InputProps interface (T2)**

  ```tsx
  export interface InputProps extends React.ComponentProps<"input"> {}
  ```

  Update the function signature to use `InputProps`.

- [ ] **Step 8.3: Add JSDoc on the Input export (T4)**

  ```tsx
  /**
   * Single-line text input wrapping the native HTML `<input>` element.
   *
   * Pass `type` to switch between text, email, password, number,
   * search, tel, url, date, etc. Use `aria-invalid` to visually mark
   * validation errors.
   */
  ```

- [ ] **Step 8.4: Update the export block (T5)**

  ```tsx
  export { Input };
  export type { InputProps };
  ```

- [ ] **Step 8.5: Rule 1 audit (T6)**

  ```bash
  grep -nE '\[[^]]*#[0-9a-fA-F]{3,}|\[[^]]*[0-9]+px|\[[^]]*[0-9]+rem' packages/components/src/components/atoms/input/input.tsx
  ```

- [ ] **Step 8.6: Rewrite input.stories.tsx**

  ```tsx
  import type { Meta, StoryObj } from "@storybook/react";
  import { userEvent, within, expect } from "@storybook/test";
  import { Input } from "./input";
  import { Label } from "../label/label";

  const meta: Meta<typeof Input> = {
    title: "Forms/Input",
    component: Input,
    tags: ["autodocs"],
    argTypes: {
      type: {
        control: "select",
        options: ["text", "email", "password", "number", "search", "tel", "url"],
      },
      disabled: {
        control: "boolean",
      },
    },
  };

  export default meta;
  type Story = StoryObj<typeof Input>;

  export const Default: Story = {
    args: { placeholder: "Type here" },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      const input = canvas.getByPlaceholderText("Type here") as HTMLInputElement;
      await userEvent.click(input);
      await userEvent.type(input, "Hello");
      await expect(input).toHaveValue("Hello");
    },
  };

  export const WithLabel: Story = {
    render: () => (
      <div className="flex w-64 flex-col gap-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
      </div>
    ),
  };
  ```

- [ ] **Step 8.7: Rewrite input/COMPONENT.md**

  ```md
  ---
  name: Input
  slug: input
  version: 0.1.0
  status: stable
  lastUpdated: 2026-04-14
  ---

  # Input

  Single-line text input for form fields.

  ## Props

  | Prop | Type | Default | Description |
  |------|------|---------|-------------|
  | `type` | `"text" \| "email" \| "password" \| "number" \| ...` | `"text"` | HTML input type. Controls browser keyboard, validation, and auto-fill behaviour. |
  | `disabled` | `boolean` | `false` | Disables the input and prevents interaction. |

  All standard HTML `<input>` attributes are supported via prop spread, including `placeholder`, `value`, `defaultValue`, `onChange`, `required`, `aria-invalid`, and `aria-describedby`.

  ## Usage guidelines

  Use Input for single-line free-text or numeric input. Pair every Input with a visible Label and associate them via `htmlFor` / `id`.

  **Don't use Input** for multi-line text — use Textarea. **Don't use Input** for selecting from a fixed list of options — use Select, RadioGroup, or Combobox.

  ## Best practices

  - **Do:** Always pair with a Label. Placeholders are not a substitute for labels — they disappear when the user types.
  - **Do:** Set `type` to the most specific value (`type="email"`, `type="tel"`, `type="number"`) so mobile keyboards and browser auto-fill work correctly.
  - **Do:** Use `aria-invalid={true}` and an associated error description via `aria-describedby` to mark invalid state.
  - **Don't:** Use placeholder text for instructions that users need while typing. If the help text is load-bearing, render it as a separate description below the input.
  - **Don't:** Disable an input silently. If the field is disabled because of a dependency, explain why.

  ## Writing

  - **Labels:** sentence case, 1–3 words — "Email address", "Phone number".
  - **Placeholders:** example values, not instructions — "you@example.com", not "Enter your email". Sentence case.
  - Keep error messages specific: "Enter a valid email address", not "Invalid".

  ## Quality checklist

  - [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
  - [x] Responsive: fills its container width; no breakpoint-specific behaviour
  - [x] Tokens only: no raw literals inside arbitrary value syntax
  ```

- [ ] **Step 8.8: Per-commit gate (T14)**

  ```bash
  cd packages/components && npx tsc --noEmit
  ```

- [ ] **Step 8.9: Commit (T15)**

  ```bash
  git add packages/components/src/components/atoms/input/
  git commit -m "$(cat <<'EOF'
  feat(input): conformance pass (#62)

  - Named InputProps interface exported as a type
  - JSDoc block on the Input export
  - Stories meta with autodocs and argTypes; Default story with a
    minimal play function (type + assert value) and WithLabel story
    showing Label + Input association
  - COMPONENT.md fully seeded (first draft), includes Writing guidance
    for labels and placeholders

  Refs #62

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 9: Toggle Group (#74)

**Files:**
- Modify: `packages/components/src/components/atoms/toggle-group/toggle-group.tsx`
- Modify: `packages/components/src/components/atoms/toggle-group/toggle-group.stories.tsx`
- Modify: `packages/components/src/components/atoms/toggle-group/COMPONENT.md`

**Key facts:**
- Category: `Forms/Toggle Group` (atom)
- Radix wrapper; likely uses CVA for variant/size (may re-use `toggleVariants` from the sibling Toggle atom)
- Interactive — minimal play function required
- Two named exports: `ToggleGroup`, `ToggleGroupItem`
- Four user-specified stories required: Default, Multiple, Spacing, DiamondCutSelector
- No Writing section (items are app-defined)

- [ ] **Step 9.1: Read the current file (T1)**

  ```bash
  cat packages/components/src/components/atoms/toggle-group/toggle-group.tsx
  ```

  Note: current exports (`ToggleGroup`, `ToggleGroupItem`), whether CVA is defined locally or imported from `../toggle/toggle`, and whether a `spacing` prop already exists. If `spacing` is not present in the current file, the `Spacing` story can't showcase it — in that case, adapt the story to showcase whatever real prop controls inter-item spacing, and note the fallback in the commit body.

- [ ] **Step 9.2: Add named interfaces (T2)**

  ```tsx
  export interface ToggleGroupProps
    extends React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
      VariantProps<typeof toggleVariants> {}

  export interface ToggleGroupItemProps
    extends React.ComponentProps<typeof ToggleGroupPrimitive.Item>,
      VariantProps<typeof toggleVariants> {}
  ```

  If the component imports `toggleVariants` from `../toggle/toggle`, keep the import unchanged. If it defines its own variants object locally, use its name instead. Update both function signatures.

- [ ] **Step 9.3: Add JSDoc on the variants object if locally defined (T3)**

  Skip if the file re-exports / imports variants from Toggle. Otherwise add the JSDoc block naming the variant axes.

- [ ] **Step 9.4: Add JSDoc on both exports (T4)**

  ```tsx
  /**
   * Group of toggle buttons where one or many can be pressed at a time.
   *
   * Wraps Radix `ToggleGroup.Root`. Pass `type="single"` for a radio-
   * like single-selection group, or `type="multiple"` for independent
   * multi-select toggles.
   */
  function ToggleGroup(...) { ... }

  /**
   * Individual item inside a ToggleGroup. Must be a direct child of
   * ToggleGroup. Pass `value` to identify the item in the group's
   * selection state.
   */
  function ToggleGroupItem(...) { ... }
  ```

- [ ] **Step 9.5: Update the export block (T5)**

  ```tsx
  export { ToggleGroup, ToggleGroupItem };
  export type { ToggleGroupProps, ToggleGroupItemProps };
  ```

- [ ] **Step 9.6: Rule 1 audit (T6)**

  ```bash
  grep -nE '\[[^]]*#[0-9a-fA-F]{3,}|\[[^]]*[0-9]+px|\[[^]]*[0-9]+rem' packages/components/src/components/atoms/toggle-group/toggle-group.tsx
  ```

- [ ] **Step 9.7: Rewrite toggle-group.stories.tsx**

  ```tsx
  import type { Meta, StoryObj } from "@storybook/react";
  import { userEvent, within, expect } from "@storybook/test";
  import {
    IconBold,
    IconItalic,
    IconUnderline,
    IconCircle,
    IconSquare,
    IconDiamond,
    IconHexagon,
    IconPentagon,
    IconRhombus,
  } from "@tabler/icons-react";
  import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

  const meta: Meta<typeof ToggleGroup> = {
    title: "Forms/Toggle Group",
    component: ToggleGroup,
    tags: ["autodocs"],
    argTypes: {
      type: {
        control: "select",
        options: ["single", "multiple"],
      },
      variant: {
        control: "select",
        options: ["default", "outline"],
      },
      size: {
        control: "select",
        options: ["default", "sm", "lg"],
      },
    },
  };

  export default meta;
  type Story = StoryObj<typeof ToggleGroup>;

  export const Default: Story = {
    args: { type: "single", defaultValue: "bold" },
    render: (args) => (
      <ToggleGroup {...args}>
        <ToggleGroupItem value="bold" aria-label="Bold">
          <IconBold />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <IconItalic />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">
          <IconUnderline />
        </ToggleGroupItem>
      </ToggleGroup>
    ),
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      const italic = canvas.getByRole("radio", { name: "Italic" });
      await userEvent.click(italic);
      await expect(italic).toHaveAttribute("data-state", "on");
    },
  };

  export const Multiple: Story = {
    args: { type: "multiple", defaultValue: ["bold"] },
    render: (args) => (
      <ToggleGroup {...args}>
        <ToggleGroupItem value="bold" aria-label="Bold">
          <IconBold />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Italic">
          <IconItalic />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Underline">
          <IconUnderline />
        </ToggleGroupItem>
      </ToggleGroup>
    ),
  };

  // Showcases how items space apart from each other. If the underlying
  // component exposes a `spacing` prop, pass it via args. Otherwise this
  // story falls back to container-level spacing and notes the limitation.
  export const Spacing: Story = {
    args: { type: "single" },
    render: (args) => (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-muted-foreground">Default spacing</span>
          <ToggleGroup {...args}>
            <ToggleGroupItem value="bold" aria-label="Bold">
              <IconBold />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Italic">
              <IconItalic />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Underline">
              <IconUnderline />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    ),
  };

  // Custom composition pattern: each item is a larger tile with a
  // placeholder icon above a label. Icons are Tabler placeholders —
  // real diamond-cut icons arrive when the visual asset library exists.
  const CUTS = [
    { value: "round", label: "Round", Icon: IconCircle },
    { value: "princess", label: "Princess", Icon: IconSquare },
    { value: "emerald", label: "Emerald", Icon: IconHexagon },
    { value: "oval", label: "Oval", Icon: IconDiamond },
    { value: "cushion", label: "Cushion", Icon: IconPentagon },
    { value: "marquise", label: "Marquise", Icon: IconRhombus },
  ] as const;

  export const DiamondCutSelector: Story = {
    args: { type: "single", defaultValue: "round" },
    render: (args) => (
      <ToggleGroup {...args} className="flex flex-wrap gap-3">
        {CUTS.map(({ value, label, Icon }) => (
          <ToggleGroupItem
            key={value}
            value={value}
            aria-label={label}
            className="flex h-auto flex-col items-center gap-2 p-4 data-[state=on]:bg-accent"
          >
            <Icon className="size-8" />
            <span className="text-xs">{label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    ),
  };
  ```

- [ ] **Step 9.8: Rewrite toggle-group/COMPONENT.md**

  ```md
  ---
  name: ToggleGroup
  slug: toggle-group
  version: 0.1.0
  status: stable
  lastUpdated: 2026-04-14
  ---

  # Toggle Group

  Group of toggle buttons where one (or many) can be pressed at a time.

  ## Props

  ### ToggleGroup

  | Prop | Type | Default | Description |
  |------|------|---------|-------------|
  | `type` | `"single" \| "multiple"` | — | Required. `single` behaves like a radio group; `multiple` allows independent toggles. |
  | `value` | `string \| string[]` | — | Controlled selected value(s). |
  | `defaultValue` | `string \| string[]` | — | Uncontrolled initial selected value(s). |
  | `onValueChange` | `(value) => void` | — | Called when the selection changes. |
  | `variant` | `"default" \| "outline"` | `"default"` | Visual style. |
  | `size` | `"default" \| "sm" \| "lg"` | `"default"` | Size of items. |

  ### ToggleGroupItem

  | Prop | Type | Default | Description |
  |------|------|---------|-------------|
  | `value` | `string` | — | Required. Identifies the item in the group's selection state. |
  | `disabled` | `boolean` | `false` | Disables the individual item. |

  All standard HTML button attributes are supported via prop spread on ToggleGroupItem.

  ## Usage guidelines

  Use Toggle Group for mutually exclusive or multi-select choices where the options are few and visual. Typical cases: text alignment pickers, formatting controls, small category selectors.

  **Don't use Toggle Group** when there are many options — use Select or Combobox. **Don't use Toggle Group** when the choices need labels longer than a short word — use RadioGroup or Checkbox with Label.

  ## Best practices

  - **Do:** Choose `type="single"` for either/or choices and `type="multiple"` for independent toggles.
  - **Do:** Give every item an `aria-label` when the visible content is icon-only.
  - **Do:** Keep items visually consistent — same size, same icon style, same alignment.
  - **Don't:** Mix icon-only items with text-only items in the same group.
  - **Don't:** Use Toggle Group as a navigation control. Use Tabs or a button group instead.

  ## Quality checklist

  - [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
  - [x] Responsive: items wrap via container utilities when needed
  - [x] Tokens only: no raw literals inside arbitrary value syntax
  ```

- [ ] **Step 9.9: Per-commit gate (T14)**

  ```bash
  cd packages/components && npx tsc --noEmit
  ```

- [ ] **Step 9.10: Commit (T15)**

  ```bash
  git add packages/components/src/components/atoms/toggle-group/
  git commit -m "$(cat <<'EOF'
  feat(toggle-group): conformance pass (#74)

  - Named ToggleGroupProps and ToggleGroupItemProps interfaces
    exported as types
  - JSDoc blocks on both exports
  - Stories meta with autodocs and argTypes; Default (single),
    Multiple, Spacing, and DiamondCutSelector stories. Diamond cut
    selector uses Tabler icons as placeholders per the spec — real
    cut icons land in a later pass.
  - Minimal play function on Default: click an item, assert
    data-state="on"
  - COMPONENT.md fully seeded (first draft)

  Refs #74

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 10: Breadcrumb (#83)

**Files:**
- Modify: `packages/components/src/components/molecules/breadcrumb/breadcrumb.tsx`
- Modify: `packages/components/src/components/molecules/breadcrumb/breadcrumb.stories.tsx`
- Modify: `packages/components/src/components/molecules/breadcrumb/COMPONENT.md`

**Key facts:**
- Category: `Navigation/Breadcrumb` (molecule)
- Multiple subcomponents: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`
- Not interactive — no play function. Static navigation.
- Writing section included (segment labels are user-facing)

- [ ] **Step 10.1: Read the current file (T1)**

  ```bash
  cat packages/components/src/components/molecules/breadcrumb/breadcrumb.tsx
  ```

  Enumerate every named export. Update the subcomponent list below if it differs from the spec.

- [ ] **Step 10.2: Add a named BreadcrumbProps interface (T2)**

  Most Breadcrumb subcomponents are pass-through styled elements. Only the root `Breadcrumb` gets a named interface. Other subcomponents keep their inline types.

  ```tsx
  export interface BreadcrumbProps extends React.ComponentProps<"nav"> {}
  ```

  Update the root function signature. Leave subcomponent signatures as-is.

- [ ] **Step 10.3: Add JSDoc on every named export (T4)**

  Above each function:

  ```tsx
  /**
   * Container for a breadcrumb trail. Renders a `<nav>` with an
   * implicit `aria-label="breadcrumb"`. Wraps a BreadcrumbList and
   * its items.
   */
  function Breadcrumb(...) { ... }

  /**
   * Ordered list of breadcrumb segments. Wraps an `<ol>`.
   */
  function BreadcrumbList(...) { ... }

  /**
   * Single breadcrumb segment. Wraps an `<li>`.
   */
  function BreadcrumbItem(...) { ... }

  /**
   * Clickable segment inside a BreadcrumbItem. Use for any segment
   * except the current page. Pass `asChild` to render as a framework
   * link (e.g. Next.js `<Link>`).
   */
  function BreadcrumbLink(...) { ... }

  /**
   * The current page segment. Non-interactive. Uses `aria-current="page"`.
   */
  function BreadcrumbPage(...) { ... }

  /**
   * Visual separator between segments. Defaults to a chevron; pass
   * children to override (e.g. a slash).
   */
  function BreadcrumbSeparator(...) { ... }

  /**
   * Collapsed-state indicator for long breadcrumb trails. Renders as
   * an ellipsis with an accessible label.
   */
  function BreadcrumbEllipsis(...) { ... }
  ```

- [ ] **Step 10.4: Update the export block (T5)**

  ```tsx
  export {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
  };
  export type { BreadcrumbProps };
  ```

  Match whatever the file's actual export list is. Do not drop any subcomponent the current file already exports.

- [ ] **Step 10.5: Rule 1 audit (T6)**

  ```bash
  grep -nE '\[[^]]*#[0-9a-fA-F]{3,}|\[[^]]*[0-9]+px|\[[^]]*[0-9]+rem' packages/components/src/components/molecules/breadcrumb/breadcrumb.tsx
  ```

- [ ] **Step 10.6: Rewrite breadcrumb.stories.tsx**

  ```tsx
  import type { Meta, StoryObj } from "@storybook/react";
  import { IconSlash } from "@tabler/icons-react";
  import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
    BreadcrumbEllipsis,
  } from "./breadcrumb";

  const meta: Meta<typeof Breadcrumb> = {
    title: "Navigation/Breadcrumb",
    component: Breadcrumb,
    tags: ["autodocs"],
  };

  export default meta;
  type Story = StoryObj<typeof Breadcrumb>;

  export const Default: Story = {
    render: () => (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Inventory</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Diamonds</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    ),
  };

  export const WithEllipsis: Story = {
    render: () => (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Diamonds</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Round cut</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    ),
  };

  export const CustomSeparator: Story = {
    render: () => (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <IconSlash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Inventory</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <IconSlash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Diamonds</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    ),
  };
  ```

- [ ] **Step 10.7: Rewrite breadcrumb/COMPONENT.md**

  ```md
  ---
  name: Breadcrumb
  slug: breadcrumb
  version: 0.1.0
  status: stable
  lastUpdated: 2026-04-14
  ---

  # Breadcrumb

  Navigation trail showing the user's location inside a hierarchical structure.

  ## Props

  Breadcrumb is a compound component. Compose it from the following subcomponents:

  - `Breadcrumb` — root `<nav>`
  - `BreadcrumbList` — `<ol>` wrapping the segments
  - `BreadcrumbItem` — `<li>` wrapping each segment
  - `BreadcrumbLink` — clickable segment; pass `asChild` to use a framework link
  - `BreadcrumbPage` — the current page segment, non-interactive, with `aria-current="page"`
  - `BreadcrumbSeparator` — visual divider; defaults to a chevron icon
  - `BreadcrumbEllipsis` — collapsed-state indicator for long trails

  All subcomponents accept standard HTML attributes for their root element via prop spread.

  ## Usage guidelines

  Use Breadcrumb to show the user's position in a hierarchical app structure (category → subcategory → item). Put Breadcrumb at the top of the content area, below the global navigation.

  **Don't use Breadcrumb** for flat navigation — if all pages are siblings, Breadcrumb adds noise. **Don't use Breadcrumb** as a replacement for a back button in linear flows.

  ## Best practices

  - **Do:** Always end the trail with a `BreadcrumbPage`, not a `BreadcrumbLink`, for the current page.
  - **Do:** Use `BreadcrumbEllipsis` to collapse the middle of long trails — keep the first and last segments visible.
  - **Do:** Keep segment labels concise — match the page title.
  - **Don't:** Link the current page back to itself.
  - **Don't:** Mix breadcrumbs with tabs for the same navigation level — pick one pattern.

  ## Writing

  - Match the page title exactly. If the page title is "Round brilliant cut diamonds", the breadcrumb segment is "Round brilliant cut diamonds" — not "Round" or "Diamonds".
  - Sentence case for all segments.
  - No trailing punctuation.

  ## Quality checklist

  - [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
  - [x] Responsive: wraps to a new line in narrow containers
  - [x] Tokens only: no raw literals inside arbitrary value syntax
  ```

- [ ] **Step 10.8: Per-commit gate (T14)**

  ```bash
  cd packages/components && npx tsc --noEmit
  ```

- [ ] **Step 10.9: Commit (T15)**

  ```bash
  git add packages/components/src/components/molecules/breadcrumb/
  git commit -m "$(cat <<'EOF'
  feat(breadcrumb): conformance pass (#83)

  - Named BreadcrumbProps interface exported as a type
  - JSDoc blocks on every named export (Breadcrumb, BreadcrumbList,
    BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator,
    BreadcrumbEllipsis)
  - Stories meta with autodocs; Default (3 segments), WithEllipsis
    (collapsed mid-segment), and CustomSeparator (IconSlash) stories
  - COMPONENT.md fully seeded (first draft), includes Writing guidance
  - No play function — Breadcrumb is static navigation

  Refs #83

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 11: Tooltip (#73)

**Files:**
- Modify: `packages/components/src/components/atoms/tooltip/tooltip.tsx`
- Modify: `packages/components/src/components/atoms/tooltip/tooltip.stories.tsx`
- Modify: `packages/components/src/components/atoms/tooltip/COMPONENT.md`

**Key facts:**
- Category: `Overlays/Tooltip` (atom)
- Radix wrapper. Subcomponents: `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`
- Interactive — minimal play function (hover, assert visible)
- `TooltipProvider` must wrap Tooltip stories — document this
- Writing section included (tooltip content is user-facing)

- [ ] **Step 11.1: Read the current file (T1)**

  ```bash
  cat packages/components/src/components/atoms/tooltip/tooltip.tsx
  ```

  Enumerate exports. The spec lists `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` — confirm against the real file.

- [ ] **Step 11.2: Add named interfaces (T2)**

  Only the subcomponents that have custom props beyond pass-through get named interfaces. `TooltipContent` typically has a `sideOffset` prop — whether or not it's custom, create a named `TooltipContentProps` for consumers. The root `Tooltip` is also worth a named interface as the "primary" export:

  ```tsx
  export interface TooltipProps
    extends React.ComponentProps<typeof TooltipPrimitive.Root> {}

  export interface TooltipContentProps
    extends React.ComponentProps<typeof TooltipPrimitive.Content> {}
  ```

  Leave `TooltipTrigger` and `TooltipProvider` with inline types — they're pure pass-throughs.

- [ ] **Step 11.3: Add JSDoc on every named export (T4)**

  ```tsx
  /**
   * Floating label shown on hover or focus, providing a short hint
   * about an element without consuming layout space.
   *
   * Wraps Radix `Tooltip.Root`. Must be rendered inside a
   * TooltipProvider — typically at the app root, or wrapping each
   * story in Storybook.
   */
  function Tooltip(...) { ... }

  /**
   * Element that triggers the tooltip when hovered or focused. Pass
   * `asChild` to avoid wrapping in an extra element.
   */
  function TooltipTrigger(...) { ... }

  /**
   * Floating content rendered next to the trigger. Accepts `side`,
   * `align`, and `sideOffset` to control positioning.
   */
  function TooltipContent(...) { ... }

  /**
   * Required provider. Wrap the app (or individual stories) in a
   * TooltipProvider so every Tooltip below shares delay and open
   * state configuration.
   */
  function TooltipProvider(...) { ... }
  ```

- [ ] **Step 11.4: Update the export block (T5)**

  ```tsx
  export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
  export type { TooltipProps, TooltipContentProps };
  ```

- [ ] **Step 11.5: Rule 1 audit (T6)**

  ```bash
  grep -nE '\[[^]]*#[0-9a-fA-F]{3,}|\[[^]]*[0-9]+px|\[[^]]*[0-9]+rem' packages/components/src/components/atoms/tooltip/tooltip.tsx
  ```

- [ ] **Step 11.6: Rewrite tooltip.stories.tsx**

  ```tsx
  import type { Meta, StoryObj } from "@storybook/react";
  import { userEvent, within, expect, waitFor } from "@storybook/test";
  import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
  } from "./tooltip";
  import { Button } from "../../atoms/button/button";

  const meta: Meta<typeof Tooltip> = {
    title: "Overlays/Tooltip",
    component: Tooltip,
    tags: ["autodocs"],
    decorators: [
      (Story) => (
        <TooltipProvider>
          <Story />
        </TooltipProvider>
      ),
    ],
  };

  export default meta;
  type Story = StoryObj<typeof Tooltip>;

  export const Default: Story = {
    render: () => (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Adds a new item to the list</TooltipContent>
      </Tooltip>
    ),
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      const trigger = canvas.getByRole("button", { name: "Hover me" });
      await userEvent.hover(trigger);
      await waitFor(async () => {
        await expect(
          canvas.getByText("Adds a new item to the list")
        ).toBeInTheDocument();
      });
    },
  };
  ```

- [ ] **Step 11.7: Rewrite tooltip/COMPONENT.md**

  ```md
  ---
  name: Tooltip
  slug: tooltip
  version: 0.1.0
  status: stable
  lastUpdated: 2026-04-14
  ---

  # Tooltip

  Floating label shown on hover or focus, providing a short hint about an element.

  ## Props

  Tooltip is a compound component. Compose it from:

  - `TooltipProvider` — required ancestor, typically at the app root.
  - `Tooltip` — wraps a trigger and its content.
  - `TooltipTrigger` — the element that shows the tooltip on hover/focus. Pass `asChild` to avoid adding an extra wrapper.
  - `TooltipContent` — the floating content.

  `TooltipContent` accepts Radix positioning props: `side` (`"top" | "right" | "bottom" | "left"`), `align` (`"start" | "center" | "end"`), and `sideOffset` (pixels).

  ## Usage guidelines

  Use Tooltip to explain icon-only buttons, truncated text, and non-obvious controls. Tooltips must be progressive enhancement — never put essential information in a tooltip alone, since they're hidden on touch devices and by some assistive tech.

  **Don't use Tooltip** for form validation errors — use inline error text. **Don't use Tooltip** for long explanations — use a Popover or an inline description.

  ## Best practices

  - **Do:** Wrap your app (or Storybook decorator) in a single `TooltipProvider`. Nested providers lead to inconsistent open delays.
  - **Do:** Put a Tooltip on every icon-only Button whose meaning isn't immediately obvious.
  - **Do:** Use `asChild` on `TooltipTrigger` to avoid adding an extra `<button>` wrapper around interactive triggers.
  - **Don't:** Hide required interactions behind a tooltip. If the user *needs* to see it to proceed, it isn't a tooltip.
  - **Don't:** Put interactive content (links, buttons) inside a TooltipContent — tooltips close on mouse-out.

  ## Writing

  - Keep content to one short phrase or a single sentence.
  - Sentence case.
  - Phrases: no trailing punctuation ("Add new item").
  - Sentences: end with a period ("Adds a new item to the list.").

  ## Quality checklist

  - [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
  - [x] Responsive: no breakpoint-dependent behaviour
  - [x] Tokens only: no raw literals inside arbitrary value syntax
  ```

- [ ] **Step 11.8: Per-commit gate (T14)**

  ```bash
  cd packages/components && npx tsc --noEmit
  ```

- [ ] **Step 11.9: Commit (T15)**

  ```bash
  git add packages/components/src/components/atoms/tooltip/
  git commit -m "$(cat <<'EOF'
  feat(tooltip): conformance pass (#73)

  - Named TooltipProps and TooltipContentProps interfaces exported as types
  - JSDoc blocks on Tooltip, TooltipTrigger, TooltipContent, TooltipProvider
  - Stories meta with autodocs and a TooltipProvider decorator; Default
    story with a minimal play function (hover trigger, assert content)
  - COMPONENT.md fully seeded (first draft), includes Writing guidance
    and calls out TooltipProvider requirement

  Refs #73

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 12: Popover (#72)

**Files:**
- Modify: `packages/components/src/components/atoms/popover/popover.tsx`
- Modify: `packages/components/src/components/atoms/popover/popover.stories.tsx`
- Modify: `packages/components/src/components/atoms/popover/COMPONENT.md`

**Key facts:**
- Category: `Overlays/Popover` (atom)
- Radix wrapper. Current barrel in `src/index.ts` lists: `Popover`, `PopoverAnchor`, `PopoverContent`, `PopoverDescription`, `PopoverHeader`, `PopoverTitle`, `PopoverTrigger`. This file has more subcomponents than the plain shadcn default.
- Interactive — minimal play function (click, assert visible; click outside, assert closed)
- User-specified story required: `WithForm`
- No Writing section (content is app-defined)

- [ ] **Step 12.1: Read the current file (T1)**

  ```bash
  cat packages/components/src/components/atoms/popover/popover.tsx
  ```

  Enumerate every named export. If the file exports `PopoverDescription`, `PopoverHeader`, `PopoverTitle` (per the current barrel), include them in the JSDoc and export list.

- [ ] **Step 12.2: Add named interfaces (T2)**

  ```tsx
  export interface PopoverProps
    extends React.ComponentProps<typeof PopoverPrimitive.Root> {}

  export interface PopoverContentProps
    extends React.ComponentProps<typeof PopoverPrimitive.Content> {}
  ```

  Leave other subcomponents with inline types unless the actual file has custom props on them — in which case, create named interfaces following the same pattern.

- [ ] **Step 12.3: Add JSDoc on every named export (T4)**

  For each of `Popover`, `PopoverTrigger`, `PopoverAnchor`, `PopoverContent`, `PopoverHeader`, `PopoverTitle`, `PopoverDescription` (or whatever the actual file exports), add a short JSDoc block:

  ```tsx
  /**
   * Floating container anchored to a trigger element. Opens on click
   * and closes on outside click or Escape.
   */
  function Popover(...) { ... }

  /**
   * Element that opens the popover when clicked. Pass `asChild` to
   * avoid wrapping in an extra element.
   */
  function PopoverTrigger(...) { ... }

  /**
   * Alternative anchor element that positions the popover without
   * being the trigger. Use when the trigger and anchor differ.
   */
  function PopoverAnchor(...) { ... }

  /**
   * Floating content of the popover. Accepts `side`, `align`, and
   * `sideOffset` positioning props.
   */
  function PopoverContent(...) { ... }

  /**
   * Optional header region for the popover content.
   */
  function PopoverHeader(...) { ... }

  /**
   * Optional title element inside the popover header.
   */
  function PopoverTitle(...) { ... }

  /**
   * Optional description text inside the popover header.
   */
  function PopoverDescription(...) { ... }
  ```

  Only include JSDoc for subcomponents that actually exist in the file.

- [ ] **Step 12.4: Update the export block (T5)**

  Match whatever the file actually exports:

  ```tsx
  export {
    Popover,
    PopoverAnchor,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
  };
  export type { PopoverProps, PopoverContentProps };
  ```

- [ ] **Step 12.5: Rule 1 audit (T6)**

  ```bash
  grep -nE '\[[^]]*#[0-9a-fA-F]{3,}|\[[^]]*[0-9]+px|\[[^]]*[0-9]+rem' packages/components/src/components/atoms/popover/popover.tsx
  ```

- [ ] **Step 12.6: Rewrite popover.stories.tsx**

  ```tsx
  import type { Meta, StoryObj } from "@storybook/react";
  import { userEvent, within, expect, waitFor } from "@storybook/test";
  import {
    Popover,
    PopoverTrigger,
    PopoverContent,
  } from "./popover";
  import { Button } from "../../atoms/button/button";
  import { Input } from "../../atoms/input/input";
  import { Label } from "../../atoms/label/label";

  const meta: Meta<typeof Popover> = {
    title: "Overlays/Popover",
    component: Popover,
    tags: ["autodocs"],
  };

  export default meta;
  type Story = StoryObj<typeof Popover>;

  export const Default: Story = {
    render: () => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <p className="text-sm">Popover content goes here.</p>
        </PopoverContent>
      </Popover>
    ),
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      const trigger = canvas.getByRole("button", { name: "Open popover" });
      await userEvent.click(trigger);
      await waitFor(async () => {
        await expect(
          canvas.getByText("Popover content goes here.")
        ).toBeInTheDocument();
      });
    },
  };

  export const WithForm: Story = {
    render: () => (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Set dimensions</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-medium">Dimensions</h4>
              <p className="text-xs text-muted-foreground">
                Set the width and height for the layer.
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  defaultValue="100%"
                  className="col-span-2 h-8"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="maxWidth">Max. width</Label>
                <Input
                  id="maxWidth"
                  defaultValue="300px"
                  className="col-span-2 h-8"
                />
              </div>
              <div className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  defaultValue="25px"
                  className="col-span-2 h-8"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    ),
  };
  ```

- [ ] **Step 12.7: Rewrite popover/COMPONENT.md**

  ```md
  ---
  name: Popover
  slug: popover
  version: 0.1.0
  status: stable
  lastUpdated: 2026-04-14
  ---

  # Popover

  Floating container anchored to a trigger element, opened on click.

  ## Props

  Popover is a compound component. Compose it from:

  - `Popover` — root
  - `PopoverTrigger` — the element that opens the popover
  - `PopoverAnchor` — optional, for decoupling the trigger from the anchor point
  - `PopoverContent` — the floating content
  - `PopoverHeader`, `PopoverTitle`, `PopoverDescription` — optional structured header

  `PopoverContent` accepts Radix positioning props: `side`, `align`, `sideOffset`.

  ## Usage guidelines

  Use Popover for secondary content that a user opts into — forms, pickers, settings panels — anchored to a trigger element. Popover is for content that needs to stay open while the user interacts with it.

  **Don't use Popover** for passive hints — use Tooltip. **Don't use Popover** for primary modal workflows — use Dialog. **Don't use Popover** for menus — use Dropdown Menu, which handles keyboard navigation as a menu.

  ## Best practices

  - **Do:** Use `asChild` on `PopoverTrigger` so the trigger element controls its own semantics.
  - **Do:** Give forms inside popovers a clear affordance to close and save — the user shouldn't have to guess.
  - **Do:** Keep content focused — popovers are ~300-400px wide, not full forms.
  - **Don't:** Open a popover automatically on page load.
  - **Don't:** Nest popovers.

  ## Quality checklist

  - [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
  - [x] Responsive: floating content repositions near edges via Radix
  - [x] Tokens only: no raw literals inside arbitrary value syntax
  ```

- [ ] **Step 12.8: Per-commit gate (T14)**

  ```bash
  cd packages/components && npx tsc --noEmit
  ```

- [ ] **Step 12.9: Commit (T15)**

  ```bash
  git add packages/components/src/components/atoms/popover/
  git commit -m "$(cat <<'EOF'
  feat(popover): conformance pass (#72)

  - Named PopoverProps and PopoverContentProps interfaces exported as types
  - JSDoc blocks on every named export (Popover, PopoverTrigger,
    PopoverAnchor, PopoverContent, PopoverHeader, PopoverTitle,
    PopoverDescription)
  - Stories meta with autodocs; Default story with a minimal play
    function (click trigger, assert content visible) and WithForm
    story per the spec
  - COMPONENT.md fully seeded (first draft)

  Refs #72

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 13: Dropdown Menu (#77)

**Files:**
- Modify: `packages/components/src/components/molecules/dropdown-menu/dropdown-menu.tsx`
- Modify: `packages/components/src/components/molecules/dropdown-menu/dropdown-menu.stories.tsx`
- Modify: `packages/components/src/components/molecules/dropdown-menu/COMPONENT.md`

**Key facts:**
- Category: `Actions/Dropdown Menu` (molecule)
- Radix wrapper. Current barrel lists: `DropdownMenu`, `DropdownMenuPortal`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`. Confirm against the real file.
- Interactive — minimal play function (click trigger, assert content visible, click first item, assert content closed)
- Six user-specified stories required: Default, WithSubmenus, WithIcons, WithCheckboxes, Destructive, Complex
- **Explicitly skipped:** keyboard shortcut stories
- Writing section included (menu item labels are user-facing)

- [ ] **Step 13.1: Read the current file (T1)**

  ```bash
  cat packages/components/src/components/molecules/dropdown-menu/dropdown-menu.tsx
  ```

  Enumerate every named export. Note the exact list so the export block in Step 13.4 matches. If `DropdownMenuShortcut` is present in the file, keep it in the export list (the user just said stories aren't needed for shortcuts — the subcomponent itself stays).

- [ ] **Step 13.2: Add named interfaces (T2)**

  Pragmatic rule: only the root `DropdownMenu` and `DropdownMenuContent` (which often accepts custom props like `sideOffset`) get named interfaces. Every other subcomponent stays with its inline type unless the file shows custom props added beyond the Radix primitive.

  ```tsx
  export interface DropdownMenuProps
    extends React.ComponentProps<typeof DropdownMenuPrimitive.Root> {}

  export interface DropdownMenuContentProps
    extends React.ComponentProps<typeof DropdownMenuPrimitive.Content> {}
  ```

  If any other subcomponent (e.g. `DropdownMenuSubContent`, `DropdownMenuCheckboxItem`) has custom props beyond Radix, add a named interface for each following the same pattern.

- [ ] **Step 13.3: Add JSDoc on every named export (T4)**

  Short JSDoc block above each exported function. One example shown for brevity — repeat the pattern for every exported subcomponent the actual file has:

  ```tsx
  /**
   * Root of a dropdown menu. Controls open/close state and keyboard
   * navigation.
   */
  function DropdownMenu(...) { ... }

  /**
   * Element that opens the dropdown menu when clicked or activated
   * via keyboard. Pass `asChild` to avoid wrapping in an extra element.
   */
  function DropdownMenuTrigger(...) { ... }

  /**
   * Floating menu content. Accepts Radix positioning props.
   */
  function DropdownMenuContent(...) { ... }

  /**
   * Individual selectable menu item. Pass `disabled` to disable,
   * `variant="destructive"` (if supported in the file) for destructive
   * actions, or `onSelect` to handle selection.
   */
  function DropdownMenuItem(...) { ... }

  /**
   * Checkable menu item with a visible check mark when selected.
   * Use for toggleable settings inside a menu.
   */
  function DropdownMenuCheckboxItem(...) { ... }

  /**
   * Radio group container for mutually-exclusive menu items. Pair
   * with DropdownMenuRadioItem children.
   */
  function DropdownMenuRadioGroup(...) { ... }

  /**
   * Individual radio item inside a DropdownMenuRadioGroup.
   */
  function DropdownMenuRadioItem(...) { ... }

  /**
   * Static, non-interactive label for a group of menu items.
   */
  function DropdownMenuLabel(...) { ... }

  /**
   * Visual divider between groups of menu items.
   */
  function DropdownMenuSeparator(...) { ... }

  /**
   * Optional grouping wrapper for related menu items. Useful for
   * accessibility — groups get announced as a unit.
   */
  function DropdownMenuGroup(...) { ... }

  /**
   * Nested submenu root. Pair with DropdownMenuSubTrigger and
   * DropdownMenuSubContent for nested menus.
   */
  function DropdownMenuSub(...) { ... }

  /**
   * Trigger inside a parent menu that opens a nested submenu.
   */
  function DropdownMenuSubTrigger(...) { ... }

  /**
   * Content of a nested submenu.
   */
  function DropdownMenuSubContent(...) { ... }

  /**
   * Portal wrapper for the floating menu content. Usually the
   * Content subcomponent renders this automatically — use explicitly
   * only when manually composing.
   */
  function DropdownMenuPortal(...) { ... }

  /**
   * Visual shortcut hint shown on the right of a menu item (e.g.
   * "⌘K"). Non-functional — only renders the hint.
   */
  function DropdownMenuShortcut(...) { ... }
  ```

  Only JSDoc the subcomponents that actually exist in the file.

- [ ] **Step 13.4: Update the export block (T5)**

  Match the file's actual exports, preserving order:

  ```tsx
  export {
    DropdownMenu,
    DropdownMenuPortal,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
  };
  export type { DropdownMenuProps, DropdownMenuContentProps };
  ```

- [ ] **Step 13.5: Rule 1 audit (T6)**

  ```bash
  grep -nE '\[[^]]*#[0-9a-fA-F]{3,}|\[[^]]*[0-9]+px|\[[^]]*[0-9]+rem' packages/components/src/components/molecules/dropdown-menu/dropdown-menu.tsx
  ```

- [ ] **Step 13.6: Rewrite dropdown-menu.stories.tsx**

  Replace the entire file with:

  ```tsx
  import type { Meta, StoryObj } from "@storybook/react";
  import { userEvent, within, expect, waitFor } from "@storybook/test";
  import { useState } from "react";
  import {
    IconUser,
    IconCreditCard,
    IconSettings,
    IconLogout,
    IconTrash,
    IconPlus,
    IconUserPlus,
    IconMail,
    IconMessage,
  } from "@tabler/icons-react";
  import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuGroup,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
  } from "./dropdown-menu";
  import { Button } from "../../atoms/button/button";

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
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      const trigger = canvas.getByRole("button", { name: "Open menu" });
      await userEvent.click(trigger);
      await waitFor(async () => {
        await expect(
          canvas.getByRole("menuitem", { name: "Profile" })
        ).toBeInTheDocument();
      });
    },
  };

  export const WithSubmenus: Story = {
    render: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Invite</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>New tab</DropdownMenuItem>
          <DropdownMenuItem>New window</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Email</DropdownMenuItem>
              <DropdownMenuItem>Message</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Copy link</DropdownMenuItem>
                  <DropdownMenuItem>Download</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  export const WithIcons: Story = {
    render: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Account</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <IconUser />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconCreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconSettings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <IconLogout />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  export const WithCheckboxes: Story = {
    render: () => {
      const Wrapper = () => {
        const [showStatusBar, setShowStatusBar] = useState(true);
        const [showActivityBar, setShowActivityBar] = useState(false);
        const [showPanel, setShowPanel] = useState(false);
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">View</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={showStatusBar}
                onCheckedChange={setShowStatusBar}
              >
                Status bar
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showActivityBar}
                onCheckedChange={setShowActivityBar}
              >
                Activity bar
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showPanel}
                onCheckedChange={setShowPanel}
              >
                Panel
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      };
      return <Wrapper />;
    },
  };

  export const Destructive: Story = {
    render: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Actions</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <IconTrash />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  export const Complex: Story = {
    render: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Open</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <IconUser />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconCreditCard />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconSettings />
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <IconUserPlus />
              Invite users
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <IconPlus />
                Share
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>
                  <IconMail />
                  Email
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconMessage />
                  Message
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            <IconLogout />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };
  ```

- [ ] **Step 13.7: Rewrite dropdown-menu/COMPONENT.md**

  ```md
  ---
  name: DropdownMenu
  slug: dropdown-menu
  version: 0.1.0
  status: stable
  lastUpdated: 2026-04-14
  ---

  # Dropdown Menu

  Menu of actions that opens from a trigger button.

  ## Props

  Dropdown Menu is a compound component. The main pieces:

  - `DropdownMenu` — root, controls open state
  - `DropdownMenuTrigger` — element that opens the menu
  - `DropdownMenuContent` — floating menu container
  - `DropdownMenuItem` — individual selectable action
  - `DropdownMenuCheckboxItem` — toggleable item with a check mark
  - `DropdownMenuRadioGroup` / `DropdownMenuRadioItem` — mutually exclusive items
  - `DropdownMenuLabel` — non-interactive group heading
  - `DropdownMenuSeparator` — visual divider between groups
  - `DropdownMenuGroup` — accessibility-aware grouping
  - `DropdownMenuSub` / `DropdownMenuSubTrigger` / `DropdownMenuSubContent` — nested submenus

  All subcomponents accept their Radix primitive props via prop spread.

  ## Usage guidelines

  Use Dropdown Menu for a list of actions related to a trigger — typically a button next to content ("Actions" menu on a row, "More options" on a toolbar). Dropdown Menu is for *actions*, not navigation between pages (use a link, a Tabs component, or Breadcrumbs for navigation).

  **Don't use Dropdown Menu** for picking a value to submit — use Select or Combobox. **Don't use Dropdown Menu** for form controls embedded inside a flow — use a Popover.

  ## Best practices

  - **Do:** Use `asChild` on `DropdownMenuTrigger` so the trigger element controls its own semantics.
  - **Do:** Group related items with `DropdownMenuSeparator` between groups.
  - **Do:** Put destructive items at the bottom, visually separated, with destructive colour.
  - **Do:** Use icons next to item labels for scannability — consistent icon style across all items.
  - **Don't:** Build deep submenus (4+ levels) — they're hard to navigate on touch devices.
  - **Don't:** Mix checkbox items and action items in the same group — use a separator.

  ## Writing

  - Item labels use action verbs: "Delete", "Duplicate", "Rename", "Share".
  - Sentence case, short (1–3 words).
  - No trailing punctuation.
  - Destructive items should name the action plainly: "Delete", not "Remove forever".

  ## Quality checklist

  - [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
  - [x] Responsive: content repositions near edges via Radix
  - [x] Tokens only: no raw literals inside arbitrary value syntax
  ```

- [ ] **Step 13.8: Per-commit gate (T14)**

  ```bash
  cd packages/components && npx tsc --noEmit
  ```

- [ ] **Step 13.9: Commit (T15)**

  ```bash
  git add packages/components/src/components/molecules/dropdown-menu/
  git commit -m "$(cat <<'EOF'
  feat(dropdown-menu): conformance pass (#77)

  - Named DropdownMenuProps and DropdownMenuContentProps interfaces
    exported as types
  - JSDoc blocks on every named export
  - Stories meta with autodocs; Default, WithSubmenus (3 layers),
    WithIcons, WithCheckboxes (stateful, using useState), Destructive,
    and Complex stories — all user-specified
  - Minimal play function on Default: click trigger, assert menuitem
    visible
  - COMPONENT.md fully seeded (first draft), includes Writing guidance
    for item labels
  - Explicitly omitted shortcut stories per spec

  Refs #77

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 14: Select (#78)

**Files:**
- Modify: `packages/components/src/components/molecules/select/select.tsx`
- Modify: `packages/components/src/components/molecules/select/select.stories.tsx`
- Modify: `packages/components/src/components/molecules/select/COMPONENT.md`

**Key facts:**
- Category: `Forms/Select` (molecule)
- Radix wrapper. Current barrel lists: `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectScrollDownButton`, `SelectScrollUpButton`, `SelectSeparator`, `SelectTrigger`, `SelectValue`. Confirm against the real file.
- Interactive — minimal play function (click trigger, assert listbox visible, click an item, assert value updated)
- Three user-specified stories required: Default, WithGroups, Scrollable
- Writing section included (option text + placeholder guidance)

- [ ] **Step 14.1: Read the current file (T1)**

  ```bash
  cat packages/components/src/components/molecules/select/select.tsx
  ```

  Enumerate all named exports and confirm against the spec list.

- [ ] **Step 14.2: Add named interfaces (T2)**

  ```tsx
  export interface SelectProps
    extends React.ComponentProps<typeof SelectPrimitive.Root> {}

  export interface SelectTriggerProps
    extends React.ComponentProps<typeof SelectPrimitive.Trigger> {}

  export interface SelectContentProps
    extends React.ComponentProps<typeof SelectPrimitive.Content> {}
  ```

  Other subcomponents keep their inline types unless they have custom props.

- [ ] **Step 14.3: Add JSDoc on every named export (T4)**

  ```tsx
  /**
   * Root of a Select control. Holds open state and the currently
   * selected value. Pass `value` + `onValueChange` for controlled mode
   * or `defaultValue` for uncontrolled.
   */
  function Select(...) { ... }

  /**
   * Element that opens the Select when clicked. Typically wraps a
   * SelectValue to show the current selection.
   */
  function SelectTrigger(...) { ... }

  /**
   * Displays the current selected value inside the SelectTrigger.
   * Renders the `placeholder` prop when nothing is selected.
   */
  function SelectValue(...) { ... }

  /**
   * Floating listbox containing the SelectItems. Accepts Radix
   * positioning props.
   */
  function SelectContent(...) { ... }

  /**
   * Individual selectable option inside the listbox. `value` is
   * required and identifies the option in the Select's state.
   */
  function SelectItem(...) { ... }

  /**
   * Grouping wrapper for related SelectItems. Pair with SelectLabel
   * to label the group.
   */
  function SelectGroup(...) { ... }

  /**
   * Non-interactive label for a SelectGroup. Announced by assistive
   * tech when scoped to the group.
   */
  function SelectLabel(...) { ... }

  /**
   * Visual divider between SelectGroups or SelectItems.
   */
  function SelectSeparator(...) { ... }

  /**
   * Scroll-up affordance shown at the top of an overflowing listbox.
   * Renders automatically when content exceeds the container height.
   */
  function SelectScrollUpButton(...) { ... }

  /**
   * Scroll-down affordance shown at the bottom of an overflowing
   * listbox.
   */
  function SelectScrollDownButton(...) { ... }
  ```

  Only include JSDoc for subcomponents that exist in the file.

- [ ] **Step 14.4: Update the export block (T5)**

  ```tsx
  export {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectScrollDownButton,
    SelectScrollUpButton,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
  };
  export type { SelectProps, SelectTriggerProps, SelectContentProps };
  ```

  Match the file's actual order.

- [ ] **Step 14.5: Rule 1 audit (T6)**

  ```bash
  grep -nE '\[[^]]*#[0-9a-fA-F]{3,}|\[[^]]*[0-9]+px|\[[^]]*[0-9]+rem' packages/components/src/components/molecules/select/select.tsx
  ```

- [ ] **Step 14.6: Rewrite select.stories.tsx**

  ```tsx
  import type { Meta, StoryObj } from "@storybook/react";
  import { userEvent, within, expect, waitFor } from "@storybook/test";
  import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    SelectGroup,
    SelectLabel,
  } from "./select";

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
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select a cut" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="round">Round brilliant</SelectItem>
          <SelectItem value="princess">Princess</SelectItem>
          <SelectItem value="emerald">Emerald</SelectItem>
          <SelectItem value="oval">Oval</SelectItem>
        </SelectContent>
      </Select>
    ),
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      const trigger = canvas.getByRole("combobox");
      await userEvent.click(trigger);
      await waitFor(async () => {
        await expect(
          canvas.getByRole("option", { name: "Princess" })
        ).toBeInTheDocument();
      });
      await userEvent.click(canvas.getByRole("option", { name: "Princess" }));
      await waitFor(async () => {
        await expect(trigger).toHaveTextContent("Princess");
      });
    },
  };

  export const WithGroups: Story = {
    render: () => (
      <Select>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select a cut" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Round-like</SelectLabel>
            <SelectItem value="round">Round brilliant</SelectItem>
            <SelectItem value="oval">Oval</SelectItem>
            <SelectItem value="cushion">Cushion</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Rectangular</SelectLabel>
            <SelectItem value="princess">Princess</SelectItem>
            <SelectItem value="emerald">Emerald</SelectItem>
            <SelectItem value="radiant">Radiant</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Fancy</SelectLabel>
            <SelectItem value="marquise">Marquise</SelectItem>
            <SelectItem value="pear">Pear</SelectItem>
            <SelectItem value="heart">Heart</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    ),
  };

  const COUNTRIES = [
    "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada",
    "Chile", "China", "Colombia", "Czechia", "Denmark", "Egypt",
    "Finland", "France", "Germany", "Greece", "India", "Indonesia",
    "Ireland", "Italy", "Japan", "Mexico", "Netherlands", "New Zealand",
    "Norway", "Peru", "Poland", "Portugal", "Romania", "Singapore",
    "South Africa", "Spain", "Sweden", "Switzerland", "Thailand",
    "Turkey", "United Kingdom", "United States", "Vietnam",
  ];

  export const Scrollable: Story = {
    render: () => (
      <Select>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {COUNTRIES.map((country) => (
            <SelectItem key={country} value={country.toLowerCase()}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
  };
  ```

- [ ] **Step 14.7: Rewrite select/COMPONENT.md**

  ```md
  ---
  name: Select
  slug: select
  version: 0.1.0
  status: stable
  lastUpdated: 2026-04-14
  ---

  # Select

  Dropdown control for picking a single value from a list of options.

  ## Props

  Select is a compound component. The main pieces:

  - `Select` — root; controls value and open state
  - `SelectTrigger` — button that opens the listbox
  - `SelectValue` — shows the current selection or placeholder inside the trigger
  - `SelectContent` — floating listbox
  - `SelectItem` — individual option; `value` prop required
  - `SelectGroup` / `SelectLabel` — accessibility-aware grouping with a visible heading
  - `SelectSeparator` — divider between groups
  - `SelectScrollUpButton` / `SelectScrollDownButton` — scroll affordances for long lists

  All subcomponents accept their Radix primitive props via prop spread.

  ## Usage guidelines

  Use Select for single-value picks from a moderate list of options (~5–50). Always pair with a Label.

  **Don't use Select** for fewer than ~5 options — use RadioGroup, which shows all options at once. **Don't use Select** for very long lists where users need to type — use Combobox. **Don't use Select** for multi-select — use a multi-select Combobox or a checkbox list.

  ## Best practices

  - **Do:** Always pair with a Label — place it above the SelectTrigger.
  - **Do:** Provide a placeholder via `SelectValue`'s `placeholder` prop, describing what to select ("Select a country").
  - **Do:** Group related options with `SelectGroup` + `SelectLabel` when the option count is high.
  - **Do:** Cap the listbox height (`max-h-*` on `SelectContent`) so long lists scroll instead of overflowing the viewport.
  - **Don't:** Use Select for navigation between pages. It's a form control, not a navigation primitive.
  - **Don't:** Mix disabled items with enabled ones without a visual explanation of why they're disabled.

  ## Writing

  - **Placeholder:** describes the action, not the value. "Select a country", "Choose a plan" — sentence case.
  - **Option text:** concise and concrete. "Round brilliant", not "Round brilliant cut (with description)" — put detail in a description element.
  - **Group labels:** sentence case, 1–3 words.
  - Keep options alphabetically ordered when there's no natural ordering.

  ## Quality checklist

  - [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
  - [x] Responsive: listbox repositions near edges via Radix
  - [x] Tokens only: no raw literals inside arbitrary value syntax
  ```

- [ ] **Step 14.8: Per-commit gate (T14)**

  ```bash
  cd packages/components && npx tsc --noEmit
  ```

- [ ] **Step 14.9: Commit (T15)**

  ```bash
  git add packages/components/src/components/molecules/select/
  git commit -m "$(cat <<'EOF'
  feat(select): conformance pass (#78)

  - Named SelectProps, SelectTriggerProps, SelectContentProps
    interfaces exported as types
  - JSDoc blocks on every named export
  - Stories meta with autodocs; Default (with play function —
    click trigger, click option, assert value), WithGroups, and
    Scrollable stories per the spec
  - COMPONENT.md fully seeded (first draft), includes Writing
    guidance for placeholders and option text

  Refs #78

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 15: Dialog (#75)

**Files:**
- Modify: `packages/components/src/components/molecules/dialog/dialog.tsx`
- Modify: `packages/components/src/components/molecules/dialog/dialog.stories.tsx`
- Modify: `packages/components/src/components/molecules/dialog/COMPONENT.md`

**Key facts:**
- Category: `Overlays/Dialog` (molecule)
- Radix wrapper. Actual named exports (confirmed by reading the file): `Dialog`, `DialogClose`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogOverlay`, `DialogPortal`, `DialogTitle`, `DialogTrigger` — **10 exports**, not 8 as the spec said. The spec's list missed `DialogOverlay` and `DialogPortal`.
- `DialogContent` has a custom `showCloseButton?: boolean` prop (default `true`) that renders an `IconX` close button from `@tabler/icons-react`.
- `DialogFooter` has a custom `showCloseButton?: boolean` prop (default `false`) that renders a secondary outline close Button.
- Interactive — minimal play function (click trigger, assert dialog visible; click close, assert hidden)
- Writing section included (title + description guidance)

- [ ] **Step 15.1: Read the current file (T1)**

  ```bash
  cat packages/components/src/components/molecules/dialog/dialog.tsx
  ```

  Confirm: 10 named exports, `DialogContent` and `DialogFooter` have `showCloseButton` custom props, `DialogContent` imports `Button` and `IconX`.

- [ ] **Step 15.2: Add named interfaces (T2)**

  Only the subcomponents with custom props beyond Radix pass-through get named interfaces. That's `DialogContent` and `DialogFooter`. The root `Dialog` also gets one as the "primary" type export.

  ```tsx
  export interface DialogProps
    extends React.ComponentProps<typeof DialogPrimitive.Root> {}

  export interface DialogContentProps
    extends React.ComponentProps<typeof DialogPrimitive.Content> {
    showCloseButton?: boolean;
  }

  export interface DialogFooterProps
    extends React.ComponentProps<"div"> {
    showCloseButton?: boolean;
  }
  ```

  Update the `DialogContent` and `DialogFooter` function signatures to use the new interfaces. Leave every other subcomponent with its current inline type.

- [ ] **Step 15.3: Add JSDoc on every named export (T4)**

  ```tsx
  /**
   * Root of a Dialog. Holds open state and controls the overlay +
   * content rendering. Wraps Radix `Dialog.Root`.
   */
  function Dialog(...) { ... }

  /**
   * Element that opens the dialog when clicked. Pass `asChild` to
   * avoid wrapping in an extra element.
   */
  function DialogTrigger(...) { ... }

  /**
   * Portal target for the dialog's overlay and content. Rendered
   * automatically by DialogContent — use explicitly only when
   * manually composing.
   */
  function DialogPortal(...) { ... }

  /**
   * Close-the-dialog element. Use `asChild` to compose onto your
   * own button inside the dialog content.
   */
  function DialogClose(...) { ... }

  /**
   * Semi-transparent backdrop rendered behind the dialog content.
   * Clicking the overlay closes the dialog unless prevented on
   * DialogContent.
   */
  function DialogOverlay(...) { ... }

  /**
   * Dialog content container with a built-in close button.
   *
   * Pass `showCloseButton={false}` to omit the default close button
   * (e.g. for critical confirmations where the user must pick an
   * explicit action).
   */
  function DialogContent(...) { ... }

  /**
   * Header region of a Dialog. Typically contains a DialogTitle and
   * an optional DialogDescription.
   */
  function DialogHeader(...) { ... }

  /**
   * Footer region of a Dialog. Typically contains action buttons.
   *
   * Pass `showCloseButton` to render a secondary outline Close button
   * at the end of the footer. Off by default.
   */
  function DialogFooter(...) { ... }

  /**
   * Accessible title of the dialog. Required by Radix for screen
   * reader announcements.
   */
  function DialogTitle(...) { ... }

  /**
   * Short description of the dialog's purpose, announced after the
   * title by screen readers. Recommended for every dialog.
   */
  function DialogDescription(...) { ... }
  ```

- [ ] **Step 15.4: Update the export block (T5)**

  ```tsx
  export {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
  };
  export type { DialogProps, DialogContentProps, DialogFooterProps };
  ```

- [ ] **Step 15.5: Rule 1 audit (T6)**

  ```bash
  grep -nE '\[[^]]*#[0-9a-fA-F]{3,}|\[[^]]*[0-9]+px|\[[^]]*[0-9]+rem' packages/components/src/components/molecules/dialog/dialog.tsx
  ```

  Expected match: `w-[calc(100%-2rem)]` on `DialogContent`. This uses `calc()` with a literal `2rem` — raw literal inside arbitrary value syntax. **Flag it.**

  Add an inline comment directly above the offending line in the DialogContent className:

  ```tsx
  // clarity-v2: token-gap — raw 2rem literal inside calc() arbitrary value syntax, pending design review
  className={cn(
    "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] ...",
    ...
  )}
  ```

  Because the className is a multi-class string on a single line, the comment goes on the line immediately above the `className={cn(` call. The engineer notes the specific literal in the COMPONENT.md Known deviations section (Step 15.7).

- [ ] **Step 15.6: Rewrite dialog.stories.tsx**

  ```tsx
  import type { Meta, StoryObj } from "@storybook/react";
  import { userEvent, within, expect, waitFor } from "@storybook/test";
  import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
    DialogClose,
  } from "./dialog";
  import { Button } from "../../atoms/button/button";

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
        <DialogTrigger asChild>
          <Button>Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. It will permanently delete the
              item.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      const trigger = canvas.getByRole("button", { name: "Open dialog" });
      await userEvent.click(trigger);
      await waitFor(async () => {
        await expect(
          canvas.getByRole("dialog", { name: "Are you sure?" })
        ).toBeInTheDocument();
      });
    },
  };

  export const Destructive: Story = {
    render: () => (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="destructive">Delete account</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently deletes your account, all your data, and any
              associated resources. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive">Delete account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    ),
  };
  ```

- [ ] **Step 15.7: Rewrite dialog/COMPONENT.md**

  ```md
  ---
  name: Dialog
  slug: dialog
  version: 0.1.0
  status: stable
  lastUpdated: 2026-04-14
  ---

  # Dialog

  Modal overlay for focused tasks that require user attention.

  ## Props

  Dialog is a compound component. The main pieces:

  - `Dialog` — root; holds open state
  - `DialogTrigger` — element that opens the dialog
  - `DialogContent` — content container with a built-in close button
  - `DialogHeader` / `DialogTitle` / `DialogDescription` — structured header
  - `DialogFooter` — action buttons, optionally with a built-in Close button
  - `DialogClose` — any close-the-dialog element (use with `asChild`)
  - `DialogOverlay` / `DialogPortal` — overlay and portal primitives, usually rendered automatically

  ### DialogContent

  | Prop | Type | Default | Description |
  |------|------|---------|-------------|
  | `showCloseButton` | `boolean` | `true` | When `true`, renders a built-in close button in the top-right of the content. Set `false` for critical confirmations where the user must make an explicit choice. |

  ### DialogFooter

  | Prop | Type | Default | Description |
  |------|------|---------|-------------|
  | `showCloseButton` | `boolean` | `false` | When `true`, appends a secondary outline Close button at the end of the footer. |

  All subcomponents accept their Radix primitive props (or `<div>` attributes for header/footer) via prop spread.

  ## Usage guidelines

  Use Dialog for tasks that require the user's full attention and block interaction with the rest of the page — confirmations, short forms, critical alerts. A Dialog should always have a clear exit (Cancel, Close, or pick an action).

  **Don't use Dialog** for passive content — use a Popover or a Sheet. **Don't use Dialog** for long forms or multi-step flows — use a full page or a Sheet, which gives more room. **Don't use Dialog** to show errors that happen during another task — use an inline Alert instead.

  ## Best practices

  - **Do:** Always include a `DialogTitle` and `DialogDescription` — required for accessibility.
  - **Do:** Put the primary action on the right of the footer and the cancel / secondary action on the left.
  - **Do:** Use `variant="destructive"` on the primary button for destructive actions and explicitly name what will be deleted.
  - **Do:** Use `showCloseButton={false}` on `DialogContent` for critical confirmations where the user must pick an explicit action (not "close").
  - **Don't:** Nest dialogs — if a dialog needs its own confirmation, replace the dialog's content instead of opening a second layer.
  - **Don't:** Auto-close a dialog on success without a brief confirmation — the user should know why the dialog went away.

  ## Writing

  - **Title:** a clear question or statement. Sentence case. No punctuation unless it's a question ending in a question mark.
    - Do: "Delete your account?"
    - Don't: "Deletion Confirmation"
  - **Description:** one short sentence describing what will happen. End with a period.
    - Do: "This permanently deletes your account and all your data."
    - Don't: "Are you really sure you want to do this?"
  - **Button labels:** match the action in the title. If the title is "Delete your account?", the destructive button is "Delete account" — not "Yes" or "Confirm".

  ## Known deviations

  **Rule 1 — raw literal in arbitrary value syntax.** [`dialog.tsx`](./dialog.tsx) contains `max-w-[calc(100%-2rem)]` on `DialogContent`. The `2rem` is a raw literal and violates the revised Rule 1 in CONTRIBUTING.md. Flagged pending per-component review by the design lead — see the inline comment in the TSX.

  ## Quality checklist

  - [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
  - [x] Responsive: content caps at `sm:max-w-md` on small screens and above
  - [ ] Tokens only — flagged: raw `2rem` literal in `max-w-[calc(100%-2rem)]`. See Known deviations.
  ```

- [ ] **Step 15.8: Per-commit gate (T14)**

  ```bash
  cd packages/components && npx tsc --noEmit
  grep -nE '\[[^]]*#[0-9a-fA-F]{3,}|\[[^]]*[0-9]+px|\[[^]]*[0-9]+rem' packages/components/src/components/molecules/dialog/dialog.tsx
  ```

  Expected tsc: clean. Expected grep: the `max-w-[calc(100%-2rem)]` match, with the `// clarity-v2: token-gap` comment on the line above it.

- [ ] **Step 15.9: Commit (T15)**

  ```bash
  git add packages/components/src/components/molecules/dialog/
  git commit -m "$(cat <<'EOF'
  feat(dialog): conformance pass (#75)

  - Named DialogProps, DialogContentProps, DialogFooterProps
    interfaces exported as types. DialogContent and DialogFooter
    have custom showCloseButton props (preserved from shadcn import).
  - JSDoc blocks on all 10 named exports (Dialog, DialogTrigger,
    DialogPortal, DialogClose, DialogOverlay, DialogContent,
    DialogHeader, DialogFooter, DialogTitle, DialogDescription)
  - Stories meta with autodocs; Default (with play function —
    click trigger, assert dialog visible) and Destructive stories
  - Rule 1 flag: raw 2rem literal in max-w-[calc(100%-2rem)] —
    inline token-gap comment + Known deviations note. "Tokens only"
    quality checklist box stays unticked per the publishing-with-
    flagged-violations exception.
  - COMPONENT.md fully seeded (first draft), includes Writing
    guidance for title and description

  Refs #75

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 16: Sheet (#76)

**Files:**
- Modify: `packages/components/src/components/molecules/sheet/sheet.tsx`
- Modify: `packages/components/src/components/molecules/sheet/sheet.stories.tsx`
- Modify: `packages/components/src/components/molecules/sheet/COMPONENT.md`

**Key facts:**
- Category: `Overlays/Sheet` (molecule)
- Radix wrapper. Current barrel lists: `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`. Confirm against the real file.
- `SheetContent` typically has a `side` variant (`"top" | "right" | "bottom" | "left"`) implemented via CVA.
- Interactive — minimal play function (click trigger, assert sheet visible; press Escape, assert hidden)
- Writing section included (title + description guidance — same shape as Dialog)

- [ ] **Step 16.1: Read the current file (T1)**

  ```bash
  cat packages/components/src/components/molecules/sheet/sheet.tsx
  ```

  Enumerate exports. Check whether `SheetContent` uses CVA for `side` and whether it has any custom props beyond Radix pass-through.

- [ ] **Step 16.2: Add named interfaces (T2)**

  ```tsx
  export interface SheetProps
    extends React.ComponentProps<typeof SheetPrimitive.Root> {}

  export interface SheetContentProps
    extends React.ComponentProps<typeof SheetPrimitive.Content>,
      VariantProps<typeof sheetVariants> {}
  ```

  If `SheetContent` uses CVA with a local variants object (e.g. `sheetVariants`), intersect with `VariantProps<typeof sheetVariants>`. If not, drop the VariantProps line. If there are other custom props (e.g. a close button toggle like Dialog has), add them to the interface.

- [ ] **Step 16.3: Add JSDoc on the variants object if present (T3)**

  If `sheetVariants` (CVA) exists:

  ```tsx
  /**
   * Sheet variants.
   *
   * Side axis = which edge of the viewport the sheet slides in from (top, right, bottom, left)
   */
  ```

- [ ] **Step 16.4: Add JSDoc on every named export (T4)**

  ```tsx
  /**
   * Root of a Sheet. Side-anchored overlay for larger tasks or
   * persistent panels. Wraps Radix `Dialog.Root` internally (Sheet
   * is just a styled Dialog).
   */
  function Sheet(...) { ... }

  /**
   * Element that opens the sheet when clicked.
   */
  function SheetTrigger(...) { ... }

  /**
   * Close-the-sheet element. Use `asChild` to compose onto your own
   * button.
   */
  function SheetClose(...) { ... }

  /**
   * Sheet content container. Pass `side` to control which edge the
   * sheet slides in from — defaults to `"right"`.
   *
   * @see {@link sheetVariants} for the side variants.
   */
  function SheetContent(...) { ... }

  /**
   * Header region of a Sheet. Typically contains a SheetTitle and
   * an optional SheetDescription.
   */
  function SheetHeader(...) { ... }

  /**
   * Footer region of a Sheet. Typically contains action buttons.
   */
  function SheetFooter(...) { ... }

  /**
   * Accessible title of the sheet. Required by Radix for screen
   * reader announcements.
   */
  function SheetTitle(...) { ... }

  /**
   * Short description of the sheet's purpose.
   */
  function SheetDescription(...) { ... }
  ```

  Drop the `@see` tag on `SheetContent` if the file does not use CVA.

- [ ] **Step 16.5: Update the export block (T5)**

  ```tsx
  export {
    Sheet,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
  };
  export type { SheetProps, SheetContentProps };
  ```

  Include `sheetVariants` in the value export only if the file defines and exports it already. If not, don't invent a new export.

- [ ] **Step 16.6: Rule 1 audit (T6)**

  ```bash
  grep -nE '\[[^]]*#[0-9a-fA-F]{3,}|\[[^]]*[0-9]+px|\[[^]]*[0-9]+rem' packages/components/src/components/molecules/sheet/sheet.tsx
  ```

  Flag any matches.

- [ ] **Step 16.7: Rewrite sheet.stories.tsx**

  ```tsx
  import type { Meta, StoryObj } from "@storybook/react";
  import { userEvent, within, expect, waitFor } from "@storybook/test";
  import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
    SheetClose,
  } from "./sheet";
  import { Button } from "../../atoms/button/button";
  import { Input } from "../../atoms/input/input";
  import { Label } from "../../atoms/label/label";

  const meta: Meta<typeof Sheet> = {
    title: "Overlays/Sheet",
    component: Sheet,
    tags: ["autodocs"],
  };

  export default meta;
  type Story = StoryObj<typeof Sheet>;

  const ProfileForm = () => (
    <div className="flex flex-col gap-4 py-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" defaultValue="Jane Doe" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">Username</Label>
        <Input id="username" defaultValue="@janedoe" />
      </div>
    </div>
  );

  export const Default: Story = {
    render: () => (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Edit profile</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Save when you're done.
            </SheetDescription>
          </SheetHeader>
          <ProfileForm />
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button>Save changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    ),
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      const trigger = canvas.getByRole("button", { name: "Edit profile" });
      await userEvent.click(trigger);
      await waitFor(async () => {
        await expect(
          canvas.getByRole("dialog", { name: "Edit profile" })
        ).toBeInTheDocument();
      });
      await userEvent.keyboard("{Escape}");
      await waitFor(async () => {
        await expect(
          canvas.queryByRole("dialog", { name: "Edit profile" })
        ).not.toBeInTheDocument();
      });
    },
  };

  export const Left: Story = {
    render: () => (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open left sheet</Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>
              A side-anchored navigation panel.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    ),
  };

  export const Bottom: Story = {
    render: () => (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open bottom sheet</Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Quick actions</SheetTitle>
            <SheetDescription>
              Bottom-anchored sheets work well on mobile layouts.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    ),
  };
  ```

  If the actual `SheetContent` does not accept a `side` prop, remove the `Left` and `Bottom` stories and note the deviation in the commit body.

- [ ] **Step 16.8: Rewrite sheet/COMPONENT.md**

  ```md
  ---
  name: Sheet
  slug: sheet
  version: 0.1.0
  status: stable
  lastUpdated: 2026-04-14
  ---

  # Sheet

  Side-anchored overlay for larger tasks, forms, and persistent panels.

  ## Props

  Sheet is a compound component. The main pieces:

  - `Sheet` — root; holds open state
  - `SheetTrigger` — element that opens the sheet
  - `SheetContent` — content container; `side` selects which edge it slides in from
  - `SheetHeader` / `SheetTitle` / `SheetDescription` — structured header
  - `SheetFooter` — action buttons
  - `SheetClose` — any close-the-sheet element (use with `asChild`)

  ### SheetContent

  | Prop | Type | Default | Description |
  |------|------|---------|-------------|
  | `side` | `"top" \| "right" \| "bottom" \| "left"` | `"right"` | Which edge of the viewport the sheet slides in from. |

  All subcomponents accept their Radix primitive props via prop spread.

  ## Usage guidelines

  Use Sheet for tasks or panels that need more room than a Dialog but shouldn't navigate away from the current page — editing a record, browsing filters, reviewing details alongside a list.

  **Don't use Sheet** for short confirmations — use Dialog. **Don't use Sheet** as a navigation drawer in desktop layouts — use a persistent Sidebar instead.

  ## Best practices

  - **Do:** Use `side="right"` for edit / detail panels on desktop.
  - **Do:** Use `side="bottom"` for action sheets on mobile layouts.
  - **Do:** Always include a `SheetTitle` and `SheetDescription` — required for accessibility.
  - **Do:** Put primary + cancel actions in the `SheetFooter`, not scattered through the content.
  - **Don't:** Put so much content inside a Sheet that it requires deep scrolling — at that point, use a full page.
  - **Don't:** Open a Sheet from inside another Sheet.

  ## Writing

  - **Title:** concise statement of what's inside. Sentence case. "Edit profile", "Filters", "Order details".
  - **Description:** one short sentence of context.
  - **Footer buttons:** primary action on the right (e.g. "Save changes"), cancel on the left.

  ## Quality checklist

  - [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
  - [x] Responsive: anchors and sizes adapt to the chosen `side` variant
  - [x] Tokens only: no raw literals inside arbitrary value syntax
  ```

  If Step 16.6 flagged Rule 1 violations, flip the Tokens only box to unticked and add a `## Known deviations` section following Task 15's shape.

- [ ] **Step 16.9: Per-commit gate (T14)**

  ```bash
  cd packages/components && npx tsc --noEmit
  ```

- [ ] **Step 16.10: Commit (T15)**

  ```bash
  git add packages/components/src/components/molecules/sheet/
  git commit -m "$(cat <<'EOF'
  feat(sheet): conformance pass (#76)

  - Named SheetProps and SheetContentProps interfaces exported as types
  - JSDoc blocks on every named export (Sheet, SheetTrigger, SheetClose,
    SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription)
  - Stories meta with autodocs; Default (right side, with play function:
    click trigger, assert dialog, Escape, assert closed), Left, and
    Bottom stories. Top skipped — discoverable via argTypes.
  - COMPONENT.md fully seeded (first draft), includes Writing guidance
    for title, description, and footer button placement

  Refs #76

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 17: CHANGELOG entry

**Files:**
- Modify: `packages/components/CHANGELOG.md`

- [ ] **Step 17.1: Read the current CHANGELOG head**

  ```bash
  sed -n '1,20p' packages/components/CHANGELOG.md
  ```

  Identify where the most recent entry starts so the new entry goes immediately above it (reverse chronological). If there are any header lines (e.g. `# Changelog`), the new entry goes below them but above the most recent dated section.

- [ ] **Step 17.2: Insert the new entry**

  Use Edit tool to insert the entry below. The `old_string` is the current topmost dated section's heading line (e.g. `## 2026-04-13 — ...`); the `new_string` is the new entry followed by two blank lines and the original heading line.

  The entry:

  ```md
  ## 2026-04-14 — Phase B conformance pass (14 components) + CONTRIBUTING realignment

  Promoted 14 components to `stable` after a mechanical conformance pass against `packages/components/CONTRIBUTING.md`. Amended CONTRIBUTING's Rule 1 and Definition of Done to reflect the revised token-consumption policy, and retrofitted Button against the new rule.

  ### CONTRIBUTING.md changes

  - Reworded Rule 1: raw literals inside Tailwind arbitrary value syntax are forbidden; `var(--token)` inside arbitrary syntax is allowed. Mixed expressions where any literal leaks in are violations (e.g. `rounded-[min(var(--radius-md),10px)]` — the `10px` is the violation).
  - Added a "Handling violations" subsection: flag, don't fix. Inline `// clarity-v2: token-gap` comment in the TSX + Known deviations note in the COMPONENT.md.
  - Updated Definition of Done: components with flagged Rule 1 violations may be published (status `stable`, barrel-exported) but the "Tokens only" DoD item stays unticked until the flag is resolved. This is an explicit Phase B exception, not a permanent carve-out.
  - Sidebar taxonomy: `Breadcrumbs` → `Breadcrumb` (singular).

  ### Button retrofit

  Flagged the `rounded-[min(var(--radius-md),10px)]` line in [`button.tsx`](src/components/atoms/button/button.tsx) under the new violation policy. No code change — inline comment and Known deviations note added to COMPONENT.md. Quality checklist "Tokens only" box flipped from ticked to unticked with inline note. Button remains `stable`.

  Also added an **Icon Button pattern** section to Button's `COMPONENT.md` documenting the `<Button size="icon" aria-label="..."><Icon /></Button>` usage. Icon Button (#82) is a Button usage pattern, not a new component.

  ### Components promoted to `stable` (14)

  For each of Badge, Breadcrumb, Dialog, Dropdown Menu, Input, Label, Popover, Select, Separator, Sheet, Skeleton, Toggle Group, Tooltip:

  - Introduced a named `<Component>Props` interface exported as a type. Compound components (Dialog, Dropdown Menu, Select, Popover, Tooltip, Sheet, Breadcrumb) export named interfaces for subcomponents with custom props; pass-through subcomponents keep their inline types.
  - Added JSDoc blocks on the variants object (where CVA is used) and on every named export, including subcomponents.
  - Meta blocks with `tags: ["autodocs"]` and `argTypes` on every story file.
  - `COMPONENT.md` fully seeded with frontmatter, one-line description, props table, usage guidelines, best practices, writing (where the component renders user-facing text), and quality checklist.
  - Minimal play functions added for interactive components (Input, Toggle Group, Tooltip, Popover, Dropdown Menu, Select, Dialog, Sheet).
  - Rule 1 audit run on each component. Dialog was flagged for `max-w-[calc(100%-2rem)]` on `DialogContent`; recorded inline and under Known deviations in its COMPONENT.md. Other components either had no violations or were flagged with their own notes.
  - Uncommented the corresponding lines in [`src/index.ts`](src/index.ts) as part of the final barrel-exports commit.

  **User-specified story sets** landed for Dropdown Menu (Default, WithSubmenus 3-deep, WithIcons, WithCheckboxes, Destructive, Complex — shortcuts explicitly skipped), Popover (Default, WithForm), Select (Default, WithGroups, Scrollable), and Toggle Group (Default, Multiple, Spacing, DiamondCutSelector). The Toggle Group `DiamondCutSelector` story uses `@tabler/icons-react` placeholders (`IconCircle`, `IconSquare`, `IconHexagon`, `IconDiamond`, `IconPentagon`, `IconRhombus`) standing in for real diamond-cut icons — the story showcases the composition pattern, not the icon set.

  ### Scope explicitly excluded from this pass

  - Variant / intent / size taxonomy redesign per component. Current taxonomies are shadcn-flat inherited defaults — a review is a separate design-lead-led pass.
  - Fixing flagged Rule 1 violations. Per the new violation policy, each flag is a ticket for later per-component review.
  - Adding standalone vitest tests (Layer 4). None of the batch crosses the "non-trivial logic" threshold. Stories + a11y + minimal play functions cover them.
  - Exhaustive play-function coverage (keyboard navigation, deep focus management, edge cases) — follow-up pass.
  - Icon Button as a standalone component (see Button retrofit above).

  ### Draft content flag

  All Usage guidelines, Best practices, and Writing sections across the 14 `COMPONENT.md` files are author-drafted from general design-system best practice (Material, Carbon, Radix, shadcn, a11y conventions). They are explicit first drafts pending design-lead review. No Nivoda-specific context was used in drafting — Chris reviews before the PR merges.

  ### Verification

  `tsc --noEmit`, `nx build components`, `vitest run --project=storybook`, and a Storybook dev smoke check all pass after the full pass.

  ### Issues addressed

  Refs #58, #59, #60, #61, #62, #72, #73, #74, #75, #76, #77, #78, #82, #83. Closed on PR merge via PR description.

  See [`docs/superpowers/specs/2026-04-14-phase-b-conformance-design.md`](../../docs/superpowers/specs/2026-04-14-phase-b-conformance-design.md) for the full spec.

  ```

- [ ] **Step 17.3: Verify the entry landed and renders cleanly**

  ```bash
  sed -n '1,80p' packages/components/CHANGELOG.md
  ```

  Expected: the new entry appears first, the previous topmost entry follows below.

- [ ] **Step 17.4: Commit**

  ```bash
  git add packages/components/CHANGELOG.md
  git commit -m "$(cat <<'EOF'
  docs(changelog): log Phase B conformance pass

  One consolidated entry covering the 14-component conformance pass,
  the CONTRIBUTING Rule 1 / DoD realignment, and the Button retrofit.

  Refs #58, #59, #60, #61, #62, #72, #73, #74, #75, #76, #77, #78, #82, #83

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 18: Barrel exports — uncomment all 14 components in src/index.ts

**Files:**
- Modify: `packages/components/src/index.ts`

**Strategy:** For each of the 14 components, uncomment the value export line(s) that already exist in the file and add a matching `export type` line immediately below. Match the exact formatting and order already used in the file — do NOT reorder sections.

- [ ] **Step 18.1: Read the current barrel file**

  ```bash
  cat packages/components/src/index.ts
  ```

  Confirm each of the 14 components has a commented-out line. The current barrel (as of the start of this pass) has:

  - `// export { Badge, badgeVariants } from "./components/atoms/badge/badge";`
  - `// export { Input } from "./components/atoms/input/input";`
  - `// export { Label } from "./components/atoms/label/label";`
  - `// export { Popover, PopoverAnchor, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "./components/atoms/popover/popover";`
  - `// export { Separator } from "./components/atoms/separator/separator";`
  - `// export { Skeleton } from "./components/atoms/skeleton/skeleton";`
  - `// export { ToggleGroup, ToggleGroupItem } from "./components/atoms/toggle-group/toggle-group";`
  - `// export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/atoms/tooltip/tooltip";`
  - `// export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "./components/molecules/breadcrumb/breadcrumb";`
  - `// export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "./components/molecules/dialog/dialog";`
  - `// export { DropdownMenu, DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "./components/molecules/dropdown-menu/dropdown-menu";`
  - `// export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue } from "./components/molecules/select/select";`
  - `// export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "./components/molecules/sheet/sheet";`

  Icon Button has no barrel line — it's a Button usage pattern.

- [ ] **Step 18.2: Uncomment Badge + add type export**

  Use Edit tool. Replace:
  ```ts
  // export { Badge, badgeVariants } from "./components/atoms/badge/badge";
  ```
  with:
  ```ts
  export { Badge, badgeVariants } from "./components/atoms/badge/badge";
  export type { BadgeProps } from "./components/atoms/badge/badge";
  ```

- [ ] **Step 18.3: Uncomment Input + add type export**

  Replace:
  ```ts
  // export { Input } from "./components/atoms/input/input";
  ```
  with:
  ```ts
  export { Input } from "./components/atoms/input/input";
  export type { InputProps } from "./components/atoms/input/input";
  ```

- [ ] **Step 18.4: Uncomment Label + add type export**

  Replace:
  ```ts
  // export { Label } from "./components/atoms/label/label";
  ```
  with:
  ```ts
  export { Label } from "./components/atoms/label/label";
  export type { LabelProps } from "./components/atoms/label/label";
  ```

- [ ] **Step 18.5: Uncomment Popover + add type exports**

  Replace:
  ```ts
  // export { Popover, PopoverAnchor, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "./components/atoms/popover/popover";
  ```
  with:
  ```ts
  export { Popover, PopoverAnchor, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "./components/atoms/popover/popover";
  export type { PopoverProps, PopoverContentProps } from "./components/atoms/popover/popover";
  ```

- [ ] **Step 18.6: Uncomment Separator + add type export**

  Replace:
  ```ts
  // export { Separator } from "./components/atoms/separator/separator";
  ```
  with:
  ```ts
  export { Separator } from "./components/atoms/separator/separator";
  export type { SeparatorProps } from "./components/atoms/separator/separator";
  ```

- [ ] **Step 18.7: Uncomment Skeleton + add type export**

  Replace:
  ```ts
  // export { Skeleton } from "./components/atoms/skeleton/skeleton";
  ```
  with:
  ```ts
  export { Skeleton } from "./components/atoms/skeleton/skeleton";
  export type { SkeletonProps } from "./components/atoms/skeleton/skeleton";
  ```

- [ ] **Step 18.8: Uncomment Toggle Group + add type exports**

  Replace:
  ```ts
  // export { ToggleGroup, ToggleGroupItem } from "./components/atoms/toggle-group/toggle-group";
  ```
  with:
  ```ts
  export { ToggleGroup, ToggleGroupItem } from "./components/atoms/toggle-group/toggle-group";
  export type { ToggleGroupProps, ToggleGroupItemProps } from "./components/atoms/toggle-group/toggle-group";
  ```

- [ ] **Step 18.9: Uncomment Tooltip + add type exports**

  Replace:
  ```ts
  // export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/atoms/tooltip/tooltip";
  ```
  with:
  ```ts
  export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/atoms/tooltip/tooltip";
  export type { TooltipProps, TooltipContentProps } from "./components/atoms/tooltip/tooltip";
  ```

- [ ] **Step 18.10: Uncomment Breadcrumb + add type export**

  Replace:
  ```ts
  // export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "./components/molecules/breadcrumb/breadcrumb";
  ```
  with:
  ```ts
  export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "./components/molecules/breadcrumb/breadcrumb";
  export type { BreadcrumbProps } from "./components/molecules/breadcrumb/breadcrumb";
  ```

- [ ] **Step 18.11: Uncomment Dialog + add type exports**

  Replace:
  ```ts
  // export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "./components/molecules/dialog/dialog";
  ```
  with:
  ```ts
  export { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "./components/molecules/dialog/dialog";
  export type { DialogProps, DialogContentProps, DialogFooterProps } from "./components/molecules/dialog/dialog";
  ```

- [ ] **Step 18.12: Uncomment Dropdown Menu + add type exports**

  Replace:
  ```ts
  // export { DropdownMenu, DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "./components/molecules/dropdown-menu/dropdown-menu";
  ```
  with:
  ```ts
  export { DropdownMenu, DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "./components/molecules/dropdown-menu/dropdown-menu";
  export type { DropdownMenuProps, DropdownMenuContentProps } from "./components/molecules/dropdown-menu/dropdown-menu";
  ```

- [ ] **Step 18.13: Uncomment Select + add type exports**

  Replace:
  ```ts
  // export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue } from "./components/molecules/select/select";
  ```
  with:
  ```ts
  export { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue } from "./components/molecules/select/select";
  export type { SelectProps, SelectTriggerProps, SelectContentProps } from "./components/molecules/select/select";
  ```

- [ ] **Step 18.14: Uncomment Sheet + add type exports**

  Replace:
  ```ts
  // export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "./components/molecules/sheet/sheet";
  ```
  with:
  ```ts
  export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "./components/molecules/sheet/sheet";
  export type { SheetProps, SheetContentProps } from "./components/molecules/sheet/sheet";
  ```

  **Note:** if any component task in Tasks 3–16 created different type exports than listed here (e.g. the actual file had extra custom props), adjust the `export type` line to match the actual interfaces. The authoritative list is what each per-component task step T5 landed in the TSX file.

- [ ] **Step 18.15: Verify the barrel type-checks**

  ```bash
  cd packages/components && npx tsc --noEmit
  ```

  Expected: clean. TypeScript will surface any mismatch between the barrel's type exports and the actual interfaces — fix by editing the barrel line to match what each component's TSX actually exports.

- [ ] **Step 18.16: Commit**

  ```bash
  git add packages/components/src/index.ts
  git commit -m "$(cat <<'EOF'
  feat(components): uncomment barrel exports for Phase B batch

  All 14 Phase B components are now exported from the package barrel
  following the three-export pattern (value exports + type exports).
  Consumers can now import directly from @clarity-v2/components.

  Components: Badge, Breadcrumb, Dialog, Dropdown Menu, Input, Label,
  Popover, Select, Separator, Sheet, Skeleton, Toggle Group, Tooltip.

  Icon Button (#82) is not in the barrel — it's a Button usage pattern.

  Refs #58, #59, #60, #61, #62, #72, #73, #74, #75, #76, #77, #78, #83

  Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
  EOF
  )"
  ```

---

### Task 19: Final verification + PR prep

**Files:** none modified. This task runs the full verification gate and produces the PR description.

- [ ] **Step 19.1: Type-check**

  ```bash
  cd packages/components && npx tsc --noEmit
  ```

  Expected: clean. If errors, diagnose and fix in a follow-up commit before pushing. Do NOT squash fix commits into earlier component commits.

- [ ] **Step 19.2: Nx build**

  ```bash
  cd /Users/jlfgms/Desktop/Code/clarity-v2
  npx nx build components
  ```

  Expected: succeeds. If it fails with a bundler error surfacing a hidden export issue, fix in a follow-up commit.

- [ ] **Step 19.3: Storybook tests (render + a11y + play functions)**

  ```bash
  cd packages/components && npm run test:storybook
  ```

  Expected: all stories pass render tests, axe-core passes on every story, all play functions succeed. If any failure:
  - Render failure → fix the story or the component immediately
  - axe-core violation → either fix or justify in the component's COMPONENT.md and re-run
  - Play function failure → fix the assertion (hover/click timing) or the underlying behaviour

  Any fix lands as a follow-up commit, referenced in the PR description.

- [ ] **Step 19.4: Storybook dev smoke check**

  ```bash
  cd packages/components && npx storybook dev -p 6006
  ```

  Expected: Storybook starts without errors on port 6006. Open http://localhost:6006 in a browser. Verify that every one of the 14 components has a visible sidebar entry under its category (Display, Feedback, Forms, Overlays, Actions, Navigation). Click through each story for each component — verify no runtime errors in the browser console.

  Stop the dev server with Ctrl+C when done.

- [ ] **Step 19.5: Rule 1 grep sweep**

  ```bash
  for f in \
    packages/components/src/components/atoms/badge/badge.tsx \
    packages/components/src/components/atoms/input/input.tsx \
    packages/components/src/components/atoms/label/label.tsx \
    packages/components/src/components/atoms/popover/popover.tsx \
    packages/components/src/components/atoms/separator/separator.tsx \
    packages/components/src/components/atoms/skeleton/skeleton.tsx \
    packages/components/src/components/atoms/toggle-group/toggle-group.tsx \
    packages/components/src/components/atoms/tooltip/tooltip.tsx \
    packages/components/src/components/molecules/breadcrumb/breadcrumb.tsx \
    packages/components/src/components/molecules/dialog/dialog.tsx \
    packages/components/src/components/molecules/dropdown-menu/dropdown-menu.tsx \
    packages/components/src/components/molecules/select/select.tsx \
    packages/components/src/components/molecules/sheet/sheet.tsx; do
    echo "=== $f ==="
    grep -nE '\[[^]]*#[0-9a-fA-F]{3,}|\[[^]]*[0-9]+px|\[[^]]*[0-9]+rem' "$f" || echo "(no matches)"
  done
  ```

  Expected: every match is accompanied by a `// clarity-v2: token-gap` comment on the line immediately above it. If any match has no accompanying flag, add the flag in a follow-up commit + update that component's `COMPONENT.md` Known deviations section.

- [ ] **Step 19.6: Verify commit history**

  ```bash
  git log --oneline origin/main..HEAD
  ```

  Expected: the 18 commits from this pass (plus any follow-up fix commits from Steps 19.1–19.5). Verify each commit has a `Refs #NN` reference where applicable.

- [ ] **Step 19.7: Push the branch**

  ```bash
  git push -u origin feat/phase-b-rough-component-pass
  ```

  Expected: push succeeds. If the branch was already pushed (the spec commit and CONTRIBUTING cleanup commit) this becomes a fast-forward.

- [ ] **Step 19.8: Open the PR**

  Run:

  ```bash
  gh pr create --title "Phase B conformance pass: 14 components + CONTRIBUTING realignment" --body "$(cat <<'EOF'
  ## Summary

  Mechanical conformance pass applying [`packages/components/CONTRIBUTING.md`](packages/components/CONTRIBUTING.md) to 14 Phase B components, plus CONTRIBUTING Rule 1 / Definition of Done realignment and a Button retrofit against the new rule.

  **Components promoted to `stable`:** Badge, Breadcrumb, Dialog, Dropdown Menu, Input, Label, Popover, Select, Separator, Sheet, Skeleton, Toggle Group, Tooltip.

  **Icon Button (#82)** is documented as a Button usage pattern in [`button/COMPONENT.md`](packages/components/src/components/atoms/button/COMPONENT.md), not as a new component.

  Full spec: [`docs/superpowers/specs/2026-04-14-phase-b-conformance-design.md`](docs/superpowers/specs/2026-04-14-phase-b-conformance-design.md).
  CHANGELOG: [`packages/components/CHANGELOG.md`](packages/components/CHANGELOG.md) (top entry).

  ### What changed

  - **CONTRIBUTING.md** — reworded Rule 1 to forbid raw literals inside Tailwind arbitrary value syntax while explicitly allowing `var(--token)` inside arbitrary syntax. Added a violation policy (flag, don't fix). Updated the Definition of Done with a publishing-with-flagged-violations exception.
  - **Button retrofit** — flagged `rounded-[min(var(--radius-md),10px)]` under the new rule. No code change, no version bump.
  - **14 component commits** — named `Props` interfaces, JSDoc blocks, updated stories, seeded `COMPONENT.md` files, minimal play functions for interactive components.
  - **User-specified stories** landed for Dropdown Menu (6 stories including Complex), Popover (WithForm), Select (WithGroups, Scrollable), and Toggle Group (including DiamondCutSelector with Tabler icon placeholders).
  - **Barrel exports** uncommented for all 14 components in [`src/index.ts`](packages/components/src/index.ts).
  - **CHANGELOG entry** — one consolidated `2026-04-14` entry at the top of `packages/components/CHANGELOG.md`.

  ### Draft content review needed

  All **Usage guidelines**, **Best practices**, and **Writing** sections across the 14 `COMPONENT.md` files are author-drafted from general design-system best practice. They are explicit first drafts and need Chris's review before merge. Files to review:

  - [`badge/COMPONENT.md`](packages/components/src/components/atoms/badge/COMPONENT.md)
  - [`breadcrumb/COMPONENT.md`](packages/components/src/components/molecules/breadcrumb/COMPONENT.md)
  - [`dialog/COMPONENT.md`](packages/components/src/components/molecules/dialog/COMPONENT.md)
  - [`dropdown-menu/COMPONENT.md`](packages/components/src/components/molecules/dropdown-menu/COMPONENT.md)
  - [`input/COMPONENT.md`](packages/components/src/components/atoms/input/COMPONENT.md)
  - [`label/COMPONENT.md`](packages/components/src/components/atoms/label/COMPONENT.md)
  - [`popover/COMPONENT.md`](packages/components/src/components/atoms/popover/COMPONENT.md)
  - [`select/COMPONENT.md`](packages/components/src/components/molecules/select/COMPONENT.md)
  - [`separator/COMPONENT.md`](packages/components/src/components/atoms/separator/COMPONENT.md)
  - [`sheet/COMPONENT.md`](packages/components/src/components/molecules/sheet/COMPONENT.md)
  - [`skeleton/COMPONENT.md`](packages/components/src/components/atoms/skeleton/COMPONENT.md)
  - [`toggle-group/COMPONENT.md`](packages/components/src/components/atoms/toggle-group/COMPONENT.md)
  - [`tooltip/COMPONENT.md`](packages/components/src/components/atoms/tooltip/COMPONENT.md)
  - [`button/COMPONENT.md`](packages/components/src/components/atoms/button/COMPONENT.md) — new Icon Button pattern section

  ### Flagged Rule 1 violations

  Every flag is a ticket for a later per-component review. Publishing is allowed; the "Tokens only" DoD item stays unticked in the affected component.

  - **Button** — `rounded-[min(var(--radius-md),10px)]` (retrofit from prior pass)
  - **Dialog** — `max-w-[calc(100%-2rem)]` on `DialogContent`
  - (Add any additional flags surfaced by the Rule 1 audit in Tasks 3–16.)

  ### Scope explicitly excluded

  - Variant / intent / size taxonomy redesigns
  - Fixing flagged Rule 1 violations (per the new policy)
  - Standalone vitest tests (Layer 4) — none crossed the "non-trivial logic" threshold
  - Exhaustive play-function coverage — follow-up pass

  ## Test plan

  - [ ] `tsc --noEmit` in `packages/components`
  - [ ] `npx nx build components`
  - [ ] `npm run test:storybook` — all stories pass render, a11y, and play functions
  - [ ] Storybook dev smoke check — every component's sidebar entry renders without console errors
  - [ ] Rule 1 grep sweep — every match has a `// clarity-v2: token-gap` comment
  - [ ] Chris's design review of the 14 `COMPONENT.md` drafts before merge

  Closes #58, #59, #60, #61, #62, #72, #73, #74, #75, #76, #77, #78, #82, #83

  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  EOF
  )"
  ```

  Return the PR URL to the user when it's created.

---

## Self-review checklist (for the agent executing this plan)

Before marking the pass complete:

- [ ] All 18 commits landed in the order shown in §5.1 of the spec.
- [ ] Every component commit references its GH issue via `Refs #NN` in the body.
- [ ] Every new `Props` interface is exported as a type from its component file and from `src/index.ts`.
- [ ] Every named export in every component has a JSDoc block (component + subcomponents + variants object when CVA is used).
- [ ] Every `COMPONENT.md` has filled-in frontmatter, one-line description, props table, usage guidelines, best practices, quality checklist. Writing section only where applicable.
- [ ] Every interactive component has a minimal play function on its Default story.
- [ ] CHANGELOG has one consolidated `2026-04-14` entry at the top listing all 14 components + the CONTRIBUTING changes + the Button retrofit.
- [ ] Barrel exports in `src/index.ts` match the three-export pattern (value + type).
- [ ] Every Rule 1 violation has an inline `// clarity-v2: token-gap` comment AND a `## Known deviations` entry in that component's `COMPONENT.md`.
- [ ] `tsc --noEmit`, `nx build components`, `test:storybook`, Storybook dev smoke all pass.
- [ ] PR is open, title + body correct, issues will close on merge.
