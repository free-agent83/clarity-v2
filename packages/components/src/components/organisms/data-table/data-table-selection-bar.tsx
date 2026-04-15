import type { Table } from "@tanstack/react-table"
import type { ReactNode } from "react"
import { Button } from "@/components/atoms/button/button"

interface DataTableSelectionBarProps<TData> {
  table: Table<TData>
  selectionActions?: (rows: TData[], clearSelection: () => void) => ReactNode
}

/**
 * Fixed bottom bar displayed when one or more rows are selected.
 *
 * Shows the selected row count on the left. On the right: optional
 * `selectionActions` (e.g. bulk-action buttons) followed by a
 * "Clear selection" button that resets all row selection state.
 */
function DataTableSelectionBar<TData>({
  table,
  selectionActions,
}: DataTableSelectionBarProps<TData>) {
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const clearSelection = () => table.resetRowSelection()

  return (
    <div
      data-slot="data-table-selection-bar"
      className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between border-t bg-background px-6 py-3"
    >
      <div className="text-sm text-muted-foreground">
        {selectedRows.length} row(s) selected
      </div>
      <div className="flex items-center gap-2">
        {selectionActions?.(
          selectedRows.map((row) => row.original),
          clearSelection
        )}
        <Button variant="outline" size="sm" onClick={clearSelection}>
          Clear selection
        </Button>
      </div>
    </div>
  )
}

export { DataTableSelectionBar }
export type { DataTableSelectionBarProps }
