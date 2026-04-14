import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within, expect, waitFor } from "@storybook/test";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
} from "./select";

const meta: Meta<typeof Select> = {
  title: "Forms/Select",
  component: Select,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select a cut" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="round">Round brilliant</SelectItem>
        <SelectItem value="princess">Princess</SelectItem>
        <SelectItem value="emerald">Emerald</SelectItem>
        <SelectItem value="oval">Oval</SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");
    await userEvent.click(trigger);
    const body = within(document.body);
    await waitFor(async () => {
      await expect(
        body.getByRole("option", { name: "Princess" })
      ).toBeInTheDocument();
    });
    await userEvent.click(body.getByRole("option", { name: "Princess" }));
    await waitFor(async () => {
      await expect(trigger).toHaveTextContent("Princess");
    });
  },
};

export const WithGroups: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select a cut" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Round-like</SelectLabel>
          <SelectItem value="round">Round brilliant</SelectItem>
          <SelectItem value="oval">Oval</SelectItem>
          <SelectItem value="cushion">Cushion</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Rectangular</SelectLabel>
          <SelectItem value="princess">Princess</SelectItem>
          <SelectItem value="emerald">Emerald</SelectItem>
          <SelectItem value="radiant">Radiant</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>Fancy</SelectLabel>
          <SelectItem value="marquise">Marquise</SelectItem>
          <SelectItem value="pear">Pear</SelectItem>
          <SelectItem value="heart">Heart</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

const COUNTRIES = [
  "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada",
  "Chile", "China", "Colombia", "Czechia", "Denmark", "Egypt",
  "Finland", "France", "Germany", "Greece", "India", "Indonesia",
  "Ireland", "Italy", "Japan", "Mexico", "Netherlands", "New Zealand",
  "Norway", "Peru", "Poland", "Portugal", "Romania", "Singapore",
  "South Africa", "Spain", "Sweden", "Switzerland", "Thailand",
  "Turkey", "United Kingdom", "United States", "Vietnam",
];

export const Scrollable: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Select a country" />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {COUNTRIES.map((country) => (
          <SelectItem key={country} value={country.toLowerCase()}>
            {country}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
};
