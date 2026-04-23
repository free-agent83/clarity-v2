"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@nivoda/components";

import { usePlpLoading } from "./plp-loading-context";

export type PlpPaginationProps = {
  currentPage: number;
  totalPages: number;
};

export function PlpPagination({ currentPage, totalPages }: PlpPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startTransition } = usePlpLoading();

  if (totalPages <= 1) return null;

  function hrefFor(page: number): string {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function onNavigate(
    e: React.MouseEvent<HTMLAnchorElement>,
    page: number,
  ) {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    e.preventDefault();
    startTransition(() => {
      router.push(hrefFor(page));
    });
  }

  const pages = buildPageRange(currentPage, totalPages);
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          {prevPage ? (
            <PaginationPrevious
              href={hrefFor(prevPage)}
              onClick={(e) => onNavigate(e, prevPage)}
            />
          ) : (
            <PaginationPrevious
              href="#"
              aria-disabled
              tabIndex={-1}
              className="pointer-events-none opacity-50"
            />
          )}
        </PaginationItem>

        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink
                href={hrefFor(p)}
                isActive={p === currentPage}
                onClick={(e) => onNavigate(e, p)}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          {nextPage ? (
            <PaginationNext
              href={hrefFor(nextPage)}
              onClick={(e) => onNavigate(e, nextPage)}
            />
          ) : (
            <PaginationNext
              href="#"
              aria-disabled
              tabIndex={-1}
              className="pointer-events-none opacity-50"
            />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

// First, last, and a ±1 window around current. Ellipses elide any gap.
function buildPageRange(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: Array<number | "ellipsis"> = [1];
  const windowSize = 1;
  const start = Math.max(2, current - windowSize);
  const end = Math.min(total - 1, current + windowSize);

  if (start > 2) pages.push("ellipsis");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("ellipsis");

  pages.push(total);
  return pages;
}
