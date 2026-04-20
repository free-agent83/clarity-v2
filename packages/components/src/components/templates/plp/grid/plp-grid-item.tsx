"use client";

import {
  IconArrowBackUp,
  IconBan,
  IconMapPin,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "../../../atoms/badge/badge";
import { Button } from "../../../atoms/button/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../../atoms/hover-card/hover-card";
import { Typography } from "../../../atoms/typography/typography";
import type { AppUserContextValue, GridItemData } from "../plp-types";
import { PlpGridThumbnail } from "./plp-grid-thumbnail";
import { BrandExpress } from "@/components/atoms/brand-express/brand-express";

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
export function PlpGridItem({
  data,
  userContext,
}: {
  data: GridItemData;
  userContext: AppUserContextValue;
}) {
  return (
    <article
      className="group relative flex flex-col"
      data-slot="plp-grid-item"
    >
      {/* 1. Thumbnail */}
      <PlpGridThumbnail data={data} />

      {/* 2. Name */}
      <Typography variant="subtitle-1" className="mt-2 line-clamp-2">
        {data.name}
      </Typography>

      {/* 3. Lead (optional slot) */}
      {data.lead && (
        <Typography variant="caption" className="text-muted-foreground">
          {data.lead}
        </Typography>
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
      <PlpGridItemDelivery delivery={data.delivery} />

      {/* 7. Returns */}
      <PlpGridItemReturns returns={data.returns} />

      {/* 8. Pricing */}
      <PlpGridItemPricing pricing={data.pricing} userContext={userContext} />

      {/* 9. Category slot bottom (optional) */}
      {data.categorySlotBottom && (
        <div className="mt-1.5">{data.categorySlotBottom}</div>
      )}

      {/* 10. Primary action — hover-revealed on desktop, always visible on touch */}
      <PlpGridItemAddToCart onAddToCart={data.onAddToCart} />
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
  userContext: AppUserContextValue;
}) {
  const showTariffs = pricing.includeTariffs && userContext.location === "US";
  const showLegacy =
    pricing.legacyDeliveredPrice && userContext.pricingModel === "legacy";
  const showMultiCurrency = userContext.currency !== pricing.currency;

  return (
    <div className="mt-1">
      {/* Tariff label */}
      {showTariffs && (
        <Typography variant="caption" className="text-muted-foreground">
          Stone price{" "}
          <HoverCard>
            <HoverCardTrigger asChild>
              <span
                tabIndex={0}
                className="cursor-help rounded-sm underline decoration-dotted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                incl. tariffs
              </span>
            </HoverCardTrigger>
            <HoverCardContent className="max-w-xs">
              <Typography variant="subtitle-1" className="text-foreground">
                🇺🇸 About US Tariffs
              </Typography>
              <Typography variant="caption" className="text-muted-foreground">
                All Nivoda prices already include US tariffs. No additional
                charges will be applied at checkout.
              </Typography>
            </HoverCardContent>
          </HoverCard>
        </Typography>
      )}

      {/* Discount line */}
      {pricing.discount && (
        <div className="flex items-center gap-2">
          <Typography as="span" variant="caption" className="text-muted-foreground line-through">
            {formatCurrency(pricing.discount.originalAmount, pricing.currency)}
          </Typography>
          <Typography as="span" variant="caption" emphasis className="text-info">
            -{pricing.discount.percentage}%
          </Typography>
        </div>
      )}

      {/* Main price */}
      <Typography variant="body-1" emphasis>
        {formatCurrency(pricing.amount, pricing.currency)}
      </Typography>

      {/* Per-carat secondary line */}
      {pricing.perCarat && (
        <Typography variant="caption" className="text-muted-foreground">
          {formatCurrency(pricing.perCarat.amount, pricing.perCarat.currency)}/ct
        </Typography>
      )}

      {/* Legacy delivered price */}
      {showLegacy && pricing.legacyDeliveredPrice && (
        <Typography variant="caption" className="text-muted-foreground">
          Delivered:{" "}
          {formatCurrency(
            pricing.legacyDeliveredPrice.amount,
            pricing.legacyDeliveredPrice.currency
          )}
        </Typography>
      )}

      {/* Multi-currency display */}
      {showMultiCurrency && (
        <Typography variant="caption" className="text-muted-foreground">
          ~{formatCurrency(pricing.amount, userContext.currency)}
        </Typography>
      )}
    </div>
  );
}

/**
 * Renders the delivery block: optional Express badge, estimated delivery
 * date, and origin warehouse.
 */
function PlpGridItemDelivery({
  delivery,
}: {
  delivery: GridItemData["delivery"];
}) {
  return (
    <div className="mt-2 text-muted-foreground">
      <div className="flex items-center gap-1.5">
        {delivery.isExpress ? (
          <BrandExpress className="h-2.5" aria-label="Express delivery" />
        ) : (
          <IconTruckDelivery className="size-3.5 shrink-0" aria-hidden="true" />
        )}
        <Typography
          as="span"
          variant="caption"
          className={delivery.isExpress ? "text-express" : undefined}
        >
          Get it{" "}
          <Typography
            as="span"
            variant="caption"
            emphasis
            className={delivery.isExpress ? undefined : "text-foreground"}
          >
            {delivery.estimatedDate}
          </Typography>
        </Typography>
      </div>
      <div className="flex items-center gap-1.5">
        <IconMapPin className="size-3.5 shrink-0" aria-hidden="true" />
        <Typography as="span" variant="caption">
          Ships from{" "}
          <Typography as="span" variant="caption" className="text-foreground">
            {delivery.shipsFrom}
          </Typography>
        </Typography>
      </div>
    </div>
  );
}

/**
 * Renders the returns line: returnable items get a success-coloured line
 * with the fair-use hint, non-returnable items get a destructive-coloured
 * single word.
 */
function PlpGridItemReturns({
  returns,
}: {
  returns: GridItemData["returns"];
}) {
  return returns.isReturnable ? (
    <div className="flex items-center gap-1.5 text-success">
      <IconArrowBackUp className="size-3.5 shrink-0" aria-hidden="true" />
      <Typography as="span" variant="caption">
        Returnable <span className="text-muted-foreground">Fair use policy applies</span>
      </Typography>
    </div>
  ) : (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <IconBan className="size-3.5 shrink-0" aria-hidden="true" />
      <Typography as="span" variant="caption">
        Non-returnable
      </Typography>
    </div>
  );
}

/**
 * Renders the primary action — hover-revealed on pointer devices,
 * always visible on touch. Stops propagation so row-level click handlers
 * don't fire when the card itself is clickable.
 */
function PlpGridItemAddToCart({
  onAddToCart,
}: {
  onAddToCart: () => void;
}) {
  return (
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
          onAddToCart();
        }}
      >
        Add to cart
      </Button>
    </div>
  );
}
