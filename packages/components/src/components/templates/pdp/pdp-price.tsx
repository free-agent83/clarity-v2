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
    <div className={cn("flex flex-col gap-1", className)} data-slot="pdp-price">
      {/* Tariffs note */}
      {includeTariffs && (
        <div className="flex items-center gap-1">
          <Typography variant="caption" className="text-muted-foreground">
            {/* eslint-disable-next-line jsx-a11y/no-aria-hidden-on-focusable */}
            <span role="img" aria-label="United States flag">🇺🇸</span>{" "}
            Stone price incl. tariffs
          </Typography>
          <HoverCard>
            <HoverCardTrigger asChild>
              <button type="button" aria-label="About US tariffs">
                <IconInfoCircle size={14} className="text-muted-foreground" />
              </button>
            </HoverCardTrigger>
            <HoverCardContent className="max-w-64 text-sm">
              This price already includes US import tariffs. No additional charges at checkout.
            </HoverCardContent>
          </HoverCard>
        </div>
      )}

      {/* Label (e.g. "Final delivered price") — omitted in legacy mode */}
      {label && !legacy && (
        <Typography variant="caption" className="text-muted-foreground">
          {label}
        </Typography>
      )}

      {/* Discount row */}
      {discount && (
        <div className="flex items-center gap-2">
          <span className="rounded bg-destructive px-1.5 py-0.5 text-xs font-bold text-destructive-foreground">
            -{discount.percentage}%
          </span>
          <Typography variant="body-2" className="text-muted-foreground line-through">
            {fmt(discount.originalAmount, currency)}
          </Typography>
        </div>
      )}

      {/* Main amount */}
      <Typography as="p" variant="h3" className="font-bold">
        {fmt(amount, currency)}
      </Typography>

      {/* Per-carat rate */}
      {perCarat && (
        <Typography variant="caption" className="text-muted-foreground">
          {fmt(perCarat.amount, perCarat.currency)} / ct
        </Typography>
      )}

      {/* Legacy delivered price */}
      {legacy && (
        <Typography variant="caption" className="text-muted-foreground">
          Delivered: {fmt(legacy.deliveredAmount, legacy.deliveredCurrency)}
        </Typography>
      )}

      {/* Alternate currency */}
      {showAlt && (
        <Typography variant="caption" className="text-muted-foreground">
          ≈ {fmt(alternateCurrency!.amount, alternateCurrency!.currency)}
        </Typography>
      )}
    </div>
  );
}
