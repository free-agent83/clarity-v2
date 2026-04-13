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
    <ToggleGroup type="single" defaultValue="one">
      <ToggleGroupItem value="one">One</ToggleGroupItem>
      <ToggleGroupItem value="two">Two</ToggleGroupItem>
      <ToggleGroupItem value="three">Three</ToggleGroupItem>
    </ToggleGroup>
  ),
};
