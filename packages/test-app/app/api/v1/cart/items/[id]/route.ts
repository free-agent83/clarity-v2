import { NextRequest } from "next/server";
import { z } from "zod";
import { withApiAuth, isAuthError } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { updateCartItem, removeCartItem } from "@/lib/api/cart";

const updateItemSchema = z.object({
  quantity: z.number().int().positive(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withApiAuth(request, { requireUser: true });
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_BODY", "Request body must be valid JSON", 400);
  }

  const parsed = updateItemSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "INVALID_PARAMS",
      parsed.error.issues[0]?.message ?? "Invalid request body",
      400,
    );
  }

  await updateCartItem(auth.user.id, id, parsed.data.quantity);
  return apiSuccess(null);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withApiAuth(request, { requireUser: true });
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  await removeCartItem(auth.user.id, id);
  return apiSuccess(null);
}
