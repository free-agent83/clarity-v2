import { db } from "@/db/client";
import { eq, and, isNull } from "drizzle-orm";
import { addresses } from "@/db/schema";

export async function fetchAddresses(userId: string) {
  return db.query.addresses.findMany({
    where: and(eq(addresses.userId, userId), isNull(addresses.deletedAt)),
  });
}

export async function fetchAddress(id: string) {
  return db.query.addresses.findFirst({
    where: eq(addresses.id, id),
  });
}
