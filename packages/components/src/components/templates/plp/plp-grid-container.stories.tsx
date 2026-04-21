import type { Meta, StoryObj } from "@storybook/react";
import { PlpGridContainer } from "./plp-grid-container";

const meta: Meta<typeof PlpGridContainer> = {
  title: "Templates/PLP/GridContainer",
  component: PlpGridContainer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof PlpGridContainer>;

export const Loading: Story = {
  render: () => (
    <div className="p-6">
      <PlpGridContainer loading skeletonCount={8} />
    </div>
  ),
};

export const WithChildren: Story = {
  render: () => (
    <div className="p-6">
      <PlpGridContainer>
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="flex aspect-square items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground"
          >
            Card {i + 1}
          </div>
        ))}
      </PlpGridContainer>
    </div>
  ),
};
