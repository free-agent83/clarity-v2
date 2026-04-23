import { notFound } from "next/navigation";
import Link from "next/link";

import {
  fetchFinanceDocument,
  STATUS_DOT_COLORS,
  formatStatus,
} from "@/lib/api/finances";
import { Separator } from "@/components/ui/separator";
import { IconArrowLeft } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { InvoicedItemsTable } from "@/components/finances/invoiced-items-table";
import { HistoryTimeline } from "@/components/finances/history-timeline";
import { InvoiceSummaryCard } from "@/components/finances/invoice-summary-card";
import { PaymentBreakdownCard } from "@/components/finances/payment-breakdown-card";

export default async function FinanceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const document = await fetchFinanceDocument(id);

  if (!document) {
    notFound();
  }

  const statusValue = document.currentStatus?.value ?? "issued";
  const dotColor = STATUS_DOT_COLORS[statusValue] ?? "bg-muted-foreground";
  const isInvoice = document.type === "invoice";

  return (
    <div className="flex flex-col gap-14 pb-44 pt-12">
      <div className="mx-auto w-full max-w-5xl px-6">
        <div className="flex flex-col gap-6">
          {/* Back link */}
          <Link
            href="/buyer/finances"
            className="inline-flex items-center gap-2 text-base font-medium text-foreground hover:underline"
          >
            <IconArrowLeft className="size-4" />
            Back to Finances
          </Link>

          {/* Eyebrow + Title + Badge */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {isInvoice ? "Invoice" : "Credit Note"}
            </span>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-medium tracking-tight text-foreground">
                {document.invoiceNumber}
              </h1>
              <div className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1">
                <span
                  className={cn("size-2 shrink-0 rounded-full", dotColor)}
                />
                <span className="text-sm font-medium">
                  {formatStatus(statusValue)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="mx-auto w-full max-w-5xl" />

      {/* Main content area with sidebar */}
      <div className="mx-auto flex w-full max-w-5xl gap-9 px-6">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-10">
          <InvoicedItemsTable
            lineItems={document.lineItems}
            title={isInvoice ? "Invoiced items" : "Credited items"}
          />
          <Separator />
          <HistoryTimeline events={document.historyEvents} />
        </div>

        {/* Right sidebar */}
        <div className="flex w-96 shrink-0 flex-col gap-4">
          <div className="sticky top-24 flex flex-col gap-4">
            <InvoiceSummaryCard document={document} />
            <PaymentBreakdownCard document={document} />
          </div>
        </div>
      </div>
    </div>
  );
}
