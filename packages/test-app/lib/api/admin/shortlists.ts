import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { shortlists, shortlistItems } from "@/db/schema";
import type { PaginatedResult } from "@/lib/api/helpers";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminShortlistListItem {
  id: string;
  name: string;
  userName: string;
  userId: string;
  itemCount: number;
  createdAt: string;
}

export interface AdminShortlistDetail {
  id: string;
  name: string;
  userId: string;
  items: { id: string; productId: string }[];
}

export interface CreateShortlistInput {
  userId: string;
  name: string;
  items: { productId: string }[];
}

export interface UpdateShortlistInput {
  name?: string;
  items?: { productId: string }[];
}

// ---------------------------------------------------------------------------
// fetchAdminShortlistList
// ---------------------------------------------------------------------------

export async function fetchAdminShortlistList(options: {
  page: number;
  perPage: number;
  search?: string;
  userId?: string;
}): Promise<PaginatedResult<AdminShortlistListItem>> {
  const { page, perPage, search, userId } = options;

  const rows = await db.query.shortlists.findMany({
    with: {
      user: true,
      items: true,
    },
  });

  let allItems: AdminShortlistListItem[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    userName: row.user?.name ?? row.user?.email ?? "",
    userId: row.userId,
    itemCount: row.items?.length ?? 0,
    createdAt: row.createdAt.toISOString(),
  }));

  // Apply filters
  if (userId) {
    allItems = allItems.filter((item) => item.userId === userId);
  }

  if (search) {
    const lower = search.toLowerCase();
    allItems = allItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lower) ||
        item.userName.toLowerCase().includes(lower),
    );
  }

  // Sort by date descending
  allItems.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Manual pagination
  const totalItems = allItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const items = allItems.slice(startIndex, startIndex + perPage);

  return { items, totalItems, totalPages, currentPage, perPage };
}

// ---------------------------------------------------------------------------
// fetchAdminShortlist
// ---------------------------------------------------------------------------

export async function fetchAdminShortlist(
  id: string,
): Promise<AdminShortlistDetail | undefined> {
  const row = await db.query.shortlists.findFirst({
    where: eq(shortlists.id, id),
    with: {
      items: true,
    },
  });

  if (!row) return undefined;

  return {
    id: row.id,
    name: row.name,
    userId: row.userId,
    items: (row.items ?? []).map((item) => ({
      id: item.id,
      productId: item.productId,
    })),
  };
}

// ---------------------------------------------------------------------------
// createAdminShortlist
// ---------------------------------------------------------------------------

export async function createAdminShortlist(
  input: CreateShortlistInput,
): Promise<{ id: string }> {
  const [shortlist] = await db
    .insert(shortlists)
    .values({
      userId: input.userId,
      name: input.name,
    })
    .returning({ id: shortlists.id });

  if (input.items.length > 0) {
    await db.insert(shortlistItems).values(
      input.items.map((item) => ({
        shortlistId: shortlist.id,
        productId: item.productId,
      })),
    );
  }

  return { id: shortlist.id };
}

// ---------------------------------------------------------------------------
// updateAdminShortlist
// ---------------------------------------------------------------------------

export async function updateAdminShortlist(
  id: string,
  input: UpdateShortlistInput,
): Promise<void> {
  if (input.name !== undefined) {
    await db
      .update(shortlists)
      .set({ name: input.name })
      .where(eq(shortlists.id, id));
  }

  if (input.items !== undefined) {
    await db.delete(shortlistItems).where(eq(shortlistItems.shortlistId, id));

    if (input.items.length > 0) {
      await db.insert(shortlistItems).values(
        input.items.map((item) => ({
          shortlistId: id,
          productId: item.productId,
        })),
      );
    }
  }
}

// ---------------------------------------------------------------------------
// deleteAdminShortlist
// ---------------------------------------------------------------------------

export async function deleteAdminShortlist(id: string): Promise<void> {
  await db.delete(shortlistItems).where(eq(shortlistItems.shortlistId, id));
  await db.delete(shortlists).where(eq(shortlists.id, id));
}
