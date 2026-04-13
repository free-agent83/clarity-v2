import type { Meta, StoryObj } from "@storybook/react";
import { Item, ItemContent, ItemTitle, ItemDescription } from "./item";

const meta: Meta<typeof Item> = {
  title: "Display/Item",
  component: Item,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Item>;

export const Default: Story = {
  render: () => (
    <Item>
      <ItemContent>
        <ItemTitle>Title</ItemTitle>
        <ItemDescription>Description</ItemDescription>
      </ItemContent>
    </Item>
  ),
};
