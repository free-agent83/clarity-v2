import { NextRequest } from "next/server";
import { withAdminAuth, isAdminAuthError } from "@/lib/api/admin/auth";
import { fetchAllUsers } from "@/lib/api/admin/users";
import { apiSuccess } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const auth = await withAdminAuth(request);
  if (isAdminAuthError(auth)) return auth;

  const users = await fetchAllUsers();
  return apiSuccess(users);
}
