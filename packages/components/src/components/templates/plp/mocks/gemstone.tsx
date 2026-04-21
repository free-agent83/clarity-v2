import { fn } from "@storybook/test";
import { IconHeart, IconPhoto, IconShare } from "@tabler/icons-react";
import { Badge } from "../../../atoms/badge/badge";
import { Button } from "../../../atoms/button/button";
import { Typography } from "../../../atoms/typography/typography";
import {
  PlpGridItem,
  PlpGridItemMedia,
  PlpGridItemMediaAction,
  PlpGridItemMediaToolbar,
  PlpGridItemName,
  PlpGridItemDelivery,
  PlpGridItemReturnable,
  PlpGridItemPrice,
  PlpGridItemPrimaryAction,
} from "../grid/plp-grid-item";
import { useStorybookAppUser } from "../../../../../.storybook/app-user-context";
import type { FilterDefinition, GridItemData, ListColumn } from "../plp-types";
import {
  MOCK_SUPPLIERS,
  SAMPLE_360_VIDEO_URL,
  buildMockHistogram,
  mockSupplierSearch,
} from "./common";

// Module-level mock handlers so every rendered card shares identity.
const onAddToShortlist = fn();
const onShare = fn();
const onViewMedia = fn();
const onAddToCart = fn();

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

export const GEMSTONE_FILTERS: FilterDefinition[] = [
  {
    id: "nivoda-curated",
    label: "Nivoda Curated",
    preset: "boolean-chip",
    chipLabel: "Only Nivoda Curated items",
    isQuickFilter: true,
  },
  {
    id: "color",
    label: "Color",
    preset: "multi-select-chips",
    isQuickFilter: true,
    popoverWidth: 320,
    options: [
      { value: "blue", label: "Blue" },
      { value: "green", label: "Green" },
      { value: "red", label: "Red" },
      { value: "teal", label: "Teal" },
      { value: "pink", label: "Pink" },
      { value: "yellow", label: "Yellow" },
    ],
  },
  {
    id: "clarity",
    label: "Clarity",
    preset: "multi-select-chips",
    options: [
      { value: "eye-clean", label: "Eye clean" },
      { value: "slightly-included", label: "Slightly included" },
      { value: "moderately-included", label: "Moderately included" },
      { value: "visibly-included", label: "Visibly included" },
    ],
  },
  {
    id: "treatment",
    label: "Treatment",
    preset: "single-select-chips",
    options: [
      { value: "none", label: "None" },
      { value: "heated", label: "Heated" },
      { value: "oiled", label: "Oiled" },
    ],
  },
  {
    id: "location",
    label: "Location",
    preset: "single-select-dropdown",
    options: [
      { value: "us", label: "United States" },
      { value: "eu", label: "Europe" },
      { value: "asia", label: "Asia" },
    ],
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

// Pre-seed supplier options for stories that start with a value set
const _gemstoneSupplier = GEMSTONE_FILTERS.find((f) => f.id === "supplier");
if (_gemstoneSupplier && _gemstoneSupplier.preset === "async-combobox") {
  _gemstoneSupplier.options = MOCK_SUPPLIERS.filter((s) =>
    ["sup-acme", "sup-globex", "sup-initech"].includes(s.value)
  );
}

export function generateGemstoneItems(count: number): GemstoneItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `gem-${i}`,
    name: `Emerald Green Radiant ${(1 + i * 0.1).toFixed(1)}ct`,
    image: `https://placehold.co/400x400/f5f5f4/a3a3a3?text=Gem+${i + 1}`,
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

export function gemstoneRenderGridItem(item: GemstoneItem): GridItemData {
  return {
    id: item.id,
    name: item.name,
    thumbnailSrc: item.image,
    thumbnailAlt: item.name,
    lead: <span>{item.stockId}</span>,
    badges: [
      <Badge key="origin" variant="outline" size="sm">{item.origin}</Badge>,
      <Badge key="curated" variant="info" size="sm">Nivoda Curated</Badge>,
    ],
    categorySlotTop: (
      <div className="text-xs text-muted-foreground">
        Watermelon · Light color · 5.95 × 5.89 × 2.76mm
      </div>
    ),
    delivery: {
      estimatedDate: "Nov 18 – 23",
      shipsFrom: "United States",
      isExpress: item.isExpress,
    },
    returns: { isReturnable: item.isReturnable },
    pricing: {
      amount: item.price,
      currency: "USD",
      perCarat: { amount: item.pricePerCarat, currency: "USD" },
      discount: item.discount
        ? { percentage: item.discount, originalAmount: item.originalPrice! }
        : undefined,
      includeTariffs: item.includeTariffs,
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

/**
 * Storybook-only category card assembled from PlpGridItem primitives.
 * Drives the "Nivoda Curated" treatment, tariff note (when the user is
 * in the US), discount line, and per-carat secondary line based on the
 * item data and the current emulated app-user context.
 */
export function GemstonePlpGridItem({ item }: { item: GemstoneItem }) {
  const userContext = useStorybookAppUser();

  const video =
    Number.parseInt(item.id.replace(/\D/g, ""), 10) % 3 === 0
      ? SAMPLE_360_VIDEO_URL
      : undefined;

  const showTariffNote = item.includeTariffs && userContext.location === "US";
  const alternateCurrency =
    userContext.currency !== "USD"
      ? { amount: item.price, currency: userContext.currency }
      : undefined;
  const discount =
    item.discount !== undefined && item.originalPrice !== undefined
      ? { percentage: item.discount, originalAmount: item.originalPrice }
      : undefined;

  return (
    <PlpGridItem>
      <PlpGridItemMedia image={item.image} imageAlt={item.name} video={video}>
        <PlpGridItemMediaToolbar>
          <PlpGridItemMediaAction
            icon={IconHeart}
            label="Add to shortlist"
            onClick={onAddToShortlist}
          />
          <PlpGridItemMediaAction
            icon={IconShare}
            label="Share"
            onClick={onShare}
          />
          <PlpGridItemMediaAction
            icon={IconPhoto}
            label="View media"
            onClick={onViewMedia}
          />
        </PlpGridItemMediaToolbar>
      </PlpGridItemMedia>

      <PlpGridItemName>{item.name}</PlpGridItemName>

      <Typography variant="caption" className="text-muted-foreground">
        {item.stockId}
      </Typography>

      <div className="flex flex-wrap gap-1">
        <Badge variant="outline" size="sm">
          {item.origin}
        </Badge>
        <Badge variant="info" size="sm">
          Nivoda Curated
        </Badge>
      </div>

      <Typography variant="caption" className="text-muted-foreground">
        Watermelon · Light color · 5.95 × 5.89 × 2.76mm
      </Typography>

      <PlpGridItemDelivery
        variant={item.isExpress ? "express" : "regular"}
        date="Nov 18 – 23"
        shipsFrom="United States"
      />

      <PlpGridItemReturnable
        variant={item.isReturnable ? "returnable" : "non-returnable"}
      />

      <PlpGridItemPrice
        amount={item.price}
        currency="USD"
        perCarat={{ amount: item.pricePerCarat, currency: "USD" }}
        discount={discount}
        includeTariffs={showTariffNote}
        alternateCurrency={alternateCurrency}
      />

      <PlpGridItemPrimaryAction>
        <Button className="w-full" onClick={onAddToCart}>
          Add to cart
        </Button>
      </PlpGridItemPrimaryAction>
    </PlpGridItem>
  );
}

export const GEMSTONE_LIST_COLUMNS: ListColumn<GemstoneItem>[] = [
  {
    id: "stockId",
    header: "Stock ID",
    cell: (item) => <span className="font-mono text-xs">{item.stockId}</span>,
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
