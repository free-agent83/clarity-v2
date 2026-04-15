import { useState, useEffect } from "react"
import type { Table } from "@tanstack/react-table"
import { IconChevronDown } from "@tabler/icons-react"
import { Button } from "@/components/atoms/button/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/atoms/popover/popover"
import { DataTableCheckboxFilter } from "./data-table-checkbox-filter"
import { DataTableSliderFilter } from "./data-table-slider-filter"
import type { QuickFilter } from "./data-table-types"

interface DataTableQuickFilterPopoverProps<TData> {
  table: Table<TData>
  filter: QuickFilter
  loading?: boolean
}

/**
 * Shared popover template for a single quick filter.
 *
 * Renders the trigger button with an active-state indicator label,
 * the filter-specific controls (checkbox list or range slider), and
 * Apply / Clear action buttons. Changes are pending until Apply.
 *
 * Internal component — never used standalone.
 */
function DataTableQuickFilterPopover<TData>({
  table,
  filter,
  loading = false,
}: DataTableQuickFilterPopoverProps<TData>) {
  const [open, setOpen] = useState(false)
  const column = table.getColumn(filter.columnId)

  const [pendingCheckbox, setPendingCheckbox] = useState<Set<string>>(
    new Set()
  )
  const [pendingSlider, setPendingSlider] = useState<[number, number]>([0, 0])

  // Initialise pending state from the column's current filter value when popover opens
  useEffect(() => {
    if (!open || !column) return

    if (filter.type === "checkbox-list") {
      const current = column.getFilterValue() as string[] | undefined
      setPendingCheckbox(new Set(current ?? []))
    } else {
      const current = column.getFilterValue() as [number, number] | undefined
      const [min, max] = filter.serverSide
        ? [filter.serverSide.min, filter.serverSide.max]
        : (column.getFacetedMinMaxValues() ?? [0, 0])
      setPendingSlider(
        current ?? [min ?? 0, max ?? 0]
      )
    }
  }, [open, column, filter])

  if (!column) return null

  // Trigger label with active indicator
  const triggerLabel = (() => {
    if (filter.type === "checkbox-list") {
      const activeCount = (
        column.getFilterValue() as string[] | undefined
      )?.length
      return activeCount ? `${filter.name} (${activeCount})` : filter.name
    }

    const range = column.getFilterValue() as [number, number] | undefined
    const fmt = filter.formatValue ?? String
    return range
      ? `${filter.name}: ${fmt(range[0])} \u2013 ${fmt(range[1])}`
      : filter.name
  })()

  const handleApply = () => {
    if (filter.type === "checkbox-list") {
      const arr = Array.from(pendingCheckbox)
      column.setFilterValue(arr.length > 0 ? arr : undefined)
    } else {
      column.setFilterValue(pendingSlider)
    }
    setOpen(false)
  }

  const handleClear = () => {
    column.setFilterValue(undefined)
    if (filter.type === "checkbox-list") {
      setPendingCheckbox(new Set())
    } else {
      const [min, max] = filter.serverSide
        ? [filter.serverSide.min, filter.serverSide.max]
        : (column.getFacetedMinMaxValues() ?? [0, 0])
      setPendingSlider([min ?? 0, max ?? 0])
    }
    setOpen(false)
  }

  const renderFilterContent = () => {
    if (filter.type === "checkbox-list") {
      const options = filter.serverSide?.options
        ?? Array.from(column.getFacetedUniqueValues().keys()).sort()
      return (
        <DataTableCheckboxFilter
          options={options}
          value={pendingCheckbox}
          onChange={setPendingCheckbox}
        />
      )
    }

    const [min, max] = filter.serverSide
      ? [filter.serverSide.min, filter.serverSide.max]
      : (column.getFacetedMinMaxValues() ?? [0, 0])
    return (
      <DataTableSliderFilter
        min={min ?? 0}
        max={max ?? 0}
        value={pendingSlider}
        onChange={setPendingSlider}
        formatValue={filter.formatValue}
      />
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          {triggerLabel}
          <IconChevronDown className="ml-1 size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60">
        {renderFilterContent()}
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleApply}>
            Apply
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DataTableQuickFilterPopover }
export type { DataTableQuickFilterPopoverProps }
