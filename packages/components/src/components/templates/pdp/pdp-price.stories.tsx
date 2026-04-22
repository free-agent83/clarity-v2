import type { Meta, StoryObj } from "@storybook/react";
import { PdpPrice } from "./pdp-price";

const ALT = { amount: 1082, currency: "EUR" };

const meta: Meta<typeof PdpPrice> = {
  title: "Templates/PDP/Price",
  component: PdpPrice,
  tags: ["autodocs"],
  decorators: [(Story) => <div style={{ maxWidth: 360 }}><Story /></div>],
};
export default meta;
type Story = StoryObj<typeof PdpPrice>;

export const Simple: Story = {
  args: { amount: 1174, currency: "USD", label: "Final delivered price", alternateCurrency: ALT },
};

export const SimpleNoAltCurrency: Story = {
  args: { amount: 1174, currency: "USD", label: "Final delivered price", alternateCurrency: ALT, showAlternateCurrency: false },
};

export const PerCarat: Story = {
  args: { amount: 4250, currency: "USD", perCarat: { amount: 850, currency: "USD" }, alternateCurrency: ALT },
};

export const WithDiscount: Story = {
  args: { amount: 4250, currency: "USD", discount: { percentage: 12, originalAmount: 4830 }, alternateCurrency: ALT },
};

export const DiscountAndPerCarat: Story = {
  args: { amount: 4250, currency: "USD", perCarat: { amount: 850, currency: "USD" }, discount: { percentage: 12, originalAmount: 4830 }, alternateCurrency: ALT },
};

export const InclTariffs: Story = {
  args: { amount: 4250, currency: "USD", includeTariffs: true, alternateCurrency: ALT },
};

export const TariffsAndDiscount: Story = {
  args: { amount: 4250, currency: "USD", includeTariffs: true, discount: { percentage: 12, originalAmount: 4830 }, alternateCurrency: ALT },
};

export const Legacy: Story = {
  args: { amount: 3800, currency: "USD", legacy: { deliveredAmount: 4250, deliveredCurrency: "USD" }, alternateCurrency: ALT },
};
