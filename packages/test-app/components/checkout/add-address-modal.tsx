"use client";

import { useState } from "react";

import {
  useCheckoutStore,
  type LocalAddress,
} from "@/hooks/use-checkout-store";
import { Button } from "@nivoda/components";
import { Input } from "@nivoda/components";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@nivoda/components";

type AddAddressModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdded?: (id: string) => void;
};

export function AddAddressModal({
  open,
  onOpenChange,
  onAdded,
}: AddAddressModalProps) {
  const addLocalAddress = useCheckoutStore((s) => s.addLocalAddress);

  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [countryName, setCountryName] = useState("");

  function resetForm() {
    setName("");
    setStreet("");
    setCity("");
    setState("");
    setPostalCode("");
    setCountryName("");
  }

  function handleSave() {
    if (!name.trim() || !street.trim() || !city.trim() || !countryName.trim())
      return;

    const id = crypto.randomUUID();
    const address: LocalAddress = {
      id,
      name: name.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      countryName: countryName.trim(),
      isDefault: false,
    };
    addLocalAddress(address);
    onAdded?.(id);
    resetForm();
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add new address</DialogTitle>
          <DialogDescription>
            This address will only be available for this checkout session.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">
              Name / Label *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Berlin Branch"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Street *</label>
            <Input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Street address"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">City *</label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">
                State / Province
              </label>
              <Input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">
                Postal code
              </label>
              <Input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Postal code"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Country *</label>
              <Input
                value={countryName}
                onChange={(e) => setCountryName(e.target.value)}
                placeholder="Country"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !name.trim() ||
              !street.trim() ||
              !city.trim() ||
              !countryName.trim()
            }
          >
            Add address
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
