import type { Meta, StoryObj } from "@storybook/react";
import { Typography } from "@/components/atoms/typography/typography";

const meta: Meta = {
  title: "Foundations/Spacing",
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj;

// Mirrors packages/tokens/src/spacing.tokens.json. The scale aligns 1:1 with
// Tailwind v4's default spacing ramp (4px per step), so `p-4` / `gap-4` etc.
// resolve to the same pixel values as token `spacing.4`.
type Step = {
  token: string;
  utility: string;
  px: number;
  rem: string;
};

const steps: Step[] = [
  { token: "spacing.0", utility: "p-0", px: 0, rem: "0rem" },
  { token: "spacing.1", utility: "p-1", px: 4, rem: "0.25rem" },
  { token: "spacing.2", utility: "p-2", px: 8, rem: "0.5rem" },
  { token: "spacing.3", utility: "p-3", px: 12, rem: "0.75rem" },
  { token: "spacing.4", utility: "p-4", px: 16, rem: "1rem" },
  { token: "spacing.5", utility: "p-5", px: 20, rem: "1.25rem" },
  { token: "spacing.6", utility: "p-6", px: 24, rem: "1.5rem" },
  { token: "spacing.8", utility: "p-8", px: 32, rem: "2rem" },
  { token: "spacing.10", utility: "p-10", px: 40, rem: "2.5rem" },
  { token: "spacing.12", utility: "p-12", px: 48, rem: "3rem" },
  { token: "spacing.16", utility: "p-16", px: 64, rem: "4rem" },
  { token: "spacing.20", utility: "p-20", px: 80, rem: "5rem" },
  { token: "spacing.24", utility: "p-24", px: 96, rem: "6rem" },
];

export const Scale: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Typography variant="body-2" className="text-muted-foreground">
        4px-based spacing ramp. The scale is used for padding, margin, gap, and
        fixed sizing. Each step maps directly to a Tailwind utility — e.g. the{" "}
        <code>p-4</code> / <code>gap-4</code> / <code>m-4</code> family all
        resolve to <code>spacing.4</code> (16px).
      </Typography>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full border-collapse text-left">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2">
                <Typography variant="caption" emphasis as="span">
                  Token
                </Typography>
              </th>
              <th className="px-4 py-2">
                <Typography variant="caption" emphasis as="span">
                  Utility
                </Typography>
              </th>
              <th className="px-4 py-2">
                <Typography variant="caption" emphasis as="span">
                  Pixels
                </Typography>
              </th>
              <th className="px-4 py-2">
                <Typography variant="caption" emphasis as="span">
                  Rem
                </Typography>
              </th>
              <th className="w-full px-4 py-2">
                <Typography variant="caption" emphasis as="span">
                  Visual
                </Typography>
              </th>
            </tr>
          </thead>
          <tbody>
            {steps.map(({ token, utility, px, rem }) => (
              <tr
                key={token}
                className="border-t border-border last:border-b-0"
              >
                <td className="whitespace-nowrap px-4 py-2">
                  <Typography variant="body-2" as="span">
                    {token}
                  </Typography>
                </td>
                <td className="whitespace-nowrap px-4 py-2">
                  <Typography
                    variant="caption"
                    as="span"
                    className="font-mono text-muted-foreground"
                  >
                    {utility}
                  </Typography>
                </td>
                <td className="whitespace-nowrap px-4 py-2">
                  <Typography
                    variant="caption"
                    as="span"
                    className="font-mono text-muted-foreground"
                  >
                    {px}px
                  </Typography>
                </td>
                <td className="whitespace-nowrap px-4 py-2">
                  <Typography
                    variant="caption"
                    as="span"
                    className="font-mono text-muted-foreground"
                  >
                    {rem}
                  </Typography>
                </td>
                <td className="px-4 py-2">
                  <div
                    className="h-4 rounded-sm bg-primary"
                    style={{ width: `${px}px` }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
};

export const InLayout: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <Typography variant="body-2" className="text-muted-foreground">
        Common usages of the scale — padding inside a surface, gap between
        siblings, and stack rhythm between sections.
      </Typography>

      <section className="flex flex-col gap-3">
        <Typography variant="subtitle-2">Padding — p-4 (16px)</Typography>
        <div className="rounded-lg border border-border bg-card p-4">
          <Typography variant="body-2">
            Card surface with p-4 padding around its content.
          </Typography>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Typography variant="subtitle-2">Gap — gap-3 (12px)</Typography>
        <div className="flex gap-3">
          <div className="h-10 w-10 rounded-md bg-primary" />
          <div className="h-10 w-10 rounded-md bg-primary" />
          <div className="h-10 w-10 rounded-md bg-primary" />
          <div className="h-10 w-10 rounded-md bg-primary" />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Typography variant="subtitle-2">Stack — space-y-6 (24px)</Typography>
        <div className="flex flex-col gap-6">
          <div className="rounded-md border border-border p-3">
            <Typography variant="body-2">First section</Typography>
          </div>
          <div className="rounded-md border border-border p-3">
            <Typography variant="body-2">Second section</Typography>
          </div>
          <div className="rounded-md border border-border p-3">
            <Typography variant="body-2">Third section</Typography>
          </div>
        </div>
      </section>
    </div>
  ),
};
