import type { Meta, StoryObj } from "@storybook/react";
import { Combobox, ComboboxContent, ComboboxItem, ComboboxList, ComboboxTrigger } from "./combobox";
import { Button } from "../../atoms/button/button";

const meta: Meta<typeof Combobox> = {
  title: "Forms/Combobox",
  component: Combobox,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Combobox>;

export const Default: Story = {
  render: () => (
    <Combobox>
      <ComboboxTrigger render={<Button variant="outline" className="w-48 justify-between" />}>
        Placeholder
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxList>
          <ComboboxItem value="one">One</ComboboxItem>
          <ComboboxItem value="two">Two</ComboboxItem>
          <ComboboxItem value="three">Three</ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};
