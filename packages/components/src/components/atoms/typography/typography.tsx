import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Typography variants.
 *
 * Variant axis = role preset (h1–h6, body1, body1Emphasis, body2, body2Emphasis, caption, captionEmphasis)
 *
 * Each variant maps 1:1 to a `text-typography-*` utility defined in globals.css,
 * which applies font-size, line-height, font-weight and letter-spacing together.
 * See globals.css → "Typography role presets".
 */
const typographyVariants = cva("font-sans", {
  variants: {
    variant: {
      h1: "text-typography-h1",
      h2: "text-typography-h2",
      h3: "text-typography-h3",
      h4: "text-typography-h4",
      h5: "text-typography-h5",
      h6: "text-typography-h6",
      body1: "text-typography-body-1",
      body1Emphasis: "text-typography-body-1-emphasis",
      body2: "text-typography-body-2",
      body2Emphasis: "text-typography-body-2-emphasis",
      caption: "text-typography-caption",
      captionEmphasis: "text-typography-caption-emphasis",
    },
  },
  defaultVariants: {
    variant: "body2",
  },
})

const defaultElementByVariant = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  body1: "p",
  body1Emphasis: "p",
  body2: "p",
  body2Emphasis: "p",
  caption: "p",
  captionEmphasis: "p",
} as const

type TypographyElement =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "div"

interface TypographyProps
  extends Omit<React.ComponentProps<"p">, "color">,
    VariantProps<typeof typographyVariants> {
  as?: TypographyElement
  asChild?: boolean
}

/**
 * Renders text at one of the design system's role presets.
 *
 * Pick the `variant` that matches the role ("is this a page title? a
 * caption under a form field?"). The component picks a sensible HTML
 * element for that role (`h1`–`h6` render their matching heading tag,
 * body and caption variants render `<p>`); pass `as` to override when
 * the visual weight shouldn't imply document structure. Pass `asChild`
 * to render via Radix Slot — e.g. to style a Next.js `<Link>` as body
 * text — in which case `as` is ignored.
 *
 * Colour is inherited from ambient context; no colour prop is provided.
 * Use `className="text-muted-foreground"` (or similar) when the
 * surrounding context doesn't already set the right colour.
 *
 * @see {@link typographyVariants} for the full variant list.
 */
function Typography({
  className,
  variant = "body2",
  as,
  asChild = false,
  ...props
}: TypographyProps) {
  const Comp = asChild
    ? Slot.Root
    : (as ?? defaultElementByVariant[variant ?? "body2"])

  return (
    <Comp
      data-slot="typography"
      data-variant={variant}
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Typography, typographyVariants }
export type { TypographyProps }
