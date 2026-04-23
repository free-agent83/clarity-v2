import { NextRequest } from "next/server";
import { withApiAuth, isAuthError } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { fetchShortlists } from "@/lib/api/shortlists";

export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request, { requireUser: true });
  if (isAuthError(auth)) return auth;

  const shortlists = await fetchShortlists(auth.user.id);
  return apiSuccess(shortlists);
}
