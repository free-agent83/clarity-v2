"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import {
  IconCheck,
  IconCheckFilled,
  IconCopy,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "../../../atoms/badge/badge";
import { Button } from "../../../atoms/button/button";
import { Checkbox } from "../../../atoms/checkbox/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../../atoms/hover-card/hover-card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../atoms/tooltip/tooltip";
import {
  TableCell,
  TableHead,
  TableRow,
} from "../../../organisms/table/table";

// ── Helpers ───────────────────────────────────────────────

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ── Structural primitives ─────────────────────────────────

/**
 * A single data row in the PLP list view. Provides row-level presentation
 * (hover, click, selected, disabled) and a `group/plp-row` scope so
 * descendant primitives (e.g. `PlpListRowActions`) can reveal on hover.
 *
 * When `onSelectedChange` is provided the row prepends a selection
 * checkbox cell automatically; consumers only compose the remaining
 * data cells.
 */
export function PlpListBodyRow({
  children,
  selected = false,
  onSelectedChange,
  selectLabel = "Select row",
  disabled = false,
  onClick,
  className,
}: {
  children: ReactNode;
  selected?: boolean;
  onSelectedChange?: (next: boolean) => void;
  selectLabel?: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const clickable = !!onClick && !disabled;

  function handleKeyDown(e: React.KeyboardEvent<HTMLTableRowElement>) {
    if (!clickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  }

  return (
    <TableRow
      data-slot="plp-list-body-row"
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      role={clickable ? "link" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      className={cn(
        "group/plp-row hover:bg-transparent",
        clickable &&
        "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        disabled && "pointer-events-none opacity-40",
        className
      )}
    >
      {onSelectedChange && (
        <PlpListBodyCell hug onClick={(e) => e.stopPropagation()}>
          <div className="pl-1 pr-2">
            <Checkbox
              checked={selected}
              disabled={disabled}
              onCheckedChange={(v) => onSelectedChange(v === true)}
              aria-label={selectLabel}
            />
          </div>
        </PlpListBodyCell>
      )}
      {children}
    </TableRow>
  );
}

/**
 * Header row wrapper. Sticky positioning is applied by the template's
 * `<thead>`; this component just provides row-level styling.
 */
export function PlpListHeaderRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <TableRow
      data-slot="plp-list-header-row"
      className={cn("bg-muted text-xs hover:bg-muted", className)}
    >
      {children}
    </TableRow>
  );
}

/**
 * Thin preset over the shadcn `TableCell`. Pass `sticky="right"` to
 * pin the cell to the right edge during horizontal overflow. Pass
 * `hug` to shrink the column to the width of its content (useful for
 * icon-only columns like select checkboxes or thumbnails).
 */
export function PlpListBodyCell({
  children,
  className,
  sticky,
  hug,
  ...props
}: ComponentProps<typeof TableCell> & { sticky?: "right"; hug?: boolean }) {
  return (
    <TableCell
      data-slot="plp-list-body-cell"
      className={cn(
        "text-xs group-hover/plp-row:bg-muted/50 group-data-selected/plp-row:bg-accent/40",
        // Sticky cells need an opaque bg so scrolled content can't
        // bleed through. The alpha tints above are replaced with
        // `color-mix` blends that visually match over the background.
        sticky === "right" &&
          "sticky right-0 bg-background group-hover/plp-row:bg-[color-mix(in_oklch,var(--muted)_50%,var(--background))] group-data-selected/plp-row:bg-[color-mix(in_oklch,var(--accent)_40%,var(--background))]",
        hug && "w-px whitespace-nowrap",
        className
      )}
      {...props}
    >
      {children}
    </TableCell>
  );
}

/**
 * Thin preset over the shadcn `TableHead`. Pass `sticky="right"` to
 * pin the cell to the right edge during horizontal overflow. Pass
 * `hug` to shrink the column to the width of its content (useful for
 * icon-only columns like select checkboxes or thumbnails).
 */
export function PlpListHeaderCell({
  children,
  className,
  sticky,
  hug,
  ...props
}: ComponentProps<typeof TableHead> & { sticky?: "right"; hug?: boolean }) {
  return (
    <TableHead
      data-slot="plp-list-header-cell"
      className={cn(
        sticky === "right" && "sticky right-0 bg-muted",
        hug && "w-px whitespace-nowrap",
        className
      )}
      {...props}
    >
      {children}
    </TableHead>
  );
}

// ── Content primitives ────────────────────────────────────

/**
 * Compact thumbnail for a list row. Fixed square default; override size
 * via `className` if a category wants something different.
 */
export function PlpListRowMedia({
  image,
  imageAlt,
  className,
}: {
  image: string;
  imageAlt: string;
  className?: string;
}) {
  return (
    <div
      data-slot="plp-list-row-media"
      className={cn(
        "h-10 w-10 overflow-hidden rounded-md border border-border bg-muted",
        className
      )}
    >
      <img
        src={image}
        alt={imageAlt}
        loading="lazy"
        className="h-full w-full object-contain"
      />
    </div>
  );
}

/**
 * Delivery indicator for list rows. The `express` variant colors the
 * date in the express accent; the regular variant uses body text.
 * Optional `origin` renders inline before the date — typically a
 * flag emoji indicating country of origin.
 */
export function PlpListRowDelivery({
  variant,
  date,
  origin,
}: {
  variant: "express" | "regular";
  date: ReactNode;
  origin?: ReactNode;
}) {
  const isExpress = variant === "express";
  return (
    <div
      data-slot="plp-list-row-delivery"
      className={cn(
        "flex items-center gap-1.5 font-medium",
        isExpress && "text-express"
      )}
    >
      {origin && <span className="text-lg">{origin}</span>}
      <span>{date}</span>
    </div>
  );
}

/**
 * Returns indicator for list rows. Icon-only in the dense table cell;
 * the tooltip exposes the full label for hover and keyboard users.
 */
export function PlpListRowReturnable({
  variant,
}: {
  variant: "returnable" | "non-returnable";
}) {
  const isReturnable = variant === "returnable";
  const Icon = isReturnable ? IconCheckFilled : IconX;
  const label = isReturnable ? "Returnable" : "Non-returnable";
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            data-slot="plp-list-row-returnable"
            role="img"
            aria-label={label}
            tabIndex={0}
            className="inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon
              className={cn(
                "size-4",
                isReturnable ? "text-success" : "text-muted-foreground/50"
              )}
              aria-hidden="true"
            />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Certificate indicator for list rows. The badge shows the grading lab
 * (e.g. "GIA"); hover reveals the full certificate number with a copy
 * button so consumers can pull the ID into another tool without
 * navigating away.
 */
export function PlpListRowCert({
  lab,
  number,
}: {
  lab: string;
  number: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(number).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="font-mono underline decoration-dotted">{lab}</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <div className="text-xs text-muted-foreground">
              {lab} certificate
            </div>
            <span className="font-mono text-sm">{number}</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={copied ? "Copied" : "Copy certificate number"}
            onClick={handleCopy}
          >
            {copied ? (
              <IconCheck className="size-4" />
            ) : (
              <IconCopy className="size-4" />
            )}
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

/**
 * Price for list rows. Fat component — renders every supported pricing
 * variant when its prop is provided. Tuned for cell density: discount
 * is inline with a percent label, tariff note is a plain caption line
 * (no hover card). Per-carat rate lives in its own column via
 * `PlpListRowPricePerCarat`.
 */
export function PlpListRowPrice({
  amount,
  currency,
  discount,
  includeTariffs = false,
  legacyDelivered,
  alternateCurrency,
}: {
  amount: number;
  currency: string;
  discount?: { percentage: number; originalAmount: number };
  includeTariffs?: boolean;
  legacyDelivered?: { amount: number; currency: string };
  alternateCurrency?: { amount: number; currency: string };
}) {
  return (
    <div data-slot="plp-list-row-price" className="flex flex-col gap-0.5 text-end">
      {discount && (
        <div className="flex justify-end gap-1 text-[0.65rem]">
          <span className="font-medium text-info">
            -{discount.percentage}%
          </span>
          <span className="text-muted-foreground line-through">
            {formatCurrency(discount.originalAmount, currency)}
          </span>
        </div>
      )}
      <div className="font-medium">
        {formatCurrency(amount, currency)}
      </div>
      {includeTariffs && (
        <div className="text-muted-foreground">Incl. US tariffs</div>
      )}
      {legacyDelivered && (
        <div className="text-muted-foreground">
          Delivered:{" "}
          {formatCurrency(legacyDelivered.amount, legacyDelivered.currency)}
        </div>
      )}
      {alternateCurrency && (
        <div className="text-muted-foreground text-[0.65rem]">
          ~{formatCurrency(alternateCurrency.amount, alternateCurrency.currency)}
        </div>
      )}
    </div>
  );
}

/**
 * Per-carat rate for list rows. Sits in its own column next to the
 * main price column.
 */
export function PlpListRowPricePerCarat({
  amount,
  currency,
}: {
  amount: number;
  currency: string;
}) {
  return (
    <p data-slot="plp-list-row-price-per-carat" className="text-end">
      {formatCurrency(amount, currency)}/ct
    </p>
  );
}

/**
 * Right-aligned flex container for row actions. Always visible;
 * consumers compose the actual buttons/menus inside. Sticky
 * positioning (to keep the actions column in view during horizontal
 * overflow) lives on the wrapping `PlpListBodyCell`, not here.
 */
export function PlpListRowActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="plp-list-row-actions"
      className={cn("flex items-center justify-end gap-2 pr-2", className)}
    >
      {children}
    </div>
  );
}

