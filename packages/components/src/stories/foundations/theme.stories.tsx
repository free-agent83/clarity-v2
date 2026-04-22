import type { Meta, StoryObj } from "@storybook/react";
import type { CSSProperties } from "react";
import { Typography } from "@/components/atoms/typography/typography";

const meta: Meta = {
  title: "Foundations/Theme",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Colour decisions — mirrors the raw OKLCH assignments in :root and .dark
// inside src/styles/globals.css. Strings are verbatim so the table reads as
// the authoritative spec without needing a build step. When globals.css
// changes, update this list in the same commit.
// ---------------------------------------------------------------------------

type ColourDecision = {
  token: string; // CSS custom property name (without leading "--")
  light: string;
  dark: string | null; // null → not redefined in .dark, inherits from :root
};

type ColourGroup = {
  name: string;
  description: string;
  rows: ColourDecision[];
};

const colourGroups: ColourGroup[] = [
  {
    name: "Base",
    description: "Page canvas and default body text.",
    rows: [
      {
        token: "background",
        light: "oklch(1 0 0)",
        dark: "oklch(0.147 0.004 49.25)",
      },
      {
        token: "foreground",
        light: "oklch(0.147 0.004 49.25)",
        dark: "oklch(0.985 0.001 106.423)",
      },
    ],
  },
  {
    name: "Surfaces",
    description: "Raised content surfaces and floating overlays.",
    rows: [
      {
        token: "card",
        light: "oklch(1 0 0)",
        dark: "oklch(0.216 0.006 56.043)",
      },
      {
        token: "card-foreground",
        light: "oklch(0.147 0.004 49.25)",
        dark: "oklch(0.985 0.001 106.423)",
      },
      {
        token: "popover",
        light: "oklch(1 0 0)",
        dark: "oklch(0.216 0.006 56.043)",
      },
      {
        token: "popover-foreground",
        light: "oklch(0.147 0.004 49.25)",
        dark: "oklch(0.985 0.001 106.423)",
      },
    ],
  },
  {
    name: "Intent",
    description:
      "Primary, secondary, accent, muted, and the Nivoda express tier.",
    rows: [
      {
        token: "primary",
        light: "oklch(0.216 0.006 56.043)",
        dark: "oklch(0.923 0.003 48.717)",
      },
      {
        token: "primary-hover",
        light: "oklch(0.4679 0.2562 283.19)",
        dark: "oklch(0.4679 0.2562 283.19)",
      },
      {
        token: "primary-foreground",
        light: "oklch(0.985 0.001 106.423)",
        dark: "oklch(0.216 0.006 56.043)",
      },
      {
        token: "secondary",
        light: "oklch(0.97 0.001 106.424)",
        dark: "oklch(0.268 0.007 34.298)",
      },
      {
        token: "secondary-hover",
        light: "oklch(0.4679 0.2562 283.19)",
        dark: "oklch(0.97 0.001 106.424)",
      },
      {
        token: "secondary-foreground",
        light: "oklch(0.216 0.006 56.043)",
        dark: "oklch(0.985 0.001 106.423)",
      },
      {
        token: "accent",
        light: "oklch(0.9664 0.0174 293.14)",
        dark: "oklch(0.268 0.007 34.298)",
      },
      {
        token: "accent-foreground",
        light: "oklch(0.47 0.2559 283.21)",
        dark: "oklch(0.985 0.001 106.423)",
      },
      {
        token: "muted",
        light: "oklch(0.97 0.001 106.424)",
        dark: "oklch(0.268 0.007 34.298)",
      },
      {
        token: "muted-foreground",
        light: "oklch(0.553 0.013 58.071)",
        dark: "oklch(0.709 0.01 56.259)",
      },
      {
        token: "express",
        light: "oklch(0.5914 0.2126 21.04)",
        dark: "oklch(0.5914 0.2126 21.04)",
      },
      {
        token: "express-foreground",
        light: "oklch(1 0 0)",
        dark: "oklch(1 0 0)",
      },
    ],
  },
  {
    name: "Feedback",
    description: "Destructive, success, warning, and info surfaces.",
    rows: [
      {
        token: "destructive",
        light: "oklch(0.577 0.245 27.325)",
        dark: "oklch(0.704 0.191 22.216)",
      },
      {
        token: "destructive-foreground",
        light: "oklch(1 0 0)",
        dark: "oklch(1 0 0)",
      },
      {
        token: "success",
        light: "oklch(0.6098 0.0966 160.94)",
        dark: "oklch(0.6098 0.0966 160.94)",
      },
      {
        token: "success-foreground",
        light: "oklch(1 0 0)",
        dark: "oklch(1 0 0)",
      },
      {
        token: "warning",
        light: "oklch(0.852 0.199 91.936)",
        dark: "oklch(0.852 0.199 91.936)",
      },
      {
        token: "warning-foreground",
        light: "oklch(0.147 0.004 49.25)",
        dark: "oklch(0.147 0.004 49.25)",
      },
      {
        token: "info",
        light: "oklch(0.5129 0.2541 265.24)",
        dark: "oklch(0.5129 0.2541 265.24)",
      },
      {
        token: "info-foreground",
        light: "oklch(1 0 0)",
        dark: "oklch(1 0 0)",
      },
    ],
  },
  {
    name: "Structural",
    description: "Dividers, form-control surfaces, and focus rings.",
    rows: [
      {
        token: "border",
        light: "oklch(0.923 0.003 48.717)",
        dark: "oklch(1 0 0 / 10%)",
      },
      {
        token: "input",
        light: "oklch(0.923 0.003 48.717)",
        dark: "oklch(1 0 0 / 15%)",
      },
      {
        token: "ring",
        light: "oklch(0.6904 0.1729 287.82)",
        dark: "oklch(0.553 0.013 58.071)",
      },
    ],
  },
  {
    name: "Chart",
    description: "Categorical series colours. Stable order — do not reassign.",
    rows: [
      {
        token: "chart-1",
        light: "oklch(0.869 0.005 56.366)",
        dark: "oklch(0.869 0.005 56.366)",
      },
      {
        token: "chart-2",
        light: "oklch(0.553 0.013 58.071)",
        dark: "oklch(0.553 0.013 58.071)",
      },
      {
        token: "chart-3",
        light: "oklch(0.444 0.011 73.639)",
        dark: "oklch(0.444 0.011 73.639)",
      },
      {
        token: "chart-4",
        light: "oklch(0.374 0.01 67.558)",
        dark: "oklch(0.374 0.01 67.558)",
      },
      {
        token: "chart-5",
        light: "oklch(0.268 0.007 34.298)",
        dark: "oklch(0.268 0.007 34.298)",
      },
    ],
  },
  {
    name: "Sidebar",
    description:
      "Scoped chrome for the Sidebar organism. Do not use outside its subtree.",
    rows: [
      {
        token: "sidebar",
        light: "oklch(0.985 0.001 106.423)",
        dark: "oklch(0.216 0.006 56.043)",
      },
      {
        token: "sidebar-foreground",
        light: "oklch(0.147 0.004 49.25)",
        dark: "oklch(0.985 0.001 106.423)",
      },
      {
        token: "sidebar-primary",
        light: "oklch(0.216 0.006 56.043)",
        dark: "oklch(0.488 0.243 264.376)",
      },
      {
        token: "sidebar-primary-foreground",
        light: "oklch(0.985 0.001 106.423)",
        dark: "oklch(0.985 0.001 106.423)",
      },
      {
        token: "sidebar-accent",
        light: "oklch(0.97 0.001 106.424)",
        dark: "oklch(0.268 0.007 34.298)",
      },
      {
        token: "sidebar-accent-foreground",
        light: "oklch(0.216 0.006 56.043)",
        dark: "oklch(0.985 0.001 106.423)",
      },
      {
        token: "sidebar-border",
        light: "oklch(0.923 0.003 48.717)",
        dark: "oklch(1 0 0 / 10%)",
      },
      {
        token: "sidebar-ring",
        light: "oklch(0.709 0.01 56.259)",
        dark: "oklch(0.553 0.013 58.071)",
      },
    ],
  },
];

function Swatch({ token, mode }: { token: string; mode: "light" | "dark" }) {
  const style: CSSProperties = { backgroundColor: `var(--${token})` };
  const swatch = (
    <div
      className="h-8 w-12 rounded-md border border-border"
      style={style}
      aria-label={`${token} in ${mode} mode`}
    />
  );
  return mode === "dark" ? <div className="dark">{swatch}</div> : swatch;
}

function ColourDecisionsTable({ group }: { group: ColourGroup }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <Typography variant="subtitle-1">{group.name}</Typography>
        <Typography variant="caption" className="text-muted-foreground">
          {group.description}
        </Typography>
      </div>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full border-collapse text-left">
          <thead className="bg-muted">
            <tr>
              <th className="w-20 px-4 py-2">
                <Typography variant="caption" emphasis as="span">
                  Light
                </Typography>
              </th>
              <th className="w-20 px-4 py-2">
                <Typography variant="caption" emphasis as="span">
                  Dark
                </Typography>
              </th>
              <th className="px-4 py-2">
                <Typography variant="caption" emphasis as="span">
                  Token
                </Typography>
              </th>
              <th className="px-4 py-2">
                <Typography variant="caption" emphasis as="span">
                  Light OKLCH
                </Typography>
              </th>
              <th className="px-4 py-2">
                <Typography variant="caption" emphasis as="span">
                  Dark OKLCH
                </Typography>
              </th>
            </tr>
          </thead>
          <tbody>
            {group.rows.map(({ token, light, dark }) => (
              <tr
                key={token}
                className="border-t border-border last:border-b-0"
              >
                <td className="px-4 py-2">
                  <Swatch token={token} mode="light" />
                </td>
                <td className="px-4 py-2">
                  <Swatch token={token} mode="dark" />
                </td>
                <td className="px-4 py-2">
                  <Typography
                    variant="body-2"
                    as="span"
                    className="font-mono"
                  >
                    --{token}
                  </Typography>
                </td>
                <td className="px-4 py-2">
                  <Typography
                    variant="caption"
                    as="span"
                    className="font-mono text-muted-foreground"
                  >
                    {light}
                  </Typography>
                </td>
                <td className="px-4 py-2">
                  <Typography
                    variant="caption"
                    as="span"
                    className="font-mono text-muted-foreground"
                  >
                    {dark ?? "— inherits light"}
                  </Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Exported first so it sits at the top of the Theme page — a comprehensive
// list of colour decisions before the higher-level semantic views below.
export const AllColours: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <Typography variant="body-2" className="text-muted-foreground">
        Every colour decision the library ships today, in the order it appears
        in <code>src/styles/globals.css</code>. Light and dark values are
        defined in <code>:root</code> and <code>.dark</code> respectively;
        every token is assigned in both.
      </Typography>
      {colourGroups.map((group) => (
        <ColourDecisionsTable key={group.name} group={group} />
      ))}
    </div>
  ),
};

// ---------------------------------------------------------------------------
// Semantic specimens — higher-level views of the same tokens organised by
// how components consume them: surface/foreground pairs, structural utilities,
// and the radius scale.
// ---------------------------------------------------------------------------

type SemanticRole = {
  role: string;
  surface: string;
  foreground: string;
  note: string;
};

const semanticRoles: SemanticRole[] = [
  {
    role: "Page",
    surface: "bg-background",
    foreground: "text-foreground",
    note: "Default page canvas and body text.",
  },
  {
    role: "Card",
    surface: "bg-card",
    foreground: "text-card-foreground",
    note: "Raised content surfaces: cards, panels, detail blocks.",
  },
  {
    role: "Popover",
    surface: "bg-popover",
    foreground: "text-popover-foreground",
    note: "Floating surfaces: popovers, dropdown content, tooltips.",
  },
  {
    role: "Primary",
    surface: "bg-primary",
    foreground: "text-primary-foreground",
    note: "The primary action surface. One per view, sparingly.",
  },
  {
    role: "Secondary",
    surface: "bg-secondary",
    foreground: "text-secondary-foreground",
    note: "Secondary actions and quieter filled surfaces.",
  },
  {
    role: "Muted",
    surface: "bg-muted",
    foreground: "text-muted-foreground",
    note: "Low-emphasis surfaces and secondary metadata text.",
  },
  {
    role: "Accent",
    surface: "bg-accent",
    foreground: "text-accent-foreground",
    note: "Hover / focus tint and small moments of brand emphasis.",
  },
  {
    role: "Express",
    surface: "bg-express",
    foreground: "text-express-foreground",
    note: "The Nivoda “express” product-tier accent.",
  },
  {
    role: "Destructive",
    surface: "bg-destructive",
    foreground: "text-destructive-foreground",
    note: "Destructive actions and error surfaces.",
  },
  {
    role: "Success",
    surface: "bg-success",
    foreground: "text-success-foreground",
    note: "Positive confirmations and success surfaces.",
  },
  {
    role: "Warning",
    surface: "bg-warning",
    foreground: "text-warning-foreground",
    note: "Cautionary states that aren't errors.",
  },
  {
    role: "Info",
    surface: "bg-info",
    foreground: "text-info-foreground",
    note: "Informational callouts and neutral notices.",
  },
];

const radii = [
  { utility: "rounded-sm", label: "sm" },
  { utility: "rounded-md", label: "md" },
  { utility: "rounded-lg", label: "lg" },
  { utility: "rounded-xl", label: "xl" },
  { utility: "rounded-2xl", label: "2xl" },
  { utility: "rounded-3xl", label: "3xl" },
  { utility: "rounded-4xl", label: "4xl" },
  { utility: "rounded-full", label: "full" },
];

export const SemanticColours: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Typography variant="body-2" className="text-muted-foreground">
        Every foreground pairs with a surface. Each row shows the utility pair
        and a sample of the foreground rendered on its surface.
      </Typography>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {semanticRoles.map(({ role, surface, foreground, note }) => (
          <div
            key={role}
            className="flex flex-col gap-3 rounded-lg border border-border p-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <Typography variant="subtitle-2">{role}</Typography>
              <Typography
                variant="caption"
                className="text-muted-foreground"
              >
                {surface}
              </Typography>
            </div>
            <div
              className={`flex min-h-20 items-center justify-center rounded-md px-4 py-6 ${surface} ${foreground}`}
            >
              <Typography variant="body-2" emphasis as="span">
                {foreground}
              </Typography>
            </div>
            <Typography variant="caption" className="text-muted-foreground">
              {note}
            </Typography>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const StructuralColours: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Typography variant="body-2" className="text-muted-foreground">
        Non-surface tokens used for dividers, form controls, and focus states.
      </Typography>

      <div className="flex flex-col gap-2">
        <Typography variant="caption" className="text-muted-foreground">
          border-border
        </Typography>
        <div className="flex flex-col divide-y divide-border rounded-md border border-border">
          <div className="px-4 py-3">
            <Typography variant="body-2">First row</Typography>
          </div>
          <div className="px-4 py-3">
            <Typography variant="body-2">Second row</Typography>
          </div>
          <div className="px-4 py-3">
            <Typography variant="body-2">Third row</Typography>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Typography variant="caption" className="text-muted-foreground">
          bg-input / border-input
        </Typography>
        <div className="h-10 w-64 rounded-md border border-input bg-input/30" />
      </div>

      <div className="flex flex-col gap-2">
        <Typography variant="caption" className="text-muted-foreground">
          ring-ring (focus ring)
        </Typography>
        <div className="h-10 w-64 rounded-md border border-input ring-2 ring-ring ring-offset-2 ring-offset-background" />
      </div>
    </div>
  ),
};

export const Radius: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Typography variant="body-2" className="text-muted-foreground">
        All radii derive from a single <code>--radius</code> base and scale
        through semantic utilities.
      </Typography>
      <div className="flex flex-wrap gap-6">
        {radii.map(({ utility, label }) => (
          <div key={utility} className="flex flex-col items-center gap-2">
            <div className={`h-20 w-20 bg-primary ${utility}`} />
            <Typography variant="caption" className="text-muted-foreground">
              {utility}
            </Typography>
            <Typography variant="caption">{label}</Typography>
          </div>
        ))}
      </div>
    </div>
  ),
};
