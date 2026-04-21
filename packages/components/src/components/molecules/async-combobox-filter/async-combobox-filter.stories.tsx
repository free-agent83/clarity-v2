import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  AsyncComboboxFilter,
  type AsyncComboboxOption,
  type AsyncComboboxValue,
} from "./async-combobox-filter";
import {
  MOCK_SUPPLIERS,
  mockSupplierSearch,
} from "../../templates/plp/mocks/common";

const meta: Meta<typeof AsyncComboboxFilter> = {
  title: "Filtering/AsyncComboboxFilter",
  component: AsyncComboboxFilter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AsyncComboboxFilter>;

function Controlled({ initial }: { initial?: AsyncComboboxValue }) {
  const [value, setValue] = useState<AsyncComboboxValue>(initial);
  return (
    <div className="w-80">
      <AsyncComboboxFilter
        value={value}
        onChange={setValue}
        searchFn={mockSupplierSearch}
        searchPlaceholder="Search suppliers..."
      />
    </div>
  );
}

export const Default: Story = { render: () => <Controlled /> };

export const WithSelection: Story = {
  render: () => {
    const preselected: AsyncComboboxOption[] = MOCK_SUPPLIERS.filter((s) =>
      ["sup-acme", "sup-globex"].includes(s.value)
    );
    return <Controlled initial={preselected} />;
  },
};
