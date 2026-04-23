# Shortlists Page Design

**Issue:** #22 — Shortlists page: replace placeholder with mock shortlists
**Phase:** 0 (Full Mock UI Coverage)
**Date:** 2026-04-01

## Summary

Replace the "under construction" placeholder on the shortlists page with a functional shortlists UI. Two routes: an index page showing shortlist cards and a detail page showing items in a data grid. All data is mock, all mutations are client-side only. The existing backend (DB schema, API layer, admin CRUD) is untouched — wiring happens in a future phase.

## Routes

| Route | Purpose |
|---|---|
| `/buyer/shortlists` | Index — card grid of user's shortlists |
| `/buyer/shortlists/[id]` | Detail — data grid of items in a shortlist |

Both live under `app/buyer/(shop)/shortlists/` and inherit the shop layout.

## State Management

A single hook file `hooks/use-shortlists-state.ts` following the `use-search.ts` pattern:

- **Types** at the top — `Shortlist`, `ShortlistItem` interfaces
- **Mock data constants** in the middle — 2-3 shortlists with embedded items, commented for easy purging when real APIs are wired
- **Hook** at the bottom — `useShortlistsState()` initialises from mock constants via `useState`

### Hook API

```ts
function useShortlistsState(): {
  shortlists: Shortlist[]
  getShortlist(id: string): Shortlist | undefined
  createShortlist(name: string): void
  renameShortlist(id: string, name: string): void
  deleteShortlist(id: string): void
  removeItem(shortlistId: string, itemId: string): void
}
```

All mutations update local state only. Session-scoped — resets on page refresh.

### Mock Data Shape

```ts
interface ShortlistItem {
  id: string
  stockId: string           // Internal reference (e.g. "STK-001")
  title: string             // Product name/description
  specs: string             // Category-specific condensed specs (e.g. "1.5ct · Round · D · VVS1")
  category: string          // e.g. "Natural Diamond", "Gemstone"
  image: string | null      // Thumbnail URL
  href: string              // Link to product detail page
  price: number             // USD
  addedAt: string           // ISO date
}

interface Shortlist {
  id: string
  name: string
  createdAt: string         // ISO date
  items: ShortlistItem[]
}
```

2-3 mock shortlists (e.g. "Engagement collection", "Client favourites", "Investment Stones") with 3-6 items each, using existing placeholder image URLs from the codebase.

## Index Page (`/buyer/shortlists`)

### Header

- Title: "Shortlists"
- Subtitle: "{n} lists" in muted text
- "New shortlist" button (top right)

### Card Grid

3-column responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).

Each card:
- **Thumbnail mosaic** — 2x2 grid of the first 4 product images from that shortlist. If fewer than 4 items, fill remaining slots with a neutral `bg-muted` placeholder. If the shortlist has no items, show a single dashed-border placeholder spanning the full mosaic area.
- **Name** — shortlist name, bold
- **Meta line** — "{n} items · {date}" in muted text

The entire card is a `Link` to `/buyer/shortlists/[id]`.

### Empty State

If no shortlists exist: centered empty state with icon, "No shortlists yet" message, and the "New shortlist" button.

### Create Shortlist Dialog

A `Dialog` with:
- Single text input for the shortlist name (placeholder: "e.g. Wedding Collection")
- "Create" button
- Calls `createShortlist(name)` from the hook, closes the dialog

## Detail Page (`/buyer/shortlists/[id]`)

### Header

- Back link to `/buyer/shortlists`
- Shortlist name as page title
- Meta line: "{n} items · Created {date}" in muted text
- Actions: overflow menu with "Rename" and "Delete"
  - Rename opens a dialog with name input, calls `renameShortlist()`
  - Delete calls `deleteShortlist()` and navigates back to `/buyer/shortlists`

### Data Grid

Built with the shadcn/ui `Table` component (consistent with the orders page pattern).

| Column | Width | Content |
|---|---|---|
| Thumbnail | Fixed ~48px | Product image, square, rounded |
| Internal Ref | Auto | `stockId` value |
| Product | Flexible | Product name on top, category-specific specs below in muted text |
| Category | Auto | e.g. "Natural Diamond", "Gemstone" |
| Price | Auto, right-aligned | USD formatted |
| Actions | Fixed ~80px | Remove button + Add to cart button (icon buttons) |

- **Row click** navigates to the product detail page (`item.href`)
- **Remove** calls `removeItem(shortlistId, itemId)` from the hook
- **Add to cart** is visual only for now (shows a toast)

### Empty State

If the shortlist has no items: centered message "This shortlist is empty" with a link to browse products.

## Components

New files:

| File | Type | Purpose |
|---|---|---|
| `hooks/use-shortlists-state.ts` | Hook | Mock data + state + mutations |
| `app/buyer/(shop)/shortlists/page.tsx` | Page (client) | Index page — replaces current placeholder |
| `app/buyer/(shop)/shortlists/[id]/page.tsx` | Page (client) | Detail page |

Reuses existing components: `Dialog`, `Button`, `Input`, `Link`, `DropdownMenu` from `components/ui/`.

## Out of Scope

- Backend wiring (server actions, API calls, Realtime subscriptions)
- Wiring the product-actions heart button to shortlists
- Search/filter within the data grid
- Drag-to-reorder items
- Shortlist sharing via ShareModal (the URL is shareable by default via the route)
- Pagination (mock data is small enough to show all items)

## Future Phase Notes

When wiring the backend:
- Replace mock constants in the hook with API calls to `lib/api/shortlists.ts`
- Convert pages to Server Components with Realtime wrappers (follow `OrdersRealtimeWrapper` pattern)
- Update `fetchShortlists` to return `createdAt`
- Update `fetchShortlistItems` to return `stockId` and category-specific specs
- Add a `fetchShortlist` (singular) function for the detail page header
- Wire the product-actions heart button to `addShortlistItem` / `removeShortlistItemByProduct`
