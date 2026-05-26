'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'fumadocs-core/framework';
import { BookOpen, ExternalLink } from 'lucide-react';
import { CopyMarkdownButton } from './copy-markdown-button';
import { DocsPageButton } from './docs-page-button';

type DocsActionsProps = {
  markdownUrl: string;
};

export function DocsActions({ markdownUrl }: DocsActionsProps) {
  const pathname = usePathname();

  const [q, setQ] = useState(`Read ${pathname}, I want to ask questions about it.`);

  useEffect(() => {
    setQ(`Read ${new URL(pathname, window.location.origin)}, I want to ask questions about it.`);
  }, [pathname]);

  const claudeUrl = `https://claude.ai/new?${new URLSearchParams({ q })}`;
  const cursorUrl = `https://cursor.com/link/prompt?${new URLSearchParams({ text: q })}`;

  return (
    <div className="flex flex-row gap-2 items-center">
      <span className="mr-1 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-fd-muted-foreground">
        <BookOpen className="size-3 shrink-0" aria-hidden />
        Docs
      </span>
      <CopyMarkdownButton markdownUrl={markdownUrl} />
      <DocsPageButton asChild>
        <a href={claudeUrl} target="_blank" rel="noreferrer noopener">
          <svg
            fill="currentColor"
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="size-3.5"
          >
            <title>Anthropic</title>
            <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
          </svg>
          Open in Claude
          <ExternalLink className="size-3" />
        </a>
      </DocsPageButton>
      <DocsPageButton asChild>
        <a href={cursorUrl} target="_blank" rel="noreferrer noopener">
          <svg
            fill="currentColor"
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="size-3.5"
          >
            <title>Cursor</title>
            <path d="M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23" />
          </svg>
          Open in Cursor
          <ExternalLink className="size-3" />
        </a>
      </DocsPageButton>
    </div>
  );
}
