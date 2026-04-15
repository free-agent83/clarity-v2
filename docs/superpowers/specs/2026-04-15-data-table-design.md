# DataTable Component — Design Spec

**Status:** Approved  
**Date:** 2026-04-15  
**Scope:** Phase 1 of 4 (core table, pagination, selection, cells, helpers)

---

## 1. Overview

`DataTable` is a fully self-contained, configuration-driven table component for data-heavy views (dashboards, list pages, admin panels). The consuming engineer provides a `config` object and a `data` array; the component handles all state, layout, and sub-component composition internally.

Built on TanStack Table (`@tanstack/react-table`) as the underlying engine. The DX mirrors TanStack's column definition model: describe what you want, not how to render it.

```tsx
<DataTable data={data} config={config} />
```

### Phased delivery

| Phase | Scope |
|-------|-------|
| **1 (this spec)** | Core table, pagination, selection bar, cells, helpers, loading/empty states |
| 2 | Toolbar: debounced search, sort dropdown, clear-all |
| 3 | Quick filter system: popover shell, checkbox-list, interval-slider, custom |
| 4 | Server-side mode |

Each phase extends `DataTableConfig` with new optional fields — all additions are backwards-compatible.

---

## 2. Architecture

### 2.1 State hook: `useDataTable`

All table state lives in an internal `useDataTable(data, config, loading)` hook. DataTable is a pure render component that consumes the hook's return value.

**Signature:**
```ts
function useDataTable<TData>(
  data: TData[],
  config: DataTableConfig<TData>,
  loading?: boolean
): UseDataTableReturn<TData>
```

**State managed internally:**
- `sorting: SortingState`
- `columnFilters: ColumnFiltersState`
- `pagination: PaginationState` (default page size from `config.pagination.pageSizeOptions[0]`, falling back to 10)
- `rowSelection: RowSelectionState`

**TanStack row models configured:**
- `getCoreRowModel`
- `getFilteredRowModel`
- `getPaginationRowModel`
- `getSortedRowModel`
- `getFacetedRowModel`
- `getFacetedUniqueValues`
- `getFacetedMinMaxValues`

**Returns:**
```ts
interface UseDataTableReturn<TData> {
  table: Table<TData>
  hasActiveFilters: boolean
}
```

The return type is minimal for Phase 1 and grows as later phases add toolbar/filter concerns.

**Runtime validation** — throws at render time with descriptive messages for:
- `enableRowSelection` is true but no column with `id === "select"` exists
- A column with `id === "select"` exists but `enableRowSelection` is not true
- (Phase 2 adds: `toolbar.search` defined but `columnIds` missing or empty)

These are developer errors caught during development, not user-facing.

### 2.2 Component tree (Phase 1)

```
DataTable
├── DataTableSelectionBar     (conditional: enableRowSelection + rows selected)
├── <table> container         (owns all table markup — no dependency on Table organism)
│   ├── <thead>
│   │   └── auto-wrapped headers via DataTableHeader
│   ├── <tbody>
│   │   ├── Skeleton rows     (when loading)
│   │   ├── Empty state       (when data empty + not loading)
│   │   └── Data rows         (auto-wrapped cells via DataTableCell)
│   └── (Phase 2: toolbar slots above table)
└── DataTablePagination
```

### 2.3 Independence from Table organism

DataTable renders raw `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` elements directly with its own styles. It does not import from `organisms/table/`. The existing Table organism is a lightweight presentation component; DataTable is for data-heavy dashboard views. Their styling trajectories diverge from day one, though the initial baseline is copied from the existing Table organism.

---

## 3. File structure

```
src/components/organisms/data-table/
├── data-table.tsx              # Root component (render + composition)
├── use-data-table.ts           # Internal hook (state + TanStack config + validation)
├── data-table-pagination.tsx   # Pagination controls (internal)
├── data-table-cells.tsx        # DataTableHeader + DataTableCell (exported)
├── data-table-selection-bar.tsx # Selection bar (internal)
├── data-table-helpers.tsx      # getSelectColumn (exported)
├── data-table-types.ts         # All shared types/interfaces
├── data-table.stories.tsx      # Stories
├── data-table.test.tsx         # Tests (useDataTable hook logic, runtime validation)
└── COMPONENT.md
```

All internal sub-components are single-file. If a file grows unwieldy in later phases, we extract — but not preemptively.

---

## 4. Types (Phase 1)

```ts
interface DataTableConfig<TData> {
  columns: ColumnDef<TData>[]
  pagination?: DataTablePaginationConfig
  enableRowSelection?: boolean
  selectionActions?: (rows: TData[], clearSelection: () => void) => ReactNode
  emptyState?: ReactNode
  // Phase 2: toolbar?: DataTableToolbarConfig
  // Phase 4: serverSide?: DataTableServerSideConfig<TData>
}

interface DataTablePaginationConfig {
  pageSizeOptions?: number[]  // default: [10, 20, 30, 40, 50]
}

interface DataTableProps<TData> {
  data: TData[]
  config: DataTableConfig<TData>
  loading?: boolean
}

interface DataTableHeaderProps extends React.ComponentProps<"div"> {
  children: ReactNode
}

interface DataTableCellProps extends React.ComponentProps<"div"> {
  children: ReactNode
}
```

`ColumnDef<TData>` is imported directly from `@tanstack/react-table` — no wrapper type.

---

## 5. Components

### 5.1 `DataTable`

Root component. Calls `useDataTable`, composes all sub-components.

**Render order (top to bottom):**
1. `DataTableSelectionBar` — conditional (selection active)
2. Table container (`overflow-hidden rounded-[radius token] border`) with raw table markup
3. `<thead>` — iterates `table.getHeaderGroups()`, renders via `flexRender` with auto-wrapping
4. `<tbody>` — three states:
   - `loading === true` → Skeleton rows
   - `data` empty and not loading → centered "No results." (or custom `emptyState`)
   - Otherwise → data rows via `flexRender` with auto-wrapping
5. `DataTablePagination`

**Auto-wrapping:**
After `flexRender` returns a value:
- Primitive (string/number) → wrap in `DataTableHeader` (for headers) or `DataTableCell` (for cells)
- JSX → render as-is

This keeps column definitions minimal. Most columns just need `header: "Price"` to get correct styling.

### 5.2 `DataTablePagination`

Internal. Receives `table` instance and optional `pageSizeOptions`.

No awareness of row selection — that's `DataTableSelectionBar`'s concern.

**Layout (centered):**
```
Desktop:
[ Rows per page ▾ ]   Page X of Y   [ « ] [ ‹ ] [ › ] [ » ]

Mobile:
Page X of Y   [ ‹ ] [ › ]
```

- Rows-per-page: `Select` component from the library. Hidden on mobile.
- Page indicator: "Page X of Y" text.
- Navigation: `Button` components with Tabler chevron icons. First/last hidden on mobile.
- All buttons disable at boundaries.

### 5.3 `DataTableSelectionBar`

Internal. Rendered when `enableRowSelection` is true and at least one row is selected.

**Position:** Fixed to the bottom of the viewport at a higher z-index. The user can scroll through long lists while bulk actions remain accessible.

**Layout:**
```
[ N row(s) selected ]  ·····················  [ ...selectionActions ]  [ Clear selection ]
```

- Left: selected row count.
- Right: consumer-provided `selectionActions`, then "Clear selection" button (rightmost).
- "Clear selection" calls `table.resetRowSelection()`.
- Selection persists across page changes.

**`selectionActions` config:**
```ts
selectionActions?: (rows: TData[], clearSelection: () => void) => ReactNode
```

### 5.4 `DataTableHeader` and `DataTableCell`

Exported. Thin styled containers for consistent cell typography and spacing.

Both render a `<div>` inside the semantic `<th>`/`<td>` that DataTable provides. They handle the text styling layer. Custom JSX in column definitions skips these containers entirely.

Both extend `React.ComponentProps<"div">` — accept `className` for one-off overrides via `cn()`.

### 5.5 `getSelectColumn<TData>()`

Exported helper. Returns a `ColumnDef<TData>` for row selection:
- `id: "select"`
- Header: `Checkbox` with indeterminate state
- Cell: per-row `Checkbox`
- `enableSorting: false`, `enableHiding: false`

Both `getSelectColumn()` in columns and `enableRowSelection: true` in config are required. Providing one without the other is a runtime validation error.

---

## 6. Loading and empty states

**Loading:** Always Skeleton rows. Not configurable. Renders a number of placeholder rows matching the current `pageSize`, with one Skeleton per visible column. Prevents visual jump between loading and loaded states.

**Empty:** Default is centered "No results." text spanning all columns (matching shadcn baseline). Overridable via `emptyState` in config for custom content (icons, illustrations, action buttons, etc.).

---

## 7. Styling decisions

- **No dependency on Table organism.** DataTable owns all its own table markup and styles, copied from the existing Table organism as a starting point but free to diverge.
- **Border radius:** Uses the same radius token as other components in the library.
- **No sticky header.**
- **Icons:** Tabler icons (`@tabler/icons-react`) for pagination chevrons.
- **Token-only styling:** All visual values come through Tailwind theme utilities or `var(--token)` references. No hardcoded hex, px, or other raw literals.

---

## 8. Dependencies

**New production dependency:**
- `@tanstack/react-table` — added to `packages/components/package.json`

**New shared utility:**
- `useDebounce` hook in `src/hooks/use-debounce.ts` — built in Phase 1, consumed by toolbar search in Phase 2

**Library components consumed:**
- `Button` (pagination, selection bar)
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem` (rows-per-page)
- `Checkbox` (getSelectColumn)
- `Skeleton` (loading state)
- `Label` (rows-per-page accessibility)

---

## 9. Exports

Added to `packages/components/src/index.ts`:

**Components:** `DataTable`, `DataTableHeader`, `DataTableCell`  
**Helpers:** `getSelectColumn`  
**Types:** `DataTableProps`, `DataTableConfig`, `DataTablePaginationConfig`, `DataTableHeaderProps`, `DataTableCellProps`

---

## 10. Deliverable: update master spec

At the end of Phase 1, update the master DataTable spec (`datatable-spec.md`) to incorporate all decisions made during this phase:

- Phased delivery model (4 phases)
- Independence from Table organism (own markup and styles)
- `useDataTable` internal hook (state extraction pattern)
- No sticky header
- No custom loading state (Skeleton rows only, not configurable)
- `emptyState` configurable, `loadingState` removed from config
- Selection bar fixed to viewport bottom, "Clear selection" rightmost
- Pagination centered, no selection count (that's SelectionBar's concern)
- Tabler icons for pagination
- `useDebounce` as a shared hook in `src/hooks/`
- Radius token matches library convention

This ensures the spec handed to Phase 2 reflects the actual implementation, not the original draft.

---

## 11. Future phases (out of scope)

Documented here for context. Each phase gets its own spec when active.

| Phase | Adds |
|-------|------|
| 2 | `DataTableToolbar` (search, sort dropdown, clear-all), `useDebounce` consumed |
| 3 | `DataTableQuickFilterPopover`, `DataTableCheckboxFilter`, `DataTableSliderFilter`, `DataTableCustomFilter` |
| 4 | `serverSide` config, `onSortingChange`/`onFiltersChange`/`onPaginationChange`/`onSearchChange` handlers |
