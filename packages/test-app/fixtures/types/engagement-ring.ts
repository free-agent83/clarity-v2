export interface JewelryImage {
  url: string;
  sortOrder: number;
  isThumbnail: boolean;
}

export interface JewelryItemBase {
  id: string;
  sku: string;
  description: string;
  images: JewelryImage[];
}

export interface EngagementRingItem extends JewelryItemBase {
  bandStyle: { id: string; value: string };
  ringWidthMm: number | null;
  availableMetals: {
    id: string;
    metal: { id: string; value: string };
    priceUsd: number;
  }[];
  compatibleStones: {
    id: string;
    shape: { id: string; value: string };
    maxCarat: number;
  }[];
}

export interface EngagementRingListItem {
  id: string;
  sku: string;
  description: string;
  bandStyle: string;
  image: string;
  minPriceUsd: number;
  availableMetalTypes: string[];
  availableStoneShapes: string[];
}

export function getThumbnailUrl(images: JewelryImage[]): string {
  return (
    images.find((img) => img.isThumbnail)?.url ??
    images.find((img) => img.sortOrder === 0)?.url ??
    images[0]?.url ??
    ""
  );
}

export const toEngagementRingListItem = (
  r: EngagementRingItem,
): EngagementRingListItem => ({
  id: r.id,
  sku: r.sku,
  description: r.description,
  bandStyle: r.bandStyle.value,
  image: getThumbnailUrl(r.images),
  minPriceUsd: r.availableMetals.length
    ? Math.min(...r.availableMetals.map((m) => m.priceUsd))
    : 0,
  availableMetalTypes: r.availableMetals.map((m) => m.metal.value),
  availableStoneShapes: r.compatibleStones.map((s) => s.shape.value),
});
