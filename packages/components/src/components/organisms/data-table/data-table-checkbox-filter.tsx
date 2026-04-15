import { useId } from "react"
import { Checkbox } from "@/components/atoms/checkbox/checkbox"
import { Label } from "@/components/atoms/label/label"

interface DataTableCheckboxFilterProps {
  options: string[]
  value: Set<string>
  onChange: (value: Set<string>) => void
}

/**
 * Checkbox list for filtering a column by discrete string values.
 *
 * Stateless — receives value and onChange from parent. Renders one
 * `Checkbox` + `Label` row per option. Options should be pre-sorted.
 *
 * Internal component — never used standalone.
 */
function DataTableCheckboxFilter({
  options,
  value,
  onChange,
}: DataTableCheckboxFilterProps) {
  const instanceId = useId()

  const handleToggle = (option: string, checked: boolean) => {
    const next = new Set(value)
    if (checked) {
      next.add(option)
    } else {
      next.delete(option)
    }
    onChange(next)
  }

  return (
    <div
      data-slot="data-table-checkbox-filter"
      className="flex flex-col gap-2"
    >
      {options.map((option) => (
        <div key={option} className="flex items-center gap-2">
          <Checkbox
            id={`${instanceId}-${option}`}
            checked={value.has(option)}
            onCheckedChange={(checked) =>
              handleToggle(option, checked === true)
            }
          />
          <Label htmlFor={`${instanceId}-${option}`}>{option}</Label>
        </div>
      ))}
    </div>
  )
}

export { DataTableCheckboxFilter }
export type { DataTableCheckboxFilterProps }
