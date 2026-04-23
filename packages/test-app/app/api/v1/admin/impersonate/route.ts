import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { withAdminAuth, isAdminAuthError } from "@/lib/api/admin/auth";
import { apiError } from "@/lib/api/response";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const auth = await withAdminAuth(request);
  if (isAdminAuthError(auth)) return auth;

  const { userId } = (await request.json()) as { userId: string };
  if (!userId) {
    return apiError("INVALID_PARAMS", "userId is required", 400);
  }

  // Look up the target user's authUserId
  const [targetUser] = await db
    .select({ authUserId: users.authUserId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!targetUser?.authUserId) {
    return apiError("NOT_FOUND", "User not found or has no auth account", 404);
  }

  // Use service role to generate a magic link for the target user
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(
    targetUser.authUserId,
  );

  if (!userData.user?.email) {
    return apiError("NOT_FOUND", "User email not found", 404);
  }

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: userData.user.email,
  });

  if (error || !data) {
    return apiError("INTERNAL", "Failed to generate session", 500);
  }

  return NextResponse.json({
    data: {
      token_hash: data.properties?.hashed_token,
      email: userData.user.email,
    },
  });
}
