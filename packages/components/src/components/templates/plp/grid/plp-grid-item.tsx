"use client";

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import {
  IconArrowBackUp,
  IconBan,
  IconMapPin,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
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
import { BrandExpress } from "@/components/atoms/brand-express/brand-express";
import { useHasHover } from "../../../../hooks/use-has-hover";

// ── Helpers ───────────────────────────────────────────────

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ── Shell ─────────────────────────────────────────────────

/**
 * Outer PLP grid card. Presentational shell — no business logic, no
 * data binding. Consumers compose children from the `PlpGridItem*`
 * primitives (see same file) and any design-system atoms they like.
 *
 * Provides: `group` for hover coordination, a flex column with
 * consistent vertical gap, and two visual state variants (`selected`,
 * `disabled`).
 */
export function PlpGridItem({
  children,
  selected = false,
  disabled = false,
  className,
}: {
  children: ReactNode;
  /** Visual frame highlight; consumer owns the boolean. */
  selected?: boolean;
  /** Dims the card and blocks pointer interaction. */
  disabled?: boolean;
  className?: string;
}) {
  return (
    <article
      data-slot="plp-grid-item"
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      className={cn(
        "group relative flex flex-col gap-2",
        selected && "rounded-lg ring-2 ring-ring ring-offset-2",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      {children}
    </article>
  );
}

// ── Media ─────────────────────────────────────────────────

/**
 * Media surface for the card — a static image with an optional
 * hover-swap video. When `video` is provided and the viewport supports
 * hover, the static image crossfades out on hover and horizontal cursor
 * position maps to `video.currentTime` (360 scrub feel). On touch
 * devices, video is not mounted and no network requests are issued.
 *
 * Accepts `children` as overlay content — typically a
 * `PlpGridItemMediaToolbar` and/or `PlpGridItemCheckbox`.
 */
export function PlpGridItemMedia({
  image,
  imageAlt,
  video,
  children,
  className,
}: {
  image: string;
  imageAlt: string;
  video?: string;
  children?: ReactNode;
  className?: string;
}) {
  const hasHover = useHasHover();
  const canRender360 = hasHover && !!video;

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoInViewport, setVideoInViewport] = useState(false);

  useEffect(() => {
    if (!canRender360) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVideoInViewport(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "200px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [canRender360]);

  useEffect(() => {
    if (!videoInViewport) return;
    const v = videoRef.current;
    if (!v) return;
    v.preload = "auto";
    v.load();
  }, [videoInViewport]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!canRender360) return;
    const v = videoRef.current;
    const c = containerRef.current;
    if (!v || !c || !Number.isFinite(v.duration)) return;
    const rect = c.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * v.duration;
  }

  function handleMouseLeave() {
    if (!canRender360) return;
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
  }

  return (
    <div
      ref={containerRef}
      data-slot="plp-grid-item-media"
      className={cn(
        "relative aspect-square overflow-hidden rounded-lg border border-border bg-muted",
        className
      )}
      onMouseMove={canRender360 ? handleMouseMove : undefined}
      onMouseLeave={canRender360 ? handleMouseLeave : undefined}
    >
      {canRender360 && video && (
        <video
          ref={videoRef}
          src={video}
          preload="metadata"
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-contain"
        />
      )}
      <img
        src={image}
        alt={imageAlt}
        loading="lazy"
        className={cn(
          "absolute inset-0 h-full w-full object-contain transition-opacity duration-150 ease-out",
          canRender360 && "group-hover:opacity-0"
        )}
      />
      {children}
    </div>
  );
}

/**
 * Toolbar overlay that sits at the top of `PlpGridItemMedia`. Hidden
 * by default, revealed on card hover/focus-within, always visible on
 * touch devices.
 */
export function PlpGridItemMediaToolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="plp-grid-item-media-toolbar"
      className={cn(
        "absolute inset-x-0 top-0 flex items-center justify-end gap-0.5 p-2",
        "opacity-0 transition-opacity group-hover:opacity-100 group-has-focus-visible:opacity-100",
        "[@media(hover:none)]:opacity-100",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Single action button used inside `PlpGridItemMediaToolbar`. Renders a
 * ghost icon button with a tooltip.
 */
export function PlpGridItemMediaAction({
  icon,
  label,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}) {
  const IconComp = icon;
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={label}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClick?.();
            }}
          >
            <IconComp className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Positioned selection checkbox. Always visible when `checked`;
 * hover-revealed otherwise so the thumbnail reads clean at rest. The
 * library renders the control and reports changes — the consumer owns
 * any selection-set state.
 */
export function PlpGridItemCheckbox({
  checked,
  onChange,
  label = "Select item",
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  className?: string;
}) {
  return (
    <div
      data-slot="plp-grid-item-checkbox"
      className={cn(
        "absolute left-2 top-2",
        !checked &&
          "opacity-0 transition-opacity group-hover:opacity-100 group-has-focus-visible:opacity-100 [@media(hover:none)]:opacity-100",
        className
      )}
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

// ── Content primitives ────────────────────────────────────

export function PlpGridItemName({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Typography
      as="h3"
      variant="subtitle-1"
      data-slot="plp-grid-item-name"
      className={cn("line-clamp-2", className)}
    >
      {children}
    </Typography>
  );
}

/**
 * Delivery block. Standardised presentation with two variants.
 *
 * - `variant="express"` shows the BrandExpress badge + express-coloured
 *   line.
 * - `variant="regular"` shows the default truck icon + line.
 *
 * `businessDays` is the lead emphatic text (e.g. "2 – 3"); rendered as
 * "{businessDays} business days ({date})". `date` is any ReactNode.
 * `shipsFrom` is optional; when present, a secondary "Ships from X"
 * line appears below with the pin icon.
 */
export function PlpGridItemDelivery({
  variant,
  businessDays,
  date,
  shipsFrom,
}: {
  variant: "express" | "regular";
  businessDays?: ReactNode;
  date: ReactNode;
  shipsFrom?: ReactNode;
}) {
  const isExpress = variant === "express";
  const leadClass = isExpress ? "text-express" : "text-foreground";
  return (
    <div data-slot="plp-grid-item-delivery" className="text-muted-foreground">
      <div className="flex items-start gap-1.5">
        <IconTruckDelivery
          className="size-3.5 shrink-0 mt-0.5"
          aria-hidden="true"
        />
        {isExpress && (
          <BrandExpress
            className="h-2.5 mt-1 shrink-0"
            aria-label="Express delivery"
          />
        )}
        <Typography as="span" variant="caption">
          {businessDays ? (
            <>
              <Typography
                as="span"
                variant="caption"
                className={leadClass}
              >
                {businessDays} business days
              </Typography>{" "}
              <span className="whitespace-nowrap">({date})</span>
            </>
          ) : (
            <>
              Get it{" "}
              <Typography
                as="span"
                variant="caption"
                emphasis
                className={leadClass}
              >
                {date}
              </Typography>
            </>
          )}
        </Typography>
      </div>
      {shipsFrom && (
        <div className="flex items-start gap-1.5">
          <IconMapPin
            className="size-3.5 shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <Typography as="span" variant="caption" className="text-foreground">
            {shipsFrom}
          </Typography>
        </div>
      )}
    </div>
  );
}

/**
 * Returns indicator. Fixed copy per variant — consumers pick the
 * variant, library renders the standardised label.
 */
export function PlpGridItemReturnable({
  variant,
}: {
  variant: "returnable" | "non-returnable";
}) {
  return variant === "returnable" ? (
    <div
      data-slot="plp-grid-item-returnable"
      className="flex items-center gap-1.5 text-success"
    >
      <IconArrowBackUp className="size-3.5 shrink-0" aria-hidden="true" />
      <Typography as="span" variant="caption">
        Returnable{" "}
        <span className="text-muted-foreground">Fair use policy applies</span>
      </Typography>
    </div>
  ) : (
    <div
      data-slot="plp-grid-item-returnable"
      className="flex items-center gap-1.5 text-muted-foreground"
    >
      <IconBan className="size-3.5 shrink-0" aria-hidden="true" />
      <Typography as="span" variant="caption">
        Non-returnable
      </Typography>
    </div>
  );
}

/**
 * Price block — a fat component that standardises every pricing line
 * the design supports (tariff note, discount, main amount, per-carat,
 * legacy delivered, alternate currency). The library renders whatever
 * variants are provided; consumers decide when to pass each based on
 * their own user context and business rules.
 */
export function PlpGridItemPrice({
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
  /** When true, prefixes with the "Stone price incl. tariffs" note. */
  includeTariffs?: boolean;
  legacyDelivered?: { amount: number; currency: string };
  alternateCurrency?: { amount: number; currency: string };
}) {
  return (
    <div data-slot="plp-grid-item-price">
      {includeTariffs && (
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

      {discount && (
        <div className="flex items-center gap-2">
          <Typography
            as="span"
            variant="caption"
            className="text-muted-foreground line-through"
          >
            {formatCurrency(discount.originalAmount, currency)}
          </Typography>
          <Typography as="span" variant="caption" emphasis className="text-info">
            -{discount.percentage}%
          </Typography>
        </div>
      )}

      <Typography variant="body-1" emphasis>
        {formatCurrency(amount, currency)}
      </Typography>

      {perCarat && (
        <Typography variant="caption" className="text-muted-foreground">
          {formatCurrency(perCarat.amount, perCarat.currency)}/ct
        </Typography>
      )}

      {legacyDelivered && (
        <Typography variant="caption" className="text-muted-foreground">
          Delivered:{" "}
          {formatCurrency(legacyDelivered.amount, legacyDelivered.currency)}
        </Typography>
      )}

      {alternateCurrency && (
        <Typography variant="caption" className="text-muted-foreground">
          ~{formatCurrency(alternateCurrency.amount, alternateCurrency.currency)}
        </Typography>
      )}
    </div>
  );
}

/**
 * Wrapper for the card's primary CTA (typically an Add-to-cart Button).
 * Hidden by default, revealed on card hover/focus-within, always
 * visible on touch devices. Consumers drop any action element inside.
 */
export function PlpGridItemPrimaryAction({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="plp-grid-item-primary-action"
      className={cn(
        "invisible opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-has-focus-visible:visible group-has-focus-visible:opacity-100",
        "[@media(hover:none)]:visible [@media(hover:none)]:opacity-100",
        className
      )}
    >
      {children}
    </div>
  );
}
