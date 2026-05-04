import type { Meta, StoryObj } from "@storybook/react"
import { userEvent, within, expect, waitFor } from "@storybook/test"
import {
  IconArrowRight,
  IconCalendarTime,
  IconCash,
  IconChevronDown,
  IconCreditCard,
  IconCurrencyBitcoin,
  IconFileInvoice,
  IconFolder,
  IconHelpCircle,
  IconNews,
  IconShieldLock,
  IconUserPlus,
} from "@tabler/icons-react"

import { Badge } from "../../atoms/badge/badge"
import { Button } from "../../atoms/button/button"
import {
  Megamenu,
  MegamenuContent,
  MegamenuFooter,
  MegamenuGroup,
  MegamenuLink,
  MegamenuSection,
  MegamenuTabs,
  MegamenuTabsList,
  MegamenuTabsPanel,
  MegamenuTabsTrigger,
  MegamenuTrigger,
} from "./megamenu"

const meta: Meta<typeof MegamenuGroup> = {
  title: "Navigation/Megamenu",
  component: MegamenuGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-[600px] flex-col bg-background">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-6">
          <span className="text-sm font-semibold tracking-tight">
            Storybook Co.
          </span>
          <Story />
          <Button size="sm">Sign in</Button>
        </header>
        <main className="flex-1 p-8">
          <p className="text-sm text-muted-foreground">
            Hover over a megamenu trigger to open its panel. The panel
            anchors below the header row and spans the viewport width.
          </p>
        </main>
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof MegamenuGroup>

type NavLinkItemProps = (
  | (React.ComponentProps<"a"> & { href: string })
  | (React.ComponentProps<"button"> & { href?: undefined })
) & {
  /**
   * Show a chevron after the label that rotates when the
   * surrounding `data-state="open"` is set on the rendered element.
   */
  withChevron?: boolean
}

function NavLinkItem({
  children,
  withChevron = false,
  className = "",
  ...props
}: NavLinkItemProps) {
  const baseClassName = `inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium text-foreground/80 outline-none transition-colors hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground data-[state=open]:text-foreground ${className}`

  const inner = (
    <>
      {children}
      {withChevron ? (
        <IconChevronDown
          aria-hidden="true"
          className="size-3 transition-transform [[data-state=open]_&]:rotate-180"
        />
      ) : null}
    </>
  )

  if ("href" in props && props.href !== undefined) {
    return (
      <a className={baseClassName} {...(props as React.ComponentProps<"a">)}>
        {inner}
      </a>
    )
  }

  const buttonProps = props as React.ComponentProps<"button">
  return (
    <button
      type={buttonProps.type ?? "button"}
      className={baseClassName}
      {...buttonProps}
    >
      {inner}
    </button>
  )
}

export const Default: Story = {
  render: () => (
    <MegamenuGroup aria-label="Main">
      <Megamenu>
        <MegamenuTrigger asChild>
          <NavLinkItem withChevron>Platform</NavLinkItem>
        </MegamenuTrigger>
        <MegamenuContent>
          <MegamenuTabs defaultValue="contractors">
            <MegamenuTabsList>
              <MegamenuTabsTrigger value="contractors">
                For Contractors
              </MegamenuTabsTrigger>
              <MegamenuTabsTrigger value="businesses">
                For Businesses
              </MegamenuTabsTrigger>
            </MegamenuTabsList>

            <MegamenuTabsPanel value="contractors" tabLabel="For Contractors">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 lg:grid-cols-2">
                <MegamenuSection title="Core">
                  <MegamenuLink
                    href="#invoices"
                    icon={<IconFileInvoice />}
                    title="Send Invoices"
                    description="Invoice clients globally"
                  />
                  <MegamenuLink
                    href="#get-paid"
                    icon={<IconCash />}
                    title="Get Paid"
                    description="Get paid fast"
                  />
                  <MegamenuLink
                    href="#manage"
                    icon={<IconFolder />}
                    title="Manage Work"
                    description="Keep everything organized"
                  />
                </MegamenuSection>
                <MegamenuSection title="Money">
                  <MegamenuLink
                    href="#crypto"
                    icon={<IconCurrencyBitcoin />}
                    title="Crypto Payout"
                    description="Get paid in crypto"
                  />
                  <MegamenuLink
                    href="#early-pay"
                    icon={<IconCalendarTime />}
                    title="Early Pay"
                    description="Access your payout early"
                    badge={<Badge>Beta</Badge>}
                  />
                  <MegamenuLink
                    href="#no-company"
                    icon={<IconShieldLock />}
                    title="No company? No problem"
                    description="Invoice without a company"
                  />
                </MegamenuSection>
              </div>
            </MegamenuTabsPanel>

            <MegamenuTabsPanel value="businesses" tabLabel="For Businesses">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 lg:grid-cols-2">
                <MegamenuSection title="Pay">
                  <MegamenuLink
                    href="#contractors"
                    icon={<IconUserPlus />}
                    title="Pay Contractors"
                    description="Pay your team in 100+ countries"
                  />
                  <MegamenuLink
                    href="#subscriptions"
                    icon={<IconCreditCard />}
                    title="Subscriptions"
                    description="Charge clients automatically"
                  />
                </MegamenuSection>
                <MegamenuSection title="Tools">
                  <MegamenuLink
                    href="#help"
                    icon={<IconHelpCircle />}
                    title="Help Center"
                    description="Guides and support"
                  />
                </MegamenuSection>
              </div>
            </MegamenuTabsPanel>
          </MegamenuTabs>

          <MegamenuFooter>
            <span className="text-sm text-muted-foreground">
              Start in minutes. Get paid tomorrow.
            </span>
            <Button size="sm">Get Started</Button>
          </MegamenuFooter>
        </MegamenuContent>
      </Megamenu>

      <NavLinkItem href="#pricing">Pricing</NavLinkItem>

      <Megamenu>
        <MegamenuTrigger asChild>
          <NavLinkItem withChevron>Resources</NavLinkItem>
        </MegamenuTrigger>
        <MegamenuContent>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 lg:grid-cols-2">
            <MegamenuSection title="Learn">
              <MegamenuLink
                href="#blog"
                icon={<IconNews />}
                title="Blog"
                description="Stories and updates"
              />
              <MegamenuLink
                href="#guides"
                icon={<IconFolder />}
                title="Guides"
                description="In-depth product walkthroughs"
              />
            </MegamenuSection>
            <MegamenuSection title="Support">
              <MegamenuLink
                href="#help"
                icon={<IconHelpCircle />}
                title="Help Center"
                description="Find answers fast"
              />
            </MegamenuSection>
          </div>
        </MegamenuContent>
      </Megamenu>
    </MegamenuGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: /Platform/ })
    await userEvent.click(trigger)
    await waitFor(async () => {
      await expect(trigger).toHaveAttribute("data-state", "open")
    })
    await userEvent.keyboard("{Escape}")
    await waitFor(async () => {
      await expect(trigger).toHaveAttribute("data-state", "closed")
    })
  },
}

export const ClickToOpen: Story = {
  render: () => (
    <MegamenuGroup aria-label="Main">
      <Megamenu trigger="click">
        <MegamenuTrigger asChild>
          <NavLinkItem withChevron>Click me</NavLinkItem>
        </MegamenuTrigger>
        <MegamenuContent>
          <div className="p-6">
            <MegamenuSection title="Click activation">
              <MegamenuLink
                href="#one"
                icon={<IconFileInvoice />}
                title="Item one"
                description="Hovering does nothing"
              />
              <MegamenuLink
                href="#two"
                icon={<IconCash />}
                title="Item two"
                description="Click the trigger to open"
              />
            </MegamenuSection>
          </div>
        </MegamenuContent>
      </Megamenu>

      <Megamenu trigger="click">
        <MegamenuTrigger asChild>
          <NavLinkItem withChevron>Or me</NavLinkItem>
        </MegamenuTrigger>
        <MegamenuContent>
          <div className="p-6">
            <MegamenuSection title="Coordinator still active">
              <MegamenuLink
                href="#a"
                icon={<IconFolder />}
                title="Opening this closes the other"
                description="Single-active across the group"
              />
            </MegamenuSection>
          </div>
        </MegamenuContent>
      </Megamenu>
    </MegamenuGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: /Click me/ })
    await userEvent.click(trigger)
    await waitFor(async () => {
      await expect(trigger).toHaveAttribute("data-state", "open")
    })
    await userEvent.click(trigger)
    await waitFor(async () => {
      await expect(trigger).toHaveAttribute("data-state", "closed")
    })
  },
}

export const WithoutTabs: Story = {
  render: () => (
    <MegamenuGroup aria-label="Main">
      <Megamenu>
        <MegamenuTrigger asChild>
          <NavLinkItem withChevron>Products</NavLinkItem>
        </MegamenuTrigger>
        <MegamenuContent>
          <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 lg:grid-cols-3">
            <MegamenuSection title="Pay">
              <MegamenuLink
                href="#a"
                icon={<IconFileInvoice />}
                title="Send Invoices"
                description="Invoice clients globally"
              />
              <MegamenuLink
                href="#b"
                icon={<IconCash />}
                title="Get Paid"
                description="Get paid fast"
              />
            </MegamenuSection>
            <MegamenuSection title="Tools">
              <MegamenuLink
                href="#c"
                icon={<IconFolder />}
                title="Manage Work"
                description="Keep everything organized"
              />
              <MegamenuLink
                href="#d"
                icon={<IconCreditCard />}
                title="Subscriptions"
                description="Charge clients automatically"
              />
            </MegamenuSection>
            <MegamenuSection title="Help">
              <MegamenuLink
                href="#e"
                icon={<IconHelpCircle />}
                title="Help Center"
                description="Guides and FAQs"
              />
            </MegamenuSection>
          </div>
          <MegamenuFooter>
            <span className="text-sm text-muted-foreground">
              All the tools you need in one place.
            </span>
            <Button size="sm" variant="outline">
              See pricing
            </Button>
          </MegamenuFooter>
        </MegamenuContent>
      </Megamenu>
    </MegamenuGroup>
  ),
}

const ENGAGEMENT_STYLES = [
  "Bezel",
  "Cathedral",
  "Channel",
  "Halo",
  "Nature",
  "Pave",
  "Side Stone",
  "Solitaire",
  "Three Stone",
  "Two Stone",
] as const

const ENGAGEMENT_SHAPES = [
  "Round",
  "Cushion",
  "Emerald",
  "Heart",
  "Marquise",
  "Oval",
  "Pear",
  "Princess",
  "Radiant",
  "Asscher",
] as const

export const JewelleryByCategory: Story = {
  render: () => (
    <MegamenuGroup aria-label="Main">
      <Megamenu>
        <MegamenuTrigger asChild>
          <NavLinkItem withChevron>Jewellery</NavLinkItem>
        </MegamenuTrigger>
        <MegamenuContent>
          <MegamenuTabs defaultValue="engagement-rings">
            <MegamenuTabsList>
              <MegamenuTabsTrigger value="engagement-rings">
                Engagement Rings
              </MegamenuTabsTrigger>
              <MegamenuTabsTrigger value="wedding-bands">
                Wedding Bands
              </MegamenuTabsTrigger>
              <MegamenuTabsTrigger value="tennis-bracelets">
                Tennis Bracelets
              </MegamenuTabsTrigger>
            </MegamenuTabsList>

            <MegamenuTabsPanel
              value="engagement-rings"
              tabLabel="Engagement Rings"
            >
              <div className="grid grid-cols-1 gap-x-12 gap-y-6 p-6 lg:grid-cols-2">
                <MegamenuSection title="Engagement rings by style">
                  <div className="grid grid-flow-col grid-rows-5 gap-x-6 gap-y-1">
                    {ENGAGEMENT_STYLES.map((label) => (
                      <MegamenuLink
                        key={label}
                        href={`#style-${label.toLowerCase().replace(/\s+/g, "-")}`}
                        title={label}
                      />
                    ))}
                  </div>
                </MegamenuSection>
                <MegamenuSection title="Engagement rings by stone shape">
                  <div className="grid grid-flow-col grid-rows-5 gap-x-6 gap-y-1">
                    {ENGAGEMENT_SHAPES.map((label) => (
                      <MegamenuLink
                        key={label}
                        href={`#shape-${label.toLowerCase()}`}
                        title={label}
                      />
                    ))}
                  </div>
                </MegamenuSection>
              </div>
            </MegamenuTabsPanel>

            <MegamenuTabsPanel value="wedding-bands" tabLabel="Wedding Bands">
              <div className="p-6">
                <MegamenuSection title="Wedding bands by metal">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <MegamenuLink href="#yellow-gold" title="Yellow Gold" />
                    <MegamenuLink href="#white-gold" title="White Gold" />
                    <MegamenuLink href="#rose-gold" title="Rose Gold" />
                    <MegamenuLink href="#platinum" title="Platinum" />
                  </div>
                </MegamenuSection>
              </div>
            </MegamenuTabsPanel>

            <MegamenuTabsPanel
              value="tennis-bracelets"
              tabLabel="Tennis Bracelets"
            >
              <div className="p-6">
                <MegamenuSection title="Tennis bracelets by stone">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    <MegamenuLink href="#diamond" title="Diamond" />
                    <MegamenuLink href="#sapphire" title="Sapphire" />
                    <MegamenuLink href="#ruby" title="Ruby" />
                    <MegamenuLink href="#emerald" title="Emerald" />
                  </div>
                </MegamenuSection>
              </div>
            </MegamenuTabsPanel>
          </MegamenuTabs>
        </MegamenuContent>
      </Megamenu>
    </MegamenuGroup>
  ),
}

export const EngagementRingsRich: Story = {
  render: () => (
    <MegamenuGroup aria-label="Main">
      <Megamenu>
        <MegamenuTrigger asChild>
          <NavLinkItem withChevron>Engagement Rings</NavLinkItem>
        </MegamenuTrigger>
        <MegamenuContent>
          <div className="grid grid-cols-1 gap-x-10 gap-y-8 p-6 lg:grid-cols-[1fr_1fr_320px]">
            <MegamenuSection title="Engagement rings by style">
              <div className="grid grid-flow-col grid-rows-5 gap-x-6 gap-y-1">
                {ENGAGEMENT_STYLES.map((label) => (
                  <MegamenuLink
                    key={label}
                    href={`#style-${label.toLowerCase().replace(/\s+/g, "-")}`}
                    title={label}
                  />
                ))}
              </div>
            </MegamenuSection>

            <MegamenuSection title="Engagement rings by stone shape">
              <div className="grid grid-flow-col grid-rows-5 gap-x-6 gap-y-1">
                {ENGAGEMENT_SHAPES.map((label) => (
                  <MegamenuLink
                    key={label}
                    href={`#shape-${label.toLowerCase()}`}
                    title={label}
                  />
                ))}
              </div>
            </MegamenuSection>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Custom engagement rings
                </h3>
                <p className="text-sm text-muted-foreground">
                  Create any ring from scratch, choose any stone. We handle
                  everything else, giving you the best speed &amp; value.
                </p>
                <Button
                  asChild
                  variant="link"
                  size="sm"
                  className="self-start px-0"
                >
                  <a href="#design">
                    Design your ring
                    <IconArrowRight />
                  </a>
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Bespoke jewellery requests
                </h3>
                <p className="text-sm text-muted-foreground">
                  Receive bespoke quotes within 24 hours, manufactured and
                  delivered at the same Nivoda speed and quality.
                </p>
                <Button
                  asChild
                  variant="link"
                  size="sm"
                  className="self-start px-0"
                >
                  <a href="#bespoke">
                    Open a quote request
                    <IconArrowRight />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <MegamenuFooter className="items-stretch gap-0 border-t-0 bg-transparent p-0">
            <div className="grid w-full overflow-hidden rounded-md bg-muted/40 lg:grid-cols-[1fr_360px]">
              <div className="flex flex-col items-start gap-3 p-6">
                <h3 className="text-xl font-semibold text-foreground">
                  New Year Collection 2026
                </h3>
                <p className="text-sm text-muted-foreground">
                  Explore our latest jewellery items — the brand new tennis
                  bracelets, pendants &amp; stud ear rings collection
                </p>
                <Button asChild size="sm" className="mt-1">
                  <a href="#new-year">
                    Explore new jewellery
                    <IconArrowRight />
                  </a>
                </Button>
              </div>
              <div
                aria-hidden="true"
                className="hidden bg-gradient-to-br from-muted to-muted-foreground/20 lg:block"
              />
            </div>
          </MegamenuFooter>
        </MegamenuContent>
      </Megamenu>
    </MegamenuGroup>
  ),
}
