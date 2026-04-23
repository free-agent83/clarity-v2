import Link from "next/link";
import { Badge, Button, TableHead } from "@nivoda/components";
import {
  PlpListBodyCell,
  PlpListBodyRow,
  PlpListHeaderCell,
  PlpListHeaderRow,
  PlpListRowActions,
  PlpListRowDelivery,
  PlpListRowMedia,
  PlpListRowPrice,
  PlpListRowReturnable,
} from "@nivoda/components/components/templates/plp/list/plp-list-row";

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

export function EngagementRingPlpListHeader() {
  return (
    <PlpListHeaderRow>
      <PlpListHeaderCell hug>
        <span className="sr-only">Thumbnail</span>
      </PlpListHeaderCell>
      <TableHead>Name</TableHead>
      <TableHead>SKU</TableHead>
      <TableHead>Band style</TableHead>
      <TableHead>Stone shapes</TableHead>
      <TableHead>Metals</TableHead>
      <TableHead className="text-end">Starting from</TableHead>
      <TableHead className="text-center">Ret</TableHead>
      <TableHead>Delivery</TableHead>
      <PlpListHeaderCell sticky="right">
        <span className="sr-only">Actions</span>
      </PlpListHeaderCell>
    </PlpListHeaderRow>
  );
}

export type EngagementRingPlpListRowProps = {
  item: EngagementRingItem;
  href: string;
};

export function EngagementRingPlpListRow({
  item,
  href,
}: EngagementRingPlpListRowProps) {
  const mock = getPlpItemMock(item.id);
  const thumbnail = getThumbnailUrl(item.images);
  const metals = getMetalSwatches(item);
  const stoneShapes = item.compatibleStones.map((cs) => cs.shape);
  const minPrice =
    item.availableMetals.length > 0
      ? Math.min(...item.availableMetals.map((am) => am.priceUsd))
      : 0;

  return (
    <PlpListBodyRow>
      <PlpListBodyCell hug>
        <PlpListRowMedia image={thumbnail} imageAlt={item.description} />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <Link
          href={href}
          className="font-medium hover:underline focus-visible:underline focus-visible:outline-none"
        >
          {item.description}
        </Link>
      </PlpListBodyCell>
      <PlpListBodyCell className="font-mono">{item.sku}</PlpListBodyCell>
      <PlpListBodyCell>{item.bandStyle.value}</PlpListBodyCell>
      <PlpListBodyCell>
        <div className="flex flex-wrap gap-1">
          {stoneShapes.map((s) => (
            <Badge key={s.id} variant="outline" size="sm">
              {s.value}
            </Badge>
          ))}
        </div>
      </PlpListBodyCell>
      <PlpListBodyCell>
        <div className="flex items-center gap-1">
          {metals.map((m) => (
            <span
              key={m.value}
              className="size-3 rounded-full border border-border"
              style={{ backgroundColor: m.swatch }}
              title={m.value}
            />
          ))}
        </div>
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPrice amount={minPrice} currency="USD" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowReturnable
          variant={mock.isReturnable ? "returnable" : "non-returnable"}
        />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowDelivery
          variant={mock.isExpress ? "express" : "regular"}
          date={mock.deliveryDate}
          shipsFrom={mock.shipsFrom}
        />
      </PlpListBodyCell>
      <PlpListBodyCell sticky="right">
        <PlpListRowActions>
          <Button asChild size="sm" variant="outline">
            <Link href={href}>Configure</Link>
          </Button>
        </PlpListRowActions>
      </PlpListBodyCell>
    </PlpListBodyRow>
  );
}
