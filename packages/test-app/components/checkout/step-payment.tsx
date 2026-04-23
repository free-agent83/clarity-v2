"use client";

import { useState } from "react";
import { IconCheck, IconInfoCircle } from "@tabler/icons-react";

import { cn, formatUSD } from "@/lib/utils";
import {
  useCheckoutStore,
  useCheckoutSubtotal,
  useCheckoutPaymentTerm,
  MOCK_PAYMENT_TERMS,
  CREDIT_LIMIT,
  CREDIT_USED_BEFORE,
  type PaymentTerm,
} from "@/hooks/use-checkout-store";
import { Checkbox } from "@nivoda/components";
import { Button } from "@nivoda/components";
import { Separator } from "@nivoda/components";

/* ── Credit bar ────────────────────────────────────────────── */

function CreditBar({ subtotal }: { subtotal: number }) {
  const usedAfter = CREDIT_USED_BEFORE + subtotal;
  const available = Math.max(CREDIT_LIMIT - usedAfter, 0);

  const pctBefore = (CREDIT_USED_BEFORE / CREDIT_LIMIT) * 100;
  const pctOrder = (subtotal / CREDIT_LIMIT) * 100;
  const pctAvailable = (available / CREDIT_LIMIT) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Credit available
        </h2>
        <IconInfoCircle size={14} className="text-muted-foreground/60" />
      </div>
      <p className="text-3xl font-semibold text-foreground">
        {formatUSD(CREDIT_LIMIT)}
      </p>
      <p className="text-sm text-muted-foreground">Your credit limit</p>

      {/* Bar */}
      <div className="flex h-4 w-full overflow-hidden rounded-full">
        <div className="bg-primary" style={{ width: `${pctBefore}%` }} />
        <div className="bg-foreground" style={{ width: `${pctOrder}%` }} />
        <div
          className="bg-amber-400 dark:bg-amber-500"
          style={{ width: `${pctAvailable}%` }}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">
              Used before this request
            </span>
          </div>
          <span>{formatUSD(CREDIT_USED_BEFORE)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-foreground" />
            <span className="text-muted-foreground">
              Used after this request
            </span>
          </div>
          <span>{formatUSD(usedAfter)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-amber-400 dark:bg-amber-500" />
            <span className="text-muted-foreground">
              Available after this request
            </span>
          </div>
          <span>{formatUSD(available)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Payment term card ─────────────────────────────────────── */

function PaymentTermCard({
  term,
  subtotal,
  selected,
  expanded,
  onSelect,
}: {
  term: PaymentTerm;
  subtotal: number;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
}) {
  const discountAmount = subtotal * (term.discountPercent / 100);
  const finalPrice = subtotal - discountAmount;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex flex-col gap-3 rounded-lg border p-4 text-left transition-colors",
        selected
          ? "border-foreground bg-muted/50"
          : "border-border hover:border-foreground/30",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded-full border",
              selected
                ? "border-foreground bg-foreground text-background"
                : "border-border",
            )}
          >
            {selected && <IconCheck size={12} strokeWidth={3} />}
          </span>
          <div>
            <span className="text-sm font-medium">{term.name}</span>
            {term.badge && (
              <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                {term.badge}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          {term.discountPercent !== 0 && (
            <span className="text-xs text-muted-foreground line-through">
              {formatUSD(subtotal)}
            </span>
          )}
          <span className="text-sm font-medium">{formatUSD(finalPrice)}</span>
          {term.discountPercent !== 0 && (
            <span className="text-xs text-muted-foreground">
              Price after discount (excl. tax)
            </span>
          )}
        </div>
      </div>

      {/* Expanded process timeline */}
      {expanded && selected && (
        <div className="mt-2 flex flex-col gap-2 pl-8">
          <p className="text-xs text-muted-foreground">{term.description}</p>
          <ul className="flex flex-col gap-1.5">
            {term.steps.map((s, i) => (
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
      )}
    </button>
  );
}

/* ── Main component ────────────────────────────────────────── */

export function StepPayment() {
  const subtotal = useCheckoutSubtotal();
  const selectedPaymentTermId = useCheckoutStore(
    (s) => s.selectedPaymentTermId,
  );
  const setSelectedPaymentTermId = useCheckoutStore(
    (s) => s.setSelectedPaymentTermId,
  );
  const savePaymentPreference = useCheckoutStore(
    (s) => s.savePaymentPreference,
  );
  const setSavePaymentPreference = useCheckoutStore(
    (s) => s.setSavePaymentPreference,
  );
  const paymentTerm = useCheckoutPaymentTerm();

  const [expanded, setExpanded] = useState(false);

  // Default view — show selected payment term
  if (!expanded) {
    const discountAmount = subtotal * (paymentTerm.discountPercent / 100);
    const finalPrice = subtotal - discountAmount;

    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Payment selection
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review your credit, and choose payment terms.
          </p>
        </div>

        <CreditBar subtotal={subtotal} />

        <Separator />

        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-medium">
            Payment terms for this purchase
          </h2>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-medium">{paymentTerm.name}</span>
              {paymentTerm.badge && (
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  {paymentTerm.badge}
                </span>
              )}
            </div>
            <ul className="flex flex-col gap-1.5">
              {paymentTerm.steps.map((s, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground" />
                  {s}
                </li>
              ))}
            </ul>
            {paymentTerm.discountPercent !== 0 && (
              <div className="mt-2">
                <p className="text-sm">
                  <span className="text-muted-foreground line-through">
                    {formatUSD(subtotal)}
                  </span>{" "}
                  <span className="font-medium">{formatUSD(finalPrice)}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Price after discount (excl. tax)
                </p>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            className="self-start"
            onClick={() => setExpanded(true)}
          >
            Change payment terms for this order
          </Button>
        </div>
      </div>
    );
  }

  // Expanded — all payment options
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Payment selection
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your credit, and choose payment terms.
        </p>
      </div>

      <CreditBar subtotal={subtotal} />

      <Separator />

      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-medium">
          Select payment terms for this purchase
        </h2>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={savePaymentPreference}
            onCheckedChange={(checked) =>
              setSavePaymentPreference(checked === true)
            }
          />
          Save this selection for my future purchases
        </label>

        <div className="flex flex-col gap-2">
          {MOCK_PAYMENT_TERMS.map((term) => (
            <PaymentTermCard
              key={term.id}
              term={term}
              subtotal={subtotal}
              selected={selectedPaymentTermId === term.id}
              expanded={true}
              onSelect={() => setSelectedPaymentTermId(term.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
