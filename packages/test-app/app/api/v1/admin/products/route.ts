import { NextRequest } from "next/server";
import { withAdminAuth, isAdminAuthError } from "@/lib/api/admin/auth";
import {
  fetchAdminProductList,
  createAdminProduct,
} from "@/lib/api/admin/products";
import { apiSuccess, apiCreated, apiError } from "@/lib/api/response";
import { parsePagination } from "@/lib/api/helpers";

export async function GET(request: NextRequest) {
  const auth = await withAdminAuth(request);
  if (isAdminAuthError(auth)) return auth;

  const pagination = parsePagination(request.nextUrl.searchParams);
  if ("error" in pagination) {
    return apiError("INVALID_PARAMS", pagination.error, 400);
  }

  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const categoryId =
    request.nextUrl.searchParams.get("categoryId") ?? undefined;
  const supplierId =
    request.nextUrl.searchParams.get("supplierId") ?? undefined;
  const isActiveParam = request.nextUrl.searchParams.get("isActive");
  const isActive =
    isActiveParam === "true"
      ? true
      : isActiveParam === "false"
        ? false
        : undefined;

  const result = await fetchAdminProductList({
    page: pagination.page,
    perPage: pagination.perPage,
    search,
    categoryId,
    supplierId,
    isActive,
  });

  return apiSuccess(result.items, {
    page: result.currentPage,
    perPage: result.perPage,
    totalItems: result.totalItems,
    totalPages: result.totalPages,
  });
}

export async function POST(request: NextRequest) {
  const auth = await withAdminAuth(request);
  if (isAdminAuthError(auth)) return auth;

  const body = await request.json();
  const created = await createAdminProduct(body);
  return apiCreated(created);
}
