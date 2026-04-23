# Sort Dropdown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a functional "Sort by" dropdown to all product listing pages that opens on click, updates its label on selection, and closes automatically.

**Architecture:** A new `SortButton` client component (`"use client"`) is extracted into its own file and rendered by the existing `LayoutProductList` server component via an optional `sortOptions` prop. All state (selected value + derived label) lives inside `SortButton`. Each PLP page defines its own `SORT_OPTIONS` constant at module scope and passes it to the layout.

**Tech Stack:** Next.js 15 App Router, React, TypeScript, Tailwind CSS v4, shadcn/ui (`DropdownMenu` + `DropdownMenuRadioGroup` + `DropdownMenuRadioItem` from `components/ui/dropdown-menu.tsx`)

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `components/layouts/layout-product-list/sort-button.tsx` | **Create** | `SortOption` type + `SortButton` client component |
| `components/layouts/layout-product-list/layout-product-list.tsx` | **Modify** | Add `sortOptions?` prop, render `<SortButton>` |
| `app/buyer/(shop)/browse/natural-diamonds/page.tsx` | **Modify** | Add `SORT_OPTIONS` (with Carat), pass to layout |
| `app/buyer/(shop)/browse/lab-grown-diamonds/page.tsx` | **Modify** | Add `SORT_OPTIONS` (with Carat), pass to layout |
| `app/buyer/(shop)/browse/gemstones/page.tsx` | **Modify** | Add `SORT_OPTIONS` (with Carat), pass to layout |
| `app/buyer/(shop)/browse/natural-melee/page.tsx` | **Modify** | Add `SORT_OPTIONS` (with Carat), pass to layout |
| `app/buyer/(shop)/browse/lab-grown-melee/page.tsx` | **Modify** | Add `SORT_OPTIONS` (with Carat), pass to layout |
| `app/buyer/(shop)/browse/jewelry/engagement-rings/page.tsx` | **Modify** | Add `SORT_OPTIONS` (no Carat), pass to layout |

---

## Task 1: Create `SortButton` client component

**Files:**
- Create: `components/layouts/layout-product-list/sort-button.tsx`

- [ ] **Step 1: Create the file**

```tsx
"use client"

import { useState } from "react"
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
}

export function SortButton({ options }: SortButtonProps) {
  const [selected, setSelected] = useState(options[0].value)
  const current = options.find((o) => o.value === selected) ?? options[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="lg" className="h-11.25">
          Sort by: {current.displayLabel}
          <IconChevronDown className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={selected} onValueChange={setSelected}>
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

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/layouts/layout-product-list/sort-button.tsx
git commit -m "feat: add SortButton client component"
```

---

## Task 2: Wire `SortButton` into `LayoutProductList`

**Files:**
- Modify: `components/layouts/layout-product-list/layout-product-list.tsx`

The current file has a static `<Button>` for "Sort by: Featured" on line 78. Replace it with a conditional render of `<SortButton>`.

- [ ] **Step 1: Update `layout-product-list.tsx`**

Replace the entire file content with:

```tsx
import * as React from "react"

import { Input } from "@/components/ui/input"
import { LayoutBrowse } from "../layout-browse/layout-browse"
import { PaginationControls } from "../pagination-controls"
import type { BreadcrumbItem } from "../types"
import { SortButton, type SortOption } from "./sort-button"

export { type SortOption }
export const PER_PAGE_OPTIONS = [20, 40, 60, 80, 100]
export const DEFAULT_PER_PAGE = 20

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
          <Input
            type="search"
            placeholder="Search"
            className="h-11 rounded-lg border-none bg-secondary shadow-none"
          />

          {/* Filter bar — FilterBar renders All filters, popovers, and Clear all */}
          <div className="flex flex-wrap items-start gap-5">
            {quickFilters && (
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                {quickFilters}
              </div>
            )}

            {/* Right side: Sort by */}
            {sortOptions && sortOptions.length > 0 && (
              <SortButton options={sortOptions} />
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

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add components/layouts/layout-product-list/layout-product-list.tsx
git commit -m "feat: add sortOptions prop to LayoutProductList"
```

---

## Task 3: Add `SORT_OPTIONS` to all 6 PLP pages

**Files:**
- Modify: `app/buyer/(shop)/browse/natural-diamonds/page.tsx`
- Modify: `app/buyer/(shop)/browse/lab-grown-diamonds/page.tsx`
- Modify: `app/buyer/(shop)/browse/gemstones/page.tsx`
- Modify: `app/buyer/(shop)/browse/natural-melee/page.tsx`
- Modify: `app/buyer/(shop)/browse/lab-grown-melee/page.tsx`
- Modify: `app/buyer/(shop)/browse/jewelry/engagement-rings/page.tsx`

For each of the 5 loose-stone pages (natural-diamonds, lab-grown-diamonds, gemstones, natural-melee, lab-grown-melee):

- [ ] **Step 1: Add `SORT_OPTIONS` constant and update the import**

At the top of each file, update the import from `layout-product-list` to include `SortOption` (already re-exported from that module), then add a `SORT_OPTIONS` constant at module scope (after the `FILTERS` constant or after the imports if no `FILTERS` exist):

```ts
import {
  LayoutProductList,
  PER_PAGE_OPTIONS,
  DEFAULT_PER_PAGE,
  type SortOption,
} from "@/components/layouts/layout-product-list/layout-product-list"

const SORT_OPTIONS: SortOption[] = [
  { value: "featured", label: "Featured", displayLabel: "Featured" },
  { value: "price_asc", label: "Price: Low → High", displayLabel: "Price ↑" },
  { value: "price_desc", label: "Price: High → Low", displayLabel: "Price ↓" },
  { value: "newest", label: "Newest", displayLabel: "Newest" },
  { value: "carat", label: "Carat", displayLabel: "Carat" },
]
```

Then pass `sortOptions={SORT_OPTIONS}` to `<LayoutProductList>`.

- [ ] **Step 2: Add `SORT_OPTIONS` to engagement rings page**

For `app/buyer/(shop)/browse/jewelry/engagement-rings/page.tsx`, same pattern but without the Carat option:

```ts
import {
  LayoutProductList,
  PER_PAGE_OPTIONS,
  DEFAULT_PER_PAGE,
  type SortOption,
} from "@/components/layouts/layout-product-list/layout-product-list"

const SORT_OPTIONS: SortOption[] = [
  { value: "featured", label: "Featured", displayLabel: "Featured" },
  { value: "price_asc", label: "Price: Low → High", displayLabel: "Price ↑" },
  { value: "price_desc", label: "Price: High → Low", displayLabel: "Price ↓" },
  { value: "newest", label: "Newest", displayLabel: "Newest" },
]
```

Then pass `sortOptions={SORT_OPTIONS}` to `<LayoutProductList>`.

- [ ] **Step 3: Run typecheck and lint**

```bash
npm run typecheck && npm run lint
```

Expected: no errors

- [ ] **Step 4: Verify visually**

Run `npm run dev` and open any PLP (e.g. `http://localhost:3000/buyer/browse/natural-diamonds`). Confirm:
- "Sort by: Featured" button appears on the right side of the filter bar
- Clicking it opens a dropdown with all expected options
- "Featured" has a checkmark indicator
- Selecting "Price: Low → High" updates the label to "Sort by: Price ↑" and closes the dropdown
- Selecting any other option updates the label accordingly

- [ ] **Step 5: Commit**

```bash
git add \
  app/buyer/\(shop\)/browse/natural-diamonds/page.tsx \
  app/buyer/\(shop\)/browse/lab-grown-diamonds/page.tsx \
  app/buyer/\(shop\)/browse/gemstones/page.tsx \
  app/buyer/\(shop\)/browse/natural-melee/page.tsx \
  app/buyer/\(shop\)/browse/lab-grown-melee/page.tsx \
  app/buyer/\(shop\)/browse/jewelry/engagement-rings/page.tsx
git commit -m "feat: wire sort dropdown into all PLP pages"
```
