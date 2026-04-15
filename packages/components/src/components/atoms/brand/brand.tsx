import * as React from "react"

import { cn } from "@/lib/utils"

interface BrandProps extends React.ComponentProps<"svg"> {}

/**
 * Nivoda wordmark / brand mark.
 *
 * Renders the Nivoda logo as an inline SVG. Uses `fill="currentColor"`
 * so the mark inherits the ambient text colour — it renders correctly
 * on light and dark backgrounds without needing variant props, and
 * can be recoloured by wrapping in an element with a `text-*` class.
 *
 * Sized via standard Tailwind height utilities on `className`:
 *
 * ```tsx
 * <Brand />                 // 24px tall (default)
 * <Brand className="h-10" /> // 40px tall
 * <Brand className="h-16" /> // 64px tall
 * ```
 *
 * Width scales automatically with the viewBox's aspect ratio (the
 * default `w-auto` keeps the mark proportional).
 *
 * Defaults `role="img"` and `aria-label="Nivoda"` so assistive
 * technology announces the mark. When the brand sits next to a
 * visible "Nivoda" wordmark, pass `aria-hidden` to mark it
 * decorative and avoid duplicate announcements.
 */
function Brand({ className, ...props }: BrandProps) {
  return (
    <svg
      data-slot="brand"
      viewBox="0 0 461 226"
      role="img"
      aria-label="Nivoda"
      fill="currentColor"
      className={cn("h-6 w-auto", className)}
      {...props}
    >
      <path d="M0.634766 9.0957L119.074 219.723L237.168 9.0957H0.634766Z" />
      <path d="M348.115 0.291504C286.031 0.291504 235.698 50.6193 235.698 112.708C235.698 174.792 286.031 225.125 348.115 225.125C410.198 225.125 460.531 174.792 460.531 112.708C460.531 50.6193 410.198 0.291504 348.115 0.291504Z" />
    </svg>
  )
}

export { Brand }
export type { BrandProps }
