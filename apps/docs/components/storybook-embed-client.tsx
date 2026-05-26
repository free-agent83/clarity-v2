'use client';

import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';

const DROPDOWN_PREFIXES = [
  'templates-plp-gridcontainer',
  'templates-plp-listcontainer',
  'templates-pdp',
];

interface StoryEntry {
  id: string;
  name: string;
}

interface StorybookEmbedClientProps {
  story: string;
  height: number;
  storybookUrl: string;
}

export function StorybookEmbedClient({ story, height, storybookUrl }: StorybookEmbedClientProps) {
  const [selectedStory, setSelectedStory] = useState(story);
  const [stories, setStories] = useState<StoryEntry[]>([]);

  const prefix = story.includes('--') ? story.slice(0, story.lastIndexOf('--')) : story;
  const useDropdown = DROPDOWN_PREFIXES.includes(prefix);

  useEffect(() => {
    fetch(`${storybookUrl}/stories.json`)
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
  }, [prefix, storybookUrl]);

  const iframeSrc = `${storybookUrl}/iframe.html?id=${encodeURIComponent(selectedStory)}&viewMode=story`;
  const openLink = `${storybookUrl}/?path=/story/${encodeURIComponent(selectedStory)}`;

  const showSwitcher = stories.length > 1;

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-row items-center gap-2 px-3 py-2.5 bg-fd-muted/50 border-b border-fd-border">
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
              aria-label="Select story variant"
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

        {/* Open in Storybook — matches action row button style */}
        <a
          href={openLink}
          target="_blank"
          rel="noreferrer noopener"
          className="flex-shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-fd-border bg-fd-background px-2.5 py-1 text-xs font-medium text-fd-muted-foreground hover:text-fd-foreground transition-colors"
        >
          <svg
            fill="currentColor"
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="size-3.5"
          >
            <title>Storybook</title>
            <path d="M16.71.243l-.12 2.71a.18.18 0 00.29.15l1.06-.8.9.7a.18.18 0 00.28-.14l-.1-2.76 1.33-.1a1.2 1.2 0 011.279 1.2v21.596a1.2 1.2 0 01-1.26 1.2l-16.096-.72a1.2 1.2 0 01-1.15-1.16l-.75-19.797a1.2 1.2 0 011.13-1.27L16.7.222zM13.64 9.3c0 .47 3.16.24 3.59-.08 0-3.2-1.72-4.89-4.859-4.89-3.15 0-4.899 1.72-4.899 4.29 0 4.45 5.999 4.53 5.999 6.959 0 .7-.32 1.1-1.05 1.1-.96 0-1.35-.49-1.3-2.16 0-.36-3.649-.48-3.769 0-.27 4.03 2.23 5.2 5.099 5.2 2.79 0 4.969-1.49 4.969-4.18 0-4.77-6.099-4.64-6.099-6.999 0-.97.72-1.1 1.13-1.1.45 0 1.25.07 1.19 1.87z" />
          </svg>
          Open in Storybook
          <ExternalLink className="size-3" />
        </a>
      </div>

      {/* iframe — sandbox prevents the story from navigating the parent page */}
      <iframe
        src={iframeSrc}
        title={`Storybook: ${selectedStory}`}
        loading="lazy"
        height={height}
        className="w-full block bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </>
  );
}
