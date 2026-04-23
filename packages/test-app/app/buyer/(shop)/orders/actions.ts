"use server";

import { getCurrentUser } from "@/lib/api/users";
import { fetchAllOrders, type Order } from "@/lib/api/orders";

export async function refetchAllOrders(): Promise<Order[]> {
  const user = await getCurrentUser();
  return fetchAllOrders(user.id);
}
