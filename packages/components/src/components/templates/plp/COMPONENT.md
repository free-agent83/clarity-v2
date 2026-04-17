---
name: PlpTemplate
slug: plp-template
version: 0.4.0
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

## GridItemData fields

The `renderGridItem` mapper must return a `GridItemData` object. Key fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique item identifier |
| `name` | `string` | Item display name |
| `thumbnailSrc` | `string` | Static thumbnail image URL |
| `thumbnailAlt` | `string` | Accessible alt text for the thumbnail |
| `lead` | `ReactNode \| undefined` | Category-owned slot above badges |
| `badges` | `ReactNode[] \| undefined` | Optional badge nodes |
| `categorySlotTop` | `ReactNode \| undefined` | Optional category slot between badges and delivery |
| `categorySlotBottom` | `ReactNode \| undefined` | Optional category slot below pricing |
| `delivery` | `{ estimatedDate, shipsFrom, isExpress? }` | Delivery info |
| `returns` | `{ isReturnable }` | Returns policy |
| `pricing` | `PricingData` | Pricing data (see type for variants) |
| `onAddToCart` | `() => void` | Add to cart callback |
| `enableSelection` | `boolean \| undefined` | When true, selection checkbox appears |
| `categoryActions` | `CategoryThumbnailAction[] \| undefined` | Category-specific thumbnail actions |
| `onFavorite` | `(itemId: string) => void \| undefined` | Platform favorite action |
| `onShare` | `(itemId: string) => void \| undefined` | Platform share action |
| `onViewMedia` | `(itemId: string) => void \| undefined` | Platform view media action |
| `media360` | `{ videoUrl: string } \| undefined` | Optional 360 rotation video. When present and the viewport supports hover, the thumbnail crossfades into the video on hover and horizontal cursor position scrubs it. Omit to skip 360 on a per-item basis. |

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

### 360 media (Phase 3b)

Grid items with 360 rotation video opt in via the `media360.videoUrl` field on `GridItemData`. On pointer devices, hovering the thumbnail crossfades the static image into the video and horizontal cursor movement scrubs through the rotation. Videos are lazy-loaded via intersection observer, so off-screen items don't consume bandwidth until they scroll into view.

Touch devices skip the 360 code path entirely — no video element is mounted, no network requests are issued. Touch users access 360 content through the `viewMedia` platform action, which is expected to open a Lightbox (separate spec).

Encode source videos with dense keyframes (e.g. a keyframe every 2–3 frames) for smooth seek-based scrubbing. Sparse-keyframe videos will stutter when the cursor moves quickly.

### Phase 3a presets

Three advanced presets added in Phase 3a (unstable 0.3.0):

- `range-slider` — Numeric min/max with a two-thumb Slider and commit-on-blur inputs. Reads `min`, `max`, `step`, `unit`, `histogram`. Unit is shown as a prefix for currencies and suffix otherwise. Histogram is optional — when supplied it renders a distribution bar chart that highlights the selected sub-range.
- `multi-axis-range` — Multiple named ranges under one filter, each axis rendered as one slider + numeric input pair. Reads `axes[]`. Human-readable axis labels appear in both the filter UI and active chip text. No histogram support.
- `async-combobox` — Multi-select Combobox with lazy-loaded options. Reads `searchFn`, `searchDebounceMs`, `searchPlaceholder`. Options load on first open; subsequent queries are debounced. Selected-option labels are cached so chips survive query changes.

All three presets participate in chip truncation: for `multi-select-chips` and `async-combobox`, the first two selected values are shown inline and any additional values are collapsed to `+N more`.

## Quality checklist

- [x] Accessibility: keyboard navigable, focus trapping in drawer/popovers, aria-live for results count, semantic landmarks
- [x] Responsive: 2/3/4 column grid, mobile toolbar condensed to All Filters + Sort
- [x] Tokens only: no hardcoded visual values
