# DataTable Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a configuration-driven DataTable component on TanStack Table — Phase 1 delivers the core table, pagination, selection bar, cell containers, helpers, and loading/empty states.

**Architecture:** Single `DataTable` root component consumes a `useDataTable` internal hook that owns all state and the TanStack Table instance. DataTable renders its own table markup (independent of the existing Table organism). Sub-components (pagination, selection bar) are internal; cell containers and helpers are exported. Runtime validation catches config misuse at render time.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind v4, `@tanstack/react-table`, `@tabler/icons-react`, Storybook 8.6.

**Spec:** [docs/superpowers/specs/2026-04-15-data-table-design.md](../specs/2026-04-15-data-table-design.md)

---

## Orientation for the implementer

Read these in order before starting:

1. [CLAUDE.md](../../../CLAUDE.md) — repo-wide conventions, token rules, what not to touch.
2. [packages/components/CLAUDE.md](../../../packages/components/CLAUDE.md) — package-level guidance.
3. [packages/components/CONTRIBUTING.md](../../../packages/components/CONTRIBUTING.md) — component conventions, folder structure, story format, testing strategy, definition of done.
4. The spec linked above.

Working directory for all commands is **`packages/components/`** unless stated otherwise.

**Commit style:** Conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`). Follow the existing `git log` for tone. Do not skip hooks (`--no-verify`). Do not amend published commits.

**Verification commands used throughout this plan:**

- `npx tsc --noEmit` — type check only, no emit.
- `npx vitest run` — run all tests.
- `npx vitest run src/components/organisms/data-table/data-table.test.tsx` — run DataTable tests only.
- `npm run test:storybook` — runs stories as render tests + axe-core accessibility checks via Storybook test runner.
- `npx storybook dev -p 6006` — interactive dev server for manual smoke checks. Use only at the end.

**Single-task commits.** Each task ends in a commit. If a task blows up, fix it before moving on — do not batch fixes into the next task.

**Import conventions:**
- Library components: direct imports from component files (`@/components/atoms/button/button`), not from the barrel.
- Internal DataTable imports: relative paths (`./data-table-types`).
- Utility: `cn` from `@/lib/utils`.

---

## File Structure

Files created by this plan (all paths relative to `packages/components/`):

| File | Responsibility | Created in |
|---|---|---|
| `src/components/organisms/data-table/data-table-types.ts` | All shared types and interfaces | Task 1 |
| `src/hooks/use-debounce.ts` | Reusable debounce hook (consumed in Phase 2) | Task 2 |
| `src/components/organisms/data-table/data-table-cells.tsx` | DataTableHeader + DataTableCell (exported) | Task 3 |
| `src/components/organisms/data-table/data-table-helpers.tsx` | getSelectColumn helper (exported) | Task 4 |
| `src/components/organisms/data-table/data-table.test.tsx` | Runtime validation tests | Task 5 |
| `src/components/organisms/data-table/use-data-table.ts` | Internal hook — state, TanStack config, validation | Tasks 5–6 |
| `src/components/organisms/data-table/data-table-pagination.tsx` | Pagination controls (internal) | Task 7 |
| `src/components/organisms/data-table/data-table-selection-bar.tsx` | Selection bar (internal) | Task 8 |
| `src/components/organisms/data-table/data-table.tsx` | Root component (render + composition) | Task 9 |
| `src/components/organisms/data-table/data-table.stories.tsx` | Storybook stories | Task 10 |
| `src/components/organisms/data-table/COMPONENT.md` | Component documentation | Task 11 |

Files modified by this plan:

| File | Responsibility | Modified in |
|---|---|---|
| `package.json` | Add `@tanstack/react-table` dependency | Task 1 |
| `src/index.ts` | Barrel exports for DataTable | Task 12 |

Files modified outside `packages/components/` (paths relative to repo root):

| File | Responsibility | Modified in |
|---|---|---|
| `.context/attachments/datatable-spec.md` | Update master spec with Phase 1 decisions | Task 12 |

---

## Tasks

### Task 1 — Foundation: install dependency + create types

**Files:**
- Modify: `package.json`
- Create: `src/components/organisms/data-table/data-table-types.ts`

- [ ] **Step 1: Install @tanstack/react-table**

```bash
npm install @tanstack/react-table
```

Expected: package added to `dependencies` in `package.json`, `node_modules` updated.

- [ ] **Step 2: Create the data-table directory**

```bash
mkdir -p src/components/organisms/data-table
```

- [ ] **Step 3: Create data-table-types.ts**

Create `src/components/organisms/data-table/data-table-types.ts`:

```ts
import type { ColumnDef } from "@tanstack/react-table"
import type { ReactNode } from "react"

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50]

/**
 * Configuration object for DataTable.
 *
 * Drives all table behaviour — columns, pagination, row selection, and
 * empty state. Passed as the `config` prop to `DataTable`.
 *
 * @see {@link DataTableProps} for the full prop interface.
 */
export interface DataTableConfig<TData> {
  columns: ColumnDef<TData, unknown>[]
  pagination?: DataTablePaginationConfig
  enableRowSelection?: boolean
  selectionActions?: (rows: TData[], clearSelection: () => void) => ReactNode
  emptyState?: ReactNode
}

/**
 * Pagination configuration for DataTable.
 *
 * Controls the available page size options in the pagination controls.
 * The first value in the array is used as the default page size.
 */
export interface DataTablePaginationConfig {
  pageSizeOptions?: number[]
}

/**
 * Props for the DataTable root component.
 *
 * @see {@link DataTableConfig} for the config object shape.
 */
export interface DataTableProps<TData> {
  data: TData[]
  config: DataTableConfig<TData>
  loading?: boolean
}

/**
 * Props for the DataTableHeader cell container.
 *
 * Applied automatically by DataTable for plain string headers.
 * Use explicitly in column definitions when custom composition is needed.
 */
export interface DataTableHeaderProps extends React.ComponentProps<"div"> {
  children: ReactNode
}

/**
 * Props for the DataTableCell cell container.
 *
 * Applied automatically by DataTable for plain string/number cell values.
 * Use explicitly when custom styling or composition is needed.
 */
export interface DataTableCellProps extends React.ComponentProps<"div"> {
  children: ReactNode
}
```

- [ ] **Step 4: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/components/organisms/data-table/data-table-types.ts
git commit -m "feat(data-table): add @tanstack/react-table dependency and types"
```

---

### Task 2 — Create useDebounce hook

**Files:**
- Create: `src/hooks/use-debounce.ts`

- [ ] **Step 1: Create use-debounce.ts**

Create `src/hooks/use-debounce.ts`:

```ts
import { useState, useEffect } from "react"

/**
 * Debounces a value by the specified delay.
 *
 * Returns the debounced value, which updates only after `delay` milliseconds
 * of inactivity. Used by DataTableToolbar for search input debouncing (Phase 2).
 *
 * @param value - The value to debounce.
 * @param delay - Debounce delay in milliseconds.
 * @returns The debounced value.
 */
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export { useDebounce }
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-debounce.ts
git commit -m "feat: add useDebounce hook"
```

---

### Task 3 — Create DataTableHeader + DataTableCell

**Files:**
- Create: `src/components/organisms/data-table/data-table-cells.tsx`

- [ ] **Step 1: Create data-table-cells.tsx**

Create `src/components/organisms/data-table/data-table-cells.tsx`:

```tsx
import { cn } from "@/lib/utils"
import type { DataTableHeaderProps, DataTableCellProps } from "./data-table-types"

/**
 * Standardised header cell container for DataTable.
 *
 * Applied automatically by DataTable for plain string headers. Use explicitly
 * in column definitions when custom composition is needed inside a header cell.
 */
function DataTableHeader({
  className,
  children,
  ...props
}: DataTableHeaderProps) {
  return (
    <div
      data-slot="data-table-header"
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Standardised body cell container for DataTable.
 *
 * Applied automatically by DataTable for plain string/number cell values. Use
 * explicitly when wrapping custom content that still needs standard cell styling.
 */
function DataTableCell({
  className,
  children,
  ...props
}: DataTableCellProps) {
  return (
    <div
      data-slot="data-table-cell"
      className={cn("text-sm", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { DataTableHeader, DataTableCell }
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/data-table/data-table-cells.tsx
git commit -m "feat(data-table): add DataTableHeader and DataTableCell containers"
```

---

### Task 4 — Create getSelectColumn helper

**Files:**
- Create: `src/components/organisms/data-table/data-table-helpers.tsx`

- [ ] **Step 1: Create data-table-helpers.tsx**

Create `src/components/organisms/data-table/data-table-helpers.tsx`:

```tsx
import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/atoms/checkbox/checkbox"

/**
 * Returns a pre-built column definition for row selection.
 *
 * Renders a header checkbox with indeterminate state support and a per-row
 * checkbox. Must be used together with `enableRowSelection: true` in the
 * DataTable config — providing one without the other is a runtime error.
 *
 * @returns A `ColumnDef<TData>` with `id: "select"`, sorting and hiding disabled.
 *
 * @example
 * ```ts
 * const config: DataTableConfig<Row> = {
 *   columns: [getSelectColumn<Row>(), ...otherColumns],
 *   enableRowSelection: true,
 * }
 * ```
 */
function getSelectColumn<TData>(): ColumnDef<TData, unknown> {
  return {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }
}

export { getSelectColumn }
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/data-table/data-table-helpers.tsx
git commit -m "feat(data-table): add getSelectColumn helper"
```

---

### Task 5 — Runtime validation — TDD cycle

**Files:**
- Create: `src/components/organisms/data-table/data-table.test.tsx`
- Create: `src/components/organisms/data-table/use-data-table.ts` (stub only)

- [ ] **Step 1: Create use-data-table.ts stub**

Create `src/components/organisms/data-table/use-data-table.ts` with just the validation function (no-op) and type:

```ts
import type { DataTableConfig } from "./data-table-types"

function validateConfig<TData>(_config: DataTableConfig<TData>): void {
  // Not yet implemented — tests should fail.
}

export { validateConfig }
```

- [ ] **Step 2: Write failing tests**

Create `src/components/organisms/data-table/data-table.test.tsx`:

```tsx
import { describe, it, expect } from "vitest"
import { validateConfig } from "./use-data-table"
import type { DataTableConfig } from "./data-table-types"

describe("validateConfig", () => {
  it("throws when enableRowSelection is true but no select column exists", () => {
    const config: DataTableConfig<{ name: string }> = {
      columns: [{ accessorKey: "name", header: "Name" }],
      enableRowSelection: true,
    }
    expect(() => validateConfig(config)).toThrow(
      'enableRowSelection is true but no column with id "select" exists'
    )
  })

  it("throws when select column exists but enableRowSelection is not true", () => {
    const config: DataTableConfig<{ name: string }> = {
      columns: [
        { id: "select", header: "Select", cell: () => null },
        { accessorKey: "name", header: "Name" },
      ],
    }
    expect(() => validateConfig(config)).toThrow(
      'A column with id "select" exists but enableRowSelection is not true'
    )
  })

  it("does not throw when both select column and enableRowSelection are present", () => {
    const config: DataTableConfig<{ name: string }> = {
      columns: [
        { id: "select", header: "Select", cell: () => null },
        { accessorKey: "name", header: "Name" },
      ],
      enableRowSelection: true,
    }
    expect(() => validateConfig(config)).not.toThrow()
  })

  it("does not throw when neither select column nor enableRowSelection are present", () => {
    const config: DataTableConfig<{ name: string }> = {
      columns: [{ accessorKey: "name", header: "Name" }],
    }
    expect(() => validateConfig(config)).not.toThrow()
  })
})
```

- [ ] **Step 3: Run tests — verify they fail**

```bash
npx vitest run src/components/organisms/data-table/data-table.test.tsx
```

Expected: 2 tests fail (the "throws" assertions), 2 pass (the "does not throw" assertions).

- [ ] **Step 4: Implement validateConfig**

Update `src/components/organisms/data-table/use-data-table.ts` — replace the stub `validateConfig`:

```ts
import type { DataTableConfig } from "./data-table-types"

function validateConfig<TData>(config: DataTableConfig<TData>): void {
  const hasSelectColumn = config.columns.some(
    (col) => "id" in col && col.id === "select"
  )

  if (config.enableRowSelection && !hasSelectColumn) {
    throw new Error(
      'DataTable: enableRowSelection is true but no column with id "select" exists. ' +
        "Add getSelectColumn() to your columns array."
    )
  }

  if (hasSelectColumn && !config.enableRowSelection) {
    throw new Error(
      'DataTable: A column with id "select" exists but enableRowSelection is not true. ' +
        "Set enableRowSelection: true in your config."
    )
  }
}

export { validateConfig }
```

- [ ] **Step 5: Run tests — verify they pass**

```bash
npx vitest run src/components/organisms/data-table/data-table.test.tsx
```

Expected: all 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/organisms/data-table/use-data-table.ts src/components/organisms/data-table/data-table.test.tsx
git commit -m "feat(data-table): add runtime config validation with tests"
```

---

### Task 6 — Complete useDataTable hook

**Files:**
- Modify: `src/components/organisms/data-table/use-data-table.ts`

- [ ] **Step 1: Implement the full hook**

Replace the entire contents of `src/components/organisms/data-table/use-data-table.ts`:

```ts
import { useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  type Table,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
} from "@tanstack/react-table"
import { DEFAULT_PAGE_SIZE_OPTIONS, type DataTableConfig } from "./data-table-types"

interface UseDataTableReturn<TData> {
  table: Table<TData>
  hasActiveFilters: boolean
}

function validateConfig<TData>(config: DataTableConfig<TData>): void {
  const hasSelectColumn = config.columns.some(
    (col) => "id" in col && col.id === "select"
  )

  if (config.enableRowSelection && !hasSelectColumn) {
    throw new Error(
      'DataTable: enableRowSelection is true but no column with id "select" exists. ' +
        "Add getSelectColumn() to your columns array."
    )
  }

  if (hasSelectColumn && !config.enableRowSelection) {
    throw new Error(
      'DataTable: A column with id "select" exists but enableRowSelection is not true. ' +
        "Set enableRowSelection: true in your config."
    )
  }
}

function useDataTable<TData>(
  data: TData[],
  config: DataTableConfig<TData>,
): UseDataTableReturn<TData> {
  validateConfig(config)

  const pageSizeOptions =
    config.pagination?.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS
  const defaultPageSize = pageSizeOptions[0] ?? 10

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns: config.columns,
    state: {
      sorting,
      columnFilters,
      pagination,
      rowSelection,
    },
    enableRowSelection: config.enableRowSelection ?? false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  })

  const hasActiveFilters = columnFilters.length > 0

  return { table, hasActiveFilters }
}

export { useDataTable, validateConfig }
export type { UseDataTableReturn }
```

- [ ] **Step 2: Verify existing tests still pass**

```bash
npx vitest run src/components/organisms/data-table/data-table.test.tsx
```

Expected: all 4 tests pass (validateConfig unchanged, just moved within file).

- [ ] **Step 3: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/organisms/data-table/use-data-table.ts
git commit -m "feat(data-table): implement useDataTable hook with TanStack Table"
```

---

### Task 7 — Create DataTablePagination

**Files:**
- Create: `src/components/organisms/data-table/data-table-pagination.tsx`

- [ ] **Step 1: Create data-table-pagination.tsx**

Create `src/components/organisms/data-table/data-table-pagination.tsx`:

```tsx
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/atoms/button/button"
import { Label } from "@/components/atoms/label/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/molecules/select/select"
import { DEFAULT_PAGE_SIZE_OPTIONS } from "./data-table-types"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
}

function DataTablePagination<TData>({
  table,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: DataTablePaginationProps<TData>) {
  return (
    <div
      data-slot="data-table-pagination"
      className="flex items-center justify-center gap-8 px-4"
    >
      <div className="hidden items-center gap-2 lg:flex">
        <Label htmlFor="rows-per-page" className="text-sm font-medium">
          Rows per page
        </Label>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value))
          }}
        >
          <SelectTrigger size="sm" className="w-20" id="rows-per-page">
            <SelectValue
              placeholder={table.getState().pagination.pageSize}
            />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-center text-sm font-medium">
        Page {table.getState().pagination.pageIndex + 1} of{" "}
        {table.getPageCount()}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          className="hidden lg:flex"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Go to first page</span>
          <IconChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Go to previous page</span>
          <IconChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Go to next page</span>
          <IconChevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="hidden lg:flex"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Go to last page</span>
          <IconChevronsRight />
        </Button>
      </div>
    </div>
  )
}

export { DataTablePagination }
export type { DataTablePaginationProps }
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/data-table/data-table-pagination.tsx
git commit -m "feat(data-table): add DataTablePagination component"
```

---

### Task 8 — Create DataTableSelectionBar

**Files:**
- Create: `src/components/organisms/data-table/data-table-selection-bar.tsx`

- [ ] **Step 1: Create data-table-selection-bar.tsx**

Create `src/components/organisms/data-table/data-table-selection-bar.tsx`:

```tsx
import type { Table } from "@tanstack/react-table"
import type { ReactNode } from "react"
import { Button } from "@/components/atoms/button/button"

interface DataTableSelectionBarProps<TData> {
  table: Table<TData>
  selectionActions?: (rows: TData[], clearSelection: () => void) => ReactNode
}

function DataTableSelectionBar<TData>({
  table,
  selectionActions,
}: DataTableSelectionBarProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const clearSelection = () => table.resetRowSelection()

  return (
    <div
      data-slot="data-table-selection-bar"
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between border-t bg-background px-6 py-3"
    >
      <div className="text-sm text-muted-foreground">
        {selectedRows.length} row(s) selected
      </div>
      <div className="flex items-center gap-2">
        {selectionActions?.(
          selectedRows.map((row) => row.original),
          clearSelection
        )}
        <Button variant="outline" size="sm" onClick={clearSelection}>
          Clear selection
        </Button>
      </div>
    </div>
  )
}

export { DataTableSelectionBar }
export type { DataTableSelectionBarProps }
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/organisms/data-table/data-table-selection-bar.tsx
git commit -m "feat(data-table): add DataTableSelectionBar component"
```

---

### Task 9 — Create DataTable root component

**Files:**
- Create: `src/components/organisms/data-table/data-table.tsx`

- [ ] **Step 1: Create data-table.tsx**

Create `src/components/organisms/data-table/data-table.tsx`:

```tsx
import { flexRender } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/atoms/skeleton/skeleton"
import { useDataTable } from "./use-data-table"
import { DataTableHeader, DataTableCell } from "./data-table-cells"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableSelectionBar } from "./data-table-selection-bar"
import type { DataTableProps } from "./data-table-types"

/**
 * Configuration-driven data table component built on TanStack Table.
 *
 * Owns all table state internally — sorting, filtering, pagination, and row
 * selection. The consuming engineer provides a `config` object and a `data`
 * array; the component handles everything else.
 *
 * Plain string headers are auto-wrapped in `DataTableHeader`. Plain
 * string/number cell values are auto-wrapped in `DataTableCell`. Custom JSX
 * in column definitions is rendered as-is.
 *
 * @see {@link DataTableConfig} for the config object shape.
 * @see {@link getSelectColumn} for the row selection helper.
 *
 * @example
 * ```tsx
 * <DataTable data={data} config={config} />
 * ```
 */
function DataTable<TData>({
  data,
  config,
  loading = false,
}: DataTableProps<TData>) {
  const { table } = useDataTable(data, config)

  const selectedRowCount = config.enableRowSelection
    ? table.getFilteredSelectedRowModel().rows.length
    : 0

  return (
    <div data-slot="data-table" className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-muted [&_tr]:border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                {headerGroup.headers.map((header) => {
                  const rendered = header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )

                  const content =
                    typeof rendered === "string" ? (
                      <DataTableHeader>{rendered}</DataTableHeader>
                    ) : (
                      rendered
                    )

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0"
                    >
                      {content}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {loading ? (
              Array.from({
                length: table.getState().pagination.pageSize,
              }).map((_, rowIndex) => (
                <tr
                  key={`skeleton-${rowIndex}`}
                  className="border-b transition-colors"
                >
                  {table.getVisibleLeafColumns().map((column) => (
                    <td
                      key={column.id}
                      className="p-2 align-middle whitespace-nowrap"
                    >
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => {
                    const rendered = flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )

                    const content =
                      typeof rendered === "string" ||
                      typeof rendered === "number" ? (
                        <DataTableCell>{rendered}</DataTableCell>
                      ) : (
                        rendered
                      )

                    return (
                      <td
                        key={cell.id}
                        className="p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0"
                      >
                        {content}
                      </td>
                    )
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  {config.emptyState ?? "No results."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <DataTablePagination
        table={table}
        pageSizeOptions={config.pagination?.pageSizeOptions}
      />
      {config.enableRowSelection && selectedRowCount > 0 && (
        <DataTableSelectionBar
          table={table}
          selectionActions={config.selectionActions}
        />
      )}
    </div>
  )
}

export { DataTable }
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Verify existing tests still pass**

```bash
npx vitest run src/components/organisms/data-table/data-table.test.tsx
```

Expected: all 4 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/organisms/data-table/data-table.tsx
git commit -m "feat(data-table): add DataTable root component"
```

---

### Task 10 — Create Storybook stories

**Files:**
- Create: `src/components/organisms/data-table/data-table.stories.tsx`

- [ ] **Step 1: Create data-table.stories.tsx**

Create `src/components/organisms/data-table/data-table.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react"
import { userEvent, within, expect } from "@storybook/test"
import { DataTable } from "./data-table"
import { getSelectColumn } from "./data-table-helpers"
import { Badge } from "@/components/atoms/badge/badge"
import { Button } from "@/components/atoms/button/button"
import type { ColumnDef } from "@tanstack/react-table"
import type { DataTableConfig } from "./data-table-types"

// --- Mock data ---

interface Product {
  id: string
  name: string
  category: string
  price: number
  status: "active" | "draft" | "archived"
}

const products: Product[] = Array.from({ length: 42 }, (_, i) => ({
  id: `PRD-${String(i + 1).padStart(3, "0")}`,
  name: `Product ${i + 1}`,
  category: ["Rings", "Necklaces", "Earrings", "Bracelets"][i % 4],
  price: Math.round((Math.random() * 500 + 50) * 100) / 100,
  status: (["active", "draft", "archived"] as const)[i % 3],
}))

const baseColumns: ColumnDef<Product, unknown>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => `$${row.original.price.toFixed(2)}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="outline">{row.original.status}</Badge>,
  },
]

// --- Stories ---

const meta: Meta<typeof DataTable<Product>> = {
  title: "Data/DataTable",
  component: DataTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
}

export default meta
type Story = StoryObj<typeof DataTable<Product>>

export const Default: Story = {
  args: {
    data: products,
    config: {
      columns: baseColumns,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify table renders with rows
    const rows = canvas.getAllByRole("row")
    // 1 header row + 10 data rows (default page size)
    await expect(rows.length).toBe(11)

    // Verify pagination shows correct page count
    const pageInfo = canvas.getByText(/Page 1 of/)
    await expect(pageInfo).toBeInTheDocument()
  },
}

export const WithSelection: Story = {
  args: {
    data: products,
    config: {
      columns: [getSelectColumn<Product>(), ...baseColumns],
      enableRowSelection: true,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click the first row's checkbox
    const checkboxes = canvas.getAllByRole("checkbox")
    await userEvent.click(checkboxes[1]) // [0] is the header checkbox

    // Verify selection bar appears
    const selectionText = canvas.getByText(/1 row\(s\) selected/)
    await expect(selectionText).toBeInTheDocument()

    // Verify clear selection button exists
    const clearButton = canvas.getByRole("button", { name: /Clear selection/ })
    await expect(clearButton).toBeInTheDocument()
  },
}

export const WithSelectionActions: Story = {
  args: {
    data: products,
    config: {
      columns: [getSelectColumn<Product>(), ...baseColumns],
      enableRowSelection: true,
      selectionActions: (_rows, clearSelection) => (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => clearSelection()}
        >
          Delete selected
        </Button>
      ),
    },
  },
}

export const Loading: Story = {
  args: {
    data: [],
    config: {
      columns: baseColumns,
    },
    loading: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify skeletons are rendered
    const skeletons = canvasElement.querySelectorAll('[data-slot="skeleton"]')
    await expect(skeletons.length).toBeGreaterThan(0)
  },
}

export const Empty: Story = {
  args: {
    data: [],
    config: {
      columns: baseColumns,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const emptyText = canvas.getByText("No results.")
    await expect(emptyText).toBeInTheDocument()
  },
}

export const CustomEmptyState: Story = {
  args: {
    data: [],
    config: {
      columns: baseColumns,
      emptyState: (
        <div className="flex flex-col items-center gap-2 py-8">
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or add a new product.
          </p>
        </div>
      ),
    },
  },
}

export const CustomPageSizes: Story = {
  args: {
    data: products,
    config: {
      columns: baseColumns,
      pagination: {
        pageSizeOptions: [5, 10, 25, 50],
      },
    },
  },
}
```

- [ ] **Step 2: Verify Storybook builds**

```bash
npx storybook build
```

Expected: builds without errors. All stories should compile.

- [ ] **Step 3: Visually verify in Storybook** (manual)

```bash
npx storybook dev -p 6006
```

Open `http://localhost:6006` and navigate to **Data / DataTable**. Check:
- Default: table renders with 10 rows, pagination works.
- WithSelection: checkboxes render, clicking one shows the selection bar fixed at the bottom.
- Loading: skeleton rows fill the table.
- Empty: "No results." centred.
- CustomEmptyState: custom message renders.
- CustomPageSizes: rows-per-page dropdown shows 5, 10, 25, 50.

- [ ] **Step 4: Commit**

```bash
git add src/components/organisms/data-table/data-table.stories.tsx
git commit -m "feat(data-table): add Storybook stories with play functions"
```

---

### Task 11 — Create COMPONENT.md

**Files:**
- Create: `src/components/organisms/data-table/COMPONENT.md`

- [ ] **Step 1: Create COMPONENT.md**

Create `src/components/organisms/data-table/COMPONENT.md`:

```markdown
---
name: DataTable
slug: data-table
version: 0.1.0
status: unstable
lastUpdated: 2026-04-15
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
| `pagination` | `DataTablePaginationConfig` | — | Pagination options |
| `enableRowSelection` | `boolean` | `false` | Enable row selection checkboxes |
| `selectionActions` | `(rows, clearSelection) => ReactNode` | — | Custom actions rendered in the selection bar |
| `emptyState` | `ReactNode` | `"No results."` | Custom empty state content |

### DataTablePaginationConfig

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pageSizeOptions` | `number[]` | `[10, 20, 30, 40, 50]` | Available page sizes. First value is the default. |

### DataTableHeader / DataTableCell

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Cell content |
| `className` | `string` | — | Additional CSS classes |

## Usage guidelines

**Do** use DataTable for data-heavy views with pagination, sorting, or row selection.

**Don't** use DataTable for simple, small, static tables — use the Table organism directly instead.

**Don't** lift table state to the page level. DataTable owns all state internally. Use `selectionActions` to react to selection, not external state management.

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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/organisms/data-table/COMPONENT.md
git commit -m "docs(data-table): add COMPONENT.md"
```

---

### Task 12 — Update barrel exports + update master spec

**Files:**
- Modify: `src/index.ts`
- Modify: `../../.context/attachments/datatable-spec.md` (relative to repo root)

- [ ] **Step 1: Add DataTable exports to src/index.ts**

Add the following exports to `src/index.ts`, in the organisms section (after the existing commented-out organism exports):

```ts
// organisms — data-table
export { DataTable } from "./components/organisms/data-table/data-table"
export { DataTableHeader, DataTableCell } from "./components/organisms/data-table/data-table-cells"
export { getSelectColumn } from "./components/organisms/data-table/data-table-helpers"
export type {
  DataTableProps,
  DataTableConfig,
  DataTablePaginationConfig,
  DataTableHeaderProps,
  DataTableCellProps,
} from "./components/organisms/data-table/data-table-types"
```

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Update the master datatable-spec.md**

Update `.context/attachments/datatable-spec.md` (at the repo root level) to incorporate all Phase 1 decisions. Add a new section at the top of the file, after the status line:

```markdown
## Phase 1 decisions (2026-04-15)

The following decisions were made during the Phase 1 design and implementation:

- **Phased delivery.** The spec is delivered in 4 phases: (1) core table, pagination, selection, cells, helpers; (2) toolbar with search, sort, clear-all; (3) quick filter system; (4) server-side mode.
- **Independent from Table organism.** DataTable renders its own `<table>` markup and styles. It does not import from the Table organism. The existing Table organism is for lightweight presentation; DataTable is for data-heavy dashboard views. Their styling trajectories diverge.
- **`useDataTable` internal hook.** All state (sorting, filters, pagination, selection) and the TanStack Table instance live in an internal hook. DataTable is a pure render component.
- **No sticky header.**
- **Loading state is not configurable.** Always renders Skeleton rows matching the current page size. The `loadingState` config option from the original spec was removed.
- **Empty state is configurable** via `emptyState` in the config. Default: centred "No results." text.
- **Selection bar fixed to viewport bottom** at a higher z-index. "Clear selection" button is the rightmost element.
- **Pagination is centred.** No selection count in pagination — that is DataTableSelectionBar's concern.
- **Tabler icons** for pagination chevrons.
- **`useDebounce` hook** added to `src/hooks/` as a shared utility for Phase 2 toolbar search.
- **Border radius** uses the library's standard radius token (rounded-lg on the container).
```

- [ ] **Step 4: Commit barrel exports**

The `datatable-spec.md` update is not committed — it lives in the gitignored `.context/` workspace directory. It is updated in place so Phase 2 can read it.

```bash
git add src/index.ts
git commit -m "feat(data-table): add barrel exports"
```

---

### Task 13 — Final verification

- [ ] **Step 1: Type check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```

Expected: all tests pass, including the 4 validateConfig tests.

- [ ] **Step 3: Run Storybook test runner** (if configured)

```bash
npm run test:storybook
```

Expected: all DataTable stories render without errors. Axe-core shows no accessibility violations.

- [ ] **Step 4: Manual Storybook smoke test**

```bash
npx storybook dev -p 6006
```

Walk through each story in **Data / DataTable** and verify:
- Default: 10 rows render, pagination navigates correctly
- WithSelection: checkboxes work, selection bar appears at viewport bottom
- WithSelectionActions: custom action button renders in selection bar
- Loading: skeleton rows match page size, pulse animation visible
- Empty: "No results." centred
- CustomEmptyState: custom content renders
- CustomPageSizes: dropdown shows correct options, changing size re-paginates

All visual checks pass → Phase 1 is complete.
