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

## COMPONENTS.md: the library-level map

[`COMPONENTS.md`](./COMPONENTS.md) is the package's high-level entry point — a thin index of every component plus a summary of the Tailwind v4 `@theme` semantic utilities, intended primarily for AI-agent consumption when *using* the library. `COMPONENT.md` is per-component and authoritative; `COMPONENTS.md` is cross-cutting and introductory. It exists so a consumer can pick the right component and the right token without opening every `COMPONENT.md` in the tree.

Because it is a summary, it drifts faster than any single `COMPONENT.md`. The rules below exist to keep it honest.

### Maintenance triggers

Update `COMPONENTS.md` in the **same PR** as any of the following:

- **A new component lands.** Add its entry under the appropriate taxonomy section with atomic classification, status, and "for / not for" one-liners distilled from its `COMPONENT.md`.
- **A component is promoted from `unstable` to `stable` (or demoted).** Update its status tag.
- **A component is deprecated or removed.** Mark it `deprecated` or delete the entry, matching the action taken in `COMPONENT.md` and `src/index.ts`.
- **A component's "what it's for" scope changes meaningfully.** If a component's usage section is rewritten such that the one-liner no longer reflects its purpose, update both bullets.
- **The `@theme` block in `globals.css` changes meaningfully.** New semantic token families, renamed utilities, removed tokens, or changes to the radius / typography scales all require the corresponding table in §2 of `COMPONENTS.md` to be updated. Purely additive hex value tweaks inside `:root` / `.dark` do not — those are theme-internal and the utility surface is unchanged.

A stale `COMPONENTS.md` is a broken one — treat it with the same rigour as a stale `COMPONENT.md`. If you're unsure whether a change qualifies, assume it does and update the file.

### What NOT to put in COMPONENTS.md

`COMPONENTS.md` is an index, not a spec. Keep it thin.

- No prop tables, no code examples, no variant matrices — those live in `COMPONENT.md`.
- No exhaustive token value listings — those live in `globals.css`.
- No build / test / publishing rules — those live in this file.
- No rationale or decision records — those live in `ADRS.md` or `COMPONENT.md`.

When a change would require more than a one-line tweak to an existing entry, the real change belongs in `COMPONENT.md` or `globals.css`; the `COMPONENTS.md` entry should follow, not lead.

---

## Folder structure

Components are organised using atomic design taxonomy:

```
src/components/
├── atoms/        Single-purpose primitives (Button, Input, Badge, Label, Separator)
├── molecules/    Composed from atoms (Card, Dialog, Tooltip, Tabs)
├── organisms/    Complex compositions (DataTable, AppShell)
└── templates/    Page-level systems with internal sub-components (PLP, PDP, Dashboard)
```

### Classification guidance

- **Atoms** render a single interactive or display element. They don't compose other components from this library.
- **Molecules** combine two or more atoms into a reusable unit with its own behaviour.
- **Organisms** are complex, page-level compositions. Rare in a design system — most components are atoms or molecules.
- **Templates** are full page-level systems that orchestrate organisms, molecules, and atoms into a complete user experience. A template owns its own internal sub-components (e.g., a PLP template owns its grid item, filter drawer, and toolbar) which are scoped to the template and not exported individually. Templates are composed from design system primitives — they don't build from scratch. If an internal sub-component proves useful to a second template, that's a signal to extract it into the library as a standalone atom, molecule, or organism.

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
Navigation/     Tabs, Accordion, Breadcrumb
Templates/      PLP, PDP, Dashboard, Auth, Checkout, Settings
Docs/           [Phase C — Getting started, Prompt patterns, Migration from MUI]
```

`Data/` is a top-level category separate from `Display/`. Table and Data Grid are heavy, stateful, dataset-oriented components — they don't sit naturally alongside decorative primitives like Badge or Avatar. Matches MUI's Data Display vs Data Grid split and leaves the section room to grow (charts, pivot tables, metrics in future phases).

**Folder structure stays atomic (plus templates).** `src/components/atoms/button/button.tsx` is unchanged; templates live under `src/components/templates/`. The story `title:` field only sets the sidebar location — two independent concerns.

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

### Compose stories from system components only

When a story renders a component **alongside** other elements (a Label next to an input, a Button inside a Popover, a form inside a Sheet), every one of those elements must come from the Clarity V2 component library. Never inline a bespoke `<input>`, `<button>`, `<select>`, `<textarea>`, or any other element that has a system equivalent. Never apply ad-hoc Tailwind classes to fake the look of a system component.

The library is the design. A story that bypasses it teaches readers — human and AI agent — that bypassing is acceptable, and the visual reference drifts the moment the system component changes. Every story is a small worked example of how the design system composes; that example is only honest if it uses real components throughout.

```tsx
// Do
<div className="flex flex-col gap-2">
  <Label htmlFor="email">Email address</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>

// Don't
<div className="flex flex-col gap-2">
  <Label htmlFor="email">Email address</Label>
  <input
    id="email"
    type="email"
    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
  />
</div>
```

The only acceptable raw HTML in a story is structural layout (`<div>`, `<span>`, headings) where no system equivalent exists yet. If the missing equivalent ever lands as a component, replace the inline usage in the same commit.

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
- [ ] Tokens only: no raw literals inside Tailwind arbitrary value syntax, no hardcoded colors, spacing, radius, or shadows. `var(--token)` inside arbitrary syntax is allowed.
- [ ] Stories cover non-obvious usage patterns (see Minimum story set)
- [ ] `tags: ["autodocs"]` present on story meta
- [ ] Interactive components have play functions testing core interactions
- [ ] Accessibility addon shows no violations
- [ ] `COMPONENT.md` has frontmatter (name, slug, version, status, lastUpdated)
- [ ] `COMPONENT.md` content sections are complete (props, usage, best practices, quality checklist)
- [ ] Quality checklist in COMPONENT.md is filled in and passing
- [ ] `COMPONENTS.md` reflects the change — entry added, status updated, one-liners re-distilled, or theme tables refreshed per the triggers in §COMPONENTS.md above
- [ ] Component and variants exported from `src/index.ts`
- [ ] Storybook renders all stories without errors
- [ ] TypeScript compiles with no errors (`tsc --noEmit`)

**Publishing with flagged violations.** A component may be promoted to `stable` and barrel-exported even if it has flagged Rule 1 violations. The "Tokens only" DoD item remains unticked in that component's `COMPONENT.md` with an inline note pointing at the flag. Publishing is allowed; completion is not. This is an explicit exception for Phase B, not a permanent carve-out — each flag is a ticket for a later per-component review.

---

## Writing an ADR

Package-scoped architectural decisions live in [`ADRS.md`](./ADRS.md) at the package root. Use a package-level ADR when a decision meaningfully shapes the library but doesn't affect the wider project — for example, dropping a planned API surface on a component, adopting a cross-cutting pattern (how variants are expressed, how templates compose), or rejecting a feature consumers might reasonably expect.

Project-wide decisions (token pipeline, build tooling, documentation stack, visual regression policy, etc.) go in the project-level [`docs/architecture/architecture.md`](../../docs/architecture/architecture.md) § "Architectural Decisions" instead. If you're unsure which layer a decision belongs to, ask: does the decision only make sense if you're working *inside* this package? If yes, it's package-scoped.

### When to write one

Write an ADR when:

- A feature described in a spec is deliberately *not* being built, and the reason would be non-obvious to a future reader who finds the spec but not the code.
- A consumer-visible pattern is being adopted or rejected that will set precedent for similar future decisions.
- A workaround is being accepted that looks strange without the history (e.g., "why isn't this tokenised?").
- A reversible decision is being made whose cost-to-revisit is high (e.g., a prop name or data shape that would be breaking to change).

Don't write an ADR for routine component work. Component-level rationale belongs in the `COMPONENT.md` under "Usage guidelines" and "Best practices", not in ADRS.md.

### Format

Follow the project-level ADR format:

```md
## ADR-NNN: Title (Month Year)

**Context:** What's the situation, what was planned, what triggered the decision.

**Decision:** One or two sentences stating what's being chosen.

**Rationale:**

1. **Reason heading.** Explanation.
2. **Reason heading.** Explanation.
(...)

**Trade-offs accepted:**

- Bullet 1
- Bullet 2

**Reversibility:** High / Medium / Low, with a sentence explaining what reversing would require.

**When to reconsider:**

- Specific condition 1.
- Specific condition 2.

**Related:** (optional)
- Links to specs, parent ADRs, related decisions.
```

### Numbering

Append the next sequential number. Never renumber existing entries — ADR numbers are stable references. New entries go at the **bottom** of the file so the file reads chronologically.

### Cross-references

When an ADR supersedes or modifies an earlier decision, the earlier ADR should gain a short status note at its top pointing at the new one (keep the original content intact — don't rewrite history). When a spec's planned work is being deferred or overturned, add a status note at the top of the affected spec section pointing at the ADR.

---

## Submitting a pull request

### Target branch

All PRs must target the `dev` branch, never `main`. PRs opened against `main` will be rejected.

### CHANGELOG update

Every PR must update `CHANGELOG.md` in this package before submission. The CHANGELOG entry is written as part of the PR, not after.

### CHANGELOG format

The CHANGELOG format is flat-by-PR. Each entry is one PR:

```markdown
### PR title ([#NNN](https://github.com/free-agent83/clarity-v2/pull/NNN))
Optional 1-sentence summary if the title alone isn't enough.

- Bullet describing a logical change group (`commit1`, `commit2`)
- Another bullet (`commit3`)
```

Rules:

- Each entry heading is the PR title, linked to the PR.
- Below the heading, an optional 1-sentence summary only if the title isn't self-explanatory.
- Bullet list where each bullet describes a logical change — group commits when they serve the same purpose.
- Each bullet references at least one commit hash (short hash, in backticks).
- Do NOT do one bullet per commit — group related commits into one bullet.
- Max 2-3 sentences per bullet; no paragraphs, no nested bullets.
- Keep it scannable — these are indexes for human reviewers.

### PR body format

```markdown
## Summary
- [1-3 bullets describing what changed and why — mirrors the CHANGELOG entry]

## References
Closes #XX, #YY
```

Rules:

- The Summary bullets should mirror the CHANGELOG entry for this PR.
- Keep it short — reviewers scan these, they don't read essays.
- Always include References if the PR addresses any GitHub issues.