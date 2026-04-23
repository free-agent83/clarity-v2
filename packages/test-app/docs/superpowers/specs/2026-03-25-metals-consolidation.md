# Metals Lookup Consolidation

## Context

Three separate lookup tables — `metal_types` (Gold, Platinum), `metal_colors` (Rose, Yellow, White, Platinum), and `metal_qualities` (10KT, 14KT, 18KT, 950) — model metal specifications as independent dimensions. In practice, only 8 specific combinations are valid. Keeping them separate adds unnecessary complexity (three FKs per table, invalid combos possible). Merge all three into a single `metals` lookup table.

---

## Schema Changes

### New table: `metals`

Uses the shared `lookupTable()` helper (columns: `id`, `value`, `sort_order`). Defined in `db/schema/lookups.ts`.

Seeded values:

| value | sort_order |
|---|---|
| `14k_yellow_gold` | 1 |
| `18k_yellow_gold` | 2 |
| `14k_rose_gold` | 3 |
| `18k_rose_gold` | 4 |
| `10k_white_gold` | 5 |
| `14k_white_gold` | 6 |
| `18k_white_gold` | 7 |
| `950_platinum` | 8 |

### Drop tables: `metal_types`, `metal_colors`, `metal_qualities`

Remove all three from `db/schema/lookups.ts` and all seed data.

### `jewelry` table (`db/schema/jewelry.ts`)

No changes. This table has no metal columns.

### `jewelry_available_metals` table (`db/schema/jewelry.ts`)

| Change | Detail |
|---|---|
| Drop column | `metal_type_id` (FK to `metal_types`) |
| Drop column | `metal_color_id` (FK to `metal_colors`) |
| Drop column | `metal_quality_id` (FK to `metal_qualities`) |
| Add column | `metal_id` (uuid, FK to `metals.id`, not null) |
| Update relations | Replace `metalType`, `metalColor`, `metalQuality` with single `metal` relation |

Becomes a simple junction: `jewelry_id` + `metal_id` + `price_usd`.

### `jewelry_configuration_images` table (`db/schema/jewelry.ts`)

| Change | Detail |
|---|---|
| Drop column | `metal_type_id` (FK to `metal_types`) |
| Drop column | `metal_color_id` (FK to `metal_colors`) |
| Add column | `metal_id` (uuid, FK to `metals.id`, not null) |
| Update relations | Replace `metalType`, `metalColor` with single `metal` relation |

### `cart_item_config` table (`db/schema/commerce.ts`)

| Change | Detail |
|---|---|
| Drop column | `metal_type_id` (FK to `metal_types`) |
| Drop column | `metal_color_id` (FK to `metal_colors`) |
| Drop column | `metal_quality_id` (FK to `metal_qualities`) |
| Add column | `metal_id` (uuid, FK to `metals.id`) — nullable (only set for jewelry cart items) |
| Update relations | Replace `metalType`, `metalColor`, `metalQuality` with single `metal` relation |

---

## API Layer Changes

### `lib/api/jewelry/engagement-rings.ts`

- The metal filtering query currently joins `metal_colors` and filters by `metalColors.value`. Replace with a join/filter on the `metals` table using `metals.value`.
- The `ENGAGEMENT_RING_FILTERS` multi-filter key `"metalColor"` should become `"metal"`.
- The API response shape for available metals changes: instead of separate `metalType`, `metalColor`, `metalQuality` objects, return a single `metal` object with `{ id, value }`.

### `lib/api/cart.ts`

- The cart query includes `metalColor: true` and `metalQuality: true` in the config relation. Replace with `metal: true`.
- The response mapping uses `metalColor` and `metalQuality` values. Replace with `metal.value`.
- The `addCartItem` function accepts `metalColorId` and `metalQualityId`. Replace with `metalId`.

---

## Frontend Changes

### `app/buyer/browse/jewelry/engagement-rings/[slug]/page.tsx`

- Currently reads `am.metalColor`, `am.metalQuality.value`, and groups metals by `am.metalType.value` with nested colors. Replace with a flat list of `am.metal.value` options.

### `app/buyer/browse/jewelry/engagement-rings/[slug]/jewelry-configuration.tsx`

- Uses `metalQualityValue` to compose display labels like `"18K Yellow gold"`. Replace with `metal.value` and use `formatLabel()` for display.

### `app/buyer/browse/jewelry/engagement-rings/page.tsx`

- Reads `am.metalColor.value` to build color swatches. Replace with `am.metal.value`.

---

## Seed Data Changes

1. Add `metals` seed (8 rows).
2. Remove `metal_types`, `metal_colors`, and `metal_qualities` seed data.
3. Update `jewelry_available_metals` seed: replace three metal FK columns with single `metal_id`.
4. Update `jewelry_configuration_images` seed: replace `metal_type_id` + `metal_color_id` with `metal_id`.
5. Update `cart_item_config` seed: replace three metal FK columns with `metal_id`.

---

## Documentation Updates

- Update `docs/api/README.md`: engagement ring response shape (available metals), filter parameters, cart response shape.

---

## Migration

Squash migrations after changes (same workflow: delete all, regenerate, append triggers + indexes).
