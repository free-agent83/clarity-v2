import { db } from "@/db/client";
import { eq, and } from "drizzle-orm";
import { cartItems, cartItemConfig } from "@/db/schema";

export async function fetchCart(userId: string) {
  const items = await db.query.cartItems.findMany({
    where: eq(cartItems.userId, userId),
    with: {
      product: {
        with: {
          images: true,
          productCategory: true,
        },
      },
      config: {
        with: {
          metal: true,
        },
      },
    },
  });

  return {
    items: items.map((item) => {
      const mainImage =
        item.product.images.find((img) => img.isThumbnail) ??
        item.product.images.find((img) => img.sortOrder === 0) ??
        item.product.images[0] ??
        null;

      return {
        id: item.id,
        quantity: item.quantity,
        addedAt: item.addedAt,
        product: {
          id: item.product.id,
          title: item.product.description,
          image: mainImage?.url ?? null,
          price: item.product.priceUsd,
          category: item.product.productCategory?.value ?? "",
        },
        config: item.config
          ? {
              metal: item.config.metal?.value ?? null,
              ringSize: item.config.ringSize
                ? Number(item.config.ringSize)
                : null,
              braceletLength: item.config.braceletLength
                ? Number(item.config.braceletLength)
                : null,
              engravingText: item.config.engravingText ?? null,
            }
          : null,
      };
    }),
  };
}

export async function addCartItem(
  userId: string,
  productId: string,
  quantity: number,
  config?: {
    metalId?: string;
    centerStoneProductId?: string;
    ringSize?: string;
    braceletLength?: string;
    engravingText?: string;
  },
): Promise<{ id: string }> {
  const [item] = await db
    .insert(cartItems)
    .values({
      userId,
      productId,
      quantity,
    })
    .returning();

  // If config options provided, create the config row
  if (config) {
    await db.insert(cartItemConfig).values({
      cartItemId: item.id,
      metalId: config.metalId ?? null,
      centerStoneProductId: config.centerStoneProductId ?? null,
      ringSize: config.ringSize ?? null,
      braceletLength: config.braceletLength ?? null,
      engravingText: config.engravingText ?? null,
    });
  }

  return { id: item.id };
}

export async function updateCartItem(
  userId: string,
  itemId: string,
  quantity: number,
): Promise<void> {
  await db
    .update(cartItems)
    .set({ quantity })
    .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)));
}

export async function removeCartItem(
  userId: string,
  itemId: string,
): Promise<void> {
  // Delete config first (FK constraint)
  await db.delete(cartItemConfig).where(eq(cartItemConfig.cartItemId, itemId));
  await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.userId, userId)));
}

export async function removeCartItemByProduct(
  userId: string,
  productId: string,
): Promise<void> {
  // Find the cart item first to delete config
  const items = await db
    .select({ id: cartItems.id })
    .from(cartItems)
    .where(
      and(eq(cartItems.productId, productId), eq(cartItems.userId, userId)),
    );

  for (const item of items) {
    await db
      .delete(cartItemConfig)
      .where(eq(cartItemConfig.cartItemId, item.id));
  }

  await db
    .delete(cartItems)
    .where(
      and(eq(cartItems.productId, productId), eq(cartItems.userId, userId)),
    );
}
