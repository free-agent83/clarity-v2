# DataTable Phase 2: Toolbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a toolbar to DataTable with debounced search input and sort dropdown.

**Architecture:** `DataTableToolbar` is an internal component rendered by `DataTable` when `config.toolbar` is defined. Search uses TanStack Table's global filter restricted to configured columns, debounced via the existing `useDebounce` hook. Sort uses `DropdownMenu` with `RadioGroup` to apply preset sort options. All state lives in the `useDataTable` hook.

**Tech Stack:** React 19, TypeScript 5.9, TanStack Table, Tailwind v4, Tabler Icons, existing InputGroup + DropdownMenu library components, existing `useDebounce` hook.

---

## File map

| File | Action | Responsibility |
|------|--------|----------------|
| `packages/components/src/components/organisms/data-table/data-table-types.ts` | Modify | Add `DataTableToolbarConfig`, `SortOption`, `toolbar?` field |
| `packages/components/src/components/organisms/data-table/use-data-table.ts` | Modify | Add `globalFilter` state, column restriction, validation, expanded return |
| `packages/components/src/components/organisms/data-table/data-table-toolbar.tsx` | Create | Internal toolbar component with search + sort |
| `packages/components/src/components/organisms/data-table/data-table.tsx` | Modify | Import and render `DataTableToolbar` |
| `packages/components/src/components/organisms/data-table/data-table.test.tsx` | Modify | Add toolbar validation tests |
| `packages/components/src/components/organisms/data-table/data-table.stories.tsx` | Modify | Add 3 toolbar stories with play functions |
| `packages/components/src/components/organisms/data-table/COMPONENT.md` | Modify | Document toolbar config |
| `packages/components/src/index.ts` | Modify | Export new types |

---

### Task 1: Add toolbar types

**Files:**
- Modify: `packages/components/src/components/organisms/data-table/data-table-types.ts`

- [ ] **Step 1: Add `SortOption` and `DataTableToolbarConfig` interfaces and the `toolbar?` field to `DataTableConfig`**

Add the following after the existing `DataTablePaginationConfig` interface (around line 30), and add `toolbar?` to `DataTableConfig`:

```ts
/**
 * Sort preset for the toolbar sort dropdown.
 *
 * Each option maps a human-readable label to a column + direction pair.
 */
export interface SortOption {
  label: string
  columnId: string
  direction: "asc" | "desc"
}

/**
 * Toolbar configuration for DataTable.
 *
 * Controls the search input and sort dropdown rendered above the table.
 * Both features are optional — configure only what you need.
 */
export interface DataTableToolbarConfig {
  search?: {
    placeholder?: string
    columnIds: string[]
    debounceMs?: number
  }
  sorting?: SortOption[]
}
```

Add `toolbar?` to `DataTableConfig` after the `pagination?` field:

```ts
export interface DataTableConfig<TData> {
  columns: ColumnDef<TData, unknown>[]
  toolbar?: DataTableToolbarConfig
  pagination?: DataTablePaginationConfig
  enableRowSelection?: boolean
  selectionActions?: (rows: TData[], clearSelection: () => void) => ReactNode
  emptyState?: ReactNode
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd packages/components && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/components/src/components/organisms/data-table/data-table-types.ts
git commit -m "feat(data-table): add toolbar and sort option types"
```

---

### Task 2: Add toolbar validation (TDD)

**Files:**
- Modify: `packages/components/src/components/organisms/data-table/data-table.test.tsx`
- Modify: `packages/components/src/components/organisms/data-table/use-data-table.ts`

- [ ] **Step 1: Write the failing tests**

Add these test cases inside the existing `describe("validateConfig", ...)` block in `packages/components/src/components/organisms/data-table/data-table.test.tsx`:

```ts
it("throws when toolbar.search has empty columnIds", () => {
  const config: DataTableConfig<{ name: string }> = {
    columns: [{ accessorKey: "name", header: "Name" }],
    toolbar: {
      search: { columnIds: [] },
    },
  }
  expect(() => validateConfig(config)).toThrow(
    "toolbar.search.columnIds must be a non-empty array"
  )
})

it("throws when toolbar.search.columnIds references a non-existent column", () => {
  const config: DataTableConfig<{ name: string }> = {
    columns: [{ accessorKey: "name", header: "Name" }],
    toolbar: {
      search: { columnIds: ["nonexistent"] },
    },
  }
  expect(() => validateConfig(config)).toThrow(
    'toolbar.search.columnIds references unknown column "nonexistent"'
  )
})

it("throws when toolbar.sorting references a non-existent column", () => {
  const config: DataTableConfig<{ name: string }> = {
    columns: [{ accessorKey: "name", header: "Name" }],
    toolbar: {
      sorting: [
        { label: "Name A-Z", columnId: "nonexistent", direction: "asc" },
      ],
    },
  }
  expect(() => validateConfig(config)).toThrow(
    'toolbar.sorting references unknown column "nonexistent"'
  )
})

it("does not throw for valid toolbar config with search and sorting", () => {
  const config: DataTableConfig<{ name: string }> = {
    columns: [{ accessorKey: "name", header: "Name" }],
    toolbar: {
      search: { columnIds: ["name"], placeholder: "Search..." },
      sorting: [
        { label: "Name A-Z", columnId: "name", direction: "asc" },
      ],
    },
  }
  expect(() => validateConfig(config)).not.toThrow()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/components && npx vitest run --project=unit`
Expected: 4 new tests fail (existing 4 still pass).

- [ ] **Step 3: Implement the validation logic**

In `packages/components/src/components/organisms/data-table/use-data-table.ts`, update the `validateConfig` function. Add this code after the existing selection validation block (after line 41, before the closing brace):

```ts
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

  // Toolbar validation
  const columnIds = config.columns.map((col) =>
    "accessorKey" in col ? String(col.accessorKey) : col.id ?? ""
  )

  if (config.toolbar?.search) {
    if (!config.toolbar.search.columnIds.length) {
      throw new Error(
        "DataTable: toolbar.search.columnIds must be a non-empty array."
      )
    }
    for (const id of config.toolbar.search.columnIds) {
      if (!columnIds.includes(id)) {
        throw new Error(
          `DataTable: toolbar.search.columnIds references unknown column "${id}". ` +
            `Available columns: ${columnIds.filter(Boolean).join(", ")}`
        )
      }
    }
  }

  if (config.toolbar?.sorting) {
    for (const option of config.toolbar.sorting) {
      if (!columnIds.includes(option.columnId)) {
        throw new Error(
          `DataTable: toolbar.sorting references unknown column "${option.columnId}". ` +
            `Available columns: ${columnIds.filter(Boolean).join(", ")}`
        )
      }
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they all pass**

Run: `cd packages/components && npx vitest run --project=unit`
Expected: All 8 tests pass (4 existing + 4 new).

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/components/organisms/data-table/data-table.test.tsx packages/components/src/components/organisms/data-table/use-data-table.ts
git commit -m "feat(data-table): add toolbar config validation with tests"
```

---

### Task 3: Add global filter state to hook

**Files:**
- Modify: `packages/components/src/components/organisms/data-table/use-data-table.ts`

- [ ] **Step 1: Add globalFilter state, column restriction, and expanded return type**

Replace the full content of `use-data-table.ts` with:

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
  type ColumnDef,
} from "@tanstack/react-table"
import { DEFAULT_PAGE_SIZE_OPTIONS, type DataTableConfig } from "./data-table-types"

interface UseDataTableReturn<TData> {
  table: Table<TData>
  hasActiveFilters: boolean
  globalFilter: string
  setGlobalFilter: (value: string) => void
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

  const columnIds = config.columns.map((col) =>
    "accessorKey" in col ? String(col.accessorKey) : col.id ?? ""
  )

  if (config.toolbar?.search) {
    if (!config.toolbar.search.columnIds.length) {
      throw new Error(
        "DataTable: toolbar.search.columnIds must be a non-empty array."
      )
    }
    for (const id of config.toolbar.search.columnIds) {
      if (!columnIds.includes(id)) {
        throw new Error(
          `DataTable: toolbar.search.columnIds references unknown column "${id}". ` +
            `Available columns: ${columnIds.filter(Boolean).join(", ")}`
        )
      }
    }
  }

  if (config.toolbar?.sorting) {
    for (const option of config.toolbar.sorting) {
      if (!columnIds.includes(option.columnId)) {
        throw new Error(
          `DataTable: toolbar.sorting references unknown column "${option.columnId}". ` +
            `Available columns: ${columnIds.filter(Boolean).join(", ")}`
        )
      }
    }
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
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const columns: ColumnDef<TData, unknown>[] = config.toolbar?.search
    ? config.columns.map((col) => {
        const id = "accessorKey" in col ? String(col.accessorKey) : col.id
        const isSearchable = config.toolbar!.search!.columnIds.includes(id ?? "")
        return isSearchable ? col : { ...col, enableGlobalFilter: false }
      })
    : config.columns

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
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  })

  const hasActiveFilters = columnFilters.length > 0 || globalFilter !== ""

  return { table, hasActiveFilters, globalFilter, setGlobalFilter }
}

export { useDataTable, validateConfig }
export type { UseDataTableReturn }
```

- [ ] **Step 2: Run all tests to verify nothing is broken**

Run: `cd packages/components && npx vitest run --project=unit`
Expected: All 8 tests pass.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd packages/components && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add packages/components/src/components/organisms/data-table/use-data-table.ts
git commit -m "feat(data-table): add global filter state and column restriction to hook"
```

---

### Task 4: Create DataTableToolbar component

**Files:**
- Create: `packages/components/src/components/organisms/data-table/data-table-toolbar.tsx`

- [ ] **Step 1: Create the toolbar component file**

Create `packages/components/src/components/organisms/data-table/data-table-toolbar.tsx`:

```tsx
import { useState, useEffect } from "react"
import type { Table } from "@tanstack/react-table"
import { IconSearch, IconX, IconChevronDown } from "@tabler/icons-react"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "@/components/atoms/button/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/atoms/input-group/input-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/molecules/dropdown-menu/dropdown-menu"
import type { DataTableToolbarConfig } from "./data-table-types"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  toolbar: DataTableToolbarConfig
  globalFilter: string
  setGlobalFilter: (value: string) => void
}

function DataTableToolbar<TData>({
  table,
  toolbar,
  globalFilter,
  setGlobalFilter,
}: DataTableToolbarProps<TData>) {
  const [localSearch, setLocalSearch] = useState(globalFilter)
  const debouncedSearch = useDebounce(
    localSearch,
    toolbar.search?.debounceMs ?? 300
  )

  useEffect(() => {
    setGlobalFilter(debouncedSearch)
  }, [debouncedSearch, setGlobalFilter])

  const handleClearSearch = () => {
    setLocalSearch("")
    setGlobalFilter("")
  }

  const currentSort = table.getState().sorting[0]
  const activeSortValue = currentSort
    ? `${currentSort.id}-${currentSort.desc ? "desc" : "asc"}`
    : undefined
  const activeSortLabel = toolbar.sorting?.find(
    (opt) =>
      opt.columnId === currentSort?.id &&
      opt.direction === (currentSort?.desc ? "desc" : "asc")
  )?.label

  const handleSort = (value: string) => {
    const option = toolbar.sorting?.find(
      (opt) => `${opt.columnId}-${opt.direction}` === value
    )
    if (option) {
      table.getColumn(option.columnId)?.toggleSorting(option.direction === "desc")
    }
  }

  return (
    <div
      data-slot="data-table-toolbar"
      className="flex items-center justify-between gap-4"
    >
      <div className="flex flex-1 items-center gap-2">
        {toolbar.search && (
          <InputGroup className="max-w-sm">
            <InputGroupAddon align="inline-start">
              <IconSearch className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder={toolbar.search.placeholder ?? "Search..."}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label="Clear search"
                  onClick={handleClearSearch}
                >
                  <IconX className="size-3.5" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
        )}
      </div>
      {toolbar.sorting && toolbar.sorting.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {activeSortLabel ?? "Sort"}
              <IconChevronDown className="ml-1 size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={activeSortValue}
              onValueChange={handleSort}
            >
              {toolbar.sorting.map((option) => (
                <DropdownMenuRadioItem
                  key={`${option.columnId}-${option.direction}`}
                  value={`${option.columnId}-${option.direction}`}
                >
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

export { DataTableToolbar }
export type { DataTableToolbarProps }
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd packages/components && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/components/src/components/organisms/data-table/data-table-toolbar.tsx
git commit -m "feat(data-table): create DataTableToolbar component"
```

---

### Task 5: Wire toolbar into DataTable root

**Files:**
- Modify: `packages/components/src/components/organisms/data-table/data-table.tsx`

- [ ] **Step 1: Add toolbar import and rendering**

In `packages/components/src/components/organisms/data-table/data-table.tsx`:

Add the import at the top (after the existing imports):

```ts
import { DataTableToolbar } from "./data-table-toolbar"
```

Update the destructuring of the hook return to include `globalFilter` and `setGlobalFilter`:

Replace:
```ts
const { table } = useDataTable(data, config)
```

With:
```ts
const { table, globalFilter, setGlobalFilter } = useDataTable(data, config)
```

Add the toolbar rendering inside the root `<div>`, before the `<div className="overflow-hidden rounded-lg border">`:

```tsx
{config.toolbar && (
  <DataTableToolbar
    table={table}
    toolbar={config.toolbar}
    globalFilter={globalFilter}
    setGlobalFilter={setGlobalFilter}
  />
)}
```

The full root div should now be:

```tsx
<div data-slot="data-table" className="flex flex-col gap-4">
  {config.toolbar && (
    <DataTableToolbar
      table={table}
      toolbar={config.toolbar}
      globalFilter={globalFilter}
      setGlobalFilter={setGlobalFilter}
    />
  )}
  <div className="overflow-hidden rounded-lg border">
    {/* ...existing table markup... */}
  </div>
  <DataTablePagination ... />
  {/* ...existing selection bar... */}
</div>
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd packages/components && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Run all tests to verify nothing is broken**

Run: `cd packages/components && npx vitest run --project=unit`
Expected: All 8 tests pass.

- [ ] **Step 4: Commit**

```bash
git add packages/components/src/components/organisms/data-table/data-table.tsx
git commit -m "feat(data-table): wire DataTableToolbar into root component"
```

---

### Task 6: Add Storybook stories with play functions

**Files:**
- Modify: `packages/components/src/components/organisms/data-table/data-table.stories.tsx`

- [ ] **Step 1: Add three new stories**

Add these stories at the end of `packages/components/src/components/organisms/data-table/data-table.stories.tsx`, after the existing `CustomPageSizes` story:

```tsx
export const WithSearch: Story = {
  args: {
    data: products,
    config: {
      columns: baseColumns,
      toolbar: {
        search: {
          placeholder: "Search products...",
          columnIds: ["name", "category"],
        },
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify toolbar renders with search input
    const searchInput = canvas.getByPlaceholderText("Search products...")
    await expect(searchInput).toBeInTheDocument()

    // Type a search term that matches a known category
    await userEvent.type(searchInput, "Rings")

    // Wait for debounce (300ms default + buffer)
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Verify filtering happened — only rows with "Rings" category should show
    const rows = canvasElement.querySelectorAll("tbody tr")
    for (const row of rows) {
      const cells = row.querySelectorAll("td")
      const rowText = Array.from(cells)
        .map((c) => c.textContent)
        .join(" ")
      await expect(rowText).toMatch(/Rings/)
    }

    // Clear search via × button
    const clearButton = canvas.getByRole("button", { name: "Clear search" })
    await userEvent.click(clearButton)

    // Wait for state to settle
    await new Promise((resolve) => setTimeout(resolve, 100))

    // Verify rows are restored (default page size = 10)
    const restoredRows = canvasElement.querySelectorAll("tbody tr")
    await expect(restoredRows.length).toBe(10)
  },
}

export const WithSorting: Story = {
  args: {
    data: products,
    config: {
      columns: baseColumns,
      toolbar: {
        sorting: [
          { label: "Price, high to low", columnId: "price", direction: "desc" },
          { label: "Price, low to high", columnId: "price", direction: "asc" },
          { label: "Name A–Z", columnId: "name", direction: "asc" },
          { label: "Name Z–A", columnId: "name", direction: "desc" },
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Verify sort button renders with default label
    const sortButton = canvas.getByRole("button", { name: /Sort/ })
    await expect(sortButton).toBeInTheDocument()

    // Open sort dropdown
    await userEvent.click(sortButton)

    // Select "Price, high to low"
    const option = canvas.getByRole("menuitemradio", {
      name: "Price, high to low",
    })
    await userEvent.click(option)

    // Verify trigger now shows active sort label
    const updatedButton = canvas.getByRole("button", {
      name: /Price, high to low/,
    })
    await expect(updatedButton).toBeInTheDocument()

    // Verify first data row has the highest price
    // Products: price = round((i+1)*37.5 + 50, 2). Product 42 = round(42*37.5+50, 2) = $1,625.00
    const firstDataRow = canvasElement.querySelectorAll("tbody tr")[0]
    const priceCell = firstDataRow?.querySelectorAll("td")[3]
    await expect(priceCell?.textContent).toBe("$1625.00")
  },
}

export const WithToolbar: Story = {
  args: {
    data: products,
    config: {
      columns: baseColumns,
      toolbar: {
        search: {
          placeholder: "Search products...",
          columnIds: ["name", "category"],
        },
        sorting: [
          { label: "Price, high to low", columnId: "price", direction: "desc" },
          { label: "Price, low to high", columnId: "price", direction: "asc" },
        ],
      },
    },
  },
}
```

- [ ] **Step 2: Start Storybook and verify stories render**

Run: `cd packages/components && npx storybook dev -p 6006` (use 6007 if 6006 is in use)

Check that all three new stories render correctly in the browser:
- `WithSearch`: shows search input, typing filters rows, × clears
- `WithSorting`: shows Sort button, clicking opens dropdown, selecting sorts
- `WithToolbar`: shows both search and sort together

- [ ] **Step 3: Commit**

```bash
git add packages/components/src/components/organisms/data-table/data-table.stories.tsx
git commit -m "feat(data-table): add toolbar stories with play functions"
```

---

### Task 7: Update barrel exports

**Files:**
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: Add new type exports**

In `packages/components/src/index.ts`, find the existing data-table type exports (around line 97-103):

```ts
export type {
  DataTableProps,
  DataTableConfig,
  DataTablePaginationConfig,
  DataTableHeaderProps,
  DataTableCellProps,
} from "./components/organisms/data-table/data-table-types";
```

Replace with:

```ts
export type {
  DataTableProps,
  DataTableConfig,
  DataTablePaginationConfig,
  DataTableToolbarConfig,
  SortOption,
  DataTableHeaderProps,
  DataTableCellProps,
} from "./components/organisms/data-table/data-table-types";
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd packages/components && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/components/src/index.ts
git commit -m "feat(data-table): export toolbar types from barrel"
```

---

### Task 8: Update COMPONENT.md

**Files:**
- Modify: `packages/components/src/components/organisms/data-table/COMPONENT.md`

- [ ] **Step 1: Add toolbar documentation**

In `packages/components/src/components/organisms/data-table/COMPONENT.md`, add a new `### DataTableToolbarConfig` section after the existing `### DataTablePaginationConfig` table (after line 39), and add `toolbar` to the `DataTableConfig` table:

Add `toolbar` row to the `### DataTableConfig` table (after the `columns` row):

```
| `toolbar` | `DataTableToolbarConfig` | — | Toolbar configuration (search, sort) |
```

Add this new section after `### DataTablePaginationConfig`:

```markdown
### DataTableToolbarConfig

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `search` | `{ placeholder?, columnIds, debounceMs? }` | — | Search input configuration |
| `search.placeholder` | `string` | `"Search..."` | Placeholder text for the search input |
| `search.columnIds` | `string[]` | — | Column IDs to include in global search (required, non-empty) |
| `search.debounceMs` | `number` | `300` | Debounce delay in milliseconds |
| `sorting` | `SortOption[]` | — | Preset sort options for the sort dropdown |

### SortOption

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Human-readable label shown in the dropdown |
| `columnId` | `string` | — | Column to sort by |
| `direction` | `"asc" \| "desc"` | — | Sort direction |
```

Update the **Usage guidelines** section to add:

```markdown
**Do** use `toolbar.search.columnIds` to explicitly opt columns into global search. Columns not listed are excluded.

**Don't** configure `toolbar.sorting` options that reference columns not in your `columns` array — this is a runtime error.
```

Update the `lastUpdated` frontmatter field to `2026-04-15`.

- [ ] **Step 2: Commit**

```bash
git add packages/components/src/components/organisms/data-table/COMPONENT.md
git commit -m "docs(data-table): document toolbar config in COMPONENT.md"
```

---

### Task 9: Final verification

**Files:** None (verification only)

- [ ] **Step 1: Run all unit tests**

Run: `cd packages/components && npx vitest run --project=unit`
Expected: All 8 tests pass.

- [ ] **Step 2: Run TypeScript check**

Run: `cd packages/components && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Start Storybook and verify all stories**

Run: `cd packages/components && npx storybook dev -p 6006`

Verify:
- All existing stories (Default, WithSelection, WithSelectionActions, Loading, Empty, CustomEmptyState, CustomPageSizes) still render correctly
- `WithSearch` story: search input filters rows, × clears, play function passes
- `WithSorting` story: sort dropdown works, trigger shows active label, play function passes
- `WithToolbar` story: both search and sort render together

- [ ] **Step 4: Run Storybook tests**

Run: `cd packages/components && npx vitest run --project=storybook`
Expected: All stories pass (including play functions).
