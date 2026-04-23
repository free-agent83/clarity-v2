import { db } from "@/db/client";
import { eq, and } from "drizzle-orm";
import { shortlists, shortlistItems } from "@/db/schema";

// ---------------------------------------------------------------------------
// Shortlists (parent)
// ---------------------------------------------------------------------------

export async function fetchShortlists(userId: string) {
  const rows = await db.query.shortlists.findMany({
    where: eq(shortlists.userId, userId),
    with: {
      items: {
        with: {
          product: {
            with: { images: true, productCategory: true },
          },
        },
      },
    },
  });

  return rows.map((sl) => ({
    id: sl.id,
    name: sl.name,
    itemCount: sl.items.length,
    items: sl.items.map((item) => {
      const mainImage =
        item.product.images.find((img) => img.isThumbnail) ??
        item.product.images.find((img) => img.sortOrder === 0) ??
        item.product.images[0] ??
        null;

      return {
        id: item.id,
        addedAt: item.addedAt,
        product: {
          id: item.product.id,
          title: item.product.description,
          image: mainImage?.url ?? null,
          price: item.product.priceUsd,
          category: item.product.productCategory?.value ?? "",
        },
      };
    }),
  }));
}

export async function createShortlist(
  userId: string,
  name: string,
): Promise<{ id: string }> {
  const [row] = await db
    .insert(shortlists)
    .values({ userId, name })
    .returning();

  return { id: row.id };
}

// ---------------------------------------------------------------------------
// Shortlist items
// ---------------------------------------------------------------------------

export async function fetchShortlistItems(shortlistId: string) {
  const items = await db.query.shortlistItems.findMany({
    where: eq(shortlistItems.shortlistId, shortlistId),
    with: {
      product: {
        with: { images: true, productCategory: true },
      },
    },
  });

  return items.map((item) => {
    const mainImage =
      item.product.images.find((img) => img.isThumbnail) ??
      item.product.images.find((img) => img.sortOrder === 0) ??
      item.product.images[0] ??
      null;

    return {
      id: item.id,
      addedAt: item.addedAt,
      product: {
        id: item.product.id,
        title: item.product.description,
        image: mainImage?.url ?? null,
        price: item.product.priceUsd,
        category: item.product.productCategory?.value ?? "",
      },
    };
  });
}

export async function addShortlistItem(
  shortlistId: string,
  productId: string,
): Promise<{ id: string }> {
  const [item] = await db
    .insert(shortlistItems)
    .values({ shortlistId, productId })
    .returning();

  return { id: item.id };
}

export async function removeShortlistItem(
  shortlistId: string,
  itemId: string,
): Promise<void> {
  await db
    .delete(shortlistItems)
    .where(
      and(
        eq(shortlistItems.id, itemId),
        eq(shortlistItems.shortlistId, shortlistId),
      ),
    );
}

export async function removeShortlistItemByProduct(
  shortlistId: string,
  productId: string,
): Promise<void> {
  await db
    .delete(shortlistItems)
    .where(
      and(
        eq(shortlistItems.productId, productId),
        eq(shortlistItems.shortlistId, shortlistId),
      ),
    );
}
