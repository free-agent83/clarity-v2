import { db } from "@/db/client";
import {
  products,
  productCategories,
  diamonds,
  shapes,
  diamondColors,
  diamondClarityGrades,
  diamondCutGrades,
  diamondPolishGrades,
  diamondSymmetryGrades,
  diamondFluorescenceLevels,
  certificationLabs,
  productImages,
  certifications,
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
} from "./helpers";
import type { FilterDefinition, ParsedFilters } from "./filters";

// The "resolved" type that pages consume (matches old flat mock shape)
export interface DiamondItem {
  id: string;
  stockId: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  polish: string;
  symmetry: string;
  fluorescence: string;
  certification: { lab: string; number: string; pdfUrl: string | null };
  dimensions: { length: number; width: number; depth: number };
  tablePct: number;
  depthPct: number;
  price: number;
  pricePerCarat: number;
  description: string;
  images: { main: string; additional: string[] };
}

async function resolveAll(labGrown: boolean): Promise<DiamondItem[]> {
  const rows = await db.query.products.findMany({
    where: and(
      inArray(
        products.productCategoryId,
        db
          .select({ id: productCategories.id })
          .from(productCategories)
          .where(
            inArray(productCategories.value, [
              "natural_diamond",
              "lab_grown_diamond",
            ]),
          ),
      ),
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
      certification: { with: { lab: true } },
    },
  });

  return rows
    .filter((r) => r.diamond && r.diamond.labGrown === labGrown)
    .map((row) => {
      const d = row.diamond!;
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
          pdfUrl: row.certification?.pdfUrl ?? null,
        },
        dimensions: {
          length: Number(d.lengthMm),
          width: Number(d.widthMm),
          depth: Number(d.depthMm),
        },
        tablePct: Number(d.tablePct),
        depthPct: Number(d.depthPct),
        price: Number(row.priceUsd),
        pricePerCarat: Number(d.pricePerCaratUsd ?? 0),
        description: row.description,
        images: { main: mainImage, additional: additionalImages },
      };
    });
}

export async function fetchDiamondList(
  options: PaginatedOptions,
  labGrown = false,
): Promise<PaginatedResult<DiamondItem>> {
  const items = await resolveAll(labGrown);
  return paginate(items, options);
}

export async function fetchDiamondItem(
  id: string,
  labGrown = false,
): Promise<DiamondItem | undefined> {
  const items = await resolveAll(labGrown);
  return items.find((i) => i.id === id);
}

export async function fetchRelatedDiamonds(
  excludeId: string,
  labGrown = false,
  limit = 4,
): Promise<DiamondItem[]> {
  const items = await resolveAll(labGrown);
  return items.filter((i) => i.id !== excludeId).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Server-side filtered pagination (used by Route Handlers)
// ---------------------------------------------------------------------------

export const DIAMOND_FILTERS: FilterDefinition = {
  multi: [
    "shape",
    "color",
    "clarity",
    "cut",
    "polish",
    "symmetry",
    "fluorescence",
    "certification",
  ],
  range: ["carat", "price"],
  sortOptions: ["price_asc", "price_desc", "carat_asc", "carat_desc", "newest"],
};

export interface DiamondListItem {
  id: string;
  stockId: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
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
 * Server-side paginated + filtered diamond list.
 * Uses Drizzle select() builder with explicit joins so the DB does the
 * filtering, sorting, and pagination — no in-memory work.
 */
export async function fetchDiamondListFiltered(
  filters: ParsedFilters["filters"],
  sort: string | null,
  pagination: ServerPaginationParams,
  labGrown = false,
): Promise<{ items: DiamondListItem[]; totalItems: number }> {
  // Build WHERE conditions
  const conditions: SQL[] = [
    inArray(
      products.productCategoryId,
      db
        .select({ id: productCategories.id })
        .from(productCategories)
        .where(
          inArray(productCategories.value, [
            "natural_diamond",
            "lab_grown_diamond",
          ]),
        ),
    ),
    eq(diamonds.labGrown, labGrown),
    eq(products.isActive, true),
    isNull(products.deletedAt),
  ];

  // Multi-value filters — each uses a subquery against its lookup table
  const shapeVals = getMultiValues(filters, "shape");
  if (shapeVals) {
    conditions.push(
      inArray(
        diamonds.shapeId,
        db
          .select({ id: shapes.id })
          .from(shapes)
          .where(inArray(shapes.value, shapeVals)),
      ),
    );
  }

  const colorVals = getMultiValues(filters, "color");
  if (colorVals) {
    conditions.push(
      inArray(
        diamonds.colorId,
        db
          .select({ id: diamondColors.id })
          .from(diamondColors)
          .where(inArray(diamondColors.value, colorVals)),
      ),
    );
  }

  const clarityVals = getMultiValues(filters, "clarity");
  if (clarityVals) {
    conditions.push(
      inArray(
        diamonds.clarityId,
        db
          .select({ id: diamondClarityGrades.id })
          .from(diamondClarityGrades)
          .where(inArray(diamondClarityGrades.value, clarityVals)),
      ),
    );
  }

  const cutVals = getMultiValues(filters, "cut");
  if (cutVals) {
    conditions.push(
      inArray(
        diamonds.cutId,
        db
          .select({ id: diamondCutGrades.id })
          .from(diamondCutGrades)
          .where(inArray(diamondCutGrades.value, cutVals)),
      ),
    );
  }

  const polishVals = getMultiValues(filters, "polish");
  if (polishVals) {
    conditions.push(
      inArray(
        diamonds.polishId,
        db
          .select({ id: diamondPolishGrades.id })
          .from(diamondPolishGrades)
          .where(inArray(diamondPolishGrades.value, polishVals)),
      ),
    );
  }

  const symmetryVals = getMultiValues(filters, "symmetry");
  if (symmetryVals) {
    conditions.push(
      inArray(
        diamonds.symmetryId,
        db
          .select({ id: diamondSymmetryGrades.id })
          .from(diamondSymmetryGrades)
          .where(inArray(diamondSymmetryGrades.value, symmetryVals)),
      ),
    );
  }

  const fluorescenceVals = getMultiValues(filters, "fluorescence");
  if (fluorescenceVals) {
    conditions.push(
      inArray(
        diamonds.fluorescenceId,
        db
          .select({ id: diamondFluorescenceLevels.id })
          .from(diamondFluorescenceLevels)
          .where(inArray(diamondFluorescenceLevels.value, fluorescenceVals)),
      ),
    );
  }

  // Certification filter (through certifications → certificationLabs)
  const certVals = getMultiValues(filters, "certification");
  if (certVals) {
    conditions.push(
      inArray(
        products.id,
        db
          .select({ productId: certifications.productId })
          .from(certifications)
          .innerJoin(
            certificationLabs,
            eq(certifications.labId, certificationLabs.id),
          )
          .where(inArray(certificationLabs.value, certVals)),
      ),
    );
  }

  // Range filters
  const caratRange = getRangeValues(filters, "carat");
  if (caratRange) {
    if (caratRange.min !== undefined) {
      conditions.push(gte(diamonds.carat, String(caratRange.min)));
    }
    if (caratRange.max !== undefined) {
      conditions.push(lte(diamonds.carat, String(caratRange.max)));
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

  // Base query shape: products → diamonds, with left joins to thumbnail
  // image + certification + certification lab (all optional on the product).
  const baseFrom = db
    .select({
      id: products.id,
      stockId: products.stockId,
      priceUsd: products.priceUsd,
      pricePerCaratUsd: diamonds.pricePerCaratUsd,
      description: products.description,
      createdAt: products.createdAt,
      carat: diamonds.carat,
      shapeValue: shapes.value,
      colorValue: diamondColors.value,
      clarityValue: diamondClarityGrades.value,
      cutValue: diamondCutGrades.value,
      mainImage: productImages.url,
      certNumber: certifications.certificateNumber,
      certLabValue: certificationLabs.value,
    })
    .from(products)
    .innerJoin(diamonds, eq(diamonds.productId, products.id))
    .innerJoin(shapes, eq(diamonds.shapeId, shapes.id))
    .innerJoin(diamondColors, eq(diamonds.colorId, diamondColors.id))
    .innerJoin(
      diamondClarityGrades,
      eq(diamonds.clarityId, diamondClarityGrades.id),
    )
    .innerJoin(diamondCutGrades, eq(diamonds.cutId, diamondCutGrades.id))
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
    .innerJoin(diamonds, eq(diamonds.productId, products.id))
    .innerJoin(shapes, eq(diamonds.shapeId, shapes.id))
    .innerJoin(diamondColors, eq(diamonds.colorId, diamondColors.id))
    .innerJoin(
      diamondClarityGrades,
      eq(diamonds.clarityId, diamondClarityGrades.id),
    )
    .innerJoin(diamondCutGrades, eq(diamonds.cutId, diamondCutGrades.id))
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
        return asc(diamonds.carat);
      case "carat_desc":
        return desc(diamonds.carat);
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

  const items: DiamondListItem[] = rows.map((row) => ({
    id: row.id,
    stockId: row.stockId,
    shape: row.shapeValue ?? "Unknown",
    carat: Number(row.carat),
    color: row.colorValue ?? "Unknown",
    clarity: row.clarityValue ?? "Unknown",
    cut: row.cutValue ?? "Unknown",
    price: Number(row.priceUsd),
    pricePerCarat: Number(row.pricePerCaratUsd ?? 0),
    image: row.mainImage ?? "",
    description: row.description,
    certLab: row.certLabValue ?? "",
    certNumber: row.certNumber ?? "",
  }));

  return { items, totalItems };
}
