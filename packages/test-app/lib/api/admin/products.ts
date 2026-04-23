import { eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import {
  products,
  diamonds,
  gemstones,
  meleeLots,
  engagementRings,
  engagementRingAvailableMetals,
  engagementRingCompatibleStones,
  weddingBands,
  weddingBandAvailableMetals,
  tennisBracelets,
  productImages,
  certifications,
  orderProducts,
  shortlistItems,
  cartItems,
  suppliers,
} from "@/db/schema";
import type { PaginatedResult } from "@/lib/api/helpers";
import type { ProductOption } from "@/components/admin/product-combobox";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminProductListItem {
  id: string;
  stockId: string;
  category: string;
  categorySlug: string;
  supplierName: string;
  priceUsd: number;
  isActive: boolean;
  createdAt: string;
}

export interface AdminSupplierItem {
  id: string;
  name: string;
}

export interface CreateProductInput {
  supplierId: string;
  stockId: string;
  productCategoryId: string;
  priceUsd: number;
  description: string;
  isActive?: boolean;
  diamond?: {
    labGrown: boolean;
    shapeId: string;
    carat: number;
    colorId: string;
    clarityId: string;
    cutId: string;
    polishId: string;
    symmetryId: string;
    fluorescenceId: string;
    pricePerCaratUsd?: number;
    tablePct?: number;
    depthPct?: number;
    lengthMm?: number;
    widthMm?: number;
    depthMm?: number;
  };
  gemstone?: {
    gemstoneTypeId: string;
    shapeId: string;
    carat: number;
    color: string;
    clarity: string;
    cutId: string;
    treatmentId: string;
    originId: string;
    pricePerCaratUsd?: number;
    lengthMm?: number;
    widthMm?: number;
    depthMm?: number;
  };
  melee?: {
    labGrown: boolean;
    shapeId: string;
    sizeRange: string;
    colorRange: string;
    clarityRange: string;
    cutId: string;
    quantity: number;
    totalCaratWeight: number;
  };
  engagementRing?: {
    sku: string;
    bandStyleId: string;
    ringWidthMm?: number;
    availableMetals: { metalId: string; priceUsd: number }[];
    compatibleStones: { shapeId: string; maxCarat: number }[];
  };
  weddingBand?: {
    sku: string;
    bandStyleId: string;
    ringWidthMm?: number;
    availableMetals: { metalId: string; priceUsd: number }[];
  };
  tennisBracelet?: {
    sku: string;
  };
}

export type UpdateProductInput = Partial<CreateProductInput>;

// ---------------------------------------------------------------------------
// fetchAdminProductOptions (existing)
// ---------------------------------------------------------------------------

export async function fetchAdminProductOptions(): Promise<ProductOption[]> {
  const rows = await db.query.products.findMany({
    where: isNull(products.deletedAt),
    with: { productCategory: true },
  });

  return rows.map((p) => ({
    id: p.id,
    stockId: p.stockId,
    category: p.productCategory?.value ?? "",
    priceUsd: Number(p.priceUsd),
  }));
}

// ---------------------------------------------------------------------------
// fetchAdminSuppliers
// ---------------------------------------------------------------------------

export async function fetchAdminSuppliers(): Promise<AdminSupplierItem[]> {
  const rows = await db
    .select({ id: suppliers.id, name: suppliers.name })
    .from(suppliers)
    .where(isNull(suppliers.deletedAt))
    .orderBy(suppliers.name);

  return rows;
}

// ---------------------------------------------------------------------------
// Category slug helper
// ---------------------------------------------------------------------------

const CATEGORY_SLUG_MAP: Record<string, string> = {
  "Natural Diamond": "natural_diamond",
  "Lab Grown Diamond": "lab_grown_diamond",
  Gemstone: "gemstone",
  "Natural Melee": "natural_melee",
  "Lab Grown Melee": "lab_grown_melee",
  "Engagement Ring": "engagement_ring",
  "Wedding Band": "wedding_band",
  "Tennis Bracelet": "tennis_bracelet",
};

function categoryValueToSlug(value: string): string {
  return CATEGORY_SLUG_MAP[value] ?? value.toLowerCase().replace(/\s+/g, "_");
}

// ---------------------------------------------------------------------------
// fetchAdminProductList
// ---------------------------------------------------------------------------

export async function fetchAdminProductList(options: {
  page: number;
  perPage: number;
  search?: string;
  categoryId?: string;
  supplierId?: string;
  isActive?: boolean;
}): Promise<PaginatedResult<AdminProductListItem>> {
  const { page, perPage, search, categoryId, supplierId, isActive } = options;

  const rows = await db.query.products.findMany({
    where: isNull(products.deletedAt),
    with: {
      productCategory: true,
      supplier: true,
    },
  });

  let items: AdminProductListItem[] = rows.map((p) => ({
    id: p.id,
    stockId: p.stockId,
    category: p.productCategory?.value ?? "",
    categorySlug: categoryValueToSlug(p.productCategory?.value ?? ""),
    supplierName: p.supplier?.name ?? "",
    priceUsd: Number(p.priceUsd),
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
  }));

  // Apply filters
  if (categoryId) {
    items = items.filter((item) => {
      const row = rows.find((r) => r.id === item.id);
      return row?.productCategoryId === categoryId;
    });
  }

  if (supplierId) {
    items = items.filter((item) => {
      const row = rows.find((r) => r.id === item.id);
      return row?.supplierId === supplierId;
    });
  }

  if (isActive !== undefined) {
    items = items.filter((item) => item.isActive === isActive);
  }

  if (search) {
    const lower = search.toLowerCase();
    items = items.filter(
      (item) =>
        item.stockId.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower),
    );
  }

  // Sort by date descending
  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Manual pagination
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const paginatedItems = items.slice(startIndex, startIndex + perPage);

  return {
    items: paginatedItems,
    totalItems,
    totalPages,
    currentPage,
    perPage,
  };
}

// ---------------------------------------------------------------------------
// createAdminProduct
// ---------------------------------------------------------------------------

export async function createAdminProduct(
  input: CreateProductInput,
): Promise<{ id: string }> {
  // Insert products row
  const [product] = await db
    .insert(products)
    .values({
      supplierId: input.supplierId,
      stockId: input.stockId,
      productCategoryId: input.productCategoryId,
      priceUsd: String(input.priceUsd),
      description: input.description,
      isActive: input.isActive ?? true,
    })
    .returning({ id: products.id });

  // Diamond
  if (input.diamond) {
    const d = input.diamond;
    await db.insert(diamonds).values({
      productId: product.id,
      labGrown: d.labGrown,
      shapeId: d.shapeId,
      carat: String(d.carat),
      colorId: d.colorId,
      clarityId: d.clarityId,
      cutId: d.cutId,
      polishId: d.polishId,
      symmetryId: d.symmetryId,
      fluorescenceId: d.fluorescenceId,
      pricePerCaratUsd:
        d.pricePerCaratUsd != null ? String(d.pricePerCaratUsd) : null,
      tablePct: String(d.tablePct ?? 0),
      depthPct: String(d.depthPct ?? 0),
      lengthMm: String(d.lengthMm ?? 0),
      widthMm: String(d.widthMm ?? 0),
      depthMm: String(d.depthMm ?? 0),
    });
  }

  // Gemstone
  if (input.gemstone) {
    const g = input.gemstone;
    await db.insert(gemstones).values({
      productId: product.id,
      gemstoneTypeId: g.gemstoneTypeId,
      shapeId: g.shapeId,
      carat: String(g.carat),
      color: g.color,
      clarity: g.clarity,
      cutId: g.cutId,
      treatmentId: g.treatmentId,
      originId: g.originId,
      pricePerCaratUsd:
        g.pricePerCaratUsd != null ? String(g.pricePerCaratUsd) : null,
      lengthMm: String(g.lengthMm ?? 0),
      widthMm: String(g.widthMm ?? 0),
      depthMm: String(g.depthMm ?? 0),
    });
  }

  // Melee
  if (input.melee) {
    const m = input.melee;
    await db.insert(meleeLots).values({
      productId: product.id,
      labGrown: m.labGrown,
      shapeId: m.shapeId,
      sizeRange: m.sizeRange,
      colorRange: m.colorRange,
      clarityRange: m.clarityRange,
      cutId: m.cutId,
      quantity: m.quantity,
      totalCaratWeight: String(m.totalCaratWeight),
    });
  }

  // Engagement Ring
  if (input.engagementRing) {
    const er = input.engagementRing;
    const [ring] = await db
      .insert(engagementRings)
      .values({
        productId: product.id,
        sku: er.sku,
        bandStyleId: er.bandStyleId,
        ringWidthMm: String(er.ringWidthMm ?? 0),
      })
      .returning({ id: engagementRings.id });

    if (er.availableMetals.length > 0) {
      await db.insert(engagementRingAvailableMetals).values(
        er.availableMetals.map((m) => ({
          engagementRingId: ring.id,
          metalId: m.metalId,
          priceUsd: String(m.priceUsd),
        })),
      );
    }

    if (er.compatibleStones.length > 0) {
      await db.insert(engagementRingCompatibleStones).values(
        er.compatibleStones.map((s) => ({
          engagementRingId: ring.id,
          shapeId: s.shapeId,
          maxCarat: String(s.maxCarat),
        })),
      );
    }
  }

  // Wedding Band
  if (input.weddingBand) {
    const wb = input.weddingBand;
    const [band] = await db
      .insert(weddingBands)
      .values({
        productId: product.id,
        sku: wb.sku,
        bandStyleId: wb.bandStyleId,
        ringWidthMm: String(wb.ringWidthMm ?? 0),
      })
      .returning({ id: weddingBands.id });

    if (wb.availableMetals.length > 0) {
      await db.insert(weddingBandAvailableMetals).values(
        wb.availableMetals.map((m) => ({
          weddingBandId: band.id,
          metalId: m.metalId,
          priceUsd: String(m.priceUsd),
        })),
      );
    }
  }

  // Tennis Bracelet
  if (input.tennisBracelet) {
    await db.insert(tennisBracelets).values({
      productId: product.id,
      sku: input.tennisBracelet.sku,
    });
  }

  return { id: product.id };
}

// ---------------------------------------------------------------------------
// deleteAdminProduct
// ---------------------------------------------------------------------------

export async function deleteAdminProduct(productId: string): Promise<void> {
  // Check for engagement ring and delete junction tables
  const erRows = await db
    .select({ id: engagementRings.id })
    .from(engagementRings)
    .where(eq(engagementRings.productId, productId));

  for (const er of erRows) {
    await db
      .delete(engagementRingAvailableMetals)
      .where(eq(engagementRingAvailableMetals.engagementRingId, er.id));
    await db
      .delete(engagementRingCompatibleStones)
      .where(eq(engagementRingCompatibleStones.engagementRingId, er.id));
  }

  // Check for wedding band and delete junction tables
  const wbRows = await db
    .select({ id: weddingBands.id })
    .from(weddingBands)
    .where(eq(weddingBands.productId, productId));

  for (const wb of wbRows) {
    await db
      .delete(weddingBandAvailableMetals)
      .where(eq(weddingBandAvailableMetals.weddingBandId, wb.id));
  }

  // Delete from category-specific tables
  await db
    .delete(tennisBracelets)
    .where(eq(tennisBracelets.productId, productId));
  await db
    .delete(engagementRings)
    .where(eq(engagementRings.productId, productId));
  await db.delete(weddingBands).where(eq(weddingBands.productId, productId));
  await db.delete(diamonds).where(eq(diamonds.productId, productId));
  await db.delete(gemstones).where(eq(gemstones.productId, productId));
  await db.delete(meleeLots).where(eq(meleeLots.productId, productId));

  // Delete media
  await db
    .delete(certifications)
    .where(eq(certifications.productId, productId));
  await db.delete(productImages).where(eq(productImages.productId, productId));

  // Delete commerce references
  await db.delete(orderProducts).where(eq(orderProducts.productId, productId));
  await db
    .delete(shortlistItems)
    .where(eq(shortlistItems.productId, productId));
  await db.delete(cartItems).where(eq(cartItems.productId, productId));

  // Delete the product itself
  await db.delete(products).where(eq(products.id, productId));
}
