import { useState, useEffect, useRef } from "react"
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
  type ColumnDef,
  type FilterFnOption,
} from "@tanstack/react-table"
import { DEFAULT_PAGE_SIZE_OPTIONS, type DataTableConfig } from "./data-table-types"

interface UseDataTableReturn<TData> {
  table: Table<TData>
  hasActiveFilters: boolean
  globalFilter: string
  setGlobalFilter: (value: string) => void
  resetAllFilters: () => void
  isServerSide: boolean
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

  if (config.toolbar?.quickFilters) {
    const filterColumnIds = new Set<string>()
    for (const filter of config.toolbar.quickFilters) {
      if (!columnIds.includes(filter.columnId)) {
        throw new Error(
          `DataTable: toolbar.quickFilters references unknown column "${filter.columnId}". ` +
            `Available columns: ${columnIds.filter(Boolean).join(", ")}`
        )
      }
      if (filterColumnIds.has(filter.columnId)) {
        throw new Error(
          `DataTable: toolbar.quickFilters has duplicate columnId "${filter.columnId}".`
        )
      }
      filterColumnIds.add(filter.columnId)
    }
  }

  if (config.serverSide) {
    if (config.serverSide.totalRows < 0) {
      throw new Error(
        "DataTable: serverSide.totalRows must be a non-negative number."
      )
    }

    const hasCallback =
      config.serverSide.onSortChange ||
      config.serverSide.onFilterChange ||
      config.serverSide.onSearchChange ||
      config.serverSide.onPageChange ||
      config.serverSide.onClearAll
    if (!hasCallback) {
      throw new Error(
        "DataTable: serverSide is set but no callbacks are provided. " +
          "Add at least one of: onSortChange, onFilterChange, onSearchChange, onPageChange, onClearAll."
      )
    }

    if (config.toolbar?.quickFilters) {
      for (const filter of config.toolbar.quickFilters) {
        if (filter.type === "checkbox-list" && !filter.serverSide?.options) {
          throw new Error(
            `DataTable: Quick filter "${filter.name}" (checkbox-list) requires serverSide.options when serverSide mode is enabled.`
          )
        }
        if (
          filter.type === "interval-slider" &&
          (!filter.serverSide || filter.serverSide.min === undefined || filter.serverSide.max === undefined)
        ) {
          throw new Error(
            `DataTable: Quick filter "${filter.name}" (interval-slider) requires serverSide.min and serverSide.max when serverSide mode is enabled.`
          )
        }
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
  const [globalFilter, setGlobalFilter] = useState<string>("")
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const searchColumnIds = config.toolbar?.search?.columnIds
  const filterFnMap = config.toolbar?.quickFilters
    ? new Map<string, FilterFnOption<TData>>(
        config.toolbar.quickFilters.map((f) => [
          f.columnId,
          (f.type === "checkbox-list" ? "arrIncludesSome" : "inNumberRange") as FilterFnOption<TData>,
        ])
      )
    : undefined

  const columns: ColumnDef<TData, unknown>[] =
    searchColumnIds || filterFnMap
      ? config.columns.map((col) => {
          const id = "accessorKey" in col ? String(col.accessorKey) : col.id
          const needsGlobalFilterOff =
            searchColumnIds && !searchColumnIds.includes(id ?? "")
          const filterFn = filterFnMap?.get(id ?? "")

          if (!needsGlobalFilterOff && !filterFn) return col
          return {
            ...col,
            ...(needsGlobalFilterOff && { enableGlobalFilter: false }),
            ...(filterFn && { filterFn }),
          }
        })
      : config.columns

  const isServerSide = !!config.serverSide

  const table = useReactTable<TData>({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
      rowSelection,
    },
    enableRowSelection: config.enableRowSelection ?? false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    // Client-side only models
    ...(!isServerSide && {
      getFilteredRowModel: getFilteredRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFacetedRowModel: getFacetedRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
      getFacetedMinMaxValues: getFacetedMinMaxValues(),
    }),
    // Server-side manual flags
    ...(isServerSide && {
      manualSorting: true,
      manualFiltering: true,
      manualPagination: true,
      pageCount: Math.ceil(config.serverSide!.totalRows / pagination.pageSize),
    }),
  })

  // --- Server-side callbacks ---
  const isInitialMount = useRef(true)
  const isClearing = useRef(false)

  useEffect(() => {
    if (!isServerSide || isInitialMount.current) return
    config.serverSide?.onSortChange?.(sorting)
  }, [sorting]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isServerSide || isInitialMount.current) return
    // Fires for ALL active filters on every change — consumers that need to know
    // which specific filter changed should diff against their previous state.
    // When all filters are cleared (length goes to 0), the loop is a no-op;
    // that case is handled by resetAllFilters / onClearAll instead.
    for (const filter of columnFilters) {
      config.serverSide?.onFilterChange?.(filter.id, filter.value)
    }
  }, [columnFilters]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isServerSide || isInitialMount.current) return
    config.serverSide?.onPageChange?.(pagination)
  }, [pagination]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isServerSide || isInitialMount.current || isClearing.current) return
    config.serverSide?.onSearchChange?.(globalFilter)
  }, [globalFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  // Mark initial mount complete after first render
  useEffect(() => {
    isInitialMount.current = false
  }, [])

  const hasActiveFilters = columnFilters.length > 0 || globalFilter !== ""

  const resetAllFilters = () => {
    isClearing.current = true
    table.resetColumnFilters()
    setGlobalFilter("")
    config.serverSide?.onClearAll?.()
    // Reset on next microtask so the globalFilter useEffect sees isClearing=true
    queueMicrotask(() => { isClearing.current = false })
  }

  return { table, hasActiveFilters, globalFilter, setGlobalFilter, resetAllFilters, isServerSide }
}

export { useDataTable, validateConfig }
export type { UseDataTableReturn }
