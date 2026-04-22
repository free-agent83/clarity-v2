import type { Meta, StoryObj } from "@storybook/react";
import { PdpReturns } from "./pdp-returns";

const meta: Meta<typeof PdpReturns> = {
  title: "Templates/PDP/Returns",
  component: PdpReturns,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof PdpReturns>;

export const Returnable: Story = { args: { variant: "returnable", returnsWindow: "14 days" } };
export const ReturnableWithPolicyLink: Story = {
  render: () => <PdpReturns variant="returnable" returnsWindow="14 days" policyLink={<a href="#">Returns Policy</a>} />,
};
export const NonReturnable: Story = { args: { variant: "non-returnable" } };
