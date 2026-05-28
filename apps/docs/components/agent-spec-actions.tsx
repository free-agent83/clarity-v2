"use client";

import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@nivoda/components";
import { AgentSpecPreview } from "./agent-spec-preview";
import { DocsPageButton } from "./docs-page-button";

const DEFAULT_DOWNLOAD_FILENAME = "COMPONENT.md";

type AgentSpecActionsProps = {
  markdown: string;
  /** Used for the downloaded file only — not shown in the preview UI. */
  downloadFilename?: string;
};

export function AgentSpecActions({
  markdown,
  downloadFilename = DEFAULT_DOWNLOAD_FILENAME,
}: AgentSpecActionsProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);
  const copyTimeoutRef = useRef<number | null>(null);

  const [claudeUrl, setClaudeUrl] = useState("#");
  const [cursorUrl, setCursorUrl] = useState("#");

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setClaudeUrl(
      `https://claude.ai/new?${new URLSearchParams({ q: markdown })}`,
    );
    setCursorUrl(
      `https://cursor.com/link/prompt?${new URLSearchParams({ text: markdown })}`,
    );
  }, [markdown]);

  const onCopy = useCallback(async () => {
    if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
    setCopyLoading(true);
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
    } finally {
      setCopyLoading(false);
    }
  }, [markdown]);

  const onDownload = useCallback(() => {
    const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadFilename;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [markdown, downloadFilename]);

  return (
    <>
      <div className="flex flex-row flex-wrap items-center gap-2">
        <DocsPageButton onClick={() => setPreviewOpen(true)}>
          <Eye className="size-3.5" />
          Preview
        </DocsPageButton>
        <DocsPageButton loading={copyLoading} onClick={onCopy}>
          {!copyLoading ? (copied ? <Check /> : <Copy />) : null}
          Copy
        </DocsPageButton>
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

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="agent-spec-modal flex max-h-[min(85vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="flex flex-row items-start justify-between gap-4 border-b border-neutral-200 py-4 pl-6 pr-14 dark:border-neutral-700">
            <div className="min-w-0">
              <DialogTitle className="text-[13px] leading-normal text-neutral-900 dark:text-neutral-100">
                Agent spec markdown
              </DialogTitle>
              <DialogDescription className="sr-only">
                Full markdown source for agents
              </DialogDescription>
            </div>
            <DocsPageButton className="shrink-0" onClick={onDownload}>
              <Download className="size-3.5" />
              Download
            </DocsPageButton>
          </DialogHeader>
          <div className="overflow-y-auto px-6 py-5">
            <AgentSpecPreview markdown={markdown} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
