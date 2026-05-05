# Changelog — @nivoda/components

Package-specific changes for the Clarity V2 component library. Newest entries first.

For cross-cutting monorepo changes, see the root [`CHANGELOG.md`](../../CHANGELOG.md). Format and rules: see root [`CONTRIBUTING.md`](../../CONTRIBUTING.md#changelog).

---

## 2026-05-05

- **Megamenu** (organism, unstable 0.1.0). Trigger-agnostic compound for app-header navigation panels. Compound API: `MegamenuGroup`, `Megamenu`, `MegamenuTrigger`, `MegamenuContent`, `MegamenuLink`, `MegamenuFooter`, plus the `MegamenuTabs` family. Trigger is unstyled (matches `Sheet.Trigger` / `Dialog.Trigger` / `Tooltip.Trigger`); consumers pass their row item via `asChild`. Activation: hover-opens on `lg+` with click pass-through (so an `asChild` link navigates), click-opens a bottom Sheet below `lg`. Single-active coordinator with instant cross-trigger handoff. `MegamenuContent.yOffset` (1–12) pulls the panel upward by the corresponding Tailwind spacing unit so it overlaps a strip above. Disclosure-pattern ARIA. Storybook coverage: `Default`, `WithFooter`, `WithBottomBanner`, `WithCategoryTabbing`, `Complex`.
- Pinned `recharts: ^3.0.0` as a devDep. The chart organism imports `TooltipValueType`, declared as an optional peer at `^3.0.0`; without an installed version the `tsc --emitDeclarationOnly` step failed in workspace setups where the wrong recharts version was hoisted. The devDep gives tsc a matching install while leaving the public peer-dep contract unchanged.
- Theme: added `--negative` / `--negative-foreground` token pair to `primitives.css` (light + dark) and exposed via `web-theme.css` as `--color-negative` / `--color-negative-foreground`. Used by consumers building dark-on-light rails (e.g., Minivoda's categories strip).

## 2026-04-30

- Stripped overlapping branching/versioning/PR/ADR-format sections from `CONTRIBUTING.md`. Package-specific guidance preserved (when to write a package vs project-level ADR). File shrank from 661 → 579 lines (`128ef7e`).
- Merged the in-flight `claude/festive-beaver-0e136c` branch into `dev`: `PlpListRow` gains a `shipsFrom` tooltip; row delivery icons top-aligned; `__stories__/diamond-renderers.tsx` carries `businessDays` through (`c30630d`, originally `5700f3c`, `8b16d4f`).

## 2026-04-23

- Theme split into two layered files: new `primitives.css` (raw `:root` / `.dark` tokens, agnostic) and `web-theme.css` (composes everything else — fonts, animations, `@theme inline` mapping, `@layer base` resets). Public export renamed `./theme.css` → `./web-theme.css`.
- Added `@custom-variant data-open` and `data-closed` registrations — fixes silently-broken Radix overlay animations (Sheet, Dialog, Popover, Drawer, AlertDialog) in consumer apps. Tailwind v4 has no built-in `data-open`/`data-closed` variant, so the existing `data-open:animate-in` etc. classes were never generating.
- `project.json` updated to copy both CSS files to `dist/`; token-flow diagram in `CONTRIBUTING.md` and `COMPONENTS.md` refreshed.

## 2026-04-22

- **Build refactor (#126):** Vite `lib` build switched to per-file output via `preserveModules` — bundle barrel drops from ~1.2 MB to ~16 KB. Added `rollup-preserve-directives` so `"use client"` is preserved per-file; added missing directives to 22 components. Runtime deps externalised to `peerDependencies` (radix-ui, @base-ui/react, recharts, sonner, vaul, cmdk, embla-carousel-react, input-otp, next-themes, lucide-react, @tabler/icons-react). CSS split into portable `theme.css` (consumer) + `globals.css` (Storybook-local). `tsc-alias` post-step rewrites `@/` aliases in dist `.d.ts` files.
- **Components pass 3 (#125):** Four new components landed as `unstable` — `SegmentedControl` (atom), `InlineBanner` (atom, page-level callout), `PageBanner` + `AppShell` banner slot (full-bleed app callout, `sticky top-0`), `Stepper` (molecule, ordered multi-step flows). `Progress` gained `variant` and `size` props (`78a0863`, `c1ad2e4`, `87e5a9b`, `bbcdf49`, `088fcae`).
- **PLP list view stories (#123):** Added dedicated `ListRow` stories file mirroring `GridItem`. New `hug` prop on `PlpListBodyCell`/`HeaderCell` for icon-only columns; `shipsFrom` tooltip on `PlpListRowDelivery`; sticky-cell background fix when row actions menu opens. PLP stories split into `api/renderers/filters/interactive` modules with shared mock API client. Storybook sidebar reordered simpler → more complex (`c71f813`, `4c1d659`, `ed19c93`).

## 2026-04-21

- **PLP polish (#122):** `FilterDrawer` is no longer standalone — `FilterToolbar` now owns the drawer via a `drawer: FilterToolbarDrawer` prop. `ChipSelectFilter`, `PlpEmpty`, `PlpError` removed. Per-piece `COMPONENT.md` files folded into a single `templates/plp/COMPONENT.md` (`ef679c9`, `df966ea`, `2581a73`).
- **Filter subsystem extracted; PLP becomes a kit (breaking, unstable 0.6.0):** PLP-scoped filter system extracted into reusable molecules + the `FilterToolbar` organism under a new `Filtering/` Storybook section: `FilterDrawer`, `FilterSection`, `AllFiltersButton`, `ChipSelectFilter`, `RangeFilter`, `AsyncComboboxFilter`. `PlpTemplate` deleted; PLP becomes a kit (`PlpHeading`, `PlpGridContainer`, `PlpListContainer`, `PlpEmpty`, `PlpError`, plus existing grid/list primitives) — consumers assemble pages themselves.
- **PLP filter system decoupled from business logic (breaking, unstable 0.5.0):** `FilterDefinition` schema and preset registry demolished; each preset is now a standalone component with direct props and its own value/option types. `PlpTemplate` no longer renders the drawer — consumers render `PlpFilterDrawer` as a sibling and own drawer state, draft buffering, and chip-summary formatting. `plp-types.ts` drops registry-era types (`FilterDefinition`, `FilterPresetName`, `FilterControlProps`, etc.). New `PlpFilterSection` primitive added.

## 2026-04-20

- **Typography atom (#121):** New `Typography` atom covering DSW typography styles (H1–H6, Body 1/2 Regular+Emphasis, Caption Regular+Emphasis). Single `variant` axis, `as` prop for element override, `asChild` via Radix Slot; defaults to `body2`. 12 `--text-typography-*` role presets added to `globals.css` `@theme inline`. Link/Dashed Link deferred to a future Link atom.

## 2026-04-17

- **PLP Template Phase 3a (unstable 0.3.0):** Three advanced filter presets — `range-slider` (two-thumb Slider + commit-on-blur numeric inputs + optional histogram), `multi-axis-range` (one slider + numeric input pair per axis), `async-combobox` (multi-select with lazy initial load, debounced search, label caching). Multi-select chip truncation at 2 + "+N more" (`3c98403`, `3a7d693`, `997952b`, `e62569d`).
- **PLP Template Phase 3b (unstable 0.4.0):** 360 rotatable media on hover for grid thumbnails. New optional `media360: { videoUrl: string }` field on `GridItemData`. New `useHasHover` hook gates the entire 360 path on pointer-device detection — touch devices skip it entirely. Extracted `PlpGridThumbnail` sub-component (`4d9ef9a`, `aad08b3`, `a2110e9`).
- **PLP Template Phase 2 (unstable 0.2.0):** List view added alongside grid. New `ListColumn<TItem>` and `PlpViewMode` types; `useIsTabletUp` hook at the 1024px breakpoint with viewport-based fallback to grid below. Sticky header, conditional Price/ct column, hover-gated actions cell, skeleton loading. Grid/list view toggle in toolbar (`110c3a8`, `922cced`, `4422048`).
- **PLP Template Phase 3c deferred:** Analytics surface deferred indefinitely (consumers wire at their own state-setters/handlers). Captured as ADR-001 in this package's `ADRS.md`.
- **Atoms round 2 (#120):** Refresh of six form/feedback atoms (Alert, Checkbox, RadioGroup, Slider, Switch, Textarea) — upstream styling, full COMPONENT.md, argTypes, non-discoverable composition stories, play functions on every interactive component. `--ring` theme token retuned from stone-neutral to violet brand hue. Two Rule 1 token-gap flags recorded (Checkbox `rounded-[4px]`, several Switch literals) (`1b6e84f`, `d90fb27`, `530e9f8`).
- **FilterButton bakes in Apply/Clear:** `FilterButton` now renders Apply/Clear in its popover footer automatically — consumers supply the control as `children` and wire `onApply`/`onClear`. Previous `popoverContent` prop replaced by `children`. New internal `PlpStickyFilterBar` — fixed-position bar below `AppShellHeader` that appears when the main toolbar scrolls out of view, wired via `IntersectionObserver`.
- **FilterButton atom (unstable 0.1.0):** Two-state control for applied filters — outline button label inactive, split into clickable `label: value` region + inline dismiss X when active. Modelled on Button's `outline` variant with `bg-muted` tint when active. `PlpQuickFilter` refactored to compose it.

## 2026-04-16

- **PLP Template Phase 1 (unstable 0.1.0):** First page-level template. Full grid view with filter system, sorting, pagination, responsive behaviour. Stateless — consumer owns filter state, sort, pagination, data. Rendered inside `AppShell`. Formalised the `templates/` tier in `CONTRIBUTING.md`. Four filter presets (boolean chip, single-select chips, multi-select chips, single-select dropdown). 10-section grid item with optional slots and platform/category actions. Toolbar (search + All Filters + quick filters + sort), All Filters drawer, active filters strip with sticky behaviour and inline chip editing (`870ad89`, `0ba88f5`, `8a49307`, `186d9eb`).

## 2026-04-15

- **AppShell organism + Brand foundation:** Both shipped as `stable 0.0.1`. `AppShell` is a four-region compound (header, nav sheet, main, root wrapper) with hardcoded brand region, search bar, and nav trigger — consumers compose only trailing actions and main content. `Brand` is an inline SVG wordmark with `fill="currentColor"`, resizable via `className`. Search bar uses direct `bg-stone-50` palette — flagged as Rule 1 token-gap, not fixed (`9942451`, `047e771`).

## 2026-04-14

- **Phase B conformance pass (14 components):** Promoted Separator, Skeleton, Label, Badge, Input, Toggle Group, Breadcrumb, Tooltip, Popover, Dropdown Menu, Select, Dialog, Sheet to `stable`. CONTRIBUTING.md: reworded Rule 1 (raw literals forbidden, `var(--token)` in arbitrary syntax allowed), added violation-handling policy, updated DoD for flagged violations. 14 components got named Props interfaces, JSDoc blocks, `tags: ["autodocs"]`, COMPONENT.md, minimal play functions for interactive ones (`20c9be9`, `66fc80c`, `2faad8f`).
- **Hover state polish:** Fixed `Button.secondary` foreground from `text-primary-foreground` to `text-secondary-foreground`. Consistent `hover:text-primary-hover` across `Button.outline`, `Button.link`, `Toggle`. `Button.secondary` gets `hover:text-secondary-hover` backed by a new `--secondary-hover` token. `Toggle` adds `background` to its transition list (`e3d1a4b`).
- **Smaller polish:** Breadcrumb separator marked use-as-is — `CustomSeparator` story removed (`5066a5d`). Dropdown destructive stories use `variant="destructive"` instead of faked `className`; aligned `py-3` across interactive items; spinner icon ref fixed (`433dfb9`, `af6fb4e`). Badge marked display-only — `AsLink` story removed, `asChild` deprecated (`fe48445`). Popover/Sheet story cleanup (`e2d1c57`).

## 2026-04-13

- **Button conformance pass:** Promoted Button to `stable 0.1.0`. New `loading` prop (prepends Spinner, forces disabled, sets `aria-busy`). `ButtonProps` interface extracted and type-exported. JSDoc blocks on all exports. CONTRIBUTING.md: dropped `forwardRef`/`displayName` convention, relaxed minimum story set, removed Figma parity from DoD (`407032d`, `89f7932`, `cbaaaec`).
- **Atomic folder structure + testing infrastructure:** Reorganized 50 components into `atoms/`, `molecules/`, `organisms/`. Removed 7 out-of-scope (Native Select, Calendar, Context Menu, Menubar, Toast, Resizable). `@` path alias added to Storybook vite config. `src/index.ts` rewritten as commented-out surface for controlled publishing. Pre-bundled React in vitest `optimizeDeps` to fix hook-call crashes (`15fa7b4`, `ac8052a`, `bf05a97`, `ca54ae7`).
- **Initial setup:** Initial shadcn/ui scaffolding before the organized PR workflow began — `components.json`, `globals.css`, `utils.ts`; 55 components scaffolded via `npx shadcn add` (`2d2b9dc`, `7068ccb`).
