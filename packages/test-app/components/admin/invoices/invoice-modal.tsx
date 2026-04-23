"use client";

import * as React from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "@nivoda/components";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@nivoda/components";
import { Input } from "@nivoda/components";
import { Label } from "@nivoda/components";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nivoda/components";
import { Separator } from "@nivoda/components";
import type { AdminInvoiceDetail } from "@/lib/api/admin/invoices";
import type { CreateInvoiceInput } from "@/lib/api/admin/invoices";
import type { LookupItem } from "@/lib/api/admin/lookups";
import type { AdminUserItem } from "@/lib/api/admin/users";

interface InvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: AdminInvoiceDetail;
  users: AdminUserItem[];
  paymentMethods: LookupItem[];
  invoiceStatuses: LookupItem[];
  ledgerEntryTypes: LookupItem[];
  onSave: (data: CreateInvoiceInput) => Promise<void>;
  defaultUserId?: string;
}

interface LedgerEntryRow {
  ledgerEntryTypeId: string;
  orderId: string;
  description: string;
  amountUsd: string;
  occurredAt: string;
}

export function InvoiceModal({
  open,
  onOpenChange,
  invoice,
  users,
  paymentMethods,
  invoiceStatuses,
  ledgerEntryTypes,
  onSave,
  defaultUserId,
}: InvoiceModalProps) {
  const [userId, setUserId] = React.useState("");
  const [invoiceNumber, setInvoiceNumber] = React.useState("");
  const [paymentMethodId, setPaymentMethodId] = React.useState("");
  const [statusId, setStatusId] = React.useState("");
  const [totalAmountUsd, setTotalAmountUsd] = React.useState("");
  const [issueDate, setIssueDate] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [entries, setEntries] = React.useState<LedgerEntryRow[]>([]);
  const [saving, setSaving] = React.useState(false);

  // Reset form when dialog opens / invoice changes
  React.useEffect(() => {
    if (!open) return;

    if (invoice) {
      setUserId(invoice.userId);
      setInvoiceNumber(invoice.invoiceNumber);
      setPaymentMethodId(invoice.paymentMethodId);
      setStatusId(invoice.statusId ?? "");
      setTotalAmountUsd(String(invoice.totalAmountUsd));
      setIssueDate(invoice.issueDate.slice(0, 10));
      setDueDate(invoice.dueDate.slice(0, 10));
      setEntries(
        invoice.ledgerEntries.map((e) => ({
          ledgerEntryTypeId: e.ledgerEntryTypeId,
          orderId: e.orderId ?? "",
          description: e.description,
          amountUsd: String(e.amountUsd),
          occurredAt: e.occurredAt.slice(0, 16),
        })),
      );
    } else {
      setUserId(defaultUserId ?? "");
      setInvoiceNumber("");
      setPaymentMethodId(paymentMethods[0]?.id ?? "");
      setStatusId("");
      setTotalAmountUsd("");
      setIssueDate("");
      setDueDate("");
      setEntries([]);
    }
  }, [open, invoice, defaultUserId, paymentMethods]);

  function addEntry() {
    setEntries((prev) => [
      ...prev,
      {
        ledgerEntryTypeId: "",
        orderId: "",
        description: "",
        amountUsd: "",
        occurredAt: "",
      },
    ]);
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }

  function updateEntry(index: number, patch: Partial<LedgerEntryRow>) {
    setEntries((prev) =>
      prev.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const data: CreateInvoiceInput = {
        userId,
        invoiceNumber,
        paymentMethodId,
        statusId: statusId || undefined,
        totalAmountUsd: Number(totalAmountUsd) || 0,
        issueDate,
        dueDate,
        ledgerEntries: entries
          .filter((e) => e.ledgerEntryTypeId && e.description && e.occurredAt)
          .map((e) => ({
            ledgerEntryTypeId: e.ledgerEntryTypeId,
            orderId: e.orderId || undefined,
            description: e.description,
            amountUsd: Number(e.amountUsd) || 0,
            occurredAt: e.occurredAt,
          })),
      };

      await onSave(data);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {invoice ? "Edit Invoice" : "Create Invoice"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Core fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="invoice-user">User</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger id="invoice-user">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name ?? u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="invoice-number">Invoice Number</Label>
              <Input
                id="invoice-number"
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-0001"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="invoice-payment-method">Payment Method</Label>
              <Select
                value={paymentMethodId}
                onValueChange={setPaymentMethodId}
              >
                <SelectTrigger id="invoice-payment-method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="invoice-status">Status</Label>
              <Select value={statusId} onValueChange={setStatusId}>
                <SelectTrigger id="invoice-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {invoiceStatuses.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="invoice-total">Total Amount USD</Label>
              <Input
                id="invoice-total"
                type="number"
                step="0.01"
                min="0"
                value={totalAmountUsd}
                onChange={(e) => setTotalAmountUsd(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="invoice-issue-date">Issue Date</Label>
              <Input
                id="invoice-issue-date"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="invoice-due-date">Due Date</Label>
              <Input
                id="invoice-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Ledger Entries */}
          <Separator />
          <div className="flex flex-col gap-3">
            <Label className="text-base font-medium">Ledger Entries</Label>
            {entries.map((entry, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Separator />}
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-muted-foreground">
                        Type
                      </Label>
                      <Select
                        value={entry.ledgerEntryTypeId}
                        onValueChange={(val) =>
                          updateEntry(index, { ledgerEntryTypeId: val })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Entry type" />
                        </SelectTrigger>
                        <SelectContent>
                          {ledgerEntryTypes.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-muted-foreground">
                        Amount USD
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={entry.amountUsd}
                        onChange={(e) =>
                          updateEntry(index, { amountUsd: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-muted-foreground">
                        Description
                      </Label>
                      <Input
                        type="text"
                        placeholder="Description"
                        value={entry.description}
                        onChange={(e) =>
                          updateEntry(index, { description: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-muted-foreground">
                        Occurred At
                      </Label>
                      <Input
                        type="datetime-local"
                        value={entry.occurredAt}
                        onChange={(e) =>
                          updateEntry(index, { occurredAt: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label className="text-xs text-muted-foreground">
                        Order ID (optional)
                      </Label>
                      <Input
                        type="text"
                        placeholder="UUID"
                        value={entry.orderId}
                        onChange={(e) =>
                          updateEntry(index, { orderId: e.target.value })
                        }
                      />
                    </div>

                    <div className="flex items-end justify-end pb-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeEntry(index)}
                      >
                        <IconTrash />
                      </Button>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={addEntry}
            >
              <IconPlus />
              Add entry
            </Button>
          </div>

          {/* Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
