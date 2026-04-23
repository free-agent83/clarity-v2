import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export type AppUser = typeof users.$inferSelect;

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  const appUser = await db.query.users.findFirst({
    where: eq(users.authUserId, authUser.id),
  });

  if (!appUser) {
    throw new Error(
      `No application user found for auth user ${authUser.id}. ` +
        `This indicates a data integrity issue — the auto-create flow may have failed.`,
    );
  }

  return appUser;
}
