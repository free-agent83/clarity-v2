"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IconCalculator, IconX } from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nivoda/components";
import { Input } from "@nivoda/components";
import { Label } from "@nivoda/components";
import { cn } from "@/lib/utils";

const SHAPES = [
  "Round",
  "Princess",
  "Cushion",
  "Oval",
  "Pear",
  "Marquise",
  "Emerald",
  "Asscher",
  "Radiant",
  "Heart",
];
const COLOURS = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
const CLARITIES = [
  "FL",
  "IF",
  "VVS1",
  "VVS2",
  "VS1",
  "VS2",
  "SI1",
  "SI2",
  "I1",
  "I2",
  "I3",
];

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function CalculatorPopover() {
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState("");
  const [shape, setShape] = useState("");
  const [colour, setColour] = useState("");
  const [clarity, setClarity] = useState("");
  const [pricePerCt, setPricePerCt] = useState("");
  const [discount, setDiscount] = useState(0);

  const sizeNum = parseFloat(size);
  const priceNum = parseFloat(pricePerCt);
  const totalPrice =
    !isNaN(sizeNum) && !isNaN(priceNum) && sizeNum > 0 && priceNum > 0
      ? sizeNum * priceNum * (1 + discount / 100)
      : null;

  const formattedTotal =
    totalPrice !== null ? USD_FORMATTER.format(totalPrice) : "$0.00";

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function handleReset() {
    setSize("");
    setShape("");
    setColour("");
    setClarity("");
    setPricePerCt("");
    setDiscount(0);
  }

  const panel = (
    <div className="fixed bottom-4 right-4 z-50 w-80 overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg ring-1 ring-foreground/10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm font-semibold">Calculator</span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close calculator"
        >
          <IconX size={16} />
        </button>
      </div>

      <div className="space-y-4 p-4">
        {/* Stone params — 2×2 grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Size (ct)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Shape</Label>
            <Select value={shape} onValueChange={setShape}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Shape" />
              </SelectTrigger>
              <SelectContent>
                {SHAPES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Colour</Label>
            <Select value={colour} onValueChange={setColour}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Colour" />
              </SelectTrigger>
              <SelectContent>
                {COLOURS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Clarity</Label>
            <Select value={clarity} onValueChange={setClarity}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Clarity" />
              </SelectTrigger>
              <SelectContent>
                {CLARITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Discount */}
        <div className="space-y-2">
          <Label className="text-xs">Discount (%)</Label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                step="1"
                min="-99"
                max="999"
                value={discount}
                onChange={(e) =>
                  setDiscount(
                    Math.min(999, Math.max(-99, Number(e.target.value))),
                  )
                }
                className="pr-6"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                %
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDiscount((d) => Math.max(-99, d - 1))}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
              aria-label="Decrease by 1%"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => setDiscount((d) => Math.min(999, d + 1))}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
              aria-label="Increase by 1%"
            >
              +
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use negative values for discount, positive values for markup.
          </p>
        </div>

        {/* Output */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Price/Ct (USD)</Label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={pricePerCt}
                  onChange={(e) => setPricePerCt(e.target.value)}
                  className="pr-14"
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  per ct
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Total Price (USD)</Label>
              <div className="flex h-9 items-center rounded-md border border-border bg-muted/50 px-3">
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    totalPrice !== null
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {formattedTotal}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <button
          type="button"
          onClick={handleReset}
          className="w-full rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          Reset
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "rounded-lg p-3 text-foreground transition-colors hover:bg-muted",
          open && "bg-muted",
        )}
        aria-label="Open calculator"
      >
        <IconCalculator size={20} />
      </button>
      {open && createPortal(panel, document.body)}
    </>
  );
}
