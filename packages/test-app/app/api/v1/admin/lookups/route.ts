import { NextRequest } from "next/server";
import { withAdminAuth, isAdminAuthError } from "@/lib/api/admin/auth";
import { fetchAllLookups } from "@/lib/api/admin/lookups";
import { apiSuccess } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const auth = await withAdminAuth(request);
  if (isAdminAuthError(auth)) return auth;

  const lookups = await fetchAllLookups();
  return apiSuccess(lookups);
}
