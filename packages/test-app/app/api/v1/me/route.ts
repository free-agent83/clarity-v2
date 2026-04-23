import { NextRequest } from "next/server";
import { withApiAuth, isAuthError } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request, { requireUser: true });
  if (isAuthError(auth)) return auth;

  // Exclude authUserId from the response
  const { authUserId, ...profile } = auth.user;
  return apiSuccess(profile);
}
