"use client";

import { useState } from "react";

import { useCheckoutStore } from "@/hooks/use-checkout-store";
import { Button } from "@nivoda/components";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@nivoda/components";
import { Textarea } from "@nivoda/components";

type QcRequirementsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function QcRequirementsModal({
  open,
  onOpenChange,
}: QcRequirementsModalProps) {
  const qcRequirements = useCheckoutStore((s) => s.qcRequirements);
  const setQcRequirements = useCheckoutStore((s) => s.setQcRequirements);
  const [draft, setDraft] = useState(qcRequirements);

  function handleOpen(nextOpen: boolean) {
    if (nextOpen) setDraft(qcRequirements);
    onOpenChange(nextOpen);
  }

  function handleSave() {
    setQcRequirements(draft);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QC Requirements</DialogTitle>
          <DialogDescription>
            Describe your quality control requirements for this order.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          placeholder="e.g. Flag any BGM or not eye clean stones to us"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
