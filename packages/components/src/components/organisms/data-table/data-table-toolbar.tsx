import { useState, useEffect } from "react"
import type { Table } from "@tanstack/react-table"
import { IconSearch, IconX, IconChevronDown } from "@tabler/icons-react"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "@/components/atoms/button/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/atoms/input-group/input-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/molecules/dropdown-menu/dropdown-menu"
import type { DataTableToolbarConfig } from "./data-table-types"
import { DataTableQuickFilterPopover } from "./data-table-quick-filter-popover"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  toolbar: DataTableToolbarConfig
  globalFilter: string
  setGlobalFilter: (value: string) => void
  hasActiveFilters: boolean
  resetAllFilters: () => void
  loading?: boolean
  isServerSide?: boolean
}

/**
 * Toolbar rendered above the DataTable when `config.toolbar` is defined.
 *
 * Provides an optional debounced search input, quick filter popovers,
 * a "Clear all" button, and an optional sort dropdown.
 * Internal component — never used standalone.
 */
function DataTableToolbar<TData>({
  table,
  toolbar,
  globalFilter,
  setGlobalFilter,
  hasActiveFilters,
  resetAllFilters,
  loading = false,
  isServerSide = false,
}: DataTableToolbarProps<TData>) {
  const [localSearch, setLocalSearch] = useState(globalFilter)
  const debouncedSearch = useDebounce(
    localSearch,
    toolbar.search?.debounceMs ?? 300
  )

  // Client-side: debounce-driven global filter sync
  useEffect(() => {
    if (isServerSide) return
    setGlobalFilter(debouncedSearch)
  }, [debouncedSearch, setGlobalFilter, isServerSide])

  // Sync external globalFilter changes back to local state
  useEffect(() => {
    if (globalFilter !== localSearch) {
      setLocalSearch(globalFilter)
    }
  }, [globalFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearSearch = () => {
    setLocalSearch("")
    setGlobalFilter("")
    // In server-side mode, setGlobalFilter("") triggers the hook's useEffect
    // which fires onSearchChange("") — no extra handling needed here.
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isServerSide && e.key === "Enter") {
      setGlobalFilter(localSearch)
    }
  }

  const currentSort = table.getState().sorting[0]
  const activeSortValue = currentSort
    ? `${currentSort.id}-${currentSort.desc ? "desc" : "asc"}`
    : undefined
  const activeSortLabel = toolbar.sorting?.find(
    (opt) =>
      opt.columnId === currentSort?.id &&
      opt.direction === (currentSort?.desc ? "desc" : "asc")
  )?.label

  const handleSort = (value: string) => {
    const option = toolbar.sorting?.find(
      (opt) => `${opt.columnId}-${opt.direction}` === value
    )
    if (option) {
      table.getColumn(option.columnId)?.toggleSorting(option.direction === "desc")
    }
  }

  return (
    <div
      data-slot="data-table-toolbar"
      className="flex items-center justify-between gap-4"
    >
      <div className="flex flex-1 items-center gap-2">
        {toolbar.search && (
          <InputGroup className="max-w-sm">
            <InputGroupAddon align="inline-start">
              <IconSearch className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder={toolbar.search.placeholder ?? "Search..."}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              disabled={loading}
            />
            {localSearch && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label="Clear search"
                  onClick={handleClearSearch}
                >
                  <IconX className="size-3.5" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
        )}
        {toolbar.quickFilters?.map((filter) => (
          <DataTableQuickFilterPopover
            key={filter.columnId}
            table={table}
            filter={filter}
            loading={loading}
          />
        ))}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetAllFilters} disabled={loading}>
            Clear all
          </Button>
        )}
      </div>
      {toolbar.sorting && toolbar.sorting.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={loading}>
              {activeSortLabel ?? "Sort"}
              <IconChevronDown className="ml-1 size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup
              value={activeSortValue}
              onValueChange={handleSort}
            >
              {toolbar.sorting.map((option) => (
                <DropdownMenuRadioItem
                  key={`${option.columnId}-${option.direction}`}
                  value={`${option.columnId}-${option.direction}`}
                >
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

export { DataTableToolbar }
export type { DataTableToolbarProps }
