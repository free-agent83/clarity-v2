# Changelog — @nivoda/components

---

### FilterButton bakes in Apply/Clear; PLP gains a sticky filter bar

- `FilterButton` now renders Apply and Clear buttons in its popover footer automatically. Consumers supply the filter control as `children` and wire `onApply` / `onClear` callbacks — the popover auto-closes after either fires. The previous `popoverContent` prop is replaced by `children`.
- `PlpQuickFilter` simplified to compose the new FilterButton API; manual Apply/Clear rendering removed.
- New internal `PlpStickyFilterBar` component — a fixed-position bar below the AppShellHeader that appears when the main toolbar scrolls out of view. Shows the "All Filters" button and any engaged filter buttons (quick or non-quick) as a single-row horizontal list with a right-side gradient fade to signify horizontal scrollability. No visible scrollbar. Hides when the main toolbar scrolls back into view or when no filter is engaged.
- `PlpTemplate` wires the sticky bar via an `IntersectionObserver` on the main toolbar, with `rootMargin: "-72px"` to account for the AppShellHeader height.

---

### Add FilterButton atom (unstable 0.1.0)

Introduces `FilterButton` — a two-state control for applied filters. In the inactive state it renders a single outline button with just the filter label; in the active state it splits into a main clickable region showing `label: value` (opens a popover for editing) and an inline dismiss X (clears the filter). Styling is modelled on Button's `outline` variant with a filled `bg-muted` tint for the active state.

- New atom under `atoms/filter-button/` with `.tsx`, `.stories.tsx` (under `Actions/Filter Button`), and `COMPONENT.md`
- Barrel export added as commented `unstable` line — promote when stable
- `PlpQuickFilter` refactored to compose `FilterButton` instead of raw `Button + Popover`; removes the duplicated popover/active-state logic and inherits the inline dismiss behaviour that the active filters strip previously provided

---

### PLP Template — Phase 3c (analytics hooks) deferred

The planned Phase 3c analytics surface on the PLP template is deferred indefinitely. Consumers wire analytics at their own state-setters and handlers rather than through a template-provided callback. Captured as ADR-001 in this package's [`ADRS.md`](./ADRS.md); the PLP architectural spec §8 has been annotated with a status note pointing at the ADR. No code changes shipped.

---

### PLP Template — Phase 3b (unstable 0.4.0)

Adds 360 rotatable media on hover to the PLP grid thumbnail. On pointer devices, items with a `media360.videoUrl` crossfade from their static image into a rotating video; horizontal cursor movement scrubs through the rotation. Touch devices skip the 360 code path entirely.

- New optional `media360: { videoUrl: string }` field on `GridItemData` — category opt-in per item (`4d9ef9a`)
- New `useHasHover` hook gating the entire 360 path on pointer-device detection — no video element mounts on touch (`aad08b3`)
- Extracted `PlpGridThumbnail` sub-component owning the static image, optional 360 video with lazy intersection-observer loading and mousemove scrubbing, hover action toolbar, and selection checkbox (`a2110e9`)
- `PlpGridItem` simplified to delegate thumbnail rendering to `PlpGridThumbnail` (`e532cba`)
- Storybook: new `With360Media` grid item story; ~1/3 of mock items in PLP stories now include `media360` (`6463c28`, `178bdb3`)
- COMPONENT.md bumped to 0.4.0 with `media360` field and encoding guidance documented (`b05f849`)

---

### PLP Template — Phase 3a (unstable 0.3.0)

Adds three advanced filter presets and chip truncation for multi-select values.

- `range-slider` preset: two-thumb Slider with commit-on-blur numeric inputs, optional distribution histogram that highlights the selected sub-range, unit shown as prefix for currencies and suffix otherwise (`3c98403`)
- `multi-axis-range` preset: one slider + numeric input pair per named axis, human-readable axis labels in UI and chip text (`3a7d693`)
- `async-combobox` preset: multi-select Combobox with lazy initial load on open, debounced search, selected-option label caching so chips survive query changes (`997952b`)
- `FilterPresetName`, `PresetFilterDefinition`, and `FilterValue` extended to cover the new presets and the multi-axis value shape (`2390c54`)
- Chip truncation for multi-select (`multi-select-chips` and `async-combobox`): first two values shown, `+N more` for the rest (`e62569d`)
- Registry threads `definition` through to all preset surfaces (drawer, quick filter popover, active chip edit popover); range and multi-axis chip formatters added (`b2d4218`)
- Storybook: every existing PLP story now exercises all filter presets (`40cba5a`)
- `PlpTemplate` COMPONENT.md bumped to 0.3.0 with the new preset names documented (`9a4a48f`)

---

### PLP Template — Phase 2 (unstable 0.2.0)

Adds list view to the PLP template, alongside the existing grid view. Stateless controlled `viewMode` with viewport-based fallback to grid below 1024px. Opt-in per category via the new `listColumns` prop.

- Added `ListColumn<TItem>` and `PlpViewMode` types and a `useIsTabletUp` hook mirroring `useIsMobile` at the 1024px breakpoint (`110c3a8`, `d89d694`)
- List view container with sticky header and conditional Price/ct column, row renderer reading fixed core fields from `GridItemData` and category fields from the raw `TItem` via each column's `cell` function, hover-gated actions cell with Add to cart + More menu (platform + category actions), and skeleton loading rows that preserve column headers (`922cced`, `920b448`, `7793527`, `7447f12`)
- Grid/list view toggle using the `ToggleGroup` atom, wired into the toolbar behind a `hidden lg:flex` responsive gate (`a479799`, `1062f44`)
- `PlpTemplate` gained `listColumns`, `viewMode`, `onViewModeChange`, and `onItemClick` props; resolves effective view mode from consumer intent + availability + viewport without mutating consumer state on fallback (`4422048`)
- Storybook: `DiamondListView` with 6 list columns (carat, shape, color, clarity, origin, certificate) and `GemstoneListView` with 3 list columns, both starting in list view (`98accc3`)
- `PlpTemplate` COMPONENT.md bumped to `0.2.0` with the new props documented (`7931302`)

---

### PLP Template — Phase 1 (unstable 0.1.0)

Introduces the `Templates/` tier and ships the first page-level template: `PlpTemplate`. Full grid view with filter system, sorting, pagination, and responsive behaviour. Stateless — consumer owns filter state, sort, pagination, and data fetching. Rendered inside `AppShell`.

- Formalised `templates/` tier in CONTRIBUTING.md; added classification guidance and updated Storybook sidebar taxonomy to remove the "Phase C" qualifier on Templates (`870ad89`)
- PLP type system + filter registry with preset resolver (`resolveFilterControl`, `formatFilterChipValue`) and test coverage (`870ad89`, `b12acf0`)
- Four filter presets: boolean chip, single-select chips, multi-select chips, single-select dropdown — with `renderOption` escape hatch on `FilterOption` for rich per-option layouts (card-shaped cut selectors etc.) (`0ba88f5`)
- Grid item with 10 fixed sections, optional `lead` / `categorySlotTop` / `categorySlotBottom` slots, platform thumbnail actions (favorite/share/viewMedia), category-specific actions, and auto-rendered pricing variants (discount, per-carat, tariffs, legacy, multi-currency) driven by user context (`8a49307`)
- Toolbar (search + All Filters + quick filters + sort), All Filters drawer with result-count-aware footer, active filters strip with sticky behaviour and inline chip editing (`1f748b1`, `270d23e`, `622f23d`)
- Grid container (2/3/4 column responsive), skeleton loading, empty/error states, heading with breadcrumbs (`9b62fc6`, `0700cc7`, `a8a67fd`)
- `PlpTemplate` orchestrator wiring all sub-components, with pagination via the existing `Pagination` molecule (`186d9eb`, `1ddb192`)
- Storybook: isolated grid item variant playground (12 stories) under `Templates/PLP Grid Item` and full template stories (8 stories) inside `AppShell` under `Templates/PLP` (`2db11ae`, `910e7a2`)
- COMPONENT.md with full prop table, usage guidelines, and best practices (`e1aa4eb`)

---

### Atoms round 2: styling refresh, docs, stories, --ring retuned ([#120](https://github.com/free-agent83/clarity-v2/pull/120))

Refresh of six form/feedback atoms: upstream styling applied, docs and stories populated, `--ring` theme token retuned to the violet brand hue.

- Alert, Checkbox, RadioGroup, Slider, Switch, Textarea: upstream styling (size, colour, shadow, cursor) refreshed; `globals.css` `--ring` shifted from stone-neutral to violet brand hue (`1b6e84f`)
- Six atoms: argTypes, non-discoverable composition stories (icon/action Alert, horizontal RadioGroup, range/vertical Slider, settings-row Switch), play functions on every interactive component, full COMPONENT.md (props, usage, best practices, writing, quality checklist) (`d90fb27`, `530e9f8`, `ea51323`, `128f358`, `15972cd`, `fda69c3`)
- Checkbox and Switch: Rule 1 token-gap flags recorded — `rounded-[4px]` on Checkbox; `h-[14px]`, `w-[24px]`, `size-[18px]`, two `translate-x-[calc(…)]` on Switch. Canonical spacing-token equivalents identified for three of the Switch literals; fix deferred per flag-don't-fix policy (`530e9f8`, `15972cd`)
- Slider: `Snapping` story added showcasing step-based detents; iterated down to slider-only after UX review (`f536dad`, `611f721`, `b19a39b`)
- Input: `Invalid` story added with `aria-invalid` + associated `aria-describedby` error (`6a2e5ec`)

---

### AppShell organism and Brand foundation

Introduces `AppShell` (page-shell organism) and `Brand` (Nivoda wordmark atom), both shipped as `stable 0.0.1`.

- `AppShell`: four-region compound (header, nav sheet, main, root wrapper) with hardcoded brand region, search bar, and nav trigger — consumers compose only trailing actions and main content (`9942451`, `225d062`, `f53e382`)
- `Brand`: inline SVG wordmark with `fill="currentColor"`, resizable via `className`, four stories under `Foundations/Brand` (`047e771`)
- Search bar uses direct Tailwind palette (`bg-stone-50`) — flagged as Rule 1 token-gap, not fixed

---

### Breadcrumb separator is fixed by the design system

- `BreadcrumbSeparator` must be used as-is — removed `CustomSeparator` story and pruned orphaned `IconSlash` import; COMPONENT.md updated with explicit do/don't (`5066a5d`)

---

### Dropdown menu polish

- Switched destructive stories from faking `className` to using `variant="destructive"` so destructive CSS rules actually fire (`433dfb9`, `255e5be`)
- Aligned `py-3` across all interactive item types for uniform row heights; labels stay at `py-1.5` (`af6fb4e`)
- Fixed spinner icon reference (`835274c`)

---

### Badge is display-only

- Badge must never be used as a link or button — removed `AsLink` story, deprecated `asChild` prop, rewrote best practices (`fe48445`)

---

### Hover state polish on interactive atoms

- Fixed `Button.secondary` foreground from `text-primary-foreground` to `text-secondary-foreground` (`e3d1a4b`)
- Added consistent `hover:text-primary-hover` across `Button.outline`, `Button.link`, and `Toggle`; `Button.secondary` gets `hover:text-secondary-hover` backed by a new `--secondary-hover` theme token (`e3d1a4b`)
- `Toggle` gains `background` in its transition list for smooth hover animation (`e3d1a4b`)

---

### Popover/Sheet story cleanup

- Dropped per-instance `Input` height override in Popover story; added padding to Sheet form story (`e2d1c57`)

---

### Phase B conformance pass (14 components)

Promoted Separator, Skeleton, Label, Badge, Input, Toggle Group, Breadcrumb, Tooltip, Popover, Dropdown Menu, Select, Dialog, and Sheet to `stable` after a mechanical conformance pass.

- CONTRIBUTING.md: reworded Rule 1 (raw literals forbidden, `var(--token)` in arbitrary syntax allowed), added violation-handling policy, updated DoD for flagged violations, fixed sidebar taxonomy (`20c9be9`, `855641b`, `c8a4972`)
- 14 components: added named Props interfaces, JSDoc blocks, `tags: ["autodocs"]`, COMPONENT.md with full content sections, minimal play functions for interactive components (`a45ae70`, `e01784f`, `b502293`, `763adcb`, `cd5087b`, `b7d6784`, `1cde13e`, `d7a278e`, `8421476`, `24f9a8f`, `abf0881`, `c8402ff`, `dd9a787`, `261b27f`)
- Barrel exports uncommented for the batch (`66fc80c`)
- Post-verification test fixes: added `@storybook/test` to vitest optimizeDeps; switched portal-rendered play functions to `within(document.body)` (`2faad8f`)
- Removed DiamondCutSelector story from Toggle Group (`8a056f2`)
- Refs #58, #59, #60, #61, #62, #72, #73, #74, #75, #76, #77, #78, #82, #83

---

### Button conformance pass

Promoted Button to `stable 0.1.0` with loading prop, JSDoc blocks, and CONTRIBUTING.md revisions.

- New `loading` prop (prepends Spinner, forces disabled, sets `aria-busy`), `ButtonProps` interface extracted and type-exported, JSDoc blocks on all exports (`407032d`, `cf5da23`, `cac6678`, `fb9510a`)
- Indentation fix on destructive/success/link variants; removed dead `icon-lg` from argTypes (`905b110`, `1009125`)
- CONTRIBUTING.md: dropped `forwardRef`/`displayName` convention, relaxed minimum story set, genericized examples, removed stale testing-infrastructure section, removed Figma parity from DoD (`89f7932`, `6f0595d`)
- Button and variants exported from barrel; `@` alias added to `vite.config.ts` for library build (`cbaaaec`)
- `COMPONENT.md` fleshed out and promoted to stable (`d617de1`)

---

### Atomic folder structure and testing infrastructure

Reorganized all 50 components into atomic design folders, added testing infrastructure, and scaffolded per-component stories and docs.

- Removed 7 out-of-scope components (Native Select, Calendar, Context Menu, Menubar, Toast, Resizable) and orphaned deps; fixed dangling Button export (`15fa7b4`, `cff625d`)
- Added `@` path alias to Storybook vite config (`712136f`)
- Seeded atoms, molecules, organisms into `atoms/`, `molecules/`, `organisms/` folders; removed empty `ui/` directory (`ac8052a`, `32fa6fc`, `d69260f`)
- Pointed shadcn CLI alias at `atoms/` (`4835fc8`)
- Rewrote `src/index.ts` barrel as commented-out surface for controlled publishing (`bf05a97`)
- Added visible placeholder content to all Default stories; simplified Combobox story (`48cf42d`, `38228f0`)
- Pre-bundled React in vitest `optimizeDeps` to fix hook-call crashes (`ca54ae7`)
- Added CHANGELOG (`bf05a97`)

---

### Initial setup (pre-PR history)

Initial shadcn/ui scaffolding and theme setup before the organized PR workflow began.

- Added `components.json`, `globals.css`, `utils.ts`; scaffolded 55 components via `npx shadcn add` (`2d2b9dc`, `947f48d`)
- Annotated `globals.css` with comments (`e990801`)
- Reset to clean shadcn/ui theme starter (`7068ccb`)
- Removed pre-shadcn reference Button implementation (`6e42687`)
