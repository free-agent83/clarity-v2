import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Lightbox } from "../../molecules/lightbox/lightbox";
import { PdpMediaGallery } from "./pdp-media-gallery";
import type { ProductMedia } from "./pdp-types";

const IMAGES: ProductMedia[] = [
  { type: "image", src: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800", alt: "Tennis bracelet front", thumbnailSrc: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=120" },
  { type: "image", src: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800", alt: "Tennis bracelet side", thumbnailSrc: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=120" },
  { type: "image", src: "https://images.unsplash.com/photo-1574552377818-8e6b41be38d0?w=800", alt: "Tennis bracelet clasp", thumbnailSrc: "https://images.unsplash.com/photo-1574552377818-8e6b41be38d0?w=120" },
];
const WITH_VIDEO: ProductMedia[] = [
  ...IMAGES,
  { type: "video360", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", poster: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=120" },
];

function GalleryWithLightbox({ media }: { media: ProductMedia[] }) {
  const [idx, setIdx] = useState<number | null>(null);
  return (
    <>
      <PdpMediaGallery media={media} onMediaClick={setIdx} />
      {idx !== null && <Lightbox media={media} initialIndex={idx} onClose={() => setIdx(null)} />}
    </>
  );
}

const meta: Meta<typeof PdpMediaGallery> = {
  title: "Templates/PDP/MediaGallery",
  component: PdpMediaGallery,
  tags: ["autodocs"],
  decorators: [(Story) => <div style={{ maxWidth: 480 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof PdpMediaGallery>;

export const StaticImages: Story = { render: () => <GalleryWithLightbox media={IMAGES} /> };
export const SingleImage: Story = { render: () => <GalleryWithLightbox media={[IMAGES[0]]} /> };
export const WithVideo360: Story = { render: () => <GalleryWithLightbox media={WITH_VIDEO} /> };
