import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "../../atoms/toggle-group/toggle-group";
import { PdpVariantSelector } from "./pdp-variant-selector";

const meta: Meta<typeof PdpVariantSelector> = {
  title: "Templates/PDP/VariantSelector",
  component: PdpVariantSelector,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof PdpVariantSelector>;

export const SizeSelector: Story = {
  render: () => {
    function S() {
      const [v, setV] = useState('7"');
      return (
        <PdpVariantSelector label="Size">
          <ToggleGroup type="single" value={v} onValueChange={(val) => val && setV(val)}>
            {['6"', '6.5"', '7"', '7.5"', '8"'].map((s) => (
              <ToggleGroupItem key={s} value={s} disabled={s === '8"'}>{s}</ToggleGroupItem>
            ))}
          </ToggleGroup>
        </PdpVariantSelector>
      );
    }
    return <S />;
  },
};
