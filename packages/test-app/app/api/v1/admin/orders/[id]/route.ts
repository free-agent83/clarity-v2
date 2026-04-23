import { NextRequest } from "next/server";
import { withAdminAuth, isAdminAuthError } from "@/lib/api/admin/auth";
import {
  fetchAdminOrder,
  updateAdminOrder,
  deleteAdminOrder,
} from "@/lib/api/admin/orders";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAdminAuth(request);
  if (isAdminAuthError(auth)) return auth;

  const { id } = await params;
  const order = await fetchAdminOrder(id);

  if (!order) {
    return apiError("NOT_FOUND", "Order not found", 404);
  }

  return apiSuccess(order);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAdminAuth(request);
  if (isAdminAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();
  await updateAdminOrder(id, body);
  return apiSuccess({ id });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAdminAuth(request);
  if (isAdminAuthError(auth)) return auth;

  const { id } = await params;
  await deleteAdminOrder(id);
  return apiSuccess({ id });
}
