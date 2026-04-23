import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { createApiClient } from "@/lib/supabase/api";
import { apiError } from "@/lib/api/response";

type AppUser = typeof users.$inferSelect;

/**
 * Admin-only API auth: API key + Bearer token + god-mode role.
 * Returns the app user if all checks pass, or a Response (error).
 */
export async function withAdminAuth(
  request: NextRequest,
): Promise<{ user: AppUser } | Response> {
  // Layer 1: API key validation
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return apiError("INVALID_API_KEY", "Valid API key required", 401);
  }

  // Layer 2: Bearer token
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return apiError("UNAUTHORIZED", "Authentication required", 401);
  }

  const token = authHeader.slice(7);
  const supabase = createApiClient();
  const { data: authData, error: authError } =
    await supabase.auth.getUser(token);

  if (authError || !authData.user) {
    return apiError("UNAUTHORIZED", "Invalid or expired token", 401);
  }

  // Layer 3: God-mode role check
  const role = authData.user.app_metadata?.role;
  if (role !== "admin") {
    return apiError("FORBIDDEN", "Admin access required", 403);
  }

  // Look up app user
  const [appUser] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, authData.user.id))
    .limit(1);

  if (!appUser) {
    return apiError("UNAUTHORIZED", "Admin account not found", 401);
  }

  return { user: appUser };
}

/**
 * Type guard: returns true if auth result is a Response (error).
 */
export function isAdminAuthError(
  result: { user: AppUser } | Response,
): result is Response {
  return result instanceof Response;
}
