// plp/list/plp-list-row.stories.tsx
import type { ComponentProps, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState } from "react";
import {
  IconDotsVertical,
  IconHeart,
  IconPhoto,
  IconShare,
  IconShoppingCart,
} from "@tabler/icons-react";
import {
  PlpListBodyCell,
  PlpListBodyRow,
  PlpListHeaderCell,
  PlpListHeaderRow,
  PlpListRowActions,
  PlpListRowCert,
  PlpListRowDelivery,
  PlpListRowMedia,
  PlpListRowPrice,
  PlpListRowPricePerCarat,
  PlpListRowReturnable,
} from "./plp-list-row";
import { Button } from "../../../atoms/button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../molecules/dropdown-menu/dropdown-menu";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
} from "../../../organisms/table/table";
import diamondImg from "../__stories__/images/diamond.png";

// Stable module-level handlers so every story shares action identity.
const onAddToCart = fn();
const onAddToShortlist = fn();
const onShare = fn();
const onViewMedia = fn();
const onSelectNoop = fn();

const SAMPLE_IMAGE = diamondImg;

// ── Shared scaffolding ────────────────────────────────────

// Shared header. The `PlpListBodyRow` auto-injects a checkbox cell
// whenever `onSelectedChange` is provided, so the header must include a
// matching "Select" column and every story row must pass
// `onSelectedChange` to keep cell counts aligned.
function DefaultHeader() {
  return (
    <PlpListHeaderRow>
      <TableHead style={{ width: 44 }}>
        <span className="sr-only">Select</span>
      </TableHead>
      <TableHead style={{ width: 73 }}>
        <span className="sr-only">Thumbnail</span>
      </TableHead>
      <TableHead>Shape</TableHead>
      <TableHead className="text-center">Ct</TableHead>
      <TableHead className="text-center">Col</TableHead>
      <TableHead className="text-center">Cla</TableHead>
      <TableHead>Cert</TableHead>
      <TableHead className="text-end">Price</TableHead>
      <TableHead className="text-end">Price/ct</TableHead>
      <TableHead>Ret</TableHead>
      <TableHead>Delivery</TableHead>
      <PlpListHeaderCell sticky="right">
        <span className="sr-only">Actions</span>
      </PlpListHeaderCell>
    </PlpListHeaderRow>
  );
}

type PriceProps = ComponentProps<typeof PlpListRowPrice>;
type DeliveryProps = ComponentProps<typeof PlpListRowDelivery>;
type ReturnableProps = ComponentProps<typeof PlpListRowReturnable>;

interface StoryRowProps {
  shape?: string;
  carat?: string;
  color?: string;
  clarity?: string;
  cert?: { lab: string; number: string };
  price?: PriceProps;
  pricePerCarat?: ComponentProps<typeof PlpListRowPricePerCarat>;
  returnable?: ReturnableProps["variant"];
  delivery?: DeliveryProps;
  actions?: ReactNode;
  imageAlt?: string;
  // PlpListBodyRow passthroughs
  selected?: boolean;
  onSelectedChange?: (next: boolean) => void;
  disabled?: boolean;
  onClick?: () => void;
}

const DEFAULT_ACTIONS = (
  <PlpListRowActions>
    <Button size="sm" variant="outline" onClick={onAddToCart}>
      Add
      <IconShoppingCart className="h-4 w-4" data-icon="inline-end" />
    </Button>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
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
);

// Single row renderer used by every story. Always wires up
// `onSelectedChange` (defaulting to a noop) so the checkbox cell is
// always rendered and column counts match the header.
function StoryRow({
  shape = "Round",
  carat = "1.20",
  color = "F",
  clarity = "VS1",
  cert = { lab: "GIA", number: "2141438291" },
  price = { amount: 5400, currency: "USD" },
  pricePerCarat = { amount: 4500, currency: "USD" },
  returnable = "returnable",
  delivery = { variant: "regular", date: "Nov 18 – 23", origin: "🇧🇼" },
  actions = DEFAULT_ACTIONS,
  imageAlt = "Diamond",
  selected,
  onSelectedChange = onSelectNoop,
  disabled,
  onClick,
}: StoryRowProps) {
  return (
    <PlpListBodyRow
      selected={selected}
      onSelectedChange={onSelectedChange}
      disabled={disabled}
      onClick={onClick}
    >
      <PlpListBodyCell>
        <PlpListRowMedia image={SAMPLE_IMAGE} imageAlt={imageAlt} />
      </PlpListBodyCell>
      <PlpListBodyCell>{shape}</PlpListBodyCell>
      <PlpListBodyCell className="text-center">{carat}</PlpListBodyCell>
      <PlpListBodyCell className="text-center">{color}</PlpListBodyCell>
      <PlpListBodyCell className="text-center">{clarity}</PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowCert lab={cert.lab} number={cert.number} />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPrice {...price} />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPricePerCarat {...pricePerCarat} />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowReturnable variant={returnable} />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowDelivery {...delivery} />
      </PlpListBodyCell>
      <PlpListBodyCell sticky="right">{actions}</PlpListBodyCell>
    </PlpListBodyRow>
  );
}

const meta: Meta = {
  title: "Templates/PLP/ListRow",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="p-6">
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-background">
              <DefaultHeader />
            </TableHeader>
            <TableBody>
              <Story />
            </TableBody>
          </Table>
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

// ── Stories ───────────────────────────────────────────────

// Baseline

export const Default: Story = {
  render: () => <StoryRow />,
};

// States & interaction

export const Selected: Story = {
  render: () => {
    function Row() {
      const [selected, setSelected] = useState(true);
      return <StoryRow selected={selected} onSelectedChange={setSelected} />;
    }
    return <Row />;
  },
};

export const Selectable: Story = {
  render: () => {
    function Row() {
      const [selected, setSelected] = useState(false);
      return <StoryRow selected={selected} onSelectedChange={setSelected} />;
    }
    return <Row />;
  },
};

export const Disabled: Story = {
  render: () => <StoryRow disabled />,
};

// Content variants

export const ExpressDelivery: Story = {
  render: () => (
    <StoryRow
      shape="Oval"
      carat="0.90"
      color="D"
      clarity="IF"
      cert={{ lab: "IGI", number: "635321884" }}
      price={{ amount: 4599, currency: "USD" }}
      pricePerCarat={{ amount: 5110, currency: "USD" }}
      delivery={{ variant: "express", date: "Nov 15 – 17", origin: "🇺🇸" }}
      imageAlt="Express item"
    />
  ),
};

export const NonReturnable: Story = {
  render: () => (
    <StoryRow
      shape="Cushion"
      carat="2.05"
      color="H"
      clarity="SI1"
      cert={{ lab: "GIA", number: "7428891102" }}
      price={{ amount: 7999, currency: "USD" }}
      pricePerCarat={{ amount: 3902, currency: "USD" }}
      returnable="non-returnable"
      delivery={{ variant: "regular", date: "Nov 18 – 23", origin: "🇷🇺" }}
      imageAlt="Final sale item"
    />
  ),
};

// Price variants

export const WithDiscount: Story = {
  render: () => (
    <StoryRow
      shape="Princess"
      carat="1.50"
      color="G"
      clarity="VVS2"
      cert={{ lab: "GIA", number: "5121330028" }}
      price={{
        amount: 7499,
        currency: "USD",
        discount: { percentage: 25, originalAmount: 9999 },
      }}
      pricePerCarat={{ amount: 4999, currency: "USD" }}
      delivery={{ variant: "regular", date: "Nov 18 – 23", origin: "🇨🇦" }}
      imageAlt="Discounted item"
    />
  ),
};

export const WithTariffs: Story = {
  render: () => (
    <StoryRow
      shape="Emerald"
      carat="1.80"
      color="E"
      clarity="VS2"
      cert={{ lab: "AGS", number: "104088441" }}
      price={{ amount: 9999, currency: "USD", includeTariffs: true }}
      pricePerCarat={{ amount: 5555, currency: "USD" }}
      delivery={{ variant: "regular", date: "Nov 18 – 23", origin: "🇦🇺" }}
      imageAlt="Tariff-noted item"
    />
  ),
};

export const WithLegacyPricing: Story = {
  render: () => (
    <StoryRow
      shape="Pear"
      carat="1.10"
      color="F"
      clarity="VS1"
      cert={{ lab: "GIA", number: "2298110765" }}
      price={{
        amount: 9999,
        currency: "USD",
        legacyDelivered: { amount: 10499, currency: "USD" },
      }}
      pricePerCarat={{ amount: 9090, currency: "USD" }}
      delivery={{ variant: "regular", date: "Nov 18 – 23", origin: "🇿🇦" }}
      imageAlt="Legacy-pricing item"
    />
  ),
};

export const WithAlternateCurrency: Story = {
  render: () => (
    <StoryRow
      shape="Round"
      carat="1.00"
      color="D"
      clarity="VVS1"
      cert={{ lab: "IGI", number: "489012223" }}
      price={{
        amount: 9999,
        currency: "USD",
        alternateCurrency: { amount: 9250, currency: "EUR" },
      }}
      pricePerCarat={{ amount: 9999, currency: "USD" }}
      delivery={{ variant: "regular", date: "Nov 18 – 23", origin: "🇧🇼" }}
      imageAlt="Multi-currency item"
    />
  ),
};

export const AllPriceVariants: Story = {
  render: () => (
    <StoryRow
      shape="Round"
      carat="1.00"
      color="D"
      clarity="IF"
      cert={{ lab: "GIA", number: "2141438291" }}
      price={{
        amount: 7499,
        currency: "USD",
        discount: { percentage: 25, originalAmount: 9999 },
        includeTariffs: true,
        legacyDelivered: { amount: 10499, currency: "USD" },
        alternateCurrency: { amount: 6920, currency: "EUR" },
      }}
      pricePerCarat={{ amount: 7499, currency: "USD" }}
      delivery={{ variant: "express", date: "Nov 15 – 17", origin: "🇺🇸" }}
      imageAlt="All price variants"
    />
  ),
};
