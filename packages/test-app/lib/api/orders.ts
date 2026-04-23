import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { orders, orderCheckouts } from "@/db/schema";
import {
  paginate,
  type PaginatedResult,
  type PaginatedOptions,
} from "./helpers";

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface OrderProduct {
  id: string;
  productId: string;
  snapshot: Record<string, unknown>;
  priceUsd: number;
}

export interface OrderEvent {
  id: string;
  eventType: { id: string; value: string };
  occurredAt: string;
}

export interface OrderExchangeRate {
  currency: { id: string; value: string };
  rate: number;
}

export type Order = {
  id: string;
  orderNumber: string;
  orderDate: string;
  paymentTerm: { id: string; value: string };
  currentStatus: { id: string; value: string } | null;
  estimatedDelivery: string;
  deliveryAddress: {
    name: string;
    street: string;
    city: string;
    state: string | null;
    postalCode: string | null;
    country: string;
  };
  shippingCost: number;
  vatAmount: number;
  finalPriceUsd: number;
  canTrack: boolean;
  canPayInvoice: boolean;
  products: OrderProduct[];
  events: OrderEvent[];
  exchangeRates: OrderExchangeRate[];
};

// ---------------------------------------------------------------------------
// Shared relation config for order queries
// ---------------------------------------------------------------------------

const ORDER_WITH = {
  currentStatusRef: true,
  paymentTerm: true,
  deliveryAddress: { with: { country: true } },
  products: true,
  events: {
    with: { eventType: true },
    orderBy: (
      e: { occurredAt: Parameters<typeof import("drizzle-orm").desc>[0] },
      { desc }: { desc: typeof import("drizzle-orm").desc },
    ) => [desc(e.occurredAt)],
  },
  exchangeRates: { with: { currency: true } },
} as const;

// ---------------------------------------------------------------------------
// Map a raw Drizzle order row into the resolved Order shape
// ---------------------------------------------------------------------------

type OrderRow = Awaited<
  ReturnType<typeof db.query.orders.findMany<{ with: typeof ORDER_WITH }>>
>[number];

function mapRow(
  row: OrderRow,
  checkoutOrderNumber: number,
  checkoutCreatedAt: Date,
): Order {
  const addr = row.deliveryAddress;
  const cityStr = addr
    ? [addr.postalCode, addr.city].filter(Boolean).join(" ")
    : "";

  return {
    id: row.id,
    orderNumber: `${String(checkoutOrderNumber).padStart(4, "0")}-${row.orderNumber}`,
    orderDate: checkoutCreatedAt.toISOString().split("T")[0],
    paymentTerm: {
      id: row.paymentTerm?.id ?? "",
      value: row.paymentTerm?.value ?? "Unknown",
    },
    currentStatus: row.currentStatusRef
      ? { id: row.currentStatusRef.id, value: row.currentStatusRef.value }
      : null,
    estimatedDelivery: row.estimatedDelivery,
    deliveryAddress: {
      name: addr?.name ?? "",
      street: addr?.street ?? "",
      city: cityStr,
      state: addr?.state ?? null,
      postalCode: addr?.postalCode ?? null,
      country: addr?.country?.value ?? "",
    },
    shippingCost: Number(row.shippingCost),
    vatAmount: Number(row.vatAmount),
    finalPriceUsd: Number(row.finalPriceUsd),
    canTrack: row.canTrack,
    canPayInvoice: row.canPayInvoice,
    products: (row.products ?? []).map((p) => ({
      id: p.id,
      productId: p.productId,
      snapshot: (p.snapshot ?? {}) as Record<string, unknown>,
      priceUsd: Number(p.priceUsd),
    })),
    events: (row.events ?? []).map((e) => ({
      id: e.id,
      eventType: {
        id: e.eventType?.id ?? "",
        value: e.eventType?.value ?? "Unknown",
      },
      occurredAt: e.occurredAt.toISOString(),
    })),
    exchangeRates: (row.exchangeRates ?? []).map((er) => ({
      currency: {
        id: er.currency?.id ?? "",
        value: er.currency?.value ?? "Unknown",
      },
      rate: Number(er.rate),
    })),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function fetchOrderList(
  userId: string,
  options: PaginatedOptions,
): Promise<PaginatedResult<Order>> {
  // Find all checkouts for this user
  const checkouts = await db.query.orderCheckouts.findMany({
    where: eq(orderCheckouts.userId, userId),
    with: {
      orders: {
        with: ORDER_WITH,
      },
    },
  });

  // Flatten checkouts → orders, attaching checkout-level data
  const allOrders: Order[] = [];
  for (const checkout of checkouts) {
    for (const order of checkout.orders) {
      const mapped = mapRow(order, checkout.orderNumber, checkout.createdAt);
      allOrders.push(mapped);
    }
  }

  return paginate(allOrders, options);
}

export async function fetchAllOrders(userId: string): Promise<Order[]> {
  const checkouts = await db.query.orderCheckouts.findMany({
    where: eq(orderCheckouts.userId, userId),
    with: {
      orders: {
        with: ORDER_WITH,
      },
    },
  });

  const allOrders: Order[] = [];
  for (const checkout of checkouts) {
    for (const order of checkout.orders) {
      allOrders.push(mapRow(order, checkout.orderNumber, checkout.createdAt));
    }
  }

  return allOrders;
}

export async function fetchOrder(
  orderId: string,
  userId: string,
): Promise<Order | undefined> {
  // Find the order by ID, verify it belongs to the user via checkout
  const row = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      ...ORDER_WITH,
      checkout: true,
    },
  });

  if (!row) return undefined;

  // Verify user ownership via checkout
  if (row.checkout.userId !== userId) return undefined;

  const mapped = mapRow(
    row as unknown as OrderRow,
    row.checkout.orderNumber,
    row.checkout.createdAt,
  );
  return mapped;
}
