import type { Meta, StoryObj } from "@storybook/react";
import { Field, FieldLabel } from "./field";
import { Input } from "../input/input";

const meta: Meta<typeof Field> = {
  title: "Forms/Field",
  component: Field,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Field>;

export const Default: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="default">Label</FieldLabel>
      <Input id="default" placeholder="Placeholder" />
    </Field>
  ),
};
