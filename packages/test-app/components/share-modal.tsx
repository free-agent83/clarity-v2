"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  IconLink,
  IconQrcode,
  IconBrandWhatsapp,
  IconMail,
  IconCircleCheckFilled,
} from "@tabler/icons-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@nivoda/components";
import { Button } from "@nivoda/components";
import { Switch } from "@nivoda/components";
import { Separator } from "@nivoda/components";
import { Spinner } from "@nivoda/components";
import { cn, formatUSD } from "@/lib/utils";

export type ShareableProduct = {
  title: string;
  subtitle: string;
  price: number;
  imageSrc: string;
  attributes: { label: string; value: string }[];
};

type Step = "customize" | "loading" | "ready";

const formatCurrency = formatUSD;

/* ------------------------------------------------------------------ */
/*  Mock QR code — deterministic pattern with finder corners          */
/* ------------------------------------------------------------------ */
function MockQRCode() {
  const size = 25;

  function finderValue(row: number, col: number): boolean | null {
    const corners: [number, number][] = [
      [0, 0],
      [0, size - 7],
      [size - 7, 0],
    ];
    for (const [sr, sc] of corners) {
      const r = row - sr;
      const c = col - sc;
      if (r >= 0 && r < 7 && c >= 0 && c < 7) {
        if (r === 0 || r === 6 || c === 0 || c === 6) return true;
        if (r === 1 || r === 5 || c === 1 || c === 5) return false;
        return true;
      }
    }
    return null;
  }

  return (
    <svg viewBox={`0 0 ${size + 2} ${size + 2}`} className="size-4/5">
      {Array.from({ length: size }, (_, row) =>
        Array.from({ length: size }, (_, col) => {
          const finder = finderValue(row, col);
          const filled =
            finder !== null ? finder : (row * 7 + col * 13 + 42) % 3 !== 0;
          return filled ? (
            <rect
              key={`${row}-${col}`}
              x={col + 1}
              y={row + 1}
              width={1}
              height={1}
              className="fill-foreground"
            />
          ) : null;
        }),
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared product card shown at the top of every step                */
/* ------------------------------------------------------------------ */
function ProductCard({
  product,
  price,
}: {
  product: ShareableProduct;
  price: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-black/5">
        <img
          src={product.imageSrc}
          alt={product.title}
          className="size-full object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-col">
        <p className="truncate text-base font-medium text-foreground">
          {product.title}
        </p>
        <p className="text-base text-muted-foreground">{product.subtitle}</p>
        <p className="text-base text-foreground">{price}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sharing channel button (Copy link / QR / WhatsApp / Email)        */
/* ------------------------------------------------------------------ */
function SharingChannel({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-2.5"
    >
      <div className="flex h-20 w-full items-center justify-center rounded-xl bg-secondary text-foreground transition-colors hover:bg-secondary/80">
        {icon}
      </div>
      <span className="text-sm text-foreground">{label}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  ShareModal                                                         */
/* ------------------------------------------------------------------ */
export function ShareModal({
  product,
  children,
}: {
  product: ShareableProduct;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("customize");
  const [markupPercent, setMarkupPercent] = useState("");
  const [customerPrice, setCustomerPrice] = useState("");
  const [visibleAttributes, setVisibleAttributes] = useState<Set<string>>(
    () => new Set(product.attributes.map((a) => a.label)),
  );
  const [linkCopied, setLinkCopied] = useState(false);

  // Reset when the dialog closes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setStep("customize");
        setMarkupPercent("");
        setCustomerPrice("");
        setVisibleAttributes(new Set(product.attributes.map((a) => a.label)));
        setLinkCopied(false);
      }, 150);
      return () => clearTimeout(t);
    }
  }, [open, product.attributes]);

  const hasMarkup = markupPercent !== "" && parseFloat(markupPercent) > 0;

  const computedCustomerPrice = hasMarkup
    ? product.price * (1 + parseFloat(markupPercent) / 100)
    : customerPrice && parseFloat(customerPrice) > 0
      ? parseFloat(customerPrice)
      : null;

  /* ---------- handlers ---------- */

  const handleMarkupChange = useCallback(
    (raw: string) => {
      const cleaned = raw.replace(/[^0-9.]/g, "");
      setMarkupPercent(cleaned);
      if (cleaned && !isNaN(parseFloat(cleaned))) {
        setCustomerPrice(
          (product.price * (1 + parseFloat(cleaned) / 100)).toFixed(2),
        );
      } else {
        setCustomerPrice("");
      }
    },
    [product.price],
  );

  const handlePriceChange = useCallback(
    (raw: string) => {
      const cleaned = raw.replace(/[^0-9.]/g, "");
      setCustomerPrice(cleaned);
      if (cleaned && !isNaN(parseFloat(cleaned)) && product.price > 0) {
        const pct =
          ((parseFloat(cleaned) - product.price) / product.price) * 100;
        setMarkupPercent(pct > 0 ? pct.toFixed(1) : "");
      } else {
        setMarkupPercent("");
      }
    },
    [product.price],
  );

  const handleFinishAndShare = useCallback(() => {
    setStep("loading");
    setTimeout(() => setStep("ready"), 2000);
  }, []);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard?.writeText(
      `https://share.minivoda.com/item/${Date.now()}`,
    );
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  }, []);

  const toggleAttribute = useCallback((label: string) => {
    setVisibleAttributes((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const displayPrice = computedCustomerPrice
    ? formatCurrency(computedCustomerPrice)
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        className={cn(
          "sm:max-w-lg",
          step === "customize"
            ? "flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0"
            : "flex flex-col gap-6 p-7",
        )}
      >
        {step === "customize" ? (
          /* ======================================================= */
          /*  Step 1 / 2 — Customize markup & visibility             */
          /* ======================================================= */
          <>
            {/* ---------- Header ---------- */}
            <div className="shrink-0 border-b border-muted px-7 pb-5 pt-7">
              <DialogTitle className="text-xl font-medium leading-8">
                Share with markup
              </DialogTitle>
            </div>

            {/* ---------- Scrollable content ---------- */}
            <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-7 py-5">
              {/* Product card */}
              <ProductCard
                product={product}
                price={formatCurrency(product.price)}
              />

              {/* Price markup section */}
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-base leading-7 text-foreground">
                    Price markup
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add markup before sharing with your customer
                  </p>
                </div>

                <div className="flex flex-col gap-6 rounded-xl border border-border bg-background p-6">
                  {/* Markup percent input */}
                  <div className="flex flex-col">
                    <label className="text-base text-muted-foreground">
                      Your markup percent
                    </label>
                    <div className="flex items-baseline gap-0.5">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={markupPercent}
                        onChange={(e) => handleMarkupChange(e.target.value)}
                        placeholder="Add a markup %"
                        className="h-11 w-full bg-transparent text-4xl font-medium text-foreground outline-none placeholder:text-muted-foreground/30"
                      />
                      {markupPercent && (
                        <span className="text-4xl font-medium text-foreground">
                          %
                        </span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Customer price input */}
                  <div className="flex flex-col">
                    <label className="text-base text-muted-foreground">
                      Price your customer sees
                    </label>
                    <div className="flex items-baseline gap-0.5">
                      {customerPrice && (
                        <span className="text-4xl font-medium text-foreground">
                          $
                        </span>
                      )}
                      <input
                        type="text"
                        inputMode="decimal"
                        value={
                          customerPrice
                            ? Number(customerPrice).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : ""
                        }
                        onChange={(e) =>
                          handlePriceChange(e.target.value.replace(/[$,]/g, ""))
                        }
                        placeholder="Add a final price"
                        className="h-11 w-full bg-transparent text-4xl font-medium text-foreground outline-none placeholder:text-muted-foreground/30"
                      />
                    </div>
                  </div>

                  <Separator />

                  <p className="text-sm text-muted-foreground">
                    Your customer{" "}
                    <span className="font-medium text-foreground">never</span>{" "}
                    sees your markup percentage or the item&apos;s original
                    price.
                  </p>
                </div>
              </div>

              {/* Visible to customer section */}
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-base leading-7 text-foreground">
                    Visible to customer
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Select what your customer sees when sharing this item
                  </p>
                </div>

                <div className="overflow-hidden rounded-xl border border-border">
                  {product.attributes.map((attr, i) => (
                    <div
                      key={attr.label}
                      className={cn(
                        "flex items-center justify-between px-5 py-3",
                        i < product.attributes.length - 1 &&
                          "border-b border-border",
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="text-base text-foreground">
                          {attr.label}
                        </span>
                        <span className="text-base text-muted-foreground">
                          {attr.value}
                        </span>
                      </div>
                      <Switch
                        checked={visibleAttributes.has(attr.label)}
                        onCheckedChange={() => toggleAttribute(attr.label)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ---------- Footer ---------- */}
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-muted p-7">
              <Button
                variant="secondary"
                className="min-w-24"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant={hasMarkup ? "default" : "secondary"}
                disabled={!hasMarkup}
                onClick={handleFinishAndShare}
              >
                Finish and share
              </Button>
            </div>
          </>
        ) : (
          /* ======================================================= */
          /*  Step 3 / 4 / 5 — Loading → QR → Copied                */
          /* ======================================================= */
          <>
            <DialogTitle className="sr-only">Share link</DialogTitle>

            {/* Product card with marked-up price */}
            <ProductCard
              product={product}
              price={displayPrice ?? formatCurrency(product.price)}
            />

            {/* Loading spinner or QR code */}
            <div className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-border">
              {step === "loading" ? (
                <div className="flex flex-col items-center gap-4">
                  <Spinner className="size-12 text-muted-foreground" />
                  <p className="text-base text-muted-foreground">
                    Generating link...
                  </p>
                </div>
              ) : (
                <MockQRCode />
              )}
            </div>

            {/* Sharing channels */}
            <div className="flex gap-5">
              <SharingChannel
                icon={
                  linkCopied ? (
                    <IconCircleCheckFilled
                      size={32}
                      className="text-emerald-600"
                    />
                  ) : (
                    <IconLink size={32} />
                  )
                }
                label={linkCopied ? "Copied!" : "Copy link"}
                onClick={handleCopyLink}
              />
              <SharingChannel
                icon={<IconQrcode size={32} />}
                label="Download QR"
              />
              <SharingChannel
                icon={<IconBrandWhatsapp size={32} />}
                label="WhatsApp"
              />
              <SharingChannel icon={<IconMail size={32} />} label="Email" />
            </div>

            {/* Done button */}
            <Button
              variant="secondary"
              className="h-11 w-full"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
