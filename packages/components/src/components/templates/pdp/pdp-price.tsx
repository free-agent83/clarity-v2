import { IconInfoCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../../atoms/hover-card/hover-card";
import { Typography } from "../../atoms/typography/typography";
import type { PdpPriceProps } from "./pdp-types";

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Full pricing matrix for the PDP body. Supports all pricing scenarios:
 * simple, per-carat, discount, tariffs-included, legacy (item + delivered),
 * and alternate currency.
 *
 * `legacy` and `discount` are mutually exclusive — a legacy item price does
 * not carry a strike-through.
 *
 * `showAlternateCurrency: false` hides the alt currency line even when
 * `alternateCurrency` data is present. Defaults to `true`.
 */
export function PdpPrice({
  amount,
  currency,
  label,
  perCarat,
  discount,
  includeTariffs,
  legacy,
  alternateCurrency,
  showAlternateCurrency = true,
  className,
}: PdpPriceProps) {
  const showAlt = showAlternateCurrency && !!alternateCurrency;

  return (
    <div className={cn("flex flex-col", className)} data-slot="pdp-price">
      {/* Price label slot. The tariffs callout is a variant of the "Final
          delivered price" label — when tariffs are included, it replaces the
          plain label; the two never render together. Legacy mode omits both. */}
      {!legacy && (includeTariffs ? (
        <div className="flex items-center gap-1">
          <Typography variant="body-2" className="text-muted-foreground">
            {/* eslint-disable-next-line jsx-a11y/no-aria-hidden-on-focusable */}
            Final price{" "}
            <HoverCard>
              <HoverCardTrigger asChild>
                <span className="underline decoration-dotted cursor-help">incl. tariffs</span>
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

        </div>
      ) : label ? (
        <Typography variant="body-2" className="text-muted-foreground">
          {label}
        </Typography>
      ) : null)}

      {/* Main amount */}
      <Typography as="p" variant="h5">
        {fmt(amount, currency)}
      </Typography>

      {/* Discount row */}
      {discount && (
        <div className="flex items-center gap-1">
          <Typography variant="body-2" className="text-muted-foreground line-through">
            {fmt(discount.originalAmount, currency)}
          </Typography>
          <Typography as="span" variant="body-2" className="text-info ">
            -{discount.percentage}%
          </Typography>
        </div>
      )}

      {/* Per-carat rate */}
      {perCarat && (
        <Typography variant="body-2" className="text-muted-foreground">
          {fmt(perCarat.amount, perCarat.currency)}/ct
        </Typography>
      )}

      {/* Legacy delivered price */}
      {legacy && (
        <Typography variant="body-2" className="text-muted-foreground">
          Delivered: {fmt(legacy.deliveredAmount, legacy.deliveredCurrency)}
        </Typography>
      )}

      {/* Alternate currency */}
      {showAlt && (
        <Typography variant="body-2" className="text-muted-foreground">
          ≈ {fmt(alternateCurrency!.amount, alternateCurrency!.currency)}
        </Typography>
      )}
    </div>
  );
}
