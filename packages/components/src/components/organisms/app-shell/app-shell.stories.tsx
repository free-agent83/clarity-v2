import type { Meta, StoryObj } from "@storybook/react";
import { fn, userEvent, within, expect, waitFor } from "@storybook/test";
import {
  IconAlertTriangle,
  IconCalculator,
  IconCurrencyEuro,
  IconHeart,
  IconHelp,
  IconShoppingCart,
  IconSparkles,
} from "@tabler/icons-react";
import * as React from "react";

import { Button } from "@/components/atoms/button/button";
import {
  PageBanner,
  PageBannerAction,
  PageBannerTitle,
} from "@/components/atoms/page-banner/page-banner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms/tooltip/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/molecules/dialog/dialog";
import {
  AppShell,
  AppShellActions,
  AppShellHeader,
  AppShellMain,
  AppShellNavigationSheet,
} from "./app-shell";

const meta: Meta<typeof AppShell> = {
  title: "Navigation/App Shell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    full: {
      control: "boolean",
      description:
        "Escape hatch that removes the main area's max-width. Exception, not the rule.",
    },
    defaultNavigationOpen: {
      control: "boolean",
      description:
        "Start with the navigation sheet visible on mount. Intended for workbench stories.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof AppShell>;

const exampleUser = {
  name: "John Appleseed",
  email: "j.appleseed@nivoda.net",
  avatarSrc: "https://i.pravatar.cc/150",
};

function HeaderActions() {
  return (
    <AppShellActions>
      <Button variant="outline">Sign in</Button>
    </AppShellActions>
  );
}

function NavigationBody() {
  return (
    <>
      <nav className="flex flex-col gap-2">
        <h2 className="font-heading text-sm font-semibold">Browse</h2>
        <Button variant="ghost" className="justify-start" block>
          Natural diamonds
        </Button>
        <Button variant="ghost" className="justify-start" block>
          Lab grown diamonds
        </Button>
        <Button variant="ghost" className="justify-start" block>
          Gemstones
        </Button>
        <Button variant="ghost" className="justify-start" block>
          Natural melee
        </Button>
        <Button variant="ghost" className="justify-start" block>
          Lab-grown melee
        </Button>
        <Button variant="ghost" className="justify-start" block>
          Custom jewellery
        </Button>
      </nav>
      <nav className="flex flex-col gap-2">
        <h2 className="font-heading text-sm font-semibold">My List</h2>
        <Button variant="ghost" className="justify-start" block>
          Orders
        </Button>
        <Button variant="ghost" className="justify-start" block>
          Finances
        </Button>
        <Button variant="ghost" className="justify-start" block>
          My Memo
        </Button>
        <Button variant="ghost" className="justify-start" block>
          Shortlists
        </Button>
        <Button variant="ghost" className="justify-start" block>
          Requests
        </Button>
        <Button variant="ghost" className="justify-start" block>
          Holds
        </Button>
        <Button variant="ghost" className="justify-start" block>
          Feed centre
        </Button>
      </nav>
      <nav className="flex flex-col gap-2">
        <Button variant="ghost" className="justify-start" block>
          Admin Dashboard
        </Button>
        <Button variant="ghost" className="justify-start" block>
          Settings
        </Button>
      </nav>
    </>
  );
}

function PagePlaceholder() {
  return (
    <div className="flex min-h-96 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
      Page content
    </div>
  );
}

export const Default: Story = {
  args: { full: false },
  render: (args) => (
    <AppShell {...args}>
      <AppShellHeader onSearch={() => {}} />
      <AppShellNavigationSheet
        title="Navigation"
        heading={
          <span className="font-heading text-xl font-semibold tracking-tight">
            Supplier Area
          </span>
        }
        user={exampleUser}
        onLogout={() => {}}
      >
        <NavigationBody />
      </AppShellNavigationSheet>
      <AppShellMain>
        <PagePlaceholder />
      </AppShellMain>
    </AppShell>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    const trigger = canvas.getByRole("button", { name: "Menu" });
    await userEvent.click(trigger);

    await waitFor(async () => {
      await expect(
        body.getByRole("dialog", { name: "Navigation" }),
      ).toBeInTheDocument();
    });

    await userEvent.keyboard("{Escape}");

    await waitFor(async () => {
      await expect(
        body.queryByRole("dialog", { name: "Navigation" }),
      ).not.toBeInTheDocument();
    });
  },
};

export const FullWidth: Story = {
  args: { full: true },
  render: (args) => (
    <AppShell {...args}>
      <AppShellHeader onSearch={() => {}}>
        <HeaderActions />
      </AppShellHeader>
      <AppShellNavigationSheet
        title="Navigation"
        heading={
          <span className="font-heading text-xl font-semibold tracking-tight">
            Supplier Area
          </span>
        }
        user={exampleUser}
        onLogout={() => {}}
      >
        <NavigationBody />
      </AppShellNavigationSheet>
      <AppShellMain>
        <PagePlaceholder />
      </AppShellMain>
    </AppShell>
  ),
};

export const NavigationOpen: Story = {
  args: { defaultNavigationOpen: true },
  parameters: {
    docs: {
      description: {
        story:
          "Workbench story for iterating on the navigation sheet in isolation — the sheet is open on mount. Still dismissible via Escape or the overlay; refresh to reopen.",
      },
    },
  },
  render: (args) => (
    <AppShell {...args}>
      <AppShellHeader onSearch={() => {}}>
        <HeaderActions />
      </AppShellHeader>
      <AppShellNavigationSheet
        title="Navigation"
        heading={
          <span className="font-heading text-xl font-semibold tracking-tight">
            Supplier Area
          </span>
        }
        user={exampleUser}
        onLogout={() => {}}
      >
        <NavigationBody />
      </AppShellNavigationSheet>
      <AppShellMain>
        <PagePlaceholder />
      </AppShellMain>
    </AppShell>
  ),
};

export const SearchDialog: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The search bar is a hardcoded button in the header — clicking it fires `onSearch`. How the search is handled is app-specific. This story wires `onSearch` to open an empty Dialog as a placeholder for whatever search UI the consuming app provides.",
      },
    },
  },
  render: (args) => {
    const SearchHarness = () => {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <AppShell {...args}>
            <AppShellHeader onSearch={() => setOpen(true)}>
                    <HeaderActions />
            </AppShellHeader>
            <AppShellNavigationSheet
              title="Navigation"
              heading={
                <span className="font-heading text-xl font-semibold tracking-tight">
                  Supplier Area
                </span>
              }
              user={exampleUser}
              onLogout={() => {}}
            >
              <NavigationBody />
            </AppShellNavigationSheet>
            <AppShellMain>
              <PagePlaceholder />
            </AppShellMain>
          </AppShell>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Search</DialogTitle>
                <DialogDescription>
                  App-specific search UI goes here.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </>
      );
    };
    return <SearchHarness />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    const searchBar = canvas.getByRole("button", { name: /Search Nivoda/i });
    await userEvent.click(searchBar);

    await waitFor(async () => {
      await expect(
        body.getByRole("dialog", { name: "Search" }),
      ).toBeInTheDocument();
    });

    await userEvent.keyboard("{Escape}");

    await waitFor(async () => {
      await expect(
        body.queryByRole("dialog", { name: "Search" }),
      ).not.toBeInTheDocument();
    });
  },
};

export const TrailingControls: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Showcases a fuller set of trailing controls composed inside `AppShellActions`. None of the buttons are wired — they illustrate composition only. All five sit at `h-11`, preserving the header's vertical rhythm: the three leading icon buttons use `size=\"icon\"` (44×44), and the two trailing text buttons use the default size.",
      },
    },
  },
  render: (args) => (
    <TooltipProvider>
      <AppShell {...args}>
        <AppShellHeader onSearch={() => {}}>
            <AppShellActions>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Calculator">
                  <IconCalculator />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Calculator</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Select currency"
                >
                  <IconCurrencyEuro />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Select currency</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Shortlists">
                  <IconHeart />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Shortlists</TooltipContent>
            </Tooltip>
            <Button variant="outline">
              Cart (2)
              <IconShoppingCart />
            </Button>
            <Button variant="outline">
              Help
              <IconHelp />
            </Button>
          </AppShellActions>
        </AppShellHeader>
        <AppShellNavigationSheet
          title="Navigation"
          heading={
            <span className="font-heading text-xl font-semibold tracking-tight">
              Supplier Area
            </span>
          }
          user={exampleUser}
          onLogout={() => {}}
        >
          <NavigationBody />
        </AppShellNavigationSheet>
        <AppShellMain>
          <PagePlaceholder />
        </AppShellMain>
      </AppShell>
    </TooltipProvider>
  ),
};

export const WithBanner: Story = {
  render: (args) => (
    <AppShell
      {...args}
      banner={
        <PageBanner variant="default">
          <IconSparkles />
          <PageBannerTitle>
            New: AI-assisted search is now available on all accounts.
          </PageBannerTitle>
          <PageBannerAction>
            <Button variant="link" size="sm" className="text-current">
              Learn more
            </Button>
          </PageBannerAction>
        </PageBanner>
      }
    >
      <AppShellHeader onSearch={fn()} />
      <AppShellMain>
        <div className="py-8">
          <h1 className="text-2xl font-heading font-medium">Page content</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The PageBanner above is non-sticky — scroll down to see it leave the viewport while the header stays fixed.
          </p>
          <div className="h-[200vh]" />
        </div>
      </AppShellMain>
    </AppShell>
  ),
};

export const WithDismissibleBanner: Story = {
  render: (args) => (
    <AppShell
      {...args}
      banner={
        <PageBanner variant="warning" onDismiss={fn()}>
          <IconAlertTriangle />
          <PageBannerTitle>
            Scheduled maintenance this Sunday 02:00–04:00 UTC.
          </PageBannerTitle>
          <PageBannerAction>
            <Button variant="link" size="sm" className="text-current">
              Read more
            </Button>
          </PageBannerAction>
        </PageBanner>
      }
    >
      <AppShellHeader onSearch={fn()} />
      <AppShellMain>
        <div className="py-8">
          <h1 className="text-2xl font-heading font-medium">Page content</h1>
        </div>
      </AppShellMain>
    </AppShell>
  ),
};
