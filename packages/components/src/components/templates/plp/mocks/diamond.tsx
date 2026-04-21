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
  PlpListRowPricePerCarat,
  PlpListRowReturnable,
} from "../list/plp-list-row";
import { useStorybookAppUser } from "../../../../../.storybook/app-user-context";
import type { AsyncComboboxOption } from "../../../molecules/async-combobox-filter/async-combobox-filter";
import type { ChipSelectOption } from "../../../molecules/chip-select-filter/chip-select-filter";
import type { RangeAxis } from "../../../molecules/range-filter/range-filter";
import {
  SAMPLE_360_VIDEO_URL,
  buildMockHistogram,
  mockSupplierSearch,
} from "./common";

const onAddToShortlist = fn();
const onShare = fn();
const onViewMedia = fn();
const onAddToCart = fn();

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

/**
 * Filter-state shape for the diamond mock PLP.
 */
export interface DiamondFilterState {
  shape?: string[];
  color?: string[];
  clarity?: string[];
  price?: Record<string, { min: number; max: number }>;
  carat?: Record<string, { min: number; max: number }>;
  size?: Record<string, { min: number; max: number }>;
  supplier?: AsyncComboboxOption[];
}

// -- Filter configuration ---------------------------------------------------

export const DIAMOND_SHAPE_OPTIONS: ChipSelectOption[] = [
  { value: "round", label: "Round" },
  { value: "oval", label: "Oval" },
  { value: "cushion", label: "Cushion" },
  { value: "princess", label: "Princess" },
];

export const DIAMOND_COLOR_OPTIONS: ChipSelectOption[] = [
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
].map((c) => ({ value: c, label: c }));

export const DIAMOND_CLARITY_OPTIONS: ChipSelectOption[] = [
  "IF",
  "VVS1",
  "VVS2",
  "VS1",
  "VS2",
  "SI1",
].map((c) => ({ value: c, label: c }));

export const DIAMOND_PRICE_CONFIG: RangeAxis = {
  id: "price",
  min: 0,
  max: 10000,
  step: 10,
  unit: "$",
  histogram: buildMockHistogram(0, 10000, 40, 2500),
};

export const DIAMOND_CARAT_CONFIG: RangeAxis = {
  id: "carat",
  min: 0,
  max: 10,
  step: 0.1,
  unit: "ct",
  histogram: buildMockHistogram(0, 10, 40, 2),
};

export const DIAMOND_SIZE_AXES: RangeAxis[] = [
  { id: "length", label: "Length", min: 0, max: 20, step: 0.1, unit: "mm" },
  { id: "width", label: "Width", min: 0, max: 20, step: 0.1, unit: "mm" },
  { id: "depth", label: "Depth", min: 0, max: 10, step: 0.1, unit: "mm" },
];

export const DIAMOND_SUPPLIER_SEARCH = mockSupplierSearch;

// -- Item generation + cards/rows -------------------------------------------

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

export function DiamondPlpGridItem({ item }: { item: DiamondItem }) {
  const userContext = useStorybookAppUser();

  const video =
    Number.parseInt(item.id.replace(/\D/g, ""), 10) % 3 === 0
      ? SAMPLE_360_VIDEO_URL
      : undefined;

  const alternateCurrency =
    userContext.currency !== "USD"
      ? { amount: item.price, currency: userContext.currency }
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
        {item.certLab} {item.certNumber}
      </Typography>

      <div className="flex flex-wrap gap-1">
        <Badge variant="outline" size="sm">
          {item.origin}
        </Badge>
      </div>

      <Typography variant="caption" className="text-muted-foreground">
        {item.carat.toFixed(2)}ct · {item.shape} · {item.color} · {item.clarity}
      </Typography>

      <PlpGridItemDelivery
        variant={item.isExpress ? "express" : "regular"}
        date="Nov 18 – 23"
        shipsFrom={item.origin}
      />

      <PlpGridItemReturnable
        variant={item.isReturnable ? "returnable" : "non-returnable"}
      />

      <PlpGridItemPrice
        amount={item.price}
        currency="USD"
        perCarat={{ amount: item.pricePerCarat, currency: "USD" }}
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

export function DiamondPlpListHeader() {
  return (
    <PlpListHeaderRow>
      <PlpListHeaderCell width={44}>
        <span className="sr-only">Select</span>
      </PlpListHeaderCell>
      <PlpListHeaderCell width={72}>
        <span className="sr-only">Thumbnail</span>
      </PlpListHeaderCell>
      <PlpListHeaderCell>Name</PlpListHeaderCell>
      <PlpListHeaderCell align="right">Carat</PlpListHeaderCell>
      <PlpListHeaderCell>Shape</PlpListHeaderCell>
      <PlpListHeaderCell align="center">Color</PlpListHeaderCell>
      <PlpListHeaderCell align="center">Clarity</PlpListHeaderCell>
      <PlpListHeaderCell>Origin</PlpListHeaderCell>
      <PlpListHeaderCell>Certificate</PlpListHeaderCell>
      <PlpListHeaderCell>Delivery</PlpListHeaderCell>
      <PlpListHeaderCell>Returns</PlpListHeaderCell>
      <PlpListHeaderCell>Price</PlpListHeaderCell>
      <PlpListHeaderCell>Price/ct</PlpListHeaderCell>
      <PlpListHeaderCell align="right">
        <span className="sr-only">Actions</span>
      </PlpListHeaderCell>
    </PlpListHeaderRow>
  );
}

export function DiamondPlpListRow({
  item,
  onClick,
}: {
  item: DiamondItem;
  onClick?: () => void;
}) {
  const userContext = useStorybookAppUser();
  const [selected, setSelected] = useState(false);

  const alternateCurrency =
    userContext.currency !== "USD"
      ? { amount: item.price, currency: userContext.currency }
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
      <PlpListCell align="right">{item.carat.toFixed(2)}</PlpListCell>
      <PlpListCell>{item.shape}</PlpListCell>
      <PlpListCell align="center">{item.color}</PlpListCell>
      <PlpListCell align="center">{item.clarity}</PlpListCell>
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
          shipsFrom={item.origin}
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
          alternateCurrency={alternateCurrency}
        />
      </PlpListCell>
      <PlpListCell>
        <PlpListRowPricePerCarat amount={item.pricePerCarat} currency="USD" />
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
