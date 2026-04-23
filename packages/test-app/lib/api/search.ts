import { db } from "@/db/client";
import {
  products,
  productCategories,
  orders,
  orderCheckouts,
  productImages,
} from "@/db/schema";
import { ilike, and, isNull, eq, count, inArray, sql } from "drizzle-orm";
import type { ServerPaginationParams } from "./helpers";

// ---------------------------------------------------------------------------
// Product type → human-readable category label
// ---------------------------------------------------------------------------

const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  natural_diamond: "Natural Diamond",
  lab_grown_diamond: "Lab Grown Diamond",
  gemstone: "Gemstone",
  natural_melee: "Natural Melee",
  lab_grown_melee: "Lab Grown Melee",
  engagement_ring: "Engagement Ring",
  wedding_band: "Wedding Band",
  tennis_bracelet: "Tennis Bracelet",
};

// ---------------------------------------------------------------------------
// Search Suggest
// ---------------------------------------------------------------------------

export interface SuggestProduct {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
}

export interface SuggestOrder {
  id: string;
  title: string;
  status: string;
}

export interface SuggestResult {
  products: SuggestProduct[];
  orders: SuggestOrder[];
}

export async function searchSuggest(
  query: string,
  userId: string | null,
  limit: number = 8,
): Promise<SuggestResult> {
  const pattern = `%${query}%`;

  // Products query: search by description, filter active + non-deleted
  const productsQuery = db
    .select({
      id: products.id,
      description: products.description,
      categoryValue: productCategories.value,
      priceUsd: products.priceUsd,
      mainImage: productImages.url,
    })
    .from(products)
    .innerJoin(
      productCategories,
      eq(products.productCategoryId, productCategories.id),
    )
    .leftJoin(
      productImages,
      and(
        eq(productImages.productId, products.id),
        eq(productImages.isThumbnail, true),
      ),
    )
    .where(
      and(
        ilike(products.description, pattern),
        eq(products.isActive, true),
        isNull(products.deletedAt),
      ),
    )
    .limit(limit);

  // Orders query: search by order number, only if user is authenticated
  // We need to join through orderCheckouts to filter by userId
  const ordersQuery =
    userId != null
      ? db
          .select({
            id: orders.id,
            orderNumber: orders.orderNumber,
            currentStatus: orders.currentStatus,
          })
          .from(orders)
          .innerJoin(orderCheckouts, eq(orders.checkoutId, orderCheckouts.id))
          .where(
            and(
              ilike(sql`${orders.orderNumber}::text`, pattern),
              eq(orderCheckouts.userId, userId),
            ),
          )
          .limit(limit)
      : null;

  const [productRows, orderRows] = await Promise.all([
    productsQuery,
    ordersQuery ?? Promise.resolve([]),
  ]);

  const suggestProducts: SuggestProduct[] = productRows.map((row) => {
    const categoryValue = row.categoryValue ?? "";
    const category = PRODUCT_CATEGORY_LABELS[categoryValue] ?? categoryValue;
    // Build a subtitle from category + price
    const price = Number(row.priceUsd);
    const subtitle = `${category} — $${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return {
      id: row.id,
      title: row.description,
      subtitle,
      category,
      image: row.mainImage ?? "",
    };
  });

  const suggestOrders: SuggestOrder[] = orderRows.map((row) => ({
    id: row.id,
    title: `Order ${row.orderNumber}`,
    status: row.currentStatus ?? "",
  }));

  return {
    products: suggestProducts,
    orders: suggestOrders,
  };
}

// ---------------------------------------------------------------------------
// Full Search
// ---------------------------------------------------------------------------

export interface SearchFullResult {
  items: Array<{
    resultType: "product" | "order";
    data: Record<string, unknown>;
  }>;
  totalItems: number;
}

export async function searchFull(
  query: string,
  userId: string | null,
  type: "all" | "products" | "orders",
  pagination: ServerPaginationParams,
): Promise<SearchFullResult> {
  const pattern = `%${query}%`;

  const includeProducts = type === "all" || type === "products";
  const includeOrders = (type === "all" || type === "orders") && userId != null;

  // Base conditions
  const productWhere = and(
    ilike(products.description, pattern),
    eq(products.isActive, true),
    isNull(products.deletedAt),
  );

  // For orders we need to filter by userId through orderCheckouts
  const userCheckoutIds = userId
    ? db
        .select({ id: orderCheckouts.id })
        .from(orderCheckouts)
        .where(eq(orderCheckouts.userId, userId))
    : null;

  const orderWhere =
    userId && userCheckoutIds
      ? and(
          ilike(sql`${orders.orderNumber}::text`, pattern),
          inArray(orders.checkoutId, userCheckoutIds),
        )
      : undefined;

  // Count queries
  const [productCount, orderCount] = await Promise.all([
    includeProducts
      ? db
          .select({ total: count() })
          .from(products)
          .where(productWhere)
          .then((r) => r[0]?.total ?? 0)
      : Promise.resolve(0),
    includeOrders && orderWhere
      ? db
          .select({ total: count() })
          .from(orders)
          .where(orderWhere)
          .then((r) => r[0]?.total ?? 0)
      : Promise.resolve(0),
  ]);

  const totalItems = productCount + orderCount;

  // When type is "all", products come first in the virtual list.
  // We figure out how many of each to fetch based on the offset.
  const { perPage, offset } = pagination;

  const items: SearchFullResult["items"] = [];

  if (type === "products") {
    // Only products
    const rows = await db
      .select({
        id: products.id,
        description: products.description,
        categoryValue: productCategories.value,
        priceUsd: products.priceUsd,
        mainImage: productImages.url,
      })
      .from(products)
      .innerJoin(
        productCategories,
        eq(products.productCategoryId, productCategories.id),
      )
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          eq(productImages.isThumbnail, true),
        ),
      )
      .where(productWhere)
      .limit(perPage)
      .offset(offset);

    for (const row of rows) {
      const cv = row.categoryValue ?? "";
      items.push({
        resultType: "product",
        data: {
          id: row.id,
          description: row.description,
          productType: cv,
          category: PRODUCT_CATEGORY_LABELS[cv] ?? cv,
          priceUsd: Number(row.priceUsd),
          image: row.mainImage ?? "",
        },
      });
    }
  } else if (type === "orders") {
    // Only orders (userId already checked via includeOrders)
    if (includeOrders && orderWhere) {
      const rows = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          currentStatus: orders.currentStatus,
        })
        .from(orders)
        .where(orderWhere)
        .limit(perPage)
        .offset(offset);

      for (const row of rows) {
        items.push({
          resultType: "order",
          data: {
            id: row.id,
            orderNumber: row.orderNumber,
            currentStatus: row.currentStatus,
          },
        });
      }
    }
  } else {
    // type === "all": products first, then orders
    if (offset < productCount) {
      // We need some products
      const productLimit = Math.min(perPage, productCount - offset);
      const productRows = await db
        .select({
          id: products.id,
          description: products.description,
          categoryValue: productCategories.value,
          priceUsd: products.priceUsd,
          mainImage: productImages.url,
        })
        .from(products)
        .innerJoin(
          productCategories,
          eq(products.productCategoryId, productCategories.id),
        )
        .leftJoin(
          productImages,
          and(
            eq(productImages.productId, products.id),
            eq(productImages.isThumbnail, true),
          ),
        )
        .where(productWhere)
        .limit(productLimit)
        .offset(offset);

      for (const row of productRows) {
        const cv = row.categoryValue ?? "";
        items.push({
          resultType: "product",
          data: {
            id: row.id,
            description: row.description,
            productType: cv,
            category: PRODUCT_CATEGORY_LABELS[cv] ?? cv,
            priceUsd: Number(row.priceUsd),
            image: row.mainImage ?? "",
          },
        });
      }

      // Fill remaining slots with orders
      const remainingSlots = perPage - items.length;
      if (remainingSlots > 0 && includeOrders && orderWhere) {
        const orderRows = await db
          .select({
            id: orders.id,
            orderNumber: orders.orderNumber,
            currentStatus: orders.currentStatus,
          })
          .from(orders)
          .where(orderWhere)
          .limit(remainingSlots)
          .offset(0);

        for (const row of orderRows) {
          items.push({
            resultType: "order",
            data: {
              id: row.id,
              orderNumber: row.orderNumber,
              currentStatus: row.currentStatus,
            },
          });
        }
      }
    } else {
      // Offset is past all products — only fetch orders
      if (includeOrders && orderWhere) {
        const orderOffset = offset - productCount;
        const orderRows = await db
          .select({
            id: orders.id,
            orderNumber: orders.orderNumber,
            currentStatus: orders.currentStatus,
          })
          .from(orders)
          .where(orderWhere)
          .limit(perPage)
          .offset(orderOffset);

        for (const row of orderRows) {
          items.push({
            resultType: "order",
            data: {
              id: row.id,
              orderNumber: row.orderNumber,
              currentStatus: row.currentStatus,
            },
          });
        }
      }
    }
  }

  return { items, totalItems };
}
