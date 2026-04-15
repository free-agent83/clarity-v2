import { cn } from "@/lib/utils"
import type { DataTableHeaderProps, DataTableCellProps } from "./data-table-types"

/**
 * Standardised header cell container for DataTable.
 *
 * Applied automatically by DataTable for plain string headers. Use explicitly
 * in column definitions when custom composition is needed inside a header cell.
 */
function DataTableHeader({
  className,
  children,
  ...props
}: DataTableHeaderProps) {
  return (
    <div
      data-slot="data-table-header"
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Standardised body cell container for DataTable.
 *
 * Applied automatically by DataTable for plain string/number cell values. Use
 * explicitly when wrapping custom content that still needs standard cell styling.
 */
function DataTableCell({
  className,
  children,
  ...props
}: DataTableCellProps) {
  return (
    <div
      data-slot="data-table-cell"
      className={cn("text-sm", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { DataTableHeader, DataTableCell }
