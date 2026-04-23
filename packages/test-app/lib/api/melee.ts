import { db } from "@/db/client";
import {
  products,
  productCategories,
  meleeLots,
  shapes,
  diamondCutGrades,
  productImages,
} from "@/db/schema";
import {
  eq,
  and,
  isNull,
  inArray,
  ilike,
  or,
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
} from "./helpers";
import type { FilterDefinition, ParsedFilters } from "./filters";

// The "resolved" type that pages consume
export interface MeleeItem {
  id: string;
  stockId: string;
  shape: string;
  sizeRange: string;
  colorRange: string;
  clarityRange: string;
  cut: string;
  quantity: number;
  totalCaratWeight: number;
  pricePerCarat: number;
  totalPrice: number;
  description: string;
  images: { main: string; additional: string[] };
}

async function resolveAll(labGrown: boolean): Promise<MeleeItem[]> {
  const rows = await db.query.products.findMany({
    where: and(
      inArray(
        products.productCategoryId,
        db
          .select({ id: productCategories.id })
          .from(productCategories)
          .where(
            inArray(productCategories.value, [
              "natural_melee",
              "lab_grown_melee",
            ]),
          ),
      ),
      isNull(products.deletedAt),
    ),
    with: {
      meleeLot: {
        with: {
          shape: true,
          cut: true,
        },
      },
      images: true,
    },
  });

  return rows
    .filter((r) => r.meleeLot && r.meleeLot.labGrown === labGrown)
    .map((row) => {
      const m = row.meleeLot!;
      const imgs = row.images ?? [];
      const mainImage =
        imgs.find((img) => img.isThumbnail)?.url ??
        imgs.find((img) => img.sortOrder === 0)?.url ??
        imgs[0]?.url ??
        "";
      const additionalImages = imgs
        .filter((img) => !img.isThumbnail)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((img) => img.url);

      return {
        id: row.id,
        stockId: row.stockId,
        shape: m.shape?.value ?? "Unknown",
        sizeRange: m.sizeRange,
        colorRange: m.colorRange,
        clarityRange: m.clarityRange,
        cut: m.cut?.value ?? "Unknown",
        quantity: m.quantity,
        totalCaratWeight: Number(m.totalCaratWeight),
        pricePerCarat:
          Number(row.priceUsd) / Math.max(Number(m.totalCaratWeight), 1),
        totalPrice: Number(row.priceUsd),
        description: row.description,
        images: { main: mainImage, additional: additionalImages },
      };
    });
}

export async function fetchMeleeList(
  options: PaginatedOptions,
  labGrown = false,
): Promise<PaginatedResult<MeleeItem>> {
  const items = await resolveAll(labGrown);
  return paginate(items, options);
}

export async function fetchMeleeItem(
  id: string,
  labGrown = false,
): Promise<MeleeItem | undefined> {
  const items = await resolveAll(labGrown);
  return items.find((i) => i.id === id);
}

export async function fetchRelatedMelee(
  excludeId: string,
  labGrown = false,
  limit = 4,
): Promise<MeleeItem[]> {
  const items = await resolveAll(labGrown);
  return items.filter((i) => i.id !== excludeId).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Server-side filtered pagination (used by Route Handlers)
// ---------------------------------------------------------------------------

export const MELEE_FILTERS: FilterDefinition = {
  multi: ["shape", "sizeRange", "colorRange", "clarityRange", "cut"],
  range: ["price"],
  sortOptions: ["price_asc", "price_desc", "newest"],
};

export interface MeleeListItem {
  id: string;
  shape: string;
  sizeRange: string;
  colorRange: string;
  clarityRange: string;
  cut: string;
  totalCaratWeight: number;
  pricePerCarat: number;
  totalPrice: number;
  image: string;
  description: string;
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
 * Server-side paginated + filtered melee list.
 * Uses Drizzle select() builder with explicit joins so the DB does the
 * filtering, sorting, and pagination — no in-memory work.
 *
 * Note: meleeLots.sizeRange, colorRange, and clarityRange are TEXT fields,
 * so multi-value filtering uses ILIKE OR chains.
 */
export async function fetchMeleeListFiltered(
  filters: ParsedFilters["filters"],
  sort: string | null,
  pagination: ServerPaginationParams,
  labGrown = false,
): Promise<{ items: MeleeListItem[]; totalItems: number }> {
  // Build WHERE conditions
  const conditions: SQL[] = [
    inArray(
      products.productCategoryId,
      db
        .select({ id: productCategories.id })
        .from(productCategories)
        .where(
          inArray(productCategories.value, [
            "natural_melee",
            "lab_grown_melee",
          ]),
        ),
    ),
    eq(meleeLots.labGrown, labGrown),
    eq(products.isActive, true),
    isNull(products.deletedAt),
  ];

  // FK-lookup multi-value filters
  const shapeVals = getMultiValues(filters, "shape");
  if (shapeVals) {
    conditions.push(
      inArray(
        meleeLots.shapeId,
        db
          .select({ id: shapes.id })
          .from(shapes)
          .where(inArray(shapes.value, shapeVals)),
      ),
    );
  }

  const cutVals = getMultiValues(filters, "cut");
  if (cutVals) {
    conditions.push(
      inArray(
        meleeLots.cutId,
        db
          .select({ id: diamondCutGrades.id })
          .from(diamondCutGrades)
          .where(inArray(diamondCutGrades.value, cutVals)),
      ),
    );
  }

  // Text field multi-value filters (ILIKE OR chains)
  const sizeRangeVals = getMultiValues(filters, "sizeRange");
  if (sizeRangeVals) {
    conditions.push(
      or(...sizeRangeVals.map((v) => ilike(meleeLots.sizeRange, v))) as SQL,
    );
  }

  const colorRangeVals = getMultiValues(filters, "colorRange");
  if (colorRangeVals) {
    conditions.push(
      or(...colorRangeVals.map((v) => ilike(meleeLots.colorRange, v))) as SQL,
    );
  }

  const clarityRangeVals = getMultiValues(filters, "clarityRange");
  if (clarityRangeVals) {
    conditions.push(
      or(
        ...clarityRangeVals.map((v) => ilike(meleeLots.clarityRange, v)),
      ) as SQL,
    );
  }

  // Range filters
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

  // Base query shape: products → meleeLots, with left join to thumbnail image
  const baseFrom = db
    .select({
      id: products.id,
      priceUsd: products.priceUsd,
      description: products.description,
      createdAt: products.createdAt,
      totalCaratWeight: meleeLots.totalCaratWeight,
      sizeRange: meleeLots.sizeRange,
      colorRange: meleeLots.colorRange,
      clarityRange: meleeLots.clarityRange,
      shapeValue: shapes.value,
      cutValue: diamondCutGrades.value,
      mainImage: productImages.url,
    })
    .from(products)
    .innerJoin(meleeLots, eq(meleeLots.productId, products.id))
    .innerJoin(shapes, eq(meleeLots.shapeId, shapes.id))
    .innerJoin(diamondCutGrades, eq(meleeLots.cutId, diamondCutGrades.id))
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
    .from(products)
    .innerJoin(meleeLots, eq(meleeLots.productId, products.id))
    .innerJoin(shapes, eq(meleeLots.shapeId, shapes.id))
    .innerJoin(diamondCutGrades, eq(meleeLots.cutId, diamondCutGrades.id))
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

  const items: MeleeListItem[] = rows.map((row) => ({
    id: row.id,
    shape: row.shapeValue ?? "Unknown",
    sizeRange: row.sizeRange ?? "",
    colorRange: row.colorRange ?? "",
    clarityRange: row.clarityRange ?? "",
    cut: row.cutValue ?? "Unknown",
    totalCaratWeight: Number(row.totalCaratWeight),
    pricePerCarat:
      Number(row.priceUsd) / Math.max(Number(row.totalCaratWeight), 1),
    totalPrice: Number(row.priceUsd),
    image: row.mainImage ?? "",
    description: row.description,
  }));

  return { items, totalItems };
}
