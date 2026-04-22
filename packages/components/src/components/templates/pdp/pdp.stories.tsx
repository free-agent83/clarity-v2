import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState } from "react";
import { IconHeart, IconShare3, IconShoppingCart } from "@tabler/icons-react";
import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { ToggleGroup, ToggleGroupItem } from "../../atoms/toggle-group/toggle-group";
import { Lightbox } from "../../molecules/lightbox/lightbox";
import { PdpDelivery } from "./pdp-delivery";
import { PdpHeading } from "./pdp-heading";
import { PdpLayout } from "./pdp-layout";
import { PdpMediaGallery } from "./pdp-media-gallery";
import { PdpPrice } from "./pdp-price";
import { PdpPrimaryAction } from "./pdp-primary-action";
import { PdpReturns } from "./pdp-returns";
import { PdpSpecifications } from "./pdp-specifications";
import { PdpVariantSelector } from "./pdp-variant-selector";
import type { PdpDeliveryProps, PdpPriceProps, PdpReturnsProps, ProductMedia } from "./pdp-types";
import { Separator } from "@/components/atoms/separator/separator";

const onAddToCart = fn();
const onShortlist = fn();

type PricingPreset =
  | "simple"
  | "delivered-with-alt-currency"
  | "per-carat"
  | "discount"
  | "tariffs-included"
  | "legacy";

const PRICING_PRESETS: Record<PricingPreset, PdpPriceProps> = {
  "simple": {
    amount: 1174,
    currency: "USD",
  },
  "delivered-with-alt-currency": {
    amount: 1174,
    currency: "USD",
    label: "Final delivered price",
    alternateCurrency: { amount: 1082, currency: "EUR" },
  },
  "per-carat": {
    amount: 1174,
    currency: "USD",
    label: "Final delivered price",
    perCarat: { amount: 234.8, currency: "USD" },
  },
  "discount": {
    amount: 939,
    currency: "USD",
    label: "Final delivered price",
    discount: { percentage: 20, originalAmount: 1174 },
    alternateCurrency: { amount: 866, currency: "EUR" },
  },
  "tariffs-included": {
    amount: 1174,
    currency: "USD",
    includeTariffs: true,
    alternateCurrency: { amount: 1082, currency: "EUR" },
  },
  "legacy": {
    amount: 950,
    currency: "USD",
    legacy: { deliveredAmount: 1174, deliveredCurrency: "USD" },
  },
};

type DeliveryPreset = "regular" | "regular-ships-from" | "express";

const DELIVERY_PRESETS: Record<DeliveryPreset, PdpDeliveryProps> = {
  "regular": { variant: "regular", date: "15 business days" },
  "regular-ships-from": {
    variant: "regular",
    date: "15 business days",
    shipsFrom: <><span role="img" aria-label="Flag of India">🇮🇳</span> Mumbai, India</>,
  },
  "express": { variant: "express", date: "Tue, 29 Apr" },
};

type ReturnsPreset = "returnable-14" | "returnable-30" | "non-returnable";

const RETURNS_PRESETS: Record<ReturnsPreset, PdpReturnsProps> = {
  "returnable-14": { variant: "returnable", returnsWindow: "14 days", policyLink: <a href="#">Returns Policy applies</a> },
  "returnable-30": { variant: "returnable", returnsWindow: "30 days", policyLink: <a href="#">Returns Policy applies</a> },
  "non-returnable": { variant: "non-returnable" },
};

const RING_IMAGE = "https://images.unsplash.com/photo-1605100804763-247f67b3557e";

const MEDIA: ProductMedia[] = [
  { type: "image", src: `${RING_IMAGE}?w=800`, alt: "Halo diamond engagement ring — front", thumbnailSrc: `${RING_IMAGE}?w=120` },
  { type: "image", src: `${RING_IMAGE}?w=800`, alt: "Halo diamond engagement ring — angle", thumbnailSrc: `${RING_IMAGE}?w=120` },
  { type: "video360", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", poster: `${RING_IMAGE}?w=120` },
];

const SPEC_ROWS = [
  { label: "Style", value: "Halo with split shank" },
  { label: "Metal", value: "14k Rose Gold" },
  { label: "Metal weight", value: "3.8g" },
  { label: "Center stone", value: <Badge variant="outline">Lab-grown</Badge> },
  { label: "Center carat weight", value: "1.00ct" },
  { label: "Side stone count", value: "42" },
  { label: "Stone quality", value: "F–G, VS, Excellent" },
];

const SIZES = ['5', '5.5', '6', '6.5', '7', '7.5', '8'];
const METALS = ["White Gold", "Yellow Gold", "Rose Gold", "Platinum"] as const;
type Metal = (typeof METALS)[number];

interface EngagementRingArgs {
  pricing: PricingPreset;
  delivery: DeliveryPreset;
  returns: ReturnsPreset;
}

/**
 * Canonical assembly reference for an engagement ring PDP.
 * NOT a template — an example of how consumers compose PDP primitives.
 */
function EngagementRingPDP({ pricing, delivery, returns }: EngagementRingArgs) {
  const [size, setSize] = useState('6.5');
  const [metal, setMetal] = useState<Metal>("Rose Gold");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <header className="sticky bg-muted top-0 z-40 flex h-18 w-full items-center justify-center gap-4 border-b border-border px-4 md:px-6">
        <span className="text-muted-foreground">Header</span>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <PdpLayout
          stickyTop="96px"
          media={<PdpMediaGallery media={MEDIA} onMediaClick={setLightboxIndex} />}
          body={
            <div className="flex flex-col gap-12">
              {/* Before divider */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <PdpHeading name="Halo Diamond Engagement Ring" sku="ER-HALO-RG14-1CT-LG" />
                  <PdpPrice {...PRICING_PRESETS[pricing]} />
                  <div className="flex flex-col gap-1">
                    <PdpReturns {...RETURNS_PRESETS[returns]} />
                    <PdpDelivery {...DELIVERY_PRESETS[delivery]} />
                  </div>
                </div>
                <PdpVariantSelector label="Metal">
                  <ToggleGroup variant="outline" spacing={2} type="single" value={metal} onValueChange={(v) => v && setMetal(v as Metal)}>
                    {METALS.map((m) => (
                      <ToggleGroupItem key={m} value={m} disabled={m === "Platinum"}>{m}</ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </PdpVariantSelector>
                <PdpVariantSelector label="Finger size">
                  <ToggleGroup variant="outline" spacing={2} type="single" value={size} onValueChange={(v) => v && setSize(v)}>
                    {SIZES.map((s) => (
                      <ToggleGroupItem className="w-12" key={s} value={s} disabled={s === '8'}>{s}</ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </PdpVariantSelector>
                <PdpPrimaryAction
                  secondaryActions={
                    <>
                      <Button className="flex-1" variant="outline" onClick={onShortlist}><IconHeart size={16} /> Shortlist</Button>
                      <Button className="flex-1" variant="outline"><IconShare3 size={16} /> Share</Button>
                    </>
                  }
                >
                  <Button className="w-full" size="lg" onClick={onAddToCart}>Add to cart <IconShoppingCart size={16} /></Button>
                </PdpPrimaryAction>
              </div>
              <Separator />
              {/* After separator */}
              <PdpSpecifications
                rows={SPEC_ROWS}
                description="A brilliant round-cut centre stone framed by a pavé halo, set on a split shank lined with matched side stones. Hand-set prongs hold the centre diamond secure while the raised profile maximises light return from every angle."
              />
            </div>
          }
        >
        </PdpLayout>
      </div>
      <footer className="h-94 mt-20 bg-muted text-muted-foreground flex items-center justify-center border-t border-border">
        <span>Footer</span>
      </footer>

      {lightboxIndex !== null && (
        <Lightbox media={MEDIA} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}

const meta: Meta<EngagementRingArgs> = {
  title: "Templates/PDP",
  tags: ["autodocs"],
  argTypes: {
    pricing: {
      control: "select",
      options: Object.keys(PRICING_PRESETS) as PricingPreset[],
      description: "Pricing scenario preset — exercises the full PdpPrice matrix.",
    },
    delivery: {
      control: "select",
      options: Object.keys(DELIVERY_PRESETS) as DeliveryPreset[],
      description: "Delivery configuration preset.",
    },
    returns: {
      control: "select",
      options: Object.keys(RETURNS_PRESETS) as ReturnsPreset[],
      description: "Returns policy preset.",
    },
  },
  // Story renders its own chrome (sticky header + footer) so the
  // decorator just provides a full-bleed surface.
  decorators: [
    (Story) => (
      <div className="bg-background">
        <Story />
      </div>
    ),
  ],
};
export default meta;

export const EngagementRing: StoryObj<EngagementRingArgs> = {
  args: {
    pricing: "delivered-with-alt-currency",
    delivery: "regular",
    returns: "returnable-14",
  },
  render: (args) => <EngagementRingPDP {...args} />,
};
