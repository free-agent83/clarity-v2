import { NextRequest } from "next/server";
import { withApiAuth, isAuthError } from "@/lib/api/auth";
import { parseListParams } from "@/lib/api/filters";
import { apiSuccess } from "@/lib/api/response";
import { fetchDiamondListFiltered, DIAMOND_FILTERS } from "@/lib/api/diamonds";

export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request);
  if (isAuthError(auth)) return auth;

  const parsed = parseListParams(request, DIAMOND_FILTERS);
  if (parsed instanceof Response) return parsed;

  const { items, totalItems } = await fetchDiamondListFiltered(
    parsed.filters,
    parsed.sort,
    parsed.pagination,
    false,
  );

  return apiSuccess(items, {
    page: parsed.pagination.page,
    perPage: parsed.pagination.perPage,
    totalItems,
    totalPages: Math.ceil(totalItems / parsed.pagination.perPage),
  });
}
