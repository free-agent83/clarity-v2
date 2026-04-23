# Jewelry Schema Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drop the `jewelry` parent table and `jewelry_types` lookup, promote subcategories (engagement rings, wedding bands, tennis bracelets) to standalone tables linking directly to `products`, add separate junction tables per subcategory, and update the full stack.

**Architecture:** Bottom-up: schema first (lookups, jewelry.ts rewrite, products.ts, commerce.ts), then migration squash, then seed data, then API + frontend together, then docs.

**Tech Stack:** Drizzle ORM, PostgreSQL (Supabase local), Next.js 16 App Router, TypeScript, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-25-jewelry-restructure.md`

---

### Task 1: Schema — rewrite jewelry.ts

**Files:**
- Modify: `db/schema/jewelry.ts` (full rewrite)

- [ ] **Step 1: Replace the entire file**

Replace `db/schema/jewelry.ts` with the new table definitions. The file should:

1. Import from `drizzle-orm/pg-core`: `pgTable`, `uuid`, `text`, `numeric`
2. Import `relations` from `drizzle-orm`
3. Import `bandStyles`, `metals`, `shapes` from `./lookups` (NOT `jewelryTypes` — it's gone)
4. Import `products` from `./products`
5. Define tables: `engagementRings`, `engagementRingAvailableMetals`, `engagementRingCompatibleStones`, `weddingBands`, `weddingBandAvailableMetals`, `tennisBracelets`
6. Define all relations

Full file content:

```typescript
import { pgTable, uuid, text, numeric } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { bandStyles, metals, shapes } from "./lookups"
import { products } from "./products"

// ---------------------------------------------------------------------------
// Engagement Rings
// ---------------------------------------------------------------------------

export const engagementRings = pgTable("engagement_rings", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull()
    .unique(),
  sku: text("sku").notNull(),
  bandStyleId: uuid("band_style_id")
    .references(() => bandStyles.id)
    .notNull(),
  ringWidthMm: numeric("ring_width_mm").notNull(),
})

export const engagementRingAvailableMetals = pgTable(
  "engagement_ring_available_metals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementRingId: uuid("engagement_ring_id")
      .references(() => engagementRings.id)
      .notNull(),
    metalId: uuid("metal_id")
      .references(() => metals.id)
      .notNull(),
    priceUsd: numeric("price_usd").notNull(),
  },
)

export const engagementRingCompatibleStones = pgTable(
  "engagement_ring_compatible_stones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    engagementRingId: uuid("engagement_ring_id")
      .references(() => engagementRings.id)
      .notNull(),
    shapeId: uuid("shape_id")
      .references(() => shapes.id)
      .notNull(),
    maxCarat: numeric("max_carat").notNull(),
  },
)

// ---------------------------------------------------------------------------
// Wedding Bands
// ---------------------------------------------------------------------------

export const weddingBands = pgTable("wedding_bands", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull()
    .unique(),
  sku: text("sku").notNull(),
  bandStyleId: uuid("band_style_id")
    .references(() => bandStyles.id)
    .notNull(),
  ringWidthMm: numeric("ring_width_mm").notNull(),
})

export const weddingBandAvailableMetals = pgTable(
  "wedding_band_available_metals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weddingBandId: uuid("wedding_band_id")
      .references(() => weddingBands.id)
      .notNull(),
    metalId: uuid("metal_id")
      .references(() => metals.id)
      .notNull(),
    priceUsd: numeric("price_usd").notNull(),
  },
)

// ---------------------------------------------------------------------------
// Tennis Bracelets
// ---------------------------------------------------------------------------

export const tennisBracelets = pgTable("tennis_bracelets", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull()
    .unique(),
  sku: text("sku").notNull(),
})

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const engagementRingsRelations = relations(
  engagementRings,
  ({ one, many }) => ({
    product: one(products, {
      fields: [engagementRings.productId],
      references: [products.id],
    }),
    bandStyle: one(bandStyles, {
      fields: [engagementRings.bandStyleId],
      references: [bandStyles.id],
    }),
    availableMetals: many(engagementRingAvailableMetals),
    compatibleStones: many(engagementRingCompatibleStones),
  }),
)

export const engagementRingAvailableMetalsRelations = relations(
  engagementRingAvailableMetals,
  ({ one }) => ({
    engagementRing: one(engagementRings, {
      fields: [engagementRingAvailableMetals.engagementRingId],
      references: [engagementRings.id],
    }),
    metal: one(metals, {
      fields: [engagementRingAvailableMetals.metalId],
      references: [metals.id],
    }),
  }),
)

export const engagementRingCompatibleStonesRelations = relations(
  engagementRingCompatibleStones,
  ({ one }) => ({
    engagementRing: one(engagementRings, {
      fields: [engagementRingCompatibleStones.engagementRingId],
      references: [engagementRings.id],
    }),
    shape: one(shapes, {
      fields: [engagementRingCompatibleStones.shapeId],
      references: [shapes.id],
    }),
  }),
)

export const weddingBandsRelations = relations(
  weddingBands,
  ({ one, many }) => ({
    product: one(products, {
      fields: [weddingBands.productId],
      references: [products.id],
    }),
    bandStyle: one(bandStyles, {
      fields: [weddingBands.bandStyleId],
      references: [bandStyles.id],
    }),
    availableMetals: many(weddingBandAvailableMetals),
  }),
)

export const weddingBandAvailableMetalsRelations = relations(
  weddingBandAvailableMetals,
  ({ one }) => ({
    weddingBand: one(weddingBands, {
      fields: [weddingBandAvailableMetals.weddingBandId],
      references: [weddingBands.id],
    }),
    metal: one(metals, {
      fields: [weddingBandAvailableMetals.metalId],
      references: [metals.id],
    }),
  }),
)

export const tennisBraceletsRelations = relations(
  tennisBracelets,
  ({ one }) => ({
    product: one(products, {
      fields: [tennisBracelets.productId],
      references: [products.id],
    }),
  }),
)
```

- [ ] **Step 2: Format and commit**

```bash
npm run format
git add db/schema/jewelry.ts
git commit -m "feat(db): rewrite jewelry schema — drop parent table, promote subcategories"
```

---

### Task 2: Schema — update lookups, products, commerce

**Files:**
- Modify: `db/schema/lookups.ts`
- Modify: `db/schema/products.ts`
- Modify: `db/schema/commerce.ts`

- [ ] **Step 1: Remove `jewelryTypes` from lookups.ts**

Delete the entire `jewelryTypes` custom table definition (lines 32-37):
```typescript
export const jewelryTypes = pgTable("jewelry_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  value: text("value").notNull(),
  slug: text("slug").notNull().unique(),
  sortOrder: integer("sort_order").notNull(),
});
```

- [ ] **Step 2: Update products.ts relations**

In `db/schema/products.ts`, replace the `jewelry` import with the new subcategory imports. The current import line `import { jewelry } from "./jewelry"` should become:
```typescript
import { engagementRings, weddingBands, tennisBracelets } from "./jewelry"
```

In `productsRelations`, replace:
```typescript
jewelry: one(jewelry),
```
with:
```typescript
engagementRing: one(engagementRings),
weddingBand: one(weddingBands),
tennisBracelet: one(tennisBracelets),
```

- [ ] **Step 3: Add `engravingText` to cart_item_config in commerce.ts**

In the `cartItemConfig` table definition, add after the `braceletLength` line:
```typescript
engravingText: text("engraving_text"),
```

Add `text` to the `drizzle-orm/pg-core` import if not already there. (Check — `text` is already imported on line 6.)

No relation changes needed for `engravingText` — it's a plain text column.

- [ ] **Step 4: Format and commit**

```bash
npm run format
git add db/schema/lookups.ts db/schema/products.ts db/schema/commerce.ts
git commit -m "feat(db): drop jewelryTypes, update product relations, add engravingText to cart config"
```

---

### Task 3: Squash migration

**Files:**
- Delete: all files in `supabase/migrations/`
- Create: new migration via `npm run db:generate`
- Modify: generated migration (append triggers + indexes)

- [ ] **Step 1: Delete and regenerate**

```bash
rm supabase/migrations/*.sql
npm run db:generate
```

- [ ] **Step 2: Append triggers and indexes**

Read the trigger + index SQL from `docs/superpowers/plans/2026-03-25-order-schema-refinement.md` (Task 4, Step 3). Copy the entire block verbatim and append to the new migration.

**Important:** Verify the generated migration does NOT contain `jewelry_types`, `jewelry` (as a standalone table), `jewelry_engagement_rings`, `jewelry_tennis_bracelets`, `jewelry_available_metals`, `jewelry_engagement_ring_compatible_stones`, or `jewelry_configuration_images`. It SHOULD contain `engagement_rings`, `wedding_bands`, `tennis_bracelets`, and their junction tables.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "refactor(db): squash migrations after jewelry restructure"
```

---

### Task 4: Update seed data

**Files:**
- Modify: `supabase/seed.sql`

This is a large task. Read the full seed file before making changes.

- [ ] **Step 1: Add new product_categories**

In the `product_categories` block, add two new rows:
```sql
INSERT INTO public.product_categories VALUES ('a1000025-0001-4000-8000-000000000007', 'wedding_band', 7);
INSERT INTO public.product_categories VALUES ('a1000025-0001-4000-8000-000000000008', 'tennis_bracelet', 8);
```

- [ ] **Step 2: Remove old jewelry seed blocks**

Delete ALL of these sections from the seed file:
- `jewelry_types` data
- `jewelry` data (the parent table rows)
- `jewelry_engagement_rings` data
- `jewelry_tennis_bracelets` data
- `jewelry_available_metals` data
- `jewelry_engagement_ring_compatible_stones` data
- `jewelry_configuration_images` data

- [ ] **Step 3: Add engagement_rings seed**

Migrate the data from the old `jewelry` + `jewelry_engagement_rings` tables. The old pattern was:
- `jewelry` had: id, product_id, sku, jewelry_type_id, created_at, updated_at
- `jewelry_engagement_rings` had: id, jewelry_id, band_style_id, ring_width_mm

The new `engagement_rings` table combines these: id, product_id, sku, band_style_id, ring_width_mm.

Read the existing seed data to get the exact values. Use the `jewelry_engagement_rings.id` as the new `engagement_rings.id` (since that's what junction tables will reference). Or use new UUIDs — just be consistent.

For each existing engagement ring, create one `engagement_rings` INSERT with the product_id and sku from `jewelry` and band_style_id + ring_width_mm from `jewelry_engagement_rings`. Set ring_width_mm to a reasonable value if currently NULL (e.g., 2.0).

- [ ] **Step 4: Add engagement_ring_available_metals seed**

Migrate from `jewelry_available_metals`. The old format was: `(id, jewelry_id, metal_id, price_usd)`. The new format is: `(id, engagement_ring_id, metal_id, price_usd)`.

Replace `jewelry_id` with the corresponding `engagement_ring_id` (the new engagement ring row that took over from the old jewelry row).

- [ ] **Step 5: Add engagement_ring_compatible_stones seed**

Migrate from `jewelry_engagement_ring_compatible_stones`. Old: `(id, jewelry_id, shape_id, max_carat)`. New: `(id, engagement_ring_id, shape_id, max_carat)`.

Same mapping as Step 4.

- [ ] **Step 6: Add wedding band products and seed data**

Add 2-3 wedding band products to the `products` table with `product_category_id` = `'a1000025-0001-4000-8000-000000000007'` (wedding_band). Then add corresponding `wedding_bands` rows and `wedding_band_available_metals` rows.

Use sensible mock data: band styles from the existing `band_styles` seed, metals from the `metals` seed.

- [ ] **Step 7: Add tennis bracelet products and seed data**

Add 2-3 tennis bracelet products to the `products` table with `product_category_id` = `'a1000025-0001-4000-8000-000000000008'` (tennis_bracelet). Then add corresponding `tennis_bracelets` rows.

No junction tables needed.

- [ ] **Step 8: Update products seed for existing tennis bracelets**

The old seed data had tennis bracelet products pointing to the `jewelry` table. These products need their `product_category_id` updated from `engagement_ring` to `tennis_bracelet` if they were miscategorized. Check the existing seed data — tennis bracelet products may not exist yet (the old `jewelry_tennis_bracelets` table may have had rows referencing jewelry IDs that were for engagement rings). Verify and fix.

- [ ] **Step 9: Commit**

```bash
git add supabase/seed.sql
git commit -m "feat(db): update seed data for jewelry restructure"
```

---

### Task 5: Verify database reset

- [ ] **Step 1: Run db:reset**

```bash
npm run db:reset
```

Expected: SUCCESS

---

### Task 6: Update API layer + frontend (co-dependent)

**Files:**
- Modify: `lib/api/jewelry/engagement-rings.ts`
- Modify: `lib/api/cart.ts`
- Modify: `lib/api/search.ts`
- Modify: `app/buyer/browse/jewelry/engagement-rings/[slug]/page.tsx`
- Modify: `app/buyer/browse/jewelry/engagement-rings/[slug]/jewelry-configuration.tsx`
- Modify: `app/buyer/browse/jewelry/engagement-rings/page.tsx`

- [ ] **Step 1: Rewrite engagement-rings.ts imports**

Replace:
```typescript
import {
  products,
  productCategories,
  jewelry,
  jewelryEngagementRings,
  jewelryAvailableMetals,
  jewelryEngagementRingCompatibleStones,
  jewelryConfigurationImages,
  jewelryTypes,
  bandStyles,
  metals,
  shapes,
  productImages,
} from "@/db/schema";
```
with:
```typescript
import {
  products,
  productCategories,
  engagementRings,
  engagementRingAvailableMetals,
  engagementRingCompatibleStones,
  bandStyles,
  metals,
  shapes,
  productImages,
} from "@/db/schema";
```

- [ ] **Step 2: Update EngagementRingItem interface**

Remove `configurationImages` from the interface entirely. The interface becomes:

```typescript
export interface EngagementRingItem extends JewelryItemBase {
  bandStyle: { id: string; value: string };
  ringWidthMm: number | null;
  availableMetals: {
    id: string;
    metal: { id: string; value: string };
    priceUsd: number;
  }[];
  compatibleStones: {
    id: string;
    shape: { id: string; value: string };
    maxCarat: number;
  }[];
}
```

- [ ] **Step 3: Rewrite resolveAll() query**

The query currently starts from `db.query.jewelry.findMany(...)` with a 3-level join. Replace with `db.query.engagementRings.findMany(...)` — a direct 2-level query:

```typescript
async function resolveAll(): Promise<EngagementRingItem[]> {
  const rows = await db.query.engagementRings.findMany({
    with: {
      product: { with: { images: true } },
      bandStyle: true,
      availableMetals: { with: { metal: true } },
      compatibleStones: { with: { shape: true } },
    },
  });

  return rows
    .filter((r) => r.product && r.product.isActive && !r.product.deletedAt)
    .map((row) => {
      const product = row.product!;

      const imgs = (product.images ?? [])
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder);

      const availableMetals = (row.availableMetals ?? []).map((am) => ({
        id: am.id,
        metal: {
          id: am.metal?.id ?? "",
          value: am.metal?.value ?? "Unknown",
        },
        priceUsd: Number(am.priceUsd),
      }));

      const compatibleStones = (row.compatibleStones ?? []).map((cs) => ({
        id: cs.id,
        shape: {
          id: cs.shape?.id ?? "",
          value: cs.shape?.value ?? "Unknown",
        },
        maxCarat: Number(cs.maxCarat),
      }));

      return {
        id: row.id,
        description: product.description,
        sku: row.sku,
        images: imgs.map((img) => ({
          url: img.url,
          sortOrder: img.sortOrder,
          isThumbnail: img.isThumbnail,
        })),
        bandStyle: {
          id: row.bandStyle?.id ?? "",
          value: row.bandStyle?.value ?? "Unknown",
        },
        ringWidthMm: row.ringWidthMm ? Number(row.ringWidthMm) : null,
        availableMetals,
        compatibleStones,
      };
    });
}
```

No filter on `jewelryType` needed — the query already targets only `engagementRings`.

- [ ] **Step 4: Update fetchEngagementRingListFiltered()**

Update all table references in the filtered query:
- `jewelry.id` → `engagementRings.id`
- `jewelry.productId` → `engagementRings.productId`
- `jewelry.sku` → `engagementRings.sku`
- `jewelryEngagementRings.jewelryId` → removed (no longer a separate table)
- `jewelryEngagementRings.bandStyleId` → `engagementRings.bandStyleId`
- `jewelryAvailableMetals` → `engagementRingAvailableMetals`
- `jewelryAvailableMetals.jewelryId` → `engagementRingAvailableMetals.engagementRingId`
- `jewelryEngagementRingCompatibleStones` → `engagementRingCompatibleStones`
- `jewelryEngagementRingCompatibleStones.jewelryId` → `engagementRingCompatibleStones.engagementRingId`

Remove the `jewelryEngagementRings` join entirely — band style is now directly on `engagementRings`. Update the base query `from` clause:

From: `jewelry → products → jewelryEngagementRings → bandStyles`
To: `engagementRings → products → bandStyles`

Remove the `engagementRingTypeCondition` — no longer filtering by `jewelry_types`. The table itself IS the filter.

Remove the `jewelryTypes` import and the `jewelryTypes` filter condition.

- [ ] **Step 5: Update cart.ts**

Add `engravingText` to the response mapping. In the config block:
```typescript
config: item.config
  ? {
      metal: item.config.metal?.value ?? null,
      ringSize: item.config.ringSize
        ? Number(item.config.ringSize)
        : null,
      braceletLength: item.config.braceletLength
        ? Number(item.config.braceletLength)
        : null,
      engravingText: item.config.engravingText ?? null,
    }
  : null,
```

In `addCartItem`, add `engravingText` to the config parameter type and insert values:
```typescript
config?: {
  metalId?: string;
  centerStoneProductId?: string;
  ringSize?: string;
  braceletLength?: string;
  engravingText?: string;
},
```

And in the insert:
```typescript
engravingText: config.engravingText ?? null,
```

- [ ] **Step 6: Update search.ts labels**

Add two entries to `PRODUCT_CATEGORY_LABELS`:
```typescript
const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  natural_diamond: "Natural Diamond",
  lab_grown_diamond: "Lab Grown Diamond",
  gemstone: "Gemstone",
  natural_melee: "Natural Melee",
  lab_grown_melee: "Lab Grown Melee",
  engagement_ring: "Engagement Ring",
  wedding_band: "Wedding Band",
  tennis_bracelet: "Tennis Bracelet",
}
```

- [ ] **Step 7: Update engagement ring frontend pages**

The frontend pages reference `item.configurationImages` — remove all references. The resolved data shape from the API (`EngagementRingItem`) no longer has `configurationImages`. Check all 3 page files and remove any usage.

The rest of the data shape (`availableMetals`, `compatibleStones`, `bandStyle`) is the same structure — no frontend changes needed beyond removing `configurationImages` references.

- [ ] **Step 8: Format and commit**

```bash
npm run format
git add lib/api/ app/buyer/browse/jewelry/
git commit -m "feat: update API and frontend for jewelry restructure"
```

---

### Task 7: Format, typecheck, build

- [ ] **Step 1: Typecheck**

```bash
npm run typecheck
```

Fix any errors.

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: PASS

- [ ] **Step 3: Commit fixes if any**

```bash
git add -A
git commit -m "fix: resolve type and build errors after jewelry restructure"
```

---

### Task 8: Update documentation

**Files:**
- Modify: `docs/api/README.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update API docs**

- Engagement ring response: remove `configurationImages` from response shape
- Add `wedding_band`, `tennis_bracelet` to `productCategory` value lists
- Add `engravingText` to cart config response and request shapes
- Add stub documentation for wedding band and tennis bracelet endpoints (if desired)

- [ ] **Step 2: Update CLAUDE.md**

Update the file structure section — the jewelry schema file no longer has the parent table hierarchy. Note the new table names.

- [ ] **Step 3: Commit**

```bash
git add docs/ CLAUDE.md
git commit -m "docs: update API docs and CLAUDE.md for jewelry restructure"
```

---

### Task 9: Final verification

- [ ] **Step 1: Full db:reset**

```bash
npm run db:reset
```

- [ ] **Step 2: Production build**

```bash
npm run build
```

Expected: PASS
