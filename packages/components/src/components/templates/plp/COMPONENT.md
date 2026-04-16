---
name: PlpTemplate
slug: plp-template
version: 0.1.0
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

## Best practices

**Do:** Supply all filter definitions as a configuration array. The template resolves them identically across all three surfaces (quick filter, drawer, active chip).

**Do:** Use the `renderGridItem` mapper to transform raw API data into the structured `GridItemData` shape. The template controls render order.

**Don't:** Try to inject custom rendering for template-driven sections (delivery, returns, pricing). Supply the data; the template handles the rendering.

**Don't:** Use custom filters when a preset fits. Custom filters drift visually over time.

## Quality checklist

- [x] Accessibility: keyboard navigable, focus trapping in drawer/popovers, aria-live for results count, semantic landmarks
- [x] Responsive: 2/3/4 column grid, mobile toolbar condensed to All Filters + Sort
- [x] Tokens only: no hardcoded visual values
