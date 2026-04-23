# Order Schema Refinement

## Context

The order data model was recently rebuilt as part of the broader database schema redesign (`2026-03-24-database-schema-redesign.md`). After a review of the initial implementation, several refinements are needed to simplify the schema, correct naming, remove redundant columns, and extend support for engagement ring orders.

This spec also introduces a `product_categories` lookup table that affects the `products` table beyond the order subsystem.

### Source document

`docs/new-schema-2.md` — the raw refinement notes that prompted this work.

---

## Design Decisions

### Order model recap

- One checkout = one purchase event. A user adds items to a cart and checks out — this creates one `order_checkouts` row.
- Each item in the cart becomes an individual `orders` row linked to that checkout.
- One order = one product (always). An engagement ring counts as one product whose configuration includes a mount and a stone (two `order_products` rows).
- Cancellation is an event, not a deletion. There is no soft delete on orders.

### Payment terms vs. payment methods

The existing `payment_methods` lookup table (e.g., bank transfer, card) is a separate concern from payment terms. Payment methods describe *how* the buyer pays; payment terms describe *when*. This spec only models payment terms. The `payment_methods` table remains untouched.

### Payment terms

Payment terms describe *when* the buyer pays. They are selected once at checkout and apply to every order in that checkout. The four options are:

| Value              | Sort order |
| ------------------ | ---------- |
| `advance_payment`  | 1          |
| `pay_in_3_days`    | 2          |
| `pay_in_30_days`   | 3          |
| `pay_in_60_days`   | 4          |

The term is stored on `order_checkouts` (source of truth) and denormalized onto each `orders` row (avoids a join when displaying individual orders).

### Order numbering

Both checkout-level and order-level numbers become integers. Display formatting (leading zeros, compound format like "0001-2") is the frontend's responsibility.

- **Checkout number** — per-user auto-incrementing integer. Each user's first checkout is 1, second is 2, etc. Assigned by a `BEFORE INSERT` trigger on `order_checkouts`.
- **Order number** — positional integer within a checkout. First item is 1, second is 2, etc. Assigned by a `BEFORE INSERT` trigger on `orders`.
- **Uniqueness** — `(user_id, order_number)` on `order_checkouts`; `(checkout_id, order_number)` on `orders`.

### Product categories

A new `product_categories` lookup table replaces the `product_type` enum column on `products`. The current enum (`productTypeEnum` in `db/schema/enums.ts`) has four values: `diamond`, `gemstone`, `melee`, `jewelry`. The new lookup table provides more granular categories and a single source of truth for product types across the app — browse pages, filters, order labels, and snapshots all reference the same table.

This change has a wide blast radius: seven files in `lib/api/` filter on `products.productType` and must be updated to join/filter via `product_category_id` instead. See the "Downstream product query changes" section below.

### Snapshots as the sole configuration record

`order_products.snapshot` (JSONB) is an immutable record of what was purchased. It must be self-contained: every value needed to render the order detail page (names, labels, image URLs) is stored directly — no foreign key IDs that require further lookups. Products change over time; the snapshot does not.

For engagement rings, two `order_products` rows exist per order:
- **Mount** — snapshot includes metal type, metal color, metal quality, band style, ring size, image, description, price.
- **Stone** — snapshot includes shape, carat, color, clarity, cut, polish, symmetry, fluorescence, certification lab, image, description, price.

The frontend infers component roles from the product category stored in each snapshot (`productType`). Engagement rings are the only current product type (along with future custom jewellery) where an order has multiple `order_products` rows.

---

## Schema Changes

### New lookup tables

Both new tables are defined in `db/schema/lookups.ts` alongside the existing lookup tables, using the shared `lookupTable()` helper.

#### `payment_terms`

Columns: `id`, `value`, `sort_order` (via `lookupTable()`).

Seeded with: `advance_payment`, `pay_in_3_days`, `pay_in_30_days`, `pay_in_60_days`.

#### `product_categories`

Columns: `id`, `value`, `sort_order` (via `lookupTable()`).

Seeded with the values that map to the current enum + more granular distinctions where needed (e.g., `natural_diamond`, `lab_grown_diamond`, `gemstone`, `natural_melee`, `lab_grown_melee`, `engagement_ring`). The exact values will be determined during implementation based on what the API layer needs to filter on.

### `products` table

| Change | Detail |
| ------ | ------ |
| Drop column | `product_type` (enum) |
| Add column | `product_category_id` (uuid, FK → `product_categories.id`, not null) |
| Drop enum | Remove `productTypeEnum` from `db/schema/enums.ts` |
| Add relation | `productCategory` → `product_categories` in `productsRelations` |

### `order_checkouts` table

| Change | Detail |
| ------ | ------ |
| Drop column | `updated_at` — checkouts are immutable once placed. Stop using the `timestamps` helper; define `created_at` manually on this table |
| Drop column | `order_date` — redundant with `created_at` |
| Rename + retype | `order_parent_number` (text, unique) → `order_number` (integer) |
| Drop constraint | Remove the old unique constraint on `order_parent_number` |
| Add constraint | Unique on `(user_id, order_number)` |
| Add column | `payment_term_id` (uuid, FK → `payment_terms.id`, not null) |
| Add relation | `paymentTerm` → `payment_terms` in `orderCheckoutsRelations` |

**Resulting columns:** `id`, `user_id`, `order_number`, `payment_term_id`, `created_at`.

### `orders` table

| Change | Detail |
| ------ | ------ |
| Drop column | `deleted_at` — cancellation tracked via order events |
| Retype | `order_number` from text to integer |
| Drop constraint | Remove the old unique constraint on `order_number` |
| Add constraint | Unique on `(checkout_id, order_number)` |
| Add column | `payment_term_id` (uuid, FK → `payment_terms.id`, not null) |
| Add relation | `paymentTerm` → `payment_terms` in `ordersRelations` |

**Resulting columns:** `id`, `checkout_id`, `order_number`, `payment_term_id`, `current_status`, `estimated_delivery`, `delivery_address_id`, `shipping_cost`, `vat_amount`, `final_price_usd`, `can_track`, `can_pay_invoice`, `created_at`, `updated_at`.

### `order_events` table

| Change | Detail |
| ------ | ------ |
| Drop column | `message` — frontend derives display text from event type |
| Drop column | `description` — same reasoning |

**Resulting columns:** `id`, `order_id`, `event_type_id`, `occurred_at`.

### No schema changes

- `order_products` — table schema unchanged. However, snapshot content and cardinality per order are changing: engagement ring orders will have two rows (mount + stone) instead of one. See "Snapshots as the sole configuration record" above.
- `order_exchange_rates` — unchanged.
- `order_event_types` — unchanged (keeps shared `lookupTable()` shape with `value` and `sort_order`).

---

## New Triggers

### `trg_checkout_order_number`

- **Table:** `order_checkouts`
- **Timing:** `BEFORE INSERT`
- **Logic:** `NEW.order_number = COALESCE((SELECT MAX(order_number) FROM order_checkouts WHERE user_id = NEW.user_id), 0) + 1`
- **Purpose:** Auto-assigns per-user incrementing checkout number. Application inserts without specifying `order_number`.

### `trg_order_item_number`

- **Table:** `orders`
- **Timing:** `BEFORE INSERT`
- **Logic:** `NEW.order_number = COALESCE((SELECT MAX(order_number) FROM orders WHERE checkout_id = NEW.checkout_id), 0) + 1`
- **Purpose:** Auto-assigns positional order number within a checkout. Application inserts without specifying `order_number`.

### Concurrency note

Both triggers use `SELECT MAX(order_number)` which is susceptible to race conditions under concurrent inserts (two transactions could read the same MAX and collide). The unique constraints `(user_id, order_number)` and `(checkout_id, order_number)` provide a safety net — one transaction would fail and could retry. For a prototype with no concurrent users, this is acceptable. A production system would need row-level locking or advisory locks.

### Existing trigger — no changes

- `trg_order_event_status` — continues to update `orders.current_status` from the most recent event. Unaffected by removing `message`/`description` from `order_events`.

---

## API Layer Changes

File: `lib/api/orders.ts`

### Type changes

- `Order.orderNumber` — changes from string to composed display string (assembled from checkout number + order number integers).
- `Order.orderDate` — derived from `order_checkouts.created_at` instead of the removed `order_date` column.
- `Order.paymentTerm` — new field, resolved from `payment_terms` lookup.
- Remove `Order.checkoutOrderParentNumber` — no longer needed as a separate field; the checkout number is part of the composed display number.
- `OrderEvent.message` — removed.
- `OrderEvent.description` — removed.
- `OrderProduct` — unchanged, but snapshots will now contain richer data for engagement rings.

### Query changes

- `fetchOrderList` — remove `isNull(orders.deletedAt)` filter. Cancelled orders appear in results with a "cancelled" status. Join `payment_terms` to resolve the term.
- `fetchOrder` — change lookup from `order_number` (text) to `id` (UUID). Remove the `isNull(orders.deletedAt)` filter (column no longer exists). Join `payment_terms`.
- Both functions — join `product_categories` where needed, or rely on snapshot data.

### Route handler changes

- `GET /api/v1/orders/[id]` — the `[id]` parameter becomes a UUID instead of an order number string.

### Downstream product query changes

Replacing `products.productType` (enum) with `product_category_id` (FK) affects every API file that filters by product type. Each must be updated to join or filter via the `product_categories` table instead of comparing against enum strings.

Affected files:

| File | Current filter |
| ---- | -------------- |
| `lib/api/diamonds.ts` | `eq(products.productType, "diamond")` |
| `lib/api/gemstones.ts` | `eq(products.productType, "gemstone")` |
| `lib/api/melee.ts` | `eq(products.productType, "melee")` |
| `lib/api/jewelry/engagement-rings.ts` | `eq(products.productType, "jewelry")` |
| `lib/api/search.ts` | Reads `productType`, maps via `PRODUCT_TYPE_LABELS` |
| `lib/api/shortlists.ts` | Reads `product.productType` for category label |
| `lib/api/cart.ts` | Reads `product.productType` for category label |

Each of these will join `product_categories` on `products.productCategoryId` and filter/read `productCategories.value` instead.

---

## Frontend Changes

### Order detail route — rename `[slug]` to `[id]`

Rename `app/buyer/orders/[slug]/` to `app/buyer/orders/[id]/` to align with the semantic change from order number to UUID.

### Order detail page (`app/buyer/orders/[id]/page.tsx`)

- **URL parameter** — changes from order number text to order UUID. All links to order detail pages must pass the UUID.
- **Event timeline** — remove rendering of `event.message` and `event.description`. Replace with a label derived from `event.eventType.value` (see mapping below).
- **Engagement ring rendering** — the `OrderProductDetails` component currently reads only `order.products[0]`. For engagement rings (2 `order_products` rows), render both components — a "Mount" section and a "Stone" section with their respective snapshot specs.
- **Progress tracker bug fix** — the `PROGRESS_STEPS` keys are title-case (`"Requested"`, `"Confirmed"`, `"Shipped"`, `"Out for delivery"`, `"Delivered"`) but the database stores lowercase snake_case (`requested`, `confirmed`, `shipped`, `out_for_delivery`, `delivered`). This is a pre-existing bug where progress steps never match events. Fix the keys to use the actual DB values.

### Order list page (`app/buyer/orders/page.tsx`)

- **Row links** — navigate to `/buyer/orders/{order.id}` (UUID) instead of `/buyer/orders/{order.orderNumber}`.
- **Status badge** — add color mapping for "cancelled" status.
- **`orderDate` field** — no frontend change needed; the API layer handles the source change transparently.

### Event type label mapping

A utility function that converts event type `value` strings (as seeded in `order_event_types`) to human-readable labels:

```
requested        → "Requested"
confirmed        → "Confirmed"
manufacturing    → "Manufacturing"
shipped          → "Shipped"
out_for_delivery → "Out for delivery"
delivered        → "Delivered"
returned         → "Returned"
cancelled        → "Cancelled"
delayed          → "Delayed"
```

This replaces the removed `message` column. The `PROGRESS_STEPS` array on the detail page must use these same values as keys. Location: either in the order detail page or a shared utility if reused elsewhere.

---

## Seed Data Changes

1. **`payment_terms`** — seed the 4 rows.
2. **`product_categories`** — seed all distinct product types.
3. **`products`** — replace `product_type` enum values with `product_category_id` FK references.
4. **`order_checkouts`** — remove `updated_at`, `order_date`, `order_parent_number` values. Add `payment_term_id`. Omit `order_number` from INSERT (trigger assigns it).
5. **`orders`** — remove `deleted_at`, text `order_number` values. Add `payment_term_id`. Omit `order_number` from INSERT (trigger assigns it).
6. **`order_events`** — remove `message` and `description` values from all inserts.
7. **`order_event_types`** — already has a `cancelled` row (seeded as ID `...0008`). No change needed.
8. **New engagement ring order** — at least one checkout containing an engagement ring with two `order_products` rows (mount snapshot + stone snapshot), each with self-contained data for frontend rendering.

### Seed insertion order matters

Because the triggers use `MAX(order_number) + 1`, the assigned numbers depend on insertion order. Seed INSERTs for `order_checkouts` must be grouped by user and ordered chronologically within each user. Similarly, `orders` INSERTs must be grouped by checkout. This ensures the trigger-assigned numbers match the intended sequence.

Checkout numbers are now **per-user** (not globally unique). Multiple users will each have a checkout numbered 1, 2, 3, etc. The frontend display format must account for this — order identity comes from the combination of user + checkout number + item position, not from any single number.

---

## Documentation Updates

- **API docs** (`docs/api/`) — update order endpoints for UUID-based lookup, new response shapes (payment term, no message/description on events), changed field types.
- **CLAUDE.md** — update file structure and data layer sections if affected.
- **README** — update if any commands or setup steps change.

---

## Implementation Ordering Note

The order list page currently links to `/buyer/orders/${order.orderNumber}`. After the API change (order number becomes an integer, detail lookup by UUID), these links would break if the API is updated before the frontend. The API layer, route handlers, and frontend pages for orders must be updated together in the same pass.

---

## Out of Scope

- Order number display formatting formula (deferred to a future pass).
- Payment method capture (e.g., bank transfer, card) — only payment terms are modeled.
- Cart and checkout flow implementation — this spec covers the data model only.
- Search, filtering, and sorting logic on order list page.
