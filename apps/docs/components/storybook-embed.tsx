import { STORYBOOK_URL } from '@/lib/env';
import { StorybookEmbedClient } from './storybook-embed-client';

interface StorybookEmbedProps {
  /** Storybook story ID, e.g. "actions-button--default". Find it in the Storybook URL bar. */
  story: string;
  /** Iframe height in px. Defaults to 480. */
  height?: number;
  /** Kept for backwards compatibility — unused in new UI. */
  label?: string;
}

export function StorybookEmbed({ story, height = 480 }: StorybookEmbedProps) {
  return (
    <figure className="my-6 rounded-lg border border-fd-border overflow-hidden">
      <StorybookEmbedClient story={story} height={height} storybookUrl={STORYBOOK_URL} />
    </figure>
  );
}
