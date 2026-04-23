import { NextRequest } from "next/server";
import { withApiAuth, isAuthError } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { fetchDiamondItem } from "@/lib/api/diamonds";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withApiAuth(request);
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const item = await fetchDiamondItem(id, false);

  if (!item) {
    return apiError("NOT_FOUND", "Diamond not found", 404);
  }

  return apiSuccess(item);
}
