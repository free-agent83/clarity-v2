# Admin Area Design

## Purpose

The Admin area is the internal management interface for Minivoda. It allows admins to create and manage orders, shortlists, invoices, and products across all app users. Its primary use case is **populating the database with demo data** for stakeholder walkthroughs, so full CRUD on every entity is required.

The admin area lives in a **separate browser tab** from the buyer app.

**Delete behaviour:** All delete operations are **hard deletes** (`DELETE FROM`). This is a demo-seeding tool, not a production CMS -- if something was created by mistake, remove it entirely. Tables with `deletedAt` columns (products, users, etc.) are not soft-deleted from admin. The API layer must delete dependent records first (e.g., deleting an order also removes its `order_products`, `order_events`, and `order_exchange_rates`; deleting a product that is referenced by order or shortlist items shows an error in the UI instead).

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Navigation | Sidebar | Four distinct CRUD modules need clear separation and room to grow |
| CRUD scope | Full create/read/update/delete on all entities | Admin doubles as a data seeding tool for deployments |
| Product form | Unified with category picker | Single entry point; form fields adapt based on selected category |
| Layout | Own layout, separate tab | Admin is a different context from buyer; retains Minivoda branding but drops CategoriesMenu and BuyerNav |
| Create/edit pattern | Modal dialogs | Consistent interaction across all modules; user never loses list context |
| Table density | Comfortable | Optimised for demo readability, not power-user density |

## Layout Structure

The admin area has its own layout, independent of the buyer shell (`LayoutBase`). To avoid inheriting the buyer layout (which wraps all children in `LayoutBase` with `BuyerNav` and `CategoriesMenu`), the route structure uses **Next.js route groups**: the existing buyer pages move into `app/buyer/(shop)/` and the admin pages live in `app/buyer/(admin)/admin/`. This gives each group its own `layout.tsx` while keeping the `/buyer/admin` URL path.

```
┌──────────────────────────────────────────────────┐
│  Header: Minivoda logo + "Admin" badge    [User] │
├─────────┬────────────────────────────────────────┤
│         │                                        │
│ Sidebar │  Main content area                     │
│ (~240px)│  (list views with tables)              │
│         │                                        │
│ Orders  │                                        │
│ Shortlists                                       │
│ Invoices│                                        │
│ Products│                                        │
│         │                                        │
└─────────┴────────────────────────────────────────┘
```

### Header

- Slim horizontal bar spanning full width.
- Left: Minivoda logo + "Admin" text or badge to distinguish from the buyer app.
- Right: User avatar and name.
- No search bar, no cart/wishlist counters, no currency selector.

### Sidebar

- Fixed width (~240px), full height below header.
- Four navigation items, each with an icon: Orders, Shortlists, Invoices, Products.
- Active item highlighted (matching existing active-state pattern: `bg-chart-2/10, text-chart-2`).
- Flat list, no collapsible sub-items.

### Main content

- Scrollable area to the right of the sidebar.
- Each module renders its list view here.
- No footer.

## List Views

All four modules share the same list view template:

### Header row

- Module name as `h1` on the left (e.g., "Orders").
- Primary "Create" button (solid variant) on the right. Opens the create modal.

### Filter bar

- Search input on the left.
- Relevant filter dropdowns in the middle (vary by module).
- Sort dropdown on the far right.

### Table

- Checkbox column for bulk selection.
- Data columns specific to each module (see below).
- Three-dot actions menu per row: Edit, Delete, and module-specific actions (e.g., "Change status").
- Comfortable row height with generous whitespace.
- Clicking a row opens the detail/edit modal.

### Pagination

- Result count on the left ("Showing 1-20 of 156").
- Page navigation on the right (previous/next buttons, page numbers).

### Module-specific columns

| Module | Columns |
|---|---|
| Orders | Order # (checkout + sub-order), User (via checkout), Status, Items count, Final price, Created date |
| Shortlists | Name, User, Items count, Created date |
| Invoices | Invoice #, User, Status, Amount, Issue date, Due date |
| Products | Stock ID, Category, Supplier, Price, Active/Inactive, Created date |

### Module-specific filters

| Module | Filters |
|---|---|
| Orders | Status, user, date range |
| Shortlists | User |
| Invoices | Status, user, date range |
| Products | Category, supplier, active/inactive |

## Detail/Edit Modals

All create and edit operations use a centered modal dialog (~640px wide). The modal is scrollable for longer forms.

### Structure

- **Title:** "Create [Entity]" or "Edit [Entity]". Close button (X) top-right.
- **Body:** Form fields with labels above inputs. Required fields marked with asterisk. Logical sections separated by labeled dividers.
- **Repeatable rows:** For line items (order products, shortlist items, ledger entries), an "Add item" button appends rows. Each row has a remove button.
- **Footer:** Cancel (ghost button) and Save (primary solid button), right-aligned.

### Orders modal

The database has a two-level structure: `order_checkouts` (parent) contain one or more `orders` (children). The admin modal abstracts this -- saving an order auto-creates the checkout row behind the scenes. The checkout's `orderNumber` is auto-incremented per user; the sub-order `orderNumber` defaults to 1. The "Order #" column displays as `{checkout.orderNumber}-{order.orderNumber}` (e.g., "12-1").

`paymentTermId` exists on both `order_checkouts` and `orders`. The admin sets it once in the modal; the API writes the same value to both records.

Sections:
1. **Core fields** -- User (select), payment term (select), status (select, from `order_event_types`), estimated delivery (date picker), final price USD (number), can track (toggle), can pay invoice (toggle).
2. **Order items** -- Repeatable rows: product (searchable combobox showing stock ID + category + price) + price (number, pre-filled from product). "Add item" button. The `snapshot` JSONB column is auto-populated from the selected product's current data on save -- no manual input.
3. **Delivery** -- Address (select from selected user's addresses), shipping cost (number, default 0), VAT (number, default 0).
4. **Timeline events** -- Repeatable rows: event type (select from `order_event_types`) + occurred at (datetime picker). "Add event" button. This populates `order_events` so the buyer app's progress timeline renders correctly.

Exchange rates (`order_exchange_rates`) are out of scope for v1 -- the buyer app will fall back to displaying USD only.

### Shortlists modal

Sections:
1. **Core fields** -- User (select), shortlist name (text input).
2. **Items** -- Repeatable rows: product (select). "Add item" button.

### Invoices modal

Sections:
1. **Core fields** -- User (select), invoice number (text), payment method (select), status (select from `invoice_statuses`), total amount USD (number), issue date (date picker), due date (date picker).
2. **Ledger entries** -- Repeatable rows: type (select from `ledger_entry_types`) + description (text) + amount (number) + occurred at (datetime picker) + optional order (select). "Add entry" button.

Exchange rates (`ledger_entry_exchange_rates`) are out of scope for v1.

### Products modal

Sections:
1. **Common fields** -- Category (select, triggers field swap below), supplier (select), stock ID (text), price USD (number), active toggle (switch), description (textarea).
2. **Category-specific fields** -- The section below swaps based on selected category:

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

### Deferred to v2

- **Product images** (`product_images` table) -- the admin cannot attach images to products in v1. Buyer-facing pages will show placeholder thumbnails.
- **Certifications** (`certifications` table) -- diamond/gemstone certification data cannot be managed in v1.
- **Exchange rates** -- both `order_exchange_rates` and `ledger_entry_exchange_rates` are not managed. The buyer app displays USD only.

## Data Layer

The admin area calls the same `lib/api/` data-access layer used by the buyer app. New functions needed:

- **Create/update/delete** variants for orders, shortlists, invoices, and products (currently only read functions exist).
- **List-all variants** that are not scoped to a single user (admin sees everything).
- **Lookup data fetchers** for populating select dropdowns (users, statuses, categories, suppliers, shapes, etc.).

API routes under `/api/v1/admin/` with API key authentication (no user-scoped Bearer token required for admin endpoints).

## Route Structure

```
app/buyer/
  (shop)/                     -- Route group for buyer-facing pages (existing)
    layout.tsx                -- Existing buyer layout (LayoutBase)
    page.tsx                  -- Buyer home (existing)
    browse/                   -- Existing browse pages
    orders/                   -- Existing orders pages
    shortlists/               -- Existing shortlists page
    ...
  (admin)/                    -- Route group for admin pages (new)
    admin/
      layout.tsx              -- Admin layout (header + sidebar + content area)
      page.tsx                -- Redirects to /buyer/admin/orders (default module)
      orders/
        page.tsx              -- Orders list view
      shortlists/
        page.tsx              -- Shortlists list view
      invoices/
        page.tsx              -- Invoices list view
      products/
        page.tsx              -- Products list view
```

The `(shop)` and `(admin)` route groups share the `/buyer` URL prefix but have independent layouts. The existing `app/buyer/layout.tsx` moves into `app/buyer/(shop)/layout.tsx`. The admin layout is defined in `app/buyer/(admin)/admin/layout.tsx`. Middleware continues to protect all `/buyer/*` routes.

## Out of Scope

- User/account management (viewing or editing user profiles).
- Analytics or metrics dashboards.
- Role-based access control (any authenticated user can access admin for now).
- Bulk import/export (CSV, etc.).
- Audit logging.
