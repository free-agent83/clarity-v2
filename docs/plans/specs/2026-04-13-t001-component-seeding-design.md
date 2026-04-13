---
title: T000-1 — Seed component library with base shadcn components
issue: https://github.com/free-agent83/clarity-v2/issues/103
branch: issue/t001
status: approved-for-planning
owner: João Gomes
date: 2026-04-13
---

# T000-1 — Component library seeding

## Purpose

Lay down the structural scaffolding for `packages/components/` so every future "build component X" ticket has a consistent folder, story, documentation, test, and CI target to drop into. This ticket is **setup only** — it does not build any component to spec, does not touch tokens, and does not modify shadcn source.

After this ticket lands, the package will have:

- All 50 in-scope components sitting in atomic-design folders (`atoms/`, `molecules/`, `organisms/`) with a per-component folder containing the implementation file, a minimal Storybook story, and a `COMPONENT.md` stub.
- A working Storybook + vitest test pipeline where every story counts as a render test, backed by `@storybook/addon-vitest` in headless Chromium.
- A commented-out barrel in `src/index.ts` — promoting a component to the public surface becomes a one-line uncomment.
- A CI workflow that runs story render tests and a Storybook build on every PR touching the package.
- A package-level `CHANGELOG.md` backfilling the last five commits and recording this ticket's changes.

## Acceptance criteria (from issue #103)

1. All components are in a `components/{atoms|molecules|organisms}/{component-name}` folder conforming to [packages/components/CONTRIBUTING.md](../../../packages/components/CONTRIBUTING.md).
2. All components appear in Storybook and have at least one story.
3. All components have a `COMPONENT.md` file in their directory with headings outlining the file structure only.
4. All components have at least one test on Storybook.
5. CI passes all components.

## Scope

### In scope

1. **Testing infrastructure setup** in `packages/components/`: install `vitest`, `@storybook/experimental-addon-test`, `@storybook/addon-a11y`, `@storybook/test`, `@vitest/browser`, `playwright`. Add `vitest.config.ts`. Update `.storybook/main.ts` addons array. Update `.storybook/preview.ts` with a global `a11y.test: "off"` parameter (violations surface in Storybook UI, do not fail CI). Add `test` and `test:storybook` scripts to `package.json`. (Addon name note: `@storybook/experimental-addon-test` is the correct package on Storybook 8.6.x; it was renamed to `@storybook/addon-vitest` in Storybook 9+.)
2. **Folder reorganisation**: move all 50 in-scope components from `src/components/ui/<name>.tsx` into `src/components/{atoms|molecules|organisms}/<name>/<name>.tsx`. Rewrite all cross-component imports from the old `@/components/ui/<x>` path to the new atomic path.
3. **Stories**: add a `<name>.stories.tsx` per component with one `Default` story, `tags: ["autodocs"]`, and a sidebar `title:` from CONTRIBUTING.md §"Sidebar taxonomy".
4. **COMPONENT.md stubs**: add one per component, with YAML frontmatter (`status: unstable`, `version: 0.0.0`, `lastUpdated: 2026-04-13`) and every section body set to `[WIP]`.
5. **`components.json`**: change `aliases.ui` from `@/components/ui` to `@/components/atoms` so future `npx shadcn add` lands in the "start as an atom" default folder.
6. **Remove the empty `src/components/ui/` directory** after the move.
7. **Rewrite `src/index.ts`** with commented-out barrel exports for all 50 components (grouped by layer). Promoting a component becomes uncommenting a line. `cn` and the stylesheet side-effect remain live.
8. **Delete 5 components**: `native-select`, `calendar`, `context-menu`, `menubar`, `resizable`. Remove the orphaned dependencies (`react-day-picker`, `date-fns`, `react-resizable-panels`) from `package.json`.
9. **New `.github/workflows/components.yml`**: CI runs `test:storybook` and `build-storybook` on any PR or push touching `packages/components/**`.
10. **New `packages/components/CHANGELOG.md`**: `Keep a Changelog` format, backfilling the five pre-history commits from `2d2b9dc` forward plus this ticket's `[Unreleased]` entry.

### Out of scope (explicit non-goals)

- **No component internals work.** No real props documentation, no variant CVA, no a11y audit, no writing guidance, no filled quality checklists. Every component ships as "unmodified shadcn default in a new folder".
- **No Button reference rebuild.** CONTRIBUTING.md §5 calls Button the "living reference", but the old reference was removed in `6e42687`. This ticket moves the current shadcn-default `button.tsx` like every other component. Rebuilding Button as the canonical reference is a future ticket.
- **No coupling to the tokens package.** Do not touch `src/styles/globals.css`. Do not import from `@nivoda/tokens` or `packages/tokens/` in any component, story, config, or test file. Do not add tokens-related dependencies to `package.json`. The tokens → theme → components flow described in CONTRIBUTING.md §"Token consumption rules" is a future ticket, not this one.
- **No shadcn source modifications.** Do not patch shadcn components to fix a11y violations or behavioural quirks. If something fails in testing, document it (see §"Failure handling policy" below).
- **No CONTRIBUTING.md or CLAUDE.md updates.** The existing docs stay as-is.
- **No resolution of the CONTRIBUTING.md §"shadcn CLI (open question)".** Updating `aliases.ui` biases toward CLI-compatibility but does not declare CLI vs manual as the chosen path.

## Design decisions

### D1 — Testing infrastructure is in scope for this ticket

AC #4 ("one test per component") and AC #5 ("CI passes all components") are meaningless without the test runner and CI workflow being present. Rather than deferring to a prerequisite ticket, this ticket installs the full CONTRIBUTING.md §"Setup: testing infrastructure" stack and wires up a new `.github/workflows/components.yml`. Every future component ticket then drops into a working pipeline.

### D2 — Story-as-test is the test

`@storybook/addon-vitest` automatically turns every story into a render test under `vitest run`. A story that mounts without throwing passes. No per-component `.test.tsx` file, no per-story `play` function placeholder — the story itself is the test artefact. This satisfies AC #4 without creating throwaway files that CONTRIBUTING.md §"Testing strategy" Layer 4 explicitly warns against ("Most atoms and simple molecules won't need standalone tests").

### D3 — Classification: propose-and-ratify in one pass

Per CONTRIBUTING.md §"Folder structure" ("when in doubt, start as an atom"): all 50 components get classified in one pass using the rules below, committed to the folder layout, and revised later if any prove wrong. The mapping is not sacred — it is a starting point.

**Classification rules:**

- **Atom** = renders a single interactive or display element; does not compose other components from this library; typically a single Radix leaf or primitive.
- **Molecule** = composes two or more atoms into a reusable unit with its own behaviour.
- **Organism** = page-level, dataset-oriented, or layout-shell composition.

Full table in §"Component mapping".

### D4 — Barrel surface is commented out; uncommenting publishes

Every one of the 50 components gets a commented-out line in `src/index.ts`, grouped by layer (Atoms / Molecules / Organisms). The barrel contract becomes: **uncommenting a line is how you publish a component.** This violates CONTRIBUTING.md §"Exports" strictly ("every stable component must be re-exported"), but only because this ticket seeds every component in one go — none are stable yet, so the strict interpretation would leave the barrel empty while 50 components sit in the package. The commented-out form preserves the discoverability ("everything that exists is listed") while keeping the public surface empty until individual build tickets promote each component.

### D5 — `components.json` biased to "start as an atom"

`aliases.ui` changes from `@/components/ui` to `@/components/atoms`. Future `npx shadcn add <component>` drops new components into `atoms/` by default, matching the "start as an atom, promote later" rule. This does not resolve the CONTRIBUTING.md §"shadcn CLI (open question)" — the CLI remains available but unblessed.

### D6 — Failure handling policy

If any failure is encountered during seeding (axe-core violation, render quirk, missing context, broken compound-component mounting), the fix is **documentation, not source modification**:

- **a11y violations** are surfaced by `@storybook/addon-a11y` in the Storybook dev UI but do not fail CI: the addon runs in `test: "off"` mode on Storybook 8.6.x (the addon's 8.6 API does not support `"todo"`; `"off"` is the default and is set explicitly to document intent). Violations are noted in the affected component's `COMPONENT.md` as an unchecked item in the Quality checklist (e.g. `- [ ] axe: 2 violations flagged, see follow-up ticket`).
- **Render quirks** where a component's `Default` story genuinely cannot mount (e.g. a Radix primitive that throws without required parent context) are handled by adding the smallest possible literal-children skeleton to the `Default` story. If even that is not possible, the story is excluded via `parameters.docs.disable` plus a `COMPONENT.md` note — never by patching the shadcn source.
- **Cross-component import breakage** from the move is a structural fix and is resolved in the usual way (rewrite the import path). Not a documentation case.

The rationale is scope discipline: this ticket is setup only. Fixing shadcn defaults belongs in per-component build tickets, where the component is being redesigned against the Clarity V2 foundation anyway.

## Component mapping

50 components total. Source: `src/components/ui/*.tsx` at commit `e990801`, minus the 5 deletions below.

### Atoms (32)

| File | Destination | Storybook title |
|---|---|---|
| `alert.tsx` | `atoms/alert/` | `Feedback/Alert` |
| `aspect-ratio.tsx` | `atoms/aspect-ratio/` | `Display/AspectRatio` |
| `avatar.tsx` | `atoms/avatar/` | `Display/Avatar` |
| `badge.tsx` | `atoms/badge/` | `Display/Badge` |
| `button.tsx` | `atoms/button/` | `Actions/Button` |
| `button-group.tsx` | `atoms/button-group/` | `Actions/ButtonGroup` |
| `checkbox.tsx` | `atoms/checkbox/` | `Forms/Checkbox` |
| `collapsible.tsx` | `atoms/collapsible/` | `Display/Collapsible` |
| `direction.tsx` | `atoms/direction/` | `Foundations/Direction` |
| `empty.tsx` | `atoms/empty/` | `Feedback/Empty` |
| `field.tsx` | `atoms/field/` | `Forms/Field` |
| `hover-card.tsx` | `atoms/hover-card/` | `Overlays/HoverCard` |
| `input.tsx` | `atoms/input/` | `Forms/Input` |
| `input-group.tsx` | `atoms/input-group/` | `Forms/InputGroup` |
| `input-otp.tsx` | `atoms/input-otp/` | `Forms/InputOTP` |
| `item.tsx` | `atoms/item/` | `Display/Item` |
| `kbd.tsx` | `atoms/kbd/` | `Display/Kbd` |
| `label.tsx` | `atoms/label/` | `Forms/Label` |
| `popover.tsx` | `atoms/popover/` | `Overlays/Popover` |
| `progress.tsx` | `atoms/progress/` | `Feedback/Progress` |
| `radio-group.tsx` | `atoms/radio-group/` | `Forms/RadioGroup` |
| `scroll-area.tsx` | `atoms/scroll-area/` | `Display/ScrollArea` |
| `separator.tsx` | `atoms/separator/` | `Display/Separator` |
| `skeleton.tsx` | `atoms/skeleton/` | `Feedback/Skeleton` |
| `slider.tsx` | `atoms/slider/` | `Forms/Slider` |
| `sonner.tsx` | `atoms/sonner/` | `Feedback/Sonner` |
| `spinner.tsx` | `atoms/spinner/` | `Feedback/Spinner` |
| `switch.tsx` | `atoms/switch/` | `Forms/Switch` |
| `textarea.tsx` | `atoms/textarea/` | `Forms/Textarea` |
| `toggle.tsx` | `atoms/toggle/` | `Forms/Toggle` |
| `toggle-group.tsx` | `atoms/toggle-group/` | `Forms/ToggleGroup` |
| `tooltip.tsx` | `atoms/tooltip/` | `Overlays/Tooltip` |

### Molecules (14)

| File | Destination | Storybook title |
|---|---|---|
| `accordion.tsx` | `molecules/accordion/` | `Navigation/Accordion` |
| `alert-dialog.tsx` | `molecules/alert-dialog/` | `Overlays/AlertDialog` |
| `breadcrumb.tsx` | `molecules/breadcrumb/` | `Navigation/Breadcrumb` |
| `card.tsx` | `molecules/card/` | `Display/Card` |
| `carousel.tsx` | `molecules/carousel/` | `Display/Carousel` |
| `combobox.tsx` | `molecules/combobox/` | `Forms/Combobox` |
| `command.tsx` | `molecules/command/` | `Actions/Command` |
| `dialog.tsx` | `molecules/dialog/` | `Overlays/Dialog` |
| `drawer.tsx` | `molecules/drawer/` | `Overlays/Drawer` |
| `dropdown-menu.tsx` | `molecules/dropdown-menu/` | `Actions/DropdownMenu` |
| `pagination.tsx` | `molecules/pagination/` | `Navigation/Pagination` |
| `select.tsx` | `molecules/select/` | `Forms/Select` |
| `sheet.tsx` | `molecules/sheet/` | `Overlays/Sheet` |
| `tabs.tsx` | `molecules/tabs/` | `Navigation/Tabs` |

### Organisms (4)

| File | Destination | Storybook title |
|---|---|---|
| `chart.tsx` | `organisms/chart/` | `Data/Chart` |
| `navigation-menu.tsx` | `organisms/navigation-menu/` | `Navigation/NavigationMenu` |
| `sidebar.tsx` | `organisms/sidebar/` | `Navigation/Sidebar` |
| `table.tsx` | `organisms/table/` | `Data/Table` |

### Deleted (5)

| File | Reason |
|---|---|
| `native-select.tsx` | Not part of intended Clarity V2 surface |
| `calendar.tsx` | Not part of intended Clarity V2 surface |
| `context-menu.tsx` | Not part of intended Clarity V2 surface |
| `menubar.tsx` | Not part of intended Clarity V2 surface |
| `resizable.tsx` | Not part of intended Clarity V2 surface |

**Orphaned dependencies removed from `packages/components/package.json`:**
- `react-day-picker` (Calendar only)
- `date-fns` (Calendar only)
- `react-resizable-panels` (Resizable only)

## File templates

### Component folder shape

Every component ends up with exactly three files. No per-component test file. Folder name is kebab-case and matches the component filename.

```
src/components/atoms/button/
├── button.tsx            ← moved verbatim from src/components/ui/button.tsx
├── button.stories.tsx    ← new, minimal Default story
└── COMPONENT.md          ← new, skeleton with [WIP] bodies
```

### `<name>.stories.tsx` template

Uniform for all 50 components:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { ComponentName } from "./component-name";

const meta: Meta<typeof ComponentName> = {
  title: "<Sidebar>/<ComponentName>",
  component: ComponentName,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

export const Default: Story = {};
```

One `Default` story, empty args, no mocks, no decorators, no play function. For components whose top-level export cannot mount with zero props (e.g. `Avatar` needs children, `Tabs` needs a structure), the story gets the minimum literal children needed to mount — nothing more. For compound components that export multiple names (e.g. `Card` also exports `CardHeader`, `CardContent`), the story imports the top-level name only; compound stories come in per-component build tickets.

### `COMPONENT.md` template

Uniform for all 50 components:

```md
---
name: ComponentName
slug: component-name
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
---

# ComponentName

[WIP]

## Props

[WIP]

## Usage guidelines

[WIP]

## Best practices

[WIP]

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values
```

- **No "Writing" section in the skeleton.** CONTRIBUTING.md §5 marks it optional and says to omit it when it does not apply. Default to omitted; per-component tickets add it where relevant.
- **`version: 0.0.0`** because none of these have been built to spec yet. Bumping to `0.1.0` happens when a component reaches its first real build.
- **Quality checklist is literal from CONTRIBUTING.md §6, unchecked.** It is a live checklist the future build ticket fills in.

### `src/index.ts` template

```ts
import "./styles/globals.css";

export { cn } from "./lib/utils";

// Commented-out barrel for unstable components.
// Uncomment a line to publish that component as part of the package surface.
// See packages/components/CONTRIBUTING.md §Exports.

// Atoms
// export { Alert, AlertTitle, AlertDescription } from "./components/atoms/alert/alert";
// export { AspectRatio } from "./components/atoms/aspect-ratio/aspect-ratio";
// export { Avatar, AvatarImage, AvatarFallback } from "./components/atoms/avatar/avatar";
// ... (one line per atom)

// Molecules
// export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./components/molecules/accordion/accordion";
// ... (one line per molecule)

// Organisms
// export { Chart, ChartContainer, ... } from "./components/organisms/chart/chart";
// ... (one line per organism)
```

Implementation rule: each commented line lists the **actual** named exports from that component's source file. The author must read each file's exports rather than guess. Type-only exports (`export type { ... }`) get their own commented line beneath each component export line.

## Testing infrastructure

### Dependencies

Add to `devDependencies` in `packages/components/package.json`:

- `vitest@^3`
- `@storybook/experimental-addon-test@8.6.18`
- `@storybook/addon-a11y@8.6.18`
- `@storybook/test@8.6.18`
- `@vitest/browser@^3`
- `playwright@^1`

Versions pinned against Storybook `8.6.18` (the line already in the package). `@storybook/experimental-addon-test@8.6.18` declares peer deps `vitest@^2.1.1 || ^3.0.0`, `@vitest/browser@^2.1.1 || ^3.0.0` — we take vitest 3.x for the current major.

### `vitest.config.ts`

New file at `packages/components/vitest.config.ts`. One "storybook" project that uses `@storybook/experimental-addon-test/vitest-plugin` to discover every `*.stories.tsx` and turn each story into a render test. Browser mode enabled, headless, Chromium via Playwright. No other projects, no other test patterns — this is the only test surface.

### `.storybook/main.ts` update

Add `"@storybook/addon-a11y"` and `"@storybook/experimental-addon-test"` to the `addons` array. The stories glob (`../src/**/*.stories.@(ts|tsx)`) is unchanged and already picks up the new folder layout.

### `.storybook/preview.ts` update

Add a global `a11y` parameter with `test: "off"` — violations surface in the Storybook dev UI but do not fail `vitest run`. The existing `controls` parameters stay as-is.

```ts
const preview: Preview = {
  parameters: {
    controls: { /* existing */ },
    a11y: { test: "off" },
  },
};
```

### `package.json` scripts

```json
{
  "test": "vitest run",
  "test:storybook": "vitest run --project=storybook"
}
```

Both resolve to the same thing for now (only one project), but the named script matches CONTRIBUTING.md §"Running tests" exactly.

### No test helpers

No `setupTests.ts`, no `@testing-library/react`. Browser mode runs stories in a real (headless) browser, so a JSDOM bridge is not needed.

## CI workflow

New file at `.github/workflows/components.yml`, mirroring `.github/workflows/tokens.yml`:

```yaml
name: components

on:
  pull_request:
    branches: [main, dev]
    paths:
      - "packages/components/**"
      - "package.json"
      - "package-lock.json"
      - ".github/workflows/components.yml"
  push:
    branches: [main, dev]
    paths:
      - "packages/components/**"
      - "package.json"
      - "package-lock.json"
      - ".github/workflows/components.yml"

jobs:
  test:
    name: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
        working-directory: packages/components

      - name: Run tests
        run: npm run test:storybook --workspace=@nivoda/components

      - name: Verify Storybook build
        run: npm run build-storybook --workspace=@nivoda/components
```

Two sources of signal in one job: story render tests (via `test:storybook`, which runs addon-vitest in headless Chromium) and a clean Storybook build. Failure in either fails CI. Playwright browser install is explicit because `@vitest/browser` needs Chromium present — caching is a future optimisation.

## CHANGELOG

New file at `packages/components/CHANGELOG.md`, `Keep a Changelog` format.

```md
# Changelog

All notable changes to `@nivoda/components` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Atomic design folder structure (`atoms/`, `molecules/`, `organisms/`) per CONTRIBUTING.md §"Folder structure". All 50 components moved into `components/<layer>/<name>/` folders with per-component Storybook story and `COMPONENT.md` stub.
- One base Storybook story (`Default`) per component, with sidebar category from CONTRIBUTING.md §"Sidebar taxonomy".
- `COMPONENT.md` skeleton per component with frontmatter (`status: unstable`, `version: 0.0.0`) and `[WIP]` section bodies.
- Testing infrastructure: `vitest@^3`, `@storybook/experimental-addon-test@8.6.18`, `@storybook/addon-a11y@8.6.18`, `@storybook/test@8.6.18`, `@vitest/browser@^3`, `playwright@^1`. `vitest.config.ts` runs every story as a render test via the experimental-addon-test vitest plugin in headless Chromium. `test` and `test:storybook` scripts added.
- `@storybook/addon-a11y` runs in `test: "off"` mode (the SB 8.6.x default, set explicitly) — unaudited shadcn defaults may have violations; these surface in the Storybook dev UI but do not fail CI, and will be documented in each affected component's `COMPONENT.md` rather than fixed (deferred to per-component build tickets).
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
```

## Implementation sequence

Order matters so CI can go green at the end with no broken intermediate commits.

1. **Infra first.** Install deps, add `vitest.config.ts`, update `.storybook/main.ts`, add `.storybook/preview.ts`, add scripts to `package.json`. Verify: `npx storybook dev` still boots, `npm run test:storybook` runs and passes trivially (zero stories).
2. **Delete the 5 removed components** from `src/components/ui/` and drop the orphaned deps from `package.json`. Run `npm install`. Verify: `npx storybook build` still succeeds.
3. **Move components in layer order** — atoms → molecules → organisms. For each component in each layer: create folder, move `.tsx`, write `<name>.stories.tsx`, write `COMPONENT.md`. Do all components in one layer before moving to the next. Rewrite any cross-component imports as they surface (grep for `@/components/ui/<moved-name>` after each layer). Verify after each layer: `npx tsc --noEmit` clean, `npx storybook build` still green, `npm run test:storybook` passes with the story count growing.
4. **Delete the now-empty `src/components/ui/` folder.**
5. **Update `components.json`** (`aliases.ui` → `@/components/atoms`).
6. **Rewrite `src/index.ts`** with the full commented barrel. Read each component file to get the real export list; do not guess.
7. **Write `CHANGELOG.md`.**
8. **Add `.github/workflows/components.yml`.**
9. **Final local verification pass** (see below).

### Final verification

All must pass before the PR opens:

```bash
cd packages/components
npm run test:storybook           # every story renders; addon-a11y warn-only
npm run build-storybook          # full Storybook build succeeds
npx tsc --noEmit                 # types compile
cd ../..
npx nx build components          # nx pipeline still builds the package
```

## Risks

- **Compound-component Default stories.** Radix-based compounds (`Sidebar`, `NavigationMenu`, `Command`, `DropdownMenu`) need more than `<Component />` to mount. Handled case-by-case with the smallest mounting skeleton. If any component genuinely cannot Default-render without meaningful composition, the story is excluded via `parameters.docs.disable` and noted in `COMPONENT.md` — never by patching shadcn source.
- **Broken cross-component imports mid-move.** Any component that imports another (`sidebar` → `sheet`, etc.) has to be rewritten from `@/components/ui/<x>` to the new atomic path. Mitigated by rewriting per layer and running `tsc --noEmit` between layers rather than only at the end.
- **Playwright CI cost.** `npx playwright install --with-deps chromium` adds ~30-60s to CI. Acceptable for Phase B. Caching is a later optimisation.
- **Storybook 8.6.x addon version alignment.** `@storybook/addon-vitest` and `@storybook/addon-a11y` must match the SB 8.6.18 major. Verified at implementation time by checking npm dist-tags against the installed Storybook version before pinning.

## Guardrails — what NOT to do in this ticket

- Do not rewrite any component internals.
- Do not change `globals.css` or introduce any tokens-package coupling.
- Do not add real props docs, variant CVAs, writing guidance, or fill in any quality checklists.
- Do not patch shadcn source to fix a11y or behavioural issues — document instead.
- Do not touch `CONTRIBUTING.md` or `CLAUDE.md`.
- Do not resolve the CONTRIBUTING.md §"shadcn CLI (open question)" — updating `aliases.ui` biases toward CLI-compat but does not declare CLI vs manual.
