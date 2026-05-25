import { STORYBOOK_URL } from '@/lib/env';

interface StorybookEmbedProps {
  /** Storybook story ID, e.g. "atoms-button--default". Find it in the Storybook URL bar. */
  story: string;
  /** Iframe height in px. Defaults to 480. */
  height?: number;
  /** Visible label below the iframe — defaults to "Live component". */
  label?: string;
}

export function StorybookEmbed({
  story,
  height = 480,
  label = 'Live component',
}: StorybookEmbedProps) {
  const src = `${STORYBOOK_URL}/iframe.html?id=${encodeURIComponent(story)}&viewMode=story`;
  return (
    <figure className="my-6 rounded-md border border-fd-border overflow-hidden">
      <iframe
        src={src}
        title={`Storybook: ${story}`}
        loading="lazy"
        height={height}
        className="w-full block bg-white"
      />
      <figcaption className="text-xs text-fd-muted-foreground px-3 py-2 border-t border-fd-border flex items-center justify-between">
        <span>{label}</span>
        <a
          href={`${STORYBOOK_URL}/?path=/story/${encodeURIComponent(story)}`}
          target="_blank"
          rel="noreferrer"
          className="underline hover:no-underline"
        >
          Open in Storybook ↗
        </a>
      </figcaption>
    </figure>
  );
}
