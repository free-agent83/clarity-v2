import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { IconX } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

/**
 * InlineBanner — block-level, page-level callout.
 *
 * Hierarchically above `Alert`. Use under a page heading to surface
 * persistent page-level information or promotional content.
 *
 * Variants use the same tinted tonality as `Alert`; hierarchy over
 * `Alert` comes from size, position, and icon prominence — not from
 * background intensity.
 */
const inlineBannerVariants = cva(
  [
    "relative grid w-full items-center rounded-lg border",
    "grid-cols-[auto_1fr_auto]",
    "[&>svg]:col-start-1 [&>svg]:row-span-full [&>svg]:self-center",
  ],
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground",
        success: "border-transparent bg-success/5 text-success dark:bg-success/10",
        info: "border-transparent bg-info/5 text-info dark:bg-info/10",
        warning: "border-transparent bg-warning/5 text-warning dark:bg-warning/10",
        destructive: "border-transparent bg-destructive/5 text-destructive dark:bg-destructive/10",
      },
      size: {
        default: "gap-x-3 px-4 py-3 [&>svg]:size-5",
        lg: "gap-x-4 px-6 py-4 [&>svg]:size-8",
        xl: "gap-x-6 px-8 py-6 [&>svg]:size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type InlineBannerProps = React.ComponentProps<"div"> &
  VariantProps<typeof inlineBannerVariants> & {
    onDismiss?: () => void
  }

function InlineBanner({
  className,
  variant,
  size,
  onDismiss,
  children,
  ...props
}: InlineBannerProps) {
  return (
    <div
      data-slot="inline-banner"
      data-variant={variant}
      data-size={size}
      role="status"
      className={cn(
        inlineBannerVariants({ variant, size }),
        onDismiss && "pr-12",
        className
      )}
      {...props}
    >
      {children}
      {onDismiss ? (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          data-slot="inline-banner-dismiss"
          className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-md text-current/70 outline-none transition-colors hover:bg-foreground/5 hover:text-current focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <IconX className="size-4" />
        </button>
      ) : null}
    </div>
  )
}

function InlineBannerTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="inline-banner-title"
      className={cn(
        "col-start-2 row-start-1 font-heading font-medium",
        className
      )}
      {...props}
    />
  )
}

function InlineBannerDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="inline-banner-description"
      className={cn(
        "col-start-2 row-start-2 text-sm text-muted-foreground [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

function InlineBannerActions({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="inline-banner-actions"
      className={cn(
        "col-start-3 row-span-full flex shrink-0 items-center gap-2 self-center justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function InlineBannerMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="inline-banner-media"
      className={cn(
        "col-start-1 row-span-full flex shrink-0 items-center justify-center self-center [&>img]:max-h-40 [&>img]:max-w-40 [&>svg]:size-10",
        className
      )}
      {...props}
    />
  )
}

export {
  InlineBanner,
  InlineBannerTitle,
  InlineBannerDescription,
  InlineBannerActions,
  InlineBannerMedia,
  inlineBannerVariants,
}
export type { InlineBannerProps }
