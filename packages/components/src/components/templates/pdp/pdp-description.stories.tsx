import type { Meta, StoryObj } from "@storybook/react";
import { PdpDescription } from "./pdp-description";

const meta: Meta<typeof PdpDescription> = {
  title: "Templates/PDP/Description",
  component: PdpDescription,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof PdpDescription>;

export const PlainText: Story = {
  args: {
    children:
      "This classic tennis bracelet features a single row of scintillating brilliant cut lab-grown diamonds set in finely crafted four prong baskets.",
  },
};

export const RichContent: Story = {
  render: () => (
    <PdpDescription>
      <p>
        This classic tennis bracelet features a single row of scintillating brilliant cut lab-grown diamonds set in
        finely crafted four prong baskets.
      </p>
      <p>
        The 14k white gold setting provides a bright, cool-toned backdrop that enhances the brilliance of each stone.
      </p>
    </PdpDescription>
  ),
};
