// plp/list/plp-list-row.stories.tsx
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

// Stable module-level handlers so every story shares action identity.
const onAddToCart = fn();
const onAddToShortlist = fn();
const onShare = fn();
const onViewMedia = fn();
const onRowClick = fn();

const SAMPLE_IMAGE = "https://placehold.co/80x80/f5f5f4/a3a3a3?text=Gem";

// Shared header used by most stories — represents a typical
// Diamond-shaped row layout.
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

// Shared composition used by most stories — represents a typical
// Diamond-shaped row with every primitive filled in.
function DefaultRow({
  selected,
  onSelectedChange,
  disabled,
  onClick,
}: {
  selected?: boolean;
  onSelectedChange?: (next: boolean) => void;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <PlpListBodyRow
      selected={selected}
      onSelectedChange={onSelectedChange}
      disabled={disabled}
      onClick={onClick}
    >
      <PlpListBodyCell>
        <PlpListRowMedia image={SAMPLE_IMAGE} imageAlt="1.20ct Round Diamond" />
      </PlpListBodyCell>
      <PlpListBodyCell>Round</PlpListBodyCell>
      <PlpListBodyCell className="text-center">1.20</PlpListBodyCell>
      <PlpListBodyCell className="text-center">F</PlpListBodyCell>
      <PlpListBodyCell className="text-center">VS1</PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowCert lab="GIA" number="2141438291" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPrice amount={5400} currency="USD" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPricePerCarat amount={4500} currency="USD" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowReturnable variant="returnable" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowDelivery variant="regular" date="Nov 18 – 23" origin="🇧🇼" />
      </PlpListBodyCell>
      <PlpListBodyCell sticky="right">
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
            <DropdownMenuContent
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
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
      </PlpListBodyCell>
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

export const Default: Story = {
  render: () => <DefaultRow />,
};

export const Clickable: Story = {
  render: () => <DefaultRow onClick={onRowClick} />,
};

export const Selected: Story = {
  render: () => {
    function Row() {
      const [selected, setSelected] = useState(true);
      return <DefaultRow selected={selected} onSelectedChange={setSelected} />;
    }
    return <Row />;
  },
};

export const Selectable: Story = {
  render: () => {
    function Row() {
      const [selected, setSelected] = useState(false);
      return <DefaultRow selected={selected} onSelectedChange={setSelected} />;
    }
    return <Row />;
  },
};

export const Disabled: Story = {
  render: () => <DefaultRow disabled />,
};

export const ExpressDelivery: Story = {
  render: () => (
    <PlpListBodyRow>
      <PlpListBodyCell>
        <PlpListRowMedia image={SAMPLE_IMAGE} imageAlt="Express item" />
      </PlpListBodyCell>
      <PlpListBodyCell>Oval</PlpListBodyCell>
      <PlpListBodyCell className="text-center">0.90</PlpListBodyCell>
      <PlpListBodyCell className="text-center">D</PlpListBodyCell>
      <PlpListBodyCell className="text-center">IF</PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowCert lab="IGI" number="635321884" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPrice amount={4599} currency="USD" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPricePerCarat amount={5110} currency="USD" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowReturnable variant="returnable" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowDelivery variant="express" date="Nov 15 – 17" origin="🇺🇸" />
      </PlpListBodyCell>
      <PlpListBodyCell sticky="right">
        <PlpListRowActions>
          <Button size="sm" variant="outline" onClick={onAddToCart}>
            Add
            <IconShoppingCart className="h-4 w-4" data-icon="inline-end" />
          </Button>
        </PlpListRowActions>
      </PlpListBodyCell>
    </PlpListBodyRow>
  ),
};

export const NonReturnable: Story = {
  render: () => (
    <PlpListBodyRow>
      <PlpListBodyCell>
        <PlpListRowMedia image={SAMPLE_IMAGE} imageAlt="Final sale item" />
      </PlpListBodyCell>
      <PlpListBodyCell>Cushion</PlpListBodyCell>
      <PlpListBodyCell className="text-center">2.05</PlpListBodyCell>
      <PlpListBodyCell className="text-center">H</PlpListBodyCell>
      <PlpListBodyCell className="text-center">SI1</PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowCert lab="GIA" number="7428891102" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPrice amount={7999} currency="USD" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPricePerCarat amount={3902} currency="USD" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowReturnable variant="non-returnable" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowDelivery variant="regular" date="Nov 18 – 23" origin="🇷🇺" />
      </PlpListBodyCell>
      <PlpListBodyCell sticky="right">
        <PlpListRowActions>
          <Button size="sm" variant="outline" onClick={onAddToCart}>
            Add
            <IconShoppingCart className="h-4 w-4" data-icon="inline-end" />
          </Button>
        </PlpListRowActions>
      </PlpListBodyCell>
    </PlpListBodyRow>
  ),
};

export const WithDiscount: Story = {
  render: () => (
    <PlpListBodyRow>
      <PlpListBodyCell>
        <PlpListRowMedia image={SAMPLE_IMAGE} imageAlt="Discounted item" />
      </PlpListBodyCell>
      <PlpListBodyCell>Princess</PlpListBodyCell>
      <PlpListBodyCell className="text-center">1.50</PlpListBodyCell>
      <PlpListBodyCell className="text-center">G</PlpListBodyCell>
      <PlpListBodyCell className="text-center">VVS2</PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowCert lab="GIA" number="5121330028" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPrice
          amount={7499}
          currency="USD"
          discount={{ percentage: 25, originalAmount: 9999 }}
        />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPricePerCarat amount={4999} currency="USD" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowReturnable variant="returnable" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowDelivery variant="regular" date="Nov 18 – 23" origin="🇨🇦" />
      </PlpListBodyCell>
      <PlpListBodyCell sticky="right">
        <PlpListRowActions>
          <Button size="sm" variant="outline" onClick={onAddToCart}>
            Add
            <IconShoppingCart className="h-4 w-4" data-icon="inline-end" />
          </Button>
        </PlpListRowActions>
      </PlpListBodyCell>
    </PlpListBodyRow>
  ),
};

export const WithTariffs: Story = {
  render: () => (
    <PlpListBodyRow>
      <PlpListBodyCell>
        <PlpListRowMedia image={SAMPLE_IMAGE} imageAlt="Tariff-noted item" />
      </PlpListBodyCell>
      <PlpListBodyCell>Emerald</PlpListBodyCell>
      <PlpListBodyCell className="text-center">1.80</PlpListBodyCell>
      <PlpListBodyCell className="text-center">E</PlpListBodyCell>
      <PlpListBodyCell className="text-center">VS2</PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowCert lab="AGS" number="104088441" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPrice amount={9999} currency="USD" includeTariffs />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPricePerCarat amount={5555} currency="USD" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowReturnable variant="returnable" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowDelivery variant="regular" date="Nov 18 – 23" origin="🇦🇺" />
      </PlpListBodyCell>
      <PlpListBodyCell sticky="right">
        <PlpListRowActions>
          <Button size="sm" variant="outline" onClick={onAddToCart}>
            Add
            <IconShoppingCart className="h-4 w-4" data-icon="inline-end" />
          </Button>
        </PlpListRowActions>
      </PlpListBodyCell>
    </PlpListBodyRow>
  ),
};

export const WithLegacyPricing: Story = {
  render: () => (
    <PlpListBodyRow>
      <PlpListBodyCell>
        <PlpListRowMedia image={SAMPLE_IMAGE} imageAlt="Legacy-pricing item" />
      </PlpListBodyCell>
      <PlpListBodyCell>Pear</PlpListBodyCell>
      <PlpListBodyCell className="text-center">1.10</PlpListBodyCell>
      <PlpListBodyCell className="text-center">F</PlpListBodyCell>
      <PlpListBodyCell className="text-center">VS1</PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowCert lab="GIA" number="2298110765" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPrice
          amount={9999}
          currency="USD"
          legacyDelivered={{ amount: 10499, currency: "USD" }}
        />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPricePerCarat amount={9090} currency="USD" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowReturnable variant="returnable" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowDelivery variant="regular" date="Nov 18 – 23" origin="🇿🇦" />
      </PlpListBodyCell>
      <PlpListBodyCell sticky="right">
        <PlpListRowActions>
          <Button size="sm" variant="outline" onClick={onAddToCart}>
            Add
            <IconShoppingCart className="h-4 w-4" data-icon="inline-end" />
          </Button>
        </PlpListRowActions>
      </PlpListBodyCell>
    </PlpListBodyRow>
  ),
};

export const WithAlternateCurrency: Story = {
  render: () => (
    <PlpListBodyRow>
      <PlpListBodyCell>
        <PlpListRowMedia image={SAMPLE_IMAGE} imageAlt="Multi-currency item" />
      </PlpListBodyCell>
      <PlpListBodyCell>Round</PlpListBodyCell>
      <PlpListBodyCell className="text-center">1.00</PlpListBodyCell>
      <PlpListBodyCell className="text-center">D</PlpListBodyCell>
      <PlpListBodyCell className="text-center">VVS1</PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowCert lab="IGI" number="489012223" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPrice
          amount={9999}
          currency="USD"
          alternateCurrency={{ amount: 9250, currency: "EUR" }}
        />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPricePerCarat amount={9999} currency="USD" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowReturnable variant="returnable" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowDelivery variant="regular" date="Nov 18 – 23" origin="🇧🇼" />
      </PlpListBodyCell>
      <PlpListBodyCell sticky="right">
        <PlpListRowActions>
          <Button size="sm" variant="outline" onClick={onAddToCart}>
            Add
            <IconShoppingCart className="h-4 w-4" data-icon="inline-end" />
          </Button>
        </PlpListRowActions>
      </PlpListBodyCell>
    </PlpListBodyRow>
  ),
};

export const AllPriceVariants: Story = {
  render: () => (
    <PlpListBodyRow>
      <PlpListBodyCell>
        <PlpListRowMedia image={SAMPLE_IMAGE} imageAlt="All price variants" />
      </PlpListBodyCell>
      <PlpListBodyCell>Round</PlpListBodyCell>
      <PlpListBodyCell className="text-center">1.00</PlpListBodyCell>
      <PlpListBodyCell className="text-center">D</PlpListBodyCell>
      <PlpListBodyCell className="text-center">IF</PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowCert lab="GIA" number="2141438291" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPrice
          amount={7499}
          currency="USD"
          discount={{ percentage: 25, originalAmount: 9999 }}
          includeTariffs
          legacyDelivered={{ amount: 10499, currency: "USD" }}
          alternateCurrency={{ amount: 6920, currency: "EUR" }}
        />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowPricePerCarat amount={7499} currency="USD" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowReturnable variant="returnable" />
      </PlpListBodyCell>
      <PlpListBodyCell>
        <PlpListRowDelivery variant="express" date="Nov 15 – 17" origin="🇺🇸" />
      </PlpListBodyCell>
      <PlpListBodyCell sticky="right">
        <PlpListRowActions>
          <Button size="sm" variant="outline" onClick={onAddToCart}>
            Add
            <IconShoppingCart className="h-4 w-4" data-icon="inline-end" />
          </Button>
        </PlpListRowActions>
      </PlpListBodyCell>
    </PlpListBodyRow>
  ),
};
