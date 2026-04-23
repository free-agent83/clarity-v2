# Product Filters: Mock Filter UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add interactive popover-based filter UI to all product listing pages, and reorganise the layouts directory so every layout lives in its own subdirectory.

**Architecture:** A shared `FilterBar` client component accepts a `filters` config array and manages all selection state internally (committed + pending). It renders popover buttons per filter and an "All filters" sheet. The layout directory moves from flat files to one subdirectory per layout — no barrel/index files anywhere.

**Tech Stack:** Next.js 15 App Router, React, Tailwind CSS v4, shadcn/ui (Popover, Sheet, Checkbox, Button), `@tabler/icons-react`

---

## File Map

**Created:**
- `components/layouts/layout-base/layout-base.tsx` — moved, no import changes
- `components/layouts/layout-browse/layout-browse.tsx` — moved, `./types` → `../types`
- `components/layouts/layout-product-list/layout-product-list.tsx` — moved, 3 relative imports updated
- `components/layouts/layout-product-list/filter-bar.tsx` — new client component
- `components/layouts/layout-under-construction/layout-under-construction.tsx` — moved, no import changes

**Deleted:**
- `components/layouts/layout-base.tsx`
- `components/layouts/layout-browse.tsx`
- `components/layouts/layout-product-list.tsx`
- `components/layouts/layout-under-construction.tsx`
- `components/layouts/layout-product-detail/index.ts`

**Modified (import path updates only):**
- `components/layouts/layout-product-detail/layout-product-detail.tsx`
- `app/buyer/(shop)/layout.tsx`
- `app/buyer/(shop)/orders/page.tsx`
- `components/orders/orders-realtime-wrapper.tsx`
- `app/buyer/(shop)/browse/natural-diamonds/page.tsx`
- `app/buyer/(shop)/browse/lab-grown-diamonds/page.tsx`
- `app/buyer/(shop)/browse/gemstones/page.tsx`
- `app/buyer/(shop)/browse/natural-melee/page.tsx`
- `app/buyer/(shop)/browse/lab-grown-melee/page.tsx`
- `app/buyer/(shop)/browse/jewelry/engagement-rings/page.tsx`
- `app/buyer/(shop)/browse/natural-diamonds/[slug]/page.tsx`
- `app/buyer/(shop)/browse/lab-grown-diamonds/[slug]/page.tsx`
- `app/buyer/(shop)/browse/gemstones/[slug]/page.tsx`
- `app/buyer/(shop)/browse/natural-melee/[slug]/page.tsx`
- `app/buyer/(shop)/browse/lab-grown-melee/[slug]/page.tsx`
- `app/buyer/(shop)/browse/jewelry/engagement-rings/[slug]/page.tsx`
- `app/buyer/(shop)/finances/page.tsx`
- `app/buyer/(shop)/shortlists/page.tsx`
- `app/buyer/(shop)/settings/page.tsx`
- `app/buyer/(shop)/browse/custom-jewellery/page.tsx`

---

## Task 1: Reorganise layouts directory

### Files:
- Create: `components/layouts/layout-base/layout-base.tsx`
- Create: `components/layouts/layout-browse/layout-browse.tsx`
- Create: `components/layouts/layout-product-list/layout-product-list.tsx`
- Create: `components/layouts/layout-under-construction/layout-under-construction.tsx`
- Delete: the four flat `.tsx` files above
- Delete: `components/layouts/layout-product-detail/index.ts`
- Modify: `components/layouts/layout-product-detail/layout-product-detail.tsx`

- [ ] **Step 1: Create `layout-base/layout-base.tsx`** (content identical to current flat file — no import changes needed)

```tsx
import type { AppUser } from "@/lib/api/users";
import { BuyerNav } from "@/components/shell/buyer-nav";
import { CategoriesMenu } from "@/components/shell/categories-menu";
import { AppFooter } from "@/components/shell/app-footer";

type LayoutBaseProps = {
  children: React.ReactNode;
  user?: AppUser;
};

export function LayoutBase({ children, user }: LayoutBaseProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <BuyerNav user={user} />
      <CategoriesMenu />
      <main className="flex justify-center bg-background">
        <div className="w-full max-w-7xl px-5 pb-[50] pt-5">{children}</div>
      </main>
      <AppFooter />
    </div>
  );
}
```

- [ ] **Step 2: Create `layout-browse/layout-browse.tsx`** (`./types` → `../types`)

```tsx
import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { BreadcrumbItem as BreadcrumbItemType } from "../types";

type LayoutBrowseProps = {
  breadcrumbs: BreadcrumbItemType[];
  children: React.ReactNode;
  className?: string;
};

export function LayoutBrowse({
  breadcrumbs,
  children,
  className,
}: LayoutBrowseProps) {
  return (
    <div className={cn("flex flex-col gap-12 pb-32", className)}>
      <Breadcrumb>
        <BreadcrumbList className="gap-3 text-base">
          {breadcrumbs.map((item, i) => (
            <React.Fragment key={item.href}>
              {i > 0 && <BreadcrumbSeparator className="[&>svg]:size-4" />}
              <BreadcrumbItem>
                {i < breadcrumbs.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="truncate">
                    {item.label}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Create `layout-product-list/layout-product-list.tsx`** (3 relative imports updated; static "All filters" and "Clear all" buttons removed — `FilterBar` provides them)

```tsx
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayoutBrowse } from "../layout-browse/layout-browse";
import { PaginationControls } from "../pagination-controls";
import type { BreadcrumbItem } from "../types";
import { IconChevronDown } from "@tabler/icons-react";

export const PER_PAGE_OPTIONS = [20, 40, 60, 80, 100];
export const DEFAULT_PER_PAGE = 20;

type LayoutProductListProps = {
  breadcrumbs: BreadcrumbItem[];
  categoryName: string;
  categoryDescription?: string;
  resultCount?: number;
  quickFilters?: React.ReactNode;
  currentPage: number;
  totalPages: number;
  perPage: number;
  children: React.ReactNode;
  className?: string;
};

export function LayoutProductList({
  breadcrumbs,
  categoryName,
  categoryDescription,
  resultCount,
  quickFilters,
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
            <Button variant="outline" size="lg" className="h-11.25">
              Sort by: Featured
              <IconChevronDown className="size-5" />
            </Button>
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
  );
}
```

- [ ] **Step 4: Create `layout-under-construction/layout-under-construction.tsx`** (content identical — no import changes needed)

Copy the full content of the current `components/layouts/layout-under-construction.tsx` file as-is into the new path. No line changes.

- [ ] **Step 5: Delete the four flat layout files**

```bash
git rm components/layouts/layout-base.tsx
git rm components/layouts/layout-browse.tsx
git rm components/layouts/layout-product-list.tsx
git rm components/layouts/layout-under-construction.tsx
```

- [ ] **Step 6: Delete `layout-product-detail/index.ts`**

```bash
git rm components/layouts/layout-product-detail/index.ts
```

- [ ] **Step 7: Fix `layout-product-detail/layout-product-detail.tsx` relative import**

Change line 8 from:
```ts
import { LayoutBrowse } from "../layout-browse";
```
to:
```ts
import { LayoutBrowse } from "../layout-browse/layout-browse";
```

---

## Task 2: Update external import paths

### Files:
- Modify: all consumers of the moved layouts (20 files)

- [ ] **Step 1: Update `app/buyer/(shop)/layout.tsx`**

Change:
```ts
import { LayoutBase } from "@/components/layouts/layout-base"
```
to:
```ts
import { LayoutBase } from "@/components/layouts/layout-base/layout-base"
```

- [ ] **Step 2: Update `components/orders/orders-realtime-wrapper.tsx`**

Change:
```ts
import { PER_PAGE_OPTIONS } from "@/components/layouts/layout-product-list";
```
to:
```ts
import { PER_PAGE_OPTIONS } from "@/components/layouts/layout-product-list/layout-product-list";
```

- [ ] **Step 3: Update `app/buyer/(shop)/orders/page.tsx`**

Change:
```ts
} from "@/components/layouts/layout-product-list";
```
to:
```ts
} from "@/components/layouts/layout-product-list/layout-product-list";
```

- [ ] **Step 4: Update `app/buyer/(shop)/browse/natural-diamonds/page.tsx`**

Change:
```ts
} from "@/components/layouts/layout-product-list";
```
to:
```ts
} from "@/components/layouts/layout-product-list/layout-product-list";
```

- [ ] **Step 5: Update `app/buyer/(shop)/browse/lab-grown-diamonds/page.tsx`**

Change:
```ts
} from "@/components/layouts/layout-product-list";
```
to:
```ts
} from "@/components/layouts/layout-product-list/layout-product-list";
```

- [ ] **Step 6: Update `app/buyer/(shop)/browse/gemstones/page.tsx`**

Change:
```ts
} from "@/components/layouts/layout-product-list";
```
to:
```ts
} from "@/components/layouts/layout-product-list/layout-product-list";
```

- [ ] **Step 7: Update `app/buyer/(shop)/browse/natural-melee/page.tsx`**

Change:
```ts
} from "@/components/layouts/layout-product-list";
```
to:
```ts
} from "@/components/layouts/layout-product-list/layout-product-list";
```

- [ ] **Step 8: Update `app/buyer/(shop)/browse/lab-grown-melee/page.tsx`**

Change:
```ts
} from "@/components/layouts/layout-product-list";
```
to:
```ts
} from "@/components/layouts/layout-product-list/layout-product-list";
```

- [ ] **Step 9: Update `app/buyer/(shop)/browse/jewelry/engagement-rings/page.tsx`**

Change:
```ts
} from "@/components/layouts/layout-product-list";
```
to:
```ts
} from "@/components/layouts/layout-product-list/layout-product-list";
```

- [ ] **Step 10: Update the six `[slug]` detail pages** — same one-line change in each

In each of these six files, change:
```ts
import { LayoutProductDetail } from "@/components/layouts/layout-product-detail";
```
to:
```ts
import { LayoutProductDetail } from "@/components/layouts/layout-product-detail/layout-product-detail";
```

Files:
- `app/buyer/(shop)/browse/natural-diamonds/[slug]/page.tsx`
- `app/buyer/(shop)/browse/lab-grown-diamonds/[slug]/page.tsx`
- `app/buyer/(shop)/browse/gemstones/[slug]/page.tsx`
- `app/buyer/(shop)/browse/natural-melee/[slug]/page.tsx`
- `app/buyer/(shop)/browse/lab-grown-melee/[slug]/page.tsx`
- `app/buyer/(shop)/browse/jewelry/engagement-rings/[slug]/page.tsx`

- [ ] **Step 11: Update the four under-construction pages** — same one-line change in each

In each of these four files, change:
```ts
import { LayoutUnderConstruction } from "@/components/layouts/layout-under-construction";
```
to:
```ts
import { LayoutUnderConstruction } from "@/components/layouts/layout-under-construction/layout-under-construction";
```

Files:
- `app/buyer/(shop)/finances/page.tsx`
- `app/buyer/(shop)/shortlists/page.tsx`
- `app/buyer/(shop)/settings/page.tsx`
- `app/buyer/(shop)/browse/custom-jewellery/page.tsx`

- [ ] **Step 12: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors. If errors appear, they will be import-path mismatches — fix the specific file before continuing.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "refactor: move layouts to per-layout subdirectories, remove barrel imports"
```

---

## Task 3: Implement FilterBar

### Files:
- Create: `components/layouts/layout-product-list/filter-bar.tsx`

- [ ] **Step 1: Create `filter-bar.tsx`**

```tsx
"use client"

import * as React from "react"
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
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
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

function AllFiltersSheet({ filters, committed, onApply }: AllFiltersSheetProps) {
  const [open, setOpen] = useState(false)
  const [sheetPending, setSheetPending] = useState<Record<string, string[]>>({})

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
                      checked={(sheetPending[filter.key] ?? []).includes(option)}
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

export function FilterBar({ filters }: FilterBarProps) {
  const [committed, setCommitted] = useState<Record<string, string[]>>({})

  function applyFilter(key: string, values: string[]) {
    setCommitted((prev) => {
      const next = { ...prev }
      if (values.length === 0) {
        delete next[key]
      } else {
        next[key] = values
      }
      return next
    })
  }

  const hasActive = Object.keys(committed).length > 0

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AllFiltersSheet
        filters={filters}
        committed={committed}
        onApply={setCommitted}
      />
      {filters.map((filter) => (
        <FilterPopover
          key={filter.key}
          filter={filter}
          committed={committed[filter.key] ?? []}
          onApply={applyFilter}
        />
      ))}
      <Button
        variant="ghost"
        size="lg"
        className="h-11.25"
        onClick={() => setCommitted({})}
        disabled={!hasActive}
      >
        Clear all
        <IconX className="size-5" />
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/layouts/layout-product-list/filter-bar.tsx
git commit -m "feat: add FilterBar client component"
```

---

## Task 4: Wire FilterBar into browse pages

Each page: remove the `QuickFilters` function and `IconChevronDown` import, add the `FILTERS` constant and `FilterBar` import, replace `<QuickFilters />` with `<FilterBar filters={FILTERS} />`.

### Files:
- Modify: 6 browse list pages

- [ ] **Step 1: Update `app/buyer/(shop)/browse/natural-diamonds/page.tsx`**

Remove the `QuickFilters` function and `IconChevronDown` import. Replace with:

```tsx
import { FilterBar } from "@/components/layouts/layout-product-list/filter-bar"

const FILTERS = [
  { key: "shape", label: "Shape", options: ["Round", "Oval", "Princess", "Cushion", "Emerald", "Pear", "Radiant", "Marquise", "Heart", "Asscher"] },
  { key: "carat", label: "Carat", options: ["Under 0.5ct", "0.5–1ct", "1–2ct", "2–3ct", "3–5ct", "5ct+"] },
  { key: "color", label: "Color", options: ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"] },
  { key: "clarity", label: "Clarity", options: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"] },
  { key: "cut", label: "Cut", options: ["Excellent", "Very Good", "Good", "Fair", "Poor"] },
  { key: "certification", label: "Certification", options: ["GIA", "IGI", "HRD", "AGS", "None"] },
]
```

In the JSX, replace `quickFilters={<QuickFilters />}` with:
```tsx
quickFilters={<FilterBar filters={FILTERS} />}
```

The final file:

```tsx
import { fetchDiamondList } from "@/lib/api/diamonds";
import { formatUSD } from "@/lib/utils";
import {
  LayoutProductList,
  PER_PAGE_OPTIONS,
  DEFAULT_PER_PAGE,
} from "@/components/layouts/layout-product-list/layout-product-list";
import { ProductListItem } from "@/components/products/product-list-item";
import { FilterBar } from "@/components/layouts/layout-product-list/filter-bar";

const FILTERS = [
  { key: "shape", label: "Shape", options: ["Round", "Oval", "Princess", "Cushion", "Emerald", "Pear", "Radiant", "Marquise", "Heart", "Asscher"] },
  { key: "carat", label: "Carat", options: ["Under 0.5ct", "0.5–1ct", "1–2ct", "2–3ct", "3–5ct", "5ct+"] },
  { key: "color", label: "Color", options: ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"] },
  { key: "clarity", label: "Clarity", options: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"] },
  { key: "cut", label: "Cut", options: ["Excellent", "Very Good", "Good", "Fair", "Poor"] },
  { key: "certification", label: "Certification", options: ["GIA", "IGI", "HRD", "AGS", "None"] },
]

export default async function NaturalDiamondsListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const params = await searchParams;

  const {
    items: paginatedItems,
    totalItems,
    totalPages,
    currentPage,
    perPage,
  } = await fetchDiamondList({
    page: Number(params.page) || 1,
    perPage: Number(params.perPage) || DEFAULT_PER_PAGE,
    perPageOptions: PER_PAGE_OPTIONS,
  });

  const breadcrumbs = [
    { label: "Natural diamonds", href: "/buyer/browse/natural-diamonds" },
  ];

  return (
    <LayoutProductList
      breadcrumbs={breadcrumbs}
      categoryName="Natural Diamonds"
      resultCount={totalItems}
      quickFilters={<FilterBar filters={FILTERS} />}
      currentPage={currentPage}
      totalPages={totalPages}
      perPage={perPage}
    >
      {paginatedItems.map((item) => (
        <ProductListItem
          key={item.id}
          id={item.id}
          href={`/buyer/browse/natural-diamonds/${item.id}`}
          imageSrc={item.images.main}
          imageAlt={item.description}
          title={item.description}
          subtitle={`${item.certification.lab} ${item.certification.number} · ${item.stockId}`}
          priceLabel="Price"
          formattedPrice={formatUSD(item.price)}
          tags={[
            {
              key: "cert",
              label: item.certification.lab,
              title: `Certified by ${item.certification.lab}`,
            },
          ]}
        />
      ))}
    </LayoutProductList>
  );
}
```

- [ ] **Step 2: Update `app/buyer/(shop)/browse/lab-grown-diamonds/page.tsx`**

Same pattern as Step 1. FILTERS constant is identical (same diamond filters). Replace `QuickFilters` function and `IconChevronDown` import, add `FilterBar` import and `FILTERS` constant, update JSX:

```tsx
import { fetchLabGrownDiamondList } from "@/lib/api/lab-grown-diamonds";
import { formatUSD } from "@/lib/utils";
import {
  LayoutProductList,
  PER_PAGE_OPTIONS,
  DEFAULT_PER_PAGE,
} from "@/components/layouts/layout-product-list/layout-product-list";
import { ProductListItem } from "@/components/products/product-list-item";
import { FilterBar } from "@/components/layouts/layout-product-list/filter-bar";

const FILTERS = [
  { key: "shape", label: "Shape", options: ["Round", "Oval", "Princess", "Cushion", "Emerald", "Pear", "Radiant", "Marquise", "Heart", "Asscher"] },
  { key: "carat", label: "Carat", options: ["Under 0.5ct", "0.5–1ct", "1–2ct", "2–3ct", "3–5ct", "5ct+"] },
  { key: "color", label: "Color", options: ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"] },
  { key: "clarity", label: "Clarity", options: ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "I1"] },
  { key: "cut", label: "Cut", options: ["Excellent", "Very Good", "Good", "Fair", "Poor"] },
  { key: "certification", label: "Certification", options: ["GIA", "IGI", "HRD", "AGS", "None"] },
]
```

Keep `quickFilters={<FilterBar filters={FILTERS} />}` in the JSX. Keep all other page logic unchanged.

- [ ] **Step 3: Update `app/buyer/(shop)/browse/gemstones/page.tsx`**

```tsx
import { FilterBar } from "@/components/layouts/layout-product-list/filter-bar";

const FILTERS = [
  { key: "type", label: "Type", options: ["Ruby", "Sapphire", "Emerald", "Tanzanite", "Aquamarine", "Amethyst", "Tourmaline", "Spinel"] },
  { key: "shape", label: "Shape", options: ["Round", "Oval", "Cushion", "Pear", "Emerald", "Marquise", "Heart"] },
  { key: "color", label: "Color", options: ["Red", "Blue", "Green", "Purple", "Pink", "Yellow", "Orange", "Teal"] },
  { key: "carat", label: "Carat", options: ["Under 1ct", "1–2ct", "2–5ct", "5–10ct", "10ct+"] },
  { key: "origin", label: "Origin", options: ["Burma", "Ceylon", "Colombia", "Madagascar", "Mozambique", "Thailand", "Untreated"] },
  { key: "treatment", label: "Treatment", options: ["None", "Heat", "Beryllium", "Fracture filled", "Oiling"] },
]
```

Update the `layout-product-list` import path and replace `<QuickFilters />` with `<FilterBar filters={FILTERS} />`. Remove `QuickFilters` function and `IconChevronDown` import.

- [ ] **Step 4: Update `app/buyer/(shop)/browse/natural-melee/page.tsx`**

```tsx
import { FilterBar } from "@/components/layouts/layout-product-list/filter-bar";

const FILTERS = [
  { key: "shape", label: "Shape", options: ["Round", "Princess", "Baguette", "Tapered baguette"] },
  { key: "size", label: "Size", options: ["Under 1mm", "1–1.5mm", "1.5–2mm", "2–2.5mm", "2.5–3mm", "3mm+"] },
  { key: "color_range", label: "Color range", options: ["DEF", "GHI", "JKL", "MNO"] },
  { key: "clarity_range", label: "Clarity range", options: ["VVS", "VS", "SI", "I"] },
  { key: "cut", label: "Cut", options: ["Excellent", "Very Good", "Good"] },
]
```

Update import path and replace `<QuickFilters />` with `<FilterBar filters={FILTERS} />`. Remove `QuickFilters` function and `IconChevronDown` import.

- [ ] **Step 5: Update `app/buyer/(shop)/browse/lab-grown-melee/page.tsx`**

Same FILTERS constant as natural-melee (identical filter set):

```tsx
import { FilterBar } from "@/components/layouts/layout-product-list/filter-bar";

const FILTERS = [
  { key: "shape", label: "Shape", options: ["Round", "Princess", "Baguette", "Tapered baguette"] },
  { key: "size", label: "Size", options: ["Under 1mm", "1–1.5mm", "1.5–2mm", "2–2.5mm", "2.5–3mm", "3mm+"] },
  { key: "color_range", label: "Color range", options: ["DEF", "GHI", "JKL", "MNO"] },
  { key: "clarity_range", label: "Clarity range", options: ["VVS", "VS", "SI", "I"] },
  { key: "cut", label: "Cut", options: ["Excellent", "Very Good", "Good"] },
]
```

Update import path and replace `<QuickFilters />` with `<FilterBar filters={FILTERS} />`. Remove `QuickFilters` function and `IconChevronDown` import.

- [ ] **Step 6: Update `app/buyer/(shop)/browse/jewelry/engagement-rings/page.tsx`**

```tsx
import { FilterBar } from "@/components/layouts/layout-product-list/filter-bar";

const FILTERS = [
  { key: "stone_shape", label: "Stone shape", options: ["Round", "Oval", "Princess", "Cushion", "Emerald", "Pear", "Radiant", "Marquise"] },
  { key: "stone_count", label: "Stone count", options: ["Solitaire", "3-stone", "Halo", "Pavé", "Channel"] },
  { key: "metal", label: "Metal", options: ["14k Yellow Gold", "18k Yellow Gold", "14k Rose Gold", "18k Rose Gold", "14k White Gold", "18k White Gold", "950 Platinum"] },
  { key: "style", label: "Style", options: ["Classic", "Vintage", "Modern", "Nature-inspired", "Bezel"] },
]
```

Update import path and replace `<QuickFilters />` with `<FilterBar filters={FILTERS} />`. Remove `QuickFilters` function and `IconChevronDown` import.

- [ ] **Step 7: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 8: Run formatter**

```bash
npm run format
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(issue-11): add interactive filter popovers and All Filters sheet to PLP pages"
```
