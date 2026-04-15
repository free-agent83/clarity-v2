import type { ColumnDef } from "@tanstack/react-table"
import type { ReactNode } from "react"

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50]

/**
 * Configuration object for DataTable.
 *
 * Drives all table behaviour — columns, pagination, row selection, and
 * empty state. Passed as the `config` prop to `DataTable`.
 *
 * @see {@link DataTableProps} for the full prop interface.
 */
export interface DataTableConfig<TData> {
  columns: ColumnDef<TData, unknown>[]
  toolbar?: DataTableToolbarConfig
  pagination?: DataTablePaginationConfig
  enableRowSelection?: boolean
  selectionActions?: (rows: TData[], clearSelection: () => void) => ReactNode
  emptyState?: ReactNode
}

/**
 * Pagination configuration for DataTable.
 *
 * Controls the available page size options in the pagination controls.
 * The first value in the array is used as the default page size.
 */
export interface DataTablePaginationConfig {
  pageSizeOptions?: number[]
}

/**
 * Sort preset for the toolbar sort dropdown.
 *
 * Each option maps a human-readable label to a column + direction pair.
 */
export interface SortOption {
  label: string
  columnId: string
  direction: "asc" | "desc"
}

/**
 * Toolbar configuration for DataTable.
 *
 * Controls the search input and sort dropdown rendered above the table.
 * Both features are optional — configure only what you need.
 */
export interface DataTableToolbarConfig {
  search?: {
    placeholder?: string
    columnIds: string[]
    debounceMs?: number
  }
  sorting?: SortOption[]
}

/**
 * Props for the DataTable root component.
 *
 * @see {@link DataTableConfig} for the config object shape.
 */
export interface DataTableProps<TData> {
  data: TData[]
  config: DataTableConfig<TData>
  loading?: boolean
}

/**
 * Props for the DataTableHeader cell container.
 *
 * Applied automatically by DataTable for plain string headers.
 * Use explicitly in column definitions when custom composition is needed.
 */
export interface DataTableHeaderProps extends React.ComponentProps<"div"> {
  children: ReactNode
}

/**
 * Props for the DataTableCell cell container.
 *
 * Applied automatically by DataTable for plain string/number cell values.
 * Use explicitly when custom styling or composition is needed.
 */
export interface DataTableCellProps extends React.ComponentProps<"div"> {
  children: ReactNode
}
