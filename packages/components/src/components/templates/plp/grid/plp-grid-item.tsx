"use client";

import { cn } from "@/lib/utils";
import { Badge } from "../../../atoms/badge/badge";
import { Button } from "../../../atoms/button/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../atoms/tooltip/tooltip";
import { usePlpUserContext } from "../context/plp-user-context";
import type { GridItemData } from "../plp-types";

/**
 * Platform thumbnail actions — always present, template-owned.
 * Renders favorite, share, and viewMedia buttons.
 */
function PlatformActions({
  itemId,
  onFavorite,
  onShare,
  onViewMedia,
}: {
  itemId: string;
  onFavorite?: (id: string) => void;
  onShare?: (id: string) => void;
  onViewMedia?: (id: string) => void;
}) {
  const actions = [
    {
      id: "favorite",
      label: "Add to shortlist",
      icon: HeartIcon,
      handler: onFavorite,
    },
    { id: "share", label: "Share", icon: ShareIcon, handler: onShare },
    {
      id: "viewMedia",
      label: "View media",
      icon: MediaIcon,
      handler: onViewMedia,
    },
  ];

  return (
    <>
      {actions.map((action) => (
        <TooltipProvider key={action.id} delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="rounded-md p-1 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                aria-label={action.label}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  action.handler?.(itemId);
                }}
              >
                <action.icon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{action.label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </>
  );
}

/** Placeholder icon components — replace with Tabler icons during implementation. */
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" x2="12" y1="2" y2="15" />
    </svg>
  );
}

function MediaIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" x2="3" y1="12" y2="12" />
    </svg>
  );
}

function CheckboxIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </svg>
  );
}

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
 * Renders all 10 fixed sections in spec order. Handles hover behaviour
 * (thumbnail action toolbar + add-to-cart reveal) and pricing variant
 * rendering based on item data and user context.
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
      <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
        <img
          src={data.thumbnailSrc}
          alt={data.thumbnailAlt}
          className="h-full w-full object-contain"
          loading="lazy"
        />

        {/* Hover action toolbar — visible on hover/focus-within */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 flex items-center justify-between p-2",
            "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
            // Always visible on touch devices
            "touch-action-none [@media(hover:none)]:opacity-100"
          )}
        >
          {/* Left: selection checkbox */}
          <div>
            {data.enableSelection && (
              <button
                type="button"
                className="rounded-md p-1 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Select item"
              >
                <CheckboxIcon className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Right: platform actions + category actions */}
          <div className="flex items-center gap-0.5">
            <PlatformActions
              itemId={data.id}
              onFavorite={data.onFavorite}
              onShare={data.onShare}
              onViewMedia={data.onViewMedia}
            />
            {data.categoryActions?.map((action) => (
              <TooltipProvider key={action.id} delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="rounded-md p-1 text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                      aria-label={action.label}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        action.onAction(data.id);
                      }}
                    >
                      {action.icon}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{action.label}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </div>

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
          size="sm"
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
