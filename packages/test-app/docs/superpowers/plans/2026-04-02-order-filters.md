# Order Filters, Search, and Sorting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up all filter, search, and sort controls on the orders page using shared, reusable filter components extracted from the PLP layout.

**Architecture:** Extract `FilterBar`, `SortButton` into `components/filters/` as controlled components. Create a new `SearchInput` there too. Refactor the orders page to a three-layer pattern: Server Component (data fetch) -> RealtimeWrapper (live updates) -> FilterableList (filtering/sorting/search state + rendering). Update all existing PLP consumers to import from the new shared location.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, shadcn/ui (Radix), Supabase Realtime, Drizzle ORM

---

## File Map

**Create:**
- `components/filters/filter-bar.tsx` — Controlled FilterBar (popovers + sheet + clear all)
- `components/filters/sort-button.tsx` — Controlled SortButton
- `components/filters/search-input.tsx` — Form-based search with submit on Enter
- `components/filters/uncontrolled-filter-bar.tsx` — Thin wrapper for existing PLP pages
- `components/orders/orders-filterable-list.tsx` — Client component owning filter/sort/search state, filtering pipeline, table + pagination rendering

**Modify:**
- `components/layouts/pagination-controls.tsx` — Add optional callback props for client-side pagination mode
- `components/layouts/layout-product-list/layout-product-list.tsx` — Import from shared location, replace static Input with SearchInput
- `components/layouts/layout-product-list/filter-bar.tsx` — Delete (moved to shared)
- `components/layouts/layout-product-list/sort-button.tsx` — Delete (moved to shared)
- `components/orders/orders-realtime-wrapper.tsx` — Strip table/pagination rendering, expose raw order list to children via render prop
- `app/buyer/(shop)/orders/page.tsx` — Slim down to Server Component fetching all orders, delegates everything else to RealtimeWrapper -> FilterableList
- `app/buyer/(shop)/orders/actions.ts` — Add `refetchAllOrders` server action (no pagination)
- `lib/api/orders.ts` — Add `fetchAllOrders` function (no pagination wrapper)
- `app/buyer/(shop)/browse/natural-diamonds/page.tsx` — Update imports
- `app/buyer/(shop)/browse/lab-grown-diamonds/page.tsx` — Update imports
- `app/buyer/(shop)/browse/gemstones/page.tsx` — Update imports
- `app/buyer/(shop)/browse/natural-melee/page.tsx` — Update imports
- `app/buyer/(shop)/browse/lab-grown-melee/page.tsx` — Update imports
- `app/buyer/(shop)/browse/jewelry/engagement-rings/page.tsx` — Update imports

---

### Task 1: Create shared FilterBar as a controlled component

**Files:**
- Create: `components/filters/filter-bar.tsx`

This moves the existing FilterBar, FilterPopover, and AllFiltersSheet from `components/layouts/layout-product-list/filter-bar.tsx` into a shared location and converts FilterBar to a controlled component (value + onChange from parent).

- [ ] **Step 1: Create `components/filters/filter-bar.tsx`**

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  IconAdjustmentsHorizontal,
  IconChevronDown,
  IconX,
} from "@tabler/icons-react"

export type FilterOption = {
  key: string
  label: string
  options: string[]
}

type FilterBarProps = {
  filters: FilterOption[]
  value: Record<string, string[]>
  onChange: (filters: Record<string, string[]>) => void
}

type FilterPopoverProps = {
  filter: FilterOption
  committed: string[]
  onApply: (key: string, values: string[]) => void
}

function FilterPopover({ filter, committed, onApply }: FilterPopoverProps) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<string[]>([])

  function handleOpenChange(next: boolean) {
    if (next) setPending(committed)
    setOpen(next)
  }

  function toggle(value: string) {
    setPending((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value],
    )
  }

  function handleApply() {
    onApply(filter.key, pending)
    setOpen(false)
  }

  const isActive = committed.length > 0
  const label =
    committed.length === 0
      ? filter.label
      : committed.length === 1
        ? committed[0]
        : `${filter.label} (${committed.length})`

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={isActive ? "default" : "outline"}
          size="lg"
          className="h-11.25"
        >
          {label}
          {isActive ? (
            <span
              role="button"
              aria-label={`Clear ${filter.label} filter`}
              onClick={(e) => {
                e.stopPropagation()
                onApply(filter.key, [])
              }}
            >
              <IconX className="size-4" />
            </span>
          ) : (
            <IconChevronDown className="size-5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 gap-3">
        <p className="text-sm font-medium">{filter.label}</p>
        <div className="flex flex-col gap-2">
          {filter.options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                checked={pending.includes(option)}
                onCheckedChange={() => toggle(option)}
              />
              {option}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleApply} className="flex-1">
            Apply
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

type AllFiltersSheetProps = {
  filters: FilterOption[]
  committed: Record<string, string[]>
  onApply: (next: Record<string, string[]>) => void
}

function AllFiltersSheet({
  filters,
  committed,
  onApply,
}: AllFiltersSheetProps) {
  const [open, setOpen] = useState(false)
  const [sheetPending, setSheetPending] = useState<Record<string, string[]>>(
    {},
  )

  function handleOpenChange(next: boolean) {
    if (next) setSheetPending(committed)
    setOpen(next)
  }

  function toggle(key: string, value: string) {
    setSheetPending((prev) => {
      const current = prev[key] ?? []
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      }
    })
  }

  function handleApply() {
    onApply(sheetPending)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="lg" className="h-11.25">
          <IconAdjustmentsHorizontal className="size-5" />
          All filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>All filters</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          {filters.map((filter) => (
            <div key={filter.key} className="border-b py-4 last:border-0">
              <p className="mb-3 text-sm font-medium">{filter.label}</p>
              <div className="flex flex-col gap-2">
                {filter.options.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={(sheetPending[filter.key] ?? []).includes(
                        option,
                      )}
                      onCheckedChange={() => toggle(filter.key, option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <SheetFooter>
          <Button onClick={handleApply} className="w-full">
            Apply filters
          </Button>
          <Button
            variant="ghost"
            onClick={() => setSheetPending({})}
            className="w-full"
          >
            Clear all
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export function FilterBar({ filters, value, onChange }: FilterBarProps) {
  function applyFilter(key: string, values: string[]) {
    const next = { ...value }
    if (values.length === 0) {
      delete next[key]
    } else {
      next[key] = values
    }
    onChange(next)
  }

  const hasActive = Object.keys(value).length > 0

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AllFiltersSheet
        filters={filters}
        committed={value}
        onApply={onChange}
      />
      {filters.map((filter) => (
        <FilterPopover
          key={filter.key}
          filter={filter}
          committed={value[filter.key] ?? []}
          onApply={applyFilter}
        />
      ))}
      {hasActive && (
        <Button
          variant="ghost"
          size="lg"
          className="h-11.25"
          onClick={() => onChange({})}
        >
          Clear all
          <IconX className="size-5" />
        </Button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run typecheck`
Expected: No errors related to `components/filters/filter-bar.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/filters/filter-bar.tsx
git commit -m "feat(filters): create shared controlled FilterBar component"
```

---

### Task 2: Create shared SortButton as a controlled component

**Files:**
- Create: `components/filters/sort-button.tsx`

- [ ] **Step 1: Create `components/filters/sort-button.tsx`**

```tsx
"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IconChevronDown } from "@tabler/icons-react"

export type SortOption = {
  value: string
  label: string
  displayLabel: string
}

type SortButtonProps = {
  options: SortOption[]
  value: string
  onChange: (value: string) => void
}

export function SortButton({ options, value, onChange }: SortButtonProps) {
  const current = options.find((o) => o.value === value) ?? options[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" className="h-11.25">
          Sort by: {current.displayLabel}
          <IconChevronDown className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/filters/sort-button.tsx
git commit -m "feat(filters): create shared controlled SortButton component"
```

---

### Task 3: Create SearchInput component

**Files:**
- Create: `components/filters/search-input.tsx`

- [ ] **Step 1: Create `components/filters/search-input.tsx`**

```tsx
"use client"

import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { IconSearch, IconX } from "@tabler/icons-react"

type SearchInputProps = {
  onSearch: (query: string) => void
  placeholder?: string
}

export function SearchInput({
  onSearch,
  placeholder = "Search...",
}: SearchInputProps) {
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSearch(value.trim())
  }

  function handleClear() {
    setValue("")
    onSearch("")
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-sm flex-1">
      <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-11 border-none bg-secondary pl-9 pr-9 shadow-none"
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <IconX className="size-4" />
        </button>
      )}
    </form>
  )
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/filters/search-input.tsx
git commit -m "feat(filters): create shared SearchInput component"
```

---

### Task 4: Migrate PLP consumers to shared filter components

**Files:**
- Delete: `components/layouts/layout-product-list/filter-bar.tsx`
- Delete: `components/layouts/layout-product-list/sort-button.tsx`
- Modify: `components/layouts/layout-product-list/layout-product-list.tsx`
- Modify: `app/buyer/(shop)/browse/natural-diamonds/page.tsx`
- Modify: `app/buyer/(shop)/browse/lab-grown-diamonds/page.tsx`
- Modify: `app/buyer/(shop)/browse/gemstones/page.tsx`
- Modify: `app/buyer/(shop)/browse/natural-melee/page.tsx`
- Modify: `app/buyer/(shop)/browse/lab-grown-melee/page.tsx`
- Modify: `app/buyer/(shop)/browse/jewelry/engagement-rings/page.tsx`

The PLP pages currently use `FilterBar` as an uncontrolled component (no value/onChange). Since the shared `FilterBar` now requires these props, each PLP page needs a thin client wrapper that holds the filter state. However, since PLP filtering logic is out of scope for this issue, we create a simple `UncontrolledFilterBar` wrapper that manages state internally — preserving the existing behavior while using the shared component underneath.

- [ ] **Step 1: Create `components/filters/uncontrolled-filter-bar.tsx`**

This is a thin wrapper so existing PLP pages can migrate with zero behavior change:

```tsx
"use client"

import { useState } from "react"
import { FilterBar, type FilterOption } from "./filter-bar"

type UncontrolledFilterBarProps = {
  filters: FilterOption[]
}

export function UncontrolledFilterBar({ filters }: UncontrolledFilterBarProps) {
  const [value, setValue] = useState<Record<string, string[]>>({})
  return <FilterBar filters={filters} value={value} onChange={setValue} />
}
```

- [ ] **Step 2: Update `components/layouts/layout-product-list/layout-product-list.tsx`**

Replace the import of `SortButton` from the local file with the shared one. Replace the static `Input` with `SearchInput`. The `SortButton` in `LayoutProductList` is also uncontrolled currently (PLP pages don't pass value/onChange), so wrap it similarly.

Replace the full file content with:

```tsx
import * as React from "react"

import { LayoutBrowse } from "../layout-browse/layout-browse"
import { PaginationControls } from "../pagination-controls"
import type { BreadcrumbItem } from "../types"
import { SearchInput } from "@/components/filters/search-input"
import {
  SortButton as ControlledSortButton,
  type SortOption,
} from "@/components/filters/sort-button"

export { type SortOption }
export const PER_PAGE_OPTIONS = [20, 40, 60, 80, 100]
export const DEFAULT_PER_PAGE = 20

function UncontrolledSortButton({ options }: { options: SortOption[] }) {
  const [value, setValue] = React.useState(options[0].value)
  return (
    <ControlledSortButton options={options} value={value} onChange={setValue} />
  )
}

type LayoutProductListProps = {
  breadcrumbs: BreadcrumbItem[]
  categoryName: string
  categoryDescription?: string
  resultCount?: number
  quickFilters?: React.ReactNode
  sortOptions?: SortOption[]
  currentPage: number
  totalPages: number
  perPage: number
  children: React.ReactNode
  className?: string
}

export function LayoutProductList({
  breadcrumbs,
  categoryName,
  categoryDescription,
  resultCount,
  quickFilters,
  sortOptions,
  currentPage,
  totalPages,
  perPage,
  children,
  className,
}: LayoutProductListProps) {
  return (
    <LayoutBrowse breadcrumbs={breadcrumbs} className={className}>
      <div className="flex flex-col gap-8">
        {/* Heading */}
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-medium leading-14 text-foreground">
            {categoryName}
          </h1>
          {categoryDescription && (
            <p className="text-base text-muted-foreground">
              {categoryDescription}
            </p>
          )}
        </div>

        {/* Filtering area */}
        <div className="flex flex-col gap-4">
          {/* Result count */}
          {resultCount != null && (
            <p className="text-xl font-medium leading-8 tracking-[0.15px] text-muted-foreground">
              {resultCount.toLocaleString()} results
            </p>
          )}

          {/* Search bar */}
          <SearchInput onSearch={() => {}} placeholder="Search" />

          {/* Filter bar — FilterBar renders All filters, popovers, and Clear all */}
          <div className="flex flex-wrap items-start gap-5">
            {quickFilters && (
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                {quickFilters}
              </div>
            )}

            {/* Right side: Sort by */}
            {sortOptions && sortOptions.length > 0 && (
              <UncontrolledSortButton options={sortOptions} />
            )}
          </div>
        </div>

        {/* Product grid — 4 columns */}
        <div className="grid grid-cols-4 gap-x-5 gap-y-16">{children}</div>

        {/* Pagination */}
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          perPage={perPage}
          perPageOptions={PER_PAGE_OPTIONS}
        />
      </div>
    </LayoutBrowse>
  )
}
```

- [ ] **Step 3: Update all 6 PLP page imports**

In each of these files, change the `FilterBar` import from:
```tsx
import { FilterBar } from "@/components/layouts/layout-product-list/filter-bar"
```
to:
```tsx
import { UncontrolledFilterBar as FilterBar } from "@/components/filters/uncontrolled-filter-bar"
```

Files to update:
- `app/buyer/(shop)/browse/natural-diamonds/page.tsx:10`
- `app/buyer/(shop)/browse/lab-grown-diamonds/page.tsx:10`
- `app/buyer/(shop)/browse/gemstones/page.tsx:10`
- `app/buyer/(shop)/browse/natural-melee/page.tsx:10`
- `app/buyer/(shop)/browse/lab-grown-melee/page.tsx:10`
- `app/buyer/(shop)/browse/jewelry/engagement-rings/page.tsx:13`

- [ ] **Step 4: Delete old files**

```bash
rm components/layouts/layout-product-list/filter-bar.tsx
rm components/layouts/layout-product-list/sort-button.tsx
```

- [ ] **Step 5: Verify build passes**

Run: `npm run typecheck`
Expected: No errors. All PLP pages should compile with the new imports.

- [ ] **Step 6: Verify visually**

Run: `npm run dev`
Navigate to `/buyer/browse/natural-diamonds`. Verify:
- Filter popovers open, checkboxes work, Apply/Cancel work
- "All filters" sheet opens
- Sort dropdown works
- Search input renders (not wired to data yet, but renders)

- [ ] **Step 7: Commit**

```bash
git add components/filters/uncontrolled-filter-bar.tsx \
  components/layouts/layout-product-list/layout-product-list.tsx \
  app/buyer/\(shop\)/browse/natural-diamonds/page.tsx \
  app/buyer/\(shop\)/browse/lab-grown-diamonds/page.tsx \
  app/buyer/\(shop\)/browse/gemstones/page.tsx \
  app/buyer/\(shop\)/browse/natural-melee/page.tsx \
  app/buyer/\(shop\)/browse/lab-grown-melee/page.tsx \
  app/buyer/\(shop\)/browse/jewelry/engagement-rings/page.tsx
git rm components/layouts/layout-product-list/filter-bar.tsx \
  components/layouts/layout-product-list/sort-button.tsx
git commit -m "refactor(filters): migrate PLP pages to shared filter components"
```

---

### Task 5: Add `fetchAllOrders` to the data layer

**Files:**
- Modify: `lib/api/orders.ts:147-171`
- Modify: `app/buyer/(shop)/orders/actions.ts`

The orders page needs the full unpaginated list for client-side filtering. Add a function that returns all orders without pagination.

- [ ] **Step 1: Add `fetchAllOrders` to `lib/api/orders.ts`**

Add this function after the existing `fetchOrderList` function (after line 171):

```tsx
export async function fetchAllOrders(userId: string): Promise<Order[]> {
  const checkouts = await db.query.orderCheckouts.findMany({
    where: eq(orderCheckouts.userId, userId),
    with: {
      orders: {
        with: ORDER_WITH,
      },
    },
  })

  const allOrders: Order[] = []
  for (const checkout of checkouts) {
    for (const order of checkout.orders) {
      allOrders.push(mapRow(order, checkout.orderNumber, checkout.createdAt))
    }
  }

  return allOrders
}
```

- [ ] **Step 2: Add `refetchAllOrders` server action to `app/buyer/(shop)/orders/actions.ts`**

Replace the full file content with:

```tsx
"use server"

import { getCurrentUser } from "@/lib/api/users"
import { fetchOrderList, fetchAllOrders, type Order } from "@/lib/api/orders"
import type { PaginatedResult } from "@/lib/api/helpers"

export async function refetchOrders(options: {
  page: number
  perPage: number
}): Promise<PaginatedResult<Order>> {
  const user = await getCurrentUser()
  return fetchOrderList(user.id, {
    page: options.page,
    perPage: options.perPage,
    perPageOptions: [20, 40, 60, 80, 100],
  })
}

export async function refetchAllOrders(): Promise<Order[]> {
  const user = await getCurrentUser()
  return fetchAllOrders(user.id)
}
```

- [ ] **Step 3: Verify build passes**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add lib/api/orders.ts app/buyer/\(shop\)/orders/actions.ts
git commit -m "feat(orders): add fetchAllOrders for client-side filtering"
```

---

### Task 6: Add client-side pagination mode to PaginationControls

**Files:**
- Modify: `components/layouts/pagination-controls.tsx`

The existing `PaginationControls` uses `useRouter().push()` to update the URL. For client-side filtered views (like orders), pagination should update local state instead of navigating. Add optional callback props that, when provided, switch the component to client-side mode.

- [ ] **Step 1: Update `components/layouts/pagination-controls.tsx`**

Replace the full file content with:

```tsx
"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type PaginationControlsProps = {
  currentPage: number
  totalPages: number
  perPage: number
  perPageOptions: number[]
  onPageChange?: (page: number) => void
  onPerPageChange?: (perPage: number) => void
}

export function PaginationControls({
  currentPage,
  totalPages,
  perPage,
  perPageOptions,
  onPageChange,
  onPerPageChange,
}: PaginationControlsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const isClientSide = !!onPageChange

  function navigate(page: number, newPerPage?: number) {
    if (isClientSide) {
      if (newPerPage != null) onPerPageChange?.(newPerPage)
      onPageChange!(page)
    } else {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", String(page))
      params.set("perPage", String(newPerPage ?? perPage))
      router.push(`?${params.toString()}`)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Results per page:</span>
      <Select
        value={String(perPage)}
        onValueChange={(value) => navigate(1, Number(value))}
      >
        <SelectTrigger className="h-11.25">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {perPageOptions.map((option) => (
            <SelectItem key={option} value={String(option)}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="secondary"
        size="lg"
        className="h-11.25 w-21.25"
        disabled={currentPage <= 1}
        onClick={() => navigate(currentPage - 1)}
      >
        Previous
      </Button>
      <span className="text-sm">
        <span className="text-muted-foreground">Page </span>
        <span className="font-semibold text-foreground">{currentPage}</span>
        <span className="text-muted-foreground"> of </span>
        <span className="font-semibold text-foreground">{totalPages}</span>
      </span>
      <Button
        variant="secondary"
        size="lg"
        className="h-11.25 w-21.25"
        disabled={currentPage >= totalPages}
        onClick={() => navigate(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run typecheck`
Expected: No errors. Existing consumers (PLP pages) pass no callbacks, so they continue using URL-based navigation.

- [ ] **Step 3: Commit**

```bash
git add components/layouts/pagination-controls.tsx
git commit -m "feat(pagination): add client-side callback mode to PaginationControls"
```

---

### Task 7: Refactor OrdersRealtimeWrapper to expose raw data

**Files:**
- Modify: `components/orders/orders-realtime-wrapper.tsx`

The wrapper currently renders the table and pagination itself. Refactor it to use a render prop (children as a function) that receives the live order list. The table rendering moves to `OrdersFilterableList` in the next task.

- [ ] **Step 1: Replace `components/orders/orders-realtime-wrapper.tsx`**

```tsx
"use client"

import { useCallback } from "react"
import { useRealtimeSync } from "@/hooks/use-realtime-sync"
import { refetchAllOrders } from "@/app/buyer/(shop)/orders/actions"
import type { Order } from "@/lib/api/orders"

interface OrdersRealtimeWrapperProps {
  initialData: Order[]
  children: (orders: Order[]) => React.ReactNode
}

export function OrdersRealtimeWrapper({
  initialData,
  children,
}: OrdersRealtimeWrapperProps) {
  const refetch = useCallback(() => refetchAllOrders(), [])
  const orders = useRealtimeSync(initialData, "orders", refetch)
  return <>{children(orders)}</>
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run typecheck`
Expected: May show errors in `orders/page.tsx` since it still passes the old props. That's fine — we fix it in Task 8.

- [ ] **Step 3: Commit**

```bash
git add components/orders/orders-realtime-wrapper.tsx
git commit -m "refactor(orders): simplify RealtimeWrapper to expose raw data via render prop"
```

---

### Task 8: Create OrdersFilterableList

**Files:**
- Create: `components/orders/orders-filterable-list.tsx`

This is the main new component. It owns all filter/sort/search state, applies the filtering pipeline, and renders grid tabs, filter bar, sort button, search input, table, and pagination.

- [ ] **Step 1: Create `components/orders/orders-filterable-list.tsx`**

```tsx
"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PaginationControls } from "@/components/layouts/pagination-controls"
import { FilterBar, type FilterOption } from "@/components/filters/filter-bar"
import { SortButton, type SortOption } from "@/components/filters/sort-button"
import { SearchInput } from "@/components/filters/search-input"
import {
  IconDots,
  IconChecklist,
  IconClock,
  IconCircleCheck,
  IconTruck,
  IconAlertTriangle,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import type { Order } from "@/lib/api/orders"

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PER_PAGE_OPTIONS = [20, 40, 60, 80, 100]
const DEFAULT_PER_PAGE = 20

const STATUS_DOT_COLORS: Record<string, string> = {
  requested: "bg-foreground",
  confirmed: "bg-emerald-500",
  manufacturing: "bg-violet-500",
  shipped: "bg-blue-500",
  delivered: "bg-emerald-500",
  returned: "bg-muted-foreground",
  cancelled: "bg-muted-foreground",
  delayed: "bg-amber-500",
  sold_out: "bg-amber-500",
}

type TabDef = {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  statusValues: string[]
  hasNotification?: boolean
}

const TABS: TabDef[] = [
  { key: "all", label: "All items", icon: IconChecklist, statusValues: [] },
  { key: "pending", label: "Pending", icon: IconClock, statusValues: ["Requested"] },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: IconCircleCheck,
    statusValues: ["Confirmed", "Manufacturing"],
  },
  { key: "in_transit", label: "In transit", icon: IconTruck, statusValues: ["Shipped"] },
  {
    key: "action_required",
    label: "Action required",
    icon: IconAlertTriangle,
    statusValues: ["Delayed"],
    hasNotification: true,
  },
]

const ORDER_FILTERS: FilterOption[] = [
  {
    key: "status",
    label: "Status",
    options: [
      "Requested",
      "Confirmed",
      "Manufacturing",
      "Shipped",
      "Delivered",
      "Returned",
      "Cancelled",
      "Delayed",
    ],
  },
  {
    key: "item_type",
    label: "Item type",
    options: [
      "Natural Diamond",
      "Lab Grown Diamond",
      "Gemstone",
      "Natural Melee",
      "Lab Grown Melee",
      "Engagement Ring",
      "Wedding Band",
      "Tennis Bracelet",
    ],
  },
  {
    key: "order_date",
    label: "Order date",
    options: [
      "Last 7 days",
      "Last 30 days",
      "Last 3 months",
      "Last 6 months",
      "Last year",
    ],
  },
  {
    key: "returnable",
    label: "Returnable",
    options: ["Yes", "No"],
  },
  {
    key: "confirmed_by",
    label: "Confirmed by",
    options: ["Supplier A", "Supplier B", "Supplier C"],
  },
  {
    key: "ship_to",
    label: "Ship to",
    options: [],
  },
]

const SORT_OPTIONS: SortOption[] = [
  { value: "order_date_desc", label: "Order date (newest)", displayLabel: "Order date" },
  { value: "order_date_asc", label: "Order date (oldest)", displayLabel: "Order date (oldest)" },
  { value: "price_desc", label: "Price: High to Low", displayLabel: "Price (high)" },
  { value: "price_asc", label: "Price: Low to High", displayLabel: "Price (low)" },
  { value: "status", label: "Status", displayLabel: "Status" },
  { value: "est_delivery", label: "Est. delivery", displayLabel: "Est. delivery" },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getOrderStatus(order: Order): string {
  return order.currentStatus?.value ?? ""
}

function getOrderProductType(order: Order): string {
  const snapshot = (order.products[0]?.snapshot ?? {}) as Record<string, unknown>
  return (snapshot.productType as string) ?? ""
}

function getOrderCountry(order: Order): string {
  return order.deliveryAddress.country
}

function matchesDateRange(orderDate: string, range: string): boolean {
  const date = new Date(orderDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)

  switch (range) {
    case "Last 7 days":
      return diffDays <= 7
    case "Last 30 days":
      return diffDays <= 30
    case "Last 3 months":
      return diffDays <= 90
    case "Last 6 months":
      return diffDays <= 180
    case "Last year":
      return diffDays <= 365
    default:
      return true
  }
}

function matchesFilter(
  order: Order,
  key: string,
  selectedValues: string[],
): boolean {
  if (selectedValues.length === 0) return true

  switch (key) {
    case "status":
      return selectedValues.includes(getOrderStatus(order))
    case "item_type":
      return selectedValues.includes(getOrderProductType(order))
    case "order_date":
      return selectedValues.some((range) =>
        matchesDateRange(order.orderDate, range),
      )
    case "returnable":
      // Mock: odd-indexed orders are "returnable"
      return true
    case "confirmed_by":
      // Mock: no real field yet
      return true
    case "ship_to":
      return selectedValues.includes(getOrderCountry(order))
    default:
      return true
  }
}

function sortOrders(orders: Order[], sortValue: string): Order[] {
  const sorted = [...orders]
  switch (sortValue) {
    case "order_date_desc":
      return sorted.sort(
        (a, b) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
      )
    case "order_date_asc":
      return sorted.sort(
        (a, b) =>
          new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime(),
      )
    case "price_desc":
      return sorted.sort((a, b) => b.finalPriceUsd - a.finalPriceUsd)
    case "price_asc":
      return sorted.sort((a, b) => a.finalPriceUsd - b.finalPriceUsd)
    case "status":
      return sorted.sort((a, b) =>
        getOrderStatus(a).localeCompare(getOrderStatus(b)),
      )
    case "est_delivery":
      return sorted.sort(
        (a, b) =>
          new Date(a.estimatedDelivery).getTime() -
          new Date(b.estimatedDelivery).getTime(),
      )
    default:
      return sorted
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function GridTab({
  tab,
  count,
  active,
  onClick,
}: {
  tab: TabDef
  count: number
  active: boolean
  onClick: () => void
}) {
  const Icon = tab.icon
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-3 rounded-xl border p-4 text-left transition-colors",
        active
          ? "border-primary bg-background shadow-sm"
          : "border-border bg-background hover:bg-muted/50",
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            "size-5",
            active ? "text-primary" : "text-muted-foreground",
          )}
        />
        {tab.hasNotification && (
          <span className="size-1.5 rounded-full bg-destructive" />
        )}
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            "text-sm font-medium",
            active ? "text-primary" : "text-foreground",
          )}
        >
          {tab.label}
        </span>
        <span className="text-sm text-muted-foreground">
          {count.toLocaleString()} items
        </span>
      </div>
    </button>
  )
}

function StatusBadge({ order }: { order: Order }) {
  const statusValue = getOrderStatus(order)
  const dotColor =
    STATUS_DOT_COLORS[statusValue.toLowerCase().replace(/\s+/g, "_")] ??
    "bg-muted-foreground"
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("size-2 shrink-0 rounded-full", dotColor)} />
      <span className="text-sm font-medium">{statusValue || "Unknown"}</span>
    </div>
  )
}

function OrderRow({ order }: { order: Order }) {
  const firstProduct = order.products[0]
  const snapshot = (firstProduct?.snapshot ?? {}) as Record<string, unknown>
  const itemTitle =
    (snapshot.description as string) ??
    (snapshot.title as string) ??
    `Order ${order.orderNumber}`
  const itemImage = (snapshot.image as string) ?? ""
  const itemTypeLabel = (snapshot.productType as string) ?? ""
  const itemSubtitle = (snapshot.subtitle as string) ?? ""

  return (
    <TableRow>
      <TableCell className="w-10 pr-0">
        <Checkbox />
      </TableCell>
      <TableCell className="max-w-md">
        <Link href={`/buyer/orders/${order.id}`} className="block">
          <div className="flex flex-col gap-3 py-2">
            <div className="flex items-center gap-3">
              {itemImage && (
                <div className="size-12 shrink-0 overflow-hidden rounded-md border border-border">
                  <img
                    src={itemImage}
                    alt={itemTitle}
                    className="size-full object-cover"
                  />
                </div>
              )}
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-medium text-foreground">
                    {itemTitle}
                  </span>
                  {itemTypeLabel && (
                    <span className="text-sm text-muted-foreground">
                      · {itemTypeLabel}
                    </span>
                  )}
                </div>
                {itemSubtitle && (
                  <span className="truncate text-sm text-muted-foreground">
                    {itemSubtitle}
                  </span>
                )}
              </div>
            </div>
            {(order.canTrack || order.canPayInvoice) && (
              <div className="flex items-center gap-2 pl-15">
                {order.canTrack && (
                  <Button variant="outline" size="sm">
                    Track item
                  </Button>
                )}
                {order.canPayInvoice && (
                  <Button variant="default" size="sm">
                    Pay invoice
                  </Button>
                )}
              </div>
            )}
          </div>
        </Link>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {order.orderNumber}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {order.orderDate}
      </TableCell>
      <TableCell>
        <StatusBadge order={order} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground">
            $
            {order.finalPriceUsd.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
          {order.exchangeRates.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {order.exchangeRates[0].currency.value}{" "}
              {(
                order.finalPriceUsd * order.exchangeRates[0].rate
              ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="w-10">
        <Button variant="ghost" size="icon">
          <IconDots className="size-5" />
        </Button>
      </TableCell>
    </TableRow>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface OrdersFilterableListProps {
  orders: Order[]
}

export function OrdersFilterableList({ orders }: OrdersFilterableListProps) {
  const [filters, setFilters] = useState<Record<string, string[]>>({})
  const [sortValue, setSortValue] = useState("order_date_desc")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE)

  // Build dynamic filter options for "ship_to" from loaded data
  const filtersWithDynamicOptions = useMemo(() => {
    const countries = [...new Set(orders.map(getOrderCountry))].filter(Boolean).sort()
    return ORDER_FILTERS.map((f) =>
      f.key === "ship_to" ? { ...f, options: countries } : f,
    )
  }, [orders])

  // Apply search (before status filter, so tab counts reflect search)
  const searchFiltered = useMemo(() => {
    if (!searchQuery) return orders
    const q = searchQuery.toLowerCase()
    return orders.filter((order) => {
      if (order.orderNumber.toLowerCase().includes(q)) return true
      const snapshot = (order.products[0]?.snapshot ?? {}) as Record<
        string,
        unknown
      >
      const desc = ((snapshot.description as string) ?? "").toLowerCase()
      const title = ((snapshot.title as string) ?? "").toLowerCase()
      return desc.includes(q) || title.includes(q)
    })
  }, [orders, searchQuery])

  // Apply non-status filters (for tab count computation)
  const nonStatusFiltered = useMemo(() => {
    const nonStatusKeys = Object.keys(filters).filter((k) => k !== "status")
    if (nonStatusKeys.length === 0) return searchFiltered
    return searchFiltered.filter((order) =>
      nonStatusKeys.every((key) => matchesFilter(order, key, filters[key])),
    )
  }, [searchFiltered, filters])

  // Compute tab counts from non-status-filtered data
  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const tab of TABS) {
      if (tab.statusValues.length === 0) {
        counts[tab.key] = nonStatusFiltered.length
      } else {
        counts[tab.key] = nonStatusFiltered.filter((order) =>
          tab.statusValues.includes(getOrderStatus(order)),
        ).length
      }
    }
    return counts
  }, [nonStatusFiltered])

  // Determine active tab from filters.status
  const activeTab = useMemo(() => {
    const statusFilter = filters.status ?? []
    if (statusFilter.length === 0) return "all"
    const match = TABS.find(
      (tab) =>
        tab.statusValues.length === statusFilter.length &&
        tab.statusValues.every((v) => statusFilter.includes(v)),
    )
    return match?.key ?? "all"
  }, [filters])

  // Apply ALL filters (including status)
  const fullyFiltered = useMemo(() => {
    const allKeys = Object.keys(filters)
    if (allKeys.length === 0) return searchFiltered
    return searchFiltered.filter((order) =>
      allKeys.every((key) => matchesFilter(order, key, filters[key])),
    )
  }, [searchFiltered, filters])

  // Sort
  const sorted = useMemo(
    () => sortOrders(fullyFiltered, sortValue),
    [fullyFiltered, sortValue],
  )

  // Paginate
  const totalItems = sorted.length
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
  const currentPage = Math.min(page, totalPages)
  const paginatedOrders = sorted.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage,
  )

  // Reset page when filters/search/sort change
  function handleFiltersChange(next: Record<string, string[]>) {
    setFilters(next)
    setPage(1)
  }

  function handleSortChange(next: string) {
    setSortValue(next)
    setPage(1)
  }

  function handleSearch(query: string) {
    setSearchQuery(query)
    setPage(1)
  }

  function handleTabClick(tab: TabDef) {
    if (tab.statusValues.length === 0) {
      // "All" tab — clear status filter
      const next = { ...filters }
      delete next.status
      setFilters(next)
    } else {
      setFilters({ ...filters, status: tab.statusValues })
    }
    setPage(1)
  }

  return (
    <>
      {/* Grid tabs */}
      <div className="grid grid-cols-5 gap-4">
        {TABS.map((tab) => (
          <GridTab
            key={tab.key}
            tab={tab}
            count={tabCounts[tab.key] ?? 0}
            active={activeTab === tab.key}
            onClick={() => handleTabClick(tab)}
          />
        ))}
      </div>

      {/* Filters + Table */}
      <div className="flex flex-col gap-4">
        {/* Filter bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2">
            <SearchInput onSearch={handleSearch} placeholder="Search..." />
            <FilterBar
              filters={filtersWithDynamicOptions}
              value={filters}
              onChange={handleFiltersChange}
            />
          </div>
          <SortButton
            options={SORT_OPTIONS}
            value={sortValue}
            onChange={handleSortChange}
          />
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 pr-0">
                <Checkbox />
              </TableHead>
              <TableHead className="max-w-md">Ordered item</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Order date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Final price</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
            {paginatedOrders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  No orders match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * perPage + 1}-
              {Math.min(currentPage * perPage, totalItems)} of {totalItems}
            </span>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              perPage={perPage}
              perPageOptions={PER_PAGE_OPTIONS}
              onPageChange={setPage}
              onPerPageChange={(pp) => {
                setPerPage(pp)
                setPage(1)
              }}
            />
          </div>
        )}
      </div>
    </>
  )
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/orders/orders-filterable-list.tsx
git commit -m "feat(orders): create OrdersFilterableList with filtering, sorting, search"
```

---

### Task 9: Rewire the orders page

**Files:**
- Modify: `app/buyer/(shop)/orders/page.tsx`

Replace the entire page with the slim server component that wires up the three-layer pattern.

- [ ] **Step 1: Replace `app/buyer/(shop)/orders/page.tsx`**

```tsx
import { getCurrentUser } from "@/lib/api/users"
import { fetchAllOrders } from "@/lib/api/orders"
import { Button } from "@/components/ui/button"
import { IconUpload } from "@tabler/icons-react"
import { OrdersRealtimeWrapper } from "@/components/orders/orders-realtime-wrapper"
import { OrdersFilterableList } from "@/components/orders/orders-filterable-list"

export default async function OrdersListPage() {
  const user = await getCurrentUser()
  const initialOrders = await fetchAllOrders(user.id)

  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-5xl font-medium leading-14 text-foreground">
          Orders
        </h1>
        <Button variant="outline" size="lg">
          <IconUpload className="size-5" />
          Export
        </Button>
      </div>

      {/* Realtime data → Filterable list */}
      <OrdersRealtimeWrapper initialData={initialOrders}>
        {(orders) => <OrdersFilterableList orders={orders} />}
      </OrdersRealtimeWrapper>
    </div>
  )
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run typecheck`
Expected: No errors.

- [ ] **Step 3: Verify full page works**

Run: `npm run dev`
Navigate to `/buyer/orders`. Verify:
- Grid tabs render with computed counts
- Clicking a tab filters the table by status
- Search input filters on Enter by order number and product name
- Filter popovers open with correct options, apply correctly
- "All filters" sheet works
- Sort dropdown changes table ordering
- "Clear all" resets everything
- Pagination works on filtered results
- Empty state shows when no orders match

- [ ] **Step 4: Commit**

```bash
git add app/buyer/\(shop\)/orders/page.tsx
git commit -m "feat(orders): wire up filters, search, and sorting on orders page"
```

---

### Task 10: Final cleanup and format

**Files:**
- All modified/created files

- [ ] **Step 1: Run formatter**

```bash
npm run format
```

- [ ] **Step 2: Run linter**

```bash
npm run lint
```

Fix any issues.

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Run build**

```bash
npm run build
```

Verify clean build with no errors.

- [ ] **Step 5: Commit any formatting fixes**

```bash
git add -A
git commit -m "chore: format and lint cleanup"
```
