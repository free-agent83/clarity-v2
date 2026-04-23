# Order Schema Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the order data model — simplify columns, add payment terms, auto-incrementing order numbers via triggers, replace the product type enum with a lookup table, support engagement ring orders, and update the full stack (schema → API → frontend → docs).

**Architecture:** Bottom-up: schema changes and migration first, then seed data, then API layer, then frontend, then docs. The API layer and frontend for orders must be updated in the same task to avoid broken links. Product type migration across the non-order API files is a separate task.

**Tech Stack:** Drizzle ORM, PostgreSQL (Supabase local), Next.js 16 App Router, TypeScript, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-25-order-schema-refinement.md`

---

### Task 1: Add new lookup tables

**Files:**
- Modify: `db/schema/lookups.ts`

- [ ] **Step 1: Add `paymentTerms` and `productCategories` to lookups.ts**

After the existing `ledgerEntryTypes` line, add:

```typescript
export const paymentTerms = lookupTable("payment_terms");
export const productCategories = lookupTable("product_categories");
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS (no consumers yet)

- [ ] **Step 3: Commit**

```bash
git add db/schema/lookups.ts
git commit -m "feat(db): add payment_terms and product_categories lookup tables"
```

---

### Task 2: Replace product type enum with FK to product_categories

**Files:**
- Modify: `db/schema/products.ts`
- Modify: `db/schema/enums.ts`
- Modify: `db/schema/index.ts`

- [ ] **Step 1: Update products.ts**

Replace the `productTypeEnum` import and column with a FK to `productCategories`:

In the imports, replace:
```typescript
import { productTypeEnum } from "./enums";
```
with:
```typescript
import { productCategories } from "./lookups";
```

Also add `productCategories` to the existing `./lookups` import if there is one, or create a new one.

In the `products` table definition, replace:
```typescript
productType: productTypeEnum("product_type").notNull(),
```
with:
```typescript
productCategoryId: uuid("product_category_id")
  .references(() => productCategories.id)
  .notNull(),
```

Add a `productCategory` relation to `productsRelations`:
```typescript
productCategory: one(productCategories, {
  fields: [products.productCategoryId],
  references: [productCategories.id],
}),
```

- [ ] **Step 2: Gut enums.ts**

Since `productTypeEnum` is the only enum, replace the file contents with:

```typescript
// No enums — product_type has been replaced by the product_categories lookup table.
```

- [ ] **Step 3: Remove enums export from index.ts if it becomes empty**

In `db/schema/index.ts`, remove the line:
```typescript
export * from "./enums";
```

- [ ] **Step 4: Run typecheck — expect failures**

Run: `npm run typecheck`
Expected: FAIL — the 7 API files that reference `products.productType` will break. This is expected and will be fixed in Task 6.

- [ ] **Step 5: Commit**

```bash
git add db/schema/products.ts db/schema/enums.ts db/schema/index.ts
git commit -m "feat(db): replace productType enum with product_categories FK"
```

---

### Task 3: Update order schema tables

**Files:**
- Modify: `db/schema/orders.ts`

- [ ] **Step 1: Update imports**

Add `integer` and `timestamp` (if not already imported) to the `drizzle-orm/pg-core` import. Add `paymentTerms` to the `./lookups` import. Add `unique` from `drizzle-orm/pg-core` for composite unique constraints.

Updated import block (`text` removed since `orderParentNumber`, `orderNumber` text, `message`, and `description` are all gone; `date` stays for `estimatedDelivery`):
```typescript
import {
  pgTable,
  uuid,
  numeric,
  boolean,
  timestamp,
  date,
  jsonb,
  integer,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { timestamps } from "./helpers";
import { users, addresses } from "./users";
import { products } from "./products";
import { orderEventTypes, currencies, paymentTerms } from "./lookups";
```

- [ ] **Step 2: Rewrite `orderCheckouts` table**

Replace the entire `orderCheckouts` definition:

```typescript
export const orderCheckouts = pgTable(
  "order_checkouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    orderNumber: integer("order_number").notNull(),
    paymentTermId: uuid("payment_term_id")
      .references(() => paymentTerms.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [unique().on(t.userId, t.orderNumber)],
);
```

Note: no `...timestamps` spread — `created_at` is defined manually, no `updated_at`.

- [ ] **Step 3: Rewrite `orders` table**

Replace the entire `orders` definition:

```typescript
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    checkoutId: uuid("checkout_id")
      .references(() => orderCheckouts.id)
      .notNull(),
    orderNumber: integer("order_number").notNull(),
    paymentTermId: uuid("payment_term_id")
      .references(() => paymentTerms.id)
      .notNull(),
    currentStatus: uuid("current_status").references(() => orderEventTypes.id),
    estimatedDelivery: date("estimated_delivery").notNull(),
    deliveryAddressId: uuid("delivery_address_id")
      .references(() => addresses.id)
      .notNull(),
    shippingCost: numeric("shipping_cost").notNull().default("0"),
    vatAmount: numeric("vat_amount").notNull().default("0"),
    finalPriceUsd: numeric("final_price_usd").notNull(),
    canTrack: boolean("can_track").notNull().default(false),
    canPayInvoice: boolean("can_pay_invoice").notNull().default(false),
    ...timestamps,
  },
  (t) => [unique().on(t.checkoutId, t.orderNumber)],
);
```

Key changes: `orderNumber` is now `integer`, `deletedAt` removed, `paymentTermId` added, composite unique constraint added.

- [ ] **Step 4: Update `orderEvents` table**

Remove `message` and `description` columns. Replace the definition:

```typescript
export const orderEvents = pgTable("order_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .references(() => orders.id)
    .notNull(),
  eventTypeId: uuid("event_type_id")
    .references(() => orderEventTypes.id)
    .notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
});
```

- [ ] **Step 5: Update relations**

Add `paymentTerm` relation to `orderCheckoutsRelations`:

```typescript
export const orderCheckoutsRelations = relations(
  orderCheckouts,
  ({ one, many }) => ({
    user: one(users, {
      fields: [orderCheckouts.userId],
      references: [users.id],
    }),
    paymentTerm: one(paymentTerms, {
      fields: [orderCheckouts.paymentTermId],
      references: [paymentTerms.id],
    }),
    orders: many(orders),
  }),
);
```

Add `paymentTerm` relation to `ordersRelations`:

```typescript
export const ordersRelations = relations(orders, ({ one, many }) => ({
  checkout: one(orderCheckouts, {
    fields: [orders.checkoutId],
    references: [orderCheckouts.id],
  }),
  paymentTerm: one(paymentTerms, {
    fields: [orders.paymentTermId],
    references: [paymentTerms.id],
  }),
  deliveryAddress: one(addresses, {
    fields: [orders.deliveryAddressId],
    references: [addresses.id],
  }),
  currentStatusRef: one(orderEventTypes, {
    fields: [orders.currentStatus],
    references: [orderEventTypes.id],
  }),
  products: many(orderProducts),
  events: many(orderEvents),
  exchangeRates: many(orderExchangeRates),
}));
```

No changes to `orderProductsRelations`, `orderEventsRelations`, or `orderExchangeRatesRelations`.

- [ ] **Step 6: Commit**

```bash
git add db/schema/orders.ts
git commit -m "feat(db): refine order_checkouts, orders, and order_events schema"
```

---

### Task 4: Squash migrations and add triggers

**Files:**
- Delete: all files in `supabase/migrations/`
- Create: new migration via `npm run db:generate`
- Modify: the generated migration file (append triggers)

- [ ] **Step 1: Delete existing migrations**

```bash
rm supabase/migrations/*.sql
```

- [ ] **Step 2: Generate fresh migration**

```bash
npm run db:generate
```

This produces a single migration from the current schema state.

- [ ] **Step 3: Append triggers to the generated migration**

Open the newly generated migration file and append the following at the end:

```sql
-- Trigger: auto-assign per-user checkout order number
CREATE FUNCTION assign_checkout_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := COALESCE(
    (SELECT MAX(order_number) FROM order_checkouts WHERE user_id = NEW.user_id),
    0
  ) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_checkout_order_number
BEFORE INSERT ON order_checkouts
FOR EACH ROW
EXECUTE FUNCTION assign_checkout_order_number();

-- Trigger: auto-assign positional order number within checkout
CREATE FUNCTION assign_order_item_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := COALESCE(
    (SELECT MAX(order_number) FROM orders WHERE checkout_id = NEW.checkout_id),
    0
  ) + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_item_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION assign_order_item_number();

-- Trigger: auto-update orders.current_status on new order event
CREATE FUNCTION update_order_current_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET current_status = (
    SELECT event_type_id
    FROM order_events
    WHERE order_id = NEW.order_id
    ORDER BY occurred_at DESC
    LIMIT 1
  )
  WHERE id = NEW.order_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_event_status
AFTER INSERT ON order_events
FOR EACH ROW
EXECUTE FUNCTION update_order_current_status();

-- Trigger: auto-update invoices.current_status on new ledger entry
-- IMPORTANT: Copy this trigger verbatim from the existing migration. Do not rewrite.
CREATE FUNCTION update_invoice_current_status()
RETURNS TRIGGER AS $$
DECLARE
  total_charges numeric;
  total_payments numeric;
BEGIN
  SELECT COALESCE(SUM(le.amount_usd), 0) INTO total_charges
  FROM ledger_entries le
  JOIN ledger_entry_types lt ON le.ledger_entry_type_id = lt.id
  WHERE le.invoice_id = NEW.invoice_id
    AND lt.value IN ('order_charge', 'fine');

  SELECT COALESCE(SUM(le.amount_usd), 0) INTO total_payments
  FROM ledger_entries le
  JOIN ledger_entry_types lt ON le.ledger_entry_type_id = lt.id
  WHERE le.invoice_id = NEW.invoice_id
    AND lt.value IN ('payment', 'credit', 'reimbursement');

  UPDATE invoices
  SET current_status = (
    CASE
      WHEN total_payments >= total_charges THEN (SELECT id FROM invoice_statuses WHERE value = 'paid')
      WHEN total_payments > 0 THEN (SELECT id FROM invoice_statuses WHERE value = 'partially_paid')
      ELSE (SELECT id FROM invoice_statuses WHERE value = 'issued')
    END
  )
  WHERE id = NEW.invoice_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ledger_entry_status
AFTER INSERT ON ledger_entries
FOR EACH ROW
EXECUTE FUNCTION update_invoice_current_status();

-- Partial indexes (diamond PLP performance)
CREATE INDEX idx_diamonds_natural_carat ON diamonds (carat) WHERE lab_grown = false;
CREATE INDEX idx_diamonds_labgrown_carat ON diamonds (carat) WHERE lab_grown = true;
CREATE INDEX idx_diamonds_natural_price ON diamonds (price_per_carat_usd) WHERE lab_grown = false;
CREATE INDEX idx_diamonds_labgrown_price ON diamonds (price_per_carat_usd) WHERE lab_grown = true;

-- Foreign key indexes
CREATE INDEX idx_products_supplier ON products (supplier_id);
CREATE INDEX idx_products_category ON products (product_category_id);
CREATE INDEX idx_diamonds_product ON diamonds (product_id);
CREATE INDEX idx_gemstones_product ON gemstones (product_id);
CREATE INDEX idx_melee_product ON melee_lots (product_id);
CREATE INDEX idx_jewelry_product ON jewelry (product_id);
CREATE INDEX idx_orders_checkout ON orders (checkout_id);
CREATE INDEX idx_orders_status ON orders (current_status);
CREATE INDEX idx_order_products_order ON order_products (order_id);
CREATE INDEX idx_order_events_order ON order_events (order_id);
CREATE INDEX idx_invoices_user ON invoices (user_id);
CREATE INDEX idx_ledger_entries_invoice ON ledger_entries (invoice_id);
CREATE INDEX idx_cart_items_user ON cart_items (user_id);
CREATE INDEX idx_shortlist_items_shortlist ON shortlist_items (shortlist_id);

-- Search indexes
CREATE INDEX idx_products_description_fts ON products USING GIN(to_tsvector('english', description));
CREATE INDEX idx_certifications_number ON certifications (certificate_number);
```

Note: The product type index changed from `idx_products_type ON products (product_type)` to `idx_products_category ON products (product_category_id)`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/
git commit -m "refactor(db): squash migrations with new triggers"
```

---

### Task 5: Update seed data

**Files:**
- Modify: `supabase/seed.sql`

This is a large task due to the volume of data. Changes are applied in order within the seed file.

- [ ] **Step 1: Add `payment_terms` seed data**

In section 1 (LOOKUP TABLES), after the existing lookup inserts, add:

```sql
--
-- Data for Name: payment_terms; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.payment_terms VALUES ('a1000024-0001-4000-8000-000000000001', 'advance_payment', 1);
INSERT INTO public.payment_terms VALUES ('a1000024-0001-4000-8000-000000000002', 'pay_in_3_days', 2);
INSERT INTO public.payment_terms VALUES ('a1000024-0001-4000-8000-000000000003', 'pay_in_30_days', 3);
INSERT INTO public.payment_terms VALUES ('a1000024-0001-4000-8000-000000000004', 'pay_in_60_days', 4);
```

- [ ] **Step 2: Add `product_categories` seed data**

```sql
--
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.product_categories VALUES ('a1000025-0001-4000-8000-000000000001', 'natural_diamond', 1);
INSERT INTO public.product_categories VALUES ('a1000025-0001-4000-8000-000000000002', 'lab_grown_diamond', 2);
INSERT INTO public.product_categories VALUES ('a1000025-0001-4000-8000-000000000003', 'gemstone', 3);
INSERT INTO public.product_categories VALUES ('a1000025-0001-4000-8000-000000000004', 'natural_melee', 4);
INSERT INTO public.product_categories VALUES ('a1000025-0001-4000-8000-000000000005', 'lab_grown_melee', 5);
INSERT INTO public.product_categories VALUES ('a1000025-0001-4000-8000-000000000006', 'engagement_ring', 6);
```

- [ ] **Step 3: Update `products` seed — replace `product_type` enum with `product_category_id`**

The column position changes. Update the column comment and every INSERT to replace the enum string with the matching `product_category_id` UUID:

- `'diamond'` (natural) → `'a1000025-0001-4000-8000-000000000001'`
- `'diamond'` (lab-grown) → `'a1000025-0001-4000-8000-000000000002'`
- `'gemstone'` → `'a1000025-0001-4000-8000-000000000003'`
- `'melee'` (natural) → `'a1000025-0001-4000-8000-000000000004'`
- `'melee'` (lab-grown) → `'a1000025-0001-4000-8000-000000000005'`
- `'jewelry'` → `'a1000025-0001-4000-8000-000000000006'`

Update the column header comment:
```sql
-- Columns: id, supplier_id, stock_id, product_category_id, price_usd, description, is_active, created_at, updated_at, deleted_at
```

For each product INSERT, replace the 4th positional value (the enum string) with the appropriate UUID.

- [ ] **Step 4: Update `order_checkouts` seed**

Rewrite all INSERT statements. New column list: `(id, user_id, payment_term_id, created_at)`. Omit `order_number` (trigger assigns it), `order_date`, and `updated_at`.

**Critical:** Group by user_id and order chronologically within each user so triggers assign numbers in the right sequence.

User `...0001` (buyer 1) has checkouts `...0003` and `...0006`:
```sql
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at)
VALUES ('c1000010-0001-4000-8000-000000000006', 'b1000001-0001-4000-8000-000000000001', 'a1000024-0001-4000-8000-000000000003', '2025-03-01 10:00:00+00');
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at)
VALUES ('c1000010-0001-4000-8000-000000000003', 'b1000001-0001-4000-8000-000000000001', 'a1000024-0001-4000-8000-000000000003', '2025-03-18 11:00:00+00');
```

User `...0002` (buyer 2) has checkouts `...0001`, `...0002`, `...0004`, `...0005`, `...0007`, `...0008`:
```sql
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at)
VALUES ('c1000010-0001-4000-8000-000000000005', 'b1000001-0001-4000-8000-000000000002', 'a1000024-0001-4000-8000-000000000002', '2025-03-05 09:30:00+00');
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at)
VALUES ('c1000010-0001-4000-8000-000000000008', 'b1000001-0001-4000-8000-000000000002', 'a1000024-0001-4000-8000-000000000004', '2025-03-10 08:45:00+00');
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at)
VALUES ('c1000010-0001-4000-8000-000000000004', 'b1000001-0001-4000-8000-000000000002', 'a1000024-0001-4000-8000-000000000001', '2025-03-10 16:12:00+00');
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at)
VALUES ('c1000010-0001-4000-8000-000000000002', 'b1000001-0001-4000-8000-000000000002', 'a1000024-0001-4000-8000-000000000003', '2025-03-20 14:22:00+00');
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at)
VALUES ('c1000010-0001-4000-8000-000000000007', 'b1000001-0001-4000-8000-000000000002', 'a1000024-0001-4000-8000-000000000003', '2025-03-20 17:30:00+00');
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at)
VALUES ('c1000010-0001-4000-8000-000000000001', 'b1000001-0001-4000-8000-000000000002', 'a1000024-0001-4000-8000-000000000002', '2025-03-24 13:32:00+00');
```

User `...0003` (buyer 3) has checkout `...0009`:
```sql
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at)
VALUES ('c1000010-0001-4000-8000-000000000009', 'b1000001-0001-4000-8000-000000000003', 'a1000024-0001-4000-8000-000000000003', '2025-03-18 09:15:00+00');
```

- [ ] **Step 5: Update `orders` seed**

Rewrite all INSERT statements. New column list: `(id, checkout_id, payment_term_id, estimated_delivery, delivery_address_id, shipping_cost, vat_amount, final_price_usd, can_track, can_pay_invoice, created_at, updated_at)`. Omit `order_number` (trigger assigns it) and `deleted_at`. Add `payment_term_id` matching the parent checkout's term.

Group by checkout_id (each checkout currently has one order, so ordering within checkout is trivial).

Each order gets the same `payment_term_id` as its parent checkout. Refer to the checkout inserts above to match.

- [ ] **Step 6: Add engagement ring order seed data**

Add a new checkout for user `...0002` (add it at the end of that user's chronologically-ordered checkouts — or add a new one with a later date):

```sql
-- Engagement ring checkout
INSERT INTO public.order_checkouts (id, user_id, payment_term_id, created_at)
VALUES ('c1000010-0001-4000-8000-000000000010', 'b1000001-0001-4000-8000-000000000002', 'a1000024-0001-4000-8000-000000000003', '2025-03-25 10:00:00+00');
```

Add the order:
```sql
INSERT INTO public.orders (id, checkout_id, payment_term_id, estimated_delivery, delivery_address_id, shipping_cost, vat_amount, final_price_usd, can_track, can_pay_invoice, created_at, updated_at)
VALUES ('6f72642d-3031-3100-0000-000000000000', 'c1000010-0001-4000-8000-000000000010', 'a1000024-0001-4000-8000-000000000003', '2025-04-10', 'b3000001-0001-4000-8000-000000000002', 75, 1250, 7500, false, false, '2025-03-25 10:00:00+00', '2025-03-25 10:00:00+00');
```

Add two `order_products` rows — mount and stone. Use an existing jewelry product ID for the mount and an existing diamond product ID for the stone (pick from the seed data):

```sql
-- Mount component
INSERT INTO public.order_products VALUES ('c2000010-0001-4000-8000-000000000010', '6f72642d-3031-3100-0000-000000000000', '6a776c30-312d-6131-6232-2d633364342d', '{"productType": "engagement_ring", "description": "Solitaire Engagement Ring", "subtitle": "14K White Gold, Cathedral Setting", "image": "https://nivodabackend.s3.amazonaws.com/engagement-ring-1.webp", "metalType": "White Gold", "metalColor": "White", "metalQuality": "14K", "bandStyle": "Cathedral", "ringSize": "6.5"}', 2500);

-- Stone component
INSERT INTO public.order_products VALUES ('c2000010-0001-4000-8000-000000000011', '6f72642d-3031-3100-0000-000000000000', '64303031-2d61-3162-322d-633364342d65', '{"productType": "natural_diamond", "description": "1.01ct Round D IF", "subtitle": "GIA Certified", "image": "https://nivodabackend.s3.amazonaws.com/diamond-1.webp", "shape": "Round", "carat": 1.01, "color": "D", "clarity": "IF", "cut": "Excellent", "polish": "Excellent", "symmetry": "Excellent", "fluorescence": "None", "lab": "GIA", "certificate": "2231546001", "measurements": "6.45 x 6.47 x 3.98mm", "table": "57%", "depth": "61.6%"}', 5000);
```

Add events for the engagement ring order:
```sql
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000024', '6f72642d-3031-3100-0000-000000000000', 'a1000021-0001-4000-8000-000000000001', '2025-03-25 10:00:00+00');
INSERT INTO public.order_events VALUES ('c2000020-0001-4000-8000-000000000025', '6f72642d-3031-3100-0000-000000000000', 'a1000021-0001-4000-8000-000000000002', '2025-03-25 14:30:00+00');
```

- [ ] **Step 7: Update existing `order_events` seed — remove `message` and `description` columns**

The order_events INSERTs currently have 6 positional values: `(id, order_id, event_type_id, message, description, occurred_at)`. Remove the `message` (4th) and `description` (5th) values from every INSERT, leaving 4: `(id, order_id, event_type_id, occurred_at)`.

- [ ] **Step 8: Update existing `order_products` snapshots**

Add `productType`, `description`, `subtitle`, and `image` fields to all existing snapshot JSON objects so the frontend can render them properly. Use the product category value that matches each product. For example, a diamond order product should have `"productType": "natural_diamond"` in its snapshot.

- [ ] **Step 9: Commit**

```bash
git add supabase/seed.sql
git commit -m "feat(db): update seed data for order schema refinement"
```

---

### Task 6: Verify database reset

- [ ] **Step 1: Run db:reset**

```bash
npm run db:reset
```

Expected: SUCCESS — all migrations apply cleanly, triggers are created, seed data inserts without errors, trigger-assigned order numbers are correct.

- [ ] **Step 2: Verify via Drizzle Studio (optional)**

```bash
npm run db:studio
```

Check: `order_checkouts` has integer `order_number` values assigned per-user. `orders` has integer `order_number` values. `order_events` has no `message`/`description` columns. `products` has `product_category_id` instead of `product_type`.

---

### Task 7: Update orders API layer + route handlers + frontend (co-dependent)

**Files:**
- Modify: `lib/api/orders.ts`
- Modify: `app/api/v1/orders/[id]/route.ts`
- Rename: `app/buyer/orders/[slug]/` → `app/buyer/orders/[id]/`
- Modify: `app/buyer/orders/[id]/page.tsx` (after rename)
- Rename: `app/buyer/orders/[id]/loading.tsx` (moved by git mv — no code changes needed, it has no params)
- Modify: `app/buyer/orders/page.tsx`

Per the spec's implementation ordering note, these must all be updated together.

- [ ] **Step 1: Update `lib/api/orders.ts` types**

Replace the `OrderEvent` interface:
```typescript
export interface OrderEvent {
  id: string;
  eventType: { id: string; value: string };
  occurredAt: string;
}
```

Update the `Order` type:
- Remove `checkoutOrderParentNumber: string`
- Change `orderDate: string` — keep it, but it will now be derived from `checkout.createdAt`
- Add `paymentTerm: { id: string; value: string }`

```typescript
export type Order = {
  id: string;
  orderNumber: string;
  orderDate: string;
  paymentTerm: { id: string; value: string };
  currentStatus: { id: string; value: string } | null;
  estimatedDelivery: string;
  deliveryAddress: {
    name: string;
    street: string;
    city: string;
    state: string | null;
    postalCode: string | null;
    country: string;
  };
  shippingCost: number;
  vatAmount: number;
  finalPriceUsd: number;
  canTrack: boolean;
  canPayInvoice: boolean;
  products: OrderProduct[];
  events: OrderEvent[];
  exchangeRates: OrderExchangeRate[];
};
```

- [ ] **Step 2: Update `ORDER_WITH` relation config**

Add `paymentTerm: true` and update events to not include message/description:

```typescript
const ORDER_WITH = {
  currentStatusRef: true,
  paymentTerm: true,
  deliveryAddress: { with: { country: true } },
  products: true,
  events: {
    with: { eventType: true },
    orderBy: (
      e: { occurredAt: Parameters<typeof import("drizzle-orm").desc>[0] },
      { desc }: { desc: typeof import("drizzle-orm").desc },
    ) => [desc(e.occurredAt)],
  },
  exchangeRates: { with: { currency: true } },
} as const;
```

- [ ] **Step 3: Update `mapRow` function**

The function signature changes — it now receives the checkout's order number and created_at to compose the display string:

```typescript
function mapRow(
  row: OrderRow,
  checkoutOrderNumber: number,
  checkoutCreatedAt: Date,
): Order {
  const addr = row.deliveryAddress;
  const cityStr = addr
    ? [addr.postalCode, addr.city].filter(Boolean).join(" ")
    : "";

  return {
    id: row.id,
    // Note: display format is a pragmatic addition — the API must return a string, so we
    // compose a basic format here. The spec defers a final formatting formula to a future pass.
    orderNumber: `${String(checkoutOrderNumber).padStart(4, "0")}-${row.orderNumber}`,
    orderDate: checkoutCreatedAt.toISOString().split("T")[0],
    paymentTerm: row.paymentTerm
      ? { id: row.paymentTerm.id, value: row.paymentTerm.value }
      : { id: "", value: "Unknown" },
    currentStatus: row.currentStatusRef
      ? { id: row.currentStatusRef.id, value: row.currentStatusRef.value }
      : null,
    estimatedDelivery: row.estimatedDelivery,
    deliveryAddress: {
      name: addr?.name ?? "",
      street: addr?.street ?? "",
      city: cityStr,
      state: addr?.state ?? null,
      postalCode: addr?.postalCode ?? null,
      country: addr?.country?.value ?? "",
    },
    shippingCost: Number(row.shippingCost),
    vatAmount: Number(row.vatAmount),
    finalPriceUsd: Number(row.finalPriceUsd),
    canTrack: row.canTrack,
    canPayInvoice: row.canPayInvoice,
    products: (row.products ?? []).map((p) => ({
      id: p.id,
      productId: p.productId,
      snapshot: (p.snapshot ?? {}) as Record<string, unknown>,
      priceUsd: Number(p.priceUsd),
    })),
    events: (row.events ?? []).map((e) => ({
      id: e.id,
      eventType: {
        id: e.eventType?.id ?? "",
        value: e.eventType?.value ?? "Unknown",
      },
      occurredAt: e.occurredAt.toISOString(),
    })),
    exchangeRates: (row.exchangeRates ?? []).map((er) => ({
      currency: {
        id: er.currency?.id ?? "",
        value: er.currency?.value ?? "Unknown",
      },
      rate: Number(er.rate),
    })),
  };
}
```

- [ ] **Step 4: Update `fetchOrderList`**

Remove the `isNull(orders.deletedAt)` filter. Update the flattening loop to pass checkout-level data:

```typescript
export async function fetchOrderList(
  userId: string,
  options: PaginatedOptions,
): Promise<PaginatedResult<Order>> {
  const checkouts = await db.query.orderCheckouts.findMany({
    where: eq(orderCheckouts.userId, userId),
    with: {
      orders: {
        with: ORDER_WITH,
      },
    },
  });

  const allOrders: Order[] = [];
  for (const checkout of checkouts) {
    for (const order of checkout.orders) {
      allOrders.push(
        mapRow(order, checkout.orderNumber, checkout.createdAt),
      );
    }
  }

  return paginate(allOrders, options);
}
```

- [ ] **Step 5: Update `fetchOrder`**

Change from text order_number lookup to UUID id lookup. Remove `isNull(orders.deletedAt)`:

```typescript
export async function fetchOrder(
  orderId: string,
  userId: string,
): Promise<Order | undefined> {
  const row = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      ...ORDER_WITH,
      checkout: true,
    },
  });

  if (!row) return undefined;
  if (row.checkout.userId !== userId) return undefined;

  return mapRow(
    row as unknown as OrderRow,
    row.checkout.orderNumber,
    row.checkout.createdAt,
  );
}
```

- [ ] **Step 6: Clean up imports in orders.ts**

Remove `and` and `isNull` from the drizzle-orm import — both are no longer used after removing the `deletedAt` filter. Remove any other unused schema imports.

- [ ] **Step 7: Rename `app/buyer/orders/[slug]/` to `app/buyer/orders/[id]/`**

```bash
git mv "app/buyer/orders/[slug]" "app/buyer/orders/[id]"
```

- [ ] **Step 8: Update order detail page params**

In `app/buyer/orders/[id]/page.tsx`, change the params type:

```typescript
export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  const order = await fetchOrder(id, user.id);
```

- [ ] **Step 9: Fix PROGRESS_STEPS keys**

Replace the `PROGRESS_STEPS` constant with values matching the database:

```typescript
const PROGRESS_STEPS = [
  { key: "requested", label: "Requested", icon: IconChecklist },
  { key: "confirmed", label: "Confirmed", icon: IconShoppingCart },
  { key: "shipped", label: "Shipped", icon: IconPackage },
  { key: "out_for_delivery", label: "Out for delivery", icon: IconTruck },
  { key: "delivered", label: "Delivered", icon: IconCheck },
] as const;
```

- [ ] **Step 10: Add event type label mapping utility**

Add a general-purpose snake_case-to-label utility at the top of the file (or in `lib/utils.ts` if preferred). This is used for both event type labels and product category labels:

```typescript
function formatLabel(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
```

- [ ] **Step 11: Update DetailedUpdates component**

Remove `event.message` and `event.description` rendering. Use `formatLabel` for the label:

```typescript
<span className="font-semibold text-foreground">
  {formatLabel(event.eventType.value)}
</span>
```

Remove the two conditional blocks that render `event.message` and `event.description`.

- [ ] **Step 12: Update status message derivation**

Replace the `statusMessage` line:

```typescript
const statusMessage = latestEvent
  ? formatLabel(latestEvent.eventType.value)
  : (order.currentStatus?.value ?? "");
```

- [ ] **Step 13: Update OrderProductDetails for engagement rings**

Replace the component to handle multiple products (mount + stone):

```typescript
function OrderProductDetails({ order }: { order: Order }) {
  if (order.products.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {order.products.map((product) => {
        const snapshot = (product.snapshot ?? {}) as Record<string, unknown>;
        const productType = (snapshot.productType as string) ?? "";
        const sectionLabel =
          order.products.length > 1 ? productType : undefined;

        const specKeys = [
          "shape", "carat", "color", "clarity", "cut", "polish", "symmetry",
          "fluorescence", "measurements", "table", "depth", "ratio",
          "metalType", "metalColor", "metalQuality", "bandStyle", "ringSize",
        ];

        const rows: [string, string][] = [];
        for (const key of specKeys) {
          if (snapshot[key] !== undefined && snapshot[key] !== null) {
            const label = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (s) => s.toUpperCase());
            rows.push([label, String(snapshot[key])]);
          }
        }

        if (rows.length === 0) return null;

        const mid = Math.ceil(rows.length / 2);
        const leftRows = rows.slice(0, mid);
        const rightRows = rows.slice(mid);

        return (
          <div key={product.id} className="flex flex-col gap-3">
            {sectionLabel && (
              <h4 className="text-sm font-medium text-muted-foreground">
                {formatLabel(sectionLabel)}
              </h4>
            )}
            <div className="flex gap-10">
              <div className="flex flex-1 flex-col">
                {leftRows.map(([label, value]) => (
                  <div key={label} className="flex items-center gap-4 py-1 text-sm">
                    <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
                    <span className="text-foreground">{value}</span>
                  </div>
                ))}
              </div>
              {rightRows.length > 0 && (
                <div className="flex flex-1 flex-col">
                  {rightRows.map(([label, value]) => (
                    <div key={label} className="flex items-center gap-4 py-1 text-sm">
                      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
                      <span className="text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 14: Update order list page — row links use UUID**

In `app/buyer/orders/page.tsx`, change the link in `OrderRow`:

```typescript
<Link href={`/buyer/orders/${order.id}`} className="block">
```

- [ ] **Step 15: Run typecheck**

Run: `npm run typecheck`
Expected: FAIL — only the 7 product-type API files should still have errors (Task 8 fixes those).

- [ ] **Step 16: Commit**

```bash
git add lib/api/orders.ts app/api/v1/orders/ app/buyer/orders/
git commit -m "feat: update orders API layer, route handlers, and frontend for new schema"
```

---

### Task 8: Migrate product type references across API layer

**Files:**
- Modify: `lib/api/diamonds.ts`
- Modify: `lib/api/gemstones.ts`
- Modify: `lib/api/melee.ts`
- Modify: `lib/api/jewelry/engagement-rings.ts`
- Modify: `lib/api/search.ts`
- Modify: `lib/api/shortlists.ts`
- Modify: `lib/api/cart.ts`

- [ ] **Step 1: Apply the filtering pattern**

**Pattern:** Each API file uses Drizzle's relational query API. Add the `productCategory` relation to the `with` clause to eagerly load it, then filter by `productCategories.value` in the `where` clause using a sub-select.

For files that use the SQL-like query builder (e.g., `db.select().from(products)`), join `productCategories` and filter on `productCategories.value`.

For files that use the relational API (e.g., `db.query.products.findMany()`), use a sub-select in the where:
```typescript
import { productCategories } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

// Single category:
where: eq(products.productCategoryId,
  db.select({ id: productCategories.id }).from(productCategories).where(eq(productCategories.value, "gemstone"))
)

// Multiple categories (e.g., diamonds = natural + lab-grown):
where: inArray(products.productCategoryId,
  db.select({ id: productCategories.id }).from(productCategories).where(inArray(productCategories.value, ["natural_diamond", "lab_grown_diamond"]))
)
```

Apply this pattern consistently across all 7 files below.

- [ ] **Step 2: Update `lib/api/diamonds.ts`**

Replace `eq(products.productType, "diamond")` with a filter that matches both `natural_diamond` and `lab_grown_diamond` via the `productCategories` relation. Add the `productCategories` import from `@/db/schema`.

There are two locations (lines ~60 and ~213 in the current file).

- [ ] **Step 3: Update `lib/api/gemstones.ts`**

Replace `eq(products.productType, "gemstone")` → filter on `productCategories.value` being `"gemstone"`.

Two locations (lines ~57 and ~199).

- [ ] **Step 4: Update `lib/api/melee.ts`**

Replace `eq(products.productType, "melee")` → filter matching both `"natural_melee"` and `"lab_grown_melee"`.

Two locations (lines ~50 and ~180).

- [ ] **Step 5: Update `lib/api/jewelry/engagement-rings.ts`**

Replace `eq(products.productType, "jewelry")` → filter on `"engagement_ring"`.

One location (line ~251).

- [ ] **Step 6: Update `lib/api/search.ts`**

Replace the `PRODUCT_TYPE_LABELS` map and all references to `products.productType` / `row.productType` with the `productCategories` relation. The search queries need to join `productCategories` and select `productCategories.value` instead of `products.productType`.

New labels map:
```typescript
const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  natural_diamond: "Natural Diamond",
  lab_grown_diamond: "Lab Grown Diamond",
  gemstone: "Gemstone",
  natural_melee: "Natural Melee",
  lab_grown_melee: "Lab Grown Melee",
  engagement_ring: "Engagement Ring",
};
```

- [ ] **Step 7: Update `lib/api/shortlists.ts`**

Replace `item.product.productType` with `item.product.productCategory?.value ?? ""`. Ensure the shortlists query includes the `productCategory` relation on the product.

Two locations (lines ~42 and ~90).

- [ ] **Step 8: Update `lib/api/cart.ts`**

Same pattern as shortlists: replace `item.product.productType` with `item.product.productCategory?.value ?? ""`.

One location (line ~41).

- [ ] **Step 9: Run typecheck**

Run: `npm run typecheck`
Expected: PASS — all product type references should now resolve.

- [ ] **Step 10: Commit**

```bash
git add lib/api/
git commit -m "refactor(api): migrate product type filtering from enum to product_categories FK"
```

---

### Task 9: Format, lint, typecheck, build

- [ ] **Step 1: Format all files**

```bash
npm run format
```

- [ ] **Step 2: Lint**

```bash
npm run lint
```

Fix any lint errors that arise.

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Expected: PASS

- [ ] **Step 4: Build**

```bash
npm run build
```

Expected: PASS — the app compiles without errors.

- [ ] **Step 5: Commit any formatting/lint fixes**

```bash
git add -A
git commit -m "fix: resolve lint and formatting issues"
```

---

### Task 10: Update documentation

**Files:**
- Modify: `docs/api/README.md`
- Modify: `CLAUDE.md` (if needed)

- [ ] **Step 1: Update API docs**

In `docs/api/README.md`, update:
- Order detail endpoint: `GET /api/v1/orders/[id]` now takes a UUID, not an order number
- Order response shape: add `paymentTerm` field, remove `checkoutOrderParentNumber`, update `orderNumber` description
- Order event response: remove `message` and `description` fields
- Product type: update all references from the enum (`diamond`, `gemstone`, `melee`, `jewelry`) to the new category values (`natural_diamond`, `lab_grown_diamond`, `gemstone`, `natural_melee`, `lab_grown_melee`, `engagement_ring`)
- Search suggest/full: update `productType` references to use new category values

- [ ] **Step 2: Update CLAUDE.md if needed**

Review `CLAUDE.md` for any references to:
- `product_type` enum → update to `product_categories` lookup table
- Order number format → note that numbers are now integers
- Any file structure changes (the `[slug]` → `[id]` rename)

- [ ] **Step 3: Commit**

```bash
git add docs/ CLAUDE.md
git commit -m "docs: update API docs and CLAUDE.md for order schema refinement"
```

---

### Task 11: Final verification

- [ ] **Step 1: Full database reset**

```bash
npm run db:reset
```

Expected: SUCCESS

- [ ] **Step 2: Start dev server and smoke test**

```bash
npm run dev
```

Manually verify:
- `/buyer/orders` — list page loads, rows link to UUID-based URLs
- `/buyer/orders/[uuid]` — detail page loads, progress tracker shows correct steps, event timeline shows formatted labels (no raw `message` or `description`), engagement ring order shows mount + stone sections
- No console errors

- [ ] **Step 3: Production build**

```bash
npm run build
```

Expected: PASS
