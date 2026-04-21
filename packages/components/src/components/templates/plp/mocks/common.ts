import type { SortOption } from "../plp-types";
import { MOCK_LATENCY, simulateApiCall } from "./simulate-api-call";

/**
 * Sample 360 rotation video — used for ~1/3 of mock items in PLP stories.
 * If this URL becomes unavailable, swap for another small public MP4.
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

export async function mockSupplierSearch(query: string) {
  await simulateApiCall(MOCK_LATENCY.search);
  const q = query.toLowerCase();
  return MOCK_SUPPLIERS.filter((s) => s.label.toLowerCase().includes(q));
}

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

export const SORT_OPTIONS: SortOption[] = [
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured" },
];

/**
 * Mock preview-count fetcher for stories. Simulates a backend call that
 * returns a count derived from the current draft filter state. Debounced
 * by the caller via `setTimeout`-based delay.
 *
 * Shape-agnostic: counts any keys whose value is not `undefined`.
 */
export async function mockPreviewCount(draftState: object): Promise<number> {
  await simulateApiCall(MOCK_LATENCY.fetch);
  const activeCount = Object.values(draftState).filter(
    (v) => v !== undefined
  ).length;
  return Math.max(1, Math.round(1_234_567 / (activeCount * 3 + 1)));
}
