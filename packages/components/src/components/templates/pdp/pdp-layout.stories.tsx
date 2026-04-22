import type { Meta, StoryObj } from "@storybook/react";
import { PdpLayout } from "./pdp-layout";

const MediaSlot = () => (
  <div className="aspect-square rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground">
    Media slot (sticky)
  </div>
);
const BodySlot = () => (
  <div className="flex flex-col gap-4">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-16 rounded bg-muted" />
    ))}
  </div>
);
const BelowFold = () => (
  <div className="h-48 rounded-lg bg-muted/50 flex items-center justify-center text-sm text-muted-foreground">
    Below-fold (full width)
  </div>
);

const meta: Meta<typeof PdpLayout> = {
  title: "Templates/PDP/Layout",
  component: PdpLayout,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof PdpLayout>;

export const Default: Story = {
  render: () => <PdpLayout media={<MediaSlot />} body={<BodySlot />}><BelowFold /></PdpLayout>,
};
export const NoChildren: Story = {
  render: () => <PdpLayout media={<MediaSlot />} body={<BodySlot />} />,
};
export const WithStickyTop: Story = {
  render: () => <PdpLayout media={<MediaSlot />} body={<BodySlot />} stickyTop="64px"><BelowFold /></PdpLayout>,
};
