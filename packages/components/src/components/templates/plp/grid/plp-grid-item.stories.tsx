// plp/grid/plp-grid-item.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { userEvent, within } from "@storybook/test";
import { PlpGridItem } from "./plp-grid-item";
import { useStorybookAppUser } from "../../../../../.storybook/app-user-context";
import { Badge } from "../../../atoms/badge/badge";
import type { GridItemData } from "../plp-types";

type GridItemStoryArgs = React.ComponentProps<typeof PlpGridItem>;

// ── Mock data builder ─────────────────────────────────────

function buildGridItemData(overrides: Partial<GridItemData> = {}): GridItemData {
  return {
    id: "item-1",
    name: "Emerald Green Radiant 1ct",
    thumbnailSrc: "https://placehold.co/400x400/f5f5f4/a3a3a3?text=Gem",
    thumbnailAlt: "1ct Emerald Green Radiant",
    lead: <span className="text-xs text-muted-foreground">GR · Stock ID</span>,
    badges: [
      <Badge key="origin" variant="outline" size="sm">Brazil</Badge>,
      <Badge key="curated" variant="info" size="sm">Nivoda Curated</Badge>,
    ],
    delivery: {
      estimatedDate: "Nov 18 – 23",
      shipsFrom: "United States",
      isExpress: false,
    },
    returns: { isReturnable: true },
    pricing: {
      amount: 9999.0,
      currency: "USD",
    },
    onAddToCart: fn(),
    onFavorite: fn(),
    onShare: fn(),
    onViewMedia: fn(),
    ...overrides,
  };
}

// ── Story meta ────────────────────────────────────────────

const meta: Meta<GridItemStoryArgs> = {
  title: "Templates/PLP Grid Item",
  component: PlpGridItem,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  render: (args) => {
    const userContext = useStorybookAppUser();
    return <PlpGridItem {...args} userContext={userContext} />;
  },
};

export default meta;
type Story = StoryObj<GridItemStoryArgs>;

// ── Stories ───────────────────────────────────────────────

export const Default: Story = {
  args: {
    data: buildGridItemData(),
  },
};

export const Express: Story = {
  args: {
    data: buildGridItemData({
      delivery: { estimatedDate: "Nov 15 – 17", shipsFrom: "New York", isExpress: true },
    }),
  },
};

export const NonReturnable: Story = {
  args: {
    data: buildGridItemData({
      returns: { isReturnable: false },
    }),
  },
};

export const WithDiscount: Story = {
  args: {
    data: buildGridItemData({
      pricing: {
        amount: 7499.0,
        currency: "USD",
        discount: { percentage: 25, originalAmount: 9999.0 },
      },
    }),
  },
};

export const WithPerCarat: Story = {
  args: {
    data: buildGridItemData({
      pricing: {
        amount: 9999.0,
        currency: "USD",
        perCarat: { amount: 1910.7, currency: "USD" },
      },
    }),
  },
};

export const WithTariffs: Story = {
  args: {
    data: buildGridItemData({
      pricing: {
        amount: 9999.0,
        currency: "USD",
        includeTariffs: true,
      },
    }),
  },
  parameters: { appUser: { location: "US" } },
};

export const LegacyPricing: Story = {
  args: {
    data: buildGridItemData({
      pricing: {
        amount: 9999.0,
        currency: "USD",
        legacyDeliveredPrice: { amount: 10499.0, currency: "USD" },
      },
    }),
  },
  parameters: { appUser: { pricingModel: "legacy" } },
};

export const WithCategoryActions: Story = {
  args: {
    data: buildGridItemData({
      categoryActions: [
        {
          id: "findPair",
          icon: <span className="text-xs">🔗</span>,
          label: "Find matching pair",
          onAction: fn(),
        },
      ],
    }),
  },
};

export const WithSelection: Story = {
  args: {
    data: buildGridItemData({ enableSelection: true }),
  },
};

export const WithCategorySlots: Story = {
  args: {
    data: buildGridItemData({
      categorySlotTop: (
        <div className="text-xs text-muted-foreground">
          Watermelon · Light color · Heating · Not Included · 5.95 × 5.89 × 2.76mm
        </div>
      ),
      categorySlotBottom: (
        <div className="flex gap-1">
          {["⬜", "🟡", "🔵"].map((s, i) => (
            <span key={i} className="h-4 w-4 rounded-full border text-[10px] flex items-center justify-center">{s}</span>
          ))}
        </div>
      ),
    }),
  },
};

export const AllVariantsActive: Story = {
  args: {
    data: buildGridItemData({
      delivery: { estimatedDate: "Nov 15 – 17", shipsFrom: "New York", isExpress: true },
      pricing: {
        amount: 7499.0,
        currency: "USD",
        perCarat: { amount: 1910.7, currency: "USD" },
        discount: { percentage: 25, originalAmount: 9999.0 },
        legacyDeliveredPrice: { amount: 10499.0, currency: "USD" },
        includeTariffs: true,
      },
      enableSelection: true,
      categoryActions: [
        { id: "findPair", icon: <span className="text-xs">🔗</span>, label: "Find matching pair", onAction: fn() },
      ],
      categorySlotTop: (
        <div className="text-xs text-muted-foreground">5.95 × 5.89 × 2.76mm</div>
      ),
    }),
  },
  parameters: { appUser: { pricingModel: "legacy", location: "US" } },
};

export const HoverState: Story = {
  args: {
    data: buildGridItemData({ enableSelection: true }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const article = canvas.getByRole("article");
    await userEvent.hover(article);
  },
};

export const With360Media: Story = {
  args: {
    data: buildGridItemData({
      media360: {
        // Short public sample — hover over the thumbnail to see the crossfade
        // and scrub behaviour. If this URL becomes unavailable, swap it for
        // another small MP4 from a stable public bucket.
        videoUrl:
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      },
    }),
  },
};
