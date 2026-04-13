import type { Meta, StoryObj } from "@storybook/react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "./combobox";

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
      <ComboboxTrigger className="w-48">
        <ComboboxValue placeholder="Placeholder" />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxInput placeholder="Search..." />
        <ComboboxEmpty>No results.</ComboboxEmpty>
        <ComboboxList>
          <ComboboxItem value="one">One</ComboboxItem>
          <ComboboxItem value="two">Two</ComboboxItem>
          <ComboboxItem value="three">Three</ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  ),
};
