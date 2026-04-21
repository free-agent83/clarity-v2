// ── Shared story fixtures ─────────────────────────────────────────────
//
// Static reference data the story layer pretends came from a backend:
// sort options, supplier directory, sample assets, and the histogram
// authoring helper used when domains bake their filter schemas at
// module load. No async, no fetch emulation — that lives in `./api.ts`.

import type { SortOption } from "../../plp-types";

/**
 * Sample 360 rotation video — used for ~1/3 of mock items in PLP
 * stories. If this URL becomes unavailable, swap for another small
 * public MP4.
 */
export const SAMPLE_360_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export const MOCK_SUPPLIERS: { value: string; label: string }[] = [
  { value: "sup-acme", label: "Acme Gem Traders" },
  { value: "sup-globex", label: "Globex Mining Co." },
  { value: "sup-initech", label: "Initech Stones" },
  { value: "sup-umbrella", label: "Umbrella Gemstones Ltd." },
  { value: "sup-hooli", label: "Hooli Premium" },
  { value: "sup-pied", label: "Pied Piper Rough" },
  { value: "sup-stark", label: "Stark Industries Jewellery" },
  { value: "sup-wayne", label: "Wayne Enterprises Minerals" },
  { value: "sup-cyberdyne", label: "Cyberdyne Gems" },
  { value: "sup-tyrell", label: "Tyrell Heritage Stones" },
];

export const SORT_OPTIONS: SortOption[] = [
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured" },
];

export function buildMockHistogram(
  min: number,
  max: number,
  bucketCount: number,
  peakAt: number
): { buckets: number[]; min: number; max: number } {
  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const bucketCenter = min + ((i + 0.5) * (max - min)) / bucketCount;
    const distanceFromPeak = Math.abs(bucketCenter - peakAt);
    const peakWidth = (max - min) / 4;
    const normalized = Math.max(0, 1 - distanceFromPeak / peakWidth);
    return Math.round(normalized * 40 + Math.random() * 10);
  });
  return { buckets, min, max };
}
