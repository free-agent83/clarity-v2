import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { IconHeart, IconShare, IconShoppingCart } from "@tabler/icons-react";
import { Button } from "../../atoms/button/button";
import { PdpPrimaryAction } from "./pdp-primary-action";

const onAddToCart = fn();

const meta: Meta<typeof PdpPrimaryAction> = {
  title: "Templates/PDP/PrimaryAction",
  component: PdpPrimaryAction,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof PdpPrimaryAction>;

export const Default: Story = {
  render: () => (
    <PdpPrimaryAction>
      <Button className="w-full" onClick={onAddToCart}>Add to cart <IconShoppingCart size={16} /></Button>
    </PdpPrimaryAction>
  ),
};

export const WithSecondaryActions: Story = {
  render: () => (
    <PdpPrimaryAction
      secondaryActions={
        <div className="flex gap-2">
          <Button variant="outline" size="icon" aria-label="Add to shortlist"><IconHeart size={16} /></Button>
          <Button variant="outline" size="icon" aria-label="Share"><IconShare size={16} /></Button>
        </div>
      }
    >
      <Button className="w-full" onClick={onAddToCart}>Add to cart <IconShoppingCart size={16} /></Button>
    </PdpPrimaryAction>
  ),
};
