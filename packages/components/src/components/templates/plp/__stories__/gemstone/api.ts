// ── Gemstone data layer ───────────────────────────────────────────────
//
// Types, filter schema, and fixture generator. Pure data — no JSX, no
// React. Mirrors what a real backend would return for the Gemstone
// category.

import type { AsyncComboboxOption } from "../../../../molecules/async-combobox-filter/async-combobox-filter";
import type { RangeAxis } from "../../../../molecules/range-filter/range-filter";
import { buildMockHistogram } from "../shared/fixtures";
import gemstoneImg from "../shared/images/gemstone.png";

export interface GemstoneItem {
  id: string;
  name: string;
  image: string;
  stockId: string;
  origin: string;
  certLab: string;
  certNumber: string;
  price: number;
  pricePerCarat: number;
  isExpress: boolean;
  isReturnable: boolean;
  discount: number | undefined;
  originalPrice: number | undefined;
  includeTariffs: boolean;
}

/**
 * Filter-state shape for the gemstone mock PLP. Each key corresponds to
 * one filter rendered in the toolbar / drawer. `nivoda-curated` is a
 * static boolean filter, not a schema facet, so it doesn't appear in
 * `GEMSTONE_FILTER_SCHEMA`.
 */
export interface GemstoneFilterState {
  "nivoda-curated"?: true;
  color?: string[];
  clarity?: string[];
  treatment?: string;
  location?: string;
  price?: Record<string, { min: number; max: number }>;
  carat?: Record<string, { min: number; max: number }>;
  size?: Record<string, { min: number; max: number }>;
  supplier?: AsyncComboboxOption[];
}

export const GEMSTONE_FILTER_SCHEMA = {
  color: [
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "red", label: "Red" },
    { value: "teal", label: "Teal" },
    { value: "pink", label: "Pink" },
    { value: "yellow", label: "Yellow" },
  ],
  clarity: [
    { value: "eye-clean", label: "Eye clean" },
    { value: "slightly-included", label: "Slightly included" },
    { value: "moderately-included", label: "Moderately included" },
    { value: "visibly-included", label: "Visibly included" },
  ],
  treatment: [
    { value: "none", label: "None" },
    { value: "heated", label: "Heated" },
    { value: "oiled", label: "Oiled" },
  ],
  location: [
    { value: "us", label: "United States" },
    { value: "eu", label: "Europe" },
    { value: "asia", label: "Asia" },
  ],
  price: {
    id: "price",
    min: 0,
    max: 10000,
    step: 10,
    unit: "$",
    histogram: buildMockHistogram(0, 10000, 40, 2500),
  } as RangeAxis,
  carat: {
    id: "carat",
    min: 0,
    max: 10,
    step: 0.1,
    unit: "ct",
    histogram: buildMockHistogram(0, 10, 40, 2),
  } as RangeAxis,
  size: [
    { id: "length", label: "Length", min: 0, max: 20, step: 0.1, unit: "mm" },
    { id: "width", label: "Width", min: 0, max: 20, step: 0.1, unit: "mm" },
    { id: "depth", label: "Depth", min: 0, max: 10, step: 0.1, unit: "mm" },
  ] as RangeAxis[],
} as const;

export function generateGemstoneItems(count: number): GemstoneItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `gem-${i}`,
    name: `Emerald Green Radiant ${(1 + i * 0.1).toFixed(1)}ct`,
    image: gemstoneImg,
    stockId: `GR-${10000 + i}`,
    origin: "Brazil",
    certLab: "IGI",
    certNumber: `287329${300 + i}`,
    price: 1910 + i * 100,
    pricePerCarat: 1910.7,
    isExpress: i % 4 === 0,
    isReturnable: i % 3 !== 0,
    discount: i % 5 === 0 ? 25 : undefined,
    originalPrice: i % 5 === 0 ? 2548 : undefined,
    includeTariffs: true,
  }));
}
