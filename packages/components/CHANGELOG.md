# Changelog — @nivoda/components

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
