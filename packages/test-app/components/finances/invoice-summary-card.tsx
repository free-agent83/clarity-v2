import { Card, CardContent, CardHeader, CardTitle } from "@nivoda/components";
import { Separator } from "@nivoda/components";
import { Button } from "@nivoda/components";
import { IconDownload } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  STATUS_DOT_COLORS,
  formatStatus,
  type FinanceDocumentDetail,
} from "@/lib/api/finances";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDueDaysLabel(
  dueDate: string,
  status: string,
): { label: string; className: string } | null {
  if (!["issued", "partially_paid", "overdue"].includes(status)) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (status === "overdue" || diffDays < 0) {
    return {
      label: `Overdue by ${Math.abs(diffDays)} days`,
      className: "text-destructive",
    };
  }

  return {
    label: `Due in ${diffDays} days`,
    className: "text-muted-foreground",
  };
}

interface InvoiceSummaryCardProps {
  document: FinanceDocumentDetail;
}

export function InvoiceSummaryCard({ document }: InvoiceSummaryCardProps) {
  const statusValue = document.currentStatus?.value ?? "issued";
  const dotColor = STATUS_DOT_COLORS[statusValue] ?? "bg-muted-foreground";
  const isInvoice = document.type === "invoice";
  const dueDaysLabel = isInvoice
    ? getDueDaysLabel(document.dueDate, statusValue)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-normal">
          {isInvoice ? "Invoice summary" : "Credit note summary"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <div className="flex items-center gap-1.5">
              <span className={cn("size-2 shrink-0 rounded-full", dotColor)} />
              <span className="font-medium">{formatStatus(statusValue)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Date issued</span>
            <span>{formatDate(document.issueDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Due date</span>
            <span>{formatDate(document.dueDate)}</span>
          </div>
          {dueDaysLabel && (
            <div className="flex justify-end">
              <span className={cn("text-sm", dueDaysLabel.className)}>
                {dueDaysLabel.label}
              </span>
            </div>
          )}
        </div>

        <Separator />

        <Button variant="outline" className="w-full">
          <IconDownload className="size-4" />
          Download .PDF
        </Button>
      </CardContent>
    </Card>
  );
}
