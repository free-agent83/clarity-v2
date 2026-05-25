import type { Meta, StoryObj } from "@storybook/react"
import { userEvent, within, expect, waitFor } from "@storybook/test"
import {
  IconArrowRight,
  IconChevronDown,
  IconHeadset,
  IconShieldCheck,
  IconTruck,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button } from "../../atoms/button/button"
import { Typography } from "@/components/atoms/typography/typography"
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

const meta: Meta<typeof MegamenuGroup> = {
  title: "Navigation/Megamenu",
  component: MegamenuGroup,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-150 flex-col bg-background">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between px-6 bg-negative text-negative-foreground">
          <span className="text-sm font-semibold tracking-tight">
            Lustre &amp; Co.
          </span>
          <Story />
          <Button size="sm">Sign in</Button>
        </header>
        <main className="flex-1 p-8">
          <p className="text-sm text-muted-foreground">
            Hover or click a megamenu trigger to open its panel. The panel
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
  const baseClassName = `inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium text-negative-foreground outline-none transition-colors   data-[state=open]:bg-negative-foreground/10 ${className}`

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

// ─── Catalogue data ────────────────────────────────────────────

const ENGAGEMENT_STYLES = [
  "Solitaire",
  "Halo",
  "Three-Stone",
  "Vintage",
  "Bezel",
  "Cathedral",
  "Side Stone",
  "Pavé",
] as const

const ENGAGEMENT_SHAPES = [
  "Round",
  "Princess",
  "Cushion",
  "Oval",
  "Pear",
  "Marquise",
  "Emerald",
  "Asscher",
  "Heart",
  "Radiant",
] as const

const ENGAGEMENT_METALS = [
  "Yellow Gold",
  "White Gold",
  "Rose Gold",
  "Platinum",
  "Two-Tone",
] as const

const ENGAGEMENT_CUSTOMISE = [
  "Design Your Own",
  "Build a Setting",
  "Bespoke Quote",
  "Custom Engraving",
  "Diamond Concierge",
] as const

const WEDDING_STYLES = [
  "Plain",
  "Diamond",
  "Eternity",
  "Half-Eternity",
  "Curved",
  "Vintage",
  "Two-Tone",
  "Hammered",
] as const

const WEDDING_WIDTHS = ["2mm", "3mm", "4mm", "5mm", "6mm", "8mm"] as const

const WEDDING_METALS = [
  "Yellow Gold",
  "White Gold",
  "Rose Gold",
  "Platinum",
  "Palladium",
] as const

const TENNIS_STONES = [
  "Diamond",
  "Sapphire",
  "Ruby",
  "Emerald",
  "Mixed Gemstone",
] as const

const TENNIS_CARATS = [
  "Under 1 ct",
  "1–3 ct",
  "3–5 ct",
  "5–10 ct",
  "10+ ct",
] as const

const TENNIS_LENGTHS = ['6.5"', '7"', '7.5"', "Custom"] as const

const NECKLACE_STYLES = [
  "Pendant",
  "Solitaire",
  "Halo",
  "Chain",
  "Choker",
  "Lariat",
  "Station",
  "Riviera",
] as const

const NECKLACE_LENGTHS = [
  '14" Collar',
  '16" Choker',
  '18" Princess',
  '20" Matinee',
  '24" Opera',
  '30" Rope',
] as const

const NECKLACE_STONES = [
  "Diamond",
  "Pearl",
  "Sapphire",
  "Ruby",
  "Emerald",
  "Tanzanite",
] as const

const STUD_STYLES = [
  "Solitaire",
  "Halo",
  "Cluster",
  "Bezel",
  "Three-Stone",
  "Stud + Jacket",
] as const

const STUD_STONES = [
  "Diamond",
  "Pearl",
  "Sapphire",
  "Ruby",
  "Emerald",
  "Moissanite",
] as const

const STUD_CARATS = [
  "Under 0.5 ct",
  "0.5–1 ct",
  "1–2 ct",
  "2–3 ct",
  "3+ ct",
] as const

// ─── Inline panel pieces ───────────────────────────────────────

function slugify(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function PanelGrid({
  cols,
  children,
}: {
  cols: 2 | 3 | 4
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-8 gap-y-6 p-6",
        cols === 2 && "lg:grid-cols-2",
        cols === 3 && "lg:grid-cols-3",
        cols === 4 && "lg:grid-cols-4"
      )}
    >
      {children}
    </div>
  )
}

function LinkColumn({
  title,
  items,
  prefix,
}: {
  title: string
  items: ReadonlyArray<string>
  prefix: string
}) {
  return (
    <div>
      <Typography variant="subtitle-2" className="pl-3 mb-2">{title}</Typography>
      <div className="flex flex-col">
        {items.map((label) => (
          <MegamenuLink
            key={label}
            href={`#${prefix}-${slugify(label)}`}
            title={label}
            leading={<div className="size-4 rounded bg-muted" />}
          />
        ))}
      </div>
    </div>
  )
}

function EngagementRingsPanel() {
  return (
    <PanelGrid cols={4}>
      <LinkColumn
        title="By style"
        items={ENGAGEMENT_STYLES}
        prefix="er-style"
      />
      <LinkColumn
        title="By stone shape"
        items={ENGAGEMENT_SHAPES}
        prefix="er-shape"
      />
      <LinkColumn
        title="By metal"
        items={ENGAGEMENT_METALS}
        prefix="er-metal"
      />
      <LinkColumn
        title="Custom & bespoke"
        items={ENGAGEMENT_CUSTOMISE}
        prefix="er-custom"
      />
    </PanelGrid>
  )
}

function WeddingBandsPanel() {
  return (
    <PanelGrid cols={3}>
      <LinkColumn title="By style" items={WEDDING_STYLES} prefix="wb-style" />
      <LinkColumn title="By width" items={WEDDING_WIDTHS} prefix="wb-width" />
      <LinkColumn title="By metal" items={WEDDING_METALS} prefix="wb-metal" />
    </PanelGrid>
  )
}

function TennisBraceletsPanel() {
  return (
    <PanelGrid cols={3}>
      <LinkColumn title="By stone" items={TENNIS_STONES} prefix="tb-stone" />
      <LinkColumn
        title="By total weight"
        items={TENNIS_CARATS}
        prefix="tb-carat"
      />
      <LinkColumn
        title="By length"
        items={TENNIS_LENGTHS}
        prefix="tb-length"
      />
    </PanelGrid>
  )
}

function NecklacesPanel() {
  return (
    <PanelGrid cols={3}>
      <LinkColumn
        title="By style"
        items={NECKLACE_STYLES}
        prefix="nk-style"
      />
      <LinkColumn
        title="By length"
        items={NECKLACE_LENGTHS}
        prefix="nk-length"
      />
      <LinkColumn
        title="By stone"
        items={NECKLACE_STONES}
        prefix="nk-stone"
      />
    </PanelGrid>
  )
}

function StudsPanel() {
  return (
    <PanelGrid cols={3}>
      <LinkColumn title="By style" items={STUD_STYLES} prefix="st-style" />
      <LinkColumn title="By stone" items={STUD_STONES} prefix="st-stone" />
      <LinkColumn
        title="By total weight"
        items={STUD_CARATS}
        prefix="st-carat"
      />
    </PanelGrid>
  )
}

// ─── Footer + banner pieces ────────────────────────────────────

function HelpFooter() {
  return (
    <MegamenuFooter className="grid grid-cols-1 gap-6 px-6 py-4 lg:grid-cols-3">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-foreground [&_svg]:size-5"
        >
          <IconTruck />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">
            Free insured shipping
          </p>
          <p className="text-xs text-muted-foreground">
            On every order, anywhere in the world.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-foreground [&_svg]:size-5"
        >
          <IconShieldCheck />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">
            Lifetime warranty
          </p>
          <p className="text-xs text-muted-foreground">
            Resizing, polishing, and stone-tightening included.
          </p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-background text-foreground [&_svg]:size-5"
        >
          <IconHeadset />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">
            Talk to a gemologist
          </p>
          <p className="text-xs text-muted-foreground">
            Mon–Fri, 9 am – 6 pm EST. Live chat or phone.
          </p>
        </div>
      </div>
    </MegamenuFooter>
  )
}

function PromoBanner() {
  return (
    <div
      data-slot="megamenu-banner"
      className="m-3 grid overflow-hidden rounded-md border border-border bg-muted/40 lg:grid-cols-[1fr_320px]"
    >
      <div className="flex flex-col items-start gap-3 p-6">
        <Typography as="h3" variant="h6" className="text-foreground">
          Bloom — engagement rings inspired by gardens in early spring
        </Typography>
        <Typography variant="body-2" className="max-w-prose text-muted-foreground">
          Twenty-eight new settings, hand-finished in our New York atelier.
          Pair with any of our curated stones to bring it to life.
        </Typography>
        <Button asChild size="sm" className="mt-1">
          <a href="#bloom">
            Explore the collection
            <IconArrowRight />
          </a>
        </Button>
      </div>
      <div
        aria-hidden="true"
        className="hidden bg-gradient-to-br from-muted to-muted-foreground/20 lg:block"
      />
    </div>
  )
}

// ─── Stories ───────────────────────────────────────────────────

export const Default: Story = {
  render: () => (
    <MegamenuGroup aria-label="Main">
      <Megamenu>
        <MegamenuTrigger asChild>
          <NavLinkItem withChevron>Engagement Rings</NavLinkItem>
        </MegamenuTrigger>
        <MegamenuContent>
          <EngagementRingsPanel />
        </MegamenuContent>
      </Megamenu>

      <NavLinkItem href="#wedding">Wedding</NavLinkItem>
      <NavLinkItem href="#earrings">Earrings</NavLinkItem>
      <NavLinkItem href="#bracelets">Bracelets</NavLinkItem>
    </MegamenuGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: /Engagement Rings/ })
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

export const WithFooter: Story = {
  render: () => (
    <MegamenuGroup aria-label="Main">
      <Megamenu>
        <MegamenuTrigger asChild>
          <NavLinkItem withChevron>Engagement Rings</NavLinkItem>
        </MegamenuTrigger>
        <MegamenuContent>
          <EngagementRingsPanel />
          <HelpFooter />
        </MegamenuContent>
      </Megamenu>
    </MegamenuGroup>
  ),
}

export const WithBottomBanner: Story = {
  render: () => (
    <MegamenuGroup aria-label="Main">
      <Megamenu>
        <MegamenuTrigger asChild>
          <NavLinkItem withChevron>Engagement Rings</NavLinkItem>
        </MegamenuTrigger>
        <MegamenuContent>
          <EngagementRingsPanel />
          <PromoBanner />
        </MegamenuContent>
      </Megamenu>
    </MegamenuGroup>
  ),
}

export const WithCategoryTabbing: Story = {
  render: () => (
    <MegamenuGroup aria-label="Main">
      <Megamenu>
        <MegamenuTrigger asChild>
          <NavLinkItem withChevron>Jewellery</NavLinkItem>
        </MegamenuTrigger>
        <MegamenuContent>
          <MegamenuTabs defaultValue="engagement-rings">
            <MegamenuTabsList>
              <MegamenuTabsTrigger leading={<div className="size-8 bg-muted rounded" />} value="engagement-rings">
                Engagement Rings
              </MegamenuTabsTrigger>
              <MegamenuTabsTrigger leading={<div className="size-8 bg-muted rounded" />} value="wedding-bands">
                Wedding Bands
              </MegamenuTabsTrigger>
              <MegamenuTabsTrigger leading={<div className="size-8 bg-muted rounded" />} value="tennis-bracelets">
                Tennis Bracelets
              </MegamenuTabsTrigger>
              <MegamenuTabsTrigger leading={<div className="size-8 bg-muted rounded" />} value="necklaces">
                Necklaces
              </MegamenuTabsTrigger>
              <MegamenuTabsTrigger leading={<div className="size-8 bg-muted rounded" />} value="studs">
                Studs
              </MegamenuTabsTrigger>
            </MegamenuTabsList>

            <MegamenuTabsPanel
              value="engagement-rings"
              tabLabel="Engagement Rings"
            >
              <EngagementRingsPanel />
            </MegamenuTabsPanel>

            <MegamenuTabsPanel
              value="wedding-bands"
              tabLabel="Wedding Bands"
            >
              <WeddingBandsPanel />
            </MegamenuTabsPanel>

            <MegamenuTabsPanel
              value="tennis-bracelets"
              tabLabel="Tennis Bracelets"
            >
              <TennisBraceletsPanel />
            </MegamenuTabsPanel>

            <MegamenuTabsPanel value="necklaces" tabLabel="Necklaces">
              <NecklacesPanel />
            </MegamenuTabsPanel>

            <MegamenuTabsPanel value="studs" tabLabel="Studs">
              <StudsPanel />
            </MegamenuTabsPanel>
          </MegamenuTabs>
        </MegamenuContent>
      </Megamenu>
    </MegamenuGroup>
  ),
}

export const Complex: Story = {
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
              <MegamenuTabsTrigger value="necklaces">
                Necklaces
              </MegamenuTabsTrigger>
              <MegamenuTabsTrigger value="studs">Studs</MegamenuTabsTrigger>
            </MegamenuTabsList>

            <MegamenuTabsPanel
              value="engagement-rings"
              tabLabel="Engagement Rings"
            >
              <EngagementRingsPanel />
            </MegamenuTabsPanel>

            <MegamenuTabsPanel
              value="wedding-bands"
              tabLabel="Wedding Bands"
            >
              <WeddingBandsPanel />
            </MegamenuTabsPanel>

            <MegamenuTabsPanel
              value="tennis-bracelets"
              tabLabel="Tennis Bracelets"
            >
              <TennisBraceletsPanel />
            </MegamenuTabsPanel>

            <MegamenuTabsPanel value="necklaces" tabLabel="Necklaces">
              <NecklacesPanel />
            </MegamenuTabsPanel>

            <MegamenuTabsPanel value="studs" tabLabel="Studs">
              <StudsPanel />
            </MegamenuTabsPanel>
          </MegamenuTabs>

          <PromoBanner />
          <HelpFooter />
        </MegamenuContent>
      </Megamenu>
    </MegamenuGroup>
  ),
}
