# Phase B Conformance Pass — Design Spec

**Date:** 2026-04-14
**Scope:** Apply a mechanical conformance pass against `packages/components/CONTRIBUTING.md` to 14 components (Badge, Breadcrumb, Dialog, Dropdown Menu, Input, Label, Popover, Select, Separator, Sheet, Skeleton, Toggle Group, Tooltip, and the Icon Button usage pattern documented inside Button). Amend CONTRIBUTING.md to reword Rule 1 (token consumption) and update the Definition of Done for Phase B. Retrofit Button against the revised Rule 1.
**Owner:** Chris (design lead) — ratifies
**Status:** Draft

---

## Background

Phase B of Clarity V2 is building out the core component library. Button was the first component shipped through a conformance pass against `CONTRIBUTING.md` on 2026-04-13 (see `docs/superpowers/specs/2026-04-13-button-conformance-design.md`). 14 more components have been imported from shadcn into `packages/components/src/components/` as stub `COMPONENT.md` files with minimal stories. This spec applies the same conformance template to all 14 and promotes them to `stable`, while also reworking CONTRIBUTING's Rule 1 to better reflect what the token-consumption rule actually means in practice.

Scope is deliberately narrow — mechanical conformance only. Taxonomy redesigns, token-gap fixes, and behavioural enhancements are out of scope. Each of the 14 components inherits shadcn's default API and variant set unchanged. The one exception is Button, which gets a retrofit against the new Rule 1 wording even though its conformance pass is already complete.

GitHub issue references for each component are tracked in commit messages and in the final PR description, which closes the issues on merge.

---

## Decisions captured from interview

The following decisions were ratified during brainstorming and are not re-negotiable within this spec:

- **Scope depth:** narrow conformance only (mirrors Button's Scope A). No taxonomy redesign, no behavioural affordances, no arbitrary-value replacement.
- **Status promotion:** all 14 components promote from `unstable` to `stable` and get uncommented barrel exports.
- **Play functions:** minimal smoke-level only, for interactive components. Exhaustive keyboard / focus / edge-case coverage is a follow-up pass.
- **CHANGELOG shape:** one consolidated dated entry for the whole pass with per-component sub-sections.
- **Commit strategy:** one commit per component on the current `feat/phase-b-rough-component-pass` branch, plus separate commits for CONTRIBUTING edits, Button retrofit, CHANGELOG, and barrel exports. Single PR.
- **Standalone vitest tests:** none in this pass. Layers 1–3 cover the batch.
- **Icon Button (#82):** documentation-only — a usage pattern inside Button's `COMPONENT.md`, not a new component.
- **Breadcrumb:** stays at `molecules/breadcrumb/`; sidebar title is singular `Navigation/Breadcrumb`. CONTRIBUTING's taxonomy line updates accordingly.
- **COMPONENT.md draft depth:** Props table mechanically derived, Usage and Best practices drafted from general design-system best practice, Writing section only where the component renders text that needs guidance.
- **Verification gate:** lightweight per-commit (`tsc --noEmit` + Rule 1 grep), full gate (`nx build components`, `test:storybook`, Storybook dev smoke) once at the end.
- **Token consumption (revised Rule 1):** raw literals inside Tailwind arbitrary value syntax are forbidden; `var(--token)` references inside arbitrary syntax are allowed. Mixed expressions where any literal leaks in are violations (e.g. `rounded-[min(var(--radius-md),10px)]` — the `10px` is the violation).
- **Violation policy:** flag, don't fix. Inline comment in the TSX + Known deviations note in the COMPONENT.md. Components with flagged violations may still be promoted to `stable`; the "Tokens only" DoD item stays unticked until resolved.
- **Execution order:** Approach 1 — easy atoms first (Separator, Skeleton, Label, Badge), then Button-pattern doc, then form atoms, then static molecule, then overlays in increasing complexity.
- **Commit issue references:** `feat(<slug>): conformance pass (#NN)` in subject, `Refs #NN` in body. Close via PR description on merge.

---

## Changes

### 1. `packages/components/CONTRIBUTING.md`

Four edits. No other CONTRIBUTING changes.

**1.1 — Reword Rule 1 (lines ~253-270).**

Replace the current Rule 1 section with:

> **Rule 1 — Components consume tokens only through the CSS theme**
>
> Components never import from `packages/tokens/` and never reference raw token CSS variables as Tailwind utility shortcuts to raw literals. They see tokens only through the Tailwind theme, as utility classes — or, when an arbitrary value is truly needed, as a `var(--token)` reference inside arbitrary value syntax.
>
> **Allowed:**
> - Semantic utility classes: `bg-primary`, `text-foreground`, `border-border`, `p-4`, `rounded-md`
> - Arbitrary value syntax when the value is a CSS variable: `rounded-[var(--radius-md)]`, `w-[calc(100%-var(--sidebar-width))]`
>
> **Forbidden:**
> - Raw literals inside arbitrary value syntax: `p-[14px]`, `text-[#232323]`, `m-[4px]`, `bg-[#fff]`
> - Mixed expressions where any literal leaks in: `rounded-[min(var(--radius-md),10px)]` — the `10px` half is the violation even though `var(--radius-md)` is fine
> - Hardcoded hex values anywhere in the file
>
> If the design calls for a value not in the token set, flag it — NEVER invent a token.

**1.2 — Add a "Violation policy" subsection immediately below Rule 1.**

> **Handling violations**
>
> When a component has a Rule 1 violation that can't be trivially resolved (e.g. an inherited shadcn default whose replacement would be a design judgement call), the violation is **flagged, not fixed**:
>
> 1. Add an inline comment directly above or beside the offending line in the `.tsx` file: `// clarity-v2: token-gap — <short description of violation>`
> 2. Record the violation in that component's `COMPONENT.md` under a `## Known deviations` section, pointing at the file and the rule.
>
> Flagged violations are revisited per-component in later design-lead-led passes. This policy exists to let conformance work move fast without triggering design judgement calls on shadcn defaults.

**1.3 — Update the Definition of Done.**

Reword the "Tokens only" line in the DoD (line ~422):

> - [ ] Tokens only: no raw literals inside Tailwind arbitrary value syntax, no hardcoded colors, spacing, radius, or shadows. `var(--token)` inside arbitrary syntax is allowed.

Add immediately below the DoD list:

> **Publishing with flagged violations.** A component may be promoted to `stable` and barrel-exported even if it has flagged Rule 1 violations. The "Tokens only" DoD item remains unticked in that component's `COMPONENT.md` with an inline note pointing at the flag. Publishing is allowed; completion is not. This is an explicit exception for Phase B, not a permanent carve-out — each flag is a ticket for a later per-component review.

**1.4 — Update the sidebar taxonomy line (Navigation section).**

Change `Navigation/ Tabs, Accordion, Breadcrumbs` → `Navigation/ Tabs, Accordion, Breadcrumb` (singular). One word change.

### 2. `packages/components/src/components/atoms/button/` — retrofit

Lands as its own commit immediately after the CONTRIBUTING amendments. No code change.

**2.1 — `button.tsx` inline flag.**

Directly above the `rounded-[min(var(--radius-md),10px)]` line, add:

```tsx
// clarity-v2: token-gap — raw 10px literal inside arbitrary value syntax, pending design review
```

No other edit to `button.tsx`.

**2.2 — `button/COMPONENT.md` updates.**

- Add (or extend) a `## Known deviations` section:

  > **Rule 1 — raw literal in arbitrary value syntax.** [`button.tsx`](./button.tsx) contains `rounded-[min(var(--radius-md),10px)]`. The `10px` is a raw literal and violates the revised Rule 1. Flagged pending per-component review by the design lead — see the inline comment in the TSX.

- Quality checklist: flip the `Tokens only` box from ticked to unticked with an inline note:

  > - [ ] Tokens only — flagged: raw `10px` literal in `rounded-[min(var(--radius-md),10px)]`. See Known deviations.

- Bump `lastUpdated` to `2026-04-14`.
- `status` stays `stable`. `version` is not bumped — documentation-only correction.

**2.3 — No other Button files touched.** `button.stories.tsx`, `src/index.ts` barrel lines, `ButtonProps` — all unchanged.

**2.4 — Commit.**

```
docs(button): retrofit Rule 1 flag for 10px literal

Refs the revised Rule 1 wording in CONTRIBUTING.md (previous commit).
Button is the first application of the new flag-don't-fix violation
policy.
```

### 3. The mechanical template (applied to every component)

Every component commit touches up to five files inside its folder. This template is the contract. Per-component deviations are listed in §4 — anything not called out there follows the template exactly.

**3.1 — `<component>.tsx`**

1. **Named `Props` interface + type export.** Replace any inline prop type on the function signature with a named interface that extends `React.ComponentProps<"...">` for the root element and intersects `VariantProps<typeof <component>Variants>` via `extends` when CVA is used.

    ```tsx
    export interface ComponentProps
      extends React.ComponentProps<"div">,
        VariantProps<typeof componentVariants> {
      asChild?: boolean;
    }
    ```

2. **JSDoc block on the variants object** (only when CVA is used). One line per variant axis, options listed inline.

3. **JSDoc block on every named export** — the component, the variants object, and every exported subcomponent (Dialog's subcomponents, Select's subcomponents, etc.). The block describes what it is, when to use it, and any non-obvious constraints. Uses `@see` links to the variants object where relevant.

4. **Three-export pattern at the bottom:** value exports first, then type-only `Props` export.

    ```tsx
    export { Component, componentVariants };
    export type { ComponentProps };
    ```

5. **Rule 1 audit.** Grep the file for hex literals and `-[Npx]`-style arbitrary values. Any mixed-case finds get the inline `// clarity-v2: token-gap — <description>` comment per §1.2. **No fixes.**

6. **Nothing else is touched.** Variant taxonomy, sizes, Slot import source, className structure, Radix primitive references — all stay as shadcn shipped them.

**3.2 — `<component>.stories.tsx`**

1. **Meta block** with `title: "<Category>/<Component>"` per CONTRIBUTING's sidebar taxonomy, `component`, `tags: ["autodocs"]`, and `argTypes` with `control: "select"` for every enum prop and `control: "boolean"` for boolean props.
2. **One default story** as a minimum — the argTypes playground anchor.
3. **Additional stories** only for patterns not discoverable from argTypes, unless §4 explicitly lists required stories (Dropdown Menu, Popover, Select, Toggle Group).
4. **Minimal play function** for interactive components using `@storybook/test`: `userEvent`, `within`, `expect`. Smoke-level only.

**3.3 — `COMPONENT.md`**

Full fill-out following CONTRIBUTING's section list:

- **Frontmatter:** `name` (PascalCase), `slug` (kebab-case), `version: 0.1.0`, `status: stable`, `lastUpdated: 2026-04-14`.
- **§1 — Heading + one-line description.**
- **§2 — Props table** derived mechanically from the `Props` interface. Note at the bottom of the table that all standard HTML attributes for the root element are supported via prop spread.
- **§3 — Usage guidelines** (~3 sentences). Author-drafted from general design-system best practice.
- **§4 — Best practices** (Do/Don't bullet list, 3–5 items). Author-drafted.
- **§5 — Writing.** Included only for components that render text requiring guidance (see §4). Omitted otherwise.
- **§6 — Quality checklist.** Three items (Accessibility, Responsive, Tokens only). Ticked only where actually verified; each unticked item has an inline note saying why.
- **§ Known deviations.** Only if the Rule 1 audit flagged something. Points at the TSX file and line.

All §3, §4, §5 content is drafted and explicitly flagged in the CHANGELOG as "pending design-lead review".

**3.4 — `src/index.ts` barrel**

Uncomment (or add) the barrel lines using the three-export pattern. Subcomponents (Dialog, Sheet, Dropdown Menu, Select, Popover, Tooltip, Breadcrumb) all appear in the value export. The `*Variants` export is only included when the component uses CVA. Barrel changes for all 14 components land in a single dedicated commit at the end of the pass (§5.3).

**3.5 — Commit message**

```
feat(<slug>): conformance pass (#NN)

- Named ComponentProps interface exported as a type
- JSDoc blocks on variants and every named export
- Stories meta with autodocs and argTypes
- COMPONENT.md fully seeded (first draft)
- [Rule 1 flag: <description>, if any]
- [Minimal play function: <interaction>, if any]

Refs #NN
```

No `Closes #NN` in commit bodies. Issues close on PR merge via PR description.

**3.6 — Lightweight per-commit gate**

Every component commit must pass before landing:

- `cd packages/components && npx tsc --noEmit` — clean
- Grep `<component>.tsx` for hex literals and `-[Npx]` arbitrary values — either empty or every match is accompanied by an inline `// clarity-v2: token-gap` comment

Full verification runs once at the end of the pass (§5.4).

### 4. Per-component deviations from the template

Only notable deviations are listed. If a component isn't mentioned for a given aspect, it follows §3 exactly. Category labels follow CONTRIBUTING's sidebar taxonomy.

**4.1 — Separator — #58** (atom, `Display/Separator`)

- Pure display primitive. No play function.
- Stories: `Default` (horizontal), `Vertical`.
- Writing section: omitted.
- Quality checklist note on Responsive: *"No breakpoint-dependent behaviour."*

**4.2 — Skeleton — #60** (atom, `Feedback/Skeleton`)

- Pure display primitive. No play function.
- Stories: `Default` (block), `Text` (multiple lines of varying width simulating text), `Card` (composed into a card-shaped placeholder).
- Writing section: omitted.

**4.3 — Label — #59** (atom, `Forms/Label`)

- Radix-wrapper. No play function (purely associative).
- Stories: `Default` only.
- Writing section: included — sentence case, no trailing colons, no ALL CAPS.

**4.4 — Badge — #61** (atom, `Display/Badge`)

- CVA-based. Variants: `default`, `secondary`, `destructive`, `success`, `warning`, `info`, `outline`, `ghost`, `link`. Sizes: `default`, `sm`. No play function.
- Stories: `Default`, `WithIcon` (icon + label), `AsLink` (`asChild` rendering an anchor).
- Writing section: included — 1–2 words, sentence case, no punctuation.

**4.5 — Icon Button — #82** (Button usage pattern, NOT a new component)

- No folder, no TSX file, no stories file, no new barrel line.
- Adds an `## Icon Button pattern` section to Button's existing `COMPONENT.md` with a short code example (`<Button size="icon" aria-label="..."><Icon /></Button>`) and a call-out that `aria-label` is required for a11y.
- Button's existing `IconButton` story (already in `button.stories.tsx`) is kept as-is. No story changes.
- Commit subject: `docs(button): document icon button usage pattern (#82)`. Lands between Badge and Input per the execution order.

**4.6 — Input — #62** (atom, `Forms/Input`)

- Form control. Minimal play function: type a value into the input, assert `toHaveValue`.
- Stories: `Default`, `WithLabel` (showing the Label + Input association pattern).
- Writing section: included — placeholder guidance (placeholders aren't labels; sentence case; keep short).

**4.7 — Toggle Group — #74** (atom, `Forms/Toggle Group`)

- CVA-based. `type` (`single` / `multiple`), `variant`, `size`, `spacing`. Minimal play function: click an item, assert pressed state changes.
- Stories: `Default` (single-select), `Multiple` (multiple-select), `Spacing` (user-requested — showcases the `spacing` prop).
- Writing section: omitted (items are app-defined).

**4.8 — Breadcrumb — #83** (molecule, `Navigation/Breadcrumb`)

- Radix-shaped but mostly styled elements. Subcomponents: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`. JSDoc on each.
- No play function (static navigation).
- Stories: `Default` (3-segment breadcrumb ending in `BreadcrumbPage`), `WithEllipsis` (collapsed mid-segment), `CustomSeparator` (e.g. `/` instead of the default chevron).
- Writing section: included — concise segment labels, match page title, sentence case.

**4.9 — Tooltip — #73** (atom, `Overlays/Tooltip`)

- Radix-wrapper. Subcomponents: `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`. JSDoc on each. `TooltipProvider` must wrap at app root or story — called out in the `COMPONENT.md` Usage guidelines.
- Minimal play function: hover trigger, assert content visible.
- Stories: `Default` (trigger button + content string).
- Writing section: included — short phrase or full sentence, sentence case, no punctuation for phrases.

**4.10 — Popover — #72** (atom, `Overlays/Popover`)

- Radix-wrapper. Subcomponents: `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`. JSDoc on each.
- Minimal play function: click trigger, assert content appears; click outside, assert closed.
- Stories: `Default` (simple trigger + content), `WithForm` (user-requested — small form inside the popover per the shadcn/radix docs example).
- Writing section: omitted (content is app-defined).

**4.11 — Dropdown Menu — #77** (molecule, `Actions/Dropdown Menu`)

- Radix-wrapper. Subcomponents: `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`, `DropdownMenuGroup`, `DropdownMenuPortal`. JSDoc on each.
- Minimal play function: click trigger, assert content visible, click first item, assert content closed.
- Stories (user-requested):
    - `Default` (simple item list — playground anchor)
    - `WithSubmenus` (3 layers deep)
    - `WithIcons` (Tabler icons beside item labels)
    - `WithCheckboxes` (checkable items per the shadcn/radix checkboxes example)
    - `Destructive` (one destructive item among normal items)
    - `Complex` (sections + labels + submenus per the shadcn/radix complex example)
    - **Explicitly not included:** keyboard shortcut stories.
- Writing section: included — action verbs, sentence case, short.

**4.12 — Select — #78** (molecule, `Forms/Select`)

- Radix-wrapper. Subcomponents: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`. JSDoc on each.
- Minimal play function: click trigger, assert listbox visible, click an item, assert value updated in the trigger's `SelectValue`.
- Stories (user-requested):
    - `Default` (playground anchor)
    - `WithGroups` (groups + labels)
    - `Scrollable` (fixed height, long option list per the shadcn/radix scrollable example)
- Writing section: included — option text guidance, placeholder guidance.

**4.13 — Dialog — #75** (molecule, `Overlays/Dialog`)

- Radix-wrapper. Subcomponents: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`. JSDoc on each.
- Minimal play function: click trigger, assert dialog visible; click close, assert hidden.
- Stories: `Default` (title + description + body + footer with two buttons), `Destructive` (confirmation-style with a destructive footer button).
- Writing section: included — title (sentence case, no punctuation, clear action), description (one sentence, what's about to happen).

**4.14 — Sheet — #76** (molecule, `Overlays/Sheet`)

- Radix-wrapper. Subcomponents: `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose`. `SheetContent` has a `side` variant (top/right/bottom/left). JSDoc on each.
- Minimal play function: click trigger, assert sheet visible; press Escape, assert hidden.
- Stories: `Default` (right side), `Left`, `Bottom`. `Top` is skipped — rarely used and discoverable via argTypes.
- Writing section: included — same guidance as Dialog.

### 5. Commit order, CHANGELOG, barrel exports, final verification

**5.1 — Commit order.**

All commits land on `feat/phase-b-rough-component-pass`. Order:

1. `docs(contributing): reword Rule 1 and update DoD for Phase B` — §1 amendments
2. `docs(button): retrofit Rule 1 flag for 10px literal` — §2 retrofit
3. `feat(separator): conformance pass (#58)` — §4.1
4. `feat(skeleton): conformance pass (#60)` — §4.2
5. `feat(label): conformance pass (#59)` — §4.3
6. `feat(badge): conformance pass (#61)` — §4.4
7. `docs(button): document icon button usage pattern (#82)` — §4.5
8. `feat(input): conformance pass (#62)` — §4.6
9. `feat(toggle-group): conformance pass (#74)` — §4.7
10. `feat(breadcrumb): conformance pass (#83)` — §4.8
11. `feat(tooltip): conformance pass (#73)` — §4.9
12. `feat(popover): conformance pass (#72)` — §4.10
13. `feat(dropdown-menu): conformance pass (#77)` — §4.11
14. `feat(select): conformance pass (#78)` — §4.12
15. `feat(dialog): conformance pass (#75)` — §4.13
16. `feat(sheet): conformance pass (#76)` — §4.14
17. `docs(changelog): log Phase B conformance pass` — §5.2
18. `feat(components): uncomment barrel exports for Phase B batch` — §5.3

Ordering rationale: easy atoms first (Separator/Skeleton/Label/Badge) validate the mechanical template on low-stakes components. The Button-pattern doc lands mid-batch so Icon Button's documentation context is colocated with the other form/display work. Form atoms and the static molecule (Breadcrumb) follow. Overlays come last in increasing complexity so play-function patterns are debugged once on Tooltip/Popover before hitting Dialog/Sheet/Dropdown Menu/Select.

**5.2 — CHANGELOG entry.**

One consolidated entry at the top of `packages/components/CHANGELOG.md` dated `2026-04-14`:

```md
## 2026-04-14 — Phase B conformance pass (14 components) + CONTRIBUTING realignment

Promoted 14 components to `stable` after a mechanical conformance pass
against `packages/components/CONTRIBUTING.md`. Amended CONTRIBUTING's
Rule 1 and Definition of Done to reflect the revised token-consumption
policy, and retrofitted Button against the new rule.

### CONTRIBUTING.md changes
- Reworded Rule 1: raw literals inside Tailwind arbitrary value syntax
  are forbidden; `var(--token)` inside arbitrary syntax is allowed.
  Mixed expressions where any literal leaks in are violations.
- Added a "Violation policy" subsection: flag, don't fix. Inline comment
  in the TSX + Known deviations note in the COMPONENT.md.
- Updated Definition of Done: components with flagged Rule 1 violations
  may be published (status `stable`, barrel-exported) but the "Tokens
  only" DoD item stays unticked until the flag is resolved.
- Sidebar taxonomy: `Breadcrumbs` → `Breadcrumb` (singular).

### Button retrofit
- Flagged the `rounded-[min(var(--radius-md),10px)]` line in button.tsx
  under the new violation policy. No code change — inline comment and
  Known deviations note added to COMPONENT.md. Quality checklist
  "Tokens only" box flipped to unticked with inline note. Button
  remains `stable`.

### Components promoted to `stable` (14)

For each of Badge, Breadcrumb, Dialog, Dropdown Menu, Input, Label,
Popover, Select, Separator, Sheet, Skeleton, Toggle Group, Tooltip:

- Introduced a named `<Component>Props` interface exported as a type.
- Added JSDoc blocks on the variants object (where CVA is used) and on
  every named export, including subcomponents.
- Meta blocks, autodocs tag, and argTypes wired up on every story file.
- COMPONENT.md fully seeded with frontmatter, one-line description,
  props table, usage guidelines, best practices, writing (where the
  component renders user-facing text), and quality checklist.
- Minimal play functions added for interactive components (Input,
  Toggle Group, Tooltip, Popover, Dropdown Menu, Select, Dialog, Sheet).
- Rule 1 audit run on each component; any flagged violations recorded
  inline in the TSX and under "Known deviations" in the COMPONENT.md.
- Uncommented the corresponding lines in `src/index.ts` as part of the
  final barrel-exports commit.

Icon Button (#82) is documented as a Button usage pattern in Button's
COMPONENT.md, not as a new component. No new folder, no new barrel line.

### Scope explicitly excluded from this pass

- Variant / intent / size taxonomy redesign per component. Current
  taxonomies are shadcn-flat inherited defaults — a review is a
  separate design-lead-led pass.
- Fixing flagged Rule 1 violations. Per the new violation policy, each
  flag is a ticket for later per-component review.
- Adding standalone vitest tests (Layer 4). None of the batch crosses
  the "non-trivial logic" threshold. Stories + a11y + minimal play
  functions cover them.
- Exhaustive play-function coverage (keyboard navigation, deep focus
  management, edge cases) — follow-up pass.
- Icon Button as a standalone component (see above).

### Draft content flag

All Usage guidelines, Best practices, and Writing sections across the
14 COMPONENT.md files are author-drafted from general design-system
best practice (Material, Carbon, Radix, shadcn, a11y conventions).
They are explicit first drafts pending design-lead review. No
Nivoda-specific context was used in drafting.

### Verification

`tsc --noEmit`, `nx build components`, `vitest run --project=storybook`,
Storybook dev smoke check — all pass.

### Issues addressed

Refs #58, #59, #60, #61, #62, #72, #73, #74, #75, #76, #77, #78, #82, #83.
Close on PR merge via PR description.

See [`docs/superpowers/specs/2026-04-14-phase-b-conformance-design.md`](docs/superpowers/specs/2026-04-14-phase-b-conformance-design.md) for the full spec.
```

**5.3 — Barrel exports commit.**

Final commit uncomments / adds barrel lines in `packages/components/src/index.ts` for all 14 components, each following the three-export pattern. Examples:

```ts
export { Badge, badgeVariants } from "./components/atoms/badge/badge";
export type { BadgeProps } from "./components/atoms/badge/badge";

export { Separator } from "./components/atoms/separator/separator";
export type { SeparatorProps } from "./components/atoms/separator/separator";

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./components/molecules/dialog/dialog";
export type { DialogProps } from "./components/molecules/dialog/dialog";
```

Components with multiple named exports (Dialog, Sheet, Dropdown Menu, Select, Popover, Tooltip, Breadcrumb) export all their subcomponents from the barrel. The `*Variants` export is only included when the component uses CVA (Badge, Toggle Group do; Separator, Skeleton, Label do not — verify during implementation). No Icon Button barrel line — it's a Button usage pattern.

**5.4 — Final verification (runs once, before PR).**

After commit 18:

- `cd packages/components && npx tsc --noEmit` — clean
- `npx nx build components` — succeeds
- `cd packages/components && npm run test:storybook` — passes (Layer 1 render tests, Layer 2 axe-core a11y, Layer 3 play functions)
- `cd packages/components && npx storybook dev -p 6006` — starts, all 14 component sidebars appear, manual click-through of each component's stories
- Grep each `<component>.tsx` for hex literals and `-[Npx]` arbitrary values — every match has an accompanying `// clarity-v2: token-gap` comment

Any failures get fixed in a final cleanup commit before push. No commit is "done" if the final gate fails.

**5.5 — PR description.**

When Chris is ready, the PR description includes:

- One-line summary
- Link to this spec
- Link to the CHANGELOG entry
- `Closes #58, #59, #60, #61, #62, #72, #73, #74, #75, #76, #77, #78, #82, #83` at the bottom so all 14 issues close on merge
- A "Draft content review needed" call-out listing the 14 `COMPONENT.md` files for Chris's pass on Usage / Best practices / Writing sections

---

## Verification

The implementation plan must actually run each of these and record the result before marking the pass complete. No ticks without evidence.

- Per-commit (runs once per commit, 18 commits total — see §5.1):
    - `cd packages/components && npx tsc --noEmit` — clean
    - Grep of the touched TSX for hex literals and `-[Npx]` arbitrary values — either empty or every match has an accompanying `// clarity-v2: token-gap` comment
- Final (runs once, before PR):
    - `cd packages/components && npx tsc --noEmit` — clean
    - `npx nx build components` — succeeds
    - `cd packages/components && npm run test:storybook` — passes
    - `cd packages/components && npx storybook dev -p 6006` — all 14 component sidebars render without errors, manual click-through of each story
    - Grep sweep across all 14 component TSX files — every Rule 1 match accompanied by an inline flag comment

---

## Out of scope (explicit exclusions)

- Variant / intent / size taxonomy redesign for any component
- Fixing flagged Rule 1 violations (per the new violation policy)
- Adding standalone vitest tests (Layer 4)
- Exhaustive play-function coverage
- Icon Button as a standalone component
- Nivoda-specific content in Usage / Best practices / Writing sections
- Any edits to `../platform/`, `../minivoda/`, or `../experience-framework/`
- Any new token mappings or `globals.css` theme edits

Each of these is a legitimate follow-up; none belong in this pass.

---

## Risks and flags for the design lead

- **Draft content across 14 `COMPONENT.md` files is author-drafted, not design-lead-authored.** Usage guidelines, Best practices, and Writing sections are best-effort drafts from general design-system best practice. They must pass Chris's review before the PR merges. Chris flags individual lines for rewording.
- **Status flip to `stable` × 14 is a commitment.** Once barrel exports are live, downstream consumers rely on current variant taxonomies inherited from shadcn. Changing them later is a breaking change. Confirm this is the right moment to promote — the interview confirmed this explicitly but it bears repeating.
- **Rule 1 audits will surface flagged violations on at least some components.** Each flag is a ticket for a later per-component design review. The spec does not commit to a timeline for resolving them.
- **Minimal play functions are smoke-level only.** They are not exhaustive coverage and do not exercise keyboard navigation, focus management edge cases, or Radix-specific behaviours. A follow-up play-function pass is implied but not scheduled.
- **`TooltipProvider` must wrap at the story level** for Tooltip stories to render correctly. The `COMPONENT.md` Usage guidelines call this out; the stories include it. Missing the provider is a common Radix foot-gun — worth noting in case Chris's review catches an unwrapped story.
- **Final verification gate could reveal wiring gaps in `.storybook/main.ts` or `vitest.config.ts`.** Button's conformance pass assumed these were wired; if this pass reveals they aren't, wiring fixes land as a small follow-up commit before the PR, not as a new spec.
