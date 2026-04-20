import { fn } from "@storybook/test";
import { Badge } from "../../../atoms/badge/badge";
import type { FilterDefinition, GridItemData, ListColumn } from "../plp-types";
import {
  SAMPLE_360_VIDEO_URL,
  buildMockHistogram,
  mockSupplierSearch,
} from "./common";

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

export const DIAMOND_FILTERS: FilterDefinition[] = [
  {
    id: "shape",
    label: "Shape",
    preset: "multi-select-chips",
    isQuickFilter: true,
    options: [
      { value: "round", label: "Round" },
      { value: "oval", label: "Oval" },
      { value: "cushion", label: "Cushion" },
      { value: "princess", label: "Princess" },
    ],
  },
  {
    id: "color",
    label: "Color",
    preset: "multi-select-chips",
    isQuickFilter: true,
    options: ["D", "E", "F", "G", "H", "I"].map((c) => ({ value: c, label: c })),
  },
  {
    id: "clarity",
    label: "Clarity",
    preset: "multi-select-chips",
    options: ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1"].map((c) => ({
      value: c,
      label: c,
    })),
  },
  {
    id: "price",
    label: "Price",
    preset: "range-slider",
    isQuickFilter: true,
    min: 0,
    max: 10000,
    step: 10,
    unit: "$",
    histogram: buildMockHistogram(0, 10000, 40, 2500),
  },
  {
    id: "carat",
    label: "Carat",
    preset: "range-slider",
    min: 0,
    max: 10,
    step: 0.1,
    unit: "ct",
    histogram: buildMockHistogram(0, 10, 40, 2),
  },
  {
    id: "size",
    label: "Size (mm)",
    preset: "multi-axis-range",
    axes: [
      { id: "length", label: "Length", min: 0, max: 20, step: 0.1, unit: "mm" },
      { id: "width", label: "Width", min: 0, max: 20, step: 0.1, unit: "mm" },
      { id: "depth", label: "Depth", min: 0, max: 10, step: 0.1, unit: "mm" },
    ],
  },
  {
    id: "supplier",
    label: "Supplier",
    preset: "async-combobox",
    searchFn: mockSupplierSearch,
    searchPlaceholder: "Search suppliers...",
  },
];

export function generateDiamondItems(count: number): DiamondItem[] {
  const shapes = ["Round", "Oval", "Cushion", "Princess", "Pear", "Emerald"];
  const colors = ["D", "E", "F", "G", "H", "I"];
  const clarities = ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1"];
  const origins = ["Botswana", "Russia", "Canada", "Australia", "South Africa"];
  const labs = ["GIA", "IGI", "AGS"];

  return Array.from({ length: count }, (_, i) => ({
    id: `diamond-${i}`,
    name: `${(0.5 + i * 0.1).toFixed(2)}ct ${shapes[i % shapes.length]} Diamond`,
    image: `https://placehold.co/400x400/f5f5f4/a3a3a3?text=Diamond+${i + 1}`,
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

export function diamondRenderGridItem(item: DiamondItem): GridItemData {
  return {
    id: item.id,
    name: item.name,
    thumbnailSrc: item.image,
    thumbnailAlt: item.name,
    lead: <span>{item.stockId}</span>,
    badges: [
      <Badge key="lab" variant="outline" size="sm">{item.certLab}</Badge>,
      <Badge key="origin" variant="outline" size="sm">{item.origin}</Badge>,
    ],
    categorySlotTop: (
      <div className="text-xs text-muted-foreground">
        {item.carat.toFixed(2)}ct · {item.shape} · {item.color} · {item.clarity}
      </div>
    ),
    delivery: {
      estimatedDate: "Nov 18 – 23",
      shipsFrom: item.origin,
      isExpress: item.isExpress,
    },
    returns: { isReturnable: item.isReturnable },
    pricing: {
      amount: item.price,
      currency: "USD",
      perCarat: { amount: item.pricePerCarat, currency: "USD" },
    },
    media360:
      Number.parseInt(item.id.replace(/\D/g, ""), 10) % 3 === 0
        ? { videoUrl: SAMPLE_360_VIDEO_URL }
        : undefined,
    onAddToCart: fn(),
    onFavorite: fn(),
    onShare: fn(),
    onViewMedia: fn(),
  };
}

export const DIAMOND_LIST_COLUMNS: ListColumn<DiamondItem>[] = [
  {
    id: "carat",
    header: "Carat",
    cell: (item) => item.carat.toFixed(2),
    align: "right",
  },
  {
    id: "shape",
    header: "Shape",
    cell: (item) => item.shape,
  },
  {
    id: "color",
    header: "Color",
    cell: (item) => item.color,
    align: "center",
  },
  {
    id: "clarity",
    header: "Clarity",
    cell: (item) => item.clarity,
    align: "center",
  },
  {
    id: "origin",
    header: "Origin",
    cell: (item) => item.origin,
  },
  {
    id: "cert",
    header: "Certificate",
    cell: (item) => (
      <span className="font-mono text-xs">
        {item.certLab} {item.certNumber}
      </span>
    ),
  },
];
