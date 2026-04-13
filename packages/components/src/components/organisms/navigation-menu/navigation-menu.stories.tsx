import type { Meta, StoryObj } from "@storybook/react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./navigation-menu";

const meta: Meta<typeof NavigationMenu> = {
  title: "Navigation/NavigationMenu",
  component: NavigationMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>One</NavigationMenuTrigger>
          <NavigationMenuContent>Content one</NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Two</NavigationMenuTrigger>
          <NavigationMenuContent>Content two</NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Three</NavigationMenuTrigger>
          <NavigationMenuContent>Content three</NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};
