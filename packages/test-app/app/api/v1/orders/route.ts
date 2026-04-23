import { NextRequest } from "next/server";
import { withApiAuth, isAuthError } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { fetchOrderList } from "@/lib/api/orders";
import { parsePagination } from "@/lib/api/helpers";

export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request, { requireUser: true });
  if (isAuthError(auth)) return auth;

  const pagination = parsePagination(request.nextUrl.searchParams);
  if ("error" in pagination) {
    return apiError("INVALID_PARAMS", pagination.error, 400);
  }

  const result = await fetchOrderList(auth.user.id, {
    page: pagination.page,
    perPage: pagination.perPage,
    perPageOptions: [20, 50, 100],
  });

  return apiSuccess(result.items, {
    page: result.currentPage,
    perPage: result.perPage,
    totalItems: result.totalItems,
    totalPages: result.totalPages,
  });
}
