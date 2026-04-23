"use server";

import { createClient } from "@supabase/supabase-js";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";

export interface SwitchableUser {
  id: string;
  email: string;
  name: string;
  authUserId: string | null;
}

export async function fetchSwitchableUsers(): Promise<SwitchableUser[]> {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      authUserId: users.authUserId,
    })
    .from(users)
    .where(isNull(users.deletedAt))
    .orderBy(users.name);

  return rows.filter((u) => u.authUserId !== null) as SwitchableUser[];
}

export async function switchToUser(
  userId: string,
): Promise<{ tokenHash: string; type: "magiclink" } | { error: string }> {
  const [targetUser] = await db
    .select({ authUserId: users.authUserId, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!targetUser?.authUserId) {
    return { error: "User not found or has no auth account" };
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: targetUser.email,
  });

  if (error || !data.properties?.hashed_token) {
    return { error: error?.message ?? "Failed to generate session" };
  }

  return { tokenHash: data.properties.hashed_token, type: "magiclink" };
}
