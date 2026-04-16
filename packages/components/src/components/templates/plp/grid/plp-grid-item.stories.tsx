// plp/grid/plp-grid-item.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { userEvent, within } from "@storybook/test";
import { PlpGridItem } from "./plp-grid-item";
import { PlpUserProvider } from "../context/plp-user-context";
import { Badge } from "../../../atoms/badge/badge";
import type { GridItemData, PlpUserContextValue } from "../plp-types";

/** Extra argTypes injected by the decorator for user context controls. */
type UserContextArgs = {
  _currency?: string;
  _location?: string;
  _pricingModel?: "standard" | "legacy";
};

/** Combined args type: component props + decorator-injected user context controls. */
type GridItemStoryArgs = React.ComponentProps<typeof PlpGridItem> & UserContextArgs;

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
      <Badge key="curated" variant="secondary" size="sm">Nivoda Curated</Badge>,
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
    (Story, context) => {
      const userContext: Partial<PlpUserContextValue> = {
        currency: context.args._currency ?? "USD",
        location: context.args._location ?? "US",
        pricingModel: context.args._pricingModel ?? "standard",
      };
      return (
        <PlpUserProvider value={userContext}>
          <div className="w-[280px]">
            <Story />
          </div>
        </PlpUserProvider>
      );
    },
  ],
  argTypes: {
    _currency: {
      control: "select",
      options: ["USD", "EUR", "GBP"],
      name: "User currency",
      table: { category: "User context" },
    },
    _location: {
      control: "select",
      options: ["US", "UK", "EU"],
      name: "User location",
      table: { category: "User context" },
    },
    _pricingModel: {
      control: "select",
      options: ["standard", "legacy"],
      name: "Pricing model",
      table: { category: "User context" },
    },
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
    _location: "US",
  },
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
    _pricingModel: "legacy",
  },
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
    _pricingModel: "legacy",
    _location: "US",
  },
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
