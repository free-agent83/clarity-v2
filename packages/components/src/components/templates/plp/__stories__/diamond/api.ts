// ── Diamond data layer ────────────────────────────────────────────────
//
// Types, filter schema, and fixture generator. Pure data — no JSX, no
// React. Mirrors what a real backend would return for the Diamond
// category: item shape, the set of facets the UI can filter on, and a
// seed function that stands in for a paginated items endpoint.

import type { AsyncComboboxOption } from "../../../../molecules/async-combobox-filter/async-combobox-filter";
import type { RangeAxis } from "../../../../molecules/range-filter/range-filter";
import { buildMockHistogram } from "../shared/fixtures";
import diamondImg from "../shared/images/diamond.png";

export interface DiamondItem {
  id: string;
  name: string;
  image: string;
  stockId: string;
  carat: number;
  color: string;
  clarity: string;
  shape: string;
  origin: string;
  certLab: string;
  certNumber: string;
  price: number;
  pricePerCarat: number;
  isExpress: boolean;
  isReturnable: boolean;
}

export interface DiamondFilterState {
  shape?: string[];
  color?: string[];
  clarity?: string[];
  price?: Record<string, { min: number; max: number }>;
  carat?: Record<string, { min: number; max: number }>;
  size?: Record<string, { min: number; max: number }>;
  supplier?: AsyncComboboxOption[];
}

export const DIAMOND_FILTER_SCHEMA = {
  shape: [
    { value: "round", label: "Round" },
    { value: "oval", label: "Oval" },
    { value: "cushion", label: "Cushion" },
    { value: "princess", label: "Princess" },
  ],
  color: ["D", "E", "F", "G", "H", "I"].map((c) => ({ value: c, label: c })),
  clarity: ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1"].map((c) => ({
    value: c,
    label: c,
  })),
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

export function generateDiamondItems(count: number): DiamondItem[] {
  const shapes = ["Round", "Oval", "Cushion", "Princess", "Pear", "Emerald"];
  const colors = ["D", "E", "F", "G", "H", "I"];
  const clarities = ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1"];
  const origins = ["Botswana", "Russia", "Canada", "Australia", "South Africa"];
  const labs = ["GIA", "IGI", "AGS"];

  return Array.from({ length: count }, (_, i) => ({
    id: `diamond-${i}`,
    name: `${(0.5 + i * 0.1).toFixed(2)}ct ${shapes[i % shapes.length]} Diamond`,
    image: diamondImg,
    stockId: `DM-${10000 + i}`,
    carat: Number((0.5 + i * 0.1).toFixed(2)),
    color: colors[i % colors.length],
    clarity: clarities[i % clarities.length],
    shape: shapes[i % shapes.length],
    origin: origins[i % origins.length],
    certLab: labs[i % labs.length],
    certNumber: `${287329000 + i}`,
    price: 2500 + i * 350,
    pricePerCarat: 5000 + i * 100,
    isExpress: i % 5 === 0,
    isReturnable: i % 3 !== 0,
  }));
}
