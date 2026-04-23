import { db } from "@/db/client";
import { users } from "@/db/schema";
import { isNull } from "drizzle-orm";

export interface AdminUserItem {
  id: string;
  email: string;
  name: string | null;
  companyName: string | null;
}

export async function fetchAllUsers(): Promise<AdminUserItem[]> {
  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      companyName: users.companyName,
    })
    .from(users)
    .where(isNull(users.deletedAt))
    .orderBy(users.name);

  return rows;
}
