import type { Meta, StoryObj } from "@storybook/react";
import { PdpHeading } from "./pdp-heading";

const meta: Meta<typeof PdpHeading> = {
  title: "Templates/PDP/Heading",
  component: PdpHeading,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof PdpHeading>;

export const WithSku: Story = {
  args: { name: "4-Prong 14K White Gold 5ct Lab Grown", sku: "NTB-C4P-WG14-5CT-7IN-LG" },
};

export const NoSku: Story = {
  args: { name: "Blue Sapphire Emerald Cut" },
};

export const LongName: Story = {
  args: {
    name: "Cushion Cut Natural Blue Sapphire 3.42ct Madagascar No Heat GIA Certified",
    sku: "SAP-CSH-BL-342-MAD-NH-GIA",
  },
};
