import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  IconUpload,
  IconFileInvoice,
  IconAlertTriangle,
  IconCreditCard,
} from "@tabler/icons-react";
import {
  fetchFinanceDocuments,
  computeFinanceSummary,
} from "@/lib/api/finances";
import { FinancesTable } from "@/components/finances/finances-table";

function formatUsd(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

export default async function FinancesPage() {
  const documents = await fetchFinanceDocuments();
  const summary = computeFinanceSummary(documents);

  return (
    <div className="flex flex-col gap-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-5xl font-medium leading-14 text-foreground">
          Finances
        </h1>
        <Button variant="outline" size="lg">
          <IconUpload className="size-5" />
          Export
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total unpaid */}
        <Card>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconFileInvoice className="size-4" />
              Total unpaid
            </div>
            <span className="text-2xl font-semibold text-foreground">
              {formatUsd(summary.totalUnpaid.amount)}
            </span>
            <span className="text-sm text-muted-foreground">
              {summary.totalUnpaid.invoiceCount} invoice
              {summary.totalUnpaid.invoiceCount !== 1 ? "s" : ""} &middot;{" "}
              {summary.totalUnpaid.currencyCount} currency
            </span>
          </CardContent>
        </Card>

        {/* Total overdue */}
        <Card>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconAlertTriangle className="size-4" />
              Total overdue
            </div>
            <span className="text-2xl font-semibold text-foreground">
              {formatUsd(summary.totalOverdue.amount)}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-muted-foreground">
                {summary.totalOverdue.invoiceCount} invoice
                {summary.totalOverdue.invoiceCount !== 1 ? "s" : ""}
              </span>
              {summary.totalOverdue.lateFees > 0 && (
                <span className="text-sm font-medium text-destructive">
                  +{formatUsd(summary.totalOverdue.lateFees)} late fees
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available credit */}
        <Card>
          <CardContent className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconCreditCard className="size-4" />
              Available credit
            </div>
            <span className="text-2xl font-semibold text-foreground">
              {formatUsd(summary.availableCredit.amount)}
            </span>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {formatUsd(summary.availableCredit.used)} /{" "}
                  {formatUsd(summary.availableCredit.limit)} used
                </span>
              </div>
              <Progress
                value={
                  (summary.availableCredit.used /
                    summary.availableCredit.limit) *
                  100
                }
              />
              <button className="mt-1 self-start text-sm font-medium text-primary hover:underline">
                Apply for more credit
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table with tabs, filters, pagination */}
      <FinancesTable documents={documents} />
    </div>
  );
}
