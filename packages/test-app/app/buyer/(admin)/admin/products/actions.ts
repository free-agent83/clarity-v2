"use server";

import {
  fetchAdminProductList,
  createAdminProduct,
  deleteAdminProduct,
} from "@/lib/api/admin/products";
import type {
  CreateProductInput,
  AdminProductListItem,
} from "@/lib/api/admin/products";
import type { PaginatedResult } from "@/lib/api/helpers";

export async function getAdminProducts(options: {
  page: number;
  perPage: number;
  search?: string;
  categoryId?: string;
  supplierId?: string;
  isActive?: boolean;
}): Promise<PaginatedResult<AdminProductListItem>> {
  return fetchAdminProductList(options);
}

export async function saveAdminProduct(input: CreateProductInput) {
  return createAdminProduct(input);
}

export async function removeAdminProduct(id: string) {
  return deleteAdminProduct(id);
}
