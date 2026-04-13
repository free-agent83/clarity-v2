import type { Meta, StoryObj } from "@storybook/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const meta: Meta<typeof DropdownMenu> = {
  title: "Actions/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger>Trigger</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Label</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>One</DropdownMenuItem>
        <DropdownMenuItem>Two</DropdownMenuItem>
        <DropdownMenuItem>Three</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
