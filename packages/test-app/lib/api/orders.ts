import { ORDERS } from "@/fixtures/orders";
import type {
  Order,
  OrderProduct,
  OrderEvent,
  OrderExchangeRate,
} from "@/fixtures/types/order";
import { simulateLatency } from "./_simulate";
import { paginate, type PaginatedResult, type PaginatedOptions } from "./helpers";

export type { Order, OrderProduct, OrderEvent, OrderExchangeRate };

export async function fetchOrderList(
  _userId: string,
  options: PaginatedOptions,
): Promise<PaginatedResult<Order>> {
  await simulateLatency();
  return paginate(ORDERS, options);
}

export async function fetchAllOrders(_userId: string): Promise<Order[]> {
  await simulateLatency();
  return ORDERS;
}

export async function fetchOrder(
  orderId: string,
  _userId: string,
): Promise<Order | undefined> {
  await simulateLatency();
  return ORDERS.find((o) => o.id === orderId);
}
