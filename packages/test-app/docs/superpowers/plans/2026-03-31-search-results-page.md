# Search Results Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full search results page at `/buyer/search?q=...` that shows mock results grouped by dynamic category, accessible from the command palette's "View all results" action.

**Architecture:** A thin Server Component page reads `searchParams` and redirects short/missing queries to `/buyer?search=...`. Valid queries render a client `SearchResultsContent` component that calls the extended `useSearch` hook and renders category-specific sections: product grids (reusing `ProductListItem`) and data tables for orders, requests, and invoices. The `SearchTrigger` component gains a `search` URL param listener to auto-open the dialog on redirect.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, @tabler/icons-react, existing `useSearch` hook, existing `ProductListItem` and `LayoutBrowse` components

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `hooks/use-search.ts` | Modify | Add `requests` to results, add `subcategory`/`image` to products, add structured fields to orders/invoices |
| `components/shell/search-trigger.tsx` | Modify | Read `search` URL param on mount, auto-open dialog with pre-filled query |
| `app/buyer/(shop)/search/page.tsx` | Rewrite | Server Component: read `q`, redirect if missing/short, render `SearchResultsContent` |
| `components/search/search-results-content.tsx` | Create | Client component: call `useSearch`, render section stack with loading/empty states |
| `components/search/search-section-products.tsx` | Create | Product subcategory section: header + 4-column `ProductListItem` grid |
| `components/search/search-section-table.tsx` | Create | Generic data table section for orders, requests, invoices |

---

### Task 1: Extend `useSearch` Hook

**Files:**
- Modify: `hooks/use-search.ts`

- [ ] **Step 1: Update types**

Replace the existing types at the top of the file with extended versions that support the search results page. The existing `SearchResultItem` stays for backward compatibility with the command palette. Add new interfaces alongside it.

```ts
// Keep the existing SearchResultItem — the command palette uses it.
// Add extended interfaces for the search results page.

export interface SearchResultProduct extends SearchResultItem {
  subcategory: string
  image: string
  priceLabel: string
  formattedPrice: string
}

export interface SearchResultOrder extends SearchResultItem {
  image: string
  date: string
  status: string
}

export interface SearchResultRequest extends SearchResultItem {
  image: string
  date: string
  status: string
}

export interface SearchResultInvoice extends SearchResultItem {
  date: string
  amount: string
  status: string
}

export interface SearchResults {
  products: SearchResultProduct[]
  orders: SearchResultOrder[]
  invoices: SearchResultInvoice[]
  shortlists: SearchResultItem[]
  requests: SearchResultRequest[]
}
```

- [ ] **Step 2: Update mock data**

Replace the mock data arrays with the extended types. Add subcategory, image, and structured fields. Add mock requests. Use placeholder image URLs from existing seed data patterns.

```ts
const MOCK_PRODUCTS: SearchResultProduct[] = [
  {
    id: "d001",
    title: "1.01ct Round D IF Excellent Cut",
    subtitle: "Natural Diamond · $18,750",
    href: "/buyer/browse/natural-diamonds/d001",
    category: "Natural Diamond",
    subcategory: "Natural Diamond",
    image: "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    priceLabel: "Price",
    formattedPrice: "$18,750.00",
  },
  {
    id: "d002",
    title: "0.71ct Round E VVS1 Excellent Cut",
    subtitle: "Natural Diamond · $4,890",
    href: "/buyer/browse/natural-diamonds/d002",
    category: "Natural Diamond",
    subcategory: "Natural Diamond",
    image: "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    priceLabel: "Price",
    formattedPrice: "$4,890.00",
  },
  {
    id: "d003",
    title: "2.03ct Round F VS1 Excellent Cut",
    subtitle: "Natural Diamond · $28,400",
    href: "/buyer/browse/natural-diamonds/d003",
    category: "Natural Diamond",
    subcategory: "Natural Diamond",
    image: "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    priceLabel: "Price",
    formattedPrice: "$28,400.00",
  },
  {
    id: "d004",
    title: "1.50ct Oval G VVS2 Very Good Cut",
    subtitle: "Natural Diamond · $14,200",
    href: "/buyer/browse/natural-diamonds/d004",
    category: "Natural Diamond",
    subcategory: "Natural Diamond",
    image: "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    priceLabel: "Price",
    formattedPrice: "$14,200.00",
  },
  {
    id: "d005",
    title: "0.50ct Princess D VS2 Excellent Cut",
    subtitle: "Natural Diamond · $2,850",
    href: "/buyer/browse/natural-diamonds/d005",
    category: "Natural Diamond",
    subcategory: "Natural Diamond",
    image: "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    priceLabel: "Price",
    formattedPrice: "$2,850.00",
  },
  {
    id: "lg001",
    title: "1.25ct Cushion E VS1 Excellent Cut",
    subtitle: "Lab Grown Diamond · $1,200",
    href: "/buyer/browse/lab-grown-diamonds/lg001",
    category: "Lab Grown Diamond",
    subcategory: "Lab Grown Diamond",
    image: "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    priceLabel: "Price",
    formattedPrice: "$1,200.00",
  },
  {
    id: "lg002",
    title: "2.00ct Emerald F VVS2 Very Good Cut",
    subtitle: "Lab Grown Diamond · $2,400",
    href: "/buyer/browse/lab-grown-diamonds/lg002",
    category: "Lab Grown Diamond",
    subcategory: "Lab Grown Diamond",
    image: "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    priceLabel: "Price",
    formattedPrice: "$2,400.00",
  },
  {
    id: "gs001",
    title: "2.15ct Oval Vivid Red Ruby",
    subtitle: "Gemstone · $68,000",
    href: "/buyer/browse/gemstones/gs001",
    category: "Gemstone",
    subcategory: "Gemstone",
    image: "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-gemstone.png",
    priceLabel: "Price",
    formattedPrice: "$68,000.00",
  },
  {
    id: "gs002",
    title: "3.50ct Oval Blue Sapphire",
    subtitle: "Gemstone · $12,500",
    href: "/buyer/browse/gemstones/gs002",
    category: "Gemstone",
    subcategory: "Gemstone",
    image: "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-gemstone.png",
    priceLabel: "Price",
    formattedPrice: "$12,500.00",
  },
  {
    id: "er001",
    title: "Solitaire Round Diamond Ring",
    subtitle: "Engagement Ring · From $3,200",
    href: "/buyer/browse/jewelry/engagement-rings/er001",
    category: "Engagement Ring",
    subcategory: "Engagement Ring",
    image: "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-ring.png",
    priceLabel: "Starting from",
    formattedPrice: "$3,200.00",
  },
]

const MOCK_ORDERS: SearchResultOrder[] = [
  {
    id: "ord-001",
    title: "Order #ORD-001",
    subtitle: "Delivered · 3 items",
    href: "/buyer/orders/ord-001",
    category: "Order",
    image: "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-ring.png",
    date: "Mar 15 2025",
    status: "Delivered",
  },
  {
    id: "ord-002",
    title: "Order #ORD-002",
    subtitle: "In Transit · 1 item",
    href: "/buyer/orders/ord-002",
    category: "Order",
    image: "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    date: "Mar 20 2025",
    status: "In Transit",
  },
  {
    id: "ord-003",
    title: "Order #ORD-003",
    subtitle: "Processing · 2 items",
    href: "/buyer/orders/ord-003",
    category: "Order",
    image: "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-ring.png",
    date: "Mar 22 2025",
    status: "Processing",
  },
  {
    id: "ord-004",
    title: "Order #ORD-004",
    subtitle: "Pending Payment · 1 item",
    href: "/buyer/orders/ord-004",
    category: "Order",
    image: "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-diamond.png",
    date: "Mar 24 2025",
    status: "Pending Payment",
  },
]

const MOCK_INVOICES: SearchResultInvoice[] = [
  {
    id: "inv-001",
    title: "INV-2024-0412",
    subtitle: "$4,200.00 · Paid",
    href: "/buyer/finances",
    category: "Invoice",
    date: "Feb 12 2025",
    amount: "$4,200.00",
    status: "Paid",
  },
  {
    id: "inv-002",
    title: "INV-2024-0389",
    subtitle: "$1,800.00 · Pending",
    href: "/buyer/finances",
    category: "Invoice",
    date: "Feb 28 2025",
    amount: "$1,800.00",
    status: "Pending",
  },
  {
    id: "inv-003",
    title: "INV-2024-0355",
    subtitle: "$7,650.00 · Paid",
    href: "/buyer/finances",
    category: "Invoice",
    date: "Mar 05 2025",
    amount: "$7,650.00",
    status: "Paid",
  },
]

const MOCK_REQUESTS: SearchResultRequest[] = [
  {
    id: "req-001",
    title: "Ring for Mr Appleseed",
    subtitle: "Engagement ring · JR-0024-829374",
    href: "#",
    category: "Request",
    image: "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-ring.png",
    date: "Nov 11 2024",
    status: "Requested",
  },
  {
    id: "req-002",
    title: "Custom Eternity Band",
    subtitle: "Wedding band · JR-0031-482910",
    href: "#",
    category: "Request",
    image: "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-ring.png",
    date: "Dec 03 2024",
    status: "Quote available",
  },
  {
    id: "req-003",
    title: "Three-Stone Anniversary Ring",
    subtitle: "Engagement ring · JR-0042-193847",
    href: "#",
    category: "Request",
    image: "https://nivoda-images.s3.eu-west-2.amazonaws.com/placeholder-ring.png",
    date: "Jan 15 2025",
    status: "Requested",
  },
]
```

- [ ] **Step 3: Update hook internals**

Update `filterByQuery` to be generic (so it preserves the specific type), update `EMPTY_RESULTS`, the `useEffect` body, and the `totalCount` calculation to include `requests`.

```ts
function filterByQuery<T extends SearchResultItem>(items: T[], q: string): T[] {
  const lower = q.toLowerCase()
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(lower) ||
      item.subtitle.toLowerCase().includes(lower),
  )
}

const EMPTY_RESULTS: SearchResults = {
  products: [],
  orders: [],
  invoices: [],
  shortlists: [],
  requests: [],
}

// Inside useEffect timer callback:
setResults({
  products: filterByQuery(MOCK_PRODUCTS, query),
  orders: filterByQuery(MOCK_ORDERS, query),
  invoices: filterByQuery(MOCK_INVOICES, query),
  shortlists: filterByQuery(MOCK_SHORTLISTS, query),
  requests: filterByQuery(MOCK_REQUESTS, query),
})

// Update totalCount:
const totalCount =
  results.products.length +
  results.orders.length +
  results.invoices.length +
  results.shortlists.length +
  results.requests.length
```

- [ ] **Step 4: Verify the command palette still works**

Run: `npm run typecheck`
Expected: No type errors. The existing `SearchResultProduct` extends `SearchResultItem`, so `SearchDialog` can still iterate over `results.products` without changes.

- [ ] **Step 5: Commit**

```bash
git add hooks/use-search.ts
git commit -m "feat(search): extend useSearch hook with requests, subcategory, and structured fields"
```

---

### Task 2: `SearchTrigger` Auto-Open on Redirect

**Files:**
- Modify: `components/shell/search-trigger.tsx`

- [ ] **Step 1: Add URL param detection**

When the search results page redirects to `/buyer?search=...`, the `SearchTrigger` should detect the `search` param, open the dialog, and optionally pre-fill the query. Add `useSearchParams` from `next/navigation`.

```tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { IconSearch } from "@tabler/icons-react"

const SearchDialog = dynamic(
  () => import("@/components/shell/search-dialog").then((m) => m.SearchDialog),
  { ssr: false },
)

function preloadSearchDialog() {
  void import("@/components/shell/search-dialog")
}

export function SearchTrigger() {
  const [open, setOpen] = useState(false)
  const [initialQuery, setInitialQuery] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()

  // Auto-open dialog when ?search= param is present
  useEffect(() => {
    const searchParam = searchParams.get("search")
    if (searchParam !== null) {
      // Pre-fill with the param value (unless it's just "true")
      setInitialQuery(searchParam === "true" ? "" : searchParam)
      setOpen(true)
      // Clean up the URL param without a full navigation
      const url = new URL(window.location.href)
      url.searchParams.delete("search")
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }, [searchParams, router])

  // Global ⌘K / Ctrl+K shortcut
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault()
      setOpen(true)
    }
  }, [])

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        onMouseEnter={preloadSearchDialog}
        onFocus={preloadSearchDialog}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-muted px-3 py-2.5 text-left transition-colors hover:bg-muted/80"
      >
        <IconSearch size={20} className="shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          Search Minivoda...
        </span>
        <kbd className="hidden shrink-0 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </button>

      <SearchDialog
        open={open}
        onOpenChange={setOpen}
        initialQuery={initialQuery}
      />
    </>
  )
}
```

- [ ] **Step 2: Update `SearchDialog` to accept `initialQuery`**

Modify `components/shell/search-dialog.tsx` to accept and use `initialQuery`.

Add `initialQuery` to the props interface:

```ts
interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialQuery?: string
}
```

Inside the component, replace the `useState("")` with a `useEffect` that sets the query when `initialQuery` changes:

```ts
export function SearchDialog({ open, onOpenChange, initialQuery = "" }: SearchDialogProps) {
  const [query, setQuery] = useState(initialQuery)
  const { results, isLoading, totalCount } = useSearch(query)
  const router = useRouter()

  // Sync initialQuery prop when it changes (e.g., from redirect)
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery)
    }
  }, [initialQuery])
```

The rest of the component stays unchanged.

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add components/shell/search-trigger.tsx components/shell/search-dialog.tsx
git commit -m "feat(search): auto-open search dialog on ?search= URL param"
```

---

### Task 3: Product Section Component

**Files:**
- Create: `components/search/search-section-products.tsx`

- [ ] **Step 1: Create the component**

This renders a section header (subcategory name + count) and a 4-column product grid using `ProductListItem`.

```tsx
import { ProductListItem } from "@/components/products/product-list-item"
import type { SearchResultProduct } from "@/hooks/use-search"

type SearchSectionProductsProps = {
  subcategory: string
  items: SearchResultProduct[]
}

export function SearchSectionProducts({
  subcategory,
  items,
}: SearchSectionProductsProps) {
  if (items.length === 0) return null

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-xl font-medium leading-8 text-foreground">
        {subcategory} ({items.length})
      </h2>
      <div className="grid grid-cols-4 gap-x-5 gap-y-16">
        {items.map((item) => (
          <ProductListItem
            key={item.id}
            id={item.id}
            href={item.href}
            imageSrc={item.image}
            title={item.title}
            subtitle={item.subtitle}
            priceLabel={item.priceLabel}
            formattedPrice={item.formattedPrice}
          />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/search/search-section-products.tsx
git commit -m "feat(search): add SearchSectionProducts component"
```

---

### Task 4: Table Section Component

**Files:**
- Create: `components/search/search-section-table.tsx`

- [ ] **Step 1: Create the component**

A generic table section used for orders, requests, and invoices. Accepts a title, column definitions, and row data. Rows are clickable links.

```tsx
"use client"

import Link from "next/link"
import { IconChevronRight } from "@tabler/icons-react"

type Column = {
  key: string
  label: string
  className?: string
}

type Row = {
  id: string
  href: string
  cells: Record<string, React.ReactNode>
}

type SearchSectionTableProps = {
  title: string
  count: number
  columns: Column[]
  rows: Row[]
}

export function SearchSectionTable({
  title,
  count,
  columns,
  rows,
}: SearchSectionTableProps) {
  if (rows.length === 0) return null

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-xl font-medium leading-8 text-foreground">
        {title} ({count})
      </h2>
      <div className="overflow-hidden rounded-xl border border-border">
        {/* Header */}
        <div className="flex items-center gap-5 border-b border-muted bg-background px-4 py-3">
          {columns.map((col) => (
            <div
              key={col.key}
              className={col.className ?? "flex-1"}
            >
              <span className="text-sm text-muted-foreground">
                {col.label}
              </span>
            </div>
          ))}
          {/* Spacer for chevron */}
          <div className="w-6" />
        </div>

        {/* Rows */}
        {rows.map((row) => (
          <Link
            key={row.id}
            href={row.href}
            className="flex items-center gap-5 border-b border-muted px-4 py-5 transition-colors last:border-b-0 hover:bg-muted/50"
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className={col.className ?? "flex-1"}
              >
                {row.cells[col.key]}
              </div>
            ))}
            <IconChevronRight
              size={20}
              className="shrink-0 text-muted-foreground"
            />
          </Link>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/search/search-section-table.tsx
git commit -m "feat(search): add SearchSectionTable component"
```

---

### Task 5: Search Results Content Component

**Files:**
- Create: `components/search/search-results-content.tsx`

- [ ] **Step 1: Create the component**

This is the main client component that calls `useSearch`, groups results by category, and renders the appropriate section components. It handles loading, no-results, and results states.

```tsx
"use client"

import { useSearch } from "@/hooks/use-search"
import type {
  SearchResultProduct,
  SearchResultOrder,
  SearchResultRequest,
  SearchResultInvoice,
} from "@/hooks/use-search"
import { SearchSectionProducts } from "@/components/search/search-section-products"
import { SearchSectionTable } from "@/components/search/search-section-table"
import { IconSearch, IconLoader2 } from "@tabler/icons-react"

type SearchResultsContentProps = {
  query: string
}

// ---------------------------------------------------------------------------
// Helpers: build table rows from typed results
// ---------------------------------------------------------------------------

function ItemCell({ image, title, subtitle }: { image: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-5">
      <img
        src={image}
        alt={title}
        className="size-12 shrink-0 rounded-md object-cover"
      />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-foreground">
          {title}
        </span>
        <span className="truncate text-sm text-muted-foreground">
          {subtitle}
        </span>
      </div>
    </div>
  )
}

function buildOrderRows(items: SearchResultOrder[]) {
  return items.map((item) => ({
    id: item.id,
    href: item.href,
    cells: {
      item: <ItemCell image={item.image} title={item.title} subtitle={item.subtitle} />,
      date: (
        <span className="text-sm text-foreground">{item.date}</span>
      ),
      status: <StatusPill status={item.status} />,
    },
  }))
}

function buildRequestRows(items: SearchResultRequest[]) {
  return items.map((item) => ({
    id: item.id,
    href: item.href,
    cells: {
      item: <ItemCell image={item.image} title={item.title} subtitle={item.subtitle} />,
      date: (
        <span className="text-sm text-foreground">{item.date}</span>
      ),
      status: <StatusPill status={item.status} />,
    },
  }))
}

function buildInvoiceRows(items: SearchResultInvoice[]) {
  return items.map((item) => ({
    id: item.id,
    href: item.href,
    cells: {
      invoice: (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">
            {item.title}
          </span>
        </div>
      ),
      date: (
        <span className="text-sm text-foreground">{item.date}</span>
      ),
      amount: (
        <span className="text-sm text-foreground">{item.amount}</span>
      ),
      status: <StatusPill status={item.status} />,
    },
  }))
}

// ---------------------------------------------------------------------------
// Status pill
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  Delivered: "bg-green-50 text-foreground dark:bg-green-950",
  "In Transit": "bg-blue-50 text-foreground dark:bg-blue-950",
  Processing: "bg-muted text-foreground",
  "Pending Payment": "bg-amber-50 text-foreground dark:bg-amber-950",
  Paid: "bg-green-50 text-foreground dark:bg-green-950",
  Pending: "bg-amber-50 text-foreground dark:bg-amber-950",
  Requested: "bg-muted text-foreground",
  "Quote available": "bg-blue-50 text-foreground dark:bg-blue-950",
  Delayed: "bg-amber-50 text-foreground dark:bg-amber-950",
  Confirmed: "bg-green-50 text-foreground dark:bg-green-950",
}

const STATUS_DOT_COLORS: Record<string, string> = {
  Delivered: "bg-green-500",
  "In Transit": "bg-blue-500",
  Processing: "bg-neutral-400",
  "Pending Payment": "bg-amber-500",
  Paid: "bg-green-500",
  Pending: "bg-amber-500",
  Requested: "bg-neutral-400",
  "Quote available": "bg-blue-500",
  Delayed: "bg-amber-500",
  Confirmed: "bg-green-500",
}

function StatusPill({ status }: { status: string }) {
  const bg = STATUS_COLORS[status] ?? "bg-muted text-foreground"
  const dot = STATUS_DOT_COLORS[status] ?? "bg-neutral-400"

  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-full px-3 py-1 text-[13px] font-medium ${bg}`}
    >
      <span className={`size-2 rounded-full ${dot}`} />
      {status}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const ORDER_COLUMNS = [
  { key: "item", label: "Item", className: "flex-1 min-w-[260px]" },
  { key: "date", label: "Date", className: "w-[120px]" },
  { key: "status", label: "Status", className: "w-[230px]" },
]

const REQUEST_COLUMNS = [
  { key: "item", label: "Item", className: "flex-1 min-w-[260px]" },
  { key: "date", label: "Request date", className: "w-[120px]" },
  { key: "status", label: "Status", className: "w-[230px]" },
]

const INVOICE_COLUMNS = [
  { key: "invoice", label: "Invoice", className: "flex-1 min-w-[200px]" },
  { key: "date", label: "Date", className: "w-[120px]" },
  { key: "amount", label: "Amount", className: "w-[120px]" },
  { key: "status", label: "Status", className: "w-[150px]" },
]

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SearchResultsContent({ query }: SearchResultsContentProps) {
  const { results, isLoading, totalCount } = useSearch(query)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <IconLoader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    )
  }

  // No results
  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <IconSearch size={48} className="text-muted-foreground/50" />
        <h2 className="text-lg font-medium">
          No results found for &ldquo;{query}&rdquo;
        </h2>
        <p className="text-sm text-muted-foreground">
          Try searching with different terms
        </p>
      </div>
    )
  }

  // Group products by subcategory
  const productsBySubcategory = new Map<string, SearchResultProduct[]>()
  for (const product of results.products) {
    const group = productsBySubcategory.get(product.subcategory) ?? []
    group.push(product)
    productsBySubcategory.set(product.subcategory, group)
  }

  return (
    <div className="flex flex-col gap-[72px]">
      {/* Product sections — one per subcategory */}
      {Array.from(productsBySubcategory.entries()).map(
        ([subcategory, items]) => (
          <SearchSectionProducts
            key={subcategory}
            subcategory={subcategory}
            items={items}
          />
        ),
      )}

      {/* Requests */}
      {results.requests.length > 0 && (
        <SearchSectionTable
          title="Requests"
          count={results.requests.length}
          columns={REQUEST_COLUMNS}
          rows={buildRequestRows(results.requests)}
        />
      )}

      {/* Orders */}
      {results.orders.length > 0 && (
        <SearchSectionTable
          title="Orders"
          count={results.orders.length}
          columns={ORDER_COLUMNS}
          rows={buildOrderRows(results.orders)}
        />
      )}

      {/* Invoices */}
      {results.invoices.length > 0 && (
        <SearchSectionTable
          title="Invoices"
          count={results.invoices.length}
          columns={INVOICE_COLUMNS}
          rows={buildInvoiceRows(results.invoices)}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/search/search-results-content.tsx
git commit -m "feat(search): add SearchResultsContent component with section rendering"
```

---

### Task 6: Rewrite Search Page

**Files:**
- Rewrite: `app/buyer/(shop)/search/page.tsx`

- [ ] **Step 1: Replace the stub with the real page**

The page is a Server Component that reads `searchParams`, redirects short/missing queries, and renders the client `SearchResultsContent` wrapped in `LayoutBrowse`.

```tsx
import { redirect } from "next/navigation"
import { LayoutBrowse } from "@/components/layouts/layout-browse/layout-browse"
import { SearchResultsContent } from "@/components/search/search-results-content"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams

  // Redirect short/missing queries to home with search dialog open
  if (!q || q.length < 2) {
    const searchParam = q ?? "true"
    redirect(`/buyer?search=${encodeURIComponent(searchParam)}`)
  }

  return (
    <LayoutBrowse
      breadcrumbs={[
        { label: "Home", href: "/buyer" },
        { label: "Search results", href: `/buyer/search?q=${encodeURIComponent(q)}` },
      ]}
    >
      <div className="flex flex-col gap-6">
        <h1 className="text-[34px] font-medium leading-[42px] tracking-[0.25px] text-foreground">
          Search results for &ldquo;{q}&rdquo;
        </h1>
        <SearchResultsContent query={q} />
      </div>
    </LayoutBrowse>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Verify the page loads in the browser**

Run: `npm run dev`

Test these scenarios:
1. Navigate to `/buyer/search?q=round` — should show search results with product sections
2. Navigate to `/buyer/search?q=ord` — should show order results
3. Navigate to `/buyer/search?q=zzzzz` — should show "No results found" state
4. Navigate to `/buyer/search` — should redirect to `/buyer?search=true` and open the search dialog
5. Navigate to `/buyer/search?q=a` — should redirect to `/buyer?search=a` and open the search dialog

- [ ] **Step 4: Commit**

```bash
git add app/buyer/\(shop\)/search/page.tsx
git commit -m "feat(search): build search results page with category-grouped sections (#27)"
```

---

### Task 7: Update `SearchDialog` to Include Requests

**Files:**
- Modify: `components/shell/search-dialog.tsx`

- [ ] **Step 1: Add requests group to the dialog**

The command palette currently shows products, orders, invoices, and shortlists. Add a requests group between orders and invoices to match the new hook data.

Insert this block after the orders `CommandGroup` and before the invoices `CommandGroup`:

```tsx
{/* Request results */}
{results.requests.length > 0 && (
  <CommandGroup heading="Requests">
    {results.requests.map((item) => (
      <SearchResultItem
        key={item.id}
        title={item.title}
        subtitle={item.subtitle}
        category={item.category}
        onSelect={() => handleSelect(item.href)}
      />
    ))}
  </CommandGroup>
)}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add components/shell/search-dialog.tsx
git commit -m "feat(search): show request results in command palette"
```

---

### Task 8: Final Verification & Lint

**Files:** (none — verification only)

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: PASS — no type errors

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: PASS — no lint errors

- [ ] **Step 3: Run formatter**

Run: `npm run format`
Then check for changes: `git diff`
If there are formatting changes, stage and commit them.

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: PASS — no build errors

- [ ] **Step 5: Commit any formatting fixes**

```bash
git add -A
git commit -m "chore: format search results page files"
```

(Skip if no changes.)
