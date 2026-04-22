import type { Meta, StoryObj } from "@storybook/react";
import { PdpDelivery } from "./pdp-delivery";

const meta: Meta<typeof PdpDelivery> = {
  title: "Templates/PDP/Delivery",
  component: PdpDelivery,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof PdpDelivery>;

export const Regular: Story = { args: { variant: "regular", date: "15 business days" } };
export const Express: Story = { args: { variant: "express", date: "Nov 18–23" } };
export const RegularWithShipsFrom: Story = { args: { variant: "regular", date: "15 business days", shipsFrom: "Botswana" } };
