"use client";

import { IconCheck, IconChevronRight } from "@tabler/icons-react";

import { useCheckoutStore } from "@/hooks/use-checkout-store";
import { cn } from "@/lib/utils";

const STEPS = [
  { number: 1, label: "Review & notes" },
  { number: 2, label: "Delivery options" },
  { number: 3, label: "Payment method" },
  { number: 4, label: "Order review" },
] as const;

export function CheckoutStepper() {
  const step = useCheckoutStore((s) => s.step);
  const completedSteps = useCheckoutStore((s) => s.completedSteps);
  const setStep = useCheckoutStore((s) => s.setStep);

  return (
    <nav aria-label="Checkout progress" className="flex items-center gap-2">
      {STEPS.map(({ number, label }, i) => {
        const isActive = step === number;
        const isCompleted = completedSteps.has(number);
        const isClickable = isCompleted && !isActive;

        return (
          <div key={number} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => {
                if (isClickable) setStep(number as 1 | 2 | 3 | 4);
              }}
              className={cn(
                "flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm transition-colors",
                isActive && "bg-foreground text-background",
                isCompleted &&
                  !isActive &&
                  "cursor-pointer bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-900",
                !isActive &&
                  !isCompleted &&
                  "cursor-default text-muted-foreground",
              )}
            >
              {/* Circle */}
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                  isActive && "bg-background text-foreground",
                  isCompleted &&
                    !isActive &&
                    "bg-emerald-600 text-white dark:bg-emerald-500",
                  !isActive &&
                    !isCompleted &&
                    "border border-border text-muted-foreground",
                )}
              >
                {isCompleted && !isActive ? (
                  <IconCheck size={14} strokeWidth={3} />
                ) : (
                  number
                )}
              </span>
              <span
                className={cn(
                  "font-medium",
                  !isActive && !isCompleted && "font-normal",
                )}
              >
                {label}
              </span>
            </button>

            {/* Chevron separator (not after last) */}
            {i < STEPS.length - 1 && (
              <IconChevronRight
                size={16}
                className="text-muted-foreground/50"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
