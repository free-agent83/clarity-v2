import { NextRequest } from "next/server";
import { apiError } from "./response";
import { parsePagination, type ServerPaginationParams } from "./helpers";

/**
 * Plain-object `searchParams` as Next.js page server components receive
 * them (from `await searchParams` in App Router pages).
 */
export type PageSearchParams = Record<string, string | string[] | undefined>;

export interface FilterDefinition {
  /** Multi-value filter (comma-separated): shape=round,oval */
  multi?: string[];
  /** Range filter (min/max): carat_min=1.0&carat_max=2.0 */
  range?: string[];
  /** Sort values: price_asc, price_desc, newest */
  sortOptions?: string[];
}

export interface ParsedFilters {
  filters: Record<string, string | string[] | { min?: number; max?: number }>;
  sort: string | null;
  pagination: ServerPaginationParams;
}

/**
 * Parse query params into validated filters + pagination.
 * Returns a Response (error) if validation fails.
 */
export function parseListParams(
  request: NextRequest,
  definition: FilterDefinition,
): ParsedFilters | Response {
  const sp = request.nextUrl.searchParams;
  const pagination = parsePagination(sp);

  if ("error" in pagination) {
    return apiError("INVALID_PARAMS", pagination.error, 400);
  }

  const filters: ParsedFilters["filters"] = {};

  // Multi-value filters
  for (const key of definition.multi ?? []) {
    const value = sp.get(key);
    if (value) {
      filters[key] = value.split(",").map((v) => v.trim());
    }
  }

  // Range filters
  for (const key of definition.range ?? []) {
    const min = sp.get(`${key}_min`);
    const max = sp.get(`${key}_max`);
    if (min || max) {
      filters[key] = {
        min: min ? Number(min) : undefined,
        max: max ? Number(max) : undefined,
      };
    }
  }

  // Sort
  let sort: string | null = null;
  const sortParam = sp.get("sort");
  if (sortParam) {
    if (definition.sortOptions?.includes(sortParam)) {
      sort = sortParam;
    } else {
      return apiError(
        "INVALID_PARAMS",
        `Invalid sort option: ${sortParam}. Valid options: ${definition.sortOptions?.join(", ")}`,
        400,
      );
    }
  }

  return { filters, sort, pagination };
}

/**
 * Page-level variant of `parseListParams` — reads from the plain-object
 * `searchParams` that Next.js server components receive (`await searchParams`)
 * instead of a `NextRequest`. Unlike the route-handler variant, this
 * function does not return `Response` errors: pages silently fall back
 * to sensible defaults on invalid input, since the page always has to
 * render *something*.
 */
export function parsePageListParams(
  params: PageSearchParams,
  definition: FilterDefinition,
): ParsedFilters {
  // Normalise into URLSearchParams so we can reuse parsePagination and
  // share the same filter-parsing logic as the route-handler path.
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) sp.append(key, v);
    } else {
      sp.set(key, value);
    }
  }

  const paginationResult = parsePagination(sp);
  const pagination: ServerPaginationParams =
    "error" in paginationResult
      ? { page: 1, perPage: 20, offset: 0 }
      : paginationResult;

  const filters: ParsedFilters["filters"] = {};

  for (const key of definition.multi ?? []) {
    const value = sp.get(key);
    if (value) {
      filters[key] = value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }
  }

  for (const key of definition.range ?? []) {
    const min = sp.get(`${key}_min`);
    const max = sp.get(`${key}_max`);
    if (min || max) {
      filters[key] = {
        min: min ? Number(min) : undefined,
        max: max ? Number(max) : undefined,
      };
    }
  }

  let sort: string | null = null;
  const sortParam = sp.get("sort");
  if (sortParam && definition.sortOptions?.includes(sortParam)) {
    sort = sortParam;
  }

  return { filters, sort, pagination };
}
