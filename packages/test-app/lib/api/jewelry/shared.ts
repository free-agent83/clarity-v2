export interface JewelryItemBase {
  id: string;
  sku: string;
  description: string;
  images: { url: string; sortOrder: number; isThumbnail: boolean }[];
}

/** Get the thumbnail image URL from a list of product images */
export function getThumbnailUrl(
  images: { url: string; sortOrder: number; isThumbnail: boolean }[],
): string {
  return (
    images.find((img) => img.isThumbnail)?.url ??
    images.find((img) => img.sortOrder === 0)?.url ??
    images[0]?.url ??
    ""
  );
}
