'use client';

import Link from 'fumadocs-core/link';
import { usePathname } from 'fumadocs-core/framework';
import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { useFooterItems } from 'fumadocs-ui/utils/use-footer-items';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@nivoda/components';

import type { ReactNode } from 'react';

type FooterItemData = {
  name: ReactNode;
  description?: ReactNode;
  url: string;
};

type DocsPageFooterProps = React.ComponentProps<'div'> & {
  items?: {
    previous?: FooterItemData;
    next?: FooterItemData;
  };
};

function isActive(href: string, pathname: string) {
  const normalize = (path: string) =>
    path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
  return normalize(href) === normalize(pathname);
}

function FooterNavItem({
  item,
  index,
  label,
}: {
  item: FooterItemData;
  index: 0 | 1;
  label: string;
}) {
  const Icon = index === 0 ? ChevronLeft : ChevronRight;

  return (
    <Link
      href={item.url}
      className={cn(
        'group/docs-footer docs-page-footer-link flex flex-col gap-2 rounded-lg border p-4 text-sm font-medium transition-all outline-none @max-lg:col-span-full',
        'border-border bg-background text-foreground hover:bg-muted hover:text-primary-hover',
        'dark:border-input dark:bg-input/30 dark:hover:bg-input/50 dark:hover:text-secondary-hover',
        index === 1 && 'text-end',
      )}
    >
      <p className="docs-page-footer-label mb-0 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors group-hover/docs-footer:text-primary-hover dark:group-hover/docs-footer:text-secondary-hover">
        {label}
      </p>
      <div
        className={cn(
          'docs-page-footer-title-row inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors group-hover/docs-footer:text-primary-hover dark:group-hover/docs-footer:text-secondary-hover',
          index === 1 && 'flex-row-reverse',
        )}
      >
        <Icon className="docs-page-footer-icon -mx-1 size-4 shrink-0 rtl:rotate-180" />
        <span className="docs-page-footer-title">{item.name}</span>
      </div>
    </Link>
  );
}

export function DocsPageFooter({
  items,
  className,
  ...props
}: DocsPageFooterProps) {
  const footerList = useFooterItems();
  const pathname = usePathname();
  const { text } = useI18n();

  const { previous, next } = useMemo(() => {
    if (items) return items;
    const idx = footerList.findIndex((item) => isActive(item.url, pathname));
    if (idx === -1) return {};
    return {
      previous: footerList[idx - 1],
      next: footerList[idx + 1],
    };
  }, [footerList, items, pathname]);

  return (
    <div
      className={cn(
        '@container docs-page-footer grid gap-4',
        previous && next ? 'grid-cols-2' : 'grid-cols-1',
        className,
      )}
      {...props}
    >
      {previous ? (
        <FooterNavItem item={previous} index={0} label={text.previousPage} />
      ) : null}
      {next ? (
        <FooterNavItem item={next} index={1} label={text.nextPage} />
      ) : null}
    </div>
  );
}
