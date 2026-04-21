---
title: PLP Filter System — Presentation/Logic Decoupling Design
authors:
  - "Jo\u00e3o Gomes"
  - Claude Code
date: 2026-04-21
status: Draft
parent: docs/plans/specs/2026-04-16-plp-template-component-spec.md
tags:
  - design-system
  - plp
  - filters
  - refactor
  - implementation-design
---

# PLP Filter System — Presentation/Logic Decoupling Design

## Motivation

The current PLP filter system couples presentation and business logic. The library owns a `FilterDefinition` schema, a preset registry that maps string names to control components, chip-summary formatters, draft-state lifecycles for both the drawer and toolbar popovers, and commit-on-apply diff logic. Consumers hand the template a `filters` array and a `filterState` map and get back wiring they cannot inspect, extend, or bypass.

This refactor inverts the responsibility split. The library becomes a set of presentational building blocks — containers, slots, and preset controls with their own stories. The consumer assembles those blocks, owns the state shape and lifecycle, and demonstrates the pattern in the PLP stories. The stories become a small, self-contained reference implementation that a downstream app can read and copy.

The core outcome is portability: once the library stops mandating a filter data shape, any consumer can adopt the components without conforming to an opinionated schema. Per-preset stories also become possible, which makes designing and reviewing each preset in isolation straightforward.

## Scope

### Included

- Demolition of the preset registry (`plp-filter-registry.ts` and its tests).
- Removal of `FilterDefinition`, `PresetFilterDefinition`, `CustomFilterDefinition`, `FilterPresetName`, `FilterControlProps`, `FilterState`, `FilterValue`, and `FilterOption` from `plp-types.ts` and from the library's public surface.
- Rewrite of `PlpFilterDrawer` as a container component that accepts children.
- Rewrite of `PlpQuickFilter` as a presentational wrapper that receives a render-prop child and retains only per-popover draft UI state.
- Rewrite of `PlpToolbar` and `PlpStickyFilterBar` to accept pre-composed `ReactNode[]` filter slots instead of data arrays.
- Rewrite of `PlpTemplate` to drop all filter-data props and filter-classification logic; the drawer moves out of the template and becomes a consumer-rendered sibling.
- Promotion of each preset (`BooleanChipFilter`, `SingleSelectChipsFilter`, `MultiSelectChipsFilter`, `SingleSelectDropdownFilter`, `RangeSliderFilter`, `MultiAxisRangeFilter`, `AsyncComboboxFilter`) to a first-class exported component with its own `value` type, config props, COMPONENT.md, and stories file.
- A new `PlpFilterSection` primitive — a thin heading-plus-separator wrapper used inside the drawer body.
- A reference wiring implementation (`useFilterController`) defined locally inside the PLP template story file. Not exported from the library.
- Rebuild of existing PLP stories against the new API.

### Excluded

- Changes to the `FilterButton` atom.
- Changes to grid, list, or cell primitives.
- Changes to the token layer.
- Changes to the `IntersectionObserver` that drives sticky-bar visibility (separate follow-up pass already flagged).
- Any production consumer migration. This spec covers the library and its stories only.

### Already completed as a preparatory step

- `AppUserContextValue` has been moved from [plp-types.ts](../../packages/components/src/components/templates/plp/plp-types.ts) to [.storybook/app-user-context.tsx](../../packages/components/.storybook/app-user-context.tsx), colocated with the Storybook emulation. It was never a PLP concern; it is not referenced further in this spec.

## Ownership model

### Consumer owns

- The applied `filterState` — shape, keys, initial values.
- The drawer draft buffer and the lifecycle around opening and applying it.
- The `drawerOpen` state.
- Chip summary formatting for each filter.
- Pinned-vs-engaged classification and the composition of the `toolbarFilters` and `stickyFilters` arrays.
- Active-filter count and the "has active filters" boolean.
- Clear-all fan-out.
- Preview-count fetching and debouncing.

### Library owns

- Layout and chrome: toolbar row, wrapping and overflow behaviour, sticky-bar fixed positioning and gradient fades, drawer Sheet shell, sticky drawer footer.
- Per-popover draft UI state for quick filters (seed on open, commit on apply, reset on clear). This is transient UI state, not business logic.
- Preset control components — each a controlled component taking `value` and `onChange` plus its configuration props.
- Loading, empty, and error presentation for the overall PLP, and the loading variant of the drawer's primary action.
- The IntersectionObserver that switches the main toolbar chrome for the sticky bar (unchanged; flagged for future review).

### Demolished

- `plp-filter-registry.ts` (preset resolution + chip formatting helpers).
- `FilterDefinition`, `PresetFilterDefinition`, `CustomFilterDefinition`, `FilterPresetName`, `FilterControlProps`, `FilterState`, `FilterValue`, `FilterOption` — all removed from `plp-types.ts` and from public exports.

## Library component API

### `PlpTemplate`

Filter-related props change to:

```ts
interface PlpTemplateProps {
  // ...unchanged props for heading, sort, search, grid/list, pagination, status...

  toolbarFilters?: ReactNode[];     // pre-composed inline filter buttons for the toolbar row
  stickyFilters?: ReactNode[];      // pre-composed inline filter buttons for the sticky bar
  activeFilterCount: number;        // drives the All Filters badge
  hasActiveFilters: boolean;        // drives Clear all visibility + sticky-bar engagement gate
  onOpenDrawer: () => void;         // wired into the All Filters button
  onClearAll: () => void;           // wired into the Clear all button and empty-state CTA
}
```

Removed props: `filters`, `filterState`, `onFilterChange`, `filteredResultsCount`, `isCountLoading`, `onDraftFilterStateChange`, `emptyFilterSuggestions`.

The template no longer renders the drawer. Consumers render `PlpFilterDrawer` as a sibling to `PlpTemplate`.

### `PlpFilterDrawer`

```ts
interface PlpFilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
  onClearDraft?: () => void;        // when omitted, the header Clear button does not render
  hasActiveDraft?: boolean;         // gates Clear button visibility
  resultsCount?: number;            // formatted into "Show X results"
  isCountLoading?: boolean;         // loading state on the apply button
  children: ReactNode;              // filter sections composed by the consumer
}
```

The drawer renders the Sheet shell, header (with the optional Clear action), a scrollable body that renders `children`, and the sticky footer with the apply button. It holds no draft state, no filter awareness, and no preset registry lookup.

### `PlpFilterSection`

```ts
interface PlpFilterSectionProps {
  label: string;
  children: ReactNode;
  /** When false, suppresses the top separator. Defaults to showing a separator when the section is not first. */
  separator?: boolean;
}
```

Small presentational primitive that consumers use inside the drawer body. Handles the section heading and separator spacing so consumers do not re-implement the scaffold.

### `PlpQuickFilter`

```ts
interface PlpQuickFilterProps<V> {
  label: string;
  chipSummary?: string;             // pre-formatted by the consumer; absence means inactive
  isActive: boolean;
  initialValue: V | undefined;      // seeds draft each time the popover opens
  popoverWidth?: number | string;
  onApply: (value: V | undefined) => void;
  onClear: () => void;
  onDismiss?: () => void;           // inline X on active chip; when omitted, no dismiss button
  children: (draft: V | undefined, setDraft: (v: V | undefined) => void) => ReactNode;
}
```

Retains the per-popover draft `useState` + `useEffect`-on-open seeding + commit-on-apply pattern. No longer reads `FilterDefinition` or resolves a preset — the child render prop is the control the consumer chooses.

### `PlpToolbar` and `PlpStickyFilterBar`

Both accept a `ReactNode[]` slot of pre-composed filter buttons. The toolbar's inline-filter container wraps them with its existing flex-wrap behaviour; the sticky bar keeps its horizontal-scroll row with edge gradients. Sort dropdown, search, view toggle, All Filters button, and Clear all button all remain in the toolbar, driven by the template's props.

### Preset controls — promoted and standardised

Each preset file becomes a first-class component with:

- A component export that takes `value` and `onChange` plus its configuration props directly (no `FilterDefinition` indirection).
- A `value` type export (e.g. `RangeSliderValue = { min: number; max: number }`).
- A per-preset `Option` type where relevant — **each select-family preset declares its own** (per decision below).
- A `{preset-name}.stories.tsx` file with controlled demos and key variants (empty, engaged, with-histogram, loading, errored, and any preset-specific states).
- A `COMPONENT.md` following the package's existing conventions.

Preset-specific config props migrate from `PresetFilterDefinition` fields onto the component props:

- `RangeSliderFilter`: `min`, `max`, `step?`, `unit?`, `histogram?`
- `MultiAxisRangeFilter`: `axes` (the existing array shape)
- `AsyncComboboxFilter`: `searchFn`, `searchDebounceMs?`, `searchPlaceholder?`
- `BooleanChipFilter`: `chipLabel?`
- The chip-family presets: their option array prop (see below)

### Per-preset option types

Each select-family preset declares and exports its own option type. Duplication is accepted deliberately so that presets stay decoupled and each preset's stories can evolve independently.

```ts
// single-select-chips.tsx
export interface SingleSelectChipOption {
  value: string;
  label: string;
  adornment?: ReactNode;
  renderOption?: (props: { selected: boolean }) => ReactNode;
}

// multi-select-chips.tsx — same shape, separately declared
// single-select-dropdown.tsx — same shape, separately declared
// async-combobox.tsx — same shape, separately declared
```

No shared `FilterOption` type exists. Presets that do not use options (range slider, multi-axis range, boolean chip) do not declare one.

## Story-side reference implementation

The PLP template story file defines a local `useFilterController` hook as the canonical wiring pattern. It is not exported from the library — consumers are expected to read it and replicate the pattern against their own types and state lifecycles.

```tsx
function useFilterController<T extends Record<string, unknown>>(initial: Partial<T> = {}) {
  const [applied, setApplied] = useState<Partial<T>>(initial);
  const [draft, setDraft]     = useState<Partial<T>>(initial);
  const [drawerOpen, setOpen] = useState(false);

  const activeIds   = Object.keys(applied).filter((k) => applied[k as keyof T] !== undefined);
  const activeCount = activeIds.length;

  return {
    applied, draft, drawerOpen,
    activeIds, activeCount,
    openDrawer:    () => { setDraft(applied); setOpen(true); },
    closeDrawer:   () => setOpen(false),
    applyDraft:    () => { setApplied(draft); setOpen(false); },
    setDraftFor:   <K extends keyof T>(id: K, v: T[K] | undefined) => setDraft((p) => ({ ...p, [id]: v })),
    clearDraft:    () => setDraft({}),
    setAppliedFor: <K extends keyof T>(id: K, v: T[K] | undefined) => setApplied((p) => ({ ...p, [id]: v })),
    clearAll:      () => setApplied({}),
    setOpen,
  };
}
```

The story composes quick filter buttons once and routes them to the correct slots:

```tsx
const buttons = {
  price: (
    <PlpQuickFilter
      label="Price"
      chipSummary={fmtPrice(ctrl.applied.price)}
      isActive={ctrl.applied.price !== undefined}
      initialValue={ctrl.applied.price}
      onApply={(v) => ctrl.setAppliedFor("price", v)}
      onClear={() => ctrl.setAppliedFor("price", undefined)}
      onDismiss={() => ctrl.setAppliedFor("price", undefined)}
    >
      {(v, set) => <RangeSliderFilter value={v} onChange={set} min={0} max={10000} unit="$" />}
    </PlpQuickFilter>
  ),
  // ...
};

const pinned       = ["price", "shape"] as const;
const toolbarItems = [...pinned, ...ctrl.activeIds.filter((id) => !pinned.includes(id as any))]
                      .map((id) => buttons[id as keyof typeof buttons]);
const stickyItems  = ctrl.activeIds.map((id) => buttons[id as keyof typeof buttons]);
```

And the template plus drawer render as siblings:

```tsx
<>
  <PlpTemplate
    toolbarFilters={toolbarItems}
    stickyFilters={stickyItems}
    activeFilterCount={ctrl.activeCount}
    hasActiveFilters={ctrl.activeCount > 0}
    onOpenDrawer={ctrl.openDrawer}
    onClearAll={ctrl.clearAll}
    /* unchanged heading/sort/grid/list/pagination/status props */
  />
  <PlpFilterDrawer
    open={ctrl.drawerOpen}
    onOpenChange={ctrl.setOpen}
    onApply={ctrl.applyDraft}
    onClearDraft={ctrl.clearDraft}
    hasActiveDraft={Object.values(ctrl.draft).some((v) => v !== undefined)}
    resultsCount={previewCount}
    isCountLoading={previewCountLoading}
  >
    <PlpFilterSection label="Price">
      <RangeSliderFilter
        value={ctrl.draft.price}
        onChange={(v) => ctrl.setDraftFor("price", v)}
        min={0} max={10000} unit="$"
      />
    </PlpFilterSection>
    <PlpFilterSection label="Shape">
      <MultiSelectChipsFilter
        value={ctrl.draft.shape}
        onChange={(v) => ctrl.setDraftFor("shape", v)}
        options={shapeOptions}
      />
    </PlpFilterSection>
    {/* ... */}
  </PlpFilterDrawer>
</>
```

The story demonstrates the preview-count loop as a consumer concern — a debounced `useEffect` on `ctrl.draft` fetches a mock count.

## Files changed

### Removed

- `packages/components/src/components/templates/plp/filters/plp-filter-registry.ts`
- `packages/components/src/components/templates/plp/filters/plp-filter-registry.test.ts`

### Significantly rewritten

- `packages/components/src/components/templates/plp/plp-types.ts` — removes all filter-related types.
- `packages/components/src/components/templates/plp/plp-template.tsx` — drops filter-data props, removes drawer rendering, preserves IntersectionObserver + chrome.
- `packages/components/src/components/templates/plp/toolbar/plp-toolbar.tsx` — slot-based filter row.
- `packages/components/src/components/templates/plp/toolbar/plp-sticky-filter-bar.tsx` — slot-based filter row.
- `packages/components/src/components/templates/plp/toolbar/plp-quick-filter.tsx` — render-prop child, no registry.
- `packages/components/src/components/templates/plp/filters/plp-filter-drawer.tsx` — children-based container, no draft state.
- `packages/components/src/components/templates/plp/filters/presets/*.tsx` — each preset becomes a standalone component with its own config props and option type.
- `packages/components/src/components/templates/plp/plp-template.stories.tsx` — rebuilt against the new API with `useFilterController`.

### New

- `packages/components/src/components/templates/plp/filters/plp-filter-section.tsx` — section wrapper primitive.
- `packages/components/src/components/templates/plp/filters/plp-filter-section.stories.tsx`
- `packages/components/src/components/templates/plp/filters/plp-filter-section.COMPONENT.md`
- One `{preset}.stories.tsx` file per preset.
- One `{preset}.COMPONENT.md` file per preset.

### Public exports ([index.ts](../../packages/components/src/index.ts))

- Remove: `FilterDefinition`, `PresetFilterDefinition`, `CustomFilterDefinition`, `FilterPresetName`, `FilterControlProps`, `FilterState`, `FilterValue`, `FilterOption`, `AppUserContextValue` (already moved).
- Add: each preset component and its `value` type, plus its `Option` type where applicable; `PlpFilterSection`; any new drawer/toolbar/sticky/quick-filter types that changed signature.

## Breaking changes

Consumers upgrading this version must:

1. Replace the `filters` / `filterState` / `onFilterChange` props on `PlpTemplate` with `toolbarFilters`, `stickyFilters`, `activeFilterCount`, `hasActiveFilters`, `onOpenDrawer`, `onClearAll`.
2. Render `PlpFilterDrawer` themselves as a sibling to `PlpTemplate`; pass its children as `PlpFilterSection`-wrapped preset controls.
3. Implement a local controller (following the `useFilterController` pattern from the stories) to own filter state and drawer draft buffering.
4. Import preset components directly and pass config props (`min`, `max`, `options`, etc.) as component props instead of via a `FilterDefinition`.
5. Implement chip summary formatting themselves; the library no longer ships `formatFilterChipValue`.
6. Migrate option arrays to the per-preset option type they now use.

This is a full breaking change to the filter surface. The `CHANGELOG.md` entry must call this out explicitly. No deprecation-and-bridge layer is planned — the library has no production consumers beyond its own stories at this point, so the migration is scoped to rebuilding the stories.

## Testing

- Existing `plp-filter-registry.test.ts` is deleted with the registry.
- Each promoted preset gets a minimal controlled-component test where one does not already exist (value reflection, onChange, disabled/loading variants for presets that have them).
- `PlpFilterDrawer` gets a test that verifies open/close behaviour, that `onApply` fires, that `onClearDraft` renders only when `hasActiveDraft` is true, and that `isCountLoading` disables the apply button.
- `PlpQuickFilter` gets a test that verifies the per-popover draft lifecycle: reseeding from `initialValue` on open, `onApply` receiving the latest draft, `onClear` firing.
- Story-based visual verification remains the primary acceptance path for layout/chrome (toolbar wrap, sticky-bar scroll, drawer sections).

## Deferred / out of scope

- Revisiting the IntersectionObserver that drives sticky-bar visibility. The current implementation observes the toolbar div itself; a future pass may revisit whether this belongs on the template or elsewhere.
- Moving any other misplaced types out of `plp-types.ts`. `AppUserContextValue` has already been moved; no other candidates are flagged.
- Any production consumer migration.
- A `useFilterController` hook exported from the library. Intentionally kept as story-only reference code so consumers build their own against their own state shape.
