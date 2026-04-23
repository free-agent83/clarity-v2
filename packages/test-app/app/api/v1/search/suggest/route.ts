import { NextRequest } from "next/server";
import {
  withApiAuth,
  isAuthError,
  extractOptionalUserId,
} from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { searchSuggest } from "@/lib/api/search";

export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request);
  if (isAuthError(auth)) return auth;

  const userId = await extractOptionalUserId(request);

  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (q.length < 2) {
    return apiError(
      "INVALID_QUERY",
      "Search query must be at least 2 characters",
      400,
    );
  }

  const limit = Math.min(
    Number(request.nextUrl.searchParams.get("limit")) || 8,
    20,
  );
  const results = await searchSuggest(q, userId, limit);

  return apiSuccess(results);
}
