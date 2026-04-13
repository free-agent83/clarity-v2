import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Label } from "../label/label";

const meta: Meta<typeof RadioGroup> = {
  title: "Forms/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="one">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="one" id="r1" />
        <Label htmlFor="r1">One</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="two" id="r2" />
        <Label htmlFor="r2">Two</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="three" id="r3" />
        <Label htmlFor="r3">Three</Label>
      </div>
    </RadioGroup>
  ),
};
