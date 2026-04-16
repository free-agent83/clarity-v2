# Changelog — @nivoda/components

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
