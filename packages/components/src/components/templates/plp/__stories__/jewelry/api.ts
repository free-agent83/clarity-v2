// ── Jewelry data layer ────────────────────────────────────────────────
//
// Types, filter schema, and fixture generator. Pure data — no JSX, no
// React. Mirrors what a real backend would return for the Jewelry
// category.

import ringImg from "../shared/images/ring.jpg";

export interface JewelryItem {
  id: string;
  name: string;
  image: string;
  sku: string;
  price: number;
  shipsFrom: string;
}

export interface JewelryFilterState {
  "stone-shape"?: string[];
  metal?: string[];
  style?: string[];
}

export const JEWELRY_FILTER_SCHEMA = {
  "stone-shape": [
    { value: "round", label: "Round" },
    { value: "oval", label: "Oval" },
    { value: "cushion", label: "Cushion" },
  ],
  metal: [
    { value: "gold", label: "Gold" },
    { value: "platinum", label: "Platinum" },
    { value: "silver", label: "Silver" },
  ],
  style: [
    { value: "solitaire", label: "Solitaire" },
    { value: "halo", label: "Halo" },
    { value: "three-stone", label: "Three stone" },
  ],
} as const;

export function generateJewelryItems(count: number): JewelryItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `ring-${i}`,
    name: "Three-Stone Anniversary Band",
    image: ringImg,
    sku: "SKU 100019ERDPL",
    price: 9999.0,
    shipsFrom: "United States",
  }));
}
