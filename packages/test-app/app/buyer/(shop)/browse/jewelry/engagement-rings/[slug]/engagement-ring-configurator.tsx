"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";
import {
  Button,
  ToggleGroup,
  ToggleGroupItem,
} from "@nivoda/components";
import { PdpPrimaryAction } from "@nivoda/components/components/templates/pdp/pdp-primary-action";
import { PdpVariantSelector } from "@nivoda/components/components/templates/pdp/pdp-variant-selector";

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

function formatMetalLabel(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export type EngagementRingConfiguratorProps = {
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

export function EngagementRingConfigurator({
  slug,
  defaultStoneShape,
  defaultMetal,
  availableStoneShapes,
  availableMetals,
  compatibleStones,
}: EngagementRingConfiguratorProps) {
  const [stoneShape, setStoneShape] = useState(defaultStoneShape);
  const [metal, setMetal] = useState(defaultMetal);
  const [size, setSize] = useState("7");

  const stoneSelectionHref = useMemo(() => {
    const shapeMatch = compatibleStones.find(
      (cs) => cs.shape.value === stoneShape,
    );
    const metalMatch = availableMetals.find((m) => m.value === metal);
    const params = new URLSearchParams({
      shapeId: shapeMatch?.shape.id ?? "",
      maxCarat: String(shapeMatch?.maxCarat ?? 10),
      metalId: metalMatch?.id ?? "",
      size,
    });
    return `/buyer/browse/jewelry/engagement-rings/${slug}/select-stone?${params.toString()}`;
  }, [slug, stoneShape, metal, size, compatibleStones, availableMetals]);

  return (
    <div className="flex flex-col gap-6">
      {availableStoneShapes.length > 0 && (
        <PdpVariantSelector label="Centre stone shape">
          <ToggleGroup
            className="w-full flex-wrap"
            variant="outline"
            spacing={2}
            type="single"
            value={stoneShape}
            onValueChange={(v) => v && setStoneShape(v)}
          >
            {availableStoneShapes.map((s) => (
              <ToggleGroupItem key={s.id} value={s.value}>
                {s.value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </PdpVariantSelector>
      )}

      {availableMetals.length > 0 && (
        <PdpVariantSelector label="Metal">
          <ToggleGroup
            className="w-full flex-wrap"
            variant="outline"
            spacing={2}
            type="single"
            value={metal}
            onValueChange={(v) => v && setMetal(v)}
          >
            {availableMetals.map((m) => (
              <ToggleGroupItem key={m.id} value={m.value}>
                {formatMetalLabel(m.value)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </PdpVariantSelector>
      )}

      <PdpVariantSelector label="Finger size">
        <ToggleGroup
          className="w-full flex-wrap"
          variant="outline"
          spacing={2}
          type="single"
          value={size}
          onValueChange={(v) => v && setSize(v)}
        >
          {FINGER_SIZES.map((s) => (
            <ToggleGroupItem key={s} className="w-12" value={s}>
              {s}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </PdpVariantSelector>

      <PdpPrimaryAction>
        <Button asChild className="w-full" size="lg">
          <Link href={stoneSelectionHref}>
            Proceed to stone selection
            <IconArrowRight size={16} />
          </Link>
        </Button>
      </PdpPrimaryAction>
    </div>
  );
}
