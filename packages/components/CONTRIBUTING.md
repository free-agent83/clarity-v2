# Contributing to the Clarity V2 Web Components Library

Conventions for building, testing, documenting, and shipping web components in Clarity V2. This document is the single reference for anyone — human or AI agent — contributing to the component library.

This is a living document. Conventions will evolve as Phase B progresses and real use reveals what works and what doesn't. The existing Button component (`src/components/atoms/button/`) is a living reference for most patterns described here.

---

## Folder structure

Components are organised using atomic design taxonomy:

```
src/components/
├── atoms/        Single-purpose primitives (Button, Input, Badge, Label, Separator)
├── molecules/    Composed from atoms (Card, Dialog, Tooltip, Tabs)
└── organisms/    Complex compositions (DataTable, AppShell)
```

**Classification guidance:**
- **Atoms** render a single interactive or display element. They don't compose other components from this library.
- **Molecules** combine two or more atoms into a reusable unit with its own behaviour.
- **Organisms** are complex, page-level compositions. Rare in a design system — most components are atoms or molecules.

When in doubt, start as an atom. Promote to molecule when composition becomes the component's defining characteristic.

### Files per component

Each component lives in its own folder with kebab-case naming:

```
src/components/atoms/button/
├── button.tsx              Component implementation (required)
├── button.stories.tsx      Storybook stories (required)
├── COMPONENT.md            Documentation (required)
└── button.test.tsx          Tests (only when the component has non-trivial logic)
```

- File names: **kebab-case** (`date-picker.tsx`, `radio-group.stories.tsx`)
- Component names: **PascalCase** (`DatePicker`, `RadioGroup`)

---

## Component implementation conventions

### CVA for variants

When a component has visual variants, define them with `cva()` from `class-variance-authority`:

```tsx
const buttonVariants = cva(
  "base classes applied to all variants",
  {
    variants: {
      variant: { contained: "...", outlined: "..." },
      size: { sm: "...", md: "...", lg: "..." },
    },
    compoundVariants: [
      { variant: "contained", intent: "success", className: "..." },
    ],
    defaultVariants: {
      variant: "contained",
      size: "md",
    },
  }
);
```

Not every component needs CVA. Simple components without visual variants can use `cn()` directly.

### cn() for class merging

Always use `cn()` from `@/lib/utils` to merge class names. Never concatenate strings manually — `cn()` handles Tailwind class conflicts via `tailwind-merge`.

```tsx
// Do
<div className={cn("bg-primary text-foreground", className)} />

// Don't
<div className={`bg-primary text-foreground ${className}`} />
```

### TypeScript

- Use `interface` (not `type`) for component props.
- Extend the native HTML element attributes for the root element.
- Intersect with `VariantProps<typeof variants>` when using CVA.
- Export the Props interface.

```tsx
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
```

### Named exports only

Every component uses named exports. No default exports.

```tsx
export { Button, buttonVariants };
export type { ButtonProps };
```

### Other patterns

The following patterns are encouraged where appropriate but not mandated for every component:

- **`React.forwardRef`** — use when consumers need ref access (most components).
- **`displayName`** — set it when using `forwardRef` for better DevTools and Storybook labels.
- **Radix `Slot` / `asChild`** — use when the component wraps a single element and consumers may need to swap the underlying element (e.g., rendering a Button as a link).

See the Button implementation for a reference that uses all of these.

---

## Token consumption rules

**Use Tailwind utility classes only.** Components reference design tokens through Tailwind's theme — never through raw CSS variables.

```tsx
// Do
"bg-primary text-foreground border-border"

// Don't
"bg-[var(--color-semantic-primary-default)]"
```

The `@theme` block in `src/styles/globals.css` bridges DTCG tokens to Tailwind utility classes. If a token you need doesn't have a Tailwind mapping, add it to `globals.css` — don't use arbitrary values in components.

**Hard rules:**
- No hardcoded colors, spacing, border-radius, or shadows anywhere in component code.
- No Tailwind arbitrary value syntax (`bg-[#hex]`, `p-[14px]`) for values that should be tokens.
- If the design calls for a value not in the token set, flag it — don't invent a token.

> **Note:** The current Button has 3 instances of `bg-[var(...)]` on lines 27, 48, and 55. This is tech debt to fix, not a pattern to follow.

---

## Storybook stories

### Format and structure

Stories use CSF3 (Component Story Format 3):

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Component } from "./component";

const meta: Meta<typeof Component> = {
  title: "Atoms/Component",
  component: Component,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Primary: Story = {
  args: { children: "Primary", variant: "primary" },
};
```

### Requirements

- **`tags: ["autodocs"]`** on every meta — auto-generates the docs page.
- **`argTypes`** with `control: "select"` for all variant/enum props.
- **Sidebar title** follows the atomic taxonomy: `"Atoms/Button"`, `"Molecules/Card"`, etc.

### Story naming

PascalCase, variant-first:
- Variant values: `Contained`, `Outlined`, `Secondary`
- Compound variants: `ContainedSuccess`, `OutlinedError`
- Sizes: `Small`, `Large`
- States: `Disabled`, `Loading`

### Minimum story set

Every component must have stories covering:
- One story per variant value
- One story per size (if the component has a size axis)
- Key states: disabled, loading, error (where applicable)
- Compound variants where intent or state changes the visual appearance

### Play functions for interactive components

Interactive components (form inputs, dialogs, tooltips, tabs, etc.) must include `play` functions that test core interactions:

```tsx
import { userEvent, within, expect } from "@storybook/test";

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");
    await userEvent.click(input);
    await userEvent.type(input, "Hello");
    await expect(input).toHaveValue("Hello");
  },
};
```

Use `@storybook/test` utilities: `userEvent`, `within`, `expect`, `fn`.

---

## Testing strategy

### Layer 1 — Stories as render tests (required)

Every story is a render test via `@storybook/addon-vitest`. If it renders without throwing, it passes. This comes for free once the addon is installed — no extra work per component.

### Layer 2 — Accessibility checks (required)

`@storybook/addon-a11y` runs axe-core checks on every story. Accessibility violations fail the component. If a violation is intentionally accepted (rare), it must be documented and justified in the component's `COMPONENT.md`.

### Layer 3 — Interaction tests (required for interactive components)

Stateful and interactive components must have `play` functions in their stories testing core interactions:
- Focus management
- Keyboard navigation
- Open/close behaviour (dialogs, tooltips, dropdowns)
- Value input and selection (form controls)

### Layer 4 — Standalone vitest tests (when warranted)

Only for components with non-trivial logic — complex state management, computed values, edge cases that can't be covered by stories. Co-located as `<name>.test.tsx` in the component folder.

Most atoms and simple molecules won't need standalone tests. The stories + a11y + play functions cover them.

### Running tests

```bash
# Run all component tests (stories + standalone)
vitest --project=storybook

# In CI
vitest --project=storybook --run
```

---

## COMPONENT.md documentation

Every component folder contains a `COMPONENT.md` with YAML frontmatter and content sections.

### Frontmatter

```yaml
---
name: Button
slug: button
version: 0.1.0
status: unstable
lastUpdated: 2026-04-09
---
```

| Field | Format | Description |
|-------|--------|-------------|
| `name` | PascalCase | Component name as used in code |
| `slug` | kebab-case | For tooling and quick referencing |
| `version` | semver | Component-level version, independent of package version |
| `status` | `stable` / `unstable` / `deprecated` | Current lifecycle status |
| `lastUpdated` | `YYYY-MM-DD` | Must be updated whenever the component or its docs are touched |

### Content sections

#### 1. Component name

Heading and one-line description of what the component is and does.

#### 2. Props

Table derived from the TypeScript interface:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"contained" \| "outlined" \| ...` | `"contained"` | Visual style of the button |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Button size |
| `asChild` | `boolean` | `false` | Render as child element via Radix Slot |

#### 3. Usage guidelines

When to use this component. When NOT to use it — and what to use instead.

#### 4. Best practices

Dos and don'ts with short code examples:

```md
**Do:** Use `contained` for primary actions — one per screen section.

**Don't:** Use `link` variant for navigation that leaves the current page — use an actual `<a>` tag or Next.js `<Link>`.
```

#### 5. Writing (optional)

Guidance on user-facing text rendered by this component. Include only when the component renders text that contributors need guidance on (button labels, alert messages, tooltip content, etc.). Omit this section entirely for components where it doesn't apply.

Example for Button:
- Use action verbs: "Save", "Delete", "Continue" — not "OK" or "Click here"
- Keep labels short: 1-3 words
- No ALL CAPS — the component handles text styling

#### 6. Quality checklist

Filled-in checklist for this specific component:

```md
- [x] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [x] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [x] Tokens only: no hardcoded visual values
```

---

## Export conventions

Every stable component must be exported from `src/index.ts`:

```tsx
export { Button, buttonVariants } from "./components/atoms/button/button";
export type { ButtonProps } from "./components/atoms/button/button";
```

Pattern:
- Named export: the component itself
- Named export: the variants object (when using CVA)
- Type-only export: the Props interface

---

## Definition of done

A component is considered done when all of the following are true:

- [ ] Implementation follows conventions (CVA, cn(), TypeScript, named exports)
- [ ] All visual values come from tokens via Tailwind — no hardcoded values
- [ ] Stories cover all variants, sizes, states, and compound variants
- [ ] `tags: ["autodocs"]` present on story meta
- [ ] Interactive components have play functions testing core interactions
- [ ] Accessibility addon shows no violations
- [ ] `COMPONENT.md` has frontmatter (name, slug, version, status, lastUpdated)
- [ ] `COMPONENT.md` content sections are complete (props, usage, best practices, quality checklist)
- [ ] Quality checklist in COMPONENT.md is filled in and passing
- [ ] Component and variants exported from `src/index.ts`
- [ ] Storybook renders all stories without errors
- [ ] TypeScript compiles with no errors (`tsc --noEmit`)

---

## shadcn CLI (open question)

No `components.json` exists in this repo yet. During Phase B, both approaches will be tested:

1. **CLI scaffolding** — `npx shadcn add <component>`, then adapt to our conventions (rename, restructure, adjust tokens)
2. **Manual build** — reference shadcn/Radix source, build from scratch following our conventions

Decision will be made after trying both on a few components. Check with the design lead before committing to an approach.

---

## Setup: testing infrastructure

The following setup is required before the testing strategy described above is fully operational:

**Install devDependencies** in `packages/components/`:
- `@storybook/addon-a11y`
- `@storybook/addon-vitest`
- `@storybook/test`
- `vitest`

**Update `.storybook/main.ts`** — add `@storybook/addon-a11y` and `@storybook/addon-vitest` to the addons array.

**Create `vitest.config.ts`** — configure the Storybook vitest project.

**Add scripts to `package.json`**:
```json
{
  "test": "vitest",
  "test:storybook": "vitest --project=storybook"
}
```
