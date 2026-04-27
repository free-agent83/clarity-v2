import Link from "next/link";
import { Badge, Button, Typography } from "@nivoda/components";
import {
  PlpGridItem,
  PlpGridItemDelivery,
  PlpGridItemMedia,
  PlpGridItemName,
  PlpGridItemPrice,
  PlpGridItemPrimaryAction,
  PlpGridItemReturnable,
} from "@nivoda/components/components/templates/plp/grid/plp-grid-item";

import type { EngagementRingItem } from "@/lib/api/jewelry";
import { getThumbnailUrl } from "@/lib/api/jewelry/shared";

import { getPlpItemMock } from "./plp-item-mocks";

const METAL_SWATCH_COLORS: Record<string, string> = {
  "14k_yellow_gold": "#e6c24b",
  "18k_yellow_gold": "#e6c24b",
  "14k_rose_gold": "#e8b4a8",
  "18k_rose_gold": "#e8b4a8",
  "10k_white_gold": "#e0e0e0",
  "14k_white_gold": "#e0e0e0",
  "18k_white_gold": "#e0e0e0",
  "950_platinum": "#9ba0a8",
};

function getMetalSwatches(item: EngagementRingItem) {
  const seen = new Set<string>();
  const swatches: { value: string; swatch: string }[] = [];
  for (const am of item.availableMetals) {
    const v = am.metal.value;
    if (!seen.has(v) && METAL_SWATCH_COLORS[v]) {
      seen.add(v);
      swatches.push({ value: v, swatch: METAL_SWATCH_COLORS[v] });
    }
  }
  return swatches;
}

export type EngagementRingPlpItemProps = {
  item: EngagementRingItem;
  href: string;
};

export function EngagementRingPlpItem({
  item,
  href,
}: EngagementRingPlpItemProps) {
  const mock = getPlpItemMock(item.id);
  const thumbnail = getThumbnailUrl(item.images);
  const metals = getMetalSwatches(item);
  const stoneShapes = item.compatibleStones.map((cs) => cs.shape);
  const minPrice =
    item.availableMetals.length > 0
      ? Math.min(...item.availableMetals.map((am) => am.priceUsd))
      : 0;

  return (
    <PlpGridItem>
      <PlpGridItemMedia image={thumbnail} imageAlt={item.description} />

      <PlpGridItemName>
        <Link
          href={href}
          className="hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {item.description}
        </Link>
      </PlpGridItemName>

      <Typography variant="caption" className="text-muted-foreground">
        {item.bandStyle.value} · SKU {item.sku}
      </Typography>

      {stoneShapes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {stoneShapes.map((s) => (
            <Badge key={s.id} variant="outline" size="sm" title={s.value}>
              {s.value}
            </Badge>
          ))}
        </div>
      )}

      {metals.length > 0 && (
        <div className="flex items-center gap-2">
          {metals.map((m) => (
            <span
              key={m.value}
              className="size-3.5 rounded-full border border-border"
              style={{ backgroundColor: m.swatch }}
              title={m.value}
            />
          ))}
        </div>
      )}

      <PlpGridItemDelivery
        variant={mock.isExpress ? "express" : "regular"}
        businessDays={mock.businessDays}
        date={mock.deliveryDate}
        shipsFrom={mock.shipsFrom}
      />

      <PlpGridItemReturnable
        variant={mock.isReturnable ? "returnable" : "non-returnable"}
      />

      <PlpGridItemPrice amount={minPrice} currency="USD" />

      <PlpGridItemPrimaryAction>
        <Button asChild className="w-full">
          <Link href={href}>Configure</Link>
        </Button>
      </PlpGridItemPrimaryAction>
    </PlpGridItem>
  );
}
