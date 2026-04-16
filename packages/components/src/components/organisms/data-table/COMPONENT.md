---
name: DataTable
slug: data-table
version: 0.1.0
status: unstable
lastUpdated: 2026-04-16
---

# DataTable

A configuration-driven data table component built on TanStack Table. Owns all table state internally — the consuming engineer provides a `config` object and a `data` array, and the component handles sorting, filtering, pagination, and row selection.

Designed for data-heavy views: dashboards, list pages, admin panels.

## Props

### DataTable

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TData[]` | — | The data array to display |
| `config` | `DataTableConfig<TData>` | — | Configuration object driving all table behaviour |
| `loading` | `boolean` | `false` | When true, renders skeleton placeholder rows |

### DataTableConfig

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDef<TData>[]` | — | TanStack Table column definitions |
| `toolbar` | `DataTableToolbarConfig` | — | Toolbar configuration (search, sort) |
| `pagination` | `DataTablePaginationConfig` | — | Pagination options |
| `enableRowSelection` | `boolean` | `false` | Enable row selection checkboxes |
| `selectionActions` | `(rows, clearSelection) => ReactNode` | — | Custom actions rendered in the selection bar |
| `emptyState` | `ReactNode` | `"No results."` | Custom empty state content |
| `serverSide` | `DataTableServerSideConfig` | — | Server-side mode configuration (callbacks + total count) |

### DataTablePaginationConfig

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageSizeOptions` | `number[]` | `[10, 20, 30, 40, 50]` | Available page sizes. First value is the default. |

### DataTableToolbarConfig

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `search` | `{ placeholder?, columnIds, debounceMs? }` | — | Search input configuration |
| `search.placeholder` | `string` | `"Search..."` | Placeholder text for the search input |
| `search.columnIds` | `string[]` | — | Column IDs to include in global search (required, non-empty) |
| `search.debounceMs` | `number` | `300` | Debounce delay in milliseconds |
| `sorting` | `SortOption[]` | — | Preset sort options for the sort dropdown |
| `quickFilters` | `QuickFilter[]` | — | Quick filter popovers rendered in the toolbar |

### SortOption

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Human-readable label shown in the dropdown |
| `columnId` | `string` | — | Column to sort by |
| `direction` | `"asc" \| "desc"` | — | Sort direction |

### QuickFilter

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | Label shown on the filter trigger button |
| `columnId` | `string` | — | Column to filter (must match a column in `columns`) |
| `type` | `"checkbox-list" \| "interval-slider"` | — | Filter type |
| `labelMap` | `Record<string, string>` | — | Maps raw filter values to human-readable labels (checkbox-list only). Raw value shown when a key is missing. |
| `formatValue` | `(value: number) => string` | `String` | Format function for slider range display (interval-slider only) |

### DataTableServerSideConfig

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `totalRows` | `number` | — | Total row count across all pages (required for pagination) |
| `onSortChange` | `(sorting: SortingState) => void` | — | Fires when the user changes the sort order |
| `onFilterChange` | `(columnId: string, value: unknown) => void` | — | Fires when a quick filter is applied or cleared |
| `onSearchChange` | `(search: string) => void` | — | Fires when the user presses Enter in the search input |
| `onPageChange` | `(pagination: PaginationState) => void` | — | Fires when the user navigates pages or changes page size |
| `onClearAll` | `() => void` | — | Fires when the user clicks "Clear all" |

### QuickFilter `serverSide` (server-side mode only)

**Checkbox-list:**

| Prop | Type | Description |
|------|------|-------------|
| `options` | `string[]` | All possible filter options (required in server-side mode) |

**Interval-slider:**

| Prop | Type | Description |
|------|------|-------------|
| `min` | `number` | Slider minimum bound (required in server-side mode) |
| `max` | `number` | Slider maximum bound (required in server-side mode) |

### DataTableHeader / DataTableCell

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Cell content |
| `className` | `string` | — | Additional CSS classes |

## Usage guidelines

**Do** use DataTable for data-heavy views with pagination, sorting, or row selection.

**Don't** use DataTable for simple, small, static tables — use the Table organism directly instead.

**Don't** lift table state to the page level. DataTable owns all state internally. Use `selectionActions` to react to selection, not external state management.

**Do** use `toolbar.search.columnIds` to explicitly opt columns into global search. Columns not listed are excluded.

**Don't** configure `toolbar.sorting` options that reference columns not in your `columns` array — this is a runtime error.

**Do** use `toolbar.quickFilters` for columns with a small set of discrete values (checkbox-list) or numeric ranges (interval-slider). Each filter renders as a popover with pending state — changes apply on "Apply".

**Don't** configure two quick filters with the same `columnId` — this is a runtime error.

**Do** use `labelMap` on checkbox-list quick filters when column values are machine-readable enums (e.g. `sold_out`). The mapping is a presentation concern — keep server data untouched and let the table config translate at render time.

**Do** use `serverSide` when data is fetched from an API. Provide `totalRows` and at least one callback. The table manages UI state; your callbacks manage data fetching.

**Do** provide `serverSide.options` on checkbox-list filters and `serverSide.min`/`max` on interval-slider filters when using server-side mode — faceted values can't be derived from a single page.

**Don't** mix client-side and server-side patterns. When `serverSide` is set, the table skips all client-side sorting, filtering, and faceting.

**Do** use `loading={true}` during fetches — this disables toolbar controls and pagination, preventing request stacking.

## Best practices

**Do:** Define columns outside the component to avoid re-creation on every render.

```tsx
// Good — stable reference
const columns: ColumnDef<Product>[] = [
  { accessorKey: "name", header: "Name" },
]

function Page() {
  return <DataTable data={data} config={{ columns }} />
}
```

**Don't:** Define columns inline inside JSX.

```tsx
// Bad — new array on every render
function Page() {
  return (
    <DataTable
      data={data}
      config={{
        columns: [{ accessorKey: "name", header: "Name" }],
      }}
    />
  )
}
```

**Do:** Use `getSelectColumn()` with `enableRowSelection: true` — both are required.

**Don't:** Provide `getSelectColumn()` without `enableRowSelection` or vice versa — this is a runtime error.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Responsive: pagination adapts (rows-per-page and first/last hidden on mobile)
- [x] Tokens only: no hardcoded visual values
