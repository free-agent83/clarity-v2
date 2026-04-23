# Search Results Page — Design Spec

**Issue:** #27
**Date:** 2026-03-31
**Route:** `/buyer/search?q=...`

## Overview

A full search results page that shows results grouped by category for a given query. Accessible from the command palette's "View all results" action. Uses client-side mock data via the existing `useSearch` hook, consistent with Phase 0 scope.

## Architecture

- **Server Component page** at `app/buyer/(shop)/search/page.tsx` — reads `searchParams`, handles redirect logic for missing/short queries, renders the client component
- **Client Component** `SearchResultsContent` — receives `q` as a prop, calls the `useSearch` hook, renders the results UI
- Inherits the `(shop)` layout (BuyerNav, CategoriesMenu, AppFooter)
- Wrapped in `LayoutBrowse` for breadcrumbs and consistent spacing
- All data is client-side mock data (no API calls)

## Page Layout

- **Breadcrumb:** Home > Search results
- **Title:** `Search results for "{query}"`
- **Body:** Vertical stack of result sections, one per result type that has matches. Sections only render if they contain matching items.

## Result Sections

No tabs. No "See all" links. Each section renders all its matching items using the layout appropriate for that result type.

### Section ordering

1. Product sections (grouped by subcategory)
2. Requests
3. Orders
4. Invoices

### Product sections

One section per product subcategory that has matches (e.g. "Engagement Rings (12)", "Natural Diamonds (3)").

- **Header:** Subcategory name + count
- **Layout:** 4-column grid using the existing `ProductListItem` component
- **Links:** Each card links to its detail page (e.g. `/buyer/browse/engagement-rings/{slug}`)

### Requests section

- **Header:** "Requests" + count
- **Layout:** Data table with columns: thumbnail + item name/subtitle, request date, status pill, chevron
- **Links:** `#` (Requests page not built yet)
- **Data:** Hardcoded mock data added to `useSearch`

### Orders section

- **Header:** "Orders" + count
- **Layout:** Data table with columns: thumbnail + item name/subtitle, date, status pill, chevron
- **Links:** `/buyer/orders/{id}`

### Invoices section

- **Header:** "Invoices" + count
- **Layout:** Data table with columns: invoice number, date, amount, status pill, chevron
- **Links:** `#` (Invoices page not built yet)

## `useSearch` Hook Extension

The existing hook at `hooks/use-search.ts` returns `{ products, orders, invoices, shortlists }` with mock data. Changes needed:

### New fields

- Add `subcategory` to product items (e.g. "Engagement Ring", "Natural Diamond") for grouping into separate sections
- Add `image` to product items for `ProductListItem`
- Add `date`, `status` fields to orders and invoices where missing
- Add `amount` to invoice items

### New mock data

- Add ~3-4 mock request items with: id, title, subtitle, href, date, status (e.g. "Requested", "Quote available")
- Ensure all product mock items have a subcategory and valid `href` to a detail page

### Return shape

```typescript
interface SearchResults {
  products: SearchResultProduct[]
  orders: SearchResultOrder[]
  requests: SearchResultRequest[]
  invoices: SearchResultInvoice[]
}

interface SearchResultProduct {
  id: string
  title: string
  subtitle: string
  href: string
  category: string        // "product"
  subcategory: string     // "Engagement Ring", "Natural Diamond", etc.
  image: string
}

interface SearchResultOrder {
  id: string
  title: string
  subtitle: string
  href: string
  category: string        // "order"
  date: string
  status: string
}

interface SearchResultRequest {
  id: string
  title: string
  subtitle: string
  href: string
  category: string        // "request"
  date: string
  status: string
}

interface SearchResultInvoice {
  id: string
  title: string
  subtitle: string
  href: string
  category: string        // "invoice"
  date: string
  amount: string
  status: string
}
```

## Edge States

### No query or short query (< 2 chars)

Redirect to `/buyer?search={q}` (or `/buyer?search=true` if no query). The home page's `SearchTrigger` component picks up the `search` URL param and auto-opens the command palette dialog, pre-filled with the query if provided.

This requires a small change to `SearchTrigger` to check for the `search` param on mount.

### Loading

Spinner or subtle loading indicator below the title during the 500ms debounce period. Title shows immediately: "Search results for '{query}'".

### No results

Centered layout with search icon, heading "No results found for '{query}'", subtitle "Try searching with different terms".

## Components

### New components

- **`SearchResultsContent`** — Client component that takes `q` from the page, calls `useSearch`, renders the section stack. Handles loading, no-results, and results states.
- **`SearchSectionProducts`** — Renders a product subcategory section: header + 4-column `ProductListItem` grid.
- **`SearchSectionTable`** — Generic table section for orders, requests, invoices. Takes column config and renders header + rows with appropriate fields.

### Reused components

- `LayoutBrowse` — breadcrumb wrapper
- `ProductListItem` — product cards in the grid
- Status pill styling from the orders page

## Out of Scope

- Server-side search / real API integration (future, when `useSearch` is wired to `/api/v1/search`)
- Pagination (mock dataset is small)
- Filters or sorting within results
- Shortlists section (not in the Figma design)
- Real request/invoice detail pages
