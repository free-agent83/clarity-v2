import { flexRender } from "@tanstack/react-table"
import { Skeleton } from "@/components/atoms/skeleton/skeleton"
import { useDataTable } from "./use-data-table"
import { DataTableHeader, DataTableCell } from "./data-table-cells"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableSelectionBar } from "./data-table-selection-bar"
import { DataTableToolbar } from "./data-table-toolbar"
import type { DataTableProps } from "./data-table-types"

/**
 * Configuration-driven data table component built on TanStack Table.
 *
 * Owns all table state internally — sorting, filtering, pagination, and row
 * selection. The consuming engineer provides a `config` object and a `data`
 * array; the component handles everything else.
 *
 * Plain string headers are auto-wrapped in `DataTableHeader`. Plain
 * string/number cell values are auto-wrapped in `DataTableCell`. Custom JSX
 * in column definitions is rendered as-is.
 *
 * @see {@link DataTableConfig} for the config object shape.
 * @see {@link getSelectColumn} for the row selection helper.
 *
 * @example
 * ```tsx
 * <DataTable data={data} config={config} />
 * ```
 */
function DataTable<TData>({
  data,
  config,
  loading = false,
}: DataTableProps<TData>) {
  const { table, globalFilter, setGlobalFilter, hasActiveFilters, resetAllFilters, isServerSide } =
    useDataTable(data, config)

  const selectedRowCount = config.enableRowSelection
    ? table.getFilteredSelectedRowModel().rows.length
    : 0

  return (
    <div data-slot="data-table" className="flex flex-col gap-4">
      {config.toolbar && (
        <DataTableToolbar
          table={table}
          toolbar={config.toolbar}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
          hasActiveFilters={hasActiveFilters}
          resetAllFilters={resetAllFilters}
          loading={loading}
          isServerSide={isServerSide}
        />
      )}
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-muted [&_tr]:border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b transition-colors hover:bg-muted/50"
              >
                {headerGroup.headers.map((header) => {
                  const rendered = header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )

                  const content =
                    typeof rendered === "string" ? (
                      <DataTableHeader>{rendered}</DataTableHeader>
                    ) : (
                      rendered
                    )

                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0"
                    >
                      {content}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            {loading ? (
              Array.from({
                length: table.getState().pagination.pageSize,
              }).map((_, rowIndex) => (
                <tr
                  key={`skeleton-${rowIndex}`}
                  className="border-b transition-colors"
                >
                  {table.getVisibleLeafColumns().map((column) => (
                    <td
                      key={column.id}
                      className="p-2 align-middle whitespace-nowrap"
                    >
                      <Skeleton className="h-4 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  {row.getVisibleCells().map((cell) => {
                    const rendered = flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )

                    const content =
                      typeof rendered === "string" ||
                      typeof rendered === "number" ? (
                        <DataTableCell>{rendered}</DataTableCell>
                      ) : (
                        rendered
                      )

                    return (
                      <td
                        key={cell.id}
                        className="p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0"
                      >
                        {content}
                      </td>
                    )
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  {config.emptyState ?? "No results."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <DataTablePagination
        table={table}
        pageSizeOptions={config.pagination?.pageSizeOptions}
        loading={loading}
      />
      {config.enableRowSelection && selectedRowCount > 0 && (
        <DataTableSelectionBar
          table={table}
          selectionActions={config.selectionActions}
        />
      )}
    </div>
  )
}

export { DataTable }
