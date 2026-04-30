import { ENGAGEMENT_RINGS } from "@/fixtures/products/engagement-rings";
import {
  toEngagementRingListItem,
  type EngagementRingItem,
  type EngagementRingListItem,
} from "@/fixtures/types/engagement-ring";
import { simulateLatency } from "../_simulate";
import {
  paginate,
  type PaginatedResult,
  type PaginatedOptions,
  type ServerPaginationParams,
} from "../helpers";
import type { FilterDefinition, ParsedFilters } from "../filters";

export type { EngagementRingItem, EngagementRingListItem };

export async function fetchEngagementRingList(
  options: PaginatedOptions,
): Promise<PaginatedResult<EngagementRingItem>> {
  await simulateLatency();
  return paginate(ENGAGEMENT_RINGS, options);
}

export async function fetchEngagementRingItem(
  id: string,
): Promise<EngagementRingItem | undefined> {
  await simulateLatency();
  return ENGAGEMENT_RINGS.find((i) => i.id === id);
}

export async function fetchRelatedEngagementRings(
  excludeId: string,
  limit = 4,
): Promise<EngagementRingItem[]> {
  await simulateLatency();
  return ENGAGEMENT_RINGS.filter((i) => i.id !== excludeId).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Server-side filtered pagination (used by Route Handlers)
// ---------------------------------------------------------------------------

export const ENGAGEMENT_RING_FILTERS: FilterDefinition = {
  multi: ["metal", "stoneShape", "bandStyle"],
  range: ["price"],
  sortOptions: ["price_asc", "price_desc", "newest"],
};

function getMultiValues(
  filters: ParsedFilters["filters"],
  key: string,
): string[] | null {
  const value = filters[key];
  return Array.isArray(value) && value.length > 0 ? value : null;
}

function getRangeValues(
  filters: ParsedFilters["filters"],
  key: string,
): { min?: number; max?: number } | null {
  const value = filters[key];
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  return null;
}

export async function fetchEngagementRingListFiltered(
  filters: ParsedFilters["filters"],
  sort: string | null,
  pagination: ServerPaginationParams,
): Promise<{ items: EngagementRingListItem[]; totalItems: number }> {
  await simulateLatency();
  let items = [...ENGAGEMENT_RINGS];

  const metalVals = getMultiValues(filters, "metal");
  if (metalVals) {
    items = items.filter((i) =>
      i.availableMetals.some((m) => metalVals.includes(m.metal.value)),
    );
  }

  const stoneShapeVals = getMultiValues(filters, "stoneShape");
  if (stoneShapeVals) {
    items = items.filter((i) =>
      i.compatibleStones.some((s) => stoneShapeVals.includes(s.shape.value)),
    );
  }

  const bandStyleVals = getMultiValues(filters, "bandStyle");
  if (bandStyleVals) {
    items = items.filter((i) => bandStyleVals.includes(i.bandStyle.value));
  }

  const priceRange = getRangeValues(filters, "price");
  if (priceRange) {
    items = items.filter((i) => {
      const minPrice = i.availableMetals.length
        ? Math.min(...i.availableMetals.map((m) => m.priceUsd))
        : 0;
      if (priceRange.min !== undefined && minPrice < priceRange.min) return false;
      if (priceRange.max !== undefined && minPrice > priceRange.max) return false;
      return true;
    });
  }

  const listed = items.map(toEngagementRingListItem);

  switch (sort) {
    case "price_asc": listed.sort((a, b) => a.minPriceUsd - b.minPriceUsd); break;
    case "price_desc": listed.sort((a, b) => b.minPriceUsd - a.minPriceUsd); break;
  }

  const totalItems = listed.length;
  const page = listed.slice(pagination.offset, pagination.offset + pagination.perPage);
  return { items: page, totalItems };
}
