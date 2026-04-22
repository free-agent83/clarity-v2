import type { SortOption } from "../plp-types";

export const SORT_OPTIONS: SortOption[] = [
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "newest", label: "Newest" },
  { value: "featured", label: "Featured" },
];

export const SAMPLE_360_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
