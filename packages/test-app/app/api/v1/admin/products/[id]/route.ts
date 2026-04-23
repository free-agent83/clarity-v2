import { NextRequest } from "next/server";
import { withAdminAuth, isAdminAuthError } from "@/lib/api/admin/auth";
import { deleteAdminProduct } from "@/lib/api/admin/products";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAdminAuth(request);
  if (isAdminAuthError(auth)) return auth;

  const { id } = await params;

  if (!id) {
    return apiError("INVALID_PARAMS", "Product ID is required", 400);
  }

  await deleteAdminProduct(id);
  return apiSuccess({ id });
}
