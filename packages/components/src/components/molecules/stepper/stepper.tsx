"use client"

import * as React from "react"
import { IconAlertCircle, IconCheck } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

type StepperState = "upcoming" | "current" | "completed" | "error"

type StepperContextValue = {
  activeStep: number
  errorSteps: ReadonlyArray<number>
  stepCount: number
  onStepClick?: (index: number) => void
}

const StepperContext = React.createContext<StepperContextValue | null>(null)

function useStepperContext(): StepperContextValue {
  const ctx = React.useContext(StepperContext)
  if (!ctx) {
    throw new Error("Stepper sub-components must be rendered inside <Stepper>.")
  }
  return ctx
}

const StepperItemIndexContext = React.createContext<number | null>(null)

function useStepperItemIndex(): number {
  const index = React.useContext(StepperItemIndexContext)
  if (index === null) {
    throw new Error(
      "StepperItemIndicator and StepperItemLabel must be rendered inside <StepperItem>."
    )
  }
  return index
}

function getStepState(
  index: number,
  activeStep: number,
  errorSteps: ReadonlyArray<number>
): StepperState {
  if (errorSteps.includes(index)) return "error"
  if (index < activeStep) return "completed"
  if (index === activeStep) return "current"
  return "upcoming"
}

type StepperProps = React.ComponentProps<"ol"> & {
  activeStep: number
  errorSteps?: ReadonlyArray<number>
  onStepClick?: (index: number) => void
}

/**
 * Stepper — displays progress through an ordered multi-step flow.
 *
 * Controlled via `activeStep`. Pass `onStepClick` to make completed
 * and errored steps navigable; current and upcoming steps are always
 * inert. Horizontal only in v0.1.
 */
function Stepper({
  className,
  activeStep,
  errorSteps = [],
  onStepClick,
  children,
  ...props
}: StepperProps) {
  const items = React.Children.toArray(children)
  const stepCount = items.length

  return (
    <StepperContext.Provider
      value={{ activeStep, errorSteps, stepCount, onStepClick }}
    >
      <ol
        data-slot="stepper"
        className={cn("flex w-full items-start", className)}
        {...props}
      >
        {items.map((child, index) => (
          <StepperItemIndexContext.Provider key={index} value={index}>
            {child}
          </StepperItemIndexContext.Provider>
        ))}
      </ol>
    </StepperContext.Provider>
  )
}

type StepperItemProps = React.ComponentProps<"li">

function StepperItem({ className, children, ...props }: StepperItemProps) {
  const { activeStep, errorSteps, stepCount, onStepClick } = useStepperContext()
  const index = useStepperItemIndex()
  const state = getStepState(index, activeStep, errorSteps)
  const isLast = index === stepCount - 1

  const isClickable =
    Boolean(onStepClick) && (state === "completed" || state === "error")

  const handleClick = () => {
    if (isClickable) onStepClick?.(index)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLLIElement>) => {
    if (!isClickable) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onStepClick?.(index)
    }
  }

  return (
    <li
      data-slot="stepper-item"
      data-state={state}
      data-clickable={isClickable || undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-current={state === "current" ? "step" : undefined}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex items-center gap-3 outline-none rounded-md",
        "data-clickable:cursor-pointer",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        !isLast && "flex-1",
        !isLast &&
          "after:ml-3 after:h-px after:flex-1 after:bg-border after:content-[''] data-[state=completed]:after:bg-primary",
        className
      )}
      {...props}
    >
      {children}
    </li>
  )
}

type StepperItemIndicatorProps = React.ComponentProps<"span">

function StepperItemIndicator({
  className,
  ...props
}: StepperItemIndicatorProps) {
  const { activeStep, errorSteps } = useStepperContext()
  const index = useStepperItemIndex()
  const state = getStepState(index, activeStep, errorSteps)

  const content = (() => {
    if (state === "completed") return <IconCheck className="size-4" />
    if (state === "error") return <IconAlertCircle className="size-4" />
    return <span className="text-sm font-medium">{index + 1}</span>
  })()

  return (
    <span
      data-slot="stepper-item-indicator"
      data-state={state}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors",
        state === "upcoming" && "border-border text-muted-foreground",
        state === "current" && "border-primary bg-primary text-primary-foreground",
        state === "completed" && "border-primary bg-primary text-primary-foreground",
        state === "error" && "border-destructive bg-destructive text-destructive-foreground",
        className
      )}
      {...props}
    >
      {content}
    </span>
  )
}

type StepperItemLabelProps = React.ComponentProps<"span">

function StepperItemLabel({ className, ...props }: StepperItemLabelProps) {
  const { activeStep, errorSteps } = useStepperContext()
  const index = useStepperItemIndex()
  const state = getStepState(index, activeStep, errorSteps)

  return (
    <span
      data-slot="stepper-item-label"
      data-state={state}
      className={cn(
        "text-sm font-medium",
        state === "upcoming" && "text-muted-foreground",
        state === "current" && "text-foreground",
        state === "completed" && "text-muted-foreground",
        state === "error" && "text-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Stepper, StepperItem, StepperItemIndicator, StepperItemLabel }
export type {
  StepperProps,
  StepperItemProps,
  StepperItemIndicatorProps,
  StepperItemLabelProps,
  StepperState,
}
