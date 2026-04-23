/**
 * Shared helpers for the data-access layer.
 */

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

export interface PaginatedOptions {
  page?: number;
  perPage: number;
  perPageOptions: number[];
}

/** Shared pagination logic used by every fetchList function. */
export function paginate<T>(
  data: readonly T[],
  options: PaginatedOptions,
): PaginatedResult<T> {
  const perPage = options.perPageOptions.includes(options.perPage)
    ? options.perPage
    : options.perPageOptions[0];

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(Math.max(1, options.page ?? 1), totalPages);

  const startIndex = (currentPage - 1) * perPage;
  const items = data.slice(startIndex, startIndex + perPage) as T[];

  return { items, totalItems, totalPages, currentPage, perPage };
}

/** Server-side pagination params parsed from query string */
export interface ServerPaginationParams {
  page: number;
  perPage: number;
  offset: number;
}

/** Parse and validate pagination from URL search params */
export function parsePagination(
  searchParams: URLSearchParams,
): ServerPaginationParams | { error: string } {
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const rawPerPage = Number(searchParams.get("perPage"));
  const perPage = Number.isFinite(rawPerPage) ? Math.floor(rawPerPage) : 20;

  if (perPage > 100) {
    return { error: "perPage must not exceed 100" };
  }
  if (perPage < 1) {
    return { error: "perPage must be at least 1" };
  }

  return {
    page,
    perPage,
    offset: (page - 1) * perPage,
  };
}
