import type { ComponentType } from "react";
import {
  IconFileInvoice,
  IconCalendar,
  IconCreditCardRefund,
  IconAlertTriangle,
  IconReceiptOff,
  IconX,
  IconCashBanknote,
  IconCheck,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type {
  FinanceHistoryEvent,
  FinanceHistoryEventType,
} from "@/lib/api/finances";

const EVENT_ICON_MAP: Record<
  FinanceHistoryEventType,
  ComponentType<{ className?: string }>
> = {
  invoice_issued: IconFileInvoice,
  due_date_set: IconCalendar,
  credit_note_allocated: IconCreditCardRefund,
  late_fee_added: IconAlertTriangle,
  late_fee_removed: IconReceiptOff,
  invoice_voided: IconX,
  invoice_partially_paid: IconCashBanknote,
  invoice_fully_paid: IconCheck,
  credit_note_issued: IconFileInvoice,
  credit_note_partially_allocated: IconCreditCardRefund,
  credit_note_fully_allocated: IconCheck,
};

const COMPLETION_EVENTS: FinanceHistoryEventType[] = [
  "invoice_fully_paid",
  "credit_note_fully_allocated",
];

interface HistoryTimelineProps {
  events: FinanceHistoryEvent[];
}

export function HistoryTimeline({ events }: HistoryTimelineProps) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-xl font-medium tracking-tight text-foreground">
        History
      </h3>
      <div className="flex flex-col">
        {events.map((event, i) => {
          const isLast = i === events.length - 1;
          const Icon = EVENT_ICON_MAP[event.type] ?? IconFileInvoice;
          const isCompletion = COMPLETION_EVENTS.includes(event.type);
          const eventDate = new Date(event.occurredAt);

          return (
            <div key={event.id} className="relative flex gap-3 pb-6">
              {/* Icon circle + connecting line */}
              <div className="relative flex flex-col items-center">
                <div
                  className={cn(
                    "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full",
                    isCompletion ? "bg-emerald-100" : "bg-muted",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4",
                      isCompletion
                        ? "text-emerald-600"
                        : "text-muted-foreground",
                    )}
                  />
                </div>
                {!isLast && (
                  <div className="absolute left-1/2 top-8 h-full w-px -translate-x-1/2 bg-border" />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-0.5 pt-1">
                <span className="text-sm font-medium text-foreground">
                  {event.description}
                </span>
                <span className="text-sm text-muted-foreground">
                  {eventDate.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  &middot;{" "}
                  {eventDate.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
