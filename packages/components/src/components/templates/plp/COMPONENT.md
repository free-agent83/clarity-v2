---
name: PlpTemplate
slug: plp-template
version: 0.2.0
status: unstable
lastUpdated: 2026-04-16
---

# PlpTemplate

Product Listing Page template — a page-level component that orchestrates a complete product listing experience with heading, toolbar, filtering, responsive product grid, pagination, and loading/empty/error states.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `breadcrumbs` | `BreadcrumbSegment[]` | — | Breadcrumb navigation segments |
| `title` | `string` | — | Category title |
| `resultsCount` | `number` | — | Total results to display in heading |
| `filters` | `FilterDefinition[]` | — | Filter definitions (preset or custom) |
| `filterState` | `FilterState` | — | Current filter values keyed by filter ID |
| `onFilterChange` | `(id: string, value: FilterValue) => void` | — | Called when any filter value changes |
| `filteredResultsCount` | `number` | — | Count shown in the "Show X results" drawer button |
| `sortOptions` | `SortOption[]` | — | Available sort options |
| `sortValue` | `string` | — | Currently selected sort value |
| `onSortChange` | `(value: string) => void` | — | Called when sort changes |
| `searchPlaceholder` | `string` | `"Search..."` | Placeholder for the search input |
| `onSearchSubmit` | `(query: string) => void` | — | Called on search submit (Enter key) |
| `items` | `TItem[]` | — | Raw items from the consumer |
| `renderGridItem` | `(item: TItem) => GridItemData` | — | Maps raw items to the grid item data shape |
| `listColumns` | `ListColumn<TItem>[]` | — | Category-configured columns for list view. Presence of a non-empty array enables the grid/list toggle. Omit for grid-only. |
| `viewMode` | `"grid" \| "list"` | `"grid"` | Current view mode. Template silently falls back to grid at viewports < 1024px. |
| `onViewModeChange` | `(mode: "grid" \| "list") => void` | — | Called when the user toggles view mode. |
| `onItemClick` | `(item: TItem) => void` | — | Called when a list view row is clicked. No effect in grid view. |
| `page` | `number` | — | Current page number |
| `pageSize` | `number` | — | Items per page |
| `totalItems` | `number` | — | Total items for pagination |
| `pageSizeOptions` | `number[]` | `[20, 50, 100]` | Page size selector options |
| `onPageChange` | `(page: number) => void` | — | Called when page changes |
| `onPageSizeChange` | `(size: number) => void` | — | Called when page size changes |
| `status` | `PlpStatus` | — | Content area state: loading, success, empty-filtered, empty-no-items, error |
| `onRetry` | `() => void` | — | Retry handler for error state |
| `emptyFilterSuggestions` | `string[]` | — | Filter names to suggest removing in empty-filtered state |
| `emptyMessage` | `string` | — | Custom message for empty-no-items state |

## Usage guidelines

**When to use:** Any product listing page that shows a grid of items with filtering, sorting, and pagination. Must be rendered inside an AppShell.

**When NOT to use:** Pages that aren't product listings (dashboards, settings, auth flows). Pages that need a completely custom layout not matching the PLP structure.

### List view (Phase 2)

List view is a density-oriented alternative to grid view for categories that benefit from parameter-by-parameter comparison (diamonds is the canonical case). Opt in by passing a non-empty `listColumns` array. The grid/list toggle appears in the toolbar automatically when list view is available and the viewport is ≥ 1024px. Below the tablet breakpoint, the template silently falls back to grid view — the consumer's `viewMode` state is preserved and honored when the viewport grows.

## Best practices

**Do:** Supply all filter definitions as a configuration array. The template resolves them identically across all three surfaces (quick filter, drawer, active chip).

**Do:** Use the `renderGridItem` mapper to transform raw API data into the structured `GridItemData` shape. The template controls render order.

**Don't:** Try to inject custom rendering for template-driven sections (delivery, returns, pricing). Supply the data; the template handles the rendering.

**Don't:** Use custom filters when a preset fits. Custom filters drift visually over time.

## Quality checklist

- [x] Accessibility: keyboard navigable, focus trapping in drawer/popovers, aria-live for results count, semantic landmarks
- [x] Responsive: 2/3/4 column grid, mobile toolbar condensed to All Filters + Sort
- [x] Tokens only: no hardcoded visual values
