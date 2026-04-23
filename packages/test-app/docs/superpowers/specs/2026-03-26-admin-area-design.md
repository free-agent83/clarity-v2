# Admin Area Design

Supersedes: `2026-03-25-admin-area-design.md` (UI-focused draft). This spec adds realtime sync, cross-tab user switching, god-mode authorization, and functional details.

## Purpose

The Admin area is the internal management interface for Minivoda. It allows god-mode users to create and manage orders, shortlists, invoices, and products across all app users. Its primary use case is **populating the database with demo data** for stakeholder walkthroughs, so full CRUD on every entity is required.

The admin area opens in a **separate browser tab** from the buyer app and has its own layout. It is designed to eventually become a broader **state management control surface** — controlling fail states, edge cases, and user roles — but v1 focuses on CRUD, realtime sync, and user switching.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Navigation | Sidebar | Four distinct CRUD modules need clear separation and room to grow |
| CRUD scope | Full create/read/update/delete on all entities | Admin doubles as a data seeding tool for deployments |
| Product form | Unified with category picker | Single entry point; form fields adapt based on selected category |
| Layout | Own layout, separate tab | Admin is a different context from buyer; retains Minivoda branding but drops CategoriesMenu and BuyerNav |
| Create/edit pattern | Modal dialogs | Consistent interaction across all modules; user never loses list context |
| Table density | Comfortable | Optimised for demo readability, not power-user density |
| Delete behaviour | Nuclear cascade with confirmation | Hard deletes that remove the entity and all dependent records everywhere |
| Realtime scope | Full coverage | All buyer-facing views receive live updates when admin mutates data |
| Realtime architecture | Hybrid SSR + client subscription | Server-renders initial data, client hook subscribes and patches state |
| Change handling | Event as signal, targeted refetch | Realtime event triggers a refetch of the fully resolved object |
| User switching | BroadcastChannel cross-tab | Admin controls which user the buyer tab is logged in as |
| Auth model | API key + Supabase session + god-mode role | Three-layer auth; role stored in Supabase `app_metadata` |
| User context for mutations | Explicit "User" field on every form | Admin always selects which user the data belongs to (can include self) |
| Visual language | Same design system as buyer app | Same fonts, colors, components; structural differences only |

## Architecture & Route Structure

The admin area uses Next.js route groups to coexist under `/buyer` with an independent layout. Existing buyer pages move into `(shop)/`, admin pages live in `(admin)/admin/`. The parenthesised folder names are invisible in the URL — they only affect layout inheritance.

```
app/buyer/
  layout.tsx                    ← Slim shared layout: session refresh only
  (shop)/
    layout.tsx                  ← Buyer shell (LayoutBase with BuyerNav, CategoriesMenu, footer)
    page.tsx                    ← Buyer home
    browse/...
    orders/...
    shortlists/...
    finances/...
    settings/...
  (admin)/
    admin/
      layout.tsx                ← Admin shell (header + sidebar, no footer, god-mode check)
      page.tsx                  ← Redirects to /buyer/admin/orders
      orders/page.tsx
      shortlists/page.tsx
      invoices/page.tsx
      products/page.tsx
```

The current `app/buyer/layout.tsx` splits: session refresh stays at the shared level, buyer chrome (LayoutBase) moves down into `(shop)/layout.tsx`. Middleware continues to protect all `/buyer/*` routes unchanged.

The nav sheet's "Admin Dashboard" link (`lib/navigation.ts`) gets `target="_blank"` so it opens in a new tab.

## Authentication & Authorization

Three-layer auth for admin access:

1. **Supabase session** — Middleware refreshes the session on all `/buyer/*` routes (already exists). No valid session → redirect to `/login`.
2. **God-mode role check** — The admin layout reads `app_metadata.role` from the JWT. If it is not `"admin"`, render a 403 page. This check is server-side in `(admin)/admin/layout.tsx`.
3. **API key** — Admin API routes under `/api/v1/admin/*` require the `X-API-Key` header plus a valid Supabase Bearer token with `app_metadata.role === "admin"`.

### Role storage

The god-mode role is stored in Supabase Auth's `app_metadata` field: `{ "role": "admin" }`. This is:

- Set server-side only (via service role key or Supabase dashboard) — tamper-proof
- Embedded in the JWT — no database query needed to check
- Readable by middleware and server components directly from the decoded token

Role assignment is manual (Supabase dashboard or seed data). No admin UI for role management in v1.

### Seeded admin user

`seed.sql` creates a god-mode user in Supabase Auth:

- **Email:** `admin@nivoda.com`
- **Password:** `Nivoda123`
- **`app_metadata`:** `{ "role": "admin" }`

This user is available immediately after `npm run db:reset`.

## Realtime Infrastructure

### Supabase setup

Enable Supabase Realtime on all tables that affect buyer-facing views. This is done via a migration:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE
  orders, order_checkouts, order_products, order_events,
  shortlists, shortlist_items,
  invoices, ledger_entries,
  products, diamonds, gemstones, melee_lots,
  engagement_rings, wedding_bands, tennis_bracelets,
  product_images, cart_items;
```

### Buyer-side hook: `useRealtimeSync`

A reusable hook that bridges SSR data with live updates:

```
useRealtimeSync<T>(initialData: T, table: string, refetchFn: () => Promise<T>)
```

- Takes server-rendered `initialData` as initial state
- Subscribes to Postgres changes on `table` via Supabase Realtime
- On any INSERT/UPDATE/DELETE event, calls `refetchFn` to get the fully resolved object (handles joins and relations)
- Merges the result into local state, triggering a React re-render
- Exposes connection state and sync-in-progress state via React context
- Cleans up subscription on unmount

### Per-page integration pattern

Each buyer page wraps its content in a thin Client Component:

1. Server Component fetches data as today → passes to Client Component as props
2. Client Component calls `useRealtimeSync(serverData, "orders", () => fetchOrders())`
3. Hook returns the live-updating data; component renders it

Existing Server Component rendering is untouched — the realtime layer is additive.

### What triggers updates

Admin creates/edits/deletes via admin API → Postgres row changes → Supabase Realtime fires → buyer hook receives event → refetches resolved object → UI updates.

### Realtime status indicator

A small fixed pill in the bottom-right corner of the buyer app (in `(shop)/layout.tsx`), visible on every buyer page:

- **Connection status:** Green pulse dot + "Database live" when WebSocket is connected. Red/amber when disconnected or reconnecting.
- **Sync status:** Checkmark + "Data synced" when idle. Spinner + "Syncing..." when a realtime event has fired and the refetch is in progress.

The status pill reads from the same React context that `useRealtimeSync` exposes.

## Cross-tab User Switching

### Flow

1. Admin header has a user switcher dropdown listing all users (name + email).
2. Admin selects a user → broadcasts `{ type: "user-switched", userId: "<id>" }` via `BroadcastChannel("minivoda-admin")`.
3. Buyer tab listens on the same channel. On receiving the event:
   - Calls `/api/v1/admin/impersonate` which creates a new Supabase session for that user using the service role key
   - Updates the browser's Supabase auth cookies
   - Triggers a full `router.refresh()` so all Server Components re-fetch with the new user's data
4. Realtime subscriptions in the buyer tab automatically pick up the new user's data after refresh.

### Details

- The buyer tab's realtime status pill shows "Syncing..." during the session switch.
- BroadcastChannel only works across tabs on the same origin — which is the case since both tabs are on the same domain.
- If the buyer tab is not open when the admin switches user, nothing happens — the next time it opens/refreshes it uses the current session.
- The impersonate endpoint is protected by the god-mode role check. Only an admin can impersonate another user.

## Admin Layout

### Header

- Slim horizontal bar, full width.
- Left: Minivoda logo + "Admin" text badge.
- Right: User switcher dropdown (all users, name + email) + current god-mode user's avatar/name.
- The user switcher serves a dual purpose: (1) sets the "active demo user" context for the admin area — filters default to that user and create forms pre-select them in the User field, and (2) broadcasts a `user-switched` event to the buyer tab via BroadcastChannel.
- No search bar, no cart/wishlist counters, no currency selector.

### Sidebar

- Fixed ~240px, full height below header.
- Four nav items with icons: Orders, Shortlists, Invoices, Products.
- Active item highlighted (matching existing active-state pattern: `bg-chart-2/10, text-chart-2`).
- Flat list, no collapsible sub-items.

### Main content

- Scrollable area to the right of the sidebar.
- Each module renders its list view here.
- No footer.

### Visual language

Same design system as the buyer app: same fonts (Inter, Geist Mono), same color tokens, same shadcn/ui components. The structural differences (sidebar nav, no buyer chrome, "Admin" badge) are sufficient to distinguish it.

## CRUD Modules

### Shared list view template

All four modules share the same list view structure:

**Header row:** Module name as `h1` left, primary "Create" button (solid variant) right. Opens the create modal.

**Filter bar:** Search input left, module-specific filter dropdowns middle, sort dropdown far right.

**Table:** Checkbox column for bulk selection (no bulk actions in v1 — reserved for future use), data columns per module, three-dot actions menu per row (Edit, Delete, and module-specific actions like "Change status"). Comfortable row height. Clicking a row opens the edit modal.

**Pagination:** Result count left ("Showing 1-20 of 156"), page nav right (previous/next, page numbers).

**Delete:** Confirmation dialog → nuclear cascade. Removes the entity and all dependent records everywhere in the database.

### Module-specific columns and filters

| Module | Columns | Filters |
|---|---|---|
| Orders | Order # (`{checkout}-{sub}`), User, Status, Items count, Final price, Created date | Status, user, date range |
| Shortlists | Name, User, Items count, Created date | User |
| Invoices | Invoice #, User, Status, Amount, Issue date, Due date | Status, user, date range |
| Products | Stock ID, Category, Supplier, Price, Active/Inactive, Created date | Category, supplier, active/inactive |

### Orders modal

The database has a two-level structure: `order_checkouts` (parent) contain one or more `orders` (children). The modal abstracts this — saving an order auto-creates the checkout row behind the scenes. The checkout's `orderNumber` is auto-incremented per user; the sub-order `orderNumber` defaults to 1. The "Order #" column displays as `{checkout.orderNumber}-{order.orderNumber}` (e.g., "12-1").

`paymentTermId` exists on both `order_checkouts` and `orders`. The admin sets it once; the API writes the same value to both records.

Sections:

1. **Core fields** — User (select), payment term (select), status (select from `order_event_types`), estimated delivery (date picker), final price USD (number), can track (toggle), can pay invoice (toggle).
2. **Order items** — Repeatable rows: product (searchable combobox showing stock ID + category + price) + price (number, pre-filled from product). "Add item" button. The `snapshot` JSONB column is auto-populated from the selected product's current data on save.
3. **Delivery** — Address (select from selected user's addresses), shipping cost (number, default 0), VAT (number, default 0).
4. **Timeline events** — Repeatable rows: event type (select from `order_event_types`) + occurred at (datetime picker). "Add event" button.

Exchange rates (`order_exchange_rates`) are out of scope for v1.

### Shortlists modal

Sections:

1. **Core fields** — User (select), shortlist name (text input).
2. **Items** — Repeatable rows: product (select). "Add item" button.

### Invoices modal

Sections:

1. **Core fields** — User (select), invoice number (text), payment method (select), status (select from `invoice_statuses`), total amount USD (number), issue date (date picker), due date (date picker).
2. **Ledger entries** — Repeatable rows: type (select from `ledger_entry_types`) + description (text) + amount (number) + occurred at (datetime picker) + optional order (select). "Add entry" button.

Exchange rates (`ledger_entry_exchange_rates`) are out of scope for v1.

### Products modal

Sections:

1. **Common fields** — Category (select, triggers field swap below), supplier (select), stock ID (text), price USD (number), active toggle (switch), description (textarea).
2. **Category-specific fields** — The section below swaps based on selected category:

| Category | Fields |
|---|---|
| Natural diamond | Shape, carat, color, clarity, cut, polish, symmetry, fluorescence, price per carat, table %, depth %, L/W/D mm |
| Lab-grown diamond | Same as natural diamond |
| Gemstone | Type, shape, carat, color (text), clarity (text), cut, treatment, origin, price per carat, L/W/D mm |
| Natural melee | Shape, size range, color range, clarity range, cut, quantity, total carat weight |
| Lab-grown melee | Same as natural melee |
| Engagement ring | SKU, band style, ring width mm, available metals (repeatable: metal + price), compatible stones (repeatable: shape + max carat) |
| Wedding band | SKU, band style, ring width mm, available metals (repeatable: metal + price) |
| Tennis bracelet | SKU |

### Product select UX

Wherever a product needs to be selected (order items, shortlist items), the dropdown is a **searchable combobox** (not a plain `<select>`). It searches by stock ID and displays: stock ID, category name, and price. This is necessary because there may be hundreds of products across 8 categories.

## Data Layer & API

### New `lib/api/admin/` module

The admin data layer lives in its own directory, separate from buyer-facing `lib/api/` functions:

- **List-all functions** — Same entities as buyer but not scoped to a single user. Accept optional filters (user, status, date range, category, etc.) and pagination params.
- **Create functions** — Accept a full payload including `userId`. Handle cascading inserts in a single transaction (e.g., creating an order creates `order_checkouts` parent, `order_products` line items, and `order_events` in one transaction).
- **Update functions** — Accept partial payloads, update in a transaction. For orders, handle the two-level hierarchy transparently.
- **Delete functions** — Nuclear cascade. Delete the entity and all dependent records in a transaction. No referential integrity checks.
- **Lookup fetchers** — Return all options for select dropdowns: users, statuses, categories, suppliers, shapes, metals, etc. Query lookup tables and return `{ id, label }` arrays.

### API routes

```
/api/v1/admin/orders          GET (list), POST (create)
/api/v1/admin/orders/:id      GET (detail), PATCH (update), DELETE
/api/v1/admin/shortlists      GET (list), POST (create)
/api/v1/admin/shortlists/:id  GET (detail), PATCH (update), DELETE
/api/v1/admin/invoices        GET (list), POST (create)
/api/v1/admin/invoices/:id    GET (detail), PATCH (update), DELETE
/api/v1/admin/products        GET (list), POST (create)
/api/v1/admin/products/:id    GET (detail), PATCH (update), DELETE
/api/v1/admin/lookups         GET (all lookup data in one call)
/api/v1/admin/users           GET (list all users for dropdowns)
/api/v1/admin/impersonate     POST (sign in as target user, god-mode only)
```

Auth on every admin route: API key + Bearer token + `app_metadata.role === "admin"`.

Server Components in admin pages call `lib/api/admin/` directly (same pattern as buyer pages). The API routes exist for client-side modal forms (create/edit) and potential future external consumers.

## Out of Scope (v1)

- **User/account management** — No creating, editing, or deleting users from admin. Users are seeded or created via normal sign-up.
- **Role management UI** — God-mode role assigned manually via Supabase dashboard or seed data.
- **Product images** — Admin cannot attach images to products. Buyer pages show placeholder thumbnails.
- **Certifications** — Diamond/gemstone certification data cannot be managed.
- **Exchange rates** — `order_exchange_rates` and `ledger_entry_exchange_rates` not managed. Buyer app displays USD only.
- **Bulk operations** — Checkbox column present for future use, no bulk actions in v1.
- **Analytics/metrics dashboards.**
- **Audit logging.**
- **Advanced state management** — Fail states, edge case triggers, feature flags come in a future iteration. The admin shell is designed to accommodate these later.
