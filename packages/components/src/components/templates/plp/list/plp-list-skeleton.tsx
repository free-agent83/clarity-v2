import { Skeleton } from "../../../atoms/skeleton/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../organisms/table/table";
import type { ListColumn } from "../plp-types";

/**
 * Skeleton loading state for the PLP list view.
 *
 * Renders the table header with real column labels so the list structure
 * is visible immediately, and replaces row data with Skeleton blocks.
 */
export function PlpListSkeleton<TItem>({
  listColumns,
  count = 20,
}: {
  listColumns: ListColumn<TItem>[];
  count?: number;
}) {
  const columnCount = 2 /* thumb + name */ + listColumns.length + 3 /* delivery + returns + price */ + 1 /* actions */;

  return (
    <Table data-slot="plp-list-skeleton">
      <TableHeader className="sticky top-0 z-10 bg-background">
        <TableRow>
          <TableHead className="w-[72px]">
            <span className="sr-only">Thumbnail</span>
          </TableHead>
          <TableHead>Name</TableHead>
          {listColumns.map((column) => (
            <TableHead key={column.id}>{column.header}</TableHead>
          ))}
          <TableHead>Delivery</TableHead>
          <TableHead>Returns</TableHead>
          <TableHead>Price</TableHead>
          <TableHead className="text-right">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: count }, (_, rowIndex) => (
          <TableRow key={rowIndex}>
            <TableCell>
              <Skeleton className="h-12 w-12 rounded-md" />
            </TableCell>
            {Array.from({ length: columnCount - 2 }, (_, cellIndex) => (
              <TableCell key={cellIndex}>
                <Skeleton className="h-4 w-20" />
              </TableCell>
            ))}
            <TableCell>
              <Skeleton className="ml-auto h-8 w-24" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
