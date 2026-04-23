import { NextRequest } from "next/server";
import { withAdminAuth, isAdminAuthError } from "@/lib/api/admin/auth";
import {
  fetchAdminShortlist,
  updateAdminShortlist,
  deleteAdminShortlist,
} from "@/lib/api/admin/shortlists";
import { apiSuccess, apiError } from "@/lib/api/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAdminAuth(request);
  if (isAdminAuthError(auth)) return auth;

  const { id } = await params;
  const shortlist = await fetchAdminShortlist(id);

  if (!shortlist) {
    return apiError("NOT_FOUND", "Shortlist not found", 404);
  }

  return apiSuccess(shortlist);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAdminAuth(request);
  if (isAdminAuthError(auth)) return auth;

  const { id } = await params;
  const body = await request.json();
  await updateAdminShortlist(id, body);
  return apiSuccess({ id });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withAdminAuth(request);
  if (isAdminAuthError(auth)) return auth;

  const { id } = await params;
  await deleteAdminShortlist(id);
  return apiSuccess({ id });
}
