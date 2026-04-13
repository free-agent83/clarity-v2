# Button Conformance Pass — Design Spec

**Date:** 2026-04-13
**Scope:** Make the existing Button component conform to `packages/components/CONTRIBUTING.md`, and edit CONTRIBUTING.md itself to reflect current decisions (drop `forwardRef`, relax the minimum story set, remove Button-as-reference language).
**Owner:** Chris (design lead) — ratifies
**Status:** Draft

---

## Background

Button is the first component shipped into `packages/components/src/components/atoms/button/`. CONTRIBUTING.md currently claims Button is "a living reference for most patterns described here", but in practice the implementation diverges from CONTRIBUTING in several places and `COMPONENT.md` is a stub. This spec closes the conformance gap for Button and amends CONTRIBUTING.md where the current guidance no longer matches what we want.

Scope is deliberately narrow — "Scope A" in the brainstorming interview:
- **In scope:** mechanical conformance (interface, JSDoc, `COMPONENT.md`, story fix, barrel export), the CONTRIBUTING edits that unblock it, and a `CHANGELOG.md` entry recording the work and every decision behind it.
- **Out of scope:** redesigning the variant / intent / size taxonomy, replacing arbitrary `rounded-[min(...)]` values, changing the Slot import, adding `forwardRef`, and anything related to Figma parity (deferred — see §3.6).

The Button API stays source-compatible with its current consumers. No breaking changes.

---

## Changes

### 1. `packages/components/src/components/atoms/button/button.tsx`

**1.1 — Introduce a named `ButtonProps` interface and export it as a type.**

Replace the inline prop type on the function signature with a named interface:

```tsx
export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

function Button({
  className,
  variant,
  size,
  block,
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

export { Button, buttonVariants };
export type { ButtonProps };
```

`Spinner` is imported from the existing `atoms/spinner/spinner` module — no new loading visual is introduced.

Notes:
- The interface **extends `React.ComponentProps<"button">`** rather than `React.ButtonHTMLAttributes<HTMLButtonElement>`. This is intentional: `ComponentProps` is the shadcn React-19 default and implicitly handles ref in a way consistent with our "no `forwardRef`" decision (see §3 below).
- The interface **intersects `VariantProps<typeof buttonVariants>`** via `extends`, matching the CONTRIBUTING convention.
- **`ButtonProps` is exported as a type-only export.** This adds the third of the three required exports (`Button`, `buttonVariants`, `ButtonProps`).
- **`loading` is a prop, not a CVA variant.** It governs behaviour and rendered children, not classes, so it doesn't belong in `buttonVariants`. When `loading` is true and `asChild` is false, a `<Spinner />` is prepended to `children`, `aria-busy` and `data-loading` are set, and `disabled` is forced true so clicks are blocked and the existing `disabled:` styling applies. When `asChild` is true, `loading` is silently ignored — injecting an extra spinner would break Radix Slot's single-child contract. This limitation is documented in `Button`'s JSDoc and in `COMPONENT.md`.
- **Spinner size caveat.** `Spinner` hardcodes `size-4`. Button's `[&_svg:not([class*='size-'])]:size-*` matchers don't override it because Spinner already carries a `size-` class. For the `icon-xs` button (which wants `size-3` icons) the spinner renders slightly too large. Flagged as a known minor visual deviation to tune later; not a blocker for this pass and noted under "Known deviations" in Button's `COMPONENT.md`.

**1.2 — Add the two mandatory JSDoc blocks.**

One on `buttonVariants` naming each variant axis:

```tsx
/**
 * Button variants.
 *
 * Variant axis = visual style (default, outline, secondary, ghost, destructive, success, link)
 * Size axis    = default, sm, lg, icon, icon-xs, icon-sm
 * Block axis   = boolean, stretches the button to fill its container
 */
const buttonVariants = cva(...)
```

One line per axis, options listed inline. `loading` does not appear here — it's a prop, not a CVA axis.

One on the `Button` export:

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
function Button(...) { ... }
```

No other JSDoc is added. Internal variables and the `Comp` local stay uncommented.

**1.3 — Fix indentation on lines 19-23.**

`destructive`, `success`, and `link` are currently indented one level too deep inside the `variants.variant` object. Whitespace-only fix; no class changes.

**1.4 — Add the Spinner import.**

```tsx
import { Spinner } from "../spinner/spinner";
```

Reuses the existing atom — no new loading visual is introduced. Spinner is imported by relative path rather than through the package barrel because the Spinner atom is not yet exported from `src/index.ts`.

**1.5 — Everything else is unchanged.**

Variant taxonomy, size taxonomy, `Slot.Root` import (`import { Slot } from "radix-ui"`), arbitrary `rounded-[min(var(--radius-md),10px)]` values, absence of `forwardRef` / `displayName` — all stay as-is. These are either explicit scope exclusions or decisions that belong to a later pass.

### 2. `packages/components/src/components/atoms/button/button.stories.tsx`

Under the revised CONTRIBUTING rule (§3.4 below), stories exist only to surface usage patterns that aren't discoverable via the `argTypes` controls. The current story set already maps to that rule almost exactly.

**2.1 — Fix the `argTypes.size` options.**

Remove `"icon-lg"` from the options array. The size doesn't exist in the implementation, so today it's a dead option in the Storybook controls panel. Final options:

```tsx
options: ["default", "sm", "lg", "icon", "icon-xs", "icon-sm"]
```

**2.2 — Keep the existing five stories and add a `Loading` story.**

Each of these surfaces a non-obvious usage pattern and earns its place under the new rule:

| Story | Why it exists |
|---|---|
| `Default` | Baseline render; anchors the argTypes playground |
| `WithIcon` | Shows that icons can be passed as children and Button styles them via `[&_svg]:size-4` |
| `IconButton` | Shows the `size: "icon"` + icon-only-child pattern |
| `Block` | Shows full-width behaviour in a constrained wrapper (not obvious from a boolean toggle) |
| `AsChild` | Shows rendering as an anchor while preserving variant styling |
| `Loading` | Shows the composed loading state — prepended spinner, disabled, `aria-busy` — which isn't obvious from a boolean toggle label |

`Loading` story shape:

```tsx
export const Loading: Story = {
  args: { loading: true },
};
```

Uses the default children from `meta.args` so no render override is needed.

**2.3 — Add `loading` to `argTypes`.**

```tsx
loading: { control: "boolean" },
```

Lets consumers toggle the loading state directly in the Controls panel from any story.

**2.4 — No other new stories.**

Variant, size, and `disabled` permutations are exercised via the argTypes controls panel and do not need dedicated stories.

### 3. `packages/components/CONTRIBUTING.md`

**3.1 — Strip "Button as reference" language.**

- Line 5: delete the sentence *"The existing Button component (`src/components/atoms/button/`) is a living reference for most patterns described here."*
- Line 251: delete *"See the Button implementation for a reference that uses all of these."*

Rationale: we no longer want CONTRIBUTING to anchor on a single reference component. Patterns are taught prose-first with generic examples.

**3.2 — Genericize Button-shaped code examples.**

All Button-specific examples are replaced with a generic placeholder component. The goal is to keep the pedagogical value of concrete code while not making any real component the canonical reference.

Affected blocks (replace `Button` with `Component`, `buttonVariants` with `componentVariants`, `ButtonProps` with `ComponentProps`, and `button.tsx` with `component.tsx`):

- The `cva()` pattern example (lines 133-150)
- The `ButtonProps` interface example (lines 173-179)
- The cva JSDoc example (lines 207-217)
- The named-exports example (lines 225-238)
- The `src/index.ts` barrel example (lines 193-197)

The "contained / outlined / text / link" + "primary / success / error" axis naming in the JSDoc example is preserved as an illustration of multi-axis CVA patterns, prefixed with a short note that it's illustrative and not a binding taxonomy.

**3.3 — Remove `forwardRef` / `displayName` from the "Other patterns" section.**

The current list (lines 245-251) flags `React.forwardRef`, `displayName`, and Radix `Slot` / `asChild` as encouraged patterns.

Replace with:

> **Radix `Slot` / `asChild`** — use when the component wraps a single element and consumers may need to swap the underlying element (e.g. rendering a Button as a link).
>
> We currently follow shadcn's React-19 defaults — plain function components, no `React.forwardRef`, no `displayName`. This may be revisited if/when a consumer needs ref access that plain function components can't provide.

**3.4 — Rewrite the "Minimum story set" section (lines 355-361).**

Replace the current bullet list ("One story per variant value / one per size / key states / compound variants") with:

> Write a story only when a usage pattern isn't discoverable from the `argTypes` controls. Variant values, sizes, and boolean states (disabled, loading) are controllable via the Storybook controls panel — no dedicated story needed for those.
>
> Stories exist to surface patterns that *aren't* expressible as prop permutations: icon children, slot-based composition (`asChild`), wrapper-dependent behaviour (full-width inside a constrained container), compound behaviours, and anything else a reader wouldn't discover by clicking through the argTypes.
>
> Every component still needs at least one story — the default render — so the argTypes playground has an anchor.

**3.5 — Update the Definition of Done.**

Line 427: replace *"Stories cover all variants, sizes, states, and compound variants"* with *"Stories cover non-obvious usage patterns (see Minimum story set)"*.

**3.6 — Remove Figma parity from the quality checklist example.**

In the `COMPONENT.md` quality checklist example (lines 82-87), delete the line:

```md
- [x] Figma parity: matches DSW-Web-Components Figma source
```

Add a short paragraph near the checklist (or at the bottom of the `COMPONENT.md` section) noting that Figma parity is deliberately not a quality gate for components at this point:

> **On Figma parity:** components are not currently gated on Figma parity. The process for populating Figma with Clarity V2 components — whether they are authored in Figma first, generated from code, or hand-maintained in parallel — is an open question to be resolved later in the programme. Until that decision is made, the component library is the source of truth, not Figma, and `COMPONENT.md` quality checklists do not include a Figma parity item.

The "Definition of Done" list (line 422 onwards) has no explicit Figma item, so no edit is needed there. Quality checklist items that appear in real `COMPONENT.md` files (including Button's in §5 below) will not include Figma parity.

**3.7 — Delete the "Setup: testing infrastructure" section (lines 450-470).**

The section claims `@storybook/addon-a11y`, `@storybook/addon-vitest`, `@storybook/test`, and `vitest` still need to be installed, and that `.storybook/main.ts`, `vitest.config.ts`, and the `test:storybook` script still need to be wired up. Verified against `packages/components/package.json`: `@storybook/addon-a11y`, `@storybook/experimental-addon-test`, `@storybook/test`, `@vitest/browser`, `playwright`, and `vitest` are all installed, and `test:storybook` exists in scripts. The section is stale — remove it entirely.

If any of the wiring (`.storybook/main.ts` addon list, `vitest.config.ts` project config) turns out to be incomplete during implementation, the fix goes into this pass as a small follow-up, not a return to this spec.

**3.8 — Everything else is unchanged.**

Token consumption rules, `cn()` guidance, folder structure, sidebar taxonomy, `COMPONENT.md` format, testing layers, shadcn CLI open question — all stay as-is.

### 4. `packages/components/CLAUDE.md`

No edits. The file contains no Button-specific references; its only mention of CONTRIBUTING is generic ("Read CONTRIBUTING.md before making any changes"), which remains correct.

### 5. `packages/components/src/components/atoms/button/COMPONENT.md`

Fill out the entire file. Frontmatter:

```yaml
---
name: Button
slug: button
version: 0.1.0
status: stable
lastUpdated: 2026-04-13
---
```

**5.1 — Content sections.**

Draft content for each section. All draft content is subject to design-lead review before landing.

- **§ Button** — one-liner: "Primary interactive element for triggering actions."
- **§ Props** — table derived from `ButtonProps`:

    | Prop | Type | Default | Description |
    |---|---|---|---|
    | `variant` | `"default" \| "outline" \| "secondary" \| "ghost" \| "destructive" \| "success" \| "link"` | `"default"` | Visual style of the button. |
    | `size` | `"default" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm"` | `"default"` | Height and padding of the button. Icon sizes are for icon-only buttons. |
    | `block` | `boolean` | `false` | Stretch the button to fill its container width. |
    | `asChild` | `boolean` | `false` | Render as a child element (via Radix Slot) instead of a native `<button>`. |
    | `loading` | `boolean` | `false` | Show a prepended spinner, set `aria-busy`, and force the button disabled. No effect when `asChild` is true. |
    | `disabled` | `boolean` | `false` | Native `disabled` attribute. Applies `pointer-events: none` and 50% opacity. |

    All standard `<button>` HTML attributes are supported via prop spread.

- **§ Usage guidelines** — draft:

    > Use Button for any action that a user triggers synchronously on the current page — submitting a form, opening a dialog, running a local operation.
    >
    > **Don't use Button** for navigation that changes the URL — use an `<a>` or Next.js `<Link>` instead. If the element needs to *look* like a Button but navigate like a link, use `asChild` to render an anchor with Button styling.
    >
    > **Don't use Button** to trigger a menu — use `DropdownMenu` and its own trigger, which handles focus and keyboard navigation for you.

- **§ Best practices** — draft:

    > **Do:** Use `default` for the primary action on a screen or section — one per section.
    > **Do:** Use `outline` or `secondary` for non-primary actions next to a primary.
    > **Do:** Use `destructive` for actions that cannot be undone, and confirm with a dialog first.
    > **Do:** Use `size: "icon"` (or the `icon-sm` / `icon-xs` variants) for icon-only buttons. Always provide an `aria-label`.
    > **Do:** Use `loading` for actions that kick off async work — it prepends a spinner, blocks further clicks, and announces the busy state to screen readers.
    > **Don't:** Use the `link` variant for real navigation — it's for actions that visually resemble links, not for anchors.
    > **Don't:** Put multiple `default` variants next to each other. If everything is primary, nothing is.
    > **Don't:** Combine `loading` with `asChild`. The Slot child must own its own loading state — Button silently ignores `loading` in that case.

- **§ Writing** — draft:

    > - Use action verbs: "Save", "Delete", "Continue" — not "OK" or "Click here".
    > - Keep labels short — 1-3 words.
    > - No ALL CAPS — the component handles text styling.

- **§ Quality checklist** — filled in per the actual-verification rule (§5.2 below).

**5.2 — Quality checklist rule.**

The three checklist items in Button's `COMPONENT.md` must reflect what was actually verified, not aspirational ticks. During implementation, each item is either:

- **Ticked** if the verification ran and passed.
- **Left unchecked with an inline note** if verification failed, is pending review, or is a known deviation.

Expected state after the conformance pass, for reference — implementation must verify each of these before committing:

Button's checklist has three items after the Figma removal (§3.6): Accessibility, Responsive, Tokens only.

- **Accessibility** — Ticked iff `vitest run --project=storybook` passes clean for Button's stories with `@storybook/addon-a11y` wired into the Storybook config. If axe-core reports violations, the tick doesn't land until they're resolved or explicitly justified in COMPONENT.md.
- **Responsive** — Ticked with a note. Button has no breakpoint-dependent behaviour by design; it's container-width-dependent only via the `block` prop. Note: *"No breakpoint-specific behaviour; `block` handles container fit."*
- **Tokens only** — Ticked if `grep` of `button.tsx` shows no hex values, no `bg-[#...]` or `p-[Npx]` arbitrary pixel/color syntax, and no non-token colour references. The existing `rounded-[min(var(--radius-md),10px)]` uses CSS variables, not literals, and is flagged as a soft gap explicitly excluded from this pass — it does not block the "tokens only" tick but should be called out in COMPONENT.md under a short "Known deviations" note.

Figma parity is deliberately omitted — see §3.6.

Actual verification results override these expected states. If `grep` turns up something unexpected, the tick doesn't land.

### 6. `CHANGELOG.md`

Add a new dated entry at the top of `CHANGELOG.md` (most recent first, matching the existing convention). The entry records both the component-level work and the CONTRIBUTING-level decisions with their reasoning, so the log stands alone as an explanation of why Clarity V2's conventions look the way they do.

Entry format (dated `2026-04-13`):

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

See [`docs/superpowers/specs/2026-04-13-button-conformance-design.md`](docs/superpowers/specs/2026-04-13-button-conformance-design.md) for the full spec.
```

The entry above captures every decision named in this spec. If implementation surfaces a new decision not listed here, the new decision must also be added to the CHANGELOG entry before the work is considered done.

### 7. `packages/components/src/index.ts`

Uncomment and expand the Button barrel export.

Current state (line 24, commented out):

```ts
// export { Button, buttonVariants } from "./components/atoms/button/button";
```

New state — two lines, matching the three-export pattern required by CONTRIBUTING:

```ts
export { Button, buttonVariants } from "./components/atoms/button/button";
export type { ButtonProps } from "./components/atoms/button/button";
```

No other barrel lines are touched.

---

## Verification

The implementation plan must actually run each of these and record the result before marking the work complete. No ticks without evidence.

- `cd packages/components && npx tsc --noEmit` — clean
- `npx nx build components` — succeeds
- `cd packages/components && npm run test:storybook` — `vitest run --project=storybook --passWithNoTests` exits clean (covers Layer 1 render tests and Layer 2 axe-core a11y for Button's stories via `@storybook/addon-a11y`). If `.storybook/main.ts` or `vitest.config.ts` isn't wired up to include a11y, fix the wiring as part of this pass.
- `cd packages/components && npx storybook dev -p 6006` — starts without errors, all five Button stories render (manual smoke check)
- Grep of `button.tsx` for hex values, `bg-[#`, `p-[`, `m-[`, and non-token colour references — empty or only the known `rounded-[min(var(--radius-md),...)]` deviation
- `COMPONENT.md` frontmatter and content sections complete, quality checklist populated per §5.2

---

## Out of scope (explicit exclusions)

- Variant / intent / size taxonomy redesign
- Replacing `rounded-[min(var(--radius-md),10px)]` with a pure token value
- `React.forwardRef` / `displayName`
- Changing the `Slot` import from `radix-ui` to `@radix-ui/react-slot`
- Any edits to `../platform/`, `../minivoda/`, or `../experience-framework/`

Each of these is a legitimate follow-up; none belong in this pass.

---

## Risks and flags for the design lead

- **COMPONENT.md draft content is author-drafted, not design-lead-authored.** The Usage, Best practices, and Writing sections are my best-effort drafts. They must pass Chris's review before the PR lands. Flag any line that needs rewording.
- **Status flip to `stable` is a commitment.** Once the barrel export is live, downstream consumers will rely on the current variant taxonomy. Changing it later is a breaking change. Confirm this is the right moment to promote.
- **Arbitrary `rounded-[min(...)]` values remain in the code.** These are a soft gap under CONTRIBUTING's token-consumption rules. Leaving them is a conscious decision for this pass, noted in COMPONENT.md's "Known deviations".
- **Figma parity is dropped as a quality gate.** Only until the Figma strategy decision lands. Once that decision exists, the quality checklist in CONTRIBUTING's `COMPONENT.md` example — and Button's own checklist — may need to be revisited to re-introduce a Figma gate in whatever form that strategy takes.
