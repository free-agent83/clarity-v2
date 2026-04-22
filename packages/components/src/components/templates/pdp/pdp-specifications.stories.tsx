import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "../../atoms/badge/badge";
import { PdpSpecifications } from "./pdp-specifications";

const meta: Meta<typeof PdpSpecifications> = {
  title: "Templates/PDP/Specifications",
  component: PdpSpecifications,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof PdpSpecifications>;

export const TennisBracelet: Story = {
  args: {
    rows: [
      { label: "Style", value: "Classic 4 prong" },
      { label: "Metal", value: "14k White Gold" },
      { label: "Metal weight", value: "9.01g" },
      { label: "Diamond type", value: "Lab-grown" },
      { label: "Total carat weight", value: "5ct" },
      { label: "Stone count", value: "55" },
      { label: "Stone quality", value: "F–G, VS, Very Good" },
    ],
  },
};

export const WithReactNodeValues: Story = {
  render: () => (
    <PdpSpecifications
      rows={[
        { label: "Diamond type", value: <Badge variant="outline">Lab-grown</Badge> },
        { label: "Origin", value: "Botswana" },
      ]}
    />
  ),
};

export const CustomHeading: Story = {
  args: {
    heading: "Stone details",
    rows: [
      { label: "Shape", value: "Emerald" },
      { label: "Carat", value: "3.42ct" },
    ],
  },
};
