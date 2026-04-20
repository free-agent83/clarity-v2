"use client";

import { cn } from "@/lib/utils";
import { Badge } from "../../../atoms/badge/badge";
import { TableCell, TableRow } from "../../../organisms/table/table";
import { usePlpUserContext } from "../context/plp-user-context";
import type { GridItemData, ListColumn, PlpUserContextValue } from "../plp-types";
import { PlpListActionsCell } from "./plp-list-actions-cell";

/**
 * Formats a number as a currency string using the en-US locale.
 */
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Renders the main Price cell with all pricing variants from data + user context.
 */
function PriceCell({
  pricing,
  userContext,
}: {
  pricing: GridItemData["pricing"];
  userContext: PlpUserContextValue;
}) {
  const showTariffs =
    pricing.includeTariffs && userContext.location === "US";
  const showLegacy =
    !!pricing.legacyDeliveredPrice && userContext.pricingModel === "legacy";
  const showMultiCurrency = userContext.currency !== pricing.currency;

  return (
    <div className="flex flex-col gap-0.5">
      {pricing.discount && (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-medium text-success">
            {pricing.discount.percentage}% below
          </span>
          <span className="text-muted-foreground line-through">
            {formatCurrency(pricing.discount.originalAmount, pricing.currency)}
          </span>
        </div>
      )}
      <div className="text-sm font-semibold text-foreground">
        {formatCurrency(pricing.amount, pricing.currency)}
      </div>
      {showTariffs && (
        <div className="text-xs text-muted-foreground">Incl. US tariffs</div>
      )}
      {showLegacy && pricing.legacyDeliveredPrice && (
        <div className="text-xs text-muted-foreground">
          Delivered:{" "}
          {formatCurrency(
            pricing.legacyDeliveredPrice.amount,
            pricing.legacyDeliveredPrice.currency
          )}
        </div>
      )}
      {showMultiCurrency && (
        <div className="text-xs text-muted-foreground">
          ~{formatCurrency(pricing.amount, userContext.currency)}
        </div>
      )}
    </div>
  );
}

/**
 * A single row in the PLP list view.
 *
 * Renders fixed core cells (thumbnail, name+lead, delivery, returns, price,
 * price/ct, actions) around the category-configured middle columns.
 * Invokes each category column's `cell` function with the raw item.
 *
 * The row itself is clickable (opens item detail via `onItemClick`), with
 * interactive cells stopping propagation so their own click handlers fire.
 */
export function PlpListRow<TItem>({
  item,
  data,
  listColumns,
  showPricePerCarat,
  onItemClick,
}: {
  item: TItem;
  data: GridItemData;
  listColumns: ListColumn<TItem>[];
  showPricePerCarat: boolean;
  onItemClick?: (item: TItem) => void;
}) {
  const userContext = usePlpUserContext();

  const clickable = !!onItemClick;

  function handleRowClick() {
    onItemClick?.(item);
  }

  function handleRowKeyDown(e: React.KeyboardEvent<HTMLTableRowElement>) {
    if (!clickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onItemClick?.(item);
    }
  }

  return (
    <TableRow
      className={cn(
        "group/plp-row [&>td]:py-4 [&>td:first-child]:pl-4 [&>td:last-child]:pr-4",
        clickable && "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      role={clickable ? "link" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? handleRowClick : undefined}
      onKeyDown={clickable ? handleRowKeyDown : undefined}
    >
      {/* Thumbnail */}
      <TableCell>
        <div className="h-12 w-12 overflow-hidden rounded-md border border-border bg-muted">
          <img
            src={data.thumbnailSrc}
            alt={data.thumbnailAlt}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        </div>
      </TableCell>

      {/* Name + lead */}
      <TableCell>
        <div className="flex flex-col gap-0.5">
          <div className="text-sm font-medium text-foreground">{data.name}</div>
          {data.lead && (
            <div className="text-xs text-muted-foreground">{data.lead}</div>
          )}
        </div>
      </TableCell>

      {/* Category-configured columns */}
      {listColumns.map((column) => (
        <TableCell
          key={column.id}
          style={{
            textAlign: column.align ?? "left",
            width:
              typeof column.width === "number"
                ? `${column.width}px`
                : column.width,
          }}
        >
          {column.cell(item)}
        </TableCell>
      ))}

      {/* Delivery */}
      <TableCell>
        <div className="flex flex-col gap-0.5 text-xs">
          <div className="flex items-center gap-1">
            {data.delivery.isExpress && (
              <Badge variant="success" size="sm">
                Express
              </Badge>
            )}
            <span className="text-foreground">{data.delivery.estimatedDate}</span>
          </div>
          <div className="text-muted-foreground">
            from {data.delivery.shipsFrom}
          </div>
        </div>
      </TableCell>

      {/* Returns */}
      <TableCell>
        {data.returns.isReturnable ? (
          <span className="text-xs text-success">Returnable</span>
        ) : (
          <span className="text-xs text-destructive">Non-returnable</span>
        )}
      </TableCell>

      {/* Price */}
      <TableCell>
        <PriceCell pricing={data.pricing} userContext={userContext} />
      </TableCell>

      {/* Price/ct (conditional) */}
      {showPricePerCarat && (
        <TableCell>
          {data.pricing.perCarat ? (
            <span className="text-xs text-foreground">
              {formatCurrency(
                data.pricing.perCarat.amount,
                data.pricing.perCarat.currency
              )}
              /ct
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </TableCell>
      )}

      {/* Actions */}
      <TableCell>
        <PlpListActionsCell data={data} />
      </TableCell>
    </TableRow>
  );
}
