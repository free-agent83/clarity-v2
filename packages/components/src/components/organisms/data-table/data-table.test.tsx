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
})
