# T000-1 Component Seeding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lay down the structural scaffolding for `packages/components/` — 50 components in atomic folders with stubbed stories and `COMPONENT.md`, a working Storybook+vitest test pipeline, a CI workflow, and a backfilled CHANGELOG — without touching any component internals, the tokens package, or `globals.css`.

**Architecture:** Setup-only ticket. Per-component folder shape from [CONTRIBUTING.md](../../packages/components/CONTRIBUTING.md) §"Folder structure". Story-per-component with `tags: ["autodocs"]` satisfies "one test per component" via `@storybook/experimental-addon-test`'s auto-render-test behaviour in headless Chromium. Commented-out barrel in `src/index.ts` — uncommenting publishes a component. New `.github/workflows/components.yml` runs `test:storybook` + `build-storybook`.

**Tech Stack:** Storybook 8.6.18, `@storybook/experimental-addon-test@8.6.18`, `@storybook/addon-a11y@8.6.18`, `vitest@^3`, `@vitest/browser@^3`, `playwright@^1`, existing shadcn/ui components, Tailwind v4, TypeScript 5.9.

**Spec:** [docs/plans/specs/2026-04-13-t001-component-seeding-design.md](specs/2026-04-13-t001-component-seeding-design.md)

**Issue:** https://github.com/free-agent83/clarity-v2/issues/103

**Branch:** `issue/t001`

---

## File structure

Files created or modified by this plan. Everything is inside `packages/components/` unless noted.

**New files (infra):**
- `packages/components/vitest.config.ts` — vitest project for Storybook stories
- `packages/components/.storybook/vitest.setup.ts` — applies the Storybook preview annotations to the vitest test environment
- `packages/components/CHANGELOG.md` — Keep-a-Changelog-formatted
- `.github/workflows/components.yml` — CI

**Modified files (infra):**
- `packages/components/package.json` — new devDeps + scripts; remove orphaned runtime deps
- `packages/components/.storybook/main.ts` — new addons
- `packages/components/.storybook/preview.ts` — add `a11y: { test: "off" }`
- `packages/components/components.json` — `aliases.ui` → `@/components/atoms`
- `packages/components/src/index.ts` — commented-out barrel for all 50 components

**New files (per component, 50 components × 2 files = 100):**
- `packages/components/src/components/{layer}/{name}/{name}.stories.tsx`
- `packages/components/src/components/{layer}/{name}/COMPONENT.md`

**Moved files (50):**
- `packages/components/src/components/ui/{name}.tsx` → `packages/components/src/components/{layer}/{name}/{name}.tsx`

**Deleted files:**
- `packages/components/src/components/ui/native-select.tsx`
- `packages/components/src/components/ui/calendar.tsx`
- `packages/components/src/components/ui/context-menu.tsx`
- `packages/components/src/components/ui/menubar.tsx`
- `packages/components/src/components/ui/resizable.tsx`
- `packages/components/src/components/ui/` (the now-empty directory)

---

## Task 1: Testing infrastructure setup

**Files:**
- Modify: `packages/components/package.json`
- Create: `packages/components/vitest.config.ts`
- Create: `packages/components/.storybook/vitest.setup.ts`
- Modify: `packages/components/.storybook/main.ts`
- Modify: `packages/components/.storybook/preview.ts`

### Step 1.1: Install test infra dependencies

- [ ] Run from the repo root (so the workspace root `package-lock.json` updates correctly):

```bash
npm install --workspace=@nivoda/components --save-dev \
  vitest@^3 \
  @vitest/browser@^3 \
  @storybook/experimental-addon-test@8.6.18 \
  @storybook/addon-a11y@8.6.18 \
  @storybook/test@8.6.18 \
  playwright@^1
```

Expected: install succeeds, `packages/components/package.json` has all six entries under `devDependencies`, `package-lock.json` is updated at repo root.

**Why `@storybook/experimental-addon-test` and not `@storybook/addon-vitest`:** On Storybook 8.6.x the addon is published as `@storybook/experimental-addon-test`. It was renamed to `@storybook/addon-vitest` in Storybook 9+. `npm view @storybook/addon-vitest` only resolves to 10.4.x alphas — not compatible with our 8.6 line.

### Step 1.2: Install Playwright Chromium browser locally

- [ ] Run from repo root:

```bash
npx playwright install chromium
```

Expected: headless Chromium downloaded. Needed because `@vitest/browser` uses Playwright as its browser provider. CI installs it separately via the workflow.

### Step 1.3: Create `packages/components/.storybook/vitest.setup.ts`

- [ ] Create file with this exact content:

```ts
import { beforeAll } from "vitest";
import { setProjectAnnotations } from "@storybook/react";
import * as previewAnnotations from "./preview";

const project = setProjectAnnotations([previewAnnotations]);

beforeAll(project.beforeAll);
```

**Why:** `@storybook/experimental-addon-test`'s vitest plugin needs the Storybook preview annotations applied to the test environment so every story runs under the same decorators/parameters as in the Storybook UI. This file is the standard integration point documented in the addon's README.

### Step 1.4: Create `packages/components/vitest.config.ts`

- [ ] Create file with this exact content:

```ts
import { defineConfig } from "vitest/config";
import { storybookTest } from "@storybook/experimental-addon-test/vitest-plugin";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const dir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [
          storybookTest({
            configDir: resolve(dir, ".storybook"),
            storybookScript: "npm run storybook -- --ci",
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            provider: "playwright",
            headless: true,
            instances: [{ browser: "chromium" }],
          },
          setupFiles: [resolve(dir, ".storybook/vitest.setup.ts")],
        },
      },
    ],
  },
});
```

**Why each piece:**
- `storybookTest({ configDir })` tells the plugin where to find the Storybook config so it can discover stories and apply preview annotations.
- `browser.enabled: true` + `provider: "playwright"` + `instances: [{ browser: "chromium" }]` runs the tests in a real headless Chromium via Playwright. This is the form `@vitest/browser@3` expects.
- `setupFiles` loads the vitest.setup.ts from step 1.3.
- `storybookScript` is optional but documents how a dev would launch Storybook alongside the tests if they want to watch.

### Step 1.5: Update `.storybook/main.ts`

- [ ] Modify `packages/components/.storybook/main.ts` to add the two new addons:

```ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    "@storybook/experimental-addon-test",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: async (config) => {
    const tailwindcss = await import("@tailwindcss/vite");
    config.plugins = config.plugins || [];
    config.plugins.push(tailwindcss.default());
    return config;
  },
};

export default config;
```

**Why:** stories glob is unchanged — it already covers the future `atoms|molecules|organisms/` paths via `**`. Only the addons array grows.

### Step 1.6: Update `.storybook/preview.ts`

- [ ] Modify `packages/components/.storybook/preview.ts` to add the explicit `a11y.test: "off"` parameter. The existing `controls` parameter stays:

```ts
import type { Preview } from "@storybook/react";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // "off" is the default on @storybook/addon-a11y@8.6.x — set explicitly
      // to document intent: violations appear in the Storybook dev UI but do
      // not fail vitest runs. Per-component audits and fixes are deferred to
      // per-component build tickets.
      test: "off",
    },
  },
};

export default preview;
```

### Step 1.7: Add test scripts to `package.json`

- [ ] Modify `packages/components/package.json` — add two scripts to the `scripts` object:

```json
"scripts": {
  "storybook": "storybook dev -p 6006",
  "build-storybook": "storybook build",
  "test": "vitest run",
  "test:storybook": "vitest run --project=storybook"
}
```

### Step 1.8: Verify infra by running the empty test suite

- [ ] Run from the repo root:

```bash
npm run test:storybook --workspace=@nivoda/components
```

Expected: vitest boots, the storybook project runs, 0 test files are discovered (no stories yet exist outside `ui/`), exits 0. If any error about missing browser, re-run step 1.2.

- [ ] Verify Storybook still builds:

```bash
npm run build-storybook --workspace=@nivoda/components
```

Expected: build completes successfully with the current `ui/` components still picked up (Storybook's sidebar title for these will be default paths, that's fine — we're not touching their stories here because they don't have any yet). If `build-storybook` fails due to addon version mismatch, re-check the installed versions match the SB 8.6.18 line exactly.

### Step 1.9: Commit

- [ ] Run from repo root:

```bash
git add packages/components/package.json \
        packages/components/vitest.config.ts \
        packages/components/.storybook/main.ts \
        packages/components/.storybook/preview.ts \
        packages/components/.storybook/vitest.setup.ts \
        package.json package-lock.json
git commit -m "$(cat <<'EOF'
chore(components): add Storybook+vitest testing infrastructure

Installs @storybook/experimental-addon-test, @storybook/addon-a11y, vitest,
@vitest/browser, playwright. Adds vitest.config.ts (storybook project,
headless Chromium via Playwright), vitest.setup.ts for preview annotations,
and the addon-a11y warn-only mode. Empty test suite passes.

Part of T000-1.
EOF
)"
```

---

## Task 2: Delete removed components and orphaned dependencies

**Files:**
- Delete: `packages/components/src/components/ui/native-select.tsx`
- Delete: `packages/components/src/components/ui/calendar.tsx`
- Delete: `packages/components/src/components/ui/context-menu.tsx`
- Delete: `packages/components/src/components/ui/menubar.tsx`
- Delete: `packages/components/src/components/ui/resizable.tsx`
- Modify: `packages/components/package.json`

### Step 2.1: Delete the 5 component files

- [ ] Run from repo root:

```bash
git rm packages/components/src/components/ui/native-select.tsx
git rm packages/components/src/components/ui/calendar.tsx
git rm packages/components/src/components/ui/context-menu.tsx
git rm packages/components/src/components/ui/menubar.tsx
git rm packages/components/src/components/ui/resizable.tsx
```

Expected: all five removals staged.

### Step 2.2: Remove orphaned dependencies from `package.json`

- [ ] Modify `packages/components/package.json` — delete these three lines from `dependencies`:

```
"react-day-picker": "^9.14.0",
"date-fns": "^4.1.0",
"react-resizable-panels": "^4.10.0",
```

Double-check no other file imports from these packages:

```bash
grep -r "react-day-picker\|date-fns\|react-resizable-panels" packages/components/src/ || echo "clean"
```

Expected output: `clean`. (If anything matches, stop and investigate — something outside `calendar.tsx` / `resizable.tsx` depends on these, and the spec's "no cross-references" check missed it.)

### Step 2.3: Reinstall to prune the lockfile

- [ ] Run from repo root:

```bash
npm install
```

Expected: `package-lock.json` updates to drop the three orphaned packages and their transitive deps.

### Step 2.4: Verify the package still builds

- [ ] Run from repo root:

```bash
npm run build-storybook --workspace=@nivoda/components
```

Expected: Storybook build succeeds with the 50 remaining `ui/` components.

- [ ] Run:

```bash
cd packages/components && npx tsc --noEmit
```

Expected: no type errors. (If one surfaces, it means something we kept was importing from one of the deleted files — grep for it and fix.)

### Step 2.5: Commit

- [ ] From repo root:

```bash
git add packages/components/package.json package-lock.json
git commit -m "$(cat <<'EOF'
chore(components): remove out-of-scope components and orphaned deps

Deletes native-select, calendar, context-menu, menubar, resizable from
src/components/ui/. Drops orphaned runtime dependencies react-day-picker,
date-fns (Calendar-only) and react-resizable-panels (Resizable-only).

Part of T000-1.
EOF
)"
```

---

## Task 3: Move atoms (32 components)

**Files (per component, × 32):**
- Move: `packages/components/src/components/ui/{name}.tsx` → `packages/components/src/components/atoms/{name}/{name}.tsx`
- Create: `packages/components/src/components/atoms/{name}/{name}.stories.tsx`
- Create: `packages/components/src/components/atoms/{name}/COMPONENT.md`

**Atoms manifest** — `kebab-name | PascalImport | Storybook title` (PascalImport is the primary export that the Default story imports):

```
alert           | Alert            | Feedback/Alert
aspect-ratio    | AspectRatio      | Display/AspectRatio
avatar          | Avatar           | Display/Avatar
badge           | Badge            | Display/Badge
button          | Button           | Actions/Button
button-group    | ButtonGroup      | Actions/ButtonGroup
checkbox        | Checkbox         | Forms/Checkbox
collapsible     | Collapsible      | Display/Collapsible
direction       | DirectionProvider| Foundations/Direction
empty           | Empty            | Feedback/Empty
field           | Field            | Forms/Field
hover-card      | HoverCard        | Overlays/HoverCard
input           | Input            | Forms/Input
input-group     | InputGroup       | Forms/InputGroup
input-otp       | InputOTP         | Forms/InputOTP
item            | Item             | Display/Item
kbd             | Kbd              | Display/Kbd
label           | Label            | Forms/Label
popover         | Popover          | Overlays/Popover
progress        | Progress         | Feedback/Progress
radio-group     | RadioGroup       | Forms/RadioGroup
scroll-area     | ScrollArea       | Display/ScrollArea
separator       | Separator        | Display/Separator
skeleton        | Skeleton         | Feedback/Skeleton
slider          | Slider           | Forms/Slider
sonner          | Toaster          | Feedback/Sonner
spinner         | Spinner          | Feedback/Spinner
switch          | Switch           | Forms/Switch
textarea        | Textarea         | Forms/Textarea
toggle          | Toggle           | Forms/Toggle
toggle-group    | ToggleGroup      | Forms/ToggleGroup
tooltip         | Tooltip          | Overlays/Tooltip
```

**Templates** (same for all 32 — substitute `{PascalImport}`, `{kebab-name}`, `{Sidebar/Title}`):

**`<name>.stories.tsx`:**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { {PascalImport} } from "./{kebab-name}";

const meta: Meta<typeof {PascalImport}> = {
  title: "{Sidebar/Title}",
  component: {PascalImport},
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof {PascalImport}>;

export const Default: Story = {};
```

**`COMPONENT.md`:**

```md
---
name: {PascalImport}
slug: {kebab-name}
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
---

# {PascalImport}

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

### Step 3.1: Execute the atom move script

- [ ] Save the manifest to a temp file and run the migration script. From repo root:

```bash
cat > /tmp/t001-atoms.tsv <<'EOF'
alert	Alert	Feedback/Alert
aspect-ratio	AspectRatio	Display/AspectRatio
avatar	Avatar	Display/Avatar
badge	Badge	Display/Badge
button	Button	Actions/Button
button-group	ButtonGroup	Actions/ButtonGroup
checkbox	Checkbox	Forms/Checkbox
collapsible	Collapsible	Display/Collapsible
direction	DirectionProvider	Foundations/Direction
empty	Empty	Feedback/Empty
field	Field	Forms/Field
hover-card	HoverCard	Overlays/HoverCard
input	Input	Forms/Input
input-group	InputGroup	Forms/InputGroup
input-otp	InputOTP	Forms/InputOTP
item	Item	Display/Item
kbd	Kbd	Display/Kbd
label	Label	Forms/Label
popover	Popover	Overlays/Popover
progress	Progress	Feedback/Progress
radio-group	RadioGroup	Forms/RadioGroup
scroll-area	ScrollArea	Display/ScrollArea
separator	Separator	Display/Separator
skeleton	Skeleton	Feedback/Skeleton
slider	Slider	Forms/Slider
sonner	Toaster	Feedback/Sonner
spinner	Spinner	Feedback/Spinner
switch	Switch	Forms/Switch
textarea	Textarea	Forms/Textarea
toggle	Toggle	Forms/Toggle
toggle-group	ToggleGroup	Forms/ToggleGroup
tooltip	Tooltip	Overlays/Tooltip
EOF

LAYER=atoms
while IFS=$'\t' read -r kebab pascal sidebar; do
  dir="packages/components/src/components/${LAYER}/${kebab}"
  mkdir -p "$dir"
  git mv "packages/components/src/components/ui/${kebab}.tsx" "${dir}/${kebab}.tsx"

  cat > "${dir}/${kebab}.stories.tsx" <<STORY
import type { Meta, StoryObj } from "@storybook/react";
import { ${pascal} } from "./${kebab}";

const meta: Meta<typeof ${pascal}> = {
  title: "${sidebar}",
  component: ${pascal},
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ${pascal}>;

export const Default: Story = {};
STORY

  cat > "${dir}/COMPONENT.md" <<'MDEOF'
---
name: __PASCAL__
slug: __KEBAB__
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
---

# __PASCAL__

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
MDEOF

  # substitute placeholders in the heredoc'd file
  sed -i '' "s/__PASCAL__/${pascal}/g; s/__KEBAB__/${kebab}/g" "${dir}/COMPONENT.md"
done < /tmp/t001-atoms.tsv

rm /tmp/t001-atoms.tsv
```

Expected: 32 folders created under `atoms/`, each containing `{kebab}.tsx`, `{kebab}.stories.tsx`, and `COMPONENT.md`. `git status` shows 32 renames and 64 new files. The `ui/` folder now has 18 files remaining (14 molecules + 4 organisms).

Note the `sed -i ''` form — that's macOS BSD sed. On Linux (CI executor), use `sed -i` without the empty-string arg. The executor runs on macOS per the project environment.

### Step 3.2: Rewrite cross-component imports that now point to moved atoms

After the move, any file still referencing `@/components/ui/{atom-name}` needs its import rewritten to `@/components/atoms/{atom-name}/{atom-name}`. The atoms that have incoming imports from other files are:

- `button` — imported by: `alert-dialog`, `carousel`, `combobox`, `dialog`, `input-group`, `pagination`, `sheet`, `sidebar` (and internally by `button-group` itself? no — `button-group` imports `separator`)
- `input` — imported by: `input-group`, `sidebar`
- `textarea` — imported by: `input-group`
- `label` — imported by: `field`
- `separator` — imported by: `button-group`, `field`, `item`, `sidebar`
- `toggle` — imported by: `toggle-group` (and `toggleVariants`)
- `skeleton` — imported by: `sidebar`
- `tooltip` — imported by: `sidebar`
- `input-group` — imported by: `combobox`, `command`

- [ ] Run from repo root (a single `sed` pass per atom name, across all remaining `.tsx` files in `src/components/`):

```bash
cd packages/components

ATOMS=(alert aspect-ratio avatar badge button button-group checkbox collapsible direction empty field hover-card input input-group input-otp item kbd label popover progress radio-group scroll-area separator skeleton slider sonner spinner switch textarea toggle toggle-group tooltip)

for atom in "${ATOMS[@]}"; do
  # Find any .tsx under src/components/ that still has an import from @/components/ui/${atom}
  # and rewrite it to @/components/atoms/${atom}/${atom}
  find src/components -name '*.tsx' -type f -print0 \
    | xargs -0 sed -i '' "s|@/components/ui/${atom}|@/components/atoms/${atom}/${atom}|g"
done

cd ../..
```

**Why this sed form is safe:** Each atom name is a complete path segment and can't be a prefix of another atom name in our list (double-check: `input` is a prefix of `input-group` and `input-otp` — this matters!). The replacement pattern includes `/` before the name via `@/components/ui/`, but we're looking at `ui/input`, `ui/input-group`, `ui/input-otp`. If we sed `@/components/ui/input` → `@/components/atoms/input/input`, the line `ui/input-group` would become `atoms/input/input-group` which is wrong.

- [ ] **Use a safer version that anchors the replacement to the end of an import path** (closing quote or end of path):

```bash
cd packages/components

ATOMS=(alert aspect-ratio avatar badge button button-group checkbox collapsible direction empty field hover-card input input-group input-otp item kbd label popover progress radio-group scroll-area separator skeleton slider sonner spinner switch textarea toggle toggle-group tooltip)

# Sort by length descending so "input-group" and "input-otp" are replaced before "input"
SORTED=$(printf '%s\n' "${ATOMS[@]}" | awk '{ print length, $0 }' | sort -rn | cut -d' ' -f2-)

for atom in $SORTED; do
  find src/components -name '*.tsx' -type f -print0 \
    | xargs -0 sed -i '' "s|@/components/ui/${atom}\\([\"']\\)|@/components/atoms/${atom}/${atom}\\1|g"
done

cd ../..
```

The trailing `\([\"']\)` anchors the match to a closing quote (`"` or `'`), which is what every import path ends with. Longer names are processed first so `input-group` and `input-otp` don't get clobbered by the shorter `input`.

- [ ] Verify zero remaining `@/components/ui/{atom}` references:

```bash
cd packages/components && grep -rn "@/components/ui/" src/components/{atoms,ui} | \
  grep -vE "@/components/ui/(accordion|alert-dialog|breadcrumb|card|carousel|combobox|command|dialog|drawer|dropdown-menu|pagination|select|sheet|tabs|chart|navigation-menu|sidebar|table)\"" || echo "no unexpected atom references"
cd ../..
```

Expected: `no unexpected atom references`. Any remaining `@/components/ui/` references should only be to molecules or organisms that haven't moved yet — those get handled in Tasks 4 and 5.

### Step 3.3: Verify the atoms layer

- [ ] Run from repo root:

```bash
cd packages/components && npx tsc --noEmit && cd ../..
```

Expected: 0 type errors.

- [ ] Run:

```bash
npm run build-storybook --workspace=@nivoda/components
```

Expected: Storybook build succeeds. 32 new stories should be visible in the sidebar under their atomic categories (you can open the built `storybook-static/index.html` to confirm if debugging).

- [ ] Run:

```bash
npm run test:storybook --workspace=@nivoda/components
```

Expected: 32 story render tests pass.

**Compound-component rendering hazards.** Some atoms cannot mount with `<Component />` (zero props / zero children):

- `HoverCard`, `Popover`, `Tooltip`, `Collapsible` — Radix primitives that expect a `Trigger` + `Content` compound. Empty mount will likely throw "must contain at least one child" or similar.
- `RadioGroup`, `ToggleGroup` — expect items inside.
- `InputOTP` — expects `maxLength` and slot structure.
- `DirectionProvider` — provider pattern, needs `children` and `dir`.
- `Field`, `InputGroup`, `ButtonGroup`, `Item`, `Empty` — shadcn's new layout components that wrap children.

If any story fails to mount, add the **minimum** literal children/props that make it render and nothing more. Example for Tooltip:

```tsx
export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>Hover me</TooltipTrigger>
      <TooltipContent>Tooltip content</TooltipContent>
    </Tooltip>
  ),
};
```

Import the compound sub-names at the top of the story file alongside the primary import. Keep the skeleton tight — one literal trigger, one literal content, no decorators, no args.

If even a skeleton cannot make the story render (e.g. Radix primitive throws for a reason that would require real state), disable the story with `parameters.docs.disable: true` and `parameters.test: { skip: true }`, and note the reason in that component's `COMPONENT.md` Quality checklist as an unchecked item. Do NOT patch shadcn source.

### Step 3.4: Commit

- [ ] From repo root:

```bash
git add packages/components/src/components/
git commit -m "$(cat <<'EOF'
feat(components): seed atoms into atomic folder structure

Moves 32 components from src/components/ui/ to
src/components/atoms/{name}/. Each folder gets a minimal Default
story and a COMPONENT.md stub with [WIP] sections.

Rewrites cross-component imports (button, input, input-group,
separator, label, textarea, toggle, skeleton, tooltip) from the
old ui/ path to the new atoms/ path.

Part of T000-1.
EOF
)"
```

---

## Task 4: Move molecules (14 components)

**Molecules manifest:**

```
accordion       | Accordion    | Navigation/Accordion
alert-dialog    | AlertDialog  | Overlays/AlertDialog
breadcrumb      | Breadcrumb   | Navigation/Breadcrumb
card            | Card         | Display/Card
carousel        | Carousel     | Display/Carousel
combobox        | Combobox     | Forms/Combobox
command         | Command      | Actions/Command
dialog          | Dialog       | Overlays/Dialog
drawer          | Drawer       | Overlays/Drawer
dropdown-menu   | DropdownMenu | Actions/DropdownMenu
pagination      | Pagination   | Navigation/Pagination
select          | Select       | Forms/Select
sheet           | Sheet        | Overlays/Sheet
tabs            | Tabs         | Navigation/Tabs
```

### Step 4.1: Execute the molecule move script

- [ ] Run from repo root (same pattern as Task 3, swap manifest + LAYER):

```bash
cat > /tmp/t001-molecules.tsv <<'EOF'
accordion	Accordion	Navigation/Accordion
alert-dialog	AlertDialog	Overlays/AlertDialog
breadcrumb	Breadcrumb	Navigation/Breadcrumb
card	Card	Display/Card
carousel	Carousel	Display/Carousel
combobox	Combobox	Forms/Combobox
command	Command	Actions/Command
dialog	Dialog	Overlays/Dialog
drawer	Drawer	Overlays/Drawer
dropdown-menu	DropdownMenu	Actions/DropdownMenu
pagination	Pagination	Navigation/Pagination
select	Select	Forms/Select
sheet	Sheet	Overlays/Sheet
tabs	Tabs	Navigation/Tabs
EOF

LAYER=molecules
while IFS=$'\t' read -r kebab pascal sidebar; do
  dir="packages/components/src/components/${LAYER}/${kebab}"
  mkdir -p "$dir"
  git mv "packages/components/src/components/ui/${kebab}.tsx" "${dir}/${kebab}.tsx"

  cat > "${dir}/${kebab}.stories.tsx" <<STORY
import type { Meta, StoryObj } from "@storybook/react";
import { ${pascal} } from "./${kebab}";

const meta: Meta<typeof ${pascal}> = {
  title: "${sidebar}",
  component: ${pascal},
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ${pascal}>;

export const Default: Story = {};
STORY

  cat > "${dir}/COMPONENT.md" <<'MDEOF'
---
name: __PASCAL__
slug: __KEBAB__
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
---

# __PASCAL__

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
MDEOF

  sed -i '' "s/__PASCAL__/${pascal}/g; s/__KEBAB__/${kebab}/g" "${dir}/COMPONENT.md"
done < /tmp/t001-molecules.tsv

rm /tmp/t001-molecules.tsv
```

Expected: 14 folders created under `molecules/`. `ui/` now has 4 files remaining (the 4 organisms).

### Step 4.2: Rewrite cross-component imports pointing to moved molecules

Molecules that have incoming imports from other moved files:

- `dialog` — imported by: `command` (which just moved in this task)
- `sheet` — imported by: `sidebar` (still in `ui/`, moves in Task 5)

Also any molecule that internally imports an atom already went through Task 3's sed pass — verify none slipped through.

- [ ] Run the same anchored-sed approach, scoped to molecule names, across all `.tsx` under `src/components/`:

```bash
cd packages/components

MOLECULES=(accordion alert-dialog breadcrumb card carousel combobox command dialog drawer dropdown-menu pagination select sheet tabs)
SORTED=$(printf '%s\n' "${MOLECULES[@]}" | awk '{ print length, $0 }' | sort -rn | cut -d' ' -f2-)

for mol in $SORTED; do
  find src/components -name '*.tsx' -type f -print0 \
    | xargs -0 sed -i '' "s|@/components/ui/${mol}\\([\"']\\)|@/components/molecules/${mol}/${mol}\\1|g"
done

cd ../..
```

- [ ] Verify:

```bash
cd packages/components && grep -rn "@/components/ui/" src/components/{atoms,molecules,ui} | \
  grep -vE "@/components/ui/(chart|navigation-menu|sidebar|table)\"" || echo "no unexpected molecule references"
cd ../..
```

Expected: `no unexpected molecule references` — only references to the 4 remaining organisms (if any) should show up, and those get fixed in Task 5.

### Step 4.3: Verify the molecules layer

- [ ] Run from repo root:

```bash
cd packages/components && npx tsc --noEmit && cd ../..
npm run test:storybook --workspace=@nivoda/components
npm run build-storybook --workspace=@nivoda/components
```

Expected: all three pass. Test count should now be 32 (atoms) + 14 (molecules) = 46 render tests.

**Expected compound hazards in molecules** (these will almost certainly need minimal render skeletons — resolve inline):

- `AlertDialog`, `Dialog`, `Drawer`, `Sheet` — need trigger+content structure
- `DropdownMenu` — needs trigger + menu items
- `Command` — needs input + list
- `Select` — needs trigger + content + items
- `Tabs` — needs list + triggers + content
- `Accordion` — needs items
- `Breadcrumb`, `Pagination` — need list structure
- `Combobox`, `Card`, `Carousel` — vary

Apply the same "minimum literal mount" rule as step 3.3. If something genuinely cannot mount, disable + document.

### Step 4.4: Commit

- [ ] From repo root:

```bash
git add packages/components/src/components/
git commit -m "$(cat <<'EOF'
feat(components): seed molecules into atomic folder structure

Moves 14 components from src/components/ui/ to
src/components/molecules/{name}/. Each folder gets a minimal
Default story (with compound skeletons where needed) and a
COMPONENT.md stub with [WIP] sections.

Rewrites cross-component imports between molecules (command→dialog)
and updates any remaining references from files that previously
imported molecules via the old ui/ path.

Part of T000-1.
EOF
)"
```

---

## Task 5: Move organisms (4 components) and delete `ui/`

**Organisms manifest:**

```
chart            | ChartContainer  | Data/Chart
navigation-menu  | NavigationMenu  | Navigation/NavigationMenu
sidebar          | SidebarProvider | Navigation/Sidebar
table            | Table           | Data/Table
```

**Note on primary exports:**
- `chart.tsx` — primary import is `ChartContainer` (the top-level wrapper). If `ChartContainer` is not the right choice for a Default story skeleton, fall back to the first exported member in the file.
- `sidebar.tsx` — `SidebarProvider` is the outermost wrapper; a minimal `Default` story almost certainly needs `<SidebarProvider><Sidebar>...</Sidebar></SidebarProvider>` as a compound skeleton.

The executor should read `chart.tsx` and `sidebar.tsx` to verify these names before running the script. If the primary name differs, update the manifest before executing.

### Step 5.1: Execute the organism move script

- [ ] Run from repo root:

```bash
cat > /tmp/t001-organisms.tsv <<'EOF'
chart	ChartContainer	Data/Chart
navigation-menu	NavigationMenu	Navigation/NavigationMenu
sidebar	SidebarProvider	Navigation/Sidebar
table	Table	Data/Table
EOF

LAYER=organisms
while IFS=$'\t' read -r kebab pascal sidebar; do
  dir="packages/components/src/components/${LAYER}/${kebab}"
  mkdir -p "$dir"
  git mv "packages/components/src/components/ui/${kebab}.tsx" "${dir}/${kebab}.tsx"

  cat > "${dir}/${kebab}.stories.tsx" <<STORY
import type { Meta, StoryObj } from "@storybook/react";
import { ${pascal} } from "./${kebab}";

const meta: Meta<typeof ${pascal}> = {
  title: "${sidebar}",
  component: ${pascal},
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ${pascal}>;

export const Default: Story = {};
STORY

  cat > "${dir}/COMPONENT.md" <<'MDEOF'
---
name: __PASCAL__
slug: __KEBAB__
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
---

# __PASCAL__

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
MDEOF

  sed -i '' "s/__PASCAL__/${pascal}/g; s/__KEBAB__/${kebab}/g" "${dir}/COMPONENT.md"
done < /tmp/t001-organisms.tsv

rm /tmp/t001-organisms.tsv
```

Expected: 4 organism folders created. `ui/` is now empty.

### Step 5.2: Rewrite any remaining cross-component imports

No component imports an organism, so this pass is strictly defensive.

- [ ] Run:

```bash
cd packages/components

ORGANISMS=(chart navigation-menu sidebar table)
SORTED=$(printf '%s\n' "${ORGANISMS[@]}" | awk '{ print length, $0 }' | sort -rn | cut -d' ' -f2-)

for org in $SORTED; do
  find src/components -name '*.tsx' -type f -print0 \
    | xargs -0 sed -i '' "s|@/components/ui/${org}\\([\"']\\)|@/components/organisms/${org}/${org}\\1|g"
done

cd ../..
```

- [ ] Verify zero remaining `@/components/ui/` references:

```bash
grep -rn "@/components/ui/" packages/components/src/ || echo "clean"
```

Expected: `clean`.

### Step 5.3: Delete the empty `ui/` directory

- [ ] Run:

```bash
rmdir packages/components/src/components/ui
```

Expected: directory removed. If `rmdir` fails with "not empty", stop — something is still there and step 5.2's verification missed a file.

### Step 5.4: Verify the full tree

- [ ] Run from repo root:

```bash
cd packages/components && npx tsc --noEmit && cd ../..
npm run test:storybook --workspace=@nivoda/components
npm run build-storybook --workspace=@nivoda/components
```

Expected:
- 0 type errors
- 50 story render tests pass (32 atoms + 14 molecules + 4 organisms)
- Storybook build succeeds

**Expected organism hazards:**
- `Sidebar` — needs `SidebarProvider` wrapper in the render function
- `NavigationMenu` — needs items
- `Chart` — needs config + data; `ChartContainer` mount may throw without these
- `Table` — `<Table />` alone renders an empty `<table>`, should be fine

Apply "minimum literal mount" as before. If `Chart` or `Sidebar` simply can't skeleton-render, disable + document.

### Step 5.5: Commit

- [ ] From repo root:

```bash
git add packages/components/src/components/
git commit -m "$(cat <<'EOF'
feat(components): seed organisms and remove empty ui/ directory

Moves 4 components (chart, navigation-menu, sidebar, table) from
src/components/ui/ to src/components/organisms/{name}/. Each gets a
minimal Default story (with compound skeletons where needed) and a
COMPONENT.md stub.

Deletes the now-empty src/components/ui/ directory. All 50 components
are in their atomic folders.

Part of T000-1.
EOF
)"
```

---

## Task 6: Update `components.json`

**Files:**
- Modify: `packages/components/components.json:18`

### Step 6.1: Change `aliases.ui`

- [ ] Modify `packages/components/components.json` — change line 18 from:

```json
"ui": "@/components/ui",
```

to:

```json
"ui": "@/components/atoms",
```

### Step 6.2: Commit

- [ ] From repo root:

```bash
git add packages/components/components.json
git commit -m "$(cat <<'EOF'
chore(components): point shadcn CLI alias at atoms/

Updates components.json aliases.ui from @/components/ui to
@/components/atoms so future `npx shadcn add <component>` lands in
the atoms/ folder by default, matching CONTRIBUTING.md's
"start as an atom, promote later" rule.

Part of T000-1.
EOF
)"
```

---

## Task 7: Rewrite `src/index.ts` with commented barrel

**Files:**
- Modify: `packages/components/src/index.ts`

### Step 7.1: Read each component file's exports

- [ ] Run from repo root to dump the export header from every component file:

```bash
cd packages/components
for f in src/components/atoms/*/*.tsx src/components/molecules/*/*.tsx src/components/organisms/*/*.tsx; do
  # Only match the primary component .tsx (skip .stories.tsx)
  case "$f" in *.stories.tsx) continue ;; esac
  echo "=== $f ==="
  awk '/^export (\{|type|const|function)/,/^}/ {print}' "$f" | head -20
done
cd ../..
```

Expected: for each of the 50 component files, see the top-level export statements (named or type). Use this as the source of truth when writing each barrel line — do not guess.

### Step 7.2: Write the new `src/index.ts`

- [ ] Replace `packages/components/src/index.ts` with the structure below. One commented line per component, grouped by layer, in the same order as the manifests in Tasks 3-5. For each component, the line enumerates the **actual named exports** from that file (as discovered in step 7.1). Type-only exports get their own commented line directly below the runtime export.

Template (showing Button as a worked example — repeat the pattern for all 50):

```ts
import "./styles/globals.css";

export { cn } from "./lib/utils";

// ---------------------------------------------------------------------------
// Commented-out barrel for unstable components.
//
// Every component shipped in this package has a commented-out export line
// below. To publish a component as part of the public surface:
//   1. Uncomment the line(s) for that component.
//   2. Bump the component's status in its COMPONENT.md from `unstable` to
//      `stable` and set an appropriate version.
//   3. Land the change in its own PR alongside whatever work promoted it.
//
// See packages/components/CONTRIBUTING.md §Exports.
// ---------------------------------------------------------------------------

// ────────────────────── Atoms (32) ──────────────────────

// export { Alert, AlertTitle, AlertDescription, AlertAction } from "./components/atoms/alert/alert";
// export { AspectRatio } from "./components/atoms/aspect-ratio/aspect-ratio";
// export { Avatar, AvatarImage, AvatarFallback } from "./components/atoms/avatar/avatar";
// export { Badge, badgeVariants } from "./components/atoms/badge/badge";
// export { Button, buttonVariants } from "./components/atoms/button/button";
// ... (continue for every atom in Task 3's manifest order)

// ────────────────────── Molecules (14) ──────────────────────

// export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "./components/molecules/accordion/accordion";
// export { AlertDialog, /* plus all sub-exports from alert-dialog.tsx */ } from "./components/molecules/alert-dialog/alert-dialog";
// ... (continue for every molecule in Task 4's manifest order)

// ────────────────────── Organisms (4) ──────────────────────

// export { ChartContainer, ChartTooltip, /* etc. */ } from "./components/organisms/chart/chart";
// export { NavigationMenu, /* sub-exports */ } from "./components/organisms/navigation-menu/navigation-menu";
// export { Sidebar, SidebarProvider, /* sub-exports */ } from "./components/organisms/sidebar/sidebar";
// export { Table, TableHeader, TableBody, /* etc. */ } from "./components/organisms/table/table";
```

**Authoring rules:**
- Each commented export line is a single `// export { ... } from "./components/{layer}/{kebab}/{kebab}";` statement — even if the component has 10 sub-exports.
- Type-only exports (if any component has them, e.g. `ChartConfig` in `chart.tsx`) go on their own commented line directly beneath the runtime export: `// export type { ChartConfig } from "./components/organisms/chart/chart";`.
- Include `*Variants` (CVA) exports inline with the runtime exports (e.g. `badgeVariants`, `buttonVariants`, `toggleVariants`, `tabsListVariants`).
- Do **not** uncomment any line in this ticket. The entire barrel ships commented out.

### Step 7.3: Verify it compiles

- [ ] Run:

```bash
cd packages/components && npx tsc --noEmit && cd ../..
```

Expected: 0 errors. A commented-out line is inert from tsc's perspective, so the only thing being typechecked is `import "./styles/globals.css";` and `export { cn }`. If this fails, there's something wrong outside the barrel — fix and retry.

### Step 7.4: Commit

- [ ] From repo root:

```bash
git add packages/components/src/index.ts
git commit -m "$(cat <<'EOF'
feat(components): rewrite src/index.ts barrel as commented-out surface

Every component has a commented-out export line grouped by layer.
Uncommenting a line publishes that component to the public surface.
Fixes the previously dangling Button export that pointed at a
non-existent atoms/button path after the old reference Button was
removed in 6e42687.

Part of T000-1.
EOF
)"
```

---

## Task 8: Write `packages/components/CHANGELOG.md`

**Files:**
- Create: `packages/components/CHANGELOG.md`

### Step 8.1: Create the CHANGELOG

- [ ] Create `packages/components/CHANGELOG.md` with exact content:

```md
# Changelog

All notable changes to `@nivoda/components` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Atomic design folder structure (`atoms/`, `molecules/`, `organisms/`) per CONTRIBUTING.md §"Folder structure". All 50 components moved into `components/<layer>/<name>/` folders with per-component Storybook story and `COMPONENT.md` stub.
- One base Storybook story (`Default`) per component, with sidebar category from CONTRIBUTING.md §"Sidebar taxonomy".
- `COMPONENT.md` skeleton per component with frontmatter (`status: unstable`, `version: 0.0.0`) and `[WIP]` section bodies.
- Testing infrastructure: `vitest@^3`, `@storybook/experimental-addon-test@8.6.18`, `@storybook/addon-a11y@8.6.18`, `@storybook/test@8.6.18`, `@vitest/browser@^3`, `playwright@^1`. `vitest.config.ts` runs every story as a render test via the experimental-addon-test vitest plugin in headless Chromium. `.storybook/vitest.setup.ts` wires Storybook preview annotations into the test environment. `test` and `test:storybook` scripts added.
- `@storybook/addon-a11y` runs in `test: "off"` mode (the SB 8.6.x default, set explicitly) — unaudited shadcn defaults may have violations; these surface in the Storybook dev UI but do not fail CI, and are deferred to per-component build tickets.
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

### Step 8.2: Commit

- [ ] From repo root:

```bash
git add packages/components/CHANGELOG.md
git commit -m "$(cat <<'EOF'
docs(components): add CHANGELOG backfilling setup history

Creates packages/components/CHANGELOG.md in Keep a Changelog format.
Backfills the five pre-history commits from 2d2b9dc forward under
[0.0.1] — 2026-04-13 and records the T000-1 work under [Unreleased].

Part of T000-1.
EOF
)"
```

---

## Task 9: Add CI workflow

**Files:**
- Create: `.github/workflows/components.yml`

### Step 9.1: Create the workflow file

- [ ] Create `.github/workflows/components.yml` with exact content:

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

      - name: Run Storybook vitest tests
        run: npm run test:storybook --workspace=@nivoda/components

      - name: Verify Storybook build
        run: npm run build-storybook --workspace=@nivoda/components
```

### Step 9.2: Commit

- [ ] From repo root:

```bash
git add .github/workflows/components.yml
git commit -m "$(cat <<'EOF'
ci(components): add components package workflow

Runs test:storybook (vitest + @storybook/experimental-addon-test in
headless Chromium) and build-storybook on any push or PR that touches
packages/components/**. Mirrors the existing tokens workflow structure.

Part of T000-1.
EOF
)"
```

---

## Task 10: Final verification and open PR

### Step 10.1: Run the full local verification suite

- [ ] From repo root:

```bash
cd packages/components
npx tsc --noEmit
cd ../..
npm run test:storybook --workspace=@nivoda/components
npm run build-storybook --workspace=@nivoda/components
npx nx build components
```

All four must pass:
- `tsc --noEmit` → 0 errors
- `test:storybook` → 50 render tests pass (or however many remain after any stories were disabled in Tasks 3-5)
- `build-storybook` → succeeds, writes to `storybook-static/`
- `nx build components` → Nx pipeline completes

### Step 10.2: Sanity-check the file layout

- [ ] Run:

```bash
find packages/components/src/components -type d \
  | grep -v node_modules \
  | sort
```

Expected: exactly these directories (plus the layer roots):

```
packages/components/src/components
packages/components/src/components/atoms
packages/components/src/components/atoms/alert
packages/components/src/components/atoms/aspect-ratio
packages/components/src/components/atoms/avatar
... (30 more atom folders)
packages/components/src/components/molecules
packages/components/src/components/molecules/accordion
... (13 more molecule folders)
packages/components/src/components/organisms
packages/components/src/components/organisms/chart
packages/components/src/components/organisms/navigation-menu
packages/components/src/components/organisms/sidebar
packages/components/src/components/organisms/table
```

No `ui/` directory. 32 + 14 + 4 = 50 component folders.

- [ ] Verify per-component files:

```bash
find packages/components/src/components/{atoms,molecules,organisms} -maxdepth 2 -mindepth 2 -type d \
  | while read d; do
      name=$(basename "$d")
      for f in "${name}.tsx" "${name}.stories.tsx" "COMPONENT.md"; do
        [ -f "$d/$f" ] || echo "MISSING: $d/$f"
      done
    done
```

Expected: no `MISSING` lines.

### Step 10.3: Push the branch

- [ ] From repo root:

```bash
git push -u origin issue/t001
```

### Step 10.4: Open the PR

- [ ] Run:

```bash
gh pr create \
  --title "T000-1: Seed components into atomic folder structure" \
  --body "$(cat <<'EOF'
## Summary
- Moves 50 components from `src/components/ui/` into `atoms|molecules|organisms/<name>/` per [CONTRIBUTING.md](packages/components/CONTRIBUTING.md).
- Seeds one `Default` Storybook story and a `[WIP]` `COMPONENT.md` stub per component.
- Adds Storybook+vitest testing infrastructure (`@storybook/experimental-addon-test@8.6.18`, `@storybook/addon-a11y@8.6.18`, `vitest@^3`, `@vitest/browser@^3`, `playwright`) running story-as-render-test in headless Chromium.
- Adds `.github/workflows/components.yml` CI.
- Rewrites `src/index.ts` as a commented-out barrel — uncommenting publishes a component.
- Removes 5 out-of-scope components (native-select, calendar, context-menu, menubar, resizable) and their orphaned runtime deps.
- Backfills `packages/components/CHANGELOG.md`.

**Setup only**: no component internals touched, no tokens-package coupling, no `globals.css` changes.

Closes #103.

## Test plan
- [x] `npx tsc --noEmit` in `packages/components/` passes
- [x] `npm run test:storybook --workspace=@nivoda/components` passes (50 story render tests)
- [x] `npm run build-storybook --workspace=@nivoda/components` passes
- [x] `npx nx build components` passes
- [x] `src/components/ui/` is gone
- [x] Every component folder has `{name}.tsx`, `{name}.stories.tsx`, and `COMPONENT.md`
- [ ] CI (`.github/workflows/components.yml`) green on the PR

## Notes for review
- Any stories that had to be disabled (via `parameters.docs.disable` + `test.skip`) because the compound primitive couldn't be rendered with a minimal skeleton are documented in the affected component's `COMPONENT.md` Quality checklist as unchecked items. **Flag**: any such disable during review, but don't expect us to fix in this PR — per the spec, shadcn source is not modified in setup tickets.
EOF
)"
```

Expected: PR URL returned. Watch the CI run and address any red signals.

---

## Self-review notes

**Spec coverage:**
- ✓ Task 1 covers spec §"Testing infrastructure" (vitest.config.ts, .storybook updates, deps, scripts)
- ✓ Task 2 covers spec §"Deleted (5)" + orphaned deps
- ✓ Tasks 3-5 cover spec §"Component mapping" + §"Implementation sequence" steps 3-4
- ✓ Task 6 covers spec §D5 (`components.json` update)
- ✓ Task 7 covers spec §"`src/index.ts` template" + §D4
- ✓ Task 8 covers spec §"CHANGELOG"
- ✓ Task 9 covers spec §"CI workflow"
- ✓ Task 10 covers spec §"Final verification"
- ✓ Spec §"Failure handling policy" is enforced inline in steps 3.3, 4.3, 5.4 (compound hazards paragraph) — disable+document, never patch shadcn
- ✓ Spec §"Guardrails" (no globals.css, no tokens-package imports, no CONTRIBUTING.md changes) are respected — nothing in any task touches those files

**Placeholder scan:** No "TBD", "TODO", "implement later", etc. in the plan body. Every code block is concrete. The only `[WIP]` strings are literal content inside the `COMPONENT.md` template, which is intentional per the spec.

**Type consistency:** Addon name is `@storybook/experimental-addon-test@8.6.18` throughout (Tasks 1, 8, 9). Script paths, manifest formats, and sed patterns use the same conventions across Tasks 3, 4, 5. CHANGELOG text in Task 8 matches the spec's CHANGELOG section verbatim after the spec corrections in `c03f84c`.
