import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Typography variants.
 *
 * Variant axis = role preset (h1–h6, subtitle-1, subtitle-2, body-1, body-2, caption).
 * Orthogonal `emphasis` axis bumps font-weight on body-1, body-2, and caption
 * (a no-op on variants whose weight is fixed by spec).
 *
 * Each variant composes stock Tailwind utilities (font-size, font-weight,
 * line-height, letter-spacing) so consumer-supplied `className` overrides
 * merge correctly through `tailwind-merge`. Sizes target the DSW Web
 * Components Figma spec, collapsed to the closest stock utility.
 */
const typographyVariants = cva("font-sans", {
  variants: {
    variant: {
      h1: "text-8xl font-light leading-28 tracking-tight",
      h2: "text-6xl font-light leading-18",
      h3: "text-5xl font-medium leading-14",
      h4: "text-4xl font-medium leading-11",
      h5: "text-2xl font-medium leading-8",
      h6: "text-xl font-medium leading-8",
      "subtitle-1": "text-base font-normal leading-7",
      "subtitle-2": "text-sm font-medium leading-5",
      "body-1": "text-base font-normal leading-6",
      "body-2": "text-sm font-normal leading-5",
      caption: "text-xs font-normal leading-5 tracking-wide",
    },
    emphasis: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    { variant: "body-1", emphasis: true, className: "font-medium" },
    { variant: "body-2", emphasis: true, className: "font-medium" },
    { variant: "caption", emphasis: true, className: "font-medium" },
  ],
  defaultVariants: {
    variant: "body-2",
    emphasis: false,
  },
})

const defaultElementByVariant = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  "subtitle-1": "h6",
  "subtitle-2": "h6",
  "body-1": "p",
  "body-2": "p",
  caption: "p",
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
 * subtitles render `<h6>`, body and caption variants render `<p>`);
 * pass `as` to override when
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
  variant = "body-2",
  emphasis = false,
  as,
  asChild = false,
  ...props
}: TypographyProps) {
  const Comp = asChild
    ? Slot.Root
    : (as ?? defaultElementByVariant[variant ?? "body-2"])

  return (
    <Comp
      data-slot="typography"
      data-variant={variant}
      data-emphasis={emphasis || undefined}
      className={cn(typographyVariants({ variant, emphasis }), className)}
      {...props}
    />
  )
}

export { Typography, typographyVariants }
export type { TypographyProps }
