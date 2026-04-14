import type { Meta, StoryObj } from "@storybook/react";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

const meta: Meta<typeof ToggleGroup> = {
  title: "Forms/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

export const Default: Story = {
  render: () => (
    <ToggleGroup variant="outline" type="single" defaultValue="natural-diamonds">
      <ToggleGroupItem value="natural-diamonds">Natural diamonds</ToggleGroupItem>
      <ToggleGroupItem value="labgrown-diamonds">Lab grown diamonds</ToggleGroupItem>
      <ToggleGroupItem value="gemstones">Gemstones</ToggleGroupItem>
    </ToggleGroup>
  ),
};
