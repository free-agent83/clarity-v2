import type { Meta, StoryObj } from "@storybook/react";
import { Typography } from "./typography";

const meta: Meta<typeof Typography> = {
  title: "Foundations/Typography",
  component: Typography,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "body1",
        "body1Emphasis",
        "body2",
        "body2Emphasis",
        "caption",
        "captionEmphasis",
      ],
    },
    as: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "div"],
    },
    asChild: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Default: Story = {
  args: { children: "The quick brown fox jumps over the lazy dog" },
};

const specimen = [
  { variant: "h1", label: "Heading 1" },
  { variant: "h2", label: "Heading 2" },
  { variant: "h3", label: "Heading 3" },
  { variant: "h4", label: "Heading 4" },
  { variant: "h5", label: "Heading 5" },
  { variant: "h6", label: "Heading 6" },
  { variant: "body1", label: "Body 1 Regular" },
  { variant: "body1Emphasis", label: "Body 1 Emphasis" },
  { variant: "body2", label: "Body 2 Regular" },
  { variant: "body2Emphasis", label: "Body 2 Emphasis" },
  { variant: "caption", label: "Caption Regular" },
  { variant: "captionEmphasis", label: "Caption Emphasis" },
] as const;

export const Specimen: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {specimen.map(({ variant, label }) => (
        <div key={variant} className="flex flex-col gap-1">
          <Typography variant="caption" className="text-muted-foreground">
            {variant}
          </Typography>
          <Typography variant={variant}>{label}</Typography>
        </div>
      ))}
    </div>
  ),
};

export const AsOverride: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Typography variant="caption" className="text-muted-foreground">
        variant=&quot;h1&quot; as=&quot;div&quot; — heading-sized, non-heading element
      </Typography>
      <Typography variant="h1" as="div">
        42
      </Typography>
    </div>
  ),
};

export const AsChildWithLink: Story = {
  render: () => (
    <Typography variant="body1" asChild>
      <a href="#" className="underline">
        Typography styling applied to an anchor via asChild
      </a>
    </Typography>
  ),
};

export const Article: Story = {
  render: () => (
    <article className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="flex flex-col gap-3">
        <Typography variant="caption" className="text-muted-foreground">
          Design systems · 8 min read
        </Typography>
        <Typography variant="h2">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit
        </Typography>
        <Typography variant="body2" className="text-muted-foreground">
          By Jane Doe · Published 20 April 2026
        </Typography>
      </header>

      <Typography variant="body1">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
        ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
        aliquip ex ea commodo consequat.
      </Typography>

      <Typography variant="h3">
        Duis aute irure dolor in reprehenderit
      </Typography>

      <Typography variant="body2">
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
        dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
        non proident, sunt in culpa qui officia deserunt mollit anim id est
        laborum. Sed ut perspiciatis unde omnis iste natus error sit
        voluptatem accusantium doloremque laudantium.
      </Typography>

      <Typography variant="body2">
        Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et
        quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam
        voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
        consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
      </Typography>

      <Typography variant="h4">
        Neque porro quisquam est
      </Typography>

      <Typography variant="body2">
        Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet,
        consectetur, adipisci velit, sed quia non numquam eius modi tempora
        incidunt ut labore et dolore magnam aliquam quaerat voluptatem.{" "}
        <Typography variant="body2Emphasis" as="span">
          Ut enim ad minima veniam, quis nostrum exercitationem
        </Typography>{" "}
        ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi
        consequatur.
      </Typography>

      <Typography variant="h5">At vero eos et accusamus</Typography>

      <Typography variant="body2">
        At vero eos et accusamus et iusto odio dignissimos ducimus qui
        blanditiis praesentium voluptatum deleniti atque corrupti quos
        dolores et quas molestias excepturi sint occaecati cupiditate non
        provident, similique sunt in culpa.
      </Typography>

      <footer className="flex flex-col gap-1 border-t border-border pt-4">
        <Typography variant="captionEmphasis">About the author</Typography>
        <Typography variant="caption" className="text-muted-foreground">
          Jane Doe writes about design systems, typography, and the long road
          from Figma to production.
        </Typography>
      </footer>
    </article>
  ),
};
