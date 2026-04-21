---
name: PlpTemplate
slug: plp-template
version: 0.5.0
status: unstable
lastUpdated: 2026-04-21
---

# PlpTemplate

Product Listing Page template — a page-level layout component that orchestrates a complete product listing experience: heading, toolbar with filter slot + sort + view toggle, responsive product grid or list, pagination, and loading/empty/error states. Must be rendered inside an AppShell.

The template is a presentational container. It holds no filter schema, no item data shape, and no commit semantics. Consumers compose filter buttons, grid cards, and list rows from library primitives, and hand them in as `ReactNode[]` slots. All business logic (filter state, drawer draft buffering, preview-count fetching, chip summary formatting, pricing variants, user-context decisions) lives in the consumer. See [plp-template.stories.tsx](./plp-template.stories.tsx) for the canonical wiring pattern, including the `useFilterController` reference implementation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `breadcrumbs` | `BreadcrumbSegment[]` | — | Breadcrumb navigation segments |
| `title` | `string` | — | Category title |
| `resultsCount` | `number` | — | Total results displayed in the heading |
| `toolbarFilters` | `ReactNode[]` | — | Pre-composed filter buttons for the toolbar row. Typically pinned quick filters plus engaged non-pinned filters. Each element must carry its own `key`. |
| `stickyFilters` | `ReactNode[]` | — | Pre-composed filter buttons for the sticky bar. Typically the engaged subset only. |
| `activeFilterCount` | `number` | — | Drives the "All filters" badge |
| `hasActiveFilters` | `boolean` | — | Drives Clear all visibility and the sticky-bar engagement gate |
| `onOpenDrawer` | `() => void` | — | Fired when either "All filters" button is clicked |
| `onClearAll` | `() => void` | — | Fired by the toolbar's Clear all and the empty-filtered state's clear action |
| `sortOptions` | `SortOption[]` | — | Available sort options |
| `sortValue` | `string` | — | Currently selected sort value |
| `onSortChange` | `(value: string) => void` | — | Called when sort changes |
| `searchPlaceholder` | `string` | `"Search..."` | Placeholder for the search input |
| `onSearchSubmit` | `(query: string) => void` | — | Called on search submit (Enter key) |
| `gridItems` | `ReactNode[]` | — | Pre-rendered grid cards composed from `PlpGridItem*` primitives |
| `listHeader` | `ReactNode` | — | Pre-rendered list header row |
| `listRows` | `ReactNode[]` | — | Pre-rendered list rows composed from `PlpListRow*` primitives |
| `listViewAvailable` | `boolean` | `false` | When true, exposes the grid/list toggle. Template falls back to grid at viewports < 1024px. |
| `viewMode` | `"grid" \| "list"` | `"grid"` | Current view mode |
| `onViewModeChange` | `(mode) => void` | — | Called when the user toggles view mode |
| `page` | `number` | — | Current page number |
| `pageSize` | `number` | — | Items per page |
| `totalItems` | `number` | — | Total items for pagination |
| `pageSizeOptions` | `number[]` | `[20, 50, 100]` | Page size selector options |
| `onPageChange` | `(page: number) => void` | — | Called when page changes |
| `onPageSizeChange` | `(size: number) => void` | — | Called when page size changes |
| `status` | `PlpStatus` | — | Content area state: loading, success, empty-filtered, empty-no-items, error |
| `onRetry` | `() => void` | — | Retry handler for error state |
| `emptyMessage` | `string` | — | Custom message for the empty-no-items state |

## Filter composition

The template renders a fixed filter chrome (All Filters button, Clear all, sticky bar), and flows consumer-supplied `ReactNode[]` slots into that chrome. The actual drawer is not part of the template — consumers render `PlpFilterDrawer` as a sibling and wire `onOpenDrawer` to flip a local `open` state.

Typical wiring:

1. A local controller (see `useFilterController` in the stories) owns applied filter state, drawer draft buffer, and a drawer-open flag.
2. Quick filter buttons are composed via `PlpQuickFilter`, each wrapping a preset control (`RangeSliderFilter`, `MultiSelectChipsFilter`, etc.) inside a render-prop child that exposes the popover's draft value.
3. The consumer derives `toolbarFilters` and `stickyFilters` from its own pinned-vs-engaged classification.
4. The drawer is rendered as a sibling to `PlpTemplate`, with `PlpFilterSection` wrappers around each preset control written directly against the controller's draft state.
5. Chip summaries for active filter buttons are formatted by the consumer (the library no longer ships a chip formatter).

## Usage guidelines

**When to use:** Any product listing page that shows a grid or list of items with filtering, sorting, and pagination. Must be rendered inside an AppShell.

**When NOT to use:** Pages that aren't product listings (dashboards, settings, auth flows), or pages that need a completely custom layout.

### List view

List view is a density-oriented alternative to grid for categories that benefit from parameter-by-parameter comparison (diamonds is the canonical case). Opt in by passing `listViewAvailable`, `listHeader`, and `listRows`. The grid/list toggle appears in the toolbar when list view is available and the viewport is ≥ 1024px. Below the tablet breakpoint the template silently falls back to grid while preserving the consumer's `viewMode` intent.

## Best practices

**Do:** Compose filter buttons once and route them to the right slot based on your own pinned/engaged rules. Keep the routing in the consumer, not the template.

**Do:** Format chip summaries close to the filter definition so the display text tracks the value shape.

**Do:** Wire `onDraftFilterStateChange`-style behaviour at the drawer level — observe the controller's `draft` and fetch a debounced preview count from your backend, then feed it into `PlpFilterDrawer.resultsCount` / `isCountLoading`.

**Don't:** Re-introduce a library-owned `FilterDefinition` schema. The point of this version is that each preset stands alone and the consumer wires it.

## Related components

- [PlpFilterDrawer](./filters/plp-filter-drawer.tsx) — the Sheet container consumers render as a sibling
- [PlpFilterSection](./filters/plp-filter-section.tsx) — heading + separator wrapper for entries inside the drawer
- [PlpQuickFilter](./toolbar/plp-quick-filter.tsx) — toolbar-row filter button with per-popover draft state
- Presets: [BooleanChipFilter](./filters/presets/boolean-chip.tsx), [SingleSelectChipsFilter](./filters/presets/single-select-chips.tsx), [MultiSelectChipsFilter](./filters/presets/multi-select-chips.tsx), [SingleSelectDropdownFilter](./filters/presets/single-select-dropdown.tsx), [RangeSliderFilter](./filters/presets/range-slider.tsx), [MultiAxisRangeFilter](./filters/presets/multi-axis-range.tsx), [AsyncComboboxFilter](./filters/presets/async-combobox.tsx)

## Quality checklist

- [x] Accessibility: keyboard navigable, focus trapping in drawer/popovers, aria-live for results count, semantic landmarks
- [x] Responsive: 2/3/4 column grid, mobile toolbar condensed to All Filters + Sort
- [x] Tokens only: no hardcoded visual values
