# Changelog

All notable changes to `@nivoda/components` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Button conformance pass (2026-04-13)

Promoted Button to `stable 0.1.0` after a conformance pass against `packages/components/CONTRIBUTING.md`, and amended CONTRIBUTING itself where its guidance had drifted from current decisions. See [`docs/superpowers/specs/2026-04-13-button-conformance-design.md`](../../docs/superpowers/specs/2026-04-13-button-conformance-design.md) for the full spec and [`docs/superpowers/plans/2026-04-13-button-conformance.md`](../../docs/superpowers/plans/2026-04-13-button-conformance.md) for the plan.

**Button changes:**
- Introduced a named `ButtonProps` interface, exported as a type. Previously the prop type was inlined on the function signature.
- Added a `loading` prop that prepends a `Spinner`, forces the button disabled, and sets `aria-busy` + `data-loading`. No effect when `asChild` is true — Radix Slot's single-child contract forbids injecting an additional spinner, and the Slot child is expected to manage its own loading state.
- Added JSDoc blocks on `buttonVariants` (naming each variant axis) and on the `Button` export (describing purpose, the `asChild` escape hatch, and the `loading`/`asChild` interaction). Matches CONTRIBUTING's "two mandatory JSDoc blocks" rule.
- Fixed indentation on the destructive/success/link variant entries in `buttonVariants`.
- Removed the non-existent `icon-lg` option from `button.stories.tsx` `argTypes.size`. Added a `Loading` story and a `loading` argTypes control.
- Filled out `button/COMPONENT.md` (frontmatter, props, usage, best practices, writing, known deviations, quality checklist). Version `0.0.0` → `0.1.0`, status `unstable` → `stable`.
- Uncommented the Button line in `src/index.ts` and added the `ButtonProps` type export alongside it — Button is now publicly exported from the package barrel.
- Imported `Spinner` via the `@/components/atoms/spinner/spinner` alias (matching the existing `@/lib/utils` import above it). This choice surfaced a latent `vite.config.ts` bug once the barrel went live: the `@/` alias was wired in `tsconfig.json` and `.storybook/main.ts` but not in the library vite config, so rollup couldn't resolve `@/lib/utils` or `@/components/atoms/spinner/spinner` once `button.tsx` entered the build graph. Added the alias to the library vite config as part of the barrel commit.

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
