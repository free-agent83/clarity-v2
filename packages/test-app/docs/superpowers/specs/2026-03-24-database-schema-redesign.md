# Database Schema Redesign

## Overview

Complete restructuring of the Minivoda database schema to fix data disconnects, unify product representations, redesign orders as a two-level model, introduce a ledger-based invoice system, and add named shortlists. All prices are USD; currency conversion is handled by the frontend in real time.

**Database:** PostgreSQL (Supabase), queried via Drizzle ORM.

---

## 1. Lookup Tables

All lookup tables share the same structure: `id` (UUID PK), `value` (text), `sort_order` (integer). Tables specific to one product category are prefixed with that category name. No `lk_` or `_lookup` prefix — the naming convention is self-documenting.

### Diamond-specific

| Table | Renamed from |
|---|---|
| `diamond_colors` | `diamond_colors` (unchanged) |
| `diamond_clarity_grades` | `clarity_grades` |
| `diamond_cut_grades` | `cut_grades` |
| `diamond_polish_grades` | `polish_grades` |
| `diamond_symmetry_grades` | `symmetry_grades` |
| `diamond_fluorescence_levels` | `fluorescence_levels` |

### Gemstone-specific

| Table | Renamed from |
|---|---|
| `gemstone_types` | `gemstone_types` (unchanged) |
| `gemstone_cut_grades` | **new** |
| `gemstone_treatments` | `treatments` |
| `gemstone_origins` | `origins` |

### Shared across product types

| Table | Used by |
|---|---|
| `shapes` | Diamonds, gemstones, melee, jewelry |
| `certification_labs` | Diamonds, gemstones |

### Jewelry

| Table | Notes |
|---|---|
| `jewelry_types` | Has additional `slug` column. Discriminates subcategories (engagement rings, tennis bracelets, etc.) |
| `metal_types` | Shared across all jewelry subcategories |
| `metal_qualities` | Shared across all jewelry subcategories |
| `metal_colors` | Shared across all jewelry subcategories |
| `band_styles` | Shared across all jewelry subcategories |

### Global

| Table | Purpose |
|---|---|
| `payment_methods` | Used by invoices |
| `countries` | Addresses, suppliers |
| `currencies` | User preferences, exchange rates |
| `order_event_types` | Order tracking event types |
| `invoice_statuses` | Invoice status values |
| `ledger_entry_types` | Ledger entry types (order_charge, payment, fine, credit, reimbursement, etc.) |

### Removed

- `image_type` enum — image purpose addressed at filename level, not DB level.
- `order_status` enum — replaced by `order_event_types` lookup.
- `order_progress_step` enum — replaced by `order_event_types` lookup.
- `order_item_type` enum — replaced by `product_type` on the products table.

---

## 2. Users, Addresses & Suppliers

Minimal changes to the current structure.

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `auth_user_id` | UUID, unique | Supabase Auth link |
| `email` | text, not null | |
| `name` | text, not null | |
| `company_name` | text, nullable | |
| `phone` | text, nullable | |
| `currency_id` | UUID FK → currencies | User's preferred currency |
| `verified` | boolean, default false | **New** |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `deleted_at` | timestamptz, nullable | Soft delete |

### `addresses`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `name` | text, not null | Label (e.g. "Office", "Home") |
| `street` | text, not null | |
| `city` | text, not null | |
| `state` | text, nullable | |
| `postal_code` | text, nullable | |
| `country_id` | UUID FK → countries | |
| `is_default` | boolean, default false | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `deleted_at` | timestamptz, nullable | Soft delete |

### `suppliers`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `name` | text, not null | |
| `code` | text, not null | |
| `country_id` | UUID FK → countries | |
| `email` | text, not null | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `deleted_at` | timestamptz, nullable | Soft delete |

---

## 3. Products Base + Diamonds, Gemstones, Melee

The `products` table is the base entity. Each product type has a detail table linked 1:1. The `product_type` enum discriminates which detail table to join — this is necessary because carts, shortlists, orders, and search all reference `products` and need to know which detail table to query.

### `products`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `supplier_id` | UUID FK → suppliers | |
| `stock_id` | text, not null | Supplier's stock reference |
| `product_type` | enum(`diamond`, `gemstone`, `melee`, `jewelry`) | **Changed** — collapsed from 6 values to 4 |
| `price_usd` | numeric, not null | Catalog price in USD. For jewelry: minimum config price ("starting from") |
| `description` | text, not null | |
| `is_active` | boolean, default true | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `deleted_at` | timestamptz, nullable | Soft delete |

**Removed from products:** `price_per_carat_usd` (moved to diamonds/gemstones), `exchange_rate_eur` (frontend handles conversion).

### `diamonds`

Unified table for natural and lab-grown diamonds. Discriminated by `lab_grown` boolean.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `product_id` | UUID FK → products, unique | 1:1 |
| `lab_grown` | boolean, not null | **New** — replaces product_type discrimination |
| `shape_id` | UUID FK → shapes | |
| `carat` | numeric, not null | |
| `color_id` | UUID FK → diamond_colors | |
| `clarity_id` | UUID FK → diamond_clarity_grades | |
| `cut_id` | UUID FK → diamond_cut_grades | |
| `polish_id` | UUID FK → diamond_polish_grades | |
| `symmetry_id` | UUID FK → diamond_symmetry_grades | |
| `fluorescence_id` | UUID FK → diamond_fluorescence_levels | |
| `price_per_carat_usd` | numeric | **Moved from products** |
| `table_pct` | numeric, not null | |
| `depth_pct` | numeric, not null | |
| `length_mm` | numeric, not null | |
| `width_mm` | numeric, not null | |
| `depth_mm` | numeric, not null | |

**Indexes:**

```sql
CREATE INDEX idx_diamonds_natural_carat ON diamonds (carat) WHERE lab_grown = false;
CREATE INDEX idx_diamonds_labgrown_carat ON diamonds (carat) WHERE lab_grown = true;
CREATE INDEX idx_diamonds_natural_price ON diamonds (price_per_carat_usd) WHERE lab_grown = false;
CREATE INDEX idx_diamonds_labgrown_price ON diamonds (price_per_carat_usd) WHERE lab_grown = true;
```

**Uniqueness constraint:** All diamond items are unique — users cannot order multiple copies. Enforced at application level (quantity always 1 in cart).

### `gemstones`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `product_id` | UUID FK → products, unique | 1:1 |
| `gemstone_type_id` | UUID FK → gemstone_types | |
| `shape_id` | UUID FK → shapes | |
| `carat` | numeric, not null | |
| `color` | text, not null | |
| `clarity` | text, not null | |
| `cut_id` | UUID FK → gemstone_cut_grades | **Changed** — was diamond cut_grades |
| `treatment_id` | UUID FK → gemstone_treatments | |
| `origin_id` | UUID FK → gemstone_origins | |
| `price_per_carat_usd` | numeric | **Moved from products** |
| `length_mm` | numeric, not null | |
| `width_mm` | numeric, not null | |
| `depth_mm` | numeric, not null | |

**Uniqueness constraint:** Same as diamonds — quantity always 1 in cart.

### `melee_lots`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `product_id` | UUID FK → products, unique | 1:1 |
| `lab_grown` | boolean, not null | **New** |
| `shape_id` | UUID FK → shapes | |
| `size_range` | text, not null | |
| `color_range` | text, not null | |
| `clarity_range` | text, not null | |
| `cut_id` | UUID FK → diamond_cut_grades | Uses diamond cut scale |
| `quantity` | integer, not null | |
| `total_carat_weight` | numeric, not null | |

---

## 4. Jewelry

Jewelry uses a base table + subcategory detail tables pattern (same as products → diamonds/gemstones). Each jewelry subcategory has its own shape. Only ~5-6 subcategories expected.

### `jewelry` (base)

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `product_id` | UUID FK → products, unique | 1:1. Name, base price, description come from `products` |
| `sku` | text, not null | Internal SKU |
| `jewelry_type_id` | UUID FK → jewelry_types | Subcategory discriminator |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Removed from jewelry:** `is_labgrown`, `natural_variant_price_usd`, `labgrown_variant_price_usd`, `band_style_id`, `ring_width_mm`, `comments`. Subcategory-specific fields moved to detail tables.

### `jewelry_engagement_rings` (subcategory detail)

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `jewelry_id` | UUID FK → jewelry, unique | 1:1 |
| `band_style_id` | UUID FK → band_styles | |
| `ring_width_mm` | numeric, nullable | |

### `jewelry_tennis_bracelets` (future subcategory example)

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `jewelry_id` | UUID FK → jewelry, unique | 1:1 |
| `length_mm` | numeric, nullable | |

### `jewelry_available_metals` (priced configurations)

Each row is a selectable configuration with its own price. The minimum price across all configurations for a jewelry item becomes the `products.price_usd` ("starting from" price on PLP).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `jewelry_id` | UUID FK → jewelry | |
| `metal_type_id` | UUID FK → metal_types | |
| `metal_color_id` | UUID FK → metal_colors | |
| `metal_quality_id` | UUID FK → metal_qualities | |
| `price_usd` | numeric, not null | Price for this specific metal configuration |

### `jewelry_engagement_ring_compatible_stones` (stone filter rules)

Defines which center stones a ring accepts. The frontend queries diamonds matching these rules when the user is configuring a ring.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `jewelry_id` | UUID FK → jewelry | |
| `shape_id` | UUID FK → shapes | Allowed stone shape |
| `max_carat` | numeric, not null | Maximum carat weight for this shape |

Example: Ring A has two rows — `(Round, 1.0)` and `(Pear, 1.0)` — meaning it accepts round or pear diamonds up to 1ct. Both natural and lab-grown stones are accepted on all rings.

### `jewelry_configuration_images`

Images tied to specific metal type + color combos. A ring in gold looks different from the same ring in platinum.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `jewelry_id` | UUID FK → jewelry | |
| `metal_type_id` | UUID FK → metal_types | |
| `metal_color_id` | UUID FK → metal_colors | |
| `url` | text, not null | Supabase Storage URL |
| `sort_order` | integer, default 0 | |
| `is_thumbnail` | boolean, default false | |

### Removed tables

- `jewelry_mounts` — replaced by `jewelry_available_metals` with pricing.
- `ring_configurations` — replaced by `jewelry_available_metals` + `jewelry_engagement_ring_compatible_stones`.
- `jewelry_available_shapes` — replaced by the more specific `jewelry_engagement_ring_compatible_stones`.

---

## 5. Orders

Two-level model: `order_checkouts` (the basket purchased) → `orders` (individual trackable items the user sees). Users never see the checkout level in the UI.

### `order_checkouts`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `order_parent_number` | text, unique | Shared prefix, e.g. "0001" |
| `order_date` | date, not null | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `orders`

Each row is one trackable order that appears in the user's Orders page. The `order_number` shares the parent's prefix with a suffix (e.g. "0001-1").

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `checkout_id` | UUID FK → order_checkouts | |
| `order_number` | text, unique | e.g. "0001-1" |
| `current_status` | UUID FK → order_event_types | Denormalized, auto-updated by trigger |
| `estimated_delivery` | date, not null | |
| `delivery_address_id` | UUID FK → addresses | |
| `shipping_cost` | numeric | |
| `vat_amount` | numeric | |
| `final_price_usd` | numeric, not null | Immutable snapshot of total at purchase |
| `can_track` | boolean, default false | UI flag |
| `can_pay_invoice` | boolean, default false | UI flag |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `deleted_at` | timestamptz, nullable | Soft delete |

**Removed from orders:** `invoice_number`, `payment_method_id` (payment is an invoice concern), `status` enum, `status_detail`, `status_message`, `final_price_eur`, `approved_by`, `vat_rate`.

### `order_products`

What's physically inside each order. A diamond order has 1 row. An engagement ring order has 2 rows (mount + center stone).

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `order_id` | UUID FK → orders | |
| `product_id` | UUID FK → products | FK for relational queries |
| `snapshot` | JSONB, not null | Frozen specs at time of purchase |
| `price_usd` | numeric, not null | Price at time of purchase |

The `snapshot` captures whatever specs are relevant for that product type (shape, carat, color, metal config, image URL, etc.). The order detail page renders from the snapshot — it never needs to query the product detail tables.

### `order_events`

Replaces `order_progress`, `order_updates`, and status fields. Each event is a tracked moment in the order's lifecycle.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `order_id` | UUID FK → orders | |
| `event_type_id` | UUID FK → order_event_types | |
| `message` | text, not null | Human-readable status message |
| `description` | text, nullable | Optional detail |
| `occurred_at` | timestamptz, not null | When the event happened |

### `order_exchange_rates`

Freezes all currency exchange rates at the moment of purchase.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `order_id` | UUID FK → orders | |
| `currency_id` | UUID FK → currencies | |
| `rate` | numeric, not null | USD → currency rate at purchase time |

### Trigger: `trg_order_event_status`

Automatically updates `orders.current_status` when a new event is inserted.

```sql
CREATE FUNCTION update_order_current_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET current_status = (
    SELECT event_type_id FROM order_events
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
```

### Removed tables

- `order_progress` — replaced by `order_events`.
- `order_updates` — replaced by `order_events`.
- `order_item_details` — replaced by `order_products.snapshot`.
- `order_summaries` — fields moved to `orders` or dropped.
- `order_line_items` — replaced by `order_products`.

---

## 6. Invoices & Ledger

Invoices are independent from orders. Each financial transaction (charges, payments, credits, fines) is a ledger entry tied to an invoice. The ledger replaces a separate invoice events system — every ledger entry is itself an event that updates the invoice status via trigger.

### `invoices`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `invoice_number` | text, unique | |
| `payment_method_id` | UUID FK → payment_methods | |
| `issue_date` | date, not null | |
| `due_date` | date, not null | Typically 30-60 days after issue |
| `total_amount_usd` | numeric, not null | |
| `current_status` | UUID FK → invoice_statuses | Denormalized, auto-updated by trigger |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `ledger_entries`

The platform's financial transaction log. Every charge, payment, credit, fine, and reimbursement is a row here.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `invoice_id` | UUID FK → invoices | |
| `ledger_entry_type_id` | UUID FK → ledger_entry_types | order_charge, payment, fine, credit, reimbursement, etc. |
| `order_id` | UUID FK → orders, nullable | Only for order-related entries |
| `description` | text, not null | Human-readable description |
| `amount_usd` | numeric, not null | Always positive. Entry type determines debit vs credit. |
| `occurred_at` | timestamptz, not null | When the transaction happened |

### `ledger_entry_exchange_rates`

Captures exchange rates at the moment a payment is made. Needed because invoices can be paid weeks after issuance, and exchange rates change. Only relevant for payment-type entries.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `ledger_entry_id` | UUID FK → ledger_entries | |
| `currency_id` | UUID FK → currencies | |
| `rate` | numeric, not null | USD → currency rate at payment time |

### Trigger: `trg_ledger_entry_status`

On insert into `ledger_entries`, sums all entry amounts for the invoice and updates `invoices.current_status`.

The trigger sums charges (order_charge, fine) and payments (payment, credit, reimbursement) separately using the entry type to classify. All `amount_usd` values are positive; the entry type determines whether the amount is a debit or credit.

```sql
CREATE FUNCTION update_invoice_current_status()
RETURNS TRIGGER AS $$
DECLARE
  total_charges numeric;
  total_payments numeric;
BEGIN
  -- Sum charges (order_charge, fine)
  SELECT COALESCE(SUM(le.amount_usd), 0) INTO total_charges
  FROM ledger_entries le
  JOIN ledger_entry_types lt ON le.ledger_entry_type_id = lt.id
  WHERE le.invoice_id = NEW.invoice_id
    AND lt.value IN ('order_charge', 'fine');

  -- Sum payments/credits (payment, credit, reimbursement)
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
```

---

## 7. Commerce (Carts & Shortlists)

### `cart_items`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | **Changed** — was FK to `carts` |
| `product_id` | UUID FK → products | |
| `quantity` | integer, default 1 | Always 1 for diamonds/gemstones/melee (app-level constraint). Can be >1 for jewelry. |
| `added_at` | timestamptz | |

**Removed:** `carts` table — cart is assembled directly from `cart_items` filtered by `user_id`.

### `cart_item_config`

Only exists for configurable jewelry items. 1:1 with `cart_items`.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `cart_item_id` | UUID FK → cart_items, unique | 1:1 link |
| `metal_type_id` | UUID FK → metal_types, nullable | |
| `metal_color_id` | UUID FK → metal_colors, nullable | |
| `metal_quality_id` | UUID FK → metal_qualities, nullable | |
| `center_stone_product_id` | UUID FK → products, nullable | The selected diamond (engagement rings) |
| `ring_size` | numeric, nullable | |
| `bracelet_length` | numeric, nullable | |

### `shortlists`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `name` | text, not null | User-defined name |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### `shortlist_items`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `shortlist_id` | UUID FK → shortlists | **Changed** — was FK to users |
| `product_id` | UUID FK → products | |
| `added_at` | timestamptz | |

---

## 8. Media (Images & Certifications)

### `product_images`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `product_id` | UUID FK → products | |
| `url` | text, not null | Supabase Storage URL |
| `sort_order` | integer, default 0 | |
| `is_thumbnail` | boolean, default false | |

**Removed:** `image_type` enum — purpose addressed at filename level.

### `jewelry_configuration_images`

Images per metal type + color combo. See Section 4.

### `certifications`

Diamonds and gemstones only (application-level constraint). Melee and jewelry do not have certifications.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `product_id` | UUID FK → products, unique | 1:1 |
| `lab_id` | UUID FK → certification_labs | Institute that issued the certificate |
| `certificate_number` | text, not null | For search |
| `pdf_url` | text, nullable | **New** — link to certificate document |

---

## 9. Indexing Strategy

Beyond primary keys and unique constraints (auto-indexed), the following indexes are recommended:

### Partial indexes (diamond PLP performance)

```sql
CREATE INDEX idx_diamonds_natural_carat ON diamonds (carat) WHERE lab_grown = false;
CREATE INDEX idx_diamonds_labgrown_carat ON diamonds (carat) WHERE lab_grown = true;
CREATE INDEX idx_diamonds_natural_price ON diamonds (price_per_carat_usd) WHERE lab_grown = false;
CREATE INDEX idx_diamonds_labgrown_price ON diamonds (price_per_carat_usd) WHERE lab_grown = true;
```

### Foreign key indexes

All FK columns should have indexes for JOIN performance. Key ones:

```sql
CREATE INDEX idx_products_supplier ON products (supplier_id);
CREATE INDEX idx_products_type ON products (product_type);
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
```

### Search indexes

```sql
CREATE INDEX idx_products_description_fts ON products USING GIN(to_tsvector('english', description));
CREATE INDEX idx_certifications_number ON certifications (certificate_number);
```

---

## 10. Triggers

### `trg_order_event_status`

Fires after INSERT on `order_events`. Updates `orders.current_status` to the event type of the most recent event for that order.

### `trg_ledger_entry_status`

Fires after INSERT on `ledger_entries`. Sums all ledger entry amounts for the invoice and sets `invoices.current_status` to paid, partially_paid, or issued accordingly.

See Sections 5 and 6 for full trigger SQL.

---

## 11. Entity Relationship Summary

```
users ──< addresses
users ──< cart_items
users ──< shortlists ──< shortlist_items >── products
users ──< order_checkouts ──< orders
users ──< invoices ──< ledger_entries >──? orders

suppliers ──< products

products ──? diamonds
products ──? gemstones
products ──? melee_lots
products ──? jewelry ──? jewelry_engagement_rings
                     ──? jewelry_tennis_bracelets
                     ──< jewelry_available_metals
                     ──< jewelry_engagement_ring_compatible_stones
                     ──< jewelry_configuration_images
products ──< product_images
products ──? certifications

cart_items ──? cart_item_config
orders ──< order_products >── products
orders ──< order_events >── order_event_types
orders ──< order_exchange_rates >── currencies
ledger_entries ──< ledger_entry_exchange_rates >── currencies
```

Legend: `──<` = one-to-many, `──?` = one-to-zero-or-one, `>──` = many-to-one, `>──?` = optional many-to-one.

---

## 12. Tables Summary

### New tables (15)

| Table | Purpose |
|---|---|
| `order_checkouts` | Groups orders from the same checkout |
| `order_products` | Products within an individual order + snapshot |
| `order_events` | Order lifecycle tracking |
| `order_exchange_rates` | Frozen exchange rates at purchase |
| `cart_item_config` | Jewelry configuration for cart items |
| `shortlists` | Named shortlist parent entity |
| `jewelry_engagement_rings` | Engagement ring subcategory detail |
| `jewelry_engagement_ring_compatible_stones` | Stone compatibility rules |
| `jewelry_configuration_images` | Per-configuration jewelry images |
| `ledger_entries` | Financial transaction ledger |
| `ledger_entry_exchange_rates` | Exchange rates at payment time |
| `invoice_statuses` | Invoice status lookup |
| `ledger_entry_types` | Ledger entry type lookup |
| `order_event_types` | Order event type lookup |
| `gemstone_cut_grades` | Gemstone-specific cut grades |

### Removed tables (9)

| Table | Replaced by |
|---|---|
| `carts` | `cart_items.user_id` directly |
| `order_progress` | `order_events` |
| `order_updates` | `order_events` |
| `order_item_details` | `order_products.snapshot` |
| `order_summaries` | Columns on `orders` or dropped |
| `order_line_items` | `order_products` |
| `jewelry_mounts` | `jewelry_available_metals` |
| `ring_configurations` | `jewelry_available_metals` + `jewelry_engagement_ring_compatible_stones` |
| `jewelry_available_shapes` | `jewelry_engagement_ring_compatible_stones` |

### Renamed tables (7)

| Old name | New name |
|---|---|
| `clarity_grades` | `diamond_clarity_grades` |
| `cut_grades` | `diamond_cut_grades` |
| `polish_grades` | `diamond_polish_grades` |
| `symmetry_grades` | `diamond_symmetry_grades` |
| `fluorescence_levels` | `diamond_fluorescence_levels` |
| `treatments` | `gemstone_treatments` |
| `origins` | `gemstone_origins` |

### Structurally changed tables (12)

| Table | Key changes |
|---|---|
| `products` | Collapsed product_type enum to 4 values, removed exchange rate and price_per_carat |
| `diamonds` | Added `lab_grown` boolean, `price_per_carat_usd` |
| `gemstones` | Added `price_per_carat_usd`, `cut_id` FK target changed from `diamond_cut_grades` to `gemstone_cut_grades` |
| `melee_lots` | Added `lab_grown` boolean |
| `jewelry` | Stripped to base fields, subcategory-specific columns moved to detail tables |
| `jewelry_available_metals` | Added `metal_quality_id` and `price_usd` columns (now represents priced configurations) |
| `orders` | Completely restructured — two-level model, event-driven status, no inline invoice reference |
| `invoices` | Independent from orders, ledger-based |
| `cart_items` | FK changed from `cart_id` to `user_id` (carts table removed) |
| `shortlist_items` | Now belongs to `shortlists` parent, not directly to user |
| `product_images` | Removed `image_type` |
| `certifications` | Added `pdf_url` |

---

## 13. Design Invariants

- **`jewelry_tennis_bracelets`** is included as a schema-only template. Create the table during migration but do not build UI, API routes, or seed data for it. It exists to validate the subcategory pattern.
- **`shipping_cost` and `vat_amount` on `orders`** are `NOT NULL DEFAULT 0`. All orders have a shipping cost and tax amount, even if zero.
- **Ledger entries are append-only.** Corrections are made by inserting a new compensating entry (e.g. a credit to reverse a charge), never by updating or deleting existing rows. The trigger only fires on INSERT, not UPDATE or DELETE.
