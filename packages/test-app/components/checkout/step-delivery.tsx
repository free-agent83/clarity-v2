"use client";

import { useEffect, useState } from "react";
import {
  IconCheck,
  IconAlertTriangle,
  IconMapPin,
  IconPlus,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { useCartStore } from "@/hooks/use-cart-store";
import {
  useCheckoutStore,
  type LocalAddress,
} from "@/hooks/use-checkout-store";
import { NativeSelect } from "@/components/ui/native-select";
import { Button } from "@/components/ui/button";
import { AddAddressModal } from "@/components/checkout/add-address-modal";

/* ── Normalised address type used by this component ────────── */

type NormalisedAddress = {
  id: string;
  name: string;
  line: string;
  isDefault: boolean;
  isVerified: boolean;
};

function normaliseDbAddress(a: {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string | null;
  postalCode: string | null;
  isDefault: boolean;
}): NormalisedAddress {
  const parts = [a.street, a.city, a.state, a.postalCode].filter(Boolean);
  return {
    id: a.id,
    name: a.name,
    line: parts.join(", "),
    isDefault: a.isDefault,
    isVerified: a.isDefault,
  };
}

function normaliseLocalAddress(a: LocalAddress): NormalisedAddress {
  const parts = [a.street, a.city, a.state, a.postalCode, a.countryName].filter(
    Boolean,
  );
  return {
    id: a.id,
    name: a.name,
    line: parts.join(", "),
    isDefault: false,
    isVerified: false,
  };
}

/* ── Address card ──────────────────────────────────────────── */

function AddressCard({
  address,
  selected,
  onSelect,
}: {
  address: NormalisedAddress;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors",
        selected
          ? "border-foreground bg-muted/50"
          : "border-border hover:border-foreground/30",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border",
          selected
            ? "border-foreground bg-foreground text-background"
            : "border-border",
        )}
      >
        {selected && <IconCheck size={12} strokeWidth={3} />}
      </span>
      <div className="flex flex-1 flex-col">
        <span className="text-sm font-medium">{address.name}</span>
        <span className="text-xs text-muted-foreground">{address.line}</span>
      </div>
      {!address.isVerified && (
        <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-950 dark:text-amber-400">
          Not verified
        </span>
      )}
    </button>
  );
}

/* ── Main component ────────────────────────────────────────── */

export function StepDelivery() {
  const items = useCartStore((s) => s.items);
  const deliveryMode = useCheckoutStore((s) => s.deliveryMode);
  const setDeliveryMode = useCheckoutStore((s) => s.setDeliveryMode);
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId);
  const setSelectedAddressId = useCheckoutStore((s) => s.setSelectedAddressId);
  const perItemAddressId = useCheckoutStore((s) => s.perItemAddressId);
  const setPerItemAddressId = useCheckoutStore((s) => s.setPerItemAddressId);
  const localAddresses = useCheckoutStore((s) => s.localAddresses);

  const [dbAddresses, setDbAddresses] = useState<NormalisedAddress[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Fetch user addresses on mount
  useEffect(() => {
    async function load() {
      const res = await fetch("/api/v1/me/addresses");
      if (!res.ok) return;
      const json = await res.json();
      const normalised = (json.data ?? []).map(normaliseDbAddress);
      setDbAddresses(normalised);

      // Auto-select default address if none selected
      if (!selectedAddressId) {
        const defaultAddr = normalised.find(
          (a: NormalisedAddress) => a.isDefault,
        );
        if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      }
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const allAddresses: NormalisedAddress[] = [
    ...dbAddresses,
    ...localAddresses.map(normaliseLocalAddress),
  ];

  const selectedAddress = allAddresses.find((a) => a.id === selectedAddressId);

  // Not expanded yet — show default address
  if (!expanded) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Delivery options
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select how you would like your purchase to reach you.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-foreground">
            Check your shipping destination
          </h2>
          <p className="text-xs text-muted-foreground">
            You may change your delivery destination.
          </p>

          {selectedAddress && (
            <div className="flex items-start gap-3 rounded-lg border border-border p-4">
              <IconMapPin size={20} className="mt-0.5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {selectedAddress.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {selectedAddress.line}
                </span>
                {!selectedAddress.isVerified && (
                  <span className="mt-1 text-xs text-amber-600">
                    Not verified
                  </span>
                )}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            className="self-start"
            onClick={() => setExpanded(true)}
          >
            Change delivery for this order
          </Button>
        </div>
      </div>
    );
  }

  // Expanded — delivery mode selection
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Delivery options
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select how you would like your purchase to reach you.
        </p>
      </div>

      {/* Delivery mode toggle */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setDeliveryMode("single")}
          className={cn(
            "flex flex-col gap-1 rounded-lg border p-4 text-left transition-colors",
            deliveryMode === "single"
              ? "border-foreground bg-muted/50"
              : "border-border hover:border-foreground/30",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Deliver to a single address
            </span>
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border",
                deliveryMode === "single"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border",
              )}
            >
              {deliveryMode === "single" && (
                <IconCheck size={12} strokeWidth={3} />
              )}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            All items in your cart will be delivered to the address you select
            below.
          </span>
        </button>
        <button
          type="button"
          onClick={() => setDeliveryMode("multiple")}
          className={cn(
            "flex flex-col gap-1 rounded-lg border p-4 text-left transition-colors",
            deliveryMode === "multiple"
              ? "border-foreground bg-muted/50"
              : "border-border hover:border-foreground/30",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Deliver to multiple addresses
            </span>
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border",
                deliveryMode === "multiple"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border",
              )}
            >
              {deliveryMode === "multiple" && (
                <IconCheck size={12} strokeWidth={3} />
              )}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            You may select different delivery addresses for each individual item
            in your cart.
          </span>
        </button>
      </div>

      {/* Unverified address warning */}
      {selectedAddress && !selectedAddress.isVerified && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
          <IconAlertTriangle
            size={20}
            className="mt-0.5 shrink-0 text-amber-600"
          />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-medium">Selected address is not verified</p>
            <p className="text-xs">
              This may cause delivery delays. Please make sure you have uploaded
              valid documents for faster address verification.
            </p>
          </div>
        </div>
      )}

      {/* Single address mode */}
      {deliveryMode === "single" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">
                Choose where to deliver your items to
              </h2>
              <p className="text-xs text-muted-foreground">
                Select from your saved addresses or add a new one.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddModalOpen(true)}
            >
              <IconPlus size={16} />
              Add new address
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {allAddresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                selected={selectedAddressId === address.id}
                onSelect={() => setSelectedAddressId(address.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Multiple addresses mode */}
      {deliveryMode === "multiple" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">
                Choose where to deliver each item
              </h2>
              <p className="text-xs text-muted-foreground">
                You may select different delivery addresses.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddModalOpen(true)}
            >
              <IconPlus size={16} />
              Add new address
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-4"
              >
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.certLab && item.certNumber
                    ? `${item.certLab} ${item.certNumber} · `
                    : ""}
                  Stock ID {item.stockId}
                </p>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted-foreground">
                    Deliver this item to
                  </label>
                  <NativeSelect
                    value={perItemAddressId[item.productId] ?? ""}
                    onChange={(e) =>
                      setPerItemAddressId(item.productId, e.target.value)
                    }
                  >
                    <option value="" disabled>
                      Select an address
                    </option>
                    {allAddresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} — {a.line}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddAddressModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onAdded={(id) => {
          if (deliveryMode === "single") setSelectedAddressId(id);
        }}
      />
    </div>
  );
}
