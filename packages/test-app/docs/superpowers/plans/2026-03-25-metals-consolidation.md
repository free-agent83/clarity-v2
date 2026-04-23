# Metals Lookup Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge `metal_types`, `metal_colors`, and `metal_qualities` lookup tables into a single `metals` table, updating all schema, API, frontend, seed, and docs.

**Architecture:** Bottom-up: schema first, then seed, then API + frontend together (co-dependent), then migration squash, then docs. The API response shape for engagement rings changes, so frontend must update in the same pass.

**Tech Stack:** Drizzle ORM, PostgreSQL (Supabase local), Next.js 16 App Router, TypeScript, Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-03-25-metals-consolidation.md`

---

### Task 1: Schema changes — lookups, jewelry, commerce

**Files:**
- Modify: `db/schema/lookups.ts`
- Modify: `db/schema/jewelry.ts`
- Modify: `db/schema/commerce.ts`

- [ ] **Step 1: Update lookups.ts**

Replace the three metal lookup exports:
```typescript
export const metalTypes = lookupTable("metal_types");
export const metalQualities = lookupTable("metal_qualities");
export const metalColors = lookupTable("metal_colors");
```
with:
```typescript
export const metals = lookupTable("metals");
```

- [ ] **Step 2: Update jewelry.ts imports**

Replace the imports:
```typescript
import {
  jewelryTypes,
  bandStyles,
  metalTypes,
  metalQualities,
  metalColors,
  shapes,
} from "./lookups";
```
with:
```typescript
import {
  jewelryTypes,
  bandStyles,
  metals,
  shapes,
} from "./lookups";
```

- [ ] **Step 3: Rewrite `jewelryAvailableMetals` table**

Replace the entire table definition:

```typescript
export const jewelryAvailableMetals = pgTable("jewelry_available_metals", {
  id: uuid("id").primaryKey().defaultRandom(),
  jewelryId: uuid("jewelry_id")
    .references(() => jewelry.id)
    .notNull(),
  metalId: uuid("metal_id")
    .references(() => metals.id)
    .notNull(),
  priceUsd: numeric("price_usd").notNull(),
});
```

- [ ] **Step 4: Rewrite `jewelryConfigurationImages` table**

Replace the entire table definition:

```typescript
export const jewelryConfigurationImages = pgTable(
  "jewelry_configuration_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jewelryId: uuid("jewelry_id")
      .references(() => jewelry.id)
      .notNull(),
    metalId: uuid("metal_id")
      .references(() => metals.id)
      .notNull(),
    url: text("url").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isThumbnail: boolean("is_thumbnail").notNull().default(false),
  },
);
```

- [ ] **Step 5: Update `jewelryAvailableMetalsRelations`**

Replace:
```typescript
export const jewelryAvailableMetalsRelations = relations(
  jewelryAvailableMetals,
  ({ one }) => ({
    jewelry: one(jewelry, {
      fields: [jewelryAvailableMetals.jewelryId],
      references: [jewelry.id],
    }),
    metal: one(metals, {
      fields: [jewelryAvailableMetals.metalId],
      references: [metals.id],
    }),
  }),
);
```

- [ ] **Step 6: Update `jewelryConfigurationImagesRelations`**

Replace:
```typescript
export const jewelryConfigurationImagesRelations = relations(
  jewelryConfigurationImages,
  ({ one }) => ({
    jewelry: one(jewelry, {
      fields: [jewelryConfigurationImages.jewelryId],
      references: [jewelry.id],
    }),
    metal: one(metals, {
      fields: [jewelryConfigurationImages.metalId],
      references: [metals.id],
    }),
  }),
);
```

- [ ] **Step 7: Update commerce.ts imports**

Replace:
```typescript
import {
  paymentMethods,
  invoiceStatuses,
  ledgerEntryTypes,
  currencies,
  metalTypes,
  metalColors,
  metalQualities,
} from "./lookups";
```
with:
```typescript
import {
  paymentMethods,
  invoiceStatuses,
  ledgerEntryTypes,
  currencies,
  metals,
} from "./lookups";
```

- [ ] **Step 8: Rewrite `cartItemConfig` table**

Replace the three metal columns with one:

```typescript
export const cartItemConfig = pgTable("cart_item_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  cartItemId: uuid("cart_item_id")
    .references(() => cartItems.id)
    .notNull()
    .unique(),
  metalId: uuid("metal_id").references(() => metals.id),
  centerStoneProductId: uuid("center_stone_product_id").references(
    () => products.id,
  ),
  ringSize: numeric("ring_size"),
  braceletLength: numeric("bracelet_length"),
});
```

- [ ] **Step 9: Update `cartItemConfigRelations`**

Replace:
```typescript
export const cartItemConfigRelations = relations(cartItemConfig, ({ one }) => ({
  cartItem: one(cartItems, {
    fields: [cartItemConfig.cartItemId],
    references: [cartItems.id],
  }),
  metal: one(metals, {
    fields: [cartItemConfig.metalId],
    references: [metals.id],
  }),
  centerStoneProduct: one(products, {
    fields: [cartItemConfig.centerStoneProductId],
    references: [products.id],
  }),
}));
```

- [ ] **Step 10: Format and commit**

```bash
npm run format
git add db/schema/lookups.ts db/schema/jewelry.ts db/schema/commerce.ts
git commit -m "feat(db): consolidate metal_types, metal_colors, metal_qualities into metals"
```

---

### Task 2: Squash migration

**Files:**
- Delete: all files in `supabase/migrations/`
- Create: new migration via `npm run db:generate`
- Modify: the generated migration file (append triggers + indexes)

- [ ] **Step 1: Delete existing migrations and regenerate**

```bash
rm supabase/migrations/*.sql
npm run db:generate
```

- [ ] **Step 2: Append triggers and indexes**

Read the current trigger and index SQL from the plan at `docs/superpowers/plans/2026-03-25-order-schema-refinement.md` (Task 4, Step 3) — copy the ENTIRE block verbatim (all 4 triggers + all indexes). Append it to the end of the newly generated migration file.

**Important:** The index `idx_products_category` references `product_category_id` (not the old `product_type`). The old `idx_products_type` no longer exists.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/
git commit -m "refactor(db): squash migrations after metals consolidation"
```

---

### Task 3: Update seed data

**Files:**
- Modify: `supabase/seed.sql`

- [ ] **Step 1: Add `metals` seed and remove old metal tables**

In section 1 (LOOKUP TABLES), replace the `metal_types`, `metal_colors`, and `metal_qualities` blocks with:

```sql
--
-- Data for Name: metals; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.metals VALUES ('a1000026-0001-4000-8000-000000000001', '14k_yellow_gold', 1);
INSERT INTO public.metals VALUES ('a1000026-0001-4000-8000-000000000002', '18k_yellow_gold', 2);
INSERT INTO public.metals VALUES ('a1000026-0001-4000-8000-000000000003', '14k_rose_gold', 3);
INSERT INTO public.metals VALUES ('a1000026-0001-4000-8000-000000000004', '18k_rose_gold', 4);
INSERT INTO public.metals VALUES ('a1000026-0001-4000-8000-000000000005', '10k_white_gold', 5);
INSERT INTO public.metals VALUES ('a1000026-0001-4000-8000-000000000006', '14k_white_gold', 6);
INSERT INTO public.metals VALUES ('a1000026-0001-4000-8000-000000000007', '18k_white_gold', 7);
INSERT INTO public.metals VALUES ('a1000026-0001-4000-8000-000000000008', '950_platinum', 8);
```

- [ ] **Step 2: Update `jewelry_available_metals` seed**

The current inserts have columns: `(id, jewelry_id, metal_type_id, metal_color_id, metal_quality_id, price_usd)`. Replace with `(id, jewelry_id, metal_id, price_usd)`.

Map each existing combination to the correct `metals` UUID:
- Gold + Yellow + 14KT → `a1000026-...0001` (14k_yellow_gold)
- Gold + Yellow + 18KT → `a1000026-...0002` (18k_yellow_gold)
- Gold + Rose + 14KT → `a1000026-...0003` (14k_rose_gold)
- Gold + Rose + 18KT → `a1000026-...0004` (18k_rose_gold)
- Gold + White + 10KT → `a1000026-...0005` (10k_white_gold)
- Gold + White + 14KT → `a1000026-...0006` (14k_white_gold)
- Gold + White + 18KT → `a1000026-...0007` (18k_white_gold)
- Platinum + Platinum + 950 → `a1000026-...0008` (950_platinum)

Read the current seed data to determine which combination each row represents (cross-reference the old metal_type_id, metal_color_id, and metal_quality_id UUIDs with the seed data for those tables).

- [ ] **Step 3: Update `jewelry_configuration_images` seed**

Replace `metal_type_id` + `metal_color_id` columns with single `metal_id`. Map using the same logic — the metal type + color combination determines which `metals` row to use. Since images don't have a quality dimension, the mapping is by type+color. For gold colors, pick the most common quality (e.g., 14K) — or check which quality the existing images correspond to.

- [ ] **Step 4: Update `cart_item_config` seed (if any rows exist)**

Replace `metal_type_id`, `metal_color_id`, `metal_quality_id` columns with single `metal_id`. Same mapping approach.

- [ ] **Step 5: Commit**

```bash
git add supabase/seed.sql
git commit -m "feat(db): update seed data for metals consolidation"
```

---

### Task 4: Verify database reset

- [ ] **Step 1: Run db:reset**

```bash
npm run db:reset
```

Expected: SUCCESS

---

### Task 5: Update API layer + frontend (co-dependent)

**Files:**
- Modify: `lib/api/jewelry/engagement-rings.ts`
- Modify: `lib/api/cart.ts`
- Modify: `app/buyer/browse/jewelry/engagement-rings/[slug]/page.tsx`
- Modify: `app/buyer/browse/jewelry/engagement-rings/[slug]/jewelry-configuration.tsx`
- Modify: `app/buyer/browse/jewelry/engagement-rings/page.tsx`

- [ ] **Step 1: Update engagement-rings.ts imports**

Replace:
```typescript
import {
  ...
  metalTypes,
  metalColors,
  metalQualities,
  ...
} from "@/db/schema";
```
with:
```typescript
import {
  ...
  metals,
  ...
} from "@/db/schema";
```

Remove `metalTypes`, `metalColors`, `metalQualities` from the import.

- [ ] **Step 2: Update `EngagementRingItem` interface**

Replace the `availableMetals` and `configurationImages` type shapes:

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
  configurationImages: {
    id: string;
    metal: { id: string; value: string };
    url: string;
    sortOrder: number;
    isThumbnail: boolean;
  }[];
}
```

- [ ] **Step 3: Update `resolveAll()` query and mapping**

In the `with` clause, replace:
```typescript
availableMetals: {
  with: { metalType: true, metalColor: true, metalQuality: true },
},
...
configurationImages: { with: { metalType: true, metalColor: true } },
```
with:
```typescript
availableMetals: {
  with: { metal: true },
},
...
configurationImages: { with: { metal: true } },
```

In the mapping section, replace the `availableMetals` map:
```typescript
const availableMetals = (row.availableMetals ?? []).map((am) => ({
  id: am.id,
  metal: {
    id: am.metal?.id ?? "",
    value: am.metal?.value ?? "Unknown",
  },
  priceUsd: Number(am.priceUsd),
}));
```

Replace the `configurationImages` map:
```typescript
const configurationImages = (row.configurationImages ?? []).map((ci) => ({
  id: ci.id,
  metal: {
    id: ci.metal?.id ?? "",
    value: ci.metal?.value ?? "Unknown",
  },
  url: ci.url,
  sortOrder: ci.sortOrder,
  isThumbnail: ci.isThumbnail,
}));
```

- [ ] **Step 4: Update `ENGAGEMENT_RING_FILTERS`**

Replace:
```typescript
multi: ["metalType", "metalColor", "stoneShape", "bandStyle"],
```
with:
```typescript
multi: ["metal", "stoneShape", "bandStyle"],
```

- [ ] **Step 5: Update filter subqueries in `fetchEngagementRingListFiltered`**

Remove the two separate `metalType` and `metalColor` filter blocks (lines ~264-297). Replace with a single `metal` filter:

```typescript
// Many-to-many: metal filter
const metalVals = getMultiValues(filters, "metal");
if (metalVals) {
  conditions.push(
    inArray(
      jewelry.id,
      db
        .select({ jewelryId: jewelryAvailableMetals.jewelryId })
        .from(jewelryAvailableMetals)
        .innerJoin(
          metals,
          eq(jewelryAvailableMetals.metalId, metals.id),
        )
        .where(inArray(metals.value, metalVals)),
    ),
  );
}
```

- [ ] **Step 6: Update cart.ts**

In the query `with` clause, replace:
```typescript
config: {
  with: {
    metalType: true,
    metalColor: true,
    metalQuality: true,
  },
},
```
with:
```typescript
config: {
  with: {
    metal: true,
  },
},
```

In the response mapping, replace:
```typescript
metalType: item.config.metalType?.value ?? null,
metalColor: item.config.metalColor?.value ?? null,
metalQuality: item.config.metalQuality?.value ?? null,
```
with:
```typescript
metal: item.config.metal?.value ?? null,
```

In `addCartItem`, replace the config parameter type:
```typescript
config?: {
  metalId?: string;
  centerStoneProductId?: string;
  ringSize?: string;
  braceletLength?: string;
},
```

And the insert values:
```typescript
await db.insert(cartItemConfig).values({
  cartItemId: item.id,
  metalId: config.metalId ?? null,
  centerStoneProductId: config.centerStoneProductId ?? null,
  ringSize: config.ringSize ?? null,
  braceletLength: config.braceletLength ?? null,
});
```

- [ ] **Step 7: Update engagement ring detail page (`[slug]/page.tsx`)**

Replace the metal grouping logic (lines ~65-88). Instead of building a nested metalType→colors structure, create a flat list of metals:

```typescript
// Build flat list of available metals
const availableMetals = item.availableMetals.map((am) => ({
  id: am.metal.id,
  value: am.metal.value,
  priceUsd: am.priceUsd,
}));
const defaultMetal = availableMetals[0]?.value ?? "14k_white_gold";
```

Update the `JewelryConfiguration` component props to pass the flat list instead of the nested structure. Remove `metalQualityValue`, `defaultMetalType`, `defaultColor`, and `availableMetalTypes` props. Replace with `availableMetals` and `defaultMetal`.

- [ ] **Step 8: Rewrite jewelry-configuration.tsx**

Replace the `METAL_COLORS` constant with one that maps metal values to display colors:
```typescript
const METAL_SWATCH_COLORS: Record<string, string> = {
  "14k_yellow_gold": "bg-[#e6c24b]",
  "18k_yellow_gold": "bg-[#e6c24b]",
  "14k_rose_gold": "bg-[#e8b4a8]",
  "18k_rose_gold": "bg-[#e8b4a8]",
  "10k_white_gold": "bg-[#e0e0e0]",
  "14k_white_gold": "bg-[#e0e0e0]",
  "18k_white_gold": "bg-[#e0e0e0]",
  "950_platinum": "bg-[#9ba0a8]",
};
```

Update the props type:
```typescript
type JewelryConfigurationProps = {
  defaultStoneShape: string;
  defaultMetal: string;
  availableStoneShapes: { id: string; value: string }[];
  availableMetals: { id: string; value: string; priceUsd: number }[];
};
```

Replace the nested metalType→color selector with a flat metal list selector. Each metal option shows its swatch color and a `formatLabel()` display name. The `metalLabel` is just `formatLabel(selectedMetal)`.

Add a `formatLabel` utility (same as in orders page):
```typescript
function formatLabel(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
}
```

- [ ] **Step 9: Update engagement ring list page**

Replace the `METAL_COLORS` constant with `METAL_SWATCH_COLORS` (same as Step 8).

Update the `getMetalColors` helper to use `am.metal.value`:
```typescript
function getMetalSwatches(
  item: EngagementRingItem,
): { value: string; swatch: string }[] {
  const seen = new Set<string>();
  const swatches: { value: string; swatch: string }[] = [];
  for (const am of item.availableMetals) {
    const metalValue = am.metal.value;
    if (!seen.has(metalValue) && METAL_SWATCH_COLORS[metalValue]) {
      seen.add(metalValue);
      swatches.push({ value: metalValue, swatch: METAL_SWATCH_COLORS[metalValue] });
    }
  }
  return swatches;
}
```

Update the swatch rendering to use the new helper.

- [ ] **Step 10: Format and commit**

```bash
npm run format
git add lib/api/jewelry/engagement-rings.ts lib/api/cart.ts app/buyer/browse/jewelry/engagement-rings/
git commit -m "feat: update API and frontend for consolidated metals table"
```

---

### Task 6: Format, typecheck, build

- [ ] **Step 1: Format, lint, typecheck**

```bash
npm run format
npm run typecheck
```

Fix any errors.

- [ ] **Step 2: Build**

```bash
npm run build
```

Expected: PASS

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve lint and type errors after metals consolidation"
```

---

### Task 7: Update documentation

**Files:**
- Modify: `docs/api/README.md`

- [ ] **Step 1: Update API docs**

In `docs/api/README.md`:
- Engagement ring response: replace `metalType`, `metalColor`, `metalQuality` objects in `availableMetals` and `configurationImages` with single `metal` object
- Filter params: replace `metalType` and `metalColor` filters with single `metal` filter
- Cart response: replace `metalType`, `metalColor`, `metalQuality` config fields with single `metal` field
- Any references to the old lookup table names

- [ ] **Step 2: Commit**

```bash
git add docs/
git commit -m "docs: update API docs for metals consolidation"
```

---

### Task 8: Final verification

- [ ] **Step 1: Full db:reset**

```bash
npm run db:reset
```

- [ ] **Step 2: Production build**

```bash
npm run build
```

Expected: PASS
