import { useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  type Table,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
} from "@tanstack/react-table"
import { DEFAULT_PAGE_SIZE_OPTIONS, type DataTableConfig } from "./data-table-types"

interface UseDataTableReturn<TData> {
  table: Table<TData>
  hasActiveFilters: boolean
}

function validateConfig<TData>(config: DataTableConfig<TData>): void {
  const hasSelectColumn = config.columns.some(
    (col) => "id" in col && col.id === "select"
  )

  if (config.enableRowSelection && !hasSelectColumn) {
    throw new Error(
      'DataTable: enableRowSelection is true but no column with id "select" exists. ' +
        "Add getSelectColumn() to your columns array."
    )
  }

  if (hasSelectColumn && !config.enableRowSelection) {
    throw new Error(
      'DataTable: A column with id "select" exists but enableRowSelection is not true. ' +
        "Set enableRowSelection: true in your config."
    )
  }

  // Toolbar validation
  const columnIds = config.columns.map((col) =>
    "accessorKey" in col ? String(col.accessorKey) : col.id ?? ""
  )

  if (config.toolbar?.search) {
    if (!config.toolbar.search.columnIds.length) {
      throw new Error(
        "DataTable: toolbar.search.columnIds must be a non-empty array."
      )
    }
    for (const id of config.toolbar.search.columnIds) {
      if (!columnIds.includes(id)) {
        throw new Error(
          `DataTable: toolbar.search.columnIds references unknown column "${id}". ` +
            `Available columns: ${columnIds.filter(Boolean).join(", ")}`
        )
      }
    }
  }

  if (config.toolbar?.sorting) {
    for (const option of config.toolbar.sorting) {
      if (!columnIds.includes(option.columnId)) {
        throw new Error(
          `DataTable: toolbar.sorting references unknown column "${option.columnId}". ` +
            `Available columns: ${columnIds.filter(Boolean).join(", ")}`
        )
      }
    }
  }
}

function useDataTable<TData>(
  data: TData[],
  config: DataTableConfig<TData>,
): UseDataTableReturn<TData> {
  validateConfig(config)

  const pageSizeOptions =
    config.pagination?.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS
  const defaultPageSize = pageSizeOptions[0] ?? 10

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns: config.columns,
    state: {
      sorting,
      columnFilters,
      pagination,
      rowSelection,
    },
    enableRowSelection: config.enableRowSelection ?? false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  })

  const hasActiveFilters = columnFilters.length > 0

  return { table, hasActiveFilters }
}

export { useDataTable, validateConfig }
export type { UseDataTableReturn }
