import { eq, inArray, max } from "drizzle-orm";
import { db } from "@/db/client";
import {
  orders,
  orderCheckouts,
  orderProducts,
  orderEvents,
  orderExchangeRates,
  products,
} from "@/db/schema";
import type { PaginatedResult } from "@/lib/api/helpers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  userName: string;
  userId: string;
  status: string | null;
  itemCount: number;
  finalPriceUsd: number;
  createdAt: string;
}

export interface AdminOrderDetailProduct {
  id: string;
  productId: string;
  snapshot: Record<string, unknown>;
  priceUsd: number;
}

export interface AdminOrderDetailEvent {
  id: string;
  eventTypeId: string;
  occurredAt: string;
}

export interface AdminOrderDetail {
  id: string;
  checkoutId: string;
  orderNumber: string;
  userId: string;
  paymentTermId: string;
  statusId: string | null;
  estimatedDelivery: string;
  deliveryAddressId: string | null;
  shippingCost: number;
  vatAmount: number;
  finalPriceUsd: number;
  canTrack: boolean;
  canPayInvoice: boolean;
  items: AdminOrderDetailProduct[];
  events: AdminOrderDetailEvent[];
}

export interface CreateOrderInput {
  userId: string;
  paymentTermId: string;
  statusId?: string;
  estimatedDelivery: string;
  deliveryAddressId?: string;
  shippingCost?: number;
  vatAmount?: number;
  finalPriceUsd: number;
  canTrack?: boolean;
  canPayInvoice?: boolean;
  items: { productId: string; priceUsd: number }[];
  events?: { eventTypeId: string; occurredAt: string }[];
}

export type UpdateOrderInput = Partial<CreateOrderInput>;

// ---------------------------------------------------------------------------
// fetchAdminOrderList
// ---------------------------------------------------------------------------

export async function fetchAdminOrderList(options: {
  page: number;
  perPage: number;
  search?: string;
  statusId?: string;
  userId?: string;
}): Promise<PaginatedResult<AdminOrderListItem>> {
  const { page, perPage, search, statusId, userId } = options;

  // Fetch all checkouts with orders, user, status
  const checkouts = await db.query.orderCheckouts.findMany({
    with: {
      user: true,
      orders: {
        with: {
          currentStatusRef: true,
          products: true,
        },
      },
    },
  });

  // Flatten checkout → orders into list items
  const allItems: AdminOrderListItem[] = [];
  for (const checkout of checkouts) {
    for (const order of checkout.orders) {
      allItems.push({
        id: order.id,
        orderNumber: `${String(checkout.orderNumber).padStart(4, "0")}-${order.orderNumber}`,
        userName: checkout.user?.name ?? "",
        userId: checkout.userId,
        status: order.currentStatusRef?.value ?? null,
        itemCount: order.products?.length ?? 0,
        finalPriceUsd: Number(order.finalPriceUsd),
        createdAt: checkout.createdAt.toISOString(),
      });
    }
  }

  // Apply filters
  let filtered = allItems;

  if (userId) {
    filtered = filtered.filter((item) => item.userId === userId);
  }

  if (statusId) {
    // statusId filter: match the raw status ID — stored as currentStatus UUID on order
    // We re-query with status ID since we only have the value string in allItems
    const matchingOrderIds = new Set(
      checkouts
        .flatMap((c) => c.orders)
        .filter((o) => o.currentStatus === statusId)
        .map((o) => o.id),
    );
    filtered = filtered.filter((item) => matchingOrderIds.has(item.id));
  }

  if (search) {
    const lower = search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.orderNumber.toLowerCase().includes(lower) ||
        item.userName.toLowerCase().includes(lower),
    );
  }

  // Sort by date descending
  filtered.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Manual pagination
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const items = filtered.slice(startIndex, startIndex + perPage);

  return { items, totalItems, totalPages, currentPage, perPage };
}

// ---------------------------------------------------------------------------
// fetchAdminOrder
// ---------------------------------------------------------------------------

export async function fetchAdminOrder(
  orderId: string,
): Promise<AdminOrderDetail | undefined> {
  const row = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      checkout: true,
      products: true,
      events: true,
    },
  });

  if (!row) return undefined;

  return {
    id: row.id,
    checkoutId: row.checkoutId,
    orderNumber: `${String(row.checkout.orderNumber).padStart(4, "0")}-${row.orderNumber}`,
    userId: row.checkout.userId,
    paymentTermId: row.paymentTermId,
    statusId: row.currentStatus ?? null,
    estimatedDelivery: row.estimatedDelivery,
    deliveryAddressId: row.deliveryAddressId ?? null,
    shippingCost: Number(row.shippingCost),
    vatAmount: Number(row.vatAmount),
    finalPriceUsd: Number(row.finalPriceUsd),
    canTrack: row.canTrack,
    canPayInvoice: row.canPayInvoice,
    items: (row.products ?? []).map((p) => ({
      id: p.id,
      productId: p.productId,
      snapshot: (p.snapshot ?? {}) as Record<string, unknown>,
      priceUsd: Number(p.priceUsd),
    })),
    events: (row.events ?? []).map((e) => ({
      id: e.id,
      eventTypeId: e.eventTypeId,
      occurredAt: e.occurredAt.toISOString(),
    })),
  };
}

// ---------------------------------------------------------------------------
// createAdminOrder
// ---------------------------------------------------------------------------

export async function createAdminOrder(
  input: CreateOrderInput,
): Promise<{ id: string }> {
  // Find next order number for user: max existing checkout orderNumber + 1, or 1
  const [maxRow] = await db
    .select({ maxNum: max(orderCheckouts.orderNumber) })
    .from(orderCheckouts)
    .where(eq(orderCheckouts.userId, input.userId));

  const nextOrderNumber = (maxRow?.maxNum ?? 0) + 1;

  // Fetch product data for snapshots
  const productIds = input.items.map((i) => i.productId);
  const productRows =
    productIds.length > 0
      ? await db
          .select({
            id: products.id,
            stockId: products.stockId,
            description: products.description,
            priceUsd: products.priceUsd,
          })
          .from(products)
          .where(inArray(products.id, productIds))
      : [];

  // Build product lookup map
  const productMap = new Map(productRows.map((p) => [p.id, p]));

  // Insert orderCheckouts row
  const [checkout] = await db
    .insert(orderCheckouts)
    .values({
      userId: input.userId,
      orderNumber: nextOrderNumber,
      paymentTermId: input.paymentTermId,
    })
    .returning({ id: orderCheckouts.id });

  // Insert orders row
  const [order] = await db
    .insert(orders)
    .values({
      checkoutId: checkout.id,
      orderNumber: 1,
      paymentTermId: input.paymentTermId,
      currentStatus: input.statusId ?? null,
      estimatedDelivery: input.estimatedDelivery,
      deliveryAddressId: input.deliveryAddressId ?? "",
      shippingCost: String(input.shippingCost ?? 0),
      vatAmount: String(input.vatAmount ?? 0),
      finalPriceUsd: String(input.finalPriceUsd),
      canTrack: input.canTrack ?? false,
      canPayInvoice: input.canPayInvoice ?? false,
    })
    .returning({ id: orders.id });

  // Insert orderProducts with JSONB snapshot
  if (input.items.length > 0) {
    await db.insert(orderProducts).values(
      input.items.map((item) => {
        const product = productMap.get(item.productId);
        const snapshot: Record<string, unknown> = product
          ? {
              stockId: product.stockId,
              description: product.description,
              priceUsd: Number(product.priceUsd),
            }
          : {};
        return {
          orderId: order.id,
          productId: item.productId,
          snapshot,
          priceUsd: String(item.priceUsd),
        };
      }),
    );
  }

  // Insert orderEvents if provided
  if (input.events && input.events.length > 0) {
    await db.insert(orderEvents).values(
      input.events.map((e) => ({
        orderId: order.id,
        eventTypeId: e.eventTypeId,
        occurredAt: new Date(e.occurredAt),
      })),
    );
  }

  return { id: order.id };
}

// ---------------------------------------------------------------------------
// updateAdminOrder
// ---------------------------------------------------------------------------

export async function updateAdminOrder(
  orderId: string,
  input: UpdateOrderInput,
): Promise<void> {
  type OrderUpdate = typeof orders.$inferInsert;

  // Build update object from provided fields
  const updateFields: Partial<OrderUpdate> = {};

  if (input.paymentTermId !== undefined)
    updateFields.paymentTermId = input.paymentTermId;
  if (input.statusId !== undefined)
    updateFields.currentStatus = input.statusId ?? null;
  if (input.estimatedDelivery !== undefined)
    updateFields.estimatedDelivery = input.estimatedDelivery;
  if (input.deliveryAddressId !== undefined)
    updateFields.deliveryAddressId = input.deliveryAddressId;
  if (input.shippingCost !== undefined)
    updateFields.shippingCost = String(input.shippingCost);
  if (input.vatAmount !== undefined)
    updateFields.vatAmount = String(input.vatAmount);
  if (input.finalPriceUsd !== undefined)
    updateFields.finalPriceUsd = String(input.finalPriceUsd);
  if (input.canTrack !== undefined) updateFields.canTrack = input.canTrack;
  if (input.canPayInvoice !== undefined)
    updateFields.canPayInvoice = input.canPayInvoice;

  if (Object.keys(updateFields).length > 0) {
    await db.update(orders).set(updateFields).where(eq(orders.id, orderId));
  }

  // If paymentTermId changed, also update the checkout
  if (input.paymentTermId !== undefined) {
    const [order] = await db
      .select({ checkoutId: orders.checkoutId })
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (order) {
      await db
        .update(orderCheckouts)
        .set({ paymentTermId: input.paymentTermId })
        .where(eq(orderCheckouts.id, order.checkoutId));
    }
  }

  // If items provided: replace entirely
  if (input.items !== undefined) {
    await db.delete(orderProducts).where(eq(orderProducts.orderId, orderId));

    if (input.items.length > 0) {
      const productIds = input.items.map((i) => i.productId);
      const productRows = await db
        .select({
          id: products.id,
          stockId: products.stockId,
          description: products.description,
          priceUsd: products.priceUsd,
        })
        .from(products)
        .where(inArray(products.id, productIds));

      const productMap = new Map(productRows.map((p) => [p.id, p]));

      await db.insert(orderProducts).values(
        input.items.map((item) => {
          const product = productMap.get(item.productId);
          const snapshot: Record<string, unknown> = product
            ? {
                stockId: product.stockId,
                description: product.description,
                priceUsd: Number(product.priceUsd),
              }
            : {};
          return {
            orderId,
            productId: item.productId,
            snapshot,
            priceUsd: String(item.priceUsd),
          };
        }),
      );
    }
  }

  // If events provided: replace entirely
  if (input.events !== undefined) {
    await db.delete(orderEvents).where(eq(orderEvents.orderId, orderId));

    if (input.events.length > 0) {
      await db.insert(orderEvents).values(
        input.events.map((e) => ({
          orderId,
          eventTypeId: e.eventTypeId,
          occurredAt: new Date(e.occurredAt),
        })),
      );
    }
  }
}

// ---------------------------------------------------------------------------
// deleteAdminOrder
// ---------------------------------------------------------------------------

export async function deleteAdminOrder(orderId: string): Promise<void> {
  // Delete orderExchangeRates for this order
  await db
    .delete(orderExchangeRates)
    .where(eq(orderExchangeRates.orderId, orderId));

  // Delete orderEvents for this order
  await db.delete(orderEvents).where(eq(orderEvents.orderId, orderId));

  // Delete orderProducts for this order
  await db.delete(orderProducts).where(eq(orderProducts.orderId, orderId));

  // Get the checkoutId before deleting the order
  const [order] = await db
    .select({ checkoutId: orders.checkoutId })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  // Delete the order
  await db.delete(orders).where(eq(orders.id, orderId));

  // If no remaining orders in checkout, delete the checkout too
  if (order) {
    const remaining = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.checkoutId, order.checkoutId))
      .limit(1);

    if (remaining.length === 0) {
      await db
        .delete(orderCheckouts)
        .where(eq(orderCheckouts.id, order.checkoutId));
    }
  }
}
