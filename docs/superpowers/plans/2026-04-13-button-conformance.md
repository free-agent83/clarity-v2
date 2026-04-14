# Button Conformance Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing Button component conform to `packages/components/CONTRIBUTING.md`, add a `loading` prop, promote Button to `stable`, amend CONTRIBUTING.md where its guidance has drifted, and record every decision in `CHANGELOG.md`.

**Architecture:** Mechanical conformance pass on a single atom. Edits are scoped to Button's source/stories/docs, the package barrel, CONTRIBUTING.md, and CHANGELOG.md. No new architecture; no cross-package changes. Button continues to be a plain function component (no `forwardRef`), uses `cva` for variants, and consumes tokens only via Tailwind utility classes. The new `loading` prop prepends an existing `Spinner` atom and forces the button disabled.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind v4, class-variance-authority, `radix-ui` Slot, `@tabler/icons-react`, Storybook 8.6 with `@storybook/addon-a11y` + `@storybook/experimental-addon-test`, vitest 3 with playwright browser provider.

**Spec:** [docs/superpowers/specs/2026-04-13-button-conformance-design.md](../specs/2026-04-13-button-conformance-design.md)

---

## Orientation for the implementer

If you are new to this repo, read these in order before starting:

1. [CLAUDE.md](../../../CLAUDE.md) — repo-wide conventions, token rules, what not to touch.
2. [packages/components/CLAUDE.md](../../../packages/components/CLAUDE.md) — package-level guidance.
3. [packages/components/CONTRIBUTING.md](../../../packages/components/CONTRIBUTING.md) — component conventions. **This file is itself edited by this plan (Task 7).** Read the pre-edit state first so you understand what you're changing.
4. The spec linked above.

Working directory for all commands is the repo root (`/Users/jlfgms/Desktop/Code/clarity-v2`) unless explicitly stated otherwise.

**Commit style:** Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`). Follow the existing `git log` for tone. Do not skip hooks (`--no-verify`). Do not amend published commits.

**Verification commands used throughout this plan:**

- `cd packages/components && npx tsc --noEmit` — type check only, no emit.
- `npx nx build components` — Nx build of the components package (run from repo root).
- `cd packages/components && npm run test:storybook` — runs `vitest run --project=storybook --passWithNoTests`. Executes every story as a render test via `@storybook/experimental-addon-test` in a headless Playwright Chromium. Axe-core accessibility checks run via `@storybook/addon-a11y`.
- `cd packages/components && npm run storybook` — interactive dev server on `:6006` for manual smoke checks. Use only at the end.

**Single-task commits.** Each task ends in a commit. If a task blows up, fix it before moving on — do not batch fixes into the next task.

**Do not add comments to code files** beyond the two JSDoc blocks specified in Task 4. CONTRIBUTING is strict about comment noise; respect it.

---

## File Structure

Files modified by this plan (all paths relative to repo root):

| File | Responsibility | Touched in |
|---|---|---|
| `packages/components/src/components/atoms/button/button.tsx` | Button component source, variants, interface, JSDoc, loading behaviour | Tasks 1, 2, 3, 4 |
| `packages/components/src/components/atoms/button/button.stories.tsx` | Storybook stories, argTypes, controls | Tasks 3, 4 |
| `packages/components/src/components/atoms/button/COMPONENT.md` | Component documentation (frontmatter, props, usage, best practices, writing, quality checklist) | Task 5 |
| `packages/components/CONTRIBUTING.md` | Package-level conventions | Task 6 |
| `packages/components/src/index.ts` | Package barrel export | Task 7 |
| `CHANGELOG.md` | Repo-wide change log | Task 8 |

No files are created. No files are deleted.

---

## Tasks

### Task 1 — Introduce the `ButtonProps` interface

Refactor the inline prop type into a named, exported interface. Behaviour-preserving.

**Files:**
- Modify: `packages/components/src/components/atoms/button/button.tsx`

- [ ] **Step 1.1 — Read the current file**

Run:

```bash
cat packages/components/src/components/atoms/button/button.tsx
```

Confirm the current function signature uses `React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }` inline. If it has already been refactored, stop and investigate — the plan is out of date.

- [ ] **Step 1.2 — Add the interface**

Above the `function Button(...)` declaration, insert:

```tsx
export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
```

- [ ] **Step 1.3 — Update the function signature**

Replace the inline type on the `Button` function parameters with `ButtonProps`:

```tsx
function Button({
  className,
  variant = "default",
  size = "default",
  block = false,
  asChild = false,
  ...props
}: ButtonProps) {
```

Keep every default value identical to the current file. Do not drop `variant = "default"`, `size = "default"`, or `block = false`.

- [ ] **Step 1.4 — Update the export footer**

Replace the existing `export { Button, buttonVariants }` with the three-export pattern required by CONTRIBUTING:

```tsx
export { Button, buttonVariants };
export type { ButtonProps };
```

- [ ] **Step 1.5 — Type check**

Run:

```bash
cd packages/components && npx tsc --noEmit
```

Expected: exits 0, no errors. If there are errors, the refactor is wrong — fix before moving on.

- [ ] **Step 1.6 — Run the Storybook render tests**

Run:

```bash
cd packages/components && npm run test:storybook
```

Expected: all Button stories (and every other story in the package) still pass. The component's rendered output must be identical to before the refactor because only the type annotation changed.

- [ ] **Step 1.7 — Commit**

```bash
git add packages/components/src/components/atoms/button/button.tsx
git commit -m "refactor(button): extract ButtonProps interface and type export"
```

---

### Task 2 — Fix indentation on `destructive`, `success`, `link` variants

Whitespace-only fix on lines 19-23 of the current file. No class changes.

**Files:**
- Modify: `packages/components/src/components/atoms/button/button.tsx`

- [ ] **Step 2.1 — Locate the misindented lines**

The `destructive`, `success`, and `link` entries inside `buttonVariants.variants.variant` are currently indented one level too deep relative to `default`, `outline`, `secondary`, and `ghost`. Open the file and confirm.

- [ ] **Step 2.2 — Re-indent**

Align `destructive`, `success`, and `link` to match the other sibling entries under `variant`. The block should look like:

```tsx
variant: {
  default: "bg-primary text-primary-foreground hover:bg-primary-hover",
  outline:
    "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
  secondary:
    "bg-secondary text-primary-foreground hover:text-secondary-hover hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
  ghost:
    "hover:bg-muted hover:text-primary-hover aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
  destructive:
    "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
  success:
    "bg-success/10 text-success hover:bg-success/20 focus-visible:border-success/40 focus-visible:ring-success/20 dark:bg-success/20 dark:hover:bg-success/30 dark:focus-visible:ring-success/40",
  link: "text-primary underline-offset-4 hover:underline",
},
```

Do not change any class strings. Only whitespace.

- [ ] **Step 2.3 — Type check**

Run:

```bash
cd packages/components && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 2.4 — Run the Storybook render tests**

Run:

```bash
cd packages/components && npm run test:storybook
```

Expected: all stories pass. Visual output must be unchanged.

- [ ] **Step 2.5 — Commit**

```bash
git add packages/components/src/components/atoms/button/button.tsx
git commit -m "style(button): fix indentation on destructive, success, link variants"
```

---

### Task 3 — Fix `argTypes.size` options

Remove the non-existent `icon-lg` from the size options in the stories file.

**Files:**
- Modify: `packages/components/src/components/atoms/button/button.stories.tsx`

- [ ] **Step 3.1 — Edit `argTypes.size`**

In `meta.argTypes.size.options`, replace the current array with:

```tsx
options: [
  "default",
  "sm",
  "lg",
  "icon",
  "icon-xs",
  "icon-sm",
],
```

No trailing `"icon-lg"`. The component has no such size, so the control option was dead.

- [ ] **Step 3.2 — Type check**

Run:

```bash
cd packages/components && npx tsc --noEmit
```

Expected: exits 0.

- [ ] **Step 3.3 — Run the Storybook render tests**

Run:

```bash
cd packages/components && npm run test:storybook
```

Expected: all Button stories still pass.

- [ ] **Step 3.4 — Commit**

```bash
git add packages/components/src/components/atoms/button/button.stories.tsx
git commit -m "fix(button): remove non-existent icon-lg from argTypes.size"
```

---

### Task 4 — Add `loading` prop, JSDoc, and `Loading` story

The substantive behavioural change in this plan. Adds a `loading` prop that prepends the existing `Spinner` atom, forces the button disabled, and sets `aria-busy` / `data-loading`. Also adds the two mandatory JSDoc blocks (left for this task so the loading documentation lands alongside the feature). Also adds a `Loading` story and a `loading` control in argTypes.

The TDD cycle for this task uses TypeScript errors as the failing signal: the story gets `loading: true` before `loading` exists on `ButtonProps`, which fails `tsc --noEmit`. The implementation is then added, tsc passes, and Storybook tests pass.

**Files:**
- Modify: `packages/components/src/components/atoms/button/button.tsx`
- Modify: `packages/components/src/components/atoms/button/button.stories.tsx`

- [ ] **Step 4.1 — Write the failing "test": add the Loading story first**

In `button.stories.tsx`, after the existing `AsChild` story, add:

```tsx
export const Loading: Story = {
  args: { loading: true },
};
```

Do NOT add `loading` to `argTypes` yet. That comes after the prop exists.

- [ ] **Step 4.2 — Run tsc to confirm it fails**

Run:

```bash
cd packages/components && npx tsc --noEmit
```

Expected: FAIL with a TypeScript error along the lines of `Object literal may only specify known properties, and 'loading' does not exist in type ...`. The new `Loading` story references a prop that doesn't exist yet — this is the red step of TDD.

If tsc does not fail, stop and investigate: either the story wasn't saved, the file path is wrong, or the plan is out of date.

- [ ] **Step 4.3 — Add the `Spinner` import in `button.tsx`**

At the top of `button.tsx`, next to the existing imports, add:

```tsx
import { Spinner } from "@/components/atoms/spinner/spinner";
```

The `@/` alias resolves to `packages/components/src/` — same alias already used for `@/lib/utils` in the file. No relative `..` paths.

- [ ] **Step 4.4 — Add `loading` to `ButtonProps`**

Extend the interface:

```tsx
export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}
```

- [ ] **Step 4.5 — Implement the `loading` behaviour in the function body**

Replace the current `Button` function body with:

```tsx
function Button({
  className,
  variant = "default",
  size = "default",
  block = false,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  const isLoading = loading && !asChild;
  const isDisabled = disabled || isLoading;

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={isLoading || undefined}
      aria-busy={isLoading || undefined}
      disabled={isDisabled}
      className={cn(buttonVariants({ variant, size, block, className }))}
      {...props}
    >
      {isLoading ? <Spinner /> : null}
      {children}
    </Comp>
  );
}
```

Notes for the implementer:

- `loading && !asChild` is intentional — when `asChild` is true, Radix Slot expects a single child, and injecting an extra `<Spinner />` breaks that contract. `loading` is silently ignored in that case. This is documented in the JSDoc and COMPONENT.md.
- `data-loading={isLoading || undefined}` and `aria-busy={isLoading || undefined}` render `data-loading="true"` / `aria-busy="true"` when loading, and the attribute is entirely absent otherwise (React omits `undefined` attributes). This avoids `data-loading="false"` cluttering the DOM.
- `disabled={isDisabled}` is a boolean, not a string. `isDisabled` is always a boolean, so this works even when the consumer didn't pass a `disabled` prop (destructured `disabled` is `undefined` → `undefined || false = false`).
- `Spinner` has `role="status"`, `aria-label="Loading"`, and `animate-spin` built in (see `packages/components/src/components/atoms/spinner/spinner.tsx`).

- [ ] **Step 4.6 — Add the two mandatory JSDoc blocks**

CONTRIBUTING requires a JSDoc block above `buttonVariants` naming each axis, and a JSDoc block above the `Button` export describing its purpose.

Above `const buttonVariants = cva(`:

```tsx
/**
 * Button variants.
 *
 * Variant axis = visual style (default, outline, secondary, ghost, destructive, success, link)
 * Size axis    = default, sm, lg, icon, icon-xs, icon-sm
 * Block axis   = boolean, stretches the button to fill its container
 */
const buttonVariants = cva(
  ...
```

Above `function Button(`:

```tsx
/**
 * Primary interactive element for triggering actions.
 *
 * Wraps a native `<button>` by default. Pass `asChild` to render as a
 * different element (e.g. an anchor styled as a button) while keeping
 * the same variant styling.
 *
 * When `loading` is true, a spinner is prepended to the children, the
 * button is effectively disabled, and `aria-busy` is set. `loading` has
 * no effect when `asChild` is true — consumers rendering via Slot must
 * manage loading state on the child element themselves.
 *
 * @see {@link buttonVariants} for the full variant/size matrix.
 */
function Button(
  ...
```

No other JSDoc in the file. Internal locals (`Comp`, `isLoading`, `isDisabled`) stay uncommented.

- [ ] **Step 4.7 — Add `loading` control to `argTypes` in the stories file**

In `button.stories.tsx`, inside `meta.argTypes`, add below the `asChild` control:

```tsx
loading: { control: "boolean" },
```

- [ ] **Step 4.8 — Run tsc to confirm it now passes**

Run:

```bash
cd packages/components && npx tsc --noEmit
```

Expected: exits 0. The story's `loading: true` now matches the prop on `ButtonProps`.

- [ ] **Step 4.9 — Run the Storybook render tests**

Run:

```bash
cd packages/components && npm run test:storybook
```

Expected: all stories pass, including the new `Loading` story. Axe-core should not report new violations — Spinner's `role="status"` + `aria-label="Loading"` combined with Button's `aria-busy` is a valid pattern for an in-progress button. If axe reports a violation, read the message carefully before suppressing — it may indicate a real issue with the composed markup.

- [ ] **Step 4.10 — Commit**

```bash
git add packages/components/src/components/atoms/button/button.tsx \
        packages/components/src/components/atoms/button/button.stories.tsx
git commit -m "feat(button): add loading prop, JSDoc blocks, and Loading story"
```

---

### Task 5 — Fill out `COMPONENT.md`

Replace the stub `COMPONENT.md` with the full draft content. Bump version to `0.1.0` and flip status to `stable`. Populate the quality checklist based on what was actually verified.

**Files:**
- Modify: `packages/components/src/components/atoms/button/COMPONENT.md`

- [ ] **Step 5.1 — Replace the file contents**

Overwrite the file with:

```markdown
---
name: Button
slug: button
version: 0.1.0
status: stable
lastUpdated: 2026-04-13
---

# Button

Primary interactive element for triggering actions.

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"default" \| "outline" \| "secondary" \| "ghost" \| "destructive" \| "success" \| "link"` | `"default"` | Visual style of the button. |
| `size` | `"default" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm"` | `"default"` | Height and padding of the button. Icon sizes are for icon-only buttons. |
| `block` | `boolean` | `false` | Stretch the button to fill its container width. |
| `asChild` | `boolean` | `false` | Render as a child element (via Radix Slot) instead of a native `<button>`. |
| `loading` | `boolean` | `false` | Show a prepended spinner, set `aria-busy`, and force the button disabled. No effect when `asChild` is true. |
| `disabled` | `boolean` | `false` | Native `disabled` attribute. Applies `pointer-events: none` and 50% opacity. |

All standard `<button>` HTML attributes are supported via prop spread.

## Usage guidelines

Use Button for any action that a user triggers synchronously on the current page — submitting a form, opening a dialog, running a local operation.

**Don't use Button** for navigation that changes the URL — use an `<a>` or Next.js `<Link>` instead. If the element needs to *look* like a Button but navigate like a link, use `asChild` to render an anchor with Button styling.

**Don't use Button** to trigger a menu — use `DropdownMenu` and its own trigger, which handles focus and keyboard navigation for you.

## Best practices

**Do:** Use `default` for the primary action on a screen or section — one per section.

**Do:** Use `outline` or `secondary` for non-primary actions next to a primary.

**Do:** Use `destructive` for actions that cannot be undone, and confirm with a dialog first.

**Do:** Use `size: "icon"` (or the `icon-sm` / `icon-xs` variants) for icon-only buttons. Always provide an `aria-label`.

**Do:** Use `loading` for actions that kick off async work — it prepends a spinner, blocks further clicks, and announces the busy state to screen readers.

**Don't:** Use the `link` variant for real navigation — it's for actions that visually resemble links, not for anchors.

**Don't:** Put multiple `default` variants next to each other. If everything is primary, nothing is.

**Don't:** Combine `loading` with `asChild`. The Slot child must own its own loading state — Button silently ignores `loading` in that case.

## Writing

- Use action verbs: "Save", "Delete", "Continue" — not "OK" or "Click here".
- Keep labels short — 1-3 words.
- No ALL CAPS — the component handles text styling.

## Known deviations

- `buttonVariants` uses `rounded-[min(var(--radius-md),10px)]` for `sm`, `icon-xs`, and `icon-sm` sizes. This is an arbitrary Tailwind value, which is a soft gap under CONTRIBUTING's "no arbitrary value syntax" rule. It resolves to CSS variables, not raw literals, so it does not violate the stronger "tokens only" rule. To be tuned when the token system grows a matching radius step.
- The `Spinner` atom hardcodes `size-4`. For the `icon-xs` button (which wants `size-3` icons) the spinner renders slightly too large. Minor visual issue; not a blocker.

## Quality checklist

- [x] Accessibility: passes axe-core via `@storybook/addon-a11y`, keyboard navigable (native `<button>` + `focus-visible` styling), announces `aria-busy` when loading
- [x] Responsive: no breakpoint-specific behaviour by design; `block` handles container-fit
- [x] Tokens only: no hex values, no arbitrary colour/pixel classes; see "Known deviations" for the `rounded-[min(...)]` caveat
```

- [ ] **Step 5.2 — Verify the quality checklist ticks are earned, not aspirational**

Before committing, confirm each ticked item is actually true at this point:

Run:

```bash
cd packages/components && npm run test:storybook
```

Expected: pass with no axe violations on Button stories. If violations exist, untick "Accessibility" and fix them before ticking.

Run:

```bash
cd packages/components && grep -nE '#[0-9a-fA-F]{3,8}|bg-\[|text-\[|p-\[|m-\[|w-\[|h-\[|border-\[' src/components/atoms/button/button.tsx || echo "clean"
```

Expected: prints `clean`, **or** only matches the known `rounded-[min(var(--radius-md),10px)]` values which are flagged in "Known deviations". If it matches anything else (hex values, bracketed pixel/colour classes other than the known rounded deviation), untick "Tokens only" and investigate.

- [ ] **Step 5.3 — Commit**

```bash
git add packages/components/src/components/atoms/button/COMPONENT.md
git commit -m "docs(button): flesh out COMPONENT.md and promote to stable 0.1.0"
```

---

### Task 6 — Edit `CONTRIBUTING.md`

All the CONTRIBUTING amendments in a single commit. The file is large; take it in the order below and verify after each sub-step by re-reading the file.

**Files:**
- Modify: `packages/components/CONTRIBUTING.md`

- [ ] **Step 6.1 — Read the current CONTRIBUTING.md to anchor line numbers**

Open `packages/components/CONTRIBUTING.md` and note the sections you will be editing. The line numbers cited below refer to the state of the file before any edit in this task; they drift as you make changes. Use the section headings as your anchor, not raw line numbers.

- [ ] **Step 6.2 — Remove the "Button is a living reference" sentence (top of file, around line 5)**

Find the sentence:

> The existing Button component (`src/components/atoms/button/`) is a living reference for most patterns described here.

Delete the entire sentence. The preceding sentence ("This is a living document. Conventions will evolve as Phase B progresses and real use reveals what works and what doesn't.") stays. The paragraph should end on that sentence.

- [ ] **Step 6.3 — Remove the Figma parity item from the COMPONENT.md quality checklist example**

Find the example block under `#### 6. Quality checklist`:

```md
- [x] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [x] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [x] Tokens only: no hardcoded visual values
```

Delete the `Figma parity` line. The block becomes:

```md
- [x] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Responsive: works at all breakpoints
- [x] Tokens only: no hardcoded visual values
```

Immediately after the quality checklist example block, add a short paragraph:

```md
**On Figma parity:** components are not currently gated on Figma parity. The process for populating Figma with Clarity V2 components — whether they are authored in Figma first, generated from code, or hand-maintained in parallel — is an open question to be resolved later in the programme. Until that decision is made, the component library is the source of truth, not Figma, and `COMPONENT.md` quality checklists do not include a Figma parity item.
```

- [ ] **Step 6.4 — Genericize the `cva()` pattern example**

Find the code block under `### CVA for variants` that starts with `const buttonVariants = cva(`. Replace `buttonVariants` with `componentVariants` throughout that code block. The structure of the example does not otherwise change. Its prose intro ("When a component has visual variants, define them with `cva()` from `class-variance-authority`") stays.

After the edit, the example should begin:

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

- [ ] **Step 6.5 — Genericize the `ButtonProps` interface example**

Find the code block under `### TypeScript` that starts with `export interface ButtonProps`. Replace the block with:

```tsx
export interface ComponentProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof componentVariants> {
  asChild?: boolean;
}
```

Note the deliberate changes: `ButtonProps` → `ComponentProps`, `ButtonHTMLAttributes<HTMLButtonElement>` → `React.ComponentProps<"div">` (generic placeholder — any real component picks its own HTML element), `buttonVariants` → `componentVariants`.

The prose bullets above the code block (about using `interface`, extending HTML attributes, intersecting `VariantProps`, exporting the Props interface) stay as-is.

- [ ] **Step 6.6 — Genericize the named-exports example**

Find the code blocks under `### Exports`. Two blocks need editing:

First block (inside the component file):

```tsx
// component.tsx
export { Component, componentVariants };
export type { ComponentProps };
```

Second block (inside `src/index.ts`):

```tsx
// src/index.ts
export { Component, componentVariants } from "./components/atoms/component/component";
export type { ComponentProps } from "./components/atoms/component/component";
```

The surrounding prose stays.

- [ ] **Step 6.7 — Genericize the cva JSDoc example**

Find the code block under `#### cva()` (inside `### Comments`) that begins with `/**` and describes "Button variants mapped to Nivoda DS Foundation". Replace it with:

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

- [ ] **Step 6.8 — Genericize the Named exports JSDoc example**

Find the code block under `#### Named exports`. Replace:

```tsx
/**
 * Primary interactive element for triggering actions.
 *
 * Wraps a native `<button>` by default. Pass `asChild` to render as a
 * different element (e.g. an anchor styled as a button) while keeping
 * the same variant styling.
 *
 * @see {@link buttonVariants} for the full variant/intent/size matrix.
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...);

export { Button, buttonVariants };
export type { ButtonProps };
```

with:

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

Two deliberate changes beyond the rename: drop `React.forwardRef<...>` (no longer the convention — see §6.9) and drop the first-line "Primary interactive element" copy (too specific to Button).

- [ ] **Step 6.9 — Rewrite the "Other patterns" section**

Find the section starting `### Other patterns`. It currently reads:

> The following patterns are encouraged where appropriate but not mandated for every component:
>
> - **`React.forwardRef`** — use when consumers need ref access (most components).
> - **`displayName`** — set it when using `forwardRef` for better DevTools and Storybook labels.
> - **Radix `Slot` / `asChild`** — use when the component wraps a single element and consumers may need to swap the underlying element (e.g., rendering a Button as a link).
>
> See the Button implementation for a reference that uses all of these.

Replace the entire section with:

```md
### Other patterns

- **Radix `Slot` / `asChild`** — use when the component wraps a single element and consumers may need to swap the underlying element (e.g. rendering a Button as a link).

We currently follow shadcn's React-19 defaults — plain function components, no `React.forwardRef`, no `displayName`. This may be revisited if and when a consumer needs ref access that plain function components can't provide.
```

- [ ] **Step 6.10 — Rewrite the "Minimum story set" section**

Find the section `### Minimum story set`. It currently reads:

> Every component must have stories covering:
> - One story per variant value
> - One story per size (if the component has a size axis)
> - Key states: disabled, loading, error (where applicable)
> - Compound variants where intent or state changes the visual appearance

Replace it with:

```md
### Minimum story set

Write a story only when a usage pattern isn't discoverable from the `argTypes` controls. Variant values, sizes, and boolean states (disabled, loading) are controllable via the Storybook controls panel — no dedicated story is needed for those.

Stories exist to surface patterns that *aren't* expressible as prop permutations: icon children, slot-based composition (`asChild`), wrapper-dependent behaviour (full-width inside a constrained container), compound behaviours, and anything else a reader wouldn't discover by clicking through the argTypes.

Every component still needs at least one story — the default render — so the argTypes playground has an anchor.
```

- [ ] **Step 6.11 — Update the Definition of Done**

Find the `## Definition of done` list. Change the line:

> - [ ] Stories cover all variants, sizes, states, and compound variants

to:

> - [ ] Stories cover non-obvious usage patterns (see Minimum story set)

No other items in the list change.

- [ ] **Step 6.12 — Delete the "Setup: testing infrastructure" section**

Find `## Setup: testing infrastructure` near the bottom of the file. Delete the entire section — heading, intro paragraph, install list, config bullets, and script JSON. The preceding `## shadcn CLI (open question)` section ends the document.

- [ ] **Step 6.13 — Final sanity check**

Read the whole file end-to-end. Confirm:

- No occurrences of the literal string `Button` remain in prose or code examples (it's OK for the `### Other patterns` bullet to say "rendering a Button as a link" — that's a worked example, not a reference claim — and it's OK for the `Actions/Button` sidebar taxonomy entry to remain, that's a category).
- No occurrences of `buttonVariants` or `ButtonProps` remain in code examples.
- No `forwardRef` or `displayName` mentions remain anywhere except the explicit "we currently follow shadcn's React-19 defaults" paragraph added in §6.9.
- The "Setup: testing infrastructure" section is gone.
- The file still parses as valid Markdown (headings, code fences matched).

Run:

```bash
grep -nE '\bButton\b|\bbuttonVariants\b|\bButtonProps\b|forwardRef|displayName' packages/components/CONTRIBUTING.md
```

Expected output: zero or very few matches. The only acceptable matches are:

- `Actions/Button` (sidebar taxonomy entry under `### Sidebar taxonomy`)
- `rendering a Button as a link` (worked example of `asChild` in §6.9)
- The single `forwardRef` / `displayName` mention in the "we currently follow shadcn's React-19 defaults" paragraph

Anything else means you missed a rename. Go back and fix.

- [ ] **Step 6.14 — Commit**

```bash
git add packages/components/CONTRIBUTING.md
git commit -m "docs(components): genericize examples, relax story rule, drop Figma and forwardRef"
```

---

### Task 7 — Uncomment the barrel export

Promote Button's exports in the package barrel.

**Files:**
- Modify: `packages/components/src/index.ts`

- [ ] **Step 7.1 — Find the commented Button export**

Open `packages/components/src/index.ts`. Find the line (currently line 24):

```ts
// export { Button, buttonVariants } from "./components/atoms/button/button";
```

- [ ] **Step 7.2 — Replace it with two live exports**

Replace the single commented line with:

```ts
export { Button, buttonVariants } from "./components/atoms/button/button";
export type { ButtonProps } from "./components/atoms/button/button";
```

Both lines must be uncommented. Do not touch any of the other commented export lines — only Button's is being promoted in this pass.

- [ ] **Step 7.3 — Type check**

Run:

```bash
cd packages/components && npx tsc --noEmit
```

Expected: exits 0. If it fails with "has no exported member `ButtonProps`", Task 1 was not committed — go back.

- [ ] **Step 7.4 — Build the package**

Run:

```bash
npx nx build components
```

Expected: succeeds. The generated `packages/components/dist/index.d.ts` should contain `Button`, `buttonVariants`, and `ButtonProps`. Optionally spot-check:

```bash
grep -nE 'Button|buttonVariants|ButtonProps' packages/components/dist/index.d.ts
```

- [ ] **Step 7.5 — Run the Storybook render tests one more time**

Run:

```bash
cd packages/components && npm run test:storybook
```

Expected: pass. This is a safety net — changing a barrel export can't break rendering, but run it anyway.

- [ ] **Step 7.6 — Commit**

```bash
git add packages/components/src/index.ts
git commit -m "feat(components): export Button from package barrel"
```

---

### Task 8 — Add the CHANGELOG entry

Record the pass in `CHANGELOG.md`, at the top of the file (most recent first, matching the existing convention). The entry must spell out every decision and its reasoning, so the log stands alone.

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 8.1 — Confirm the existing CHANGELOG format**

Read `CHANGELOG.md`. The existing entries follow a pattern: `## YYYY-MM-DD — <title>`, followed by prose + bold sub-headings (`**Why:**`, `**Delivered:**`, etc.), separated by `---`.

- [ ] **Step 8.2 — Insert the new entry at the top**

Directly after the top-of-file header (`# Changelog`, the intro paragraph, and the first `---`), insert the following entry. The entry belongs **above** the existing `## 2026-04-10 — Architectural correction: tokens package is surface-agnostic` entry, and must be followed by a `---` separator before the next entry.

```md
## 2026-04-13 — Button conformance pass and CONTRIBUTING realignment

Promoted Button to `stable` after a conformance pass against `packages/components/CONTRIBUTING.md`, and amended CONTRIBUTING itself where its guidance had drifted from current decisions.

**Button changes:**
- Introduced a named `ButtonProps` interface, exported as a type. Previously the prop type was inlined on the function signature.
- Added a `loading` prop that prepends a `Spinner`, forces the button disabled, and sets `aria-busy`. Uses the existing `atoms/spinner` atom.
- Added JSDoc blocks on `buttonVariants` (naming each variant axis) and on the `Button` export (describing purpose, the `asChild` escape hatch, and a link to the variants object). Matches CONTRIBUTING's "two mandatory JSDoc blocks" rule.
- Fixed indentation on the destructive/success/link variant entries in `buttonVariants`.
- Fixed the Storybook `argTypes.size` options, removing the non-existent `icon-lg` option. Added a `Loading` story and a `loading` control.
- Filled out `COMPONENT.md` (frontmatter, props, usage, best practices, writing, quality checklist). Version `0.0.0` → `0.1.0`, status `unstable` → `stable`.
- Uncommented the Button line in `packages/components/src/index.ts` and added the `ButtonProps` type export alongside it.

**CONTRIBUTING.md changes and reasoning:**

- **Dropped the `forwardRef` / `displayName` convention.** Reason: we are following shadcn's React-19 defaults (plain function components, no ref forwarding). The ecosystem is transitioning to treating `ref` as a regular prop, and introducing `forwardRef` today would be premature overhead. This may be revisited if a consumer needs ref access that plain function components can't provide.
- **Relaxed the minimum story set.** Reason: developers can exercise variants, sizes, and boolean states directly through Storybook's `argTypes` controls panel — dedicated stories for each permutation are redundant. The new rule: write a story only when a usage pattern isn't discoverable from the controls (icon children, `asChild` composition, wrapper-dependent behaviour, etc.). Every component still has at least one default story as an anchor for the controls playground.
- **Removed Button-as-reference language and genericized all Button-shaped code examples.** Reason: the previous CONTRIBUTING pointed at Button as "a living reference", but Button didn't actually conform to the conventions it was supposed to exemplify. Examples are now genericized (`Component` / `componentVariants` / `ComponentProps`) so CONTRIBUTING teaches patterns without binding them to a specific real component. A real reference can be re-anchored later if useful.
- **Removed Figma parity from the `COMPONENT.md` quality checklist.** Reason: how Clarity V2 components should be represented in Figma (authored there first, generated from code, hand-maintained in parallel, or something else) is an unresolved programme-level question. Until that decision is made, the component library is the source of truth, not Figma, and gating components on Figma parity would hold them hostage to an undecided process. Figma parity returns as a quality gate only after the Figma strategy lands.
- **Deleted the "Setup: testing infrastructure" section.** Reason: the section claimed `@storybook/addon-a11y`, `@storybook/experimental-addon-test`, `@storybook/test`, and `vitest` still needed to be installed. Verified against `packages/components/package.json`: they are all already installed, and `test:storybook` is already in the package scripts. The section was stale.

**Scope explicitly excluded from this pass** (documented here so future work doesn't assume they were silently considered and rejected):

- **Variant / intent / size taxonomy redesign.** Current taxonomy is single-axis shadcn-flat (`default | outline | secondary | ghost | destructive | success | link`) with a separate `size` axis. CONTRIBUTING's illustrative example shows a two-axis `variant × intent` pattern, but that was always illustrative, not binding. A real taxonomy decision needs design-lead input and a breaking-change plan for any downstream consumers — neither of which belong in a conformance pass.
- **Arbitrary `rounded-[min(var(--radius-md),10px)]` values.** Left in the code. They use CSS variables (not raw literals) so they don't violate the "tokens only" rule strictly, but they're a soft gap under the "no arbitrary value syntax" guidance. Flagged in Button's `COMPONENT.md` under "Known deviations".
- **Slot import source.** `import { Slot } from "radix-ui"` remains. Changing it to `@radix-ui/react-slot` is a micro-cleanup, not a conformance issue.

**Verification:** `tsc --noEmit`, `nx build components`, `vitest run --project=storybook`, and Storybook dev server smoke test all pass for Button. Grep of `button.tsx` confirms no hex values, no arbitrary pixel/colour syntax, and only the known `rounded-[min(...)]` deviation.

See [`docs/superpowers/specs/2026-04-13-button-conformance-design.md`](docs/superpowers/specs/2026-04-13-button-conformance-design.md) for the full spec and [`docs/superpowers/plans/2026-04-13-button-conformance.md`](docs/superpowers/plans/2026-04-13-button-conformance.md) for the implementation plan.

---
```

- [ ] **Step 8.3 — Commit**

```bash
git add CHANGELOG.md
git commit -m "docs(changelog): record Button conformance pass and CONTRIBUTING realignment"
```

---

### Task 9 — Final verification pass

Run every verification command end-to-end. No new edits should be needed; this task is the "evidence before assertion" gate.

**Files:** none touched.

- [ ] **Step 9.1 — Type check the package**

Run:

```bash
cd packages/components && npx tsc --noEmit
```

Expected: exits 0, no output.

- [ ] **Step 9.2 — Build the package with Nx**

Run:

```bash
npx nx build components
```

Expected: succeeds. If Nx complains about dependency graph changes, it may want `--skip-nx-cache`. Try that if the first run fails with a cache error.

- [ ] **Step 9.3 — Run the Storybook test project**

Run:

```bash
cd packages/components && npm run test:storybook
```

Expected: all stories pass. Specifically, the Button stories (`Default`, `WithIcon`, `IconButton`, `Block`, `AsChild`, `Loading`) all render without errors and report no axe violations.

- [ ] **Step 9.4 — Token grep sanity check**

Run:

```bash
cd packages/components && grep -nE '#[0-9a-fA-F]{3,8}|bg-\[|text-\[|p-\[|m-\[|w-\[|h-\[|border-\[' src/components/atoms/button/button.tsx || echo "clean"
```

Expected: prints `clean`, **or** only the known `rounded-[min(var(--radius-md),10px)]` / similar entries that match `[` but are radius-related. Anything else is a regression — fix before calling the task done.

- [ ] **Step 9.5 — Manual Storybook smoke test**

Run:

```bash
cd packages/components && npm run storybook
```

Expected: Storybook starts on `http://localhost:6006`. Open the URL and navigate to `Actions/Button`. Verify manually:

- All six stories appear in the sidebar under `Actions/Button`.
- Each story renders.
- The argTypes Controls panel shows `variant`, `size`, `block`, `asChild`, `loading`, `disabled`, and the dropdowns / toggles work.
- `Loading` story shows a spinning indicator before the button label, the button is visually disabled, and inspecting the DOM shows `aria-busy="true"` and `data-loading="true"`.
- Dark mode (if there is a toolbar toggle) still renders Button correctly.

Stop Storybook with Ctrl+C when done.

- [ ] **Step 9.6 — Confirm the commit history is clean**

Run:

```bash
git log --oneline -15
```

Expected: the last eight commits correspond one-to-one to Tasks 1-8, in order. No WIP commits, no fixup commits. If there are WIPs, either squash them into the appropriate task commit before calling the plan complete, or leave them and note in the PR description.

- [ ] **Step 9.7 — Plan complete**

If every step above is green, the conformance pass is done. Open a PR. The PR description should summarize the CHANGELOG entry you wrote in Task 8 — do not duplicate it, just point at it.

---

## Self-review notes

This plan has been checked against the spec for coverage:

- §1 (button.tsx) → Tasks 1, 2, 4
- §2 (button.stories.tsx) → Tasks 3, 4
- §3 (CONTRIBUTING.md) → Task 6 (all sub-steps map to §3.1–§3.7)
- §4 (components/CLAUDE.md) → no edits needed, explicitly noted in Task 6 orientation
- §5 (COMPONENT.md) → Task 5
- §6 (CHANGELOG.md) → Task 8
- §7 (src/index.ts) → Task 7

No placeholders. No "TBD" / "TODO" / "similar to Task N". Every step shows the code or command the engineer needs. Types are consistent: `ButtonProps` is defined in Task 1 and referenced unchanged in Tasks 4 and 7; `loading` lands in Task 4 and is referenced in Tasks 5 and 8; `componentVariants` / `ComponentProps` are the generic names used consistently across Task 6's sub-steps.
