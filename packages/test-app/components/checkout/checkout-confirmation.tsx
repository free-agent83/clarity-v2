"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconCheck,
  IconCircleCheck,
  IconCopy,
  IconTruckDelivery,
  IconFileInvoice,
  IconSearch,
  IconTools,
} from "@tabler/icons-react";
import { toast } from "sonner";

import { useCheckoutStore } from "@/hooks/use-checkout-store";
import { Button } from "@/components/ui/button";

const MOCK_ORDER_NUMBER = "MN-1234-56789";
const MOCK_EMAIL = "jo******@gmail.com";

const TIMELINE_STEPS = [
  {
    icon: IconCircleCheck,
    title: "We confirm your order",
    description: "You will get confirmation in under 24 hours",
    active: true,
  },
  {
    icon: IconTools,
    title: "Your item is manufactured",
    description: "You will be notified when manufacturing is completed",
    active: false,
  },
  {
    icon: IconSearch,
    title: "We quality control your item",
    description: "We check to see if your item is up to standards",
    active: false,
  },
  {
    icon: IconTruckDelivery,
    title: "Your item is shipped to you",
    description: "Invoice is generated immediately after shipping",
    active: false,
  },
  {
    icon: IconFileInvoice,
    title: "An invoice is generated",
    description: "You have 30 days to pay your invoice",
    active: false,
  },
];

export function CheckoutConfirmation() {
  const router = useRouter();
  const orderJustPlaced = useCheckoutStore((s) => s.orderJustPlaced);
  const clearOrderJustPlaced = useCheckoutStore((s) => s.clearOrderJustPlaced);
  const wasPlaced = useRef(orderJustPlaced);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!wasPlaced.current) {
      router.replace("/buyer");
      return;
    }
    clearOrderJustPlaced();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!wasPlaced.current) return null;

  function handleCopyOrderNumber() {
    navigator.clipboard.writeText(MOCK_ORDER_NUMBER);
    toast("Order number copied");
  }

  function handleResendEmail() {
    setResent(true);
    toast("Confirmation email resent");
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-10 py-12">
      {/* Success icon */}
      <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
        <IconCheck
          size={32}
          strokeWidth={3}
          className="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Heading */}
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-semibold">
          Thank you!
          <br />
          Your order has been placed.
        </h1>
        <p className="text-sm text-muted-foreground">
          An order request email has been sent to {MOCK_EMAIL}. It should arrive
          in the next few minutes.
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Your order number is</span>
          <span className="font-medium">{MOCK_ORDER_NUMBER}</span>
          <button
            type="button"
            onClick={handleCopyOrderNumber}
            className="text-muted-foreground hover:text-foreground"
          >
            <IconCopy size={14} />
          </button>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col items-center gap-3">
        <Button className="h-11 px-8" onClick={() => router.push("/buyer")}>
          Back to browsing
        </Button>
        <Button
          variant="link"
          className="text-sm"
          onClick={() => router.push("/buyer/orders")}
        >
          View your order
        </Button>
      </div>

      {/* What happens now */}
      <div className="flex w-full flex-col gap-4">
        <h2 className="text-lg font-semibold">What happens now?</h2>
        <p className="text-sm text-muted-foreground">
          Here&apos;s a timeline for what happens next. You will be notified at
          each step.
        </p>
        <div className="flex flex-col">
          {TIMELINE_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="flex gap-4">
                {/* Timeline line + icon */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex size-8 items-center justify-center rounded-full ${
                      step.active
                        ? "bg-emerald-100 dark:bg-emerald-950"
                        : "bg-muted"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={
                        step.active
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      }
                    />
                  </div>
                  {i < TIMELINE_STEPS.length - 1 && (
                    <div className="h-8 w-px bg-border" />
                  )}
                </div>
                {/* Text */}
                <div className="pb-8">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Didn't receive email */}
      <div className="flex w-full flex-col gap-3">
        <h2 className="text-lg font-semibold">
          I didn&apos;t receive a confirmation email
        </h2>
        <p className="text-sm text-muted-foreground">
          Please make sure you have checked your spam folder. If you didn&apos;t
          get an email within the next 5 minutes, please click the button below
          and we&apos;ll resend it.
        </p>
        <Button
          variant="outline"
          className="self-start"
          onClick={handleResendEmail}
          disabled={resent}
        >
          {resent ? "Email resent" : "Resend order request email"}
        </Button>
      </div>

      {/* Contact support */}
      <div className="flex w-full flex-col gap-3">
        <h2 className="text-lg font-semibold">Contact support</h2>
        <p className="text-sm text-muted-foreground">
          In case you have issues with the confirmation email, forgot to add QC,
          or just want to ask a question about your order in general our
          customer support team is ready and at your disposal.
        </p>
        <Button
          variant="outline"
          className="self-start"
          onClick={() => router.push("/help")}
        >
          Contact customer support
        </Button>
      </div>
    </div>
  );
}
