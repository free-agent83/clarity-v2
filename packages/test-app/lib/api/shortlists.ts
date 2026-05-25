import { SHORTLISTS } from "@/fixtures/shortlists";
import { simulateLatency } from "./_simulate";
import type { Shortlist, ShortlistItem } from "@/fixtures/types/shortlist";

export type { Shortlist, ShortlistItem };

export async function fetchShortlists(_userId: string) {
  await simulateLatency();
  return SHORTLISTS;
}

export async function createShortlist(
  _userId: string,
  _name: string,
): Promise<{ id: string }> {
  return { id: `sl-${Date.now()}` };
}

export async function fetchShortlistItems(shortlistId: string) {
  await simulateLatency();
  return SHORTLISTS.find((sl) => sl.id === shortlistId)?.items ?? [];
}

export async function addShortlistItem(
  _shortlistId: string,
  _productId: string,
): Promise<{ id: string }> {
  return { id: `sli-${Date.now()}` };
}

export async function removeShortlistItem(
  _shortlistId: string,
  _itemId: string,
): Promise<void> {}

export async function removeShortlistItemByProduct(
  _shortlistId: string,
  _productId: string,
): Promise<void> {}
