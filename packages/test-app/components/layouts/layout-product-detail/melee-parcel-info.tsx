"use client";

import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { cn, formatUSD } from "@/lib/utils";

type MeleeParcelInfoProps = {
  stockId: string;
  shape: string;
  sizeRange: string;
  colorRange: string;
  clarityRange: string;
  cut: string;
  quantity: number;
  totalCaratWeight: number;
  pricePerCarat: number;
};

export function MeleeParcelInfo({
  stockId,
  shape,
  sizeRange,
  colorRange,
  clarityRange,
  cut,
  quantity,
  totalCaratWeight,
  pricePerCarat,
}: MeleeParcelInfoProps) {
  const [isOpen, setIsOpen] = useState(true);

  const rows = [
    { label: "Stock ID", value: stockId },
    { label: "Shape", value: shape },
    { label: "Size range", value: sizeRange },
    { label: "Color range", value: colorRange },
    { label: "Clarity range", value: clarityRange },
    { label: "Cut", value: cut },
    { label: "Quantity", value: `${quantity} pieces` },
    { label: "Total carat weight", value: `${totalCaratWeight.toFixed(2)} ct` },
    {
      label: "Price per carat",
      value: formatUSD(pricePerCarat),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-medium leading-8 text-foreground">
        Parcel Details
      </h2>
      <div className="flex flex-col overflow-hidden rounded-lg border border-border">
        {/* Toggle header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-secondary/50"
        >
          <span className="text-sm font-medium text-foreground">
            {shape} {sizeRange} · {quantity}pcs
          </span>
          <IconChevronDown
            size={20}
            className={cn(
              "text-muted-foreground transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </button>

        {/* Details */}
        {isOpen && (
          <div className="flex flex-col border-t border-border">
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={cn(
                  "flex items-center justify-between px-4 py-3",
                  i < rows.length - 1 && "border-b border-border",
                )}
              >
                <span className="text-sm text-muted-foreground">
                  {row.label}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
