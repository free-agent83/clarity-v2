import { Card, CardContent, CardHeader, CardTitle } from "@nivoda/components";
import { Separator } from "@nivoda/components";
import { Button } from "@nivoda/components";
import { cn, formatUSD } from "@/lib/utils";
import type { FinanceDocumentDetail } from "@/lib/api/finances";

function formatPaymentMethod(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface PaymentBreakdownCardProps {
  document: FinanceDocumentDetail;
}

export function PaymentBreakdownCard({ document }: PaymentBreakdownCardProps) {
  const status = document.currentStatus?.value ?? "issued";
  const isInvoice = document.type === "invoice";
  const showPayButton = isInvoice && !["paid", "cancelled"].includes(status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-normal">
          Payment breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {showPayButton && (
          <Button className="w-full">
            Pay {formatUSD(document.balanceDue)} now
          </Button>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Payment terms</span>
          <span>{formatPaymentMethod(document.paymentMethod.value)}</span>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ordered items</span>
            <span>{formatUSD(document.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">VAT</span>
            <span>{formatUSD(document.vatTotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Shipping & fees</span>
            <span>{formatUSD(document.shippingAndFees)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between font-semibold">
            <span>
              {document.type === "invoice"
                ? "Invoice total"
                : "Credit note total"}
            </span>
            <span>{formatUSD(document.totalAmountUsd)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total paid</span>
            <span>{formatUSD(document.settledAmount)}</span>
          </div>
          <div
            className={cn(
              "flex items-center justify-between font-semibold",
              document.balanceDue > 0 && "text-destructive",
            )}
          >
            <span>Total due</span>
            <span>{formatUSD(document.balanceDue)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
