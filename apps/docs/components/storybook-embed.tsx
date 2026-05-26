'use client';

import { useEffect, useState } from 'react';
import { STORYBOOK_URL } from '@/lib/env';

const DROPDOWN_PREFIXES = [
  'templates-plp-gridcontainer',
  'templates-plp-listcontainer',
  'templates-pdp',
];

interface StorybookEmbedProps {
  /** Storybook story ID, e.g. "actions-button--default". Find it in the Storybook URL bar. */
  story: string;
  /** Iframe height in px. Defaults to 480. */
  height?: number;
  /** Kept for backwards compatibility — unused in new UI. */
  label?: string;
}

interface StoryEntry {
  id: string;
  name: string;
}

export function StorybookEmbed({ story, height = 480 }: StorybookEmbedProps) {
  const [selectedStory, setSelectedStory] = useState(story);
  const [stories, setStories] = useState<StoryEntry[]>([]);

  const prefix = story.includes('--') ? story.slice(0, story.lastIndexOf('--')) : story;
  const useDropdown = DROPDOWN_PREFIXES.includes(prefix);

  useEffect(() => {
    fetch(`${STORYBOOK_URL}/stories.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`stories.json fetch failed: ${res.status}`);
        return res.json();
      })
      .then((data: { entries: Record<string, { id: string; name: string; type: string }> }) => {
        const filtered = Object.values(data.entries).filter(
          (entry) => entry.id.startsWith(prefix + '--') && entry.type === 'story',
        );
        setStories(filtered.map((e) => ({ id: e.id, name: e.name })));
      })
      .catch((err) => {
        console.warn('[StorybookEmbed] Could not load stories.json:', err);
      });
  }, [prefix]);

  const iframeSrc = `${STORYBOOK_URL}/iframe.html?id=${encodeURIComponent(selectedStory)}&viewMode=story`;
  const openLink = `${STORYBOOK_URL}/?path=/story/${encodeURIComponent(selectedStory)}`;

  const showSwitcher = stories.length > 1;

  return (
    <figure className="my-6 rounded-lg border border-fd-border overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-row items-center gap-2 px-3 py-2 bg-fd-muted/50 border-b border-fd-border">
        {/* Chips or dropdown — flex-1 so the link stays pinned right */}
        <div className="flex-1 min-w-0 flex flex-wrap gap-1.5">
          {showSwitcher && !useDropdown &&
            stories.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedStory(s.id)}
                className={
                  s.id === selectedStory
                    ? 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-foreground text-background'
                    : 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border border-fd-border bg-fd-background text-fd-muted-foreground hover:text-fd-foreground'
                }
              >
                {s.name}
              </button>
            ))
          }
          {showSwitcher && useDropdown && (
            <select
              value={selectedStory}
              onChange={(e) => setSelectedStory(e.target.value)}
              className="rounded border border-fd-border bg-fd-background text-fd-foreground text-xs px-2 py-1 focus:outline-none"
            >
              {stories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Open in Storybook link — never wraps */}
        <a
          href={openLink}
          target="_blank"
          rel="noreferrer"
          className="flex-shrink-0 whitespace-nowrap text-sm text-fd-muted-foreground underline hover:no-underline hover:text-fd-foreground"
        >
          Open in Storybook ↗
        </a>
      </div>

      {/* iframe */}
      <iframe
        src={iframeSrc}
        title={`Storybook: ${selectedStory}`}
        loading="lazy"
        height={height}
        className="w-full block bg-white"
      />
    </figure>
  );
}
