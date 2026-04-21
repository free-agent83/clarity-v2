---
title: Filter Subsystem Extraction + PLP Kit Decomposition
authors:
  - "Jo\u00e3o Gomes"
  - Claude Code
date: 2026-04-21
status: Draft
parent: docs/plans/specs/2026-04-21-plp-filter-decoupling-design.md
tags:
  - design-system
  - plp
  - filters
  - refactor
  - implementation-design
---

# Filter Subsystem Extraction + PLP Kit Decomposition

## Motivation

Two related problems motivate this pass.

The first is that the PLP-scoped filter system built in the previous refactor — drawer, toolbar, sticky bar, presets, quick filter, all-filters button — has general utility beyond product listing pages. Settings panels, log viewers, admin consoles, dashboards: anywhere a user browses a collection with filters, sort, and search, the same chrome applies. Today those pieces live under `templates/plp/` where only a PLP can reach them. The library explicitly endorses extraction in this shape: CONTRIBUTING.md says "If an internal sub-component proves useful to a second template, that's a signal to extract it into the library as a standalone atom, molecule, or organism."

The second is that `PlpTemplate` as a unified page component has become an over-opinionated shape. A fixed template can't accommodate the insertion points consumers will inevitably need — category intro banners, promo carousels, recommendation strips, interstitials — without adding a prop for each one. That approach scales poorly; each new insertion point bakes a specific layout decision into the library. The principle that emerged through the earlier filter refactor applies here too: the library should ship building blocks; the consumer assembles the page.

This pass does both moves together because they share a target: the PLP Storybook stories. Doing them sequentially would mean rewriting the stories twice. Done in a single pass, the stories are rewritten once against the final API.

## Scope

### Included

- Extraction of seven filter components from `templates/plp/` to reusable locations across the atom/molecule/organism tiers:
  - `FilterButton` (atom) — absorbs the draft-lifecycle responsibility from the old `PlpQuickFilter`, becoming generic over a value type.
  - `FilterDrawer`, `FilterSection`, `AllFiltersButton`, `ChipSelectFilter` (merged single + multi chip presets), `RangeFilter` (merged single-axis + multi-axis range presets), `AsyncComboboxFilter` — all molecules.
  - `FilterToolbar` (organism) — merges the old `PlpToolbar` and `PlpStickyFilterBar`, taking over the IntersectionObserver that drives sticky visibility.
- Deletion of presets and sub-components that are either subsumed by atoms, by merged presets, or by the absorbed draft lifecycle:
  - `BooleanChipFilter`, `SingleSelectChipsFilter`, `MultiSelectChipsFilter`, `SingleSelectDropdownFilter`, `RangeSliderFilter`, `MultiAxisRangeFilter`, `PlpQuickFilter`, `PlpViewToggle`, `PlpEmpty`, `PlpError`.
- Deletion of the unified `PlpTemplate` component.
- Breakup of the PLP template into a kit of individually-exported building blocks under `templates/plp/`:
  - `PlpHeading`, `PlpGridContainer`, `PlpListContainer`.
  - Grid item and list row primitives stay unchanged.
- Rebuilding the PLP Storybook stories as assembly examples against the new kit. The existing category and state stories must emerge visually and behaviourally identical.
- Introduction of a top-level `Filtering/` Storybook sidebar section for all filter-related components, regardless of tier.

### Excluded

- Generic `PageHeading`, `ResponsiveGrid`, `EmptyState`, or `ErrorState` molecules. YAGNI until a second template materialises and pressure-tests the shape.
- A `useAsyncComboboxOptions` hook exposed separately from `AsyncComboboxFilter`. The async behaviour stays inside the component.
- A `side` prop on `FilterDrawer`. Defaults to "left" as today; right-side variant waits for a second caller.
- Generalising the IntersectionObserver into a reusable `useScrollPastSentinel` hook. Stays internal to `FilterToolbar`.
- A dedicated `PlpPagination` component. Consumers compose `Pagination` + `Select` + `Typography` inline in their page assembly.
- `PlpViewToggle` as a shared component. Consumers write a plain `ToggleGroup` inline.
- Changes to grid item / list row primitives or their composition surface.

## Ownership model

### Library owns

- All layout and chrome in the filter subsystem: the toolbar row wrap behaviour, sort dropdown placement, search input, Clear all gating, All Filters badge, sticky bar fixed positioning and edge gradients, drawer Sheet shell, sticky drawer footer.
- The IntersectionObserver that swaps the main toolbar for the sticky chrome (`FilterToolbar` internal).
- Per-popover draft UI state for filter buttons (`FilterButton` internal — seed on open, commit on apply).
- Preset control behaviour: range clamping, multi-axis record building, chip toggle add/remove, async debounced search with selected-option merging.
- The `Empty` atom composition surface (existing, used for PLP empty/error states at the consumption site).
- PLP kit pieces: `PlpHeading` layout, `PlpGridContainer` responsive grid + skeleton loading, `PlpListContainer` table shell + skeleton loading, grid item card primitives, list row primitives.

### Consumer owns

- Applied filter state, drawer draft buffer, and drawer-open state (controller pattern demonstrated in the assembly story).
- Chip-summary formatting (per filter; no library formatter).
- Pinned-vs-engaged classification and composition of `toolbarFilters` / `stickyFilters` arrays.
- Active-count and "has active filters" derivations.
- Clear-all fan-out.
- Preview-count fetching and debouncing.
- Status routing and empty/error state composition using the `Empty` atom.
- Full page assembly: AppShell wrapping, heading placement, banner / promo insertion points, toolbar + content + pagination arrangement, drawer as a sibling.
- View mode resolution (below-tablet fallback) and the `ToggleGroup` UI inline.

## Component inventory

### Atoms

- `atoms/filter-button/` — `FilterButton`. **Rewritten**: becomes generic over `V`, absorbs the per-popover draft lifecycle from `PlpQuickFilter` (seed-on-open from `initialValue`, Apply commits draft, Clear resets), takes a render-prop child.
- `atoms/empty/` — existing. Used by consumers for empty-filtered / empty-no-items / error state composition at the consumption site.

### Molecules

Six new folders under `molecules/`, flat:

- `filter-drawer/` — `FilterDrawer`. Rename of `PlpFilterDrawer`. One new prop: `applyLabel?: string` (default `"Apply"`); when `resultsCount` is provided, the button renders `"Show X results"` as today.
- `filter-section/` — `FilterSection`. Rename of `PlpFilterSection`. No API change.
- `all-filters-button/` — `AllFiltersButton`. Rename of `PlpAllFiltersButton`. No API change.
- `chip-select-filter/` — `ChipSelectFilter`. Merges `SingleSelectChipsFilter` + `MultiSelectChipsFilter` behind a discriminated union on `mode: "single" | "multiple"`. Minimum two options enforced via docs.
- `range-filter/` — `RangeFilter`. Merges `RangeSliderFilter` + `MultiAxisRangeFilter` behind an `axes: RangeAxis[]` prop. Value shape is always `Record<string, { min; max }> | undefined` keyed by axis id; single-axis consumers key by a chosen id (e.g. `"price"`). Per-axis `label` is optional so single-axis use omits the heading.
- `async-combobox-filter/` — `AsyncComboboxFilter`. Rename move. API unchanged (`value: Option[]`, `searchFn`, debounced input, lazy-on-open fetch, selected-option merging).

### Organisms

One new folder under `organisms/`:

- `filter-toolbar/` — `FilterToolbar`. Merges `PlpToolbar` + `PlpStickyFilterBar`. Takes `filters?`, `stickyFilters?`, `activeFilterCount`, `hasActiveFilters`, `onOpenDrawer`, `onClearAll`, optional search (`onSearchSubmit`, `searchPlaceholder`), optional sort (`sortOptions`, `sortValue`, `onSortChange`), a right-side `actions?: ReactNode` slot, and sticky-behaviour config (`stickyTopOffset` default `72`, `disableSticky`). Internal IntersectionObserver renders both the in-flow main toolbar and a fixed `top-${stickyTopOffset}` compact chrome when scrolled past.

### Templates/PLP kit

Under `templates/plp/`, PLP-specific building blocks with no unified template component:

- `plp-heading.tsx` — breadcrumbs + title + results count (aria-live region preserved).
- `plp-grid-container.tsx` — responsive 2/3/4-col wrapper. `loading?: boolean` + `skeletonCount?: number` (default `20`) replace `children` with skeleton cards tuned to PLP grid item proportions.
- `plp-list-container.tsx` — table shell (scroll container, sticky header scaffolding) with `header?: ReactNode` + `children?: ReactNode`. `loading?: boolean` + `skeletonCount?: number` replace `children` with skeleton rows.
- `grid/plp-grid-item.tsx` — unchanged composition primitives.
- `list/plp-list-row.tsx` — unchanged composition primitives.
- `mocks/` — unchanged.
- `plp.stories.tsx` — the assembly reference (was `plp-template.stories.tsx`).
- `plp-types.ts` — stays for `SortOption`, `BreadcrumbSegment`, `PlpStatus`, `PlpViewMode`.

### Deletions

- `templates/plp/plp-template.tsx`.
- `templates/plp/states/plp-empty.tsx`, `templates/plp/states/plp-error.tsx`. `states/` folder removed.
- `templates/plp/toolbar/plp-quick-filter.tsx`, `plp-view-toggle.tsx`, plus their stories and COMPONENT.md files.
- `templates/plp/filters/presets/boolean-chip.tsx`, `single-select-chips.tsx`, `multi-select-chips.tsx`, `single-select-dropdown.tsx`, `range-slider.tsx`, `multi-axis-range.tsx` — the original seven presets, plus their stories and COMPONENT.md files.
- `templates/plp/filters/`, `templates/plp/toolbar/` folders removed after their remaining files have been relocated.
- `templates/plp/filters/plp-filter-section.stories.tsx` and `COMPONENT.md` move with `FilterSection` to its new molecule folder.

## Key API shapes

### FilterButton (atom)

```ts
interface FilterButtonProps<V> {
  label: string;
  chipSummary?: string;              // pre-formatted by consumer
  isActive: boolean;
  initialValue: V | undefined;       // seeds popover draft each time it opens
  popoverWidth?: number | string;
  onApply: (value: V | undefined) => void;
  onClear: () => void;
  onDismiss?: () => void;            // X on active chip; omit to hide
  children: (
    draft: V | undefined,
    setDraft: (v: V | undefined) => void
  ) => ReactNode;
  className?: string;
}
```

### ChipSelectFilter (molecule)

```ts
interface ChipSelectOption {
  value: string;
  label: string;
  adornment?: ReactNode;
  renderOption?: (props: { selected: boolean }) => ReactNode;
}

type ChipSelectFilterProps =
  | {
      mode: "single";
      value: string | undefined;
      onChange: (v: string | undefined) => void;
      options: ChipSelectOption[];
    }
  | {
      mode: "multiple";
      value: string[] | undefined;
      onChange: (v: string[] | undefined) => void;
      options: ChipSelectOption[];
    };
```

### RangeFilter (molecule)

```ts
interface RangeAxis {
  id: string;
  label?: string;                    // omit to skip heading (single-axis use)
  min: number;
  max: number;
  step?: number;
  unit?: string;
  histogram?: RangeHistogram;
}

interface RangeHistogram {
  buckets: number[];
  min: number;
  max: number;
}

type RangeValue = Record<string, { min: number; max: number }> | undefined;

interface RangeFilterProps {
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  axes: RangeAxis[];
}
```

### AsyncComboboxFilter (molecule)

API unchanged from today's `AsyncComboboxFilter`. Key fields:

```ts
interface AsyncComboboxFilterProps {
  value: AsyncComboboxOption[] | undefined;
  onChange: (value: AsyncComboboxOption[] | undefined) => void;
  searchFn: (query: string) => Promise<AsyncComboboxOption[]>;
  searchDebounceMs?: number;         // default 250
  searchPlaceholder?: string;
}
```

### FilterDrawer (molecule)

API matches today's `PlpFilterDrawer` with one addition:

```ts
interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
  onClearDraft?: () => void;
  hasActiveDraft?: boolean;
  resultsCount?: number;             // when provided, button says "Show X results"
  isCountLoading?: boolean;
  applyLabel?: string;               // new; default "Apply"; overridden when resultsCount is set
  children: ReactNode;
}
```

### FilterToolbar (organism)

```ts
interface FilterToolbarProps {
  filters?: ReactNode[];
  stickyFilters?: ReactNode[];
  activeFilterCount: number;
  hasActiveFilters: boolean;
  onOpenDrawer: () => void;
  onClearAll: () => void;

  onSearchSubmit?: (query: string) => void;
  searchPlaceholder?: string;

  sortOptions?: SortOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;

  actions?: ReactNode;               // right-side extras (e.g. view toggle)

  stickyTopOffset?: number;          // default 72 (AppShellHeader height)
  disableSticky?: boolean;
}
```

Internal behaviour: IntersectionObserver watches an in-flow sentinel (the main toolbar element itself), with `rootMargin: "-${stickyTopOffset}px 0px 0px 0px"` and `threshold: 0`. When the sentinel leaves the adjusted viewport, the compact sticky chrome fades in; when it returns, it fades out.

### PlpGridContainer + PlpListContainer (templates/plp)

```ts
interface PlpGridContainerProps {
  children?: ReactNode;
  loading?: boolean;
  skeletonCount?: number;            // default 20
}

interface PlpListContainerProps {
  header?: ReactNode;
  children?: ReactNode;
  loading?: boolean;
  skeletonCount?: number;
}
```

When `loading` is true, containers render skeleton cards/rows tuned to PLP proportions (preserving today's skeleton visuals exactly). `children` is ignored while loading.

## Consumer assembly pattern

The PLP Storybook story demonstrates the canonical full-page wiring:

```tsx
<AppShell>
  <AppShellHeader />
  <AppShellMain>
    <PlpHeading breadcrumbs={...} title={...} resultsCount={count} />

    {/* Optional insertion point — banners, category intro, promos */}

    <FilterToolbar
      filters={toolbarFilters}
      stickyFilters={stickyFilters}
      activeFilterCount={ctrl.activeCount}
      hasActiveFilters={ctrl.activeCount > 0}
      onOpenDrawer={ctrl.openDrawer}
      onClearAll={ctrl.clearAll}
      onSearchSubmit={handleSearch}
      sortOptions={SORT_OPTIONS}
      sortValue={sort}
      onSortChange={setSort}
      actions={
        <ToggleGroup type="single" value={view} onValueChange={setView}>
          <ToggleGroupItem value="grid"><IconGrid /></ToggleGroupItem>
          <ToggleGroupItem value="list"><IconList /></ToggleGroupItem>
        </ToggleGroup>
      }
    />

    {status === "empty-filtered" ? (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No items match your filters</EmptyTitle>
          <EmptyDescription>Try adjusting your filters.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={ctrl.clearAll}>Clear all filters</Button>
        </EmptyContent>
      </Empty>
    ) : status === "empty-no-items" ? (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No items available</EmptyTitle>
          <EmptyDescription>{emptyMessage}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    ) : status === "error" ? (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Something went wrong</EmptyTitle>
          <EmptyDescription>Please try again.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onRetry}>Retry</Button>
        </EmptyContent>
      </Empty>
    ) : effectiveView === "list" ? (
      <PlpListContainer header={<DiamondListHeader />} loading={status === "loading"}>
        {listRows}
      </PlpListContainer>
    ) : (
      <PlpGridContainer loading={status === "loading"} skeletonCount={pageSize}>
        {gridItems}
      </PlpGridContainer>
    )}

    {status === "success" && totalItems > 0 && (
      <div className="flex items-center justify-center gap-4 py-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Typography as="span" variant="body-2">Results per page</Typography>
          <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
            <SelectTrigger className="w-auto"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[20, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Pagination>...</Pagination>
      </div>
    )}

    <FilterDrawer
      open={ctrl.drawerOpen}
      onOpenChange={ctrl.setDrawerOpen}
      onApply={ctrl.applyDraft}
      onClearDraft={ctrl.clearDraft}
      hasActiveDraft={ctrl.hasActiveDraft}
      resultsCount={preview.count}
      isCountLoading={preview.loading}
    >
      <DrawerBody />
    </FilterDrawer>
  </AppShellMain>
</AppShell>
```

Effective view mode is computed by the consumer:

```tsx
const isTabletUp = useIsTabletUp();
const effectiveView =
  listViewAvailable && isTabletUp && view === "list" ? "list" : "grid";
```

## Migration scope

### Relocations + merges

| From | To | Rename |
|------|-----|--------|
| `templates/plp/filters/plp-filter-drawer.tsx` | `molecules/filter-drawer/filter-drawer.tsx` | `FilterDrawer` |
| `templates/plp/filters/plp-filter-section.tsx` | `molecules/filter-section/filter-section.tsx` | `FilterSection` |
| `templates/plp/toolbar/plp-all-filters-button.tsx` | `molecules/all-filters-button/all-filters-button.tsx` | `AllFiltersButton` |
| `templates/plp/filters/presets/single-select-chips.tsx` + `multi-select-chips.tsx` | `molecules/chip-select-filter/chip-select-filter.tsx` (merged) | `ChipSelectFilter` |
| `templates/plp/filters/presets/range-slider.tsx` + `multi-axis-range.tsx` | `molecules/range-filter/range-filter.tsx` (merged) | `RangeFilter` |
| `templates/plp/filters/presets/async-combobox.tsx` | `molecules/async-combobox-filter/async-combobox-filter.tsx` | `AsyncComboboxFilter` |
| `templates/plp/toolbar/plp-toolbar.tsx` + `plp-sticky-filter-bar.tsx` | `organisms/filter-toolbar/filter-toolbar.tsx` (merged) | `FilterToolbar` |

Each relocated component gets its own `.tsx`, `.stories.tsx`, and `COMPONENT.md`. Stories move to the `Filtering/…` sidebar section.

### Rewrites

- `atoms/filter-button/filter-button.tsx` — generic over `V`, render-prop children, internal draft state.
- `atoms/filter-button/filter-button.stories.tsx` — move to `Filtering/FilterButton`, update to show the draft lifecycle.
- `templates/plp/plp-template.stories.tsx` → `templates/plp/plp.stories.tsx` — full rewrite as the assembly reference.

### Deletions

- `templates/plp/plp-template.tsx` + `COMPONENT.md` (rewritten as a kit overview).
- `templates/plp/states/plp-empty.tsx`, `plp-error.tsx`. `states/` folder removed.
- `templates/plp/toolbar/plp-quick-filter.tsx` (+ stories + doc) — absorbed into FilterButton.
- `templates/plp/toolbar/plp-view-toggle.tsx` — inlined in the assembly story.
- `templates/plp/filters/presets/boolean-chip.tsx` (+ story + doc).
- `templates/plp/filters/presets/single-select-dropdown.tsx` (+ story + doc).
- `templates/plp/toolbar/` folder (empty after moves).
- `templates/plp/filters/presets/` and `templates/plp/filters/` folders (empty after moves).

### Additions

- `templates/plp/plp-heading.tsx` + stories + COMPONENT.md.
- `templates/plp/plp-grid-container.tsx` + stories + COMPONENT.md (includes skeleton proportions from the old `GridSkeletonCard`).
- `templates/plp/plp-list-container.tsx` + stories + COMPONENT.md (includes skeleton proportions from the old `ListSkeletonRow`).
- `templates/plp/COMPONENT.md` — rewritten as the PLP kit overview + assembly guidance.

### Public API (`index.ts`)

Currently, most of the affected components are not exported through the public barrel (they're commented-out `unstable` lines). This pass updates the commented-out paths so that, when each piece is promoted to stable, the uncomment is one-line.

- Remove commented lines pointing at deleted files (`plp-template`, `plp-empty`, `plp-error`, etc.).
- Add commented lines for each new molecule, organism, and PLP kit piece.
- `FilterButton` commented line stays at `atoms/filter-button/filter-button`.

### CHANGELOG entry

Breaking-change entry documenting:

- The filter subsystem — drawer, sections, toolbar (with sticky), filter button with draft lifecycle, chip-select, range, async-combobox — is extracted to molecules/organisms under `Filtering/`.
- `PlpTemplate` component is removed. PLP is assembled from `PlpHeading`, `PlpGridContainer`, `PlpListContainer`, grid item primitives, and list row primitives, plus the new filter subsystem.
- Removed components: `PlpTemplate`, `PlpQuickFilter`, `PlpViewToggle`, `PlpEmpty`, `PlpError`, `PlpAllFiltersButton`, `PlpFilterDrawer`, `PlpFilterSection`, `PlpToolbar`, `PlpStickyFilterBar`, `BooleanChipFilter`, `SingleSelectChipsFilter`, `MultiSelectChipsFilter`, `SingleSelectDropdownFilter`, `RangeSliderFilter`, `MultiAxisRangeFilter`.
- Migration pointers for each removal: use `Toggle`/`Switch` atoms for boolean filters, `Select` atoms for dropdown filters, `ChipSelectFilter` for chip-style filters, `RangeFilter` for range sliders (single- or multi-axis), `Empty` atom for empty/error states, `Pagination` + `Select` atoms for pagination, `ToggleGroup` atoms for view toggles, `FilterButton` with render-prop children for quick-filter popovers.

## Invariants

**The existing PLP category and state stories must emerge from this refactor visually and behaviourally identical.** Specifically, for each of `GemstoneCategory`, `DiamondsCategory`, `WithActiveFilters`, `JewelryCategory`, `WithCustomFilter`, `Loading`, `EmptyFiltered`, `EmptyNoItems`, `Error`, `DiamondListView`, `GemstoneListView`:

- Layout, spacing, and order of sections (heading → toolbar → content → pagination) unchanged.
- Toolbar chrome unchanged: search row, filter row wrap, All Filters badge, Clear all placement, Sort placement, view toggle placement (within the toolbar via the `actions` slot).
- Sticky filter bar appears at the same scroll position as today (`top-72` under the AppShellHeader), with the same engaged-filters subset, same gradient edges, same enter/exit animation.
- Filter button chip behaviour unchanged: draft seeded on open, commit on Apply, dismiss X clears, popover auto-closes.
- Drawer behaviour unchanged: left-side Sheet, header Clear action when draft has active filters, sticky footer with `Show X results` button and loading state.
- Preset controls visually and behaviourally unchanged: chip toggles, range slider + numeric inputs + histogram, multi-axis layout, async combobox with debounced search and persistent selected labels.
- Skeleton loading unchanged: grid card skeleton proportions, list row skeleton width.
- Empty states (both filtered and no-items) match the current `PlpEmpty` visual. Error state matches the current `PlpError` visual.
- Preview-count loop unchanged: debounced fetch on draft change, loading state on the apply button, count appears in "Show X results".

This invariant disciplines the implementation. Any behavioural drift in a story is a regression in the kit and must be tracked down before the refactor is considered complete.

## Risks

### `Empty` atom parity

The deletion of `PlpEmpty` and `PlpError` depends on the `Empty` atom being able to reproduce their visual output via composition of `EmptyHeader`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`, and `EmptyMedia`. Before the implementation plan starts writing code, the first step is to audit the `Empty` atom and confirm it composes into the current `PlpEmpty` / `PlpError` visuals (or close enough that the invariant holds). If it does not:

1. Preferred: extend the `Empty` atom to cover the gap, treating it as an `Empty` atom fix.
2. Fallback: keep a thin `PlpEmpty` (or `PlpError`) in `templates/plp/` as a pre-composed convenience.

The plan should include an early verification step and a branch point for the fallback.

### Assembly story complexity

The assembly story becomes substantially more code than the old per-story `<PlpTemplateInteractive>` wrapper. Rebuilding all 11 existing stories against the new kit risks noise, copy-paste, and subtle divergences. Mitigation:

- Factor a single `AssemblyShell` helper local to the story file that encapsulates the AppShell + kit wiring, leaving each story responsible only for its specific data and status.
- The `useFilterController` hook from the previous refactor stays and continues to own filter state lifecycle.
- Per-category filter-button builders (`useGemstoneFilterButtons`, `useDiamondFilterButtons`) stay as local helpers in the story file.

### Barrel export coordination

`index.ts` currently exposes only a small subset of components as public. This refactor touches many commented-out lines. Care is required to keep the comment structure coherent (file paths correct, component names correct) so that future "promote to stable" moves are frictionless.

## Testing strategy

- Per-component controlled-render tests for `FilterButton`, `ChipSelectFilter`, `RangeFilter`, `AsyncComboboxFilter`, `FilterDrawer`, `FilterSection`, `AllFiltersButton`, `FilterToolbar` — value reflection, onChange, open/close lifecycle, loading states, and for `FilterToolbar` specifically, sticky visibility under simulated scroll.
- Per-component tests for `PlpHeading`, `PlpGridContainer`, `PlpListContainer` — skeleton rendering under `loading`, children rendering under non-loading.
- Story-level visual verification (by eye / via the existing Storybook runner) is the primary acceptance gate for the assembly-pattern invariant above. No automated visual regression is set up in this package; manual check against the pre-refactor branch is the ground truth.
- `tsc --noEmit` clean before the work is considered done.

## Deferred / out of scope

- Generic `PageHeading`, `ResponsiveGrid`, `EmptyState`, `ErrorState` molecules. Revisit when a second template needs them.
- `useAsyncComboboxOptions` hook exposed alongside `AsyncComboboxFilter`.
- `side` prop on `FilterDrawer`.
- `useScrollPastSentinel` hook generalisation.
- A dedicated `PlpPagination` component.
- A dedicated `PlpViewToggle` component.
- Moving `FilterButton` from atoms to molecules (the tier-crossing convention is an open question across the package, not a PLP-local concern).
- Any changes to grid item / list row primitives.
- Touching other templates (PDP, Dashboard, Auth, Checkout, Settings) — those will apply the extracted filter subsystem when they're built, but none are in scope for this pass.
