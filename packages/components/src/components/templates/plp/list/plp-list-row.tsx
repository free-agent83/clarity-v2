"use client";

import { type ReactNode } from "react";
import { IconTruckDelivery } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "../../../atoms/badge/badge";
import { Checkbox } from "../../../atoms/checkbox/checkbox";
import { Typography } from "../../../atoms/typography/typography";
import {
  TableCell,
  TableHead,
  TableRow,
} from "../../../organisms/table/table";
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

type CellAlign = "left" | "right" | "center";

// ── Structural primitives ─────────────────────────────────

/**
 * A single data row in the PLP list view. Provides row-level presentation
 * (hover, click, selected, disabled) and a `group/plp-row` scope so
 * descendant primitives (e.g. `PlpListRowActions`) can reveal on hover.
 *
 * Purely presentational — no business logic, no data binding. Consumers
 * compose cells inside from `PlpListCell` and the row content primitives.
 */
export function PlpListRow({
  children,
  selected = false,
  disabled = false,
  onClick,
  className,
}: {
  children: ReactNode;
  selected?: boolean;
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
      data-slot="plp-list-row"
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      role={clickable ? "link" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable ? handleKeyDown : undefined}
      className={cn(
        "group/plp-row [&>td]:py-4 [&>td:first-child]:pl-4 [&>td:last-child]:pr-4",
        clickable &&
          "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "bg-accent/40",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      {children}
    </TableRow>
  );
}

/**
 * Standard data cell. Thin wrapper around the shadcn TableCell with
 * PLP-consistent alignment and width props.
 */
export function PlpListCell({
  children,
  align = "left",
  width,
  className,
}: {
  children: ReactNode;
  align?: CellAlign;
  width?: number | string;
  className?: string;
}) {
  return (
    <TableCell
      data-slot="plp-list-cell"
      style={{
        textAlign: align,
        width: typeof width === "number" ? `${width}px` : width,
      }}
      className={className}
    >
      {children}
    </TableCell>
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
      className={cn("[&>th]:px-4", className)}
    >
      {children}
    </TableRow>
  );
}

/**
 * Header cell. Alignment and width props match `PlpListCell` so column
 * headers align with the data cells beneath them.
 */
export function PlpListHeaderCell({
  children,
  align = "left",
  width,
  className,
}: {
  children: ReactNode;
  align?: CellAlign;
  width?: number | string;
  className?: string;
}) {
  return (
    <TableHead
      data-slot="plp-list-header-cell"
      style={{
        textAlign: align,
        width: typeof width === "number" ? `${width}px` : width,
      }}
      className={className}
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
 * Product name styled for dense table rows. Single-line body-2
 * emphasis; consumers add lead/caption lines below using Typography if
 * needed.
 */
export function PlpListRowName({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Typography
      as="div"
      variant="body-2"
      emphasis
      data-slot="plp-list-row-name"
      className={cn("line-clamp-1", className)}
    >
      {children}
    </Typography>
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
 * Returns indicator for list rows. Shorter copy than the grid variant
 * since table cells are dense.
 */
export function PlpListRowReturnable({
  variant,
}: {
  variant: "returnable" | "non-returnable";
}) {
  return variant === "returnable" ? (
    <Badge variant="success" size="sm" data-slot="plp-list-row-returnable">
      Returnable
    </Badge>
  ) : (
    <Badge variant="outline" size="sm" data-slot="plp-list-row-returnable">
      Non-returnable
    </Badge>
  );
}

/**
 * Price for list rows. Fat component — renders every supported pricing
 * variant when its prop is provided. Tuned for cell density: discount
 * is inline with a percent label, tariff note is a plain caption line
 * (no hover card), per-carat lives in its own column via
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
 * Per-carat rate for list rows. Typically lives in its own column.
 */
export function PlpListRowPricePerCarat({
  amount,
  currency,
}: {
  amount: number;
  currency: string;
}) {
  return (
    <Typography
      as="span"
      variant="caption"
      data-slot="plp-list-row-price-per-carat"
    >
      {formatCurrency(amount, currency)}/ct
    </Typography>
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

/**
 * Selection checkbox for list rows. Presentational — consumer owns
 * the `checked` state and `onChange` handler.
 */
export function PlpListRowCheckbox({
  checked,
  onChange,
  label = "Select item",
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}) {
  return (
    <div
      data-slot="plp-list-row-checkbox"
      onClick={(e) => e.stopPropagation()}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={(v) => onChange(v === true)}
        aria-label={label}
      />
    </div>
  );
}
