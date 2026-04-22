// plp/grid/plp-grid-item.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState } from "react";
import { IconHeart, IconPhoto, IconShare } from "@tabler/icons-react";
import {
  PlpGridItem,
  PlpGridItemCheckbox,
  PlpGridItemDelivery,
  PlpGridItemMedia,
  PlpGridItemMediaAction,
  PlpGridItemMediaToolbar,
  PlpGridItemName,
  PlpGridItemPrice,
  PlpGridItemPrimaryAction,
  PlpGridItemReturnable,
} from "./plp-grid-item";
import { Badge } from "../../../atoms/badge/badge";
import { Button } from "../../../atoms/button/button";
import { Typography } from "../../../atoms/typography/typography";
import diamondImg from "../__stories__/images/diamond.png";

// Stable module-level handlers so every story shares action identity.
const onAddToShortlist = fn();
const onShare = fn();
const onViewMedia = fn();
const onAddToCart = fn();

const SAMPLE_IMAGE = diamondImg;
const SAMPLE_360_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

// Shared composition used by most stories — represents a typical
// Gemstone-shaped card.
function DefaultCard({
  selected,
  disabled,
}: {
  selected?: boolean;
  disabled?: boolean;
}) {
  return (
    <PlpGridItem selected={selected} disabled={disabled}>
      <PlpGridItemMedia image={SAMPLE_IMAGE} imageAlt="Emerald Green Radiant">
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
      <PlpGridItemName>Emerald Green Radiant 1ct</PlpGridItemName>
      <Typography variant="caption" className="text-muted-foreground">
        GR-10000
      </Typography>
      <div className="flex flex-wrap gap-1">
        <Badge variant="outline" size="sm">
          Brazil
        </Badge>
        <Badge variant="info" size="sm">
          Nivoda Curated
        </Badge>
      </div>
      <PlpGridItemDelivery
        variant="regular"
        date="Nov 18 – 23"
        shipsFrom="United States"
      />
      <PlpGridItemReturnable variant="returnable" />
      <PlpGridItemPrice amount={1910} currency="USD" />
      <PlpGridItemPrimaryAction>
        <Button className="w-full" onClick={onAddToCart}>
          Add to cart
        </Button>
      </PlpGridItemPrimaryAction>
    </PlpGridItem>
  );
}

const meta: Meta = {
  title: "Templates/PLP/GridItem",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj;

// ── Stories ───────────────────────────────────────────────

// Baseline

export const Default: Story = {
  render: () => <DefaultCard />,
};

export const Minimal: Story = {
  render: () => (
    <PlpGridItem>
      <PlpGridItemMedia image={SAMPLE_IMAGE} imageAlt="Item" />
      <PlpGridItemName>A minimal card</PlpGridItemName>
      <PlpGridItemPrice amount={1999} currency="USD" />
    </PlpGridItem>
  ),
};

// States & interaction

export const Selected: Story = {
  render: () => <DefaultCard selected />,
};

export const Disabled: Story = {
  render: () => <DefaultCard disabled />,
};

export const WithCheckbox: Story = {
  render: () => {
    function Card() {
      const [selected, setSelected] = useState(false);
      return (
        <PlpGridItem selected={selected}>
          <PlpGridItemMedia image={SAMPLE_IMAGE} imageAlt="Selectable item">
            <PlpGridItemCheckbox checked={selected} onChange={setSelected} />
            <PlpGridItemMediaToolbar>
              <PlpGridItemMediaAction
                icon={IconHeart}
                label="Add to shortlist"
                onClick={onAddToShortlist}
              />
            </PlpGridItemMediaToolbar>
          </PlpGridItemMedia>
          <PlpGridItemName>Select to compare</PlpGridItemName>
          <PlpGridItemPrice amount={2899} currency="USD" />
        </PlpGridItem>
      );
    }
    return <Card />;
  },
};

// Content variants

export const With360Media: Story = {
  render: () => (
    <PlpGridItem>
      <PlpGridItemMedia
        image={SAMPLE_IMAGE}
        imageAlt="360 rotation item"
        video={SAMPLE_360_VIDEO}
      >
        <PlpGridItemMediaToolbar>
          <PlpGridItemMediaAction
            icon={IconPhoto}
            label="View media"
            onClick={onViewMedia}
          />
        </PlpGridItemMediaToolbar>
      </PlpGridItemMedia>
      <PlpGridItemName>Hover for 360 rotation</PlpGridItemName>
      <PlpGridItemPrice amount={3499} currency="USD" />
    </PlpGridItem>
  ),
};

export const ExpressDelivery: Story = {
  render: () => (
    <PlpGridItem>
      <PlpGridItemMedia image={SAMPLE_IMAGE} imageAlt="Express item" />
      <PlpGridItemName>Same-day shipping stone</PlpGridItemName>
      <PlpGridItemDelivery
        variant="express"
        date="Nov 15 – 17"
        shipsFrom="New York"
      />
      <PlpGridItemReturnable variant="returnable" />
      <PlpGridItemPrice amount={4599} currency="USD" />
    </PlpGridItem>
  ),
};

export const NonReturnable: Story = {
  render: () => (
    <PlpGridItem>
      <PlpGridItemMedia image={SAMPLE_IMAGE} imageAlt="Final sale item" />
      <PlpGridItemName>Final sale gemstone</PlpGridItemName>
      <PlpGridItemDelivery
        variant="regular"
        date="Nov 18 – 23"
        shipsFrom="United States"
      />
      <PlpGridItemReturnable variant="non-returnable" />
      <PlpGridItemPrice amount={7999} currency="USD" />
    </PlpGridItem>
  ),
};

// Price variants

export const WithDiscount: Story = {
  render: () => (
    <PlpGridItem>
      <PlpGridItemMedia image={SAMPLE_IMAGE} imageAlt="Discounted item" />
      <PlpGridItemName>Emerald Green Radiant 1ct</PlpGridItemName>
      <PlpGridItemDelivery
        variant="regular"
        date="Nov 18 – 23"
        shipsFrom="United States"
      />
      <PlpGridItemReturnable variant="returnable" />
      <PlpGridItemPrice
        amount={7499}
        currency="USD"
        discount={{ percentage: 25, originalAmount: 9999 }}
      />
    </PlpGridItem>
  ),
};

export const WithPerCarat: Story = {
  render: () => (
    <PlpGridItem>
      <PlpGridItemMedia image={SAMPLE_IMAGE} imageAlt="Per-carat item" />
      <PlpGridItemName>Emerald Green Radiant 1ct</PlpGridItemName>
      <PlpGridItemDelivery
        variant="regular"
        date="Nov 18 – 23"
        shipsFrom="United States"
      />
      <PlpGridItemReturnable variant="returnable" />
      <PlpGridItemPrice
        amount={9999}
        currency="USD"
        perCarat={{ amount: 1910.7, currency: "USD" }}
      />
    </PlpGridItem>
  ),
};

export const WithTariffs: Story = {
  render: () => (
    <PlpGridItem>
      <PlpGridItemMedia image={SAMPLE_IMAGE} imageAlt="Tariff-noted item" />
      <PlpGridItemName>Emerald Green Radiant 1ct</PlpGridItemName>
      <PlpGridItemDelivery
        variant="regular"
        date="Nov 18 – 23"
        shipsFrom="United States"
      />
      <PlpGridItemReturnable variant="returnable" />
      <PlpGridItemPrice amount={9999} currency="USD" includeTariffs />
    </PlpGridItem>
  ),
};

export const WithLegacyPricing: Story = {
  render: () => (
    <PlpGridItem>
      <PlpGridItemMedia image={SAMPLE_IMAGE} imageAlt="Legacy-pricing item" />
      <PlpGridItemName>Emerald Green Radiant 1ct</PlpGridItemName>
      <PlpGridItemDelivery
        variant="regular"
        date="Nov 18 – 23"
        shipsFrom="United States"
      />
      <PlpGridItemReturnable variant="returnable" />
      <PlpGridItemPrice
        amount={9999}
        currency="USD"
        legacyDelivered={{ amount: 10499, currency: "USD" }}
      />
    </PlpGridItem>
  ),
};

export const WithAlternateCurrency: Story = {
  render: () => (
    <PlpGridItem>
      <PlpGridItemMedia image={SAMPLE_IMAGE} imageAlt="Multi-currency item" />
      <PlpGridItemName>Emerald Green Radiant 1ct</PlpGridItemName>
      <PlpGridItemDelivery
        variant="regular"
        date="Nov 18 – 23"
        shipsFrom="United States"
      />
      <PlpGridItemReturnable variant="returnable" />
      <PlpGridItemPrice
        amount={9999}
        currency="USD"
        alternateCurrency={{ amount: 9250, currency: "EUR" }}
      />
    </PlpGridItem>
  ),
};

export const AllPriceVariants: Story = {
  render: () => (
    <PlpGridItem>
      <PlpGridItemMedia image={SAMPLE_IMAGE} imageAlt="All price variants" />
      <PlpGridItemName>Emerald Green Radiant 1ct</PlpGridItemName>
      <PlpGridItemDelivery
        variant="express"
        date="Nov 15 – 17"
        shipsFrom="New York"
      />
      <PlpGridItemReturnable variant="returnable" />
      <PlpGridItemPrice
        amount={7499}
        currency="USD"
        perCarat={{ amount: 1910.7, currency: "USD" }}
        discount={{ percentage: 25, originalAmount: 9999 }}
        includeTariffs
        legacyDelivered={{ amount: 10499, currency: "USD" }}
        alternateCurrency={{ amount: 6920, currency: "EUR" }}
      />
    </PlpGridItem>
  ),
};

