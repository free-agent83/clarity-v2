"use client";

import { useState } from "react";
import { IconChevronDown, IconExternalLink } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type DiamondCertificateInfoProps = {
  lab: string;
  certificateNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
};

export function DiamondCertificateInfo({
  lab,
  certificateNumber,
  shape,
  carat,
  color,
  clarity,
  cut,
}: DiamondCertificateInfoProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xl font-medium leading-8 text-foreground">
        Certificate Details
      </h2>
      <div className="flex flex-col overflow-hidden rounded-lg border border-border">
        {/* Toggle header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-secondary/50"
        >
          <span className="text-sm font-medium text-foreground">
            {lab} {certificateNumber}
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
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm text-muted-foreground">Lab</span>
              <span className="text-sm font-medium text-foreground">{lab}</span>
            </div>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm text-muted-foreground">
                Certificate #
              </span>
              <span className="text-sm font-medium text-foreground">
                {certificateNumber}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm text-muted-foreground">Shape</span>
              <span className="text-sm font-medium text-foreground">
                {shape}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm text-muted-foreground">Carat</span>
              <span className="text-sm font-medium text-foreground">
                {carat.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm text-muted-foreground">Color</span>
              <span className="text-sm font-medium text-foreground">
                {color}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-sm text-muted-foreground">Clarity</span>
              <span className="text-sm font-medium text-foreground">
                {clarity}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-muted-foreground">Cut</span>
              <span className="text-sm font-medium text-foreground">{cut}</span>
            </div>
          </div>
        )}

        {/* External link */}
        <div className="border-t border-border px-4 py-3">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <IconExternalLink size={16} />
            View on {lab} website
          </span>
        </div>
      </div>
    </div>
  );
}
