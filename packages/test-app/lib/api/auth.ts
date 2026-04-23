import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { createApiClient } from "@/lib/supabase/api";
import { apiError } from "./response";

type AppUser = typeof users.$inferSelect;

interface AuthOptions {
  requireUser?: boolean;
}

// Overloaded signatures for proper TypeScript narrowing
export async function withApiAuth(
  request: NextRequest,
  options: { requireUser: true },
): Promise<{ user: AppUser } | Response>;
export async function withApiAuth(
  request: NextRequest,
  options?: AuthOptions,
): Promise<{ user: AppUser | null } | Response>;
export async function withApiAuth(
  request: NextRequest,
  options?: AuthOptions,
): Promise<{ user: AppUser | null } | Response> {
  // Layer 1: API key validation
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return apiError("INVALID_API_KEY", "Valid API key required", 401);
  }

  // Layer 2: User session (if required)
  if (!options?.requireUser) {
    return { user: null };
  }

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

  // Look up app user by auth user ID
  const [appUser] = await db
    .select()
    .from(users)
    .where(eq(users.authUserId, authData.user.id))
    .limit(1);

  if (!appUser) {
    return apiError("UNAUTHORIZED", "User account not found", 401);
  }

  return { user: appUser };
}

/**
 * Type guard: returns true if auth result is a Response (error).
 */
export function isAuthError(
  result: { user: AppUser | null } | Response,
): result is Response {
  return result instanceof Response;
}

/**
 * Try to extract a user ID from the Bearer token.
 * Returns the app user's ID if the token is valid, null otherwise.
 * Never throws or returns an error response.
 */
export async function extractOptionalUserId(
  request: NextRequest,
): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.slice(7);
    const supabase = createApiClient();
    const { data: authData, error } = await supabase.auth.getUser(token);
    if (error || !authData.user) return null;

    const [appUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.authUserId, authData.user.id))
      .limit(1);

    return appUser?.id ?? null;
  } catch {
    return null;
  }
}
