"use client";

import { useEffect, useState } from "react";
import { IconDiamond, IconDiamondsFilled } from "@tabler/icons-react";

import { formatUSD } from "@/lib/utils";
import { useCartStore } from "@/hooks/use-cart-store";
import {
  useCheckoutStore,
  useCheckoutSubtotal,
  useCheckoutPaymentTerm,
  type LocalAddress,
} from "@/hooks/use-checkout-store";
import { Separator } from "@/components/ui/separator";

const CATEGORY_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  natural_diamond: IconDiamond,
  lab_grown_diamond: IconDiamond,
  gemstone: IconDiamondsFilled,
  natural_melee: IconDiamond,
  lab_grown_melee: IconDiamond,
  engagement_ring: IconDiamondsFilled,
  wedding_band: IconDiamondsFilled,
  tennis_bracelet: IconDiamondsFilled,
};

const MOCK_ESTIMATED_DELIVERY = "15 Apr 2026";

function EditLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-medium text-foreground underline underline-offset-2 hover:no-underline"
    >
      Edit
    </button>
  );
}

function useSelectedAddressLabel(): string {
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId);
  const deliveryMode = useCheckoutStore((s) => s.deliveryMode);
  const localAddresses = useCheckoutStore((s) => s.localAddresses);
  const [dbAddresses, setDbAddresses] = useState<
    { id: string; name: string; street: string; city: string }[]
  >([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/v1/me/addresses");
      if (!res.ok) return;
      const json = await res.json();
      setDbAddresses(json.data ?? []);
    }
    load();
  }, []);

  if (deliveryMode === "multiple") return "Multiple addresses";
  if (!selectedAddressId) return "No address selected";

  const db = dbAddresses.find((a) => a.id === selectedAddressId);
  if (db) return `${db.name} — ${db.street}, ${db.city}`;

  const local = localAddresses.find(
    (a: LocalAddress) => a.id === selectedAddressId,
  );
  if (local) return `${local.name} — ${local.street}, ${local.city}`;

  return "Selected address";
}

export function StepConfirm() {
  const items = useCartStore((s) => s.items);
  const generalNotes = useCheckoutStore((s) => s.generalNotes);
  const itemNotes = useCheckoutStore((s) => s.itemNotes);
  const setStep = useCheckoutStore((s) => s.setStep);
  const subtotal = useCheckoutSubtotal();
  const paymentTerm = useCheckoutPaymentTerm();
  const appliedDiscount = useCheckoutStore((s) => s.appliedDiscount);
  const addressLabel = useSelectedAddressLabel();

  const discountAmount = appliedDiscount
    ? subtotal * (appliedDiscount.percent / 100)
    : 0;
  const paymentDiscountAmount = subtotal * (paymentTerm.discountPercent / 100);
  const total = subtotal - discountAmount - paymentDiscountAmount;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Review your order before finishing
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Please review your order details, and place your order by clicking the
          button below.
        </p>
      </div>

      {/* Cart items */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Your order</h2>
          <EditLink onClick={() => setStep(1)} />
        </div>
        {items.map((item) => {
          const FallbackIcon = CATEGORY_ICONS[item.category] ?? IconDiamond;
          const note = itemNotes[item.productId];

          return (
            <div
              key={item.id}
              className="flex gap-4 rounded-lg border border-border p-4"
            >
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <FallbackIcon size={24} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium">{item.name}</p>
                  <span className="text-sm font-medium whitespace-nowrap">
                    {formatUSD(item.price)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.certLab && item.certNumber && (
                    <>
                      {item.certLab} {item.certNumber} ·{" "}
                    </>
                  )}
                  Stock ID {item.stockId}
                </p>
                {note?.reference && (
                  <p className="text-xs text-muted-foreground">
                    Ref: {note.reference}
                  </p>
                )}
                {note?.notes && (
                  <p className="text-xs text-muted-foreground">
                    Notes: {note.notes}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Est. delivery: {MOCK_ESTIMATED_DELIVERY}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Notes and shipping */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Notes and shipping</h2>
        </div>
        {generalNotes && (
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                General order notes
              </p>
              <p className="text-sm">{generalNotes}</p>
            </div>
            <EditLink onClick={() => setStep(1)} />
          </div>
        )}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Delivery address</p>
            <p className="text-sm">{addressLabel}</p>
          </div>
          <EditLink onClick={() => setStep(2)} />
        </div>
      </div>

      <Separator />

      {/* Payment & price breakdown */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Payment & price breakdown</h2>
          <EditLink onClick={() => setStep(3)} />
        </div>

        {/* Payment term summary */}
        <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{paymentTerm.name}</span>
            {paymentTerm.badge && (
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                {paymentTerm.badge}
              </span>
            )}
          </div>
          <ul className="flex flex-col gap-1">
            {paymentTerm.steps.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-muted-foreground"
              >
                <span className="mt-1 size-1 shrink-0 rounded-full bg-muted-foreground" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Price breakdown table */}
        <div className="flex flex-col text-sm">
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatUSD(subtotal)}</span>
          </div>
          {appliedDiscount && (
            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground">
                Discount ({appliedDiscount.code})
              </span>
              <span className="text-emerald-600">
                -{formatUSD(discountAmount)}
              </span>
            </div>
          )}
          {paymentTerm.discountPercent !== 0 && (
            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground">
                {paymentTerm.discountPercent > 0
                  ? "Payment discount"
                  : "Payment fee"}
              </span>
              <span
                className={
                  paymentTerm.discountPercent > 0
                    ? "text-emerald-600"
                    : "text-destructive"
                }
              >
                {paymentTerm.discountPercent > 0 ? "-" : "+"}
                {formatUSD(Math.abs(paymentDiscountAmount))}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground">Standard shipping</span>
            <span>{formatUSD(0)}</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground">VAT (0%)</span>
            <span>{formatUSD(0)}</span>
          </div>
          <Separator className="my-1" />
          <div className="flex items-center justify-between py-1.5">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">{formatUSD(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
