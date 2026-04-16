import type { ColumnDef, SortingState, PaginationState } from "@tanstack/react-table"
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
  serverSide?: DataTableServerSideConfig
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
 * Server-side configuration for DataTable.
 *
 * When provided, the table delegates sorting, filtering, pagination, and
 * search to the server via callbacks. The consumer manages data fetching;
 * the table manages UI state and fires callbacks on user interaction.
 */
export interface DataTableServerSideConfig {
  /** Total row count across all pages — required for pagination page count. */
  totalRows: number
  /** Fires when the user changes the sort order. */
  onSortChange?: (sorting: SortingState) => void
  /** Fires when a quick filter is applied or cleared. */
  onFilterChange?: (columnId: string, value: unknown) => void
  /** Fires when the user presses Enter in the search input. */
  onSearchChange?: (search: string) => void
  /** Fires when the user navigates pages or changes page size. */
  onPageChange?: (pagination: PaginationState) => void
  /** Fires when the user clicks "Clear all" — consumer re-fetches unfiltered data. */
  onClearAll?: () => void
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
 * Quick filter configuration for the toolbar.
 *
 * Each quick filter renders as a popover trigger button in the toolbar.
 * The popover contains filter-specific controls, an Apply button, and
 * a Clear button. Changes are pending until Apply is clicked.
 */
export type QuickFilter =
  | {
      name: string
      columnId: string
      type: "checkbox-list"
      /** Maps raw filter values to human-readable labels (e.g. `{ sold_out: "Sold out" }`). Raw value is shown when a key is missing. */
      labelMap?: Record<string, string>
      serverSide?: {
        /** All possible filter options — required because faceted values can't be derived from one page. */
        options: string[]
      }
    }
  | {
      name: string
      columnId: string
      type: "interval-slider"
      formatValue?: (value: number) => string
      serverSide?: {
        /** Slider minimum bound. */
        min: number
        /** Slider maximum bound. */
        max: number
      }
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
  quickFilters?: QuickFilter[]
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
