import { NATURAL_MELEE } from "@/fixtures/products/natural-melee";
import { LAB_GROWN_MELEE } from "@/fixtures/products/lab-grown-melee";
import {
  toMeleeListItem,
  type MeleeItem,
  type MeleeListItem,
} from "@/fixtures/types/melee";
import { simulateLatency } from "./_simulate";
import {
  paginate,
  type PaginatedResult,
  type PaginatedOptions,
  type ServerPaginationParams,
} from "./helpers";
import type { FilterDefinition, ParsedFilters } from "./filters";

export type { MeleeItem, MeleeListItem };

function pool(labGrown: boolean): MeleeItem[] {
  return labGrown ? LAB_GROWN_MELEE : NATURAL_MELEE;
}

export async function fetchMeleeList(
  options: PaginatedOptions,
  labGrown = false,
): Promise<PaginatedResult<MeleeItem>> {
  await simulateLatency();
  return paginate(pool(labGrown), options);
}

export async function fetchMeleeItem(
  id: string,
  labGrown = false,
): Promise<MeleeItem | undefined> {
  await simulateLatency();
  return pool(labGrown).find((i) => i.id === id);
}

export async function fetchRelatedMelee(
  excludeId: string,
  labGrown = false,
  limit = 4,
): Promise<MeleeItem[]> {
  await simulateLatency();
  return pool(labGrown)
    .filter((i) => i.id !== excludeId)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Server-side filtered pagination (used by Route Handlers)
// ---------------------------------------------------------------------------

export const MELEE_FILTERS: FilterDefinition = {
  multi: ["shape", "sizeRange", "colorRange", "clarityRange", "cut"],
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

export async function fetchMeleeListFiltered(
  filters: ParsedFilters["filters"],
  sort: string | null,
  pagination: ServerPaginationParams,
  labGrown = false,
): Promise<{ items: MeleeListItem[]; totalItems: number }> {
  await simulateLatency();
  let items = [...pool(labGrown)];

  const shapeVals = getMultiValues(filters, "shape");
  if (shapeVals) items = items.filter((i) => shapeVals.includes(i.shape));

  const cutVals = getMultiValues(filters, "cut");
  if (cutVals) items = items.filter((i) => cutVals.includes(i.cut));

  const sizeVals = getMultiValues(filters, "sizeRange");
  if (sizeVals) items = items.filter((i) => sizeVals.some((v) => i.sizeRange.toLowerCase().includes(v.toLowerCase())));

  const colorRangeVals = getMultiValues(filters, "colorRange");
  if (colorRangeVals) items = items.filter((i) => colorRangeVals.some((v) => i.colorRange.toLowerCase().includes(v.toLowerCase())));

  const clarityRangeVals = getMultiValues(filters, "clarityRange");
  if (clarityRangeVals) items = items.filter((i) => clarityRangeVals.some((v) => i.clarityRange.toLowerCase().includes(v.toLowerCase())));

  const priceRange = getRangeValues(filters, "price");
  if (priceRange) {
    if (priceRange.min !== undefined) items = items.filter((i) => i.totalPrice >= priceRange.min!);
    if (priceRange.max !== undefined) items = items.filter((i) => i.totalPrice <= priceRange.max!);
  }

  switch (sort) {
    case "price_asc": items.sort((a, b) => a.totalPrice - b.totalPrice); break;
    case "price_desc": items.sort((a, b) => b.totalPrice - a.totalPrice); break;
  }

  const totalItems = items.length;
  const page = items.slice(pagination.offset, pagination.offset + pagination.perPage);
  return { items: page.map(toMeleeListItem), totalItems };
}
