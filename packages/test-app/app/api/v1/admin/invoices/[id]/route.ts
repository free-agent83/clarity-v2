import { NextRequest } from "next/server";
import { withAdminAuth, isAdminAuthError } from "@/lib/api/admin/auth";
import {
  fetchAdminInvoice,
  updateAdminInvoice,
  deleteAdminInvoice,
} from "@/lib/api/admin/invoices";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAdminAuth(request);
  if (isAdminAuthError(auth)) return auth;

  const { id } = await params;
  const invoice = await fetchAdminInvoice(id);

  if (!invoice) {
    return apiError("NOT_FOUND", "Invoice not found", 404);
  }

  return apiSuccess(invoice);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAdminAuth(request);
  if (isAdminAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();
  await updateAdminInvoice(id, body);
  return apiSuccess({ id });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAdminAuth(request);
  if (isAdminAuthError(auth)) return auth;

  const { id } = await params;
  await deleteAdminInvoice(id);
  return apiSuccess({ id });
}
