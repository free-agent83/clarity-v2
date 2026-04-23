import { NextRequest } from "next/server";
import { withApiAuth, isAuthError } from "@/lib/api/auth";
import { apiSuccess } from "@/lib/api/response";
import { fetchAddresses } from "@/lib/api/addresses";

export async function GET(request: NextRequest) {
  const auth = await withApiAuth(request, { requireUser: true });
  if (isAuthError(auth)) return auth;

  const addresses = await fetchAddresses(auth.user.id);
  return apiSuccess(addresses);
}
