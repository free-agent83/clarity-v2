import { notFound } from "next/navigation";
import Link from "next/link";

import { getCurrentUser } from "@/lib/api/users";
import { fetchOrder } from "@/lib/api/orders";
import type { Order } from "@/lib/api/orders";
import { checkSimulateError } from "@/lib/api/_simulate";
import { Button } from "@nivoda/components";
import { Separator } from "@nivoda/components";
import { Card, CardContent, CardHeader, CardTitle } from "@nivoda/components";
import {
  IconArrowLeft,
  IconChecklist,
  IconShoppingCart,
  IconPackage,
  IconTruck,
  IconCheck,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const PROGRESS_STEPS = [
  { key: "requested", label: "Requested", icon: IconChecklist },
  { key: "confirmed", label: "Confirmed", icon: IconShoppingCart },
  { key: "shipped", label: "Shipped", icon: IconPackage },
  { key: "out_for_delivery", label: "Out for delivery", icon: IconTruck },
  { key: "delivered", label: "Delivered", icon: IconCheck },
] as const;

function ProgressTracker({ order }: { order: Order }) {
  // Derive progress from events — an event type is "completed" if it exists in events
  const completedEventTypes = new Set(
    order.events.map((e) => e.eventType.value),
  );

  return (
    <div className="flex w-full items-start">
      {PROGRESS_STEPS.map((step, i) => {
        const isCompleted = completedEventTypes.has(step.key);
        const matchingEvent = order.events.find(
          (e) => e.eventType.value === step.key,
        );
        const isFirst = i === 0;
        const isLast = i === PROGRESS_STEPS.length - 1;
        const Icon = step.icon;

        return (
          <div
            key={step.key}
            className={cn(
              "relative flex flex-1 flex-col items-start gap-3",
              !isFirst && !isLast && "px-6",
              isFirst && "pr-6",
              isLast && "pl-6",
            )}
          >
            {/* Connector lines */}
            {!isFirst && (
              <div
                className={cn(
                  "absolute left-0 top-5 h-0.5",
                  isCompleted ? "bg-primary" : "bg-border",
                )}
                style={{ right: "calc(100% - 20px)" }}
              />
            )}
            {!isLast && (
              <div
                className={cn(
                  "absolute right-0 top-5 h-0.5",
                  isCompleted ? "bg-primary" : "bg-border",
                )}
                style={{ left: "20px" }}
              />
            )}

            {/* Icon circle */}
            <div
              className={cn(
                "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full shadow-[0_0_0_4px_white]",
                isCompleted ? "bg-primary" : "bg-muted",
              )}
            >
              <Icon
                className={cn(
                  "size-5",
                  isCompleted
                    ? "text-primary-foreground"
                    : "text-muted-foreground",
                )}
              />
            </div>

            {/* Label & date */}
            <div className="flex flex-col">
              <span
                className={cn(
                  "text-base",
                  isCompleted ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
              <span
                className={cn(
                  "text-sm",
                  isCompleted
                    ? "text-muted-foreground"
                    : "text-muted-foreground/60",
                )}
              >
                {matchingEvent
                  ? new Date(matchingEvent.occurredAt).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderProductDetails({ order }: { order: Order }) {
  if (order.products.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      {order.products.map((product) => {
        const snapshot = (product.snapshot ?? {}) as Record<string, unknown>;
        const productType = (snapshot.productType as string) ?? "";
        const sectionLabel =
          order.products.length > 1 ? formatLabel(productType) : undefined;

        const specKeys = [
          "shape",
          "carat",
          "color",
          "clarity",
          "cut",
          "polish",
          "symmetry",
          "fluorescence",
          "measurements",
          "table",
          "depth",
          "ratio",
          "metalType",
          "metalColor",
          "metalQuality",
          "bandStyle",
          "ringSize",
        ];

        const rows: [string, string][] = [];
        for (const key of specKeys) {
          if (snapshot[key] !== undefined && snapshot[key] !== null) {
            const label = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (s) => s.toUpperCase());
            rows.push([label, String(snapshot[key])]);
          }
        }

        if (rows.length === 0) return null;

        const mid = Math.ceil(rows.length / 2);
        const leftRows = rows.slice(0, mid);
        const rightRows = rows.slice(mid);

        return (
          <div key={product.id} className="flex flex-col gap-3">
            {sectionLabel && (
              <h4 className="text-sm font-medium text-muted-foreground">
                {sectionLabel}
              </h4>
            )}
            <div className="flex gap-10">
              <div className="flex flex-1 flex-col">
                {leftRows.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center gap-4 py-1 text-sm"
                  >
                    <span className="w-28 shrink-0 text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-foreground">{value}</span>
                  </div>
                ))}
              </div>
              {rightRows.length > 0 && (
                <div className="flex flex-1 flex-col">
                  {rightRows.map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center gap-4 py-1 text-sm"
                    >
                      <span className="w-28 shrink-0 text-muted-foreground">
                        {label}
                      </span>
                      <span className="text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrderSummaryAside({ order }: { order: Order }) {
  // Compute summary values from order data
  const productTotal = order.products.reduce((sum, p) => sum + p.priceUsd, 0);

  return (
    <Card className="sticky top-24 w-96 shrink-0">
      <CardHeader>
        <CardTitle className="text-base font-normal">Order summary</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Key dates */}
        <div className="flex flex-col text-sm">
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Requested on</span>
            <span>{order.orderDate}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Est. delivery date</span>
            <span>{order.estimatedDelivery}</span>
          </div>
        </div>

        <Separator />

        {/* Products */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Items ({order.products.length})
          </span>
          <span>
            $
            {productTotal.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>

        <Separator />

        {/* Totals */}
        <div className="flex flex-col text-sm">
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Standard shipping</span>
            <span>${order.shippingCost.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">VAT</span>
            <span>
              $
              {order.vatAmount.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-muted-foreground">Final delivered price</span>
            <span className="font-semibold">
              $
              {order.finalPriceUsd.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button variant="outline" className="w-full">
            Report issue
          </Button>
          <Button
            variant="outline"
            className="w-full border-destructive text-destructive hover:bg-destructive/10"
          >
            Cancel order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailedUpdates({ order }: { order: Order }) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-xl font-medium tracking-tight text-foreground">
        Detailed updates for this order
      </h3>
      <div className="flex flex-col">
        {order.events.map((event, i) => {
          const isLast = i === order.events.length - 1;
          const eventDate = new Date(event.occurredAt);
          return (
            <div key={event.id} className="relative flex gap-3 pb-5 pt-0">
              {/* Dot & vertical line */}
              <div className="relative flex flex-col items-center">
                <div className="relative z-10 size-2.5 rounded-full bg-primary shadow-[0_0_0_2px_white]" />
                {!isLast && (
                  <div className="absolute left-1/2 top-3 h-full w-px -translate-x-1/2 bg-border" />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-1 pb-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-foreground">
                    {formatLabel(event.eventType.value)}
                  </span>
                  <span className="text-muted-foreground">
                    {eventDate.toLocaleDateString()}
                  </span>
                  <span className="text-muted-foreground">
                    {eventDate.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ simulate?: string; [k: string]: unknown }>;
}) {
  const sp = await searchParams;
  checkSimulateError(sp);
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  const order = await fetchOrder(id, user.id);

  if (!order) {
    notFound();
  }

  // Extract first product info for the header display
  const firstProduct = order.products[0];
  const snapshot = (firstProduct?.snapshot ?? {}) as Record<string, unknown>;
  const itemTitle =
    (snapshot.description as string) ??
    (snapshot.title as string) ??
    `Order ${order.orderNumber}`;
  const itemImage = (snapshot.image as string) ?? "";
  const itemSubtitle = (snapshot.subtitle as string) ?? "";

  // Derive current status message from events
  const latestEvent = order.events[0];
  const statusMessage = latestEvent
    ? formatLabel(latestEvent.eventType.value)
    : (order.currentStatus?.value ?? "");

  return (
    <div className="flex flex-col gap-14 pb-44 pt-12">
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="flex flex-col gap-9">
          {/* Back link */}
          <Link
            href="/buyer/orders"
            className="inline-flex items-center gap-2 text-base font-medium text-foreground hover:underline"
          >
            <IconArrowLeft className="size-4" />
            Back to Orders
          </Link>

          {/* Title */}
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-medium tracking-tight text-foreground">
              {itemTitle}
            </h1>
            <p className="text-xl text-muted-foreground">{order.orderNumber}</p>
          </div>

          {/* Progress tracker */}
          <ProgressTracker order={order} />

          {/* Status message */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <p className="text-xl font-medium text-foreground">
                {statusMessage}
              </p>
              <p className="text-base text-muted-foreground">
                Estimated delivery date: {order.estimatedDelivery}.
              </p>
            </div>
            <button className="self-start text-sm text-foreground underline">
              See detailed order updates
            </button>
          </div>
        </div>
      </div>

      <Separator className="mx-auto w-full max-w-5xl" />

      {/* Main content area with aside */}
      <div className="mx-auto flex w-full max-w-5xl gap-9 px-6">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-10">
          {/* Ordered item details */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xl font-medium tracking-tight text-foreground">
              Ordered item details
            </h3>
            <div className="flex items-center gap-4">
              {itemImage && (
                <div className="size-20 shrink-0 overflow-hidden rounded-md border border-border">
                  <img
                    src={itemImage}
                    alt={itemTitle}
                    className="size-full object-cover"
                  />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-base text-foreground">{itemTitle}</span>
                {itemSubtitle && (
                  <span className="text-base text-muted-foreground">
                    {itemSubtitle}
                  </span>
                )}
              </div>
            </div>
            <OrderProductDetails order={order} />
          </div>

          <Separator />

          {/* Delivery */}
          <div className="flex gap-6">
            <div className="flex flex-1 flex-col gap-3">
              <h3 className="text-xl font-medium tracking-tight text-foreground">
                Delivery address
              </h3>
              <div className="flex flex-col text-sm">
                <span className="font-semibold text-foreground">
                  {order.deliveryAddress.name}
                </span>
                <span className="text-foreground/80">
                  {order.deliveryAddress.street}
                </span>
                <span className="text-foreground/80">
                  {order.deliveryAddress.city}
                </span>
                <span className="text-foreground/80">
                  {order.deliveryAddress.country}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Detailed updates */}
          <DetailedUpdates order={order} />
        </div>

        {/* Right column - Order summary */}
        <OrderSummaryAside order={order} />
      </div>

      <Separator className="mx-auto w-full max-w-5xl" />
    </div>
  );
}
