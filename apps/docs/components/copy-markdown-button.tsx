'use client';

import { Check, Copy } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DocsPageButton } from './docs-page-button';

const cache = new Map<string, Promise<string>>();

type CopyMarkdownButtonProps = {
  markdownUrl: string;
  children?: React.ReactNode;
};

export function CopyMarkdownButton({
  markdownUrl,
  children,
}: CopyMarkdownButtonProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const onClick = useCallback(async () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

    setLoading(true);
    try {
      const cached = cache.get(markdownUrl);
      if (cached) {
        await navigator.clipboard.writeText(await cached);
      } else {
        const promise = fetch(markdownUrl).then((res) => res.text());
        cache.set(markdownUrl, promise);
        await navigator.clipboard.write([
          new ClipboardItem({ 'text/plain': promise }),
        ]);
      }
      setCopied(true);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
    } finally {
      setLoading(false);
    }
  }, [markdownUrl]);

  return (
    <DocsPageButton loading={loading} onClick={onClick}>
      {!loading ? (copied ? <Check /> : <Copy />) : null}
      {children ?? 'Copy Markdown'}
    </DocsPageButton>
  );
}
