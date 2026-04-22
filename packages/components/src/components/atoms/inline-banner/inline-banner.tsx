import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { IconX } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

/**
 * InlineBanner — block-level, page-level callout.
 *
 * Use under a page heading to surface persistent page-level
 * information or promotional content. Distinct from `Alert`
 * (which uses tinted backgrounds for section-level messages):
 * InlineBanner uses solid semantic fills to declare itself
 * boldly within the page content.
 */
const inlineBannerVariants = cva(
  [
    "relative grid w-full items-center rounded-lg",
    "grid-cols-[auto_1fr_auto]",
    "[grid-template-areas:'icon_title_actions'_'icon_description_actions']",
    "[&>svg]:[grid-area:icon] [&>svg]:my-auto",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        success: "bg-success text-success-foreground",
        info: "bg-info text-info-foreground",
        warning: "bg-warning text-warning-foreground",
        destructive: "bg-destructive text-destructive-foreground",
      },
      size: {
        default: "gap-x-3 px-4 py-3 [&>svg]:size-5",
        lg: "gap-x-4 px-6 py-4 [&>svg]:size-8",
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
          className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-md text-current/80 outline-none transition-colors hover:bg-current/10 hover:text-current focus-visible:ring-3 focus-visible:ring-ring/50"
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
        "[grid-area:title] font-heading font-medium",
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
        "[grid-area:description] text-sm text-current/80 [&_a]:underline [&_a]:underline-offset-3",
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
        "[grid-area:actions] flex shrink-0 items-center gap-2 self-center justify-self-end",
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
  inlineBannerVariants,
}
export type { InlineBannerProps }
