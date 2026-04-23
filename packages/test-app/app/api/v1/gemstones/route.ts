import { NextRequest } from "next/server";
import { withApiAuth, isAuthError } from "@/lib/api/auth";
import { parseListParams } from "@/lib/api/filters";
import { apiSuccess } from "@/lib/api/response";
import {
  fetchGemstoneListFiltered,
  GEMSTONE_FILTERS,
} from "@/lib/api/gemstones";

export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request);
  if (isAuthError(auth)) return auth;

  const parsed = parseListParams(request, GEMSTONE_FILTERS);
  if (parsed instanceof Response) return parsed;

  const { items, totalItems } = await fetchGemstoneListFiltered(
    parsed.filters,
    parsed.sort,
    parsed.pagination,
  );

  return apiSuccess(items, {
    page: parsed.pagination.page,
    perPage: parsed.pagination.perPage,
    totalItems,
    totalPages: Math.ceil(totalItems / parsed.pagination.perPage),
  });
}
