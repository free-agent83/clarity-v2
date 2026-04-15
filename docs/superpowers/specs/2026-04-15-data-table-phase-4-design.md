# DataTable Phase 4 Design Spec — Server-Side Mode

**Status:** Approved  
**Date:** 2026-04-15  
**Phase:** 4 of 4  
**Depends on:** Phase 3 (complete)

---

## 1. Scope

Phase 4 adds a server-side mode where sorting, filtering, pagination, and search are delegated to the server via callbacks. The table still owns all UI state internally; the callbacks are notifications that let the consumer fetch new data.

- **`DataTableServerSideConfig`** — new config object with `totalRows` and separate callbacks
- **Enter-to-search** — search fires on Enter key in server-side mode instead of debounce
- **Consumer-provided filter metadata** — `options`, `min`/`max` on quick filters via a nested `serverSide` property
- **Loading state toolbar disable** — all toolbar controls and pagination disabled when `loading={true}` (both modes)
- **Dedicated `onClearAll` callback** — consumer re-fetches unfiltered data
- **Validation** — enforces required fields and at least one callback
- **Stories** — deterministic fake async stories with play functions + a live DummyJSON demo story

**Explicitly out of scope:**

- Infinite scroll / virtual scrolling
- Optimistic UI (selected sort/filter shown before server confirms)
- Cursor-based pagination (only offset-based via `pageIndex`/`pageSize`)

---

## 2. Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Separate callbacks (`onSortChange`, `onFilterChange`, `onSearchChange`, `onPageChange`) | Consumer wires each to its own fetch logic; cleaner than a single `onChange` with a discriminated union |
| 2 | Enter-to-search in server-side mode | Avoids firing a network request on every keystroke; user commits their search explicitly |
| 3 | Consumer provides filter metadata via `serverSide` property on `QuickFilter` | Faceted values can't be derived from a single page; `serverSide` nesting makes server-only config obvious at a glance |
| 4 | `loading` disables toolbar in both modes | Loading means loading regardless of mode; prevents stacking interactions during any fetch |
| 5 | Dedicated `onClearAll` callback instead of firing individual callbacks | Consumer can re-use their initial fetch (with pagination), which is effectively the same call |
| 6 | Internal state still maintained in server-side mode | TanStack Table needs state for UI rendering (active sort label, filter triggers, pagination position); callbacks are notifications, not state owners |
| 7 | Conditional row models — skip `getFilteredRowModel`, `getSortedRowModel`, faceted models in server-side mode | Unnecessary overhead; the server handles all data operations |
| 8 | Fake async stories for testable play functions + live DummyJSON story for interactive demo | CI never breaks on a third-party service; developers can still play with real async behavior |

---

## 3. New type: `DataTableServerSideConfig`

Added to `data-table-types.ts`:

```ts
/**
 * Server-side configuration for DataTable.
 *
 * When provided, the table delegates sorting, filtering, pagination, and
 * search to the server via callbacks. The consumer manages data fetching;
 * the table manages UI state and fires callbacks on user interaction.
 */
interface DataTableServerSideConfig {
  /** Total row count across all pages — required for pagination page count. */
  totalRows: number
  /** Fires when the user changes the sort order. */
  onSortChange?: (sorting: SortingState) => void
  /** Fires when a quick filter is applied or cleared. */
  onFilterChange?: (columnId: string, value: unknown) => void
  /** Fires when the user presses Enter in the search input. */
  onSearchChange?: (search: string) => void
  /** Fires when the user navigates pages or changes page size. */
  onPageChange?: (pagination: PaginationState) => void
  /** Fires when the user clicks "Clear all" — consumer re-fetches unfiltered data. */
  onClearAll?: () => void
}
```

`DataTableConfig<TData>` gains:

```ts
serverSide?: DataTableServerSideConfig
```

---

## 4. QuickFilter type changes

Optional `serverSide` property on each union variant. Required in server-side mode, ignored in client-side mode:

```ts
type QuickFilter =
  | {
      name: string
      columnId: string
      type: "checkbox-list"
      serverSide?: {
        /** All possible filter options — required because faceted values can't be derived from one page. */
        options: string[]
      }
    }
  | {
      name: string
      columnId: string
      type: "interval-slider"
      formatValue?: (value: number) => string
      serverSide?: {
        /** Slider minimum bound. */
        min: number
        /** Slider maximum bound. */
        max: number
      }
    }
```

In client-side mode, the popover derives options from `getFacetedUniqueValues()` and bounds from `getFacetedMinMaxValues()`. In server-side mode, it reads from `filter.serverSide.options` / `filter.serverSide.min` / `filter.serverSide.max`.

---

## 5. Hook changes (`use-data-table.ts`)

### 5.1 TanStack Table configuration

When `config.serverSide` is present:

```ts
manualSorting: true
manualFiltering: true
manualPagination: true
pageCount: Math.ceil(config.serverSide.totalRows / pageSize)
```

### 5.2 Conditional row models

Client-side mode (existing):
```ts
getCoreRowModel: getCoreRowModel()
getFilteredRowModel: getFilteredRowModel()
getPaginationRowModel: getPaginationRowModel()
getSortedRowModel: getSortedRowModel()
getFacetedRowModel: getFacetedRowModel()
getFacetedUniqueValues: getFacetedUniqueValues()
getFacetedMinMaxValues: getFacetedMinMaxValues()
```

Server-side mode:
```ts
getCoreRowModel: getCoreRowModel()
getPaginationRowModel: getPaginationRowModel()
// All others omitted — server handles sorting, filtering, facets
```

### 5.3 Callback firing

Use `useEffect` to fire callbacks when state changes:

```ts
// Sort callback
useEffect(() => {
  if (serverSide?.onSortChange) {
    serverSide.onSortChange(sorting)
  }
}, [sorting])

// Filter callback
useEffect(() => {
  if (serverSide?.onFilterChange) {
    for (const filter of columnFilters) {
      serverSide.onFilterChange(filter.id, filter.value)
    }
  }
}, [columnFilters])

// Page callback
useEffect(() => {
  if (serverSide?.onPageChange) {
    serverSide.onPageChange(pagination)
  }
}, [pagination])
```

Search callback is handled differently — see section 6.

### 5.4 `resetAllFilters` in server-side mode

In addition to clearing internal state, calls the dedicated `onClearAll` callback:

```ts
const resetAllFilters = () => {
  table.resetColumnFilters()
  setGlobalFilter("")
  config.serverSide?.onClearAll?.()
}
```

---

## 6. Search behavior

### 6.1 Client-side mode (unchanged)

Debounced via `useDebounce` hook. Fires `setGlobalFilter` after debounce delay (default 300ms). Clear (x) button clears immediately.

### 6.2 Server-side mode

- Typing updates `localSearch` state (controlled input, immediate visual feedback)
- No debounce — `useEffect` syncing `debouncedSearch` to `setGlobalFilter` is skipped
- On **Enter keypress**: `setGlobalFilter(localSearch)` fires, which triggers `onSearchChange` callback
- Clear (x) button: clears `localSearch` and fires `setGlobalFilter("")` + `onSearchChange("")`

The toolbar detects server-side mode via a new `serverSide` boolean prop (or by checking config presence) and swaps behavior accordingly.

---

## 7. Loading states

When `loading={true}` (both client-side and server-side mode):

| Control | Behavior |
|---------|----------|
| Sort button | `disabled` prop |
| Quick filter triggers | `disabled` prop |
| Search input | `disabled` prop on the input |
| Pagination (prev/next) | `disabled` prop |
| Page size selector | `disabled` prop |
| Table body | Skeleton rows (existing, no change) |

The `loading` prop is passed from `DataTable` root to `DataTableToolbar` and `DataTablePagination` as a new prop. No new API surface for the consumer — just the existing `loading` prop doing more work.

---

## 8. Quick filter popover changes

The popover needs to know where to get its options/bounds:

```ts
// Checkbox-list options
const options = filter.serverSide?.options
  ?? Array.from(column.getFacetedUniqueValues().keys()).sort()

// Interval-slider bounds
const [min, max] = filter.serverSide
  ? [filter.serverSide.min, filter.serverSide.max]
  : column.getFacetedMinMaxValues() ?? [0, 100]
```

This is a single branch in `DataTableQuickFilterPopover` — no new component needed.

---

## 9. Validation

New rules when `config.serverSide` is present:

| Rule | Error message |
|------|---------------|
| `totalRows` must be a non-negative number | `DataTable: serverSide.totalRows must be a non-negative number.` |
| At least one callback provided | `DataTable: serverSide is set but no callbacks are provided. Add at least one of: onSortChange, onFilterChange, onSearchChange, onPageChange, onClearAll.` |
| Checkbox-list filter missing `serverSide.options` | `DataTable: Quick filter "${name}" (checkbox-list) requires serverSide.options when serverSide mode is enabled.` |
| Interval-slider filter missing `serverSide.min`/`max` | `DataTable: Quick filter "${name}" (interval-slider) requires serverSide.min and serverSide.max when serverSide mode is enabled.` |

Existing validation rules (column ID references, selection config, search/sort column IDs, quickFilter duplicates) remain unchanged.

---

## 10. Stories

| Story | Mode | Config | Play function |
|-------|------|--------|---------------|
| `ServerSide` | Server-side | Full toolbar (search, filters, sorting) + fake async helper | Verifies loading skeletons → data renders → pagination shows total |
| `ServerSideSearch` | Server-side | Search only | Types search term → presses Enter → verifies filtered results |
| `ServerSideSorting` | Server-side | Sort dropdown | Selects sort option → verifies re-fetch and sorted data |
| `ServerSideFilters` | Server-side | Quick filters (checkbox + slider) | Applies filter → verifies re-fetch → Clear all → verifies reset |
| `LiveAPI` | Server-side | DummyJSON `/products` endpoint, full toolbar | No play function — interactive demo only |

### Fake async helper

A utility function wrapping local data with simulated server-side operations:

```ts
function createFakeServerFetcher(allData: Product[]) {
  return async (params: {
    sorting?: SortingState
    filters?: ColumnFiltersState
    search?: string
    pagination: PaginationState
  }): Promise<{ data: Product[]; totalRows: number }> => {
    await new Promise((r) => setTimeout(r, 500)) // simulate latency
    let result = [...allData]
    // Apply search, filters, sorting in-memory
    // Slice for pagination
    // Return page + total count
  }
}
```

---

## 11. Tests (`data-table.test.tsx`)

New `validateConfig` test cases:

| Test | Input | Expected |
|------|-------|----------|
| `serverSide with no callbacks throws` | `serverSide: { totalRows: 100 }` | Error |
| `serverSide with negative totalRows throws` | `serverSide: { totalRows: -1, onPageChange: fn }` | Error |
| `serverSide checkbox filter missing options throws` | Checkbox filter without `serverSide.options` + `config.serverSide` set | Error |
| `serverSide slider filter missing min/max throws` | Slider filter without `serverSide.min`/`max` + `config.serverSide` set | Error |
| `valid serverSide config passes` | Complete config with callbacks and filter metadata | No error |

---

## 12. Barrel exports

Export `DataTableServerSideConfig` type from `index.ts`.

---

## 13. File change summary

| File | Change |
|------|--------|
| `data-table-types.ts` | Add `DataTableServerSideConfig`, `serverSide?` on `DataTableConfig`, `serverSide?` on `QuickFilter` variants |
| `use-data-table.ts` | Manual flags, conditional row models, callback `useEffect`s, `resetAllFilters` calls `onClearAll` |
| `data-table-toolbar.tsx` | Accept `loading` prop, disable controls when loading, Enter-to-search in server-side mode |
| `data-table-quick-filter-popover.tsx` | Read options/bounds from `filter.serverSide` when present |
| `data-table-pagination.tsx` | Accept `loading` prop, disable controls when loading |
| `data-table.tsx` | Pass `loading` to toolbar and pagination |
| `data-table.stories.tsx` | 5 new stories (4 with play functions + 1 live demo) |
| `data-table.test.tsx` | 5 new validation tests |
| `COMPONENT.md` | Document server-side config |
| `index.ts` | Export `DataTableServerSideConfig` type |
