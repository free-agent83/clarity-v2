# Changelog

All notable changes to `@nivoda/components` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### AppShell organism and Brand foundation (2026-04-15)

Introduces [`AppShell`](src/components/organisms/app-shell/app-shell.tsx), the top-level page-shell organism for every Nivoda application surface, and [`Brand`](src/components/atoms/brand/brand.tsx), a new Foundations-level atom for the Nivoda wordmark. `AppShell` ships as `stable` at `0.0.1` with its barrel exports enabled; `Brand` ships as `unstable 0.0.1` with a commented-out barrel line, ready for its own promotion pass once the design lead has signed off.

#### `AppShell` structure

`AppShell` is a four-region compound: `AppShellHeader` (sticky top bar), `AppShellNavigationSheet` (left-anchored drawer), `AppShellMain` (page content with a constrained inner container), and the root wrapper itself (which also serves as a Radix `Dialog.Root` context provider for the nav sheet). The root rejects `className` at the type level via `Omit<..., "className">` — styling at the shell level is forbidden so downstream apps cannot drift.

#### The header's leading region and search bar are hardcoded

`AppShellHeader` renders a hardcoded brand region (menu trigger + `Brand` at `h-6`) at `order-1`, a hardcoded `AppShellSearchBar` at `order-2 flex-1`, and consumer-composed `AppShellActions` at `order-3`. Neither the brand nor the menu trigger nor the search bar is a slot — they're internal helper functions, not exported, not overridable. Every Nivoda app shell opens its nav with the same button, wears the same brand mark, and presents the same search affordance.

- **`AppShellSearchBar`** is a `<button>` styled to look like an `Input`, with a leading `IconSearch` and fixed placeholder "Search Nivoda…". It fires the `onSearch` callback passed to `AppShellHeader`. The component is deliberately not an actual input: search handling (Dialog, command palette, route change) is app-specific, and the shell doesn't take a position on it.
- **`AppShellNavTrigger`** (internal) is a ghost `Button` with `IconMenu2` and the label "Menu" at the default size. Wires itself to the nav sheet via the `Sheet` provider `AppShell` wraps its children in — no state management required.

The rule is documented with explicit Don'ts in the component's `COMPONENT.md`: no `Combobox`, no `Input[type=search]`, no bespoke button dressed up as a search icon, no alternative menu button. Surface-level secondary searches (e.g. filter-in-table) belong inside the main content area, not the header.

#### `AppShellNavigationSheet` owns its three-region layout

The nav sheet wraps `SheetContent` with `side="left"` locked. Consumers pass only `children` (the navigation body); the header slot is a single `heading` ReactNode prop, and the footer is entirely structural with a fixed Avatar + identity block + "Log out" button composition driven by the required `user` and `onLogout` props. `AppShellNavigationSheetUser` is exported as a named type — `{ name, email?, avatarSrc? }`. The avatar fallback is auto-computed from `user.name` (`"John Appleseed"` → `"JA"`) so consumers never have to pass a fallback string. `title` is a required ReactNode rendered in an `sr-only` `SheetTitle` for Radix a11y, plus a fixed `sr-only` `SheetDescription` to silence Radix's `Missing Description` warning.

#### Main area and `full` escape hatch

`AppShellMain` wraps its children in an inner container (`mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8`). Pass `full={true}` on `AppShell` to remove the max-width constraint; the value cascades via a `data-full` attribute and a `group-data-[full=true]/app-shell:` selector on the inner container. `full` is documented as an escape hatch, not a default — data grids, dashboards, and complex views should use the constrained width as a rule, because the design system is tuned around it.

#### Stories

Five stories land under `Navigation/App Shell`:

- **`Default`** — minimal header (no trailing actions), nav closed. Play function exercises menu open → Escape → close.
- **`FullWidth`** — demonstrates `full={true}`.
- **`NavigationOpen`** — workbench story with `defaultNavigationOpen={true}` so the nav sheet is visible on mount. Added specifically for iterating on the sheet in isolation.
- **`SearchDialog`** — wires `onSearch` to local state that opens an empty `Dialog`, illustrating the "shell fires, consumer handles" pattern. Play function exercises search click → dialog → Escape → dismissed.
- **`TrailingControls`** — showcases a fuller set of trailing controls inside `AppShellActions`: three `size="icon"` buttons (Calculator, Currency, Shortlists) wrapped in `Tooltip`s via a scoped `TooltipProvider`, plus `Cart (2)` and `Help` text buttons with trailing icons.

#### Button size rule for `AppShellActions`

Buttons inside `AppShellActions` must use `size="default"` or `size="icon"` — both are `h-11` and preserve the header's vertical rhythm. `sm`, `lg`, `icon-sm`, and `icon-xs` are all shorter than `h-11` and break alignment with the hardcoded search bar and menu trigger. The rule applies **only** to `AppShellActions`; the main content area and the navigation sheet body are explicitly free to use any button size. An earlier draft of this rule was shell-wide and too strict; the narrower version landed as part of the `TrailingControls` story work.

#### Not for closed modal flows

Explicit "Do not use for" callout in the component's `COMPONENT.md`: checkouts, stone selections, diamond comparison wizards, and any single-task step-by-step flow should not use `AppShell`. The full shell with its branding, search, and navigation creates escape hatches that undermine the flow's completion metric. Those flows should render in a `Dialog`, a `Sheet`, or a bespoke minimal layout instead.

#### Known deviations

- **`AppShellSearchBar` surface fill uses direct Tailwind palette references.** The search bar's resting and hover fills are `bg-stone-50` and `hover:bg-stone-100` — direct Tailwind stone-palette utilities, not DS semantic tokens. This is a Rule 1 violation, flagged not fixed: resolving it requires either a new semantic token for the search bar surface or repurposing `muted` / `muted/50`, both design-lead rulings. Inline `clarity-v2: token-gap` flag in [`app-shell.tsx`](src/components/organisms/app-shell/app-shell.tsx) and a Known deviations entry in the component's `COMPONENT.md`. "Tokens only" DoD item stays unticked.

#### `Brand` foundation component

New atom at [`src/components/atoms/brand/brand.tsx`](src/components/atoms/brand/brand.tsx) with stories and `COMPONENT.md`. Renders the Nivoda wordmark as an inline SVG (the two paths — triangle + circle — from the design lead's source file) with `fill="currentColor"` so the mark inherits the ambient text colour and renders correctly on both light and dark surfaces without a variant prop.

Resizable via standard Tailwind height utilities on `className`: `<Brand className="h-10" />`. Default `h-6 w-auto`; the SVG `viewBox` handles aspect ratio. Deliberately no `size` prop — one override axis keeps the API surface zero and lets consumers size the mark against the same spacing scale they use for everything else in the shell. Default `role="img" aria-label="Nivoda"`; consumers can pass `aria-hidden` when the brand sits next to a visible wordmark and is decorative.

Storybook sidebar title is `Foundations/Brand`. Four stories: `Default`, `Sizes` (five heights), `OnDark` (demonstrates `currentColor` auto-flip on an inverted surface), `Recoloured` (three tinted variants). `COMPONENT.md` documents the design ruling that consumers must import `Brand` rather than reproducing the wordmark with inline SVG elsewhere in the codebase.

#### Verification

`tsc --noEmit` clean. `vitest --project=storybook run app-shell brand` — 9 tests pass (5 app-shell + 4 brand), no a11y violations, no Radix warnings.

### Breadcrumb separator is fixed by the design system (2026-04-14)

Hardened a Breadcrumb usage rule that the original shadcn import had left as an open door.

- **Rule:** `BreadcrumbSeparator` must be used as-is. Never pass children to swap in a slash, dot, arrow, or any other glyph. The default chevron is the design system's chosen separator; consistency across every breadcrumb instance in the product is more important than per-instance personality. If a future surface needs a different separator, the change happens in the component itself and applies uniformly — never per-instance.
- **Story removed.** The `CustomSeparator` story is gone from [`breadcrumb.stories.tsx`](src/components/molecules/breadcrumb/breadcrumb.stories.tsx). Wrapping `BreadcrumbSeparator` around an `<IconSlash />` (or any other element) is no longer demonstrated as a valid pattern. The orphaned `IconSlash` import was pruned.
- **COMPONENT.md updated** — the `BreadcrumbSeparator` props bullet now explicitly says "use as-is, do not pass children", and the Best practices list gains a `Do` (use as-is, with the rationale) and a `Don't` (no per-instance separator customization, ever).

The Breadcrumb component itself is unchanged. `BreadcrumbSeparator` still accepts children at the type level — a follow-up pass can tighten that to forbid children entirely if we want hard enforcement.

### Dropdown menu polish: destructive item story API + uniform item heights (2026-04-14)

Two fixes surfaced during the post-Phase-B Storybook smoke pass on Dropdown Menu.

- **Destructive stories were faking destructive instead of using the prop.** Both the `Destructive` and `Complex` stories wrapped the destructive item in `className="text-destructive focus:text-destructive"` instead of passing `variant="destructive"`. Because the rendered element never received `data-variant="destructive"`, none of the destructive-keyed CSS rules in `dropdown-menu.tsx` ever fired — the icon picked up `text-accent-foreground` via the `not-data-[variant=destructive]:focus:**:text-accent-foreground` cascade and the hover background showed `bg-accent` (lavender) instead of `bg-destructive/10`. Fix: switched both stories to `variant="destructive"`. This is the second instance of the "Compose stories from system components only" rule we added to CONTRIBUTING.md earlier — the story was bypassing the component's actual API to fake the look. Icon, text, and background now all behave correctly on hover. The destructive variant's CSS in the component file is unchanged from the shadcn import — we briefly swapped its `*:[svg]` selector for `[&_svg]` while chasing a phantom CSS bug, then reverted once the real fix landed in the stories.
- **Uniform item heights across all interactive menu types.** `DropdownMenuItem` was on `py-3` while `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, and `DropdownMenuSubTrigger` were on `py-1.5`, so a menu mixing item types had visibly inconsistent row heights. Aligned all four to `py-3`. `DropdownMenuLabel` is intentionally left at `py-1.5` — it's a non-interactive heading, not an option, and its smaller height preserves the visual hierarchy between section labels and the items they group.

### Badge is display-only — no links, no actions (2026-04-14)

Hardened a Badge usage rule that the original shadcn import had left as an open door.

- **Rule:** Badge must never be used as a link, a button, or any other interactive element. It is a display primitive, period. If the element needs to navigate or trigger an action, use a Button (or a real anchor styled separately).
- **Story removed.** The `AsLink` story is gone from [`badge.stories.tsx`](src/components/atoms/badge/badge.stories.tsx) — wrapping a Badge around an `<a>` is no longer demonstrated as a valid pattern.
- **`asChild` prop deprecated.** The shadcn-inherited `asChild` prop is now flagged as deprecated in Badge's [COMPONENT.md](src/components/atoms/badge/COMPONENT.md). The prop body is unchanged for now to avoid breaking the few existing consumers, but a follow-up pass will strip `asChild`, the `Slot.Root` import, and the Radix Slot dependency on Badge entirely. Documented under `## Pending changes` in the same file.
- **Best practices and Usage guidelines rewritten** to make the rule unambiguous: there is no escape hatch.

### Hover state polish on interactive atoms (2026-04-14)

Small post-Phase-B polish surfaced during a Storybook smoke pass on the newly published components. Three tightly scoped fixes plus a new theme token to back them.

- **`Button.secondary` foreground bug fix.** The `secondary` variant was rendering text in `text-primary-foreground` instead of `text-secondary-foreground` — a stale colour pairing inherited from the shadcn import. Visible in the dark-mode preview as a near-invisible label. Fixed.
- **Consistent `hover:text-primary-hover` across interactive atoms.** `Button.outline`, `Button.link`, and `Toggle` all now shift to `text-primary-hover` on hover, matching `Button.ghost`'s existing behaviour. The previous mix of `hover:text-foreground` / no hover text colour was inconsistent and dulled the hover affordance.
- **`Button.secondary` gains `hover:text-secondary-hover`.** Same idea for the secondary scale, backed by a new token (see below).
- **`Toggle` base classes get `background` in the transition list.** `transition-[color,box-shadow]` → `transition-[color,background,box-shadow]` so the `hover:bg-muted` change is animated instead of snapped on/off. Brings Toggle in line with Button's hover feel.

#### Theme token addition

- **New `--secondary-hover` token** (light + dark) plus its `--color-secondary-hover` Tailwind theme alias in [`packages/components/src/styles/globals.css`](src/styles/globals.css). Light mode reuses `oklch(0.4679 0.2562 283.19)` (the same primary-hover violet); dark mode reuses `oklch(0.97 0.001 106.424)` (the muted near-white). The token exists so `Button.secondary`'s new hover text colour resolves through the theme layer rather than via an arbitrary value, per CONTRIBUTING Rule 1.

This is a Rule 3 theme change (adding a new semantic token mapping) made by the design lead directly. No agent ratification needed.

### Phase B conformance pass (2026-04-14)

Promoted 14 components to `stable` after a mechanical conformance pass against `packages/components/CONTRIBUTING.md`. Amended CONTRIBUTING's Rule 1 and Definition of Done to reflect the revised token-consumption policy, and retrofitted Button against the new rule.

#### CONTRIBUTING.md changes

- Reworded Rule 1: raw literals inside Tailwind arbitrary value syntax are forbidden; `var(--token)` inside arbitrary syntax is allowed. Mixed expressions where any literal leaks in are violations (e.g. `rounded-[min(var(--radius-md),10px)]` — the `10px` is the violation).
- Added a "Handling violations" subsection: flag, don't fix. Inline `// clarity-v2: token-gap` comment in the TSX + Known deviations note in the COMPONENT.md.
- Updated Definition of Done: components with flagged Rule 1 violations may be published (status `stable`, barrel-exported) but the "Tokens only" DoD item stays unticked until the flag is resolved. This is an explicit Phase B exception, not a permanent carve-out.
- Sidebar taxonomy: `Breadcrumbs` → `Breadcrumb` (singular).

#### Button retrofit

Flagged three raw pixel literal violations in [`button.tsx`](src/components/atoms/button/button.tsx) under the new violation policy: `rounded-[min(var(--radius-md),10px)]` on the `sm` size, `rounded-[min(var(--radius-md),8px)]` on `icon-xs`, and `rounded-[min(var(--radius-md),10px)]` on `icon-sm`. No code change — inline comments and Known deviations notes added to COMPONENT.md. Quality checklist "Tokens only" box flipped from ticked to unticked. Button remains `stable`.

Also added an **Icon Button pattern** section to Button's `COMPONENT.md` documenting the `<Button size="icon" aria-label="..."><Icon /></Button>` usage. Icon Button (#82) is a Button usage pattern, not a new component.

#### Components promoted to `stable` (14)

For each of Badge, Breadcrumb, Dialog, Dropdown Menu, Input, Label, Popover, Select, Separator, Sheet, Skeleton, Toggle Group, Tooltip:

- Introduced a named `<Component>Props` interface declared with `interface` at the top of the file and re-exported via `export type { }` at the bottom — the established three-export pattern.
- Compound components (Dialog, Dropdown Menu, Select, Popover, Tooltip, Sheet, Breadcrumb) export named interfaces for subcomponents with custom props (e.g. `DialogContentProps` for `showCloseButton`, `SelectTriggerProps`, `SelectContentProps`); pass-through subcomponents keep their inline types.
- Added JSDoc blocks on the variants object (where CVA is used) and on every named export, including subcomponents.
- Meta blocks with `tags: ["autodocs"]` and `argTypes` on every story file.
- `COMPONENT.md` fully seeded with frontmatter, one-line description, props table or bullet list, usage guidelines, best practices, writing section (where the component renders user-facing text), and quality checklist.
- Minimal play functions added for interactive components (Input, Toggle Group, Tooltip, Popover, Dropdown Menu, Select, Dialog, Sheet). Dialog and Sheet play functions use `within(document.body)` to account for Radix portal rendering.
- Rule 1 audit run on each component. Flagged violations:
  - **Badge** — `ring-[3px]` (focus-ring, no token replacement available)
  - **Tooltip** — `translate-y-[calc(-50%_-_2px)]` and `rounded-[2px]` on `TooltipPrimitive.Arrow`
  - **Dropdown Menu** — `min-w-[96px]` on `DropdownMenuSubContent`
  - **Dialog** — `max-w-[calc(100%-2rem)]` on `DialogContent`
  - Other components had no violations.
- Each flagged violation is recorded inline in the TSX and under Known deviations in the COMPONENT.md, with the "Tokens only" quality checklist item left unticked per the publishing-with-flagged-violations exception.
- Uncommented the corresponding lines in [`src/index.ts`](src/index.ts) as part of the final barrel-exports commit (next).

**User-specified story sets** landed for Dropdown Menu (Default, WithSubmenus 3-deep, WithIcons, WithCheckboxes, Destructive, Complex — shortcuts explicitly skipped), Popover (Default, WithForm), Select (Default, WithGroups, Scrollable), and Toggle Group (Default, Multiple, Spacing).

#### Scope explicitly excluded from this pass

- Variant / intent / size taxonomy redesign per component. Current taxonomies are shadcn-flat inherited defaults — a review is a separate design-lead-led pass.
- Fixing flagged Rule 1 violations. Per the new violation policy, each flag is a ticket for later per-component review.
- Adding standalone vitest tests (Layer 4). None of the batch crosses the "non-trivial logic" threshold. Stories + a11y + minimal play functions cover them.
- Exhaustive play-function coverage (keyboard navigation, deep focus management, edge cases) — follow-up pass.
- Icon Button as a standalone component (see Button retrofit above).

#### Draft content flag

All Usage guidelines, Best practices, and Writing sections across the 14 `COMPONENT.md` files are author-drafted from general design-system best practice (Material, Carbon, Radix, shadcn, a11y conventions). They are explicit first drafts pending design-lead review. No Nivoda-specific context was used in drafting — Chris reviews before the PR merges.

#### Verification

`tsc --noEmit` clean. `nx build components` succeeds. `npm run test:storybook` passes (49 test files / 76 tests, 1 skipped — pre-existing Chart skip). Token grep across all 14 component TSX files confirms every Rule 1 match is accompanied by an inline `clarity-v2: token-gap` flag comment. Storybook dev smoke check is left for a manual click-through before merge.

#### Test verification fixes (post-implementation)

The full `test:storybook` run during final verification surfaced two unrelated issues that the per-component commits had not caught:

- **Vite dep optimizer race condition.** The new stories were the first in the package to import `@storybook/test`. Vite's optimizer discovered it mid-test-run, invalidated the cached `radix-ui` bundle, and every test that ran after the cache reload crashed with "Invalid hook call" / "two copies of React". Fix: added `@storybook/test` to `vitest.config.ts`'s `optimizeDeps.include` block, alongside the existing React entries. Same pattern, same comment thread — the original config author had already fixed this exact failure mode for `react/jsx-dev-runtime`.
- **Radix portal queries in play functions.** Four Default play functions (Popover, Tooltip, Dropdown Menu, Select) queried portal-rendered content via `within(canvasElement)`, but Radix renders these elements at `document.body`. Fix: switched each to `within(document.body)` for the post-open assertion, matching the pattern already used by Dialog and Sheet from the start. Tooltip additionally switched from `getByText` to `getByRole("tooltip")` because Radix Tooltip renders the content twice (visible + screen-reader), and `getByText` matched both.

Both fixes land in this pass as small follow-ups, per the spec's allowance for in-pass test wiring corrections.

#### Issues addressed

Refs #58, #59, #60, #61, #62, #72, #73, #74, #75, #76, #77, #78, #82, #83. Closed on PR merge via PR description.

See [`docs/superpowers/specs/2026-04-14-phase-b-conformance-design.md`](../../docs/superpowers/specs/2026-04-14-phase-b-conformance-design.md) for the full spec and [`docs/superpowers/plans/2026-04-14-phase-b-conformance.md`](../../docs/superpowers/plans/2026-04-14-phase-b-conformance.md) for the implementation plan.

### Button conformance pass (2026-04-13)

Promoted Button to `stable 0.1.0` after a conformance pass against `packages/components/CONTRIBUTING.md`, and amended CONTRIBUTING itself where its guidance had drifted from current decisions.

**Button changes:**
- New `ButtonProps` interface (named, type-exported) and a new `loading?: boolean` prop — prepends a `Spinner`, forces the button disabled, sets `aria-busy` + `data-loading`. Silently ignored when `asChild` is true (Slot single-child contract).
- JSDoc blocks on `buttonVariants` (each axis) and on `Button` (purpose, `asChild`, loading/asChild interaction) per CONTRIBUTING's two-JSDoc rule.
- Fixes: indentation on destructive/success/link variants; removed the dead `icon-lg` option from `argTypes.size`.
- Stories: new `Loading` story and `loading` argTypes control.
- `button/COMPONENT.md` fleshed out end-to-end; promoted to `status: stable`, `version: 0.1.0`.
- `Button`, `buttonVariants`, and `ButtonProps` now exported from the package barrel (`src/index.ts`).
- Added the `@/` alias to `vite.config.ts` — previously wired in `tsconfig.json` and `.storybook/main.ts` but missing from the library build, which broke rollup once `button.tsx` entered the build graph via the barrel.

**CONTRIBUTING.md changes and reasoning:**
- **Dropped the `forwardRef` / `displayName` convention.** Reason: we are following shadcn's React-19 defaults (plain function components, no ref forwarding). The ecosystem is transitioning to treating `ref` as a regular prop, and introducing `forwardRef` today would be premature overhead. This may be revisited if a consumer needs ref access that plain function components can't provide.
- **Relaxed the minimum story set.** Reason: developers can exercise variants, sizes, and boolean states directly through Storybook's `argTypes` controls panel — dedicated stories for each permutation are redundant. The new rule: write a story only when a usage pattern isn't discoverable from the controls (icon children, `asChild` composition, wrapper-dependent behaviour, etc.). Every component still has at least one default story as an anchor for the controls playground.
- **Removed Button-as-reference language and genericized all Button-shaped code examples.** Reason: the previous CONTRIBUTING pointed at Button as "a living reference", but Button didn't actually conform to the conventions it was supposed to exemplify. Examples are now genericized (`Component` / `componentVariants` / `ComponentProps`) so CONTRIBUTING teaches patterns without binding them to a specific real component. A real reference can be re-anchored later if useful.
- **Removed Figma parity from the `COMPONENT.md` quality checklist.** Reason: how Clarity V2 components should be represented in Figma (authored there first, generated from code, hand-maintained in parallel, or something else) is an unresolved programme-level question. Until that decision is made, the component library is the source of truth, not Figma, and gating components on Figma parity would hold them hostage to an undecided process. Figma parity returns as a quality gate only after the Figma strategy lands.
- **Deleted the "Setup: testing infrastructure" section.** Reason: the section claimed `@storybook/addon-a11y`, `@storybook/experimental-addon-test`, `@storybook/test`, and `vitest` still needed to be installed. Verified against `packages/components/package.json`: they are all already installed, and `test:storybook` is already in the package scripts. The section was stale.

**Scope explicitly excluded from this pass** (documented so future work doesn't assume they were silently considered and rejected):
- **Variant / intent / size taxonomy redesign.** Current taxonomy is single-axis shadcn-flat (`default | outline | secondary | ghost | destructive | success | link`) with a separate `size` axis. CONTRIBUTING's illustrative example shows a two-axis `variant × intent` pattern, but that was always illustrative, not binding. A real taxonomy decision needs design-lead input and a breaking-change plan for any downstream consumers — neither of which belong in a conformance pass.
- **Arbitrary `rounded-[min(var(--radius-md),10px)]` values.** Left in the code. They use CSS variables (not raw literals) so they don't violate the "tokens only" rule strictly, but they're a soft gap under the "no arbitrary value syntax" guidance. Flagged in Button's `COMPONENT.md` under "Known deviations".
- **Slot import source.** `import { Slot } from "radix-ui"` remains. Changing it to `@radix-ui/react-slot` is a micro-cleanup, not a conformance issue.

**Verification:** `tsc --noEmit` clean, `nx build components` succeeds, `npm run test:storybook` 54/54 pass with zero axe violations on Button stories, token grep on `button.tsx` clean.

### Added
- Atomic design folder structure (`atoms/`, `molecules/`, `organisms/`) per CONTRIBUTING.md §"Folder structure". All 50 components moved into `components/<layer>/<name>/` folders with per-component Storybook story and `COMPONENT.md` stub.
- One base Storybook story (`Default`) per component, with sidebar category from CONTRIBUTING.md §"Sidebar taxonomy".
- `COMPONENT.md` skeleton per component with frontmatter (`status: unstable`, `version: 0.0.0`) and `[WIP]` section bodies.
- Testing infrastructure: `vitest@^3`, `@storybook/experimental-addon-test@8.6.18`, `@storybook/addon-a11y@8.6.18`, `@storybook/test@8.6.18`, `@vitest/browser@^3`, `playwright@^1`. `vitest.config.ts` runs every story as a render test via the experimental-addon-test vitest plugin in headless Chromium. `.storybook/vitest.setup.ts` wires Storybook preview annotations into the test environment. `test` and `test:storybook` scripts added.
- `@storybook/addon-a11y` runs in `test: "off"` mode (the SB 8.6.x default, set explicitly) — unaudited shadcn defaults may have violations; these surface in the Storybook dev UI but do not fail CI, and are deferred to per-component build tickets.
- `@` path alias added to `.storybook/main.ts` `viteFinal` so Storybook's Vite pipeline resolves `@/lib/utils` and `@/hooks/...` imports from component files.
- `CHANGELOG.md` (this file).
- `.github/workflows/components.yml` — CI runs `test:storybook` and `build-storybook` on any change under `packages/components/**`.
- Barrel surface in `src/index.ts`: commented-out export lines for every component, grouped by layer. Uncommenting a line publishes that component.

### Changed
- `components.json` — `aliases.ui` updated from `@/components/ui` to `@/components/atoms`, so future `npx shadcn add` drops new components into `atoms/` by default ("start as an atom" convention).

### Removed
- `native-select`, `calendar`, `context-menu`, `menubar`, `resizable` — not part of the intended Clarity V2 surface. Sonner covers any Toast need.
- `src/components/ui/` directory (emptied by the folder move).
- Dependencies: `react-day-picker`, `date-fns` (orphaned by Calendar removal); `react-resizable-panels` (orphaned by Resizable removal).

### Fixed
- Broken `Button` export in `src/index.ts` (previously pointed to `./components/atoms/button/button`, which did not exist after the old reference Button was removed in `6e42687`).

### Known issues
- `Chart`'s `Default` story is disabled (`tags: ["!test"]` + `parameters.docs.disable: true`). `ChartContainer` requires a `config` prop and a Recharts-compatible child tree to mount — a minimal skeleton could not be synthesised in a setup-only context. Documented in [packages/components/src/components/organisms/chart/COMPONENT.md](src/components/organisms/chart/COMPONENT.md) under the Quality checklist as an unchecked item; the per-component build ticket for Chart will re-enable it with a real render.

## [0.0.1] — 2026-04-13

Pre-history: five commits of setup work before the folder reorganisation.

### Added
- `2d2b9dc feat: added clean shadcn` — initial shadcn setup. Added `components.json`, `src/styles/globals.css`, updated `src/lib/utils.ts`, declared initial component dependencies in `package.json`.
- `947f48d feat: added all shadcn components` — 55 components added to `src/components/ui/` via `npx shadcn add`.
- `e990801 docs: comments on globals.css` — annotated `globals.css`.

### Changed
- `7068ccb fix: fresh shadcn/ui theme starter` — reset `globals.css` to a clean shadcn/ui theme starter.

### Removed
- `6e42687 chore: remove old button` — removed the pre-shadcn reference `Button` implementation at `src/components/atoms/button/button.tsx`. (Left `src/index.ts` with a dangling export, fixed in `[Unreleased]` above.)
