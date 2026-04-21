# PLP + Filter Toolbar Story Presentation Refactor — Implementation Plan

**Goal:** Collapse the filter-toolbar and PLP Storybook stories from interactive mini-apps into purely presentational stories. Components stay as they are — this is a stories-only refactor (plus deletion of one unused component).

**Motivation:** Stories today wire up filter reducers, sort handlers, and a mock API to simulate a full PLP application. That wiring bloats the files, hides the thing being illustrated, and makes styling hard. Storybook should show components, states, and variants. Wired end-to-end examples live elsewhere (Minivoda, the platform repo).

**Scope:**
- **In:** `templates/plp/**/*.stories.tsx`, `templates/plp/__stories__/**`, `organisms/filter-toolbar/filter-toolbar.stories.tsx`, `molecules/async-combobox-filter/**`, one import patch in `molecules/range-filter/range-filter.stories.tsx`, `src/index.ts`.
- **Out:** Every other component's stories. Every component's runtime code. The filter molecules themselves. PLP template components themselves.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Storybook, Vitest (for tokens only — not used here).

---

## Ground rules

- Components are not modified. If a story can only be written cleanly by changing a component, stop and flag it.
- Stories pass static props and `() => {}` handlers. No `useState` for cross-component application state (filter dicts, sort selection, item lists). Component-internal UI state (e.g. a drawer's open/close) is fine — the component owns that.
- No `mockApi`, no reducers, no async simulation, no setTimeout. If a component requires an async prop shape, supply a pre-resolved static value.
- Each task produces a single focused commit. `tsc --noEmit` must pass from `packages/components` before committing.
- Storybook must load without console errors after each task. `npx nx build components` must pass before the final commit.

---

## Task 1: Delete `async-combobox-filter`

**Files:**
- Delete: `packages/components/src/components/molecules/async-combobox-filter/` (entire directory — component, stories, COMPONENT.md)
- Edit: `packages/components/src/index.ts` (remove the two commented-out export lines at 109–110)

**Purpose:** The component carries too much logic for the current presentation-only posture. No runtime code imports it (only the two PLP vertical harnesses and its own story do, both of which we delete in later tasks). Its `index.ts` exports are already commented out.

- [ ] **Step 1: Confirm no runtime consumers remain**

Run from repo root:
```
grep -r "async-combobox-filter\|AsyncComboboxFilter" packages/components/src --include="*.ts" --include="*.tsx"
```

Expect matches only in:
- The `async-combobox-filter/` directory itself (being deleted).
- `templates/plp/__stories__/{diamond,gemstone}/{api.ts,filters.tsx}` (deleted in Task 2).
- The commented-out lines in `src/index.ts` (being deleted this task).

If any other match appears, stop and flag it.

- [ ] **Step 2: Delete the directory**

```
rm -rf packages/components/src/components/molecules/async-combobox-filter
```

- [ ] **Step 3: Clean up `src/index.ts`**

Remove the two commented-out lines referencing `AsyncComboboxFilter`. No other `index.ts` changes.

- [ ] **Step 4: Typecheck**

From `packages/components`:
```
npx tsc --noEmit
```

Should pass. If it fails, the failure points at a runtime consumer Step 1 missed — fix forward, don't revert.

**Commit:** `refactor(components): remove async-combobox-filter`

---

## Task 2: Delete `templates/plp/__stories__/`

**Files:**
- Delete: `packages/components/src/components/templates/plp/__stories__/` (entire tree — `shared/`, `diamond/`, `gemstone/`, `jewelry/`)

**Purpose:** This directory is the mini-app. Nuking it forces Task 3's rewrite to start from static props. Leaving any of it invites "just one more piece of wiring" regression.

- [ ] **Step 1: Confirm no external imports remain after Task 1**

```
grep -rn "__stories__" packages/components/src --include="*.ts" --include="*.tsx"
```

Expect matches only in:
- Files inside `__stories__/` itself (being deleted).
- `templates/plp/*.stories.tsx` (rewritten in Task 3 — will lose these imports).
- `molecules/range-filter/range-filter.stories.tsx:9` (patched in Task 4).

If any other file imports from `__stories__/`, stop and flag it.

- [ ] **Step 2: Delete the directory**

```
rm -rf packages/components/src/components/templates/plp/__stories__
```

At this point the three PLP story files and the range-filter story file have broken imports. That's expected and resolved in Tasks 3 and 4.

**Commit:** Batched with Task 3 — the tree does not typecheck between Task 2 and Task 3.

---

## Task 3: Rewrite PLP stories from scratch

**Files:**
- Create: `packages/components/src/components/templates/plp/__fixtures__/diamond.ts`
- Create: `packages/components/src/components/templates/plp/__fixtures__/gemstone.ts`
- Create: `packages/components/src/components/templates/plp/__fixtures__/jewelry.ts`
- Rewrite: `packages/components/src/components/templates/plp/plp.stories.tsx`
- Rewrite: `packages/components/src/components/templates/plp/plp-grid-container.stories.tsx`
- Rewrite: `packages/components/src/components/templates/plp/plp-list-container.stories.tsx`
- Read for reference (do not modify): `packages/components/src/components/templates/plp/plp.tsx`, `plp-grid-container.tsx`, `plp-list-container.tsx`, `plp-types.ts`

**Purpose:** Replace the wired mini-app with static-props stories that illustrate each PLP-level state. Filter behaviour is out of scope for PLP stories — it is demonstrated in the filter-toolbar stories (Task 5).

### Design

**Fixtures** (`__fixtures__/<vertical>.ts`) expose:
- A small static array of items (8–12) matching the shape `plp-types.ts` expects for that vertical.
- Any vertical-specific renderer props needed to render those items.
- Nothing else. No `mockApi`. No filter dictionaries. No sort options (if a static sort default is needed, it's a literal in the story file).

Fixtures are consumed only by the PLP story files. They are not exported from `src/index.ts` and not imported outside `templates/plp/`.

**Stories** per vertical, per template entry point:

| Story | Items | Banner | Promo items | Expected visual |
|---|---|---|---|---|
| `Default` | full fixture list | none | none | standard populated PLP |
| `EmptyFiltered` | `[]` | none | none | "no items match your filters" empty state |
| `EmptyNoItems` | `[]` | none | none | "no items available" empty state (different prop from EmptyFiltered) |
| `Error` | `[]` | none | none | error state |
| `WithBanner` | full fixture list | a static banner node | none | populated PLP with banner slot filled |
| `WithPromoItems` | full fixture list | none | 1–2 static promo items | populated PLP with promos interleaved |

Resolve the EmptyFiltered vs EmptyNoItems distinction by reading `plp.tsx` — whichever prop/variant controls it, set it explicitly per story.

No `WithActiveFilters` story — covered by filter-toolbar stories.

All handlers are `() => {}`. All filter/sort/pagination props are either omitted or static literal defaults.

### Steps

- [ ] **Step 1: Read `plp.tsx`, `plp-grid-container.tsx`, `plp-list-container.tsx`, and `plp-types.ts`**

Understand the exact props each template expects. Note:
- Which prop triggers the "empty filtered" vs "empty no items" visual.
- Which prop triggers the "error" visual.
- How banners and promo items are passed in.
- What shape each vertical's item needs.

- [ ] **Step 2: Build three fixture files**

Each fixture file exports:
- `items`: static array of that vertical's item type.
- Any renderer components or config that `plp.stories.tsx` needs to render an item card (these existed in `__stories__/<vertical>/renderers.tsx` — keep the renderer components, drop everything else; they may need to be re-homed into `__fixtures__/` or inlined into the story file depending on size).

Keep each file under ~60 lines. If a renderer is larger, inline it in the story file that uses it rather than growing the fixture file.

- [ ] **Step 3: Rewrite `plp.stories.tsx`**

Structure:
```
meta = { title: "Templates/PLP/PLP", component: PLPTemplate, ... }
<Vertical>/<Story> exports, e.g.:
  export const DiamondDefault: Story = { args: { ... static props ... } }
  export const DiamondEmptyFiltered: Story = { args: { ... } }
  ...
```

Or whatever grouping convention the existing stories use — match the convention visible in `plp.stories.tsx` before the rewrite (check git history if unclear).

Each story is a pure `args` object. No `render` function unless the component literally cannot take all its inputs via props (check — most shadcn-style components can).

- [ ] **Step 4: Rewrite `plp-grid-container.stories.tsx` and `plp-list-container.stories.tsx`**

Same treatment. These containers are simpler than the full template, so fewer stories may be needed. At minimum: `Default`, `Empty`. Add `WithBanner` / `WithPromoItems` only if those props exist on the container.

- [ ] **Step 5: Typecheck and Storybook smoke-test**

```
cd packages/components && npx tsc --noEmit
npx storybook dev -p 6006
```

Open each story in the Templates/PLP section. Confirm it renders without errors. Confirm no story has residual wiring (a story with a `render` function full of hooks is a red flag).

**Commit:** `refactor(components): rewrite PLP stories as static presentations`
(Batched with Task 2's deletion — single commit covering both.)

---

## Task 4: Patch `range-filter.stories.tsx` import

**Files:**
- Edit: `packages/components/src/components/molecules/range-filter/range-filter.stories.tsx`

**Purpose:** `range-filter.stories.tsx:9` imports `buildMockHistogram` from the now-deleted `__stories__/shared/fixtures`. Inline a local replacement so the story stands alone.

- [ ] **Step 1: Read the current range-filter story**

Note how `buildMockHistogram` is used — the shape of the data it returns, and which stories consume it.

- [ ] **Step 2: Inline the helper**

Define `buildMockHistogram` at the top of `range-filter.stories.tsx` (or as a `const HISTOGRAM = [...]` literal if only one value is used). Keep it small — whatever the stories actually need, no more. Delete the import.

- [ ] **Step 3: Typecheck**

```
cd packages/components && npx tsc --noEmit
```

**Commit:** `refactor(components): inline histogram fixture in range-filter story`

---

## Task 5: Rewrite `filter-toolbar.stories.tsx`

**Files:**
- Rewrite: `packages/components/src/components/organisms/filter-toolbar/filter-toolbar.stories.tsx`
- Read for reference (do not modify): `packages/components/src/components/organisms/filter-toolbar/filter-toolbar.tsx`, `filter-toolbar/COMPONENT.md`

**Purpose:** Stories today wire up full filter state so clicking Apply updates the toolbar chips. We want stories where the toolbar *displays* a given state, the drawer and quick-filter popovers can still open (component-internal UI state), and clicking Apply is a no-op.

### Design

Each story is a pure `args` object describing one visual state of the toolbar. Component-internal UI (drawer open/close, quick-filter popover open/close) is handled by the component itself — stories don't touch it.

Handlers (`onApply`, `onChange`, `onClear`, or whatever the toolbar exposes) are `() => {}`.

### Steps

- [ ] **Step 1: Read `filter-toolbar.tsx` and its `COMPONENT.md`**

Enumerate the toolbar's props. Identify:
- Which props describe the filter state shown (active filters, chip labels, quick filter values).
- Which props are handlers (ignored, set to no-op).
- Whether the drawer open/close is internal state or a controlled prop. (If controlled, stories may need a minimal `useState` — but only for that UI concern, not for application state.)

- [ ] **Step 2: Enumerate the stories to keep**

Read the current `filter-toolbar.stories.tsx` and list every story. For each, decide whether it illustrates a distinct visual state worth keeping. Likely keepers:
- `Default` — no active filters.
- `WithActiveFilters` — some chips populated.
- `WithQuickFilters` — quick filter row populated.
- Any other distinct visual the file currently documents.

Drop:
- Any story named `Interactive`, `Playground`, or similar.
- Any story that only exists to demonstrate end-to-end filter flow.

- [ ] **Step 3: Rewrite**

Each surviving story is `{ args: { ...static props, onApply: () => {}, ... } }`. No `render` functions with hooks, no story-level state management.

- [ ] **Step 4: Smoke-test in Storybook**

Open each story. For `WithActiveFilters`, open the drawer and click Apply — confirm the toolbar chips **do not** change. That's the point.

**Commit:** `refactor(components): rewrite filter-toolbar stories as static presentations`

---

## Task 6: Final verification

**Files:** none modified.

**Purpose:** Confirm the package still builds and Storybook is healthy end-to-end.

- [ ] **Step 1: Build components**

```
npx nx build components
```

Must pass.

- [ ] **Step 2: Storybook build**

```
cd packages/components && npx storybook build
```

Must complete without errors. Warnings acceptable if they predate this refactor — spot-check by diffing against the pre-refactor log if unsure.

- [ ] **Step 3: Visual spot-check**

```
cd packages/components && npx storybook dev -p 6006
```

Walk through:
- All PLP stories (3 verticals × 6 stories = 18, plus container stories).
- All filter-toolbar stories.
- All range-filter stories (to confirm the import patch works).

No console errors. Each story renders the intended visual.

**Commit:** None — this task is verification only. If issues surface, fix them in a follow-up task and re-verify.

---

## Out of scope — explicitly

- Modifying any component's runtime code, including `filter-toolbar.tsx`, `plp.tsx`, or the filter molecules.
- Changing stories for components other than PLP, filter-toolbar, range-filter (import patch only), and async-combobox-filter (deleted).
- Adding new components or stories.
- Updating `COMPONENT.md` files beyond what's deleted with async-combobox-filter.
- Documentation updates in `docs/` (except this plan itself).
