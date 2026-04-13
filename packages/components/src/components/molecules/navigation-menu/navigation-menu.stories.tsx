import type { Meta, StoryObj } from "@storybook/react"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "./navigation-menu"

const meta: Meta<typeof NavigationMenu> = {
  title: "Navigation/Navigation Menu",
  component: NavigationMenu,
  tags: ["autodocs"],
}

export default meta
type Story = StoryObj<typeof NavigationMenu>

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/docs">
              <div className="font-medium">Introduction</div>
              <p className="text-muted-foreground">
                Learn the basics of the design system.
              </p>
            </NavigationMenuLink>
            <NavigationMenuLink href="/docs/installation">
              <div className="font-medium">Installation</div>
              <p className="text-muted-foreground">
                How to install and set up the library.
              </p>
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink href="/docs/components/button">
              <div className="font-medium">Button</div>
              <p className="text-muted-foreground">
                Primary interactive element for triggering actions.
              </p>
            </NavigationMenuLink>
            <NavigationMenuLink href="/docs/components/input">
              <div className="font-medium">Input</div>
              <p className="text-muted-foreground">
                Text input for forms and data entry.
              </p>
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
}
