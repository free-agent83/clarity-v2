# DataTable Phase 4 — Server-Side Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add server-side mode where sorting, filtering, pagination, and search are delegated to the server via callbacks, while the table still owns all UI state internally.

**Architecture:** A new optional `serverSide` field on `DataTableConfig` switches the hook to manual mode (TanStack Table's `manualSorting`/`manualFiltering`/`manualPagination`). The hook fires consumer callbacks via `useEffect` when state changes. The toolbar and pagination accept a `loading` prop to disable controls during fetches.

**Tech Stack:** React 19, TypeScript 5.9, TanStack Table `@tanstack/react-table`, Tailwind v4, Radix UI primitives, Vitest, Storybook CSF3

---

### Task 1: Add `DataTableServerSideConfig` type and update `QuickFilter`

**Files:**
- Modify: `packages/components/src/components/organisms/data-table/data-table-types.ts`

- [ ] **Step 1: Add the `SortingState` and `PaginationState` imports**

At the top of `data-table-types.ts`, add the TanStack Table type imports needed by the new config:

```ts
import type { ColumnDef, SortingState, PaginationState } from "@tanstack/react-table"
```

Replace the existing `import type { ColumnDef } from "@tanstack/react-table"` line.

- [ ] **Step 2: Add `DataTableServerSideConfig` interface**

Add this after the `DataTablePaginationConfig` interface (after line 31):

```ts
/**
 * Server-side configuration for DataTable.
 *
 * When provided, the table delegates sorting, filtering, pagination, and
 * search to the server via callbacks. The consumer manages data fetching;
 * the table manages UI state and fires callbacks on user interaction.
 */
export interface DataTableServerSideConfig {
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

- [ ] **Step 3: Add `serverSide?` to `DataTableConfig`**

Add `serverSide?: DataTableServerSideConfig` to the `DataTableConfig` interface, after the `emptyState` field:

```ts
export interface DataTableConfig<TData> {
  columns: ColumnDef<TData, unknown>[]
  toolbar?: DataTableToolbarConfig
  pagination?: DataTablePaginationConfig
  enableRowSelection?: boolean
  selectionActions?: (rows: TData[], clearSelection: () => void) => ReactNode
  emptyState?: ReactNode
  serverSide?: DataTableServerSideConfig
}
```

- [ ] **Step 4: Add `serverSide?` property to `QuickFilter` variants**

Update the `QuickFilter` type to include the optional `serverSide` property on each variant:

```ts
export type QuickFilter =
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

- [ ] **Step 5: Verify TypeScript compiles**

Run: `cd packages/components && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/organisms/data-table/data-table-types.ts
git commit -m "feat(data-table): add DataTableServerSideConfig type and QuickFilter serverSide fields"
```

---

### Task 2: Add server-side validation (TDD)

**Files:**
- Modify: `packages/components/src/components/organisms/data-table/data-table.test.tsx`
- Modify: `packages/components/src/components/organisms/data-table/use-data-table.ts`

- [ ] **Step 1: Write failing tests for server-side validation**

Add these tests at the end of the `describe("validateConfig")` block in `data-table.test.tsx`:

```ts
it("throws when serverSide has no callbacks", () => {
  const config: DataTableConfig<{ name: string }> = {
    columns: [{ accessorKey: "name", header: "Name" }],
    serverSide: { totalRows: 100 },
  }
  expect(() => validateConfig(config)).toThrow(
    "serverSide is set but no callbacks are provided"
  )
})

it("throws when serverSide.totalRows is negative", () => {
  const config: DataTableConfig<{ name: string }> = {
    columns: [{ accessorKey: "name", header: "Name" }],
    serverSide: { totalRows: -1, onPageChange: () => {} },
  }
  expect(() => validateConfig(config)).toThrow(
    "serverSide.totalRows must be a non-negative number"
  )
})

it("throws when serverSide checkbox filter missing options", () => {
  const config: DataTableConfig<{ name: string; category: string }> = {
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "category", header: "Category" },
    ],
    toolbar: {
      quickFilters: [
        { name: "Category", columnId: "category", type: "checkbox-list" },
      ],
    },
    serverSide: { totalRows: 100, onFilterChange: () => {} },
  }
  expect(() => validateConfig(config)).toThrow(
    'Quick filter "Category" (checkbox-list) requires serverSide.options when serverSide mode is enabled'
  )
})

it("throws when serverSide slider filter missing min/max", () => {
  const config: DataTableConfig<{ name: string; price: number }> = {
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "price", header: "Price" },
    ],
    toolbar: {
      quickFilters: [
        { name: "Price", columnId: "price", type: "interval-slider" },
      ],
    },
    serverSide: { totalRows: 100, onFilterChange: () => {} },
  }
  expect(() => validateConfig(config)).toThrow(
    'Quick filter "Price" (interval-slider) requires serverSide.min and serverSide.max when serverSide mode is enabled'
  )
})

it("does not throw for valid serverSide config", () => {
  const config: DataTableConfig<{ name: string; category: string; price: number }> = {
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "category", header: "Category" },
      { accessorKey: "price", header: "Price" },
    ],
    toolbar: {
      quickFilters: [
        {
          name: "Category",
          columnId: "category",
          type: "checkbox-list",
          serverSide: { options: ["Rings", "Necklaces"] },
        },
        {
          name: "Price",
          columnId: "price",
          type: "interval-slider",
          serverSide: { min: 0, max: 5000 },
        },
      ],
    },
    serverSide: { totalRows: 100, onFilterChange: () => {} },
  }
  expect(() => validateConfig(config)).not.toThrow()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/components && npx vitest run src/components/organisms/data-table/data-table.test.tsx`
Expected: 5 new tests FAIL (validation logic not yet implemented)

- [ ] **Step 3: Implement server-side validation in `validateConfig`**

Add this block at the end of the `validateConfig` function in `use-data-table.ts`, after the existing quickFilters validation (after the closing brace of the `if (config.toolbar?.quickFilters)` block, around line 96):

```ts
if (config.serverSide) {
  if (config.serverSide.totalRows < 0) {
    throw new Error(
      "DataTable: serverSide.totalRows must be a non-negative number."
    )
  }

  const hasCallback =
    config.serverSide.onSortChange ||
    config.serverSide.onFilterChange ||
    config.serverSide.onSearchChange ||
    config.serverSide.onPageChange ||
    config.serverSide.onClearAll
  if (!hasCallback) {
    throw new Error(
      "DataTable: serverSide is set but no callbacks are provided. " +
        "Add at least one of: onSortChange, onFilterChange, onSearchChange, onPageChange, onClearAll."
    )
  }

  if (config.toolbar?.quickFilters) {
    for (const filter of config.toolbar.quickFilters) {
      if (filter.type === "checkbox-list" && !filter.serverSide?.options) {
        throw new Error(
          `DataTable: Quick filter "${filter.name}" (checkbox-list) requires serverSide.options when serverSide mode is enabled.`
        )
      }
      if (
        filter.type === "interval-slider" &&
        (!filter.serverSide || filter.serverSide.min === undefined || filter.serverSide.max === undefined)
      ) {
        throw new Error(
          `DataTable: Quick filter "${filter.name}" (interval-slider) requires serverSide.min and serverSide.max when serverSide mode is enabled.`
        )
      }
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/components && npx vitest run src/components/organisms/data-table/data-table.test.tsx`
Expected: All 16 tests PASS (11 existing + 5 new)

- [ ] **Step 5: Commit**

```bash
git add src/components/organisms/data-table/data-table.test.tsx src/components/organisms/data-table/use-data-table.ts
git commit -m "feat(data-table): add server-side validation with TDD"
```

---

### Task 3: Update `useDataTable` hook for server-side mode

**Files:**
- Modify: `packages/components/src/components/organisms/data-table/use-data-table.ts`

- [ ] **Step 1: Add `useEffect` and `useRef` imports**

Update the React import at line 1:

```ts
import { useState, useEffect, useRef } from "react"
```

- [ ] **Step 2: Add `DataTableServerSideConfig` to the type import**

Update the import from `data-table-types` to include `DataTableServerSideConfig`:

```ts
import { DEFAULT_PAGE_SIZE_OPTIONS, type DataTableConfig, type DataTableServerSideConfig } from "./data-table-types"
```

- [ ] **Step 3: Conditionally configure row models and manual flags**

Replace the `useReactTable` call (lines 144–167) with conditional logic. The table options are built based on whether `config.serverSide` is present:

```ts
const isServerSide = !!config.serverSide

const table = useReactTable({
  data,
  columns,
  state: {
    sorting,
    columnFilters,
    globalFilter,
    pagination,
    rowSelection,
  },
  enableRowSelection: config.enableRowSelection ?? false,
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onGlobalFilterChange: setGlobalFilter,
  onPaginationChange: setPagination,
  onRowSelectionChange: setRowSelection,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  // Client-side only models
  ...(!isServerSide && {
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  }),
  // Server-side manual flags
  ...(isServerSide && {
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
    pageCount: Math.ceil(config.serverSide!.totalRows / pagination.pageSize),
  }),
})
```

- [ ] **Step 4: Add callback `useEffect` hooks for server-side mode**

Add these `useEffect` hooks after the `useReactTable` call, before the `hasActiveFilters` computation:

```ts
// --- Server-side callbacks ---
const isInitialMount = useRef(true)

useEffect(() => {
  if (isInitialMount.current) return
  config.serverSide?.onSortChange?.(sorting)
}, [sorting]) // eslint-disable-line react-hooks/exhaustive-deps

useEffect(() => {
  if (isInitialMount.current) return
  for (const filter of columnFilters) {
    config.serverSide?.onFilterChange?.(filter.id, filter.value)
  }
  // When all filters are cleared (length goes to 0), don't fire individual callbacks —
  // that's handled by resetAllFilters / onClearAll
}, [columnFilters]) // eslint-disable-line react-hooks/exhaustive-deps

useEffect(() => {
  if (isInitialMount.current) return
  config.serverSide?.onPageChange?.(pagination)
}, [pagination]) // eslint-disable-line react-hooks/exhaustive-deps

useEffect(() => {
  if (isInitialMount.current) return
  config.serverSide?.onSearchChange?.(globalFilter)
}, [globalFilter]) // eslint-disable-line react-hooks/exhaustive-deps

// Mark initial mount complete after first render
useEffect(() => {
  isInitialMount.current = false
}, [])
```

Note: The `isInitialMount` ref prevents callbacks from firing on the initial render (the consumer already has the initial data). The `onSearchChange` callback fires when `globalFilter` changes — in server-side mode this only happens on Enter key or Clear (see Task 5), since the debounce `useEffect` is skipped.

- [ ] **Step 5: Update `resetAllFilters` to call `onClearAll`**

Replace the existing `resetAllFilters` function:

```ts
const resetAllFilters = () => {
  table.resetColumnFilters()
  setGlobalFilter("")
  config.serverSide?.onClearAll?.()
}
```

- [ ] **Step 6: Add `isServerSide` to the return value**

Update the return type and return statement to expose `isServerSide`:

```ts
interface UseDataTableReturn<TData> {
  table: Table<TData>
  hasActiveFilters: boolean
  globalFilter: string
  setGlobalFilter: (value: string) => void
  resetAllFilters: () => void
  isServerSide: boolean
}
```

And the return:

```ts
return { table, hasActiveFilters, globalFilter, setGlobalFilter, resetAllFilters, isServerSide }
```

- [ ] **Step 7: Verify TypeScript compiles**

Run: `cd packages/components && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Run existing tests to verify no regressions**

Run: `cd packages/components && npx vitest run src/components/organisms/data-table/data-table.test.tsx`
Expected: All 16 tests PASS

- [ ] **Step 9: Commit**

```bash
git add src/components/organisms/data-table/use-data-table.ts
git commit -m "feat(data-table): add server-side mode to useDataTable hook"
```

---

### Task 4: Add `loading` prop to `DataTablePagination`

**Files:**
- Modify: `packages/components/src/components/organisms/data-table/data-table-pagination.tsx`

- [ ] **Step 1: Add `loading` to the props interface**

Update the `DataTablePaginationProps` interface:

```ts
interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
  loading?: boolean
}
```

- [ ] **Step 2: Destructure `loading` in the component signature**

```ts
function DataTablePagination<TData>({
  table,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  loading = false,
}: DataTablePaginationProps<TData>) {
```

- [ ] **Step 3: Disable the Select trigger when loading**

On the `SelectTrigger` (line 53), add the `disabled` prop:

```ts
<SelectTrigger size="sm" className="w-20" id={rowsPerPageId} disabled={loading}>
```

- [ ] **Step 4: Disable all navigation buttons when loading**

Update each of the four `Button` `disabled` props to also check `loading`:

First page button (line 77):
```ts
disabled={!table.getCanPreviousPage() || loading}
```

Previous page button (line 86):
```ts
disabled={!table.getCanPreviousPage() || loading}
```

Next page button (line 93):
```ts
disabled={!table.getCanNextPage() || loading}
```

Last page button (line 100):
```ts
disabled={!table.getCanNextPage() || loading}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `cd packages/components && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/components/organisms/data-table/data-table-pagination.tsx
git commit -m "feat(data-table): disable pagination controls when loading"
```

---

### Task 5: Add `loading` prop and Enter-to-search to `DataTableToolbar`

**Files:**
- Modify: `packages/components/src/components/organisms/data-table/data-table-toolbar.tsx`

- [ ] **Step 1: Add `loading` and `isServerSide` to the props interface**

Update `DataTableToolbarProps`:

```ts
interface DataTableToolbarProps<TData> {
  table: Table<TData>
  toolbar: DataTableToolbarConfig
  globalFilter: string
  setGlobalFilter: (value: string) => void
  hasActiveFilters: boolean
  resetAllFilters: () => void
  loading?: boolean
  isServerSide?: boolean
}
```

- [ ] **Step 2: Destructure the new props**

Update the function signature:

```ts
function DataTableToolbar<TData>({
  table,
  toolbar,
  globalFilter,
  setGlobalFilter,
  hasActiveFilters,
  resetAllFilters,
  loading = false,
  isServerSide = false,
}: DataTableToolbarProps<TData>) {
```

- [ ] **Step 3: Implement Enter-to-search for server-side mode**

Replace the debounce logic. The current code (lines 46–61) uses `useDebounce` + `useEffect` for all modes. Wrap it conditionally:

```ts
const [localSearch, setLocalSearch] = useState(globalFilter)
const debouncedSearch = useDebounce(
  localSearch,
  toolbar.search?.debounceMs ?? 300
)

// Client-side: debounce-driven global filter sync
useEffect(() => {
  if (isServerSide) return
  setGlobalFilter(debouncedSearch)
}, [debouncedSearch, setGlobalFilter, isServerSide])

// Sync external globalFilter changes back to local state
useEffect(() => {
  if (globalFilter !== localSearch) {
    setLocalSearch(globalFilter)
  }
}, [globalFilter]) // eslint-disable-line react-hooks/exhaustive-deps

const handleClearSearch = () => {
  setLocalSearch("")
  setGlobalFilter("")
  // In server-side mode, setGlobalFilter("") triggers the hook's useEffect
  // which fires onSearchChange("") — no extra handling needed here.
}

const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (isServerSide && e.key === "Enter") {
    setGlobalFilter(localSearch)
  }
}
```

- [ ] **Step 4: Add `onKeyDown` and `disabled` to the search input**

Update the `InputGroupInput` element to include the new handler and loading state:

```tsx
<InputGroupInput
  placeholder={toolbar.search.placeholder ?? "Search..."}
  value={localSearch}
  onChange={(e) => setLocalSearch(e.target.value)}
  onKeyDown={handleSearchKeyDown}
  disabled={loading}
/>
```

- [ ] **Step 5: Disable the sort button when loading**

Update the sort trigger `Button`:

```tsx
<Button variant="outline" size="sm" disabled={loading}>
  {activeSortLabel ?? "Sort"}
  <IconChevronDown className="ml-1 size-4" />
</Button>
```

- [ ] **Step 6: Pass `loading` to quick filter popovers**

Update the `DataTableQuickFilterPopover` rendering to pass `loading`:

```tsx
{toolbar.quickFilters?.map((filter) => (
  <DataTableQuickFilterPopover
    key={filter.columnId}
    table={table}
    filter={filter}
    loading={loading}
  />
))}
```

- [ ] **Step 7: Disable the "Clear all" button when loading**

```tsx
{hasActiveFilters && (
  <Button variant="ghost" size="sm" onClick={resetAllFilters} disabled={loading}>
    Clear all
  </Button>
)}
```

- [ ] **Step 8: Verify TypeScript compiles**

Run: `cd packages/components && npx tsc --noEmit`
Expected: May show error for `loading` prop on `DataTableQuickFilterPopover` — that's expected, we'll add it in Task 6.

- [ ] **Step 9: Commit**

```bash
git add src/components/organisms/data-table/data-table-toolbar.tsx
git commit -m "feat(data-table): add loading disable and Enter-to-search to toolbar"
```

---

### Task 6: Update `DataTableQuickFilterPopover` for server-side mode

**Files:**
- Modify: `packages/components/src/components/organisms/data-table/data-table-quick-filter-popover.tsx`

- [ ] **Step 1: Add `loading` to the props interface**

```ts
interface DataTableQuickFilterPopoverProps<TData> {
  table: Table<TData>
  filter: QuickFilter
  loading?: boolean
}
```

- [ ] **Step 2: Destructure `loading` in the component**

```ts
function DataTableQuickFilterPopover<TData>({
  table,
  filter,
  loading = false,
}: DataTableQuickFilterPopoverProps<TData>) {
```

- [ ] **Step 3: Use `filter.serverSide` for checkbox options when available**

In `renderFilterContent`, update the checkbox-list branch (lines 96–105) to use consumer-provided options:

```ts
const renderFilterContent = () => {
  if (filter.type === "checkbox-list") {
    const options = filter.serverSide?.options
      ?? Array.from(column.getFacetedUniqueValues().keys()).sort()
    return (
      <DataTableCheckboxFilter
        options={options}
        value={pendingCheckbox}
        onChange={setPendingCheckbox}
      />
    )
  }

  const [min, max] = filter.serverSide
    ? [filter.serverSide.min, filter.serverSide.max]
    : (column.getFacetedMinMaxValues() ?? [0, 0])
  return (
    <DataTableSliderFilter
      min={min ?? 0}
      max={max ?? 0}
      value={pendingSlider}
      onChange={setPendingSlider}
      formatValue={filter.formatValue}
    />
  )
}
```

- [ ] **Step 4: Update pending slider initialisation to use `filter.serverSide`**

In the `useEffect` that initialises pending state (lines 41–54), update the slider branch:

```ts
useEffect(() => {
  if (!open || !column) return

  if (filter.type === "checkbox-list") {
    const current = column.getFilterValue() as string[] | undefined
    setPendingCheckbox(new Set(current ?? []))
  } else {
    const current = column.getFilterValue() as [number, number] | undefined
    const [min, max] = filter.serverSide
      ? [filter.serverSide.min, filter.serverSide.max]
      : (column.getFacetedMinMaxValues() ?? [0, 0])
    setPendingSlider(
      current ?? [min ?? 0, max ?? 0]
    )
  }
}, [open, column, filter])
```

Note: The dependency changed from `filter.type` to `filter` to capture `filter.serverSide` changes.

- [ ] **Step 5: Update `handleClear` to use `filter.serverSide` for slider reset**

```ts
const handleClear = () => {
  column.setFilterValue(undefined)
  if (filter.type === "checkbox-list") {
    setPendingCheckbox(new Set())
  } else {
    const [min, max] = filter.serverSide
      ? [filter.serverSide.min, filter.serverSide.max]
      : (column.getFacetedMinMaxValues() ?? [0, 0])
    setPendingSlider([min ?? 0, max ?? 0])
  }
  setOpen(false)
}
```

- [ ] **Step 6: Disable the trigger button when loading**

Update the trigger `Button`:

```tsx
<Button variant="outline" size="sm" disabled={loading}>
  {triggerLabel}
  <IconChevronDown className="ml-1 size-4" />
</Button>
```

- [ ] **Step 7: Verify TypeScript compiles**

Run: `cd packages/components && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add src/components/organisms/data-table/data-table-quick-filter-popover.tsx
git commit -m "feat(data-table): support server-side filter options and loading state in popover"
```

---

### Task 7: Wire `loading` and `isServerSide` through `DataTable` root

**Files:**
- Modify: `packages/components/src/components/organisms/data-table/data-table.tsx`

- [ ] **Step 1: Destructure `isServerSide` from the hook return**

Update line 34:

```ts
const { table, globalFilter, setGlobalFilter, hasActiveFilters, resetAllFilters, isServerSide } =
  useDataTable(data, config)
```

- [ ] **Step 2: Pass `loading` and `isServerSide` to `DataTableToolbar`**

Update the toolbar JSX (lines 44–51):

```tsx
{config.toolbar && (
  <DataTableToolbar
    table={table}
    toolbar={config.toolbar}
    globalFilter={globalFilter}
    setGlobalFilter={setGlobalFilter}
    hasActiveFilters={hasActiveFilters}
    resetAllFilters={resetAllFilters}
    loading={loading}
    isServerSide={isServerSide}
  />
)}
```

- [ ] **Step 3: Pass `loading` to `DataTablePagination`**

Update the pagination JSX (lines 153–156):

```tsx
<DataTablePagination
  table={table}
  pageSizeOptions={config.pagination?.pageSizeOptions}
  loading={loading}
/>
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd packages/components && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Run all existing tests**

Run: `cd packages/components && npx vitest run src/components/organisms/data-table/data-table.test.tsx`
Expected: All 16 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/organisms/data-table/data-table.tsx
git commit -m "feat(data-table): wire loading and isServerSide through root component"
```

---

### Task 8: Add Storybook stories

**Files:**
- Modify: `packages/components/src/components/organisms/data-table/data-table.stories.tsx`

- [ ] **Step 1: Create the fake server fetcher utility**

Add this helper above the `meta` definition, after the `baseColumns` array:

```ts
// --- Fake server helpers ---

interface FetchParams {
  sorting?: { id: string; desc: boolean }[]
  filters?: { id: string; value: unknown }[]
  search?: string
  pagination: { pageIndex: number; pageSize: number }
}

interface FetchResult {
  data: Product[]
  totalRows: number
}

function createFakeServerFetcher(allData: Product[]) {
  return async (params: FetchParams): Promise<FetchResult> => {
    await new Promise((r) => setTimeout(r, 500))
    let result = [...allData]

    // Search
    if (params.search) {
      const term = params.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term)
      )
    }

    // Filters
    if (params.filters) {
      for (const f of params.filters) {
        if (Array.isArray(f.value)) {
          result = result.filter((p) =>
            (f.value as string[]).includes(
              String(p[f.id as keyof Product])
            )
          )
        } else if (
          Array.isArray(f.value) === false &&
          typeof f.value === "object" &&
          f.value !== null
        ) {
          const [min, max] = f.value as [number, number]
          result = result.filter((p) => {
            const val = p[f.id as keyof Product] as number
            return val >= min && val <= max
          })
        }
      }
    }

    // Sorting
    if (params.sorting?.length) {
      const sort = params.sorting[0]
      result.sort((a, b) => {
        const aVal = a[sort.id as keyof Product]
        const bVal = b[sort.id as keyof Product]
        if (aVal < bVal) return sort.desc ? 1 : -1
        if (aVal > bVal) return sort.desc ? -1 : 1
        return 0
      })
    }

    const totalRows = result.length
    const start = params.pagination.pageIndex * params.pagination.pageSize
    const paged = result.slice(start, start + params.pagination.pageSize)

    return { data: paged, totalRows }
  }
}

const fakeFetch = createFakeServerFetcher(products)
```

- [ ] **Step 2: Create a reusable server-side wrapper component**

Add a wrapper component that manages the fetch state, used by all server-side stories:

```tsx
function ServerSideWrapper({
  config,
  initialPageSize = 10,
}: {
  config: Omit<DataTableConfig<Product>, "columns"> & { columns?: ColumnDef<Product, unknown>[] }
  initialPageSize?: number
}) {
  const [data, setData] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [totalRows, setTotalRows] = React.useState(0)
  const paramsRef = React.useRef<FetchParams>({
    pagination: { pageIndex: 0, pageSize: initialPageSize },
  })

  const doFetch = React.useCallback(async () => {
    setLoading(true)
    const result = await fakeFetch(paramsRef.current)
    setData(result.data)
    setTotalRows(result.totalRows)
    setLoading(false)
  }, [])

  React.useEffect(() => {
    doFetch()
  }, [doFetch])

  const serverSide = React.useMemo(
    () => ({
      totalRows,
      onSortChange: (sorting: { id: string; desc: boolean }[]) => {
        paramsRef.current.sorting = sorting
        paramsRef.current.pagination.pageIndex = 0
        doFetch()
      },
      onFilterChange: (columnId: string, value: unknown) => {
        const filters = paramsRef.current.filters ?? []
        const idx = filters.findIndex((f) => f.id === columnId)
        if (idx >= 0) {
          filters[idx] = { id: columnId, value }
        } else {
          filters.push({ id: columnId, value })
        }
        paramsRef.current.filters = filters
        paramsRef.current.pagination.pageIndex = 0
        doFetch()
      },
      onSearchChange: (search: string) => {
        paramsRef.current.search = search
        paramsRef.current.pagination.pageIndex = 0
        doFetch()
      },
      onPageChange: (pagination: { pageIndex: number; pageSize: number }) => {
        paramsRef.current.pagination = pagination
        doFetch()
      },
      onClearAll: () => {
        paramsRef.current = {
          pagination: { ...paramsRef.current.pagination, pageIndex: 0 },
        }
        doFetch()
      },
    }),
    [totalRows, doFetch]
  )

  return (
    <DataTable
      data={data}
      loading={loading}
      config={{
        columns: config.columns ?? baseColumns,
        ...config,
        serverSide,
      }}
    />
  )
}
```

Add `import React from "react"` at the top of the file if not already present (needed for `React.useState` etc. — or use named imports: `useState, useEffect, useCallback, useMemo, useRef`).

- [ ] **Step 3: Add the `ServerSide` story**

```tsx
export const ServerSide: Story = {
  render: () => (
    <ServerSideWrapper
      config={{
        columns: baseColumns,
        toolbar: {
          search: {
            placeholder: "Search products (press Enter)...",
            columnIds: ["name", "category"],
          },
          quickFilters: [
            {
              name: "Category",
              columnId: "category",
              type: "checkbox-list",
              serverSide: { options: ["Rings", "Necklaces", "Earrings", "Bracelets"] },
            },
            {
              name: "Price",
              columnId: "price",
              type: "interval-slider",
              formatValue: (v: number) => `$${v.toFixed(0)}`,
              serverSide: { min: 87, max: 1625 },
            },
          ],
          sorting: [
            { label: "Price, high to low", columnId: "price", direction: "desc" },
            { label: "Price, low to high", columnId: "price", direction: "asc" },
            { label: "Name A–Z", columnId: "name", direction: "asc" },
          ],
        },
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Wait for initial load to complete (skeletons disappear, rows appear)
    await waitFor(
      () => {
        const rows = canvasElement.querySelectorAll("tbody tr")
        expect(rows.length).toBe(10)
        // Verify it's not skeleton rows
        const firstRowText = rows[0]?.textContent ?? ""
        expect(firstRowText).toMatch(/PRD-/)
      },
      { timeout: 5000 }
    )

    // Verify pagination shows total
    const pageInfo = canvas.getByText(/Page 1 of/)
    await expect(pageInfo).toBeInTheDocument()
  },
}
```

- [ ] **Step 4: Add the `ServerSideSearch` story**

```tsx
export const ServerSideSearch: Story = {
  render: () => (
    <ServerSideWrapper
      config={{
        columns: baseColumns,
        toolbar: {
          search: {
            placeholder: "Search products (press Enter)...",
            columnIds: ["name", "category"],
          },
        },
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Wait for initial load
    await waitFor(
      () => {
        const rows = canvasElement.querySelectorAll("tbody tr")
        expect(rows.length).toBe(10)
      },
      { timeout: 5000 }
    )

    // Type search term
    const searchInput = canvas.getByPlaceholderText(
      "Search products (press Enter)..."
    )
    await userEvent.type(searchInput, "Necklaces")

    // Rows should NOT change yet (server-side: no debounce, Enter required)
    const rowsBefore = canvasElement.querySelectorAll("tbody tr")
    await expect(rowsBefore.length).toBe(10)

    // Press Enter
    await userEvent.keyboard("{Enter}")

    // Wait for filtered results
    await waitFor(
      () => {
        const rows = canvasElement.querySelectorAll("tbody tr")
        expect(rows.length).toBeLessThanOrEqual(10)
        const firstRowText = rows[0]?.textContent ?? ""
        expect(firstRowText).toMatch(/Necklaces/)
      },
      { timeout: 5000 }
    )
  },
}
```

- [ ] **Step 5: Add the `ServerSideSorting` story**

```tsx
export const ServerSideSorting: Story = {
  render: () => (
    <ServerSideWrapper
      config={{
        columns: baseColumns,
        toolbar: {
          sorting: [
            { label: "Price, high to low", columnId: "price", direction: "desc" },
            { label: "Price, low to high", columnId: "price", direction: "asc" },
          ],
        },
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    // Wait for initial load
    await waitFor(
      () => {
        const rows = canvasElement.querySelectorAll("tbody tr")
        expect(rows.length).toBe(10)
      },
      { timeout: 5000 }
    )

    // Open sort dropdown and select "Price, high to low"
    const sortButton = canvas.getByRole("button", { name: /Sort/ })
    await userEvent.click(sortButton)
    const option = body.getByRole("menuitemradio", {
      name: "Price, high to low",
    })
    await userEvent.click(option)

    // Wait for re-fetch and verify sort
    await waitFor(
      () => {
        expect(
          canvas.getByRole("button", { name: /Price, high to low/ })
        ).toBeInTheDocument()
        const firstDataRow = canvasElement.querySelectorAll("tbody tr")[0]
        const priceCell = firstDataRow?.querySelectorAll("td")[3]
        expect(priceCell?.textContent).toBe("$1625.00")
      },
      { timeout: 5000 }
    )
  },
}
```

- [ ] **Step 6: Add the `ServerSideFilters` story**

```tsx
export const ServerSideFilters: Story = {
  render: () => (
    <ServerSideWrapper
      config={{
        columns: baseColumns,
        toolbar: {
          quickFilters: [
            {
              name: "Category",
              columnId: "category",
              type: "checkbox-list",
              serverSide: { options: ["Rings", "Necklaces", "Earrings", "Bracelets"] },
            },
          ],
        },
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    // Wait for initial load
    await waitFor(
      () => {
        const rows = canvasElement.querySelectorAll("tbody tr")
        expect(rows.length).toBe(10)
      },
      { timeout: 5000 }
    )

    // Open Category filter and select "Rings"
    const categoryTrigger = canvas.getByRole("button", { name: "Category" })
    await userEvent.click(categoryTrigger)
    await userEvent.click(body.getByRole("checkbox", { name: "Rings" }))
    await userEvent.click(body.getByRole("button", { name: "Apply" }))

    // Wait for filtered results
    await waitFor(
      () => {
        expect(
          canvas.getByRole("button", { name: /Category \(1\)/ })
        ).toBeInTheDocument()
        const rows = canvasElement.querySelectorAll("tbody tr")
        for (const row of rows) {
          expect(row.textContent ?? "").toMatch(/Rings/)
        }
      },
      { timeout: 5000 }
    )

    // Click Clear all
    const clearAllBtn = canvas.getByRole("button", { name: "Clear all" })
    await userEvent.click(clearAllBtn)

    // Wait for reset
    await waitFor(
      () => {
        expect(
          canvas.getByRole("button", { name: "Category" })
        ).toBeInTheDocument()
        const rows = canvasElement.querySelectorAll("tbody tr")
        expect(rows.length).toBe(10)
      },
      { timeout: 5000 }
    )
  },
}
```

- [ ] **Step 7: Add the `LiveAPI` story (DummyJSON demo)**

This is an interactive-only story with no play function. It fetches from `https://dummyjson.com/products`:

```tsx
function LiveAPIWrapper() {
  const [data, setData] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [totalRows, setTotalRows] = React.useState(0)
  const paramsRef = React.useRef({
    pagination: { pageIndex: 0, pageSize: 10 },
    search: "",
    sortBy: "",
    order: "" as "asc" | "desc" | "",
  })

  const doFetch = React.useCallback(async () => {
    setLoading(true)
    const p = paramsRef.current
    const skip = p.pagination.pageIndex * p.pagination.pageSize
    const limit = p.pagination.pageSize

    let url = p.search
      ? `https://dummyjson.com/products/search?q=${encodeURIComponent(p.search)}&limit=${limit}&skip=${skip}`
      : `https://dummyjson.com/products?limit=${limit}&skip=${skip}`

    if (p.sortBy) {
      url += `&sortBy=${p.sortBy}&order=${p.order}`
    }

    try {
      const res = await fetch(url)
      const json = await res.json()
      const mapped: Product[] = json.products.map(
        (item: { id: number; title: string; category: string; price: number; availabilityStatus: string }) => ({
          id: `PRD-${String(item.id).padStart(3, "0")}`,
          name: item.title,
          category: item.category,
          price: item.price,
          status: (item.availabilityStatus === "In Stock" ? "active" : "draft") as Product["status"],
        })
      )
      setData(mapped)
      setTotalRows(json.total)
    } catch {
      setData([])
      setTotalRows(0)
    }
    setLoading(false)
  }, [])

  React.useEffect(() => {
    doFetch()
  }, [doFetch])

  return (
    <DataTable
      data={data}
      loading={loading}
      config={{
        columns: baseColumns,
        toolbar: {
          search: {
            placeholder: "Search DummyJSON products (press Enter)...",
            columnIds: ["name", "category"],
          },
          sorting: [
            { label: "Price, high to low", columnId: "price", direction: "desc" },
            { label: "Price, low to high", columnId: "price", direction: "asc" },
            { label: "Name A–Z", columnId: "name", direction: "asc" },
          ],
        },
        serverSide: {
          totalRows,
          onSearchChange: (search) => {
            paramsRef.current.search = search
            paramsRef.current.pagination.pageIndex = 0
            doFetch()
          },
          onSortChange: (sorting) => {
            if (sorting.length) {
              paramsRef.current.sortBy = sorting[0].id
              paramsRef.current.order = sorting[0].desc ? "desc" : "asc"
            } else {
              paramsRef.current.sortBy = ""
              paramsRef.current.order = ""
            }
            paramsRef.current.pagination.pageIndex = 0
            doFetch()
          },
          onPageChange: (pagination) => {
            paramsRef.current.pagination = pagination
            doFetch()
          },
          onClearAll: () => {
            paramsRef.current = {
              pagination: { ...paramsRef.current.pagination, pageIndex: 0 },
              search: "",
              sortBy: "",
              order: "",
            }
            doFetch()
          },
        },
      }}
    />
  )
}

export const LiveAPI: Story = {
  render: () => <LiveAPIWrapper />,
}
```

Note: This story has no play function — it's a live interactive demo only. No quick filters because DummyJSON doesn't support server-side column filtering with the same parameters.

- [ ] **Step 8: Verify Storybook compiles**

Run: `cd packages/components && npx storybook build --quiet 2>&1 | tail -5`
Expected: Build completes without errors

- [ ] **Step 9: Commit**

```bash
git add src/components/organisms/data-table/data-table.stories.tsx
git commit -m "feat(data-table): add server-side mode stories with play functions and live API demo"
```

---

### Task 9: Update barrel exports and COMPONENT.md

**Files:**
- Modify: `packages/components/src/index.ts`
- Modify: `packages/components/src/components/organisms/data-table/COMPONENT.md`

- [ ] **Step 1: Export `DataTableServerSideConfig` from barrel**

Update the type export block in `src/index.ts`:

```ts
export type {
  DataTableProps,
  DataTableConfig,
  DataTablePaginationConfig,
  DataTableToolbarConfig,
  DataTableServerSideConfig,
  SortOption,
  QuickFilter,
  DataTableHeaderProps,
  DataTableCellProps,
} from "./components/organisms/data-table/data-table-types";
```

- [ ] **Step 2: Add `DataTableServerSideConfig` props table to COMPONENT.md**

Add this section after the `QuickFilter` props table (after line 68):

```markdown
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
```

- [ ] **Step 3: Add `serverSide` row to `DataTableConfig` props table**

Add a row to the `DataTableConfig` table:

```markdown
| `serverSide` | `DataTableServerSideConfig` | — | Server-side mode configuration (callbacks + total count) |
```

- [ ] **Step 4: Add server-side usage guidelines**

Add to the "Usage guidelines" section:

```markdown
**Do** use `serverSide` when data is fetched from an API. Provide `totalRows` and at least one callback. The table manages UI state; your callbacks manage data fetching.

**Do** provide `serverSide.options` on checkbox-list filters and `serverSide.min`/`max` on interval-slider filters when using server-side mode — faceted values can't be derived from a single page.

**Don't** mix client-side and server-side patterns. When `serverSide` is set, the table skips all client-side sorting, filtering, and faceting.

**Do** use `loading={true}` during fetches — this disables toolbar controls and pagination, preventing request stacking.
```

- [ ] **Step 5: Commit**

```bash
git add src/index.ts src/components/organisms/data-table/COMPONENT.md
git commit -m "docs(data-table): document server-side config in COMPONENT.md and export types"
```

---

### Task 10: Final verification

**Files:** None (verification only)

- [ ] **Step 1: Run all validation tests**

Run: `cd packages/components && npx vitest run src/components/organisms/data-table/data-table.test.tsx`
Expected: All 16 tests PASS

- [ ] **Step 2: Run TypeScript compilation**

Run: `cd packages/components && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Verify Storybook builds**

Run: `cd packages/components && npx storybook build --quiet 2>&1 | tail -5`
Expected: Build completes without errors

- [ ] **Step 4: Visually verify in Storybook (manual)**

Run: `cd packages/components && npx storybook dev -p 6006`

Check:
1. `ServerSide` story loads data after 500ms delay, pagination shows correct total
2. `ServerSideSearch` story: type → no change → Enter → filtered results
3. `ServerSideSorting` story: select sort → loading skeletons → sorted data
4. `ServerSideFilters` story: apply filter → loading → filtered → Clear all → reset
5. All existing stories still work (Default, WithSelection, Loading, Empty, etc.)
6. Loading state disables toolbar controls and pagination buttons
