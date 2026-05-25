import { GEMSTONES } from "@/fixtures/products/gemstones";
import {
  toGemstoneListItem,
  type GemstoneItem,
  type GemstoneListItem,
} from "@/fixtures/types/gemstone";
import { simulateLatency } from "./_simulate";
import {
  paginate,
  type PaginatedResult,
  type PaginatedOptions,
  type ServerPaginationParams,
} from "./helpers";
import type { FilterDefinition, ParsedFilters } from "./filters";

export type { GemstoneItem, GemstoneListItem };

export async function fetchGemstoneList(
  options: PaginatedOptions,
): Promise<PaginatedResult<GemstoneItem>> {
  await simulateLatency();
  return paginate(GEMSTONES, options);
}

export async function fetchGemstoneItem(
  id: string,
): Promise<GemstoneItem | undefined> {
  await simulateLatency();
  return GEMSTONES.find((i) => i.id === id);
}

export async function fetchRelatedGemstones(
  excludeId: string,
  limit = 4,
): Promise<GemstoneItem[]> {
  await simulateLatency();
  return GEMSTONES.filter((i) => i.id !== excludeId).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Server-side filtered pagination (used by Route Handlers)
// ---------------------------------------------------------------------------

export const GEMSTONE_FILTERS: FilterDefinition = {
  multi: ["type", "shape", "color", "clarity", "cut", "treatment", "origin"],
  range: ["carat", "price"],
  sortOptions: ["price_asc", "price_desc", "carat_asc", "carat_desc", "newest"],
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

export async function fetchGemstoneListFiltered(
  filters: ParsedFilters["filters"],
  sort: string | null,
  pagination: ServerPaginationParams,
): Promise<{ items: GemstoneListItem[]; totalItems: number }> {
  await simulateLatency();
  let items = [...GEMSTONES];

  const typeVals = getMultiValues(filters, "type");
  if (typeVals) items = items.filter((i) => typeVals.includes(i.type));

  const shapeVals = getMultiValues(filters, "shape");
  if (shapeVals) items = items.filter((i) => shapeVals.includes(i.shape));

  const colorVals = getMultiValues(filters, "color");
  if (colorVals) items = items.filter((i) => colorVals.some((v) => i.color.toLowerCase().includes(v.toLowerCase())));

  const clarityVals = getMultiValues(filters, "clarity");
  if (clarityVals) items = items.filter((i) => clarityVals.some((v) => i.clarity.toLowerCase().includes(v.toLowerCase())));

  const cutVals = getMultiValues(filters, "cut");
  if (cutVals) items = items.filter((i) => cutVals.includes(i.cut));

  const treatmentVals = getMultiValues(filters, "treatment");
  if (treatmentVals) items = items.filter((i) => treatmentVals.includes(i.treatment));

  const originVals = getMultiValues(filters, "origin");
  if (originVals) items = items.filter((i) => originVals.includes(i.origin));

  const caratRange = getRangeValues(filters, "carat");
  if (caratRange) {
    if (caratRange.min !== undefined) items = items.filter((i) => i.carat >= caratRange.min!);
    if (caratRange.max !== undefined) items = items.filter((i) => i.carat <= caratRange.max!);
  }

  const priceRange = getRangeValues(filters, "price");
  if (priceRange) {
    if (priceRange.min !== undefined) items = items.filter((i) => i.price >= priceRange.min!);
    if (priceRange.max !== undefined) items = items.filter((i) => i.price <= priceRange.max!);
  }

  switch (sort) {
    case "price_asc": items.sort((a, b) => a.price - b.price); break;
    case "price_desc": items.sort((a, b) => b.price - a.price); break;
    case "carat_asc": items.sort((a, b) => a.carat - b.carat); break;
    case "carat_desc": items.sort((a, b) => b.carat - a.carat); break;
  }

  const totalItems = items.length;
  const page = items.slice(pagination.offset, pagination.offset + pagination.perPage);
  return { items: page.map(toGemstoneListItem), totalItems };
}
