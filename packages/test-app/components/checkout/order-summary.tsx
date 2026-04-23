"use client";

import { useState } from "react";
import { IconInfoCircle, IconX } from "@tabler/icons-react";
import { cn, formatUSD } from "@/lib/utils";
import {
  useCheckoutStore,
  useCheckoutSubtotal,
  useCheckoutPaymentTerm,
} from "@/hooks/use-checkout-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { QcRequirementsModal } from "@/components/checkout/qc-requirements-modal";

const MOCK_EUR_RATE = 0.92;

type OrderSummaryProps = {
  onContinue: () => void;
  ctaLabel: string;
  ctaLoading?: boolean;
};

export function OrderSummary({
  onContinue,
  ctaLabel,
  ctaLoading,
}: OrderSummaryProps) {
  const step = useCheckoutStore((s) => s.step);
  const subtotal = useCheckoutSubtotal();
  const paymentTerm = useCheckoutPaymentTerm();
  const appliedDiscount = useCheckoutStore((s) => s.appliedDiscount);
  const discountCode = useCheckoutStore((s) => s.discountCode);
  const setDiscountCode = useCheckoutStore((s) => s.setDiscountCode);
  const applyDiscountCode = useCheckoutStore((s) => s.applyDiscountCode);
  const clearDiscount = useCheckoutStore((s) => s.clearDiscount);
  const qcRequirements = useCheckoutStore((s) => s.qcRequirements);
  const [qcModalOpen, setQcModalOpen] = useState(false);
  const [discountError, setDiscountError] = useState(false);

  const discountAmount = appliedDiscount
    ? subtotal * (appliedDiscount.percent / 100)
    : 0;
  const paymentDiscountAmount =
    step >= 3 ? subtotal * (paymentTerm.discountPercent / 100) : 0;
  const shipping = 0;
  const vat = 0;
  const total =
    subtotal - discountAmount - paymentDiscountAmount + shipping + vat;
  const eurSubtotal = subtotal * MOCK_EUR_RATE;
  const eurTotal = total * MOCK_EUR_RATE;

  function handleApplyDiscount() {
    setDiscountError(false);
    if (!discountCode.trim()) return;
    const success = applyDiscountCode(discountCode.trim());
    if (!success) {
      setDiscountError(true);
    }
  }

  return (
    <>
      <Card className="sticky top-24 w-full shrink-0">
        <CardHeader>
          <CardTitle className="text-base font-normal">Order summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Subtotal */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatUSD(subtotal)}</span>
            </div>
            <div className="flex justify-end text-xs text-muted-foreground">
              {eurSubtotal.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              €
            </div>
          </div>

          {/* Total excl taxes */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total excl. taxes</span>
              <span className="font-medium">{formatUSD(subtotal)}</span>
            </div>
            <div className="flex justify-end text-xs text-muted-foreground">
              {eurSubtotal.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              €
            </div>
          </div>

          {/* Payment terms (from step 3) */}
          {step >= 3 && paymentTerm.discountPercent !== 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Payment terms</span>
              <div className="flex flex-col items-end">
                <span className="text-xs text-emerald-600">
                  {paymentTerm.name}
                </span>
                <span
                  className={cn(
                    "text-xs",
                    paymentTerm.discountPercent > 0
                      ? "text-emerald-600"
                      : "text-destructive",
                  )}
                >
                  {paymentTerm.discountPercent > 0 ? "-" : "+"}
                  {formatUSD(Math.abs(paymentDiscountAmount))}
                </span>
              </div>
            </div>
          )}

          {/* VAT */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">VAT (0%)</span>
            <span>{formatUSD(0)}</span>
          </div>

          <Separator />

          {/* Discount codes */}
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">
              Discount codes
            </span>
            {appliedDiscount ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  {appliedDiscount.code} (-{appliedDiscount.percent}%)
                  <button
                    type="button"
                    onClick={clearDiscount}
                    className="ml-1 hover:text-destructive"
                  >
                    <IconX size={12} />
                  </button>
                </span>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value);
                    setDiscountError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyDiscount();
                  }}
                  placeholder="Type code here"
                  className={cn(
                    "h-9 text-sm",
                    discountError && "border-destructive",
                  )}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 shrink-0"
                  onClick={handleApplyDiscount}
                >
                  Apply
                </Button>
              </div>
            )}
            {discountError && (
              <p className="text-xs text-destructive">Invalid discount code</p>
            )}
          </div>

          <Separator />

          {/* Total */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">TOTAL</span>
              <span className="text-lg font-semibold">{formatUSD(total)}</span>
            </div>
            <div className="flex justify-end text-xs text-muted-foreground">
              €
              {eurTotal.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          {/* CTA */}
          <Button
            className="h-11 w-full"
            onClick={onContinue}
            disabled={ctaLoading}
          >
            {ctaLoading ? "Placing order..." : ctaLabel}
          </Button>

          {/* Fine print */}
          <p className="text-xs leading-relaxed text-muted-foreground">
            The local currency amount is the current value converted from $USD.
            The final amount payable in your local currency will be calculated
            once shipment is confirmed.
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            For stones eligible for free returns, you will be credited with the
            full stone purchase amount as long as you have not returned 6 items
            during the month. The shipping fee, wherever applicable, is not
            refundable if the stone is returned.
          </p>

          <Separator />

          {/* QC Requirements */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1 text-sm font-medium">
              Default QC requirements
              <IconInfoCircle size={14} className="text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">{qcRequirements}</p>
            <button
              type="button"
              onClick={() => setQcModalOpen(true)}
              className="self-start text-xs font-medium text-foreground underline underline-offset-2 hover:no-underline"
            >
              Edit default QC requirements
            </button>
          </div>
        </CardContent>
      </Card>

      <QcRequirementsModal open={qcModalOpen} onOpenChange={setQcModalOpen} />
    </>
  );
}
