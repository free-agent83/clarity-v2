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
import { Switch } from "@nivoda/components";
import {
  ProductCombobox,
  type ProductOption,
} from "@/components/admin/product-combobox";
import type { AdminOrderDetail } from "@/lib/api/admin/orders";
import type { CreateOrderInput } from "@/lib/api/admin/orders";
import type { LookupItem } from "@/lib/api/admin/lookups";
import type { AdminUserItem } from "@/lib/api/admin/users";

interface OrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: AdminOrderDetail;
  users: AdminUserItem[];
  products: ProductOption[];
  paymentTerms: LookupItem[];
  orderEventTypes: LookupItem[];
  addresses: { id: string; name: string }[];
  onSave: (data: CreateOrderInput) => Promise<void>;
  defaultUserId?: string;
}

interface ItemRow {
  productId: string;
  priceUsd: number;
}

interface EventRow {
  eventTypeId: string;
  occurredAt: string;
}

export function OrderModal({
  open,
  onOpenChange,
  order,
  users,
  products,
  paymentTerms,
  orderEventTypes,
  addresses,
  onSave,
  defaultUserId,
}: OrderModalProps) {
  const [userId, setUserId] = React.useState("");
  const [paymentTermId, setPaymentTermId] = React.useState("");
  const [statusId, setStatusId] = React.useState("");
  const [estimatedDelivery, setEstimatedDelivery] = React.useState("");
  const [finalPriceUsd, setFinalPriceUsd] = React.useState("");
  const [deliveryAddressId, setDeliveryAddressId] = React.useState("");
  const [canTrack, setCanTrack] = React.useState(false);
  const [canPayInvoice, setCanPayInvoice] = React.useState(false);
  const [shippingCost, setShippingCost] = React.useState("");
  const [vatAmount, setVatAmount] = React.useState("");
  const [items, setItems] = React.useState<ItemRow[]>([]);
  const [events, setEvents] = React.useState<EventRow[]>([]);
  const [saving, setSaving] = React.useState(false);

  // Reset form when dialog opens / order changes
  React.useEffect(() => {
    if (!open) return;

    if (order) {
      setUserId(order.userId);
      setPaymentTermId(order.paymentTermId);
      setStatusId(order.statusId ?? "");
      setEstimatedDelivery(order.estimatedDelivery.slice(0, 10));
      setFinalPriceUsd(String(order.finalPriceUsd));
      setDeliveryAddressId(order.deliveryAddressId ?? "");
      setCanTrack(order.canTrack);
      setCanPayInvoice(order.canPayInvoice);
      setShippingCost(String(order.shippingCost));
      setVatAmount(String(order.vatAmount));
      setItems(
        order.items.map((i) => ({
          productId: i.productId,
          priceUsd: i.priceUsd,
        })),
      );
      setEvents(
        order.events.map((e) => ({
          eventTypeId: e.eventTypeId,
          occurredAt: e.occurredAt.slice(0, 16),
        })),
      );
    } else {
      setUserId(defaultUserId ?? "");
      setPaymentTermId(paymentTerms[0]?.id ?? "");
      setStatusId("");
      setEstimatedDelivery("");
      setFinalPriceUsd("");
      setDeliveryAddressId("");
      setCanTrack(false);
      setCanPayInvoice(false);
      setShippingCost("0");
      setVatAmount("0");
      setItems([]);
      setEvents([]);
    }
  }, [open, order, defaultUserId, paymentTerms]);

  function addItem() {
    setItems((prev) => [...prev, { productId: "", priceUsd: 0 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function addEvent() {
    setEvents((prev) => [...prev, { eventTypeId: "", occurredAt: "" }]);
  }

  function removeEvent(index: number) {
    setEvents((prev) => prev.filter((_, i) => i !== index));
  }

  function updateEvent(index: number, patch: Partial<EventRow>) {
    setEvents((prev) =>
      prev.map((evt, i) => (i === index ? { ...evt, ...patch } : evt)),
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const data: CreateOrderInput = {
        userId,
        paymentTermId,
        statusId: statusId || undefined,
        estimatedDelivery,
        deliveryAddressId: deliveryAddressId || undefined,
        finalPriceUsd: Number(finalPriceUsd) || 0,
        shippingCost: Number(shippingCost) || 0,
        vatAmount: Number(vatAmount) || 0,
        canTrack,
        canPayInvoice,
        items: items.filter((i) => i.productId),
        events: events.filter((e) => e.eventTypeId && e.occurredAt),
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
          <DialogTitle>{order ? "Edit Order" : "Create Order"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Core fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="order-user">User</Label>
              <Select value={userId} onValueChange={setUserId}>
                <SelectTrigger id="order-user">
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
              <Label htmlFor="order-payment-term">Payment Term</Label>
              <Select value={paymentTermId} onValueChange={setPaymentTermId}>
                <SelectTrigger id="order-payment-term">
                  <SelectValue placeholder="Select payment term" />
                </SelectTrigger>
                <SelectContent>
                  {paymentTerms.map((pt) => (
                    <SelectItem key={pt.id} value={pt.id}>
                      {pt.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="order-status">Status</Label>
              <Select value={statusId} onValueChange={setStatusId}>
                <SelectTrigger id="order-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {orderEventTypes.map((et) => (
                    <SelectItem key={et.id} value={et.id}>
                      {et.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="order-delivery">Estimated Delivery</Label>
              <Input
                id="order-delivery"
                type="date"
                value={estimatedDelivery}
                onChange={(e) => setEstimatedDelivery(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="order-price">Final Price USD</Label>
              <Input
                id="order-price"
                type="number"
                step="0.01"
                min="0"
                value={finalPriceUsd}
                onChange={(e) => setFinalPriceUsd(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="order-address">Delivery Address</Label>
              <Select
                value={deliveryAddressId}
                onValueChange={setDeliveryAddressId}
              >
                <SelectTrigger id="order-address">
                  <SelectValue placeholder="Select address" />
                </SelectTrigger>
                <SelectContent>
                  {addresses.map((addr) => (
                    <SelectItem key={addr.id} value={addr.id}>
                      {addr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="order-can-track"
                checked={canTrack}
                onCheckedChange={setCanTrack}
              />
              <Label htmlFor="order-can-track">Can Track</Label>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="order-can-pay-invoice"
                checked={canPayInvoice}
                onCheckedChange={setCanPayInvoice}
              />
              <Label htmlFor="order-can-pay-invoice">Can Pay Invoice</Label>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="order-shipping">Shipping Cost</Label>
              <Input
                id="order-shipping"
                type="number"
                step="0.01"
                min="0"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="order-vat">VAT</Label>
              <Input
                id="order-vat"
                type="number"
                step="0.01"
                min="0"
                value={vatAmount}
                onChange={(e) => setVatAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Order Items */}
          <Separator />
          <div className="flex flex-col gap-3">
            <Label className="text-base font-medium">Order Items</Label>
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Separator />}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <ProductCombobox
                      products={products}
                      value={item.productId || null}
                      onChange={(productId, product) => {
                        updateItem(index, {
                          productId,
                          priceUsd: product.priceUsd,
                        });
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Price"
                      value={item.priceUsd || ""}
                      onChange={(e) =>
                        updateItem(index, {
                          priceUsd: Number(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeItem(index)}
                  >
                    <IconTrash />
                  </Button>
                </div>
              </React.Fragment>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={addItem}
            >
              <IconPlus />
              Add item
            </Button>
          </div>

          {/* Timeline Events */}
          <Separator />
          <div className="flex flex-col gap-3">
            <Label className="text-base font-medium">Timeline Events</Label>
            {events.map((evt, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Separator />}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Select
                      value={evt.eventTypeId}
                      onValueChange={(val) =>
                        updateEvent(index, { eventTypeId: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {orderEventTypes.map((et) => (
                          <SelectItem key={et.id} value={et.id}>
                            {et.value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-52">
                    <Input
                      type="datetime-local"
                      value={evt.occurredAt}
                      onChange={(e) =>
                        updateEvent(index, { occurredAt: e.target.value })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeEvent(index)}
                  >
                    <IconTrash />
                  </Button>
                </div>
              </React.Fragment>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={addEvent}
            >
              <IconPlus />
              Add event
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
