# Database Schema Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the entire database schema per the spec at `docs/superpowers/specs/2026-03-24-database-schema-redesign.md`, then update all downstream consumers (API layer, route handlers, pages).

**Architecture:** Bottom-up migration — schema files first, then squash migrations, rewrite seed data, update API layer, update route handlers, update pages. Since there is no production data to preserve, we squash all migrations into one fresh migration per the CLAUDE.md database workflow.

**Tech Stack:** PostgreSQL (Supabase), Drizzle ORM, Next.js 16 App Router, TypeScript.

**Spec:** `docs/superpowers/specs/2026-03-24-database-schema-redesign.md`

---

## File Structure

### Schema files (db/schema/) — all rewritten

| File | Responsibility |
|---|---|
| `db/schema/enums.ts` | `productTypeEnum` (collapsed to 4 values). All other enums removed. |
| `db/schema/helpers.ts` | Timestamp helper (unchanged) |
| `db/schema/lookups.ts` | All lookup tables — renamed, new ones added |
| `db/schema/users.ts` | `users` (+verified), `addresses`, `suppliers` |
| `db/schema/products.ts` | `products`, `diamonds`, `gemstones`, `meleeLots` |
| `db/schema/jewelry.ts` | `jewelry`, `jewelryEngagementRings`, `jewelryTennisBracelets`, `jewelryAvailableMetals`, `jewelryEngagementRingCompatibleStones`, `jewelryConfigurationImages` |
| `db/schema/orders.ts` | `orderCheckouts`, `orders`, `orderProducts`, `orderEvents`, `orderExchangeRates` |
| `db/schema/commerce.ts` | `cartItems`, `cartItemConfig`, `shortlists`, `shortlistItems`, `invoices`, `ledgerEntries`, `ledgerEntryExchangeRates` |
| `db/schema/media.ts` | `productImages` (no imageType), `certifications` (+pdfUrl) |
| `db/schema/index.ts` | Re-exports (unchanged structure) |

### API layer (lib/api/) — merged and updated

| File | Change |
|---|---|
| `lib/api/diamonds.ts` | Unified: handles both natural and lab-grown via `labGrown` param. Absorbs `lab-grown-diamonds.ts`. |
| `lib/api/lab-grown-diamonds.ts` | **Deleted** — merged into `diamonds.ts` |
| `lib/api/gemstones.ts` | Updated imports for renamed lookups |
| `lib/api/melee.ts` | **New** — unified: handles both natural and lab-grown via `labGrown` param. Replaces `natural-melee.ts` and `lab-grown-melee.ts`. |
| `lib/api/natural-melee.ts` | **Deleted** — merged into `melee.ts` |
| `lib/api/lab-grown-melee.ts` | **Deleted** — merged into `melee.ts` |
| `lib/api/jewelry/engagement-rings.ts` | Updated for new jewelry schema (subcategory table, available metals with pricing, compatible stones) |
| `lib/api/jewelry/shared.ts` | Updated base type |
| `lib/api/orders.ts` | Complete rewrite — two-level model, order events, order products |
| `lib/api/cart.ts` | Remove carts table dependency, add cart_item_config support |
| `lib/api/shortlists.ts` | Add shortlists parent entity |
| `lib/api/invoices.ts` | **New** — invoice + ledger entry queries |
| `lib/api/search.ts` | Updated for new product_type enum and table structure |
| `lib/api/users.ts` | Minor — add `verified` field |
| `lib/api/addresses.ts` | No changes |
| `lib/api/auth.ts` | No changes |
| `lib/api/helpers.ts` | No changes |
| `lib/api/filters.ts` | No changes |
| `lib/api/response.ts` | No changes |

### Route handlers (app/api/v1/) — updated imports

Route handlers are thin wrappers around `lib/api/` functions. Changes are limited to import paths (for merged modules) and updated function signatures. No new routes needed.

### Pages (app/buyer/) — updated imports

Pages call `lib/api/` functions and pass data to components. Changes are limited to import paths and updated type shapes. The order detail page needs the most work (new events-based timeline, order products rendering).

---

## Phase 1: Schema Rewrite

### Task 1: Rewrite enums.ts

**Files:**
- Modify: `db/schema/enums.ts`

- [ ] **Step 1: Rewrite the enums file**

Replace all contents with the single remaining enum:

```typescript
import { pgEnum } from "drizzle-orm/pg-core"

export const productTypeEnum = pgEnum("product_type", [
  "diamond",
  "gemstone",
  "melee",
  "jewelry",
])
```

Removed enums: `orderStatusEnum`, `orderProgressStepEnum`, `imageTypeEnum`, `orderItemTypeEnum`. These are all replaced by lookup tables or removed entirely.

- [ ] **Step 2: Commit**

```bash
git add db/schema/enums.ts
git commit -m "refactor(schema): collapse product_type enum, remove obsolete enums"
```

---

### Task 2: Rewrite lookups.ts

**Files:**
- Modify: `db/schema/lookups.ts`

- [ ] **Step 1: Rewrite the lookups file**

Rename existing tables, add new ones. Keep the `lookupTable` helper function. Full file:

```typescript
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core"

function lookupTable<T extends string>(name: T) {
  return pgTable(name, {
    id: uuid("id").primaryKey().defaultRandom(),
    value: text("value").notNull(),
    sortOrder: integer("sort_order").notNull(),
  })
}

// Diamond-specific
export const shapes = lookupTable("shapes")
export const diamondColors = lookupTable("diamond_colors")
export const diamondClarityGrades = lookupTable("diamond_clarity_grades")
export const diamondCutGrades = lookupTable("diamond_cut_grades")
export const diamondPolishGrades = lookupTable("diamond_polish_grades")
export const diamondSymmetryGrades = lookupTable("diamond_symmetry_grades")
export const diamondFluorescenceLevels = lookupTable("diamond_fluorescence_levels")

// Gemstone-specific
export const gemstoneTypes = lookupTable("gemstone_types")
export const gemstoneCutGrades = lookupTable("gemstone_cut_grades")
export const gemstoneTreatments = lookupTable("gemstone_treatments")
export const gemstoneOrigins = lookupTable("gemstone_origins")

// Jewelry
export const certificationLabs = lookupTable("certification_labs")
export const metalTypes = lookupTable("metal_types")
export const metalQualities = lookupTable("metal_qualities")
export const metalColors = lookupTable("metal_colors")
export const bandStyles = lookupTable("band_styles")
export const jewelryTypes = pgTable("jewelry_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  value: text("value").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull(),
})

// Global
export const paymentMethods = lookupTable("payment_methods")
export const countries = lookupTable("countries")
export const currencies = lookupTable("currencies")
export const orderEventTypes = lookupTable("order_event_types")
export const invoiceStatuses = lookupTable("invoice_statuses")
export const ledgerEntryTypes = lookupTable("ledger_entry_types")
```

Note the renames: `clarityGrades` → `diamondClarityGrades`, `cutGrades` → `diamondCutGrades`, `polishGrades` → `diamondPolishGrades`, `symmetryGrades` → `diamondSymmetryGrades`, `fluorescenceLevels` → `diamondFluorescenceLevels`, `treatments` → `gemstoneTreatments`, `origins` → `gemstoneOrigins`. New: `gemstoneCutGrades`, `orderEventTypes`, `invoiceStatuses`, `ledgerEntryTypes`.

- [ ] **Step 2: Commit**

```bash
git add db/schema/lookups.ts
git commit -m "refactor(schema): rename lookup tables with category prefixes, add new lookups"
```

---

### Task 3: Rewrite users.ts

**Files:**
- Modify: `db/schema/users.ts`

- [ ] **Step 1: Add `verified` column to users table**

Add after the `phone` field:

```typescript
verified: boolean("verified").notNull().default(false),
```

No other changes to users.ts. Addresses and suppliers remain the same.

- [ ] **Step 2: Commit**

```bash
git add db/schema/users.ts
git commit -m "feat(schema): add verified boolean to users table"
```

---

### Task 4: Rewrite products.ts

**Files:**
- Modify: `db/schema/products.ts`

- [ ] **Step 1: Rewrite the products file**

Key changes:
- `products`: remove `pricePerCaratUsd` and `exchangeRateEur`
- `diamonds`: add `labGrown` boolean, add `pricePerCaratUsd` (moved from products)
- `gemstones`: change `cutId` FK from `cutGrades` to `gemstoneCutGrades`, add `pricePerCaratUsd`
- `meleeLots`: add `labGrown` boolean
- Update all lookup import names to new prefixed names
- Update all relations to use new lookup names

Full file contents — update all imports at top:

```typescript
import {
  pgTable,
  uuid,
  text,
  boolean,
  numeric,
  timestamp,
  integer,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { productTypeEnum } from "./enums"
import { timestamps } from "./helpers"
import { suppliers } from "./users"
import {
  shapes,
  diamondColors,
  diamondClarityGrades,
  diamondCutGrades,
  diamondPolishGrades,
  diamondSymmetryGrades,
  diamondFluorescenceLevels,
  gemstoneTypes,
  gemstoneCutGrades,
  gemstoneTreatments,
  gemstoneOrigins,
} from "./lookups"
import { productImages, certifications } from "./media"
```

Products table — remove `pricePerCaratUsd` and `exchangeRateEur`:

```typescript
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierId: uuid("supplier_id")
    .references(() => suppliers.id)
    .notNull(),
  stockId: text("stock_id").notNull(),
  productType: productTypeEnum("product_type").notNull(),
  priceUsd: numeric("price_usd").notNull(),
  description: text("description").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  ...timestamps,
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
})
```

Diamonds table — add `labGrown` and `pricePerCaratUsd`:

```typescript
export const diamonds = pgTable("diamonds", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull()
    .unique(),
  labGrown: boolean("lab_grown").notNull(),
  shapeId: uuid("shape_id")
    .references(() => shapes.id)
    .notNull(),
  carat: numeric("carat").notNull(),
  colorId: uuid("color_id")
    .references(() => diamondColors.id)
    .notNull(),
  clarityId: uuid("clarity_id")
    .references(() => diamondClarityGrades.id)
    .notNull(),
  cutId: uuid("cut_id")
    .references(() => diamondCutGrades.id)
    .notNull(),
  polishId: uuid("polish_id")
    .references(() => diamondPolishGrades.id)
    .notNull(),
  symmetryId: uuid("symmetry_id")
    .references(() => diamondSymmetryGrades.id)
    .notNull(),
  fluorescenceId: uuid("fluorescence_id")
    .references(() => diamondFluorescenceLevels.id)
    .notNull(),
  pricePerCaratUsd: numeric("price_per_carat_usd"),
  tablePct: numeric("table_pct").notNull(),
  depthPct: numeric("depth_pct").notNull(),
  lengthMm: numeric("length_mm").notNull(),
  widthMm: numeric("width_mm").notNull(),
  depthMm: numeric("depth_mm").notNull(),
})
```

Gemstones table — change cut FK, add `pricePerCaratUsd`:

```typescript
export const gemstones = pgTable("gemstones", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull()
    .unique(),
  gemstoneTypeId: uuid("gemstone_type_id")
    .references(() => gemstoneTypes.id)
    .notNull(),
  shapeId: uuid("shape_id")
    .references(() => shapes.id)
    .notNull(),
  carat: numeric("carat").notNull(),
  color: text("color").notNull(),
  clarity: text("clarity").notNull(),
  cutId: uuid("cut_id")
    .references(() => gemstoneCutGrades.id)
    .notNull(),
  treatmentId: uuid("treatment_id")
    .references(() => gemstoneTreatments.id)
    .notNull(),
  originId: uuid("origin_id")
    .references(() => gemstoneOrigins.id)
    .notNull(),
  pricePerCaratUsd: numeric("price_per_carat_usd"),
  lengthMm: numeric("length_mm").notNull(),
  widthMm: numeric("width_mm").notNull(),
  depthMm: numeric("depth_mm").notNull(),
})
```

Melee lots table — add `labGrown`:

```typescript
export const meleeLots = pgTable("melee_lots", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull()
    .unique(),
  labGrown: boolean("lab_grown").notNull(),
  shapeId: uuid("shape_id")
    .references(() => shapes.id)
    .notNull(),
  sizeRange: text("size_range").notNull(),
  colorRange: text("color_range").notNull(),
  clarityRange: text("clarity_range").notNull(),
  cutId: uuid("cut_id")
    .references(() => diamondCutGrades.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  totalCaratWeight: numeric("total_carat_weight").notNull(),
})
```

Update all relations to use new lookup names (`diamondClarityGrades` instead of `clarityGrades`, etc.). The relation definitions follow the same pattern as before but with updated table references.

- [ ] **Step 2: Commit**

```bash
git add db/schema/products.ts
git commit -m "refactor(schema): unify diamonds/melee with lab_grown flag, move price_per_carat to detail tables"
```

---

### Task 5: Rewrite jewelry.ts

**Files:**
- Modify: `db/schema/jewelry.ts`

- [ ] **Step 1: Rewrite the jewelry file**

Complete restructure. Remove: `jewelryMounts`, `ringConfigurations`, `jewelryAvailableShapes`. Add: `jewelryEngagementRings`, `jewelryTennisBracelets`, `jewelryEngagementRingCompatibleStones`, `jewelryConfigurationImages`. Restructure: `jewelryAvailableMetals` (add `metalQualityId`, `priceUsd`). Strip: `jewelry` base table (remove ring-specific columns).

```typescript
import { pgTable, uuid, text, numeric, boolean, integer } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { timestamps } from "./helpers"
import {
  jewelryTypes,
  bandStyles,
  metalTypes,
  metalQualities,
  metalColors,
  shapes,
} from "./lookups"
import { products } from "./products"

export const jewelry = pgTable("jewelry", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull()
    .unique(),
  sku: text("sku").notNull(),
  jewelryTypeId: uuid("jewelry_type_id")
    .references(() => jewelryTypes.id)
    .notNull(),
  ...timestamps,
})

export const jewelryEngagementRings = pgTable("jewelry_engagement_rings", {
  id: uuid("id").primaryKey().defaultRandom(),
  jewelryId: uuid("jewelry_id")
    .references(() => jewelry.id)
    .notNull()
    .unique(),
  bandStyleId: uuid("band_style_id")
    .references(() => bandStyles.id)
    .notNull(),
  ringWidthMm: numeric("ring_width_mm"),
})

export const jewelryTennisBracelets = pgTable("jewelry_tennis_bracelets", {
  id: uuid("id").primaryKey().defaultRandom(),
  jewelryId: uuid("jewelry_id")
    .references(() => jewelry.id)
    .notNull()
    .unique(),
  lengthMm: numeric("length_mm"),
})

export const jewelryAvailableMetals = pgTable("jewelry_available_metals", {
  id: uuid("id").primaryKey().defaultRandom(),
  jewelryId: uuid("jewelry_id")
    .references(() => jewelry.id)
    .notNull(),
  metalTypeId: uuid("metal_type_id")
    .references(() => metalTypes.id)
    .notNull(),
  metalColorId: uuid("metal_color_id")
    .references(() => metalColors.id)
    .notNull(),
  metalQualityId: uuid("metal_quality_id")
    .references(() => metalQualities.id)
    .notNull(),
  priceUsd: numeric("price_usd").notNull(),
})

export const jewelryEngagementRingCompatibleStones = pgTable(
  "jewelry_engagement_ring_compatible_stones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jewelryId: uuid("jewelry_id")
      .references(() => jewelry.id)
      .notNull(),
    shapeId: uuid("shape_id")
      .references(() => shapes.id)
      .notNull(),
    maxCarat: numeric("max_carat").notNull(),
  },
)

export const jewelryConfigurationImages = pgTable(
  "jewelry_configuration_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jewelryId: uuid("jewelry_id")
      .references(() => jewelry.id)
      .notNull(),
    metalTypeId: uuid("metal_type_id")
      .references(() => metalTypes.id)
      .notNull(),
    metalColorId: uuid("metal_color_id")
      .references(() => metalColors.id)
      .notNull(),
    url: text("url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isThumbnail: boolean("is_thumbnail").notNull().default(false),
  },
)
```

Add relations for all tables (jewelry → products, jewelryType, engagementRing, tennisBracelet, availableMetals, compatibleStones, configurationImages; each child → parent and lookup FKs).

- [ ] **Step 2: Commit**

```bash
git add db/schema/jewelry.ts
git commit -m "refactor(schema): restructure jewelry with subcategory tables and priced configurations"
```

---

### Task 6: Rewrite orders.ts

**Files:**
- Modify: `db/schema/orders.ts`

- [ ] **Step 1: Rewrite the orders file**

Complete restructure. Remove: `orderLineItems`, `orderProgress`, `orderUpdates`, `orderItemDetails`, `orderSummaries`. Add: `orderCheckouts`, `orderProducts`, `orderEvents`, `orderExchangeRates`. Restructure: `orders` (two-level model, event-driven status).

```typescript
import {
  pgTable,
  uuid,
  text,
  numeric,
  boolean,
  timestamp,
  date,
  jsonb,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { timestamps } from "./helpers"
import { users, addresses } from "./users"
import { products } from "./products"
import { orderEventTypes, currencies } from "./lookups"

export const orderCheckouts = pgTable("order_checkouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  orderParentNumber: text("order_parent_number").notNull().unique(),
  orderDate: date("order_date").notNull(),
  ...timestamps,
})

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  checkoutId: uuid("checkout_id")
    .references(() => orderCheckouts.id)
    .notNull(),
  orderNumber: text("order_number").notNull().unique(),
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
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
})

export const orderProducts = pgTable("order_products", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .references(() => orders.id)
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  snapshot: jsonb("snapshot").notNull(),
  priceUsd: numeric("price_usd").notNull(),
})

export const orderEvents = pgTable("order_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .references(() => orders.id)
    .notNull(),
  eventTypeId: uuid("event_type_id")
    .references(() => orderEventTypes.id)
    .notNull(),
  message: text("message").notNull(),
  description: text("description"),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
})

export const orderExchangeRates = pgTable("order_exchange_rates", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .references(() => orders.id)
    .notNull(),
  currencyId: uuid("currency_id")
    .references(() => currencies.id)
    .notNull(),
  rate: numeric("rate").notNull(),
})
```

Add relations: `orderCheckouts` → user, orders; `orders` → checkout, deliveryAddress, currentStatus, products, events, exchangeRates; `orderProducts` → order, product; `orderEvents` → order, eventType; `orderExchangeRates` → order, currency.

- [ ] **Step 2: Commit**

```bash
git add db/schema/orders.ts
git commit -m "refactor(schema): two-level order model with events and product snapshots"
```

---

### Task 7: Rewrite commerce.ts

**Files:**
- Modify: `db/schema/commerce.ts`

- [ ] **Step 1: Rewrite the commerce file**

Remove: `carts`, old `invoices` (1:1 with orders). Add: `cartItemConfig`, `shortlists`, `ledgerEntries`, `ledgerEntryExchangeRates`. Restructure: `cartItems` (user_id instead of cart_id), `shortlistItems` (shortlist_id instead of user_id), `invoices` (independent, ledger-based).

```typescript
import {
  pgTable,
  uuid,
  integer,
  timestamp,
  text,
  numeric,
  date,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { timestamps } from "./helpers"
import { users } from "./users"
import { products } from "./products"
import { orders } from "./orders"
import {
  paymentMethods,
  invoiceStatuses,
  ledgerEntryTypes,
  currencies,
  metalTypes,
  metalColors,
  metalQualities,
} from "./lookups"

export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").notNull().default(1),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
})

export const cartItemConfig = pgTable("cart_item_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartItemId: uuid("cart_item_id")
    .references(() => cartItems.id)
    .notNull()
    .unique(),
  metalTypeId: uuid("metal_type_id").references(() => metalTypes.id),
  metalColorId: uuid("metal_color_id").references(() => metalColors.id),
  metalQualityId: uuid("metal_quality_id").references(() => metalQualities.id),
  centerStoneProductId: uuid("center_stone_product_id").references(
    () => products.id,
  ),
  ringSize: numeric("ring_size"),
  braceletLength: numeric("bracelet_length"),
})

export const shortlists = pgTable("shortlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  name: text("name").notNull(),
  ...timestamps,
})

export const shortlistItems = pgTable("shortlist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  shortlistId: uuid("shortlist_id")
    .references(() => shortlists.id)
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
})

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  paymentMethodId: uuid("payment_method_id")
    .references(() => paymentMethods.id)
    .notNull(),
  issueDate: date("issue_date").notNull(),
  dueDate: date("due_date").notNull(),
  totalAmountUsd: numeric("total_amount_usd").notNull(),
  currentStatus: uuid("current_status").references(() => invoiceStatuses.id),
  ...timestamps,
})

export const ledgerEntries = pgTable("ledger_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .references(() => invoices.id)
    .notNull(),
  ledgerEntryTypeId: uuid("ledger_entry_type_id")
    .references(() => ledgerEntryTypes.id)
    .notNull(),
  orderId: uuid("order_id").references(() => orders.id),
  description: text("description").notNull(),
  amountUsd: numeric("amount_usd").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
})

export const ledgerEntryExchangeRates = pgTable(
  "ledger_entry_exchange_rates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ledgerEntryId: uuid("ledger_entry_id")
      .references(() => ledgerEntries.id)
      .notNull(),
    currencyId: uuid("currency_id")
      .references(() => currencies.id)
      .notNull(),
    rate: numeric("rate").notNull(),
  },
)
```

Add relations for all tables.

- [ ] **Step 2: Commit**

```bash
git add db/schema/commerce.ts
git commit -m "refactor(schema): ledger-based invoices, cart config, named shortlists"
```

---

### Task 8: Rewrite media.ts

**Files:**
- Modify: `db/schema/media.ts`

- [ ] **Step 1: Update media file**

Remove `imageTypeEnum` import and `imageType` column from `productImages`. Add `pdfUrl` to `certifications`.

```typescript
import { pgTable, uuid, text, integer, boolean } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { products } from "./products"
import { certificationLabs } from "./lookups"

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isThumbnail: boolean("is_thumbnail").notNull().default(false),
})

export const certifications = pgTable("certifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull()
    .unique(),
  labId: uuid("lab_id")
    .references(() => certificationLabs.id)
    .notNull(),
  certificateNumber: text("certificate_number").notNull(),
  pdfUrl: text("pdf_url"),
})
```

Add relations (same as before, minus imageType references).

- [ ] **Step 2: Commit**

```bash
git add db/schema/media.ts
git commit -m "refactor(schema): remove image_type enum, add pdf_url to certifications"
```

---

### Task 9: Verify schema compiles

**Files:**
- Check: All `db/schema/*.ts` files

- [ ] **Step 1: Run typecheck**

```bash
npm run typecheck
```

Expected: No TypeScript errors in `db/schema/` files. There WILL be errors in `lib/api/` and `app/` files that still reference old schema exports — that's expected and we fix those in Phase 3.

If there are errors within the schema files themselves (circular references, missing imports), fix them before proceeding.

- [ ] **Step 2: Commit any fixes**

```bash
git add db/schema/
git commit -m "fix(schema): resolve schema compilation errors"
```

---

## Phase 2: Migration & Seed Data

### Task 10: Squash migrations and generate fresh migration

**Files:**
- Delete: `supabase/migrations/*.sql` (all existing migration files)
- Generate: new single migration via `drizzle-kit generate`

- [ ] **Step 1: Delete existing migrations**

```bash
rm supabase/migrations/*.sql
```

- [ ] **Step 2: Generate fresh migration**

```bash
npm run db:generate
```

This produces a single `.sql` file in `supabase/migrations/` reflecting the entire new schema.

- [ ] **Step 3: Review the generated SQL**

Open the generated migration file and verify:
- All renamed tables appear with new names
- New tables are created
- Old tables are not present
- Triggers are NOT included (Drizzle doesn't generate triggers — we add those manually)

- [ ] **Step 4: Add triggers to the migration**

Append the two trigger functions to the end of the generated migration file:

```sql
-- Trigger: auto-update orders.current_status on new order event
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

-- Trigger: auto-update invoices.current_status on new ledger entry
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
```

- [ ] **Step 5: Add indexes to the migration**

Append all indexes from spec Section 9 to the migration file, after the triggers:

```sql
-- Partial indexes (diamond PLP performance)
CREATE INDEX idx_diamonds_natural_carat ON diamonds (carat) WHERE lab_grown = false;
CREATE INDEX idx_diamonds_labgrown_carat ON diamonds (carat) WHERE lab_grown = true;
CREATE INDEX idx_diamonds_natural_price ON diamonds (price_per_carat_usd) WHERE lab_grown = false;
CREATE INDEX idx_diamonds_labgrown_price ON diamonds (price_per_carat_usd) WHERE lab_grown = true;

-- Foreign key indexes
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

-- Search indexes
CREATE INDEX idx_products_description_fts ON products USING GIN(to_tsvector('english', description));
CREATE INDEX idx_certifications_number ON certifications (certificate_number);
```

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/
git commit -m "refactor(db): squash migrations into single fresh migration with triggers and indexes"
```

---

### Task 11: Rewrite seed.sql

**Files:**
- Modify: `supabase/seed.sql`

- [ ] **Step 1: Rewrite seed data**

The seed file is ~3680 lines. It must be completely rewritten to match the new schema. The insertion order must respect FK dependencies:

1. **Lookup tables** (no dependencies): `countries`, `currencies`, `shapes`, `diamond_colors`, `diamond_clarity_grades`, `diamond_cut_grades`, `diamond_polish_grades`, `diamond_symmetry_grades`, `diamond_fluorescence_levels`, `gemstone_types`, `gemstone_cut_grades`, `gemstone_treatments`, `gemstone_origins`, `certification_labs`, `metal_types`, `metal_qualities`, `metal_colors`, `band_styles`, `jewelry_types`, `payment_methods`, `order_event_types`, `invoice_statuses`, `ledger_entry_types`
2. **Users & suppliers** (depends on: countries, currencies): `users`, `addresses`, `suppliers`
3. **Products base** (depends on: suppliers): `products`
4. **Product details** (depends on: products + lookups): `diamonds`, `gemstones`, `melee_lots`
5. **Jewelry** (depends on: products + lookups): `jewelry`, `jewelry_engagement_rings`, `jewelry_available_metals`, `jewelry_engagement_ring_compatible_stones`, `jewelry_configuration_images`. **Note:** Do NOT seed `jewelry_tennis_bracelets` — per spec Section 13, it is schema-only with no seed data.
6. **Media** (depends on: products + lookups): `product_images`, `certifications`
7. **Order checkouts** (depends on: users): `order_checkouts`
8. **Orders** (depends on: order_checkouts, addresses, order_event_types): `orders`
9. **Order children** (depends on: orders + products + lookups): `order_products`, `order_events`, `order_exchange_rates`
10. **Invoices** (depends on: users, payment_methods, invoice_statuses): `invoices`
11. **Ledger entries** (depends on: invoices, ledger_entry_types, orders): `ledger_entries`, `ledger_entry_exchange_rates`
12. **Commerce** (depends on: users, products): `cart_items`, `cart_item_config`, `shortlists`, `shortlist_items`

Reuse the existing seed data patterns (deterministic UUIDs like `a1000018-0001-4000-8000-000000000001`) and adapt to new table names and columns. Key differences from old seed:

- Diamonds: add `lab_grown` column (set `false` for existing natural diamonds, create new rows with `true` for lab-grown)
- Diamonds: add `price_per_carat_usd` column (was on products table)
- Products: `product_type` values change from `natural_diamond`/`lab_grown_diamond`/`natural_melee`/`lab_grown_melee` to `diamond`/`melee`
- Products: remove `price_per_carat_usd` and `exchange_rate_eur` columns
- Gemstones: add `price_per_carat_usd`, reference `gemstone_cut_grades` instead of `cut_grades`
- Melee: add `lab_grown` column
- Jewelry: strip to base fields, add `jewelry_engagement_rings` rows
- Jewelry available metals: add `metal_quality_id` and `price_usd`
- Orders: complete restructure into `order_checkouts` + `orders` + `order_products` + `order_events`
- Invoices: independent with ledger entries
- Shortlists: add parent `shortlists` rows
- Cart: remove `carts` rows, add `user_id` directly to `cart_items`
- All lookup table names updated

Refer to the existing `supabase/seed.sql` for the data patterns and UUID conventions. Preserve the same test users (Sarah, Hans, Emily) and similar product data, just restructured.

- [ ] **Step 2: Verify seed loads**

```bash
npm run db:reset
```

Expected: Clean run — drops DB, applies migration, loads seed. No errors.

- [ ] **Step 3: Commit**

```bash
git add supabase/seed.sql
git commit -m "refactor(db): rewrite seed data for new schema"
```

---

### Task 12: Verify database end-to-end

- [ ] **Step 1: Run full reset**

```bash
npm run db:reset
```

- [ ] **Step 2: Open Drizzle Studio and spot-check**

```bash
npm run db:studio
```

Verify in the browser:
- All tables exist with correct columns
- Lookup tables have data
- Products have correct `product_type` values
- Diamonds have `lab_grown` flag
- Orders have `current_status` populated (trigger should have fired from seed event inserts)
- Invoices have `current_status` populated

- [ ] **Step 3: Commit if any fixes were needed**

---

## Phase 3: API Layer Updates

### Task 13: Unify diamonds API

**Files:**
- Modify: `lib/api/diamonds.ts` — rewrite to handle both natural and lab-grown
- Delete: `lib/api/lab-grown-diamonds.ts`

- [ ] **Step 1: Rewrite diamonds.ts**

Read the current `lib/api/diamonds.ts` and `lib/api/lab-grown-diamonds.ts`. They are nearly identical — the only difference is the `product_type` filter. Merge into a single module where all fetch functions accept a `labGrown: boolean` parameter:

- `fetchDiamondListFiltered(params, labGrown)` — filters by `diamonds.labGrown`
- `fetchDiamondItem(id, labGrown)` — fetches single diamond, verifies `labGrown` matches
- `fetchRelatedDiamonds(id, labGrown)` — related items with same `labGrown` value

Update all imports: `clarityGrades` → `diamondClarityGrades`, `cutGrades` → `diamondCutGrades`, etc. Remove `pricePerCaratUsd` from `products` joins — it's now on the `diamonds` table directly.

Export a `DiamondItem` type that includes the `labGrown` field.

- [ ] **Step 2: Delete lab-grown-diamonds.ts**

```bash
rm lib/api/lab-grown-diamonds.ts
```

- [ ] **Step 3: Commit**

```bash
git add lib/api/diamonds.ts && git rm lib/api/lab-grown-diamonds.ts
git commit -m "refactor(api): unify diamond API with labGrown parameter"
```

---

### Task 14: Unify melee API

**Files:**
- Create: `lib/api/melee.ts` — unified module
- Delete: `lib/api/natural-melee.ts`, `lib/api/lab-grown-melee.ts`

- [ ] **Step 1: Create unified melee.ts**

Same pattern as diamonds — read both existing files, merge into one with `labGrown` parameter. Update lookup imports.

- [ ] **Step 2: Delete old files**

```bash
rm lib/api/natural-melee.ts lib/api/lab-grown-melee.ts
```

- [ ] **Step 3: Commit**

```bash
git add lib/api/melee.ts && git rm lib/api/natural-melee.ts lib/api/lab-grown-melee.ts
git commit -m "refactor(api): unify melee API with labGrown parameter"
```

---

### Task 15: Update gemstones API

**Files:**
- Modify: `lib/api/gemstones.ts`

- [ ] **Step 1: Update imports and queries**

- `cutGrades` → `gemstoneCutGrades`
- `treatments` → `gemstoneTreatments`
- `origins` → `gemstoneOrigins`
- Add `pricePerCaratUsd` from gemstones table (was on products)
- Remove `pricePerCaratUsd` from products join

- [ ] **Step 2: Commit**

```bash
git add lib/api/gemstones.ts
git commit -m "refactor(api): update gemstones API for renamed lookups"
```

---

### Task 16: Update jewelry API

**Files:**
- Modify: `lib/api/jewelry/engagement-rings.ts`
- Modify: `lib/api/jewelry/shared.ts`

- [ ] **Step 1: Update shared.ts base type**

Update `JewelryItemBase` to reflect new schema (no `isLabgrown`, `naturalVariantPriceUsd`, `labgrownVariantPriceUsd`; add priced configurations).

- [ ] **Step 2: Rewrite engagement-rings.ts**

Major changes:
- Join `jewelryEngagementRings` instead of reading ring-specific columns from `jewelry`
- Join `jewelryAvailableMetals` with `priceUsd` for configurations
- Join `jewelryEngagementRingCompatibleStones` for stone compatibility
- Join `jewelryConfigurationImages` for per-config images
- Remove `jewelryMounts`, `ringConfigurations`, `jewelryAvailableShapes` joins
- Export updated `EngagementRingItem` type with configurations and compatible stones

- [ ] **Step 3: Commit**

```bash
git add lib/api/jewelry/
git commit -m "refactor(api): update jewelry API for subcategory tables and priced configs"
```

---

### Task 17: Rewrite orders API

**Files:**
- Modify: `lib/api/orders.ts`

- [ ] **Step 1: Complete rewrite**

Read the current `lib/api/orders.ts` to understand the return shape, then rewrite:

- `fetchOrderList(userId)` — query `orders` joined with `orderCheckouts`, `orderProducts`, latest `orderEvents` for status display. Filter by user via `orderCheckouts.userId`.
- `fetchOrder(orderNumber, userId)` — full detail: order + products (with snapshots) + all events (timeline) + exchange rates + delivery address.
- Remove all references to: `orderLineItems`, `orderProgress`, `orderUpdates`, `orderItemDetails`, `orderSummaries`.
- Export new types: `Order`, `OrderProduct`, `OrderEvent`.

- [ ] **Step 2: Commit**

```bash
git add lib/api/orders.ts
git commit -m "refactor(api): rewrite orders API for two-level model with events"
```

---

### Task 18: Update cart API

**Files:**
- Modify: `lib/api/cart.ts`

- [ ] **Step 1: Rewrite cart queries**

- Remove `carts` table — query `cartItems` directly by `userId`
- `fetchCart(userId)` — query `cartItems` where `userId` matches, join products and optional `cartItemConfig`
- `addCartItem(userId, productId, quantity, config?)` — insert into `cartItems` + optionally `cartItemConfig`
- `removeCartItem(cartItemId)` — delete from `cartItems` (cascade should handle config)
- `updateCartItem(cartItemId, quantity)` — update quantity

- [ ] **Step 2: Commit**

```bash
git add lib/api/cart.ts
git commit -m "refactor(api): update cart API for direct user_id, add config support"
```

---

### Task 19: Update shortlists API

**Files:**
- Modify: `lib/api/shortlists.ts`

- [ ] **Step 1: Rewrite for named shortlists**

- `fetchShortlists(userId)` — list all shortlists for a user
- `createShortlist(userId, name)` — create new shortlist
- `fetchShortlistItems(shortlistId)` — items in a specific shortlist
- `addShortlistItem(shortlistId, productId)` — add item
- `removeShortlistItem(shortlistItemId)` — remove item
- `deleteShortlist(shortlistId)` — delete entire shortlist

- [ ] **Step 2: Commit**

```bash
git add lib/api/shortlists.ts
git commit -m "refactor(api): update shortlists API for named shortlists"
```

---

### Task 20: Create invoices API

**Files:**
- Create: `lib/api/invoices.ts`

- [ ] **Step 1: Create invoice API module**

New module:
- `fetchInvoiceList(userId)` — list invoices for a user with current status
- `fetchInvoice(invoiceId, userId)` — full invoice detail with ledger entries
- Export types: `Invoice`, `LedgerEntry`

- [ ] **Step 2: Commit**

```bash
git add lib/api/invoices.ts
git commit -m "feat(api): add invoices API with ledger entries"
```

---

### Task 21: Update search and users API

**Files:**
- Modify: `lib/api/search.ts`
- Modify: `lib/api/users.ts`

- [ ] **Step 1: Update search.ts**

Update `product_type` filter values from old enum to new (`natural_diamond` → `diamond`, etc.). Update any joins that reference renamed lookup tables.

- [ ] **Step 2: Update users.ts**

Add `verified` field to the `AppUser` type / query projection.

- [ ] **Step 3: Commit**

```bash
git add lib/api/search.ts lib/api/users.ts
git commit -m "refactor(api): update search for new product_type enum, add verified to users"
```

---

### Task 22: Verify API layer compiles

- [ ] **Step 1: Run typecheck**

```bash
npm run typecheck
```

Fix any remaining type errors in `lib/api/`. There will still be errors in `app/` files — that's expected.

- [ ] **Step 2: Commit fixes**

```bash
git add lib/api/
git commit -m "fix(api): resolve remaining type errors in API layer"
```

---

## Phase 4: Route Handler & Page Updates

### Task 23: Update product route handlers (diamonds, melee, gemstones, jewelry)

**Files:**
- Modify: `app/api/v1/diamonds/route.ts` and `app/api/v1/diamonds/[id]/route.ts`
- Modify: `app/api/v1/lab-grown-diamonds/route.ts` and `app/api/v1/lab-grown-diamonds/[id]/route.ts`
- Modify: `app/api/v1/natural-melee/route.ts` and `app/api/v1/natural-melee/[id]/route.ts`
- Modify: `app/api/v1/lab-grown-melee/route.ts` and `app/api/v1/lab-grown-melee/[id]/route.ts`
- Modify: `app/api/v1/gemstones/route.ts` and `app/api/v1/gemstones/[id]/route.ts`
- Modify: `app/api/v1/jewelry/engagement-rings/route.ts` and `app/api/v1/jewelry/engagement-rings/[id]/route.ts`

- [ ] **Step 1: Update diamond route handlers**

Routes stay at same URLs. Change imports from separate modules to unified `diamonds.ts` with `labGrown` param:
- `/api/v1/diamonds/` → calls `fetchDiamondListFiltered(params, false)`
- `/api/v1/lab-grown-diamonds/` → calls `fetchDiamondListFiltered(params, true)`

- [ ] **Step 2: Update melee route handlers**

Same pattern:
- `/api/v1/natural-melee/` → calls `fetchMeleeListFiltered(params, false)`
- `/api/v1/lab-grown-melee/` → calls `fetchMeleeListFiltered(params, true)`

- [ ] **Step 3: Update gemstone route handlers**

Update imports for any renamed types.

- [ ] **Step 4: Update jewelry route handlers**

Update `app/api/v1/jewelry/engagement-rings/` routes for new return types from `engagement-rings.ts` (priced configurations, compatible stones, subcategory detail). The response shape changes — update any explicit type annotations or response transformations.

- [ ] **Step 5: Commit**

```bash
git add app/api/v1/diamonds/ app/api/v1/lab-grown-diamonds/ app/api/v1/natural-melee/ app/api/v1/lab-grown-melee/ app/api/v1/gemstones/ app/api/v1/jewelry/
git commit -m "refactor(routes): update product routes for unified API modules"
```

---

### Task 24: Update order, cart, shortlist, and search route handlers

**Files:**
- Modify: `app/api/v1/orders/route.ts` and `app/api/v1/orders/[id]/route.ts`
- Modify: `app/api/v1/cart/route.ts`, `app/api/v1/cart/items/route.ts`, `app/api/v1/cart/items/[id]/route.ts`
- Modify: `app/api/v1/shortlists/route.ts`, `app/api/v1/shortlists/items/route.ts`, `app/api/v1/shortlists/items/[id]/route.ts`
- Modify: `app/api/v1/search/route.ts`, `app/api/v1/search/suggest/route.ts`

- [ ] **Step 1: Update order routes**

Update imports and function calls to match new `orders.ts` API signatures.

- [ ] **Step 2: Update cart routes**

Remove cart-level routes if any. Update to use new `cart.ts` function signatures with `userId` instead of `cartId`.

- [ ] **Step 3: Update shortlist routes**

Update for named shortlists — the routes may need restructuring to support shortlist CRUD.

- [ ] **Step 4: Update search routes**

Update imports for any renamed types or function signatures.

- [ ] **Step 5: Commit**

```bash
git add app/api/v1/orders/ app/api/v1/cart/ app/api/v1/shortlists/ app/api/v1/search/
git commit -m "refactor(routes): update order, cart, shortlist, search routes for new schema"
```

---

### Task 25: Update product browse pages

**Files:**
- Modify: `app/buyer/browse/natural-diamonds/page.tsx` and `[slug]/page.tsx`
- Modify: `app/buyer/browse/lab-grown-diamonds/page.tsx` and `[slug]/page.tsx`
- Modify: `app/buyer/browse/gemstones/page.tsx` and `[slug]/page.tsx`
- Modify: `app/buyer/browse/natural-melee/page.tsx` and `[slug]/page.tsx`
- Modify: `app/buyer/browse/lab-grown-melee/page.tsx` and `[slug]/page.tsx`
- Modify: `app/buyer/browse/jewelry/engagement-rings/page.tsx` and `[slug]/page.tsx`

- [ ] **Step 1: Update diamond pages**

Change imports from separate API modules to unified `diamonds.ts`:
- `natural-diamonds/page.tsx` → `fetchDiamondListFiltered(params, false)`
- `lab-grown-diamonds/page.tsx` → `fetchDiamondListFiltered(params, true)`
- Detail pages: same pattern with `fetchDiamondItem(id, false/true)`

- [ ] **Step 2: Update melee pages**

Same pattern with unified `melee.ts`.

- [ ] **Step 3: Update gemstone pages**

Update imports for renamed types.

- [ ] **Step 4: Update jewelry pages**

Update for new engagement ring data shape (subcategory detail, priced configurations, compatible stones).

- [ ] **Step 5: Commit**

```bash
git add app/buyer/browse/
git commit -m "refactor(pages): update browse pages for unified API modules"
```

---

### Task 26: Update order pages

**Files:**
- Modify: `app/buyer/orders/page.tsx`
- Modify: `app/buyer/orders/[slug]/page.tsx`

- [ ] **Step 1: Update order list page**

Update to use new `Order` type with `currentStatus` (from event types), `orderProducts` instead of `lineItems`.

- [ ] **Step 2: Update order detail page**

Major changes:
- Replace progress timeline with `orderEvents` rendering
- Replace line items with `orderProducts` (render from snapshot JSONB)
- Remove order summary sidebar (data now on order directly: `shippingCost`, `vatAmount`, `finalPriceUsd`)
- Remove `statusMessage` / `statusDetail` — derive from latest event
- Update payment section — remove payment method (now on invoice), show associated invoice(s) if any

- [ ] **Step 3: Commit**

```bash
git add app/buyer/orders/
git commit -m "refactor(pages): update order pages for event-driven model"
```

---

### Task 27: Update remaining pages and layout

**Files:**
- Modify: `app/buyer/layout.tsx` — if it references user type
- Modify: `app/buyer/page.tsx` — if it references user type

- [ ] **Step 1: Update buyer layout and home page**

Add `verified` to user type if needed. These pages use `getCurrentUser()` which will now include the `verified` field.

- [ ] **Step 2: Commit**

```bash
git add app/buyer/layout.tsx app/buyer/page.tsx
git commit -m "refactor(pages): update buyer layout for updated user type"
```

---

## Phase 5: Final Verification

### Task 28: Full build verification

- [ ] **Step 1: Run typecheck**

```bash
npm run typecheck
```

Expected: Zero errors.

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

Expected: No new lint errors (existing warnings are OK).

- [ ] **Step 3: Run format**

```bash
npm run format
```

- [ ] **Step 4: Run production build**

```bash
npm run build
```

Expected: Successful build with no errors.

- [ ] **Step 5: Run database reset one final time**

```bash
npm run db:reset
```

Expected: Clean migration + seed.

- [ ] **Step 6: Start dev server and smoke test**

```bash
npm run dev
```

Navigate to key pages and verify they render:
- `/buyer` — home page
- `/buyer/browse/natural-diamonds` — diamond PLP
- `/buyer/browse/lab-grown-diamonds` — lab-grown diamond PLP
- `/buyer/browse/gemstones` — gemstone PLP
- `/buyer/browse/jewelry/engagement-rings` — jewelry PLP
- `/buyer/orders` — orders list
- A single order detail page

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "chore: format and fix any remaining issues from schema migration"
```

---

### Task 29: Update API documentation

**Files:**
- Modify: `docs/api/` (all relevant API docs)

Per CLAUDE.md: "Any change to files in `app/api/` or `lib/api/` must include a corresponding update to the API documentation."

- [ ] **Step 1: Update API docs**

Update documentation for:
- Diamond endpoints (now unified with `lab_grown` filter)
- Melee endpoints (now unified with `lab_grown` filter)
- Order endpoints (new response shape with events and products)
- Cart endpoints (new config support)
- Shortlist endpoints (named shortlists)
- Invoice endpoints (new)

- [ ] **Step 2: Commit**

```bash
git add docs/api/
git commit -m "docs: update API documentation for schema redesign"
```
