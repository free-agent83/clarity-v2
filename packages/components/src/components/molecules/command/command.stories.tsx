import type { Meta, StoryObj } from "@storybook/react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";

const meta: Meta<typeof Command> = {
  title: "Actions/Command",
  component: Command,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Command>;

export const Default: Story = {
  render: () => (
    <Command className="w-64 rounded-lg border">
      <CommandInput placeholder="Type a command..." />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Group">
          <CommandItem>One</CommandItem>
          <CommandItem>Two</CommandItem>
          <CommandItem>Three</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  ),
};
