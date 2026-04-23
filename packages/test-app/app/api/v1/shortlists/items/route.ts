import { NextRequest } from "next/server";
import { z } from "zod";
import { withApiAuth, isAuthError } from "@/lib/api/auth";
import { apiCreated, apiSuccess, apiError } from "@/lib/api/response";
import {
  addShortlistItem,
  removeShortlistItemByProduct,
} from "@/lib/api/shortlists";

const addItemSchema = z.object({
  productId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const auth = await withApiAuth(request, { requireUser: true });
  if (isAuthError(auth)) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", "Request body must be valid JSON", 400);
  }

  const parsed = addItemSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "INVALID_PARAMS",
      parsed.error.issues[0]?.message ?? "Invalid request body",
      400,
    );
  }

  const item = await addShortlistItem(auth.user.id, parsed.data.productId);
  return apiCreated(item);
}

export async function DELETE(request: NextRequest) {
  const auth = await withApiAuth(request, { requireUser: true });
  if (isAuthError(auth)) return auth;

  const productId = request.nextUrl.searchParams.get("productId");
  if (!productId) {
    return apiError(
      "INVALID_PARAMS",
      "productId query parameter is required",
      400,
    );
  }

  const uuidSchema = z.string().uuid();
  if (!uuidSchema.safeParse(productId).success) {
    return apiError("INVALID_PARAMS", "productId must be a valid UUID", 400);
  }

  await removeShortlistItemByProduct(auth.user.id, productId);
  return apiSuccess(null);
}
