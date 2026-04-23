"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";

import { useCartStore } from "@/hooks/use-cart-store";
import { useCheckoutStore } from "@/hooks/use-checkout-store";
import { CheckoutStepper } from "@/components/checkout/checkout-stepper";
import { OrderSummary } from "@/components/checkout/order-summary";

const StepReview = dynamic(() =>
  import("@/components/checkout/step-review").then((m) => m.StepReview),
);
const StepDelivery = dynamic(() =>
  import("@/components/checkout/step-delivery").then((m) => m.StepDelivery),
);
const StepPayment = dynamic(() =>
  import("@/components/checkout/step-payment").then((m) => m.StepPayment),
);
const StepConfirm = dynamic(() =>
  import("@/components/checkout/step-confirm").then((m) => m.StepConfirm),
);

const CTA_LABELS: Record<number, string> = {
  1: "Continue to delivery options",
  2: "Continue to payment method",
  3: "Continue to order review",
  4: "Place order",
};

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const step = useCheckoutStore((s) => s.step);
  const setStep = useCheckoutStore((s) => s.setStep);
  const completeStep = useCheckoutStore((s) => s.completeStep);
  const deliveryMode = useCheckoutStore((s) => s.deliveryMode);
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId);
  const perItemAddressId = useCheckoutStore((s) => s.perItemAddressId);
  const placeOrder = useCheckoutStore((s) => s.placeOrder);
  const [placing, setPlacing] = useState(false);

  // Guard: empty cart redirects away
  useEffect(() => {
    if (items.length === 0 && !placing) {
      router.replace("/buyer");
    }
  }, [items.length, placing, router]);

  if (items.length === 0 && !placing) return null;

  function validateStep2(): boolean {
    if (deliveryMode === "single") {
      return selectedAddressId !== null;
    }
    return items.every((item) => !!perItemAddressId[item.productId]);
  }

  function handleContinue() {
    if (step === 2 && !validateStep2()) {
      toast(
        deliveryMode === "single"
          ? "Please select a delivery address"
          : "Please assign a delivery address to all items",
      );
      return;
    }

    if (step === 4) {
      setPlacing(true);
      setTimeout(() => {
        placeOrder();
        router.push("/buyer/checkout/confirmation");
      }, 1500);
      return;
    }

    completeStep(step);
    setStep((step + 1) as 1 | 2 | 3 | 4);
  }

  const StepComponent = {
    1: StepReview,
    2: StepDelivery,
    3: StepPayment,
    4: StepConfirm,
  }[step];

  return (
    <div className="flex flex-col gap-8">
      <CheckoutStepper />
      <div className="grid grid-cols-[1fr_380px] items-start gap-8">
        <StepComponent />
        <OrderSummary
          onContinue={handleContinue}
          ctaLabel={CTA_LABELS[step]}
          ctaLoading={placing}
        />
      </div>
    </div>
  );
}
