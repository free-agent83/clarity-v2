# Contributing to the Clarity V2 Web Components Library

Conventions for building, testing, documenting, and shipping web components in Clarity V2. This document is the single reference for anyone — human or AI agent — contributing to the component library.

This is a living document. Conventions will evolve as Phase B progresses and real use reveals what works and what doesn't.

---

## COMPONENT.md: the entry point for every component

`COMPONENT.md` is the primary source of truth for a component's **documentation** and the entry point for anyone — human or AI agent — who wants to understand the component. Treat it as a single-page entry on an internal design system documentation site: the one document a reader can open and come away with a complete picture of what the component is, when to use it, how it behaves, and what decisions shaped it.

Its job is to encapsulate and summarise every decision that shapes the component. The TSX file and the stories carry the code and the executable examples — variants, props, states, interactions, compound behaviours. `COMPONENT.md` rolls all of that up into narrative documentation alongside the usage guidelines and best practices that don't belong in either of the other two. When the component's API, variant matrix, or recommended usage changes, `COMPONENT.md` must change in the same commit — it is not an afterthought document, and a stale `COMPONENT.md` is a broken one.

This is the most important file in the component folder for anyone who isn't actively editing the code. Invest in it accordingly.

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
| `variant` | `"contained" \| "outlined" \| ...` | `"contained"` | Visual style |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Component size |
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
- [ ] Responsive: works at all breakpoints
- [x] Tokens only: no hardcoded visual values
```

**On Figma parity:** components are not currently gated on Figma parity. The process for populating Figma with Clarity V2 components — whether they are authored in Figma first, generated from code, or hand-maintained in parallel — is an open question to be resolved later in the programme. Until that decision is made, the component library is the source of truth, not Figma, and `COMPONENT.md` quality checklists do not include a Figma parity item.

---

## Folder structure

Components are organised using atomic design taxonomy:

```
src/components/
├── atoms/        Single-purpose primitives (Button, Input, Badge, Label, Separator)
├── molecules/    Composed from atoms (Card, Dialog, Tooltip, Tabs)
└── organisms/    Complex compositions (DataTable, AppShell)
```

### Classification guidance

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
const componentVariants = cva(
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
export interface ComponentProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof componentVariants> {
  asChild?: boolean;
}
```

### Exports

Every component uses named exports — no default exports. Each component file exports three things: the component itself, the variants object (when using CVA), and the Props interface as a type-only export.

```tsx
// component.tsx
export { Component, componentVariants };
export type { ComponentProps };
```

Every stable component must then be re-exported from `src/index.ts` using the same three-export pattern. The package barrel is the single import point for consumers — they should never reach into a component folder directly.

```tsx
// src/index.ts
export { Component, componentVariants } from "./components/atoms/component/component";
export type { ComponentProps } from "./components/atoms/component/component";
```

### Comments

Component files default to zero comments. Two kinds of documentation are mandatory; everything else stays uncommented to keep the signal-to-noise ratio high for both humans and AI agents reading the source.

#### cva()

When a component uses `cva`, prefix the definition with a JSDoc block naming each variant axis and its purpose. This is where an agent should be able to learn what the component supports without scanning the full config object.

```tsx
/**
 * Component variants.
 *
 * Variant axis = visual style (contained, outlined, text, link)
 * Intent axis  = semantic colour (primary, success, error)
 * Size axis    = sm, md, lg
 *
 * (Illustrative only — not a binding taxonomy for any real component.)
 */
const componentVariants = cva( ... );
```

One line per axis, ordered as they appear in the `variants` object. Enum the options inline rather than listing them underneath — keep the block scannable.

#### Named exports

Every named export gets a JSDoc block: the component itself, the variants object, and any exported types. The block should describe what it is, when to use it, and any non-obvious constraints on its use. Standard JSDoc tags (`@param`, `@returns`, `@example`, `@see`, `@deprecated`) are encouraged wherever they add signal.

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

export { Component, componentVariants };
export type { ComponentProps };
```

Internal helpers, locals, and non-exported values stay uncommented. Documentation noise belongs only on the public API surface and the variant axes above.

### Other patterns

- **Radix `Slot` / `asChild`** — use when the component wraps a single element and consumers may need to swap the underlying element (e.g. rendering a Button as a link).

We currently follow shadcn's React-19 defaults — plain function components, no `React.forwardRef`, no `displayName`. This may be revisited if and when a consumer needs ref access that plain function components can't provide.

---

## Token consumption rules

#### Rule 1 — Components consume tokens only through the CSS theme

Components never import from `packages/tokens/` and never reference raw token CSS variables. They see tokens only through the Tailwind theme, as utility classes.

```tsx
// Do
"bg-primary text-foreground border-border"

// Don't
"bg-[var(--color-semantic-primary-default)]"
```

Corollaries:

- No hardcoded colors, spacing, border-radius, or shadows anywhere in component code.
- No Tailwind arbitrary value syntax (`bg-[#hex]`, `p-[14px]`) for values that should be tokens.
- If the design calls for a value not in the token set, flag it — NEVER invent a token.

#### Rule 2 — The token flow is always top-down

```
packages/tokens/  →  globals.css (shadcn theme)  →  components
```

Each layer reads only from the one above it. The components layer never feeds into the shadcn theme; the shadcn theme never feeds into `packages/tokens/`. If you catch yourself wanting to flow information upward — a component-specific value leaking into the theme, a theme-specific assumption leaking into tokens — stop and rethink the design.

#### Rule 3 — Always ask before changing the shadcn theme

Adding a new token assignment to `globals.css`, changing what an existing semantic variable resolves to, or otherwise touching the shadcn theme layer all require approval from the design lead before the change lands. The theme is the single source of truth for what the design system looks like — silent edits ripple out to every component downstream. If a component needs a token that isn't mapped yet, flag it and wait for a ruling.

---

## Storybook stories

### Format and structure

Stories use CSF3 (Component Story Format 3):

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Component } from "./component";

const meta: Meta<typeof Component> = {
  title: "Category/Component",
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
- **Sidebar title** uses the category taxonomy below — e.g. `"Actions/Button"`, `"Forms/Input"`. This is independent of folder structure: files still live under `atoms/`, `molecules/`, `organisms/` on disk.

### Sidebar taxonomy

Sidebar titles follow a category-based structure. Categories group components by task and domain — more discoverable when an agent or designer is browsing by intent ("I need error feedback" → Feedback section, "I need to show a dataset" → Data section) than atomic labels, which force irrelevant "is Select an atom or molecule?" debates.

```
Foundations/    Colors, spacing, typography, radius
Forms/          Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider, Label, Toggle Group
Actions/        Button, Icon Button, Dropdown Menu
Overlays/       Dialog, Sheet, Popover, Tooltip
Feedback/       Alert, Toast, Progress, Skeleton
Display/        Card, Badge, Chip, Avatar, Separator, Carousel
Data/           Table, Data Grid
Navigation/     Tabs, Accordion, Breadcrumbs
Templates/      [Phase C — PLP, PDP, Dashboard, Auth, Checkout, Settings]
Docs/           [Phase C — Getting started, Prompt patterns, Migration from MUI]
```

`Data/` is a top-level category separate from `Display/`. Table and Data Grid are heavy, stateful, dataset-oriented components — they don't sit naturally alongside decorative primitives like Badge or Avatar. Matches MUI's Data Display vs Data Grid split and leaves the section room to grow (charts, pivot tables, metrics in future phases).

**Folder structure stays atomic.** `src/components/atoms/button/button.tsx` is unchanged. The story `title:` field only sets the sidebar location — two independent concerns.

### Story naming

PascalCase, variant-first:
- Variant values: `Contained`, `Outlined`, `Secondary`
- Compound variants: `ContainedSuccess`, `OutlinedError`
- Sizes: `Small`, `Large`
- States: `Disabled`, `Loading`

### Minimum story set

Write a story only when a usage pattern isn't discoverable from the `argTypes` controls. Variant values, sizes, and boolean states (disabled, loading) are controllable via the Storybook controls panel — no dedicated story is needed for those.

Stories exist to surface patterns that *aren't* expressible as prop permutations: icon children, slot-based composition (`asChild`), wrapper-dependent behaviour (full-width inside a constrained container), compound behaviours, and anything else a reader wouldn't discover by clicking through the argTypes.

Every component still needs at least one story — the default render — so the argTypes playground has an anchor.

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

## Definition of done

A component is considered done when all of the following are true:

- [ ] Implementation follows conventions (CVA, cn(), TypeScript, named exports)
- [ ] All visual values come from tokens via Tailwind — no hardcoded values
- [ ] Stories cover non-obvious usage patterns (see Minimum story set)
- [ ] `tags: ["autodocs"]` present on story meta
- [ ] Interactive components have play functions testing core interactions
- [ ] Accessibility addon shows no violations
- [ ] `COMPONENT.md` has frontmatter (name, slug, version, status, lastUpdated)
- [ ] `COMPONENT.md` content sections are complete (props, usage, best practices, quality checklist)
- [ ] Quality checklist in COMPONENT.md is filled in and passing
- [ ] Component and variants exported from `src/index.ts`
- [ ] Storybook renders all stories without errors
- [ ] TypeScript compiles with no errors (`tsc --noEmit`)