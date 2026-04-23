"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { IconX } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

/**
 * PageBanner — full-bleed stripe above the application nav.
 *
 * Solid-filled stripe for product-wide callouts (new features,
 * promotions, downtime, holidays). Rendered above `AppShellHeader`
 * via the `banner` prop on `AppShell` — never placed anywhere else
 * in the page hierarchy.
 */
const pageBannerVariants = cva(
  [
    "relative flex h-11 w-full items-center justify-center gap-2 px-10 text-sm",
    "[&>svg]:size-4 [&>svg]:shrink-0",
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
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type PageBannerProps = React.ComponentProps<"div"> &
  VariantProps<typeof pageBannerVariants> & {
    onDismiss?: () => void
  }

function PageBanner({
  className,
  variant,
  onDismiss,
  children,
  ...props
}: PageBannerProps) {
  return (
    <div
      data-slot="page-banner"
      data-variant={variant}
      role="status"
      className={cn(pageBannerVariants({ variant }), className)}
      {...props}
    >
      {children}
      {onDismiss ? (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          data-slot="page-banner-dismiss"
          className="absolute top-1/2 right-3 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-current/80 outline-none transition-colors hover:bg-foreground/10 hover:text-current focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <IconX className="size-4" />
        </button>
      ) : null}
    </div>
  )
}

function PageBannerTitle({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="page-banner-title"
      className={cn("truncate font-medium", className)}
      {...props}
    />
  )
}

function PageBannerAction({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="page-banner-action"
      className={cn("ml-2 inline-flex shrink-0 items-center", className)}
      {...props}
    />
  )
}

export { PageBanner, PageBannerTitle, PageBannerAction, pageBannerVariants }
export type { PageBannerProps }
