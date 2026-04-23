import { NextRequest } from "next/server";
import {
  withApiAuth,
  isAuthError,
  extractOptionalUserId,
} from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { parsePagination } from "@/lib/api/helpers";
import { searchFull } from "@/lib/api/search";

const VALID_TYPES = ["all", "products", "orders"] as const;
type SearchType = (typeof VALID_TYPES)[number];

export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request);
  if (isAuthError(auth)) return auth;

  const userId = await extractOptionalUserId(request);
  const sp = request.nextUrl.searchParams;

  const q = sp.get("q") ?? "";
  if (q.length < 2) {
    return apiError(
      "INVALID_QUERY",
      "Search query must be at least 2 characters",
      400,
    );
  }

  const rawType = sp.get("type") ?? "all";
  if (!VALID_TYPES.includes(rawType as SearchType)) {
    return apiError(
      "INVALID_PARAMS",
      "type must be 'all', 'products', or 'orders'",
      400,
    );
  }
  const type = rawType as SearchType;

  const pagination = parsePagination(sp);
  if ("error" in pagination) {
    return apiError("INVALID_PARAMS", pagination.error, 400);
  }

  const result = await searchFull(q, userId, type, pagination);

  return apiSuccess(result.items, {
    page: pagination.page,
    perPage: pagination.perPage,
    totalItems: result.totalItems,
    totalPages: Math.ceil(result.totalItems / pagination.perPage),
  });
}
