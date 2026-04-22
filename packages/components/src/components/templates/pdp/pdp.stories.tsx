import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { useState } from "react";
import { IconHeart, IconShare, IconShoppingCart } from "@tabler/icons-react";
import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { ToggleGroup, ToggleGroupItem } from "../../atoms/toggle-group/toggle-group";
import { Lightbox } from "../../molecules/lightbox/lightbox";
import { PdpDelivery } from "./pdp-delivery";
import { PdpDescription } from "./pdp-description";
import { PdpHeading } from "./pdp-heading";
import { PdpLayout } from "./pdp-layout";
import { PdpMediaGallery } from "./pdp-media-gallery";
import { PdpPrice } from "./pdp-price";
import { PdpPrimaryAction } from "./pdp-primary-action";
import { PdpReturns } from "./pdp-returns";
import { PdpSpecifications } from "./pdp-specifications";
import { PdpVariantSelector } from "./pdp-variant-selector";
import type { ProductMedia } from "./pdp-types";

const onAddToCart = fn();
const onShortlist = fn();

const MEDIA: ProductMedia[] = [
  { type: "image", src: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800", alt: "4-Prong 14K White Gold Tennis Bracelet", thumbnailSrc: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=120" },
  { type: "image", src: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800", alt: "Tennis bracelet side view", thumbnailSrc: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=120" },
  { type: "video360", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", poster: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=120" },
];

const SPEC_ROWS = [
  { label: "Style", value: "Classic 4 prong" },
  { label: "Metal", value: "14k White Gold" },
  { label: "Metal weight", value: "9.01g" },
  { label: "Diamond type", value: <Badge variant="outline">Lab-grown</Badge> },
  { label: "Total carat weight", value: "5ct" },
  { label: "Stone count", value: "55" },
  { label: "Stone quality", value: "F–G, VS, Very Good" },
];

const SIZES = ['6"', '6.5"', '7"', '7.5"', '8"'];

/**
 * Canonical assembly reference for a tennis bracelet PDP.
 * NOT a template — an example of how consumers compose PDP primitives.
 */
function TennisBraceletPDP() {
  const [size, setSize] = useState('7"');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <PdpLayout
        stickyTop="64px"
        media={<PdpMediaGallery media={MEDIA} onMediaClick={setLightboxIndex} />}
        body={
          <div className="flex flex-col gap-6">
            <PdpHeading name="4-Prong 14K White Gold 5ct Lab Grown" sku="NTB-C4P-WG14-5CT-7IN-LG" />
            <PdpPrice
              amount={1174}
              currency="USD"
              label="Final delivered price"
              alternateCurrency={{ amount: 1082, currency: "EUR" }}
            />
            <PdpVariantSelector label="Size">
              <ToggleGroup type="single" value={size} onValueChange={(v) => v && setSize(v)}>
                {SIZES.map((s) => (
                  <ToggleGroupItem key={s} value={s} disabled={s === '8"'}>{s}</ToggleGroupItem>
                ))}
              </ToggleGroup>
            </PdpVariantSelector>
            <PdpPrimaryAction
              secondaryActions={
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={onShortlist} aria-label="Add to shortlist"><IconHeart size={16} /></Button>
                  <Button variant="outline" size="icon" aria-label="Share"><IconShare size={16} /></Button>
                </div>
              }
            >
              <Button className="w-full" onClick={onAddToCart}>Add to cart <IconShoppingCart size={16} /></Button>
            </PdpPrimaryAction>
            <div className="flex flex-col gap-2">
              <PdpReturns variant="returnable" returnsWindow="14 days" policyLink={<a href="#">Returns Policy applies</a>} />
              <PdpDelivery variant="regular" date="15 business days" />
            </div>
          </div>
        }
      >
        <PdpSpecifications rows={SPEC_ROWS} />
        <PdpDescription>
          This classic tennis bracelet features a single row of scintillating brilliant cut lab-grown diamonds set in finely crafted four prong baskets.
        </PdpDescription>
      </PdpLayout>

      {lightboxIndex !== null && (
        <Lightbox media={MEDIA} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}

const meta: Meta = {
  title: "Templates/PDP",
  tags: ["autodocs"],
  // Wrap with a container that provides max-width and padding similar to a real page
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Story />
      </div>
    ),
  ],
};
export default meta;

export const TennisBracelet: StoryObj = {
  render: () => <TennisBraceletPDP />,
};
