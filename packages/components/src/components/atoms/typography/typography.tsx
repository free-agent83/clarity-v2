import * as React from "react"

import { cn } from "@/lib/utils"

const variantMap: Record<string, { tag: string; className: string }> = {
  h1: {
    tag: "h1",
    className:
      "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
  },
  h2: {
    tag: "h2",
    className: "scroll-m-20 text-3xl font-semibold tracking-tight",
  },
  h3: {
    tag: "h3",
    className: "scroll-m-20 text-2xl font-semibold tracking-tight",
  },
  h4: {
    tag: "h4",
    className: "scroll-m-20 text-xl font-semibold tracking-tight",
  },
  p: { tag: "p", className: "leading-7" },
  lead: { tag: "p", className: "text-xl text-muted-foreground" },
  large: { tag: "p", className: "text-lg font-semibold" },
  small: { tag: "p", className: "text-sm font-medium leading-none" },
  muted: { tag: "p", className: "text-sm text-muted-foreground" },
}

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "p"
    | "lead"
    | "large"
    | "small"
    | "muted"
}

/**
 * Semantic typography component for rendering text with consistent styling.
 *
 * Maps variant names to the appropriate HTML tag and Tailwind classes.
 * Use instead of raw heading/paragraph tags to ensure design-system
 * typography is applied automatically.
 */
const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = "p", children, ...props }, ref) => {
    const { tag, className: variantClassName } = variantMap[variant]
    return React.createElement(
      tag,
      { ref, className: cn(variantClassName, className), ...props },
      children
    )
  }
)
Typography.displayName = "Typography"

export { Typography }
