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
  MegamenuTabs,
  MegamenuTabsList,
  MegamenuTabsPanel,
  MegamenuTabsTrigger,
  MegamenuTrigger,
} from "./megamenu"

const sectionHeadingClass =
  "mb-2 px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"

const sectionHeadingTitleCaseClass =
  "mb-3 text-sm font-semibold text-foreground"

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
                <div>
                  <h3 className={sectionHeadingClass}>Core</h3>
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
                </div>
                <div>
                  <h3 className={sectionHeadingClass}>Money</h3>
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
                </div>
              </div>
            </MegamenuTabsPanel>

            <MegamenuTabsPanel value="businesses" tabLabel="For Businesses">
              <div className="grid grid-cols-1 gap-x-6 gap-y-4 p-6 lg:grid-cols-2">
                <div>
                  <h3 className={sectionHeadingClass}>Pay</h3>
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
                </div>
                <div>
                  <h3 className={sectionHeadingClass}>Tools</h3>
                  <MegamenuLink
                    href="#help"
                    icon={<IconHelpCircle />}
                    title="Help Center"
                    description="Guides and support"
                  />
                </div>
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
            <div>
              <h3 className={sectionHeadingClass}>Learn</h3>
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
            </div>
            <div>
              <h3 className={sectionHeadingClass}>Support</h3>
              <MegamenuLink
                href="#help"
                icon={<IconHelpCircle />}
                title="Help Center"
                description="Find answers fast"
              />
            </div>
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
            <h3 className={sectionHeadingClass}>Click activation</h3>
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
          </div>
        </MegamenuContent>
      </Megamenu>

      <Megamenu trigger="click">
        <MegamenuTrigger asChild>
          <NavLinkItem withChevron>Or me</NavLinkItem>
        </MegamenuTrigger>
        <MegamenuContent>
          <div className="p-6">
            <h3 className={sectionHeadingClass}>Coordinator still active</h3>
            <MegamenuLink
              href="#a"
              icon={<IconFolder />}
              title="Opening this closes the other"
              description="Single-active across the group"
            />
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
            <div>
              <h3 className={sectionHeadingClass}>Pay</h3>
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
            </div>
            <div>
              <h3 className={sectionHeadingClass}>Tools</h3>
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
            </div>
            <div>
              <h3 className={sectionHeadingClass}>Help</h3>
              <MegamenuLink
                href="#e"
                icon={<IconHelpCircle />}
                title="Help Center"
                description="Guides and FAQs"
              />
            </div>
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
                <div>
                  <h3 className={sectionHeadingTitleCaseClass}>
                    Engagement rings by style
                  </h3>
                  <div className="grid grid-flow-col grid-rows-5 gap-x-6 gap-y-1">
                    {ENGAGEMENT_STYLES.map((label) => (
                      <MegamenuLink
                        key={label}
                        href={`#style-${label.toLowerCase().replace(/\s+/g, "-")}`}
                        title={label}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className={sectionHeadingTitleCaseClass}>
                    Engagement rings by stone shape
                  </h3>
                  <div className="grid grid-flow-col grid-rows-5 gap-x-6 gap-y-1">
                    {ENGAGEMENT_SHAPES.map((label) => (
                      <MegamenuLink
                        key={label}
                        href={`#shape-${label.toLowerCase()}`}
                        title={label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </MegamenuTabsPanel>

            <MegamenuTabsPanel value="wedding-bands" tabLabel="Wedding Bands">
              <div className="p-6">
                <h3 className={sectionHeadingTitleCaseClass}>
                  Wedding bands by metal
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <MegamenuLink href="#yellow-gold" title="Yellow Gold" />
                  <MegamenuLink href="#white-gold" title="White Gold" />
                  <MegamenuLink href="#rose-gold" title="Rose Gold" />
                  <MegamenuLink href="#platinum" title="Platinum" />
                </div>
              </div>
            </MegamenuTabsPanel>

            <MegamenuTabsPanel
              value="tennis-bracelets"
              tabLabel="Tennis Bracelets"
            >
              <div className="p-6">
                <h3 className={sectionHeadingTitleCaseClass}>
                  Tennis bracelets by stone
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <MegamenuLink href="#diamond" title="Diamond" />
                  <MegamenuLink href="#sapphire" title="Sapphire" />
                  <MegamenuLink href="#ruby" title="Ruby" />
                  <MegamenuLink href="#emerald" title="Emerald" />
                </div>
              </div>
            </MegamenuTabsPanel>
          </MegamenuTabs>
        </MegamenuContent>
      </Megamenu>
    </MegamenuGroup>
  ),
}

