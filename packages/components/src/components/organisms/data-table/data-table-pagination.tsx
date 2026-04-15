import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react"
import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/atoms/button/button"
import { Label } from "@/components/atoms/label/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/molecules/select/select"
import { DEFAULT_PAGE_SIZE_OPTIONS } from "./data-table-types"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
}

/**
 * Pagination controls for DataTable.
 *
 * Renders a rows-per-page selector (desktop only), a current page indicator,
 * and first/previous/next/last navigation buttons. First and last page buttons
 * are hidden on mobile.
 */
function DataTablePagination<TData>({
  table,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: DataTablePaginationProps<TData>) {
  return (
    <div
      data-slot="data-table-pagination"
      className="flex items-center justify-center gap-8 px-4"
    >
      <div className="hidden items-center gap-2 lg:flex">
        <Label htmlFor="rows-per-page" className="text-sm font-medium">
          Rows per page
        </Label>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value))
          }}
        >
          <SelectTrigger size="sm" className="w-20" id="rows-per-page">
            <SelectValue
              placeholder={table.getState().pagination.pageSize}
            />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-center text-sm font-medium">
        Page {table.getState().pagination.pageIndex + 1} of{" "}
        {table.getPageCount()}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          className="hidden lg:flex"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Go to first page</span>
          <IconChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <span className="sr-only">Go to previous page</span>
          <IconChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Go to next page</span>
          <IconChevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="hidden lg:flex"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <span className="sr-only">Go to last page</span>
          <IconChevronsRight />
        </Button>
      </div>
    </div>
  )
}

export { DataTablePagination }
export type { DataTablePaginationProps }
