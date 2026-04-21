import { useState } from "react";
import { fn } from "@storybook/test";
import {
  IconDotsVertical,
  IconHeart,
  IconPhoto,
  IconShare,
} from "@tabler/icons-react";
import { Badge } from "../../../atoms/badge/badge";
import { Button } from "../../../atoms/button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../molecules/dropdown-menu/dropdown-menu";
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
import {
  PlpListCell,
  PlpListHeaderCell,
  PlpListHeaderRow,
  PlpListRow,
  PlpListRowActions,
  PlpListRowCheckbox,
  PlpListRowDelivery,
  PlpListRowMedia,
  PlpListRowName,
  PlpListRowPrice,
  PlpListRowReturnable,
} from "../list/plp-list-row";
import { useStorybookAppUser } from "../../../../../.storybook/app-user-context";
import type { AsyncComboboxOption } from "../../../molecules/async-combobox-filter/async-combobox-filter";
import type { RangeAxis } from "../../../molecules/range-filter/range-filter";
import {
  MOCK_SUPPLIERS,
  SAMPLE_360_VIDEO_URL,
  buildMockHistogram,
  mockSupplierSearch,
} from "./common";

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

/**
 * Filter-state shape for the gemstone mock PLP. Story wiring types its
 * `useFilterController` against this shape; each key corresponds to one
 * filter rendered in the toolbar / drawer.
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

// -- Filter configuration ---------------------------------------------------

export const GEMSTONE_COLOR_OPTIONS: { value: string; label: string }[] = [
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
  { value: "teal", label: "Teal" },
  { value: "pink", label: "Pink" },
  { value: "yellow", label: "Yellow" },
];

export const GEMSTONE_CLARITY_OPTIONS: { value: string; label: string }[] = [
  { value: "eye-clean", label: "Eye clean" },
  { value: "slightly-included", label: "Slightly included" },
  { value: "moderately-included", label: "Moderately included" },
  { value: "visibly-included", label: "Visibly included" },
];

export const GEMSTONE_TREATMENT_OPTIONS: { value: string; label: string }[] = [
  { value: "none", label: "None" },
  { value: "heated", label: "Heated" },
  { value: "oiled", label: "Oiled" },
];

export const GEMSTONE_LOCATION_OPTIONS: { value: string; label: string }[] = [
  { value: "us", label: "United States" },
  { value: "eu", label: "Europe" },
  { value: "asia", label: "Asia" },
];

export const GEMSTONE_PRICE_CONFIG: RangeAxis = {
  id: "price",
  min: 0,
  max: 10000,
  step: 10,
  unit: "$",
  histogram: buildMockHistogram(0, 10000, 40, 2500),
};

export const GEMSTONE_CARAT_CONFIG: RangeAxis = {
  id: "carat",
  min: 0,
  max: 10,
  step: 0.1,
  unit: "ct",
  histogram: buildMockHistogram(0, 10, 40, 2),
};

export const GEMSTONE_SIZE_AXES: RangeAxis[] = [
  { id: "length", label: "Length", min: 0, max: 20, step: 0.1, unit: "mm" },
  { id: "width", label: "Width", min: 0, max: 20, step: 0.1, unit: "mm" },
  { id: "depth", label: "Depth", min: 0, max: 10, step: 0.1, unit: "mm" },
];

export const GEMSTONE_SUPPLIER_SEARCH = mockSupplierSearch;

/**
 * Convenience: a pre-selected supplier set used by stories that start
 * with an engaged supplier filter. The value is already `Option[]`, so
 * labels are preserved without any cache plumbing.
 */
export const GEMSTONE_PRESELECTED_SUPPLIERS: AsyncComboboxOption[] =
  MOCK_SUPPLIERS.filter((s) =>
    ["sup-acme", "sup-globex", "sup-initech"].includes(s.value)
  );

// -- Item generation + cards/rows -------------------------------------------

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

export function GemstonePlpListHeader() {
  return (
    <PlpListHeaderRow>
      <PlpListHeaderCell width={44}>
        <span className="sr-only">Select</span>
      </PlpListHeaderCell>
      <PlpListHeaderCell width={72}>
        <span className="sr-only">Thumbnail</span>
      </PlpListHeaderCell>
      <PlpListHeaderCell>Name</PlpListHeaderCell>
      <PlpListHeaderCell>Origin</PlpListHeaderCell>
      <PlpListHeaderCell>Certificate</PlpListHeaderCell>
      <PlpListHeaderCell>Delivery</PlpListHeaderCell>
      <PlpListHeaderCell>Returns</PlpListHeaderCell>
      <PlpListHeaderCell>Price</PlpListHeaderCell>
      <PlpListHeaderCell align="right">
        <span className="sr-only">Actions</span>
      </PlpListHeaderCell>
    </PlpListHeaderRow>
  );
}

export function GemstonePlpListRow({
  item,
  onClick,
}: {
  item: GemstoneItem;
  onClick?: () => void;
}) {
  const userContext = useStorybookAppUser();
  const [selected, setSelected] = useState(false);

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
    <PlpListRow onClick={onClick} selected={selected}>
      <PlpListCell>
        <PlpListRowCheckbox checked={selected} onChange={setSelected} />
      </PlpListCell>
      <PlpListCell>
        <PlpListRowMedia image={item.image} imageAlt={item.name} />
      </PlpListCell>
      <PlpListCell>
        <div className="flex flex-col gap-0.5">
          <PlpListRowName>{item.name}</PlpListRowName>
          <Typography as="div" variant="caption" className="text-muted-foreground">
            {item.stockId}
          </Typography>
        </div>
      </PlpListCell>
      <PlpListCell>{item.origin}</PlpListCell>
      <PlpListCell>
        <span className="font-mono text-xs">
          {item.certLab} {item.certNumber}
        </span>
      </PlpListCell>
      <PlpListCell>
        <PlpListRowDelivery
          variant={item.isExpress ? "express" : "regular"}
          date="Nov 18 – 23"
          shipsFrom="United States"
        />
      </PlpListCell>
      <PlpListCell>
        <PlpListRowReturnable
          variant={item.isReturnable ? "returnable" : "non-returnable"}
        />
      </PlpListCell>
      <PlpListCell>
        <PlpListRowPrice
          amount={item.price}
          currency="USD"
          discount={discount}
          includeTariffs={showTariffNote}
          alternateCurrency={alternateCurrency}
        />
      </PlpListCell>
      <PlpListCell align="right">
        <PlpListRowActions>
          <Button size="sm" onClick={onAddToCart}>
            Add to cart
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="More actions"
                onClick={(e) => e.stopPropagation()}
              >
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onSelect={onAddToShortlist}>
                <IconHeart className="h-4 w-4" />
                Add to shortlist
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onShare}>
                <IconShare className="h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onViewMedia}>
                <IconPhoto className="h-4 w-4" />
                View media
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </PlpListRowActions>
      </PlpListCell>
    </PlpListRow>
  );
}
