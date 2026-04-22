import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { userEvent, within, expect } from "@storybook/test";
import { Button } from "../../atoms/button/button";
import { Lightbox } from "./lightbox";
import type { ProductMedia } from "../../templates/pdp/pdp-types";

const IMAGES: ProductMedia[] = [
  { type: "image", src: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800", alt: "Diamond ring", thumbnailSrc: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200" },
  { type: "image", src: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800", alt: "Jewellery detail", thumbnailSrc: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=200" },
  { type: "image", src: "https://images.unsplash.com/photo-1574552377818-8e6b41be38d0?w=800", alt: "Gold bracelet", thumbnailSrc: "https://images.unsplash.com/photo-1574552377818-8e6b41be38d0?w=200" },
];

const MIXED: ProductMedia[] = [
  ...IMAGES.slice(0, 2),
  { type: "video360", src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", poster: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=200" },
];

function WithTrigger({ media, initialIndex = 0 }: { media: ProductMedia[]; initialIndex?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Lightbox</Button>
      {open && <Lightbox media={media} initialIndex={initialIndex} onClose={() => setOpen(false)} />}
    </>
  );
}

const meta: Meta<typeof Lightbox> = {
  title: "Overlays/Lightbox",
  component: Lightbox,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Lightbox>;

export const WithImages: Story = {
  render: () => <WithTrigger media={IMAGES} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Open the lightbox
    await userEvent.click(canvas.getByRole("button", { name: /open lightbox/i }));
    // Counter should show "1 / 3"
    await expect(canvas.getByText("1 / 3")).toBeInTheDocument();
    // Navigate to next with ArrowRight
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByText("2 / 3")).toBeInTheDocument();
    // Navigate back with ArrowLeft
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByText("1 / 3")).toBeInTheDocument();
  },
};
export const SingleImage: Story = { render: () => <WithTrigger media={[IMAGES[0]]} /> };
export const OpenAtSecondImage: Story = { render: () => <WithTrigger media={IMAGES} initialIndex={1} /> };
export const WithVideo360: Story = {
  render: () => <WithTrigger media={[MIXED[2]]} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: /open lightbox/i }));
    // Scrub bar label should be visible (always-on for 360°)
    await expect(canvas.getByText("Rotate")).toBeInTheDocument();
  },
};
export const MixedMedia: Story = { render: () => <WithTrigger media={MIXED} /> };
export const MixedOpenAtVideo: Story = { render: () => <WithTrigger media={MIXED} initialIndex={2} /> };
