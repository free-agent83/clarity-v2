import type { ReactNode } from "react";
import { Skeleton } from "../../atoms/skeleton/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../organisms/table/table";

export interface PlpListContainerProps {
  header?: ReactNode;
  children?: ReactNode;
  /** When true, replaces children with `skeletonCount` skeleton rows. */
  loading?: boolean;
  /** Skeleton row count when loading. Defaults to 20. */
  skeletonCount?: number;
}

/**
 * List-view shell for a PLP. Scroll container, sticky header
 * positioning, and `<thead>`/`<tbody>` scaffolding. Consumer provides
 * the header row and the body rows as pre-rendered nodes.
 *
 * When `loading` is true, renders `skeletonCount` generic single-cell
 * skeleton rows that span the full width regardless of the consumer's
 * column count — the visual transition into real rows is brief.
 */
export function PlpListContainer({
  header,
  children,
  loading = false,
  skeletonCount = 20,
}: PlpListContainerProps) {
  return (
    <div
      className="overflow-hidden rounded-lg border border-border"
      data-slot="plp-list"
      data-loading={loading ? "" : undefined}
    >
      <Table>
        {header && (
          <TableHeader className="sticky top-0 z-10 bg-background">
            {header}
          </TableHeader>
        )}
        <TableBody>
          {loading
            ? Array.from({ length: skeletonCount }, (_, i) => (
                <ListSkeletonRow key={i} />
              ))
            : children}
        </TableBody>
      </Table>
    </div>
  );
}

function ListSkeletonRow() {
  // colSpan is deliberately unbounded — the container has no knowledge of
  // the consumer's real column count, and the skeleton → real transition
  // is brief enough that a single full-width cell reads fine.
  return (
    <TableRow aria-hidden="true">
      <TableCell colSpan={999} className="py-4">
        <Skeleton className="h-6 w-full" />
      </TableCell>
    </TableRow>
  );
}
