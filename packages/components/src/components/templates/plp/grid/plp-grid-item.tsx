"use client";

import { cn } from "@/lib/utils";
import { Badge } from "../../../atoms/badge/badge";
import { Button } from "../../../atoms/button/button";
import { usePlpUserContext } from "../context/plp-user-context";
import type { GridItemData } from "../plp-types";
import { PlpGridThumbnail } from "./plp-grid-thumbnail";

/**
 * Formats a number as a currency string.
 * Uses the user's locale for formatting conventions.
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
 * Individual PLP grid item card.
 *
 * Renders all 10 fixed sections in spec order. Handles pricing variant
 * rendering based on item data and user context. The thumbnail block
 * (including hover action toolbar, optional 360 media, and selection
 * checkbox) is delegated to `PlpGridThumbnail`.
 *
 * This component is internal to the PLP template — not exported from
 * the package barrel.
 */
export function PlpGridItem({ data }: { data: GridItemData }) {
  const userContext = usePlpUserContext();

  return (
    <article
      className="group relative flex flex-col"
      data-slot="plp-grid-item"
    >
      {/* 1. Thumbnail */}
      <PlpGridThumbnail data={data} />

      {/* 2. Name */}
      <h3 className="mt-2 text-sm font-semibold text-foreground line-clamp-2">
        {data.name}
      </h3>

      {/* 3. Lead (optional slot) */}
      {data.lead && (
        <div className="mt-0.5 text-xs text-muted-foreground">{data.lead}</div>
      )}

      {/* 4. Badges (optional) */}
      {data.badges && data.badges.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">{data.badges}</div>
      )}

      {/* 5. Category slot top (optional) */}
      {data.categorySlotTop && (
        <div className="mt-1.5">{data.categorySlotTop}</div>
      )}

      {/* 6. Delivery */}
      <div className="mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          {data.delivery.isExpress && (
            <Badge variant="success" size="sm">
              Express
            </Badge>
          )}
          <span>
            Get it{" "}
            <span className="font-medium text-foreground">
              {data.delivery.estimatedDate}
            </span>
          </span>
        </div>
        <div>
          Ships from{" "}
          <span className="font-medium text-foreground">
            {data.delivery.shipsFrom}
          </span>
        </div>
      </div>

      {/* 7. Returns */}
      <div className="mt-1 text-xs text-muted-foreground">
        {data.returns.isReturnable ? (
          <span className="text-success">
            Returnable — Fair use policy applies
          </span>
        ) : (
          <span className="text-destructive">Non-returnable</span>
        )}
      </div>

      {/* 8. Pricing */}
      <PlpGridItemPricing pricing={data.pricing} userContext={userContext} />

      {/* 9. Category slot bottom (optional) */}
      {data.categorySlotBottom && (
        <div className="mt-1.5">{data.categorySlotBottom}</div>
      )}

      {/* 10. Primary action — hover-revealed on desktop, always visible on touch */}
      <div
        className={cn(
          "mt-3 invisible opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100",
          "[@media(hover:none)]:visible [@media(hover:none)]:opacity-100"
        )}
      >
        <Button
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            data.onAddToCart();
          }}
        >
          Add to cart
        </Button>
      </div>
    </article>
  );
}

/**
 * Renders pricing variants based on item data and user context.
 *
 * Handles: tariff labels, discount (struck-through + percentage),
 * legacy two-line pricing, per-carat secondary line, multi-currency display.
 */
function PlpGridItemPricing({
  pricing,
  userContext,
}: {
  pricing: GridItemData["pricing"];
  userContext: { currency: string; location: string; pricingModel: string };
}) {
  const showTariffs = pricing.includeTariffs && userContext.location === "US";
  const showLegacy =
    pricing.legacyDeliveredPrice && userContext.pricingModel === "legacy";
  const showMultiCurrency = userContext.currency !== pricing.currency;

  return (
    <div className="mt-2 space-y-0.5">
      {/* Tariff label */}
      {showTariffs && (
        <div className="text-xs text-muted-foreground">
          Stone price{" "}
          <span className="underline decoration-dotted">
            including US tariffs
          </span>
        </div>
      )}

      {/* Discount line */}
      {pricing.discount && (
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-success">
            {pricing.discount.percentage}% below
          </span>
          <span className="text-muted-foreground line-through">
            {formatCurrency(pricing.discount.originalAmount, pricing.currency)}
          </span>
        </div>
      )}

      {/* Main price */}
      <div className="text-base font-bold text-foreground">
        {formatCurrency(pricing.amount, pricing.currency)}
      </div>

      {/* Per-carat secondary line */}
      {pricing.perCarat && (
        <div className="text-xs text-muted-foreground">
          {formatCurrency(pricing.perCarat.amount, pricing.perCarat.currency)}/ct
        </div>
      )}

      {/* Legacy delivered price */}
      {showLegacy && pricing.legacyDeliveredPrice && (
        <div className="text-xs text-muted-foreground">
          Delivered:{" "}
          {formatCurrency(
            pricing.legacyDeliveredPrice.amount,
            pricing.legacyDeliveredPrice.currency
          )}
        </div>
      )}

      {/* Multi-currency display */}
      {showMultiCurrency && (
        <div className="text-xs text-muted-foreground">
          ~{formatCurrency(pricing.amount, userContext.currency)}
        </div>
      )}
    </div>
  );
}
