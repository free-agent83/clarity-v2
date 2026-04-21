"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import {
  IconCheck,
  IconCircleCheckFilled,
  IconCircleX,
  IconCopy,
  IconTruckDelivery,
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
import { Typography } from "../../../atoms/typography/typography";
import { TableCell, TableRow } from "../../../organisms/table/table";
import { BrandExpress } from "@/components/atoms/brand-express/brand-express";

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
        "group/plp-row",
        clickable &&
          "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "bg-accent/40",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      {onSelectedChange && (
        <PlpListBodyCell onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={selected}
            disabled={disabled}
            onCheckedChange={(v) => onSelectedChange(v === true)}
            aria-label={selectLabel}
          />
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
    <TableRow data-slot="plp-list-header-row" className={className}>
      {children}
    </TableRow>
  );
}

/**
 * Thin passthrough over the shadcn `TableCell`. Exists as a single
 * extension point so future list-wide cell styling can land here
 * without touching every consumer.
 */
export function PlpListBodyCell(props: ComponentProps<typeof TableCell>) {
  return <TableCell data-slot="plp-list-body-cell" {...props} />;
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
        "h-12 w-12 overflow-hidden rounded-md border border-border bg-muted",
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
 * Delivery indicator for list rows. Express variant uses a Badge +
 * date; regular variant uses an icon + date. Optional `shipsFrom`
 * renders a muted secondary line.
 */
export function PlpListRowDelivery({
  variant,
  date,
  shipsFrom,
}: {
  variant: "express" | "regular";
  date: ReactNode;
  shipsFrom?: ReactNode;
}) {
  const isExpress = variant === "express";
  return (
    <div data-slot="plp-list-row-delivery" className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        {isExpress ? (
          <BrandExpress className="h-2.5" aria-label="Express delivery" />
        ) : (
          <IconTruckDelivery className="size-3.5 shrink-0" aria-hidden="true" />
        )}
        <Typography
          as="span"
          variant="caption"
          emphasis
          className={isExpress ? "text-express" : undefined}
        >
          {date}
        </Typography>
      </div>
      {shipsFrom && (
        <Typography as="div" variant="caption" className="text-muted-foreground">
          from {shipsFrom}
        </Typography>
      )}
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
  const Icon = isReturnable ? IconCircleCheckFilled : IconCircleX;
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
                isReturnable ? "text-success" : "text-muted-foreground"
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
        <span className="font-mono underline decoration-dotted text-xs">{lab}</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-auto">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <Typography as="div" variant="caption" className="text-muted-foreground">
              {lab} certificate
            </Typography>
            <Typography as="span" variant="body-2" className="font-mono">
              {number}
            </Typography>
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
 * (no hover card).
 */
export function PlpListRowPrice({
  amount,
  currency,
  perCarat,
  discount,
  includeTariffs = false,
  legacyDelivered,
  alternateCurrency,
}: {
  amount: number;
  currency: string;
  perCarat?: { amount: number; currency: string };
  discount?: { percentage: number; originalAmount: number };
  includeTariffs?: boolean;
  legacyDelivered?: { amount: number; currency: string };
  alternateCurrency?: { amount: number; currency: string };
}) {
  return (
    <div data-slot="plp-list-row-price" className="flex flex-col gap-0.5">
      {discount && (
        <div className="flex items-center gap-1.5">
          <Typography as="span" variant="caption" emphasis className="text-success">
            {discount.percentage}% below
          </Typography>
          <Typography
            as="span"
            variant="caption"
            className="text-muted-foreground line-through"
          >
            {formatCurrency(discount.originalAmount, currency)}
          </Typography>
        </div>
      )}
      <Typography as="div" variant="body-2" emphasis>
        {formatCurrency(amount, currency)}
      </Typography>
      {perCarat && (
        <Typography as="div" variant="caption" className="text-muted-foreground">
          {formatCurrency(perCarat.amount, perCarat.currency)}/ct
        </Typography>
      )}
      {includeTariffs && (
        <Typography as="div" variant="caption" className="text-muted-foreground">
          Incl. US tariffs
        </Typography>
      )}
      {legacyDelivered && (
        <Typography as="div" variant="caption" className="text-muted-foreground">
          Delivered:{" "}
          {formatCurrency(legacyDelivered.amount, legacyDelivered.currency)}
        </Typography>
      )}
      {alternateCurrency && (
        <Typography as="div" variant="caption" className="text-muted-foreground">
          ~{formatCurrency(alternateCurrency.amount, alternateCurrency.currency)}
        </Typography>
      )}
    </div>
  );
}

/**
 * Hover-reveal container for row actions. Provides the PLP hover
 * styling; consumers compose the actual buttons/menus inside.
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
      className={cn(
        "flex items-center justify-end gap-1",
        "opacity-0 transition-opacity group-hover/plp-row:opacity-100 group-has-focus-visible/plp-row:opacity-100",
        "[@media(hover:none)]:opacity-100",
        className
      )}
    >
      {children}
    </div>
  );
}

