import { NextRequest } from "next/server";
import { withApiAuth, isAuthError } from "@/lib/api/auth";
import { apiSuccess, apiError } from "@/lib/api/response";
import { fetchOrder } from "@/lib/api/orders";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withApiAuth(request, { requireUser: true });
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const order = await fetchOrder(id, auth.user.id);

  if (!order) {
    return apiError("NOT_FOUND", "Order not found", 404);
  }

  return apiSuccess(order);
}
