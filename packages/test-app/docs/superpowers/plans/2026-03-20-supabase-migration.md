# Supabase + Drizzle Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the mock data layer (`/data`) to a self-hosted Supabase Postgres instance with Drizzle ORM, keeping API function signatures unchanged so pages require zero modifications.

**Architecture:** Schema-first approach — define all Drizzle tables upfront, generate migrations, seed data, then rewire API files one by one. Drizzle handles all DB queries; Supabase JS client is reserved for Auth + Storage (future). The `paginate` helper stays as-is (in-memory slicing) for this migration.

**Tech Stack:** Next.js 16, Drizzle ORM, postgres.js driver, Supabase CLI (local containers), TypeScript

**Spec:** `docs/superpowers/specs/2026-03-20-supabase-migration-design.md`

---

## File Map

### New Files (Created)

| File | Responsibility |
|------|---------------|
| `drizzle.config.ts` | Drizzle Kit configuration (schema path, migration output, DB credentials) |
| `.env.example` | Environment variable template for new developers |
| `db/client.ts` | Drizzle client instance (postgres.js driver + schema) |
| `db/supabase.ts` | Supabase JS client (Auth + Storage only) |
| `db/seed.ts` | TypeScript seed script (reads `/data`, inserts via Drizzle) |
| `db/schema/helpers.ts` | Shared column definitions (timestamps) |
| `db/schema/enums.ts` | pgEnum definitions (ProductType, OrderStatus, etc.) |
| `db/schema/lookups.ts` | All 19 lookup tables + relations |
| `db/schema/users.ts` | users, addresses, suppliers tables + relations |
| `db/schema/products.ts` | products, diamonds, gemstones, melee_lots tables + relations |
| `db/schema/jewelry.ts` | jewelry, mounts, ring_configs, available_metals/shapes tables + relations |
| `db/schema/orders.ts` | orders + 5 child tables + relations |
| `db/schema/commerce.ts` | carts, cart_items, shortlist_items, invoices tables + relations |
| `db/schema/media.ts` | product_images, certifications tables + relations |
| `db/schema/index.ts` | Re-exports all tables, relations, and inferred types |

### Modified Files

| File | Change |
|------|--------|
| `package.json` | Add dependencies + npm scripts |
| `lib/api/helpers.ts` | Remove `simulateLatency`, `resolveLookup`. Keep `paginate`. |
| `lib/api/diamonds.ts` | Replace in-memory data + Maps with Drizzle queries |
| `lib/api/lab-grown-diamonds.ts` | Same as diamonds.ts |
| `lib/api/gemstones.ts` | Same pattern, gemstone-specific lookups |
| `lib/api/natural-melee.ts` | Same pattern, melee-specific fields |
| `lib/api/lab-grown-melee.ts` | Same as natural-melee.ts |
| `lib/api/jewelry.ts` | Replace Map-based joins with Drizzle relational queries |
| `lib/api/orders.ts` | Replace 7-table Map-based joins with Drizzle relational queries |
| `lib/api/users.ts` | Replace array lookup with Drizzle query |
| `lib/api/addresses.ts` | Replace array filter with Drizzle query |
| `lib/api/cart.ts` | Replace array joins with Drizzle query + mutations |
| `lib/api/shortlists.ts` | Replace array filter with Drizzle query |
| `supabase/config.toml` | Add product-images storage bucket |

### Deleted Files (Final Cleanup)

| Path | Reason |
|------|--------|
| `data/` (entire directory) | Replaced by Postgres data |
| `types/` (entire directory) | Replaced by Drizzle `$inferSelect` types |
| `db/seed.ts` | Replaced by `supabase/seed.sql` |

---

## Task 1: Install Dependencies and Initialize Supabase

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install production dependencies**

Run: `npm install drizzle-orm postgres @supabase/supabase-js`

- [ ] **Step 2: Install dev dependencies**

Run: `npm install --save-dev drizzle-kit supabase tsx`

- [ ] **Step 3: Initialize Supabase**

Run: `npx supabase init`

This creates the `supabase/` directory with `config.toml`.

- [ ] **Step 4: Add storage bucket to Supabase config**

In `supabase/config.toml`, add at the end:

```toml
[storage.buckets.product-images]
public = true
```

- [ ] **Step 5: Add npm scripts to package.json**

Add to the `"scripts"` section of `package.json`:

```json
"db:start": "supabase start",
"db:stop": "supabase stop",
"db:seed": "tsx db/seed.ts",
"db:reset": "supabase db reset",
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio"
```

- [ ] **Step 6: Start Supabase containers**

Run: `npm run db:start`

This downloads Docker images on first run (~2-5 min). Once started, it prints the local URLs and anon key.

- [ ] **Step 7: Verify `.env.local` is in `.gitignore`**

Run: `grep '.env.local' .gitignore`

Expected: Should find a match. If not, add `.env.local` to `.gitignore` before proceeding.

- [ ] **Step 8: Create `.env.example`**

Create `.env.example` at project root:

```
# Supabase local development
# Run `npx supabase status` after `npm run db:start` to get the anon key
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste anon key from supabase status>
```

- [ ] **Step 9: Create `.env.local`**

Copy `.env.example` to `.env.local` and fill in the actual anon key from `npx supabase status`.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json supabase/ .env.example
git commit -m "feat: initialize Supabase and install Drizzle dependencies"
```

---

## Task 2: Create Drizzle Config and DB Clients

**Files:**
- Create: `drizzle.config.ts`
- Create: `db/client.ts`
- Create: `db/supabase.ts`

- [ ] **Step 1: Create `drizzle.config.ts`**

```ts
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./db/schema/index.ts",
  out: "./supabase/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

- [ ] **Step 2: Create `db/client.ts`**

```ts
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL!

const client = postgres(connectionString)
export const db = drizzle(client, { schema })
```

- [ ] **Step 3: Create `db/supabase.ts`**

```ts
import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)
```

- [ ] **Step 4: Commit**

```bash
git add drizzle.config.ts db/client.ts db/supabase.ts
git commit -m "feat: add Drizzle config and database client files"
```

Note: `db/client.ts` will have a TypeScript error until `db/schema/index.ts` exists (Task 9). This is expected.

---

## Task 3: Drizzle Schema — Enums and Helpers

**Files:**
- Create: `db/schema/helpers.ts`
- Create: `db/schema/enums.ts`

- [ ] **Step 1: Create `db/schema/helpers.ts`**

```ts
import { timestamp } from "drizzle-orm/pg-core"

export const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}
```

- [ ] **Step 2: Create `db/schema/enums.ts`**

```ts
import { pgEnum } from "drizzle-orm/pg-core"

export const productTypeEnum = pgEnum("product_type", [
  "natural_diamond",
  "lab_grown_diamond",
  "gemstone",
  "natural_melee",
  "lab_grown_melee",
  "jewelry",
])

// Note: "manufacturing" is a deliberate addition (not in current mock data).
// The OrderStatus type in lib/api/orders.ts must be updated to include it.
export const orderStatusEnum = pgEnum("order_status", [
  "requested",
  "confirmed",
  "manufacturing",
  "shipped",
  "delivered",
  "returned",
  "cancelled",
  "delayed",
  "sold_out",
])

export const orderProgressStepEnum = pgEnum("order_progress_step", [
  "requested",
  "confirmed",
  "shipped",
  "out_for_delivery",
  "delivered",
])

export const imageTypeEnum = pgEnum("image_type", [
  "main",
  "additional",
  "angle",
  "front",
  "side",
  "down",
  "variant",
  "v360",
])

export const orderItemTypeEnum = pgEnum("order_item_type", [
  "diamond",
  "gemstone",
  "melee",
  "wedding_ring",
])
```

- [ ] **Step 3: Commit**

```bash
git add db/schema/helpers.ts db/schema/enums.ts
git commit -m "feat: add Drizzle schema helpers and enum definitions"
```

---

## Task 4: Drizzle Schema — Lookups

**Files:**
- Create: `db/schema/lookups.ts`

All 19 lookup tables share the same shape: `id (UUID PK)`, `value (text)`, `sort_order (integer)`.

- [ ] **Step 1: Create `db/schema/lookups.ts`**

```ts
import { pgTable, uuid, text, integer } from "drizzle-orm/pg-core"

function lookupTable(name: string) {
  return pgTable(name, {
    id: uuid("id").primaryKey().defaultRandom(),
    value: text("value").notNull(),
    sortOrder: integer("sort_order").notNull(),
  })
}

export const shapes = lookupTable("shapes")
export const diamondColors = lookupTable("diamond_colors")
export const clarityGrades = lookupTable("clarity_grades")
export const cutGrades = lookupTable("cut_grades")
export const polishGrades = lookupTable("polish_grades")
export const symmetryGrades = lookupTable("symmetry_grades")
export const fluorescenceLevels = lookupTable("fluorescence_levels")
export const gemstoneTypes = lookupTable("gemstone_types")
export const treatments = lookupTable("treatments")
export const origins = lookupTable("origins")
export const certificationLabs = lookupTable("certification_labs")
export const metalTypes = lookupTable("metal_types")
export const metalQualities = lookupTable("metal_qualities")
export const metalColors = lookupTable("metal_colors")
export const bandStyles = lookupTable("band_styles")
export const jewelryTypes = lookupTable("jewelry_types")
export const paymentMethods = lookupTable("payment_methods")
export const countries = lookupTable("countries")
export const currencies = lookupTable("currencies")
```

Note: The `lookupTable` helper avoids repeating the same 3 columns 19 times. All lookup tables are structurally identical. No relations needed — lookups are referenced BY other tables, not the other way around.

- [ ] **Step 2: Commit**

```bash
git add db/schema/lookups.ts
git commit -m "feat: add Drizzle schema for 19 lookup tables"
```

---

## Task 5: Drizzle Schema — Users, Addresses, Suppliers

**Files:**
- Create: `db/schema/users.ts`

- [ ] **Step 1: Create `db/schema/users.ts`**

Copy the exact table definitions from the spec (lines 322-357) plus add relations. The file needs:

- `users` table — with `authUserId` (nullable, for future Supabase Auth), `name`, `email`, `currencyId` FK to `currencies`
- `addresses` table — with `userId` FK to `users`, `countryId` FK to `countries`, `isDefault`, soft delete
- `suppliers` table — with `countryId` FK to `countries`, soft delete
**Drizzle relations (exact names — these MUST match the `with:` keys used in API queries):**

```ts
export const usersRelations = relations(users, ({ one, many }) => ({
  currency: one(currencies, { fields: [users.currencyId], references: [currencies.id] }),
  addresses: many(addresses),
}))

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
  country: one(countries, { fields: [addresses.countryId], references: [countries.id] }),
}))

export const suppliersRelations = relations(suppliers, ({ one }) => ({
  country: one(countries, { fields: [suppliers.countryId], references: [countries.id] }),
}))
```

**Reference:** Spec lines 319-358 for exact column definitions.

Important: Import `currencies` and `countries` from `./lookups`. Import `relations` from `drizzle-orm`.

- [ ] **Step 2: Commit**

```bash
git add db/schema/users.ts
git commit -m "feat: add Drizzle schema for users, addresses, suppliers"
```

---

## Task 6: Drizzle Schema — Products

**Files:**
- Create: `db/schema/products.ts`

- [ ] **Step 1: Create `db/schema/products.ts`**

Four tables plus relations:

- `products` — base table with `supplierId` FK to `suppliers`, `productType` enum, pricing, timestamps, soft delete
- `diamonds` — extension table with `productId` FK (unique) to `products`, all diamond spec FKs to lookup tables
- `gemstones` — extension table with `productId` FK (unique), gemstone-specific FKs. Note: `color` and `clarity` are free text (NOT lookup FKs)
- `meleeLots` — extension table with `productId` FK (unique), range fields as text, `quantity` as integer

**Drizzle relations (exact names — must match `with:` keys in API queries):**

```ts
export const productsRelations = relations(products, ({ one, many }) => ({
  supplier: one(suppliers, { fields: [products.supplierId], references: [suppliers.id] }),
  diamond: one(diamonds),       // inverse side — diamonds.productId → products.id
  gemstone: one(gemstones),     // inverse side
  meleeLot: one(meleeLots),     // inverse side
  images: many(productImages),  // import from ./media
  certification: one(certifications), // import from ./media — one-to-one (see note below)
}))

export const diamondsRelations = relations(diamonds, ({ one }) => ({
  product: one(products, { fields: [diamonds.productId], references: [products.id] }),
  shape: one(shapes, { fields: [diamonds.shapeId], references: [shapes.id] }),
  color: one(diamondColors, { fields: [diamonds.colorId], references: [diamondColors.id] }),
  clarity: one(clarityGrades, { fields: [diamonds.clarityId], references: [clarityGrades.id] }),
  cut: one(cutGrades, { fields: [diamonds.cutId], references: [cutGrades.id] }),
  polish: one(polishGrades, { fields: [diamonds.polishId], references: [polishGrades.id] }),
  symmetry: one(symmetryGrades, { fields: [diamonds.symmetryId], references: [symmetryGrades.id] }),
  fluorescence: one(fluorescenceLevels, { fields: [diamonds.fluorescenceId], references: [fluorescenceLevels.id] }),
}))

export const gemstonesRelations = relations(gemstones, ({ one }) => ({
  product: one(products, { fields: [gemstones.productId], references: [products.id] }),
  gemstoneType: one(gemstoneTypes, { fields: [gemstones.gemstoneTypeId], references: [gemstoneTypes.id] }),
  shape: one(shapes, { fields: [gemstones.shapeId], references: [shapes.id] }),
  cut: one(cutGrades, { fields: [gemstones.cutId], references: [cutGrades.id] }),
  treatment: one(treatments, { fields: [gemstones.treatmentId], references: [treatments.id] }),
  origin: one(origins, { fields: [gemstones.originId], references: [origins.id] }),
}))

export const meleLotsRelations = relations(meleeLots, ({ one }) => ({
  product: one(products, { fields: [meleeLots.productId], references: [products.id] }),
  shape: one(shapes, { fields: [meleeLots.shapeId], references: [shapes.id] }),
  cut: one(cutGrades, { fields: [meleeLots.cutId], references: [cutGrades.id] }),
}))
```

**Important:** The `certification` relation on products is one-to-one (each product has at most one cert). To make this work, add `.unique()` to `certifications.productId` in `db/schema/media.ts`. See Task 9 for details.

**Reference:** Spec lines 106-171 for exact column definitions.

Important: Import `suppliers` from `./users`, `productImages` and `certifications` from `./media`, and all relevant lookups from `./lookups`. Import `relations` from `drizzle-orm`.

- [ ] **Step 2: Commit**

```bash
git add db/schema/products.ts
git commit -m "feat: add Drizzle schema for products, diamonds, gemstones, melee lots"
```

---

## Task 7: Drizzle Schema — Jewelry

**Files:**
- Create: `db/schema/jewelry.ts`

- [ ] **Step 1: Create `db/schema/jewelry.ts`**

Five tables plus relations:

- `jewelry` — with `productId` FK (unique) to products, `jewelryTypeId` FK, `bandStyleId` FK, pricing variants
- `jewelryMounts` — with `jewelryId` FK, `metalWeight` (nullable numeric), `metalQualityId` FK (nullable)
- `ringConfigurations` — with `jewelryId` FK, `metalTypeId`, `metalQualityId` (nullable), `metalColorId`, `stoneShapeId` FKs
- `jewelryAvailableMetals` — with `jewelryId` FK, `metalTypeId`, `metalColorId` FKs
- `jewelryAvailableShapes` — with `jewelryId` FK, `shapeId` FK

**Drizzle relations (exact names):**

```ts
export const jewelryRelations = relations(jewelry, ({ one, many }) => ({
  product: one(products, { fields: [jewelry.productId], references: [products.id] }),
  jewelryType: one(jewelryTypes, { fields: [jewelry.jewelryTypeId], references: [jewelryTypes.id] }),
  bandStyle: one(bandStyles, { fields: [jewelry.bandStyleId], references: [bandStyles.id] }),
  mounts: many(jewelryMounts),
  ringConfigurations: many(ringConfigurations),
  availableMetals: many(jewelryAvailableMetals),
  availableShapes: many(jewelryAvailableShapes),
}))

export const jewelryMountsRelations = relations(jewelryMounts, ({ one }) => ({
  jewelry: one(jewelry, { fields: [jewelryMounts.jewelryId], references: [jewelry.id] }),
  metalQuality: one(metalQualities, { fields: [jewelryMounts.metalQualityId], references: [metalQualities.id] }),
}))

export const ringConfigurationsRelations = relations(ringConfigurations, ({ one }) => ({
  jewelry: one(jewelry, { fields: [ringConfigurations.jewelryId], references: [jewelry.id] }),
  metalType: one(metalTypes, { fields: [ringConfigurations.metalTypeId], references: [metalTypes.id] }),
  metalQuality: one(metalQualities, { fields: [ringConfigurations.metalQualityId], references: [metalQualities.id] }),
  metalColor: one(metalColors, { fields: [ringConfigurations.metalColorId], references: [metalColors.id] }),
  stoneShape: one(shapes, { fields: [ringConfigurations.stoneShapeId], references: [shapes.id] }),
}))

export const jewelryAvailableMetalsRelations = relations(jewelryAvailableMetals, ({ one }) => ({
  jewelry: one(jewelry, { fields: [jewelryAvailableMetals.jewelryId], references: [jewelry.id] }),
  metalType: one(metalTypes, { fields: [jewelryAvailableMetals.metalTypeId], references: [metalTypes.id] }),
  metalColor: one(metalColors, { fields: [jewelryAvailableMetals.metalColorId], references: [metalColors.id] }),
}))

export const jewelryAvailableShapesRelations = relations(jewelryAvailableShapes, ({ one }) => ({
  jewelry: one(jewelry, { fields: [jewelryAvailableShapes.jewelryId], references: [jewelry.id] }),
  shape: one(shapes, { fields: [jewelryAvailableShapes.shapeId], references: [shapes.id] }),
}))
```

**Reference:** Spec lines 173-220 for exact column definitions.

Important: Import `products` from `./products` and relevant lookups from `./lookups`. Import `relations` from `drizzle-orm`.

**Note:** Jewelry uses `jewelry.id` as its primary identifier (not `product.id`). The `fetchJewelryItem(id)` function filters by jewelry ID. This differs from diamonds/gemstones/melee where the product ID is used.

- [ ] **Step 2: Commit**

```bash
git add db/schema/jewelry.ts
git commit -m "feat: add Drizzle schema for jewelry and configuration tables"
```

---

## Task 8: Drizzle Schema — Orders

**Files:**
- Create: `db/schema/orders.ts`

- [ ] **Step 1: Create `db/schema/orders.ts`**

Six tables plus relations:

- `orders` — with `userId` FK, `deliveryAddressId` FK, `status` enum, `orderDate`/`estimatedDelivery` as `date` type, pricing, timestamps, soft delete
- `orderLineItems` — with `orderId` FK, `productId` FK (nullable — product may be deleted), `productType` enum, snapshot fields (title, subtitle, typeLabel, imageUrl, prices, hasCertBadge)
- `orderProgress` — with `orderId` FK, `step` enum, `stepDate` text, `completed` boolean, `sortOrder` integer
- `orderUpdates` — with `orderId` FK, `name`, `date`, `time` text fields, `description` nullable
- `orderItemDetails` — with `orderId` FK, 20 nullable text fields for spec snapshots (shape, carat, color, clarity, cut, polish, symmetry, fluorescence, measurements, tablePct, depthPct, ratio, crownAngle, crownHeight, pavilionAngle, pavilionDepth, girdle, culet, canadaMark, foreverMark)
- `orderSummaries` — with `orderId` FK, `requestedOn`, `estDelivery`, `approvedBy` text, `stonesCount` integer, pricing numerics

**Drizzle relations (exact names):**

```ts
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  deliveryAddress: one(addresses, { fields: [orders.deliveryAddressId], references: [addresses.id] }),
  lineItems: many(orderLineItems),
  progress: many(orderProgress),
  updates: many(orderUpdates),
  itemDetails: one(orderItemDetails),
  summary: one(orderSummaries),
  invoice: one(invoices), // defined in commerce.ts, imported here
}))

export const orderLineItemsRelations = relations(orderLineItems, ({ one }) => ({
  order: one(orders, { fields: [orderLineItems.orderId], references: [orders.id] }),
}))

export const orderProgressRelations = relations(orderProgress, ({ one }) => ({
  order: one(orders, { fields: [orderProgress.orderId], references: [orders.id] }),
}))

export const orderUpdatesRelations = relations(orderUpdates, ({ one }) => ({
  order: one(orders, { fields: [orderUpdates.orderId], references: [orders.id] }),
}))

export const orderItemDetailsRelations = relations(orderItemDetails, ({ one }) => ({
  order: one(orders, { fields: [orderItemDetails.orderId], references: [orders.id] }),
}))

export const orderSummariesRelations = relations(orderSummaries, ({ one }) => ({
  order: one(orders, { fields: [orderSummaries.orderId], references: [orders.id] }),
}))
```

Import `users` and `addresses` from `./users`, `invoices` from `./commerce`.

**Reference:** Spec lines 222-317 for exact column definitions.

- [ ] **Step 2: Commit**

```bash
git add db/schema/orders.ts
git commit -m "feat: add Drizzle schema for orders and child tables"
```

---

## Task 9: Drizzle Schema — Commerce and Media

**Files:**
- Create: `db/schema/commerce.ts`
- Create: `db/schema/media.ts`

- [ ] **Step 1: Create `db/schema/commerce.ts`**

Four tables plus relations:

- `carts` — with `userId` FK, timestamps
- `cartItems` — with `cartId` FK, `productId` FK, `quantity` integer, `addedAt` timestamp
- `shortlistItems` — with `userId` FK, `productId` FK, `addedAt` timestamp
- `invoices` — with `orderId` FK, `invoiceNumber`, `paymentMethodId` FK, `issueDate`/`dueDate` as date, timestamps

**Drizzle relations:**

```ts
export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  items: many(cartItems),
}))

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}))

export const shortlistItemsRelations = relations(shortlistItems, ({ one }) => ({
  user: one(users, { fields: [shortlistItems.userId], references: [users.id] }),
  product: one(products, { fields: [shortlistItems.productId], references: [products.id] }),
}))

export const invoicesRelations = relations(invoices, ({ one }) => ({
  order: one(orders, { fields: [invoices.orderId], references: [orders.id] }),
  paymentMethod: one(paymentMethods, { fields: [invoices.paymentMethodId], references: [paymentMethods.id] }),
}))
```

**Reference:** Spec lines 360-394 for exact column definitions.

- [ ] **Step 2: Create `db/schema/media.ts`**

Two tables plus relations:

- `productImages` — with `productId` FK, `url`, `imageType` enum, `sortOrder`, `isThumbnail`
- `certifications` — with `productId` FK, `labId` FK, `certificateNumber`

**Important:** Add `.unique()` to `certifications.productId` — each product has at most one certification. This makes the `certification` relation on products a one-to-one (not one-to-many), which is required for the API queries in Tasks 13-18 to work correctly.

```ts
export const certifications = pgTable("certifications", {
  // ...
  productId: uuid("product_id").references(() => products.id).notNull().unique(), // <-- .unique()
  // ...
})
```

**Drizzle relations:**

```ts
export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}))

export const certificationsRelations = relations(certifications, ({ one }) => ({
  product: one(products, { fields: [certifications.productId], references: [products.id] }),
  lab: one(certificationLabs, { fields: [certifications.labId], references: [certificationLabs.id] }),
}))
```

**Reference:** Spec lines 396-415 for exact column definitions.

- [ ] **Step 3: Commit**

```bash
git add db/schema/commerce.ts db/schema/media.ts
git commit -m "feat: add Drizzle schema for commerce and media tables"
```

---

## Task 10: Schema Index, Generate Migration, Verify

**Files:**
- Create: `db/schema/index.ts`

- [ ] **Step 1: Create `db/schema/index.ts`**

This file re-exports everything from all schema files so `db/client.ts` can import `* as schema`:

```ts
export * from "./enums"
export * from "./helpers"
export * from "./lookups"
export * from "./users"
export * from "./products"
export * from "./jewelry"
export * from "./orders"
export * from "./commerce"
export * from "./media"
```

- [ ] **Step 2: Run typecheck on schema**

Run: `npx tsc --noEmit`

Fix any import errors (circular references between schema files, missing imports). Common issue: `orders.ts` references `addresses` from `users.ts` and `invoices` from `commerce.ts` references `orders` — ensure imports are correct.

- [ ] **Step 3: Generate the migration**

Run: `npm run db:generate`

Expected: Creates a SQL migration file in `supabase/migrations/` with all CREATE TABLE statements, enums, and foreign keys.

- [ ] **Step 4: Apply the migration**

Run: `npm run db:migrate`

Expected: All tables created in the local Supabase Postgres instance.

- [ ] **Step 5: Verify in Supabase Studio**

Open `http://127.0.0.1:54323` in a browser. Navigate to the Table Editor. Confirm all tables exist with the correct columns and relationships.

- [ ] **Step 6: Commit**

```bash
git add db/schema/index.ts supabase/migrations/
git commit -m "feat: add schema index and generate initial migration"
```

---

## Task 11: Seed Script

**Files:**
- Create: `db/seed.ts`

- [ ] **Step 1: Create `db/seed.ts`**

The seed script imports all mock data from `/data` and inserts it into the database via Drizzle. Insertion order respects FK constraints.

```ts
import { db } from "./client"
import * as schema from "./schema"

// Import lookups from the barrel file (they use re-exported default exports)
import {
  SHAPES, DIAMOND_COLORS, CLARITY_GRADES, CUT_GRADES, POLISH_GRADES,
  SYMMETRY_GRADES, FLUORESCENCE_LEVELS, GEMSTONE_TYPES, TREATMENTS,
  ORIGINS, CERTIFICATION_LABS, METAL_TYPES, METAL_QUALITIES, METAL_COLORS,
  BAND_STYLES, JEWELRY_TYPES, PAYMENT_METHODS, COUNTRIES, CURRENCIES,
} from "@/data/lookups"

// Import entity data (each file uses `export default`, so use default import)
import PRODUCTS from "@/data/products"
import DIAMONDS from "@/data/diamonds"
import GEMSTONES from "@/data/gemstones"
import MELEE_LOTS from "@/data/melee-lots"
import JEWELRY from "@/data/jewelry"
import JEWELRY_MOUNTS from "@/data/jewelry-mounts"
import RING_CONFIGURATIONS from "@/data/ring-configurations"
import JEWELRY_AVAILABLE_METALS from "@/data/jewelry-available-metals"
import JEWELRY_AVAILABLE_SHAPES from "@/data/jewelry-available-shapes"
import PRODUCT_IMAGES from "@/data/product-images"
import CERTIFICATIONS from "@/data/certifications"
import SUPPLIERS from "@/data/suppliers"
import USERS from "@/data/users"
import ADDRESSES from "@/data/addresses"
import ORDERS from "@/data/orders"
import ORDER_LINE_ITEMS from "@/data/order-line-items"
import ORDER_PROGRESS from "@/data/order-progress"
import ORDER_UPDATES from "@/data/order-updates"
import ORDER_ITEM_DETAILS from "@/data/order-item-details"
import ORDER_SUMMARIES from "@/data/order-summaries"
import INVOICES from "@/data/invoices"
import CARTS from "@/data/carts"
import CART_ITEMS from "@/data/cart-items"
import SHORTLISTS from "@/data/shortlists"

async function seed() {
  console.log("Seeding database...")

  // 1. Lookups (no dependencies)
  console.log("  Seeding lookups...")
  await db.insert(schema.shapes).values(SHAPES)
  await db.insert(schema.diamondColors).values(DIAMOND_COLORS)
  await db.insert(schema.clarityGrades).values(CLARITY_GRADES)
  await db.insert(schema.cutGrades).values(CUT_GRADES)
  await db.insert(schema.polishGrades).values(POLISH_GRADES)
  await db.insert(schema.symmetryGrades).values(SYMMETRY_GRADES)
  await db.insert(schema.fluorescenceLevels).values(FLUORESCENCE_LEVELS)
  await db.insert(schema.gemstoneTypes).values(GEMSTONE_TYPES)
  await db.insert(schema.treatments).values(TREATMENTS)
  await db.insert(schema.origins).values(ORIGINS)
  await db.insert(schema.certificationLabs).values(CERTIFICATION_LABS)
  await db.insert(schema.metalTypes).values(METAL_TYPES)
  await db.insert(schema.metalQualities).values(METAL_QUALITIES)
  await db.insert(schema.metalColors).values(METAL_COLORS)
  await db.insert(schema.bandStyles).values(BAND_STYLES)
  await db.insert(schema.jewelryTypes).values(JEWELRY_TYPES)
  await db.insert(schema.paymentMethods).values(PAYMENT_METHODS)
  await db.insert(schema.countries).values(COUNTRIES)
  await db.insert(schema.currencies).values(CURRENCIES)

  // 2. Users + suppliers + addresses
  console.log("  Seeding users, suppliers, addresses...")
  await db.insert(schema.suppliers).values(SUPPLIERS)
  await db.insert(schema.users).values(USERS)
  await db.insert(schema.addresses).values(ADDRESSES)

  // 3. Products + extensions
  console.log("  Seeding products...")
  await db.insert(schema.products).values(PRODUCTS)
  await db.insert(schema.diamonds).values(DIAMONDS)
  await db.insert(schema.gemstones).values(GEMSTONES)
  await db.insert(schema.meleeLots).values(MELEE_LOTS)
  await db.insert(schema.jewelry).values(JEWELRY)

  // 4. Jewelry configuration
  console.log("  Seeding jewelry config...")
  await db.insert(schema.jewelryMounts).values(JEWELRY_MOUNTS)
  await db.insert(schema.ringConfigurations).values(RING_CONFIGURATIONS)
  await db.insert(schema.jewelryAvailableMetals).values(JEWELRY_AVAILABLE_METALS)
  await db.insert(schema.jewelryAvailableShapes).values(JEWELRY_AVAILABLE_SHAPES)

  // 5. Media
  console.log("  Seeding media...")
  await db.insert(schema.productImages).values(PRODUCT_IMAGES)
  await db.insert(schema.certifications).values(CERTIFICATIONS)

  // 6. Orders + child tables
  console.log("  Seeding orders...")
  await db.insert(schema.orders).values(ORDERS)
  await db.insert(schema.orderLineItems).values(ORDER_LINE_ITEMS)
  await db.insert(schema.orderProgress).values(ORDER_PROGRESS)
  await db.insert(schema.orderUpdates).values(ORDER_UPDATES)
  await db.insert(schema.orderItemDetails).values(ORDER_ITEM_DETAILS)
  await db.insert(schema.orderSummaries).values(ORDER_SUMMARIES)

  // 7. Invoices
  console.log("  Seeding invoices...")
  await db.insert(schema.invoices).values(INVOICES)

  // 8. Commerce
  console.log("  Seeding commerce...")
  await db.insert(schema.carts).values(CARTS)
  await db.insert(schema.cartItems).values(CART_ITEMS)
  await db.insert(schema.shortlistItems).values(SHORTLISTS)

  console.log("Seed complete!")
  process.exit(0)
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
```

**Critical: snake_case to camelCase mapping.** ALL mock data files use snake_case keys (`product_id`, `sort_order`, `delivery_address_id`), but Drizzle's `.values()` expects the camelCase column names from the schema (`productId`, `sortOrder`, `deliveryAddressId`). Every `.values()` call MUST map the data first. Add this helper at the top of the seed script and wrap every insert:

```ts
function toCamel<T extends Record<string, unknown>>(obj: T) {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    result[camelKey] = value
  }
  return result
}
```

Then every insert becomes:
```ts
await db.insert(schema.shapes).values(SHAPES.map(toCamel))
await db.insert(schema.products).values(PRODUCTS.map(toCamel))
// ... etc for ALL tables
```

**Note on `Number()` conversions:** The seed script does NOT need `Number()` conversions. Mock data stores numeric fields as JS `number` values, and Drizzle/Postgres accepts these fine for `NUMERIC` columns. The `Number()` conversions are only needed on the *read* side (API files in Tasks 13-19) where postgres.js returns `NUMERIC` values as strings.

- [ ] **Step 2: Run the seed**

Run: `npm run db:seed`

Expected: All `console.log` messages print in order, ending with "Seed complete!". If FK violations occur, check insertion order matches the dependency chain.

- [ ] **Step 3: Verify seed data**

Open Supabase Studio (`http://127.0.0.1:54323`) and spot-check:
- `shapes` table has 13 rows
- `products` table has ~90 rows
- `orders` table has 10 rows
- `users` table has 3 rows
- `certifications` table has ~95 rows

- [ ] **Step 4: Commit**

```bash
git add db/seed.ts
git commit -m "feat: add seed script to populate database from mock data"
```

---

## Task 12: Rewire `lib/api/helpers.ts`

**Files:**
- Modify: `lib/api/helpers.ts`

- [ ] **Step 1: Remove `simulateLatency` and `resolveLookup`**

The file currently exports:
- `simulateLatency` — no longer needed (real DB latency replaces it)
- `resolveLookup` — no longer needed (Drizzle JOINs resolve lookups)
- `paginate` — KEEP as-is
- `PaginatedResult` — KEEP
- `PaginatedOptions` — KEEP

Remove the `simulateLatency` function and the `resolveLookup` function. Remove the `LookupItem` type import. Keep `paginate`, `PaginatedResult`, and `PaginatedOptions` exactly as they are.

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`

Expected: Errors in other API files that still import `simulateLatency` and `resolveLookup`. This is expected — those files get rewired in subsequent tasks.

- [ ] **Step 3: Commit**

```bash
git add lib/api/helpers.ts
git commit -m "refactor: remove simulateLatency and resolveLookup from helpers"
```

---

## Task 13: Rewire `lib/api/diamonds.ts`

**Files:**
- Modify: `lib/api/diamonds.ts`

This is the template for all product category API files. Get this right and the rest follow the same pattern.

- [ ] **Step 1: Rewrite `lib/api/diamonds.ts`**

Replace the entire file contents. The key changes:
1. Import `db` from `@/db/client` instead of data files
2. Import schema tables from `@/db/schema`
3. Replace module-level Map building with a `resolveNaturalDiamonds()` async function that queries via Drizzle
4. Use `db.query.products.findMany()` with `where` filter on `productType` and `with:` for nested relations
5. Map `numeric` DB values to `number` with `Number()` calls
6. Keep the `DiamondItem` interface unchanged
7. Keep function signatures unchanged: `fetchDiamondList`, `fetchDiamondItem`, `fetchRelatedDiamonds`

The Drizzle query pattern:

```ts
import { db } from "@/db/client"
import { eq, and, ne, isNull } from "drizzle-orm"
import { products } from "@/db/schema"
import { paginate, type PaginatedOptions, type PaginatedResult } from "./helpers"

// DiamondItem interface stays exactly the same as current

async function resolveAllDiamonds(): Promise<DiamondItem[]> {
  const rows = await db.query.products.findMany({
    where: and(
      eq(products.productType, "natural_diamond"),
      isNull(products.deletedAt),
    ),
    with: {
      diamond: {
        with: {
          shape: true,
          color: true,
          clarity: true,
          cut: true,
          polish: true,
          symmetry: true,
          fluorescence: true,
        },
      },
      images: true,
      certification: {
        with: {
          lab: true,
        },
      },
    },
  })

  return rows
    .filter((row) => row.diamond)
    .map((row) => {
      const d = row.diamond!
      const mainImage = row.images.find((i) => i.imageType === "main")
      const additionalImages = row.images
        .filter((i) => i.imageType === "additional")
        .sort((a, b) => a.sortOrder - b.sortOrder)

      return {
        id: row.id,
        stockId: row.stockId,
        shape: d.shape?.value ?? "Unknown",
        carat: Number(d.carat),
        color: d.color?.value ?? "Unknown",
        clarity: d.clarity?.value ?? "Unknown",
        cut: d.cut?.value ?? "Unknown",
        polish: d.polish?.value ?? "Unknown",
        symmetry: d.symmetry?.value ?? "Unknown",
        fluorescence: d.fluorescence?.value ?? "Unknown",
        certification: {
          lab: row.certification?.lab?.value ?? "Unknown",
          number: row.certification?.certificateNumber ?? "",
        },
        dimensions: {
          length: Number(d.lengthMm),
          width: Number(d.widthMm),
          depth: Number(d.depthMm),
        },
        tablePct: Number(d.tablePct),
        depthPct: Number(d.depthPct),
        price: Number(row.priceUsd),
        pricePerCarat: Number(row.pricePerCaratUsd),
        description: row.description,
        images: {
          main: mainImage?.url ?? "",
          additional: additionalImages.map((i) => i.url),
        },
      }
    })
}

export async function fetchDiamondList(
  options: PaginatedOptions,
): Promise<PaginatedResult<DiamondItem>> {
  const diamonds = await resolveAllDiamonds()
  return paginate(diamonds, options)
}

export async function fetchDiamondItem(
  id: string,
): Promise<DiamondItem | undefined> {
  const diamonds = await resolveAllDiamonds()
  return diamonds.find((d) => d.id === id)
}

export async function fetchRelatedDiamonds(
  excludeId: string,
  limit = 4,
): Promise<DiamondItem[]> {
  const diamonds = await resolveAllDiamonds()
  return diamonds.filter((d) => d.id !== excludeId).slice(0, limit)
}
```

**Important notes:**
- The `with:` nested relations require that the Drizzle relations in `db/schema/products.ts` include the diamond→lookup FK relations (e.g., `diamond.shape` → `shapes` table). Verify the relation names match what's used in the query.
- `Number()` is used on all `numeric` column values (carat, dimensions, prices, percentages).
- The `certification` relation on `products` must be defined as one-to-one (a product has at most one certification).
- The `images` relation on `products` must be defined as one-to-many.

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`

Fix any type errors. Common issues: relation names not matching, missing `Number()` conversions.

- [ ] **Step 3: Run the app and verify diamond pages**

Run: `npm run dev`

Open the natural diamonds browse page and a diamond detail page. Verify the data renders correctly and matches what was there before.

- [ ] **Step 4: Commit**

```bash
git add lib/api/diamonds.ts
git commit -m "refactor: rewire diamonds API to use Drizzle queries"
```

---

## Task 14: Rewire `lib/api/lab-grown-diamonds.ts`

**Files:**
- Modify: `lib/api/lab-grown-diamonds.ts`

- [ ] **Step 1: Rewrite `lib/api/lab-grown-diamonds.ts`**

Identical pattern to `diamonds.ts` from Task 13. The only differences:
- Filter: `eq(products.productType, "lab_grown_diamond")` instead of `"natural_diamond"`
- Interface name: `LabGrownDiamondItem` (same shape)
- Function names: `fetchLabGrownDiamondList`, `fetchLabGrownDiamondItem`, `fetchRelatedLabGrownDiamonds`

Copy the pattern from Task 13 and change these three things.

- [ ] **Step 2: Run typecheck and verify in browser**

Run: `npx tsc --noEmit && npm run dev`

Check lab-grown diamonds browse + detail pages.

- [ ] **Step 3: Commit**

```bash
git add lib/api/lab-grown-diamonds.ts
git commit -m "refactor: rewire lab-grown diamonds API to use Drizzle queries"
```

---

## Task 15: Rewire `lib/api/gemstones.ts`

**Files:**
- Modify: `lib/api/gemstones.ts`

- [ ] **Step 1: Rewrite `lib/api/gemstones.ts`**

Similar pattern to diamonds, but with gemstone-specific differences:
- Filter: `eq(products.productType, "gemstone")`
- Nested `with:` uses `gemstone` relation instead of `diamond`
- Gemstone lookups: `gemstoneType`, `shape`, `cut`, `treatment`, `origin` (NOT color/clarity — those are raw text)
- Interface: `GemstoneItem` with `type`, `treatment`, `origin` fields instead of `polish`, `symmetry`, `fluorescence`

Key difference from diamonds: `color` and `clarity` come directly from `gemstones.color` and `gemstones.clarity` as strings, NOT from lookup tables.

- [ ] **Step 2: Run typecheck and verify**

- [ ] **Step 3: Commit**

```bash
git add lib/api/gemstones.ts
git commit -m "refactor: rewire gemstones API to use Drizzle queries"
```

---

## Task 16: Rewire `lib/api/natural-melee.ts` and `lib/api/lab-grown-melee.ts`

**Files:**
- Modify: `lib/api/natural-melee.ts`
- Modify: `lib/api/lab-grown-melee.ts`

- [ ] **Step 1: Rewrite `lib/api/natural-melee.ts`**

Simpler than diamonds/gemstones:
- Filter: `eq(products.productType, "natural_melee")`
- Nested `with:` uses `meleeLot` relation
- Melee lookups: only `shape` and `cut` (2 lookups vs 7 for diamonds)
- Fields: `sizeRange`, `colorRange`, `clarityRange` are raw text; `quantity` is integer; `totalCaratWeight` is numeric
- Interface: `NaturalMeleeItem` with `totalPrice` instead of `price`, no certification

- [ ] **Step 2: Rewrite `lib/api/lab-grown-melee.ts`**

Identical to natural-melee.ts except:
- Filter: `eq(products.productType, "lab_grown_melee")`
- Interface: `LabGrownMeleeItem`
- Function names: `fetchLabGrownMeleeList`, etc.

- [ ] **Step 3: Run typecheck and verify both melee pages**

- [ ] **Step 4: Commit**

```bash
git add lib/api/natural-melee.ts lib/api/lab-grown-melee.ts
git commit -m "refactor: rewire melee APIs to use Drizzle queries"
```

---

## Task 17: Rewire `lib/api/jewelry.ts`

**Files:**
- Modify: `lib/api/jewelry.ts`

This is the second most complex API file (267 lines). The nested structure is deep.

- [ ] **Step 1: Rewrite `lib/api/jewelry.ts`**

Key changes from the simpler product files:
- No product type filter — the `jewelry` table is joined directly
- Needs `with:` for: product (parent), mounts, ringConfiguration, availableMetals, availableShapes, images (via product)
- Each available metal needs its metalType and metalColor resolved
- Each available shape needs its shape resolved
- Ring configuration needs metalType, metalQuality, metalColor, stoneShape resolved
- Images are organized by `imageType` into an object (not main/additional arrays)

The Drizzle query:

```ts
const rows = await db.query.jewelry.findMany({
  with: {
    product: {
      with: {
        images: true,
      },
    },
    mounts: {
      with: { metalQuality: true },
    },
    ringConfigurations: {
      with: {
        metalType: true,
        metalQuality: true,
        metalColor: true,
        stoneShape: true,
      },
    },
    availableMetals: {
      with: {
        metalType: true,
        metalColor: true,
      },
    },
    availableShapes: {
      with: { shape: true },
    },
    jewelryType: true,
    bandStyle: true,
  },
})
```

Then map each row into the `JewelryItem` interface, grouping available metals by metal type (deduplicating colors per type).

Read the current `lib/api/jewelry.ts` carefully — the `resolveAvailableMetals()` logic groups metals by `metalTypeId` and collects unique colors per type. Replicate this logic using the Drizzle query results.

- [ ] **Step 2: Run typecheck**

- [ ] **Step 3: Verify jewelry pages in browser**

Check the jewelry browse page and a jewelry detail page. Pay special attention to:
- Images rendering for all view angles (main, angle, front, side, down, v360)
- Metal/color options showing correctly
- Stone shape options showing correctly

- [ ] **Step 4: Commit**

```bash
git add lib/api/jewelry.ts
git commit -m "refactor: rewire jewelry API to use Drizzle queries"
```

---

## Task 18: Rewire `lib/api/orders.ts`

**Files:**
- Modify: `lib/api/orders.ts`

Most complex API file (304 lines). Joins 7 child tables.

- [ ] **Step 1: Rewrite `lib/api/orders.ts`**

The Drizzle query:

```ts
const rows = await db.query.orders.findMany({
  where: isNull(orders.deletedAt),
  with: {
    lineItems: true,
    progress: {
      orderBy: (p, { asc }) => [asc(p.sortOrder)],
    },
    updates: true,
    itemDetails: true,
    summary: true,
    invoice: {
      with: { paymentMethod: true },
    },
    deliveryAddress: {
      with: { country: true },
    },
  },
})
```

Key mapping logic to preserve:
1. **Progress object**: Convert the progress rows array into an object keyed by step name. Use the `STEP_KEY_MAP` from the current file: `{ requested: "requested", confirmed: "confirmed", shipped: "shipped", out_for_delivery: "outForDelivery", delivered: "delivered" }`. Each key maps to `{ date: string, completed: boolean }`.
2. **Delivery address**: Combine `postalCode` + `city` into city string (matches current behavior).
3. **Payment**: Resolve `paymentMethod` from the invoice's FK.
4. **Country**: Resolve from the address's FK.
5. **Numeric conversions**: `finalPriceUsd`, `finalPriceEur`, `snapshotPriceUsd`, `snapshotPriceEur`, and summary fields: `stonesPrice`, `shipping`, `vatRate`, `vatAmount`, `totalPrice` (all `numeric` → need `Number()`). Note: `stonesCount` is `integer` and does NOT need conversion.

Keep the `Order` interface and `OrderItemType` type exports identical. Keep `fetchOrderList` and `fetchOrder` signatures identical.

**Important:** The `OrderStatus` type must be updated to include `"manufacturing"` (a deliberate addition to the DB enum). Add it to the union type:
```ts
export type OrderStatus = "requested" | "confirmed" | "manufacturing" | "shipped" | ...
```

- [ ] **Step 2: Run typecheck**

- [ ] **Step 3: Verify orders pages**

Check the orders list page and an order detail page. Verify:
- Order status badges render correctly
- Progress timeline shows correct steps
- Item details (shape, carat, etc.) display
- Delivery address, payment info, and summary numbers are correct

- [ ] **Step 4: Commit**

```bash
git add lib/api/orders.ts
git commit -m "refactor: rewire orders API to use Drizzle queries"
```

---

## Task 19: Rewire Remaining API Files

**Files:**
- Modify: `lib/api/users.ts`
- Modify: `lib/api/addresses.ts`
- Modify: `lib/api/cart.ts`
- Modify: `lib/api/shortlists.ts`

These are small files (7-12 lines each).

- [ ] **Step 1: Rewrite `lib/api/users.ts`**

```ts
import { db } from "@/db/client"

export async function fetchCurrentUser() {
  const user = await db.query.users.findFirst()
  return user
}
```

- [ ] **Step 2: Rewrite `lib/api/addresses.ts`**

```ts
import { db } from "@/db/client"
import { eq, and, isNull } from "drizzle-orm"
import { addresses } from "@/db/schema"

export async function fetchAddresses(userId: string) {
  return db.query.addresses.findMany({
    where: and(eq(addresses.userId, userId), isNull(addresses.deletedAt)),
  })
}

export async function fetchAddress(id: string) {
  return db.query.addresses.findFirst({
    where: eq(addresses.id, id),
  })
}
```

- [ ] **Step 3: Rewrite `lib/api/cart.ts`**

```ts
import { db } from "@/db/client"
import { eq } from "drizzle-orm"
import { carts } from "@/db/schema"

export async function fetchCart(userId: string) {
  return db.query.carts.findFirst({
    where: eq(carts.userId, userId),
    with: { items: true },
  })
}
```

- [ ] **Step 4: Rewrite `lib/api/shortlists.ts`**

```ts
import { db } from "@/db/client"
import { eq } from "drizzle-orm"
import { shortlistItems } from "@/db/schema"

export async function fetchShortlist(userId: string) {
  return db.query.shortlistItems.findMany({
    where: eq(shortlistItems.userId, userId),
  })
}
```

- [ ] **Step 5: Run typecheck**

Run: `npx tsc --noEmit`

Expected: Should compile cleanly now that all API files are rewired.

- [ ] **Step 6: Commit**

```bash
git add lib/api/users.ts lib/api/addresses.ts lib/api/cart.ts lib/api/shortlists.ts
git commit -m "refactor: rewire users, addresses, cart, shortlists APIs to Drizzle"
```

---

## Task 20: Full Verification

**Files:** None (verification only)

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`

Expected: Zero errors.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Fix any linting issues.

- [ ] **Step 3: Run format**

Run: `npm run format`

- [ ] **Step 4: Run the app end-to-end**

Run: `npm run dev`

Navigate through every major page and verify data renders correctly:
- [ ] Natural diamonds browse + detail
- [ ] Lab-grown diamonds browse + detail
- [ ] Gemstones browse + detail
- [ ] Natural melee browse + detail
- [ ] Lab-grown melee browse + detail
- [ ] Jewelry browse + detail
- [ ] Orders list + order detail
- [ ] Any pages that show user info, cart, or shortlists

- [ ] **Step 5: Run a production build**

Run: `npm run build`

Expected: Build succeeds. This catches any issues that `dev` mode misses (e.g., missing env vars at build time).

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix: address typecheck, lint, and format issues from migration"
```

---

## Task 21: Generate `seed.sql` and Clean Up

**Files:**
- Create: `supabase/seed.sql`
- Delete: `data/` (entire directory)
- Delete: `types/` (entire directory)
- Delete: `db/seed.ts`

- [ ] **Step 1: Generate `seed.sql` from the seeded database**

Run: `pg_dump --data-only --inserts --no-owner --no-privileges -h 127.0.0.1 -p 54322 -U postgres postgres > supabase/seed.sql`

This dumps all data as INSERT statements. Verify the file is non-empty and contains rows for all tables.

- [ ] **Step 2: Test the seed.sql works with `supabase db reset`**

Run: `npm run db:reset`

This drops the database, re-applies all migrations, and runs `seed.sql`. Verify the app still works after reset.

- [ ] **Step 3: Verify no non-API imports from `/data` or `/types`**

Run: `grep -r "@/data\|@/types" app/ components/ lib/ --include="*.ts" --include="*.tsx" | grep -v "lib/api/" | grep -v "db/seed.ts"`

Expected: No matches. If there are matches, those files need to be updated to import from `@/db/schema` instead before proceeding.

- [ ] **Step 4: Remove `/data` directory**

Run: `rm -rf data/`

- [ ] **Step 5: Remove `/types` directory**

Run: `rm -rf types/`

- [ ] **Step 6: Remove `db/seed.ts`**

Run: `rm db/seed.ts`

- [ ] **Step 7: Remove the `db:seed` npm script**

Edit `package.json` — remove the `"db:seed": "tsx db/seed.ts"` script. The `tsx` devDependency can also be removed:

Run: `npm uninstall tsx`

- [ ] **Step 8: Final typecheck + build**

Run: `npm run typecheck && npm run build`

Expected: Both pass. No remaining imports from `@/data` or `@/types`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: remove mock data layer, types directory, and seed script

Replaced by Supabase Postgres + Drizzle ORM. Seed data now lives
in supabase/seed.sql, applied automatically by supabase db reset."
```

**Important:** This is the point-of-no-return commit. If something breaks after this, `git revert HEAD` restores the `/data` and `/types` directories.

---

## Task 22: Update Documentation

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md**

Add the new database commands to the Commands section:

```bash
npm run db:start   # Start Supabase containers (requires Docker)
npm run db:stop    # Stop Supabase containers
npm run db:reset   # Drop DB, apply migrations, seed data
npm run db:generate # Generate migration from schema changes
npm run db:migrate  # Apply pending migrations
npm run db:studio   # Open Drizzle Studio (DB browser)
```

Update the Architecture section to mention:
- **Database** — Supabase Postgres (local via Docker). Drizzle ORM for queries, Supabase JS client for Auth + Storage (future).
- **Schema** — Drizzle table definitions in `db/schema/`. Types are inferred via `$inferSelect`.
- **Seed data** — `supabase/seed.sql`, applied automatically by `supabase db reset`.

Update the Database Optimisations section — it currently says "still using local mock data". Replace with a note that the project uses Supabase Postgres with Drizzle ORM.

Remove any references to the `/data` directory or `/types` directory that no longer exist.

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md with Supabase + Drizzle setup"
```
