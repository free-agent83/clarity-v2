import { db } from "@/db/client";
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
import {
  eq,
  and,
  isNull,
  inArray,
  gte,
  lte,
  asc,
  desc,
  count,
  type SQL,
} from "drizzle-orm";
import {
  paginate,
  type PaginatedResult,
  type PaginatedOptions,
  type ServerPaginationParams,
} from "../helpers";
import type { FilterDefinition, ParsedFilters } from "../filters";
import { type JewelryItemBase, getThumbnailUrl } from "./shared";

// ---------------------------------------------------------------------------
// Resolved type — engagement-ring-specific shape
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Resolve all engagement ring rows from the database
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function fetchEngagementRingList(
  options: PaginatedOptions,
): Promise<PaginatedResult<EngagementRingItem>> {
  const items = await resolveAll();
  return paginate(items, options);
}

export async function fetchEngagementRingItem(
  id: string,
): Promise<EngagementRingItem | undefined> {
  const items = await resolveAll();
  return items.find((i) => i.id === id);
}

export async function fetchRelatedEngagementRings(
  excludeId: string,
  limit = 4,
): Promise<EngagementRingItem[]> {
  const items = await resolveAll();
  return items.filter((i) => i.id !== excludeId).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Server-side filtered pagination (used by Route Handlers)
// ---------------------------------------------------------------------------

export const ENGAGEMENT_RING_FILTERS: FilterDefinition = {
  multi: ["metal", "stoneShape", "bandStyle"],
  range: ["price"],
  sortOptions: ["price_asc", "price_desc", "newest"],
};

export interface EngagementRingListItem {
  id: string;
  sku: string;
  description: string;
  bandStyle: string;
  image: string;
  minPriceUsd: number;
  availableMetalTypes: string[];
  availableStoneShapes: string[];
}

/** Helper: extract array filter values for a given key */
function getMultiValues(
  filters: ParsedFilters["filters"],
  key: string,
): string[] | null {
  const value = filters[key];
  return Array.isArray(value) && value.length > 0 ? value : null;
}

/** Helper: extract range filter for a given key */
function getRangeValues(
  filters: ParsedFilters["filters"],
  key: string,
): { min?: number; max?: number } | null {
  const value = filters[key];
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  return null;
}

/**
 * Server-side paginated + filtered engagement ring list.
 * Uses Drizzle select() builder with explicit joins so the DB does the
 * filtering, sorting, and pagination — no in-memory work.
 *
 * Many-to-many filters (metal, stoneShape) use subqueries against the
 * junction tables engagementRingAvailableMetals and
 * engagementRingCompatibleStones so that any matching row qualifies the ring.
 */
export async function fetchEngagementRingListFiltered(
  filters: ParsedFilters["filters"],
  sort: string | null,
  pagination: ServerPaginationParams,
): Promise<{ items: EngagementRingListItem[]; totalItems: number }> {
  // Build WHERE conditions
  const conditions: SQL[] = [
    inArray(
      products.productCategoryId,
      db
        .select({ id: productCategories.id })
        .from(productCategories)
        .where(eq(productCategories.value, "engagement_ring")),
    ),
    eq(products.isActive, true),
    isNull(products.deletedAt),
  ];

  // Many-to-many: metal filter
  const metalVals = getMultiValues(filters, "metal");
  if (metalVals) {
    conditions.push(
      inArray(
        engagementRings.id,
        db
          .select({
            engagementRingId: engagementRingAvailableMetals.engagementRingId,
          })
          .from(engagementRingAvailableMetals)
          .innerJoin(
            metals,
            eq(engagementRingAvailableMetals.metalId, metals.id),
          )
          .where(inArray(metals.value, metalVals)),
      ),
    );
  }

  // Many-to-many: stoneShape filter — any ring that has this stone shape compatible
  const stoneShapeVals = getMultiValues(filters, "stoneShape");
  if (stoneShapeVals) {
    conditions.push(
      inArray(
        engagementRings.id,
        db
          .select({
            engagementRingId: engagementRingCompatibleStones.engagementRingId,
          })
          .from(engagementRingCompatibleStones)
          .innerJoin(
            shapes,
            eq(engagementRingCompatibleStones.shapeId, shapes.id),
          )
          .where(inArray(shapes.value, stoneShapeVals)),
      ),
    );
  }

  // Band style filter (directly on engagementRings)
  const bandStyleVals = getMultiValues(filters, "bandStyle");
  if (bandStyleVals) {
    conditions.push(
      inArray(
        engagementRings.bandStyleId,
        db
          .select({ id: bandStyles.id })
          .from(bandStyles)
          .where(inArray(bandStyles.value, bandStyleVals)),
      ),
    );
  }

  // Price range filter (on products.priceUsd)
  const priceRange = getRangeValues(filters, "price");
  if (priceRange) {
    if (priceRange.min !== undefined) {
      conditions.push(gte(products.priceUsd, String(priceRange.min)));
    }
    if (priceRange.max !== undefined) {
      conditions.push(lte(products.priceUsd, String(priceRange.max)));
    }
  }

  const whereClause = and(...conditions);

  // Base query: engagementRings → products → bandStyles, with thumbnail image
  const baseFrom = db
    .select({
      id: engagementRings.id,
      sku: engagementRings.sku,
      description: products.description,
      createdAt: products.createdAt,
      priceUsd: products.priceUsd,
      bandStyleValue: bandStyles.value,
      mainImage: productImages.url,
    })
    .from(engagementRings)
    .innerJoin(products, eq(engagementRings.productId, products.id))
    .innerJoin(bandStyles, eq(engagementRings.bandStyleId, bandStyles.id))
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, products.id),
        eq(productImages.isThumbnail, true),
      ),
    )
    .where(whereClause);

  // Count query (same joins + where, no limit/offset)
  const [countResult] = await db
    .select({ total: count() })
    .from(engagementRings)
    .innerJoin(products, eq(engagementRings.productId, products.id))
    .where(whereClause);

  const totalItems = countResult?.total ?? 0;

  // Sort
  const orderBy = (() => {
    switch (sort) {
      case "price_asc":
        return asc(products.priceUsd);
      case "price_desc":
        return desc(products.priceUsd);
      case "newest":
        return desc(products.createdAt);
      default:
        return desc(products.createdAt);
    }
  })();

  // Data query
  const rows = await baseFrom
    .orderBy(orderBy)
    .limit(pagination.perPage)
    .offset(pagination.offset);

  const items: EngagementRingListItem[] = rows.map((row) => ({
    id: row.id,
    sku: row.sku,
    description: row.description,
    bandStyle: row.bandStyleValue ?? "Unknown",
    image: row.mainImage ?? "",
    minPriceUsd: Number(row.priceUsd),
    availableMetalTypes: [],
    availableStoneShapes: [],
  }));

  return { items, totalItems };
}
