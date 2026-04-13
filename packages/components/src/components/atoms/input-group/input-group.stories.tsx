import type { Meta, StoryObj } from "@storybook/react";
import { InputGroup, InputGroupInput, InputGroupAddon } from "./input-group";

const meta: Meta<typeof InputGroup> = {
  title: "Forms/InputGroup",
  component: InputGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InputGroup>;

export const Default: Story = {
  render: () => (
    <InputGroup className="w-64">
      <InputGroupAddon>@</InputGroupAddon>
      <InputGroupInput placeholder="Placeholder" />
    </InputGroup>
  ),
};
