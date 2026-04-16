import { describe, it, expect } from "vitest"
import { validateConfig } from "./use-data-table"
import type { DataTableConfig } from "./data-table-types"

describe("validateConfig", () => {
  it("throws when enableRowSelection is true but no select column exists", () => {
    const config: DataTableConfig<{ name: string }> = {
      columns: [{ accessorKey: "name", header: "Name" }],
      enableRowSelection: true,
    }
    expect(() => validateConfig(config)).toThrow(
      'enableRowSelection is true but no column with id "select" exists'
    )
  })

  it("throws when select column exists but enableRowSelection is not true", () => {
    const config: DataTableConfig<{ name: string }> = {
      columns: [
        { id: "select", header: "Select", cell: () => null },
        { accessorKey: "name", header: "Name" },
      ],
    }
    expect(() => validateConfig(config)).toThrow(
      'A column with id "select" exists but enableRowSelection is not true'
    )
  })

  it("does not throw when both select column and enableRowSelection are present", () => {
    const config: DataTableConfig<{ name: string }> = {
      columns: [
        { id: "select", header: "Select", cell: () => null },
        { accessorKey: "name", header: "Name" },
      ],
      enableRowSelection: true,
    }
    expect(() => validateConfig(config)).not.toThrow()
  })

  it("does not throw when neither select column nor enableRowSelection are present", () => {
    const config: DataTableConfig<{ name: string }> = {
      columns: [{ accessorKey: "name", header: "Name" }],
    }
    expect(() => validateConfig(config)).not.toThrow()
  })

  it("throws when toolbar.search has empty columnIds", () => {
    const config: DataTableConfig<{ name: string }> = {
      columns: [{ accessorKey: "name", header: "Name" }],
      toolbar: {
        search: { columnIds: [] },
      },
    }
    expect(() => validateConfig(config)).toThrow(
      "toolbar.search.columnIds must be a non-empty array"
    )
  })

  it("throws when toolbar.search.columnIds references a non-existent column", () => {
    const config: DataTableConfig<{ name: string }> = {
      columns: [{ accessorKey: "name", header: "Name" }],
      toolbar: {
        search: { columnIds: ["nonexistent"] },
      },
    }
    expect(() => validateConfig(config)).toThrow(
      'toolbar.search.columnIds references unknown column "nonexistent"'
    )
  })

  it("throws when toolbar.sorting references a non-existent column", () => {
    const config: DataTableConfig<{ name: string }> = {
      columns: [{ accessorKey: "name", header: "Name" }],
      toolbar: {
        sorting: [
          { label: "Name A-Z", columnId: "nonexistent", direction: "asc" },
        ],
      },
    }
    expect(() => validateConfig(config)).toThrow(
      'toolbar.sorting references unknown column "nonexistent"'
    )
  })

  it("does not throw for valid toolbar config with search and sorting", () => {
    const config: DataTableConfig<{ name: string }> = {
      columns: [{ accessorKey: "name", header: "Name" }],
      toolbar: {
        search: { columnIds: ["name"], placeholder: "Search..." },
        sorting: [
          { label: "Name A-Z", columnId: "name", direction: "asc" },
        ],
      },
    }
    expect(() => validateConfig(config)).not.toThrow()
  })

  it("throws when quickFilter.columnId references a non-existent column", () => {
    const config: DataTableConfig<{ name: string }> = {
      columns: [{ accessorKey: "name", header: "Name" }],
      toolbar: {
        quickFilters: [
          { name: "Category", columnId: "nonexistent", type: "checkbox-list" },
        ],
      },
    }
    expect(() => validateConfig(config)).toThrow(
      'toolbar.quickFilters references unknown column "nonexistent"'
    )
  })

  it("throws when quickFilters has duplicate columnId values", () => {
    const config: DataTableConfig<{ name: string; category: string }> = {
      columns: [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "category", header: "Category" },
      ],
      toolbar: {
        quickFilters: [
          { name: "Category", columnId: "category", type: "checkbox-list" },
          { name: "Category 2", columnId: "category", type: "checkbox-list" },
        ],
      },
    }
    expect(() => validateConfig(config)).toThrow(
      'toolbar.quickFilters has duplicate columnId "category"'
    )
  })

  it("does not throw for valid quickFilters config", () => {
    const config: DataTableConfig<{ name: string; category: string; price: number }> = {
      columns: [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "category", header: "Category" },
        { accessorKey: "price", header: "Price" },
      ],
      toolbar: {
        quickFilters: [
          { name: "Category", columnId: "category", type: "checkbox-list" },
          { name: "Price", columnId: "price", type: "interval-slider" },
        ],
      },
    }
    expect(() => validateConfig(config)).not.toThrow()
  })

  it("throws when serverSide has no callbacks", () => {
    const config: DataTableConfig<{ name: string }> = {
      columns: [{ accessorKey: "name", header: "Name" }],
      serverSide: { totalRows: 100 },
    }
    expect(() => validateConfig(config)).toThrow(
      "serverSide is set but no callbacks are provided"
    )
  })

  it("throws when serverSide.totalRows is negative", () => {
    const config: DataTableConfig<{ name: string }> = {
      columns: [{ accessorKey: "name", header: "Name" }],
      serverSide: { totalRows: -1, onPageChange: () => {} },
    }
    expect(() => validateConfig(config)).toThrow(
      "serverSide.totalRows must be a non-negative number"
    )
  })

  it("throws when serverSide checkbox filter missing options", () => {
    const config: DataTableConfig<{ name: string; category: string }> = {
      columns: [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "category", header: "Category" },
      ],
      toolbar: {
        quickFilters: [
          { name: "Category", columnId: "category", type: "checkbox-list" },
        ],
      },
      serverSide: { totalRows: 100, onFilterChange: () => {} },
    }
    expect(() => validateConfig(config)).toThrow(
      'Quick filter "Category" (checkbox-list) requires serverSide.options when serverSide mode is enabled'
    )
  })

  it("throws when serverSide slider filter missing min/max", () => {
    const config: DataTableConfig<{ name: string; price: number }> = {
      columns: [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "price", header: "Price" },
      ],
      toolbar: {
        quickFilters: [
          { name: "Price", columnId: "price", type: "interval-slider" },
        ],
      },
      serverSide: { totalRows: 100, onFilterChange: () => {} },
    }
    expect(() => validateConfig(config)).toThrow(
      'Quick filter "Price" (interval-slider) requires serverSide.min and serverSide.max when serverSide mode is enabled'
    )
  })

  it("does not throw for valid serverSide config", () => {
    const config: DataTableConfig<{ name: string; category: string; price: number }> = {
      columns: [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "category", header: "Category" },
        { accessorKey: "price", header: "Price" },
      ],
      toolbar: {
        quickFilters: [
          {
            name: "Category",
            columnId: "category",
            type: "checkbox-list",
            serverSide: { options: ["Rings", "Necklaces"] },
          },
          {
            name: "Price",
            columnId: "price",
            type: "interval-slider",
            serverSide: { min: 0, max: 5000 },
          },
        ],
      },
      serverSide: { totalRows: 100, onFilterChange: () => {} },
    }
    expect(() => validateConfig(config)).not.toThrow()
  })
})
