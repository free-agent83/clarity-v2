# Jewelry Schema Restructure

## Context

The current jewelry data model has a parent `jewelry` table that sits between `products` and subcategory-specific tables (`jewelry_engagement_rings`, `jewelry_tennis_bracelets`). This adds an unnecessary join to every query and a `jewelry_types` lookup that's redundant — the type is already implicit in the subcategory table being queried.

This spec removes the `jewelry` parent table and `jewelry_types` lookup, promotes subcategories to standalone tables that link directly to `products`, adds wedding bands as a new subcategory, and renames everything to drop the `jewelry_` prefix.

### Source document

`docs/new-db-schema-3.md`

---

## Design Decisions

### Keep `products` as the polymorphic anchor

Cross-cutting features (cart, orders, shortlists, search, images, certifications) all FK to `products.id`. Removing `products` would require polymorphic references everywhere. Not worth the complexity.

### Drop the `jewelry` parent table

No situation requires showing "all jewelry" as a flat list. Each subcategory has its own browse page, its own API endpoint, and its own data shape. The parent table only adds a join.

### Drop `jewelry_types` lookup

Type is inferred from the table being queried. The frontend knows it's rendering engagement rings because it called the engagement rings API.

### Drop `jewelry_configuration_images`

Not needed at this stage — adds complexity without value. Can be reintroduced later when product images per metal configuration are available.

### Subcategory tables link directly to `products`

Each subcategory (`engagement_rings`, `wedding_bands`, `tennis_bracelets`) has `product_id` FK → `products.id`. The `sku` column moves from the old `jewelry` table onto each subcategory.

### Separate junction tables per subcategory

`engagement_ring_available_metals` and `wedding_band_available_metals` are separate tables rather than one shared table. Keeps FK constraints clean with no polymorphic references.

### Configuration options

| Option | Engagement rings | Wedding bands | Tennis bracelets |
|---|---|---|---|
| Metal | Yes (junction table) | Yes (junction table) | No |
| Center stone | Yes (from catalog, junction table for compatible shapes) | No | No |
| Finger size | Yes (frontend fixed set) | Yes (frontend fixed set) | No |
| Bracelet length | No | No | Yes (frontend fixed set: 6.0-8.0 in 0.5" increments) |
| Engraving text | Yes | Yes | No |

Ring widths and finger sizes are hardcoded on the frontend (like `FINGER_SIZES` already is). Bracelet lengths are the same — a known set (6.0, 6.5, 7.0, 7.5, 8.0 inches).

All engagement rings and wedding bands support engraving. No per-SKU flag needed — it's a known fact about those categories.

### No timestamps on subcategory or junction tables

The old `jewelry` table had `created_at`/`updated_at`, but temporal tracking lives on `products` already. Subcategory tables and junction tables are extensions of the product — they don't need independent timestamps. This is intentional.

### `tennis_bracelets` has no `length_mm` column

The old `jewelry_tennis_bracelets` had `length_mm` as a physical property of the bracelet. Since bracelet length is selected from a fixed set during cart configuration (not a per-SKU property), this column is intentionally dropped.

---

## Tables to Drop

- `jewelry` — parent table
- `jewelry_types` — lookup table (remove from `db/schema/lookups.ts`)
- `jewelry_engagement_rings` — replaced by `engagement_rings`
- `jewelry_tennis_bracelets` — replaced by `tennis_bracelets`
- `jewelry_available_metals` — replaced by per-subcategory junction tables
- `jewelry_engagement_ring_compatible_stones` — replaced by `engagement_ring_compatible_stones`
- `jewelry_configuration_images` — dropped entirely (YAGNI)

---

## New Tables

### `engagement_rings`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `product_id` | uuid FK → `products.id`, unique, not null | |
| `sku` | text, not null | |
| `band_style_id` | uuid FK → `band_styles.id`, not null | |
| `ring_width_mm` | numeric, not null | |

### `engagement_ring_available_metals`

| Column | Type |
|---|---|
| `id` | uuid PK |
| `engagement_ring_id` | uuid FK → `engagement_rings.id`, not null |
| `metal_id` | uuid FK → `metals.id`, not null |
| `price_usd` | numeric, not null |

### `engagement_ring_compatible_stones`

| Column | Type |
|---|---|
| `id` | uuid PK |
| `engagement_ring_id` | uuid FK → `engagement_rings.id`, not null |
| `shape_id` | uuid FK → `shapes.id`, not null |
| `max_carat` | numeric, not null |

### `wedding_bands`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `product_id` | uuid FK → `products.id`, unique, not null | |
| `sku` | text, not null | |
| `band_style_id` | uuid FK → `band_styles.id`, not null | |
| `ring_width_mm` | numeric, not null | |

### `wedding_band_available_metals`

| Column | Type |
|---|---|
| `id` | uuid PK |
| `wedding_band_id` | uuid FK → `wedding_bands.id`, not null |
| `metal_id` | uuid FK → `metals.id`, not null |
| `price_usd` | numeric, not null |

### `tennis_bracelets`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `product_id` | uuid FK → `products.id`, unique, not null | |
| `sku` | text, not null | |

No junction tables. No static properties beyond what's on `products`. Bracelet length is selected from a fixed set on the frontend during cart configuration.

---

## Modified Tables

### `product_categories` — add two rows

| value | sort_order |
|---|---|
| `wedding_band` | 7 |
| `tennis_bracelet` | 8 |

### `cart_item_config` (`db/schema/commerce.ts`)

| Change | Detail |
|---|---|
| Add column | `engraving_text` (text, nullable) — provided by user when configuring an engagement ring or wedding band with engraving |

Existing columns (`metal_id`, `center_stone_product_id`, `ring_size`, `bracelet_length`) are unchanged.

---

## Schema File Changes

### `db/schema/jewelry.ts`

Full rewrite — drop all old table/relation definitions, replace with new tables and relations.

### `db/schema/lookups.ts`

Remove `jewelryTypes` export. The `jewelryTypes` custom table definition (with slug column) is dropped entirely.

### `db/schema/products.ts`

Replace the `jewelry: one(jewelry)` relation in `productsRelations` with individual relations:
- `engagementRing: one(engagementRings)`
- `weddingBand: one(weddingBands)`
- `tennisBracelet: one(tennisBracelets)`

Update imports accordingly (remove `jewelry`, add new subcategory imports).

### `db/schema/commerce.ts`

Add `engravingText` (text, nullable) to `cartItemConfig` table. Update `cartItemConfigRelations` if needed.

### `db/schema/index.ts`

Barrel export file — no changes needed as long as `jewelry.ts` continues to export from the same file path.

---

## API Layer Changes

### `lib/api/jewelry/engagement-rings.ts`

- Update queries from 3-level join (products → jewelry → jewelry_engagement_rings) to 2-level (products → engagement_rings)
- Update all table references from old names to new names
- Junction table references change: `jewelryAvailableMetals` → `engagementRingAvailableMetals`, etc.
- Remove all `jewelry`, `jewelryTypes`, and `jewelryConfigurationImages` imports
- Remove `configurationImages` from the `EngagementRingItem` interface, `resolveAll()` query, and mapping

### `lib/api/cart.ts`

- Add `engravingText` to the config query, response mapping, and `addCartItem` parameter

### `lib/api/search.ts`

- Add `wedding_band: "Wedding Band"` and `tennis_bracelet: "Tennis Bracelet"` to `PRODUCT_CATEGORY_LABELS`

### New API files (stubs or full)

- `lib/api/jewelry/wedding-bands.ts` — similar structure to engagement rings but simpler (no compatible stones)
- `lib/api/jewelry/tennis-bracelets.ts` — simple list/detail, no metal configuration

---

## Frontend Changes

### Engagement ring pages

- Update data shape references throughout the 3 engagement ring page files to match new API response (junction table names change, but the resolved shape stays similar)

### Wedding bands and tennis bracelets

- Currently "under construction" — no urgent frontend work

---

## Seed Data Changes

1. Add `wedding_band` and `tennis_bracelet` to `product_categories`
2. Remove all old jewelry seed blocks: `jewelry_types`, `jewelry`, `jewelry_engagement_rings`, `jewelry_tennis_bracelets`, `jewelry_available_metals`, `jewelry_engagement_ring_compatible_stones`, `jewelry_configuration_images`
3. Add `engagement_rings` seed (migrating data from old `jewelry` + `jewelry_engagement_rings`)
4. Add `engagement_ring_available_metals` seed (migrating from `jewelry_available_metals`)
5. Add `engagement_ring_compatible_stones` seed (migrating from `jewelry_engagement_ring_compatible_stones`)
6. Add `wedding_bands` seed with a few mock products
7. Add `wedding_band_available_metals` seed
8. Add `tennis_bracelets` seed with a few mock products
9. Add wedding band and tennis bracelet products to `products` table

---

## Documentation Updates

- `docs/api/README.md`:
  - Update engagement ring endpoints: remove `configurationImages` from response shape, update table/field references
  - Add wedding band and tennis bracelet endpoints
  - Add `wedding_band`, `tennis_bracelet` to `productCategory` value lists
  - Add `engravingText` to cart config response and request shapes
- `CLAUDE.md` — update file structure section

---

## Migration

Squash migrations after all changes (same workflow: delete all, regenerate, append triggers + indexes).
