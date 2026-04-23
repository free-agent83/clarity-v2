import { NextRequest } from "next/server";
import { withAdminAuth, isAdminAuthError } from "@/lib/api/admin/auth";
import {
  fetchAdminInvoiceList,
  createAdminInvoice,
} from "@/lib/api/admin/invoices";
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
  const statusId = request.nextUrl.searchParams.get("statusId") ?? undefined;
  const userId = request.nextUrl.searchParams.get("userId") ?? undefined;

  const result = await fetchAdminInvoiceList({
    page: pagination.page,
    perPage: pagination.perPage,
    search,
    statusId,
    userId,
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
  const created = await createAdminInvoice(body);
  return apiCreated(created);
}
