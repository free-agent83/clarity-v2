import { NextRequest } from "next/server";
import { withApiAuth, isAuthError } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { removeShortlistItem } from "@/lib/api/shortlists";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withApiAuth(request, { requireUser: true });
  if (isAuthError(auth)) return auth;

  const { id } = await params;

  await removeShortlistItem(auth.user.id, id);
  return apiSuccess(null);
}
