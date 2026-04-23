import { NextRequest } from "next/server";
import { withApiAuth, isAuthError } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { fetchGemstoneItem } from "@/lib/api/gemstones";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withApiAuth(request);
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const item = await fetchGemstoneItem(id);

  if (!item) {
    return apiError("NOT_FOUND", "Gemstone not found", 404);
  }

  return apiSuccess(item);
}
