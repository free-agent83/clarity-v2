import { STORYBOOK_URL } from '@/lib/env';
import { twMerge } from 'tailwind-merge';
import { StorybookEmbedClient } from './storybook-embed-client';

interface StorybookEmbedProps {
  /** Storybook story ID, e.g. "actions-button--default". Find it in the Storybook URL bar. */
  story: string;
  /** Minimum iframe height in px while loading or for compact stories. Default 120. */
  minHeight?: number;
  /** Maximum iframe height in px; taller stories scroll inside the iframe. Default 720. */
  maxHeight?: number;
  /** Kept for backwards compatibility — unused in new UI. */
  label?: string;
  className?: string;
}

export function StorybookEmbed({
  story,
  minHeight = 120,
  maxHeight = 720,
  className,
}: StorybookEmbedProps) {
  return (
    <figure
      className={twMerge(
        'my-6 rounded-lg border border-fd-border overflow-hidden',
        className,
      )}
    >
      <StorybookEmbedClient
        story={story}
        minHeight={minHeight}
        maxHeight={maxHeight}
        storybookUrl={STORYBOOK_URL}
      />
    </figure>
  );
}
