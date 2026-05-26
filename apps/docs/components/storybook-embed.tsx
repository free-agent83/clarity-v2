import { STORYBOOK_URL } from '@/lib/env';
import { twMerge } from 'tailwind-merge';
import { StorybookEmbedClient } from './storybook-embed-client';

interface StorybookEmbedProps {
  /** Storybook story ID, e.g. "actions-button--default". Find it in the Storybook URL bar. */
  story: string;
  /** Iframe height in px. Defaults to 320. */
  height?: number;
  /** Kept for backwards compatibility — unused in new UI. */
  label?: string;
  className?: string;
}

export function StorybookEmbed({ story, height = 320, className }: StorybookEmbedProps) {
  return (
    <figure
      className={twMerge(
        'my-6 rounded-lg border border-fd-border overflow-hidden',
        className,
      )}
    >
      <StorybookEmbedClient story={story} height={height} storybookUrl={STORYBOOK_URL} />
    </figure>
  );
}
