import { db } from "@/db/client";
import {
  products,
  productCategories,
  gemstones,
  shapes,
  gemstoneCutGrades,
  gemstoneTypes,
  gemstoneTreatments,
  gemstoneOrigins,
  productImages,
  certifications,
  certificationLabs,
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
export interface GemstoneItem {
  id: string;
  stockId: string;
  type: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  treatment: string;
  origin: string;
  certification: { lab: string; number: string; pdfUrl: string | null };
  dimensions: { length: number; width: number; depth: number };
  price: number;
  pricePerCarat: number;
  description: string;
  images: { main: string; additional: string[] };
}

async function resolveAll(): Promise<GemstoneItem[]> {
  const rows = await db.query.products.findMany({
    where: and(
      inArray(
        products.productCategoryId,
        db
          .select({ id: productCategories.id })
          .from(productCategories)
          .where(eq(productCategories.value, "gemstone")),
      ),
      isNull(products.deletedAt),
    ),
    with: {
      gemstone: {
        with: {
          gemstoneType: true,
          shape: true,
          cut: true,
          treatment: true,
          origin: true,
        },
      },
      images: true,
      certification: { with: { lab: true } },
    },
  });

  return rows
    .filter((r) => r.gemstone)
    .map((row) => {
      const g = row.gemstone!;
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
        type: g.gemstoneType?.value ?? "Unknown",
        shape: g.shape?.value ?? "Unknown",
        carat: Number(g.carat),
        color: g.color,
        clarity: g.clarity,
        cut: g.cut?.value ?? "Unknown",
        treatment: g.treatment?.value ?? "Unknown",
        origin: g.origin?.value ?? "Unknown",
        certification: {
          lab: row.certification?.lab?.value ?? "Unknown",
          number: row.certification?.certificateNumber ?? "",
          pdfUrl: row.certification?.pdfUrl ?? null,
        },
        dimensions: {
          length: Number(g.lengthMm),
          width: Number(g.widthMm),
          depth: Number(g.depthMm),
        },
        price: Number(row.priceUsd),
        pricePerCarat: Number(g.pricePerCaratUsd ?? 0),
        description: row.description,
        images: { main: mainImage, additional: additionalImages },
      };
    });
}

export async function fetchGemstoneList(
  options: PaginatedOptions,
): Promise<PaginatedResult<GemstoneItem>> {
  const items = await resolveAll();
  return paginate(items, options);
}

export async function fetchGemstoneItem(
  id: string,
): Promise<GemstoneItem | undefined> {
  const items = await resolveAll();
  return items.find((i) => i.id === id);
}

export async function fetchRelatedGemstones(
  excludeId: string,
  limit = 4,
): Promise<GemstoneItem[]> {
  const items = await resolveAll();
  return items.filter((i) => i.id !== excludeId).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Server-side filtered pagination (used by Route Handlers)
// ---------------------------------------------------------------------------

export const GEMSTONE_FILTERS: FilterDefinition = {
  multi: ["type", "shape", "color", "clarity", "cut", "treatment", "origin"],
  range: ["carat", "price"],
  sortOptions: ["price_asc", "price_desc", "carat_asc", "carat_desc", "newest"],
};

export interface GemstoneListItem {
  id: string;
  stockId: string;
  type: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  origin: string;
  price: number;
  pricePerCarat: number;
  image: string;
  description: string;
  certLab: string;
  certNumber: string;
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
 * Server-side paginated + filtered gemstone list.
 * Uses Drizzle select() builder with explicit joins so the DB does the
 * filtering, sorting, and pagination — no in-memory work.
 *
 * Note: gemstones.color and gemstones.clarity are TEXT fields (not FK
 * lookups), so multi-value filtering on those uses ILIKE OR chains.
 */
export async function fetchGemstoneListFiltered(
  filters: ParsedFilters["filters"],
  sort: string | null,
  pagination: ServerPaginationParams,
): Promise<{ items: GemstoneListItem[]; totalItems: number }> {
  // Build WHERE conditions
  const conditions: SQL[] = [
    inArray(
      products.productCategoryId,
      db
        .select({ id: productCategories.id })
        .from(productCategories)
        .where(eq(productCategories.value, "gemstone")),
    ),
    eq(products.isActive, true),
    isNull(products.deletedAt),
  ];

  // FK-lookup multi-value filters
  const typeVals = getMultiValues(filters, "type");
  if (typeVals) {
    conditions.push(
      inArray(
        gemstones.gemstoneTypeId,
        db
          .select({ id: gemstoneTypes.id })
          .from(gemstoneTypes)
          .where(inArray(gemstoneTypes.value, typeVals)),
      ),
    );
  }

  const shapeVals = getMultiValues(filters, "shape");
  if (shapeVals) {
    conditions.push(
      inArray(
        gemstones.shapeId,
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
        gemstones.cutId,
        db
          .select({ id: gemstoneCutGrades.id })
          .from(gemstoneCutGrades)
          .where(inArray(gemstoneCutGrades.value, cutVals)),
      ),
    );
  }

  const treatmentVals = getMultiValues(filters, "treatment");
  if (treatmentVals) {
    conditions.push(
      inArray(
        gemstones.treatmentId,
        db
          .select({ id: gemstoneTreatments.id })
          .from(gemstoneTreatments)
          .where(inArray(gemstoneTreatments.value, treatmentVals)),
      ),
    );
  }

  const originVals = getMultiValues(filters, "origin");
  if (originVals) {
    conditions.push(
      inArray(
        gemstones.originId,
        db
          .select({ id: gemstoneOrigins.id })
          .from(gemstoneOrigins)
          .where(inArray(gemstoneOrigins.value, originVals)),
      ),
    );
  }

  // Text field multi-value filters (ILIKE OR chains)
  const colorVals = getMultiValues(filters, "color");
  if (colorVals) {
    conditions.push(
      or(...colorVals.map((v) => ilike(gemstones.color, v))) as SQL,
    );
  }

  const clarityVals = getMultiValues(filters, "clarity");
  if (clarityVals) {
    conditions.push(
      or(...clarityVals.map((v) => ilike(gemstones.clarity, v))) as SQL,
    );
  }

  // Range filters
  const caratRange = getRangeValues(filters, "carat");
  if (caratRange) {
    if (caratRange.min !== undefined) {
      conditions.push(gte(gemstones.carat, String(caratRange.min)));
    }
    if (caratRange.max !== undefined) {
      conditions.push(lte(gemstones.carat, String(caratRange.max)));
    }
  }

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

  // Base query shape: products → gemstones, with left joins to thumbnail
  // image + origin (optional) + certification + certification lab (all
  // optional on the product).
  const baseFrom = db
    .select({
      id: products.id,
      stockId: products.stockId,
      priceUsd: products.priceUsd,
      pricePerCaratUsd: gemstones.pricePerCaratUsd,
      description: products.description,
      createdAt: products.createdAt,
      carat: gemstones.carat,
      color: gemstones.color,
      clarity: gemstones.clarity,
      typeValue: gemstoneTypes.value,
      shapeValue: shapes.value,
      cutValue: gemstoneCutGrades.value,
      originValue: gemstoneOrigins.value,
      mainImage: productImages.url,
      certNumber: certifications.certificateNumber,
      certLabValue: certificationLabs.value,
    })
    .from(products)
    .innerJoin(gemstones, eq(gemstones.productId, products.id))
    .innerJoin(gemstoneTypes, eq(gemstones.gemstoneTypeId, gemstoneTypes.id))
    .innerJoin(shapes, eq(gemstones.shapeId, shapes.id))
    .innerJoin(gemstoneCutGrades, eq(gemstones.cutId, gemstoneCutGrades.id))
    .leftJoin(gemstoneOrigins, eq(gemstones.originId, gemstoneOrigins.id))
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, products.id),
        eq(productImages.isThumbnail, true),
      ),
    )
    .leftJoin(certifications, eq(certifications.productId, products.id))
    .leftJoin(certificationLabs, eq(certificationLabs.id, certifications.labId))
    .where(whereClause);

  // Count query (same joins + where, no limit/offset)
  const [countResult] = await db
    .select({ total: count() })
    .from(products)
    .innerJoin(gemstones, eq(gemstones.productId, products.id))
    .innerJoin(gemstoneTypes, eq(gemstones.gemstoneTypeId, gemstoneTypes.id))
    .innerJoin(shapes, eq(gemstones.shapeId, shapes.id))
    .innerJoin(gemstoneCutGrades, eq(gemstones.cutId, gemstoneCutGrades.id))
    .where(whereClause);

  const totalItems = countResult?.total ?? 0;

  // Sort
  const orderBy = (() => {
    switch (sort) {
      case "price_asc":
        return asc(products.priceUsd);
      case "price_desc":
        return desc(products.priceUsd);
      case "carat_asc":
        return asc(gemstones.carat);
      case "carat_desc":
        return desc(gemstones.carat);
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

  const items: GemstoneListItem[] = rows.map((row) => ({
    id: row.id,
    stockId: row.stockId,
    type: row.typeValue ?? "Unknown",
    shape: row.shapeValue ?? "Unknown",
    carat: Number(row.carat),
    color: row.color ?? "Unknown",
    clarity: row.clarity ?? "Unknown",
    cut: row.cutValue ?? "Unknown",
    origin: row.originValue ?? "",
    price: Number(row.priceUsd),
    pricePerCarat: Number(row.pricePerCaratUsd ?? 0),
    image: row.mainImage ?? "",
    description: row.description,
    certLab: row.certLabValue ?? "",
    certNumber: row.certNumber ?? "",
  }));

  return { items, totalItems };
}
