"use server";

import {
  fetchAdminOrderList,
  fetchAdminOrder,
  createAdminOrder,
  updateAdminOrder,
  deleteAdminOrder,
} from "@/lib/api/admin/orders";
import type {
  CreateOrderInput,
  UpdateOrderInput,
  AdminOrderListItem,
} from "@/lib/api/admin/orders";
import type { PaginatedResult } from "@/lib/api/helpers";

export async function getAdminOrders(options: {
  page: number;
  perPage: number;
  search?: string;
  statusId?: string;
  userId?: string;
}): Promise<PaginatedResult<AdminOrderListItem>> {
  return fetchAdminOrderList(options);
}

export async function getAdminOrder(id: string) {
  return fetchAdminOrder(id);
}

export async function saveAdminOrder(input: CreateOrderInput) {
  return createAdminOrder(input);
}

export async function editAdminOrder(id: string, input: UpdateOrderInput) {
  return updateAdminOrder(id, input);
}

export async function removeAdminOrder(id: string) {
  return deleteAdminOrder(id);
}
