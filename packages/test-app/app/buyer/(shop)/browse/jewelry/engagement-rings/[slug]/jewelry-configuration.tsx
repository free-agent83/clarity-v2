"use client";

import { useState } from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconCheck,
  IconChevronDown,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";

const METAL_SWATCH_COLORS: Record<string, string> = {
  "14k_yellow_gold": "bg-[#e6c24b]",
  "18k_yellow_gold": "bg-[#e6c24b]",
  "14k_rose_gold": "bg-[#e8b4a8]",
  "18k_rose_gold": "bg-[#e8b4a8]",
  "10k_white_gold": "bg-[#e0e0e0]",
  "14k_white_gold": "bg-[#e0e0e0]",
  "18k_white_gold": "bg-[#e0e0e0]",
  "950_platinum": "bg-[#9ba0a8]",
};

function formatLabel(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const FINGER_SIZES = [
  "4",
  "4.5",
  "5",
  "5.5",
  "6",
  "6.5",
  "7",
  "7.5",
  "8",
  "8.5",
  "9",
  "9.5",
  "10",
];

type JewelryConfigurationProps = {
  slug: string;
  defaultStoneShape: string;
  defaultMetal: string;
  availableStoneShapes: { id: string; value: string }[];
  availableMetals: { id: string; value: string; priceUsd: number }[];
  compatibleStones: {
    id: string;
    shape: { id: string; value: string };
    maxCarat: number;
  }[];
};

export function JewelryConfiguration({
  slug,
  defaultStoneShape,
  defaultMetal,
  availableStoneShapes,
  availableMetals,
  compatibleStones,
}: JewelryConfigurationProps) {
  const [selectedStoneShape, setSelectedStoneShape] =
    useState(defaultStoneShape);
  const [selectedMetal, setSelectedMetal] = useState(defaultMetal);
  const [selectedSize, setSelectedSize] = useState("7");
  const [engravingText, setEngravingText] = useState("");
  const [openSelector, setOpenSelector] = useState<string | null>(null);

  const metalLabel = formatLabel(selectedMetal);

  function toggleSelector(name: string) {
    setOpenSelector((prev) => (prev === name ? null : name));
  }

  function getStoneSelectionHref(): string {
    const match = compatibleStones.find(
      (cs) => cs.shape.value === selectedStoneShape,
    );
    const shapeId = match?.shape.id ?? "";
    const maxCarat = match?.maxCarat ?? 10;

    const metalMatch = availableMetals.find((m) => m.value === selectedMetal);
    const metalId = metalMatch?.id ?? "";

    const params = new URLSearchParams({
      shapeId,
      maxCarat: String(maxCarat),
      metalId,
      size: selectedSize,
    });
    if (engravingText) {
      params.set("engraving", engravingText);
    }

    return `/buyer/browse/jewelry/engagement-rings/${slug}/select-stone?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-medium leading-8 text-foreground">
        Item configuration
      </h2>
      <div className="flex flex-col">
        {/* Center stone shape */}
        <div className="border-b border-border">
          <button
            className="flex h-16 w-full items-center justify-between py-4"
            onClick={() => toggleSelector("shape")}
          >
            <span className="text-base text-muted-foreground">
              Center stone shape
            </span>
            <div className="flex items-center gap-3">
              <span className="text-base text-foreground underline">
                {selectedStoneShape}
              </span>
              <IconChevronDown
                size={24}
                className={cn(
                  "shrink-0 transition-transform",
                  openSelector === "shape" && "rotate-180",
                )}
              />
            </div>
          </button>
          {openSelector === "shape" && (
            <div className="flex flex-wrap gap-2 pb-4">
              {availableStoneShapes.map((shape) => (
                <button
                  key={shape.id}
                  onClick={() => {
                    setSelectedStoneShape(shape.value);
                    setOpenSelector(null);
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                    selectedStoneShape === shape.value
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/40",
                  )}
                >
                  {shape.value}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Metal */}
        <div className="border-b border-border">
          <button
            className="flex h-16 w-full items-center justify-between py-4"
            onClick={() => toggleSelector("metal")}
          >
            <span className="text-base text-muted-foreground">Metal</span>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "size-5 shrink-0 rounded-full",
                  METAL_SWATCH_COLORS[selectedMetal] ?? "bg-muted",
                )}
              />
              <span className="text-base text-foreground underline">
                {metalLabel}
              </span>
              <IconChevronDown
                size={24}
                className={cn(
                  "shrink-0 transition-transform",
                  openSelector === "metal" && "rotate-180",
                )}
              />
            </div>
          </button>
          {openSelector === "metal" && (
            <div className="flex flex-col gap-2 pb-4">
              {availableMetals.map((m) => {
                const isSelected = selectedMetal === m.value;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMetal(m.value);
                      setOpenSelector(null);
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                      isSelected
                        ? "border-foreground bg-foreground text-background"
                        : "border-border hover:border-foreground/40",
                    )}
                  >
                    <span
                      className={cn(
                        "size-4 shrink-0 rounded-full",
                        METAL_SWATCH_COLORS[m.value] ?? "bg-muted",
                      )}
                    />
                    {formatLabel(m.value)}
                    {isSelected && <IconCheck size={16} className="ml-auto" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Finger size */}
        <div className="border-b border-border">
          <button
            className="flex h-16 w-full items-center justify-between py-4"
            onClick={() => toggleSelector("size")}
          >
            <div className="flex flex-col items-start">
              <span className="text-base text-muted-foreground">
                Finger size
              </span>
              <span className="text-xs text-muted-foreground underline">
                Conversion chart
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base text-foreground underline">
                Size {selectedSize}
              </span>
              <IconChevronDown
                size={24}
                className={cn(
                  "shrink-0 transition-transform",
                  openSelector === "size" && "rotate-180",
                )}
              />
            </div>
          </button>
          {openSelector === "size" && (
            <div className="flex flex-wrap gap-2 pb-4">
              {FINGER_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size);
                    setOpenSelector(null);
                  }}
                  className={cn(
                    "w-14 rounded-lg border py-2 text-sm transition-colors",
                    selectedSize === size
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/40",
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Engraving */}
        <div>
          <button
            className="flex h-16 w-full items-center justify-between py-4"
            onClick={() => toggleSelector("engraving")}
          >
            <span className="text-base text-muted-foreground">
              Engraving text
            </span>
            <div className="flex items-center gap-3">
              <span className="text-base text-foreground underline">
                {engravingText || "Add engraving"}
              </span>
              <IconChevronDown
                size={24}
                className={cn(
                  "shrink-0 transition-transform",
                  openSelector === "engraving" && "rotate-180",
                )}
              />
            </div>
          </button>
          {openSelector === "engraving" && (
            <div className="pb-4">
              <input
                type="text"
                value={engravingText}
                onChange={(e) => setEngravingText(e.target.value)}
                placeholder="Enter engraving text..."
                maxLength={30}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                {engravingText.length}/30 characters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CTA — proceed to stone selection */}
      <Link
        href={getStoneSelectionHref()}
        className="mt-3 flex h-15 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-sm font-medium text-background transition-colors hover:bg-foreground/90"
      >
        Proceed to stone selection
        <IconArrowRight size={20} />
      </Link>
    </div>
  );
}
