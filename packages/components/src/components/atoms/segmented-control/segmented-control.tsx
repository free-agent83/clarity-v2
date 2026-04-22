"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * SegmentedControl — single-select mode/view switcher.
 *
 * Wraps `Radix ToggleGroup.Root` with `type="single"` hard-coded.
 * Guarantees a non-empty selection by falling back to the previous
 * value if the user attempts to clear it.
 *
 * Use for mutually-exclusive UI modes (list/grid, daily/weekly).
 * Use `ToggleGroup` for toolbar-style multi-select controls.
 * Use `Tabs` for navigation between content panels.
 */
const segmentedControlVariants = cva(
  "inline-flex w-fit items-center rounded-md bg-muted p-0.5",
  {
    variants: {
      size: {
        sm: "h-8",
        default: "h-11",
        lg: "h-15",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const segmentedControlItemVariants = cva(
  [
    "relative inline-flex h-full shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[calc(var(--radius)-2px)] px-3 text-sm font-medium text-muted-foreground transition-all outline-none",
    "hover:text-accent-foreground",
    "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:z-10",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-[state=on]:bg-background data-[state=on]:text-accent-foreground data-[state=on]:shadow-xs",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      size: {
        sm: "px-2.5 text-xs",
        default: "px-3",
        lg: "px-5",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

type SegmentedControlContextValue = VariantProps<typeof segmentedControlVariants>

const SegmentedControlContext = React.createContext<SegmentedControlContextValue>({
  size: "default",
})

type SegmentedControlProps = Omit<
  React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
  "type" | "onValueChange" | "value" | "defaultValue"
> &
  VariantProps<typeof segmentedControlVariants> & {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
  }

function SegmentedControl({
  className,
  size,
  value,
  defaultValue,
  onValueChange,
  ...props
}: SegmentedControlProps) {
  // Fall back to the previous value if the user tries to clear the
  // selection — a SegmentedControl always has one active item.
  const handleValueChange = React.useCallback(
    (next: string) => {
      if (next === "") return
      onValueChange?.(next)
    },
    [onValueChange]
  )

  return (
    <SegmentedControlContext.Provider value={{ size }}>
      <ToggleGroupPrimitive.Root
        type="single"
        data-slot="segmented-control"
        data-size={size}
        value={value}
        defaultValue={defaultValue}
        onValueChange={handleValueChange}
        className={cn(segmentedControlVariants({ size }), className)}
        {...props}
      />
    </SegmentedControlContext.Provider>
  )
}

type SegmentedControlItemProps = React.ComponentProps<
  typeof ToggleGroupPrimitive.Item
>

function SegmentedControlItem({
  className,
  children,
  ...props
}: SegmentedControlItemProps) {
  const { size } = React.useContext(SegmentedControlContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="segmented-control-item"
      className={cn(segmentedControlItemVariants({ size }), className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { SegmentedControl, SegmentedControlItem, segmentedControlVariants, segmentedControlItemVariants }
export type { SegmentedControlProps, SegmentedControlItemProps }
