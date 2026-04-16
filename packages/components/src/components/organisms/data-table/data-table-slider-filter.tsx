import { Slider } from "@/components/atoms/slider/slider"

interface DataTableSliderFilterProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  formatValue?: (value: number) => string
}

/**
 * Range slider for filtering a column by numeric interval.
 *
 * Stateless — receives value and onChange from parent. Renders the
 * library `Slider` with dual thumbs and a formatted range label below.
 *
 * Internal component — never used standalone.
 */
function DataTableSliderFilter({
  min,
  max,
  value,
  onChange,
  formatValue,
}: DataTableSliderFilterProps) {
  const fmt = formatValue ?? String

  return (
    <div data-slot="data-table-slider-filter" className="flex flex-col gap-3">
      <Slider
        min={min}
        max={max}
        value={value}
        onValueChange={(v) => onChange(v as [number, number])}
      />
      <p className="text-sm text-muted-foreground">
        {fmt(value[0])} – {fmt(value[1])}
      </p>
    </div>
  )
}

export { DataTableSliderFilter }
export type { DataTableSliderFilterProps }
