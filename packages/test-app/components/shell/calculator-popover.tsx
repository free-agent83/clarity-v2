"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { IconCalculator, IconX } from "@tabler/icons-react";
import {
  Button,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nivoda/components";
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
        <Button variant="ghost" size="icon-sm" onClick={() => setOpen(false)} aria-label="Close calculator">
          <IconX size={16} />
        </Button>
      </div>

      <div className="space-y-4 p-4">
        {/* Stone params — 2×2 grid */}
        <div className="grid grid-cols-2 gap-3">
          <Field className="gap-1.5">
            <FieldLabel className="text-xs">Size (ct)</FieldLabel>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={size}
              onChange={(e) => setSize(e.target.value)}
            />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel className="text-xs">Shape</FieldLabel>
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
          </Field>
          <Field className="gap-1.5">
            <FieldLabel className="text-xs">Colour</FieldLabel>
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
          </Field>
          <Field className="gap-1.5">
            <FieldLabel className="text-xs">Clarity</FieldLabel>
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
          </Field>
        </div>

        {/* Discount */}
        <Field className="gap-1.5">
          <FieldLabel className="text-xs">Discount (%)</FieldLabel>
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
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => setDiscount((d) => Math.max(-99, d - 1))}
              aria-label="Decrease by 1%"
            >
              −
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => setDiscount((d) => Math.min(999, d + 1))}
              aria-label="Increase by 1%"
            >
              +
            </Button>
          </div>
          <FieldDescription>
            Use negative values for discount, positive values for markup.
          </FieldDescription>
        </Field>

        {/* Output */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-3">
            <Field className="gap-1.5">
              <FieldLabel className="text-xs">Price/Ct (USD)</FieldLabel>
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
            </Field>
            <Field className="gap-1.5">
              <FieldLabel className="text-xs">Total Price (USD)</FieldLabel>
              <div className="flex h-11 items-center rounded-md border border-border bg-muted/50 px-3">
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
            </Field>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <Button variant="secondary" onClick={handleReset} block>
          Reset
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Open calculator"
      >
        <IconCalculator size={20} />
      </Button>
      {open && createPortal(panel, document.body)}
    </>
  );
}
