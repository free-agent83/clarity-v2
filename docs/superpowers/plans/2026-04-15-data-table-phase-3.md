# DataTable Phase 3: Quick Filters + Clear All — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add quick filter popovers (checkbox-list and interval-slider) and a "Clear all" button to the DataTable toolbar.

**Architecture:** Each quick filter is a popover with pending state — changes are buffered locally and only applied on "Apply". The checkbox-list and slider filters are stateless leaf components owned by a shared popover template. The hook maps TanStack Table's built-in `arrIncludesSome` and `inNumberRange` filter functions onto columns that have quick filters. "Clear all" resets both column filters and global search.

**Tech Stack:** React 19, TanStack Table (built-in filter functions + faceted row models), Radix Popover / Checkbox / Slider atoms from the component library.

**Spec:** `docs/superpowers/specs/2026-04-15-data-table-phase-3-design.md`

---

## File map

| File | Change | Responsibility |
|------|--------|----------------|
| `data-table-types.ts` | Modify | Add `QuickFilter` type, `quickFilters?` to `DataTableToolbarConfig` |
| `data-table.test.tsx` | Modify | 3 new validation tests |
| `use-data-table.ts` | Modify | Validation, filterFn mapping, `resetAllFilters`, expanded return |
| `data-table-checkbox-filter.tsx` | **Create** | Stateless checkbox list filter |
| `data-table-slider-filter.tsx` | **Create** | Stateless range slider filter |
| `data-table-quick-filter-popover.tsx` | **Create** | Shared popover template with pending state |
| `data-table-toolbar.tsx` | Modify | Render filter popovers + "Clear all", accept new props |
| `data-table.tsx` | Modify | Pass `hasActiveFilters` + `resetAllFilters` to toolbar |
| `data-table.stories.tsx` | Modify | 4 new stories |
| `COMPONENT.md` | Modify | Document `QuickFilter` and `quickFilters` config |
| `index.ts` | Modify | Export `QuickFilter` type |

All paths below are relative to `packages/components/src/components/organisms/data-table/` unless stated otherwise.

---

### Task 1: Add QuickFilter type and update toolbar config

**Files:**
- Modify: `data-table-types.ts`

- [ ] **Step 1: Add the QuickFilter discriminated union type**

Add above the `DataTableToolbarConfig` interface:

```ts
/**
 * Quick filter configuration for the toolbar.
 *
 * Each quick filter renders as a popover trigger button in the toolbar.
 * The popover contains filter-specific controls, an Apply button, and
 * a Clear button. Changes are pending until Apply is clicked.
 */
export type QuickFilter =
  | {
      name: string
      columnId: string
      type: "checkbox-list"
    }
  | {
      name: string
      columnId: string
      type: "interval-slider"
      formatValue?: (value: number) => string
    }
```

- [ ] **Step 2: Add `quickFilters` to DataTableToolbarConfig**

Update the interface to add the new field:

```ts
export interface DataTableToolbarConfig {
  search?: {
    placeholder?: string
    columnIds: string[]
    debounceMs?: number
  }
  sorting?: SortOption[]
  quickFilters?: QuickFilter[]
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd packages/components && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add packages/components/src/components/organisms/data-table/data-table-types.ts
git commit -m "feat(data-table): add QuickFilter type and quickFilters config"
```

---

### Task 2: Add quickFilter validation rules (TDD)

**Files:**
- Test: `data-table.test.tsx`
- Modify: `use-data-table.ts`

- [ ] **Step 1: Write the three failing tests**

Add the following tests at the end of the `describe("validateConfig")` block in `data-table.test.tsx`:

```ts
it("throws when quickFilter.columnId references a non-existent column", () => {
  const config: DataTableConfig<{ name: string }> = {
    columns: [{ accessorKey: "name", header: "Name" }],
    toolbar: {
      quickFilters: [
        { name: "Category", columnId: "nonexistent", type: "checkbox-list" },
      ],
    },
  }
  expect(() => validateConfig(config)).toThrow(
    'toolbar.quickFilters references unknown column "nonexistent"'
  )
})

it("throws when quickFilters has duplicate columnId values", () => {
  const config: DataTableConfig<{ name: string; category: string }> = {
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "category", header: "Category" },
    ],
    toolbar: {
      quickFilters: [
        { name: "Category", columnId: "category", type: "checkbox-list" },
        { name: "Category 2", columnId: "category", type: "checkbox-list" },
      ],
    },
  }
  expect(() => validateConfig(config)).toThrow(
    'toolbar.quickFilters has duplicate columnId "category"'
  )
})

it("does not throw for valid quickFilters config", () => {
  const config: DataTableConfig<{ name: string; category: string; price: number }> = {
    columns: [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "category", header: "Category" },
      { accessorKey: "price", header: "Price" },
    ],
    toolbar: {
      quickFilters: [
        { name: "Category", columnId: "category", type: "checkbox-list" },
        { name: "Price", columnId: "price", type: "interval-slider" },
      ],
    },
  }
  expect(() => validateConfig(config)).not.toThrow()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/components && npx vitest run src/components/organisms/data-table/data-table.test.tsx`
Expected: 2 new tests FAIL (the "throws" tests), 1 new test PASSES (the "does not throw" test). Existing 8 tests still pass.

- [ ] **Step 3: Implement validation in `validateConfig`**

Add the following block at the end of the `validateConfig` function in `use-data-table.ts`, after the existing `toolbar.sorting` validation:

```ts
if (config.toolbar?.quickFilters) {
  const filterColumnIds = new Set<string>()
  for (const filter of config.toolbar.quickFilters) {
    if (!columnIds.includes(filter.columnId)) {
      throw new Error(
        `DataTable: toolbar.quickFilters references unknown column "${filter.columnId}". ` +
          `Available columns: ${columnIds.filter(Boolean).join(", ")}`
      )
    }
    if (filterColumnIds.has(filter.columnId)) {
      throw new Error(
        `DataTable: toolbar.quickFilters has duplicate columnId "${filter.columnId}".`
      )
    }
    filterColumnIds.add(filter.columnId)
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/components && npx vitest run src/components/organisms/data-table/data-table.test.tsx`
Expected: All 11 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/components/organisms/data-table/data-table.test.tsx \
       packages/components/src/components/organisms/data-table/use-data-table.ts
git commit -m "feat(data-table): add quickFilter validation with TDD"
```

---

### Task 3: Add filterFn mapping and resetAllFilters to hook

**Files:**
- Modify: `use-data-table.ts`

- [ ] **Step 1: Update UseDataTableReturn to include resetAllFilters**

Replace the `UseDataTableReturn` interface:

```ts
interface UseDataTableReturn<TData> {
  table: Table<TData>
  hasActiveFilters: boolean
  globalFilter: string
  setGlobalFilter: (value: string) => void
  resetAllFilters: () => void
}
```

- [ ] **Step 2: Replace the column mapping with a combined pass**

Replace the existing column mapping block (lines 97–103 of `use-data-table.ts`):

```ts
const columns: ColumnDef<TData, unknown>[] = config.toolbar?.search
  ? config.columns.map((col) => {
      const id = "accessorKey" in col ? String(col.accessorKey) : col.id
      const isSearchable = config.toolbar!.search!.columnIds.includes(id ?? "")
      return isSearchable ? col : { ...col, enableGlobalFilter: false }
    })
  : config.columns
```

With a combined pass that handles both search restriction and filterFn mapping:

```ts
const searchColumnIds = config.toolbar?.search?.columnIds
const filterFnMap = config.toolbar?.quickFilters
  ? new Map<string, string>(
      config.toolbar.quickFilters.map((f) => [
        f.columnId,
        f.type === "checkbox-list" ? "arrIncludesSome" : "inNumberRange",
      ])
    )
  : undefined

const columns: ColumnDef<TData, unknown>[] =
  searchColumnIds || filterFnMap
    ? config.columns.map((col) => {
        const id = "accessorKey" in col ? String(col.accessorKey) : col.id
        const needsGlobalFilterOff =
          searchColumnIds && !searchColumnIds.includes(id ?? "")
        const filterFn = filterFnMap?.get(id ?? "")

        if (!needsGlobalFilterOff && !filterFn) return col
        return {
          ...col,
          ...(needsGlobalFilterOff && { enableGlobalFilter: false }),
          ...(filterFn && { filterFn }),
        }
      })
    : config.columns
```

- [ ] **Step 3: Add resetAllFilters and update return**

Replace the return block at the bottom of `useDataTable` (lines 130–132):

```ts
const hasActiveFilters = columnFilters.length > 0 || globalFilter !== ""

return { table, hasActiveFilters, globalFilter, setGlobalFilter }
```

With:

```ts
const hasActiveFilters = columnFilters.length > 0 || globalFilter !== ""

const resetAllFilters = () => {
  table.resetColumnFilters()
  setGlobalFilter("")
}

return { table, hasActiveFilters, globalFilter, setGlobalFilter, resetAllFilters }
```

- [ ] **Step 4: Verify TypeScript compiles and tests pass**

Run: `cd packages/components && npx tsc --noEmit && npx vitest run src/components/organisms/data-table/data-table.test.tsx`
Expected: No type errors. All 11 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/components/organisms/data-table/use-data-table.ts
git commit -m "feat(data-table): add filterFn mapping and resetAllFilters to hook"
```

---

### Task 4: Create DataTableCheckboxFilter

**Files:**
- Create: `data-table-checkbox-filter.tsx`

- [ ] **Step 1: Create the checkbox filter component**

Create `data-table-checkbox-filter.tsx`:

```tsx
import { Checkbox } from "@/components/atoms/checkbox/checkbox"
import { Label } from "@/components/atoms/label/label"

interface DataTableCheckboxFilterProps {
  options: string[]
  value: Set<string>
  onChange: (value: Set<string>) => void
}

/**
 * Checkbox list for filtering a column by discrete string values.
 *
 * Stateless — receives value and onChange from parent. Renders one
 * `Checkbox` + `Label` row per option. Options should be pre-sorted.
 *
 * Internal component — never used standalone.
 */
function DataTableCheckboxFilter({
  options,
  value,
  onChange,
}: DataTableCheckboxFilterProps) {
  const handleToggle = (option: string, checked: boolean) => {
    const next = new Set(value)
    if (checked) {
      next.add(option)
    } else {
      next.delete(option)
    }
    onChange(next)
  }

  return (
    <div
      data-slot="data-table-checkbox-filter"
      className="flex flex-col gap-2"
    >
      {options.map((option) => (
        <div key={option} className="flex items-center gap-2">
          <Checkbox
            id={`filter-${option}`}
            checked={value.has(option)}
            onCheckedChange={(checked) =>
              handleToggle(option, checked === true)
            }
          />
          <Label htmlFor={`filter-${option}`}>{option}</Label>
        </div>
      ))}
    </div>
  )
}

export { DataTableCheckboxFilter }
export type { DataTableCheckboxFilterProps }
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd packages/components && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/components/src/components/organisms/data-table/data-table-checkbox-filter.tsx
git commit -m "feat(data-table): create DataTableCheckboxFilter component"
```

---

### Task 5: Create DataTableSliderFilter

**Files:**
- Create: `data-table-slider-filter.tsx`

- [ ] **Step 1: Create the slider filter component**

Create `data-table-slider-filter.tsx`:

```tsx
import { Slider } from "@/components/atoms/slider/slider"

interface DataTableSliderFilterProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  formatValue?: (value: number) => string
}

/**
 * Range slider for filtering a column by numeric interval.
 *
 * Stateless — receives value and onChange from parent. Renders the
 * library `Slider` with dual thumbs and a formatted range label below.
 *
 * Internal component — never used standalone.
 */
function DataTableSliderFilter({
  min,
  max,
  value,
  onChange,
  formatValue,
}: DataTableSliderFilterProps) {
  const fmt = formatValue ?? String

  return (
    <div data-slot="data-table-slider-filter" className="flex flex-col gap-3">
      <Slider
        min={min}
        max={max}
        value={value}
        onValueChange={(v) => onChange(v as [number, number])}
      />
      <p className="text-sm text-muted-foreground">
        {fmt(value[0])} – {fmt(value[1])}
      </p>
    </div>
  )
}

export { DataTableSliderFilter }
export type { DataTableSliderFilterProps }
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd packages/components && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/components/src/components/organisms/data-table/data-table-slider-filter.tsx
git commit -m "feat(data-table): create DataTableSliderFilter component"
```

---

### Task 6: Create DataTableQuickFilterPopover

**Files:**
- Create: `data-table-quick-filter-popover.tsx`

- [ ] **Step 1: Create the quick filter popover component**

Create `data-table-quick-filter-popover.tsx`:

```tsx
import { useState, useEffect } from "react"
import type { Table } from "@tanstack/react-table"
import { IconChevronDown } from "@tabler/icons-react"
import { Button } from "@/components/atoms/button/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover/popover"
import { DataTableCheckboxFilter } from "./data-table-checkbox-filter"
import { DataTableSliderFilter } from "./data-table-slider-filter"
import type { QuickFilter } from "./data-table-types"

interface DataTableQuickFilterPopoverProps<TData> {
  table: Table<TData>
  filter: QuickFilter
}

/**
 * Shared popover template for a single quick filter.
 *
 * Renders the trigger button with an active-state indicator label,
 * the filter-specific controls (checkbox list or range slider), and
 * Apply / Clear action buttons. Changes are pending until Apply.
 *
 * Internal component — never used standalone.
 */
function DataTableQuickFilterPopover<TData>({
  table,
  filter,
}: DataTableQuickFilterPopoverProps<TData>) {
  const [open, setOpen] = useState(false)
  const column = table.getColumn(filter.columnId)

  const [pendingCheckbox, setPendingCheckbox] = useState<Set<string>>(
    new Set()
  )
  const [pendingSlider, setPendingSlider] = useState<[number, number]>([0, 0])

  // Initialise pending state from the column's current filter value when popover opens
  useEffect(() => {
    if (!open || !column) return

    if (filter.type === "checkbox-list") {
      const current = column.getFilterValue() as string[] | undefined
      setPendingCheckbox(new Set(current ?? []))
    } else {
      const current = column.getFilterValue() as [number, number] | undefined
      const faceted = column.getFacetedMinMaxValues() ?? [0, 0]
      setPendingSlider(
        current ?? [faceted[0] ?? 0, faceted[1] ?? 0]
      )
    }
  }, [open, column, filter.type])

  if (!column) return null

  // Trigger label with active indicator
  const triggerLabel = (() => {
    if (filter.type === "checkbox-list") {
      const activeCount = (
        column.getFilterValue() as string[] | undefined
      )?.length
      return activeCount ? `${filter.name} (${activeCount})` : filter.name
    }

    const range = column.getFilterValue() as [number, number] | undefined
    const fmt = filter.formatValue ?? String
    return range
      ? `${filter.name}: ${fmt(range[0])} – ${fmt(range[1])}`
      : filter.name
  })()

  const handleApply = () => {
    if (filter.type === "checkbox-list") {
      const arr = Array.from(pendingCheckbox)
      column.setFilterValue(arr.length > 0 ? arr : undefined)
    } else {
      column.setFilterValue(pendingSlider)
    }
    setOpen(false)
  }

  const handleClear = () => {
    column.setFilterValue(undefined)
    if (filter.type === "checkbox-list") {
      setPendingCheckbox(new Set())
    } else {
      const faceted = column.getFacetedMinMaxValues() ?? [0, 0]
      setPendingSlider([faceted[0] ?? 0, faceted[1] ?? 0])
    }
    setOpen(false)
  }

  const renderFilterContent = () => {
    if (filter.type === "checkbox-list") {
      const facetedValues = column.getFacetedUniqueValues()
      const options = Array.from(facetedValues.keys()).sort()
      return (
        <DataTableCheckboxFilter
          options={options}
          value={pendingCheckbox}
          onChange={setPendingCheckbox}
        />
      )
    }

    const faceted = column.getFacetedMinMaxValues() ?? [0, 0]
    return (
      <DataTableSliderFilter
        min={faceted[0] ?? 0}
        max={faceted[1] ?? 0}
        value={pendingSlider}
        onChange={setPendingSlider}
        formatValue={filter.formatValue}
      />
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          {triggerLabel}
          <IconChevronDown className="ml-1 size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60">
        {renderFilterContent()}
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleApply}>
            Apply
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DataTableQuickFilterPopover }
export type { DataTableQuickFilterPopoverProps }
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd packages/components && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/components/src/components/organisms/data-table/data-table-quick-filter-popover.tsx
git commit -m "feat(data-table): create DataTableQuickFilterPopover component"
```

---

### Task 7: Update toolbar and root component

**Files:**
- Modify: `data-table-toolbar.tsx`
- Modify: `data-table.tsx`

- [ ] **Step 1: Update toolbar props and add import**

In `data-table-toolbar.tsx`, add the import for the popover component:

```ts
import { DataTableQuickFilterPopover } from "./data-table-quick-filter-popover"
```

Update the `DataTableToolbarProps` interface to add the new props:

```ts
interface DataTableToolbarProps<TData> {
  table: Table<TData>
  toolbar: DataTableToolbarConfig
  globalFilter: string
  setGlobalFilter: (value: string) => void
  hasActiveFilters: boolean
  resetAllFilters: () => void
}
```

Update the function signature to destructure the new props:

```ts
function DataTableToolbar<TData>({
  table,
  toolbar,
  globalFilter,
  setGlobalFilter,
  hasActiveFilters,
  resetAllFilters,
}: DataTableToolbarProps<TData>) {
```

- [ ] **Step 2: Render quick filter popovers and "Clear all" button in the toolbar**

Inside the left-side `<div className="flex flex-1 items-center gap-2">`, after the closing `)}` of the search input conditional block (after line 109) and before the closing `</div>` (line 110), add:

```tsx
{toolbar.quickFilters?.map((filter) => (
  <DataTableQuickFilterPopover
    key={filter.columnId}
    table={table}
    filter={filter}
  />
))}
{hasActiveFilters && (
  <Button variant="ghost" size="sm" onClick={resetAllFilters}>
    Clear all
  </Button>
)}
```

- [ ] **Step 3: Update root component to pass new props**

In `data-table.tsx`, update the destructuring of `useDataTable`:

```ts
const { table, globalFilter, setGlobalFilter, hasActiveFilters, resetAllFilters } =
  useDataTable(data, config)
```

Update the `DataTableToolbar` JSX to pass the new props:

```tsx
<DataTableToolbar
  table={table}
  toolbar={config.toolbar}
  globalFilter={globalFilter}
  setGlobalFilter={setGlobalFilter}
  hasActiveFilters={hasActiveFilters}
  resetAllFilters={resetAllFilters}
/>
```

- [ ] **Step 4: Verify TypeScript compiles and tests pass**

Run: `cd packages/components && npx tsc --noEmit && npx vitest run src/components/organisms/data-table/data-table.test.tsx`
Expected: No type errors. All 11 tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/components/organisms/data-table/data-table-toolbar.tsx \
       packages/components/src/components/organisms/data-table/data-table.tsx
git commit -m "feat(data-table): wire quick filters and Clear all into toolbar"
```

---

### Task 8: Add Storybook stories

**Files:**
- Modify: `data-table.stories.tsx`

- [ ] **Step 1: Add the WithCheckboxFilter story**

Add after the `WithToolbar` story:

```tsx
export const WithCheckboxFilter: Story = {
  args: {
    data: products,
    config: {
      columns: baseColumns,
      toolbar: {
        quickFilters: [
          { name: "Category", columnId: "category", type: "checkbox-list" },
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    // Open the Category filter popover
    const trigger = canvas.getByRole("button", { name: "Category" })
    await userEvent.click(trigger)

    // Check two options
    const ringsCb = body.getByRole("checkbox", { name: "Rings" })
    const necklacesCb = body.getByRole("checkbox", { name: "Necklaces" })
    await userEvent.click(ringsCb)
    await userEvent.click(necklacesCb)

    // Apply
    const applyBtn = body.getByRole("button", { name: "Apply" })
    await userEvent.click(applyBtn)

    // Verify trigger label shows count
    await waitFor(() => {
      expect(
        canvas.getByRole("button", { name: /Category \(2\)/ })
      ).toBeInTheDocument()
    })

    // Verify filtered rows contain only Rings or Necklaces
    await waitFor(() => {
      const rows = canvasElement.querySelectorAll("tbody tr")
      for (const row of rows) {
        const text = row.textContent ?? ""
        expect(text).toMatch(/Rings|Necklaces/)
      }
    })

    // Reopen popover and Clear
    await userEvent.click(
      canvas.getByRole("button", { name: /Category \(2\)/ })
    )
    const clearBtn = body.getByRole("button", { name: "Clear" })
    await userEvent.click(clearBtn)

    // Verify trigger label resets and all rows restored
    await waitFor(() => {
      expect(
        canvas.getByRole("button", { name: "Category" })
      ).toBeInTheDocument()
      const rows = canvasElement.querySelectorAll("tbody tr")
      expect(rows.length).toBe(10)
    })
  },
}
```

- [ ] **Step 2: Add the WithSliderFilter story**

```tsx
export const WithSliderFilter: Story = {
  args: {
    data: products,
    config: {
      columns: baseColumns,
      toolbar: {
        quickFilters: [
          {
            name: "Price",
            columnId: "price",
            type: "interval-slider",
            formatValue: (v: number) => `$${v.toFixed(0)}`,
          },
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    // Verify the Price filter trigger renders
    const trigger = canvas.getByRole("button", { name: "Price" })
    await expect(trigger).toBeInTheDocument()

    // Open the popover and verify slider renders
    await userEvent.click(trigger)

    await waitFor(() => {
      const sliders = body.getAllByRole("slider")
      expect(sliders.length).toBe(2) // dual thumbs
    })

    // Apply with default full range
    const applyBtn = body.getByRole("button", { name: "Apply" })
    await userEvent.click(applyBtn)

    // Verify trigger label shows the formatted range
    await waitFor(() => {
      expect(
        canvas.getByRole("button", { name: /Price: \$/ })
      ).toBeInTheDocument()
    })
  },
}
```

- [ ] **Step 3: Add the WithQuickFilters story**

Render-only story showing the full toolbar. No play function.

```tsx
export const WithQuickFilters: Story = {
  args: {
    data: products,
    config: {
      columns: baseColumns,
      toolbar: {
        search: {
          placeholder: "Search products...",
          columnIds: ["name", "category"],
        },
        quickFilters: [
          { name: "Category", columnId: "category", type: "checkbox-list" },
          {
            name: "Price",
            columnId: "price",
            type: "interval-slider",
            formatValue: (v: number) => `$${v.toFixed(0)}`,
          },
        ],
        sorting: [
          { label: "Price, high to low", columnId: "price", direction: "desc" },
          { label: "Price, low to high", columnId: "price", direction: "asc" },
        ],
      },
    },
  },
}
```

- [ ] **Step 4: Add the WithClearAll story**

```tsx
export const WithClearAll: Story = {
  args: {
    data: products,
    config: {
      columns: baseColumns,
      toolbar: {
        search: {
          placeholder: "Search products...",
          columnIds: ["name", "category"],
        },
        quickFilters: [
          { name: "Category", columnId: "category", type: "checkbox-list" },
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const body = within(document.body)

    // Apply a checkbox filter
    const trigger = canvas.getByRole("button", { name: "Category" })
    await userEvent.click(trigger)

    const ringsCb = body.getByRole("checkbox", { name: "Rings" })
    await userEvent.click(ringsCb)

    const applyBtn = body.getByRole("button", { name: "Apply" })
    await userEvent.click(applyBtn)

    // Verify "Clear all" appears
    await waitFor(() => {
      expect(
        canvas.getByRole("button", { name: "Clear all" })
      ).toBeInTheDocument()
    })

    // Click "Clear all"
    await userEvent.click(
      canvas.getByRole("button", { name: "Clear all" })
    )

    // Verify filter is reset
    await waitFor(() => {
      expect(
        canvas.getByRole("button", { name: "Category" })
      ).toBeInTheDocument()
    })

    // Verify "Clear all" disappears
    await waitFor(() => {
      expect(
        canvas.queryByRole("button", { name: "Clear all" })
      ).not.toBeInTheDocument()
    })

    // Verify all rows restored
    await waitFor(() => {
      const rows = canvasElement.querySelectorAll("tbody tr")
      expect(rows.length).toBe(10)
    })
  },
}
```

- [ ] **Step 5: Verify Storybook renders all stories without errors**

Run: `cd packages/components && npx storybook dev -p 6006`
Check all DataTable stories in the browser. All 14 stories should render.

- [ ] **Step 6: Commit**

```bash
git add packages/components/src/components/organisms/data-table/data-table.stories.tsx
git commit -m "feat(data-table): add quick filter and Clear all stories"
```

---

### Task 9: Update COMPONENT.md and barrel exports

**Files:**
- Modify: `COMPONENT.md`
- Modify: `packages/components/src/index.ts` (barrel)

- [ ] **Step 1: Add QuickFilter documentation to COMPONENT.md**

Add a `### QuickFilter` section after the `### SortOption` section:

```md
### QuickFilter

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | — | Label shown on the filter trigger button |
| `columnId` | `string` | — | Column to filter (must match a column in `columns`) |
| `type` | `"checkbox-list" \| "interval-slider"` | — | Filter type |
| `formatValue` | `(value: number) => string` | `String` | Format function for slider range display (interval-slider only) |
```

Update the `### DataTableToolbarConfig` table to add the `quickFilters` row:

```md
| `quickFilters` | `QuickFilter[]` | — | Quick filter popovers rendered in the toolbar |
```

Add a usage guideline:

```md
**Do** use `toolbar.quickFilters` for columns with a small set of discrete values (checkbox-list) or numeric ranges (interval-slider). Each filter renders as a popover with pending state — changes apply on "Apply".

**Don't** configure two quick filters with the same `columnId` — this is a runtime error.
```

- [ ] **Step 2: Export QuickFilter type from barrel**

In `packages/components/src/index.ts`, add `QuickFilter` to the data-table type exports:

```ts
export type {
  DataTableProps,
  DataTableConfig,
  DataTablePaginationConfig,
  DataTableToolbarConfig,
  SortOption,
  QuickFilter,
  DataTableHeaderProps,
  DataTableCellProps,
} from "./components/organisms/data-table/data-table-types";
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd packages/components && npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add packages/components/src/components/organisms/data-table/COMPONENT.md \
       packages/components/src/index.ts
git commit -m "docs(data-table): document quick filters and export QuickFilter type"
```
