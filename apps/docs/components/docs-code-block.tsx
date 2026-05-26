'use client';

import { cn } from '@nivoda/components';
import { Check, Clipboard } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { DocsPageButton } from './docs-page-button';

type CodeCopyButtonProps = {
  containerRef: React.RefObject<HTMLElement | null>;
  className?: string;
};

function CodeCopyButton({ containerRef, className }: CodeCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const onClick = useCallback(() => {
    const pre = containerRef.current?.getElementsByTagName('pre').item(0);
    if (!pre) return;

    const clone = pre.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('.nd-copy-ignore').forEach((node) => {
      node.replaceWith('\n');
    });

    void navigator.clipboard.writeText(clone.textContent ?? '').then(() => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      setCopied(true);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1500);
    });
  }, [containerRef]);

  return (
    <DocsPageButton
      type="button"
      size="icon-sm"
      className={className}
      aria-label={copied ? 'Copied text' : 'Copy text'}
      onClick={onClick}
    >
      {copied ? <Check /> : <Clipboard />}
    </DocsPageButton>
  );
}

export function DocsPre(props: React.ComponentProps<'pre'>) {
  return (
    <pre
      {...props}
      className={cn('min-w-full w-max *:flex *:flex-col', props.className)}
    />
  );
}

type DocsCodeBlockProps = React.ComponentProps<'figure'> & {
  title?: React.ReactNode;
  allowCopy?: boolean;
  keepBackground?: boolean;
  icon?: React.ReactNode;
  viewportProps?: React.ComponentProps<'div'>;
  children?: React.ReactNode;
};

export function DocsCodeBlock({
  ref,
  title,
  allowCopy = true,
  keepBackground = false,
  icon,
  viewportProps = {},
  children,
  className,
  ...props
}: DocsCodeBlockProps & { ref?: React.Ref<HTMLElement> }) {
  const areaRef = useRef<HTMLDivElement>(null);

  const actions = (actionClassName?: string) =>
    allowCopy ? (
      <div className={cn('empty:hidden', actionClassName)}>
        <CodeCopyButton containerRef={areaRef} />
      </div>
    ) : null;

  return (
    <figure
      ref={ref}
      dir="ltr"
      tabIndex={-1}
      className={cn(
        'my-4 bg-fd-card rounded-xl shiki relative border shadow-sm not-prose overflow-hidden text-sm',
        keepBackground && 'bg-(--shiki-light-bg) dark:bg-(--shiki-dark-bg)',
        className,
      )}
      {...props}
    >
      {title ? (
        <div className="flex h-9.5 items-center gap-2 border-b px-4 text-fd-muted-foreground">
          {typeof icon === 'string' ? (
            <div
              className="[&_svg]:size-3.5"
              dangerouslySetInnerHTML={{ __html: icon }}
            />
          ) : (
            icon
          )}
          <figcaption className="flex-1 truncate">{title}</figcaption>
          {actions('-me-2')}
        </div>
      ) : (
        actions('absolute top-3 right-2 z-2')
      )}
      <div
        ref={areaRef}
        role="region"
        tabIndex={0}
        className={cn(
          'fd-scroll-container max-h-[600px] overflow-auto py-3.5 text-[0.8125rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fd-ring',
          viewportProps.className,
        )}
        style={viewportProps.style}
        {...viewportProps}
      >
        {children}
      </div>
    </figure>
  );
}
