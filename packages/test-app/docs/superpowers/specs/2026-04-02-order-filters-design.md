# Order Filters, Search, and Sorting

**Issue:** #18
**Date:** 2026-04-02

## Overview

Wire up all filter, search, and sort controls on the orders page. Extract the existing PLP filter components into shared, reusable components so that behavior and UI are consistent platform-wide.

All filtering, searching, and sorting is client-side on the loaded dataset.

## Shared Component Extraction

### What moves

The following components move from `components/layouts/layout-product-list/` to `components/filters/`:

- `FilterBar` (includes `FilterPopover` and `AllFiltersSheet`)
- `SortButton`

A new `SearchInput` component is created in `components/filters/`.

### FilterBar changes

The `FilterBar` currently manages state internally via `useState` and does not expose it. It needs to become a controlled component so parent pages can read and write filter state (e.g., grid tabs setting the status filter).

New props:

- `value: Record<string, string[]>` -- the current committed filter state, owned by the parent.
- `onChange: (filters: Record<string, string[]>) => void` -- fires when the user applies or clears filters.

Internal `useState` for committed filters is removed. The component still manages its own pending/popover-open state (transient UI state stays local), but the source of truth for committed filters moves to the parent.

The existing `FilterOption` type (`{ key, label, options }`) and the visual behavior (popovers with checkboxes, apply/cancel, "All filters" sheet, "Clear all" button, count badges on active buttons) remain unchanged.

### SortButton changes

Same pattern:

- `value: string` -- the currently selected sort value, owned by the parent.
- `onChange: (value: string) => void` -- fires on selection.

The `SortOption` type (`{ value, label, displayLabel }`) remains unchanged.

### SearchInput (new)

`components/filters/search-input.tsx`

A form-based search input that fires on submit (Enter key), not on every keystroke.

Props:

- `onSearch: (query: string) => void` -- fires on form submit and on clear.
- `placeholder?: string` -- defaults to "Search...".

Renders a `<form>` wrapping the magnifying glass icon + input. A clear button (x icon) appears when there is text; clicking it clears the input and fires `onSearch("")`. Styling matches the existing dark-background search input (`h-11 border-none bg-secondary pl-9 shadow-none`).

### Updating existing consumers

`LayoutProductList` and all PLP pages update their imports to point to `components/filters/`. `LayoutProductList` replaces its static `<Input>` with `<SearchInput>`. PLP pages adopt the controlled props, though the PLP filtering logic itself is out of scope for this issue.

## Orders Page Architecture

### Three-layer pattern

This establishes a reusable pattern for all data grid views with filtering:

1. **Server Component** (`page.tsx`) -- fetches initial data from the database.
2. **RealtimeWrapper** (client) -- subscribes to Supabase Realtime, provides the current live dataset. This boundary stays wide so admin mutations propagate to all consumers.
3. **FilterableList** (client) -- receives the full dataset, owns all filter/sort/search state, applies the filtering pipeline, renders the result.

### OrdersFilterableList

New client component: `components/orders/orders-filterable-list.tsx`

**State it owns:**

- `filters: Record<string, string[]>` -- all committed filter values. The `status` key is shared between grid tabs and the Status filter popover.
- `sortValue: string` -- currently selected sort option.
- `searchQuery: string` -- the submitted search query.

The active grid tab is derived from `filters.status` -- not stored as separate state.

**What it renders:**

- Grid tabs (status quick-filters)
- `SearchInput`
- `FilterBar` + `SortButton` (from shared components)
- Orders table
- Pagination controls

**Filtering pipeline** (applied in sequence):

1. **Search** -- matches `orderNumber` and product snapshot fields (`description`, `title`) against the query string (case-insensitive substring match).
2. **Filters** -- for each active filter key, checks the relevant order field. An order must match at least one selected value in every active filter (AND across filters, OR within a filter).
3. **Sort** -- sorts by the selected field/direction.
4. **Paginate** -- slices for the current page (client-side pagination on the filtered result).

### OrdersRealtimeWrapper

The existing `OrdersRealtimeWrapper` stays as the realtime data boundary. It receives initial data from the server, subscribes to live updates via `useRealtimeSync`, and passes the full current dataset down to `OrdersFilterableList` as a prop. Table rendering moves out of this component and into `OrdersFilterableList`.

## Grid Tabs and Status Filter Sync

The grid tabs and the "Status" filter popover are two views of the same state: `filters.status`.

**Tab-to-status mapping:**

| Tab | Status values |
|---|---|
| All items | `[]` (no filter) |
| Pending | `["Requested"]` |
| Confirmed | `["Confirmed", "Manufacturing"]` |
| In transit | `["Shipped"]` |
| Action required | `["Delayed"]` |

**Behavior:**

- Clicking a grid tab sets `filters.status` to that tab's values.
- Using the Status filter popover updates `filters.status`, and the grid tabs reflect it: if the selected values exactly match a tab's definition, that tab shows as active. Otherwise "All" is active.
- Tab counts are computed from data after applying search and all non-status filters, but before applying the status filter. Each tab shows how many orders it would display if clicked.

## Filter Configuration

### Filters

| Key | Label | Type | Options | Maps to |
|---|---|---|---|---|
| `status` | Status | Multi-select | Requested, Confirmed, Manufacturing, Shipped, Delivered, Returned, Cancelled, Delayed | `order.currentStatus.value` |
| `item_type` | Item type | Multi-select | Natural Diamond, Lab Grown Diamond, Gemstone, Natural Melee, Lab Grown Melee, Engagement Ring, Wedding Band, Tennis Bracelet | Product snapshot `productType` |
| `order_date` | Order date | Multi-select (presets) | Last 7 days, Last 30 days, Last 3 months, Last 6 months, Last year | `order.orderDate` compared against date ranges |
| `returnable` | Returnable | Multi-select | Yes, No | Derived from order data (mock if no field exists) |
| `confirmed_by` | Confirmed by | Multi-select | Distinct values from loaded data | Supplier name from product snapshot or order metadata |
| `ship_to` | Ship to | Multi-select | Distinct delivery countries from loaded data | `order.deliveryAddress.country` |

### Sort options

| Value | Label | Display label | Default |
|---|---|---|---|
| `order_date_desc` | Order date (newest) | Order date | Yes |
| `order_date_asc` | Order date (oldest) | Order date (oldest) | |
| `price_desc` | Price: High to Low | Price (high) | |
| `price_asc` | Price: Low to High | Price (low) | |
| `status` | Status | Status | |
| `est_delivery` | Est. delivery | Est. delivery | |

### Search

Matches against `order.orderNumber` and product snapshot fields (`description`, `title`). Case-insensitive substring match. Fires on form submit (Enter key), not on every keystroke.

## Out of Scope

- Server-side filtering or URL param persistence (Phase 0 is client-side only).
- PLP filtering logic (PLP pages adopt the shared components but their filter-to-data wiring is a separate issue).
- "Confirmed by" and "Returnable" field additions to the order schema -- these are mocked from available data or hardcoded for now.
