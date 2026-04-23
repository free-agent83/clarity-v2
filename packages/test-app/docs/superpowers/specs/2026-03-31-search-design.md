# Search Bar & Overlay — Design Spec

**Issue:** #5 — Search bar: open search dialog with mock results
**Date:** 2026-03-31
**Status:** Approved

## Overview

Wire the static search bar in the buyer header to open a command-palette-style overlay (hybrid `cmdk` + e-commerce styling). Typing shows grouped typeahead results spanning all platform entity types. Selecting a result navigates to its detail page. A "View all results" action navigates to a stub search results page at `/buyer/search?q=...`.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Interaction pattern | Hybrid command palette (`cmdk`) with e-commerce styling | Leverages installed `cmdk`/`command.tsx`; keyboard shortcuts for power users; rich product-aware results for casual users |
| Result grouping | By entity type (Products, Orders, Invoices, Shortlists) | Compact — 4 sections max in the overlay. Product sub-category shown in subtitle. Scales as new entity types are added |
| Backend scope | Products + orders real; invoices + shortlists mocked client-side | Phase 0 — existing API already handles products and orders. Mocked entities deferred to future backend work |
| Results page | Stub route only | Wired from the overlay's "View all results" link. Placeholder content — proper design in #27 |
| Keyboard shortcut | `⌘K` / `Ctrl+K` | Standard command palette shortcut. Badge shown on search bar as hint |
| Component location | `components/shell/` | Search is part of the app shell, not a standalone feature area |

## Search Bar Trigger

The static `<div>` + `<span>` in `buyer-nav.tsx` is replaced with a new `SearchTrigger` client component.

**Appearance:**
- Same visual treatment as current placeholder (muted background, search icon, "Search Minivoda..." text)
- Adds a `<kbd>⌘K</kbd>` badge on the right side
- Rendered as a `<button>` for accessibility

**Behaviour:**
- Click → opens search dialog
- `⌘K` / `Ctrl+K` anywhere on the page → opens search dialog
- Hover/focus → preloads the search dialog chunk (`bundle-preload`)

## Search Dialog (Overlay)

Built on the existing `components/ui/command.tsx` (shadcn `CommandDialog` wrapping `cmdk`). Lazy-loaded via `next/dynamic` to keep it out of the initial bundle (`bundle-dynamic-imports`).

### States

**Empty state** (dialog just opened, no input):
- Focused input with placeholder: "Search products, orders, invoices..."
- Centered hint text: "Start typing to search across all of Minivoda"
- Keyboard hints at the bottom: ↑↓ Navigate, ↵ Open, Esc Close

**Loading state** (query ≥ 2 chars, waiting for API):
- Input shows the typed query
- Result area shows a subtle loading indicator (spinner or shimmer)

**Results state** (API returned data):
- Results grouped into `CommandGroup` sections by entity type
- Only groups with matches are shown
- Each result is a `SearchResultItem` with: thumbnail (or icon for non-product entities), title, subtitle (category + price or status)
- Footer bar: "View all results →" link on the left, result count on the right

**No results state** (API returned empty):
- `CommandEmpty` message: "No results found for '[query]'"

**Groups and their data sources:**

| Group | Data source | Result subtitle format |
|---|---|---|
| Products | Real — `/api/v1/search/suggest` | `{category label} · ${price}` |
| Orders | Real — `/api/v1/search/suggest` (authenticated) | `{item count} items · {status}` |
| Invoices | Mocked client-side | `${amount} · {status}` |
| Shortlists | Mocked client-side | `{item count} items` |

### Navigation on select

Selecting a result closes the dialog and navigates to:

| Entity | Destination |
|---|---|
| Product | `/buyer/browse/{category-slug}/{product-id}` |
| Order | `/buyer/orders/{order-id}` |
| Invoice | `/buyer/finances` (placeholder — no detail page yet) |
| Shortlist | `/buyer/shortlists` (placeholder — no detail page yet) |

"View all results" → `/buyer/search?q={query}`

### Keyboard interaction

- `⌘K` / `Ctrl+K` — open dialog (global listener)
- `Escape` — close dialog
- `↑` / `↓` — navigate results (built into `cmdk`)
- `Enter` — select highlighted result (built into `cmdk`)

## Search Results Page (Stub)

Route: `app/buyer/(shop)/search/page.tsx`

Reads the `q` query parameter from the URL. Renders a simple centered message: "Search results for '{query}'" — or a generic "Search results" if no query. No actual results, filtering, or layout. This is a placeholder for #27.

The page lives under the `(shop)` route group so it inherits the standard buyer shell layout (nav, footer).

## Component Architecture

```
components/shell/
  search-trigger.tsx        ← Button in header; opens dialog; shows ⌘K badge
  search-dialog.tsx         ← CommandDialog with result groups; lazy-loaded
  search-result-item.tsx    ← Single result row (thumbnail/icon + title + subtitle)

app/buyer/(shop)/search/
  page.tsx                  ← Stub results page

hooks/
  use-search.ts             ← Debounced API call + mock data mixing
```

### `SearchTrigger` (`components/shell/search-trigger.tsx`)

Client component. Renders the clickable search bar button in the header.

**Responsibilities:**
- Render search icon + placeholder text + `⌘K` kbd badge
- On click: set dialog open state to `true`
- On `⌘K`/`Ctrl+K`: set dialog open state to `true`
- On hover/focus: preload the dialog chunk via `import("./search-dialog")`
- Render the lazy-loaded `SearchDialog` (conditionally, when open)

**Props:** None — manages its own open/closed state.

### `SearchDialog` (`components/shell/search-dialog.tsx`)

Client component. The overlay itself.

**Responsibilities:**
- Render `CommandDialog` with `CommandInput`
- Call `useSearch(query)` hook to get results
- Render `CommandGroup` sections for each entity type that has results
- Render `CommandEmpty` for no-results state
- Render footer with "View all results" link and count
- On result select: close dialog, navigate via `router.push()`

**Props:**
- `open: boolean`
- `onOpenChange: (open: boolean) => void`

### `SearchResultItem` (`components/shell/search-result-item.tsx`)

Presentational component. A single row inside a `CommandGroup`.

**Responsibilities:**
- Render thumbnail image (products) or category icon (orders/invoices/shortlists)
- Render title (primary text) and subtitle (secondary text)
- Wrap in `CommandItem` with `onSelect` handler

**Props:**
- `title: string`
- `subtitle: string`
- `image?: string` (URL for product thumbnail)
- `icon?: React.ReactNode` (fallback for non-product entities)
- `onSelect: () => void`

### `useSearch` hook (`hooks/use-search.ts`)

Client-side hook that manages the search query lifecycle.

**Responsibilities:**
- Accept a `query` string
- Use `useDeferredValue` on the query to keep input responsive (`rerender-use-deferred-value`)
- Debounce API calls (300ms) — only fire when deferred query is ≥ 2 chars
- Call `/api/v1/search/suggest` via `fetch`
- Mix in mocked invoice and shortlist results client-side when query matches
- Return `{ results, isLoading }` where results is grouped by entity type

**Return shape:**
```ts
type SearchResults = {
  products: SearchResultItem[]
  orders: SearchResultItem[]
  invoices: SearchResultItem[]  // mocked
  shortlists: SearchResultItem[] // mocked
}

type SearchResultItem = {
  id: string
  title: string
  subtitle: string
  image?: string
  href: string
  category: string
}
```

**Mock data strategy:**
A small static array of fake invoices and shortlists lives inside the hook module. When the deferred query matches (case-insensitive substring of the mock item's title), those items are included in the results. This keeps the mock logic contained and easy to rip out when the API is extended.

## Data Flow

1. User clicks search bar or presses `⌘K` → `SearchTrigger` sets `open = true`
2. `SearchDialog` renders (lazy-loaded on first open, preloaded on hover)
3. User types in `CommandInput` → local `query` state updates immediately
4. `useSearch` receives query → `useDeferredValue` defers it → debounce timer starts
5. After 300ms with no typing and deferred query ≥ 2 chars → `fetch("/api/v1/search/suggest?q=...")`
6. API returns `{ products, orders }` → hook mixes in matching mock invoices/shortlists
7. `SearchDialog` renders `CommandGroup` sections for each non-empty entity type
8. User arrows to a result and presses Enter (or clicks) → `router.push(href)`, dialog closes
9. User clicks "View all results" → `router.push("/buyer/search?q=...")`, dialog closes

## Performance Considerations

| Rule | Application |
|---|---|
| `bundle-dynamic-imports` | `SearchDialog` lazy-loaded via `next/dynamic` — `cmdk` + Radix Dialog stay out of initial bundle |
| `bundle-preload` | `SearchTrigger` preloads dialog chunk on hover/focus — no delay on click |
| `rerender-use-deferred-value` | `useSearch` uses `useDeferredValue` on query — input stays responsive while results re-render |
| `server-serialization` | Search trigger and dialog are client components — no RSC serialization overhead |

## Scope Boundaries

**In scope:**
- Clickable search trigger with `⌘K` badge in header
- Command palette overlay with `cmdk`
- Empty, loading, results, and no-results states
- Real product + order results from existing suggest API
- Mocked invoice + shortlist results (client-side)
- `⌘K` / `Ctrl+K` keyboard shortcut
- Arrow key navigation + Enter to select
- "View all results" link navigating to stub page
- Stub route at `/buyer/search` with placeholder content

**Out of scope:**
- Full search results page design (#27)
- Extending suggest API for invoices/shortlists
- Search filters or faceted search
- Recent searches or search history
- Holds, memos, requests (future entity types)
- Mobile-specific search UX
