import { NATURAL_DIAMONDS } from "@/fixtures/products/natural-diamonds";
import { LAB_GROWN_DIAMONDS } from "@/fixtures/products/lab-grown-diamonds";
import {
  toDiamondListItem,
  type DiamondItem,
  type DiamondListItem,
} from "@/fixtures/types/diamond";
import { simulateLatency } from "./_simulate";
import {
  paginate,
  type PaginatedResult,
  type PaginatedOptions,
  type ServerPaginationParams,
} from "./helpers";
import type { FilterDefinition, ParsedFilters } from "./filters";

export type { DiamondItem, DiamondListItem };

function pool(labGrown: boolean): DiamondItem[] {
  return labGrown ? LAB_GROWN_DIAMONDS : NATURAL_DIAMONDS;
}

export async function fetchDiamondList(
  options: PaginatedOptions,
  labGrown = false,
): Promise<PaginatedResult<DiamondItem>> {
  await simulateLatency();
  return paginate(pool(labGrown), options);
}

export async function fetchDiamondItem(
  id: string,
  labGrown = false,
): Promise<DiamondItem | undefined> {
  await simulateLatency();
  return pool(labGrown).find((i) => i.id === id);
}

export async function fetchRelatedDiamonds(
  excludeId: string,
  labGrown = false,
  limit = 4,
): Promise<DiamondItem[]> {
  await simulateLatency();
  return pool(labGrown)
    .filter((i) => i.id !== excludeId)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Server-side filtered pagination (used by Route Handlers)
// ---------------------------------------------------------------------------

export const DIAMOND_FILTERS: FilterDefinition = {
  multi: [
    "shape",
    "color",
    "clarity",
    "cut",
    "polish",
    "symmetry",
    "fluorescence",
    "certification",
  ],
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

export async function fetchDiamondListFiltered(
  filters: ParsedFilters["filters"],
  sort: string | null,
  pagination: ServerPaginationParams,
  labGrown = false,
): Promise<{ items: DiamondListItem[]; totalItems: number }> {
  await simulateLatency();
  let items = [...pool(labGrown)];

  const shapeVals = getMultiValues(filters, "shape");
  if (shapeVals) items = items.filter((i) => shapeVals.includes(i.shape));

  const colorVals = getMultiValues(filters, "color");
  if (colorVals) items = items.filter((i) => colorVals.includes(i.color));

  const clarityVals = getMultiValues(filters, "clarity");
  if (clarityVals) items = items.filter((i) => clarityVals.includes(i.clarity));

  const cutVals = getMultiValues(filters, "cut");
  if (cutVals) items = items.filter((i) => cutVals.includes(i.cut));

  const polishVals = getMultiValues(filters, "polish");
  if (polishVals) items = items.filter((i) => polishVals.includes(i.polish));

  const symmetryVals = getMultiValues(filters, "symmetry");
  if (symmetryVals) items = items.filter((i) => symmetryVals.includes(i.symmetry));

  const fluorescenceVals = getMultiValues(filters, "fluorescence");
  if (fluorescenceVals) items = items.filter((i) => fluorescenceVals.includes(i.fluorescence));

  const certVals = getMultiValues(filters, "certification");
  if (certVals) items = items.filter((i) => certVals.includes(i.certification.lab));

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
  return { items: page.map(toDiamondListItem), totalItems };
}
