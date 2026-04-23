import { NextRequest } from "next/server";
import { withApiAuth, isAuthError } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { fetchMeleeItem } from "@/lib/api/melee";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withApiAuth(request);
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const item = await fetchMeleeItem(id, true);

  if (!item) {
    return apiError("NOT_FOUND", "Lab-grown melee lot not found", 404);
  }

  return apiSuccess(item);
}
