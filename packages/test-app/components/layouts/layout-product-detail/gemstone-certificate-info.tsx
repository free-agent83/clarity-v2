"use client";

import { useState } from "react";
import { IconChevronDown, IconExternalLink } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type GemstoneCertificateInfoProps = {
  lab: string;
  certificateNumber: string;
  type: string;
  origin: string;
  treatment: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
};

export function GemstoneCertificateInfo({
  lab,
  certificateNumber,
  type,
  origin,
  treatment,
  shape,
  carat,
  color,
  clarity,
  cut,
}: GemstoneCertificateInfoProps) {
  const [isOpen, setIsOpen] = useState(true);

  const rows = [
    { label: "Lab", value: lab },
    { label: "Certificate #", value: certificateNumber },
    { label: "Type", value: type },
    { label: "Origin", value: origin },
    { label: "Treatment", value: treatment },
    { label: "Shape", value: shape },
    { label: "Carat", value: carat.toFixed(2) },
    { label: "Color", value: color },
    { label: "Clarity", value: clarity },
    { label: "Cut", value: cut },
  ];

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
