---
name: FilterToolbar
slug: filter-toolbar
version: 0.1.0
status: unstable
lastUpdated: 2026-04-21
---

# FilterToolbar

Top-of-page chrome for a filterable/sortable/searchable listing view. Renders:

- Optional search input (hidden on mobile)
- "All filters" button with badge
- Filter row that wraps; consumer-composed via `filters` prop
- "Clear all" button when any filter is engaged
- Optional sort dropdown (top-right)
- Right-side actions slot (e.g. view toggle)
- Internal sticky chrome pinned below the AppShellHeader when scrolled past, showing only engaged filters

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filters` | `ReactNode[]` | — | Pre-composed filter buttons for the main row |
| `stickyFilters` | `ReactNode[]` | — | Filter buttons for the sticky chrome (engaged subset) |
| `activeFilterCount` | `number` | — | Drives the "All filters" badge |
| `hasActiveFilters` | `boolean` | — | Gates Clear all + sticky visibility |
| `onOpenDrawer` | `() => void` | — | Opens the filter drawer |
| `onClearAll` | `() => void` | — | Clears all filters |
| `onSearchSubmit` | `(query: string) => void` | — | Enable search; fires on Enter |
| `searchPlaceholder` | `string` | `"Search..."` | Search input placeholder |
| `sortOptions` | `FilterToolbarSortOption[]` | — | Enable sort |
| `sortValue` | `string` | — | Selected sort value (controlled) |
| `onSortChange` | `(value: string) => void` | — | Sort setter |
| `actions` | `ReactNode` | — | Right-side extras (e.g. ToggleGroup) |
| `stickyTopOffset` | `number` | `72` | Pixel offset for the sticky chrome (AppShellHeader height) |
| `disableSticky` | `boolean` | `false` | Disable sticky behaviour entirely |

## Behaviour

IntersectionObserver watches the main toolbar element with `rootMargin: "-${stickyTopOffset}px 0px 0px 0px"`. When the element leaves the adjusted viewport and `hasActiveFilters` is true, the sticky chrome fades in.

## Quality checklist

- [x] Accessibility: keyboard navigable, semantic search input, aria-hidden on hidden sticky
- [x] Responsive: mobile condenses to All Filters + Sort
- [x] Tokens only: no hardcoded visual values
